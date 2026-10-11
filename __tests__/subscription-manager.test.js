const {
  TickerSubscriptionManager
} = require('../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/ticker-subscription-manager.js');

function createManager(options = {}) {
  return new TickerSubscriptionManager(
    Object.assign(
      {
        fetchTicker: null,
        subscribeStreaming: null,
        unsubscribeStreaming: null,
        fallbackPollIntervalMs: 50,
        staleTickerTimeoutMs: 100
      },
      options
    )
  );
}

describe('TickerSubscriptionManager', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('subscribe triggers initial fetch and streaming', async () => {
    jest.useFakeTimers();
    const fetchTicker = jest.fn().mockResolvedValue({ pair: 'BTCUSD' });
    const subscribeStreaming = jest.fn(() => true);
    const onData = jest.fn();

    const manager = createManager({ fetchTicker, subscribeStreaming });
    const handle = manager.subscribe({ exchange: 'BINANCE', symbol: 'BTCUSD' }, { onData });

    await Promise.resolve();

    expect(fetchTicker).toHaveBeenCalled();
    expect(subscribeStreaming).toHaveBeenCalled();
    expect(onData).toHaveBeenCalledWith(expect.objectContaining({ pair: 'BTCUSD' }));

    handle.unsubscribe();
    jest.runOnlyPendingTimers();
  });

  test('handleStreamingUpdate caches ticker and marks live', () => {
    jest.useFakeTimers();
    const onData = jest.fn();
    const manager = createManager();
    const subscription = manager.subscribe({ exchange: 'BINANCE', symbol: 'ETHUSD' }, { onData });
    const key = subscription.key;

    manager.handleStreamingUpdate(key, { last: 100 });

    const cached = manager.getCachedTicker(key);
    expect(cached.last).toBe(100);
    expect(cached.connectionState).toBe('live');
    expect(onData).toHaveBeenCalledWith(expect.objectContaining({ last: 100 }));

    subscription.unsubscribe();
    jest.runOnlyPendingTimers();
  });

  test('handleFetchError notifies subscribers with fallback ticker', () => {
    jest.useFakeTimers();
    const onData = jest.fn();
    const manager = createManager();
    const subscription = manager.subscribe({ exchange: 'BINANCE', symbol: 'XRPUSD' }, { onData });
    const entry = manager.getEntry(subscription.key);

    manager.handleFetchError(entry);

    expect(onData).toHaveBeenCalledWith(expect.objectContaining({ connectionState: 'broken' }));
    expect(manager.getCachedTicker(subscription.key).connectionState).toBe('broken');

    subscription.unsubscribe();
    jest.runOnlyPendingTimers();
  });

  test('pollEntryIfNeeded triggers fetch once ticker becomes stale', async () => {
    jest.useFakeTimers();
    const fetchTicker = jest.fn().mockResolvedValue({ pair: 'LTCUSD' });
    const manager = createManager({
      fetchTicker,
      subscribeStreaming: () => true,
      fallbackPollIntervalMs: 20,
      staleTickerTimeoutMs: 10
    });
    const subscription = manager.subscribe(
      { exchange: 'BINANCE', symbol: 'LTCUSD' },
      { onData: jest.fn() }
    );

    await manager.getEntry(subscription.key).fetchPromise;
    fetchTicker.mockClear();

    jest.advanceTimersByTime(25);
    await Promise.resolve();

    expect(fetchTicker).toHaveBeenCalled();

    subscription.unsubscribe();
    jest.runOnlyPendingTimers();
  });

  test('shouldPollEntry true when streaming inactive or stale', () => {
    const manager = createManager();
    const entry = manager.getOrCreateEntry({ exchange: 'BINANCE', symbol: 'ADAUSD' });
    entry.streamingActive = false;
    expect(manager.shouldPollEntry(entry)).toBe(true);

    entry.streamingActive = true;
    entry.lastStreamUpdate = Date.now() - 200;
    manager.staleTickerTimeoutMs = 50;
    expect(manager.shouldPollEntry(entry)).toBe(true);
  });

  test('does not overlap fallback requests', async () => {
    let resolveFetch;
    const fetchTicker = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );
    const manager = createManager({ fetchTicker });
    const subscription = manager.subscribe(
      { exchange: 'BINANCE', symbol: 'SOLUSD' },
      { onData: jest.fn() }
    );
    const entry = manager.getEntry(subscription.key);

    manager.pollEntryIfNeeded(entry);
    expect(fetchTicker).toHaveBeenCalledTimes(1);

    resolveFetch({ pair: 'SOLUSD' });
    await Promise.resolve();
    subscription.unsubscribe();
  });

  test('keeps streaming inactive when async subscription resolves false', async () => {
    const manager = createManager({ subscribeStreaming: () => Promise.resolve(false) });
    const subscription = manager.subscribe(
      { exchange: 'BINANCE', symbol: 'DOGEUSD' },
      { onData: jest.fn() }
    );
    const entry = manager.getEntry(subscription.key);

    await Promise.resolve();

    expect(entry.streamingActive).toBe(false);
    expect(entry.streamingPending).toBe(false);
    subscription.unsubscribe();
  });
});

