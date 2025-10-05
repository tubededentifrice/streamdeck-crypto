
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

## Code Structure
- `js/ticker.js` orchestrates Stream Deck lifecycle events and delegates to helper modules
- `js/canvas-renderer.js` encapsulates ticker and candle canvas drawing logic
- `js/settings-manager.js` normalizes defaults and drives subscription refresh
- `js/alert-manager.js` evaluates alert rules and tracks arm/disarm state
- `js/formatters.js` provides shared number/price formatting helpers
- `js/ticker-state.js` owns context metadata, subscriptions, and cache storage
- Jest specs cover each helper module alongside the existing ticker/provider tests

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
- Bump the version in `src/com.courcelle.cryptoticker-dev.sdPlugin/manifest.pub.json`.

Run the following to create the "published" version of the plugin:
```
mkdir -p com.courcelle.cryptoticker.sdPlugin  # Make sure to never edit this, and only make changes to the -dev directory
rsync -avh --delete ./com.courcelle.cryptoticker-dev.sdPlugin/ ./com.courcelle.cryptoticker.sdPlugin/
cp -f ./com.courcelle.cryptoticker.sdPlugin/manifest.pub.json ./com.courcelle.cryptoticker.sdPlugin/manifest.json
rm -f com.courcelle.cryptoticker.streamDeckPlugin
streamdeck pack com.courcelle.cryptoticker.sdPlugin
rm -rf com.courcelle.cryptoticker.sdPlugin
```


## Development

Use the following npm scripts during development:

- `npm test` – run the Jest unit tests
- `npm run watch` – watch for changes in the code and notify the Stream Deck UI to reload it whenever needed
- `npm run preview` – start a lightweight server on port 34115 and open the preview page in the default browser
