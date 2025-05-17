# Auto Release Notes

A GitHub Action that automatically generates meaningful release notes from git changes using AI.

## Features

- Automatically generates detailed release notes on every push to main branch
- Compares changes between releases using git diff
- Uses Hugging Face models to create concise, technical summaries of changes
- Updates a RELEASE.md file and commits it to your repository
- Handles versioning automatically (increments version numbers)
- Works with any JavaScript/TypeScript project

## Setup Instructions

### 1. Install the Package

```bash
npm install --save-dev auto-release-notes
```

Or clone this repository and copy the files to your project:

```bash
git clone https://github.com/yaggit/release-notes-generator.git
```

### 2. Set Up GitHub Actions

Create the following file in your repository:

`.github/workflows/release-notes.yml`
```yaml
name: Auto Release Notes

on:
  push:
    branches:
      - main

jobs:
  release-notes:
    runs-on: ubuntu-latest
    environment: prod

    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Important: get full git history

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Generate Release Notes
        env:
          HUGGINGFACE_API_KEY: ${{ secrets.HUGGINGFACE_API_KEY }}
        run: node scripts/app.js

      - name: Commit changes
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git add RELEASE.md
          git commit -m "chore: update release notes [auto]" || echo "No changes to commit"
          git push
```

### 3. Add Hugging Face API Key

1. Create an account at [Hugging Face](https://huggingface.co/) if you don't have one
2. Get your API key from your HF account settings
3. Add the key as a GitHub secret:
   - Go to your repository on GitHub
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `HUGGINGFACE_API_KEY`
   - Value: Your Hugging Face API key

### 4. Configure Your Project

Create a `.env` file in your project root (for local testing):

```
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

Make sure to add `.env` to your `.gitignore` file.

## Usage

Once set up, the action will run automatically on every push to the main branch. It will:

1. Compare the changes with the previous commit (or tag)
2. Generate a detailed summary of the changes
3. Create or update a `RELEASE.md` file with the new version and changes
4. Commit and push the updated release notes

## Local Usage

You can also run the script locally:

```bash
# Install dependencies
npm install

# Run the script
HUGGINGFACE_API_KEY=your_key node scripts/app.js
```

## Configuration Options

You can create a `release-config.json` file in your project root to customize behavior:

```json
{
  "releaseFile": "CHANGELOG.md",  // Default: RELEASE.md
  "model": "microsoft/Phi-3-mini-4k-instruct",  // Default model
  "versioningStrategy": "patch"  // Can be "major", "minor", "patch"
}
```

## Troubleshooting

### Common Issues

- **Error: HUGGINGFACE_API_KEY environment variable is not set**
  - Make sure you've added the secret to your GitHub repository
  - For local testing, check your `.env` file

- **No changes detected**
  - The script requires at least 2 commits to generate diffs
  - On fresh repositories, create a manual first entry

- **API rate limits**
  - Hugging Face has usage limits - check your account for details

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.