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
      await expect(request).rejects.toThrow('aborted');
    } finally {
      global.fetch = originalFetch;
    }
  });
});
