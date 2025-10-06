(function (root: Record<string, unknown>, factory: () => SubscriptionKeyExports) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        const namespace = (root.CryptoTickerProviders as Record<string, unknown> | undefined) || {};
        root.CryptoTickerProviders = namespace;
        const exports = factory();
        (namespace as Record<string, unknown>).buildSubscriptionKey = exports.buildSubscriptionKey;
    }
}(typeof self !== "undefined" ? (self as unknown as Record<string, unknown>) : (this as unknown as Record<string, unknown>), function buildSubscriptionKeyModule(): SubscriptionKeyExports {
    function buildSubscriptionKey(
        exchange: string | null | undefined,
        symbol: string | null | undefined,
        fromCurrency: string | null | undefined,
        toCurrency: string | null | undefined
    ): string {
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

interface SubscriptionKeyExports {
    buildSubscriptionKey(
        exchange: string | null | undefined,
        symbol: string | null | undefined,
        fromCurrency: string | null | undefined,
        toCurrency: string | null | undefined
    ): string;
}
