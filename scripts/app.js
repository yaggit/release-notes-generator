import axios from 'axios';
import simpleGit from 'simple-git';
import fs from 'fs';

const git = simpleGit();
const model = "mrm8488/t5-base-finetuned-summarize-news"; // lightest
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

const getLastTag = async () => {
  try {
    // Try to get the latest tag
    const tags = await git.tags();
    if (tags.latest) return tags.latest;
    
    // If no tags, try to get the second-to-last commit
    const log = await git.log({ maxCount: 2 });
    if (log.total >= 2) {
      return log.all[1].hash; // Return the hash of the second-to-last commit
    }
    
    // If fewer than 2 commits, just use the first commit or HEAD^
    if (log.total === 1) {
      return log.all[0].hash;
    }
    
    // Default to HEAD if no commits found (unlikely)
    return 'HEAD';
  } catch (error) {
    console.warn("Error getting last reference point:", error.message);
    return 'HEAD'; // Default to HEAD if anything fails
  }
};

const getDiff = async () => {
  const lastRef = await getLastTag();
  
  try {
    // If lastRef equals HEAD, there's nothing to diff against, return empty string
    if (lastRef === 'HEAD') {
      return '';
    }
    
    return await git.diff([lastRef, 'HEAD']);
  } catch (error) {
    console.warn("Error getting diff:", error.message);
    // If diff fails, try to get the changes in the working directory
    try {
      return await git.diff();
    } catch {
      return ''; // Return empty string if all else fails
    }
  }
};

const summarizeDiff = async (diff) => {
  const res = await axios.post(
    `https://api-inference.huggingface.co/models/${model}`,
    { inputs: `summarize: ${diff.slice(0, 2000)}` }, // truncating long diff
    { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
  );
  console.log('Response:', res.data);
  return res.data[0]?.summary_text || 'No significant changes.';
};

// this is the test commit

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
  const diff = await getDiff();
  const summary = await summarizeDiff(diff);
  await updateReleaseNotes(summary);
})();
