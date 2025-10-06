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

    test("tracks last good ticker values and clears on reset", () => {
        tickerState.setLastGoodTicker("ctx", { last: 10 }, 1000);
        const stored = tickerState.getLastGoodTicker("ctx");
        expect(stored.timestamp).toBe(1000);
        expect(stored.values).toEqual({ last: 10 });

        tickerState.clearLastGoodTicker("ctx");
        expect(tickerState.getLastGoodTicker("ctx")).toBeNull();
    });

    test("getOrCreateConversionRateEntry returns cached object", () => {
        const first = tickerState.getOrCreateConversionRateEntry("USD_EUR");
        first.rate = 1.1;
        const second = tickerState.getOrCreateConversionRateEntry("USD_EUR");
        expect(second.rate).toBe(1.1);
    });

    test("resetAllState clears subscriptions and invokes unsubscribe", () => {
        const unsubscribe = jest.fn();
        tickerState.setSubscription("ctx", { unsubscribe });
        tickerState.resetAllState();
        expect(unsubscribe).toHaveBeenCalled();
        expect(tickerState.getSubscription("ctx")).toBeNull();
    });
});
