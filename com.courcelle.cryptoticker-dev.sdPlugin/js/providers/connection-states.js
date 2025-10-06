"use strict";
// Export as const object for runtime compatibility with existing code
const ConnectionStates = {
    LIVE: "live",
    DETACHED: "detached",
    BACKUP: "backup",
    BROKEN: "broken"
};
// UMD module pattern for browser/CommonJS compatibility
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    }
    else {
        root.CryptoTickerConnectionStates = factory();
    }
}(typeof self !== "undefined" ? self : this, function buildConnectionStates() {
    return ConnectionStates;
}));
