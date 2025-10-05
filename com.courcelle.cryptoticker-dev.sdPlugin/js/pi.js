// this is our global websocket, used to communicate from/to Stream Deck software
// and some info about our plugin, as sent by Stream Deck software
var websocket = null,
    uuid = null,
    actionInfo = {},
    inInfo = {};


const tProxyBase = "https://tproxyv8.opendle.com";
// const tProxyBase = "https://localhost:44330";

const loggingEnabled = false;
const selectPairDropdown = document.getElementById("select-pair-dropdown");
const defaultSettingsModule = typeof CryptoTickerDefaults !== "undefined" ? CryptoTickerDefaults : null;

function ensureDefaultSettingsModule() {
    if (!defaultSettingsModule) {
        throw new Error("Default settings module is not available");
    }
    return defaultSettingsModule;
}

function applyDefaultSettings(partialSettings) {
    const moduleRef = ensureDefaultSettingsModule();
    if (typeof moduleRef.applyDefaults === "function") {
        return moduleRef.applyDefaults(partialSettings);
    }
    if (moduleRef.defaultSettings) {
        return Object.assign({}, moduleRef.defaultSettings, partialSettings || {});
    }
    return Object.assign({}, partialSettings || {});
}

function getDefaultSettingsSnapshot() {
    const moduleRef = ensureDefaultSettingsModule();
    if (typeof moduleRef.getDefaultSettings === "function") {
        return moduleRef.getDefaultSettings();
    }
    if (moduleRef.defaultSettings) {
        return JSON.parse(JSON.stringify(moduleRef.defaultSettings));
    }
    return {};
}

const defaultSettings = getDefaultSettingsSnapshot();
const settingsConfig = {
    "title": {
        "default": defaultSettings.title,
        "value": document.getElementById("input-title")
    },
    "exchange": {
        "default": defaultSettings.exchange,
        "value": document.getElementById("select-provider")
    },
    "pair": {
        "default": defaultSettings.pair,
        "value": document.getElementById("select-pair"),
        "setValue": function(val) {
            this.value.value = val;
            selectPairDropdown.value = val;
        }
    },
    "fromCurrency": {
        "default": defaultSettings.fromCurrency
    },
    "currency": {
        "default": defaultSettings.currency,
        "value": document.getElementById("select-currency")
    },
    "candlesInterval": {
        "default": defaultSettings.candlesInterval,
        "value": document.getElementById("candlesInterval")
    },
    "candlesDisplayed": {
        "default": defaultSettings.candlesDisplayed,
        "value": document.getElementById("candlesDisplayed")
    },
    "multiplier": {
        "default": defaultSettings.multiplier,
        "value": document.getElementById("multiplier")
    },
    "digits": {
        "default": defaultSettings.digits,
        "value": document.getElementById("digits")
    },
    "highLowDigits": {
        "default": defaultSettings.highLowDigits,
        "value": document.getElementById("highLowDigits")
    },
    "priceFormat": {
        "default": defaultSettings.priceFormat,
        "value": document.getElementById("priceFormat")
    },
    "font": {
        "default": defaultSettings.font,
        "value": document.getElementById("font")
    },
    "fontSizeBase": {
        "default": defaultSettings.fontSizeBase,
        "value": document.getElementById("fontSizeBase")
    },
    "fontSizePrice": {
        "default": defaultSettings.fontSizePrice,
        "value": document.getElementById("fontSizePrice")
    },
    "fontSizeHighLow": {
        "default": defaultSettings.fontSizeHighLow,
        "value": document.getElementById("fontSizeHighLow")
    },
    "fontSizeChange": {
        "default": defaultSettings.fontSizeChange,
        "value": document.getElementById("fontSizeChange")
    },
    "backgroundColor": {
        "default": defaultSettings.backgroundColor,
        "value": document.getElementById("backgroundColor")
    },
    "textColor": {
        "default": defaultSettings.textColor,
        "value": document.getElementById("textColor")
    },
    "displayHighLow": {
        "default": defaultSettings.displayHighLow,
        "value": document.getElementById("displayHighLow"),
        "getValue": function() {
            return this.value.checked ? "on" : "off";
        },
        "setValue": function(val) {
            this.value.checked = (val !== "off");
        }
    },
    "displayHighLowBar": {
        "default": defaultSettings.displayHighLowBar,
        "value": document.getElementById("displayHighLowBar"),
        "getValue": function() {
            return this.value.checked ? "on" : "off";
        },
        "setValue": function(val) {
            this.value.checked = (val !== "off");
        }
    },
    "displayDailyChange": {
        "default": defaultSettings.displayDailyChange,
        "value": document.getElementById("displayDailyChange"),
        "getValue": function() {
            return this.value.checked ? "on" : "off";
        },
        "setValue": function(val) {
            this.value.checked = (val !== "off");
        }
    },
    "displayConnectionStatusIcon": {
        "default": defaultSettings.displayConnectionStatusIcon,
        "value": document.getElementById("displayConnectionStatusIcon"),
        "getValue": function() {
            return (this.value.value || defaultSettings.displayConnectionStatusIcon).toUpperCase();
        },
        "setValue": function(val) {
            const normalized = (val || defaultSettings.displayConnectionStatusIcon).toUpperCase();
            this.value.value = normalized;
        }
    },
    "alertRule": {
        "default": defaultSettings.alertRule,
        "value": document.getElementById("alertRule")
    },
    "backgroundColorRule": {
        "default": defaultSettings.backgroundColorRule,
        "value": document.getElementById("backgroundColorRule")
    },
    "textColorRule": {
        "default": defaultSettings.textColorRule,
        "value": document.getElementById("textColorRule")
    },
    "mode": {
        "default": defaultSettings.mode
    }
};

