# Codebase Analysis: Stream Deck Crypto Ticker

This document provides a summary of the Stream Deck Crypto Ticker plugin's codebase.

---

## Project Overview

The project is a plugin for the Elgato Stream Deck that displays real-time prices for cryptocurrencies and stocks with advanced charting and alert capabilities.

- **Frontend**: The plugin's user interface is built with HTML, CSS, and JavaScript. TypeScript is used for the logic modules (compiled to JavaScript for the Stream Deck runtime).
- **Backend**: Hybrid architecture with both direct exchange connections and proxy fallback
- **Data Sources**: Direct WebSocket connections to Binance and Bitfinex, with fallback to proxy (`https://tproxyv8.opendle.com`) and Yahoo Finance for stocks

---

## Architecture

### Overview

The plugin consists of three main parts:

1. **Ticker Display**: Runs on the Stream Deck device, displaying price information with canvas-based rendering
2. **Property Inspector (PI)**: Configuration UI in the Stream Deck desktop application
3. **Provider System**: Modular data provider architecture with automatic failover

Communication between the plugin and Stream Deck software happens via WebSocket established by the Stream Deck application.

The runtime logic is now modular: `ticker.ts` orchestrates lifecycle events while specialized helpers (`canvas-renderer.ts`, `settings-manager.ts`, `alert-manager.ts`, `formatters.ts`, `ticker-state.ts`) encapsulate rendering, configuration, alerts, and shared caches to keep responsibilities focused and testable. Compiled JavaScript artifacts live alongside the TypeScript sources for Stream Deck consumption.

### Provider Architecture (NEW in direct_provider branch)

The plugin now implements a **multi-provider system** with automatic failover:

```
┌─────────────────────────────────────────────────────────┐
│                  Provider Registry                       │
│  - Manages multiple data providers                       │
│  - Automatic failover on connection failure              │
│  - Provider-specific symbol resolution                   │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│    Binance    │  │   Bitfinex    │  │    Generic    │
│   Provider    │  │   Provider    │  │   Provider    │
│               │  │               │  │   (Proxy)     │
│  Direct WS    │  │  Direct WS    │  │  SignalR +    │
│  Connection   │  │  Connection   │  │  REST API     │
└───────────────┘  └───────────────┘  └───────────────┘
        │                   │                   │
        └───────────────────┴───────────────────┘
                            │
                ┌───────────────────────┐
                │ Subscription Manager  │
                │ - Lifecycle management│
                │ - Automatic reconnect │
                │ - Stale data detection│
                │ - Fallback polling    │
                └───────────────────────┘
```

#### Connection States

Each ticker instance tracks its connection state:

- **LIVE** 🟢 - Connected to primary provider (direct WebSocket) with real-time data
- **BACKUP** 🟡 - Primary provider failed, using backup (generic proxy)
- **DETACHED** ⚪ - Intentionally disconnected (settings changed, button removed)
- **BROKEN** 🔴 - All connection attempts failed

---

## Key Files

### Core Plugin Logic

- **`manifest.json`**: Plugin manifest defining properties, actions, and entry points
- **`js/ticker.ts`**: Stream Deck integration layer that wires providers, state, and rendering modules together
  - Handles WebSocket lifecycle, action callbacks, and provider subscriptions
  - Delegates rendering, state management, alerts, and formatting to dedicated modules
- **`js/canvas-renderer.ts`**: Canvas drawing helpers for ticker and candle views, including connection-state icon support
- **`js/settings-manager.ts`**: Default settings resolution, normalization, and subscription refresh coordination
- **`js/alert-manager.ts`**: Alert rule evaluation plus arm/disarm state tracking
- **`js/formatters.ts`**: Number/price formatting and normalization helpers shared by renderer and tests
- **`js/ticker-state.ts`**: Centralized store for context metadata, subscriptions, connection states, and caches

### Property Inspector

- **`index_pi.html`**: Property inspector HTML with connection status display
- **`js/pi.ts`** (~204 lines): Property inspector logic
  - Dynamic exchange and pair selection
  - Settings validation
  - Provider configuration
  - Connection status indicators

### Provider System (NEW)