describe('TickerSubscriptionManager shared entries and async results', () => {
  const params = { exchange: 'BINANCE', symbol: 'BTCUSD' };

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('reuses the initial request and replays data to later subscribers', async () => {
    const fetchTicker = jest.fn().mockResolvedValue({ last: 10 });
    const subscribeStreaming = jest.fn(() => true);
    const manager = createManager({ fetchTicker, subscribeStreaming });
    const first = manager.subscribe(params, { onData: jest.fn() });
    const initialRequest = manager.getEntry(first.key).fetchPromise;
    expect(manager.requestTicker(params)).toBe(initialRequest);
    await initialRequest;

    const onData = jest.fn();
    const second = manager.subscribe(params, { onData });
    expect(onData).toHaveBeenCalledWith(expect.objectContaining({ last: 10 }));
    expect(fetchTicker).toHaveBeenCalledTimes(1);
    expect(subscribeStreaming).toHaveBeenCalledTimes(1);
    first.unsubscribe();
    second.unsubscribe();
  });

  test.each(['resolve', 'reject'])('keeps newer streaming data after a REST %s', async (result) => {
    let resolveFetch;
    let rejectFetch;
    const fetchTicker = jest.fn(
      () =>
        new Promise((resolve, reject) => {
          resolveFetch = resolve;
          rejectFetch = reject;
        })
    );
    const manager = createManager({ fetchTicker, subscribeStreaming: () => true });
    const onData = jest.fn();
    const onError = jest.fn();
    const handle = manager.subscribe(params, { onData, onError });
    const request = manager.getEntry(handle.key).fetchPromise;
    manager.handleStreamingUpdate(handle.key, { last: 20 });
    if (result === 'resolve') {
      resolveFetch({ last: 10 });
    } else {
      rejectFetch(new Error('REST unavailable'));
    }
    await expect(request).resolves.toMatchObject({ last: 20, connectionState: 'live' });
    expect(onData).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    expect(fetchTicker).toHaveBeenCalledTimes(1);
    await expect(manager.requestTicker(params)).resolves.toMatchObject({ last: 20 });
    expect(fetchTicker).toHaveBeenCalledTimes(1);
    handle.unsubscribe();
  });

  test('does not skip another subscriber when the first removes itself', () => {
    const manager = createManager();
    let first;
    first = manager.subscribe(params, { onData: () => first.unsubscribe() });
    const onData = jest.fn();
    const second = manager.subscribe(params, { onData });
    manager.handleStreamingUpdate(first.key, { last: 30 });
    expect(onData).toHaveBeenCalledTimes(1);
    second.unsubscribe();
  });

  test('does not notify a subscriber removed by another subscriber', () => {
    const manager = createManager();
    let second;
    const first = manager.subscribe(params, { onData: () => second.unsubscribe() });
    const onData = jest.fn();
    second = manager.subscribe(params, { onData });
    manager.handleStreamingUpdate(first.key, { last: 30 });
    expect(onData).not.toHaveBeenCalled();
    first.unsubscribe();
  });

  test('releases a provider handle after the stream disconnects', () => {
    const unsubscribeStreaming = jest.fn();
    const manager = createManager({ subscribeStreaming: () => true, unsubscribeStreaming });
    const handle = manager.subscribe(params, {});
    manager.getEntry(handle.key).streamingActive = false;
    handle.unsubscribe();
    expect(unsubscribeStreaming).toHaveBeenCalledTimes(1);
    expect(manager.getEntry(handle.key)).toBeNull();
  });

  test('ignores a result for an entry removed and replaced with the same key', async () => {
    let resolveFirst;
    const fetchTicker = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          })
      )
      .mockResolvedValue({ last: 40 });
    const manager = createManager({ fetchTicker });
    const firstData = jest.fn();
    const first = manager.subscribe(params, { onData: firstData });
    const oldRequest = manager.getEntry(first.key).fetchPromise;
    first.unsubscribe();
    const secondData = jest.fn();
    const second = manager.subscribe(params, { onData: secondData });
    await manager.getEntry(second.key).fetchPromise;
    resolveFirst({ last: 10 });
    await oldRequest;
    expect(firstData).not.toHaveBeenCalled();
    expect(secondData).toHaveBeenCalledTimes(1);
    expect(manager.getCachedTicker(second.key).last).toBe(40);
    second.unsubscribe();
  });

  test('retries a failed stream subscription on the next poll', async () => {
    const subscribeStreaming = jest.fn().mockReturnValueOnce(false).mockReturnValue(true);
    const manager = createManager({
      subscribeStreaming,
      fetchTicker: () => Promise.resolve({ last: 1 })
    });
    const handle = manager.subscribe(params, {});
    await manager.getEntry(handle.key).fetchPromise;
    jest.advanceTimersByTime(50);
    expect(subscribeStreaming).toHaveBeenCalledTimes(2);
    handle.unsubscribe();
  });

  test('keeps the last price when the provider returns a broken placeholder', async () => {
    const fetchTicker = jest
      .fn()
      .mockResolvedValueOnce({ last: 50, connectionState: 'backup' })
      .mockResolvedValue({ last: 0, connectionState: 'broken' });
    const manager = createManager({ fetchTicker });
    const handle = manager.subscribe(params, {});
    await manager.getEntry(handle.key).fetchPromise;
    jest.setSystemTime(Date.now() + 50);
    await expect(manager.requestTicker(params)).resolves.toMatchObject({
      last: 50,
      connectionState: 'broken'
    });
    handle.unsubscribe();
  });
});

