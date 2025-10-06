/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-this-alias, no-var */
// @ts-nocheck
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.CryptoTickerProviders = root.CryptoTickerProviders || {};
        const exports = factory();
        root.CryptoTickerProviders.WebSocketConnectionPool = exports.WebSocketConnectionPool;
    }
}(typeof self !== "undefined" ? self : this, function () {
    function noop() {}

    function mergeMeta(target, updates) {
        if (!updates || typeof updates !== "object") {
            return target;
        }

        const keys = Object.keys(updates);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            target[key] = updates[key];
        }
        return target;
    }

    class WebSocketConnectionPool {
        constructor(options) {
            const opts = options || {};
            this.logger = typeof opts.logger === "function" ? opts.logger : noop;
            this.createWebSocket = typeof opts.createWebSocket === "function" ? opts.createWebSocket : null;
            this.subscribeHandler = typeof opts.subscribe === "function" ? opts.subscribe : null;
            this.unsubscribeHandler = typeof opts.unsubscribe === "function" ? opts.unsubscribe : null;
            this.handleMessageFn = typeof opts.handleMessage === "function" ? opts.handleMessage : null;
            this.onOpen = typeof opts.onOpen === "function" ? opts.onOpen : null;
            this.onError = typeof opts.onError === "function" ? opts.onError : null;
            this.onClose = typeof opts.onClose === "function" ? opts.onClose : null;
            this.reconnectDelayMs = typeof opts.reconnectDelayMs === "number" ? opts.reconnectDelayMs : 5000;
            this.autoCloseDelayMs = typeof opts.autoCloseDelayMs === "number" ? opts.autoCloseDelayMs : 0;
            this.shouldResubscribeOnReconnect = opts.shouldResubscribeOnReconnect !== false;

            this.symbolEntries = {};
            this.ws = null;
            this.wsClosedByUser = false;
            this.reconnectTimer = null;
            this.closeTimer = null;
            this.isConnecting = false;
        }

        // Pool used by Binance/Bitfinex: multiplex symbols on one socket to stay under WebView limits.
        subscribe(symbol, subscriberOptions) {
            const normalizedSymbol = typeof symbol === "string" ? symbol : "";
            if (!normalizedSymbol) {
                this.logger("WebSocketConnectionPool: subscribe called without symbol");
                return null;
            }

            if (!this.createWebSocket) {
                this.logger("WebSocketConnectionPool: createWebSocket not configured");
                return null;
            }

            const subscriber = this.buildSubscriber(subscriberOptions);
            if (!subscriber.onData) {
                this.logger("WebSocketConnectionPool: subscriber missing onData handler for", normalizedSymbol);
                return null;
            }

            let entry = this.symbolEntries[normalizedSymbol];
            if (!entry) {
                entry = {
                    symbol: normalizedSymbol,
                    subscribers: [],
                    subscribed: false,
                    subscriptionRequested: false,
                    meta: {}
                };
                this.symbolEntries[normalizedSymbol] = entry;
            }

            entry.subscribers.push(subscriber);
            this.clearCloseTimer();
            this.ensureConnection();

            if (this.isSocketOpen() && !entry.subscribed && !entry.subscriptionRequested) {
                this.requestSubscribe(entry);
            }

            const self = this;
            return {
                symbol: normalizedSymbol,
                unsubscribe: function () {
                    self.removeSubscriber(normalizedSymbol, subscriber);
                },
                updateMetadata: function (updates) {
                    self.updateSymbolMetadata(normalizedSymbol, updates);
                },
                getMetadata: function () {
                    const target = self.symbolEntries[normalizedSymbol];
                    return target ? target.meta : null;
                }
            };
        }

        removeSubscriber(symbol, subscriber) {
            const entry = this.symbolEntries[symbol];
            if (!entry) {
                return;
            }

            const idx = entry.subscribers.indexOf(subscriber);
            if (idx >= 0) {
                entry.subscribers.splice(idx, 1);
            }

            if (entry.subscribers.length > 0) {
                return;
            }

            if (this.isSocketOpen() && this.unsubscribeHandler && (entry.subscribed || entry.subscriptionRequested)) {
                try {
                    this.unsubscribeHandler(this.ws, symbol, entry.meta);
                } catch (err) {
                    this.logger("WebSocketConnectionPool: unsubscribe handler error", err);
                }
            }

            delete this.symbolEntries[symbol];
            this.maybeCloseConnection();
        }

        ensureConnection() {
            if (this.ws || this.isConnecting) {
                return;
            }

            let ws = null;
            try {
                ws = this.createWebSocket();
            } catch (err) {
                this.logger("WebSocketConnectionPool: failed to create WebSocket", err);
                return;
            }

            if (!ws) {
                this.logger("WebSocketConnectionPool: createWebSocket returned falsy value");
                this.scheduleReconnect();
                return;
            }

            this.ws = ws;
            this.wsClosedByUser = false;
            this.isConnecting = true;
            this.attachSocketHandlers(ws);
        }

        attachSocketHandlers(ws) {
            const self = this;

            ws.onopen = function () {
                self.isConnecting = false;
                if (self.onOpen) {
                    try {
                        self.onOpen(self.ws);
                    } catch (err) {
                        self.logger("WebSocketConnectionPool: onOpen handler error", err);
                    }
                }
                self.flushPendingSubscriptions();
            };

            ws.onmessage = function (event) {
                if (!self.handleMessageFn) {
                    return;
                }
                try {
                    self.handleMessageFn(event, self.buildMessageHelpers());
                } catch (err) {
                    self.logger("WebSocketConnectionPool: handleMessage error", err);
                }
            };

            ws.onerror = function (err) {
                if (self.onError) {
                    try {
                        self.onError(err);
                    } catch (handlerErr) {
                        self.logger("WebSocketConnectionPool: onError handler error", handlerErr);
                    }
                }
            };

            ws.onclose = function (event) {
                self.handleSocketClose(event);
            };
        }

        handleSocketClose(event) {
            if (this.onClose) {
                try {
                    this.onClose(event);
                } catch (err) {
                    this.logger("WebSocketConnectionPool: onClose handler error", err);
                }
            }

            const hadSubscribers = this.hasSubscribers();
            this.isConnecting = false;
            this.ws = null;

            if (!this.wsClosedByUser && hadSubscribers) {
                this.resetSubscriptionState();
                this.notifyAllDisconnected();
                this.scheduleReconnect();
                return;
            }

            this.wsClosedByUser = false;
            this.resetSubscriptionState();
        }

        resetSubscriptionState() {
            const symbols = Object.keys(this.symbolEntries);
            for (let i = 0; i < symbols.length; i++) {
                const entry = this.symbolEntries[symbols[i]];
                entry.subscribed = false;
                entry.subscriptionRequested = false;
            }
        }

        scheduleReconnect() {
            if (this.reconnectTimer || !this.hasSubscribers()) {
                return;
            }

            const self = this;
            this.reconnectTimer = setTimeout(function () {
                self.reconnectTimer = null;
                if (!self.hasSubscribers()) {
                    return;
                }
                self.ensureConnection();
            }, this.reconnectDelayMs);
        }

        clearReconnectTimer() {
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
        }

        flushPendingSubscriptions() {
            const symbols = Object.keys(this.symbolEntries);
            for (let i = 0; i < symbols.length; i++) {
                const entry = this.symbolEntries[symbols[i]];
                if (!entry.subscribed && !entry.subscriptionRequested) {
                    this.requestSubscribe(entry);
                }
            }
        }

        requestSubscribe(entry) {
            if (!entry || !this.isSocketOpen()) {
                return;
            }

            if (!this.subscribeHandler) {
                entry.subscribed = true;
                this.notifySubscribed(entry.symbol, null);
                return;
            }

            try {
                entry.subscriptionRequested = true;
                this.subscribeHandler(this.ws, entry.symbol, entry.meta);
            } catch (err) {
                entry.subscriptionRequested = false;
                this.logger("WebSocketConnectionPool: subscribe handler error", err);
                this.notifySubscribeError(entry.symbol, err);
            }
        }

        notifySubscribed(symbol, metaUpdates) {
            const entry = this.symbolEntries[symbol];
            if (!entry) {
                return;
            }

            if (entry.subscribed) {
                if (metaUpdates) {
                    mergeMeta(entry.meta, metaUpdates);
                }
                return;
            }

            entry.subscribed = true;
            entry.subscriptionRequested = false;
            if (metaUpdates) {
                mergeMeta(entry.meta, metaUpdates);
            }

            const subscribers = entry.subscribers;
            for (let i = 0; i < subscribers.length; i++) {
                const subscriber = subscribers[i];
                if (subscriber.onSubscribed) {
                    try {
                        subscriber.onSubscribed(subscriber.context);
                    } catch (err) {
                        this.logger("WebSocketConnectionPool: onSubscribed handler error", err);
                    }
                }
            }
        }

        notifySubscribeError(symbol, err) {
            const entry = this.symbolEntries[symbol];
            if (!entry) {
                return;
            }

            const subscribers = entry.subscribers;
            for (let i = 0; i < subscribers.length; i++) {
                const subscriber = subscribers[i];
                if (subscriber.onError) {
                    try {
                        subscriber.onError(err, subscriber.context);
                    } catch (handlerErr) {
                        this.logger("WebSocketConnectionPool: onError handler error", handlerErr);
                    }
                }
            }
        }

        notifyAllDisconnected() {
            const symbols = Object.keys(this.symbolEntries);
            for (let i = 0; i < symbols.length; i++) {
                this.notifyDisconnected(symbols[i]);
            }
        }

        notifyDisconnected(symbol) {
            const entry = this.symbolEntries[symbol];
            if (!entry) {
                return;
            }

            const subscribers = entry.subscribers;
            for (let i = 0; i < subscribers.length; i++) {
                const subscriber = subscribers[i];
                if (subscriber.onDisconnected) {
                    try {
                        subscriber.onDisconnected(subscriber.context);
                    } catch (err) {
                        this.logger("WebSocketConnectionPool: onDisconnected handler error", err);
                    }
                }
            }
        }

        // Notify each subscriber; keep context so provider metadata (chanId etc.) sticks around.
        dispatch(symbol, payload, rawMessage) {
            const entry = this.symbolEntries[symbol];
            if (!entry) {
                return;
            }

            const subscribers = entry.subscribers;
            for (let i = 0; i < subscribers.length; i++) {
                const subscriber = subscribers[i];
                if (!subscriber.onData) {
                    continue;
                }
                try {
                    subscriber.onData(payload, rawMessage, subscriber.context);
                } catch (err) {
                    this.logger("WebSocketConnectionPool: subscriber onData error", err);
                }
            }
        }

        dispatchToAll(payload, rawMessage) {
            const symbols = Object.keys(this.symbolEntries);
            for (let i = 0; i < symbols.length; i++) {
                this.dispatch(symbols[i], payload, rawMessage);
            }
        }

        markSymbolSubscribed(symbol, metaUpdates) {
            this.notifySubscribed(symbol, metaUpdates);
        }

        markSymbolUnsubscribed(symbol) {
            const entry = this.symbolEntries[symbol];
            if (!entry) {
                return;
            }
            entry.subscribed = false;
            entry.subscriptionRequested = false;
        }

        updateSymbolMetadata(symbol, updates) {
            const entry = this.symbolEntries[symbol];
            if (!entry) {
                return;
            }
            mergeMeta(entry.meta, updates);
        }

        getSymbolMetadata(symbol) {
            const entry = this.symbolEntries[symbol];
            return entry ? entry.meta : null;
        }

        findSymbolByMeta(predicate) {
            if (typeof predicate !== "function") {
                return null;
            }

            const symbols = Object.keys(this.symbolEntries);
            for (let i = 0; i < symbols.length; i++) {
                const entry = this.symbolEntries[symbols[i]];
                if (predicate(entry.meta, entry.symbol)) {
                    return entry.symbol;
                }
            }

            return null;
        }

        hasSubscribers() {
            const symbols = Object.keys(this.symbolEntries);
            for (let i = 0; i < symbols.length; i++) {
                if (this.symbolEntries[symbols[i]].subscribers.length > 0) {
                    return true;
                }
            }
            return false;
        }

        maybeCloseConnection() {
            if (this.hasSubscribers()) {
                return;
            }

            if (this.autoCloseDelayMs > 0) {
                this.scheduleCloseTimer();
            } else {
                this.closeConnection();
            }
        }

        scheduleCloseTimer() {
            if (this.closeTimer) {
                return;
            }

            const self = this;
            this.closeTimer = setTimeout(function () {
                self.closeTimer = null;
                if (!self.hasSubscribers()) {
                    self.closeConnection();
                }
            }, this.autoCloseDelayMs);
        }

        clearCloseTimer() {
            if (this.closeTimer) {
                clearTimeout(this.closeTimer);
                this.closeTimer = null;
            }
        }

        closeConnection() {
            this.clearReconnectTimer();
            if (!this.ws) {
                return;
            }

            this.wsClosedByUser = true;
            try {
                this.ws.close();
            } catch (err) {
                this.logger("WebSocketConnectionPool: error closing WebSocket", err);
            }
            this.ws = null;
        }

        buildSubscriber(options) {
            const opts = options || {};
            return {
                context: opts.context || null,
                onData: typeof opts.onData === "function" ? opts.onData : null,
                onError: typeof opts.onError === "function" ? opts.onError : null,
                onSubscribed: typeof opts.onSubscribed === "function" ? opts.onSubscribed : null,
                onDisconnected: typeof opts.onDisconnected === "function" ? opts.onDisconnected : null
            };
        }

        buildMessageHelpers() {
            const self = this;
            return {
                dispatch: function (symbol, payload, rawMessage) {
                    self.dispatch(symbol, payload, rawMessage);
                },
                dispatchToAll: function (payload, rawMessage) {
                    self.dispatchToAll(payload, rawMessage);
                },
                markSubscribed: function (symbol, metaUpdates) {
                    self.markSymbolSubscribed(symbol, metaUpdates);
                },
                markUnsubscribed: function (symbol) {
                    self.markSymbolUnsubscribed(symbol);
                },
                updateMetadata: function (symbol, updates) {
                    self.updateSymbolMetadata(symbol, updates);
                },
                getMetadata: function (symbol) {
                    return self.getSymbolMetadata(symbol);
                },
                findSymbol: function (predicate) {
                    return self.findSymbolByMeta(predicate);
                },
                getActiveSymbols: function () {
                    return Object.keys(self.symbolEntries);
                }
            };
        }

        isSocketOpen() {
            return this.ws && this.ws.readyState === 1;
        }
    }

    return {
        WebSocketConnectionPool: WebSocketConnectionPool
    };
}));
