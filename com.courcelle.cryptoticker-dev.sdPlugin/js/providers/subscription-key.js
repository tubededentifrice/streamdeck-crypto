"use strict";
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    }
    else {
        const namespace = root.CryptoTickerProviders || {};
        root.CryptoTickerProviders = namespace;
        const exports = factory();
        namespace.buildSubscriptionKey = exports.buildSubscriptionKey;
    }
}(typeof self !== "undefined" ? self : this, function buildSubscriptionKeyModule() {
    function buildSubscriptionKey(exchange, symbol, fromCurrency, toCurrency) {
        const exchangePart = exchange || "";
        const symbolPart = symbol || "";
        const fromPart = fromCurrency || null;
        const toPart = toCurrency || null;
        let convertPart = "";
        if (fromPart !== null && toPart !== null && fromPart !== toPart) {
            convertPart = "__" + fromPart + "_" + toPart;
        }
        return exchangePart + "__" + symbolPart + convertPart;
    }
    return {
        buildSubscriptionKey
    };
}));