describe('TickerSubscriptionManager polling timer and REST freshness', () => {
  const params = { exchange: 'YFINANCE', symbol: 'AAPL' };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
  });
  afterEach(() => jest.useRealTimers());

  test('shares one timer across many symbols and removes it with the last subscription', async () => {
    const fetchTicker = jest.fn().mockResolvedValue({ last: 10 });
    const manager = createManager({ fetchTicker });
    const handles = Array.from({ length: 100 }, (_, index) =>
      manager.subscribe({ exchange: 'YFINANCE', symbol: 'SYMBOL' + index }, {})
    );
    await Promise.all(handles.map((handle) => manager.getEntry(handle.key).fetchPromise));
    expect(jest.getTimerCount()).toBe(1);
    expect(fetchTicker).toHaveBeenCalledTimes(100);
    jest.advanceTimersByTime(50);
    expect(fetchTicker).toHaveBeenCalledTimes(200);
    await Promise.all(handles.map((handle) => manager.getEntry(handle.key).fetchPromise));
    for (let index = 0; index < handles.length - 1; index++) {
      handles[index].unsubscribe();
    }
    expect(jest.getTimerCount()).toBe(1);
    handles.at(-1).unsubscribe();
    expect(jest.getTimerCount()).toBe(0);
  });

  test('keeps separate poll deadlines for symbols added at different times', async () => {
    const fetchTicker = jest.fn().mockResolvedValue({ last: 10 });
    const manager = createManager({ fetchTicker });
    const first = manager.subscribe(params, {});
    await manager.getEntry(first.key).fetchPromise;
    jest.advanceTimersByTime(25);
    const second = manager.subscribe({ ...params, symbol: 'MSFT' }, {});
    await manager.getEntry(second.key).fetchPromise;
    expect(jest.getTimerCount()).toBe(1);
    jest.advanceTimersByTime(25);
    expect(fetchTicker).toHaveBeenCalledTimes(3);
    expect(fetchTicker.mock.calls.at(-1)[0].symbol).toBe('AAPL');
    await manager.getEntry(first.key).fetchPromise;
    jest.advanceTimersByTime(25);
    expect(fetchTicker).toHaveBeenCalledTimes(4);
    expect(fetchTicker.mock.calls.at(-1)[0].symbol).toBe('MSFT');
    first.unsubscribe();
    second.unsubscribe();
  });

  test('reuses a REST result at time zero until the refresh interval expires', async () => {
    const fetchTicker = jest.fn().mockResolvedValue({ last: 10, connectionState: 'backup' });
    const manager = createManager({ fetchTicker });
    const first = manager.subscribe(params, {});
    await manager.getEntry(first.key).fetchPromise;
    expect(manager.getEntry(first.key).lastFetchUpdate).toBe(0);
    const second = manager.subscribe(params, {});
    await manager.requestTicker(params);
    jest.setSystemTime(49);
    await manager.requestTicker(params);
    expect(fetchTicker).toHaveBeenCalledTimes(1);
    jest.setSystemTime(50);
    await manager.requestTicker(params);
    expect(fetchTicker).toHaveBeenCalledTimes(2);
    first.unsubscribe();
    second.unsubscribe();
  });

  test('a fresh explicit REST request resets the shared polling deadline', async () => {
    const fetchTicker = jest.fn().mockResolvedValue({ last: 10 });
    const manager = createManager({ fetchTicker });
    const handle = manager.subscribe(params, {});
    await manager.getEntry(handle.key).fetchPromise;
    jest.setSystemTime(50);
    await manager.requestTicker(params);
    expect(fetchTicker).toHaveBeenCalledTimes(2);
    jest.advanceTimersByTime(49);
    expect(fetchTicker).toHaveBeenCalledTimes(2);
    jest.advanceTimersByTime(1);
    expect(fetchTicker).toHaveBeenCalledTimes(3);
    handle.unsubscribe();
  });

  test('a broken result does not prevent an immediate recovery request', async () => {
    const fetchTicker = jest
      .fn()
      .mockResolvedValueOnce({ last: 0, connectionState: 'broken' })
      .mockResolvedValue({ last: 10, connectionState: 'backup' });
    const manager = createManager({ fetchTicker });
    const handle = manager.subscribe(params, {});
    await manager.getEntry(handle.key).fetchPromise;
    expect(manager.getEntry(handle.key).lastFetchUpdate).toBeNull();
    await expect(manager.requestTicker(params)).resolves.toMatchObject({
      last: 10,
      connectionState: 'backup'
    });
    expect(fetchTicker).toHaveBeenCalledTimes(2);
    handle.unsubscribe();
  });

  test('a new subscription still refreshes after all previous subscribers leave', async () => {
    const fetchTicker = jest.fn().mockResolvedValue({ last: 10 });
    const manager = createManager({ fetchTicker });
    const first = manager.subscribe(params, {});
    await manager.getEntry(first.key).fetchPromise;
    first.unsubscribe();
    const second = manager.subscribe(params, {});
    await manager.getEntry(second.key).fetchPromise;
    expect(fetchTicker).toHaveBeenCalledTimes(2);
    second.unsubscribe();
  });

  test('treats a stream update at time zero as fresh', async () => {
    const fetchTicker = jest.fn().mockResolvedValue({ last: 10 });
    const manager = createManager({ fetchTicker, subscribeStreaming: () => true });
    const handle = manager.subscribe(params, {});
    await manager.getEntry(handle.key).fetchPromise;
    manager.handleStreamingUpdate(handle.key, { last: 20 });
    jest.setSystemTime(50);
    await expect(manager.requestTicker(params)).resolves.toMatchObject({
      last: 20,
      connectionState: 'live'
    });
    expect(fetchTicker).toHaveBeenCalledTimes(1);
    handle.unsubscribe();
  });
});
