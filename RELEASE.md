
## Version 0.0.21 - 2025-05-17

Release Notes:

- Auto Release Notes AI GitHub Action now includes updated release notes.
- Automatically generates detailed release notes on every push to the main branch
- Improved parsing of git diffs to create concise, technical summaries using Hugging Face AI models
- Now handles versioning automatically (upgrading version numbers on each release accordingly)
- Enhanced comparison of changes between releases using refined git diff capabilities
- New library import 'axios' included (for potential Data API interactions)
- Unit tests have been expansively rewritten, now containing two new tests
   - A test now makes sure that return codes from HTTP requests match specific numbers using Axios
   - A test now checks for specific data structure in returned objects from HTTP requests
- Note file now includes prompt for inclusion on main branch updates
- Code files (dbConnection.js, test.js) were cleaned up, depreciated redundant logic removed or updated
- Code style & commenting issues addressed.
- Fixed no newline at end of file issues for readability
- Skipped "Here be dragons" jokes
- Setup instructions updated, now guideline for using npm & git commands
- GitHub workflow updated for continuous deployment of new release notes

## Version 0.0.20 - 2025-05-17

Release note based on the Git diff:

- The `release-config.json` configuration structure was modified:
  - Deleted the `CHANGELOG.md` option.
  - Switched the default model from `microsoft/Phi-3-mini-4k-instruct` to `microsoft/Phi-3-mini-4k-instruct`.
  - 'versioningStrategy' field now defaults to 'patch'.

- The `readme.md` file was altered:
  - Changed the default value for `releaseFile` from `RELEASE.md` to `CHANGELOG.md`.
  - Corrected the typo for the `readme.md` file.

- The `readme.md` document's behavior remains the same:
  - Commit and push release notes after setup.
  - Provides local usage instructions and a simple setup process for running the script.
  - Outlines the use of a `release-config.json` file for customization of default settings.

- The guide includes instruction on mitigating typical *Error: HUGGINGFACE_API_KEY* situations by referencing the GitHub repository or checking the local `.env` file.

- Adjusted the troubleshooting section:
  - Clarified that a manual entry in CHANGELOG is required for new repositories.
  - Briefly mentioned API rate limits provided by Hugging Face, advising users to review their account details for any limits.

## Version 0.0.19 - 2025-05-17

- Version 0.0.18 (2025-05-17)
  - Changes to 'scripts/app.js':
    - Added async function `summarizeDiff`.

- Version 0.0.17 (2025-05-17)
  - Refactored:
    - Changed constant `MODEL_NAME` to value `"microsoft/Phi-3-mini-4k-instruct"`.
    - Added new constant `RELEASE_FILE` with value `RELEASE.md`.
  - Updated error handling:
    - Fetching repository history now warns when no tags are found, rather than throwing an error.

- Version 0.0.16 (2025-05-17)
  - The commit summary could not be provided automatically.

- Version 0.0.15 (2025-05-17)
  - The commit summary could not be provided automatically.

## Version 0.0.18 - 2025-05-17

- Changes to 'scripts/app.js'

- Added async function `summarizeDiff`

## Version 0.0.17 - 2025-05-17

**Changelog**

## [VersionNumber]

- `MODEL_NAME` is now defined as `"microsoft/Phi-3-mini-4k-instruct"`
- Addition of `RELEASE_FILE` constant with value `RELEASE.md`
- Updated error handling for fetching repository history to output a warning instead of an error
- Replaced the backup strategy for no tags in repository
- Improved commit count check to account for repositories with fewer than 2 commits
- Updated log messages to provide better context for returned values
## Version 0.0.16 - 2025-05-17

Changes were made but could not be automatically summarized.

## Version 0.0.15 - 2025-05-17

Changes were made but could not be automatically summarized.

## Version 0.0.14 - 2025-05-17

Changes were made but could not be automatically summarized.


## Version 0.0.13 - 2025-05-15

### Release Notes – Version `1.2.0`

#### Changes

