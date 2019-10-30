// this is our global websocket, used to communicate from/to Stream Deck software
// and some info about our plugin, as sent by Stream Deck software
var websocket = null,
    uuid = null,
    actionInfo = {},
    inInfo = {},
    runningApps = [],
    settings = {},
    isQT = navigator.appVersion.includes('QtWebEngine'),
    onchangeevt = 'onchange'; // 'oninput'; // change this, if you want interactive elements act on any change, or while they're modified


let currentPair = "BTCUSD";
let currentMultiplier = 1;
let currentDigits = 2;
const pairsDropDown = document.getElementById("select-pair");
const multiplierInput = document.getElementById("multiplier");
const digitsInput = document.getElementById("digits");
let pi = {
    initDom: function() {
        this.initPairsDropDown();

        var jThis = this;
        var callback = function() {
            jThis.checkNewSettings();
        }
        pairsDropDown.onchange = callback;
        multiplierInput.onchange = callback;
        multiplierInput.onkeyup = callback;
        digitsInput.onchange = callback;
        digitsInput.onkeyup = callback;
    },
    initPairsDropDown: async function () {
        const pairs = await this.getPairs();
        //console.log(pairs);

        pairs.forEach(function (pair) {
            var option = document.createElement("option");
            option.text = pair;
            option.value = pair;
            pairsDropDown.add(option);
        });

        this.refreshValues();
    },
    getPairs: async function () {
        const response = await fetch("https://api-pub.bitfinex.com/v2/conf/pub:list:pair:exchange");
        const responseJson = await response.json();

        return responseJson[0];
    },
    extractSettings: function(settings) {
        currentPair = settings["pair"] || currentPair;
        currentMultiplier = settings["multiplier"] || currentMultiplier;
        currentDigits = settings["digits"] || currentDigits;
    },
    checkNewSettings: function() {
        currentPair = pairsDropDown.value;
        currentMultiplier = multiplierInput.value;
        currentDigits = digitsInput.value;

        this.saveSettings();
    },
    refreshValues: function() {
        pairsDropDown.value = currentPair;
        multiplierInput.value = currentMultiplier;
        digitsInput.value = currentDigits;
    },
    saveSettings: function() {
        const newSettings = {
            "pair": currentPair,
            "multiplier": currentMultiplier,
            "digits": currentDigits,
        };
        //console.log(newSettings);

        if (websocket && (websocket.readyState === 1)) {
            const jsonSetSettings = {
                "event": "setSettings",
                "context": uuid,
                "payload": newSettings
            };
            websocket.send(JSON.stringify(jsonSetSettings));

            const jsonPlugin = {
                "action": actionInfo["action"],
                "event": "sendToPlugin",
                "context": uuid,
                "payload": newSettings
            };
            websocket.send(JSON.stringify(jsonPlugin));
        }
    }
}

pi.initDom();

function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
    uuid = inUUID;
    // please note: the incoming arguments are of type STRING, so
    // in case of the inActionInfo, we must parse it into JSON first
    actionInfo = JSON.parse(inActionInfo); // cache the info
    inInfo = JSON.parse(inInfo);
    websocket = new WebSocket('ws://127.0.0.1:' + inPort);

    /** let's see, if we have some settings */
    pi.extractSettings(actionInfo.payload.settings);
    console.log(actionInfo.payload.settings);

    // if connection was established, the websocket sends
    // an 'onopen' event, where we need to register our PI
    websocket.onopen = function () {
        var json = {
            event: inRegisterEvent,
            uuid: inUUID
        };
        // register property inspector to Stream Deck
        websocket.send(JSON.stringify(json));
    };

    websocket.onmessage = function (evt) {
        // Received message from Stream Deck
        var jsonObj = JSON.parse(evt.data);
        var event = jsonObj['event'];
        console.log("Received message", jsonObj);
    };
}