(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory(
            require("./generic-provider"),
            require("./binance-provider"),
            require("./bitfinex-provider"),
            require("./yfinance-provider")
        );
    } else {
        root.CryptoTickerProviders = root.CryptoTickerProviders || {};
        const exports = factory(
            root.CryptoTickerProviders,
            root.CryptoTickerProviders,
            root.CryptoTickerProviders,
            root.CryptoTickerProviders
        );
        root.CryptoTickerProviders.ProviderRegistry = exports.ProviderRegistry;
    }
}(typeof self !== "undefined" ? self : this, function (genericModule, binanceModule, bitfinexModule, yfinanceModule) {
    const GenericProvider = genericModule.GenericProvider || genericModule;
    const BinanceProvider = binanceModule.BinanceProvider || binanceModule;
    const BitfinexProvider = bitfinexModule.BitfinexProvider || bitfinexModule;
    const YFinanceProvider = yfinanceModule.YFinanceProvider || yfinanceModule;

    class ProviderRegistry {
        constructor(options) {
            const opts = options || {};
            this.logger = typeof opts.logger === "function" ? opts.logger : function () {};
            this.baseUrl = opts.baseUrl || "";
            this.providers = {};
            this.fallbackPollIntervalMs = typeof opts.fallbackPollIntervalMs === "number" ? opts.fallbackPollIntervalMs : undefined;
            this.staleTickerTimeoutMs = typeof opts.staleTickerTimeoutMs === "number" ? opts.staleTickerTimeoutMs : undefined;

            const genericOptions = {
                baseUrl: this.baseUrl,
                logger: this.logger,
                fallbackPollIntervalMs: this.fallbackPollIntervalMs,
                staleTickerTimeoutMs: this.staleTickerTimeoutMs
            };

            this.genericProvider = opts.genericProvider instanceof GenericProvider
                ? opts.genericProvider
                : new GenericProvider(genericOptions);

            this.register(this.genericProvider);
            this.register(new BinanceProvider({
                baseUrl: this.baseUrl,
                logger: this.logger,
                fallbackPollIntervalMs: this.fallbackPollIntervalMs,
                staleTickerTimeoutMs: this.staleTickerTimeoutMs,
                genericFallback: this.genericProvider
            }));
            this.register(new BitfinexProvider({
                baseUrl: this.baseUrl,
                logger: this.logger,
                fallbackPollIntervalMs: this.fallbackPollIntervalMs,
                staleTickerTimeoutMs: this.staleTickerTimeoutMs,
                genericFallback: this.genericProvider
            }));
            this.register(new YFinanceProvider({
                baseUrl: this.baseUrl,
                logger: this.logger,
                fallbackPollIntervalMs: this.fallbackPollIntervalMs,
                staleTickerTimeoutMs: this.staleTickerTimeoutMs,
                genericFallback: this.genericProvider
            }));
        }

        register(provider) {
            if (!provider || typeof provider.getId !== "function") {
                return;
            }
            const id = provider.getId();
            if (id) {
                this.providers[id.toUpperCase()] = provider;
            }
        }

        getProvider(exchange) {
            const key = (exchange || "").toUpperCase();
            return this.providers[key] || this.genericProvider;
        }

        getGenericProvider() {
            return this.genericProvider;
        }

        ensureAllConnections() {
            const keys = Object.keys(this.providers);
            for (let i = 0; i < keys.length; i++) {
                const provider = this.providers[keys[i]];
                if (provider && typeof provider.ensureConnection === "function") {
                    provider.ensureConnection();
                }
            }
        }
    }

    return {
        ProviderRegistry: ProviderRegistry
    };
}));
