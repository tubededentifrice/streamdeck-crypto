"use strict";

(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.CryptoTickerState = factory();
    }
}(typeof self !== "undefined" ? self : this, function () {
    const contextDetails = {};
    const contextSubscriptions = {};
    const contextConnectionStates = {};
    const conversionRatesCache = {};
    const candlesCache = {};

    function setContextDetails(context, settings) {
        contextDetails[context] = {
            context: context,
            settings: settings
        };
    }

    function getContextDetails(context) {
        return contextDetails[context] || null;
    }

    function forEachContext(callback) {
        Object.keys(contextDetails).forEach(function (ctx) {
            callback(contextDetails[ctx], ctx);
        });
    }

    function clearContextDetails(context) {
        delete contextDetails[context];
    }

    function setSubscription(context, subscription) {
        contextSubscriptions[context] = subscription;
    }

    function getSubscription(context) {
        return contextSubscriptions[context] || null;
    }

    function clearSubscription(context) {
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
        Object.keys(contextDetails).forEach(function (key) {
            delete contextDetails[key];
        });
        Object.keys(contextSubscriptions).forEach(function (key) {
            const sub = contextSubscriptions[key];
            if (sub && typeof sub.unsubscribe === "function") {
                try {
                    sub.unsubscribe();
                } catch (err) {
                    // noop in reset
                }
            }
            delete contextSubscriptions[key];
        });
        Object.keys(contextConnectionStates).forEach(function (key) {
            delete contextConnectionStates[key];
        });
        Object.keys(conversionRatesCache).forEach(function (key) {
            delete conversionRatesCache[key];
        });
        Object.keys(candlesCache).forEach(function (key) {
            delete candlesCache[key];
        });
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
        resetAllState
    };
}));
