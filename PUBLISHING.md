# Publishing Instructions

This document outlines the steps to publish the `@mwolf1989/nestjs-nats` package to npm.

## Prerequisites

1. Make sure you have an npm account
2. Log in to npm from your terminal:
   ```bash
   npm login
   ```
3. Ensure you're listed as a maintainer/owner of the package:
   ```bash
   npm owner ls @mwolf1989/nestjs-nats
   ```

## Manual Publishing

To manually publish the package:

1. Make sure all changes are committed
2. Update the version in `package.json` (follow [semver](https://semver.org/))
3. Build the package:
   ```bash
   npm run build
   ```
4. Publish to npm:
   ```bash
   npm run publish:npm
   ```

## Using GitHub Actions

This repository is configured with GitHub Actions to automatically publish the package when changes are pushed to the main branch. To use this approach:

1. Generate an npm access token:
   - Go to your npm account settings
   - Under "Access Tokens", create a new token with "Publish" access
   - Copy the token

2. Add the token to your GitHub repository:
   - Go to your repository settings
   - Navigate to "Secrets and variables" > "Actions"
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: [paste your npm token]
   - Click "Add secret"

3. When you push to the main branch, the CI workflow will:
   - Build and test the package
   - If tests pass, publish the package to npm

## Publishing a Beta Version

To publish a beta version:

1. Update the version in `package.json` with a beta tag (e.g., `"version": "0.1.0-beta.1"`)
2. Build the package:
   ```bash
   npm run build
   ```
3. Publish with the next tag:
   ```bash
   npm run publish:next
   ```

## After Publishing

After publishing a new version:

1. Create a new GitHub release with release notes
2. Update the documentation if necessary
3. Notify users about the new version 