# Release Checklist

This checklist keeps Stream Deck Crypto Ticker releases consistent. Follow every step when cutting a new version.

## Pre-flight
- [ ] Confirm the Stream Deck CLI (`streamdeck`) is installed and on your `PATH`
- [ ] Run `npm install` to ensure dependencies are up to date
- [ ] Run `npm run lint` and `npm test` and fix any failures
- [ ] Verify all changes follow the conventional commit format (for changelog generation)
- [ ] Ensure the working tree is clean (commit or stash local work that should not ship)

## Version & Build
- [ ] Choose the appropriate release level:
  - Patch (`npm run release:patch`) for bug fixes and docs-only changes
  - Minor (`npm run release:minor`) for new backwards-compatible features
  - Major (`npm run release:major`) for breaking changes
- [ ] Run the release script (it bumps versions, regenerates the changelog, builds bundles, and packages the `.streamDeckPlugin`)
- [ ] Inspect the generated `CHANGELOG.md`, `package.json`, and manifests for correctness

## Post-build
- [ ] Manually test the generated plugin on macOS and Windows if possible
- [ ] Commit the release (`git commit -am "release: vX.Y.Z"` or similar)
- [ ] Tag the commit (`git tag vX.Y.Z`) and push tags (`git push --tags`)
- [ ] Upload `com.courcelle.cryptoticker.streamDeckPlugin` to the Elgato submission portal / release distribution channel
- [ ] Update any external documentation or announcements as needed

## Rollback Plan
- [ ] If issues are discovered, revert the release commit and tag
- [ ] Re-run the release process with the corrected changeset
