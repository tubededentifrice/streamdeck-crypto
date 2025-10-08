# Generate Ticker SVG Script

A simple script to generate an SVG ticker image for crypto pairs using the StreamDeck Crypto plugin functions.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install jsdom canvas
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Run the script:**
   ```bash
   node generate-svg.js
   ```

This will generate `ticker.svg` (and `ticker.png`) with the default settings (BTCUSDT on Binance, white text, transparent background).

## Configuration

Edit the `CONFIG` object at the top of `generate-svg.js`:

```javascript
const CONFIG = {
  pair: 'BTCUSDT',              // Trading pair (e.g., 'ETHUSD', 'BNBUSDT')
  provider: 'BINANCE',           // Exchange (BINANCE, BITFINEX, etc.)
  fromCurrency: 'USD',           // Base currency
  backgroundColor: 'transparent', // 'transparent' or hex color like '#000000'
  textColor: '#ffffff',          // Hex color for text
  width: 144,                    // SVG width in pixels
  height: 144,                   // SVG height in pixels
  outputFile: 'ticker.svg',      // Output filename

  // Display options
  displayHighLow: 'on',          // Show high/low prices
  displayHighLowBar: 'on',       // Show price range bar
  displayDailyChange: 'on'       // Show 24h change percentage
};
```

## Examples

### Generate BTCUSDT ticker (default):
```bash
node generate-svg.js
```

### Other pairs:
Edit `generate-svg.js` and change:
```javascript
pair: 'ETHUSD',    // For Ethereum
pair: 'BNBUSDT',   // For Binance Coin
pair: 'SOLUSD',    // For Solana
```

### Different providers:
```javascript
provider: 'BITFINEX',  // Use Bitfinex instead of Binance
```

### Different colors:
```javascript
backgroundColor: '#1a1a1a',  // Dark gray background
textColor: '#00ff00',        // Green text
```

## Post-Processing for Pure White/Transparent

The script generates images with the ticker's normal colored elements (green/red indicators). To convert to pure white on transparent background:

```bash
# Install ImageMagick first (macOS):
brew install imagemagick

# Convert to white on transparent:
convert ticker.png -fuzz 20% -transparent black -colorspace gray -fill white -colorize 100% ticker_white.png
```

## Supported Pairs

The script supports any trading pair available on the configured provider. Common examples:
- Bitcoin: `BTCUSD`, `BTCUSDT`
- Ethereum: `ETHUSD`, `ETHUSDT`
- Binance Coin: `BNBUSD`, `BNBUSDT`
- Solana: `SOLUSD`, `SOLUSDT`
- And many more...

## Troubleshooting

### "Missing dependencies" error:
```bash
npm install jsdom canvas
```

### "Error fetching ticker data":
- Make sure the pair symbol is correct for your provider
- Check that you've built the project: `npm run build`
- Verify the provider supports the pair (e.g., use BINANCE for most crypto pairs)

### Canvas rendering issues:
Make sure you have the required system dependencies for node-canvas:
- **macOS**: `brew install pkg-config cairo pango libpng jpeg giflib librsvg`
- **Ubuntu**: `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`

## Output

The script generates:
- **ticker.svg** - SVG file with embedded PNG data
- **ticker.png** - PNG reference file

The image (144x144 pixels by default) shows:
- Trading pair name
- Current price
- 24-hour high/low
- Price range indicator bar
- 24-hour change percentage (with green/red coloring)
