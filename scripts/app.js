import axios from 'axios';
import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const git = simpleGit();
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL = process.env.HF_MODEL || 'microsoft/Phi-3-mini-4k-instruct';
const MAX_CHUNK_SIZE = 2000; // characters per API call
const RELEASE_FILE = 'RELEASE.md';

async function fetchHistory() {
  try {
    await git.fetch(['--unshallow']);
  } catch {
    // already has full history
  }
}

async function getLastTagOrBase() {
  const tags = await git.tags();
  if (tags.latest) return tags.latest;

  const log = await git.log();
  return log.total > 1 ? 'HEAD~1' : null;
}

async function getDiff(base) {
  if (!base) return 'Initial commit';
  const diff = await git.diff([base, 'HEAD']);
  if (diff.trim()) return diff;

  // no file diff, fallback to commit messages
  const commits = await git.log({ from: base, to: 'HEAD' });
  return commits.total
    ? 'Commit messages:\n' + commits.all.map(c => `- ${c.message}`).join('\n')
    : '';
}

function chunkText(text, size) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

async function summarizeDiff(diff) {
  if (!diff) return 'No changes detected.';

  const chunks = chunkText(diff, MAX_CHUNK_SIZE);
  const summaries = [];

  for (const chunk of chunks) {
    const payload = {
      model: MODEL,
      messages: [{ role: 'user', content: `Generate concise release notes for this git diff:\n${chunk}` }],
    };

    const { data } = await axios.post(
      `https://router.huggingface.co/hf-inference/models/${MODEL}`,
      payload,
      { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
    );

    const text = data.choices?.[0]?.message?.content;
    if (text) summaries.push(text.trim());
  }

  // combine and dedupe
  return Array.from(new Set(summaries)).join('\n');
}

function bumpVersion(current) {
  const [maj, min, patch] = current.split('.').map(Number);
  return [maj, min, patch + 1].join('.');
}

async function updateReleaseNotes(summary) {
  let current = '0.0.0';
  let existing = '';

  try {
    existing = await fs.readFile(RELEASE_FILE, 'utf-8');
    const m = existing.match(/## Version (\d+\.\d+\.\d+)/);
    if (m) current = bumpVersion(m[1]);
  } catch {
    // new file
  }

  const date = new Date().toISOString().slice(0, 10);
  const header = `## Version ${current} - ${date}`;
  const content = [header, summary, '', existing].join('\n');
  await fs.writeFile(RELEASE_FILE, content);
}

async function main() {
  await fetchHistory();
  const base = await getLastTagOrBase();
  const diff = await getDiff(base);
  const summary = await summarizeDiff(diff);
  await updateReleaseNotes(summary);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
