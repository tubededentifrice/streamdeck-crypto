(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        const config = factory();
        root.CryptoTickerConfig = Object.assign({}, root.CryptoTickerConfig || {}, config);
    }
}(typeof self !== "undefined" ? self : this, function () {
    return {
        tProxyBase: "https://tproxyv8.opendle.com",
        fallbackPollIntervalMs: 60000,
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
            conversionError: "CONVERSION ERROR"
        }
    };
}));
