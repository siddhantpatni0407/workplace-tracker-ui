# Version Management in Workplace Tracker UI

This document outlines how version management is implemented in the Workplace Tracker UI application.

## Version Structure

The application follows semantic versioning (SemVer) with a version number structure of `MAJOR.MINOR.PATCH`:

- **MAJOR**: Incremented for incompatible API changes
- **MINOR**: Incremented for new functionality in a backward compatible manner
- **PATCH**: Incremented for backward compatible bug fixes

## Where Version Information is Stored

1. **Primary Source**: The version is stored in the `package.json` file under the `version` field.
2. **Constants**: The version is imported from package.json and made available throughout the application via the `APP_VERSION` object in `src/constants/version.ts`.

## How to Update the Version

### Manual Update

1. Update the version in `package.json`:

```json
{
  "name": "workplace-tracker-ui",
  "version": "0.2.0",  // Update this line
  "private": true,
  ...
}
```

2. Commit the changes:

```bash
git commit -am "Bump version to 0.2.0"
```

3. Create a git tag (optional but recommended):

```bash
git tag -a v0.2.0 -m "Version 0.2.0"
git push origin v0.2.0
```

### Automatic Update Using npm

You can use npm's version command to automatically update the version in package.json:

```bash
# For patch updates (0.1.0 -> 0.1.1)
npm version patch

# For minor updates (0.1.0 -> 0.2.0)
npm version minor

# For major updates (0.1.0 -> 1.0.0)
npm version major
```

These commands will:
1. Update the version in package.json
2. Create a git commit with the version change
3. Create a git tag with the new version

## Version Display and Usage

The version information is used in several places:

1. **Footer**: Displayed in the footer of the application
2. **API Requests**: Sent in the `X-App-Version` header with API requests
3. **Version Notification**: Users are notified when a new version is available

## Version Update Checking

The application checks for updates using the following process:

1. Makes a request to a version API endpoint
2. Compares the returned version against the current version
3. If a newer version is available, displays a notification to the user
4. User can reload the application to get the latest version

## Implementation Files

- `src/constants/version.ts`: Central version information and utilities
- `src/utils/versionCheck.ts`: Version checking logic
- `src/components/ui/VersionNotification.tsx`: UI component for version notifications
- `src/services/axiosInstance.ts`: Adds version headers to API requests
- `src/components/common/footer/Footer.tsx`: Displays the version in the UI

## Best Practices

1. Always update the version number when releasing changes
2. Follow semantic versioning rules
3. Create git tags for each release
4. Include version changes in release notes
5. Use automated tools when possible to ensure consistency

## Additional Recommendations

- Consider adding a CHANGELOG.md file to track changes between versions
- For CI/CD environments, automate version bumping based on commit messages or branch names
- Add the version number to error logs to help with debugging specific versions