"use strict";
/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-this-alias, no-var */
// @ts-nocheck
/* global signalR */
(function (root, factory) {
    const globalRoot = (typeof globalThis !== "undefined" ? globalThis : root);
    const args = typeof module === "object" && module.exports
        ? [
            require("./provider-interface"),
            require("./subscription-key"),
            require("./ticker-subscription-manager"),
            require("./connection-states")
        ]
        : [
            root === null || root === void 0 ? void 0 : root.CryptoTickerProviders,
            root === null || root === void 0 ? void 0 : root.CryptoTickerProviders,
            root === null || root === void 0 ? void 0 : root.CryptoTickerProviders,
            root === null || root === void 0 ? void 0 : root.CryptoTickerConnectionStates
        ];
    const exportsValue = factory(args[0], args[1], args[2], args[3]);
    if (typeof module === "object" && module.exports) {
        module.exports = exportsValue;
    }
    if (globalRoot) {
        globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
        globalRoot.CryptoTickerProviders.GenericProvider = exportsValue.GenericProvider;
    }
}(typeof self !== "undefined" ? self : this, function (providerInterfaceModule, subscriptionKeyModule, managerModule, connectionStatesModule) {
    const ProviderInterface = providerInterfaceModule.ProviderInterface || providerInterfaceModule;
    const buildSubscriptionKey = subscriptionKeyModule.buildSubscriptionKey || subscriptionKeyModule;
    const TickerSubscriptionManager = managerModule.TickerSubscriptionManager || managerModule;
    const ConnectionStates = connectionStatesModule || {
        LIVE: "live",
        DETACHED: "detached",
        BACKUP: "backup",
        BROKEN: "broken"
    };
    const CONNECTION_STATE_CONNECTED = "Connected";
    const DEFAULT_RETRY_DELAY_MS = 5000;
    const TPROXY_CACHE_BYPASS_PARAM = "_ctBust";
    // Ensure requests to the proxy always bypass client-side caches.
    function appendCacheBypassParam(url) {
        if (!url || typeof url !== "string") {
            return url;
        }
        try {
            const parsed = new URL(url);
            parsed.searchParams.set(TPROXY_CACHE_BYPASS_PARAM, Date.now().toString());
            return parsed.toString();
        }
        catch (err) {
            const separator = url.indexOf("?") === -1 ? "?" : "&";
            return url + separator + TPROXY_CACHE_BYPASS_PARAM + "=" + Date.now();
        }
    }
    class GenericProvider extends ProviderInterface {
        constructor(options) {
            super(options);
            const opts = options || {};
            this.retryDelayMs = typeof opts.retryDelayMs === "number" ? opts.retryDelayMs : DEFAULT_RETRY_DELAY_MS;
            this.connection = null;
            this.shouldReconnect = true;
            this.connectionState = "Disconnected";
            this.startingConnection = false;
            this.normalizedBaseUrl = (this.baseUrl || "").replace(/\/$/, "");
            // Manager handles fallback polling + streaming so action code stays simple.
            const managerOptions = {
                logger: (...args) => {
                    this.logger(...args);
                },
                fetchTicker: this.rawFetchTicker.bind(this),
                subscribeStreaming: this.subscribeEntry.bind(this),
                unsubscribeStreaming: this.unsubscribeEntry.bind(this),
                ensureConnection: this.ensureConnection.bind(this),
                buildSubscriptionKey: function (exchange, symbol, fromCurrency, toCurrency) {
                    return buildSubscriptionKey(exchange, symbol, fromCurrency, toCurrency);
                },
                fallbackPollIntervalMs: opts.fallbackPollIntervalMs,
                staleTickerTimeoutMs: opts.staleTickerTimeoutMs
            };
            this.subscriptionManager = new TickerSubscriptionManager(managerOptions);
        }
        getId() {
            return "GENERIC";
        }
        subscribeTicker(params, handlers) {
            return this.subscriptionManager.subscribe(params, handlers);
        }
        getCachedTicker(key) {
            return this.subscriptionManager.getCachedTicker(key);
        }
        ensureConnection() {
            if (this.connection && (this.connectionState === CONNECTION_STATE_CONNECTED || this.startingConnection)) {
                return;
            }
            if (typeof signalR === "undefined" || !signalR.HubConnectionBuilder) {
                this.logger("GenericProvider: SignalR not available, skipping WebSocket connection.");
                return;
            }
            if (!this.connection) {
                this.connection = new signalR.HubConnectionBuilder()
                    .withUrl(this.baseUrl + "/tickerhub")
                    .withAutomaticReconnect()
                    .configureLogging(signalR.LogLevel.Warning)
                    .build();
                const self = this;
                this.connection.on("ticker", function (ticker) {
                    self.handleTickerMessage(ticker);
                });
                this.connection.onreconnected(function () {
                    self.logger("GenericProvider: connection re-established, resubscribing.");
                    self.onConnectionEstablished();
                });
                this.connection.onclose(function () {
                    self.connectionState = "Disconnected";
                    if (self.shouldReconnect) {
                        setTimeout(function () {
                            self.startConnection();
                        }, self.retryDelayMs);
                    }
                });
            }
            this.startConnection();
        }
        startConnection() {
            if (!this.connection || this.startingConnection || this.connectionState === CONNECTION_STATE_CONNECTED) {
                return;
            }
            const self = this;
            this.startingConnection = true;
            this.connection.start().then(function () {
                self.connectionState = CONNECTION_STATE_CONNECTED;
                self.startingConnection = false;
                self.onConnectionEstablished();
            }).catch(function (err) {
                self.connectionState = "Disconnected";
                self.startingConnection = false;
                self.logger("GenericProvider: error starting connection", err);
                setTimeout(function () {
                    self.startConnection();
                }, self.retryDelayMs);
            });
        }
        isConnected() {
            return this.connection && this.connectionState === CONNECTION_STATE_CONNECTED;
        }
        onConnectionEstablished() {
            const self = this;
            this.subscriptionManager.forEachEntry(function (entry) {
                if (entry) {
                    entry.streamingActive = false;
                    if (entry.meta) {
                        entry.meta.isSubscribed = false;
                        entry.meta.pending = true;
                    }
                    self.subscriptionManager.ensureStreaming(entry);
                }
            });
        }
        subscribeEntry(entry) {
            if (!entry) {
                return false;
            }
            entry.meta = entry.meta || {};
            if (!this.connection) {
                // Lazily boot SignalR on first subscriber to avoid sockets for idle keys.
                this.ensureConnection();
                entry.meta.pending = true;
                entry.streamingActive = false;
                return false;
            }
            if (!this.isConnected()) {
                this.startConnection();
                entry.meta.pending = true;
                entry.streamingActive = false;
                return false;
            }
            if (entry.meta.isSubscribed) {
                entry.meta.pending = false;
                return true;
            }
            entry.meta.pending = true;
            const params = entry.params;
            const self = this;
            return this.connection.invoke("Subscribe", params.exchange, params.symbol, params.fromCurrency, params.toCurrency).then(function () {
                entry.meta.isSubscribed = true;
                entry.meta.pending = false;
                entry.streamingActive = true;
                return true;
            }).catch(function (err) {
                entry.meta.isSubscribed = false;
                entry.meta.pending = false;
                entry.streamingActive = false;
                self.logger("GenericProvider: error invoking Subscribe", err);
                return false;
            });
        }
        unsubscribeEntry(entry) {
            if (!entry) {
                return true;
            }
            entry.meta = entry.meta || {};
            if (!this.connection || !entry.meta.isSubscribed) {
                entry.meta.isSubscribed = false;
                entry.streamingActive = false;
                return true;
            }
            const params = entry.params;
            const self = this;
            return this.connection.invoke("Unsubscribe", params.exchange, params.symbol, params.fromCurrency, params.toCurrency).then(function () {
                entry.meta.isSubscribed = false;
                entry.streamingActive = false;
                return true;
            }).catch(function (err) {
                entry.meta.isSubscribed = false;
                entry.streamingActive = false;
                self.logger("GenericProvider: error invoking Unsubscribe", err);
                return false;
            });
        }
        fetchTicker(params) {
            return this.rawFetchTicker(params);
        }
        rawFetchTicker(params) {
            const exchange = params.exchange || "";
            const symbol = params.symbol || "";
            const fromCurrency = params.fromCurrency || "USD";
            const toCurrency = params.toCurrency || null;
            const base = (this.baseUrl || "").replace(/\/$/, "");
            const pathExchange = encodeURIComponent(exchange);
            const pathSymbol = encodeURIComponent(symbol);
            let url = base + "/api/Ticker/json/" + pathExchange + "/" + pathSymbol + "?fromCurrency=" + encodeURIComponent(fromCurrency);
            if (toCurrency !== null) {
                url += "&toCurrency=" + encodeURIComponent(toCurrency);
            }
            const self = this;
            const request = this.buildProxyRequestConfig(url);
            return fetch(request.url, request.options).then(function (response) {
                return response.json();
            }).then(function (json) {
                const ticker = self.transformTickerResponse(json);
                ticker.connectionState = ConnectionStates.BACKUP;
                return ticker;
            }).catch(function (err) {
                self.logger("GenericProvider: error fetching ticker", err);
                const key = self.subscriptionManager.buildKey(exchange, symbol, fromCurrency, toCurrency);
                const cached = self.subscriptionManager.getCachedTicker(key);
                if (cached) {
                    cached.connectionState = cached.connectionState || ConnectionStates.BACKUP;
                    return cached;
                }
                // Fallback: return empty ticker so renderer shows BROKEN, not runtime error.
                const fallback = self.buildEmptyTicker(symbol);
                fallback.connectionState = ConnectionStates.BROKEN;
                return fallback;
            });
        }
        handleTickerMessage(message) {
            if (!message) {
                return;
            }
            const provider = message.provider || message["provider"];
            const symbol = message.symbol || message["symbol"];
            const fromCurrency = message.conversionFromCurrency || message["conversionFromCurrency"] || null;
            const toCurrency = message.conversionToCurrency || message["conversionToCurrency"] || null;
            const key = this.subscriptionManager.buildKey(provider, symbol, fromCurrency, toCurrency);
            const ticker = this.transformTickerResponse(message);
            const entry = this.subscriptionManager.getEntry(key);
            if (entry && entry.meta) {
                entry.meta.isSubscribed = true;
                entry.meta.pending = false;
                entry.streamingActive = true;
            }
            // Notify all contexts; manager marks entry live and stops fallback polling.
            this.subscriptionManager.handleStreamingUpdate(key, ticker);
        }
        async fetchCandles(params) {
            const exchange = params.exchange;
            const symbol = params.symbol;
            const interval = params.interval;
            const limit = typeof params.limit === "number" && params.limit > 0 ? params.limit : 24;
            const base = this.baseUrl.replace(/\/$/, "");
            const url = base + "/api/Candles/json/" + encodeURIComponent(exchange) + "/" + encodeURIComponent(symbol) + "/" + interval + "?limit=" + limit;
            try {
                const request = this.buildProxyRequestConfig(url);
                const response = await fetch(request.url, request.options);
                if (!response || !response.ok) {
                    throw new Error("GenericProvider: candles response not ok");
                }
                const json = await response.json();
                if (Array.isArray(json.candles)) {
                    return json.candles;
                }
                return [];
            }
            catch (err) {
                this.logger("GenericProvider: error fetching candles", err);
                throw err;
            }
        }
        // Build fetch options that disable caching when targeting the tproxy backend.
        buildProxyRequestConfig(url, baseOptions) {
            if (!url || typeof url !== "string") {
                return {
                    url: url,
                    options: baseOptions
                };
            }
            const normalizedBase = this.normalizedBaseUrl;
            const normalizedUrl = url.replace(/\/$/, "");
            if (!normalizedBase || normalizedUrl.indexOf(normalizedBase) !== 0) {
                return {
                    url: url,
                    options: baseOptions
                };
            }
            const options = Object.assign({}, baseOptions || {});
            options.cache = "no-store";
            const headers = Object.assign({}, options.headers || {});
            headers["cache-control"] = "no-cache";
            headers["pragma"] = "no-cache";
            options.headers = headers;
            return {
                url: appendCacheBypassParam(url),
                options: options
            };
        }
        transformTickerResponse(responseJson) {
            const json = responseJson || {};
            return {
                changeDaily: json["dailyChange"] || 0,
                changeDailyPercent: json["dailyChangeRelative"] || 0,
                last: json["last"] || 0,
                volume: json["volume"] || 0,
                high: json["high24h"] || 0,
                low: json["low24h"] || 0,
                pair: json["symbol"] || json["pair"] || "",
                pairDisplay: json["symbolDisplay"] || json["symbol"] || json["pair"] || ""
            };
        }
        buildEmptyTicker(symbol) {
            const sym = symbol || "";
            return {
                changeDaily: 0,
                changeDailyPercent: 0,
                last: 0,
                volume: 0,
                high: 0,
                low: 0,
                pair: sym,
                pairDisplay: sym,
                connectionState: ConnectionStates.BROKEN
            };
        }
    }
    return {
        GenericProvider: GenericProvider
    };
}));