**Core Interfaces:**
- **`js/providers/provider-interface.ts`** (59 lines): Base interface all providers implement
- **`js/providers/provider-registry.ts`** (122 lines): Central provider management with failover
- **`js/providers/subscription-key.ts`** (25 lines): Subscription key generation utility
- **`js/providers/connection-states.ts`** (14 lines): Connection state constants

**Provider Implementations:**
- **`js/providers/binance-provider.ts`** (426 lines): Direct Binance WebSocket integration
  - REST API: `https://api.binance.com`
  - WebSocket: `wss://stream.binance.com:9443/ws`
  - Symbol transformation: `BTCUSD` → `BTCUSDT`
  - Automatic reconnection with 5-second delay
- **`js/providers/bitfinex-provider.ts`** (502 lines): Direct Bitfinex WebSocket integration
  - REST API: `https://api-pub.bitfinex.com`
  - WebSocket: `wss://api-pub.bitfinex.com/ws/2`
  - Symbol normalization (removes separators, adds `t` prefix)
  - Channel-based subscription management
- **`js/providers/generic-provider.ts`** (348 lines): Refactored generic provider
  - Uses SignalR for WebSocket connection to proxy
  - REST API fallback
  - Supports conversion between currencies
- **`js/providers/yfinance-provider.ts`** (54 lines): Yahoo Finance wrapper for stocks

**Subscription Management:**
- **`js/providers/ticker-subscription-manager.ts`** (372 lines): Unified subscription lifecycle
  - Manages WebSocket subscriptions across providers
  - Automatic reconnection on disconnect
  - Stale data detection (triggers fallback after 6 minutes)
  - Fallback REST polling when WebSocket unavailable (every 60 seconds)
  - Per-subscription caching

### Configuration

- **`js/config.ts`** (20 lines): Configuration options for direct providers
  ```javascript
  {
      "tProxyBase": "https://tproxyv8.opendle.com",
      "fallbackPollIntervalMs": 60000,        // 60 seconds
      "staleTickerTimeoutMs": 360000,         // 6 minutes
      "binanceRestBaseUrl": "https://api.binance.com",
      "binanceWsBaseUrl": "wss://stream.binance.com:9443/ws",
      "bitfinexRestBaseUrl": "https://api-pub.bitfinex.com",
      "bitfinexWsBaseUrl": "wss://api-pub.bitfinex.com/ws/2"
  }
  ```

### Property Inspector UI Helpers (NEW)

- **`js/pi/providers/index.ts`** (24 lines): Provider-specific UI helpers
- **`js/pi/providers/binance.ts`** (46 lines): Binance UI integration
- **`js/pi/providers/bitfinex.ts`** (34 lines): Bitfinex UI integration

### Testing

- **`__tests__/ticker.test.js`**: Core ticker tests
- **`__tests__/formatters.test.js`**: Formatting utility coverage
- **`__tests__/alert-manager.test.js`**: Alert state evaluation tests
- **`__tests__/settings-manager.test.js`**: Settings normalization and subscription callback tests
- **`__tests__/ticker-state.test.js`**: State container behavior tests
- **`__tests__/canvas-renderer.test.js`**: Rendering helper sanity checks
- **`__tests__/binance-provider.test.js`**: Binance provider tests

### Development Tools

- **`dev/preview.html`** & **`dev/preview.js`**: Local preview server for development
- **`.gitignore`**: Git ignore rules
- **`package.json`**: NPM dependencies (SignalR, testing libraries)

### Documentation (NEW)

- **`REVIEW.md`**: Comprehensive code review findings
  - 3 bugs found and fixed
  - Architecture analysis
  - Security review
  - Testing recommendations
- **`QUESTIONS.md`**: 20 design decision questions with impact analysis
- **`IMPROVEMENTS.md`**: Detailed improvement suggestions
  - 40+ proposed improvements across 11 categories
  - Priority markers (🔴 High, 🟡 Medium, 🟢 Low)
  - Implementation plans with code examples

---

## Data Flow

### 1. Configuration Flow

```
User configures ticker in Property Inspector (pi.js)
    ↓
PI fetches available pairs from provider or proxy
    ↓
Settings saved by Stream Deck software
    ↓
Settings sent to ticker.js
    ↓
ticker.js selects appropriate provider via registry
```

### 2. Display Flow (NEW Architecture)

