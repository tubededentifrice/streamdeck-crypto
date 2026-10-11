const binancePI = require('../com.courcelle.cryptoticker-dev.sdPlugin/js/pi/providers/binance.js');
const bitfinexPI = require('../com.courcelle.cryptoticker-dev.sdPlugin/js/pi/providers/bitfinex.js');

describe('property inspector provider helpers', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('binance provider filters non-trading pairs', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        symbols: [
          { symbol: 'btcusdt', status: 'TRADING' },
          { symbol: 'ADAUSDT', status: 'BREAK' },
          { symbol: ['ETHUSDT'], status: 'TRADING' },
          { symbol: '  ', status: 'TRADING' },
          null
        ]
      })
    });

    const pairs = await binancePI.getPairs();
    expect(pairs).toEqual([{ value: 'BTCUSDT', display: 'BTCUSDT', symbol: 'BTCUSDT' }]);
  });

  test('bitfinex provider normalizes symbols', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [['tBTCUSD', 'eth/usd', 'aave:usd', null, 42, {}, '   ']]
    });

    const pairs = await bitfinexPI.getPairs();
    expect(pairs).toEqual([
      { value: 'TBTCUSD', display: 'TBTCUSD', symbol: 'TBTCUSD' },
      { value: 'ETH/USD', display: 'ETH/USD', symbol: 'ETHUSD' },
      { value: 'AAVE:USD', display: 'AAVE:USD', symbol: 'AAVE:USD' }
    ]);
  });
});
