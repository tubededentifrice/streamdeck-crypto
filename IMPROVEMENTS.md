# Crypto Ticker PRO - Improvement Plan

This document consolidates proposed improvements from code reviews and analysis. Each improvement includes rationale, specific implementation details, and risk considerations.

---

## 1. CRITICAL SECURITY & STABILITY

### 1.1 Replace `eval()` with Safe Expression Parser

**Why?**
- **Critical security vulnerability**: User-provided alert rules and color rules are executed via `eval()`, allowing arbitrary JavaScript code injection
- **Stability risk**: Malformed expressions crash the plugin without recovery
- **User safety**: Protects users from accidental or malicious code execution
- **Maintainability**: Explicit expression parser makes debugging easier

**What needs to be changed?**
- **Files**: `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js`
  - Lines 599: Alert rule evaluation
  - Lines 624: Background color rule evaluation
  - Lines 633: Text color rule evaluation
- **Implementation**:
  1. Add dependency on safe expression parser (e.g., `expr-eval`, `mathjs`, or custom parser)
  2. Create sandboxed evaluator class that exposes only allowed variables: `value`, `high`, `low`, `changeDaily`, `changeDailyPercent`, `volume`
  3. Whitelist safe comparison operators: `>`, `<`, `>=`, `<=`, `==`, `!=`, `&&`, `||`
  4. Replace all three `eval()` calls with sandboxed evaluator
  5. Add validation in property inspector (`js/pi.js`) to test expressions before saving
  6. Display user-friendly error messages for invalid expressions

**Risks & Considerations**:
- **Breaking change**: Existing rules using JavaScript features (functions, object access, etc.) will stop working
- **Migration**: Need to validate existing user rules and provide migration guide
- **Performance**: Expression parsing adds overhead (minimal, but test with high-frequency updates)
- **Testing**: Must verify all edge cases (divide by zero, null values, string operations)
- **Documentation**: Users need clear examples of valid expression syntax

---

### 1.2 Fix Global Variable Leaks in Property Inspector

**Why?**
- **Code quality**: `applyDisplay` and `extractSettings` introduce implicit globals (`i`, `k`) that pollute `window`
- **Bugs**: Global loop counters can be overwritten by other code paths, breaking DOM updates unpredictably
- **Reliability**: `for (i in Object.keys(elements))` iterates string indices from an intermediate array and will walk unexpected keys if prototypes are extended

**What needs to be changed?**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/pi.js`
  - Lines 467-472: The `applyDisplay` function
  - Lines 407-413: `extractSettings` loop copying legacy pair settings
- **Current code**:
  ```javascript
  applyDisplay: function(elements, display) {
      for(i in Object.keys(elements)) {
          elements[i].style.display = display;
      }
  },

  if (pairElements) {
      for (k in pairElements) {
          settings[k] = pairElements[k];
      }
  }
  ```
- **Fixed code**:
  ```javascript
  applyDisplay: function(elements, display) {
      for (const element of elements) {
          element.style.display = display;
      }
  },

  if (pairElements) {
      for (const [key, value] of Object.entries(pairElements)) {
          settings[key] = value;
      }
  }
  ```

**Risks & Considerations**:
- **Low risk**: Simple fix with no breaking changes
- **Testing**: Verify currency dropdown visibility logic works correctly across all providers
- **Audit**: Confirm no other helper relies on `window.i`/`window.k`

---

### 1.3 Fix Preview Canvas Volume Bug

**Why?**
- **Broken dev workflow**: Preview server renders `NaN` for candle volumes, breaking development/testing
- **Developer experience**: Makes visual debugging and screenshots impossible
- **Data integrity**: Reveals logic error in sample data generation

**What needs to be changed?**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/dev/preview.js`
  - Lines 11-26: `generateSampleCandles` function
- **Current issue**:
  ```javascript
  volumeQuote: volume  // 'volume' is undefined
  ```
- **Fix**: Use the computed `volumeQuote` value from earlier in the loop
- **Add test**: Create smoke test in `__tests__/ticker.test.js` to verify `generateSampleCandles` produces valid data

**Risks & Considerations**:
- **No risk**: Fixes existing bug, doesn't change production behavior
- **Testing**: Add test case for `getCandlesNormalized` with sample data
- **Documentation**: Consider documenting expected candle data format

---

### 1.4 Harden Canvas Rendering Against Missing Data

**Why?**
- **User experience**: Button goes blank when provider has transient issues
- **Robustness**: Plugin should degrade gracefully, not fail completely
- **Error recovery**: Users see "stale" or "error" state instead of blank button

**What needs to be changed?**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js`
  - Lines 350-449: Canvas rendering logic in `drawTicker` function
- **Implementation**:
  1. Add null/undefined checks before using ticker values
  2. Provide sensible defaults (0 for numbers, empty string for text)
  3. Display fallback text like "LOADING..." or "NO DATA" when values missing
  4. Show timestamp of last valid data when using stale values
  5. Add visual indicator (icon, color) for degraded state

**Risks & Considerations**:
- **UX decision**: Determine what to show when data is missing (blank vs. stale vs. error message)
- **Performance**: Check guards don't slow down frequent renders
- **State management**: Track "last known good" values for fallback
- **Testing**: Mock provider failures to verify graceful degradation

---

### 1.5 Stabilize Daily Change Rendering ✅ FIXED

**Status:** Fixed in direct_provider branch

**What was wrong:**
- **Incorrect precision**: Duplicate `Math.abs(changePercent) >= 10` checks prevented proper rendering of percentage changes ≥100%
- **Second condition never executed**: The `else if` with same condition as the first `if` made it unreachable

**What was changed:**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js:691-694`
- Fixed the precision thresholds: `>= 100` → 0 digits, `>= 10` → 1 digit, `< 10` → 2 digits