```
ticker.js receives settings
    ↓
Provider Registry selects best provider:
    - Try Binance/Bitfinex direct (if applicable)
    - Fallback to Generic (proxy) if needed
    ↓
Subscription Manager creates subscription
    ↓
Provider establishes connection:
    - Direct providers: WebSocket to exchange
    - Generic provider: SignalR to proxy
    ↓
Real-time updates received via WebSocket
    ↓
Subscription Manager:
    - Monitors connection health
    - Detects stale data (no updates > 6 min)
    - Triggers fallback polling if needed
    ↓
ticker.js receives update
    ↓
Canvas rendering:
    - Ticker mode: price, high/low, daily change
    - Candle mode: candlestick chart
    ↓
Image data sent to Stream Deck device
```

### 3. Failover Flow (NEW)

```
Direct provider WebSocket connection fails
    ↓
Subscription Manager detects failure
    ↓
Connection state → BROKEN
    ↓
Provider schedules reconnection (5 seconds)
    ↓
Meanwhile, fallback REST polling starts (60 seconds)
    ↓
If reconnection succeeds:
    - State → LIVE
    - Fallback polling stops
If reconnection fails:
    - State → BACKUP
    - Falls back to Generic provider
    - Fallback polling continues
```

---

## Key Features

### Ticker Display

- **Dual Mode**: Toggle between ticker and candlestick chart
- **Real-time Updates**: Sub-second updates via WebSocket (when connected)
- **Customization**:
  - Configurable colors (background, text)
  - Custom fonts and sizes
  - High/Low bar indicator
  - Daily change percentage (color-coded: green for up, red for down)
- **Connection Status Icon**: Visual indicator showing current connection state
  - Position: Top-right or bottom-left corner
  - Configurable: ON/OFF per button

### Alert System

- **Custom Alert Rules**: User-defined conditions using expressions
  - Example: `value > 70000` (alert when BTC > $70k)
  - Available variables: `value`, `high`, `low`, `changeDaily`, `changeDailyPercent`, `volume`
  - ⚠️ **Security Note**: Uses `eval()` - needs replacement (see IMPROVEMENTS.md § 1.1)
- **Visual Alerts**: Inverts background/text colors when alert triggers
- **Alert Arming**: Prevents repeated alerts until condition becomes false
- **Custom Color Rules**: Dynamic background and text color based on conditions

### Candlestick Charts

- **Multiple Timeframes**: 1m, 5m, 15m, 1h, 6h, 12h, 1d, 1w, 1M
- **Configurable Display**: Number of candles shown (5-60, default: 20)
- **Volume Data**: Includes volume information in candle data
- **High/Low Visualization**: Color-coded candles (green for up, red for down)

### Currency Conversion

- **Multi-Currency Support**: Display prices in different currencies (USD, EUR, etc.)
- **Automatic Conversion**: Uses exchange rate API
- **Caching**: 60-minute TTL for conversion rates
- **Fallback**: Uses 1:1 rate if conversion fails (⚠️ see IMPROVEMENTS.md § 1.9)

### Data Providers

#### Binance Provider (Direct WebSocket)
- **REST API**: `/api/v3/ticker/24hr` for initial data
- **WebSocket**: Individual streams per symbol (`<symbol>@ticker`)
- **Symbol Resolution**: Auto-converts USD to USDT (e.g., `BTCUSD` → `BTCUSDT`)
- **Reconnection**: Automatic with 5-second delay
- **Fallback**: Uses Generic provider if connection fails

#### Bitfinex Provider (Direct WebSocket)
- **REST API**: `/v2/ticker/<symbol>` for initial data
- **WebSocket**: Channel-based subscription system
- **Symbol Resolution**: Normalizes to Bitfinex format (e.g., adds `t` prefix)
- **Channel Management**: Tracks channel IDs for subscription/unsubscription
- **Reconnection**: Automatic with 5-second delay
- **Fallback**: Uses Generic provider if connection fails

#### Generic Provider (Proxy)
- **SignalR**: WebSocket connection to tproxy proxy server
- **REST API**: `/api/Ticker/json/<exchange>/<symbol>` for fallback
- **Automatic Reconnection**: Built-in SignalR reconnection
- **Multi-Exchange Support**: Aggregates data from multiple exchanges
- **Currency Conversion**: Handles conversion between currencies

#### Yahoo Finance Provider (Stocks)
- **REST API**: Via Generic provider
- **Use Case**: Stock market data (not crypto)

