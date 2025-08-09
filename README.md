
# Crypto ticker PRO StreamDeck plugin
`Crypto ticker PRO` is a plugin to watch crypto and stock rates. Crypto rates are provided by Bitfinex, Binance in real time and Stocks are provided by Yahoo Finance every 15mins.

## Features
- Code written in pure JavaScript
- Cross-platform (macOS, Windows)
- All Bitfinex and Binance pairs are supported (~1500 pairs); All Yahoo Finance stocks are supported.
- Real time updates of the ticker (WebSocket connection)
- A bar shows where the current value sits within daily low/high (ie is it up or down)
- Allows setting a multiplier and number of digits (eg. for very small or big values)
- Clicking the button shows the candlebar view (customizable interval)
- Can set up custom alerts depending on the value
- Can customize fonts, colors, which info to display, etc.
- Fully open source!

<img src="https://github.com/tubededentifrice/streamdeck-crypto/raw/master/screenshot1.png" width="277" />
<img src="https://github.com/tubededentifrice/streamdeck-crypto/raw/master/screenshot2.png" width="354" />

## Installation
- From Releases: download `com.courcelle.cryptoticker.streamDeckPlugin` from the `Release/` folder (or GitHub Releases) and double‑click it to install into Stream Deck.
- Manual install (advanced):
    - macOS: copy the `.sdPlugin` bundle into `~/Library/Application Support/com.elgato.StreamDeck/Plugins/`.
    - Windows: copy the `.sdPlugin` bundle into `%appdata%\Elgato\StreamDeck\Plugins\`.

## Packaging
- Bump the version in `src/com.courcelle.cryptoticker.sdPlugin/manifest.json`.
- Windows: build a distributable `.streamDeckPlugin` with the bundled tool:
    - `DistributionToolWindows/DistributionTool.exe -b -i src/com.courcelle.cryptoticker.sdPlugin -o Release`
    - The packaged file appears in `Release/`.
- macOS/Linux: use Elgato’s official Distribution Tool (download from the Stream Deck SDK docs) to package the same input directory. Example:
    - `DistributionTool -b -i src/com.courcelle.cryptoticker.sdPlugin -o Release`
    - Then double‑click the generated `.streamDeckPlugin` to install.

## Development

Use the following npm scripts during development:

- `npm test` – run the Jest unit tests
- `npm run preview` – start a lightweight server on port 34115 and open the preview page in the default browser