**Still TODO:**
1. Add validation: `const changePercentRaw = Number(values.changeDailyPercent)` and bail out unless `Number.isFinite(changePercentRaw)`
2. Only adjust fill colors and render text when valid numeric change is available (prevent NaN rendering)
3. Add unit tests for positive, negative, zero, and missing change scenarios

**Risks & Considerations**:
- **Backward compatibility**: Confirm existing presets rely on the intended precision behavior
- **Testing**: Add unit tests to prevent regressions
- **Localization**: Ensure formatting still works with locales that use different decimal separators

---

### 1.6 Prevent Division by Zero in High/Low Bar ✅ FIXED

**Status:** Fixed in direct_provider branch

**What was wrong:**
- When `values.high === values.low` (low volatility or data issues), division by zero produced `NaN`
- This broke canvas rendering of the high/low indicator bar

**What was changed:**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js:734-735`
- Added range check: `const range = values.high - values.low;`
- Safe calculation: `const percent = range > 0 ? (values.last - values.low) / range : 0.5;`
- Fallback positions cursor at center (50%) when range is zero

**Impact:** Canvas rendering no longer crashes with NaN values

---

### 1.7 Add Missing Volume Field in Bitfinex Candles ✅ FIXED

**Status:** Fixed in direct_provider branch

**What was wrong:**
- Bitfinex candles only included `volumeQuote` but lacked `volume` field
- Inconsistent with Binance provider which includes both fields
- Could cause issues if code expects `volume` to exist

**What was changed:**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/providers/bitfinex-provider.js:486-487`
- Added: `volume: toNumber(item[5])`
- Kept: `volumeQuote: toNumber(item[5])`

**Impact:** Ensures consistent candle data structure across all providers

---

### 1.8 Improve Missing Data Handling

**Why?**
- **Current behavior**: Missing ticker values default to 0, making button display "0.00"
- **User confusion**: "BTC/USD: 0.00" looks like price crash, not missing data
- **Better UX**: Show clear indication of missing/unavailable data

**What needs to be changed?**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js`
  - Lines 560-773: `updateCanvasTicker` function
- **Implementation**:
  1. Check if critical values are missing/invalid: `!values || !Number.isFinite(values.last)`
  2. Display "N/A", "---", or "LOADING..." when data missing
  3. Consider showing last known valid value with "STALE" indicator
  4. Add visual indicator (color, icon) for degraded state

**Example scenarios:**
- Exchange API temporary glitch returns incomplete data
- New trading pair with no historical data yet
- Network timeout returns partial response

**Risks & Considerations**:
- **UX decision**: What to show? Options: blank, "N/A", stale data with indicator
- **Performance**: Validation checks on every render
- **State management**: Need to track "last known good" values

---

### 1.9 Fix Currency Conversion Fallback Behavior

**Why?**
- **Current behavior**: When currency conversion fails, code defaults to rate = 1.0 (ticker.js:422)
- **Problem**: If EUR→USD conversion fails, displays EUR prices as if they were USD
- **User impact**: Misleading prices with no error indication

**Example:**
- User requests EUR display for BTC/USD
- Conversion API fails
- BTC shows as €60,000 when it should be ~€54,000 (1.0 fallback applied)
- User has no idea conversion failed

**What needs to be changed:**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js:415-423`
- **Implementation options**:
  1. Show error state/indicator when conversion unavailable
  2. Clearly label as original currency (e.g., "USD") when conversion fails
  3. Add "CONVERSION ERROR" text on button
  4. Use connection state icon to show BROKEN state

**Current code:**
```javascript
} catch (err) {
    if (typeof cacheEntry.rate === "number" && cacheEntry.rate > 0) {
        return cacheEntry.rate;  // Use cached rate
    }
    return 1;  // ⚠️ Silent 1:1 fallback
}
```

**Risks & Considerations**:
- **Error visibility**: Must be obvious to user without being intrusive
- **Cached rates**: Current code uses cached rate first (good), only 1.0 as last resort
- **Button space**: Limited room for error messages on small buttons

---

## 2. CODE ARCHITECTURE & MAINTAINABILITY

### 2.1 Single Source of Truth for Default Settings

**Why?**
- **Consistency**: Settings defaults are duplicated in `ticker.js:44-94` and `pi.js:14-116`
- **Maintenance burden**: Adding new settings requires updating multiple locations
- **Bug prevention**: Mismatched defaults cause confusing behavior
- **Type safety**: Shared module can define interfaces for TypeScript migration

**What needs to be changed?**
- **Create new file**: `com.courcelle.cryptoticker-dev.sdPlugin/js/default-settings.js`
- **Files to refactor**:
  - `js/ticker.js`: Import defaults from shared module (lines 93-144)
  - `js/pi.js`: Import defaults from shared module (lines 14-116)
  - `dev/preview.js`: Import defaults for preview rendering
  - `__tests__/ticker.test.js`: Import defaults for tests
