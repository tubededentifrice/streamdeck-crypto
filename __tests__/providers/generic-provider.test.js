jest.mock('../../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/fetch-utils.js', () => ({
  fetchWithTimeout: jest.fn()
}));

const {
  fetchWithTimeout
} = require('../../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/fetch-utils.js');
const {
  GenericProvider
} = require('../../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/generic-provider.js');
const {
  YFinanceProvider
} = require('../../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/yfinance-provider.js');

async function flushPromises() {
  for (let i = 0; i < 12; i++) {
    await Promise.resolve();
  }
}

function installSignalR() {
  const connections = [];
  global.signalR = {
    LogLevel: { Warning: 3 },
    HubConnectionBuilder: class {
      withUrl() {
        return this;
      }
      withAutomaticReconnect() {
        return this;
      }
      configureLogging() {
        return this;
      }
      build() {
        const callbacks = {};
        const connection = {
          callbacks,
          start: jest.fn().mockResolvedValue(undefined),
          stop: jest.fn().mockResolvedValue(undefined),
          invoke: jest.fn().mockResolvedValue(undefined),
          on: (name, callback) => {
            callbacks[name] = callback;
          },
          onclose: (callback) => {
            callbacks.close = callback;
          },
          onreconnecting: (callback) => {
            callbacks.reconnecting = callback;
          },
          onreconnected: (callback) => {
            callbacks.reconnected = callback;
          }
        };
        connections.push(connection);
        return connection;
      }
    }
  };
  return connections;
}

const params = { exchange: 'OTHER', symbol: 'BTCUSD' };

function createProvider() {
  return new GenericProvider({
    baseUrl: 'https://proxy',
    retryDelayMs: 10,
    fallbackPollIntervalMs: 100
  });
}

