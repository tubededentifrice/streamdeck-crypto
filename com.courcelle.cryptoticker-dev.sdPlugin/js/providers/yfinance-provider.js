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
        root.CryptoTickerProviders.YFinanceProvider = exports.YFinanceProvider;
    }
}(typeof self !== "undefined" ? self : this, function (providerInterfaceModule, genericModule) {
    const ProviderInterface = providerInterfaceModule.ProviderInterface || providerInterfaceModule;
    const GenericProvider = genericModule.GenericProvider || genericModule;

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
