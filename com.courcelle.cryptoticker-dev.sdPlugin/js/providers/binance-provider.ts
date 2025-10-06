/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-this-alias, no-var */
// @ts-nocheck
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory(
            require("./provider-interface"),
            require("./generic-provider"),
            require("./ticker-subscription-manager"),
            require("./connection-states"),
            require("./websocket-connection-pool")
        );
    } else {
        root.CryptoTickerProviders = root.CryptoTickerProviders || {};
        const exports = factory(
            root.CryptoTickerProviders,
            root.CryptoTickerProviders,
            root.CryptoTickerProviders,
            root.CryptoTickerConnectionStates,
            root.CryptoTickerProviders
        );
        root.CryptoTickerProviders.BinanceProvider = exports.BinanceProvider;
    }
}(typeof self !== "undefined" ? self : this, function (providerInterfaceModule, genericModule, managerModule, connectionStatesModule, poolModule) {
    const ProviderInterface = providerInterfaceModule.ProviderInterface || providerInterfaceModule;
    const GenericProvider = genericModule.GenericProvider || genericModule;
    const TickerSubscriptionManager = managerModule.TickerSubscriptionManager || managerModule;
    const ConnectionStates = connectionStatesModule || {
        LIVE: "live",
        DETACHED: "detached",
        BACKUP: "backup",
        BROKEN: "broken"
    };
    const WebSocketConnectionPool = poolModule.WebSocketConnectionPool || poolModule;

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

    function toPercent(value) {
        return toNumber(value) / 100;
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

            this.wsRequestId = 0;
            // Binance multi-stream socket; pool keeps connection alive and muxes symbols.
            this.webSocketPool = new WebSocketConnectionPool({
                logger: (...args) => {
                    this.logger(...args);
                },
                reconnectDelayMs: this.wsReconnectDelayMs,
                createWebSocket: () => {
                    const WebSocketCtor = getWebSocketConstructor();
                    if (!WebSocketCtor) {
                        this.logger("BinanceProvider: WebSocket not available in this environment");
                        return null;
                    }

                    const url = this.wsBaseUrl.replace(/\/$/, "");
                    try {
                        return new WebSocketCtor(url);
                    } catch (err) {
                        this.logger("BinanceProvider: error creating pooled WebSocket", err);
                        return null;
                    }
                },
                subscribe: (ws, symbol) => {
                    this.sendBinanceSubscription(ws, symbol, true);
                },
                unsubscribe: (ws, symbol) => {
                    this.sendBinanceSubscription(ws, symbol, false);
                },
                handleMessage: (event, helpers) => {
                    this.handlePoolMessage(event, helpers);
                },
                onError: (err) => {
                    this.logger("BinanceProvider: pooled WebSocket error", err);
                },
                onClose: () => {
                    this.wsRequestId = 0;
                }
            });
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
                const ticker = this.transformRestTicker(json, params, symbol);
                ticker.connectionState = ConnectionStates.DETACHED;
                return ticker;
            } catch (err) {
                this.logger("BinanceProvider: REST fetch error", err);
                if (this.genericFallback && typeof this.genericFallback.fetchTicker === "function") {
                    const fallbackTicker = await this.genericFallback.fetchTicker(params);
                    if (fallbackTicker && typeof fallbackTicker === "object" && !fallbackTicker.connectionState) {
                        fallbackTicker.connectionState = ConnectionStates.BACKUP;
                    }
                    return fallbackTicker;
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
                return false;
            }

            const subscriptionHandle = this.webSocketPool.subscribe(meta.binanceSymbol, {
                context: entry,
                onData: (payload) => {
                    const ticker = this.transformStreamTicker(payload, entry, meta.binanceSymbol);
                    this.subscriptionManager.handleStreamingUpdate(entry.key, ticker);
                },
                onSubscribed: () => {
                    entry.streamingActive = true;
                },
                onDisconnected: () => {
                    entry.streamingActive = false;
                },
                onError: (err) => {
                    this.logger("BinanceProvider: subscription error", err);
                }
            });

            if (!subscriptionHandle) {
                entry.streamingActive = false;
                return false;
            }

            meta.poolSubscription = subscriptionHandle;
            entry.streamingActive = true;
            return true;
        }

        unsubscribeStream(entry) {
            if (!entry) {
                return true;
            }

            const meta = this.ensureEntryMeta(entry);
            if (meta.poolSubscription && typeof meta.poolSubscription.unsubscribe === "function") {
                meta.poolSubscription.unsubscribe();
            }
            meta.poolSubscription = null;
            entry.streamingActive = false;
            return true;
        }

        // Binance tickers usually end with USDT; remap PI-friendly USD symbols to live endpoints.
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

        sendBinanceSubscription(ws, symbol, subscribe) {
            if (!ws || !symbol) {
                return;
            }

            const streamName = symbol.toLowerCase() + "@ticker";
            const payload = {
                method: subscribe ? "SUBSCRIBE" : "UNSUBSCRIBE",
                params: [streamName],
                id: this.nextWsRequestId()
            };

            try {
                ws.send(JSON.stringify(payload));
            } catch (err) {
                this.logger("BinanceProvider: error sending subscription message", err);
            }
        }

        nextWsRequestId() {
            this.wsRequestId += 1;
            if (this.wsRequestId > 1000000) {
                this.wsRequestId = 1;
            }
            return this.wsRequestId;
        }

        handlePoolMessage(event, helpers) {
            if (!event) {
                return;
            }

            let message = event.data;
            if (!message) {
                return;
            }

            if (typeof message === "string") {
                try {
                    message = JSON.parse(message);
                } catch (err) {
                    this.logger("BinanceProvider: failed to parse WebSocket message", err);
                    return;
                }
            }

            if (!message) {
                return;
            }

            if (Array.isArray(message)) {
                return;
            }

            if (message.error) {
                this.logger("BinanceProvider: WebSocket error message", message.error);
                return;
            }

            if (typeof message.result !== "undefined") {
                return;
            }

            let payload = message;
            if (message.data && typeof message.data === "object") {
                payload = message.data;
            }

            if (!payload || typeof payload !== "object") {
                return;
            }

            const symbol = (payload.s || payload.symbol || "").toUpperCase();
            if (!symbol) {
                return;
            }

            // Mark stream healthy so pool does not re-request subscription on reconnect.
            helpers.markSubscribed(symbol);
            helpers.dispatch(symbol, payload, message);
        }

        transformRestTicker(json, params, resolvedSymbol) {
            const pair = params && params.symbol ? params.symbol : resolvedSymbol;
            return {
                changeDaily: toNumber(json["priceChange"]),
                changeDailyPercent: toPercent(json["priceChangePercent"]),
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
                changeDailyPercent: toPercent(json["P"] || json["priceChangePercent"]),
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
