"use strict";
/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-this-alias, no-var */
// @ts-nocheck
(function (root, factory) {
    const globalRoot = (typeof globalThis !== "undefined" ? globalThis : root);
    const args = typeof module === "object" && module.exports
        ? [
            require("./provider-interface"),
            require("./generic-provider")
        ]
        : [
            root === null || root === void 0 ? void 0 : root.CryptoTickerProviders,
            root === null || root === void 0 ? void 0 : root.CryptoTickerProviders
        ];
    const exportsValue = factory(args[0], args[1]);
    if (typeof module === "object" && module.exports) {
        module.exports = exportsValue;
    }
    if (globalRoot) {
        globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
        globalRoot.CryptoTickerProviders.YFinanceProvider = exportsValue.YFinanceProvider;
    }
}(typeof self !== "undefined" ? self : this, function (providerInterfaceModule, genericModule) {
    const ProviderInterface = providerInterfaceModule.ProviderInterface || providerInterfaceModule;
    const GenericProvider = genericModule.GenericProvider || genericModule;
    // Temporary GenericProvider wrapper so Yahoo wiring can ship later without breaking registry shape.
    class YFinanceProvider extends ProviderInterface {
        constructor(options) {
            super(options);
            const opts = options || {};
            this.genericFallback = opts.genericFallback instanceof GenericProvider
                ? opts.genericFallback
                : new GenericProvider(options);
        }
        getId() {
            return "YFINANCE";
        }
        ensureConnection() {
            this.genericFallback.ensureConnection();
        }
        subscribeTicker(params, handlers) {
            // TODO: implement direct Yahoo Finance streaming when available.
            return this.genericFallback.subscribeTicker(params, handlers);
        }
        async fetchTicker(params) {
            // TODO: implement Yahoo Finance REST call before falling back to proxy.
            return this.genericFallback.fetchTicker(params);
        }
        getCachedTicker(key) {
            return this.genericFallback.getCachedTicker(key);
        }
    }
    return {
        YFinanceProvider: YFinanceProvider
    };
}));
