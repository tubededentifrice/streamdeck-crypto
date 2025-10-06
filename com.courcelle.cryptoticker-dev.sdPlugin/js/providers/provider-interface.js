"use strict";
(function (root, factory) {
    const globalRoot = (typeof globalThis !== "undefined" ? globalThis : root);
    const exportsValue = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = exportsValue;
    }
    if (globalRoot) {
        globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
        globalRoot.CryptoTickerProviders.ProviderInterface = exportsValue.ProviderInterface;
    }
}(typeof self !== "undefined" ? self : this, function buildProviderInterface() {
    function noop() {
        // no-op
    }
    class ProviderInterface {
        constructor(options) {
            const opts = options || {};
            this.baseUrl = typeof opts.baseUrl === "string" ? opts.baseUrl : "";
            this.logger = typeof opts.logger === "function" ? opts.logger : noop;
        }
        getId() {
            throw new Error("Provider must implement getId()");
        }
        subscribeTicker(_params, _handlers) {
            throw new Error("Provider must implement subscribeTicker()");
        }
        async fetchTicker(_params) {
            throw new Error("Provider must implement fetchTicker()");
        }
        getCachedTicker(_key) {
            return null;
        }
        async fetchCandles(_params) {
            throw new Error("Provider must implement fetchCandles()");
        }
        ensureConnection() {
            // Optional override by providers using websockets.
        }
        async fetchConversionRate(fromCurrency, toCurrency) {
            if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) {
                return 1;
            }
            return 1;
        }
    }
    return {
        ProviderInterface
    };
}));
