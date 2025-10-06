// Export as const object for runtime compatibility with existing code
const ConnectionStates = {
    LIVE: "live" as const,
    DETACHED: "detached" as const,
    BACKUP: "backup" as const,
    BROKEN: "broken" as const
} as const;

// UMD module pattern for browser/CommonJS compatibility
(function (root: Record<string, unknown> | undefined, factory: () => typeof ConnectionStates) {
    const globalRoot = (typeof globalThis !== "undefined" ? globalThis : root) as ConnectionStatesGlobal | undefined;
    const exportsValue = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = exportsValue;
    }

    if (globalRoot) {
        globalRoot.CryptoTickerConnectionStates = exportsValue;
    }
}(typeof self !== "undefined" ? (self as unknown as Record<string, unknown>) : (this as unknown as Record<string, unknown>), function buildConnectionStates(): typeof ConnectionStates {
    return ConnectionStates;
}));

interface ConnectionStatesGlobal extends Record<string, unknown> {
    CryptoTickerConnectionStates?: typeof ConnectionStates;
}
