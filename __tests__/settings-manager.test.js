const settingsManager = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/settings-manager");
const tickerState = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/ticker-state");

describe("settings-manager", () => {
    beforeEach(() => {
        tickerState.resetAllState();
    });

    test("refreshSettings applies defaults and stores context", () => {
        const updateSubscription = jest.fn();
        const result = settingsManager.refreshSettings({
            context: "alpha",
            settings: { exchange: "binance", pair: "ethusd" },
            updateSubscription
        });

        expect(result.exchange).toBe("BINANCE");
        expect(updateSubscription).toHaveBeenCalledWith(expect.objectContaining({ exchange: "BINANCE" }));

        const details = tickerState.getContextDetails("alpha");
        expect(details).not.toBeNull();
        expect(details.settings.pair).toBe("ETHUSD");
    });

    test("applyDefaultSettings normalizes numeric bounds and casing", () => {
        const applied = settingsManager.applyDefaultSettings({
            exchange: " bitfinex ",
            digits: 25,
            multiplier: -5,
            priceFormat: "PLAIN"
        });

        expect(applied.exchange).toBe("BITFINEX");
        expect(applied.digits).toBe(10);
        expect(applied.multiplier).toBe(0);
        expect(applied.priceFormat).toBe("plain");
    });

    test("refreshSettings tolerates missing updateSubscription callback", () => {
        expect(() => {
            settingsManager.refreshSettings({
                context: "noop",
                settings: { currency: "eur" }
            });
        }).not.toThrow();

        const stored = tickerState.getContextDetails("noop");
        expect(stored.settings.currency).toBe("EUR");
    });
});
