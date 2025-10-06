/// <reference path="../libs/js/action.js" />
/// <reference path="../libs/js/stream-deck.js" />

/* global DestinationEnum, CryptoTickerConstants */

const defaultConfig = {
    "tProxyBase": "https://tproxyv8.opendle.com",
    "fallbackPollIntervalMs": 60000,
    "staleTickerTimeoutMs": 6 * 60 * 1000,
    "messages": {
        "loading": "LOADING...",
        "stale": "STALE",
        "noData": "NO DATA",
        "misconfigured": "INVALID PAIR",
        "conversionError": "CONVERSION ERROR"
    }
};

function requireOrNull(modulePath) {
    if (typeof require === "function") {
        try {
            return require(modulePath);
        } catch (err) {
            return null;
        }
    }

    return null;
}

function resolveGlobalConfig() {
    if (typeof CryptoTickerConfig !== "undefined") {
        return CryptoTickerConfig;
    }

    return null;
}

// Normalize PI/runtime currency values; accept null/number so stale settings do not crash.
function normalizeCurrencyCode(value) {
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            return null;
        }
        return trimmed.toUpperCase();
    }

    if (value === null || value === undefined) {
        return null;
    }

    return String(value).trim().toUpperCase() || null;
}

const moduleConfig = requireOrNull("./config");
const constantsModule = requireOrNull("./constants");
const globalConfig = resolveGlobalConfig();
const runtimeConfig = Object.assign({}, defaultConfig, moduleConfig || {}, globalConfig || {});
const constants = constantsModule || (typeof CryptoTickerConstants !== "undefined" ? CryptoTickerConstants : null) || {};
const TIMESTAMP_SECONDS_THRESHOLD = typeof constants.TIMESTAMP_SECONDS_THRESHOLD === "number" ? constants.TIMESTAMP_SECONDS_THRESHOLD : 9999999999;
const tProxyBase = runtimeConfig.tProxyBase;
const DEFAULT_MESSAGE_CONFIG = defaultConfig.messages;
const messageConfig = Object.assign({}, DEFAULT_MESSAGE_CONFIG, (runtimeConfig && runtimeConfig.messages) || {});

const subscriptionKeyModule = requireOrNull("./providers/subscription-key");
const globalProviders = typeof CryptoTickerProviders !== "undefined" ? CryptoTickerProviders : null;
// Local fallback keeps subscription key format stable when provider bundle missing (tests/preview).
const buildSubscriptionKey = subscriptionKeyModule && subscriptionKeyModule.buildSubscriptionKey
    ? subscriptionKeyModule.buildSubscriptionKey
    : globalProviders && typeof globalProviders.buildSubscriptionKey === "function"
        ? globalProviders.buildSubscriptionKey
        : function (exchange, symbol, fromCurrency, toCurrency) {
            const exchangePart = exchange || "";
            const symbolPart = symbol || "";
            const fromPart = fromCurrency || null;
            const toPart = toCurrency || null;
            let convertPart = "";
            if (fromPart !== null && toPart !== null && fromPart !== toPart) {
                convertPart = "__" + fromPart + "_" + toPart;
            }
            return exchangePart + "__" + symbolPart + convertPart;
        };

const connectionStatesModule = requireOrNull("./providers/connection-states");
const connectionStates = connectionStatesModule || (typeof CryptoTickerConnectionStates !== "undefined" ? CryptoTickerConnectionStates : {
    LIVE: "live",
    DETACHED: "detached",
    BACKUP: "backup",
    BROKEN: "broken"
});

const canvasRendererModule = requireOrNull("./canvas-renderer");
const alertManagerModule = requireOrNull("./alert-manager");
const formattersModule = requireOrNull("./formatters");
const tickerStateModule = requireOrNull("./ticker-state");
const settingsManagerModule = requireOrNull("./settings-manager");

const canvasRenderer = canvasRendererModule || (typeof CryptoTickerCanvasRenderer !== "undefined" ? CryptoTickerCanvasRenderer : null);
const alertManager = alertManagerModule || (typeof CryptoTickerAlertManager !== "undefined" ? CryptoTickerAlertManager : null);
const formatters = formattersModule || (typeof CryptoTickerFormatters !== "undefined" ? CryptoTickerFormatters : null);
const tickerState = tickerStateModule || (typeof CryptoTickerState !== "undefined" ? CryptoTickerState : null);
const settingsManager = settingsManagerModule || (typeof CryptoTickerSettingsManager !== "undefined" ? CryptoTickerSettingsManager : null);

if (!canvasRenderer || !alertManager || !formatters || !tickerState || !settingsManager) {
    throw new Error("CryptoTicker dependencies are not available");
}

let loggingEnabled = false;
let websocket = null;
let canvas;
let canvasContext;
const screenshotMode = false; // Allows rendering the canvas in an external preview

const CONVERSION_CACHE_TTL_MS = 60 * 60 * 1000;
let providerRegistrySingleton = null;

const applyDefaultSettings = settingsManager.applyDefaultSettings;
const defaultSettings = settingsManager.defaultSettings;
const getDefaultSettingsSnapshot = settingsManager.getDefaultSettingsSnapshot;
const settingsSchema = settingsManager.settingsSchema;

