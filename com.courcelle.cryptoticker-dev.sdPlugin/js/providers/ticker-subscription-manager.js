(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory(
            require("./subscription-key"),
            require("./connection-states")
        );
    } else {
        root.CryptoTickerProviders = root.CryptoTickerProviders || {};
        const exports = factory(
            root.CryptoTickerProviders,
            root.CryptoTickerConnectionStates
        );
        root.CryptoTickerProviders.TickerSubscriptionManager = exports.TickerSubscriptionManager;
    }
}(typeof self !== "undefined" ? self : this, function (subscriptionKeyModule, connectionStatesModule) {
    const buildSubscriptionKey = subscriptionKeyModule.buildSubscriptionKey || subscriptionKeyModule;
    const ConnectionStates = connectionStatesModule || {
        LIVE: "live",
        DETACHED: "detached",
        BACKUP: "backup",
        BROKEN: "broken"
    };

    const DEFAULT_FALLBACK_POLL_INTERVAL_MS = 60000;
    const DEFAULT_STALE_TICKER_TIMEOUT_MS = 5 * 60 * 1000;

    function noop() {}

    function normalizeHandlers(handlers) {
        const h = handlers || {};
        return {
            onData: typeof h.onData === "function" ? h.onData : null,
            onError: typeof h.onError === "function" ? h.onError : null
        };
    }

    function copyParams(params) {
        const p = params || {};
        const fromCurrency = p.fromCurrency || null;
        const toCurrency = p.toCurrency || null;
        return {
            exchange: p.exchange,
            symbol: p.symbol,
            fromCurrency: fromCurrency,
            toCurrency: toCurrency
        };
    }

    class TickerSubscriptionManager {
        constructor(options) {
            const opts = options || {};
            this.logger = typeof opts.logger === "function" ? opts.logger : noop;
            this.fetchTickerFn = typeof opts.fetchTicker === "function" ? opts.fetchTicker : null;
            this.subscribeStreamingFn = typeof opts.subscribeStreaming === "function" ? opts.subscribeStreaming : null;
            this.unsubscribeStreamingFn = typeof opts.unsubscribeStreaming === "function" ? opts.unsubscribeStreaming : null;
            this.ensureConnectionFn = typeof opts.ensureConnection === "function" ? opts.ensureConnection : null;
            this.subscriptionKeyBuilder = typeof opts.buildSubscriptionKey === "function" ? opts.buildSubscriptionKey : buildSubscriptionKey;
            this.fallbackPollIntervalMs = typeof opts.fallbackPollIntervalMs === "number" ? opts.fallbackPollIntervalMs : DEFAULT_FALLBACK_POLL_INTERVAL_MS;
            this.staleTickerTimeoutMs = typeof opts.staleTickerTimeoutMs === "number" ? opts.staleTickerTimeoutMs : DEFAULT_STALE_TICKER_TIMEOUT_MS;
            this.connectionStates = ConnectionStates;

            this.entries = {};
            this.cache = {};
        }

        subscribe(params, handlers) {
            const normalizedHandlers = normalizeHandlers(handlers);
            const entry = this.getOrCreateEntry(params);
            entry.subscribers.push(normalizedHandlers);

            if (this.ensureConnectionFn) {
                try {
                    this.ensureConnectionFn();
                } catch (err) {
                    this.logger("TickerSubscriptionManager: ensureConnection error", err);
                }
            }

            this.ensureStreaming(entry);
            this.startFallbackPolling(entry);

            const self = this;
            if (this.fetchTickerFn) {
                this.fetchTickerFn(entry.params).then(function (ticker) {
                    self.applyTickerStateFromFetch(entry, ticker);
                    self.cache[entry.key] = ticker;
                    self.notifySubscribers(entry, ticker);
                }).catch(function (err) {
                    self.logger("TickerSubscriptionManager: fetchTicker error", err);
                    if (normalizedHandlers.onError) {
                        try {
                            normalizedHandlers.onError(err);
                        } catch (handlerErr) {
                            self.logger("TickerSubscriptionManager: onError handler threw", handlerErr);
                        }
                    }
                });
            }

            return {
                key: entry.key,
                unsubscribe: () => {
                    this.unsubscribe(entry.key, normalizedHandlers);
                }
            };
        }

        unsubscribe(key, subscriber) {
            const entry = this.entries[key];
            if (!entry) {
                return;
            }

            const idx = entry.subscribers.indexOf(subscriber);
            if (idx >= 0) {
                entry.subscribers.splice(idx, 1);
            }

            if (entry.subscribers.length === 0) {
                this.stopFallbackPolling(entry);
                this.stopStreaming(entry);
                delete this.entries[key];
            }
        }

        getCachedTicker(key) {
            return this.cache[key] || null;
        }

        handleStreamingUpdate(key, ticker) {
            const entry = this.entries[key];
            if (!entry) {
                return;
            }

            entry.lastStreamUpdate = Date.now();
            this.setEntryConnectionState(entry, this.connectionStates.LIVE, ticker);
            this.cache[key] = ticker;
            this.notifySubscribers(entry, ticker);
        }

        getEntry(key) {
            return this.entries[key] || null;
        }

        handleStreamingUpdateFromParts(exchange, symbol, fromCurrency, toCurrency, ticker) {
            const key = this.buildKey(exchange, symbol, fromCurrency, toCurrency);
            this.handleStreamingUpdate(key, ticker);
        }

        buildKey(exchange, symbol, fromCurrency, toCurrency) {
            return this.subscriptionKeyBuilder(exchange, symbol, fromCurrency, toCurrency);
        }

        buildKeyFromParams(params) {
            const p = params || {};
            return this.buildKey(p.exchange, p.symbol, p.fromCurrency, p.toCurrency);
        }

        forEachEntry(callback) {
            if (typeof callback !== "function") {
                return;
            }

            const keys = Object.keys(this.entries);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                callback(this.entries[key]);
            }
        }

        ensureStreaming(entry) {
            if (!entry || entry.streamingActive || !this.subscribeStreamingFn) {
                if (entry && !entry.streamingActive) {
                    entry.streamingActive = Boolean(this.subscribeStreamingFn);
                }
                return;
            }

            try {
                const result = this.subscribeStreamingFn(entry);
                if (result && typeof result.then === "function") {
                    result.then(() => {
                        entry.streamingActive = true;
                    }).catch((err) => {
                        entry.streamingActive = false;
                        this.logger("TickerSubscriptionManager: subscribeStreaming promise rejected", err);
                    });
                } else if (result === false) {
                    entry.streamingActive = false;
                } else {
                    entry.streamingActive = true;
                }
            } catch (err) {
                entry.streamingActive = false;
                this.logger("TickerSubscriptionManager: subscribeStreaming error", err);
            }
        }

        stopStreaming(entry) {
            if (!entry || !this.unsubscribeStreamingFn || !entry.streamingActive) {
                return;
            }

            try {
                const result = this.unsubscribeStreamingFn(entry);
                if (result && typeof result.then === "function") {
                    result.then(() => {
                        entry.streamingActive = false;
                    }).catch((err) => {
                        this.logger("TickerSubscriptionManager: unsubscribeStreaming promise rejected", err);
                    });
                } else {
                    entry.streamingActive = false;
                }
            } catch (err) {
                entry.streamingActive = false;
                this.logger("TickerSubscriptionManager: unsubscribeStreaming error", err);
            }
        }

        notifySubscribers(entry, ticker) {
            if (!entry) {
                return;
            }

            const subscribers = entry.subscribers;
            for (let i = 0; i < subscribers.length; i++) {
                const subscriber = subscribers[i];
                if (subscriber && subscriber.onData) {
                    try {
                        subscriber.onData(ticker);
                    } catch (err) {
                        this.logger("TickerSubscriptionManager: onData handler threw", err);
                    }
                }
            }
        }

        startFallbackPolling(entry) {
            if (!entry || entry.fallbackTimerId || !this.fetchTickerFn) {
                return;
            }

            const self = this;
            entry.fallbackTimerId = setInterval(function () {
                self.pollEntryIfNeeded(entry);
            }, this.fallbackPollIntervalMs);
        }

        stopFallbackPolling(entry) {
            if (!entry || !entry.fallbackTimerId) {
                return;
            }

            clearInterval(entry.fallbackTimerId);
            entry.fallbackTimerId = null;
        }

        pollEntryIfNeeded(entry) {
            if (!entry || !this.fetchTickerFn) {
                return;
            }

            if (!this.shouldPollEntry(entry)) {
                return;
            }

            const self = this;
            this.fetchTickerFn(entry.params).then(function (ticker) {
                self.applyTickerStateFromFetch(entry, ticker);
                self.cache[entry.key] = ticker;
                self.notifySubscribers(entry, ticker);
            }).catch(function (err) {
                self.logger("TickerSubscriptionManager: fallback fetch error", err);
                self.handleFetchError(entry);
            });
        }

        shouldPollEntry(entry) {
            if (!entry) {
                return false;
            }

            if (!entry.streamingActive) {
                return true;
            }

            const lastUpdate = entry.lastStreamUpdate || 0;
            if (!lastUpdate) {
                return true;
            }

            const elapsed = Date.now() - lastUpdate;
            return elapsed > this.staleTickerTimeoutMs;
        }

        getOrCreateEntry(params) {
            const key = this.buildKeyFromParams(params);
            let entry = this.entries[key];
            if (!entry) {
                entry = {
                    key: key,
                    params: copyParams(params),
                    subscribers: [],
                    streamingActive: false,
                    lastStreamUpdate: 0,
                    fallbackTimerId: null,
                    meta: {},
                    connectionState: null
                };
                this.entries[key] = entry;
            }

            return entry;
        }

        setEntryConnectionState(entry, state, ticker) {
            if (!entry) {
                return;
            }

            entry.connectionState = state;
            if (ticker && typeof ticker === "object") {
                ticker.connectionState = state;
            }
        }

        applyTickerStateFromFetch(entry, ticker) {
            if (!entry || !ticker) {
                return;
            }

            const state = ticker.connectionState || (entry.streamingActive ? this.connectionStates.LIVE : this.connectionStates.DETACHED);
            this.setEntryConnectionState(entry, state, ticker);
        }

        handleFetchError(entry) {
            if (!entry) {
                return;
            }

            this.setEntryConnectionState(entry, this.connectionStates.BROKEN);
            const key = entry.key;
            const cached = this.cache[key];
            if (cached) {
                cached.connectionState = this.connectionStates.BROKEN;
                this.notifySubscribers(entry, cached);
                return;
            }

            const fallbackTicker = {
                changeDaily: 0,
                changeDailyPercent: 0,
                last: 0,
                volume: 0,
                high: 0,
                low: 0,
                pair: entry.params.symbol,
                pairDisplay: entry.params.symbol,
                connectionState: this.connectionStates.BROKEN
            };

            this.cache[key] = fallbackTicker;
            this.notifySubscribers(entry, fallbackTicker);
        }
    }

    return {
        TickerSubscriptionManager: TickerSubscriptionManager
    };
}));
