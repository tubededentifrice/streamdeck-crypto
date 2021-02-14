// this is our global websocket, used to communicate from/to Stream Deck software
// and some info about our plugin, as sent by Stream Deck software
var websocket = null,
    uuid = null,
    actionInfo = {},
    inInfo = {};


let currentPair = "BTCUSD";
let currentExchange = "BITFINEX";
let currentCurrency = "USD";
let currentCandlesInterval = "1h";
let currentMultiplier = 1;
let currentDigits = 2;
let currentFont = "Lato,'Roboto Condensed',Helvetica,Calibri,sans-serif";
let currentBackgroundColor = "#000000";
let currentTextColor = "#ffffff";
let currentDisplayHighLow = "on";
let currentDisplayHighLowBar = "on";
let currentAlertRule = "";
let currentBackgroundColorRule = "";
let currentTextColorRule = "";
let currentMode = "ticker";

const loggingEnabled = false;
const pairsDropDown = document.getElementById("select-pair");
const currencyRelatedElements = document.getElementsByClassName("currencyRelated");
const currenciesDropDown = document.getElementById("select-currency");
const candlesIntervalDropDown = document.getElementById("candlesInterval");
const multiplierInput = document.getElementById("multiplier");
const digitsInput = document.getElementById("digits");
const fontInput = document.getElementById("font");
const backgroundColorInput = document.getElementById("backgroundColor");
const textColorInput = document.getElementById("textColor");
const highLowCheck = document.getElementById("displayHighLow");
const highLowBarCheck = document.getElementById("displayHighLowBar");
const alertRuleInput = document.getElementById("alertRule");
const backgroundColorRuleInput = document.getElementById("backgroundColorRule");
const textColorRuleInput = document.getElementById("textColorRule");