const tickerAction = {
    type: "com.courcelle.cryptoticker.ticker",
    log: function (...data) {
        if (loggingEnabled) {
            console.log(...data);
        }
    },

    setContextConnectionState: function (context, state) {
        tickerState.setConnectionState(context, state);
    },

    getContextConnectionState: function (context) {
        return tickerState.getConnectionState(context);
    },

    clearContextConnectionState: function (context) {
        tickerState.clearConnectionState(context);
    },

    getProviderRegistry: function () {
        if (!providerRegistrySingleton) {
            // Lazy-load to avoid pulling heavy providers in PI/tests yet keep runtime behavior.
            const providerRegistryModule = requireOrNull("./providers/provider-registry");
            const ProviderRegistryClass = providerRegistryModule && providerRegistryModule.ProviderRegistry
                ? providerRegistryModule.ProviderRegistry
                : globalProviders && globalProviders.ProviderRegistry
                    ? globalProviders.ProviderRegistry
                    : null;

            if (!ProviderRegistryClass) {
                throw new Error("ProviderRegistry is not available");
            }

            providerRegistrySingleton = new ProviderRegistryClass({
                baseUrl: tProxyBase,
                logger: (...args) => {
                    this.log(...args);
                },
                fallbackPollIntervalMs: runtimeConfig.fallbackPollIntervalMs,
                staleTickerTimeoutMs: runtimeConfig.staleTickerTimeoutMs,
                binanceRestBaseUrl: runtimeConfig.binanceRestBaseUrl,
                binanceWsBaseUrl: runtimeConfig.binanceWsBaseUrl,
                binanceSymbolOverrides: runtimeConfig.binanceSymbolOverrides,
                bitfinexRestBaseUrl: runtimeConfig.bitfinexRestBaseUrl,
                bitfinexWsBaseUrl: runtimeConfig.bitfinexWsBaseUrl,
                bitfinexSymbolOverrides: runtimeConfig.bitfinexSymbolOverrides
            });
        }

        return providerRegistrySingleton;
    },

    websocketSend: function (object) {
        if (websocket) {
            websocket.send(object);
        }
    },

    onKeyDown: async function (context, settings, _coordinates, _userDesiredState) {
        // State machine between modes
        switch (settings.mode) {
            case "candles":
                settings.mode = "ticker";
                break;
            case "ticker":
            default:
                if (alertManager.shouldDisarmOnKeyPress(context)) {
                    alertManager.disarmAlert(context);
                } else {
                    // Switch mode by default
                    settings.mode = "candles";
                }
                break;
        }

        // Update settings with current mode
        this.websocketSend(JSON.stringify({
            "event": "setSettings",
            "context": context,
            "payload": settings
        }));

        this.refreshTimer(context, settings);
        // this.updateTicker(context, settings); // Already done by refreshTimer
    },
    onKeyUp: function (_context, _settings, _coordinates, _userDesiredState) {
    },
    onWillAppear: async function (context, settings, _coordinates) {
        this.initCanvas();

        this.refreshTimer(context, settings);
        // this.updateTicker(context, settings); // Already done by refreshTimer
    },
    refreshTimers: async function () {
        // Make sure everybody is connected
        tickerState.forEachContext((details) => {
            this.refreshTimer(
                details["context"],
                details["settings"]
            );
        });
    },
    refreshTimer: async function (context, settings) {
        const normalizedSettings = this.refreshSettings(context, settings);

        // Force refresh of the display (in case WebSockets doesn't work and to update the candles)
        this.updateTicker(context, normalizedSettings);
    },
    connect: function () {
        const registry = this.getProviderRegistry();
        if (registry && typeof registry.ensureAllConnections === "function") {
            registry.ensureAllConnections();
        }
    },
    updateSubscription: function (context, settings) {
        const exchange = settings["exchange"];
        const pair = settings["pair"];
        const currencies = this.resolveConversionCurrencies(settings["fromCurrency"], settings["currency"]);
        const subscriptionKey = this.getSubscriptionContextKey(exchange, pair, currencies.from, null);
        const current = tickerState.getSubscription(context);
        if (current && current.key === subscriptionKey) {
            return current;
        }

        if (current && typeof current.unsubscribe === "function") {
            // Tear down previous sub; lingering sockets pile up when switching pairs.
            try {
                current.unsubscribe();
            } catch (err) {
                this.log("Error unsubscribing from provider", err);
            }
            tickerState.clearSubscription(context);
            this.clearContextConnectionState(context);
        }

        const registry = this.getProviderRegistry();
        const provider = registry.getProvider(exchange);
        const params = {
            exchange: exchange,
            symbol: pair,
            fromCurrency: currencies.from,
            toCurrency: null
        };
        const self = this;

        try {
            const handle = provider.subscribeTicker(params, {
                onData: async function (tickerValues) {
                    const details = tickerState.getContextDetails(context);
                    if (!details) {
                        return;
                    }

                    self.setContextConnectionState(details.context, tickerValues && tickerValues.connectionState);
                    try {
                        const convertedTicker = await self.convertTickerValues(
                            tickerValues,
                            details.settings && details.settings.fromCurrency,
                            details.settings && details.settings.currency
                        );
                        await self.updateCanvas(details.context, details.settings, convertedTicker);
                    } catch (err) {
                        self.log("Error updating canvas from subscription", err);
                    }
                },
                onError: function (error) {
                    self.log("Provider subscription error", error);
                    self.setContextConnectionState(context, connectionStates.BROKEN);
                }
            });

            tickerState.setSubscription(context, {
                key: subscriptionKey,
                unsubscribe: handle && typeof handle.unsubscribe === "function" ? handle.unsubscribe : function () {},
                providerId: provider.getId ? provider.getId() : null
            });
            return tickerState.getSubscription(context);
        } catch (err) {
            this.log("Error subscribing to provider", err);
        }

        return null;
    },
    refreshSettings: function (context, settings) {
        return settingsManager.refreshSettings({
            context: context,
            settings: settings,
            updateSubscription: (normalizedSettings) => {
                this.updateSubscription(context, normalizedSettings);
            }
        });
    },
    getSubscriptionContextKey: function (exchange, pair, fromCurrency, toCurrency) {
        return buildSubscriptionKey(exchange, pair, fromCurrency, toCurrency);
    },

    // Decide if conversion needed; empty/same override → `to:null`.
    resolveConversionCurrencies: function (fromCurrency, toCurrency) {
        const resolvedFrom = normalizeCurrencyCode(fromCurrency) || "USD";
        const resolvedTo = normalizeCurrencyCode(toCurrency);

        if (!resolvedTo || resolvedTo === resolvedFrom) {
            return {
                from: resolvedFrom,
                to: null
            };
        }

        return {
            from: resolvedFrom,
            to: resolvedTo
        };
    },

    getConversionRate: async function (fromCurrency, toCurrency) {
        const from = normalizeCurrencyCode(fromCurrency);
        const to = normalizeCurrencyCode(toCurrency);

        if (!from || !to || from === to) {
            return 1;
        }

        const key = from + "_" + to;
        const now = Date.now();
        const cacheEntry = tickerState.getOrCreateConversionRateEntry(key);

        if (typeof cacheEntry.rate === "number" && cacheEntry.rate > 0 && cacheEntry.fetchedAt && (now - cacheEntry.fetchedAt) < CONVERSION_CACHE_TTL_MS) {
            return cacheEntry.rate;
        }

        if (cacheEntry.promise) {
            // Reuse pending fetch; swallow failure so next call can retry.
            try {
                return await cacheEntry.promise;
            } catch (promiseErr) {
                this.log("Conversion rate promise failed", promiseErr);
            }
        }

        const fetchFn = typeof fetch === "function" ? fetch : null;
        if (!fetchFn) {
            return typeof cacheEntry.rate === "number" && cacheEntry.rate > 0 ? cacheEntry.rate : 1;
        }

        const baseUrl = (tProxyBase || "").replace(/\/$/, "");
        if (!baseUrl) {
            return typeof cacheEntry.rate === "number" && cacheEntry.rate > 0 ? cacheEntry.rate : 1;
        }

        const url = baseUrl + "/api/ticker/json/currency/" + encodeURIComponent(from) + "/" + encodeURIComponent(to);
        const self = this;

        cacheEntry.promise = (async function () {
            try {
                const response = await fetchFn(url);
                if (!response || !response.ok) {
                    throw new Error("Conversion rate response not ok");
                }

                const json = await response.json();
                const parsedRate = json && json.rate !== undefined ? parseFloat(json.rate) : NaN;
                if (!parsedRate || !isFinite(parsedRate) || parsedRate <= 0) {
                    throw new Error("Invalid conversion rate");
                }

                cacheEntry.rate = parsedRate;
                cacheEntry.fetchedAt = Date.now();
                return parsedRate;
            } catch (err) {
                self.log("Error fetching conversion rate", err);
                throw err;
            } finally {
                delete cacheEntry.promise;
            }
        })();

        try {
            return await cacheEntry.promise;
        } catch (err) {
            if (typeof cacheEntry.rate === "number" && cacheEntry.rate > 0) {
                return cacheEntry.rate;
            }

            // Keep legacy fallback: surface cached rate else hardcode 1 so old flows keep working.
            return 1;
        }
    },

    convertTickerValues: async function (tickerValues, fromCurrency, toCurrency) {
        if (!tickerValues) {
            return tickerValues;
        }

        const currencies = this.resolveConversionCurrencies(fromCurrency, toCurrency);
        if (!currencies.to) {
            return tickerValues;
        }

        const existingTo = normalizeCurrencyCode(tickerValues.conversionToCurrency);
        const existingFrom = normalizeCurrencyCode(tickerValues.conversionFromCurrency);
        if (existingTo === currencies.to && existingFrom === currencies.from) {
            return tickerValues;
        }

        let rate = null;
        try {
            rate = await this.getConversionRate(currencies.from, currencies.to);
        } catch (err) {
            this.log("Conversion rate error", err);
            return this.createConversionErrorValues(tickerValues);
        }

        if (!rate || !isFinite(rate) || rate <= 0) {
            return this.createConversionErrorValues(tickerValues);
        }

        return this.applyTickerConversion(tickerValues, rate, currencies.from, currencies.to);
    },

    // Strip numeric fields when conversion fails so UI shows metadata + error text only.
    createConversionErrorValues: function (tickerValues) {
        const errorValues = Object.assign({}, tickerValues);
        const numericKeys = [
            "last",
            "high",
            "low",
            "open",
            "close",
            "changeDaily",
            "changeDailyPercent",
            "volume"
        ];

        for (let i = 0; i < numericKeys.length; i++) {
            const key = numericKeys[i];
            if (Object.prototype.hasOwnProperty.call(errorValues, key)) {
                delete errorValues[key];
            }
        }

        errorValues.conversionRate = null;
        errorValues.conversionError = true;
        return errorValues;
    },

    // Multiply numeric fields; parse strings providers sometimes emit.
    applyTickerConversion: function (tickerValues, rate, fromCurrency, toCurrency) {
        if (!tickerValues || typeof tickerValues !== "object") {
            return tickerValues;
        }

        const converted = Object.assign({}, tickerValues);
        const keysToConvert = [
            "last",
            "high",
            "low",
            "open",
            "close",
            "changeDaily"
        ];

        for (let i = 0; i < keysToConvert.length; i++) {
            const key = keysToConvert[i];
            if (!Object.prototype.hasOwnProperty.call(tickerValues, key)) {
                continue;
            }

            const value = tickerValues[key];
            const numeric = typeof value === "number" ? value : parseFloat(value);
            if (!isNaN(numeric)) {
                converted[key] = numeric * rate;
            }
        }

        converted.conversionRate = rate;
        converted.conversionFromCurrency = fromCurrency;
        converted.conversionToCurrency = toCurrency;

        return converted;
    },

    // Clone candles before scaling price/quote volume; keep shared cache untouched.
    applyCandlesConversion: function (candles, rate) {
        if (!Array.isArray(candles) || !rate || !isFinite(rate) || rate <= 0) {
            return candles;
        }

        return candles.map(function (candle) {
            if (!candle || typeof candle !== "object") {
                return candle;
            }

            const converted = Object.assign({}, candle);
            const priceKeys = ["open", "close", "high", "low"];
            for (let i = 0; i < priceKeys.length; i++) {
                const key = priceKeys[i];
                if (!Object.prototype.hasOwnProperty.call(candle, key)) {
                    continue;
                }
                const value = candle[key];
                const numeric = typeof value === "number" ? value : parseFloat(value);
                if (!isNaN(numeric)) {
                    converted[key] = numeric * rate;
                }
            }

            if (Object.prototype.hasOwnProperty.call(candle, "volumeQuote")) {
                const volumeValue = candle["volumeQuote"];
                const volumeNumeric = typeof volumeValue === "number" ? volumeValue : parseFloat(volumeValue);
                if (!isNaN(volumeNumeric)) {
                    converted["volumeQuote"] = volumeNumeric * rate;
                }
            }

            return converted;
        });
    },

    updateTicker: async function (context, settings) {
        const pair = settings["pair"];
        const values = await this.getTickerValue(pair, settings.currency, settings.exchange, settings.fromCurrency);
        this.setContextConnectionState(context, values && values.connectionState);
        this.updateCanvas(context, settings, values);
    },
    initCanvas: function () {
        canvas = document.getElementById("ticker");
        canvasContext = canvas.getContext("2d");
    },
    updateCanvas: async function (context, settings, tickerValues) {
        this.log("updateCanvas", context, settings, tickerValues);

        const connectionState = (tickerValues && tickerValues.connectionState) || this.getContextConnectionState(context);

        switch (settings.mode) {
            case "candles": {
                const candleValues = await this.getCandles(settings);
                this.updateCanvasCandles(context, settings, candleValues, connectionState);
                break;
            }
            case "ticker":
            default:
                this.updateCanvasTicker(context, settings, tickerValues, connectionState);
                break;
        }
    },
    /**
     * Normalize raw ticker payload: parse numeric fields, flag basic metadata, align timestamp.
     *
     * @param {Object} values Raw ticker payload.
     * @returns {{values:Object, hasAny:boolean, hasCritical:boolean, timestamp:(number|null)}} Parsed summary consumed by renderers.
     */
    sanitizeTickerValues: function (values) {
        if (!values || typeof values !== "object") {
            return {
                values: {},
                hasAny: false,
                hasCritical: false,
                timestamp: null
            };
        }

        const sanitized = Object.assign({}, values);

        function parseNumeric(value, fallback, roundInteger) {
            if (typeof value === "number" && Number.isFinite(value)) {
                return roundInteger ? Math.round(value) : value;
            }
            if (typeof value === "string") {
                const trimmed = value.trim();
                if (trimmed) {
                    const parsed = roundInteger ? parseInt(trimmed, 10) : parseFloat(trimmed);
                    if (!isNaN(parsed) && Number.isFinite(parsed)) {
                        return roundInteger ? Math.round(parsed) : parsed;
                    }
                }
            }
            return fallback;
        }

        const last = parseNumeric(values.last, null, false);
        if (last === null) {
            delete sanitized.last;
        } else {
            sanitized.last = last;
        }

        const numericDefaults = {
            high: null,
            low: null,
            volume: 0,
            changeDaily: 0,
            changeDailyPercent: 0
        };

        Object.keys(numericDefaults).forEach((key) => {
            const fallback = numericDefaults[key];
            const parsed = parseNumeric(values[key], fallback, false);
            if (parsed === null || parsed === undefined || !Number.isFinite(parsed)) {
                delete sanitized[key];
            } else if (parsed === fallback && values[key] === undefined) {
                if (fallback === null) {
                    delete sanitized[key];
                } else {
                    sanitized[key] = fallback;
                }
            } else {
                sanitized[key] = parsed;
            }
        });

        const timestampCandidateKeys = ["lastUpdated", "timestamp", "time", "updatedAt"];
        let timestamp = null;
        for (let i = 0; i < timestampCandidateKeys.length; i++) {
            const key = timestampCandidateKeys[i];
            const hasValueKey = Object.prototype.hasOwnProperty.call(values, key);
            if (!hasValueKey) {
                continue;
            }
            const parsed = parseNumeric(values[key], null, true);
            if (parsed !== null && parsed !== undefined) {
                const normalizedTimestamp = parsed > TIMESTAMP_SECONDS_THRESHOLD ? parsed : parsed * 1000;
                timestamp = normalizedTimestamp;
                sanitized.lastUpdated = normalizedTimestamp;
                break;
            }
        }

        // Ensure we do not keep NaN/undefined strings for textual fields
        if (typeof sanitized.pairDisplay !== "string") {
            delete sanitized.pairDisplay;
        }

        return {
            values: sanitized,
            hasAny: Object.keys(values).length > 0,
            hasCritical: last !== null,
            timestamp: timestamp
        };
    },
    buildTickerRenderContext: function (context, settings, rawValues, connectionState) {
        const sanitizedResult = this.sanitizeTickerValues(rawValues);
        const sanitizedValues = sanitizedResult.values;
        const now = Date.now();
        let dataState = "missing";
        let infoMessage = null;
        let lastValidTimestamp = null;
        let renderValues = sanitizedValues;
        let degradedReason = null;

        const effectiveConnectionState = connectionState || sanitizedValues.connectionState || null;
        const cached = tickerState.getLastGoodTicker(context);
        const isBroken = effectiveConnectionState === connectionStates.BROKEN;
        const liveLikeStates = [connectionStates.LIVE, connectionStates.BACKUP, connectionStates.DETACHED];
        const isConnectionLiveLike = liveLikeStates.indexOf(effectiveConnectionState) !== -1;
        // Detect exchange "zero" payloads; mark misconfig only when link degraded so we still recover on open.
        const looksLikeEmptyTicker = sanitizedResult.hasCritical
            && Number.isFinite(sanitizedValues.last)
            && sanitizedValues.last === 0
            && (!Number.isFinite(sanitizedValues.high) || sanitizedValues.high === 0)
            && (!Number.isFinite(sanitizedValues.low) || sanitizedValues.low === 0)
            && (!Number.isFinite(sanitizedValues.volume) || sanitizedValues.volume === 0)
            && sanitizedResult.timestamp === null;
        const treatAsMisconfigured = sanitizedResult.hasCritical && (!isConnectionLiveLike || isBroken) && looksLikeEmptyTicker;
        const hasConversionError = !!sanitizedValues.conversionError;

        if (hasConversionError) {
            dataState = "missing";
            renderValues = Object.assign({}, sanitizedValues);
            const fallbackPair = settings["title"] || sanitizedValues["pairDisplay"] || sanitizedValues["pair"] || settings["pair"] || "";
            if (!renderValues.pairDisplay && fallbackPair) {
                renderValues.pairDisplay = fallbackPair;
            }
            infoMessage = messageConfig.conversionError || "CONVERSION ERROR";
            degradedReason = "conversion_error";

            return {
                values: renderValues,
                dataState: dataState,
                infoMessage: infoMessage,
                lastValidTimestamp: lastValidTimestamp,
                degradedReason: degradedReason
            };
        }

        if (sanitizedResult.hasCritical && !isBroken && !treatAsMisconfigured) {
            const recordedAt = sanitizedResult.timestamp || now;
            sanitizedValues.lastUpdated = recordedAt;
            tickerState.setLastGoodTicker(context, sanitizedValues, recordedAt);
            lastValidTimestamp = recordedAt;
            dataState = "live";
            renderValues = Object.assign({}, sanitizedValues);
        } else if (cached && cached.values && typeof cached.values === "object" && Number.isFinite(cached.values.last)) {
            dataState = "stale";
            renderValues = Object.assign({}, cached.values);
            lastValidTimestamp = cached.timestamp;
            if (!renderValues.lastUpdated) {
                renderValues.lastUpdated = cached.timestamp;
            }
            infoMessage = messageConfig.stale;
            degradedReason = sanitizedResult.hasAny ? "partial" : "missing";
        } else {
            dataState = "missing";
            renderValues = Object.assign({}, sanitizedValues);
            const fallbackPair = settings["title"] || sanitizedValues["pairDisplay"] || sanitizedValues["pair"] || settings["pair"] || "";
            if (!renderValues.pairDisplay && fallbackPair) {
                renderValues.pairDisplay = fallbackPair;
            }

            if (treatAsMisconfigured || isBroken) {
                infoMessage = messageConfig.misconfigured || messageConfig.noData;
                degradedReason = "misconfigured";
            } else {
                infoMessage = messageConfig.loading;
                degradedReason = sanitizedResult.hasAny ? "partial" : "none";
            }
        }

        if (!infoMessage && dataState === "missing") {
            infoMessage = isBroken ? (messageConfig.misconfigured || messageConfig.noData) : messageConfig.loading;
        }
        if (!infoMessage && dataState === "live" && isBroken) {
            infoMessage = messageConfig.misconfigured || messageConfig.noData;
        }
        if (!infoMessage && dataState === "stale" && !messageConfig.stale) {
            infoMessage = "STALE";
        }

        return {
            values: renderValues,
            dataState: dataState,
            infoMessage: infoMessage,
            lastValidTimestamp: lastValidTimestamp,
            degradedReason: degradedReason
        };
    },
    displayMessage: function (context, message, options) {
        this.initCanvas();

        const opts = options || {};
        const normalizedSettings = applyDefaultSettings(opts.settings || {});
        const backgroundColor = opts.backgroundColor || normalizedSettings.backgroundColor || "#000000";
        const textColor = opts.textColor || normalizedSettings.textColor || "#ffffff";
        const font = opts.font || normalizedSettings.font || "Lato";
        const fontSize = opts.fontSize || null;
        const desiredConnectionState = opts.connectionState || null;
        const displayConnectionIcon = opts.displayConnectionStatusIcon || normalizedSettings.displayConnectionStatusIcon || "OFF";

        if (desiredConnectionState) {
            this.setContextConnectionState(context, desiredConnectionState);
        }

        canvasRenderer.renderMessageCanvas({
            canvas: canvas,
            canvasContext: canvasContext,
            message: message,
            backgroundColor: backgroundColor,
            textColor: textColor,
            font: font,
            fontSize: fontSize,
            connectionStates: connectionStates,
            connectionState: desiredConnectionState || this.getContextConnectionState(context),
            displayConnectionStatusIcon: displayConnectionIcon
        });

        this.sendCanvas(context);
    },
    getCanvasSizeMultiplier: function(canvasWidth, canvasHeight) {
        return canvasRenderer.getCanvasSizeMultiplier(canvasWidth, canvasHeight);
    },
    getCandlesDisplayCount: function (settings) {
        return canvasRenderer.getCandlesDisplayCount(settings);
    },
    updateCanvasTicker: function (context, settings, values, connectionState) {
        this.log("updateCanvasTicker", context, settings, values);

        const renderContext = this.buildTickerRenderContext(context, settings, values, connectionState);

        canvasRenderer.renderTickerCanvas({
            canvas: canvas,
            canvasContext: canvasContext,
            settings: settings,
            values: renderContext.values,
            context: context,
            connectionStates: connectionStates,
            connectionState: connectionState || (values && values.connectionState) || null,
            dataState: renderContext.dataState,
            infoMessage: renderContext.infoMessage,
            lastValidTimestamp: renderContext.lastValidTimestamp,
            degradedReason: renderContext.degradedReason
        });

        this.sendCanvas(context);
    },
    updateCanvasCandles: function (context, settings, candlesNormalized, connectionState) {
        this.log("updateCanvasCandles", context, settings, candlesNormalized);

        canvasRenderer.renderCandlesCanvas({
            canvas: canvas,
            canvasContext: canvasContext,
            settings: settings,
            candlesNormalized: candlesNormalized,
            connectionStates: connectionStates,
            connectionState: connectionState || this.getContextConnectionState(context)
        });

        this.sendCanvas(context);
    },
    sendCanvas: function (context) {
        var json = {
            "event": "setImage",
            "context": context,
            "payload": {
                "image": canvas.toDataURL(),
                "target": DestinationEnum.HARDWARE_AND_SOFTWARE
            }
        }

        this.websocketSend(JSON.stringify(json));
    },
    getRoundedValue: function (value, digits, multiplier, format) {
        return formatters.getRoundedValue(value, digits, multiplier, format);
    },

    getTickerValue: async function (pair, toCurrency, exchange, fromCurrency) {
        const registry = this.getProviderRegistry();
        const provider = registry.getProvider(exchange);
        const currencies = this.resolveConversionCurrencies(fromCurrency, toCurrency);
        const params = {
            exchange: exchange,
            symbol: pair,
            fromCurrency: currencies.from,
            toCurrency: null
        };

        try {
            const ticker = await provider.fetchTicker(params);
            const convertedTicker = await this.convertTickerValues(ticker, currencies.from, currencies.to);
            const finalTicker = convertedTicker || ticker;
            if (finalTicker && typeof finalTicker === "object" && !finalTicker.connectionState) {
                finalTicker.connectionState = connectionStates.DETACHED;
            }
            return finalTicker;
        } catch (err) {
            this.log("Error fetching ticker", err);
            const subscriptionKey = this.getSubscriptionContextKey(exchange, pair, currencies.from, null);
            if (provider && typeof provider.getCachedTicker === "function") {
                const cached = provider.getCachedTicker(subscriptionKey);
                if (cached) {
                    const convertedCached = await this.convertTickerValues(cached, currencies.from, currencies.to);
                    const finalCached = convertedCached || cached;
                    if (finalCached && !finalCached.connectionState) {
                        finalCached.connectionState = connectionStates.BACKUP;
                    }
                    return finalCached;
                }
            }

            return {
                "changeDaily": 0,
                "changeDailyPercent": 0,
                "last": 0,
                "volume": 0,
                "high": 0,
                "low": 0,
                "pair": pair,
                "pairDisplay": pair,
                "connectionState": connectionStates.BROKEN
            };
        }
    },
    getCandles: async function (settings) {
        this.log("getCandles");

        const exchange = settings["exchange"];
        const pair = settings["pair"];
        const interval = this.convertCandlesInterval(settings["candlesInterval"] || "1h");
        const candlesCount = this.getCandlesDisplayCount(settings);
        const currencies = this.resolveConversionCurrencies(settings["fromCurrency"], settings["currency"]);
        const cacheCurrencyKey = currencies.to || currencies.from || "";
        const cacheKey = exchange + "_" + pair + "_" + interval + "_" + candlesCount + "_" + cacheCurrencyKey;
        let cache = tickerState.getCandlesCacheEntry(cacheKey);
        if (!cache) {
            cache = {};
            tickerState.setCandlesCacheEntry(cacheKey, cache);
        }
        const now = new Date().getTime();
        const t = "time";
        const c = "candles";

        // Refresh at most every minute
        if (cache[t] && cache[t] > now - 60 * 1000) {
            return cache[c];
        }

        const fetchParams = {
            exchange: exchange,
            symbol: pair,
            interval: interval,
            limit: 24
        };

        let rawCandles = null;

        try {
            const registry = this.getProviderRegistry();
            const provider = registry.getProvider(exchange);
            if (provider && typeof provider.fetchCandles === "function") {
                rawCandles = await provider.fetchCandles(fetchParams);
            }

            if (!Array.isArray(rawCandles)) {
                rawCandles = null;
            }

            if (rawCandles === null) {
                const genericProvider = registry.getGenericProvider();
                if (genericProvider && typeof genericProvider.fetchCandles === "function") {
                    rawCandles = await genericProvider.fetchCandles(fetchParams);
                    if (!Array.isArray(rawCandles)) {
                        rawCandles = null;
                    }
                }
            }
        } catch (err) {
            this.log("Error fetching provider candles", err);
            rawCandles = null;
        }

        if (rawCandles === null) {
            try {
                const response = await fetch(
                    tProxyBase + "/api/Candles/json/" + exchange + "/" + pair + "/" + interval + "?limit=24"
                );
                const responseJson = await response.json();
                if (responseJson && Array.isArray(responseJson.candles)) {
                    rawCandles = responseJson.candles;
                }
            } catch (e) {
                this.log("Error fetching candles from proxy", e);
            }
        }

        if (!Array.isArray(rawCandles)) {
            return cache[c] || [];
        }

        const preparedCandles = this.prepareCandlesForDisplay(rawCandles, candlesCount);

        let candlesForDisplay = preparedCandles;
        if (currencies.to) {
            try {
                const rate = await this.getConversionRate(currencies.from, currencies.to);
                if (rate && isFinite(rate) && rate > 0) {
                    candlesForDisplay = this.applyCandlesConversion(preparedCandles, rate);
                }
            } catch (err) {
                this.log("Conversion rate error for candles", err);
            }
        }

        const val = this.getCandlesNormalized(candlesForDisplay);
        cache[t] = now;
        cache[c] = val;
        return cache[c];
    },
    convertCandlesInterval: function (interval) {
        switch (interval) {
            case "1m":
                return "MINUTES_1";
            case "5m":
                return "MINUTES_5";
            case "15m":
                return "MINUTES_15";
            case "1h":
                return "HOURS_1";
            case "6h":
                return "HOURS_6";
            case "12h":
                return "HOURS_12";
            case "1D":
                return "DAYS_1";
            case "7D":
                return "DAYS_7";
            case "1M":
                return "MONTHS_1";
        }

        return interval;
    },
    prepareCandlesForDisplay: function (candles, maxCount) {
        if (!Array.isArray(candles) || candles.length === 0) {
            return [];
        }

        const sanitized = candles
            .map(function (candle) {
                if (!candle) {
                    return null;
                }

                let ts = candle["ts"];
                if (typeof ts !== "number") {
                    const openTime = candle["openTime"];
                    if (openTime) {
                        const parsedOpenTime = Date.parse(openTime);
                        if (!isNaN(parsedOpenTime)) {
                            ts = Math.floor(parsedOpenTime / 1000);
                        }
                    }
                }

                if (typeof ts !== "number" || isNaN(ts)) {
                    return null;
                }

                return {
                    candle: candle,
                    ts: ts
                };
            })
            .filter(function (item) {
                return item !== null;
            })
            .sort(function (a, b) {
                return a.ts - b.ts;
            })
            .map(function (item) {
                if (item.candle["ts"] === item.ts) {
                    return item.candle;
                }

                return Object.assign({}, item.candle, {
                    "ts": item.ts
                });
            });

        if (typeof maxCount === "number" && maxCount > 0 && sanitized.length > maxCount) {
            return sanitized.slice(-maxCount);
        }

        return sanitized;
    },
    getCandlesNormalized: function (candles) {
        let min = Number.POSITIVE_INFINITY;
        let max = 0;
        let volumeMin = Number.POSITIVE_INFINITY;
        let volumeMax = 0;
        let timeMin = Number.POSITIVE_INFINITY;
        let timeMax = 0;
        (candles || []).forEach(function (candle) {
            timeMin = Math.min(timeMin, candle["ts"]);
            timeMax = Math.max(timeMax, candle["ts"]);

            // Some shouldn't be necessary, but doesn't cost much and avoid mistakes
            min = Math.min(min, candle["open"]);
            min = Math.min(min, candle["close"]);
            min = Math.min(min, candle["high"]);
            min = Math.min(min, candle["low"]);

            max = Math.max(max, candle["open"]);
            max = Math.max(max, candle["close"]);
            max = Math.max(max, candle["high"]);
            max = Math.max(max, candle["low"]);

            volumeMin = Math.min(volumeMin, candle["volumeQuote"]);
            volumeMax = Math.max(volumeMax, candle["volumeQuote"]);
        });

        const jThis = this;
        const candlesNormalized = [];
        (candles || []).forEach(function (candle) {
            candlesNormalized.push({
                timePercent: jThis.normalizeValue(candle["ts"], timeMin, timeMax),
                openPercent: jThis.normalizeValue(candle["open"], min, max),
                closePercent: jThis.normalizeValue(candle["close"], min, max),
                highPercent: jThis.normalizeValue(candle["high"], min, max),
                lowPercent: jThis.normalizeValue(candle["low"], min, max),
                volumePercent: jThis.normalizeValue(candle["volumeQuote"], volumeMin, volumeMax)
            });
        });

        this.log("getCandlesNormalized", candlesNormalized);
        return candlesNormalized;
    },
    normalizeValue: function (value, min, max) {
        return formatters.normalizeValue(value, min, max);
    },
};