---

## Recent Changes (direct_provider branch)

### ✅ Bugs Fixed

1. **Duplicate Condition in Daily Change Precision** (ticker.js:691-694)
   - Fixed logic preventing proper display of ≥100% changes
   - Now correctly shows: <10% → 2 decimals, 10-99% → 1 decimal, ≥100% → 0 decimals

2. **Division by Zero in High/Low Bar** (ticker.js:734)
   - Added safety check when `high === low`
   - Fallback to center position (50%) instead of producing NaN

3. **Missing Volume Field in Bitfinex Candles** (bitfinex-provider.js:486)
   - Added `volume` field for consistency with Binance
   - Both providers now return identical candle structure

### 🆕 New Features

- Direct WebSocket connections to exchanges (Binance, Bitfinex)
- Provider registry with automatic failover
- Connection state tracking (LIVE, BACKUP, DETACHED, BROKEN)
- Visual connection status indicators
- Subscription manager with lifecycle management
- Automatic reconnection with configurable delays
- Stale data detection and fallback polling
- Symbol transformation (e.g., USD → USDT for Binance)

### 📊 Files Changed

- **New files**: 11 provider system files (1,922 lines total)
- **Modified files**: ticker.js, pi.js, index_pi.html
- **Documentation**: 3 new markdown files (REVIEW.md, QUESTIONS.md, IMPROVEMENTS.md)
- **Tests**: 2 new test files

---

## Technical Details

### Canvas Rendering

The plugin uses HTML5 Canvas API to render ticker information:

1. **Ticker Mode** (ticker.js:560-773):
   - Pair name (configurable title or symbol)
   - Current price (large font, configurable size)
   - High/Low prices (smaller font)
   - High/Low bar indicator (visual progress bar with triangle cursor)
   - Daily change percentage (color-coded)
   - Connection status icon (optional)

2. **Candles Mode** (ticker.js:894-965):
   - Candlestick chart with configurable number of candles
   - Time interval indicator
   - Color-coded candles (green/red)
   - Connection status icon (optional)

3. **Rendering Pipeline**:
   ```javascript
   updateCanvas() → drawTicker() or drawCandles() → sendCanvas()
   ```

### Subscription Lifecycle

```javascript
subscribeTicker(params, handlers)
    ↓
getOrCreateEntry()
    ↓
ensureStreaming()
    ↓
Provider.subscribeStream()
    ↓
WebSocket connection established
    ↓
Real-time updates via onmessage
    ↓
handleStreamingUpdate()
    ↓
notifySubscribers()
    ↓
handlers.onData(ticker)
```

### Connection Management

**Automatic Reconnection:**
```javascript
WebSocket.onclose → scheduleReconnect()
    ↓
setTimeout(5000) → connectWebSocket()
    ↓
If fails → scheduleReconnect() again
```

**Stale Data Detection:**
```javascript
shouldPollEntry(entry)
    ↓
Check: elapsed time since lastStreamUpdate > staleTickerTimeoutMs (6 min)
    ↓
If stale → trigger fallback polling
```

**Fallback Polling:**
```javascript
setInterval(fallbackPollIntervalMs = 60s)
    ↓
pollEntryIfNeeded()
    ↓
Check if streaming active and data fresh
    ↓
If not → fetchTicker() via REST API
```

---

## Caching Strategy

### Ticker Data Cache
- **Location**: Subscription Manager (`ticker-subscription-manager.js`)
- **Scope**: Per subscription key
- **Eviction**: None (⚠️ unbounded, see IMPROVEMENTS.md § 2.3)
- **Use Case**: Serve cached data when connection unavailable

### Conversion Rate Cache
- **Location**: ticker.js:89
- **TTL**: 60 minutes
- **Eviction**: TTL-based, but expired entries not removed (⚠️ see IMPROVEMENTS.md § 2.3)
- **Use Case**: Avoid repeated conversion rate API calls

### Candles Cache
- **Location**: ticker.js:90
- **TTL**: None
- **Eviction**: None (⚠️ unbounded, see IMPROVEMENTS.md § 2.3)
- **Use Case**: Avoid repeated candle data API calls

---

## Configuration & Settings

### Default Settings (ticker.js:93-120)

