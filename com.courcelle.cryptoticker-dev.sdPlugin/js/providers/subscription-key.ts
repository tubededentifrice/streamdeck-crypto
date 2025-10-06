(function (root: Record<string, unknown> | undefined, factory: () => SubscriptionKeyExports) {
    const globalRoot = (typeof globalThis !== "undefined" ? globalThis : root) as SubscriptionKeyGlobalRoot | undefined;
    const exportsValue = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = exportsValue;
    }

    if (globalRoot) {
        globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
        globalRoot.CryptoTickerProviders.buildSubscriptionKey = exportsValue.buildSubscriptionKey;
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

interface SubscriptionKeyGlobalRoot extends Record<string, unknown> {
    CryptoTickerProviders?: Record<string, unknown> & {
        buildSubscriptionKey?: unknown;
    };
}

interface SubscriptionKeyExports {
    buildSubscriptionKey(
        exchange: string | null | undefined,
        symbol: string | null | undefined,
        fromCurrency: string | null | undefined,
        toCurrency: string | null | undefined
    ): string;
}