const currentSettings = applyDefaultSettings({});
const cache = {};
let lastDisplayedExchange = null;

const currencyRelatedElements = document.getElementsByClassName("currencyRelated");

function setCurrentSettings(values) {
    const sanitized = applyDefaultSettings(values || {});
    for (const key in currentSettings) {
        if (Object.prototype.hasOwnProperty.call(currentSettings, key)) {
            delete currentSettings[key];
        }
    }
    Object.assign(currentSettings, sanitized);
    return currentSettings;
}

const pi = {
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

        if (exchangeDropdown.options.length <= 0) {
            const providers = await this.getProviders();
            providers.sort();
            providers.forEach(function (provider) {
                var option = document.createElement("option");
                option.text = provider;
                option.value = provider;
                exchangeDropdown.add(option);
            });
            exchangeDropdown.value = currentSettings["exchange"] || settingsConfig["exchange"]["default"];
        }

        const thisTmp = this;
        const updatePairs = async function() {
            // Whenever the exchange changes, we need to update supported pairs
            // Remove existing options
            const provider = exchangeDropdown.value;
            const pairs = await thisTmp.getPairs(provider);
            if ((exchangeDropdown.value || "").toUpperCase() !== (provider || "").toUpperCase()) {
                return;
            }
            thisTmp.removeAllOptions(selectPairDropdown);
            pairs.sort(function(a,b) {
                const aP = a["display"] || a["symbol"];
                const bP = b["display"] || b["symbol"];
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
                const value = pair["value"];
                const display = pair["display"] || value;
                option.text = display;
                option.value = value;
                selectPairDropdown.add(option);
            });
            const savedPair = (currentSettings["pair"] || "").toUpperCase();
            selectPairDropdown.value = savedPair;
            if (selectPairDropdown.value !== savedPair) {
                const match = pairs.find(function (pair) {
                    return (pair["value"] || "").toUpperCase() === savedPair || (pair["symbol"] || "").toUpperCase() === savedPair;
                });
                if (match) {
                    selectPairDropdown.value = (match["value"] || match["symbol"] || "");
                }
            }

            selectPairDropdown.value = selectPairDropdown.value || savedPair;

            const hasPairs = pairs.length > 0;
            const dropdownGroup = document.getElementById("select-pair-dropdown-group");
            if (dropdownGroup) {
                dropdownGroup.style.display = hasPairs ? "" : "none";
            }
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

        const initialExchange = currentSettings["exchange"] || exchangeDropdown.value || settingsConfig["exchange"]["default"];
        exchangeDropdown.value = initialExchange;
        lastDisplayedExchange = initialExchange;
        await updatePairs();
        this.refreshValues();
    },
    getProviders: async function() {
        const cacheKey = "getProviders";
        if (cache[cacheKey]) {
            return cache[cacheKey];
        }

        const response = await fetch(tProxyBase + "/api/Ticker/json/providers");
        const responseJson = await response.json();
        this.log("getProviders", responseJson);

        cache[cacheKey] = responseJson;
        return responseJson;
    },
    getPairs: async function (provider) {
        const cacheKey = "getPairs_" + provider;
        if (cache[cacheKey]) {
            return cache[cacheKey];
        }

        let pairs = null;

        const providerModule = this.resolveProviderModule(provider);

        if (providerModule && typeof providerModule.getPairs === "function") {
            try {
                pairs = await providerModule.getPairs();
            } catch (err) {
                this.log("Error fetching direct pairs", err);
                pairs = null;
            }
        }

        if (!Array.isArray(pairs) || pairs.length === 0) {
            try {
                const response = await fetch(tProxyBase + "/api/Ticker/json/symbols?provider=" + provider);
                const responseJson = await response.json();
                pairs = responseJson;
            } catch (err) {
                this.log("Error fetching pairs from proxy", err);
                pairs = [];
            }
        }

        const normalized = (pairs || []).map(function (item) {
            if (!item) {
                return null;
            }

            if (typeof item === "string") {
                const value = item.toUpperCase();
                return {
                    value: value,
                    symbol: value.replace(/[:/]/g, ""),
                    display: value
                };
            }

            const rawValue = item.value !== undefined ? item.value : (item.display || item.symbol || "");
            const value = (rawValue || "").toUpperCase();
            if (!value) {
                return null;
            }

            const normalizedSymbol = (item.symbol || value.replace(/[:/]/g, "")).toUpperCase();
            const display = (item.display || value).toUpperCase();

            return {
                value: value,
                symbol: normalizedSymbol,
                display: display
            };
        }).filter(function (item) {
            return item !== null;
        });

        cache[cacheKey] = normalized;
        return normalized;
    },
    resolveProviderModule: function(provider) {
        if (typeof provider !== "string") {
            return null;
        }

        if (typeof CryptoTickerPIProviders !== "undefined" && CryptoTickerPIProviders.getProvider) {
            return CryptoTickerPIProviders.getProvider(provider);
        }

        return null;
    },
    initCurrenciesDropDown: async function () {
        const currencies = await this.getCurrencies();
        this.log("initCurrenciesDropDown", currencies);

        // const fromCurrencyDropDown = settingsConfig["fromCurrency"]["value"];
        const toCurrencyDropDown = settingsConfig["currency"]["value"];

        this.removeAllOptions(toCurrencyDropDown);

        const emptyOption = document.createElement("option");
        emptyOption.text = "";
        emptyOption.value = "";
        toCurrencyDropDown.add(emptyOption);

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

        const response = await fetch(tProxyBase + "/api/Ticker/json/currencies");
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

        const incoming = settings ? Object.assign({}, settings) : {};

        // Backward compatibility, to remove at some point
        const pairElements = this.splitPairValue(incoming["pair"]);
        if (pairElements) {
            for (const k in pairElements) {
                if (Object.prototype.hasOwnProperty.call(pairElements, k)) {
                    incoming[k] = pairElements[k];
                }
            }
        }
        //

        setCurrentSettings(incoming);
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

        setCurrentSettings(currentSettings);
        this.saveSettings();
    },
    refreshValues: function() {
        this.log("refreshValues");

        if (lastDisplayedExchange !== currentSettings["exchange"]) {
            this.initPairsDropDown();
            return;
        }

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
        if (currentSettings && currentSettings["pair"] && currentSettings["pair"].indexOf("USD")>=0) {
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

        setCurrentSettings(currentSettings);

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
