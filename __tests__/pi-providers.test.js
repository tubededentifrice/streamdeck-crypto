const binance = require('../com.courcelle.cryptoticker-dev.sdPlugin/js/pi/providers/binance');
const bitfinex = require('../com.courcelle.cryptoticker-dev.sdPlugin/js/pi/providers/bitfinex');

describe('property inspector providers', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    ['Binance', binance],
    ['Bitfinex', bitfinex]
  ])('%s rejects non-success responses so proxy fallback can run', async (_name, provider) => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 451 });

    try {
      await expect(provider.getPairs()).rejects.toThrow('response not ok');
    } finally {
      global.fetch = originalFetch;
    }
  });
});
