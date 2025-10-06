"use strict";
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    }
    else {
        root.CryptoTickerConnectionStates = factory();
    }
}(typeof self !== "undefined" ? self : this, function buildConnectionStates() {
    return {
        LIVE: "live",
        DETACHED: "detached",
        BACKUP: "backup",
        BROKEN: "broken"
    };
}));
