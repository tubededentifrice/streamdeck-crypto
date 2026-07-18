# Releasing

Release commands bump versions, generate `CHANGELOG.md`, rebuild generated assets, stage a production-only payload, and create `com.courcelle.cryptoticker.streamDeckPlugin`.

## Pre-flight

- [ ] Confirm `streamdeck` is available on `PATH`.
- [ ] Run `npm install`.
- [ ] Run `npm run lint`.
- [ ] Run `npm test -- --runInBand`.
- [ ] Review `npm audit --omit=dev`; the shipped runtime must have no production dependency findings.
- [ ] Review all source and generated-file diffs.
- [ ] Manually exercise ticker/candle switching, settings changes, alerts, conversion, and provider fallback.

## Build and validation

Choose the version level:

- `npm run release:patch` for compatible fixes and documentation.
- `npm run release:minor` for backward-compatible features.
- `npm run release:major` for breaking changes.

The production manifest is `manifest.pub.json`. Unlike development manifests, it must not enable the Node debugger.

Staging intentionally copies only runtime-reachable HTML, CSS, fonts, manifest assets, required legacy Stream Deck helpers, `plugin.bundle.js`, `pi.bundle.js`, connection-state helpers, and preview artwork. TypeScript, adjacent test-target JavaScript, preview tooling, source maps, obsolete assets, and development manifests must not ship.

After a staged build, validate it directly:

```sh
npm run build -- --stage
streamdeck validate dist/release/com.courcelle.cryptoticker.sdPlugin --no-update-check
```

`npm run build -- --package` invokes the Stream Deck packer and writes the package at the repository root.

## Release review

- [ ] Inspect `CHANGELOG.md`, `package.json`, and all three manifest versions.
- [ ] Inspect the archive file list and confirm only runtime assets are present.
- [ ] Install and test the generated package on macOS and Windows when possible.
- [ ] Commit with a clear release message and tag `vX.Y.Z`.
- [ ] Upload the package to the intended release channel.

If a release fails after version files are changed, inspect the partial diff and restore only those release-script changes intentionally; never discard unrelated working-tree changes.
