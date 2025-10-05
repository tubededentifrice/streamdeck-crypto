const path = require("path");

const { BinanceProvider } = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/binance-provider.js");

function createProvider() {
    return new BinanceProvider({
        baseUrl: "https://example.com",
        binanceRestBaseUrl: "https://example.com",
        binanceWsBaseUrl: "wss://example.com/ws"
    });
}

test("binance percent change normalizes to decimal", () => {
    const provider = createProvider();
    const params = { symbol: "BTCUSDT" };
    const restTicker = provider.transformRestTicker({
        priceChange: "10",
        priceChangePercent: "5",
        lastPrice: "100",
        volume: "2",
        highPrice: "110",
        lowPrice: "90"
    }, params, "BTCUSDT");

    expect(restTicker.changeDaily).toBeCloseTo(10);
    expect(restTicker.changeDailyPercent).toBeCloseTo(0.05);

    const streamTicker = provider.transformStreamTicker({
        p: "-8",
        P: "-4",
        c: "101",
        v: "3",
        h: "120",
        l: "95"
    }, { params }, "BTCUSDT");

    expect(streamTicker.changeDaily).toBeCloseTo(-8);
    expect(streamTicker.changeDailyPercent).toBeCloseTo(-0.04);
});
