const { TickerSubscriptionManager } = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/ticker-subscription-manager.js");

function createManager(options = {}) {
    return new TickerSubscriptionManager(Object.assign({
        fetchTicker: null,
        subscribeStreaming: null,
        unsubscribeStreaming: null,
        fallbackPollIntervalMs: 50,
        staleTickerTimeoutMs: 100
    }, options));
}

describe("TickerSubscriptionManager", () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    test("subscribe triggers initial fetch and streaming", async () => {
        jest.useFakeTimers();
        const fetchTicker = jest.fn().mockResolvedValue({ pair: "BTCUSD" });
        const subscribeStreaming = jest.fn(() => true);
        const onData = jest.fn();

        const manager = createManager({ fetchTicker, subscribeStreaming });
        const handle = manager.subscribe({ exchange: "BINANCE", symbol: "BTCUSD" }, { onData });

        await Promise.resolve();

        expect(fetchTicker).toHaveBeenCalled();
        expect(subscribeStreaming).toHaveBeenCalled();
        expect(onData).toHaveBeenCalledWith(expect.objectContaining({ pair: "BTCUSD" }));

        handle.unsubscribe();
        jest.runOnlyPendingTimers();
    });

    test("handleStreamingUpdate caches ticker and marks live", () => {
        jest.useFakeTimers();
        const onData = jest.fn();
        const manager = createManager();
        const subscription = manager.subscribe({ exchange: "BINANCE", symbol: "ETHUSD" }, { onData });
        const key = subscription.key;

        manager.handleStreamingUpdate(key, { last: 100 });

        const cached = manager.getCachedTicker(key);
        expect(cached.last).toBe(100);
        expect(cached.connectionState).toBe("live");
        expect(onData).toHaveBeenCalledWith(expect.objectContaining({ last: 100 }));

        subscription.unsubscribe();
        jest.runOnlyPendingTimers();
    });

    test("handleFetchError notifies subscribers with fallback ticker", () => {
        jest.useFakeTimers();
        const onData = jest.fn();
        const manager = createManager();
        const subscription = manager.subscribe({ exchange: "BINANCE", symbol: "XRPUSD" }, { onData });
        const entry = manager.getEntry(subscription.key);

        manager.handleFetchError(entry);

        expect(onData).toHaveBeenCalledWith(expect.objectContaining({ connectionState: "broken" }));
        expect(manager.getCachedTicker(subscription.key).connectionState).toBe("broken");

        subscription.unsubscribe();
        jest.runOnlyPendingTimers();
    });

    test("pollEntryIfNeeded triggers fetch once ticker becomes stale", async () => {
        jest.useFakeTimers();
        const fetchTicker = jest.fn().mockResolvedValue({ pair: "LTCUSD" });
        const manager = createManager({ fetchTicker, subscribeStreaming: () => true, fallbackPollIntervalMs: 20, staleTickerTimeoutMs: 10 });
        const subscription = manager.subscribe({ exchange: "BINANCE", symbol: "LTCUSD" }, { onData: jest.fn() });

        await Promise.resolve();
        fetchTicker.mockClear();

        jest.advanceTimersByTime(25);
        await Promise.resolve();

        expect(fetchTicker).toHaveBeenCalled();

        subscription.unsubscribe();
        jest.runOnlyPendingTimers();
    });

    test("shouldPollEntry true when streaming inactive or stale", () => {
        const manager = createManager();
        const entry = manager.getOrCreateEntry({ exchange: "BINANCE", symbol: "ADAUSD" });
        entry.streamingActive = false;
        expect(manager.shouldPollEntry(entry)).toBe(true);

        entry.streamingActive = true;
        entry.lastStreamUpdate = Date.now() - 200;
        manager.staleTickerTimeoutMs = 50;
        expect(manager.shouldPollEntry(entry)).toBe(true);
    });
});
