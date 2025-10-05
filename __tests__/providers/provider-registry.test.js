const genericInstances = [];
const binanceInstances = [];
const bitfinexInstances = [];
const yfinanceInstances = [];

jest.mock("../../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/generic-provider.js", () => {
    return {
        GenericProvider: class {
            constructor(options) {
                this.options = options;
                this.ensureConnection = jest.fn();
                genericInstances.push(this);
            }
            getId() {
                return "GENERIC";
            }
        }
    };
});

jest.mock("../../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/binance-provider.js", () => {
    return {
        BinanceProvider: class {
            constructor(options) {
                this.options = options;
                this.ensureConnection = jest.fn();
                binanceInstances.push(this);
            }
            getId() {
                return "BINANCE";
            }
        }
    };
});

jest.mock("../../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/bitfinex-provider.js", () => {
    return {
        BitfinexProvider: class {
            constructor(options) {
                this.options = options;
                this.ensureConnection = jest.fn();
                bitfinexInstances.push(this);
            }
            getId() {
                return "BITFINEX";
            }
        }
    };
});

jest.mock("../../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/yfinance-provider.js", () => {
    return {
        YFinanceProvider: class {
            constructor(options) {
                this.options = options;
                this.ensureConnection = jest.fn();
                yfinanceInstances.push(this);
            }
            getId() {
                return "YFINANCE";
            }
        }
    };
});

const { ProviderRegistry } = require("../../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/provider-registry.js");

describe("ProviderRegistry", () => {
    beforeEach(() => {
        genericInstances.length = 0;
        binanceInstances.length = 0;
        bitfinexInstances.length = 0;
        yfinanceInstances.length = 0;
    });

    test("registers providers with shared options and generic fallback", () => {
        const registry = new ProviderRegistry({
            baseUrl: "https://proxy",
            fallbackPollIntervalMs: 5000,
            staleTickerTimeoutMs: 60000
        });

        expect(genericInstances).toHaveLength(1);
        expect(binanceInstances).toHaveLength(1);
        expect(bitfinexInstances).toHaveLength(1);
        expect(yfinanceInstances).toHaveLength(1);

        const generic = genericInstances[0];
        const binance = binanceInstances[0];
        const bitfinex = bitfinexInstances[0];

        expect(binance.options.genericFallback).toBe(generic);
        expect(bitfinex.options.genericFallback).toBe(generic);
        expect(binance.options.baseUrl).toBe("https://proxy");
        expect(bitfinex.options.baseUrl).toBe("https://proxy");
    });

    test("getProvider returns registered provider or generic fallback", () => {
        const registry = new ProviderRegistry({ baseUrl: "https://proxy" });
        const binance = binanceInstances[0];
        const generic = genericInstances[0];

        expect(registry.getProvider("BINANCE")).toBe(binance);
        expect(registry.getProvider("unknown")).toBe(generic);
    });

    test("ensureAllConnections delegates to providers", () => {
        const registry = new ProviderRegistry({ baseUrl: "https://proxy" });
        registry.ensureAllConnections();

        expect(binanceInstances[0].ensureConnection).toHaveBeenCalled();
        expect(bitfinexInstances[0].ensureConnection).toHaveBeenCalled();
        expect(yfinanceInstances[0].ensureConnection).toHaveBeenCalled();
    });
});