```javascript
{
    "title": null,                               // Custom display name
    "exchange": "BITFINEX",                      // Default exchange
    "pair": "BTCUSD",                            // Default pair
    "fromCurrency": "USD",                       // Base currency
    "currency": "USD",                           // Display currency
    "candlesInterval": "1h",                     // Chart interval
    "candlesDisplayed": 20,                      // Number of candles
    "multiplier": 1,                             // Price multiplier
    "digits": 2,                                 // Decimal places
    "font": "Lato,'Roboto Condensed',Helvetica,Calibri,sans-serif",
    "fontSizeBase": 25,                          // Base font size
    "fontSizePrice": 35,                         // Price font size
    "fontSizeChange": 19,                        // Change % font size
    "priceFormat": "compact",                    // Formatting style
    "backgroundColor": "#000000",                // Background color
    "textColor": "#ffffff",                      // Text color
    "displayHighLow": "on",                      // Show high/low
    "displayHighLowBar": "on",                   // Show indicator bar
    "displayDailyChange": "on",                  // Show daily change
    "displayConnectionStatusIcon": "OFF",        // Show status icon
    "alertRule": "",                             // Alert condition
    "backgroundColorRule": "",                   // Dynamic bg color
    "textColorRule": "",                         // Dynamic text color
    "mode": "ticker"                             // Display mode
}
```

---

## Known Issues & Limitations

### Security
- ⚠️ **eval() usage** for alert and color rules (ticker.js:611, 636, 645)
  - Code injection vulnerability
  - See IMPROVEMENTS.md § 1.1 for replacement plan

### Performance
- ⚠️ **Unbounded caches** may cause memory leaks in long sessions
  - See IMPROVEMENTS.md § 2.3 for bounded cache implementation
- ⚠️ **Multiple WebSocket connections** (one per ticker instance)
  - See IMPROVEMENTS.md § 2.4 for connection pooling plan

### Reliability
- ⚠️ **Fixed 5-second reconnection delay** hammers exchanges during outages
  - See IMPROVEMENTS.md § 2.5 for exponential backoff plan
- ⚠️ **No rate limiting** may cause API bans with many instances
  - See IMPROVEMENTS.md § 10.1 for rate limiting implementation

### User Experience
- ⚠️ **60-second fallback polling** is slow for crypto markets
  - See IMPROVEMENTS.md § 9.3 for adjusted defaults (10 seconds)
- ⚠️ **6-minute stale timeout** too long for detecting issues
  - See IMPROVEMENTS.md § 9.3 for adjusted defaults (90 seconds)
- ⚠️ **Missing data defaults to 0** causing confusion
  - See IMPROVEMENTS.md § 1.8 for better error handling
- ⚠️ **Silent 1:1 conversion fallback** misleads users
  - See IMPROVEMENTS.md § 1.9 for error indication plan

### Testing
- ⚠️ **Low test coverage** (~5%)
  - See IMPROVEMENTS.md § 4.1 for test expansion plan

---

## Development Workflow

### Building
```bash
npm install                    # Install dependencies
npm test                       # Run tests
npm run preview               # Start preview server (port 3000)
```

### Testing
```bash
npm test                       # Run Jest tests
npm run test:watch            # Watch mode
```

### Deployment
Plugin is packaged as `.streamDeckPlugin` file containing:
- manifest.json
- All JavaScript, HTML, CSS files
- Icons and assets

---

## Dependencies

### Runtime Dependencies
- **@microsoft/signalr** (^8.0.7): WebSocket library for generic provider
- **Stream Deck SDK**: Provided by Stream Deck application

### Development Dependencies
- **jest** (^29.7.0): Testing framework
- **jest-environment-jsdom** (^29.7.0): DOM environment for tests

---

## References

- **Official Documentation**: See README.md
- **Code Review**: See REVIEW.md (bugs fixed, architecture analysis)
- **Open Questions**: See QUESTIONS.md (20 design decision questions)
- **Improvement Plans**: See IMPROVEMENTS.md (40+ categorized suggestions)
- **Stream Deck SDK**: https://docs.elgato.com/sdk/
- **Binance API**: https://binance-docs.github.io/apidocs/spot/en/
- **Bitfinex API**: https://docs.bitfinex.com/docs/

---

**Last Updated**: 2025-10-05
**Branch**: direct_provider
**Status**: Ready for testing after bug fixes
