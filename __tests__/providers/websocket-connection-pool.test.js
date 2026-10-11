const {
  WebSocketConnectionPool
} = require('../../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/websocket-connection-pool.js');
const { MockWebSocket } = require('../../test-utils/mock-websocket');

describe('WebSocketConnectionPool', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('subscribing creates socket and subscribes on open', () => {
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
    pool.subscribe('BTCUSDT', { onData });
    expect(sockets).toHaveLength(1);

    sockets[0].triggerOpen();
    expect(subscribeHandler).toHaveBeenCalledWith(sockets[0], 'BTCUSDT', {});

    pool.dispatch('BTCUSDT', { price: 1 });
    expect(onData).toHaveBeenCalledWith({ price: 1 }, undefined, null);
  });

  test('unexpected close schedules reconnect and reuses subscribers', () => {
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

    pool.subscribe('ETHUSDT', { onData: jest.fn() });
    const firstSocket = sockets[0];
    firstSocket.triggerOpen();
    expect(pool.ws).toBe(firstSocket);

    firstSocket.triggerClose({ code: 1006 });
    expect(pool.ws).toBeNull();

    jest.advanceTimersByTime(11);
    expect(sockets).toHaveLength(2);
  });

  test('removing last subscriber unsubscribes from socket', () => {
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

    const subscription = pool.subscribe('XRPUSDT', { onData: jest.fn() });
    sockets[0].triggerOpen();
    subscription.unsubscribe();

    expect(unsubscribeHandler).toHaveBeenCalledWith(sockets[0], 'XRPUSDT', {});
  });

  test('ignores close events from a replaced socket', () => {
    const sockets = [];
    const pool = new WebSocketConnectionPool({
      createWebSocket: () => {
        const ws = new MockWebSocket();
        ws.close = jest.fn(() => {
          ws.readyState = MockWebSocket.CLOSED;
        });
        sockets.push(ws);
        return ws;
      },
      subscribe: jest.fn()
    });

    const firstSubscription = pool.subscribe('BTCUSDT', { onData: jest.fn() });
    const firstSocket = sockets[0];
    firstSocket.triggerOpen();
    firstSubscription.unsubscribe();

    pool.subscribe('ETHUSDT', { onData: jest.fn() });
    const secondSocket = sockets[1];
    secondSocket.triggerOpen();
    firstSocket.triggerClose({ code: 1000 });

    expect(pool.ws).toBe(secondSocket);
  });

  test('retries when socket construction throws', () => {
    jest.useFakeTimers();
    let attempts = 0;
    const pool = new WebSocketConnectionPool({
      createWebSocket: () => {
        attempts += 1;
        if (attempts === 1) {
          throw new Error('constructor failed');
        }
        return new MockWebSocket();
      },
      subscribe: jest.fn(),
      reconnectDelayMs: 10
    });

    pool.subscribe('ADAUSDT', { onData: jest.fn() });
    jest.advanceTimersByTime(11);

    expect(attempts).toBe(2);
    expect(pool.ws).not.toBeNull();
  });

  test('retries when a socket never opens', () => {
    jest.useFakeTimers();
    const sockets = [];
    const pool = new WebSocketConnectionPool({
      createWebSocket: () => {
        const ws = new MockWebSocket();
        sockets.push(ws);
        return ws;
      },
      subscribe: jest.fn(),
      connectionTimeoutMs: 10,
      reconnectDelayMs: 5
    });

    pool.subscribe('SOLUSDT', { onData: jest.fn() });
    jest.advanceTimersByTime(11);
    jest.advanceTimersByTime(6);

    expect(sockets).toHaveLength(2);
  });
  test('retries a timed-out socket without waiting for its close event', () => {
    jest.useFakeTimers();
    const sockets = [];
    const onData = jest.fn();
    const onDisconnected = jest.fn();
    const pool = new WebSocketConnectionPool({
      createWebSocket: () => {
        const socket = new MockWebSocket();
        socket.close = jest.fn();
        sockets.push(socket);
        return socket;
      },
      connectionTimeoutMs: 10,
      reconnectDelayMs: 5,
      handleMessage: (event, helpers) => helpers.dispatch('BTCUSDT', event.data)
    });
    const subscription = pool.subscribe('BTCUSDT', { onData, onDisconnected });
    jest.advanceTimersByTime(15);
    expect(sockets).toHaveLength(2);
    expect(onDisconnected).toHaveBeenCalledTimes(1);
    sockets[0].triggerOpen();
    sockets[0].triggerMessage('old');
    sockets[0].triggerClose();
    expect(pool.ws).toBe(sockets[1]);
    expect(onData).not.toHaveBeenCalled();
    subscription.unsubscribe();
  });

  test('old subscription handles cannot change replacement metadata', () => {
    const pool = new WebSocketConnectionPool({ createWebSocket: () => new MockWebSocket() });
    const first = pool.subscribe('BTCUSDT', { onData: jest.fn() });
    first.unsubscribe();
    const replacement = pool.subscribe('BTCUSDT', { onData: jest.fn() });
    replacement.updateMetadata({ channel: 2 });
    first.updateMetadata({ channel: 1 });
    expect(first.getMetadata()).toBeNull();
    expect(replacement.getMetadata()).toEqual({ channel: 2 });
    replacement.unsubscribe();
  });

  test('reuses message helpers for all socket messages', () => {
    const handleMessage = jest.fn();
    const socket = new MockWebSocket();
    const pool = new WebSocketConnectionPool({ createWebSocket: () => socket, handleMessage });
    const subscription = pool.subscribe('BTCUSDT', { onData: jest.fn() });
    socket.triggerOpen();
    socket.triggerMessage('first');
    socket.triggerMessage('second');
    expect(handleMessage.mock.calls[0][1]).toBe(handleMessage.mock.calls[1][1]);
    subscription.unsubscribe();
  });
});
