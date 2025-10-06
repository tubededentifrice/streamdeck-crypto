(function (root: Record<string, unknown>, factory: () => CryptoTickerRuntimeConfig) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        const config = factory();
        root.CryptoTickerConfig = Object.assign({}, root.CryptoTickerConfig || {}, config);
    }
}(typeof self !== "undefined" ? (self as unknown as Record<string, unknown>) : (this as unknown as Record<string, unknown>), function buildConfig(): CryptoTickerRuntimeConfig {
    return {
        tProxyBase: "https://tproxyv8.opendle.com",
        fallbackPollIntervalMs: 60_000,
        staleTickerTimeoutMs: 5 * 60 * 1000,
        binanceRestBaseUrl: "https://api.binance.com",
        binanceWsBaseUrl: "wss://stream.binance.com:9443/ws",
        binanceSymbolOverrides: {},
        bitfinexRestBaseUrl: "https://api-pub.bitfinex.com",
        bitfinexWsBaseUrl: "wss://api-pub.bitfinex.com/ws/2",
        bitfinexSymbolOverrides: {},
        messages: {
            loading: "LOADING...",
            stale: "STALE",
            noData: "NO DATA",
            misconfigured: "INVALID PAIR",
            conversionError: "CONVERT ERROR"
        }
    };
}));

interface CryptoTickerRuntimeConfig {
    tProxyBase: string;
    fallbackPollIntervalMs: number;
    staleTickerTimeoutMs: number;
    binanceRestBaseUrl: string;
    binanceWsBaseUrl: string;
    binanceSymbolOverrides: Record<string, string>;
    bitfinexRestBaseUrl: string;
    bitfinexWsBaseUrl: string;
    bitfinexSymbolOverrides: Record<string, string>;
    messages: CryptoTickerMessageConfig;
}
