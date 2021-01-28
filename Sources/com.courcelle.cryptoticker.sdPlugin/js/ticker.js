var DestinationEnum = Object.freeze({
    "HARDWARE_AND_SOFTWARE": 0,
    "HARDWARE_ONLY": 1,
    "SOFTWARE_ONLY": 2
});

const loggingEnabled = false;
var websocket = null;
var pluginUUID = null;
var canvas;
var canvasContext;
var bitfinexWsByContext = {};

var tickerAction = {
    type: "com.courcelle.cryptoticker.ticker",
    log: function(...data) {
        if (loggingEnabled) {
            console.log(...data);
        }
    },

    onKeyDown: function (context, settings, coordinates, userDesiredState) {
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
    onWillAppear: function (context, settings, coordinates) {
        this.initCanvas();

        this.refreshTimer(context, settings);
        // this.updateTicker(context, settings); // Already done by refreshTimer
    },
    refreshTimers: function() {
        // Make sure everybody is connected
        for (var ctx in bitfinexWsByContext) {
            const currentWs = bitfinexWsByContext[ctx];
            this.refreshTimer(
                currentWs.context,
                currentWs.settings
            );
        }
    },
    refreshTimer: function(context, settings) {
        this.refreshSettings(context, settings);

        const currentWs = this.getCurrentWs(context);

        if (currentWs.pair!=settings.pair || !currentWs.ws || currentWs.ws.readyState>1) {
            this.log("Reopening WS because "+currentWs.pair+"!="+settings.pair+" || "+(currentWs.ws || {}).readyState+">1");
            if (currentWs.ws) {
                currentWs.ws.close();
            }

            const jThis = this;
            currentWs.pair = settings.pair;
            currentWs.ws = new WebSocket("wss://api-pub.bitfinex.com/ws/2");
            currentWs.ws.onmessage = function(msg) {
                //this.log("onmessage", msg);
                if (msg!=null && msg.data!=null) {
                    dataObj = JSON.parse(msg.data);
                    if (Array.isArray(dataObj) && Array.isArray(dataObj[1]) && dataObj[1].length>=10) {
                        //console.log("Data", dataObj);
                        jThis.updateCanvas(
                            currentWs.context,
                            currentWs.settings,
                            jThis.extractValues(dataObj[1])
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
        }

        // Force refresh of the display (in case WebSockets doesn't work and to update the candles)
        this.updateTicker(context, settings);
    },
    refreshSettings: function(context, settings) {
        const currentWs = this.getCurrentWs(context);
        currentWs.context = context;
        currentWs.settings = settings;
    },

    updateTicker: async function(context, settings) {
        const pair = settings.pair || "BTCUSD";
        const values = await this.getTickerValue(pair);
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
        canvasContext.fillText(pair, 10, 25);

        canvasContext.font = "bold 35px "+font;
        canvasContext.fillText(this.getRoundedValue(values.last, digits, multiplier), textPadding, 60);

        if (settings["displayHighLow"]!="off") {
            canvasContext.font = "25px "+font;
            canvasContext.fillText(this.getRoundedValue(values.low, digits, multiplier), textPadding, 90);

            canvasContext.textAlign = "right";
            canvasContext.fillText(this.getRoundedValue(values.high, digits, multiplier), canvasWidth-textPadding, 135);
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

    getTickerValue: async function(pair) {
        // this.log("getTickerValue API call");
        const response = await fetch("https://api-pub.bitfinex.com/v2/ticker/t"+pair);
        const responseJson = await response.json();
        //this.log("getTickerValue", responseJson);
        return this.extractValues(responseJson);
    },
    extractValues: function(rawTicker) {
        this.log("extractValues", rawTicker);

        return {
            "changeDaily": rawTicker[4],
            "changeDailyPercent": rawTicker[5],
            "last": rawTicker[6],
            "volume": rawTicker[7],
            "high": rawTicker[8],
            "low": rawTicker[9],
        };
    },
    getCandles: async function(settings) {
        const pair = settings["pair"] || "BTCUSD";
        const interval = settings["candlesInterval"] || "1h";

        const response = await fetch("https://api-pub.bitfinex.com/v2/candles/trade:"+interval+":t"+pair+"/hist?limit=20");
        const responseJson = await response.json();
        this.log("getCandles", responseJson);

        return this.getCandlesNormalized(responseJson);
    },
    getCandlesNormalized: function(candles) {
        let min = 999999999, max = 0, volumeMin = 999999999, volumeMax = 0, timeMin = 99999999999999999, timeMax = 0;
        candles.forEach(function(candle) {
            timeMin = Math.min(timeMin, candle[0]);
            timeMax = Math.max(timeMax, candle[0]);

            // Some shouldn't be necessary, but doesn't cost much and avoid mistakes
            min = Math.min(min, candle[1]);
            min = Math.min(min, candle[2]);
            min = Math.min(min, candle[3]);
            min = Math.min(min, candle[4]);

            max = Math.max(max, candle[1]);
            max = Math.max(max, candle[2]);
            max = Math.max(max, candle[3]);
            max = Math.max(max, candle[4]);

            volumeMin = Math.min(volumeMin, candle[5]);
            volumeMax = Math.max(volumeMax, candle[5]);
        });

        const jThis = this;
        const candlesNormalized = [];
        candles.forEach(function(candle) {
            candlesNormalized.push({
                timePercent: jThis.normalizeValue(candle[0], timeMin, timeMax),
                openPercent: jThis.normalizeValue(candle[1], min, max),
                closePercent: jThis.normalizeValue(candle[2], min, max),
                highPercent: jThis.normalizeValue(candle[3], min, max),
                lowPercent: jThis.normalizeValue(candle[4], min, max),
                volumePercent: jThis.normalizeValue(candle[5], volumeMin, volumeMax)
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

    websocket.onmessage = function (evt) {
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

    setInterval(function() {
        tickerAction.refreshTimers();
    }, 60000);
};