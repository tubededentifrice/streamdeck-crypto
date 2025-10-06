# Crypto Ticker PRO - Improvement Plan

This document consolidates proposed improvements from code reviews and analysis. Each improvement includes rationale, specific implementation details, and risk considerations. Core runtime modules are now maintained in TypeScript (`.ts`), compiled to CommonJS for tests, and bundled into runtime assets (`plugin.bundle.js`, `pi.bundle.js`, `preview.bundle.js`) for the Stream Deck runtime, so the paths below reference the TypeScript sources.

---

## 2. CODE ARCHITECTURE & MAINTAINABILITY

### 2.5 Implement Exponential Backoff for Reconnections

**Priority:** 🟡 Medium (prevents API hammering)

**Why?**
- **Fixed delay problem**: Current 5-second reconnection delay hammers exchange during outages
- **Example**: 10-minute outage = 120 reconnection attempts per ticker
- **Respectful behavior**: Exponential backoff reduces load on exchange infrastructure
- **Better success rate**: Gives transient issues time to resolve

**Current behavior:**
- Fixed 5-second delay: `DEFAULT_WS_RECONNECT_DELAY_MS = 5000`
- Used in: `binance-provider.ts:30`, `bitfinex-provider.ts:30`, `generic-provider.ts:31`
- Reconnects indefinitely every 5 seconds

**Proposed behavior:**
```javascript
// Example exponential backoff
const attemptDelay = Math.min(
    initialDelay * Math.pow(2, attemptCount),
    maxDelay
);

// Attempt 1: 5 seconds
// Attempt 2: 10 seconds
// Attempt 3: 20 seconds
// Attempt 4: 40 seconds
// Attempt 5+: 60 seconds (capped)
```

**What needs to be changed:**
- **Files**:
  - `js/providers/binance-provider.ts:322-340` (scheduleReconnect)
  - `js/providers/bitfinex-provider.ts:410-428` (scheduleReconnect)
  - `js/providers/generic-provider.ts:98-109` (onclose handler)

**Implementation**:
1. Add `reconnectAttempts` counter to provider metadata
2. Calculate delay: `Math.min(baseDelay * Math.pow(2, attempts), maxDelay)`
3. Reset counter to 0 on successful connection
4. Optional: Add jitter to prevent thundering herd (±20% random variation)

**Configuration:**
```javascript
{
    reconnectBaseDelayMs: 5000,     // Start at 5 seconds
    reconnectMaxDelayMs: 60000,     // Cap at 60 seconds
    reconnectMaxAttempts: null,     // null = infinite
    reconnectJitter: true           // Add randomness
}
```

**Risks & Considerations**:
- **Slower recovery**: Takes longer to reconnect after short outage
  - Mitigation: Start with aggressive 5s, back off only after multiple failures
- **User perception**: Users might think plugin is "stuck"
  - Mitigation: Show retry countdown in connection status
- **Testing**: Need to simulate various outage scenarios

---

## 5. ERROR HANDLING & USER FEEDBACK

### 5.2 Improved Error Handling Throughout Plugin

**Why?**
- **Silent failures**: Many try-catch blocks log errors but don't provide user feedback
- **Poor UX**: Users don't know what went wrong or how to fix it
- **Support burden**: No actionable information for troubleshooting

**What needs to be changed?**
- **Files**: Multiple provider files, `ticker.js`, `pi.js`
- **Implementation**:
  1. Define error categories:
     - Network errors (timeout, offline)
     - API errors (rate limit, invalid response)
     - Configuration errors (invalid pair, unsupported exchange)
     - Data errors (parsing failure, validation error)
  2. Create error reporting system:
     - Show error state on StreamDeck button (icon, text, color)
     - Display detailed error in property inspector
     - Log errors with context (timestamp, settings, stack trace)
  3. Add recovery strategies:
     - Automatic retry with backoff
     - Fallback to backup provider
     - Use cached/stale data with indicator
  4. Create error codes for debugging (e.g., `NET_001`, `API_403`)

**Risks & Considerations**:
- **Error message design**: Must be helpful without being overwhelming
- **Button space**: Limited room to display errors on small StreamDeck buttons
- **Logging volume**: Too much logging can impact performance
- **Privacy**: Avoid logging sensitive data (API keys, user identifiers)
- **Testing**: Create comprehensive error injection tests

---

### 5.3 Add Logging and Diagnostics Configuration

**Why?**
- **Support**: Hard to debug issues without verbose logs from user sessions
- **Development**: Currently requires code changes to enable logging
- **Flexibility**: Different users need different log levels

**What needs to be changed?**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.ts`
  - Line 77: `loggingEnabled` is hardcoded to `false`
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/pi.ts`
  - Line 12: `loggingEnabled` is also hardcoded
