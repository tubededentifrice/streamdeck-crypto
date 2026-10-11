const {
  BinanceProvider
} = require('../../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/binance-provider.js');

function createProvider(overrides) {
  return new BinanceProvider(
    Object.assign(
      {
        baseUrl: 'https://example.com',
        binanceRestBaseUrl: 'https://example.com',
        binanceWsBaseUrl: 'wss://example.com/ws'
      },
      overrides
    )
  );
}

describe('BinanceProvider', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });
  test('percent change normalizes to decimal', () => {
    const provider = createProvider();
    const params = { symbol: 'BTCUSDT' };
    const restTicker = provider.transformRestTicker(
      {
        priceChange: '10',
        priceChangePercent: '5',
        lastPrice: '100',
        volume: '2',
        highPrice: '110',
        lowPrice: '90'
      },
      params,
      'BTCUSDT'
    );

    expect(restTicker.changeDaily).toBeCloseTo(10);
    expect(restTicker.changeDailyPercent).toBeCloseTo(0.05);

    const streamTicker = provider.transformStreamTicker(
      {
        p: '-8',
        P: '-4',
        c: '101',
        v: '3',
        h: '120',
        l: '95'
      },
      { params },
      'BTCUSDT'
    );

    expect(streamTicker.changeDaily).toBeCloseTo(-8);
    expect(streamTicker.changeDailyPercent).toBeCloseTo(-0.04);
  });

  test('sendBinanceSubscription emits subscribe payload with incrementing id', () => {
    jest.useFakeTimers();
    const provider = createProvider();
    provider.wsRequestId = 0;
    const ws = { send: jest.fn(), readyState: 1 };
    provider.webSocketPool.ws = ws;

    provider.sendBinanceSubscription(ws, 'BTCUSDT', true);
    jest.advanceTimersByTime(300);
    provider.sendBinanceSubscription(ws, 'BTCUSDT', false);
    jest.advanceTimersByTime(300);

    const [firstPayload, secondPayload] = ws.send.mock.calls.map((call) => JSON.parse(call[0]));
    expect(firstPayload.method).toBe('SUBSCRIBE');
    expect(firstPayload.params).toEqual(['btcusdt@ticker']);
    expect(secondPayload.method).toBe('UNSUBSCRIBE');
    expect(secondPayload.id).toBe(firstPayload.id + 1);
  });

  test('fetchTicker falls back to generic provider on failure', async () => {
    const provider = createProvider();
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network'));
    provider.genericFallback = {
      fetchTicker: jest.fn().mockResolvedValue({ pair: 'fallback' })
    };

    const result = await provider.fetchTicker({ symbol: 'BTCUSD' });
    expect(result.pair).toBe('fallback');
    expect(provider.genericFallback.fetchTicker).toHaveBeenCalled();
  });

  test('handlePoolMessage dispatches parsed ticker payload', () => {
    const provider = createProvider();
    const markSubscribed = jest.fn();
    const dispatch = jest.fn();

    provider.handlePoolMessage(
      {
        data: JSON.stringify({
          data: {
            s: 'ethusdt',
            c: '2000',
            v: '5'
          }
        })
      },
      {
        markSubscribed,
        dispatch
      }
    );

    expect(markSubscribed).toHaveBeenCalledWith('ETHUSDT');
    expect(dispatch).toHaveBeenCalledWith(
      'ETHUSDT',
      expect.objectContaining({ c: '2000' }),
      expect.any(Object)
    );
  });

  test('resolveSymbol applies overrides and USDT mapping', () => {
    const provider = createProvider({ binanceSymbolOverrides: { BTCUSDC: 'BTCPERP' } });

    expect(provider.resolveSymbol({ symbol: 'btcusdc' })).toBe('BTCPERP');
    expect(provider.resolveSymbol({ symbol: 'ethusd' })).toBe('ETHUSDT');
  });

  test('fetchCandles supports the 30-minute interval', async () => {
    const provider = createProvider();
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });

    try {
      await provider.fetchCandles({ symbol: 'BTCUSDT', interval: 'MINUTES_30', limit: 24 });
      expect(global.fetch.mock.calls[0][0]).toContain('interval=30m');
    } finally {
      global.fetch = originalFetch;
    }
  });
  test('keeps one pool subscription after disconnect and retry', () => {
    const provider = createProvider();
    const socket = { readyState: 0, close: jest.fn() };
    provider.webSocketPool.createWebSocket = () => socket;
    const entry = { key: 'key', params: { symbol: 'BTCUSD' }, meta: {} };
    expect(provider.subscribeStream(entry)).toBe(true);
    provider.webSocketPool.notifyAllDisconnected();
    expect(provider.subscribeStream(entry)).toBe(false);
    const symbol = provider.resolveSymbol(entry.params);
    expect(provider.webSocketPool.symbolEntries[symbol].subscribers).toHaveLength(1);
    provider.unsubscribeStream(entry);
    expect(provider.webSocketPool.hasSubscribers()).toBe(false);
  });
  test('batches many page subscriptions into one control request', () => {
    jest.useFakeTimers();
    const provider = createProvider();
    const ws = { send: jest.fn(), readyState: 1 };
    provider.webSocketPool.ws = ws;
    for (let index = 0; index < 40; index++) {
      provider.sendBinanceSubscription(ws, 'COIN' + index + 'USDT', true);
    }
    expect(ws.send).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    expect(ws.send).toHaveBeenCalledTimes(1);
    expect(JSON.parse(ws.send.mock.calls[0][0]).params).toHaveLength(40);
    provider.clearPendingSubscriptions();
  });

  test('uses only the last subscription change and discards old socket requests', () => {
    jest.useFakeTimers();
    const provider = createProvider();
    const ws = { send: jest.fn(), readyState: 1 };
    provider.webSocketPool.ws = ws;
    provider.sendBinanceSubscription(ws, 'BTCUSDT', true);
    provider.sendBinanceSubscription(ws, 'BTCUSDT', false);
    provider.sendBinanceSubscription(ws, 'ETHUSDT', true);
    jest.advanceTimersByTime(300);
    expect(JSON.parse(ws.send.mock.calls[0][0])).toMatchObject({
      method: 'UNSUBSCRIBE',
      params: ['btcusdt@ticker']
    });
    provider.webSocketPool.ws = { readyState: 1 };
    jest.advanceTimersByTime(300);
    expect(ws.send).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  test.each([{}, { lastPrice: null }, { lastPrice: '1bad' }, { lastPrice: 'Infinity' }])(
    'rejects malformed REST ticker %j',
    (payload) => {
      const provider = createProvider();
      expect(() => provider.transformRestTicker(payload, {}, 'BTCUSDT')).toThrow(
        'invalid REST ticker'
      );
    }
  );

  test.each([undefined, null, 'bad', Infinity])('ignores invalid stream price %p', (price) => {
    const provider = createProvider();
    expect(provider.transformStreamTicker({ c: price }, { params: {} }, 'BTCUSDT')).toBeNull();
  });
});
