(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory(
            require("./provider-interface"),
            require("./subscription-key"),
            require("./ticker-subscription-manager")
        );
    } else {
        root.CryptoTickerProviders = root.CryptoTickerProviders || {};
        const exports = factory(
            root.CryptoTickerProviders,
            root.CryptoTickerProviders,
            root.CryptoTickerProviders
        );
        root.CryptoTickerProviders.GenericProvider = exports.GenericProvider;
    }
}(typeof self !== "undefined" ? self : this, function (providerInterfaceModule, subscriptionKeyModule, managerModule) {
    const ProviderInterface = providerInterfaceModule.ProviderInterface || providerInterfaceModule;
    const buildSubscriptionKey = subscriptionKeyModule.buildSubscriptionKey || subscriptionKeyModule;
    const TickerSubscriptionManager = managerModule.TickerSubscriptionManager || managerModule;

    const CONNECTION_STATE_CONNECTED = "Connected";
    const DEFAULT_RETRY_DELAY_MS = 5000;

    class GenericProvider extends ProviderInterface {
        constructor(options) {
            super(options);
            const opts = options || {};
            this.retryDelayMs = typeof opts.retryDelayMs === "number" ? opts.retryDelayMs : DEFAULT_RETRY_DELAY_MS;
            this.connection = null;
            this.shouldReconnect = true;
            this.connectionState = "Disconnected";
            this.startingConnection = false;

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

            return this.connection.invoke(
                "Subscribe",
                params.exchange,
                params.symbol,
                params.fromCurrency,
                params.toCurrency
            ).then(function () {
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

            return this.connection.invoke(
                "Unsubscribe",
                params.exchange,
                params.symbol,
                params.fromCurrency,
                params.toCurrency
            ).then(function () {
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
            const exchange = params.exchange;
            const symbol = params.symbol;
            const fromCurrency = params.fromCurrency || "USD";
            const toCurrency = params.toCurrency || null;
            let url = this.baseUrl + "/api/Ticker/json/" + exchange + "/" + symbol + "?fromCurrency=" + encodeURIComponent(fromCurrency);
            if (toCurrency !== null) {
                url += "&toCurrency=" + encodeURIComponent(toCurrency);
            }

            const self = this;
            return fetch(url).then(function (response) {
                return response.json();
            }).then(function (json) {
                return self.transformTickerResponse(json);
            }).catch(function (err) {
                self.logger("GenericProvider: error fetching ticker", err);
                const key = self.subscriptionManager.buildKey(exchange, symbol, fromCurrency, toCurrency);
                const cached = self.subscriptionManager.getCachedTicker(key);
                if (cached) {
                    return cached;
                }
                return self.buildEmptyTicker(symbol);
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
                const response = await fetch(url);
                if (!response || !response.ok) {
                    throw new Error("GenericProvider: candles response not ok");
                }
                const json = await response.json();
                if (Array.isArray(json.candles)) {
                    return json.candles;
                }
                return [];
            } catch (err) {
                this.logger("GenericProvider: error fetching candles", err);
                throw err;
            }
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
                pairDisplay: sym
            };
        }
    }

    return {
        GenericProvider: GenericProvider
    };
}));
