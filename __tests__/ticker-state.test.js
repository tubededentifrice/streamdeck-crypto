const tickerState = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/ticker-state");

describe("ticker-state", () => {
    beforeEach(() => {
        tickerState.resetAllState();
    });

    test("stores and retrieves context details", () => {
        tickerState.setContextDetails("ctx", { exchange: "BINANCE" });
        const details = tickerState.getContextDetails("ctx");
        expect(details.settings.exchange).toBe("BINANCE");
    });

    test("manages subscriptions", () => {
        tickerState.setSubscription("ctx", { key: "abc" });
        expect(tickerState.getSubscription("ctx").key).toBe("abc");
        tickerState.clearSubscription("ctx");
        expect(tickerState.getSubscription("ctx")).toBeNull();
    });
});
