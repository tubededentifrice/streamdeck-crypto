(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.CryptoTickerProviders = root.CryptoTickerProviders || {};
        const exports = factory();
        root.CryptoTickerProviders.buildSubscriptionKey = exports.buildSubscriptionKey;
    }
}(typeof self !== "undefined" ? self : this, function () {
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
        buildSubscriptionKey: buildSubscriptionKey
    };
}));
