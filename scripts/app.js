import axios from 'axios';
import simpleGit from 'simple-git';
import fs from 'fs';

const git = simpleGit();
const model = "mrm8488/t5-base-finetuned-summarize-news"; // lightest
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

const getLastTag = async () => {
  const tags = await git.tags();
  return tags.latest || 'HEAD~2';
};

const getDiff = async () => { // get diff between last tag and HEAD
  const lastTag = await getLastTag();
  return git.diff([lastTag, 'HEAD']);
};

const summarizeDiff = async (diff) => {
  const res = await axios.post(
    `https://api-inference.huggingface.co/models/${model}`,
    { inputs: `summarize: ${diff.slice(0, 2000)}` }, // truncating long diff
    { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
  );
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
