import axios from "axios";
import simpleGit from "simple-git";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const git = simpleGit();
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

const MODEL_NAME = "microsoft/Phi-3-mini-4k-instruct";
const RELEASE_FILE = "RELEASE.md";

const fetchHistory = async () => {
  try {
    await git.fetch(["--unshallow"]);
    console.log("✅ Repository unshallowed successfully.");
  } catch (error) {
    console.warn("⚠️ Possibly already full history:", error.message);
  }
};

const getLastTag = async () => {
  try {
    const { latest } = await git.tags();
    if (latest) {
      console.log(`🔖 Using latest tag: ${latest}`);
      return latest;
    }

    const { total } = await git.log();
    if (total >= 2) {
      console.log(`🔁 No tags found. Using HEAD~1.`);
      return "HEAD~1";
    }

    console.log("🚫 Not enough history for meaningful diff.");
    return null;
  } catch (error) {
    console.error("❌ Error getting last tag:", error.message);
    return null;
  }
};

const getDiff = async () => {
  try {
    const lastRef = await getLastTag();
    if (!lastRef) return "Initial commit";

    console.log(`🔍 Getting diff from ${lastRef} to HEAD...`);
    const diff = await git.diff([lastRef, "HEAD"]);
    if (diff.trim()) return diff;

    const { all, total } = await git.log({ from: lastRef, to: "HEAD" });
    if (total > 0) {
      const messages = all.map((c) => `- ${c.message}`).join("\n");
      console.log("📝 Using commit messages instead of diff.");
      return `Commit messages:\n${messages}`;
    }

    return "No relevant changes detected.";
  } catch (error) {
    console.error("❌ Error getting diff:", error.message);
    return "Error getting diff";
  }
};

const summarizeDiff = async (diff) => {
  if (!diff || ["Initial commit", "Error getting diff"].includes(diff)) {
    return diff;
  }

  try {
    console.log(`📤 Sending ${diff.length} chars to Hugging Face model...`);
    const { data } = await axios.post(
      `https://router.huggingface.co/hf-inference/models/${MODEL_NAME}/v1/chat/completions`,
      {
        messages: [
          {
            role: "system",
            content:
              "You are a technical changelog generator. Your job is to summarize Git diffs as factual, concise, and developer-friendly release notes. Use bullet points. Do not include headers, version numbers, or dates. Avoid any uncertain language or conversational tone.",
          },
          {
            role: "user",
            content:
              "Summarize the following Git diff as bullet points for a changelog. Only include technical changes that are clearly evident:\n\n" +
              diff.slice(0, 2000),
          },
        ],

        model: MODEL_NAME,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = data?.choices?.[0]?.message?.content;
    return content || "No significant changes detected.";
  } catch (error) {
    console.error("❌ Hugging Face API error:", error.message);
    if (error.response) {
      console.error("📡 API response:", error.response.data);
    }
    return "Changes were made but could not be summarized.";
  }
};

const bumpVersion = (current = "0.0.0") => {
  const [major, minor, patch] = current.split(".").map(Number);
  return `${major}.${minor}.${patch + 1}`;
};

const updateReleaseNotes = (summary) => {
  let content = "";
  let version = "0.0.1";

  if (fs.existsSync(RELEASE_FILE)) {
    content = fs.readFileSync(RELEASE_FILE, "utf8");
    const match = content.match(/## Version (\d+\.\d+\.\d+)/);
    if (match) version = bumpVersion(match[1]);
  }

  const date = new Date().toISOString().split("T")[0];
  const entry = `\n## Version ${version} - ${date}\n\n${summary}\n`;
  fs.writeFileSync(RELEASE_FILE, entry + content);
  console.log("✅ Release notes updated.");
};

const run = async () => {
  try {
    console.log("🚀 Generating release notes...");
    await fetchHistory();
    const diff = await getDiff();
    const summary = await summarizeDiff(diff);
    console.log("📝 Summary:\n", summary);
    updateReleaseNotes(summary);
    console.log("🎉 Done.");
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  }
};

run();