- **Implementation**:
  1. Add "Enable Debugging" toggle in property inspector (advanced section)
  2. Add log level dropdown: ERROR, WARN, INFO, DEBUG, TRACE
  3. Store logging preference per action (or globally)
  4. Implement structured logging with levels
  5. Add "Export Logs" button to save logs to file
  6. Include diagnostic info: plugin version, OS, StreamDeck version, provider status

**Risks & Considerations**:
- **Performance**: Verbose logging can impact performance (use conditional logging)
- **Privacy**: Logs may contain sensitive price data or configuration
- **Storage**: Log files can grow large (implement rotation/limits)
- **UX**: Make logging UI discoverable but not distracting

---

### 6.2 WebSocket Connection Pooling

**Why?**
- **Resource waste**: Each button subscription creates its own WebSocket connection
- **Connection limits**: Browsers and exchanges limit concurrent connections
- **Overhead**: Multiple connections increase latency and bandwidth usage
- **Scalability**: Users with many buttons hit connection limits

**What needs to be changed?**
- **Files**:
  - `com.courcelle.cryptoticker-dev.sdPlugin/js/providers/binance-provider.ts`
  - `com.courcelle.cryptoticker-dev.sdPlugin/js/providers/bitfinex-provider.ts`
  - `com.courcelle.cryptoticker-dev.sdPlugin/js/providers/ticker-subscription-manager.ts`
- **Implementation**:
  1. Create connection pool manager per exchange
  2. Share single WebSocket per exchange across all subscriptions
  3. Multiplex subscriptions:
     - Track all symbol subscriptions on single connection
     - Send batch subscribe/unsubscribe messages
     - Demultiplex incoming messages to correct subscribers
  4. Handle connection lifecycle:
     - Lazy connection creation (only when first subscriber)
     - Keep-alive connection while subscribers exist
     - Close connection when last subscriber unsubscribes
     - Automatic reconnection for shared connection
  5. Update subscription manager to use pooled connections

**Risks & Considerations**:
- **Complexity**: Connection pooling is architecturally complex
- **Error handling**: Single connection failure affects all buttons
- **Recovery**: Need robust reconnection logic
- **Message volume**: Single connection receives all messages (higher throughput)
- **Testing**: Need to test with many simultaneous subscriptions
- **Migration**: Ensure backward compatibility during transition

---

## 8. DOCUMENTATION & DEVELOPER EXPERIENCE

### 8.1 Document Connection States and Troubleshooting

**Why?**
- **User confusion**: Users see LIVE/DETACHED/BACKUP/BROKEN states but don't know what they mean
- **Support burden**: Repeated questions about connection issues
- **Self-service**: Users should be able to diagnose and fix common issues

**What needs to be changed?**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/index_pi.html`
  - Add a collapsible panel below the dropdown allowing to select the state icon explaining the different states (same type of help as for the alerts, for example)
- **File**: `README.md`
  - Document connection state meanings
  - Common issues and solutions
  - Diagnostic steps
- **Documentation content**:
  - **LIVE**: Connected to primary provider with live data
  - **BACKUP**: Primary provider failed, using backup/fallback provider
  - **DETACHED**: The provider requests failed, using the legacy ticker proxy instead
  - **BROKEN**: Connection failed and retries exhausted
  - On the PI, show the corresponding icons: the corresponding logic to draw them will need to be moved to a place that is accessible by both the PI and the plugin, so we only define those icons in a single place
  - Add troubleshooting steps:
    - Check internet connection
    - Verify exchange is accessible (not blocked by firewall/VPN)
    - Check if API is experiencing outages
    - Try different provider
    - Check plugin logs for detailed errors

**Risks & Considerations**:
- **Maintenance**: Keep docs updated as states/behavior changes

## 9. USER EXPERIENCE IMPROVEMENTS

### 9.1 Improve Property Inspector UI

**Why?**
- **Overwhelming**: Dense form with 20+ options is intimidating for new users
- **Discoverability**: Advanced features are hidden in long list
- **Efficiency**: Power users spend time scrolling through options

**What needs to be changed?**
- **Files**:
  - `com.courcelle.cryptoticker-dev.sdPlugin/index_pi.html`: HTML structure
  - `com.courcelle.cryptoticker-dev.sdPlugin/js/pi.js`: UI logic
- **Implementation**:
  1. Add tabbed interface:
     - **Basic**: Pair, provider, display format
     - **Display**: Colors, fonts, layout options
     - **Alerts**: Alert rules and notifications
     - **Advanced**: Conversion, logging, connection settings
  2. Implement collapsible sections within tabs
  3. Add help tooltips (? icon) next to each setting
  4. Show live preview of button appearance as settings change
  5. Add "Quick Setup" wizard for first-time users
  6. Search/filter for settings in advanced mode

**Risks & Considerations**:
- **UI framework**: May need UI library for tabs (or custom CSS)
- **State management**: Tab state and preview updates add complexity
- **Performance**: Live preview updates need optimization
- **Accessibility**: Tabs and tooltips must be keyboard-accessible
- **Testing**: UI testing is more complex

---

### 10.2 Implement Configuration Validation (Enhanced)

**Why?**
- **Crashes**: Invalid settings can crash the plugin
- **Silent failures**: Bad configuration leads to confusing behavior
- **Migration**: Old settings formats may be incompatible with new versions

**What needs to be changed?**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/default-settings.js` (expand validation)
- **Files to update**:
  - `js/ticker.js`: Use enhanced validation
  - `js/pi.js`: Show validation errors in UI
