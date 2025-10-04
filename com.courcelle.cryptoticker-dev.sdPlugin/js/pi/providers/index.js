(function (root) {
    const namespace = root.CryptoTickerPIProviders = root.CryptoTickerPIProviders || {};
    const providers = namespace._providers = namespace._providers || {};

    namespace.registerProvider = function (provider) {
        if (!provider || typeof provider.id !== "string") {
            return;
        }

        providers[provider.id.toUpperCase()] = provider;
    };

    namespace.getProvider = function (providerId) {
        if (typeof providerId !== "string") {
            return null;
        }

        return providers[providerId.toUpperCase()] || null;
    };

    namespace.listProviders = function () {
        return Object.keys(providers);
    };
}(typeof self !== "undefined" ? self : this));
