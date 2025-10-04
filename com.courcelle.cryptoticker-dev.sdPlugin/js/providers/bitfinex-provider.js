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
        root.CryptoTickerProviders.BitfinexProvider = exports.BitfinexProvider;
    }
}(typeof self !== "undefined" ? self : this, function (providerInterfaceModule, genericModule) {
    const ProviderInterface = providerInterfaceModule.ProviderInterface || providerInterfaceModule;
    const GenericProvider = genericModule.GenericProvider || genericModule;

    class BitfinexProvider extends ProviderInterface {
        constructor(options) {
            super(options);
            const opts = options || {};
            this.genericFallback = opts.genericFallback instanceof GenericProvider
                ? opts.genericFallback
                : new GenericProvider(options);
        }

        getId() {
            return "BITFINEX";
        }

        ensureConnection() {
            this.genericFallback.ensureConnection();
        }

        subscribeTicker(params, handlers) {
            // TODO: implement Bitfinex WebSocket feed (wss://api-pub.bitfinex.com/ws/2) with fallback.
            return this.genericFallback.subscribeTicker(params, handlers);
        }

        async fetchTicker(params) {
            // TODO: implement Bitfinex REST call (https://api-pub.bitfinex.com/v2/ticker) before falling back.
            return this.genericFallback.fetchTicker(params);
        }

        getCachedTicker(key) {
            return this.genericFallback.getCachedTicker(key);
        }
    }

    return {
        BitfinexProvider: BitfinexProvider
    };
}));
