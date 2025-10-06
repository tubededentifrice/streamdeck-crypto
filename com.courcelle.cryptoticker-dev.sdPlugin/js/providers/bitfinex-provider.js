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
        root.CryptoTickerProviders.BitfinexProvider = exports.BitfinexProvider;
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

    function toNumber(val) {
        const parsed = parseFloat(val);
        if (isNaN(parsed)) {
            return 0;
        }
        return parsed;
    }

    function mapIntervalToBitfinex(interval) {
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
                return "1D";
            case "DAYS_7":
                return "1W";
            case "MONTHS_1":
                return "1M";
        }

        return null;
    }

    class BitfinexProvider extends ProviderInterface {
        constructor(options) {
            super(options);
            const opts = options || {};
            this.genericFallback = opts.genericFallback instanceof GenericProvider
                ? opts.genericFallback
                : new GenericProvider(options);

            this.restBaseUrl = typeof opts.bitfinexRestBaseUrl === "string" && opts.bitfinexRestBaseUrl.length > 0
                ? opts.bitfinexRestBaseUrl
                : "https://api-pub.bitfinex.com";
            this.wsBaseUrl = typeof opts.bitfinexWsBaseUrl === "string" && opts.bitfinexWsBaseUrl.length > 0
                ? opts.bitfinexWsBaseUrl
                : "wss://api-pub.bitfinex.com/ws/2";
            this.symbolOverrides = opts.bitfinexSymbolOverrides || {};
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

            this.channelIdToSymbol = {};
            // Bitfinex reuses one channel; store chanId metadata so unsubscribe works later.
            this.webSocketPool = new WebSocketConnectionPool({
                logger: (...args) => {
                    this.logger(...args);
                },
                reconnectDelayMs: this.wsReconnectDelayMs,
                createWebSocket: () => {
                    const WebSocketCtor = getWebSocketConstructor();
                    if (!WebSocketCtor) {
                        this.logger("BitfinexProvider: WebSocket not available in this environment");
                        return null;
                    }

                    const url = this.wsBaseUrl.replace(/\/$/, "");
                    try {
                        return new WebSocketCtor(url);
                    } catch (err) {
                        this.logger("BitfinexProvider: error creating pooled WebSocket", err);
                        return null;
                    }
                },
                subscribe: (ws, symbol) => {
                    this.sendBitfinexSubscribe(ws, symbol);
                },
                unsubscribe: (ws, symbol, meta) => {
                    this.sendBitfinexUnsubscribe(ws, symbol, meta);
                },
                handleMessage: (event, helpers) => {
                    this.handlePoolMessage(event, helpers);
                },
                onError: (err) => {
                    this.logger("BitfinexProvider: pooled WebSocket error", err);
                },
                onClose: () => {
            this.channelIdToSymbol = {};
                }
            });
        }

        getId() {
            return "BITFINEX";
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
                this.logger("BitfinexProvider: direct fetch failed, using fallback", err);
                if (this.genericFallback && typeof this.genericFallback.fetchTicker === "function") {
                    return this.genericFallback.fetchTicker(params);
                }
                throw err;
            }
        }

        async fetchTickerDirect(params) {
            const symbol = this.resolveSymbol(params);
            if (!symbol) {
                throw new Error("BitfinexProvider: unable to resolve symbol for " + (params.symbol || ""));
            }

            const url = this.buildRestUrl(symbol);
            try {
                const response = await fetch(url);
                if (!response || !response.ok) {
                    throw new Error("BitfinexProvider: REST response not ok for " + symbol);
                }
                const json = await response.json();
                const ticker = this.transformRestTicker(json, params, symbol);
                ticker.connectionState = ConnectionStates.DETACHED;
                return ticker;
            } catch (err) {
                this.logger("BitfinexProvider: REST fetch error", err);
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
            meta.bitfinexSymbol = this.resolveSymbol(entry.params);
            if (!meta.bitfinexSymbol) {
                this.logger("BitfinexProvider: cannot subscribe, unresolved symbol", entry.params);
                return false;
            }

            meta.chanId = null;

            const subscriptionHandle = this.webSocketPool.subscribe(meta.bitfinexSymbol, {
                context: entry,
                onData: (payload) => {
                    const ticker = this.buildTickerFromArray(payload, entry);
                    if (ticker) {
                        this.subscriptionManager.handleStreamingUpdate(entry.key, ticker);
                    }
                },
                onSubscribed: () => {
                    entry.streamingActive = true;
                    const poolMeta = subscriptionHandle.getMetadata ? subscriptionHandle.getMetadata() : null;
                    if (poolMeta && poolMeta.chanId) {
                        meta.chanId = poolMeta.chanId;
                        this.channelIdToSymbol[meta.chanId] = meta.bitfinexSymbol;
                    }
                },
                onDisconnected: () => {
                    entry.streamingActive = false;
                    meta.chanId = null;
                },
                onError: (err) => {
                    this.logger("BitfinexProvider: subscription error", err);
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
            meta.chanId = null;
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

            const sanitized = original.replace(/[:/]/g, "");
            if (!sanitized) {
                return null;
            }

            const upper = sanitized.toUpperCase();
            const withoutLeadingT = upper.startsWith("T") ? upper.substring(1) : upper;
            return "t" + withoutLeadingT;
        }

        buildRestUrl(symbol) {
            const base = this.restBaseUrl.replace(/\/$/, "");
            return base + "/v2/ticker/" + encodeURIComponent(symbol);
        }

        sendBitfinexSubscribe(ws, symbol) {
            if (!ws || !symbol) {
                return;
            }

            const payload = {
                event: "subscribe",
                channel: "ticker",
                symbol: symbol
            };

            try {
                ws.send(JSON.stringify(payload));
            } catch (err) {
                this.logger("BitfinexProvider: error sending subscribe", err);
            }
        }

        sendBitfinexUnsubscribe(ws, symbol, meta) {
            if (!ws) {
                return;
            }

            const chanId = meta && meta.chanId;
            if (!chanId) {
                return;
            }

            try {
                ws.send(JSON.stringify({
                    event: "unsubscribe",
                    chanId: chanId
                }));
            } catch (err) {
                this.logger("BitfinexProvider: error sending unsubscribe", err);
            }
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
                    this.logger("BitfinexProvider: failed to parse WebSocket message", err);
                    return;
                }
            }

            if (!message) {
                return;
            }

            if (Array.isArray(message)) {
                this.handleBitfinexDataArray(message, helpers);
                return;
            }

            if (message && typeof message === "object") {
                this.handleBitfinexEvent(message, helpers);
            }
        }

        handleBitfinexEvent(eventObj, helpers) {
            if (!eventObj || typeof eventObj !== "object") {
                return;
            }

            const eventType = eventObj.event;
            if (eventType === "subscribed" && eventObj.channel === "ticker") {
                const symbol = typeof eventObj.symbol === "string" ? eventObj.symbol : "";
                if (!symbol) {
                    return;
                }

                const chanId = eventObj.chanId;
                if (chanId) {
                    this.channelIdToSymbol[chanId] = symbol;
                }

                helpers.markSubscribed(symbol, {
                    chanId: chanId || null
                });
                return;
            }

            if (eventType === "unsubscribed") {
                const chanId = eventObj.chanId;
                let symbol = null;
                if (chanId) {
                    symbol = this.channelIdToSymbol[chanId] || helpers.findSymbol(function (meta) {
                        return meta && meta.chanId === chanId;
                    });
                    delete this.channelIdToSymbol[chanId];
                }

                if (symbol) {
                    helpers.markUnsubscribed(symbol);
                    helpers.updateMetadata(symbol, { chanId: null });
                }
                return;
            }

            if (eventType === "error") {
                this.logger("BitfinexProvider: subscription error", eventObj);
            }
        }

        handleBitfinexDataArray(arr, helpers) {
            if (!Array.isArray(arr) || arr.length < 2) {
                return;
            }

            const chanId = arr[0];
            const data = arr[1];
            if (data === "hb") {
                return;
            }

            if (!Array.isArray(data)) {
                return;
            }

            const symbol = this.channelIdToSymbol[chanId] || helpers.findSymbol(function (meta) {
                return meta && meta.chanId === chanId;
            });

            if (!symbol) {
                return;
            }

            helpers.dispatch(symbol, data, arr);
        }

        buildTickerFromArray(data, entry) {
            if (!Array.isArray(data)) {
                return null;
            }

            const params = entry ? entry.params : null;
            const pair = params && params.symbol ? params.symbol : this.ensureEntryMeta(entry).bitfinexSymbol;
            return {
                changeDaily: toNumber(data[4]),
                changeDailyPercent: toNumber(data[5]),
                last: toNumber(data[6]),
                volume: toNumber(data[7]),
                high: toNumber(data[8]),
                low: toNumber(data[9]),
                pair: pair,
                pairDisplay: pair
            };
        }

        transformRestTicker(json, params, resolvedSymbol) {
            if (!Array.isArray(json)) {
                throw new Error("BitfinexProvider: unexpected REST payload for " + resolvedSymbol);
            }

            const pair = params && params.symbol ? params.symbol : resolvedSymbol;
            return {
                changeDaily: toNumber(json[4]),
                changeDailyPercent: toNumber(json[5]),
                last: toNumber(json[6]),
                volume: toNumber(json[7]),
                high: toNumber(json[8]),
                low: toNumber(json[9]),
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
                throw new Error("BitfinexProvider: unable to resolve symbol for candles");
            }

            const interval = mapIntervalToBitfinex(params.interval);
            if (!interval) {
                throw new Error("BitfinexProvider: unsupported interval " + params.interval);
            }

            const limit = Math.min(Math.max(parseInt(params.limit, 10) || 24, 1), 1000);
            const base = this.restBaseUrl.replace(/\/$/, "");
            const url = base + "/v2/candles/trade:" + interval + ":" + encodeURIComponent(symbol) + "/hist?limit=" + limit;

            try {
                const response = await fetch(url);
                if (!response || !response.ok) {
                    throw new Error("BitfinexProvider: candles response not ok");
                }

                const json = await response.json();
                if (!Array.isArray(json)) {
                    throw new Error("BitfinexProvider: unexpected candles payload");
                }

                return json.map(function (item) {
                    return {
                        ts: Math.floor((item[0] || 0) / 1000),
                        open: toNumber(item[1]),
                        close: toNumber(item[2]),
                        high: toNumber(item[3]),
                        low: toNumber(item[4]),
                        volume: toNumber(item[5]),
                        volumeQuote: toNumber(item[5])
                    };
                });
            } catch (err) {
                this.logger("BitfinexProvider: error fetching candles", err);
                if (this.genericFallback && typeof this.genericFallback.fetchCandles === "function") {
                    return this.genericFallback.fetchCandles(params);
                }
                throw err;
            }
        }
    }

    return {
        BitfinexProvider: BitfinexProvider
    };
}));
