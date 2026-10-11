const {
  BitfinexProvider
} = require('../../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/bitfinex-provider.js');

function createProvider(overrides) {
  return new BitfinexProvider(
    Object.assign(
      {
        baseUrl: 'https://example.com',
        bitfinexRestBaseUrl: 'https://example.com',
        bitfinexWsBaseUrl: 'wss://example.com/ws'
      },
      overrides
    )
  );
}

describe('BitfinexProvider', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  test('sendBitfinexSubscribe sends payload', () => {
    const provider = createProvider();
    const ws = { send: jest.fn() };

    provider.sendBitfinexSubscribe(ws, 'tBTCUSD');

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({
        event: 'subscribe',
        channel: 'ticker',
        symbol: 'tBTCUSD'
      })
    );
  });

  test('sendBitfinexUnsubscribe uses channel id from metadata', () => {
    const provider = createProvider();
    const ws = { send: jest.fn() };

    provider.sendBitfinexUnsubscribe(ws, 'tBTCUSD', { chanId: 10 });
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ event: 'unsubscribe', chanId: 10 }));
  });

  test('handlePoolMessage registers channel and dispatches data', () => {
    const provider = createProvider();
    const helpers = {
      markSubscribed: jest.fn(),
      markUnsubscribed: jest.fn(),
      updateMetadata: jest.fn(),
      dispatch: jest.fn(),
      findSymbol: jest.fn(),
      getMetadata: jest.fn(() => ({}))
    };

    provider.handlePoolMessage(
      {
        data: JSON.stringify({
          event: 'subscribed',
          channel: 'ticker',
          symbol: 'tETHUSD',
          chanId: 42
        })
      },
      helpers
    );

    expect(provider.channelIdToSymbol[42]).toBe('tETHUSD');
    expect(helpers.markSubscribed).toHaveBeenCalledWith('tETHUSD', { chanId: 42 });

    provider.handlePoolMessage(
      {
        data: JSON.stringify([42, [0, 0, 0, 0, 1, 0.01, 2000, 1000, 2100, 1900]])
      },
      helpers
    );

    expect(helpers.dispatch).toHaveBeenCalledWith('tETHUSD', expect.any(Array), expect.any(Array));
  });

  test('fetchTicker uses generic fallback when direct fails', async () => {
    const provider = createProvider();
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('rest down'));
    provider.genericFallback = {
      fetchTicker: jest.fn().mockResolvedValue({ pair: 'fallback' })
    };

    const result = await provider.fetchTicker({ symbol: 'ETHUSD' });
    expect(result.pair).toBe('fallback');
    expect(provider.genericFallback.fetchTicker).toHaveBeenCalled();
  });

  test('resolveSymbol normalizes overrides and prefixes', () => {
    const provider = createProvider({ bitfinexSymbolOverrides: { ETHUSD: 'tETHPERP' } });

    expect(provider.resolveSymbol({ symbol: 'ethusd' })).toBe('tETHPERP');
    expect(provider.resolveSymbol({ symbol: 'btc/usd' })).toBe('tBTCUSD');
  });

  test('fetchCandles supports the 30-minute interval', async () => {
    const provider = createProvider();
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });

    try {
      await provider.fetchCandles({ symbol: 'BTCUSD', interval: 'MINUTES_30', limit: 24 });
      expect(global.fetch.mock.calls[0][0]).toContain('trade:30m:');
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

  test('preserves symbols that start with T and exchange delimiters', () => {
    const provider = createProvider();
    expect(provider.resolveSymbol({ symbol: 'TRXUSD' })).toBe('tTRXUSD');
    expect(provider.resolveSymbol({ symbol: 'tBTCUSD' })).toBe('tBTCUSD');
    expect(provider.resolveSymbol({ symbol: 'AAVE:USD' })).toBe('tAAVE:USD');
  });

  test('closes a channel whose subscriber was removed before acknowledgement', () => {
    const provider = createProvider();
    const ws = { send: jest.fn() };
    provider.webSocketPool.ws = ws;
    const helpers = { getMetadata: () => null, markSubscribed: jest.fn() };
    provider.handleBitfinexEvent(
      { event: 'subscribed', channel: 'ticker', symbol: 'tBTCUSD', chanId: 10 },
      helpers
    );
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ event: 'unsubscribe', chanId: 10 }));
    expect(helpers.markSubscribed).not.toHaveBeenCalled();
    expect(provider.channelIdToSymbol[10]).toBeUndefined();
  });

  test('ignores an old unsubscribe acknowledgement after a new channel opens', () => {
    const provider = createProvider();
    provider.channelIdToSymbol[10] = 'tBTCUSD';
    provider.channelIdToSymbol[11] = 'tBTCUSD';
    const helpers = {
      getMetadata: () => ({ chanId: 11 }),
      findSymbol: jest.fn(),
      markUnsubscribed: jest.fn(),
      updateMetadata: jest.fn()
    };
    provider.handleBitfinexEvent({ event: 'unsubscribed', chanId: 10 }, helpers);
    expect(helpers.markUnsubscribed).not.toHaveBeenCalled();
    expect(provider.channelIdToSymbol[11]).toBe('tBTCUSD');
  });
  test('uses REST after the socket reaches thirty symbols and reuses existing channels', () => {
    const provider = createProvider();
    provider.webSocketPool.createWebSocket = () => ({ readyState: 0, close: jest.fn() });
    const entries = Array.from({ length: 31 }, (_, index) => ({
      key: String(index),
      params: { symbol: 'COIN' + index + 'USD' },
      meta: {}
    }));
    for (const entry of entries.slice(0, 30)) {
      expect(provider.subscribeStream(entry)).toBe(true);
    }
    expect(provider.subscribeStream(entries[30])).toBe(false);
    const duplicate = { key: 'duplicate', params: entries[0].params, meta: {} };
    expect(provider.subscribeStream(duplicate)).toBe(true);
    provider.unsubscribeStream(entries[0]);
    expect(provider.subscribeStream(entries[30])).toBe(false);
    provider.unsubscribeStream(duplicate);
    expect(provider.subscribeStream(entries[30])).toBe(true);
    for (const entry of entries) {
      provider.unsubscribeStream(entry);
    }
    expect(provider.webSocketPool.hasSubscribers()).toBe(false);
  });

  test.each(
    [[], ['error', 10000, 'failure'], [0, 0, 0, 0, 0, 0, 'invalid', 0, 0, 0]].map((payload) => [
      payload
    ])
  )('rejects malformed ticker array %j', (payload) => {
    const provider = createProvider();
    expect(() => provider.transformRestTicker(payload, {}, 'tBTCUSD')).toThrow(
      'unexpected REST payload'
    );
    expect(provider.buildTickerFromArray(payload, { params: {} })).toBeNull();
  });

  test('removes an old channel when a second acknowledgement arrives for the same symbol', () => {
    const provider = createProvider();
    const ws = { send: jest.fn() };
    provider.webSocketPool.ws = ws;
    provider.channelIdToSymbol[10] = 'tBTCUSD';
    const helpers = { getMetadata: () => ({ chanId: 10 }), markSubscribed: jest.fn() };
    provider.handleBitfinexEvent(
      { event: 'subscribed', channel: 'ticker', symbol: 'tBTCUSD', chanId: 11 },
      helpers
    );
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ event: 'unsubscribe', chanId: 10 }));
    expect(provider.channelIdToSymbol[10]).toBeUndefined();
    expect(provider.channelIdToSymbol[11]).toBe('tBTCUSD');
  });
});