- **Implementation**:
  1. Extract complete settings schema with defaults, types, and validation rules
  2. Export as module that works in both Node.js and browser contexts
  3. Update all consumers to import from shared module
  4. Add validation function to check settings against schema

**Risks & Considerations**:
- **Module loading**: Ensure shared module works in StreamDeck plugin environment (may need globals)
- **Build process**: May need bundler to handle module imports correctly
- **Migration**: Existing settings must remain compatible
- **Testing**: Update all tests to use shared defaults

---

### 2.2 Refactor Monolithic `ticker.js`

**Why?**
- **Maintainability**: 1200+ lines handling rendering, data fetching, WebSocket management, and business logic
- **Testing**: Monolithic file is difficult to unit test in isolation
- **Code navigation**: Hard to find specific functionality
- **Reusability**: Logic cannot be shared across plugin and preview modes

**What needs to be changed?**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js`
- **Proposed structure**:
  1. **`js/canvas-renderer.js`**: Extract lines 350-746 (canvas drawing logic)
     - `drawTicker()`, `drawCandles()`, `drawHighLowBar()`, formatting helpers
  2. **`js/settings-manager.js`**: Extract settings handling
     - Default settings, settings validation, settings change handlers
  3. **`js/alert-manager.js`**: Extract lines related to alert logic
     - Alert evaluation, alert arming/disarming, alert state management
  4. **`js/formatters.js`**: Extract formatting utilities
     - Price formatting, number formatting, date formatting
  5. **`js/ticker-state.js`**: Centralized state management
     - `contextDetails`, `contextSubscriptions`, `contextConnectionStates`, caches
  6. Keep main plugin lifecycle and StreamDeck integration in `ticker.js`

**Risks & Considerations**:
- **Breaking changes**: Ensure all dependencies are properly passed between modules
- **Global state**: Carefully manage shared state during refactor (consider dependency injection)
- **Testing**: Create tests for each new module before extraction
- **Gradual migration**: Can be done incrementally to reduce risk
- **StreamDeck compatibility**: Verify module loading works in plugin environment

---

### 2.3 Implement Bounded Cache with Eviction

**Priority:** 🟡 Medium (memory leak risk)

**Why?**
- **Memory leaks**: `candlesCache` and `conversionRatesCache` grow indefinitely
- **Long-running sessions**: Users with many buttons over days/weeks will accumulate GB of cached data
- **Performance degradation**: Large cache objects slow down JavaScript garbage collection

**What needs to be changed?**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js`
  - Lines 88-91: Cache declarations
  - Lines 515-575: Candles cache usage in `subscribeTicker`
  - Lines ~385-422: Conversion cache usage in `fetchConversionRate`
- **Implementation**:
  1. Add LRU (Least Recently Used) cache implementation or library
  2. Set max cache entries (e.g., 100 candle datasets, 50 conversion rates)
  3. Add TTL (Time To Live) for conversion rates (current: 60 min, expose as config)
  4. Add cache stats for debugging: hit rate, eviction count, memory estimate
  5. Expose cache configuration in settings (advanced users)
  6. Add periodic cleanup interval to remove expired entries

**Risks & Considerations**:
- **Cache misses**: Evicted data requires re-fetching (acceptable tradeoff)
- **Performance**: LRU operations have overhead (O(1) with proper implementation)
- **Configuration**: Determine appropriate cache sizes based on typical usage
- **Testing**: Test cache behavior under heavy load and long sessions
- **Metrics**: Log cache statistics to understand actual usage patterns

---

### 2.4 Implement WebSocket Connection Pooling

**Priority:** 🟢 Low (optimization, not critical)

**Why?**
- **Resource efficiency**: Currently each ticker instance creates its own WebSocket connection
- **Scalability**: User with 10 BTC/USD buttons = 10 separate connections to Binance
- **Rate limits**: Multiple connections increase risk of hitting exchange limits
- **Browser limits**: Most browsers limit concurrent WebSocket connections

**Current behavior:**
- Each call to `subscribeTicker()` → separate WebSocket
- 20 buttons tracking same pair → 20 identical WebSocket connections
- Each connection subscribes to same stream

**Proposed architecture:**
- **Connection pool manager** per exchange
- **Single shared WebSocket** per exchange for all subscriptions
- **Multiplexed subscriptions**: Track all symbol subscriptions on one connection
- **Demultiplex messages**: Route incoming data to correct subscribers

**What needs to be changed:**
- **Files**:
  - `js/providers/binance-provider.js:268-320`
  - `js/providers/bitfinex-provider.js:272-333`
  - New file: `js/providers/websocket-connection-pool.js`

**Implementation**:
1. Create `ConnectionPool` class managing one WebSocket per exchange
2. Update providers to request connection from pool instead of creating new
3. Add subscription tracking: `{ symbol: "BTCUSDT", subscribers: [context1, context2] }`
4. Implement message routing to all subscribers of a symbol
5. Lazy connection creation (only when first subscriber added)
6. Auto-close connection when last subscriber unsubscribes

**Benefits:**
- ✅ 10x-20x reduction in WebSocket connections
- ✅ Lower bandwidth usage (single stream per symbol, not per button)
- ✅ Reduced risk of rate limiting
- ✅ Better for mobile/low-power devices

