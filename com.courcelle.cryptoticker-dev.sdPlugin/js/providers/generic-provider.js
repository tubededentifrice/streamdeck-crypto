"use strict";
/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-this-alias, no-var */
// @ts-nocheck
/* global signalR */
(function (root, factory) {
    const globalRoot = (typeof globalThis !== 'undefined' ? globalThis : root);
    const args = typeof module === 'object' && module.exports
        ? [
            require('./provider-interface'),
            require('./subscription-key'),
            require('./ticker-subscription-manager'),
            require('./connection-states'),
            require('./fetch-utils')
        ]
        : [
            root === null || root === void 0 ? void 0 : root.CryptoTickerProviders,
            root === null || root === void 0 ? void 0 : root.CryptoTickerProviders,
            root === null || root === void 0 ? void 0 : root.CryptoTickerProviders,
            root === null || root === void 0 ? void 0 : root.CryptoTickerConnectionStates,
            root === null || root === void 0 ? void 0 : root.CryptoTickerProviders
        ];
    const exportsValue = factory(args[0], args[1], args[2], args[3], args[4]);
    if (typeof module === 'object' && module.exports) {
        module.exports = exportsValue;
    }
    if (globalRoot) {
        globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
        globalRoot.CryptoTickerProviders.GenericProvider = exportsValue.GenericProvider;
    }
})(typeof self !== 'undefined'
    ? self
    : this, function (providerInterfaceModule, subscriptionKeyModule, managerModule, connectionStatesModule, fetchUtilsModule) {
    const ProviderInterface = providerInterfaceModule.ProviderInterface || providerInterfaceModule;
    const buildSubscriptionKey = subscriptionKeyModule.buildSubscriptionKey || subscriptionKeyModule;
    const TickerSubscriptionManager = managerModule.TickerSubscriptionManager || managerModule;
    const ConnectionStates = connectionStatesModule || {
        LIVE: 'live',
        DETACHED: 'detached',
        BACKUP: 'backup',
        BROKEN: 'broken'
    };
    const fetchWithTimeout = fetchUtilsModule.fetchWithTimeout;
    const CONNECTION_STATE_CONNECTED = 'Connected';
    const DEFAULT_RETRY_DELAY_MS = 5000;
    const TPROXY_CACHE_BYPASS_PARAM = '_ctBust';
    function toFiniteNumber(value) {
        if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) {
            return NaN;
        }
        const number = Number(value);
        return Number.isFinite(number) ? number : NaN;
    }
    // Ensure requests to the proxy always bypass client-side caches.
    function appendCacheBypassParam(url) {
        if (!url || typeof url !== 'string') {
            return url;
        }
        try {
            const parsed = new URL(url);
            parsed.searchParams.set(TPROXY_CACHE_BYPASS_PARAM, Date.now().toString());
            return parsed.toString();
        }
        catch (err) {
            const separator = url.indexOf('?') === -1 ? '?' : '&';
            return url + separator + TPROXY_CACHE_BYPASS_PARAM + '=' + Date.now();
        }
    }
    class GenericProvider extends ProviderInterface {
        constructor(options) {
            super(options);
            const opts = options || {};
            this.retryDelayMs =
                Number.isFinite(opts.retryDelayMs) && opts.retryDelayMs > 0
                    ? opts.retryDelayMs
                    : DEFAULT_RETRY_DELAY_MS;
            this.connection = null;
            this.shouldReconnect = true;
            this.retryTimerId = null;
            this.connectionGeneration = 0;
            this.tickerRequests = new Map();
            this.candleRequests = new Map();
            this.connectionState = 'Disconnected';
            this.startingConnection = false;
            this.normalizedBaseUrl = (this.baseUrl || '').replace(/\/$/, '');
            this.requestTimeoutMs = opts.requestTimeoutMs;
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
            return 'GENERIC';
        }
        subscribeTicker(params, handlers) {
            return this.subscriptionManager.subscribe(params, handlers);
        }
        getCachedTicker(key) {
            return this.subscriptionManager.getCachedTicker(key);
        }
        hasSubscribers() {
            return Object.keys(this.subscriptionManager.entries).length > 0;
        }
        ensureConnection() {
            if (!this.hasSubscribers()) {
                return;
            }
            if (this.connection) {
                this.startConnection();
                return;
            }
            if (typeof signalR === 'undefined' || !signalR.HubConnectionBuilder) {
                return;
            }
            const connection = new signalR.HubConnectionBuilder()
                .withUrl(this.normalizedBaseUrl + '/tickerhub')
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Warning)
                .build();
            this.connection = connection;
            connection.on('ticker', (ticker) => {
                if (this.connection === connection) {
                    this.handleTickerMessage(ticker);
                }
            });
            connection.onreconnecting(() => {
                if (this.connection === connection) {
                    this.markConnectionDisconnected('Reconnecting');
                }
            });
            connection.onreconnected(() => {
                if (this.connection === connection) {
                    this.connectionState = CONNECTION_STATE_CONNECTED;
                    this.onConnectionEstablished();
                }
            });
            connection.onclose(() => {
                if (this.connection === connection) {
                    this.markConnectionDisconnected('Disconnected');
                    this.scheduleReconnect();
                }
            });
            this.startConnection();
        }
        markConnectionDisconnected(state) {
            this.connectionState = state;
            this.connectionGeneration++;
            this.subscriptionManager.forEachEntry((entry) => {
                entry.streamingActive = false;
                entry.streamingPending = false;
                entry.streamingGeneration++;
                entry.meta.isSubscribed = false;
                entry.meta.pending = false;
            });
        }
        scheduleReconnect() {
            if (!this.shouldReconnect || !this.hasSubscribers() || this.retryTimerId !== null) {
                return;
            }
            this.retryTimerId = setTimeout(() => {
                this.retryTimerId = null;
                this.startConnection();
            }, this.retryDelayMs);
        }
        stopConnectionIfIdle() {
            if (this.hasSubscribers()) {
                return;
            }
            if (this.retryTimerId !== null) {
                clearTimeout(this.retryTimerId);
                this.retryTimerId = null;
            }
            const connection = this.connection;
            this.connection = null;
            this.startingConnection = false;
            this.markConnectionDisconnected('Disconnected');
            if (connection) {
                Promise.resolve(connection.stop()).catch((err) => {
                    this.logger('GenericProvider: error stopping connection', err);
                });
            }
        }
        startConnection() {
            if (!this.connection ||
                !this.hasSubscribers() ||
                this.startingConnection ||
                this.connectionState === 'Reconnecting' ||
                this.connectionState === CONNECTION_STATE_CONNECTED) {
                return;
            }
            if (this.retryTimerId !== null) {
                clearTimeout(this.retryTimerId);
                this.retryTimerId = null;
            }
            const connection = this.connection;
            this.startingConnection = true;
            connection
                .start()
                .then(() => {
                if (this.connection !== connection) {
                    return;
                }
                this.connectionState = CONNECTION_STATE_CONNECTED;
                this.startingConnection = false;
                this.onConnectionEstablished();
            })
                .catch((err) => {
                if (this.connection !== connection) {
                    return;
                }
                this.markConnectionDisconnected('Disconnected');
                this.startingConnection = false;
                this.logger('GenericProvider: error starting connection', err);
                this.scheduleReconnect();
            });
        }
        isConnected() {
            return this.connection && this.connectionState === CONNECTION_STATE_CONNECTED;
        }
        onConnectionEstablished() {
            this.connectionGeneration++;
            this.subscriptionManager.forEachEntry((entry) => {
                entry.streamingActive = false;
                entry.streamingPending = false;
                entry.meta.isSubscribed = false;
                entry.meta.pending = false;
                this.subscriptionManager.ensureStreaming(entry);
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
            const connection = this.connection;
            const generation = this.connectionGeneration;
            return connection
                .invoke('Subscribe', params.exchange, params.symbol, params.fromCurrency, params.toCurrency)
                .then(function () {
                if (self.connection !== connection || self.connectionGeneration !== generation) {
                    return false;
                }
                entry.meta.isSubscribed = true;
                entry.meta.pending = false;
                entry.streamingActive = true;
                return true;
            })
                .catch(function (err) {
                if (self.connection !== connection || self.connectionGeneration !== generation) {
                    return false;
                }
                entry.meta.isSubscribed = false;
                entry.meta.pending = false;
                entry.streamingActive = false;
                self.logger('GenericProvider: error invoking Subscribe', err);
                return false;
            });
        }
        unsubscribeEntry(entry) {
            if (!entry) {
                return true;
            }
            entry.meta = entry.meta || {};
            const replacement = this.subscriptionManager.getEntry(entry.key);
            if (replacement && replacement !== entry) {
                return true;
            }
            if (!this.connection || !entry.meta.isSubscribed) {
                entry.meta.isSubscribed = false;
                entry.streamingActive = false;
                this.stopConnectionIfIdle();
                return true;
            }
            const params = entry.params;
            const self = this;
            const request = this.connection
                .invoke('Unsubscribe', params.exchange, params.symbol, params.fromCurrency, params.toCurrency)
                .then(function () {
                entry.meta.isSubscribed = false;
                entry.streamingActive = false;
                return true;
            })
                .catch(function (err) {
                entry.meta.isSubscribed = false;
                entry.streamingActive = false;
                self.logger('GenericProvider: error invoking Unsubscribe', err);
                return false;
            });
            this.stopConnectionIfIdle();
            return request;
        }
        fetchTicker(params) {
            return this.subscriptionManager.requestTicker(params);
        }
        rawFetchTicker(params) {
            params = params || {};
            const key = this.subscriptionManager.buildKeyFromParams(params);
            if (this.tickerRequests.has(key)) {
                return this.tickerRequests.get(key);
            }
            const request = this.performTickerFetch(params).finally(() => {
                this.tickerRequests.delete(key);
            });
            this.tickerRequests.set(key, request);
            return request;
        }
        performTickerFetch(params) {
            const exchange = params.exchange || '';
            const symbol = params.symbol || '';
            const fromCurrency = params.fromCurrency || 'USD';
            const toCurrency = params.toCurrency || null;
            const base = (this.baseUrl || '').replace(/\/$/, '');
            const pathExchange = encodeURIComponent(exchange);
            const pathSymbol = encodeURIComponent(symbol);
            let url = base +
                '/api/Ticker/json/' +
                pathExchange +
                '/' +
                pathSymbol +
                '?fromCurrency=' +
                encodeURIComponent(fromCurrency);
            if (toCurrency !== null) {
                url += '&toCurrency=' + encodeURIComponent(toCurrency);
            }
            const self = this;
            const request = this.buildProxyRequestConfig(url);
            return fetchWithTimeout(request.url, request.options, this.requestTimeoutMs)
                .then(function (response) {
                if (!response || !response.ok) {
                    throw new Error('GenericProvider: ticker response not ok');
                }
                return response.json();
            })
                .then(function (json) {
                const ticker = self.transformTickerResponse(json);
                ticker.connectionState = ConnectionStates.BACKUP;
                return ticker;
            })
                .catch(function (err) {
                self.logger('GenericProvider: error fetching ticker', err);
                const key = self.subscriptionManager.buildKey(exchange, symbol, fromCurrency, toCurrency);
                const cached = self.subscriptionManager.getCachedTicker(key);
                if (cached) {
                    return Object.assign({}, cached, { connectionState: ConnectionStates.BROKEN });
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
            const provider = message.provider || message['provider'];
            const symbol = message.symbol || message['symbol'];
            const fromCurrency = message.conversionFromCurrency || message['conversionFromCurrency'] || null;
            const toCurrency = message.conversionToCurrency || message['conversionToCurrency'] || null;
            const key = this.subscriptionManager.buildKey(provider, symbol, fromCurrency, toCurrency);
            const entry = this.subscriptionManager.getEntry(key);
            if (!entry) {
                return;
            }
            let ticker;
            try {
                ticker = this.transformTickerResponse(message);
            }
            catch (err) {
                this.logger('GenericProvider: invalid streaming ticker', err);
                return;
            }
            if (entry.meta) {
                entry.meta.isSubscribed = true;
                entry.meta.pending = false;
                entry.streamingActive = true;
            }
            this.subscriptionManager.handleStreamingUpdate(key, ticker);
        }
        fetchCandles(params) {
            params = params || {};
            const limit = Number.isFinite(params.limit) && params.limit > 0 ? params.limit : 24;
            const key = JSON.stringify([params.exchange, params.symbol, params.interval, limit]);
            if (this.candleRequests.has(key)) {
                return this.candleRequests.get(key);
            }
            const request = this.performCandlesFetch(params).finally(() => {
                this.candleRequests.delete(key);
            });
            this.candleRequests.set(key, request);
            return request;
        }
        async performCandlesFetch(params) {
            const exchange = params.exchange;
            const symbol = params.symbol;
            const interval = params.interval;
            const limit = Number.isFinite(params.limit) && params.limit > 0 ? params.limit : 24;
            const base = this.baseUrl.replace(/\/$/, '');
            const url = base +
                '/api/Candles/json/' +
                encodeURIComponent(exchange) +
                '/' +
                encodeURIComponent(symbol) +
                '/' +
                encodeURIComponent(interval) +
                '?limit=' +
                limit;
            try {
                const request = this.buildProxyRequestConfig(url);
                const response = await fetchWithTimeout(request.url, request.options, this.requestTimeoutMs);
                if (!response || !response.ok) {
                    throw new Error('GenericProvider: candles response not ok');
                }
                const json = await response.json();
                if (Array.isArray(json.candles)) {
                    return json.candles;
                }
                return [];
            }
            catch (err) {
                this.logger('GenericProvider: error fetching candles', err);
                throw err;
            }
        }
        // Build fetch options that disable caching when targeting the tproxy backend.
        buildProxyRequestConfig(url, baseOptions) {
            if (!url || typeof url !== 'string') {
                return {
                    url: url,
                    options: baseOptions
                };
            }
            const normalizedBase = this.normalizedBaseUrl;
            const normalizedUrl = url.replace(/\/$/, '');
            if (!normalizedBase || normalizedUrl.indexOf(normalizedBase) !== 0) {
                return {
                    url: url,
                    options: baseOptions
                };
            }
            const options = Object.assign({}, baseOptions || {});
            options.cache = 'no-store';
            const headers = Object.assign({}, options.headers || {});
            headers['cache-control'] = 'no-cache';
            headers['pragma'] = 'no-cache';
            options.headers = headers;
            return {
                url: appendCacheBypassParam(url),
                options: options
            };
        }
        transformTickerResponse(responseJson) {
            const json = responseJson || {};
            const last = toFiniteNumber(json.last);
            if (!Number.isFinite(last) || last < 0) {
                throw new Error('GenericProvider: invalid ticker price');
            }
            const pair = typeof json.symbol === 'string'
                ? json.symbol
                : typeof json.pair === 'string'
                    ? json.pair
                    : '';
            return {
                changeDaily: toFiniteNumber(json.dailyChange) || 0,
                changeDailyPercent: toFiniteNumber(json.dailyChangeRelative) || 0,
                last,
                volume: toFiniteNumber(json.volume) || 0,
                high: toFiniteNumber(json.high24h) || 0,
                low: toFiniteNumber(json.low24h) || 0,
                pair,
                pairDisplay: typeof json.symbolDisplay === 'string' ? json.symbolDisplay : pair
            };
        }
        buildEmptyTicker(symbol) {
            const sym = symbol || '';
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
});
