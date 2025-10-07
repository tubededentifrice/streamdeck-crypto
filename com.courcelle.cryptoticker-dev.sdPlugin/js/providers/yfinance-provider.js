"use strict";
/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-this-alias, no-var */
// @ts-nocheck
(function (root, factory) {
    const globalRoot = (typeof globalThis !== "undefined" ? globalThis : root);
    const args = typeof module === "object" && module.exports
        ? [
            require("./provider-interface"),
            require("./generic-provider"),
            require("./ticker-subscription-manager"),
            require("./subscription-key")
        ]
        : [
            root === null || root === void 0 ? void 0 : root.CryptoTickerProviders,
            root === null || root === void 0 ? void 0 : root.CryptoTickerProviders,
            root === null || root === void 0 ? void 0 : root.CryptoTickerProviders,
            root === null || root === void 0 ? void 0 : root.CryptoTickerProviders
        ];
    const exportsValue = factory(args[0], args[1], args[2], args[3]);
    if (typeof module === "object" && module.exports) {
        module.exports = exportsValue;
    }
    if (globalRoot) {
        globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
        globalRoot.CryptoTickerProviders.YFinanceProvider = exportsValue.YFinanceProvider;
    }
}(typeof self !== "undefined" ? self : this, function (providerInterfaceModule, genericModule, managerModule, subscriptionKeyModule) {
    const ProviderInterface = providerInterfaceModule.ProviderInterface || providerInterfaceModule;
    const GenericProvider = genericModule.GenericProvider || genericModule;
    const TickerSubscriptionManager = managerModule.TickerSubscriptionManager || managerModule;
    const buildSubscriptionKey = subscriptionKeyModule.buildSubscriptionKey || subscriptionKeyModule;
    // Temporary GenericProvider wrapper so Yahoo wiring can ship later without breaking registry shape.
    class YFinanceProvider extends ProviderInterface {
        constructor(options) {
            super(options);
            const opts = options || {};
            this.genericFallback = opts.genericFallback instanceof GenericProvider
                ? opts.genericFallback
                : new GenericProvider(options);
            const managerOptions = {
                logger: (...args) => {
                    this.logger(...args);
                },
                fetchTicker: (params) => this.genericFallback.fetchTicker(params),
                subscribeStreaming: null,
                unsubscribeStreaming: null,
                ensureConnection: null,
                buildSubscriptionKey: function (exchange, symbol, fromCurrency, toCurrency) {
                    return buildSubscriptionKey(exchange, symbol, fromCurrency, toCurrency);
                },
                fallbackPollIntervalMs: opts.fallbackPollIntervalMs,
                staleTickerTimeoutMs: opts.staleTickerTimeoutMs
            };
            this.subscriptionManager = new TickerSubscriptionManager(managerOptions);
        }
        getId() {
            return "YFINANCE";
        }
        ensureConnection() {
            // No-op: YFinance relies on REST polling instead of SignalR streaming.
        }
        subscribeTicker(params, handlers) {
            return this.subscriptionManager.subscribe(params, handlers);
        }
        async fetchTicker(params) {
            // TODO: implement Yahoo Finance REST call before falling back to proxy.
            return this.genericFallback.fetchTicker(params);
        }
        async fetchCandles(params) {
            if (this.genericFallback && typeof this.genericFallback.fetchCandles === "function") {
                return this.genericFallback.fetchCandles(params);
            }
            return ProviderInterface.prototype.fetchCandles.call(this, params);
        }
        getCachedTicker(key) {
            const cached = this.subscriptionManager.getCachedTicker(key);
            if (cached) {
                return cached;
            }
            return this.genericFallback.getCachedTicker(key);
        }
    }
    return {
        YFinanceProvider: YFinanceProvider
    };
}));
