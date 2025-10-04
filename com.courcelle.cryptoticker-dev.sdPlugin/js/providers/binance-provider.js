(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory(
            require("./provider-interface"),
            require("./generic-provider")
        );
    } else {
        root.CryptoTickerProviders = root.CryptoTickerProviders || {};
        const exports = factory(
            root.CryptoTickerProviders,
            root.CryptoTickerProviders
        );
        root.CryptoTickerProviders.BinanceProvider = exports.BinanceProvider;
    }
}(typeof self !== "undefined" ? self : this, function (providerInterfaceModule, genericModule) {
    const ProviderInterface = providerInterfaceModule.ProviderInterface || providerInterfaceModule;
    const GenericProvider = genericModule.GenericProvider || genericModule;

    class BinanceProvider extends ProviderInterface {
        constructor(options) {
            super(options);
            const opts = options || {};
            this.genericFallback = opts.genericFallback instanceof GenericProvider
                ? opts.genericFallback
                : new GenericProvider(options);
        }

        getId() {
            return "BINANCE";
        }

        ensureConnection() {
            this.genericFallback.ensureConnection();
        }

        subscribeTicker(params, handlers) {
            // TODO: replace with direct Binance WebSocket subscription when ready.
            return this.genericFallback.subscribeTicker(params, handlers);
        }

        async fetchTicker(params) {
            // TODO: use Binance REST API (e.g., https://api.binance.com/api/v3/ticker/24hr) and map values.
            return this.genericFallback.fetchTicker(params);
        }

        getCachedTicker(key) {
            return this.genericFallback.getCachedTicker(key);
        }
    }

    return {
        BinanceProvider: BinanceProvider
    };
}));
