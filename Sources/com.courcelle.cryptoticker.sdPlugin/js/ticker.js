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

        if (currentWs.pair!=settings.pair || !currentWs.ws || currentWs.ws.readyState>1) {
            this.log("Reopening WS because "+currentWs.pair+"!="+settings.pair+" || "+(currentWs.ws || {}).readyState+">1");
            if (currentWs.ws) {
                currentWs.ws.close();
            }

            switch(settings.exchange) {
                case "BINANCE":
                    this.subscribeBinance(settings, currentWs);
                    break;
                default:
                    this.subscribeBitfinex(settings, currentWs);
                    break;
            }
        }

        // Force refresh of the display (in case WebSockets doesn't work and to update the candles)
        this.updateTicker(context, settings);
    },
    subscribeBinance: function(settings, currentWs) {
        const jThis = this;
        currentWs.pair = settings.pair;
        currentWs.ws = new WebSocket("wss://stream.binance.com:9443/ws/ticker");
        currentWs.ws.onmessage = async function(msg) {
            //this.log("onmessage", msg);
            //console.log(msg);
            if (msg!=null && msg.data!=null) {
                dataObj = JSON.parse(msg.data);
                if (dataObj != null && dataObj["e"]) {
                    const changeDaily = await jThis.convertValue(parseFloat(dataObj["p"]), settings.pair, settings.currency);
                    const last = await jThis.convertValue(parseFloat(dataObj["c"]), settings.pair, settings.currency);
                    const high = await jThis.convertValue(parseFloat(dataObj["h"]), settings.pair, settings.currency);
                    const low = await jThis.convertValue(parseFloat(dataObj["l"]), settings.pair, settings.currency);

                    await jThis.updateCanvas(
                        currentWs.context,
                        currentWs.settings,
                        {
                            "changeDaily": changeDaily.value,
                            "changeDailyPercent": parseFloat(dataObj["P"]) / 100,
                            "last": last.value,
                            "volume": parseFloat(dataObj["v"]),
                            "high": high.value,
                            "low": low.value,
                            "pair": last.pair,
                        }
                    );
                }
            }
        };
        currentWs.ws.onopen = function() {
            currentWs.ws.send(JSON.stringify({
                method: "SUBSCRIBE",
                params: [
                    settings.pair.toLowerCase() + "@ticker",
                ],
                "id": 1
            }))
        };
    },
    subscribeBitfinex: function(settings, currentWs) {
        const jThis = this;
        currentWs.pair = settings.pair;
        currentWs.ws = new WebSocket("wss://api-pub.bitfinex.com/ws/2");
        currentWs.ws.onmessage = async function(msg) {
            //this.log("onmessage", msg);
            if (msg!=null && msg.data!=null) {
                dataObj = JSON.parse(msg.data);
                if (Array.isArray(dataObj) && Array.isArray(dataObj[1]) && dataObj[1].length>=10) {
                    //console.log("Data", dataObj);
                    await jThis.updateCanvas(
                        currentWs.context,
                        currentWs.settings,
                        await jThis.extractValues(dataObj[1], settings.pair, settings.currency)
                    );
                }
            }
        };
        currentWs.ws.onopen = function() {
            currentWs.ws.send(JSON.stringify({
                event: "subscribe",
                channel: "ticker",
                symbol: "t"+settings.pair
            }))
        };
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
        switch(exchange) {
            case "BINANCE":
                return await this.getTickerValueBinance(pair, toCurrency);
            case "BITFINEX":
            default:
                return await this.getTickerValueBitfinex(pair, toCurrency);
        }
    },
    getTickerValueBinance: async function(pair, toCurrency) {
        const response = await fetch("https://binance.com/api/v3/ticker/24hr?symbol="+pair);
        const responseJson = await response.json();
        this.log("getTickerValueBinance", responseJson);

        const changeDaily = await this.convertValue(parseFloat(responseJson["priceChange"]), pair, toCurrency);
        const last = await this.convertValue(parseFloat(responseJson["lastPrice"]), pair, toCurrency);
        const high = await this.convertValue(parseFloat(responseJson["highPrice"]), pair, toCurrency);
        const low = await this.convertValue(parseFloat(responseJson["lowPrice"]), pair, toCurrency);
        const open = await this.convertValue(parseFloat(responseJson["openPrice"]), pair, toCurrency);

        return {
            "changeDaily": changeDaily.value,
            "changeDailyPercent": parseFloat(responseJson["priceChangePercent"])/100,
            "last": last.value,
            "volume": parseFloat(responseJson["volume"]),
            "high": high.value,
            "low": low.value,
            "pair": last.pair,
        };
    },
    getTickerValueBitfinex: async function(pair, toCurrency) {
        const response = await fetch("https://api-pub.bitfinex.com/v2/ticker/t"+pair);
        const responseJson = await response.json();
        //this.log("getTickerValueBitfinex", responseJson);
        return await this.extractValues(responseJson, pair, toCurrency);
    },
    extractValues: async function(rawTicker, pair, toCurrency) {
        this.log("extractValues", rawTicker, pair, toCurrency);

        const changeDaily = await this.convertValue(rawTicker[4], pair, toCurrency);
        const last = await this.convertValue(rawTicker[6], pair, toCurrency);
        const high = await this.convertValue(rawTicker[8], pair, toCurrency);
        const low = await this.convertValue(rawTicker[9], pair, toCurrency);

        return {
            "changeDaily": changeDaily.value,
            "changeDailyPercent": rawTicker[5],
            "last": last.value,
            "volume": rawTicker[7],
            "high": high.value,
            "low": low.value,
            "pair": last.pair,
        };
    },
    getCandles: async function(settings) {
        this.log("getCandles");

        const exchange = settings.exchange || "BITFINEX";
        const pair = settings["pair"] || "BTCUSD";
        const interval = settings["candlesInterval"] || "1h";
        const cacheKey = exchange + "_" + pair + "_" + interval;
        const cache = candlesCache[cacheKey] || {};
        const now = new Date().getTime();
        const t = "time";
        const c = "candles";

        // Refresh at most every minute
        if (cache[t] && cache[t]>now-60*1000) {
            return cache[c];
        }

        let val;
        switch(exchange) {
            case "BINANCE":
                val = await this.getCandlesBinance(pair, interval);
                break;
            case "BITFINEX":
            default:
                val = await this.getCandlesBitfinex(pair, interval);
                break;
        }

        cache[t] = now;
        cache[c] = val;
        candlesCache[cacheKey] = cache;
        return cache[c];
    },
    getCandlesBinance: async function(pair, interval) {
        // 0: open time, 1: open, 2: high, 3: low, 4: close, 5: volume, 6: close time, 7: volume, 8: trades, 9: buy base volume, 10: buy quote volume, 11: ignore
        const response = await fetch("https://binance.com/api/v3/klines?symbol="+pair+"&interval="+interval.toLowerCase()+"&limit=20");
        const responseJson = await response.json();
        this.log("getCandlesBitfinex", responseJson);

        return this.getCandlesNormalized(responseJson, {
            "ts": 0,
            "open": 1,
            "close": 4,
            "high": 2,
            "low": 3,
            "volume": 5
        });
    },
    getCandlesBitfinex: async function(pair, interval) {
        // 0: ts, 1: open, 2: close, 3: high, 4: low, 5: volume
        const response = await fetch("https://api-pub.bitfinex.com/v2/candles/trade:"+interval+":t"+pair+"/hist?limit=20");
        const responseJson = await response.json();
        this.log("getCandlesBitfinex", responseJson);

        return this.getCandlesNormalized(responseJson, {
            "ts": 0,
            "open": 1,
            "close": 2,
            "high": 3,
            "low": 4,
            "volume": 5
        });
    },
    getCandlesNormalized: function(candles, parsing) {
        let min = 999999999, max = 0, volumeMin = 999999999, volumeMax = 0, timeMin = 99999999999999999, timeMax = 0;
        candles.forEach(function(candle) {
            timeMin = Math.min(timeMin, candle[parsing["ts"]]);
            timeMax = Math.max(timeMax, candle[parsing["ts"]]);

            // Some shouldn't be necessary, but doesn't cost much and avoid mistakes
            min = Math.min(min, candle[parsing["open"]]);
            min = Math.min(min, candle[parsing["close"]]);
            min = Math.min(min, candle[parsing["high"]]);
            min = Math.min(min, candle[parsing["low"]]);

            max = Math.max(max, candle[parsing["open"]]);
            max = Math.max(max, candle[parsing["close"]]);
            max = Math.max(max, candle[parsing["high"]]);
            max = Math.max(max, candle[parsing["low"]]);

            volumeMin = Math.min(volumeMin, candle[parsing["volume"]]);
            volumeMax = Math.max(volumeMax, candle[parsing["volume"]]);
        });

        const jThis = this;
        const candlesNormalized = [];
        candles.forEach(function(candle) {
            candlesNormalized.push({
                timePercent: jThis.normalizeValue(candle[parsing["ts"]], timeMin, timeMax),
                openPercent: jThis.normalizeValue(candle[parsing["open"]], min, max),
                closePercent: jThis.normalizeValue(candle[parsing["close"]], min, max),
                highPercent: jThis.normalizeValue(candle[parsing["high"]], min, max),
                lowPercent: jThis.normalizeValue(candle[parsing["low"]], min, max),
                volumePercent: jThis.normalizeValue(candle[parsing["volume"]], volumeMin, volumeMax)
            });
        });

        this.log("getCandlesNormalized", candlesNormalized);
        return candlesNormalized;
    },
    normalizeValue: function(value, min, max) {
        return (value-min)/(max-min);
    },

    convertValue: async function(value, pair, toCurrency) {
        const result = {
            "value": value,
            "pair": pair
        }

        if (pair.indexOf("USD")>=0 && toCurrency && toCurrency!="USD") {
            const rates = await this.getRates();
            if (toCurrency in rates.rates || toCurrency==rates.base) {
                // Convert the value to the base
                const base = rates.base;
                const rate = rates.rates["USD"];
                value = value / rate;

                // Convert the base to the currency
                if (toCurrency!=base) {
                    const toRate = rates.rates[toCurrency];
                    value = value * toRate;
                }

                result.value = value;
                result.pair = pair.replace("USD", toCurrency);
            }
        }
        return result;
    },
    getRates: async function() {
        const now = new Date().getTime();
        if (rates==null || ratesUpdate<=now-3600*1000) {
            ratesUpdate = now;
            rates = await this.updateRates();
        }

        // Could potentially return outdated rates in case an update is in progress, but doesn't matter much
        // as everything will be updated once the update completes
        return rates;
    },
    updateRates: async function() {
        const response = await fetch("https://api.exchangeratesapi.io/latest");
        const responseJson = await response.json();
        this.log("updateRates", responseJson);

        return responseJson;
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
            //this.log("Received settings",settings);
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