let pi = {
    log: function(...data) {
        if (loggingEnabled) {
            console.log(...data);
        }
    },

    initDom: function() {
        this.initPairsDropDown();
        this.initCurrenciesDropDown();

        const jThis = this;
        const callback = function() {
            jThis.checkNewSettings();
            jThis.refreshMenus();
        }
        pairsDropDown.onchange = callback;
        currenciesDropDown.onchange = callback;
        candlesIntervalDropDown.onchange = callback;

        multiplierInput.onchange = callback;
        multiplierInput.onkeyup = callback;

        digitsInput.onchange = callback;
        digitsInput.onkeyup = callback;

        fontInput.onchange = callback;
        fontInput.onkeyup = callback;

        backgroundColorInput.onchange = callback;
        textColorInput.onchange = callback;

        highLowCheck.onchange = callback;
        highLowBarCheck.onchange = callback;

        alertRuleInput.onchange = callback;
        alertRuleInput.onkeyup = callback;

        backgroundColorRuleInput.onchange = callback;
        backgroundColorRuleInput.onkeyup = callback;

        textColorRuleInput.onchange = callback;
        textColorRuleInput.onkeyup = callback;
    },
    initPairsDropDown: async function () {
        const pairs = await this.getPairs();
        this.log("initPairsDropDown", pairs);

        pairs.sort(function(a,b) {
            const aP = a["pair"], bP = b["pair"];
            if (aP > bP) {
                return 1;
            } else if (aP < bP) {
                return -1;
            }

            const aE = a["exchange"], bE = b["exchange"];
            if (aE > bE) {
                return 1;
            } else if (aE < bE) {
                return -1;
            }

            return 0;
        });

        const jThis = this;
        pairs.forEach(function (pair) {
            var option = document.createElement("option");
            option.text = pair["pair"].padEnd(20," ") + " " + pair["exchange"];
            option.value = jThis.joinPairValue(pair["pair"], pair["exchange"]);
            pairsDropDown.add(option);
        });

        this.refreshValues();
    },
    getPairs: async function () {
        const pairsBinance = await this.getPairsBinance();
        const pairsBitfinex = await this.getPairsBitfinex();
        pairs = [];

        pairs.push(...pairsBinance);
        pairs.push(...pairsBitfinex);

        return pairs;
    },
    getPairsBinance: async function () {
        const response = await fetch("https://binance.com/api/v3/exchangeInfo");
        const responseJson = await response.json();
        const symbols = responseJson["symbols"];
        this.log("getPairsBinance", responseJson);

        pairs = [];
        for (let symbol in symbols) {
            pairs.push({
                "pair": symbols[symbol]["symbol"],
                "exchange": "Binance"
            });
        }

        return pairs;
    },
    getPairsBitfinex: async function () {
        const response = await fetch("https://api-pub.bitfinex.com/v2/conf/pub:list:pair:exchange");
        const responseJson = await response.json();
        this.log("getPairsBitfinex", responseJson);

        pairs = [];
        for (let pair in responseJson[0]) {
            pairs.push({
                "pair": responseJson[0][pair],
                "exchange": "Bitfinex"
            });
        }

        return pairs;
    },
    initCurrenciesDropDown: async function () {
        const currencies = await this.getCurrencies();
        this.log("initCurrenciesDropDown", currencies);
        currencies.sort();
        currencies.forEach(function (currency) {
            var option = document.createElement("option");
            option.text = currency;
            option.value = currency;
            currenciesDropDown.add(option);
        });

        this.refreshValues();
    },
    getCurrencies: async function() {
        const response = await fetch("https://api.exchangeratesapi.io/latest");
        const responseJson = await response.json();
        this.log("getCurrencies", responseJson);

        currencies =  new Set(Object.keys(responseJson["rates"]));
        currencies.add(responseJson["base"]);

        return Array.from(currencies);

    },
    extractSettings: function(settings) {
        this.log("extractSettings", settings);

        currentPair = settings["pair"] || currentPair;
        currentExchange = settings["exchange"] || currentExchange;
        currentCurrency = settings["currency"] || currentCurrency;
        currentCandlesInterval = settings["candlesInterval"] || currentCandlesInterval;
        currentMultiplier = settings["multiplier"] || currentMultiplier;
        currentDigits = settings["digits"] || currentDigits;
        currentFont = settings["font"] || currentFont;
        currentBackgroundColor = settings["backgroundColor"] || currentBackgroundColor;
        currentTextColor = settings["textColor"] || currentTextColor;
        currentDisplayHighLow = settings["displayHighLow"] || currentDisplayHighLow;
        currentDisplayHighLowBar = settings["displayHighLowBar"] || currentDisplayHighLowBar;
        currentAlertRule = settings["alertRule"] || currentAlertRule;
        currentBackgroundColorRule = settings["backgroundColorRule"] || currentBackgroundColorRule;
        currentTextColorRule = settings["textColorRule"] || currentTextColorRule;
        currentMode = settings["mode"] || currentMode;

        this.refreshValues();
    },
    checkNewSettings: function() {
        this.log("checkNewSettings");
        const pairElements = this.splitPairValue(pairsDropDown.value);

        currentPair = pairElements["pair"];
        currentExchange = pairElements["exchange"];
        currentCurrency = currenciesDropDown.value;
        currentCandlesInterval = candlesIntervalDropDown.value;
        currentMultiplier = multiplierInput.value;
        currentDigits = digitsInput.value;
        currentFont = fontInput.value;
        currentBackgroundColor = backgroundColorInput.value;
        currentTextColor = textColorInput.value;
        currentDisplayHighLow = highLowCheck.checked?"on":"off";
        currentDisplayHighLowBar = highLowBarCheck.checked?"on":"off";
        currentAlertRule = alertRuleInput.value;
        currentBackgroundColorRule = backgroundColorRuleInput.value;
        currentTextColorRule = textColorRuleInput.value;

        this.saveSettings();
    },
    refreshValues: function() {
        this.log("refreshValues");
        pairsDropDown.value = this.joinPairValue(currentPair, currentExchange);
        currenciesDropDown.value = currentCurrency;
        candlesIntervalDropDown.value = currentCandlesInterval;
        multiplierInput.value = currentMultiplier;
        digitsInput.value = currentDigits;
        fontInput.value = currentFont;
        backgroundColorInput.value = currentBackgroundColor;
        textColorInput.value = currentTextColor;

        highLowCheck.checked = currentDisplayHighLow!="off";
        highLowBarCheck.checked = currentDisplayHighLowBar!="off";

        alertRuleInput.value = currentAlertRule;
        backgroundColorRuleInput.value = currentBackgroundColorRule;
        textColorRuleInput.value = currentTextColorRule;

        this.refreshMenus();
    },
    refreshMenus: function() {
        if (currentPair.indexOf("USD")>=0) {
            this.applyDisplay(currencyRelatedElements, "block");
        } else {
            this.applyDisplay(currencyRelatedElements, "none");
        }
    },
    applyDisplay: function(elements, display) {
        for(i in Object.keys(elements)) {
            elements[i].style.display = display;
         }
    },
    joinPairValue: function(pair, exchange) {
        return exchange + "|" + pair;
    },
    splitPairValue: function(value) {
        if (value.indexOf("|")>=0) {
            const elements = value.split("|");

            return {
                "pair": elements[1],
                "exchange": elements[0].toUpperCase()
            }
        }

        return {
            "pair": value,
            "exchange": "BITFINEX"
        }
    },
    saveSettings: function() {
        const newSettings = {
            "pair": currentPair,
            "exchange": currentExchange,
            "currency": currentCurrency,
            "candlesInterval": currentCandlesInterval,
            "multiplier": currentMultiplier,
            "digits": currentDigits,
            "font": currentFont,
            "backgroundColor": currentBackgroundColor,
            "textColor": currentTextColor,
            "displayHighLow": currentDisplayHighLow,
            "displayHighLowBar": currentDisplayHighLowBar,
            "alertRule": currentAlertRule,
            "backgroundColorRule": currentBackgroundColorRule,
            "textColorRule": currentTextColorRule,
            "mode": currentMode,
        };
        this.log("saveSettings", newSettings);

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
    // console.log(actionInfo.payload.settings);

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
        // console.log("Received message", jsonObj);
    };
}