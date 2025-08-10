# Codebase Analysis: Stream Deck Crypto Ticker

This document provides a summary of the Stream Deck Crypto Ticker plugin's codebase.

## Project Overview

The project is a plugin for the Elgato Stream Deck that displays real-time prices for cryptocurrencies and stocks.

- **Frontend**: The plugin's user interface is built with HTML, CSS, and JavaScript. It runs within the Stream Deck application.
- **Backend**: It relies on an external proxy service at `https://tproxyv8.opendle.com` to fetch data from various sources.
- **Data Sources**: The proxy aggregates data from Bitfinex, Binance (for crypto), and Yahoo Finance (for stocks).

## Architecture

The plugin consists of two main parts:

1.  **Ticker Display**: The part that runs on the Stream Deck device itself, displaying the price information.
2.  **Property Inspector (PI)**: The configuration UI that appears in the Stream Deck desktop application, allowing users to customize the ticker.

Communication between the plugin and the Stream Deck software happens via a WebSocket connection established by the Stream Deck application.

## Key Files

-   `com.courcelle.cryptoticker.sdPlugin/manifest.json`: The plugin's manifest file. It defines the plugin's properties, actions, and entry points (`index.html` for the ticker, `index_pi.html` for the PI).

-   `com.courcelle.cryptoticker.sdPlugin/js/ticker.js`: The core logic for the ticker display.
    -   It connects to the data proxy using SignalR for real-time updates.
    -   It uses an HTML5 `<canvas>` to draw the ticker/chart, which is then sent as an image to the Stream Deck hardware.
    -   It handles user interactions (key presses) to switch between ticker and candle chart modes.

-   `com.courcelle.cryptoticker.sdPlugin/js/pi.js`: The logic for the Property Inspector.
    -   It dynamically fetches the list of available exchanges and trading pairs from the backend proxy.
    -   It provides a form for users to configure settings like the pair, colors, fonts, and alert rules.
    -   It sends the updated settings to the core plugin logic (`ticker.js`).

-   `README.md`: Contains general information about the project, features, and installation/build instructions. The build process uses Elgato's `DistributionTool.exe` to package the plugin.

## Data Flow

1.  **Configuration**:
    -   The user configures a ticker instance using the Property Inspector (`pi.js`).
    -   The PI fetches available pairs from `tproxyv8.opendle.com`.
    -   The chosen settings are saved by the Stream Deck software and sent to `ticker.js`.

2.  **Display**:
    -   `ticker.js` establishes a SignalR WebSocket connection to `tproxyv8.opendle.com`.
    -   It subscribes to the specific pair configured by the user.
    -   The proxy pushes real-time price updates to the plugin.
    -   Upon receiving an update, `ticker.js` redraws the content on a canvas and sends the image data to the Stream Deck device for display.
