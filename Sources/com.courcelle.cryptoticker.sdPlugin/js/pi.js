// this is our global websocket, used to communicate from/to Stream Deck software
// and some info about our plugin, as sent by Stream Deck software
var websocket = null,
    uuid = null,
    actionInfo = {},
    inInfo = {};

const loggingEnabled = false;
const selectPairDropdown = document.getElementById("select-pair-dropdown");
const settingsConfig = {
    "title": {
        "default": "",
        "value": document.getElementById("input-title")
    },
    "exchange": {
        "default": "BITFINEX",
        "value": document.getElementById("select-provider")
    },
    "pair": {
        "default": "BTCUSD",
        "value": document.getElementById("select-pair"),
        "setValue": function(val) {
            this.value.value = val;
            selectPairDropdown.value = val;
        }
    },
    "fromCurrency": {
        "default": "USD"
    },
    "currency": {
        "default": "",
        "value": document.getElementById("select-currency")
    },
    "candlesInterval": {
        "default": "1h",
        "value": document.getElementById("candlesInterval")
    },
    "multiplier": {
        "default": 1,
        "value": document.getElementById("multiplier")
    },
    "digits": {
        "default": 2,
        "value": document.getElementById("digits")
    },
    "font": {
        "default": "Lato,'Roboto Condensed',Helvetica,Calibri,sans-serif",
        "value": document.getElementById("font")
    },
    "backgroundColor": {
        "default": "#000000",
        "value": document.getElementById("backgroundColor")
    },
    "textColor": {
        "default": "#ffffff",
        "value": document.getElementById("textColor")
    },
    "displayHighLow": {
        "default": "on",
        "value": document.getElementById("displayHighLow"),
        "getValue": function() {
            return this.value.checked?"on":"off";
        },
        "setValue": function(val) {
            this.value.checked = (val!="off");
        }
    },
    "displayHighLowBar": {
        "default": "on",
        "value": document.getElementById("displayHighLowBar"),
        "getValue": function() {
            return this.value.checked?"on":"off";
        },
        "setValue": function(val) {
            this.value.checked = (val!="off");
        }
    },
    "displayDailyChange": {
        "default": "on",
        "value": document.getElementById("displayDailyChange"),
        "getValue": function() {
            return this.value.checked?"on":"off";
        },
        "setValue": function(val) {
            this.value.checked = (val!="off");
        }
    },
    "alertRule": {
        "default": "",
        "value": document.getElementById("alertRule")
    },
    "backgroundColorRule": {
        "default": "",
        "value": document.getElementById("backgroundColorRule")
    },
    "textColorRule": {
        "default": "",
        "value": document.getElementById("textColorRule")
    },
    "mode": {
        "default": "ticker"
    },
};

const currentSettings = {};
const cache = {};

