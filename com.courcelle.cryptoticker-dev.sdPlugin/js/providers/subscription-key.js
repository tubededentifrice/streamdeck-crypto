"use strict";
(function (root, factory) {
    const globalRoot = (typeof globalThis !== "undefined" ? globalThis : root);
    const exportsValue = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = exportsValue;
    }
    if (globalRoot) {
        globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
        globalRoot.CryptoTickerProviders.buildSubscriptionKey = exportsValue.buildSubscriptionKey;
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