tickerAction.defaultSettings = defaultSettings;
tickerAction.applyDefaultSettings = applyDefaultSettings;
tickerAction.getDefaultSettings = function () {
    return getDefaultSettingsSnapshot();
};
tickerAction.settingsSchema = settingsSchema;

function connectElgatoStreamDeckSocket(inPort, pluginUUID, inRegisterEvent, _inApplicationInfo, _inActionInfo) {
    // Open the web socket
    websocket = new WebSocket("ws://127.0.0.1:" + inPort);

    function registerPlugin(inPluginUUID) {
        var json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
        };

        tickerAction.websocketSend(JSON.stringify(json));
    };

    websocket.onopen = function () {
        // WebSocket is connected, send message
        registerPlugin(pluginUUID);
    };

    websocket.onmessage = async function (evt) {
        //this.log("Message received", evt);

        // Received message from Stream Deck
        var jsonObj = JSON.parse(evt.data);
        const event = jsonObj["event"];
        const context = jsonObj["context"];

        const jsonPayload = jsonObj["payload"] || {};
        let settingsPayload = jsonPayload["settings"];
        if (!settingsPayload && event === "sendToPlugin") {
            settingsPayload = jsonPayload;
        }

        let settings = settingsPayload;
        const coordinates = jsonPayload["coordinates"];
        const userDesiredState = jsonPayload["userDesiredState"];
        // const title = jsonPayload["title"];

        const ignoredEvents = [
            "deviceDidConnect",
            "titleParametersDidChange"
        ];

        if (ignoredEvents.indexOf(event) >= 0) {
            // Ignore
            return;
        }

        if (settings != null) {
            settings = applyDefaultSettings(settings);
        }

        if (event == "keyDown") {
            await tickerAction.onKeyDown(context, settings, coordinates, userDesiredState);
        } else if (event == "keyUp") {
            await tickerAction.onKeyUp(context, settings, coordinates, userDesiredState);
        } else if (event == "willAppear") {
            await tickerAction.onWillAppear(context, settings, coordinates);
        } else if (settings != null) {
            //this.log("Received settings", settings);
            tickerAction.refreshSettings(context, settings);
            tickerAction.refreshTimer(context, settings);
            // tickerAction.updateTicker(context, settings);    // Already done by refreshTimer
        }
    };

    websocket.onclose = function () {
        // Websocket is closed
    };

    setInterval(async function () {
        await tickerAction.refreshTimers();
    }, 300000);
};

if (screenshotMode) {
    loggingEnabled = true;
    tickerAction.connect();

    const settings = applyDefaultSettings({
        digits: 0,
        pair: "LTCUSD",
        mode: "ticker"
    });

    const context = "test";
    const coordinates = {
        "column": 1,
        "row": 1
    };
    const userDesiredState = null;

    setTimeout(function() {
        tickerAction.onWillAppear(context, settings, coordinates);

        setInterval(async function() {
            await tickerAction.onKeyDown(context, settings, coordinates, userDesiredState);
            await tickerAction.onKeyUp(context, settings, coordinates, userDesiredState);
        }, 5000);
    }, 1000);
}

if (typeof module !== "undefined") {
    module.exports = tickerAction;
}

if (typeof window !== "undefined") {
    window.connectElgatoStreamDeckSocket = connectElgatoStreamDeckSocket;
}
