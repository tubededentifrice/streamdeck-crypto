"use strict";

interface GlobalCryptoTickerScope extends Record<string, unknown> {
    CryptoTickerConstants?: CryptoTickerConstants;
}

interface CryptoTickerConstants {
    TIMESTAMP_SECONDS_THRESHOLD: number;
    DEFAULT_PRICE_BAR_POSITION: number;
}

(function factoryLoader(root: GlobalCryptoTickerScope, factory: () => CryptoTickerConstants) {
    const exports = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = exports;
    } else {
        const current = (root.CryptoTickerConstants || {}) as CryptoTickerConstants;
        root.CryptoTickerConstants = Object.assign({}, current, exports);
    }
}((typeof globalThis !== "undefined" ? globalThis : self) as GlobalCryptoTickerScope, function buildConstants(): CryptoTickerConstants {
    const TIMESTAMP_SECONDS_THRESHOLD = 9_999_999_999;
    const DEFAULT_PRICE_BAR_POSITION = 0.5;

    return {
        TIMESTAMP_SECONDS_THRESHOLD,
        DEFAULT_PRICE_BAR_POSITION
    };
}));
