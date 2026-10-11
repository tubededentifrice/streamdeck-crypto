const fs = require('fs');
const path = require('path');
const vm = require('vm');
const defaults = require('../com.courcelle.cryptoticker-dev.sdPlugin/js/default-settings');

function loadInspector() {
  const elements = new Map();
  function createElement() {
    return {
      value: '',
      style: {},
      options: [],
      classList: { add: jest.fn(), remove: jest.fn() },
      appendChild: jest.fn(),
      setAttribute: jest.fn(),
      addEventListener: jest.fn(),
      add(option) {
        this.options.push(option);
      },
      remove(index) {
        this.options.splice(index, 1);
      }
    };
  }
  const document = {
    getElementById(id) {
      if (!elements.has(id)) {
        const element = createElement();
        element.parentNode = createElement();
        elements.set(id, element);
      }
      return elements.get(id);
    },
    createElement,
    getElementsByClassName: () => [],
    querySelectorAll: () => []
  };
  const socket = { readyState: 1, send: jest.fn() };
  const context = vm.createContext({
    document,
    CryptoTickerDefaults: defaults,
    fetch: () => new Promise(() => {}),
    WebSocket: function () {
      return socket;
    },
    console,
    setTimeout: () => 1,
    clearTimeout: jest.fn(),
    URL,
    window: {}
  });
  vm.runInContext(
    fs.readFileSync(
      path.join(__dirname, '../com.courcelle.cryptoticker-dev.sdPlugin/js/pi.js'),
      'utf8'
    ),
    context
  );
  return { pi: vm.runInContext('pi', context), context, elements, socket };
}

function deferred() {
  let resolve;
  const promise = new Promise((callback) => {
    resolve = callback;
  });
  return { promise, resolve };
}

describe('property inspector lifecycle', () => {
  test('normalizes pair payloads and keeps official colon symbols', () => {
    const { context } = loadInspector();
    expect(context.normalizePairsList({ symbols: [] })).toEqual([]);
    expect(
      context.normalizePairsList([
        ' aave:usd ',
        { value: ' eth/usd ', symbol: ' ethusd ', display: ' ETH/USD ' },
        { value: 123 },
        { symbol: [] },
        ' ',
        null
      ])
    ).toEqual([
      { value: 'AAVE:USD', symbol: 'AAVE:USD', display: 'AAVE:USD' },
      { value: 'ETH/USD', symbol: 'ETHUSD', display: 'ETH/USD' }
    ]);
  });

  test('provider changes load the selected provider pairs', () => {
    const { pi, elements } = loadInspector();
    pi.handleExchangeChange = jest.fn();
    pi.checkNewSettings = jest.fn();

    elements.get('select-provider').onchange();

    expect(pi.handleExchangeChange).toHaveBeenCalledTimes(1);
    expect(pi.checkNewSettings).toHaveBeenCalledTimes(1);
  });

  test('an old pair request cannot replace the latest pair list', async () => {
    const { pi, elements } = loadInspector();
    const oldRequest = deferred();
    const newRequest = deferred();
    pi.getPairs = jest
      .fn()
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(newRequest.promise);
    pi.setPairDropdownData = jest.fn();
    elements.get('select-provider').value = 'BINANCE';

    const oldLoad = pi.populatePairsDropdown('BINANCE');
    const newLoad = pi.populatePairsDropdown('BINANCE');
    const newPairs = [{ value: 'ETHUSDT', symbol: 'ETHUSDT', display: 'ETHUSDT' }];
    newRequest.resolve(newPairs);
    await newLoad;
    oldRequest.resolve([{ value: 'BTCUSDT', symbol: 'BTCUSDT', display: 'BTCUSDT' }]);
    await oldLoad;

    expect(pi.setPairDropdownData).toHaveBeenCalledTimes(1);
    expect(pi.setPairDropdownData).toHaveBeenCalledWith('BINANCE', newPairs, expect.any(Object));
  });

  test('settings events update the open inspector for its action only', () => {
    const { pi, context, socket } = loadInspector();
    pi.extractSettings = jest.fn();
    context.connectElgatoStreamDeckSocket(
      '1234',
      'inspector',
      'registerPropertyInspector',
      '{}',
      JSON.stringify({ action: 'ticker', context: 'action', payload: { settings: {} } })
    );
    pi.extractSettings.mockClear();
    const settings = { mode: 'candles', pair: 'ETHUSDT' };
    socket.onmessage({
      data: JSON.stringify({
        event: 'didReceiveSettings',
        context: 'other',
        payload: { settings }
      })
    });
    expect(pi.extractSettings).not.toHaveBeenCalled();
    socket.onmessage({
      data: JSON.stringify({
        event: 'didReceiveSettings',
        context: 'action',
        payload: { settings }
      })
    });
    expect(pi.extractSettings).toHaveBeenCalledWith(settings);
    pi.saveSettings();
    expect(JSON.parse(socket.send.mock.calls[0][0])).toEqual(
      expect.objectContaining({ event: 'setSettings', action: 'ticker', context: 'action' })
    );
  });
});
