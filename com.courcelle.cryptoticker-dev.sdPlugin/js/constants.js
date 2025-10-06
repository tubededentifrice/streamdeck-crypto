"use strict";

(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.CryptoTickerConstants = Object.assign({}, root.CryptoTickerConstants || {}, factory());
    }
}(typeof self !== "undefined" ? self : this, function () {
    const TIMESTAMP_SECONDS_THRESHOLD = 9999999999;
    const DEFAULT_PRICE_BAR_POSITION = 0.5;

    return {
        TIMESTAMP_SECONDS_THRESHOLD,
        DEFAULT_PRICE_BAR_POSITION
    };
}));
