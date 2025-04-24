import axios from 'axios';
import simpleGit from 'simple-git';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const git = simpleGit();
const model = "Salesforce/codet5-small"; // Updated model
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// First ensure we have proper git history
const fetchHistory = async () => {
  try {
    await git.fetch(['--unshallow']);
    console.log("Repository unshallowed successfully");
  } catch (error) {
    console.log("Repository might already have full history or other error:", error.message);
  }
};

const getLastTag = async () => {
  try {
    // Try to get the latest tag
    const tags = await git.tags();
    
    if (tags.latest) {
      console.log(`Using latest tag: ${tags.latest}`);
      return tags.latest;
    }
    
    // If no tags, get commit count
    const log = await git.log();
    const commitCount = log.total;
    console.log(`No tags found. Repository has ${commitCount} commits.`);
    
    if (commitCount >= 2) {
      // Use the previous commit
      return 'HEAD~1';
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
      return "Initial commit";
    }
    
    console.log(`Getting diff between ${lastRef} and HEAD`);
    const diff = await git.diff([lastRef, 'HEAD']);
    console.log(`Diff size: ${diff.length} characters`);
    
    // Check if diff is too small/empty
    if (!diff || diff.trim().length === 0) {
      const commits = await git.log({ from: lastRef, to: 'HEAD' });
      console.log(`Found ${commits.total} commits between ${lastRef} and HEAD`);
      
      if (commits.total > 0) {
        // Use commit messages as a fallback
        const commitMessages = commits.all.map(c => c.message).join("\n");
        console.log("Using commit messages instead of diff");
        return `Commit messages:\n${commitMessages}`;
      }
    }
    
    return diff;
  } catch (error) {
    console.error("Error in getDiff:", error);
    return "Error getting diff";
  }
};

const summarizeDiff = async (diff) => {
  if (!diff || diff === "Initial commit" || diff === "Error getting diff") {
    return diff;
  }
  
  // Always try to summarize, even small diffs
  try {
    console.log("Sending data to Hugging Face API...");
    console.log(`API Key available: ${Boolean(HF_API_KEY)}`);
    console.log(`Sending ${diff.length} characters to the model`);
    
    // Log a sample of what we're sending (for debugging)
    console.log("First 200 chars of diff:", diff.substring(0, 200));
    
    const res = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: `Generate a release note for this git diff: ${diff.slice(0, 2000)}` },
      { 
        headers: { 
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log("API Response:", JSON.stringify(res.data, null, 2));
    
    // Handle different possible response formats
    if (Array.isArray(res.data)) {
      return res.data[0]?.generated_text || 'No significant changes detected.';
    } else if (typeof res.data === 'object' && res.data.generated_text) {
      return res.data.generated_text;
    } else if (typeof res.data === 'string') {
      return res.data;
    } else {
      console.warn("Unexpected response format:", res.data);
      return 'Changes detected but could not be summarized.';
    }
  } catch (error) {
    console.error("Error in summarizeDiff:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return `Changes were made but could not be automatically summarized. Diff size: ${diff.length} characters.`;
  }
};

const bumpVersion = (current = '0.0.0') => {
  const [maj, min, patch] = current.split('.').map(Number);
  return `${maj}.${min}.${patch + 1}`;
};

const updateReleaseNotes = async (summary) => {
  const filePath = 'RELEASE.md';
  let content = '';
  let version = '0.0.1';

  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf-8');
    const versionMatch = content.match(/## Version (\d+\.\d+\.\d+)/);
    if (versionMatch) version = bumpVersion(versionMatch[1]);
  }

  const date = new Date().toISOString().split('T')[0];
  const newEntry = `\n## Version ${version} - ${date}\n\n${summary}\n`;

  fs.writeFileSync(filePath, newEntry + content);
  console.log("Release note updated.");
};

(async () => {
  try {
    console.log("Starting release notes generation...");
    await fetchHistory();
    const diff = await getDiff();
    
    if (diff && diff.trim() !== "") {
      console.log("Got diff, now summarizing...");
      const summary = await summarizeDiff(diff);
      console.log("Summary:", summary);
      await updateReleaseNotes(summary);
    } else {
      console.log("No changes detected to summarize");
      await updateReleaseNotes("Maintenance update with no significant code changes.");
    }
    
    console.log("Process completed successfully.");
  } catch (error) {
    console.error("Error in main process:", error);
    process.exit(1);
  }
})();