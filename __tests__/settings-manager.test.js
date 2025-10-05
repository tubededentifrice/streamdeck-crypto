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
});
