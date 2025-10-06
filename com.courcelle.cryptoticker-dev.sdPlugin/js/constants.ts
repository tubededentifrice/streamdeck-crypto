"use strict";

// Using as const for immutable constants with literal types
const CONSTANTS = {
    TIMESTAMP_SECONDS_THRESHOLD: 9_999_999_999,
    DEFAULT_PRICE_BAR_POSITION: 0.5
} as const;

type CryptoTickerConstants = typeof CONSTANTS;

interface GlobalCryptoTickerScope extends Record<string, unknown> {
    CryptoTickerConstants?: CryptoTickerConstants;
}

(function factoryLoader(root: GlobalCryptoTickerScope, factory: () => CryptoTickerConstants) {
    const exports = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = exports;
    } else {
        const current = root.CryptoTickerConstants || ({} as Partial<CryptoTickerConstants>);
        root.CryptoTickerConstants = Object.assign({}, current, exports) as CryptoTickerConstants;
    }
}((typeof globalThis !== "undefined" ? globalThis : self) as GlobalCryptoTickerScope, function buildConstants(): CryptoTickerConstants {
    return CONSTANTS;
}));