**Trade-offs:**
- ⚠️ Increased complexity
- ⚠️ Single point of failure (one bad connection affects all buttons)
- ⚠️ More complex error handling and recovery

**Risks & Considerations**:
- **Migration**: Requires careful testing to ensure no regressions
- **Error isolation**: Need robust reconnection for shared connection
- **Message volume**: Single connection handles all symbols (higher throughput)
- **Backward compatibility**: Should be transparent to existing code

---

### 2.5 Implement Exponential Backoff for Reconnections

**Priority:** 🟡 Medium (prevents API hammering)

**Why?**
- **Fixed delay problem**: Current 5-second reconnection delay hammers exchange during outages
- **Example**: 10-minute outage = 120 reconnection attempts per ticker
- **Respectful behavior**: Exponential backoff reduces load on exchange infrastructure
- **Better success rate**: Gives transient issues time to resolve

**Current behavior:**
- Fixed 5-second delay: `DEFAULT_WS_RECONNECT_DELAY_MS = 5000`
- Used in: binance-provider.js:30, bitfinex-provider.js:30, generic-provider.js:31
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
  - `js/providers/binance-provider.js:322-340` (scheduleReconnect)
  - `js/providers/bitfinex-provider.js:410-428` (scheduleReconnect)
  - `js/providers/generic-provider.js:98-109` (onclose handler)

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

## 3. ERROR HANDLING & USER FEEDBACK

### 3.1 Graceful Network Error Handling in Property Inspector

**Why?**
- **User experience**: Failures when fetching provider lists/pairs result in empty dropdowns with no feedback
- **Debugging**: Users don't know if issue is network, proxy, or API rate limiting
- **Reliability**: Slow networks or temporary outages make plugin appear broken

**What needs to be changed?**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/pi.js`
  - Lines 265-338: Provider/pair/currency fetching functions
- **Implementation**:
  1. Wrap all `fetch()` calls in try-catch with timeout (e.g., 10 seconds)
  2. Add retry logic with exponential backoff (3 attempts)
  3. Show loading spinner while fetching data
  4. Display user-friendly error messages in UI:
     - "Loading pairs..." → "Failed to load pairs. Retrying..."
     - "Network error. Please check connection and try again."
  5. Add "Retry" button for manual retry
  6. Cache last successful fetch to show stale data with warning
  7. Log detailed errors to console for support/debugging

**Risks & Considerations**:
- **UX design**: Need to design error message UI in property inspector
- **Timeout tuning**: Balance between patience and responsiveness
- **Retry logic**: Avoid hammering APIs with rapid retries (respect rate limits)
- **Testing**: Mock network failures and slow responses
- **Internationalization**: Error messages should be localizable

---

### 3.2 Improved Error Handling Throughout Plugin

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

### 3.3 Add Logging and Diagnostics Configuration

**Why?**
- **Support**: Hard to debug issues without verbose logs from user sessions
- **Development**: Currently requires code changes to enable logging
- **Flexibility**: Different users need different log levels

**What needs to be changed?**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js`
  - Line 77: `loggingEnabled` is hardcoded to `false`
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/pi.js`
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

## 4. TESTING & QUALITY ASSURANCE

### 4.1 Expand Test Coverage

**Why?**
- **Current state**: Only 57 lines of tests in `__tests__/ticker.test.js` (~5% coverage)
- **Risk**: Refactoring and new features break existing functionality
- **Confidence**: Can't confidently make changes without tests
- **Regressions**: Bugs like the preview volume issue could have been caught

**What needs to be changed?**
- **File**: `__tests__/ticker.test.js` (expand significantly)
- **New test files to create**:
  1. `__tests__/canvas-renderer.test.js`: Test canvas drawing functions
  2. `__tests__/providers/binance-provider.test.js`: Test Binance WebSocket handling
  3. `__tests__/providers/bitfinex-provider.test.js`: Test Bitfinex WebSocket handling
  4. `__tests__/providers/provider-registry.test.js`: Test failover logic
  5. `__tests__/subscription-manager.test.js`: Test cache expiration
  6. `__tests__/pi-helpers.test.js`: Test property inspector utilities
  7. `__tests__/formatters.test.js`: Test price/number formatting
- **Coverage areas**:
  - WebSocket reconnection logic with exponential backoff
  - Provider failover when primary fails
  - Conversion rate caching and expiration
  - Alert rule evaluation (post-eval replacement)
  - Canvas rendering with various settings combinations
  - Settings validation and defaults
- **Target**: >80% code coverage

**Risks & Considerations**:
- **Effort**: Significant time investment to write comprehensive tests
- **Mocking**: Need to mock WebSocket, fetch, StreamDeck SDK, canvas
- **Test infrastructure**: May need to add testing utilities and helpers
- **CI/CD**: Tests should run automatically on every commit
- **Maintenance**: Tests need updates when code changes

---

### 4.2 Add Linting and Code Formatting

**Why?**
- **Consistency**: Code style is inconsistent across files (spacing, quotes, semicolons)
- **Quality**: Catch common mistakes (unused variables, missing semicolons, etc.)
- **Collaboration**: Easier for multiple developers to work on code
- **Automation**: Enforce standards without manual review

**What needs to be changed?**
- **New files to create**:
  - `.eslintrc.json`: ESLint configuration
  - `.prettierrc`: Prettier configuration
  - `.prettierignore`: Exclude generated files
- **Package.json additions**:
  - `eslint`, `prettier`, `eslint-config-prettier`, `husky`, `lint-staged`
- **Configuration**:
  - ESLint rules for StreamDeck plugin environment
  - Prettier rules for code formatting (2 spaces, single quotes, etc.)
  - Pre-commit hooks to auto-format and lint changed files
  - Git hooks with husky to prevent committing unlinted code
- **Scripts**: Add `npm run lint`, `npm run format`, `npm run lint:fix`

**Risks & Considerations**:
- **Initial effort**: Fixing existing violations will be time-consuming
- **Breaking changes**: Auto-formatting might make git history messy (can be mitigated)
- **Team alignment**: Team needs to agree on code style preferences
- **Editor integration**: Developers need to configure editors for consistency

---

## 5. PERFORMANCE OPTIMIZATION

### 5.1 Optimize Canvas Rendering

**Why?**
- **CPU usage**: Canvas redraws on every ticker update, even when values unchanged
- **Battery drain**: Unnecessary rendering wastes energy on laptops
- **Smoothness**: Rapid updates can cause visual glitches

**What needs to be changed?**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js`
  - Lines 321-746: Canvas rendering logic
