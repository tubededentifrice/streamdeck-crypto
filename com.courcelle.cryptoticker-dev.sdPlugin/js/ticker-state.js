"use strict";

(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.CryptoTickerState = factory();
    }
}(typeof self !== "undefined" ? self : this, function () {
    // Everything here is in-memory per Stream Deck runtime. Keys are bound to
    // the action context so hotkeys, multi-actions, and dev preview can share
    // the same APIs without stepping on each other.
    const contextDetails = {};
    const contextSubscriptions = {};
    const contextConnectionStates = {};
    const conversionRatesCache = {};
    const candlesCache = {};
    const lastGoodTickerValues = {};

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
        delete lastGoodTickerValues[context];
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
        Object.keys(lastGoodTickerValues).forEach(function (key) {
            delete lastGoodTickerValues[key];
        });
    }

    // Persist the last successful payload so we can render something useful
    // when providers temporarily go stale (e.g., network hiccups).
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
}));
