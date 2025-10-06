"use strict";
// Using as const for immutable constants with literal types
const CONSTANTS = {
    TIMESTAMP_SECONDS_THRESHOLD: 9999999999,
    DEFAULT_PRICE_BAR_POSITION: 0.5
};
(function factoryLoader(root, factory) {
    const exports = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = exports;
    }
    else {
        const current = root.CryptoTickerConstants || {};
        root.CryptoTickerConstants = Object.assign({}, current, exports);
    }
}((typeof globalThis !== "undefined" ? globalThis : self), function buildConstants() {
    return CONSTANTS;
}));
