"use strict";

interface ContextDetailsEntry {
  context: string;
  settings: CryptoTickerSettings & Record<string, unknown>;
}

interface SubscriptionLike {
  unsubscribe?: () => void;
  [key: string]: unknown;
}

interface ConversionRateCacheEntry {
  rate?: number;
  fetchedAt?: number;
  promise?: Promise<number>;
  [key: string]: unknown;
}

interface CandlesCacheEntry {
  time?: number;
  candles?: CryptoTickerCandleData[] | null;
  [key: string]: unknown;
}

interface LastGoodTickerEntry {
  values: CryptoTickerTickerData;
  timestamp: number;
}

interface TickerStateExports {
  setContextDetails(context: string, settings: CryptoTickerSettings & Record<string, unknown>): void;
  getContextDetails(context: string): ContextDetailsEntry | null;
  forEachContext(callback: (entry: ContextDetailsEntry, context: string) => void): void;
  clearContextDetails(context: string): void;
  setSubscription(context: string, subscription: SubscriptionLike | null): void;
  getSubscription(context: string): SubscriptionLike | null;
  clearSubscription(context: string): void;
  setConnectionState(context: string, state: CryptoTickerConnectionState | string | null): void;
  getConnectionState(context: string): CryptoTickerConnectionState | string | null;
  clearConnectionState(context: string): void;
  getOrCreateConversionRateEntry(key: string): ConversionRateCacheEntry;
  setConversionRateEntry(key: string, entry: ConversionRateCacheEntry): void;
  getCandlesCacheEntry(key: string): CandlesCacheEntry | undefined;
  setCandlesCacheEntry(key: string, entry: CandlesCacheEntry): void;
  resetAllState(): void;
  setLastGoodTicker(context: string, values: CryptoTickerTickerData | null | undefined, timestamp?: number): void;
  getLastGoodTicker(context: string): LastGoodTickerEntry | null;
  clearLastGoodTicker(context: string): void;
}

(function loadTickerState(root: Record<string, unknown> | undefined, factory: () => TickerStateExports) {
  const exports = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = exports;
  }
  if (root && typeof root === "object") {
    (root as TickerStateGlobalRoot).CryptoTickerState = exports;
  }
})(typeof self !== "undefined" ? (self as unknown as Record<string, unknown>) : (this as unknown as Record<string, unknown>), function buildTickerState(): TickerStateExports {
  const contextDetails: Record<string, ContextDetailsEntry> = {};
  const contextSubscriptions: Record<string, SubscriptionLike | null> = {};
  const contextConnectionStates: Record<string, CryptoTickerConnectionState | string> = {};
  const conversionRatesCache: Record<string, ConversionRateCacheEntry> = {};
  const candlesCache: Record<string, CandlesCacheEntry> = {};
  const lastGoodTickerValues: Record<string, LastGoodTickerEntry> = {};

  function setContextDetails(context: string, settings: CryptoTickerSettings & Record<string, unknown>): void {
    contextDetails[context] = {
      context,
      settings
    };
  }

  function getContextDetails(context: string): ContextDetailsEntry | null {
    return contextDetails[context] || null;
  }

  function forEachContext(callback: (entry: ContextDetailsEntry, context: string) => void): void {
    Object.keys(contextDetails).forEach((ctx) => {
      callback(contextDetails[ctx], ctx);
    });
  }

  function clearContextDetails(context: string): void {
    delete contextDetails[context];
    delete lastGoodTickerValues[context];
  }

  function setSubscription(context: string, subscription: SubscriptionLike | null): void {
    if (!context) {
      return;
    }
    contextSubscriptions[context] = subscription || null;
  }

  function getSubscription(context: string): SubscriptionLike | null {
    if (!context) {
      return null;
    }
    return contextSubscriptions[context] || null;
  }

  function clearSubscription(context: string): void {
    if (!context) {
      return;
    }
    delete contextSubscriptions[context];
  }

  function setConnectionState(context: string, state: CryptoTickerConnectionState | string | null): void {
    if (!context) {
      return;
    }
    if (state) {
      contextConnectionStates[context] = state;
    }
  }

  function getConnectionState(context: string): CryptoTickerConnectionState | string | null {
    if (!context) {
      return null;
    }
    return contextConnectionStates[context] || null;
  }

  function clearConnectionState(context: string): void {
    if (!context) {
      return;
    }
    delete contextConnectionStates[context];
    delete lastGoodTickerValues[context];
  }

  function getOrCreateConversionRateEntry(key: string): ConversionRateCacheEntry {
    if (!conversionRatesCache[key]) {
      conversionRatesCache[key] = {};
    }
    return conversionRatesCache[key];
  }

  function setConversionRateEntry(key: string, entry: ConversionRateCacheEntry): void {
    conversionRatesCache[key] = entry;
  }

  function getCandlesCacheEntry(key: string): CandlesCacheEntry | undefined {
    return candlesCache[key];
  }

  function setCandlesCacheEntry(key: string, entry: CandlesCacheEntry): void {
    candlesCache[key] = entry;
  }

  function resetAllState(): void {
    Object.keys(contextDetails).forEach((key) => {
      delete contextDetails[key];
    });
    Object.keys(contextSubscriptions).forEach((key) => {
      const sub = contextSubscriptions[key];
      if (sub && typeof sub.unsubscribe === "function") {
        try {
          sub.unsubscribe();
        } catch (err) {
          // ignore errors while resetting state
        }
      }
      delete contextSubscriptions[key];
    });
    Object.keys(contextConnectionStates).forEach((key) => {
      delete contextConnectionStates[key];
    });
    Object.keys(conversionRatesCache).forEach((key) => {
      delete conversionRatesCache[key];
    });
    Object.keys(candlesCache).forEach((key) => {
      delete candlesCache[key];
    });
    Object.keys(lastGoodTickerValues).forEach((key) => {
      delete lastGoodTickerValues[key];
    });
  }

  function setLastGoodTicker(
    context: string,
    values: CryptoTickerTickerData | null | undefined,
    timestamp?: number
  ): void {
    if (!context || !values) {
      return;
    }

    const safeTimestamp = typeof timestamp === "number" ? timestamp : Date.now();
    lastGoodTickerValues[context] = {
      values: Object.assign({}, values),
      timestamp: safeTimestamp
    };
  }

  function getLastGoodTicker(context: string): LastGoodTickerEntry | null {
    if (!context) {
      return null;
    }

    return lastGoodTickerValues[context] || null;
  }

  function clearLastGoodTicker(context: string): void {
    if (!context) {
      return;
    }

    delete lastGoodTickerValues[context];
  }

  return {
    setContextDetails,
    getContextDetails,
    forEachContext,
    clearContextDetails,
    setSubscription,
    getSubscription,
    clearSubscription,
    setConnectionState,
    getConnectionState,
    clearConnectionState,
    getOrCreateConversionRateEntry,
    setConversionRateEntry,
    getCandlesCacheEntry,
    setCandlesCacheEntry,
    resetAllState,
    setLastGoodTicker,
    getLastGoodTicker,
    clearLastGoodTicker
  };
});

interface TickerStateGlobalRoot extends Record<string, unknown> {
  CryptoTickerState?: TickerStateExports;
}