- **Implementation**:
  1. Define JSON Schema for settings structure
  2. Add validation library (e.g., `ajv`) or write custom validator
  3. Validate all settings on plugin load:
     - Check types (string, number, boolean)
     - Check ranges (fontSize > 0, digits 0-10)
     - Check enums (exchange in allowed list)
     - Check required fields
  4. Provide graceful fallback to defaults for invalid values
  5. Add settings migration for version upgrades:
     - Detect old settings format
     - Transform to new format
     - Log migration for debugging
  6. Show validation errors in property inspector

**Risks & Considerations**:
- **Breaking changes**: Strict validation may reject previously working settings
- **User data**: Don't lose user settings, fall back to defaults with warning
- **Performance**: Validation on every setting load (should be fast)
- **Maintenance**: Schema needs updates when settings change

---

### 10.6 Clarify Alert Re-Arming Logic

**Priority:** 🟡 Medium (affects alerts feature)

**Why?**
- **Unclear behavior**: Alert arming logic may have edge cases
- **Current code** (ticker.js:609-626):
  ```javascript
  if (eval(settings["alertRule"])) {
      alertStatuses[context] = "on";
      if (alertArmed[context] != "off") {
          alertMode = true;
          // Show alert (swap colors)
      }
  } else {
      alertStatuses[context] = "off";
      alertArmed[context] = "on";  // Re-arm
  }
  ```

**Questions that need answering:**
1. When does alert initially arm? (First time condition becomes false?)
2. What happens on reconnection? (Does armed state persist?)
3. What if alert condition is true at plugin start? (Shows alert or waits?)
4. How does user "acknowledge" alert? (By clicking button? Automatic?)
5. Can alert fire multiple times in same session?

**Potential issues:**

**Scenario 1: Plugin starts while alert active**
- User sets alert: "BTC > $70,000"
- Plugin starts when BTC = $71,000
- Alert condition TRUE immediately
- Is `alertArmed[context]` undefined? (not "off")
- Does alert fire immediately or wait for price to drop first?

**Scenario 2: Reconnection during alert**
- Alert fires, user doesn't notice
- WebSocket disconnects and reconnects
- Alert state persists in memory
- Does alert show again on reconnection?

**Scenario 3: Rapid oscillation**
- Price hovers around alert threshold: $69,999 ↔ $70,001
- Alert fires, then immediately re-arms, then fires again
- Could cause alert spam or missed alerts

**Proposed improvements:**

**1. Initialize alert state on startup:**
```javascript
// On plugin start or settings change
if (alertArmed[context] === undefined) {
    alertArmed[context] = "on";  // Default to armed
}
```

**2. Add alert cooldown:**
```javascript
const ALERT_COOLDOWN_MS = 60000;  // 1 minute
const alertLastFired = {};

if (eval(settings["alertRule"])) {
    const now = Date.now();
    const lastFired = alertLastFired[context] || 0;
    if (now - lastFired > ALERT_COOLDOWN_MS && alertArmed[context] !== "off") {
        alertMode = true;
        alertLastFired[context] = now;
        // Optionally: auto-disarm until user clicks button
    }
}
```

**3. Add user acknowledgement:**
- On `onKeyDown`, if alert is showing: `alertArmed[context] = "off"`
- This lets user "dismiss" alert by clicking button
- Alert won't fire again until condition becomes false then true again

**4. Document alert lifecycle clearly:**
```
1. Alert starts ARMED
2. When condition TRUE + ARMED → fire alert
3. After firing → stays ARMED (shows alert until condition FALSE)
4. When condition FALSE → RE-ARM
5. Cycle repeats
```

