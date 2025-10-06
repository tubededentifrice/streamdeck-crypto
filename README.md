
# Crypto ticker PRO StreamDeck plugin
`Crypto ticker PRO` is a plugin to watch crypto and stock rates. Crypto rates are provided by Bitfinex, Binance in real time and Stocks are provided by Yahoo Finance every 15mins.

## Features
- Core modules authored in TypeScript (compiled to JavaScript for Stream Deck runtime)
- Cross-platform (macOS, Windows)
- All Bitfinex and Binance pairs are supported (~1500 pairs); All Yahoo Finance stocks are supported.
- Real time updates of the ticker (WebSocket connection)
- A bar shows where the current value sits within daily low/high (ie is it up or down)
- Allows setting a multiplier and number of digits (eg. for very small or big values)
- Clicking the button shows the candlebar view (customizable interval)
- Can set up custom alerts depending on the value
- Can customize fonts, colors, which info to display, etc.
- Fully open source!

## Connection States

| State | Meaning |
| --- | --- |
| **LIVE** | Connected to the primary market data provider and receiving live updates. |
| **BACKUP** | The primary provider failed; the plugin automatically switched to a fallback provider. |
| **DETACHED** | Direct provider requests failed, so the legacy ticker proxy is supplying data. |
| **BROKEN** | All retry attempts exhausted and no provider is currently supplying data. |

When the connection status icon is enabled, these states are rendered on the Stream Deck key and in the Property Inspector using the same icon shapes.

## Troubleshooting Connection Issues

### Common Issues & Quick Fixes
- Local network interruptions or Wi-Fi dropouts → confirm connectivity and retry.
- Corporate/VPN firewalls blocking exchange endpoints → allow-list the provider domains or disconnect the blocking service.
- Temporary provider outages → review the exchange status page and wait for service restoration.
- Provider-specific throttling or symbol availability gaps → try selecting a different provider or trading pair.

### Diagnostic Checklist
1. Check your internet connection (router, Wi-Fi, or Ethernet status).
2. Verify the target exchange/API is reachable and not blocked by a firewall, proxy, or VPN.
3. Review the provider's status page or community channels for outage notices.
4. Switch to another supported provider in the Property Inspector to compare behaviour.
5. Inspect the plugin logs (Stream Deck logs directory) for detailed error messages.

## Code Structure
- `js/ticker.ts` orchestrates Stream Deck lifecycle events and delegates to helper modules
- `js/canvas-renderer.ts` encapsulates ticker and candle canvas drawing logic
- `js/settings-manager.ts` normalizes defaults and drives subscription refresh
- `js/alert-manager.ts` evaluates alert rules and tracks arm/disarm state
- `js/formatters.ts` provides shared number/price formatting helpers
- `js/ticker-state.ts` owns context metadata, subscriptions, and cache storage
- Jest specs cover each helper module alongside the existing ticker/provider tests

The TypeScript sources compile to CommonJS modules for tests and are bundled into
`js/plugin.bundle.js`, `js/pi.bundle.js`, and `js/preview.bundle.js` for runtime use.

<img src="https://github.com/tubededentifrice/streamdeck-crypto/raw/master/screenshot1.png" width="277" />
<img src="https://github.com/tubededentifrice/streamdeck-crypto/raw/master/screenshot2.png" width="354" />

## Installation
- Run the following to be able to use the `dev` version in the Stream Deck (you need to have the [Elgato's CLI](https://docs.elgato.com/streamdeck/sdk/introduction/getting-started) installed):
```
streamdeck dev
streamdeck link ./com.courcelle.cryptoticker-dev.sdPlugin
open "http://localhost:23654/"
npm run watch
# You should have the "dev" plugin listed in your Stream Deck UI, if not quit it entirely and restart it
```

- Once finished testing, revert back to normal (optional):
```
streamdeck unlink com.courcelle.cryptoticker-dev
```

## Packaging

Release automation handles version bumps, changelog updates, bundling, and creation of the `.streamDeckPlugin` bundle. Review `RELEASE_CHECKLIST.md` first, then run the appropriate release command:

```
npm run release:patch   # bug fixes and documentation-only changes
npm run release:minor   # backwards-compatible features
npm run release:major   # breaking changes
```

Each release command:
- bumps `package.json`, `manifest.json`, and `manifest.pub.json`
- regenerates `CHANGELOG.md` from conventional commits since the previous release
- compiles TypeScript, rebuilds runtime bundles, and stages the production plugin
- outputs `com.courcelle.cryptoticker.streamDeckPlugin` at the repository root

Run `npm run build` to refresh compiled assets. Append `-- --stage` to also prepare the production plugin folder, or `-- --package` (or `node scripts/build.js --package`) to create the `.streamDeckPlugin` directly.


## Development

Use the following npm scripts during development:

- `npm run build` – transpile TypeScript and rebuild runtime bundles; add `-- --stage` to prepare `dist/release/com.courcelle.cryptoticker.sdPlugin`, or `-- --package` to also emit the `.streamDeckPlugin`
- `npm run build:watch` – run the TypeScript compiler and esbuild bundler in watch mode (used by other scripts)
- `npm run bundle` – rebuild only the bundled assets (skips TypeScript recompile)
- `npm test` – run the Jest unit tests (automatically runs `npm run build` first)
- `npm run watch` – concurrently run the TypeScript compiler in watch mode and restart the dev plugin via `streamdeck restart`
- `npm run preview` – run the TypeScript compiler in watch mode alongside the preview server (`npm run preview:serve` if you only need the server)
- `npm run release:patch|minor|major` – bump versions, regenerate the changelog, build bundles, and package the plugin for distribution
