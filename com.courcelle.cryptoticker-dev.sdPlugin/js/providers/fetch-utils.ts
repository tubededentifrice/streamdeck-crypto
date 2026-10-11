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
        typeof timeoutMs === 'number' && Number.isFinite(timeoutMs) && timeoutMs > 0
          ? timeoutMs
          : DEFAULT_REQUEST_TIMEOUT_MS;
      const requestOptions = Object.assign({}, options || {});
      const callerSignal = requestOptions.signal;
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      if (controller) {
        requestOptions.signal = controller.signal;
      }

      let timerId: ReturnType<typeof setTimeout> | undefined;
      let abortCaller: (() => void) | undefined;
      const request = new Promise<Response>((resolve, reject) => {
        abortCaller = () => {
          controller?.abort();
          reject(callerSignal?.reason || new Error('Request aborted'));
        };
        if (callerSignal?.aborted) {
          abortCaller();
          return;
        }
        callerSignal?.addEventListener('abort', abortCaller, { once: true });
        timerId = setTimeout(() => {
          controller?.abort();
          const error = new Error('Request timed out');
          error.name = 'TimeoutError';
          reject(error);
        }, requestTimeout);
        Promise.resolve(fetch(url, requestOptions)).then(resolve, reject);
      });

      return request.finally(() => {
        clearTimeout(timerId);
        if (abortCaller) {
          callerSignal?.removeEventListener('abort', abortCaller);
        }
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
