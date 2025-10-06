"use strict";
(function factoryLoader(root, factory) {
    const exports = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = exports;
    }
    else {
        const current = (root.CryptoTickerConstants || {});
        root.CryptoTickerConstants = Object.assign({}, current, exports);
    }
}((typeof globalThis !== "undefined" ? globalThis : self), function buildConstants() {
    const TIMESTAMP_SECONDS_THRESHOLD = 9999999999;
    const DEFAULT_PRICE_BAR_POSITION = 0.5;
    return {
        TIMESTAMP_SECONDS_THRESHOLD,
        DEFAULT_PRICE_BAR_POSITION
    };
}));
