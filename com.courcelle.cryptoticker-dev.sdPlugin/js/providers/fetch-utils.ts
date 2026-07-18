'use strict';

interface FetchUtilsExports {
  DEFAULT_REQUEST_TIMEOUT_MS: number;
  fetchWithTimeout(url: string, options?: RequestInit, timeoutMs?: number): Promise<Response>;
}

(function loadFetchUtils(
  root: Record<string, unknown> | undefined,
  factory: () => FetchUtilsExports
) {
  const exports = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = exports;
  }
  if (root && typeof root === 'object') {
    const globalRoot = root as FetchUtilsGlobalRoot;
    globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
    globalRoot.CryptoTickerProviders.fetchWithTimeout = exports.fetchWithTimeout;
    globalRoot.CryptoTickerProviders.DEFAULT_REQUEST_TIMEOUT_MS =
      exports.DEFAULT_REQUEST_TIMEOUT_MS;
  }
})(
  typeof globalThis !== 'undefined'
    ? (globalThis as unknown as Record<string, unknown>)
    : undefined,
  function buildFetchUtils(): FetchUtilsExports {
    const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

    function fetchWithTimeout(
      url: string,
      options?: RequestInit,
      timeoutMs?: number
    ): Promise<Response> {
      const requestTimeout =
        typeof timeoutMs === 'number' && timeoutMs > 0 ? timeoutMs : DEFAULT_REQUEST_TIMEOUT_MS;
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
  }
);

interface FetchUtilsGlobalRoot extends Record<string, unknown> {
  CryptoTickerProviders?: Record<string, unknown> & Partial<FetchUtilsExports>;
}
