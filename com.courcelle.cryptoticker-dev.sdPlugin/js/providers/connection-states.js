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
    const globalRoot = (typeof globalThis !== "undefined" ? globalThis : root);
    const exportsValue = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = exportsValue;
    }
    if (globalRoot) {
        globalRoot.CryptoTickerConnectionStates = exportsValue;
    }
}(typeof self !== "undefined" ? self : this, function buildConnectionStates() {
    return ConnectionStates;
}));