describe('GenericProvider request sharing and connection lifecycle', () => {
  const savedSignalR = global.signalR;

  beforeEach(() => {
    jest.useFakeTimers();
    delete global.signalR;
    fetchWithTimeout.mockReset();
    fetchWithTimeout.mockResolvedValue({
      ok: true,
      json: async () => ({ last: 10, symbol: 'BTCUSD' })
    });
  });

  afterEach(() => {
    if (savedSignalR === undefined) {
      delete global.signalR;
    } else {
      global.signalR = savedSignalR;
    }
    jest.useRealTimers();
  });

  test('shares a ticker request across subscription and explicit fetches', async () => {
    const provider = createProvider();
    const handle = provider.subscribeTicker(params, {});
    const first = provider.fetchTicker(params);
    expect(provider.fetchTicker(params)).toBe(first);
    await first;
    expect(fetchWithTimeout).toHaveBeenCalledTimes(1);
    handle.unsubscribe();
  });

  test('shares concurrent candle requests and permits a later refresh', async () => {
    fetchWithTimeout.mockResolvedValue({
      ok: true,
      json: async () => ({ candles: [[1, 2, 3, 4, 5]] })
    });
    const provider = createProvider();
    const candleParams = { ...params, interval: '1h', limit: 24 };
    const first = provider.fetchCandles(candleParams);
    expect(provider.fetchCandles(candleParams)).toBe(first);
    await expect(first).resolves.toEqual([[1, 2, 3, 4, 5]]);
    expect(fetchWithTimeout).toHaveBeenCalledTimes(1);
    await provider.fetchCandles(candleParams);
    expect(fetchWithTimeout).toHaveBeenCalledTimes(2);
  });

  test('starts one connection and stops it when the last subscriber leaves', async () => {
    const connections = installSignalR();
    const provider = createProvider();
    provider.ensureConnection();
    expect(connections).toHaveLength(0);
    const first = provider.subscribeTicker(params, {});
    const second = provider.subscribeTicker(params, {});
    await flushPromises();
    expect(connections).toHaveLength(1);
    expect(connections[0].start).toHaveBeenCalledTimes(1);
    expect(
      connections[0].invoke.mock.calls.filter(([method]) => method === 'Subscribe')
    ).toHaveLength(1);
    first.unsubscribe();
    expect(connections[0].stop).not.toHaveBeenCalled();
    second.unsubscribe();
    expect(connections[0].stop).toHaveBeenCalledTimes(1);
    expect(provider.connection).toBeNull();
    expect(jest.getTimerCount()).toBe(0);
  });

  test('resubscribes after automatic reconnect without starting a second connection', async () => {
    const connections = installSignalR();
    const provider = createProvider();
    const handle = provider.subscribeTicker(params, {});
    await flushPromises();
    const connection = connections[0];
    connection.callbacks.reconnecting();
    expect(provider.isConnected()).toBe(false);
    jest.advanceTimersByTime(100);
    await flushPromises();
    expect(connection.start).toHaveBeenCalledTimes(1);
    connection.callbacks.reconnected();
    await flushPromises();
    expect(provider.isConnected()).toBe(true);
    expect(connection.invoke.mock.calls.filter(([method]) => method === 'Subscribe')).toHaveLength(
      2
    );
    handle.unsubscribe();
  });

  test('cancels retries after the last subscriber leaves', async () => {
    const connections = installSignalR();
    const provider = createProvider();
    const handle = provider.subscribeTicker(params, {});
    await flushPromises();
    const connection = connections[0];
    connection.callbacks.close();
    connection.callbacks.close();
    expect(jest.getTimerCount()).toBe(2);
    handle.unsubscribe();
    jest.advanceTimersByTime(1000);
    expect(connection.start).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('ignores old ticker and reconnect events after a connection is replaced', async () => {
    const connections = installSignalR();
    const provider = createProvider();
    const first = provider.subscribeTicker(params, {});
    await flushPromises();
    first.unsubscribe();
    const onData = jest.fn();
    const second = provider.subscribeTicker(params, { onData });
    await flushPromises();
    onData.mockClear();
    connections[0].callbacks.ticker({ provider: 'OTHER', symbol: 'BTCUSD', last: 100 });
    connections[0].callbacks.reconnected();
    connections[0].callbacks.close();
    expect(onData).not.toHaveBeenCalled();
    expect(
      connections[1].invoke.mock.calls.filter(([method]) => method === 'Subscribe')
    ).toHaveLength(1);
    second.unsubscribe();
  });

  test('stops a connection if the key disappears before start completes', async () => {
    const connections = installSignalR();
    let resolveStart;
    const provider = createProvider();
    const originalStart = global.signalR.HubConnectionBuilder.prototype.build;
    global.signalR.HubConnectionBuilder.prototype.build = function () {
      const connection = originalStart.call(this);
      connection.start.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveStart = resolve;
          })
      );
      return connection;
    };
    const handle = provider.subscribeTicker(params, {});
    handle.unsubscribe();
    resolveStart();
    await flushPromises();
    expect(provider.connection).toBeNull();
    expect(connections[0].stop).toHaveBeenCalledTimes(1);
    expect(connections[0].invoke).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  test('a late Subscribe completion does not unsubscribe the replacement entry', async () => {
    const connections = installSignalR();
    const provider = createProvider();
    const keepAlive = provider.subscribeTicker({ exchange: 'OTHER', symbol: 'ETHUSD' }, {});
    await flushPromises();
    const connection = connections[0];
    let resolveSubscribe;
    connection.invoke.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSubscribe = resolve;
        })
    );
    const first = provider.subscribeTicker(params, {});
    first.unsubscribe();
    const second = provider.subscribeTicker(params, {});
    await flushPromises();
    resolveSubscribe();
    await flushPromises();
    expect(
      connection.invoke.mock.calls.filter(([method]) => method === 'Unsubscribe')
    ).toHaveLength(0);
    expect(provider.subscriptionManager.getEntry(second.key).streamingActive).toBe(true);
    second.unsubscribe();
    keepAlive.unsubscribe();
  });

  test.each([null, {}, { last: 'bad' }, { last: Infinity }, { last: true }, { last: -1 }])(
    'rejects invalid proxy prices: %p',
    async (payload) => {
      fetchWithTimeout.mockResolvedValue({ ok: true, json: async () => payload });
      const provider = createProvider();
      await expect(provider.fetchTicker(params)).resolves.toMatchObject({
        last: 0,
        connectionState: 'broken'
      });
    }
  );

  test('normalizes numeric strings and optional fields from the proxy', () => {
    const provider = createProvider();
    expect(
      provider.transformTickerResponse({
        last: '12.5',
        volume: '20',
        high24h: Infinity,
        dailyChange: '-2',
        symbol: 'BTCUSD'
      })
    ).toMatchObject({ last: 12.5, volume: 20, high: 0, changeDaily: -2, pair: 'BTCUSD' });
  });

  test('ignores an invalid stream price without replacing the last ticker', async () => {
    const connections = installSignalR();
    const provider = createProvider();
    const onData = jest.fn();
    const handle = provider.subscribeTicker(params, { onData });
    await flushPromises();
    onData.mockClear();
    connections[0].callbacks.ticker({ provider: 'OTHER', symbol: 'BTCUSD', last: null });
    expect(onData).not.toHaveBeenCalled();
    expect(provider.getCachedTicker(handle.key).last).toBe(10);
    handle.unsubscribe();
  });

  test('YFinance shares initial REST requests and retains the last price after failure', async () => {
    const generic = createProvider();
    const provider = new YFinanceProvider({ genericFallback: generic });
    const yahooParams = { exchange: 'YFINANCE', symbol: 'AAPL' };
    const handle = provider.subscribeTicker(yahooParams, {});
    await expect(provider.fetchTicker(yahooParams)).resolves.toMatchObject({
      last: 10,
      connectionState: 'backup'
    });
    expect(fetchWithTimeout).toHaveBeenCalledTimes(1);
    jest.setSystemTime(Date.now() + provider.subscriptionManager.fallbackPollIntervalMs);
    fetchWithTimeout.mockRejectedValue(new Error('Proxy unavailable'));
    await expect(provider.fetchTicker(yahooParams)).resolves.toMatchObject({
      last: 10,
      connectionState: 'broken'
    });
    expect(provider.connection).toBeUndefined();
    expect(generic.connection).toBeNull();
    handle.unsubscribe();
  });
});
