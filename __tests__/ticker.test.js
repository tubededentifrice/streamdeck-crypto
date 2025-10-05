const ticker = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js");
const defaultSettingsModule = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/default-settings.js");
const tickerState = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/ticker-state.js");
const connectionStates = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/connection-states.js");
const runtimeConfig = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/config.js");
const messageConfig = runtimeConfig.messages || {};

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
    expect(ticker.getRoundedValue(150.123, 2, 1)).toBe("150.12");
    expect(ticker.getRoundedValue(150000, 2, 1)).toBe("150.00K");
});

test("rounded value preserves configured digits across formats", () => {
    expect(ticker.getRoundedValue(122.8, 2, 1)).toBe("122.80");
    expect(ticker.getRoundedValue(122800, 2, 1)).toBe("122.80K");
    expect(ticker.getRoundedValue(122800, 2, 1, "compact")).toBe("122.80K");
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

test("convertTickerValues applies conversion without mutating original", async () => {
    const originalGetConversionRate = ticker.getConversionRate;
    ticker.getConversionRate = jest.fn().mockResolvedValue(0.5);

    const sourceTicker = {
        last: 100,
        high: 120,
        low: 80,
        open: 90,
        close: 95,
        changeDaily: 10,
        volume: 5
    };

    const converted = await ticker.convertTickerValues(sourceTicker, "USD", "EUR");

    expect(converted).not.toBe(sourceTicker);
    expect(converted.last).toBeCloseTo(50);
    expect(converted.high).toBeCloseTo(60);
    expect(converted.low).toBeCloseTo(40);
    expect(converted.open).toBeCloseTo(45);
    expect(converted.close).toBeCloseTo(47.5);
    expect(converted.changeDaily).toBeCloseTo(5);
    expect(converted.conversionRate).toBe(0.5);
    expect(converted.conversionToCurrency).toBe("EUR");
    expect(sourceTicker.last).toBe(100);

    ticker.getConversionRate = originalGetConversionRate;
});

test("getConversionRate caches results for an hour", async () => {
    const originalFetch = global.fetch;
    const mockResponse = {
        ok: true,
        json: async () => ({ rate: 1.25 })
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    try {
        const first = await ticker.getConversionRate("USD", "EUR");
        expect(first).toBeCloseTo(1.25);

        const second = await ticker.getConversionRate("usd", "eur");
        expect(second).toBeCloseTo(1.25);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    } finally {
        global.fetch = originalFetch;
    }
});

test("default settings validation normalizes values", () => {
    const normalized = defaultSettingsModule.applyDefaults({
        exchange: "bitfinex",
        displayHighLow: "OFF",
        digits: "7",
        mode: "invalid"
    });

    expect(normalized.exchange).toBe("BITFINEX");
    expect(normalized.displayHighLow).toBe("off");
    expect(normalized.digits).toBe(7);
    expect(normalized.mode).toBe("ticker");
});

describe("ticker data fallbacks", () => {
    beforeEach(() => {
        tickerState.resetAllState();
        jest.restoreAllMocks();
    });

    afterEach(() => {
        tickerState.resetAllState();
        jest.restoreAllMocks();
    });

    test("sanitizeTickerValues normalizes numeric and timestamp fields", () => {
        const source = {
            last: "123.45",
            high: "130",
            low: "",
            changeDailyPercent: "0.123",
            lastUpdated: 1700000000
        };

        const result = ticker.sanitizeTickerValues(source);

        expect(result.hasCritical).toBe(true);
        expect(result.values.last).toBeCloseTo(123.45);
        expect(result.values.high).toBeCloseTo(130);
        expect(result.values.low).toBeUndefined();
        expect(result.values.changeDailyPercent).toBeCloseTo(0.123);
        expect(result.timestamp).toBe(1700000000 * 1000);
        expect(result.values.lastUpdated).toBe(1700000000 * 1000);
    });

    test("buildTickerRenderContext caches last good values and returns stale when data disappears", () => {
        const settings = { pair: "BTC/USD" };
        const lastUpdatedSeconds = 1700000000;

        const live = ticker.buildTickerRenderContext("ctx", settings, {
            pairDisplay: "BTC/USD",
            last: 27123.45,
            high: 28000,
            low: 26000,
            changeDailyPercent: 0.012,
            lastUpdated: lastUpdatedSeconds
        }, null);

        expect(live.dataState).toBe("live");
        expect(live.lastValidTimestamp).toBe(lastUpdatedSeconds * 1000);

        const cached = tickerState.getLastGoodTicker("ctx");
        expect(cached).not.toBeNull();
        expect(cached.values.last).toBeCloseTo(27123.45);

        const fallback = ticker.buildTickerRenderContext("ctx", settings, null, null);
        expect(fallback.dataState).toBe("stale");
        expect(fallback.infoMessage).toBe(messageConfig.stale);
        expect(fallback.values.last).toBeCloseTo(27123.45);
        expect(fallback.lastValidTimestamp).toBe(lastUpdatedSeconds * 1000);
    });

    test("buildTickerRenderContext reports loading when no data has ever arrived", () => {
        const settings = { pair: "ETH/USD", title: "ETH" };

        const result = ticker.buildTickerRenderContext("empty", settings, {}, null);

        expect(result.dataState).toBe("missing");
        expect(result.infoMessage).toBe(messageConfig.loading);
        expect(result.values.pairDisplay).toBe("ETH");
    });

    test("buildTickerRenderContext reports no data when connection is broken", () => {
        const settings = { pair: "BTC/USD" };

        const result = ticker.buildTickerRenderContext("broken", settings, {}, connectionStates.BROKEN);

        expect(result.dataState).toBe("missing");
        expect(result.infoMessage).toBe(messageConfig.misconfigured || messageConfig.noData);
    });

    test("buildTickerRenderContext flags misconfigured pairs returning zero data", () => {
        const settings = { pair: "DOGE/MOON" };

        const result = ticker.buildTickerRenderContext("misconfigured", settings, {
            pair: "DOGE/MOON",
            pairDisplay: "DOGE/MOON",
            last: 0,
            high: 0,
            low: 0,
            volume: 0
        }, connectionStates.BROKEN);

        expect(result.dataState).toBe("missing");
        expect(result.infoMessage).toBe(messageConfig.misconfigured || messageConfig.noData);
        expect(result.values.pairDisplay).toBe("DOGE/MOON");
    });

    test("convertTickerValues flags conversion errors when rate fetch fails", async () => {
        const originalGetConversionRate = ticker.getConversionRate;
        ticker.getConversionRate = jest.fn().mockRejectedValue(new Error("network down"));

        try {
            const result = await ticker.convertTickerValues({
                pair: "BTC/USD",
                pairDisplay: "BTC/USD",
                last: 60000
            }, "USD", "EUR");

            expect(result.conversionError).toBe(true);
            expect(result.last).toBeUndefined();
        } finally {
            ticker.getConversionRate = originalGetConversionRate;
        }
    });

    test("buildTickerRenderContext shows conversion error message", () => {
        const settings = { pair: "BTC/USD" };

        const result = ticker.buildTickerRenderContext("conversionError", settings, {
            pair: "BTC/USD",
            conversionError: true
        }, null);

        expect(result.dataState).toBe("missing");
        expect(result.infoMessage).toBe(messageConfig.conversionError || "CONVERSION ERROR");
    });
});
