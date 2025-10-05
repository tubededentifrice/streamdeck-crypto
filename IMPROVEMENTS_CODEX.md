# Improvement Backlog

## High Priority
- **Replace direct `eval` with sandboxed rule evaluation** (code) — `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js:389-426` executes user-provided alert/color rules with `eval`, which is a major security and stability risk inside the plugin host. Introduce a constrained expression parser or whitelist-based evaluator (and mirror it in the PI) so malformed input cannot crash the action or run arbitrary code.
- **Fix preview candle generation volume bug** (code) — `com.courcelle.cryptoticker-dev.sdPlugin/dev/preview.js:11-26` writes `volumeQuote: volume`, but `volume` is undefined. This feeds `NaN` into `getCandlesNormalized`, breaking the preview server. Use the computed `volumeQuote` value and add a smoke test for `generateSampleCandles`.
- **Stop leaking globals in `applyDisplay`** (code) — `com.courcelle.cryptoticker-dev.sdPlugin/js/pi.js:452-455` iterates with an undeclared `i`, creating a global and skipping non-index keys on the HTMLCollection. Switch to a proper `for (let idx = 0; idx < elements.length; idx++)` loop (or `for...of`) so currency-related controls reliably hide/show.
- **Harden canvas rendering against missing ticker fields** (code) — `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js:350-449` assumes every numeric comes back from providers; when a feed hiccups we dereference `undefined` (e.g., `values.changeDailyPercent * 100`). Add guards/defaults before drawing so the key image doesn’t go blank on transient API issues.

## Medium Priority
- **Single source of truth for defaults** (code) — `defaultSettings` lives separately in `js/ticker.js:44-94` and `settingsConfig` defaults in `js/pi.js:14-116`. Extract a shared module so new settings stay in sync between runtime, PI, preview, and tests.
- **Graceful network error handling in PI** (code/functionality) — `js/pi.js:265-338` fetches providers/pairs/currencies without timeout or UI feedback; failures silently yield empty menus. Add try/catch + retries with user messaging so configuration works when the proxy or Binance API is slow.
- **Bound candle cache growth** (code) — `com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js:515-575` pushes every pair/interval combo into `candlesCache` forever. Add an LRU or TTL eviction (and expose cache stats for debugging) to avoid unbounded memory use when many keys are active.
- **Broaden automated tests** (code) — Current Jest suite only touches a few helpers (`__tests__/ticker.test.js`). Add coverage for provider registry failovers, `TickerSubscriptionManager` cache expiration, and PI helpers to catch regressions like the preview volume bug.
- **Alert rule UX** (functionality) — After introducing safe evaluation, surface a PI helper (expressions palette, validation state) so users can build rules without memorizing variables and so invalid snippets are caught before hitting the plugin.

## Low Priority
- **Improve pair selection UX** (functionality) — The PI dropdown in `index_pi.html` must render ~1500 Binance symbols with no search. Add filtering/favorites and remember recent pairs to speed setup.
- **Expose logging & diagnostics toggles** (functionality) — `loggingEnabled` in `js/ticker.js:64` is hardcoded. Allow enabling verbose logs per action via PI to simplify support without shipping debug builds.
- **Document & surface connection states** (functionality) — Connection indicators exist (`displayConnectionStatusIcon`), but users don’t know what LIVE/DETACHED/BACKUP mean. Update PI help text (`index_pi.html`) and README with explanations and troubleshooting steps.
