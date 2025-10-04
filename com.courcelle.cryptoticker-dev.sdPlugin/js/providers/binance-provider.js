(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory(
            require("./provider-interface"),
            require("./generic-provider"),
            require("./ticker-subscription-manager")
        );
    } else {
        root.CryptoTickerProviders = root.CryptoTickerProviders || {};
        const exports = factory(
            root.CryptoTickerProviders,
            root.CryptoTickerProviders,
            root.CryptoTickerProviders
        );
        root.CryptoTickerProviders.BinanceProvider = exports.BinanceProvider;
    }
}(typeof self !== "undefined" ? self : this, function (providerInterfaceModule, genericModule, managerModule) {
    const ProviderInterface = providerInterfaceModule.ProviderInterface || providerInterfaceModule;
    const GenericProvider = genericModule.GenericProvider || genericModule;
    const TickerSubscriptionManager = managerModule.TickerSubscriptionManager || managerModule;

    const DEFAULT_WS_RECONNECT_DELAY_MS = 5000;

    function getWebSocketConstructor() {
        if (typeof WebSocket !== "undefined") {
            return WebSocket;
        }

        if (typeof window !== "undefined" && window.WebSocket) {
            return window.WebSocket;
        }

        if (typeof global !== "undefined" && global.WebSocket) {
            return global.WebSocket;
        }

        return null;
    }

    function toNumber(value) {
        const parsed = parseFloat(value);
        if (isNaN(parsed)) {
            return 0;
        }
        return parsed;
    }

    function mapIntervalToBinance(interval) {
        switch (interval) {
            case "MINUTES_1":
                return "1m";
            case "MINUTES_5":
                return "5m";
            case "MINUTES_15":
                return "15m";
            case "HOURS_1":
                return "1h";
            case "HOURS_6":
                return "6h";
            case "HOURS_12":
                return "12h";
            case "DAYS_1":
                return "1d";
            case "DAYS_7":
                return "1w";
            case "MONTHS_1":
                return "1M";
        }

        return null;
    }

    function safeClearTimeout(timerId) {
        if (timerId) {
            clearTimeout(timerId);
        }
    }

    class BinanceProvider extends ProviderInterface {
        constructor(options) {
            super(options);
            const opts = options || {};
            this.genericFallback = opts.genericFallback instanceof GenericProvider
                ? opts.genericFallback
                : new GenericProvider(options);

            this.restBaseUrl = typeof opts.binanceRestBaseUrl === "string" && opts.binanceRestBaseUrl.length > 0
                ? opts.binanceRestBaseUrl
                : "https://api.binance.com";
            this.wsBaseUrl = typeof opts.binanceWsBaseUrl === "string" && opts.binanceWsBaseUrl.length > 0
                ? opts.binanceWsBaseUrl
                : "wss://stream.binance.com:9443/ws";
            this.symbolOverrides = opts.binanceSymbolOverrides || {};
            this.wsReconnectDelayMs = typeof opts.retryDelayMs === "number" ? opts.retryDelayMs : DEFAULT_WS_RECONNECT_DELAY_MS;

            const managerOptions = {
                logger: (...args) => {
                    this.logger(...args);
                },
                fetchTicker: this.fetchTickerDirect.bind(this),
                subscribeStreaming: this.subscribeStream.bind(this),
                unsubscribeStreaming: this.unsubscribeStream.bind(this),
                fallbackPollIntervalMs: opts.fallbackPollIntervalMs,
                staleTickerTimeoutMs: opts.staleTickerTimeoutMs
            };

            this.subscriptionManager = new TickerSubscriptionManager(managerOptions);
        }

        getId() {
            return "BINANCE";
        }

        subscribeTicker(params, handlers) {
            return this.subscriptionManager.subscribe(params, handlers);
        }

        getCachedTicker(key) {
            const cached = this.subscriptionManager.getCachedTicker(key);
            if (cached) {
                return cached;
            }
            if (this.genericFallback && typeof this.genericFallback.getCachedTicker === "function") {
                return this.genericFallback.getCachedTicker(key);
            }
            return null;
        }

        ensureConnection() {
            const self = this;
            this.subscriptionManager.forEachEntry(function (entry) {
                self.subscriptionManager.ensureStreaming(entry);
            });
        }

        async fetchTicker(params) {
            try {
                return await this.fetchTickerDirect(params);
            } catch (err) {
                this.logger("BinanceProvider: direct fetch failed, using fallback", err);
                if (this.genericFallback && typeof this.genericFallback.fetchTicker === "function") {
                    return this.genericFallback.fetchTicker(params);
                }
                throw err;
            }
        }

        async fetchTickerDirect(params) {
            const symbol = this.resolveSymbol(params);
            if (!symbol) {
                throw new Error("BinanceProvider: unable to resolve symbol for " + (params.symbol || ""));
            }

            const url = this.buildRestUrl(symbol);
            try {
                const response = await fetch(url);
                if (!response || !response.ok) {
                    throw new Error("BinanceProvider: REST response not ok for " + symbol);
                }
                const json = await response.json();
                return this.transformRestTicker(json, params, symbol);
            } catch (err) {
                this.logger("BinanceProvider: REST fetch error", err);
                if (this.genericFallback && typeof this.genericFallback.fetchTicker === "function") {
                    return this.genericFallback.fetchTicker(params);
                }
                throw err;
            }
        }

        subscribeStream(entry) {
            if (!entry) {
                return false;
            }

            const meta = this.ensureEntryMeta(entry);
            meta.binanceSymbol = this.resolveSymbol(entry.params);
            if (!meta.binanceSymbol) {
                this.logger("BinanceProvider: cannot subscribe, unresolved symbol", entry.params);
                this.ensureGenericFallback(entry);
                return false;
            }

            const WebSocketCtor = getWebSocketConstructor();
            if (!WebSocketCtor) {
                this.logger("BinanceProvider: WebSocket not available in this environment");
                this.ensureGenericFallback(entry);
                return false;
            }

            if (meta.ws && meta.ws.readyState === WebSocketCtor.OPEN) {
                entry.streamingActive = true;
                return true;
            }

            this.connectWebSocket(entry, WebSocketCtor);
            return true;
        }

        unsubscribeStream(entry) {
            if (!entry) {
                return true;
            }

            const meta = this.ensureEntryMeta(entry);
            meta.wsClosedByUser = true;
            if (meta.ws) {
                try {
                    meta.ws.close();
                } catch (err) {
                    this.logger("BinanceProvider: error closing WebSocket", err);
                }
                meta.ws = null;
            }
            safeClearTimeout(meta.wsReconnectTimer);
            meta.wsReconnectTimer = null;
            entry.streamingActive = false;
            return true;
        }

        resolveSymbol(params) {
            if (!params) {
                return null;
            }

            const original = (params.symbol || "").toUpperCase();
            if (!original) {
                return null;
            }

            if (this.symbolOverrides && this.symbolOverrides[original]) {
                return (this.symbolOverrides[original] || "").toUpperCase();
            }

            if (original.endsWith("USD")) {
                return original.slice(0, -3) + "USDT";
            }

            return original;
        }

        buildRestUrl(symbol) {
            const base = this.restBaseUrl.replace(/\/$/, "");
            return base + "/api/v3/ticker/24hr?symbol=" + encodeURIComponent(symbol);
        }

        buildWsUrl(symbol) {
            const base = this.wsBaseUrl.replace(/\/$/, "");
            return base + "/" + symbol.toLowerCase() + "@ticker";
        }

        connectWebSocket(entry, WebSocketCtor) {
            const meta = this.ensureEntryMeta(entry);
            const symbol = meta.binanceSymbol;
            const url = this.buildWsUrl(symbol);
            const self = this;

            meta.wsClosedByUser = false;
            safeClearTimeout(meta.wsReconnectTimer);
            meta.wsReconnectTimer = null;

            const ctor = WebSocketCtor || getWebSocketConstructor();
            if (!ctor) {
                this.logger("BinanceProvider: WebSocket constructor unavailable");
                this.ensureGenericFallback(entry);
                return;
            }

            let ws;
            try {
                ws = new ctor(url);
            } catch (err) {
                this.logger("BinanceProvider: error creating WebSocket", err);
                return;
            }

            meta.ws = ws;
            entry.streamingActive = false;

            ws.onopen = function () {
                entry.streamingActive = true;
            };

            ws.onmessage = function (event) {
                try {
                    const data = JSON.parse(event.data);
                    const ticker = self.transformStreamTicker(data, entry, symbol);
                    self.subscriptionManager.handleStreamingUpdate(entry.key, ticker);
                } catch (err) {
                    self.logger("BinanceProvider: error parsing WebSocket message", err);
                }
            };

            ws.onerror = function (err) {
                self.logger("BinanceProvider: WebSocket error", err);
                entry.streamingActive = false;
            };

            ws.onclose = function () {
                entry.streamingActive = false;
                if (!meta.wsClosedByUser) {
                    self.scheduleReconnect(entry);
                }
            };
        }

        scheduleReconnect(entry) {
            const meta = this.ensureEntryMeta(entry);
            if (meta.wsClosedByUser) {
                return;
            }

            if (meta.wsReconnectTimer) {
                return;
            }

            const self = this;
            meta.wsReconnectTimer = setTimeout(function () {
                meta.wsReconnectTimer = null;
                const existingEntry = self.subscriptionManager.getEntry(entry.key);
                if (existingEntry) {
                    self.connectWebSocket(existingEntry);
                }
            }, this.wsReconnectDelayMs);
        }

        transformRestTicker(json, params, resolvedSymbol) {
            const pair = params && params.symbol ? params.symbol : resolvedSymbol;
            return {
                changeDaily: toNumber(json["priceChange"]),
                changeDailyPercent: toNumber(json["priceChangePercent"]),
                last: toNumber(json["lastPrice"]),
                volume: toNumber(json["volume"]),
                high: toNumber(json["highPrice"]),
                low: toNumber(json["lowPrice"]),
                pair: pair,
                pairDisplay: pair
            };
        }

        transformStreamTicker(json, entry, resolvedSymbol) {
            const params = entry ? entry.params : null;
            const pair = params && params.symbol ? params.symbol : resolvedSymbol;
            return {
                changeDaily: toNumber(json["p"] || json["priceChange"]),
                changeDailyPercent: toNumber(json["P"] || json["priceChangePercent"]),
                last: toNumber(json["c"] || json["lastPrice"]),
                volume: toNumber(json["v"] || json["volume"]),
                high: toNumber(json["h"] || json["highPrice"]),
                low: toNumber(json["l"] || json["lowPrice"]),
                pair: pair,
                pairDisplay: pair
            };
        }

        ensureEntryMeta(entry) {
            entry.meta = entry.meta || {};
            return entry.meta;
        }

        async fetchCandles(params) {
            const symbol = this.resolveSymbol(params);
            if (!symbol) {
                throw new Error("BinanceProvider: unable to resolve symbol for candles");
            }

            const interval = mapIntervalToBinance(params.interval);
            if (!interval) {
                throw new Error("BinanceProvider: unsupported interval " + params.interval);
            }

            const limit = Math.min(Math.max(parseInt(params.limit, 10) || 24, 1), 1000);
            const base = this.restBaseUrl.replace(/\/$/, "");
            const url = base + "/api/v3/klines?symbol=" + encodeURIComponent(symbol) + "&interval=" + encodeURIComponent(interval) + "&limit=" + limit;

            try {
                const response = await fetch(url);
                if (!response || !response.ok) {
                    throw new Error("BinanceProvider: candles response not ok");
                }

                const json = await response.json();
                if (!Array.isArray(json)) {
                    throw new Error("BinanceProvider: unexpected candles payload");
                }

                return json.map(function (item) {
                    return {
                        ts: Math.floor((item[0] || 0) / 1000),
                        open: toNumber(item[1]),
                        high: toNumber(item[2]),
                        low: toNumber(item[3]),
                        close: toNumber(item[4]),
                        volume: toNumber(item[5]),
                        volumeQuote: toNumber(item[7])
                    };
                });
            } catch (err) {
                this.logger("BinanceProvider: error fetching candles", err);
                if (this.genericFallback && typeof this.genericFallback.fetchCandles === "function") {
                    return this.genericFallback.fetchCandles(params);
                }
                throw err;
            }
        }
    }

    return {
        BinanceProvider: BinanceProvider
    };
}));
