# Architecture

Crypto Ticker PRO has three browser-style entry points built from the same TypeScript modules:

- `js/plugin.bundle.js` runs the action lifecycle and renders Stream Deck keys.
- `js/pi.bundle.js` runs the property inspector.
- `js/preview.bundle.js` supports the local browser preview.

TypeScript compiles to adjacent CommonJS JavaScript for Jest. esbuild then bundles the entry modules for the Stream Deck runtime. The generated `.js` files and bundles are tracked and must stay synchronized with their `.ts` sources.

## Runtime flow

1. Stream Deck sends `willAppear` with action settings.
2. `ticker.ts` normalizes settings, stores context state, and creates a provider subscription.
3. The provider starts direct streaming where supported and performs an initial REST fetch so the key can paint immediately.
4. Incoming data is converted when requested, sanitized, cached as the last known good ticker, and passed to `canvas-renderer.ts`.
5. `willDisappear` unsubscribes and removes all context-owned state. Hidden actions must never remain in the five-minute refresh loop.

The property inspector persists settings with `setSettings`. Stream Deck then sends `didReceiveSettings` to the plugin; a separate `sendToPlugin` message is not needed for settings changes.

## Module ownership

- `ticker.ts`: Stream Deck events, conversion, candles, and rendering orchestration.
- `settings-manager.ts` / `default-settings.ts`: settings schema, normalization, defaults, and context refresh.
- `ticker-state.ts`: context details, subscription handles, connection state, conversion/candle caches, and last-good values.
- `canvas-renderer.ts`: key rendering only; it does not own provider or lifecycle state.
- `alert-manager.ts`: per-context armed/status state and alert palette inversion.
- `expression-evaluator.ts`: strict, cached parsing/evaluation for alert and color rules.
- `providers/provider-registry.ts`: provider construction and exchange lookup.
- `providers/ticker-subscription-manager.ts`: subscriber fan-out, initial/fallback fetches, stale detection, and polling ownership.
- `providers/websocket-connection-pool.ts`: one multiplexed socket per direct exchange provider.

## Providers and fallback

Binance and Bitfinex prefer a shared direct WebSocket, use their direct REST API when streaming is unavailable or stale, and fall back to the generic proxy when direct requests fail. YFinance currently uses proxy-backed REST polling. `GenericProvider` owns proxy SignalR subscriptions and proxy REST requests.

REST requests have a finite deadline so an unreachable exchange cannot permanently block initial rendering or fallback polling. The property inspector applies the same rule before falling back from direct pair discovery to the proxy list.

Connection states describe the source of the current update:

| State      | Meaning                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------- |
| `LIVE`     | Direct exchange WebSocket data.                                                          |
| `DETACHED` | Direct provider REST data; no live socket update is being used.                          |
| `BACKUP`   | Legacy ticker proxy data after direct provider failure, or the proxy-only YFinance path. |
| `BROKEN`   | No provider returned usable data.                                                        |

The renderer may continue showing a last-known-good value as stale while the connection state is degraded. Connection state and data freshness are related but intentionally separate.

## Subscription invariants

- A context owns at most one subscription handle.
- Matching exchange, symbol, and source currency reuse the current subscription.
- Changing that key unsubscribes before replacing it.
- Multiple contexts for one provider symbol share the provider subscription and pooled WebSocket.
- Initial and fallback REST requests for one subscription never overlap.
- Late async results must not notify or reactivate an entry that was removed.
- Settings revisions prevent an older fetch or conversion from repainting a newly configured action.
- Socket events are accepted only from the pool's current socket; late events from replaced sockets are ignored.
- A socket that never opens is closed and retried instead of remaining permanently stuck in `CONNECTING`.

## Settings and conversion

All settings entering the runtime or property inspector pass through `applyDefaults`. Invalid known values fall back to schema defaults; unknown keys are retained for forward compatibility.

Currency conversion rates are cached for one hour and concurrent requests are coalesced. If refresh fails, an existing cached rate may be used. If no rate has ever been obtained, the ticker renders the configured conversion-error state instead of silently presenting an unconverted value.

## Rules and alerts

Rules support numeric and string literals, listed variables, `+ - * / %`, comparisons, `&&` / `||` (plus legacy `and` / `or`), unary `!` / `not`, and ternary expressions. The evaluator rejects member access, function calls, arrays, assignments, and unsupported operators. Runtime context values are copied into a null-prototype allowlisted object before evaluation.

Alerts start armed. A true alert rule in ticker mode swaps the foreground and background colors. Pressing the key while the alert is active disarms it without changing view. A false evaluation rearms the alert; removing the action clears its alert state.
