'use strict';
(function loadFetchUtils(root, factory) {
    const exports = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = exports;
    }
    if (root && typeof root === 'object') {
        const globalRoot = root;
        globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
        globalRoot.CryptoTickerProviders.fetchWithTimeout = exports.fetchWithTimeout;
        globalRoot.CryptoTickerProviders.DEFAULT_REQUEST_TIMEOUT_MS =
            exports.DEFAULT_REQUEST_TIMEOUT_MS;
    }
})(typeof globalThis !== 'undefined'
    ? globalThis
    : undefined, function buildFetchUtils() {
    const DEFAULT_REQUEST_TIMEOUT_MS = 10000;
    function fetchWithTimeout(url, options, timeoutMs) {
        const requestTimeout = typeof timeoutMs === 'number' && timeoutMs > 0 ? timeoutMs : DEFAULT_REQUEST_TIMEOUT_MS;
        const requestOptions = Object.assign({}, options || {});
        if (typeof AbortController === 'undefined' || requestOptions.signal) {
            return fetch(url, requestOptions);
        }
        const controller = new AbortController();
        const timerId = setTimeout(function abortTimedOutRequest() {
            controller.abort();
        }, requestTimeout);
        requestOptions.signal = controller.signal;
        return fetch(url, requestOptions).finally(function clearRequestTimeout() {
            clearTimeout(timerId);
        });
    }
    return {
        DEFAULT_REQUEST_TIMEOUT_MS,
        fetchWithTimeout
    };
});
