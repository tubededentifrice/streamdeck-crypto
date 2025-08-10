
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
- Run `cp -f ./com.courcelle.cryptoticker.sdPlugin/manifest.dev.json ./com.courcelle.cryptoticker.sdPlugin/manifest.json` to use the dev version
- Run `mv com.courcelle.cryptoticker.sdPlugin com.courcelle.cryptoticker-dev.sdPlugin` to use the dev version
- Run `streamdeck link ./com.courcelle.cryptoticker.sdPlugin` after having installed the [Elgato's CLI](https://docs.elgato.com/streamdeck/sdk/introduction/getting-started)
- Run `mv com.courcelle.cryptoticker-dev.sdPlugin com.courcelle.cryptoticker.sdPlugin` to use the dev version
- Once finished with testing, run `cp -f ./com.courcelle.cryptoticker.sdPlugin/manifest.pub.json ./com.courcelle.cryptoticker.sdPlugin/manifest.json` to go back to public manifest

## Packaging
- Bump the version in `src/com.courcelle.cryptoticker.sdPlugin/manifest.json`.
- Run `streamdeck pack com.courcelle.cryptoticker.sdPlugin`

## Development

Use the following npm scripts during development:

- `npm test` – run the Jest unit tests
- `npm run preview` – start a lightweight server on port 34115 and open the preview page in the default browser