**What needs to be changed:**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/alert-manager.js` (evaluateAlert function)
- Initialize alert state on startup
- Add optional cooldown mechanism
- Consider user acknowledgement feature
- Document alert behavior clearly in help/docs

---

## 11. CONNECTION & PROVIDER IMPROVEMENTS

### 11.1 Add Rate Limiting Protection

**Priority:** 🟡 Medium (prevents API bans)

**Why?**
- **Risk of rate limits**: Direct API calls have no rate limit protection
- **Exchange limits**: Binance = 1200 req/min, Bitfinex = 90 req/min (per IP)
- **Corporate networks**: Multiple users behind same NAT IP share limits
- **Consequences**: IP ban, degraded service, broken plugin

**Current behavior:**
- No request throttling or queuing
- Multiple ticker instances = multiple parallel requests
- Rapid reconnection attempts during outages
- No handling of 429 (Too Many Requests) responses

**Proposed implementation:**

**1. Request Queue per Exchange:**
```javascript
class RateLimiter {
    constructor(maxRequests, timeWindowMs) {
        this.maxRequests = maxRequests;
        this.timeWindowMs = timeWindowMs;
        this.queue = [];
        this.inFlight = 0;
    }

    async execute(fn) {
        // Wait if limit reached
        while (this.inFlight >= this.maxRequests) {
            await this.sleep(100);
        }

        this.inFlight++;
        try {
            return await fn();
        } finally {
            this.inFlight--;
        }
    }
}
```

**2. Detect and Handle 429 Responses:**
```javascript
async function fetchWithRateLimit(url) {
    const response = await fetch(url);

    if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : 60000;

        this.log(`Rate limited, waiting ${delayMs}ms`);
        await this.sleep(delayMs);
        return fetchWithRateLimit(url);  // Retry
    }

    return response;
}
```

**3. Per-Provider Rate Limits:**
```javascript
const RATE_LIMITS = {
    BINANCE: { requests: 20, windowMs: 60000 },      // 20/min (conservative)
    BITFINEX: { requests: 15, windowMs: 60000 },     // 15/min (conservative)
    GENERIC: { requests: 10, windowMs: 60000 }       // 10/min for proxy
};
```

**What needs to be changed:**
- **New file**: `js/providers/rate-limiter.js`
- **Files to update**:
  - `js/providers/binance-provider.js`: Wrap REST calls
  - `js/providers/bitfinex-provider.js`: Wrap REST calls
  - `js/providers/generic-provider.js`: Wrap REST calls

**Implementation:**
1. Create RateLimiter class with configurable limits
2. Wrap all `fetch()` calls with rate limiter
3. Add retry logic for 429 responses with exponential backoff
4. Log rate limit events for monitoring
5. Show warning in UI when rate limit hit
6. Consider adding rate limit stats to connection status

**Risks & Considerations**:
- **Queuing delay**: Users might see slower initial load
- **Complexity**: Adds overhead to every request
- **Configuration**: Limits might need tuning based on actual usage
- **Testing**: Need to simulate rate limit scenarios

---

## 12. ADVANCED FEATURES (FUTURE)

### 12.1 Multi-Currency Portfolio Tracking

**Why?**
- **User need**: Users want to track total portfolio value across multiple assets
- **Efficiency**: Reduce number of buttons needed
- **Insights**: Show overall portfolio performance

**What needs to be changed?**
- **Significant new feature**: Would require new action type or mode
- **Files to create**:
  - Portfolio manager module
  - Portfolio UI in property inspector
  - Portfolio rendering in canvas
- **Implementation**:
  1. Add "Portfolio Mode" toggle in settings
  2. Allow selecting multiple pairs per button
  3. Specify holdings (amount of each asset)
  4. Calculate and display:
     - Total portfolio value
     - Individual asset percentages
     - Total gain/loss (% and value)
     - 24h portfolio change
  5. Rotation mode: cycle through assets every N seconds
  6. Pie chart visualization option

**Risks & Considerations**:
- **Scope**: Large feature requiring significant development time
- **Complexity**: Portfolio calculations, multiple data sources
- **UI**: Limited space on button for complex data
- **Storage**: Need to store holdings data securely
- **Privacy**: Users may not want to expose holdings

---

### 12.2 Historical Data and Technical Indicators

**Why?**
- **User demand**: Traders want to see trends and indicators
- **Decision making**: Technical analysis helps trading decisions
- **Differentiation**: Advanced feature competitors may not have

**What needs to be changed?**
- **Major feature**: Requires significant new code
- **Files to create**:
  - Historical data fetcher
  - Indicator calculation library
  - Chart rendering enhancements
- **Implementation**:
  1. Fetch more historical data (currently limited)
  2. Add zoom controls for candle view (1h, 4h, 1d, 1w)
  3. Calculate technical indicators:
     - Moving averages (SMA, EMA)
     - RSI (Relative Strength Index)
     - MACD
     - Bollinger Bands
  4. Overlay indicators on candle chart
  5. Add volume bars below candles
  6. Support scrolling through historical data

**Risks & Considerations**:
- **Data volume**: Historical data requires more API calls and storage
- **Performance**: Indicator calculations and rendering need optimization
- **UI**: Limited space for complex charts
- **Provider support**: Not all providers offer historical data APIs
- **Cost**: Some APIs charge for historical data access

---
