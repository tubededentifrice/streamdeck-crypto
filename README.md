# Crypto Ticker PRO for Stream Deck

Crypto Ticker PRO displays cryptocurrency and stock prices on Stream Deck keys. Binance and Bitfinex provide direct real-time crypto updates with automatic REST/proxy fallback; Yahoo Finance symbols are supplied through the ticker proxy.

## Features

- Binance, Bitfinex, and Yahoo Finance symbols.
- Real-time WebSocket updates where supported.
- Configurable price formatting, separators, multiplier, fonts, colors, and visible fields.
- Daily high/low values, range indicator, and change percentage.
- Key press toggles between ticker and candle views.
- Sandboxed alert and color rules.
- Optional connection-state indicator and stale-data fallback.
- macOS and Windows support.

![Ticker examples](screenshot1.png)

![Property inspector](screenshot2.png)

## Connection states

| State      | Meaning                            |
| ---------- | ---------------------------------- |
| `LIVE`     | Direct exchange WebSocket updates. |
| `DETACHED` | Direct provider REST polling.      |
| `BACKUP`   | Legacy ticker proxy data.          |
| `BROKEN`   | No provider returned usable data.  |

See [Troubleshooting](docs/troubleshooting.md) for diagnosis and provider-specific notes.

## Installation

Install the released `.streamDeckPlugin` package by opening it with Stream Deck.

For development, install the [Stream Deck CLI](https://docs.elgato.com/streamdeck/sdk/introduction/getting-started/) and run:

```sh
npm install
streamdeck dev
streamdeck link ./com.courcelle.cryptoticker-dev.sdPlugin
npm run watch
```

## Development

The essential checks are:

```sh
npm run lint
npm test -- --runInBand
```

Start with the [documentation index](docs/README.md). It links the architecture, development workflow, release process, troubleshooting guide, and image generator notes.

## License

See [LICENSE](LICENSE).
