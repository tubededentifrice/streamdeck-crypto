# Instructions for agents

This repository hosts the StreamDeck Crypto ticker plugin.

## Code structure

- Plugin implementation lives in `src/com.courcelle.cryptoticker.sdPlugin`.
- Key files:
    - `manifest.json` defines the action and entry points.
    - `js/ticker.js` handles WebSocket connections and action behavior.
    - `js/pi.js` powers the property inspector and settings.
    - `index.html` loads Stream Deck SDK libraries and plugin scripts.

## Style and testing

- Use 4 spaces for indentation and double quotes in JavaScript and HTML.
- No test suite is defined. Run `npm test` after changes; it will fail until tests are added.
