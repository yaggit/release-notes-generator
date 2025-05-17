import axios from "axios";
import simpleGit from "simple-git";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

const git = simpleGit();
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

if (!HF_API_KEY) {
  console.error("ERROR: HUGGINGFACE_API_KEY environment variable is not set");
  process.exit(1);
}

// Ensure we have proper git history
const fetchHistory = async () => {
  try {
    await git.fetch(["--unshallow"]);
    console.log("Repository unshallowed successfully");
  } catch (error) {
    console.log("Repository might already have full history:", error.message);
  }
};

const getLastTag = async () => {
  try {
    // Try to get the latest tag
    const tags = await git.tags();

    if (tags.all && tags.all.length > 0) {
      console.log(`Using latest tag: ${tags.latest}`);
      return tags.latest;
    }

    // If no tags, get last commit
    const log = await git.log({ maxCount: 10 });
    const commitCount = log.total;
    console.log(`No tags found. Repository has ${commitCount} commits.`);

    if (commitCount >= 2) {
      // Use the previous commit
      return "HEAD~1";
    }

    console.log("Not enough history to generate meaningful diff");
    return null;
  } catch (error) {
    console.error("Error in getLastTag:", error);
    return null;
  }
};

const getDiff = async () => {
  try {
    const lastRef = await getLastTag();

    if (!lastRef) {
      return { type: "initial", content: "Initial commit" };
    }

    console.log(`Getting diff between ${lastRef} and HEAD`);
    
    // Get the actual diff
    const diff = await git.diff([lastRef, "HEAD"]);
    
    // Also get the commit messages for context
    const commits = await git.log({ from: lastRef, to: "HEAD" });
    const commitMessages = commits.all.map(c => `- ${c.hash.substring(0, 7)}: ${c.message}`).join("\n");
    
    // Get the list of changed files
    const changedFiles = await git.diff([lastRef, "HEAD", "--name-status"]);
    
    console.log(`Diff size: ${diff.length} characters`);
    console.log(`Found ${commits.total} commits between ${lastRef} and HEAD`);

    // Check if diff is too small/empty
    if (!diff || diff.trim().length === 0) {
      console.log("Using commit messages instead of diff");
      return { 
        type: "commits", 
        content: commitMessages,
        files: changedFiles
      };
    }

    return { 
      type: "diff", 
      content: diff,
      commits: commitMessages,
      files: changedFiles
    };
  } catch (error) {
    console.error("Error in getDiff:", error);
    return { type: "error", content: "Error getting diff" };
  }
};

const constructPrompt = (diffData) => {
  if (diffData.type === "initial") {
    return "Initial commit - generate a release note for the first version of this project.";
  }
  
  if (diffData.type === "error") {
    return "Generate a release note for a maintenance update with no significant code changes.";
  }
  
  if (diffData.type === "commits") {
    return `Generate a detailed technical release note based on these commits:
${diffData.content}

Changed files:
${diffData.files}

Focus on concrete technical changes and improvements. Avoid vague language like "probably" or "likely". Be specific and direct about what changed.`;
  }
  
  // For normal diffs
  let prompt = `Generate a detailed technical release note from this git information:

COMMITS:
${diffData.commits}

CHANGED FILES:
${diffData.files}

CODE CHANGES:
${diffData.content.substring(0, 3500)}`;

  prompt += `

Requirements:
1. Write in a professional, technical tone appropriate for developers
2. Be specific and concrete about what changed - avoid vague qualifiers like "probably" or "likely"
3. Format as bullet points grouped by change type (Features, Fixes, Improvements, etc.)
4. Focus on the actual functionality changes, not the implementation details
5. Be concise but comprehensive`;

  return prompt;
};

const summarizeDiff = async (diffData) => {
  if (diffData.type === "initial" || diffData.type === "error") {
    return diffData.content;
  }

  try {
    console.log("Sending data to Hugging Face API...");
    
    const prompt = constructPrompt(diffData);
    console.log("Prompt length:", prompt.length);
    
    const res = await axios.post(
      "https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct",
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.3, // Lower temperature for more focused responses
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Check if we got a valid response
    // if (!res.data || typeof res.data !== 'string' || res.data.trim().length === 0) {
    //   console.error("Invalid API response:", JSON.stringify(res.data, null, 2));
    //   return "Changes were made but could not be automatically summarized.";
    // }

    // Post-process the response to remove common issues
    let summary = res.data.choices[0].message.content || res.data[0].generated_text;
    summary = summary.replace(/(\r\n|\n|\r)/gm, " ");
    summary = summary.replace(/\bprobably\b|\blikely\b|\bpossibly\b|\bmight\b|\bcould have\b/gi, "");
    console.log("Response:", res);
    return summary || "No significant changes detected.";
  } catch (error) {
    console.error("Error in summarizeDiff:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
    }
    return `Changes were made but could not be automatically summarized.`;
  }
};

const bumpVersion = (current = "0.0.0") => {
  try {
    const [maj, min, patch] = current.split(".").map(Number);
    return `${maj}.${min}.${patch + 1}`;
  } catch (error) {
    console.error("Error in bumpVersion:", error);
    return "0.0.1"; // Fallback to initial version
  }
};

const updateReleaseNotes = async (summary) => {
  const filePath = "RELEASE.md";
  let content = "";
  let version = "0.0.1";

  try {
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, "utf-8");
      const versionMatch = content.match(/## Version (\d+\.\d+\.\d+)/);
      if (versionMatch) version = bumpVersion(versionMatch[1]);
    }

    const date = new Date().toISOString().split("T")[0];
    const newEntry = `## Version ${version} - ${date}\n\n${summary}\n\n`;

    fs.writeFileSync(filePath, newEntry + content);
    console.log(`Release notes updated to version ${version}`);
  } catch (error) {
    console.error("Error updating release notes file:", error);
    process.exit(1);
  }
};

(async () => {
  try {
    console.log("Starting release notes generation...");
    await fetchHistory();
    const diffData = await getDiff();

    console.log("Got diff data, now summarizing...");
    const summary = await summarizeDiff(diffData);
    console.log("Summary generated successfully");
    
    await updateReleaseNotes(summary);
    console.log("Process completed successfully.");
  } catch (error) {
    console.error("Fatal error in main process:", error);
    process.exit(1);
  }
})();