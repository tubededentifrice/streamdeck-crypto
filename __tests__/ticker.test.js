const ticker = require("../src/com.courcelle.cryptoticker.sdPlugin/js/ticker.js");

test("subscription key builds with conversion", () => {
    const key = ticker.getSubscriptionContextKey("BITFINEX", "BTCUSD", "USD", "EUR");
    expect(key).toBe("BITFINEX__BTCUSD__USD_EUR");
});

test("subscription key without conversion", () => {
    const key = ticker.getSubscriptionContextKey("BITFINEX", "BTCUSD", null, null);
    expect(key).toBe("BITFINEX__BTCUSD");
});

test("canvas size multiplier", () => {
    const mult = ticker.getCanvasSizeMultiplier(288, 144);
    expect(mult).toBe(2);
});

test("rounded value pads digits", () => {
    expect(ticker.getRoundedValue(12, 2, 1)).toBe("12.00");
    expect(ticker.getRoundedValue(12.3456, 2, 1)).toBe("12.35");
});

test("normalize value", () => {
    expect(ticker.normalizeValue(5, 0, 10)).toBeCloseTo(0.5);
});