- **Implementation**:
  1. Implement dirty checking:
     - Store previous values for each context
     - Compare new values with previous before redrawing
     - Skip render if no significant change (configurable threshold)
  2. Debounce rapid updates:
     - Queue render requests and execute at most once per frame (16ms)
     - Use `requestAnimationFrame` instead of immediate rendering
  3. Cache canvas operations:
     - Pre-render static elements (background, grid) to offscreen canvas
     - Only redraw dynamic text/data on top
     - Cache font measurements
  4. Optimize drawing operations:
     - Minimize canvas state changes (save/restore)
     - Batch similar operations
     - Avoid unnecessary clearRect calls

**Risks & Considerations**:
- **Complexity**: Dirty checking adds code complexity
- **Lag perception**: Debouncing might feel laggy if threshold too high
- **Memory**: Offscreen canvases use additional memory
- **Testing**: Verify rendering still works correctly with optimizations
- **Configuration**: May need to tune thresholds based on user feedback

---

### 5.2 WebSocket Connection Pooling

**Why?**
- **Resource waste**: Each button subscription creates its own WebSocket connection
- **Connection limits**: Browsers and exchanges limit concurrent connections
- **Overhead**: Multiple connections increase latency and bandwidth usage
- **Scalability**: Users with many buttons hit connection limits

**What needs to be changed?**
- **Files**:
  - `com.courcelle.cryptoticker-dev.sdPlugin/js/providers/binance-provider.js`
  - `com.courcelle.cryptoticker-dev.sdPlugin/js/providers/bitfinex-provider.js`
  - `com.courcelle.cryptoticker-dev.sdPlugin/js/providers/ticker-subscription-manager.js`
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

## 6. FEATURE ENHANCEMENTS

### 6.1 Add TypeScript Support

**Why?**
- **Type safety**: Catch type-related bugs at compile time
- **IDE support**: Better autocomplete, refactoring, and navigation
- **Documentation**: Types serve as inline documentation
- **Maintainability**: Easier to understand code and refactor safely

**What needs to be changed?**
- **All `.js` files** in `com.courcelle.cryptoticker-dev.sdPlugin/js/`
- **New files to create**:
  - `tsconfig.json`: TypeScript configuration
  - Type definition files for StreamDeck SDK (or use existing @types package)
- **Implementation approach**:
  1. Add TypeScript compiler and build tools to `package.json`
  2. Start with `.d.ts` declaration files for existing code (no conversion yet)
  3. Incrementally convert modules to TypeScript:
     - Start with utility modules (formatters, helpers)
     - Then providers (define provider interface)
     - Finally main plugin files
  4. Define key interfaces:
     - `Settings`: Plugin settings structure
     - `TickerData`: Ticker data from providers
     - `CandleData`: Candle data structure
     - `ProviderInterface`: Provider contract
  5. Update build process to compile TypeScript to JavaScript

**Risks & Considerations**:
- **Learning curve**: Team needs TypeScript knowledge
- **Build complexity**: Adds compilation step to development workflow
- **Migration effort**: Converting existing code is time-consuming
- **Strictness**: Need to decide on strict mode settings (balance safety vs. effort)
- **Dependencies**: Some libraries may lack type definitions
- **Incremental approach**: Can use TypeScript's `allowJs` for gradual migration

---

### 6.2 Add Module Bundler

**Why?**
- **Plugin size**: Files loaded individually increase plugin size
- **Load performance**: Many small files slower than one bundle
- **Tree shaking**: Remove unused code to reduce size
- **Optimization**: Minification and compression
- **Development**: Enable modern JavaScript features and imports

**What needs to be changed?**
- **New files to create**:
  - `webpack.config.js` or `rollup.config.js` or `esbuild.config.js`
  - Update `package.json` with build scripts
- **Build outputs**:
  - `plugin.bundle.js`: Main plugin code
  - `pi.bundle.js`: Property inspector code
  - `preview.bundle.js`: Preview server code
- **HTML files to update**:
  - `index.html`: Load plugin bundle
  - `index_pi.html`: Load PI bundle
  - `dev/preview.html`: Load preview bundle
