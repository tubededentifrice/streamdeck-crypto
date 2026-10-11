# Ticker image generator

`generate-svg.js` renders a standalone ticker image using the project's canvas logic. It writes `ticker.svg` with embedded raster data and a `ticker.png` reference.

## Usage

```sh
npm ci
npm run build
node generate-svg.js
```

Edit the `CONFIG` object in `generate-svg.js` to choose the pair, provider, source currency, colors, dimensions, output path, and displayed fields.

The utility uses `sharp` to convert SVG output to PNG. Install dependencies with Node.js 24 or later.

The script retrieves live provider data, so invalid symbols, provider outages, firewall rules, or unavailable direct endpoints can prevent generation. Confirm the main plugin build and the selected provider/pair before debugging rendering.
