const { BitfinexProvider } = require("../../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/bitfinex-provider.js");

function createProvider(overrides) {
    return new BitfinexProvider(Object.assign({
        baseUrl: "https://example.com",
        bitfinexRestBaseUrl: "https://example.com",
        bitfinexWsBaseUrl: "wss://example.com/ws"
    }, overrides));
}

describe("BitfinexProvider", () => {
    test("sendBitfinexSubscribe sends payload", () => {
        const provider = createProvider();
        const ws = { send: jest.fn() };

        provider.sendBitfinexSubscribe(ws, "tBTCUSD");

        expect(ws.send).toHaveBeenCalledWith(JSON.stringify({
            event: "subscribe",
            channel: "ticker",
            symbol: "tBTCUSD"
        }));
    });

    test("sendBitfinexUnsubscribe uses channel id from metadata", () => {
        const provider = createProvider();
        const ws = { send: jest.fn() };

        provider.sendBitfinexUnsubscribe(ws, "tBTCUSD", { chanId: 10 });
        expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ event: "unsubscribe", chanId: 10 }));
    });

    test("handlePoolMessage registers channel and dispatches data", () => {
        const provider = createProvider();
        const helpers = {
            markSubscribed: jest.fn(),
            markUnsubscribed: jest.fn(),
            updateMetadata: jest.fn(),
            dispatch: jest.fn(),
            findSymbol: jest.fn()
        };

        provider.handlePoolMessage({
            data: JSON.stringify({ event: "subscribed", channel: "ticker", symbol: "tETHUSD", chanId: 42 })
        }, helpers);

        expect(provider.channelIdToSymbol[42]).toBe("tETHUSD");
        expect(helpers.markSubscribed).toHaveBeenCalledWith("tETHUSD", { chanId: 42 });

        provider.handlePoolMessage({
            data: JSON.stringify([42, [0, 0, 0, 0, 1, 0.01, 2000, 1000, 2100, 1900]])
        }, helpers);

        expect(helpers.dispatch).toHaveBeenCalledWith("tETHUSD", expect.any(Array), expect.any(Array));
    });

    test("fetchTicker uses generic fallback when direct fails", async () => {
        const provider = createProvider();
        provider.fetchTickerDirect = jest.fn().mockRejectedValue(new Error("rest down"));
        provider.genericFallback = {
            fetchTicker: jest.fn().mockResolvedValue({ pair: "fallback" })
        };

        const result = await provider.fetchTicker({ symbol: "ETHUSD" });
        expect(result.pair).toBe("fallback");
        expect(provider.genericFallback.fetchTicker).toHaveBeenCalled();
    });

    test("resolveSymbol normalizes overrides and prefixes", () => {
        const provider = createProvider({ bitfinexSymbolOverrides: { ETHUSD: "tETHPERP" } });

        expect(provider.resolveSymbol({ symbol: "ethusd" })).toBe("TETHPERP");
        expect(provider.resolveSymbol({ symbol: "btc/usd" })).toBe("tBTCUSD");
    });
});
