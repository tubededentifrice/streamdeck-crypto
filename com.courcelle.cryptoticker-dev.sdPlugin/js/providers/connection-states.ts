(function (root: Record<string, unknown>, factory: () => ConnectionStatesMap) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.CryptoTickerConnectionStates = factory();
    }
}(typeof self !== "undefined" ? (self as unknown as Record<string, unknown>) : (this as unknown as Record<string, unknown>), function buildConnectionStates(): ConnectionStatesMap {
    return {
        LIVE: "live",
        DETACHED: "detached",
        BACKUP: "backup",
        BROKEN: "broken"
    };
}));

type ConnectionStatesMap = {
    readonly LIVE: CryptoTickerConnectionState;
    readonly DETACHED: CryptoTickerConnectionState;
    readonly BACKUP: CryptoTickerConnectionState;
    readonly BROKEN: CryptoTickerConnectionState;
};
