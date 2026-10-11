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
        const requestTimeout = typeof timeoutMs === 'number' && Number.isFinite(timeoutMs) && timeoutMs > 0
            ? timeoutMs
            : DEFAULT_REQUEST_TIMEOUT_MS;
        const requestOptions = Object.assign({}, options || {});
        const callerSignal = requestOptions.signal;
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        if (controller) {
            requestOptions.signal = controller.signal;
        }
        let timerId;
        let abortCaller;
        const request = new Promise((resolve, reject) => {
            abortCaller = () => {
                controller === null || controller === void 0 ? void 0 : controller.abort();
                reject((callerSignal === null || callerSignal === void 0 ? void 0 : callerSignal.reason) || new Error('Request aborted'));
            };
            if (callerSignal === null || callerSignal === void 0 ? void 0 : callerSignal.aborted) {
                abortCaller();
                return;
            }
            callerSignal === null || callerSignal === void 0 ? void 0 : callerSignal.addEventListener('abort', abortCaller, { once: true });
            timerId = setTimeout(() => {
                controller === null || controller === void 0 ? void 0 : controller.abort();
                const error = new Error('Request timed out');
                error.name = 'TimeoutError';
                reject(error);
            }, requestTimeout);
            Promise.resolve(fetch(url, requestOptions)).then(resolve, reject);
        });
        return request.finally(() => {
            clearTimeout(timerId);
            if (abortCaller) {
                callerSignal === null || callerSignal === void 0 ? void 0 : callerSignal.removeEventListener('abort', abortCaller);
            }
        });
    }
    return {
        DEFAULT_REQUEST_TIMEOUT_MS,
        fetchWithTimeout
    };
});
