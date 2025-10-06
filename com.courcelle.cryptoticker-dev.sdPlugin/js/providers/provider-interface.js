(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.CryptoTickerProviders = root.CryptoTickerProviders || {};
        const exports = factory();
        root.CryptoTickerProviders.ProviderInterface = exports.ProviderInterface;
    }
}(typeof self !== "undefined" ? self : this, function () {
    function noop() {}

    // Base class for exchange integrations so ticker action can treat providers polymorphically.
    class ProviderInterface {
        constructor(options) {
            const opts = options || {};
            this.baseUrl = opts.baseUrl || "";
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

            // Intended fetch sketch: fetch baseUrl + "/api/Conversion/json/...", parse JSON, return parseFloat(rate).
            return 1;
        }
    }

    return {
        ProviderInterface: ProviderInterface
    };
}));
