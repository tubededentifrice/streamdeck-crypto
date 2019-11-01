var DestinationEnum = Object.freeze({
    "HARDWARE_AND_SOFTWARE": 0,
    "HARDWARE_ONLY": 1,
    "SOFTWARE_ONLY": 2
});

var websocket = null;
var pluginUUID = null;
var canvas;
var canvasContext;
var bitfinexWsByContext = {};

var tickerAction = {
    type: "com.courcelle.cryptoticker.ticker",
    onKeyDown: function (context, settings, coordinates, userDesiredState) {

    },
    onKeyUp: function (context, settings, coordinates, userDesiredState) {
        this.refreshTimer(context, settings);
        this.updateTicker(context, settings);
    },
    onWillAppear: function (context, settings, coordinates) {
        this.initCanvas();

        this.refreshTimer(context, settings);
        this.updateTicker(context, settings);
    },
    refreshTimers: function() {
        // Make sure everybody is connected
        for (var ctx in bitfinexWsByContext) {
            var currentWs = bitfinexWsByContext[ctx];
            this.refreshTimer(
                currentWs.context,
                currentWs.settings
            );
        }
    },
    refreshTimer: function(context, settings) {
        this.refreshSettings(context, settings);

        var currentWs = bitfinexWsByContext[context] || {};
        bitfinexWsByContext[context] = currentWs;

        if (currentWs.pair!=settings.pair || currentWs.ws.readyState>1) {
            console.log("Reopening WS because "+currentWs.pair+"!="+settings.pair+" || "+(currentWs.ws || {}).readyState+">1");
            if (currentWs.ws) {
                currentWs.ws.close();
            }

            const jThis = this;
            currentWs.pair = settings.pair;
            currentWs.ws = new WebSocket("wss://api-pub.bitfinex.com/ws/2");
            currentWs.ws.onmessage = function(msg) {
                //console.log(msg);
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
    },
    refreshSettings: function(context, settings) {
        var currentWs = bitfinexWsByContext[context] || {};
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
    updateCanvas: function(context, settings, values) {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const textPadding = 10;

        const pair = settings.pair || "";
        const multiplier = settings.multiplier || 1;
        const digits = settings.digits || 2;
        let backgroundColor = settings.backgroundColor || "#000000";
        let textColor = settings.textColor || "#ffffff";
        //console.log(settings);
        console.log(new Date()+" "+pair+" => "+values.last);

        if (settings.alertRule) {
            const value = values.last;
            if (eval(settings.alertRule)) {
                const tmp = backgroundColor;
                backgroundColor = textColor;
                textColor = tmp;
            }
        }

        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.fillStyle = backgroundColor;
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);

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

        //console.log(canvas.toDataURL("image/png"));
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
        const response = await fetch("https://api-pub.bitfinex.com/v2/ticker/t"+pair);
        const responseJson = await response.json();
        //console.log(responseJson);
        return this.extractValues(responseJson);
    },
    extractValues: function(rawTicker) {
        return {
            "last": rawTicker[6],
            "high": rawTicker[8],
            "low": rawTicker[9],
        };
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
        //console.log("Message received", evt);

        // Received message from Stream Deck
        var jsonObj = JSON.parse(evt.data);
        var event = jsonObj['event'];
        var action = jsonObj['action'];
        var context = jsonObj['context'];

        var jsonPayload = jsonObj['payload'] || {};
        var settings = jsonPayload['settings'];
        var coordinates = jsonPayload['coordinates'];
        var userDesiredState = jsonPayload['userDesiredState'];



        if (settings!=null) {
            //console.log("Received settings",settings);
            tickerAction.refreshSettings(context, settings);
            tickerAction.refreshTimer(context, settings);
            tickerAction.updateTicker(context, settings);
        }

        if (event == "keyDown") {
            tickerAction.onKeyDown(context, settings, coordinates, userDesiredState);
        } else if (event == "keyUp") {
            tickerAction.onKeyUp(context, settings, coordinates, userDesiredState);
        } else if (event == "willAppear") {
            tickerAction.onWillAppear(context, settings, coordinates);
        }
    };

    websocket.onclose = function () {
        // Websocket is closed
    };

    setInterval(function() {
        tickerAction.refreshTimers();
    }, 60000);
};