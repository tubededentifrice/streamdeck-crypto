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
        root.CryptoTickerProviders.BitfinexProvider = exports.BitfinexProvider;
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

    function safeClearTimeout(timerId) {
        if (timerId) {
            clearTimeout(timerId);
        }
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
                return this.transformRestTicker(json, params, symbol);
            } catch (err) {
                this.logger("BitfinexProvider: REST fetch error", err);
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
            meta.bitfinexSymbol = this.resolveSymbol(entry.params);
            if (!meta.bitfinexSymbol) {
                this.logger("BitfinexProvider: cannot subscribe, unresolved symbol", entry.params);
                this.ensureGenericFallback(entry);
                return false;
            }

            const WebSocketCtor = getWebSocketConstructor();
            if (!WebSocketCtor) {
                this.logger("BitfinexProvider: WebSocket not available in this environment");
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
                    if (meta.subscribed && meta.chanId) {
                        meta.ws.send(JSON.stringify({
                            event: "unsubscribe",
                            chanId: meta.chanId
                        }));
                    }
                } catch (err) {
                    this.logger("BitfinexProvider: error sending unsubscribe", err);
                }
                try {
                    meta.ws.close();
                } catch (err) {
                    this.logger("BitfinexProvider: error closing WebSocket", err);
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

        connectWebSocket(entry, WebSocketCtor) {
            const meta = this.ensureEntryMeta(entry);
            const symbol = meta.bitfinexSymbol;
            const url = this.wsBaseUrl;
            const self = this;

            meta.wsClosedByUser = false;
            meta.subscribed = false;
            meta.chanId = null;
            safeClearTimeout(meta.wsReconnectTimer);
            meta.wsReconnectTimer = null;

            const ctor = WebSocketCtor || getWebSocketConstructor();
            if (!ctor) {
                this.logger("BitfinexProvider: WebSocket constructor unavailable");
                this.ensureGenericFallback(entry);
                return;
            }

            let ws;
            try {
                ws = new ctor(url);
            } catch (err) {
                this.logger("BitfinexProvider: error creating WebSocket", err);
                return;
            }

            meta.ws = ws;
            entry.streamingActive = false;

            ws.onopen = function () {
                try {
                    ws.send(JSON.stringify({
                        event: "subscribe",
                        channel: "ticker",
                        symbol: symbol
                    }));
                } catch (err) {
                    self.logger("BitfinexProvider: error sending subscribe", err);
                }
            };

            ws.onmessage = function (event) {
                try {
                    self.handleWsMessage(entry, event.data);
                } catch (err) {
                    self.logger("BitfinexProvider: error processing WebSocket message", err);
                }
            };

            ws.onerror = function (err) {
                self.logger("BitfinexProvider: WebSocket error", err);
                entry.streamingActive = false;
            };

            ws.onclose = function () {
                entry.streamingActive = false;
                meta.subscribed = false;
                if (!meta.wsClosedByUser) {
                    self.scheduleReconnect(entry);
                }
            };
        }

        handleWsMessage(entry, rawData) {
            if (!rawData) {
                return;
            }

            let data = rawData;
            if (typeof rawData === "string") {
                try {
                    data = JSON.parse(rawData);
                } catch (err) {
                    this.logger("BitfinexProvider: failed to parse message", err);
                    return;
                }
            }

            if (Array.isArray(data)) {
                this.handleWsDataArray(entry, data);
                return;
            }

            if (data && typeof data === "object") {
                this.handleWsEvent(entry, data);
            }
        }

        handleWsEvent(entry, eventObj) {
            if (!eventObj) {
                return;
            }

            const meta = this.ensureEntryMeta(entry);
            const eventType = eventObj.event;
            if (eventType === "subscribed" && eventObj.channel === "ticker") {
                meta.subscribed = true;
                meta.chanId = eventObj.chanId;
                entry.streamingActive = true;
                return;
            }

            if (eventType === "error") {
                this.logger("BitfinexProvider: subscription error", eventObj);
                entry.streamingActive = false;
                this.ensureGenericFallback(entry);
            }
        }

        handleWsDataArray(entry, arr) {
            if (!Array.isArray(arr) || arr.length < 2) {
                return;
            }

            const data = arr[1];
            if (data === "hb") {
                return;
            }

            if (!Array.isArray(data)) {
                return;
            }

            const params = entry ? entry.params : null;
            const pair = params && params.symbol ? params.symbol : this.ensureEntryMeta(entry).bitfinexSymbol;
            const ticker = {
                changeDaily: toNumber(data[4]),
                changeDailyPercent: toNumber(data[5]),
                last: toNumber(data[6]),
                volume: toNumber(data[7]),
                high: toNumber(data[8]),
                low: toNumber(data[9]),
                pair: pair,
                pairDisplay: pair
            };

            this.subscriptionManager.handleStreamingUpdate(entry.key, ticker);
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
