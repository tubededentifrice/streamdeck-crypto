"use strict";
(function loadTickerState(root, factory) {
    const exports = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = exports;
    }
    else {
        root.CryptoTickerState = exports;
    }
})(typeof self !== "undefined" ? self : this, function buildTickerState() {
    const contextDetails = {};
    const contextSubscriptions = {};
    const contextConnectionStates = {};
    const conversionRatesCache = {};
    const candlesCache = {};
    const lastGoodTickerValues = {};
    function setContextDetails(context, settings) {
        contextDetails[context] = {
            context,
            settings
        };
    }
    function getContextDetails(context) {
        return contextDetails[context] || null;
    }
    function forEachContext(callback) {
        Object.keys(contextDetails).forEach((ctx) => {
            callback(contextDetails[ctx], ctx);
        });
    }
    function clearContextDetails(context) {
        delete contextDetails[context];
        delete lastGoodTickerValues[context];
    }
    function setSubscription(context, subscription) {
        if (!context) {
            return;
        }
        contextSubscriptions[context] = subscription || null;
    }
    function getSubscription(context) {
        if (!context) {
            return null;
        }
        return contextSubscriptions[context] || null;
    }
    function clearSubscription(context) {
        if (!context) {
            return;
        }
        delete contextSubscriptions[context];
    }
    function setConnectionState(context, state) {
        if (!context) {
            return;
        }
        if (state) {
            contextConnectionStates[context] = state;
        }
    }
    function getConnectionState(context) {
        if (!context) {
            return null;
        }
        return contextConnectionStates[context] || null;
    }
    function clearConnectionState(context) {
        if (!context) {
            return;
        }
        delete contextConnectionStates[context];
        delete lastGoodTickerValues[context];
    }
    function getOrCreateConversionRateEntry(key) {
        if (!conversionRatesCache[key]) {
            conversionRatesCache[key] = {};
        }
        return conversionRatesCache[key];
    }
    function setConversionRateEntry(key, entry) {
        conversionRatesCache[key] = entry;
    }
    function getCandlesCacheEntry(key) {
        return candlesCache[key];
    }
    function setCandlesCacheEntry(key, entry) {
        candlesCache[key] = entry;
    }
    function resetAllState() {
        Object.keys(contextDetails).forEach((key) => {
            delete contextDetails[key];
        });
        Object.keys(contextSubscriptions).forEach((key) => {
            const sub = contextSubscriptions[key];
            if (sub && typeof sub.unsubscribe === "function") {
                try {
                    sub.unsubscribe();
                }
                catch (err) {
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
    function setLastGoodTicker(context, values, timestamp) {
        if (!context || !values) {
            return;
        }
        const safeTimestamp = typeof timestamp === "number" ? timestamp : Date.now();
        lastGoodTickerValues[context] = {
            values: Object.assign({}, values),
            timestamp: safeTimestamp
        };
    }
    function getLastGoodTicker(context) {
        if (!context) {
            return null;
        }
        return lastGoodTickerValues[context] || null;
    }
    function clearLastGoodTicker(context) {
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
