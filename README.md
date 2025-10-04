
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
- Run the following to be able to use the `dev` version in the Stream Deck (you need to have the [Elgato's CLI](https://docs.elgato.com/streamdeck/sdk/introduction/getting-started) installed):
```
cp -f ./com.courcelle.cryptoticker.sdPlugin/manifest.dev.json ./com.courcelle.cryptoticker.sdPlugin/manifest.json
mv com.courcelle.cryptoticker.sdPlugin com.courcelle.cryptoticker-dev.sdPlugin
streamdeck link ./com.courcelle.cryptoticker-dev.sdPlugin
# Open the Stream Deck UI, quit it and relaunch it
# A "Crypto Ticker PRO-dev" plugin should be listed for you to test
```

- To debug:
```
streamdeck dev
open "http://localhost:23654/"
```

- Once finished testing, revert back to normal:
```
streamdeck unlink com.courcelle.cryptoticker-dev
mv com.courcelle.cryptoticker-dev.sdPlugin com.courcelle.cryptoticker.sdPlugin
cp -f ./com.courcelle.cryptoticker.sdPlugin/manifest.pub.json ./com.courcelle.cryptoticker.sdPlugin/manifest.json
```

## Packaging
- Bump the version in `src/com.courcelle.cryptoticker.sdPlugin/manifest.json`.
- Run `streamdeck pack com.courcelle.cryptoticker.sdPlugin`

## Development

Use the following npm scripts during development:

- `npm test` – run the Jest unit tests
- `npm run preview` – start a lightweight server on port 34115 and open the preview page in the default browser
