const {
  fetchWithTimeout
} = require('../../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/fetch-utils');

describe('fetchWithTimeout', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('aborts a request that exceeds its deadline', async () => {
    jest.useFakeTimers();
    const originalFetch = global.fetch;
    global.fetch = jest.fn((_url, options) => {
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(new Error('aborted')));
      });
    });

    try {
      const request = fetchWithTimeout('https://example.com', undefined, 10);
      jest.advanceTimersByTime(11);
      await expect(request).rejects.toThrow('Request timed out');
    } finally {
      global.fetch = originalFetch;
    }
  });
  test('keeps the deadline with a caller signal and a fetch that does not abort', async () => {
    jest.useFakeTimers();
    const caller = new AbortController();
    const originalFetch = global.fetch;
    global.fetch = jest.fn(() => new Promise(() => {}));
    try {
      const request = fetchWithTimeout('https://example.com', { signal: caller.signal }, 10);
      jest.advanceTimersByTime(11);
      await expect(request).rejects.toMatchObject({ name: 'TimeoutError' });
      expect(caller.signal.aborted).toBe(false);
      expect(global.fetch.mock.calls[0][1].signal.aborted).toBe(true);
      expect(jest.getTimerCount()).toBe(0);
    } finally {
      global.fetch = originalFetch;
    }
  });

  test('forwards caller cancellation and removes its listener', async () => {
    jest.useFakeTimers();
    const caller = new AbortController();
    const removeListener = jest.spyOn(caller.signal, 'removeEventListener');
    const originalFetch = global.fetch;
    global.fetch = jest.fn(() => new Promise(() => {}));
    try {
      const request = fetchWithTimeout('https://example.com', { signal: caller.signal }, 10);
      caller.abort(new Error('cancelled'));
      await expect(request).rejects.toThrow('cancelled');
      expect(global.fetch.mock.calls[0][1].signal.aborted).toBe(true);
      expect(removeListener).toHaveBeenCalledWith('abort', expect.any(Function));
      expect(jest.getTimerCount()).toBe(0);
    } finally {
      global.fetch = originalFetch;
    }
  });

  test('clears the deadline when fetch throws before it returns a promise', async () => {
    jest.useFakeTimers();
    const originalFetch = global.fetch;
    global.fetch = jest.fn(() => {
      throw new Error('fetch failed');
    });
    try {
      await expect(fetchWithTimeout('https://example.com')).rejects.toThrow('fetch failed');
      expect(jest.getTimerCount()).toBe(0);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
