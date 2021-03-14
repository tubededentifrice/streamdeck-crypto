const DestinationEnum = Object.freeze({
    "HARDWARE_AND_SOFTWARE": 0,
    "HARDWARE_ONLY": 1,
    "SOFTWARE_ONLY": 2
});

const loggingEnabled = false;
let websocket = null;
let pluginUUID = null;
let canvas;
let canvasContext;
let bitfinexWsByContext = {};
let rates = null;
let ratesUpdate = 0;
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
    log: function(...data) {
        if (loggingEnabled) {
            console.log(...data);
        }
    },

    onKeyDown: async function (context, settings, coordinates, userDesiredState) {
        // State machine between modes
        switch(settings.mode) {
            case "candles":
                settings.mode = "ticker";
                break;
            case "ticker":
            default:
                settings.mode = "candles";
                break;
        }

        // Update settings with current mode
        websocket.send(JSON.stringify({
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
    refreshTimers: async function() {
        // Make sure everybody is connected
        for (var ctx in bitfinexWsByContext) {
            const currentWs = bitfinexWsByContext[ctx];
            this.refreshTimer(
                currentWs.context,
                currentWs.settings
            );
        }
    },
    refreshTimer: async function(context, settings) {
        this.refreshSettings(context, settings);

        const currentWs = this.getCurrentWs(context);

        const connected = (currentWs.ws || {}).connectionState=="Connecting" || (currentWs.ws || {}).connectionState=="Connected";

        if (currentWs.pair!=settings.pair || !currentWs.ws || !connected) {
            this.log("Reopening WS because "+currentWs.pair+"!="+settings.pair+" || !"+connected);
            if (currentWs.ws) {
                currentWs.ws.stopped = true;
                currentWs.ws.stop();
            }

            this.subscribe(settings, currentWs);
        }

        // Force refresh of the display (in case WebSockets doesn't work and to update the candles)
        this.updateTicker(context, settings);
    },
    subscribe: function(settings, currentWs) {
        const jThis = this;
        currentWs.exchange = settings["exchange"] || "BITFINEX";
        currentWs.pair = settings["pair"] || "BTCUSD";

        currentWs.ws = new signalR.HubConnectionBuilder()
            .withUrl("https://tproxy.opendle.com/tickerhub")
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        currentWs.ws.on("ticker", async (ticker) => {
            jThis.log("Ticker received via WSS", ticker);

            await jThis.updateCanvas(
                currentWs.context,
                currentWs.settings,
                await jThis.extractValues(ticker, currentWs.pair, settings["currency"])
            );
        });

        const subscribe = async function() {
            if (!currentWs.ws.stopped) {
                await currentWs.ws.invoke("Subscribe", currentWs.exchange, currentWs.pair, settings["fromCurrency"] || null, settings["currency"] || null);
            }
        };
        currentWs.ws.onreconnected(async (connectionId) => {
            subscribe();
        });

        const start = async function() {
            if (!currentWs.ws.stopped && currentWs.ws.connectionState!="Connected") {
                try {
                    await currentWs.ws.start();
                    await subscribe();
                } catch (err) {
                    console.log(err);
                    setTimeout(start, 5000);
                }
            }
        };

        // Start the connection.
        currentWs.ws.stopped = false;
        start();
    },
    refreshSettings: function(context, settings) {
        const currentWs = this.getCurrentWs(context);
        currentWs.context = context;
        currentWs.settings = settings;
    },

    updateTicker: async function(context, settings) {
        const pair = settings.pair || "BTCUSD";
        const values = await this.getTickerValue(pair, settings.currency, settings.exchange);
        this.updateCanvas(context, settings, values);
    },
    initCanvas: function() {
        canvas = document.getElementById("ticker");
        canvasContext = canvas.getContext("2d");
    },
    updateCanvas: async function(context, settings, tickerValues) {
        this.log("updateCanvas", context, settings, tickerValues);

        const currentWs = this.getCurrentWs(context);
        currentWs.latestTickerValues = tickerValues;

        switch(settings.mode) {
            case "candles":
                const candleValues = await this.getCandles(settings);
                currentWs.latestCandleValues = candleValues;
                this.updateCanvasCandles(context, settings, candleValues);
                break;
            case "ticker":
            default:
                this.updateCanvasTicker(context, settings, tickerValues);
                break;
        }
    },
    updateCanvasTicker: function(context, settings, values) {
        this.log("updateCanvasTicker", context, settings, values);

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const textPadding = 10;

        const pair = settings.pair || "BTCUSD";
        const exchange = settings.exchange || "BITFINEX";
        const pairDisplay = values.pair || pair;
        const currency = settings.currency || "USD";
        const multiplier = settings.multiplier || 1;
        const digits = settings.digits || 2;
        let backgroundColor = settings.backgroundColor || "#000000";
        let textColor = settings.textColor || "#ffffff";
        //console.log(settings);
        //// console.log(new Date()+" "+pair+" => "+values.last);

        let alertMode = false;
        const changeDaily = values.changeDaily;
        const changeDailyPercent = values.changeDailyPercent;
        const value = values.last;
        const valueDisplay = value*multiplier;
        const volume = values.volume;
        const high = values.high;
        const low = values.low;
        if (settings.alertRule) {
            try {
                if (eval(settings.alertRule)) {
                    alertMode = true;
                    const tmp = backgroundColor;
                    backgroundColor = textColor;
                    textColor = tmp;
                }
            }
            catch(err) { console.error(err); }
        }

        if (settings.backgroundColorRule) {
            const alert = alertMode;
            try {
                backgroundColor = eval(settings.backgroundColorRule) || backgroundColor;
            }
            catch(err) { console.error(err); }
        }
        if (settings.textColorRule) {
            const alert = alertMode;
            try {
                textColor = eval(settings.textColorRule) || textColor;
            }
            catch(err) { console.error(err); }
        }

        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
        canvasContext.fillStyle = backgroundColor;
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

        var font = settings["font"] || "Lato";
        canvasContext.font = "25px "+font;
        canvasContext.fillStyle = textColor;

        canvasContext.textAlign = "left";
        canvasContext.fillText(pairDisplay, 10, 25);

        canvasContext.font = "bold 35px "+font;
        canvasContext.fillText(
            this.getRoundedValue(values.last, digits, multiplier),
            textPadding,
            60
        );

        if (settings["displayHighLow"]!="off") {
            canvasContext.font = "25px "+font;
            canvasContext.fillText(
                this.getRoundedValue(values.low, digits, multiplier),
                textPadding,
                90
            );

            canvasContext.textAlign = "right";
            canvasContext.fillText(
                this.getRoundedValue(values.high, digits, multiplier),
                canvasWidth-textPadding,
                135
            );
        }

        if (settings["displayDailyChange"]!="off") {
            const originalFillColor = canvasContext.fillStyle;

            const changePercent = values.changeDailyPercent * 100;
            let digitsPercent = 2;
            if (Math.abs(changePercent)>=10) {
                digitsPercent = 1;
            } else if (Math.abs(changePercent)>=10) {
                digitsPercent = 0;
            }
            let changePercentDisplay = this.getRoundedValue(changePercent, digitsPercent, 1);
            if (changePercent>0) {
                changePercentDisplay = "+" + changePercentDisplay;
                canvasContext.fillStyle = "green";
                /*canvasContext.font = "bold 40px "+font;
                canvasContext.fillText(
                    "^",
                    canvasWidth-textPadding,
                    37
                );*/
            } else {
                canvasContext.fillStyle = "red";
                /*canvasContext.font = "bold 30px "+font;
                canvasContext.fillText(
                    "v",
                    canvasWidth-textPadding,
                    25
                );*/
            }

            canvasContext.font = "19px "+font;
            canvasContext.textAlign = "right";
            // canvasContext.rotate(Math.PI);
            canvasContext.fillText(
                changePercentDisplay,
                canvasWidth-textPadding,
                90
            );

            // Restore orignal value, though it shouldn't be used
            canvasContext.fillStyle = originalFillColor;
        }

        if (settings["displayHighLowBar"]!="off") {
            const lineY = 104;
            const padding = 5;
            const lineWidth = 6;

            const percent = (values.last - values.low)/(values.high - values.low);
            const lineLength = canvasWidth-padding*2;
            const cursorPositionX = padding+Math.round(lineLength*percent);

            const triangleSide = 12;
            const triangleHeight = Math.sqrt(3/4*Math.pow(triangleSide,2));

            canvasContext.beginPath();
            canvasContext.moveTo(padding, lineY);
            canvasContext.lineTo(cursorPositionX, lineY);
            canvasContext.lineWidth = lineWidth;
            canvasContext.strokeStyle = "green";
            canvasContext.stroke();

            canvasContext.beginPath();
            canvasContext.moveTo(cursorPositionX, lineY);
            canvasContext.lineTo(canvasWidth-padding, lineY);
            canvasContext.lineWidth = lineWidth;
            canvasContext.strokeStyle = "red";
            canvasContext.stroke();

            canvasContext.beginPath();
            canvasContext.moveTo(cursorPositionX - triangleSide/2, lineY - triangleHeight/3);
            canvasContext.lineTo(cursorPositionX + triangleSide/2, lineY - triangleHeight/3);
            canvasContext.lineTo(cursorPositionX, lineY + triangleHeight*2/3);
            canvasContext.fillStyle = textColor;
            canvasContext.fill();
        }

        this.sendCanvas(context);
    },

    updateCanvasCandles: function(context, settings, candlesNormalized) {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const padding = 10;
        let backgroundColor = settings.backgroundColor || "#000000";
        let textColor = settings.textColor || "#ffffff";

        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
        canvasContext.fillStyle = backgroundColor;
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

        //this.log("updateCanvasCandles", candlesNormalized);
        candlesNormalized.forEach(function(candleNormalized) {
            const xPosition = Math.round(padding+Math.round(candleNormalized.timePercent*(canvasWidth-2*padding)));

            // Draw the high/low bar
            canvasContext.beginPath();
            canvasContext.moveTo(xPosition, Math.round(padding+(1-candleNormalized.highPercent)*(canvasHeight-2*padding)));
            canvasContext.lineTo(xPosition, Math.round(padding+(1-candleNormalized.lowPercent)*(canvasHeight-2*padding)));
            canvasContext.lineWidth = 2;
            canvasContext.strokeStyle = textColor;
            canvasContext.stroke();

            //this.log(xPosition+", "+Math.round(padding+(1-candleNormalized.highPercent)*(canvasHeight-2*padding))+" to "+xPosition+", "+Math.round(padding+(1-candleNormalized.lowPercent)*(canvasHeight-2*padding)))

            // Choose open/close color
            let candleColor = "green";
            if (candleNormalized.closePercent<candleNormalized.openPercent) {
                candleColor = "red";
            }

            // Draw the open/close bar
            canvasContext.beginPath();
            canvasContext.moveTo(xPosition, Math.round(padding+(1-candleNormalized.closePercent)*(canvasHeight-2*padding)));
            canvasContext.lineTo(xPosition, Math.round(padding+(1-candleNormalized.openPercent)*(canvasHeight-2*padding)));
            canvasContext.lineWidth = 5;
            canvasContext.strokeStyle = candleColor;
            canvasContext.stroke();
        });

        this.sendCanvas(context);
    },
    sendCanvas: function(context) {
        var json = {
            "event": "setImage",
            "context": context,
            "payload": {
                "image": canvas.toDataURL(),
                "target": DestinationEnum.HARDWARE_AND_SOFTWARE
            }
        }

        websocket.send(JSON.stringify(json));
    },
    getRoundedValue: function(value, digits, multiplier) {
        const digitPow = Math.pow(10, digits);

        let valueString = ""+Math.round(value*multiplier*digitPow)/digitPow;

        if (digits>0) {
            // Make sure we always have the correct number of digits, even when rounded
            let digitPosition = valueString.indexOf(".");
            if (digitPosition<0) {
                valueString+=".";
                digitPosition = valueString.length - 1;
            }

            let actualDigits = valueString.length - digitPosition - 1;
            while (actualDigits<digits) {
                valueString+="0";
                actualDigits++;
            }
        }


        return valueString;
    },

    getTickerValue: async function(pair, toCurrency, exchange) {
        const response = await fetch("https://tproxy.opendle.com/api/Ticker/json/"+(exchange||"BITFINEX")+"/"+pair+"?fromCurrency=USD&toCurrency="+(toCurrency||"USD"));
        const responseJson = await response.json();

        return this.extractValues(responseJson);
    },
    extractValues: async function(responseJson, pair, toCurrency) {
        this.log("extractValues", responseJson, pair, toCurrency);

        return {
            "changeDaily": responseJson["dailyChange"],
            "changeDailyPercent": responseJson["dailyChangeRelative"],
            "last": responseJson["last"],
            "volume": responseJson["volume"],
            "high": responseJson["high24h"],
            "low": responseJson["low24h"],
            "pair": responseJson["symbol"],
        };
    },
    getCandles: async function(settings) {
        this.log("getCandles");

        const exchange = settings.exchange || "BITFINEX";
        const pair = settings["pair"] || "BTCUSD";
        const interval = this.convertCandlesInterval(settings["candlesInterval"] || "1h");
        const cacheKey = exchange + "_" + pair + "_" + interval;
        const cache = candlesCache[cacheKey] || {};
        const now = new Date().getTime();
        const t = "time";
        const c = "candles";

        // Refresh at most every minute
        if (cache[t] && cache[t]>now-60*1000) {
            return cache[c];
        }

        const response = await fetch("https://tproxy.opendle.com/api/Candles/json/"+exchange+"/"+pair+"/"+interval+"?limit=20");
        const val = this.getCandlesNormalized((await response.json()).candles);

        cache[t] = now;
        cache[c] = val;
        candlesCache[cacheKey] = cache;
        return cache[c];
    },
    convertCandlesInterval: function(interval) {
        switch(interval) {
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
    getCandlesNormalized: function(candles) {
        let min = 999999999, max = 0, volumeMin = 999999999, volumeMax = 0, timeMin = 99999999999999999, timeMax = 0;
        candles.forEach(function(candle) {
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
        candles.forEach(function(candle) {
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
    normalizeValue: function(value, min, max) {
        return (value-min)/(max-min);
    },

    getCurrentWs: function(context) {
        const currentWs = bitfinexWsByContext[context] || {};
        bitfinexWsByContext[context] = currentWs;
        return currentWs;
    },
};

function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inApplicationInfo, inActionInfo) {
    pluginUUID = inPluginUUID;

    // Open the web socket
    websocket = new WebSocket("ws://127.0.0.1:" + inPort);

    function registerPlugin(inPluginUUID) {
        var json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
        };

        websocket.send(JSON.stringify(json));
    };

    websocket.onopen = function () {
        // WebSocket is connected, send message
        registerPlugin(pluginUUID);
    };

    websocket.onmessage = async function (evt) {
        //this.log("Message received", evt);

        // Received message from Stream Deck
        var jsonObj = JSON.parse(evt.data);
        var event = jsonObj['event'];
        var action = jsonObj['action'];
        var context = jsonObj['context'];

        var jsonPayload = jsonObj['payload'] || {};
        var settings = jsonPayload['settings'];
        var coordinates = jsonPayload['coordinates'];
        var userDesiredState = jsonPayload['userDesiredState'];

        if (event == "keyDown") {
            tickerAction.onKeyDown(context, settings, coordinates, userDesiredState);
        } else if (event == "keyUp") {
            tickerAction.onKeyUp(context, settings, coordinates, userDesiredState);
        } else if (event == "willAppear") {
            tickerAction.onWillAppear(context, settings, coordinates);
        } else if (settings!=null) {
            //this.log("Received settings", settings);
            for (k in defaultSettings) {
                if (!settings[k]) {
                    settings[k] = defaultSettings[k];
                }
            }

            tickerAction.refreshSettings(context, settings);
            tickerAction.refreshTimer(context, settings);
            // tickerAction.updateTicker(context, settings);    // Already done by refreshTimer
        }
    };

    websocket.onclose = function () {
        // Websocket is closed
    };

    setInterval(async function() {
        tickerAction.refreshTimers();
    }, 60000);
};