const currencyRelatedElements = document.getElementsByClassName("currencyRelated");

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

        for(const k in settingsConfig) {
            const setting = settingsConfig[k];
            if (setting["value"]) {
                setting["value"].onchange = callback;
                setting["value"].onkeyup = callback;
            }
        }
    },
    initPairsDropDown: async function () {
        const exchangeDropdown = settingsConfig["exchange"]["value"];
        const providers = await this.getProviders();
        providers.sort();
        providers.forEach(function (provider) {
            var option = document.createElement("option");
            option.text = provider;
            option.value = provider;
            exchangeDropdown.add(option);
        });
        exchangeDropdown.value = currentSettings["exchange"];

        const thisTmp = this;
        const updatePairs = async function() {
            // Whenever the exchange changes, we need to update supported pairs
            // Remove existing options
            thisTmp.removeAllOptions(selectPairDropdown);

            const provider = exchangeDropdown.value;
            const pairs = await thisTmp.getPairs(provider);
            pairs.sort(function(a,b) {
                const aP = a["symbol"], bP = b["symbol"];
                if (aP > bP) {
                    return 1;
                } else if (aP < bP) {
                    return -1;
                }

                return 0;
            });

            // Add an empty option
            const emptyOption = document.createElement("option");
            emptyOption.text = "";
            emptyOption.value = "";
            selectPairDropdown.add(emptyOption);

            pairs.forEach(function (pair) {
                const option = document.createElement("option");
                option.text = pair["symbol"];
                option.value = pair["symbol"];
                selectPairDropdown.add(option);
            });
            selectPairDropdown.value = currentSettings["pair"];

            const pairsDropdownGroup = document.getElementById("select-pair-dropdown-group");
            const pairsInputGroup = document.getElementById("select-pair-input-group");
            if (pairs.length>0) {
                pairsDropdownGroup.style.display = "";
                pairsInputGroup.style.display = "none";
            } else {
                pairsDropdownGroup.style.display = "none";
                pairsInputGroup.style.display = "";
            }

            selectPairDropdown.value = currentSettings["pair"];
        };

        const originalCallback = exchangeDropdown.onchange;
        exchangeDropdown.onchange = function() {
            originalCallback();
            updatePairs();
            thisTmp.checkNewSettings();
        };

        selectPairDropdown.onchange = function() {
            const pairInput = settingsConfig["pair"]["value"];
            pairInput.value = selectPairDropdown.value;
            pairInput.onchange();
        };

        updatePairs();
        this.refreshValues();
    },
    getProviders: async function() {
        const cacheKey = "getProviders";
        if (cache[cacheKey]) {
            return cache[cacheKey];
        }

        const response = await fetch("https://tproxy.opendle.com/api/Ticker/json/providers");
        const responseJson = await response.json();
        this.log("getProviders", responseJson);

        cache[cacheKey] = responseJson;
        return responseJson;
    },
    getPairs: async function (provider) {
        const cacheKey = "getPairs_"+provider;
        if (cache[cacheKey]) {
            return cache[cacheKey];
        }

        const response = await fetch("https://tproxy.opendle.com/api/Ticker/json/symbols?provider="+provider);
        const responseJson = await response.json();
        this.log("getPairs", responseJson);

        cache[cacheKey] = responseJson;
        return responseJson;
    },
    initCurrenciesDropDown: async function () {
        const currencies = await this.getCurrencies();
        this.log("initCurrenciesDropDown", currencies);

        // const fromCurrencyDropDown = settingsConfig["fromCurrency"]["value"];
        const toCurrencyDropDown = settingsConfig["currency"]["value"];

        currencies.sort();
        currencies.forEach(function (currency) {
            var option = document.createElement("option");
            option.text = currency;
            option.value = currency;
            // fromCurrencyDropDown.add(option);
            toCurrencyDropDown.add(option);
        });

        this.refreshValues();
    },
    getCurrencies: async function() {
        const cacheKey = "getCurrencies";
        if (cache[cacheKey]) {
            return cache[cacheKey];
        }

        const response = await fetch("https://tproxy.opendle.com/api/Ticker/json/currencies");
        const responseJson = await response.json();
        this.log("getCurrencies", responseJson);

        cache[cacheKey] = responseJson;
        return responseJson;

    },
    removeAllOptions: function(selectElement) {
        var i, L = selectElement.options.length - 1;
        for(i = L; i >= 0; i--) {
           selectElement.remove(i);
        }
    },
    extractSettings: function(settings) {
        this.log("extractSettings", settings);

        // Backward compatibility, to remove at some point
        const pairElements = this.splitPairValue(settings["pair"]);
        if (pairElements) {
            for (k in pairElements) {
                settings[k] = pairElements[k];
            }
        }
        //

        for (const k in settingsConfig) {
            currentSettings[k] = settings[k] || settingsConfig[k]["default"];
        }

        this.refreshValues();
    },
    checkNewSettings: function() {
        this.log("checkNewSettings");

        // Retrieve values from HTML to put them to the current settings
        for (const k in settingsConfig) {
            const settingConfig = settingsConfig[k];
            if (settingConfig["getValue"]) {
                currentSettings[k] = settingConfig["getValue"]() || settingConfig["default"];
            } else if (settingConfig["value"]) {
                currentSettings[k] = settingConfig["value"].value || settingConfig["default"];
            }
        }

        this.saveSettings();
    },
    refreshValues: function() {
        this.log("refreshValues");

        // Set values to the HTML
        for (const k in settingsConfig) {
            const settingConfig = settingsConfig[k];
            if (settingConfig["setValue"]) {
                settingConfig["setValue"](currentSettings[k]);
            } else if (settingConfig["value"]) {
                settingConfig["value"].value = currentSettings[k];
            }
        }

        this.refreshMenus();
    },
    refreshMenus: function() {
        if (currentSettings["pair"].indexOf("USD")>=0) {
            this.applyDisplay(currencyRelatedElements, "block");
        } else {
            this.applyDisplay(currencyRelatedElements, "none");
            settingsConfig["currency"]["value"].value = "USD";
        }
    },
    applyDisplay: function(elements, display) {
        for(i in Object.keys(elements)) {
            elements[i].style.display = display;
         }
    },
    splitPairValue: function(value) {
        if (value && value.indexOf("|")>=0) {
            const elements = value.split("|");

            return {
                "pair": elements[1],
                "exchange": elements[0].toUpperCase()
            }
        }

        return null;
    },
    saveSettings: function() {
        this.log("saveSettings", currentSettings);

        if (websocket && (websocket.readyState === 1)) {
            const jsonSetSettings = {
                "event": "setSettings",
                "context": uuid,
                "payload": currentSettings
            };
            websocket.send(JSON.stringify(jsonSetSettings));

            const jsonPlugin = {
                "action": actionInfo["action"],
                "event": "sendToPlugin",
                "context": uuid,
                "payload": currentSettings
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