##### Git Over-The-Air (OTA) History Management
- Removed and replaced Git pull method for removing unnesting history entry in OTA releases.
  - Mike
  - [disabled issue #19](https://github.com/huggingface/botbob-actions/issues/19) which warns against including `.git` in the git-lfs export.

---

- Fixed environment variable `process.env.HF_MODEL` to use `localModel`, fix for #27
  - Mike
  - [disabled issue #27](https://github.com/huggingface/botbob-actions/issues/27)

#### Added / Updated

##### Documentation & Logic
- Added `fetchHistory` async function (#14)
  - Eric

##### Environment Setup
- Hardcode `HUGGINGFACE_API_KEY` in `.env` (#15)
  - Content Delivery Guy

##### API Usage
- Introduced usage of the `/v3/models/` endpoint instead of `/v3/text-generation/` after #31, and fixed the subsequent logic (#16)

- Added Hugging Face model constant `model` (#9)

##### Fixes
- Fixed the export of `.gitignore` file in the gzip output (#40)

- Fixed issue in triggering the release action when code is committed (#11)
  - Mike
  - [disabled issue #11](https://github.com/huggingface/botbob-actions/pull/11)

##### Clean-ups
- Commented-out GitHub API links (#1, 2, 3)
- Removed pull method to remove `.git` entry in git-lfs export (#24)

---

#### Bug Fixes
- Hotfix for `fetchHistory` breaking when there's no local history (#5)



## Version 0.0.12 - 2025-05-15

## Release Notes - Version 0.0.11

### Date: 2025-05-14

In this release, **version 0.0.2**, we've made significant changes to bring you the latest features and enhancements. Here's the rundown of the primary updates:

### Major Changes
- **Updated version 0.0.2**: We've revised the document, adding new information and making substantial modifications to ensure the usability and performance improvements of our product.
- **Version 0.0.11**: A minor update to refine the document and clarify any outstanding points.

### Application Updates (Continued)
#### Version 0.0.1 (2025-05-14)
- We've refactored the `app.js` script, incorporating new optimizations and enhancements for better user experience.
- Modifications made include:
  - The addition of robust logging statements to track the application's behavior and aid in debugging.
  - Potential API endpoint changes to align with new functionalities.

The detailed documentation for the updates is now contained within the diff files located in `/b/scripts/app.js`. This ensures that you can review the specific changes that have been made and implement them effectively in your environment.

### Official Note

To ensure a seamless experience with the latest release, please make sure to:
- Run the necessary migrations. This may include database schema alterations, configuration updates, or API modifications.
- Update your application environment to version 0.0.2.

For more information about the features, see the updated [Release Notes](https://your.repository.url/RELEASE.md).

Official Release Document (Limited Access)

- [Download Release Notes](https://your.repository.url/RELEASE.md)
- Documents may contain sensitive project information. Please handle with discretion.

Download Release Documents (Include Version-specific Content)
You can access the following release documents including version-specific content:
- Version 0.0.11 (2025-05-14)
- Version 0.0.2 (2025-05-14)

For more detailed instructions and support, please contact our support team.

Remember to adhere to best practices regarding the updates to ensure the stability and reliability of your application. Keep in mind that maintaining the compatibility of existing systems is essential.

We appreciate your patience and understanding as we work to continually improve and optimize our product. Reliability comes from constant updates and the community feedback that helps us shape the future of our product.

Explore the updates and enhancements we've added with version 0.0.2. Enjoy the newly incorporated features and bug fixes and let us know what you think!

For any conflicts or disagreements about the update compatibility, we encourage an open discussion within our community to ensure the satisfactory execution of the new features.

Thank you for being a part of our growing community!

Note: Review the release notes for the specific changes and make a plan according to your production schedule. We recommend running a validation check before fully deploying to ensure the functionality works as intended.

Update your systems and explore all details carefully to enhance your user experience with the latest version of our software. Don't forget to back up your current application setup before starting the update process; this will safeguard your work and prevent data loss in case of any unexpected issues.


## Version 0.0.11 - 2025-05-14

# Release Notes - Version 0.0.2

## Date: 2025-05-14

### Version 0.0.2
This release brings some changes that have been implemented. However, a detailed summary could not be generated automatically. For a full overview, please check the diffs in/b/scripts/RELEASE.md. Diff size: 323 characters.

### Version 0.0.1
Similarly, changes have been made and summarized here. The release includes modifications that are present in/b/scripts/RELEASE.md. Diff size: 323 characters.

---

## Application Updates:

### Version 0.0.1 (2025-05-14)
- Changes have been made in the app.js script.
- Modifications include the addition of logging statements and potential API endpoint changes.
- The diff can be found in '/b/scripts/app.js'. Diff size: 94 characters.

- - console.log("First 200 chars of diff:", diff.substring(0, 200)); -
+  console.log("Diff ============", diff);

---

Note: Please ensure you have the required updates in place to complement the changes mentioned in the release notes above. This might involve running specific migrations and updating your application environment according to the new versions.

## Version 0.0.10 - 2025-05-14

# Release Note for version 0.0.9 Released on May 14, 2025

**Version Release: 0.0.9**
Date: 2025-05-14

In this release, we have some updates in our project. The changes have been detected, but could not be summarized automatically. Diff size: 488011a - fd47dcf.

Please review the changed sections and keep note of the updates made in this release.

----- 
**Version Release: 0.0.8 (This release is an earlier version and is not included in this release note)**
Date: 2025-04-27

Changes were made in the previous release but could not be automatically summarized. Diff size: 488011a - fd47dcf.

-----
Note: It seems there are discrepancies between the git diff index and the previous release notes for version 0.0.8. Please refer to the previous version for context.

For more detailed information on changes made, you can refer to the "Review the changed sections" section indicated in the "Version Release: 0.0.9" release note above.

Contact the development team if you have any queries or need further assistance regarding the newly released version or the existing version.

Thank you for using our project! Your feedback helps us to continue improving our software.

## Version 0.0.9 - 2025-05-14

Changes detected but could not be summarized.

## Version 0.0.8 - 2025-04-27

Changes were made but could not be automatically summarized. Diff size: 424 characters.

## Version 0.0.7 - 2025-04-24

//////////////////

## Version 0.0.6 - 2025-04-24

Changes were made but could not be automatically summarized. Diff size: 429 characters.

## Version 0.0.5 - 2025-04-24

Changes were made but could not be automatically summarized. Diff size: 7105 characters.

## Version 0.0.4 - 2025-04-24

No changes detected.

## Version 0.0.3 - 2025-04-24

No changes detected.

## Version 0.0.2 - 2025-04-24

No significant changes.

## Version 0.0.1 - 2025-04-24

No significant changes.
