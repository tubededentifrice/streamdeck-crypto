// Using const enum for zero-cost abstraction at runtime
// The enum will be inlined at compile time for better performance
const enum ConnectionState {
    LIVE = "live",
    DETACHED = "detached",
    BACKUP = "backup",
    BROKEN = "broken"
}

// Export as const object for runtime compatibility with existing code
const ConnectionStates = {
    LIVE: "live" as const,
    DETACHED: "detached" as const,
    BACKUP: "backup" as const,
    BROKEN: "broken" as const
} as const;

// Type for connection state values
type ConnectionStateValue = typeof ConnectionStates[keyof typeof ConnectionStates];

// UMD module pattern for browser/CommonJS compatibility
(function (root: Record<string, unknown>, factory: () => typeof ConnectionStates) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.CryptoTickerConnectionStates = factory();
    }
}(typeof self !== "undefined" ? (self as unknown as Record<string, unknown>) : (this as unknown as Record<string, unknown>), function buildConnectionStates(): typeof ConnectionStates {
    return ConnectionStates;
}));
