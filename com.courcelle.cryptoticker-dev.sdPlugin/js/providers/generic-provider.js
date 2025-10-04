(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory(
            require("./provider-interface"),
            require("./subscription-key")
        );
    } else {
        root.CryptoTickerProviders = root.CryptoTickerProviders || {};
        const exports = factory(
            root.CryptoTickerProviders,
            root.CryptoTickerProviders
        );
        root.CryptoTickerProviders.GenericProvider = exports.GenericProvider;
    }
}(typeof self !== "undefined" ? self : this, function (providerInterfaceModule, subscriptionKeyModule) {
    const ProviderInterface = providerInterfaceModule.ProviderInterface || providerInterfaceModule;
    const buildSubscriptionKey = subscriptionKeyModule.buildSubscriptionKey || subscriptionKeyModule;

    const CONNECTION_STATE_CONNECTED = "Connected";
    const DEFAULT_RETRY_DELAY_MS = 5000;
    const DEFAULT_FALLBACK_POLL_INTERVAL_MS = 60000;
    const DEFAULT_STALE_TICKER_TIMEOUT_MS = 6 * 60 * 1000;

    function normalizeHandlers(handlers) {
        const h = handlers || {};
        return {
            onData: typeof h.onData === "function" ? h.onData : null,
            onError: typeof h.onError === "function" ? h.onError : null
        };
    }

    class GenericProvider extends ProviderInterface {
        constructor(options) {
            super(options);
            const opts = options || {};
            this.retryDelayMs = typeof opts.retryDelayMs === "number" ? opts.retryDelayMs : DEFAULT_RETRY_DELAY_MS;
            this.fallbackPollIntervalMs = typeof opts.fallbackPollIntervalMs === "number" ? opts.fallbackPollIntervalMs : DEFAULT_FALLBACK_POLL_INTERVAL_MS;
            this.staleTickerTimeoutMs = typeof opts.staleTickerTimeoutMs === "number" ? opts.staleTickerTimeoutMs : DEFAULT_STALE_TICKER_TIMEOUT_MS;
            this.subscriptions = {};
            this.cache = {};
            this.connection = null;
            this.shouldReconnect = true;
            this.connectionState = "Disconnected";
            this.startingConnection = false;
        }

        getId() {
            return "GENERIC";
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
                    self.resubscribeAll();
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
                self.flushPendingSubscriptions();
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

        subscribeTicker(params, handlers) {
            const normalizedHandlers = normalizeHandlers(handlers);
            const subscriptionKey = buildSubscriptionKey(
                params.exchange,
                params.symbol,
                params.fromCurrency,
                params.toCurrency
            );

            let entry = this.subscriptions[subscriptionKey];
            if (!entry) {
                entry = {
                    params: {
                        exchange: params.exchange,
                        symbol: params.symbol,
                        fromCurrency: params.fromCurrency || null,
                        toCurrency: params.toCurrency || null
                    },
                    subscribers: [],
                    isSubscribed: false,
                    pending: true,
                    lastWsUpdate: 0,
                    fallbackTimerId: null,
                    key: subscriptionKey
                };
                this.subscriptions[subscriptionKey] = entry;
            }

            const subscriber = {
                onData: normalizedHandlers.onData,
                onError: normalizedHandlers.onError
            };
            entry.subscribers.push(subscriber);

            this.ensureConnection();
            this.subscribeEntry(entry);
            this.startFallbackPolling(entry);

            const self = this;
            this.fetchTicker(entry.params).then(function (ticker) {
                self.notifySubscribers(subscriptionKey, ticker);
            }).catch(function (err) {
                if (subscriber.onError) {
                    subscriber.onError(err);
                }
            });

            return {
                key: subscriptionKey,
                unsubscribe: function () {
                    self.unsubscribeTicker(subscriptionKey, subscriber);
                }
            };
        }

        unsubscribeTicker(key, subscriber) {
            const entry = this.subscriptions[key];
            if (!entry) {
                return;
            }

            const idx = entry.subscribers.indexOf(subscriber);
            if (idx >= 0) {
                entry.subscribers.splice(idx, 1);
            }

            if (entry.subscribers.length === 0) {
                this.stopFallbackPolling(entry);
                if (entry.isSubscribed && this.isConnected()) {
                    try {
                        this.connection.invoke(
                            "Unsubscribe",
                            entry.params.exchange,
                            entry.params.symbol,
                            entry.params.fromCurrency,
                            entry.params.toCurrency
                        ).catch((err) => {
                            this.logger("GenericProvider: error invoking Unsubscribe", err);
                        });
                    } catch (err) {
                        this.logger("GenericProvider: error invoking Unsubscribe", err);
                    }
                }
                delete this.subscriptions[key];
            }
        }

        subscribeEntry(entry) {
            if (!this.connection || !this.isConnected()) {
                entry.pending = true;
                return;
            }

            if (entry.isSubscribed) {
                return;
            }

            const self = this;
            this.connection.invoke(
                "Subscribe",
                entry.params.exchange,
                entry.params.symbol,
                entry.params.fromCurrency,
                entry.params.toCurrency
            ).then(function () {
                entry.isSubscribed = true;
                entry.pending = false;
            }).catch(function (err) {
                entry.pending = true;
                self.logger("GenericProvider: error invoking Subscribe", err);
            });
        }

        flushPendingSubscriptions() {
            const keys = Object.keys(this.subscriptions);
            for (let i = 0; i < keys.length; i++) {
                const entry = this.subscriptions[keys[i]];
                entry.isSubscribed = false;
                this.subscribeEntry(entry);
            }
        }

        resubscribeAll() {
            const keys = Object.keys(this.subscriptions);
            for (let i = 0; i < keys.length; i++) {
                const entry = this.subscriptions[keys[i]];
                entry.isSubscribed = false;
                entry.pending = true;
            }
            this.flushPendingSubscriptions();
        }

        handleTickerMessage(message) {
            if (!message) {
                return;
            }

            const provider = message.provider || message["provider"];
            const symbol = message.symbol || message["symbol"];
            const fromCurrency = message.conversionFromCurrency || message["conversionFromCurrency"] || null;
            const toCurrency = message.conversionToCurrency || message["conversionToCurrency"] || null;
            const key = buildSubscriptionKey(provider, symbol, fromCurrency, toCurrency);
            const entry = this.subscriptions[key];
            if (!entry) {
                return;
            }

            const ticker = this.transformTickerResponse(message);
            this.cache[key] = ticker;
            entry.lastWsUpdate = Date.now();
            this.notifySubscribers(key, ticker);
        }

        startFallbackPolling(entry) {
            if (!entry || entry.fallbackTimerId) {
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
            if (!entry) {
                return;
            }

            if (!this.shouldPollEntry(entry)) {
                return;
            }

            const self = this;
            this.fetchTicker(entry.params).then(function (ticker) {
                const key = entry.key;
                if (key) {
                    self.cache[key] = ticker;
                    self.notifySubscribers(key, ticker);
                }
            }).catch(function (err) {
                self.logger("GenericProvider: fallback fetch failed", err);
            });
        }

        shouldPollEntry(entry) {
            if (!entry) {
                return false;
            }

            if (!this.isConnected()) {
                return true;
            }

            const lastUpdate = entry.lastWsUpdate || 0;
            if (!lastUpdate) {
                return true;
            }

            const now = Date.now();
            return now - lastUpdate > this.staleTickerTimeoutMs;
        }

        notifySubscribers(key, ticker) {
            const entry = this.subscriptions[key];
            if (!entry) {
                return;
            }

            for (let i = 0; i < entry.subscribers.length; i++) {
                const subscriber = entry.subscribers[i];
                if (subscriber && subscriber.onData) {
                    try {
                        subscriber.onData(ticker);
                    } catch (err) {
                        this.logger("GenericProvider: subscriber onData threw", err);
                    }
                }
            }
        }

        async fetchTicker(params) {
            const exchange = params.exchange;
            const symbol = params.symbol;
            const fromCurrency = params.fromCurrency || "USD";
            const toCurrency = params.toCurrency || null;
            const key = buildSubscriptionKey(exchange, symbol, fromCurrency, toCurrency);

            let url = this.baseUrl + "/api/Ticker/json/" + exchange + "/" + symbol + "?fromCurrency=" + encodeURIComponent(fromCurrency);
            if (toCurrency !== null) {
                url += "&toCurrency=" + encodeURIComponent(toCurrency);
            }

            try {
                const response = await fetch(url);
                const responseJson = await response.json();
                const ticker = this.transformTickerResponse(responseJson);
                this.cache[key] = ticker;
                return ticker;
            } catch (err) {
                this.logger("GenericProvider: error fetching ticker", err);
                const cached = this.cache[key];
                if (cached) {
                    return cached;
                }
                return this.buildEmptyTicker(symbol);
            }
        }

        getCachedTicker(key) {
            return this.cache[key] || null;
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