- **Implementation**:
  1. Choose bundler (webpack = most features, rollup = smaller bundles, esbuild = fastest)
  2. Configure entry points for each bundle
  3. Set up development mode (source maps, watch mode)
  4. Set up production mode (minification, tree shaking)
  5. Update deployment process to use bundled files

**Risks & Considerations**:
- **Build complexity**: Adds significant complexity to build process
- **Debugging**: Source maps needed to debug bundled code
- **Development workflow**: Hot reload or watch mode needed for good DX
- **Compatibility**: Ensure bundled code works in StreamDeck environment
- **Dependencies**: Bundle size can grow with dependencies
- **Testing**: Tests may need to run on source files, not bundles

---

## 7. DOCUMENTATION & DEVELOPER EXPERIENCE

### 7.1 Document Connection States and Troubleshooting

**Why?**
- **User confusion**: Users see LIVE/DETACHED/BACKUP/BROKEN states but don't know what they mean
- **Support burden**: Repeated questions about connection issues
- **Self-service**: Users should be able to diagnose and fix common issues

**What needs to be changed?**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/index_pi.html`
  - Add help section or tooltips explaining states
- **File**: `README.md` or create `TROUBLESHOOTING.md`
  - Document connection state meanings
  - Common issues and solutions
  - Diagnostic steps
- **Documentation content**:
  - **LIVE**: Connected to primary provider with live data
  - **BACKUP**: Primary provider failed, using backup/fallback provider
  - **DETACHED**: Intentionally disconnected (settings changed, button removed)
  - **BROKEN**: Connection failed and retries exhausted
  - Add troubleshooting steps:
    - Check internet connection
    - Verify exchange is accessible (not blocked by firewall/VPN)
    - Check if API is experiencing outages
    - Try different provider
    - Check plugin logs for detailed errors

**Risks & Considerations**:
- **Low risk**: Documentation-only change
- **Maintenance**: Keep docs updated as states/behavior changes
- **Localization**: Consider translating for non-English users

---

### 7.2 Improve Build and Release Process

**Why?**
- **Manual process**: Current rsync and copy commands are error-prone
- **Version management**: Manual version bumping is easy to forget
- **Changelog**: No automated changelog generation
- **Consistency**: Manual process leads to inconsistent releases

**What needs to be changed?**
- **New files to create**:
  - `scripts/build.js`: Automated build script
  - `scripts/release.js`: Automated release script
  - `RELEASE_CHECKLIST.md`: Manual checklist for releases
- **Package.json scripts**:
  - `npm run build`: Build plugin for production
  - `npm run release:patch`: Bump patch version and release
  - `npm run release:minor`: Bump minor version and release
  - `npm run release:major`: Bump major version and release
- **Automation**:
  1. Version bumping in `manifest.json` and `package.json`
  2. Changelog generation from git commits (conventional commits)
  3. Build and bundle for distribution
  4. Create distribution `.streamDeckPlugin` file
  5. Git tag and push
  6. GitHub release creation (if applicable)
- **CI/CD**:
  - GitHub Actions or similar for automated testing
  - Automated builds on every commit
  - Automated releases on git tags

**Risks & Considerations**:
- **Initial setup**: Significant effort to create automation scripts
- **Testing**: Automation scripts themselves need testing
- **Git workflow**: Team needs to follow conventional commit format
- **Breaking**: Buggy release script could create bad releases
- **Rollback**: Need ability to roll back bad releases

---

## 8. USER EXPERIENCE IMPROVEMENTS

### 8.1 Improve Property Inspector UI

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

### 8.2 Improve Pair Selection UX

**Why?**
- **Scale**: Binance has ~1500 pairs, making dropdown unusable
- **Speed**: Users waste time scrolling through long list
- **Favorites**: Power users repeatedly select same pairs

**What needs to be changed?**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/index_pi.html`
  - Replace simple `<select>` with searchable dropdown
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/pi.js`
  - Add search/filter logic, favorites management
- **Implementation**:
  1. Add search input above pair dropdown
  2. Filter pairs as user types
  3. Add "Favorites" section at top of dropdown
  4. Add star/favorite button next to each pair
  5. Store favorites per provider
  6. Show recently used pairs
  7. Support keyboard navigation (arrow keys, enter)
  8. Add pair categories (BTC pairs, ETH pairs, Stablecoins, etc.)

**Risks & Considerations**:
- **Performance**: Filtering 1500 items in real-time needs optimization
- **Storage**: Favorites stored in plugin settings or separate storage
- **Sync**: Consider syncing favorites across devices (future enhancement)
- **UI**: Custom dropdown may have accessibility challenges

---

## 9. CONFIGURATION & DATA MANAGEMENT

### 9.1 Implement Configuration Validation

**Why?**
- **Crashes**: Invalid settings can crash the plugin
- **Silent failures**: Bad configuration leads to confusing behavior
- **Migration**: Old settings formats may be incompatible with new versions

**What needs to be changed?**
- **Create new file**: `com.courcelle.cryptoticker-dev.sdPlugin/js/settings-validator.js`
- **Files to update**:
  - `js/ticker.js`: Validate settings on load
  - `js/pi.js`: Validate before saving
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

### 9.2 Export/Import Configuration

**Why?**
- **Backup**: Users want to backup their settings
- **Sync**: Users want to share settings across devices
- **Version control**: Power users want to version settings in git
- **Migration**: Easy to transfer settings to new computer

**What needs to be changed?**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/index_pi.html`
  - Add "Export Settings" and "Import Settings" buttons
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/pi.js`
  - Implement export/import logic
- **Implementation**:
  1. Export settings to JSON or YAML file:
     - Include all button settings
     - Include plugin version for migration
     - Include timestamp for reference
  2. Import settings from file:
     - Validate file format and version
     - Migrate old format if needed
     - Apply settings to current action
  3. Add "Export All" feature (all buttons in profile)
  4. Add "Import to Multiple Buttons" feature
  5. Consider cloud backup (optional, with encryption)

**Risks & Considerations**:
- **File format**: Choose format that's human-readable and git-friendly
- **Privacy**: Settings may contain API keys or sensitive data (warn user)
- **Version compatibility**: Handle settings from different plugin versions
- **User education**: Document export/import workflow

---

### 9.3 Adjust Polling and Timeout Defaults

**Priority:** 🟡 Medium (affects user experience)

**Why?**
- **Current values may not be optimal for crypto**:
  - `fallbackPollIntervalMs`: 60 seconds (ticker.js:6)
  - `staleTickerTimeoutMs`: 6 minutes (ticker.js:7)
- **Crypto moves fast**: 60-second updates feel very slow for volatile markets
- **Stale data danger**: 6 minutes without updates before fallback triggers is too long

**Issues with current settings:**

**Fallback Polling (60 seconds):**
- When WebSocket fails, updates only every minute
- Crypto can move 5-10% in 60 seconds during volatile periods
- Users expecting "real-time" see outdated data
- Competitors update every 5-15 seconds

**Stale Timeout (6 minutes):**
- Users see "LIVE" status but data is actually stale for up to 6 minutes
- Could lead to bad trading decisions based on outdated prices
- By the time BROKEN state shows, opportunity/danger has passed

**Proposed changes:**
```javascript
const defaultConfig = {
    "fallbackPollIntervalMs": 10000,      // 10 sec instead of 60 sec
    "staleTickerTimeoutMs": 90000         // 90 sec instead of 6 min
};
```

**Rationale:**
- **10-second polling**: Balance between freshness and API load
  - Still slower than WebSocket (sub-second)
  - Fast enough for most trading decisions
  - Respects exchange rate limits (6 requests/min)

- **90-second stale timeout**: Faster failover to backup
  - If no WebSocket update in 90 sec, something is wrong
  - Triggers fallback polling quickly
  - Users see BACKUP state sooner

**Trade-offs:**
- ⚠️ More API requests (6x increase: 60s → 10s)
- ⚠️ More frequent fallback triggers (might be noisy)
- ✅ Better user experience during degraded service
- ✅ More accurate connection state reporting

**Configuration:**
- Make these configurable in advanced settings
- Allow users to tune for their needs:
  - Day traders: 5-second polling
  - Long-term holders: 60-second polling fine

**What needs to be changed:**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js:4-8`
- Update default values
- Consider adding UI controls in property inspector
- Document impact on API rate limits

