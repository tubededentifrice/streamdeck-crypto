const { BinanceProvider } = require("../../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/binance-provider.js");

function createProvider(overrides) {
    return new BinanceProvider(Object.assign({
        baseUrl: "https://example.com",
        binanceRestBaseUrl: "https://example.com",
        binanceWsBaseUrl: "wss://example.com/ws"
    }, overrides));
}

describe("BinanceProvider", () => {
    test("percent change normalizes to decimal", () => {
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

    test("sendBinanceSubscription emits subscribe payload with incrementing id", () => {
        const provider = createProvider();
        provider.wsRequestId = 0;
        const ws = { send: jest.fn() };

        provider.sendBinanceSubscription(ws, "BTCUSDT", true);
        provider.sendBinanceSubscription(ws, "BTCUSDT", false);

        const [firstPayload, secondPayload] = ws.send.mock.calls.map(call => JSON.parse(call[0]));
        expect(firstPayload.method).toBe("SUBSCRIBE");
        expect(firstPayload.params).toEqual(["btcusdt@ticker"]);
        expect(secondPayload.method).toBe("UNSUBSCRIBE");
        expect(secondPayload.id).toBe(firstPayload.id + 1);
    });

    test("fetchTicker falls back to generic provider on failure", async () => {
        const provider = createProvider();
        provider.fetchTickerDirect = jest.fn().mockRejectedValue(new Error("network"));
        provider.genericFallback = {
            fetchTicker: jest.fn().mockResolvedValue({ pair: "fallback" })
        };

        const result = await provider.fetchTicker({ symbol: "BTCUSD" });
        expect(result.pair).toBe("fallback");
        expect(provider.genericFallback.fetchTicker).toHaveBeenCalled();
    });

    test("handlePoolMessage dispatches parsed ticker payload", () => {
        const provider = createProvider();
        const markSubscribed = jest.fn();
        const dispatch = jest.fn();

        provider.handlePoolMessage({
            data: JSON.stringify({
                data: {
                    s: "ethusdt",
                    c: "2000",
                    v: "5"
                }
            })
        }, {
            markSubscribed,
            dispatch
        });

        expect(markSubscribed).toHaveBeenCalledWith("ETHUSDT");
        expect(dispatch).toHaveBeenCalledWith("ETHUSDT", expect.objectContaining({ c: "2000" }), expect.any(Object));
    });

    test("resolveSymbol applies overrides and USDT mapping", () => {
        const provider = createProvider({ binanceSymbolOverrides: { BTCUSDC: "BTCPERP" } });

        expect(provider.resolveSymbol({ symbol: "btcusdc" })).toBe("BTCPERP");
        expect(provider.resolveSymbol({ symbol: "ethusd" })).toBe("ETHUSDT");
    });
});
