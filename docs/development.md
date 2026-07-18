# Development

## Setup

Requirements:

- Node.js compatible with the lockfile and native development dependencies.
- Stream Deck 6.9 or later for plugin testing.
- The [Stream Deck CLI](https://docs.elgato.com/streamdeck/sdk/introduction/getting-started/) for linking, validation, and packaging.

Install dependencies with `npm install`.

For local Stream Deck development:

```sh
streamdeck dev
streamdeck link ./com.courcelle.cryptoticker-dev.sdPlugin
npm run watch
```

The remote debugger is exposed by Stream Deck at `http://localhost:23654/`. When finished, `streamdeck unlink com.courcelle.cryptoticker-dev` removes the development link.

## Commands

| Command                      | Purpose                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `npm run build`              | Compile TypeScript and rebuild all runtime bundles.                                |
| `npm run build -- --stage`   | Build and stage the production runtime under `dist/release/`.                      |
| `npm run build -- --package` | Build, stage, validate through the CLI packer, and create the `.streamDeckPlugin`. |
| `npm run build:watch`        | Watch TypeScript and bundle inputs.                                                |
| `npm run bundle`             | Rebuild bundles without compiling adjacent CommonJS files.                         |
| `npm run preview`            | Watch builds and run the preview server.                                           |
| `npm run preview:serve`      | Run only the preview server.                                                       |
| `npm run lint`               | Lint TypeScript, tests, and the preview server.                                    |
| `npm test -- --runInBand`    | Build, then run Jest serially.                                                     |

Run `npm run lint` and `npm test -- --runInBand` after relevant code changes.

## Source and generated files

Edit `.ts` files under `com.courcelle.cryptoticker-dev.sdPlugin/js/`. Do not hand-edit their adjacent `.js` outputs or `*.bundle.js` files. `npm run build` regenerates both layers; commit the generated changes with their sources.

The runtime uses transitional UMD/CommonJS modules so the same logic works in Jest, the property inspector, the preview, and bundled browser execution. Several large legacy modules still use `@ts-nocheck`; new focused modules should use explicit types, and touched legacy code should reduce unchecked surface only when it can be done without broad behavioral risk.

## Tests

Keep deterministic behavior in Jest and mock network, WebSocket, Stream Deck, and canvas boundaries. High-value regression areas are:

- action appearance/disappearance and subscription cleanup;
- pooled socket reconnect and stale-event races;
- fallback polling and request coalescing;
- request timeouts and abort cleanup;
- provider payload transformation;
- settings normalization and migration behavior;
- expression allowlisting and rejected syntax;
- currency/candle conversion and formatting;
- canvas drawing operations rather than pixel snapshots.

## Preview and image utility

The browser preview lives under `com.courcelle.cryptoticker-dev.sdPlugin/dev/`. See [Ticker image generator](ticker-image-generator.md) for the standalone SVG/PNG script.
