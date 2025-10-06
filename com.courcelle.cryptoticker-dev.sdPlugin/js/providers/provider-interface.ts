(function (root: Record<string, unknown> | undefined, factory: () => ProviderInterfaceExports) {
    const globalRoot = (typeof globalThis !== "undefined" ? globalThis : root) as ProviderInterfaceGlobalRoot | undefined;
    const exportsValue = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = exportsValue;
    }

    if (globalRoot) {
        globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
        globalRoot.CryptoTickerProviders.ProviderInterface = exportsValue.ProviderInterface;
    }
}(typeof self !== "undefined" ? (self as unknown as Record<string, unknown>) : (this as unknown as Record<string, unknown>), function buildProviderInterface(): ProviderInterfaceExports {
    function noop(): void {
        // no-op
    }

    class ProviderInterface implements CryptoTickerProviderInterface {
        public baseUrl: string;
        public logger: (...args: unknown[]) => void;

        constructor(options?: CryptoTickerProviderOptions) {
            const opts = options || {};
            this.baseUrl = typeof opts.baseUrl === "string" ? opts.baseUrl : "";
            this.logger = typeof opts.logger === "function" ? opts.logger : noop;
        }

        getId(): string {
            throw new Error("Provider must implement getId()");
        }

        subscribeTicker(
            _params: CryptoTickerTickerParams,
            _handlers: CryptoTickerSubscriptionHandlers
        ): CryptoTickerSubscriptionHandle | null {
            throw new Error("Provider must implement subscribeTicker()");
        }

        async fetchTicker(_params: CryptoTickerTickerParams): Promise<CryptoTickerTickerData | null> {
            throw new Error("Provider must implement fetchTicker()");
        }

        getCachedTicker(_key: string): CryptoTickerTickerData | null {
            return null;
        }

        async fetchCandles(_params: CryptoTickerCandlesParams): Promise<CryptoTickerCandleData[] | null> {
            throw new Error("Provider must implement fetchCandles()");
        }

        ensureConnection(): void {
            // Optional override by providers using websockets.
        }

        async fetchConversionRate(fromCurrency: string, toCurrency: string): Promise<number> {
            if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) {
                return 1;
            }

            return 1;
        }
    }

    return {
        ProviderInterface
    };
}));

interface ProviderInterfaceGlobalRoot extends Record<string, unknown> {
    CryptoTickerProviders?: Record<string, unknown> & {
        ProviderInterface?: unknown;
    };
}

interface ProviderInterfaceExports {
    ProviderInterface: new (options?: CryptoTickerProviderOptions) => CryptoTickerProviderInterface;
}