---

### 9.4 Document Symbol Transformation Rules

**Priority:** 🟢 Low (documentation)

**Why?**
- **Hidden behavior**: Binance provider auto-converts USD pairs to USDT
- **Example**: User enters "BTC/USD" → actually gets "BTC/USDT" data
- **User confusion**: Prices might not match expectations
- **Debugging difficulty**: Users searching logs for "BTCUSD" won't find "BTCUSDT"

**Current transformation logic:**
- **Binance** (binance-provider.js:251-252):
  ```javascript
  if (original.endsWith("USD")) {
      return original.slice(0, -3) + "USDT";
  }
  ```

- **Bitfinex** (bitfinex-provider.js:257-264):
  ```javascript
  const sanitized = original.replace(/[:/]/g, "");
  const upper = sanitized.toUpperCase();
  const withoutLeadingT = upper.startsWith("T") ? upper.substring(1) : upper;
  return "t" + withoutLeadingT;
  ```

**Issues:**
- No user-facing documentation of these rules
- No indication in UI that symbol was transformed
- No way for user to see what symbol is actually being used
- Could lead to price confusion (USDT ≠ USD, usually within 1% but not always)

**Proposed solutions:**

**Option 1: Show transformed symbol in UI**
- Property inspector shows: "Symbol: BTCUSD → BTCUSDT (Binance)"
- Connection status tooltip shows actual symbol used
- Helps users understand what they're actually tracking

**Option 2: Documentation + Troubleshooting**
- Add help text in property inspector
- "Note: Binance converts USD pairs to USDT automatically"
- Link to documentation explaining why

**Option 3: User control**
- Add "Override Symbol" advanced setting
- Let users specify exact symbol if auto-detection wrong
- Use `binanceSymbolOverrides` / `bitfinexSymbolOverrides` config

**What needs to be changed:**
- **Documentation**:
  - Add section to README explaining symbol resolution
  - Document transformation rules per exchange
  - Provide troubleshooting guide for "wrong symbol" issues

- **UI Enhancement** (optional):
  - Show transformed symbol in property inspector
  - Add tooltip explaining transformation
  - Log transformation in debug mode

---

