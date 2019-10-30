var DestinationEnum = Object.freeze({
    "HARDWARE_AND_SOFTWARE": 0,
    "HARDWARE_ONLY": 1,
    "SOFTWARE_ONLY": 2
});

var websocket = null;
var pluginUUID = null;
var timer;
var canvas;
var canvasContext;

var tickerAction = {
    type: "com.courcelle.cryptoticker.ticker",
    onKeyDown: function (context, settings, coordinates, userDesiredState) {

    },
    onKeyUp: function (context, settings, coordinates, userDesiredState) {
        this.updateTicker(context, settings);
        this.refreshTimer(context, settings);
    },
    onWillAppear: function (context, settings, coordinates) {
        this.initCanvas();

        this.updateTicker(context, settings);
        this.refreshTimer(context, settings);
    },
    refreshTimer: function(context, settings) {
        if (timer!=null) {
            clearInterval(timer);
        }

        const jThis = this;
        timer = setInterval(function() {
            jThis.updateTicker(context, settings);
        }, 60000);
    },

    updateTicker: async function(context, settings) {
        const pair = settings.pair || "BTCUSD";
        const values = await this.getTickerValue(pair);

        //console.log(values);
        this.updateCanvas(context, settings, pair, values);
    },
    initCanvas: function() {
        canvas = document.getElementById("ticker");
        canvasContext = canvas.getContext("2d");
    },
    updateCanvas: function(context, settings, pair, values) {
        const multiplier = settings.multiplier || 1;
        const digits = settings.digits || 2;

        canvasContext.fillStyle = "#000000";
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        var font = "'Roboto Condensed',Helvetica,Calibri,sans-serif"
        canvasContext.font = "25px "+font;
        canvasContext.fillStyle = "white";

        canvasContext.textAlign = "left";
        canvasContext.fillText(pair, 10, 25);

        canvasContext.font = "bold 35px "+font;
        canvasContext.fillText(this.getRoundedValue(values.last, digits, multiplier), 10, 60);

        canvasContext.font = "25px "+font;
        canvasContext.fillText(this.getRoundedValue(values.low, digits, multiplier), 20, 110);

        canvasContext.textAlign = "right";
        canvasContext.fillText(this.getRoundedValue(values.high, digits, multiplier), 124, 135);

        // console.log(canvas.toDataURL("image/png"));
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

        return Math.round(value*multiplier*digitPow)/digitPow;
    },

    getTickerValue: async function(pair) {
        const response = await fetch("https://api-pub.bitfinex.com/v2/ticker/t"+pair);
        const responseJson = await response.json();
        //console.log(responseJson);
        return {
            "last": responseJson[6],
            "high": responseJson[8],
            "low": responseJson[9],
        };
    }
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
};