/// <reference path="../libs/js/action.js" />
/// <reference path="../libs/js/stream-deck.js" />

const tProxyBase = "https://tproxyv8.opendle.com";
// const tProxyBase = "https://localhost:44330";

let loggingEnabled = false;
let websocket = null;
let canvas;
let canvasContext;
let globalWs = null;
const subscriptionsContexts = {}; // exchange/symbol => contexts, allowing to know with contexts to update
const contextDetails = {};  // context => settings, ensure a single subscription per context
const screenshotMode = false;   // Allows to have the canvas rendered on https://streamdeck.opendle.com/src/com.courcelle.cryptoticker.sdPlugin/

const alertStatuses = {};
const alertArmed = {};
let rates = null;
let ratesUpdate = 0;
const tickerCache = {};
const candlesCache = {};

const defaultSettings = {
    "exchange": "BITFINEX",
    "pair": "BTCUSD",
    "fromCurrency": "USD",
    "currency": "USD",
    "candlesInterval": "1h",
    "multiplier": 1,
    "digits": 2,
    "font": "Lato,'Roboto Condensed',Helvetica,Calibri,sans-serif",
    "backgroundColor": "#000000",
    "textColor": "#ffffff",
    "displayHighLow": "on",
    "displayHighLowBar": "on",
    "displayDailyChange": "on",
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

    isConnected: function() {
        return globalWs && !globalWs.stopped && globalWs.state == "Connected";
    },
    isConnectedOrConnecting: function() {
        return (this.isConnected() || (globalWs && globalWs.state == "Connecting")) && !globalWs.stopped;
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
        this.connectOrReconnectIfNeeded();

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
    connectOrReconnectIfNeeded: function () {
        if (!this.isConnectedOrConnecting()) {
            this.log("Reopening WS because not connected or connecting", globalWs);
            if (globalWs) {
                globalWs.stopped = true;
                globalWs.stop();
                globalWs = null;
            }

            this.connect();
        }
    },
    connect: function () {
        const jThis = this;

        if (globalWs === null) {
            jThis.log("Connect");

            globalWs = new signalR.HubConnectionBuilder()
                .withUrl(tProxyBase + "/tickerhub")
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Warning)
                // .configureLogging(signalR.LogLevel.Debug)
                .build();

            globalWs.on("ticker", async (ticker) => {
                jThis.log("Ticker received via WSS", ticker);

                //TODO: Send to each context that have subscribe to this
                const sKey = this.getSubscriptionContextKey(ticker["provider"], ticker["symbol"], ticker["conversionFromCurrency"], ticker["conversionToCurrency"]);
                if (subscriptionsContexts[sKey]) {
                    for (let c in subscriptionsContexts[sKey]) {
                        const settings = contextDetails[c]["settings"];
                        await jThis.updateCanvas(
                            contextDetails[c]["context"],
                            settings,
                            await jThis.extractValues(ticker, settings["pair"], settings["currency"])
                        );
                    }
                } else {
                    console.error("Received a ticker for an unknow context " + sKey, ticker, subscriptionsContexts);
                }
            });

            const subscribe = async function () {
                if (!globalWs.stopped) {
                    for (const c in contextDetails) {
                        jThis.subscribe(contextDetails[c]["context"], contextDetails[c]["settings"]);
                    }
                }
            };
            globalWs.onreconnected(async (connectionId) => {
                if (!globalWs.stopped) {
                    subscribe();
                }
            });

            const start = async function () {
                if (!globalWs.stopped && !jThis.isConnectedOrConnecting()) {
                    try {
                        globalWs.start().then(async function () {
                            await subscribe();
                        }).catch(function (err) {
                            return console.error(err.toString());
                        });
                    } catch (err) {
                        // Retry after 5 seconds
                        console.log(err);
                        setTimeout(start, 5000);
                    }
                }
            };
    
            // Start the connection.
            globalWs.stopped = false;
            start();
        }
    },
    subscribe: async function (context, settings) {
        const sKey = this.getSubscriptionContextKey(settings["exchange"], settings["pair"], settings["fromCurrency"] || null, settings["currency"] || null);
        subscriptionsContexts[sKey] = (subscriptionsContexts[sKey] || {});
        subscriptionsContexts[sKey][context] = settings;

        // Make sure we aren't subscribe to something else
        for (let k in subscriptionsContexts) {
            if (k != sKey) {
                const sKeyObj = subscriptionsContexts[k];

                // If a single context on this subscription and it's us
                // Then unsubscribe and then delete the whole key
                if (Object.keys(sKeyObj).length == 1) {
                    if (sKeyObj[context]) {
                        const sKeyObjContextSettings = sKeyObj[context];
                        try {
                            if (this.isConnected()) {
                                this.log(
                                    "Unsubscribe",
                                    sKeyObjContextSettings["exchange"],
                                    sKeyObjContextSettings["pair"],
                                    sKeyObjContextSettings["fromCurrency"] || null,
                                    sKeyObjContextSettings["currency"] || null
                                );
                                await globalWs.invoke(
                                    "Unsubscribe",
                                    sKeyObjContextSettings["exchange"],
                                    sKeyObjContextSettings["pair"],
                                    sKeyObjContextSettings["fromCurrency"] || null,
                                    sKeyObjContextSettings["currency"] || null
                                );
                            }
                        } catch (e) {
                            console.error("Error invoking Unsubscribe", context, settings, e);
                        }

                        delete subscriptionsContexts[k]
                    }
                }

                // Otherwise just delete the context key
                delete sKeyObj[context];
            }
        }

        if (this.isConnected()) {
            this.log(
                "Subscribe",
                settings["exchange"],
                settings["pair"],
                settings["fromCurrency"] || null,
                settings["currency"] || null
            );
            await globalWs.invoke("Subscribe", settings["exchange"], settings["pair"], settings["fromCurrency"] || null, settings["currency"] || null);
        }
    },
    refreshSettings: function (context, settings) {
        contextDetails[context] = {
            "context": context,
            "settings": settings
        };

        this.connectOrReconnectIfNeeded();

        // Update the subscription in all cases
        this.subscribe(context, settings);
    },
    getSubscriptionContextKey: function (exchange, pair, fromCurrency, toCurrency) {
        let convertPart = "";
        if (fromCurrency != null && toCurrency != null && fromCurrency != toCurrency) {
            convertPart = "__" + fromCurrency + "_" + toCurrency;
        }

        return exchange + "__" + pair + convertPart;
    },

    updateTicker: async function (context, settings) {
        const pair = settings["pair"];
        const values = await this.getTickerValue(pair, settings.currency, settings.exchange);
        this.updateCanvas(context, settings, values);
    },
    initCanvas: function () {
        canvas = document.getElementById("ticker");
        canvasContext = canvas.getContext("2d");
    },
    updateCanvas: async function (context, settings, tickerValues) {
        this.log("updateCanvas", context, settings, tickerValues);

        switch (settings.mode) {
            case "candles":
                const candleValues = await this.getCandles(settings);
                this.updateCanvasCandles(context, settings, candleValues);
                break;
            case "ticker":
            default:
                this.updateCanvasTicker(context, settings, tickerValues);
                break;
        }
    },
    getCanvasSizeMultiplier: function(canvasWidth, canvasHeight) {
        // New High resolution devices: the canvas was originally 144x144, but we want it 288x288 now
        // Using a multiplier allows to simply change the canvas size and everything will adjust automatically
        return Math.max(canvasWidth / 144, canvasHeight / 144);
    },
    updateCanvasTicker: function (context, settings, values) {
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
        const digits = settings["digits"] || 2;
        let backgroundColor = settings["backgroundColor"] || "#000000";
        let textColor = settings["textColor"] || "#ffffff";

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
        canvasContext.font = (25 * sizeMultiplier) + "px " + font;
        canvasContext.fillStyle = textColor;

        canvasContext.textAlign = "left";
        canvasContext.fillText(pairDisplay, 10 * sizeMultiplier, 25 * sizeMultiplier);

        canvasContext.font = "bold "+(35 * sizeMultiplier)+"px " + font;
        canvasContext.fillText(
            this.getRoundedValue(values["last"], digits, multiplier),
            textPadding,
            60 * sizeMultiplier
        );

        if (settings["displayHighLow"] != "off") {
            canvasContext.font = (25 * sizeMultiplier) + "px " + font;
            canvasContext.fillText(
                this.getRoundedValue(values["low"], digits, multiplier),
                textPadding,
                90 * sizeMultiplier
            );

            canvasContext.textAlign = "right";
            canvasContext.fillText(
                this.getRoundedValue(values["high"], digits, multiplier),
                canvasWidth - textPadding,
                135 * sizeMultiplier
            );
        }

        if (settings["displayDailyChange"] != "off") {
            const originalFillColor = canvasContext.fillStyle;

            const changePercent = values.changeDailyPercent * 100;
            let digitsPercent = 2;
            if (Math.abs(changePercent) >= 10) {
                digitsPercent = 1;
            } else if (Math.abs(changePercent) >= 10) {
                digitsPercent = 0;
            }
            let changePercentDisplay = this.getRoundedValue(changePercent, digitsPercent, 1);
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

            canvasContext.font = (19 * sizeMultiplier) + "px " + font;
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

            const percent = (values.last - values.low) / (values.high - values.low);
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

        this.sendCanvas(context);
    },

    updateCanvasCandles: function (context, settings, candlesNormalized) {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const sizeMultiplier = this.getCanvasSizeMultiplier(canvasWidth, canvasHeight);

        const padding = 10 * sizeMultiplier;
        let backgroundColor = settings["backgroundColor"];
        let textColor = settings["textColor"];

        const pairDisplay = settings["title"] || settings["pair"];
        const interval = settings["candlesInterval"] || "1h";


        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
        canvasContext.fillStyle = backgroundColor;
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

        var font = settings["font"] || "Lato";
        canvasContext.font = (15 * sizeMultiplier) + "px " + font;
        canvasContext.fillStyle = textColor;

        canvasContext.textAlign = "left";
        canvasContext.fillText(interval, 10 * sizeMultiplier, canvasHeight - (5 * sizeMultiplier));

        //this.log("updateCanvasCandles", candlesNormalized);
        candlesNormalized.forEach(function (candleNormalized) {
            const paddingWidth = canvasWidth - (2 * padding);   // padding is already multiplied by sizeMultiplier above
            const paddingHeight = canvasHeight - (2 * padding); // padding is already multiplied by sizeMultiplier above
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
            canvasContext.lineWidth = 2 * sizeMultiplier;
            canvasContext.strokeStyle = textColor;
            canvasContext.stroke();

            // Draw the open/close bar
            canvasContext.beginPath();
            canvasContext.moveTo(xPosition, Math.round(padding + (1 - candleNormalized.closePercent) * paddingHeight));
            canvasContext.lineTo(xPosition, Math.round(padding + (1 - candleNormalized.openPercent) * paddingHeight));
            canvasContext.lineWidth = 5 * sizeMultiplier;
            canvasContext.strokeStyle = candleColor;
            canvasContext.stroke();
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
    getRoundedValue: function (value, digits, multiplier) {
        const digitPow = Math.pow(10, digits);

        let valueString = "" + Math.round(value * multiplier * digitPow) / digitPow;

        if (digits > 0) {
            // Make sure we always have the correct number of digits, even when rounded
            let digitPosition = valueString.indexOf(".");
            if (digitPosition < 0) {
                valueString += ".";
                digitPosition = valueString.length - 1;
            }

            let actualDigits = valueString.length - digitPosition - 1;
            while (actualDigits < digits) {
                valueString += "0";
                actualDigits++;
            }
        }

        return valueString;
    },

    getTickerValue: async function (pair, toCurrency, exchange) {
        try {
            const response = await fetch(
                tProxyBase + "/api/Ticker/json/" + exchange + "/" + pair + "?fromCurrency=USD&toCurrency=" + toCurrency
            );
            const responseJson = await response.json();
            const values = await this.extractValues(responseJson, pair, toCurrency);
            tickerCache[pair] = values;
            return values;
        } catch (e) {
            this.log("Error fetching ticker", e);
            return tickerCache[pair] || {
                "changeDaily": 0,
                "changeDailyPercent": 0,
                "last": 0,
                "volume": 0,
                "high": 0,
                "low": 0,
                "pair": pair,
                "pairDisplay": pair,
            };
        }
    },
    extractValues: async function (responseJson, pair, toCurrency) {
        this.log("extractValues", responseJson, pair, toCurrency);

        return {
            "changeDaily": responseJson["dailyChange"],
            "changeDailyPercent": responseJson["dailyChangeRelative"],
            "last": responseJson["last"],
            "volume": responseJson["volume"],
            "high": responseJson["high24h"],
            "low": responseJson["low24h"],
            "pair": responseJson["symbol"],
            "pairDisplay": responseJson["symbolDisplay"],
        };
    },
    getCandles: async function (settings) {
        this.log("getCandles");

        const exchange = settings["exchange"];
        const pair = settings["pair"];
        const interval = this.convertCandlesInterval(settings["candlesInterval"] || "1h");
        const cacheKey = exchange + "_" + pair + "_" + interval;
        const cache = candlesCache[cacheKey] || {};
        const now = new Date().getTime();
        const t = "time";
        const c = "candles";

        // Refresh at most every minute
        if (cache[t] && cache[t] > now - 60 * 1000) {
            return cache[c];
        }

        try {
            const response = await fetch(
                tProxyBase + "/api/Candles/json/" + exchange + "/" + pair + "/" + interval + "?limit=20"
            );
            const val = this.getCandlesNormalized((await response.json()).candles);
            cache[t] = now;
            cache[c] = val;
            candlesCache[cacheKey] = cache;
            return cache[c];
        } catch (e) {
            this.log("Error fetching candles", e);
            return cache[c] || [];
        }
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
    getCandlesNormalized: function (candles) {
        let min = 999999999, max = 0, volumeMin = 999999999, volumeMax = 0, timeMin = 99999999999999999, timeMax = 0;
        candles.forEach(function (candle) {
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
        candles.forEach(function (candle) {
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
