const ticker = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js");

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

test("rounded value adjusts for large numbers", () => {
    expect(ticker.getRoundedValue(150.123, 2, 1)).toBe("150");
    expect(ticker.getRoundedValue(150000, 2, 1)).toBe("150.00k");
});

test("normalize value", () => {
    expect(ticker.normalizeValue(5, 0, 10)).toBeCloseTo(0.5);
});

test("prepareCandlesForDisplay keeps latest entries ordered", () => {
    const candles = [
        { ts: 100, open: 1, close: 1, high: 2, low: 0, volumeQuote: 10 },
        { ts: 300, open: 3, close: 4, high: 5, low: 3, volumeQuote: 30 },
        { ts: 200, open: 2, close: 2, high: 3, low: 1, volumeQuote: 20 }
    ];

    const prepared = ticker.prepareCandlesForDisplay(candles, 2);

    expect(prepared).toHaveLength(2);
    expect(prepared[0].ts).toBe(200);
    expect(prepared[1].ts).toBe(300);
});

test("getCandlesNormalized spans full width for prepared candles", () => {
    const candles = ticker.prepareCandlesForDisplay([
        { ts: 100, open: 1, close: 1.5, high: 2, low: 1, volumeQuote: 10 },
        { ts: 200, open: 1.5, close: 2, high: 2.5, low: 1.5, volumeQuote: 15 }
    ], 2);

    const normalized = ticker.getCandlesNormalized(candles);

    expect(normalized[0].timePercent).toBeCloseTo(0);
    expect(normalized[normalized.length - 1].timePercent).toBeCloseTo(1);
});
