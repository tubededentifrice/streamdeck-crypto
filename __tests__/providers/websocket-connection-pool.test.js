const { WebSocketConnectionPool } = require("../../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/websocket-connection-pool.js");
const { MockWebSocket } = require("../../test-utils/mock-websocket");

describe("WebSocketConnectionPool", () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    test("subscribing creates socket and subscribes on open", () => {
        const sockets = [];
        const subscribeHandler = jest.fn();
        const pool = new WebSocketConnectionPool({
            createWebSocket: () => {
                const ws = new MockWebSocket();
                sockets.push(ws);
                return ws;
            },
            subscribe: subscribeHandler,
            reconnectDelayMs: 5
        });

        const onData = jest.fn();
        pool.subscribe("BTCUSDT", { onData });
        expect(sockets).toHaveLength(1);

        sockets[0].triggerOpen();
        expect(subscribeHandler).toHaveBeenCalledWith(sockets[0], "BTCUSDT", {});

        pool.dispatch("BTCUSDT", { price: 1 });
        expect(onData).toHaveBeenCalledWith({ price: 1 }, undefined, null);
    });

    test("unexpected close schedules reconnect and reuses subscribers", () => {
        jest.useFakeTimers();
        const sockets = [];
        const pool = new WebSocketConnectionPool({
            createWebSocket: () => {
                const ws = new MockWebSocket();
                sockets.push(ws);
                return ws;
            },
            subscribe: jest.fn(),
            reconnectDelayMs: 10
        });

        pool.subscribe("ETHUSDT", { onData: jest.fn() });
        const firstSocket = sockets[0];
        firstSocket.triggerOpen();
        expect(pool.ws).toBe(firstSocket);

        firstSocket.triggerClose({ code: 1006 });
        expect(pool.ws).toBeNull();

        jest.advanceTimersByTime(11);
        expect(sockets).toHaveLength(2);
    });

    test("removing last subscriber unsubscribes from socket", () => {
        const sockets = [];
        const unsubscribeHandler = jest.fn();
        const pool = new WebSocketConnectionPool({
            createWebSocket: () => {
                const ws = new MockWebSocket();
                sockets.push(ws);
                return ws;
            },
            subscribe: jest.fn(),
            unsubscribe: unsubscribeHandler,
            reconnectDelayMs: 10
        });

        const subscription = pool.subscribe("XRPUSDT", { onData: jest.fn() });
        sockets[0].triggerOpen();
        subscription.unsubscribe();

        expect(unsubscribeHandler).toHaveBeenCalledWith(sockets[0], "XRPUSDT", {});
    });
});
