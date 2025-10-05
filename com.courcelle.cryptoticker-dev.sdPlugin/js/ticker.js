/// <reference path="../libs/js/action.js" />
/// <reference path="../libs/js/stream-deck.js" />

const defaultConfig = {
    "tProxyBase": "https://tproxyv8.opendle.com",
    "fallbackPollIntervalMs": 60000,
    "staleTickerTimeoutMs": 6 * 60 * 1000
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
const globalConfig = resolveGlobalConfig();
const runtimeConfig = Object.assign({}, defaultConfig, moduleConfig || {}, globalConfig || {});
const tProxyBase = runtimeConfig.tProxyBase;

const subscriptionKeyModule = requireOrNull("./providers/subscription-key");
const globalProviders = typeof CryptoTickerProviders !== "undefined" ? CryptoTickerProviders : null;
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

let loggingEnabled = false;
let websocket = null;
let canvas;
let canvasContext;
const contextDetails = {};  // context => settings, ensure a single subscription per context
const contextSubscriptions = {}; // context => provider subscription handle
const contextConnectionStates = {};
const screenshotMode = false; // Allows rendering the canvas in an external preview

const alertStatuses = {};
const alertArmed = {};
const CONVERSION_CACHE_TTL_MS = 60 * 60 * 1000;
const conversionRatesCache = {};
const candlesCache = {};
let providerRegistrySingleton = null;

const defaultSettings = {
    "title": null,
    "exchange": "BITFINEX",
    "pair": "BTCUSD",
    "fromCurrency": "USD",
    "currency": "USD",
    "candlesInterval": "1h",
    "candlesDisplayed": 20,
    "multiplier": 1,
    "digits": 2,
    "highLowDigits": "",
    "font": "Lato,'Roboto Condensed',Helvetica,Calibri,sans-serif",
    "fontSizeBase": 25,
    "fontSizePrice": 35,
    "fontSizeHighLow": "",
    "fontSizeChange": 19,
    "priceFormat": "compact",
    "backgroundColor": "#000000",
    "textColor": "#ffffff",
    "displayHighLow": "on",
    "displayHighLowBar": "on",
    "displayDailyChange": "on",
    "displayConnectionStatusIcon": "OFF",
    "alertRule": "",
    "backgroundColorRule": "",
    "textColorRule": "",
    "mode": "ticker"
};

const tickerAction = {
    type: "com.courcelle.cryptoticker.ticker",
    log: function (...data) {
        if (loggingEnabled) {
            console.log(...data);
        }
    },

    setContextConnectionState: function (context, state) {
        if (!context) {
            return;
        }

        if (state) {
            contextConnectionStates[context] = state;
        }
    },

    getContextConnectionState: function (context) {
        if (!context) {
            return null;
        }

        return contextConnectionStates[context] || null;
    },

    clearContextConnectionState: function (context) {
        if (!context) {
            return;
        }

        delete contextConnectionStates[context];
    },

    getProviderRegistry: function () {
        if (!providerRegistrySingleton) {
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

    onKeyDown: async function (context, settings, coordinates, userDesiredState) {
        // State machine between modes
        switch (settings.mode) {
            case "candles":
                settings.mode = "ticker";
                break;
            case "ticker":
            default:
                if (alertArmed[context] != "off" && alertStatuses[context] == "on") {
                    // Disarm the alert
                    alertArmed[context] = "off";
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
    onKeyUp: function (context, settings, coordinates, userDesiredState) {
    },
    onWillAppear: async function (context, settings, coordinates) {
        this.initCanvas();

        this.refreshTimer(context, settings);
        // this.updateTicker(context, settings); // Already done by refreshTimer
    },
    refreshTimers: async function () {
        // Make sure everybody is connected
        for (let ctx in contextDetails) {
            const details = contextDetails[ctx];
            this.refreshTimer(
                details["context"],
                details["settings"]
            );
        }
    },
    refreshTimer: async function (context, settings) {
        this.refreshSettings(context, settings);

        // Force refresh of the display (in case WebSockets doesn't work and to update the candles)
        this.updateTicker(context, settings);
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
        const current = contextSubscriptions[context];
        if (current && current.key === subscriptionKey) {
            return current;
        }

        if (current && typeof current.unsubscribe === "function") {
            try {
                current.unsubscribe();
            } catch (err) {
                this.log("Error unsubscribing from provider", err);
            }
            delete contextSubscriptions[context];
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
                    const details = contextDetails[context];
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

            contextSubscriptions[context] = {
                key: subscriptionKey,
                unsubscribe: handle && typeof handle.unsubscribe === "function" ? handle.unsubscribe : function () {},
                providerId: provider.getId ? provider.getId() : null
            };
            return contextSubscriptions[context];
        } catch (err) {
            this.log("Error subscribing to provider", err);
        }

        return null;
    },
    refreshSettings: function (context, settings) {
        contextDetails[context] = {
            "context": context,
            "settings": settings
        };

        // Update the subscription in all cases
        this.updateSubscription(context, settings);
    },
    getSubscriptionContextKey: function (exchange, pair, fromCurrency, toCurrency) {
        return buildSubscriptionKey(exchange, pair, fromCurrency, toCurrency);
    },

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
        let cacheEntry = conversionRatesCache[key];
        if (!cacheEntry) {
            cacheEntry = {};
            conversionRatesCache[key] = cacheEntry;
        }

        if (typeof cacheEntry.rate === "number" && cacheEntry.rate > 0 && cacheEntry.fetchedAt && (now - cacheEntry.fetchedAt) < CONVERSION_CACHE_TTL_MS) {
            return cacheEntry.rate;
        }

        if (cacheEntry.promise) {
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

        const rate = await this.getConversionRate(currencies.from, currencies.to);
        if (!rate || !isFinite(rate) || rate <= 0) {
            return tickerValues;
        }

        return this.applyTickerConversion(tickerValues, rate, currencies.from, currencies.to);
    },

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
            case "candles":
                const candleValues = await this.getCandles(settings);
                this.updateCanvasCandles(context, settings, candleValues, connectionState);
                break;
            case "ticker":
            default:
                this.updateCanvasTicker(context, settings, tickerValues, connectionState);
                break;
        }
    },
    getCanvasSizeMultiplier: function(canvasWidth, canvasHeight) {
        // New High resolution devices: the canvas was originally 144x144, but we want it 288x288 now
        // Using a multiplier allows to simply change the canvas size and everything will adjust automatically
        return Math.max(canvasWidth / 144, canvasHeight / 144);
    },
    getCandlesDisplayCount: function (settings) {
        const parsed = parseInt(settings["candlesDisplayed"]);
        if (isNaN(parsed)) {
            return 20;
        }

        return Math.min(60, Math.max(5, parsed));
    },
    updateCanvasTicker: function (context, settings, values, connectionState) {
        this.log("updateCanvasTicker", context, settings, values);

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const sizeMultiplier = this.getCanvasSizeMultiplier(canvasWidth, canvasHeight);

        const textPadding = 10 * sizeMultiplier;

        const pair = settings["pair"];
        const exchange = settings["exchange"];
        const pairDisplay = settings["title"] || (values["pairDisplay"] || pair);
        const currency = settings["currency"];
        const multiplier = settings["multiplier"] || 1;
        const priceFormat = settings["priceFormat"] || "compact";
        const parseNumberSetting = function(value, fallback) {
            const parsed = parseFloat(value);
            if (isNaN(parsed) || parsed <= 0) {
                return fallback;
            }

            return parsed;
        };
        const parseDigitsSetting = function (value, fallback) {
            const parsed = parseInt(value, 10);
            if (isNaN(parsed) || parsed < 0) {
                return fallback;
            }

            return parsed;
        };
        const digits = parseDigitsSetting(settings["digits"], 2);
        const highLowDigits = parseDigitsSetting(settings["highLowDigits"], digits);
        const baseFontSize = parseNumberSetting(settings["fontSizeBase"], 25);
        const priceFontSize = parseNumberSetting(settings["fontSizePrice"], baseFontSize * 35 / 25);
        const highLowFontSize = parseNumberSetting(settings["fontSizeHighLow"], baseFontSize);
        const changeFontSize = parseNumberSetting(settings["fontSizeChange"], baseFontSize * 19 / 25);
        let backgroundColor = settings["backgroundColor"] || "#000000";
        let textColor = settings["textColor"] || "#ffffff";
        const effectiveConnectionState = connectionState || (values && values.connectionState) || null;

        let alertMode = false;
        const changeDaily = values["changeDaily"];
        const changeDailyPercent = values["changeDailyPercent"];
        const value = values["last"];
        const valueDisplay = value * multiplier;
        const volume = values["volume"];
        const high = values["high"];
        const low = values["low"];
        if (settings["alertRule"]) {
            try {
                if (eval(settings["alertRule"])) {
                    alertStatuses[context] = "on";

                    // Only display the alert mode if we're armed
                    if (alertArmed[context] != "off") {
                        alertMode = true;
                        const tmp = backgroundColor;
                        backgroundColor = textColor;
                        textColor = tmp;
                    }
                } else {
                    alertStatuses[context] = "off";

                    // Re-arm the alert since we're out of the alert
                    alertArmed[context] = "on";
                }
            }
            catch (err) {
                console.error("Error evaluating alertRule", context, settings, values, err);
            }
        }

        if (settings["backgroundColorRule"]) {
            const alert = alertMode;
            try {
                backgroundColor = eval(settings["backgroundColorRule"]) || backgroundColor;
            }
            catch (err) {
                console.error("Error evaluating backgroundColorRule", context, settings, values, err);
            }
        }
        if (settings["textColorRule"]) {
            const alert = alertMode;
            try {
                textColor = eval(settings["textColorRule"]) || textColor;
            }
            catch (err) {
                console.error("Error evaluating textColorRule", context, settings, values, err);
            }
        }

        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
        canvasContext.fillStyle = backgroundColor;
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

        var font = settings["font"] || "Lato";
        canvasContext.font = (baseFontSize * sizeMultiplier) + "px " + font;
        canvasContext.fillStyle = textColor;

        canvasContext.textAlign = "left";
        canvasContext.fillText(pairDisplay, 10 * sizeMultiplier, 25 * sizeMultiplier);

        canvasContext.font = "bold " + (priceFontSize * sizeMultiplier) + "px " + font;
        canvasContext.fillText(
            this.getRoundedValue(values["last"], digits, multiplier, priceFormat),
            textPadding,
            60 * sizeMultiplier
        );

        if (settings["displayHighLow"] != "off") {
            canvasContext.font = (highLowFontSize * sizeMultiplier) + "px " + font;
            canvasContext.fillText(
                this.getRoundedValue(values["low"], highLowDigits, multiplier, priceFormat),
                textPadding,
                90 * sizeMultiplier
            );

            canvasContext.textAlign = "right";
            canvasContext.fillText(
                this.getRoundedValue(values["high"], highLowDigits, multiplier, priceFormat),
                canvasWidth - textPadding,
                135 * sizeMultiplier
            );
        }

        if (settings["displayDailyChange"] != "off") {
            const originalFillColor = canvasContext.fillStyle;

            const changePercent = values.changeDailyPercent * 100;
            let digitsPercent = 2;
            if (Math.abs(changePercent) >= 100) {
                digitsPercent = 0;
            } else if (Math.abs(changePercent) >= 10) {
                digitsPercent = 1;
            }
            let changePercentDisplay = this.getRoundedValue(changePercent, digitsPercent, 1, "plain");
            if (changePercent > 0) {
                changePercentDisplay = "+" + changePercentDisplay;
                canvasContext.fillStyle = "green";
                /*canvasContext.font = "bold " + (40 * sizeMultiplier) + "px "+font;
                canvasContext.fillText(
                    "^",
                    canvasWidth-textPadding,
                    37
                );*/
            } else {
                canvasContext.fillStyle = "red";
                /*canvasContext.font = "bold " + (30 * sizeMultiplier) + "px "+font;
                canvasContext.fillText(
                    "v",
                    canvasWidth-textPadding,
                    25
                );*/
            }

            canvasContext.font = (changeFontSize * sizeMultiplier) + "px " + font;
            canvasContext.textAlign = "right";
            // canvasContext.rotate(Math.PI);
            canvasContext.fillText(
                changePercentDisplay,
                canvasWidth - textPadding,
                90 * sizeMultiplier
            );

            // Restore orignal value, though it shouldn't be used
            canvasContext.fillStyle = originalFillColor;
        }

        if (settings["displayHighLowBar"] != "off") {
            const lineY = 104 * sizeMultiplier;
            const padding = 5 * sizeMultiplier;
            const lineWidth = 6 * sizeMultiplier;

            const range = values.high - values.low;
            const percent = range > 0 ? (values.last - values.low) / range : 0.5;
            const lineLength = canvasWidth - padding * 2;
            const cursorPositionX = padding + Math.round(lineLength * percent);

            const triangleSide = 12 * sizeMultiplier;
            const triangleHeight = Math.sqrt(3 / 4 * Math.pow(triangleSide, 2));

            canvasContext.beginPath();
            canvasContext.moveTo(padding, lineY);
            canvasContext.lineTo(cursorPositionX, lineY);
            canvasContext.lineWidth = lineWidth;
            canvasContext.strokeStyle = "green";
            canvasContext.stroke();

            canvasContext.beginPath();
            canvasContext.moveTo(cursorPositionX, lineY);
            canvasContext.lineTo(canvasWidth - padding, lineY);
            canvasContext.lineWidth = lineWidth;
            canvasContext.strokeStyle = "red";
            canvasContext.stroke();

            canvasContext.beginPath();
            canvasContext.moveTo(cursorPositionX - triangleSide / 2, lineY - triangleHeight / 3);
            canvasContext.lineTo(cursorPositionX + triangleSide / 2, lineY - triangleHeight / 3);
            canvasContext.lineTo(cursorPositionX, lineY + triangleHeight * 2 / 3);
            canvasContext.fillStyle = textColor;
            canvasContext.fill();
        }

        const connectionIconSetting = (settings["displayConnectionStatusIcon"] || "OFF").toUpperCase();
        if (connectionIconSetting !== "OFF") {
            this.renderConnectionStatusIcon(
                effectiveConnectionState,
                textColor,
                sizeMultiplier,
                connectionIconSetting
            );
        }

        this.sendCanvas(context);
    },

    renderConnectionStatusIcon: function (state, color, sizeMultiplier, position) {
        if (!state) {
            return;
        }

        const pos = (position || "OFF").toUpperCase();
        if (pos === "OFF") {
            return;
        }

        const iconState = String(state).toLowerCase();
        const iconSize = 20 * sizeMultiplier;
        const margin = 4 * sizeMultiplier;

        let x = canvas.width - iconSize - margin;
        let y = margin;
        if (pos === "BOTTOM_LEFT") {
            x = margin;
            y = canvas.height - iconSize - margin;
        }

        canvasContext.save();
        canvasContext.translate(x, y);
        canvasContext.lineWidth = Math.max(1.5 * sizeMultiplier, 1);
        canvasContext.strokeStyle = color;
        canvasContext.fillStyle = color;

        const drawPolygon = (points) => {
            if (!Array.isArray(points) || points.length === 0) {
                return;
            }
            canvasContext.beginPath();
            for (let i = 0; i < points.length; i++) {
                const pt = points[i];
                const px = pt[0] * iconSize;
                const py = pt[1] * iconSize;
                if (i === 0) {
                    canvasContext.moveTo(px, py);
                } else {
                    canvasContext.lineTo(px, py);
                }
            }
            canvasContext.closePath();
            canvasContext.fill();
        };

        if (iconState === connectionStates.LIVE) {
            drawPolygon([
                [0.7545784909869392, 0],
                [0.18263591551829597, 0.5685964091677761],
                [0.3947756629367107, 0.5685964091677761],
                [0.23171302126434715, 1],
                [0.8173281041988991, 0.43136761054941897],
                [0.6051523764976793, 0.43136761054941897]
            ]);
        } else if (iconState === connectionStates.DETACHED) {
            drawPolygon([
                [0.0, 0.45], [0.4, 0.45], [0.4, 0.6], [0.0, 0.6]
            ]);
            drawPolygon([
                [0.6, 0.45], [1.0, 0.45], [1.0, 0.6], [0.6, 0.6]
            ]);
        } else if (iconState === connectionStates.BACKUP) {
            drawPolygon([
                [0.0, 0.3], [0.4, 0.3], [0.4, 0.38], [0.0, 0.38]
            ]);
            drawPolygon([
                [0.6, 0.3], [1.0, 0.3], [1.0, 0.38], [0.6, 0.38]
            ]);

            drawPolygon([
                [0.0, 0.62], [0.4, 0.62], [0.4, 0.7], [0.0, 0.7]
            ]);
            drawPolygon([
                [0.6, 0.62], [1.0, 0.62], [1.0, 0.7], [0.6, 0.7]
            ]);
        } else if (iconState === connectionStates.BROKEN) {
            const drawRoundedRect = (width, height, radius) => {
                const r = Math.min(radius, Math.min(width, height) / 2);
                canvasContext.beginPath();
                canvasContext.moveTo(r, 0);
                canvasContext.lineTo(width - r, 0);
                canvasContext.quadraticCurveTo(width, 0, width, r);
                canvasContext.lineTo(width, height - r);
                canvasContext.quadraticCurveTo(width, height, width - r, height);
                canvasContext.lineTo(r, height);
                canvasContext.quadraticCurveTo(0, height, 0, height - r);
                canvasContext.lineTo(0, r);
                canvasContext.quadraticCurveTo(0, 0, r, 0);
                canvasContext.closePath();
                canvasContext.fill();
            };

            const linkWidth = iconSize * 0.55;
            const linkHeight = iconSize * 0.28;
            const linkRadius = iconSize * 0.12;
            const rotation = -Math.PI / 6;

            canvasContext.save();
            canvasContext.translate(iconSize * 0.08, iconSize * 0.4);
            canvasContext.rotate(rotation);
            drawRoundedRect(linkWidth, linkHeight, linkRadius);
            canvasContext.restore();

            canvasContext.save();
            canvasContext.translate(iconSize * 0.45, iconSize * 0.05);
            canvasContext.rotate(rotation);
            drawRoundedRect(linkWidth, linkHeight, linkRadius);
            canvasContext.restore();

            drawPolygon([
                [0.38, 0.32], [0.55, 0.22], [0.62, 0.38], [0.5, 0.48], [0.56, 0.62], [0.4, 0.58]
            ]);
        }

        canvasContext.restore();
    },

    updateCanvasCandles: function (context, settings, candlesNormalized, connectionState) {
        candlesNormalized = candlesNormalized || [];
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const sizeMultiplier = this.getCanvasSizeMultiplier(canvasWidth, canvasHeight);

        const padding = 10 * sizeMultiplier;
        let backgroundColor = settings["backgroundColor"];
        let textColor = settings["textColor"];
        const effectiveConnectionState = connectionState || this.getContextConnectionState(context);

        const pairDisplay = settings["title"] || settings["pair"];
        const interval = settings["candlesInterval"] || "1h";

        const candlesToDisplay = candlesNormalized.slice(-this.getCandlesDisplayCount(settings));
        const candleCount = candlesToDisplay.length;
        const paddingWidth = canvasWidth - (2 * padding);
        const paddingHeight = canvasHeight - (2 * padding);
        const candleWidth = candleCount > 0 ? paddingWidth / candleCount : paddingWidth;
        const wickWidth = Math.max(2 * sizeMultiplier, candleWidth * 0.15);
        const bodyWidth = Math.max(4 * sizeMultiplier, candleWidth * 0.6);


        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
        canvasContext.fillStyle = backgroundColor;
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

        var font = settings["font"] || "Lato";
        canvasContext.font = (15 * sizeMultiplier) + "px " + font;
        canvasContext.fillStyle = textColor;

        canvasContext.textAlign = "left";
        canvasContext.fillText(interval, 10 * sizeMultiplier, canvasHeight - (5 * sizeMultiplier));

        //this.log("updateCanvasCandles", candlesNormalized);
        candlesToDisplay.forEach(function (candleNormalized) {
            const xPosition = Math.round(padding + Math.round(candleNormalized.timePercent * paddingWidth));

            // Choose open/close color
            let candleColor = "green";
            if (candleNormalized.closePercent < candleNormalized.openPercent) {
                candleColor = "red";
            }

            // Draw the high/low bar
            canvasContext.beginPath();
            canvasContext.moveTo(xPosition, Math.round(padding + (1 - candleNormalized.highPercent) * paddingHeight));
            canvasContext.lineTo(xPosition, Math.round(padding + (1 - candleNormalized.lowPercent) * paddingHeight));
            canvasContext.lineWidth = wickWidth;
            canvasContext.strokeStyle = textColor;
            canvasContext.stroke();

            // Draw the open/close bar
            canvasContext.beginPath();
            canvasContext.moveTo(xPosition, Math.round(padding + (1 - candleNormalized.closePercent) * paddingHeight));
            canvasContext.lineTo(xPosition, Math.round(padding + (1 - candleNormalized.openPercent) * paddingHeight));
            canvasContext.lineWidth = bodyWidth;
            canvasContext.strokeStyle = candleColor;
            canvasContext.stroke();
        });

        const connectionIconSettingCandles = (settings["displayConnectionStatusIcon"] || "OFF").toUpperCase();
        if (connectionIconSettingCandles !== "OFF") {
            this.renderConnectionStatusIcon(
                effectiveConnectionState,
                textColor,
                sizeMultiplier,
                connectionIconSettingCandles
            );
        }

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
        const formatOption = format || "auto";
        let precision = parseInt(digits);
        if (isNaN(precision) || precision < 0) {
            precision = 2;
        }

        const scaledValue = value * multiplier;
        const absoluteValue = Math.abs(scaledValue);
        const sign = scaledValue < 0 ? "-" : "";
        const roundWithPrecision = function (val, localPrecision) {
            const pow = Math.pow(10, localPrecision);
            return Math.round(val * pow) / pow;
        };

        const toLocale = function (val, options) {
            try {
                return val.toLocaleString(undefined, options);
            } catch (err) {
                // Some environments might not support the options argument
                return val.toString();
            }
        };

        let formattedValue = "";
        const fixedDigits = Math.max(0, precision);

        switch (formatOption) {
            case "full":
                const roundedFull = roundWithPrecision(absoluteValue, fixedDigits);
                formattedValue = toLocale(roundedFull, {
                    minimumFractionDigits: fixedDigits,
                    maximumFractionDigits: fixedDigits,
                    useGrouping: true
                });
                break;
            case "compact":
                const units = [
                    { value: 1000000000000, suffix: "T" },
                    { value: 1000000000, suffix: "B" },
                    { value: 1000000, suffix: "M" },
                    { value: 1000, suffix: "K" }
                ];
                let suffix = "";
                let compactValue = absoluteValue;
                for (const unit of units) {
                    if (absoluteValue >= unit.value) {
                        suffix = unit.suffix;
                        compactValue = absoluteValue / unit.value;
                        break;
                    }
                }

                const roundedCompact = roundWithPrecision(compactValue, fixedDigits);
                formattedValue = toLocale(roundedCompact, {
                    minimumFractionDigits: fixedDigits,
                    maximumFractionDigits: fixedDigits,
                    useGrouping: !suffix
                }) + suffix;
                break;
            case "plain":
                const roundedPlain = roundWithPrecision(absoluteValue, fixedDigits);
                formattedValue = toLocale(roundedPlain, {
                    minimumFractionDigits: fixedDigits,
                    maximumFractionDigits: fixedDigits,
                    useGrouping: false
                });
                break;
            case "auto":
            default:
                let autoSuffix = "";
                let autoValue = absoluteValue;
                if (absoluteValue > 100000) {
                    autoSuffix = "K";
                    autoValue = absoluteValue / 1000;
                }

                const roundedAuto = roundWithPrecision(autoValue, fixedDigits);
                formattedValue = toLocale(roundedAuto, {
                    minimumFractionDigits: fixedDigits,
                    maximumFractionDigits: fixedDigits,
                    useGrouping: false
                }) + autoSuffix;
                break;
        }

        return sign + formattedValue;
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
        const cache = candlesCache[cacheKey] || {};
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
            const rate = await this.getConversionRate(currencies.from, currencies.to);
            if (rate && isFinite(rate) && rate > 0) {
                candlesForDisplay = this.applyCandlesConversion(preparedCandles, rate);
            }
        }

        const val = this.getCandlesNormalized(candlesForDisplay);
        cache[t] = now;
        cache[c] = val;
        candlesCache[cacheKey] = cache;
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
        let min = 999999999, max = 0, volumeMin = 999999999, volumeMax = 0, timeMin = 99999999999999999, timeMax = 0;
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
        if (max - min === 0) {
            return 0.5;
        }

        return (value - min) / (max - min);
    },
};

function connectElgatoStreamDeckSocket(inPort, pluginUUID, inRegisterEvent, inApplicationInfo, inActionInfo) {
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
        const action = jsonObj["action"];
        const context = jsonObj["context"];

        const jsonPayload = jsonObj["payload"] || {};
        const settings = jsonPayload["settings"];
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
            //this.log("Received settings", settings);
            for (const k in defaultSettings) {
                if (!settings[k]) {
                    settings[k] = defaultSettings[k];
                }
            }
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

    const settings = defaultSettings;
    settings["digits"] = 0;
    settings["pair"] = "LTCUSD";
    settings["mode"] = "ticker";    // or candles

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