### 9.5 Clarify Alert Re-Arming Logic

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
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js:609-626`
- Initialize alert state on startup
- Add optional cooldown mechanism
- Consider user acknowledgement feature
- Document alert behavior clearly in help/docs

---

## 10. CONNECTION & PROVIDER IMPROVEMENTS

### 10.1 Add Rate Limiting Protection

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

### 10.2 Improve Connection Status Communication

**Priority:** 🔴 High (user experience critical)

**Why?**
- **Users need to know**: When connection degrades from LIVE → BACKUP
- **Trading implications**: Backup provider may have higher latency or stale data
- **Current limitation**: Only small icon shows state (if enabled)
- **User confusion**: No notification when failover occurs

**Current status display:**
- Small icon in corner of button (if `displayConnectionStatusIcon` enabled)
- States: LIVE, DETACHED, BACKUP, BROKEN
- No notifications or state change alerts
- Icon might be hard to see on small displays

**Proposed enhancements:**

**1. Transient State Change Notification:**
```javascript
function onConnectionStateChange(context, oldState, newState) {
    if (oldState === "live" && newState === "backup") {
        // Flash button briefly
        flashButton(context, "#FFA500", 2000);  // Orange flash for 2 sec

        // Optional: system notification
        if (settings.notifyOnDegradation) {
            showSystemNotification("Connection degraded to backup provider");
        }
    }
}
```

**2. Enhanced Visual Indicators:**
- **Color pulse**: Button border pulses when state changes
- **Temporary overlay**: Show "BACKUP MODE" text for 3 seconds
- **Icon animation**: Icon grows/shrinks briefly on state change
- **Background color**: Subtle background tint based on state
  - LIVE: no tint (normal)
  - BACKUP: very subtle yellow tint
  - BROKEN: subtle red tint

**3. Connection Status Details:**
- Add tooltip/hover info in property inspector
- Show: "Connected via Binance WebSocket (LIVE)" or "Using backup proxy (BACKUP)"
- Display last successful update timestamp
- Show retry countdown when BROKEN

**4. User Preferences:**
```javascript
// Add to settings
{
    "connectionStatusDisplay": "icon",  // Options: "icon", "text", "color", "all", "none"
    "notifyOnDegradation": false,       // System notification
    "flashOnStateChange": true          // Brief visual flash
}
```

**What needs to be changed:**
- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js`
  - Add state change detection
  - Implement visual feedback mechanisms
  - Add notification system

- **File**: `com.courcelle.cryptoticker-dev.sdPlugin/index_pi.html`
  - Add connection status display settings
  - Show current connection details in UI

- **Implementation**:
  1. Track previous connection state per context
  2. Detect state transitions (LIVE → BACKUP, BACKUP → BROKEN, etc.)
  3. Trigger appropriate visual feedback
  4. Add configurable notification preferences
  5. Consider temporary text overlay on button

**Risks & Considerations**:
- **Distraction**: Too much visual feedback might be annoying
- **Button space**: Limited room for additional indicators
- **Performance**: Animations might impact canvas rendering
- **User preference**: Make notifications opt-in to avoid surprises

---

## 11. ADVANCED FEATURES (FUTURE)

### 10.1 Multi-Currency Portfolio Tracking

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

### 10.2 Historical Data and Technical Indicators

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

## IMPLEMENTATION PRIORITY

### Phase 1: Critical Security & Stability (1-2 weeks)
1. Replace `eval()` with safe expression parser (1.1)
2. Fix global variable leak (1.2)
3. Fix preview canvas volume bug (1.3)
4. Harden canvas rendering (1.4)

### Phase 2: Code Quality & Testing (2-3 weeks)
1. Single source of truth for defaults (2.1)
2. Expand test coverage (4.1)
3. Add linting and formatting (4.2)
4. Implement configuration validation (9.1)

### Phase 3: Error Handling & UX (2-3 weeks)
1. Graceful network error handling (3.1)
2. Improved error handling throughout (3.2)
3. Add logging configuration (3.3)
4. Document connection states (7.1)

### Phase 4: Performance & Architecture (3-4 weeks)
1. Implement bounded cache (2.3)
2. Optimize canvas rendering (5.1)
3. WebSocket connection pooling (5.2)
4. Refactor monolithic ticker.js (2.2) - ongoing

### Phase 5: Build & Tooling (1-2 weeks)
1. Add module bundler (6.2)
2. Improve build and release process (7.2)
3. Add TypeScript support (6.1) - ongoing

### Phase 6: Enhanced UX (2-3 weeks)
1. Improve property inspector UI (8.1)
2. Improve pair selection UX (8.2)
3. Export/import configuration (9.2)

### Phase 7: Advanced Features (4-6 weeks)
1. Multi-currency portfolio tracking (10.1)
2. Historical data and technical indicators (10.2)

---

## SUMMARY

**Total Improvements Identified**: 25 main items across 10 categories

**Critical Priority**: 4 items (security and stability)
**High Priority**: 8 items (architecture, testing, error handling)
**Medium Priority**: 9 items (performance, UX, documentation)
**Low Priority**: 4 items (advanced features for future)

**Estimated Total Effort**: 20-30 weeks of focused development

**Key Risks**:
- Breaking changes requiring user migration
- Build complexity with TypeScript and bundler
- Testing infrastructure needs significant investment
- Large refactoring effort for monolithic files

**Success Metrics**:
- Zero `eval()` usage (security)
- >80% test coverage (quality)
- <5 sec property inspector load time (UX)
- <100 MB plugin memory footprint after 24h (performance)
- <10 support tickets per month about errors (reliability)
