# Repository guidance

This is a Stream Deck 6.9+ plugin. Preserve visible behavior and settings compatibility unless fixing a demonstrated bug. Use the official [Stream Deck SDK](https://docs.elgato.com/streamdeck/sdk/introduction/getting-started/) for platform behavior.

## Progressive context

Read only the relevant document from [`docs/README.md`](docs/README.md):

- runtime/provider/lifecycle work: `docs/architecture.md`
- commands, generated files, tests, preview: `docs/development.md`
- manifests, staging, packaging: `docs/releasing.md`
- support behavior: `docs/troubleshooting.md`

## Source layout

- Plugin bundle: `com.courcelle.cryptoticker-dev.sdPlugin/`
- Authoritative code: adjacent TypeScript under `js/`
- Generated CommonJS: adjacent `.js` files
- Runtime bundles: `js/plugin.bundle.js`, `js/pi.bundle.js`, `js/preview.bundle.js`
- Tests: `__tests__/**/*.test.js`
- Build/release tooling: `scripts/`

Never hand-edit generated JavaScript or bundles. Run `npm run build` and commit generated outputs with source changes. Preserve unrelated worktree changes.

## Required checks

After relevant code or markup changes:

1. Run `npm run format` on touched files or use Prettier directly with a scoped path.
2. Run `npm run lint`.
3. Run `npm test -- --runInBand` and iterate until green.
4. For manifest/release changes, run `npm run build -- --stage` and `streamdeck validate dist/release/com.courcelle.cryptoticker.sdPlugin --no-update-check`.

`npm test` rebuilds generated artifacts before Jest. Use `npm run build -- --package` only when a package artifact is required.

## Invariants

- One action context owns at most one subscription and releases it on `willDisappear`.
- Providers share pooled sockets; ignore late events/results from replaced sockets or removed entries.
- Normalize all settings and external payloads at boundaries.
- Keep direct-provider → REST → proxy fallback and connection-state meanings stable.
- Keep rule evaluation allowlisted: no member access, calls, assignments, or object/function injection.
- Do not ship TypeScript, preview tooling, source maps, debug flags, or unused modules in production staging.

Use 2-space indentation and single quotes where Prettier applies them. Add concise comments only for non-obvious intent, ownership, or compatibility constraints. Keep tests deterministic and mock network, WebSocket, Stream Deck, and canvas boundaries.
