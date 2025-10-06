/* eslint-disable @typescript-eslint/ban-ts-comment, no-var, @typescript-eslint/no-this-alias */
// @ts-nocheck
// Global Stream Deck websocket plus plugin metadata snapshot.
/* global CryptoTickerExpressionEvaluator, CryptoTickerConnectionStates, CryptoTickerConnectionStatusIcons */
/* exported connectElgatoStreamDeckSocket */

var websocket = null,
    uuid = null,
    actionInfo = {};


const expressionEvaluatorModule = typeof CryptoTickerExpressionEvaluator !== "undefined" ? CryptoTickerExpressionEvaluator : null;
const connectionStatesModule = typeof CryptoTickerConnectionStates !== "undefined" ? CryptoTickerConnectionStates : {
    LIVE: "live",
    DETACHED: "detached",
    BACKUP: "backup",
    BROKEN: "broken"
};
const connectionStatusIconsModule = typeof CryptoTickerConnectionStatusIcons !== "undefined" ? CryptoTickerConnectionStatusIcons : null;

// Separate evaluator instances so alert + color allowlists stay isolated.
const expressionEvaluatorInstances = (function() {
    if (!expressionEvaluatorModule) {
        return {
            alert: null,
            color: null
        };
    }

    const baseAllowed = expressionEvaluatorModule.allowedVariables ? expressionEvaluatorModule.allowedVariables.slice(0) : [];
    const colorAllowed = baseAllowed.slice(0);
    const extraColorVariables = [
        "alert",
        "backgroundColor",
        "textColor",
        "defaultBackgroundColor",
        "defaultTextColor"
    ];

    for (let i = 0; i < extraColorVariables.length; i++) {
        if (colorAllowed.indexOf(extraColorVariables[i]) === -1) {
            colorAllowed.push(extraColorVariables[i]);
        }
    }

    return {
        alert: expressionEvaluatorModule.createEvaluator(),
        color: expressionEvaluatorModule.createEvaluator({
            allowedVariables: colorAllowed
        })
    };
}());

const EXPRESSION_SAMPLE_VALUES = {
    last: 100,
    high: 120,
    low: 80,
    changeDaily: 2,
    changeDailyPercent: 0.02,
    volume: 100000
};

const EXPRESSION_SAMPLE_COLOR_OVERRIDES = {
    alert: false,
    backgroundColor: "#000000",
    textColor: "#ffffff",
    defaultBackgroundColor: "#000000",
    defaultTextColor: "#ffffff"
};

function buildSampleAlertContext() {
    if (!expressionEvaluatorModule) {
        return {};
    }
    return expressionEvaluatorModule.buildBaseContext(EXPRESSION_SAMPLE_VALUES);
}

function buildSampleColorContext() {
    if (!expressionEvaluatorModule) {
        return {};
    }
    return expressionEvaluatorModule.buildContext(
        EXPRESSION_SAMPLE_VALUES,
        Object.assign({}, EXPRESSION_SAMPLE_COLOR_OVERRIDES)
    );
}

const expressionValidationTargets = [
    {
        key: "alertRule",
        evaluator: expressionEvaluatorInstances.alert,
        contextBuilder: buildSampleAlertContext
    },
    {
        key: "backgroundColorRule",
        evaluator: expressionEvaluatorInstances.color,
        contextBuilder: buildSampleColorContext
    },
    {
        key: "textColorRule",
        evaluator: expressionEvaluatorInstances.color,
        contextBuilder: buildSampleColorContext
    }
];


const tProxyBase = "https://tproxyv8.opendle.com";
// const tProxyBase = "https://localhost:44330";

const loggingEnabled = false;
const selectPairDropdown = document.getElementById("select-pair-dropdown");
const pairSearchInput = document.getElementById("select-pair-search");
const pairSearchFeedback = document.getElementById("pair-search-feedback");
const FETCH_TIMEOUT_MS = 10000;
const FETCH_MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 600;
const MAX_RETRY_DELAY_MS = 5000;

function wait(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    });
}

function safeInvokeRetryCallback(callback, payload, label) {
    if (typeof callback !== "function") {
        return;
    }
    try {
        callback(payload);
    } catch (callbackErr) {
        console.error("fetchJsonWithRetry " + label + " failed", callbackErr);
    }
}

function createAbortControllerWithTimeout(timeout) {
    if (typeof AbortController === "undefined") {
        return {
            controller: null,
            timerId: null
        };
    }

    const controller = new AbortController();
    const timerId = setTimeout(function() {
        controller.abort();
    }, timeout);

    return {
        controller: controller,
        timerId: timerId
    };
}

function clearAbortTimer(timerId) {
    if (timerId) {
        clearTimeout(timerId);
    }
}

/**
 * Fetch JSON from `url`, honoring optional abort controller/config.
 *
 * @param {string} url Target URL.
 * @param {AbortController|null} controller Abort hook or null.
 * @param {Object} [baseFetchOptions] Extra fetch options.
 * @returns {Promise<Object>} Parsed JSON payload.
 * @throws {Error} When the response is not OK or fetch rejects.
 */
async function performJsonFetch(url, controller, baseFetchOptions) {
    const fetchOptions = Object.assign({}, baseFetchOptions || {});
    if (controller) {
        fetchOptions.signal = controller.signal;
    }
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
        throw new Error("Request failed with status " + response.status);
    }

    const raw = await response.text();
    if (!raw || raw.trim().length === 0) {
        return [];
    }

    try {
        return JSON.parse(raw);
    } catch (err) {
        const parseError = err instanceof Error ? err : new Error(String(err));
        parseError.message = "Failed to parse JSON response from " + url + ": " + parseError.message;
        throw parseError;
    }
}

function formatCacheTimestamp(timestamp) {
    if (!timestamp) {
        return "";
    }
    try {
        return new Date(timestamp).toLocaleString();
    } catch (err) {
        return new Date(timestamp).toString();
    }
}

function buildStaleDataMessage(timestamp) {
    const formatted = formatCacheTimestamp(timestamp);
    if (!formatted) {
        return "Showing cached data. Data may be outdated.";
    }
    return "Showing cached data from " + formatted + ". Data may be outdated.";
}

// Centralize dropdown loading/warning UX for providers/pairs/currencies so fetch code stays lean.
const networkStatusManager = (function() {
    const config = {
        providers: {
            selectId: "select-provider",
            loadingMessage: "Loading providers...",
            retryMessage: "Failed to load providers. Retrying..."
        },
        pairs: {
            selectId: "select-pair-dropdown",
            extraDisableIds: ["select-pair-search"],
            loadingMessage: "Loading pairs...",
            retryMessage: "Failed to load pairs. Retrying..."
        },
        currencies: {
            selectId: "select-currency",
            loadingMessage: "Loading currencies...",
            retryMessage: "Failed to load currencies. Retrying..."
        }
    };
    const state = {};

    function ensure(key) {
        if (state[key]) {
            return state[key];
        }
        const conf = config[key];
        if (!conf) {
            return null;
        }
        const select = document.getElementById(conf.selectId);
        if (!select || !select.parentNode) {
            return null;
        }

        const extraDisableElements = [];
        if (Array.isArray(conf.extraDisableIds)) {
            conf.extraDisableIds.forEach(function(extraId) {
                const extraElement = document.getElementById(extraId);
                if (extraElement) {
                    extraDisableElements.push(extraElement);
                }
            });
        }

        const status = document.createElement("div");
        status.className = "pi-network-status";
        status.setAttribute("role", "status");
        status.style.display = "none";

        const spinner = document.createElement("span");
        spinner.className = "pi-network-status__spinner";
        status.appendChild(spinner);

        const text = document.createElement("span");
        text.className = "pi-network-status__text";
        status.appendChild(text);

        const retry = document.createElement("button");
        retry.type = "button";
        retry.className = "pi-network-status__retry";
        retry.textContent = "Retry";
        retry.style.display = "none";
        status.appendChild(retry);

        select.parentNode.appendChild(status);

        const warning = document.createElement("div");
        warning.className = "pi-network-status__warning";
        warning.style.display = "none";
        select.parentNode.appendChild(warning);

        state[key] = {
            select: select,
            status: status,
            spinner: spinner,
            text: text,
            retry: retry,
            warning: warning,
            extraDisableElements: extraDisableElements
        };

        return state[key];
    }

    function setState(key, options) {
        const entry = ensure(key);
        if (!entry) {
            return;
        }
        const opts = options || {};
        entry.status.style.display = opts.message ? "" : "none";
        entry.text.textContent = opts.message || "";
        entry.spinner.style.display = opts.spinner ? "" : "none";
        entry.retry.style.display = opts.showRetry ? "" : "none";
        entry.retry.onclick = typeof opts.onRetry === "function" ? opts.onRetry : null;

        entry.status.classList.remove("is-error", "is-warning", "is-success");
        if (opts.tone === "error") {
            entry.status.classList.add("is-error");
        } else if (opts.tone === "warning") {
            entry.status.classList.add("is-warning");
        } else if (opts.tone === "success") {
            entry.status.classList.add("is-success");
        }

        if (entry.select) {
            entry.select.disabled = !!opts.disableSelect;
        }
        if (entry.extraDisableElements && entry.extraDisableElements.length) {
            for (let i = 0; i < entry.extraDisableElements.length; i++) {
                const target = entry.extraDisableElements[i];
                if (target) {
                    target.disabled = !!opts.disableSelect;
                }
            }
        }
    }

    function showWarning(key, message) {
        const entry = ensure(key);
        if (!entry) {
            return;
        }
        const msg = message || "";
        entry.warning.style.display = msg ? "" : "none";
        entry.warning.textContent = msg;
    }

    function clear(key) {
        setState(key, {});
        showWarning(key, "");
        const entry = state[key];
        if (entry && entry.select) {
            entry.select.disabled = false;
        }
    }

    return {
        ensure: ensure,
        setState: setState,
        showWarning: showWarning,
        clear: clear,
        config: config
    };
}());

// Generic exponential backoff helper for PI fetches; smooths proxy hiccups.
async function fetchJsonWithRetry(url, options) {
    const opts = options || {};
    const attempts = Math.max(1, opts.attempts || FETCH_MAX_ATTEMPTS);
    const timeout = opts.timeout || FETCH_TIMEOUT_MS;
    let lastError = null;

    for (let attempt = 1; attempt <= attempts; attempt++) {
        safeInvokeRetryCallback(opts.onAttemptStart, {
            attempt: attempt,
            maxAttempts: attempts
        }, "onAttemptStart");

        const abortContext = createAbortControllerWithTimeout(timeout);

        try {
            const fetchOptions = opts.fetchOptions || {};
            const result = await performJsonFetch(url, abortContext.controller, fetchOptions);
            clearAbortTimer(abortContext.timerId);
            return result;
        } catch (err) {
            lastError = err;
            clearAbortTimer(abortContext.timerId);
            safeInvokeRetryCallback(opts.onAttemptError, {
                attempt: attempt,
                maxAttempts: attempts,
                error: err
            }, "onAttemptError");

            if (attempt < attempts) {
                const delayBase = opts.retryBaseDelay || RETRY_BASE_DELAY_MS;
                const delay = Math.min(MAX_RETRY_DELAY_MS, delayBase * Math.pow(2, attempt - 1));
                await wait(delay);
            }
        }
    }

    safeInvokeRetryCallback(opts.onFinalFailure, { error: lastError }, "onFinalFailure");

    throw lastError || new Error("Request failed");
}

// Normalize pair payloads into {value, symbol, display} regardless of backend format.
function normalizePairsList(pairs) {
    return (pairs || []).map(function(item) {
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
    }).filter(function(item) {
        return item !== null;
    });
}
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
// Maps setting keys to DOM elements, default values, and optional getValue/setValue overrides for non-standard controls.
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
        "value": document.getElementById("alertRule"),
        "errorElement": document.getElementById("alertRuleError")
    },
    "backgroundColorRule": {
        "default": defaultSettings.backgroundColorRule,
        "value": document.getElementById("backgroundColorRule"),
        "errorElement": document.getElementById("backgroundColorRuleError")
    },
    "textColorRule": {
        "default": defaultSettings.textColorRule,
        "value": document.getElementById("textColorRule"),
        "errorElement": document.getElementById("textColorRuleError")
    },
    "mode": {
        "default": defaultSettings.mode
    }
};

const currentSettings = applyDefaultSettings({});
const cache = {};

function getCachedEntry(cacheKey) {
    const entry = cache[cacheKey];
    if (!entry || typeof entry !== "object" || !Object.prototype.hasOwnProperty.call(entry, "data")) {
        return null;
    }
    return entry;
}

function setCachedEntry(cacheKey, data) {
    cache[cacheKey] = {
        data: data,
        timestamp: Date.now()
    };
    return cache[cacheKey];
}
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
    pairDropdownState: {
        allPairs: [],
        filteredPairs: [],
        filterTerm: "",
        provider: ""
    },
    log: function(...data) {
        if (loggingEnabled) {
            console.log(...data);
        }
    },

    displayExpressionErrors: function(errors) {
        const map = errors || {};
        for (let i = 0; i < expressionValidationTargets.length; i++) {
            const target = expressionValidationTargets[i];
            const config = settingsConfig[target.key];
            if (!config || !config.errorElement) {
                continue;
            }
            const message = map[target.key] || "";
            config.errorElement.textContent = message;
            if (message) {
                config.errorElement.classList.add("is-visible");
            } else {
                config.errorElement.classList.remove("is-visible");
            }
        }
    },

    // Parse + evaluate expressions against sample context; report syntax, runtime, Inf/NaN errors.
    validateRuleExpressions: function(settings) {
        const result = {
            hasErrors: false,
            errors: {}
        };

        for (let i = 0; i < expressionValidationTargets.length; i++) {
            const target = expressionValidationTargets[i];
            const expressionValue = (settings[target.key] || "").trim();

            if (!expressionValue) {
                result.errors[target.key] = "";
                continue;
            }

            if (!target.evaluator || typeof target.contextBuilder !== "function") {
                result.errors[target.key] = "";
                continue;
            }

            const validation = target.evaluator.validate(expressionValue);
            if (!validation.ok) {
                result.errors[target.key] = validation.error;
                result.hasErrors = true;
                continue;
            }

            try {
                const evaluationContext = target.contextBuilder() || {};
                const evaluationResult = target.evaluator.evaluate(expressionValue, evaluationContext);
                if (typeof evaluationResult === "number" && !isFinite(evaluationResult)) {
                    result.errors[target.key] = "Expression resulted in an invalid number. Check for division by zero.";
                    result.hasErrors = true;
                } else if (typeof evaluationResult === "number" && isNaN(evaluationResult)) {
                    result.errors[target.key] = "Expression resulted in NaN. Verify the operators and inputs.";
                    result.hasErrors = true;
                } else {
                    result.errors[target.key] = "";
                }
            } catch (err) {
                const message = err && err.message ? err.message : "Invalid expression";
                result.errors[target.key] = message;
                result.hasErrors = true;
            }
        }

        return result;
    },
    setPairUIVisibility: function(isVisible) {
        const displayValue = isVisible ? "" : "none";
        const dropdownGroup = document.getElementById("select-pair-dropdown-group");
        const searchGroup = document.getElementById("pair-search-group");
        if (dropdownGroup) {
            dropdownGroup.style.display = displayValue;
        }
        if (searchGroup) {
            searchGroup.style.display = displayValue;
        }
    },
    resetPairDropdown: function() {
        this.pairDropdownState.allPairs = [];
        this.pairDropdownState.filteredPairs = [];
        this.pairDropdownState.filterTerm = "";
        this.pairDropdownState.provider = "";
        if (selectPairDropdown) {
            this.removeAllOptions(selectPairDropdown);
            const emptyOption = document.createElement("option");
            emptyOption.text = "";
            emptyOption.value = "";
            selectPairDropdown.add(emptyOption);
            selectPairDropdown.disabled = true;
        }
        if (pairSearchInput) {
            pairSearchInput.value = "";
            pairSearchInput.disabled = true;
        }
        this.updatePairSearchFeedback(0, "");
        this.setPairUIVisibility(false);
    },
    findMatchingPairValue: function(pairs, identifier) {
        if (!identifier) {
            return null;
        }
        const normalized = identifier.toUpperCase();
        const list = Array.isArray(pairs) ? pairs : [];
        const match = list.find(function(pair) {
            if (!pair) {
                return false;
            }
            const value = (pair.value || "").toUpperCase();
            const symbol = (pair.symbol || "").toUpperCase();
            const display = (pair.display || "").toUpperCase();
            return value === normalized || symbol === normalized || display === normalized;
        });
        if (match) {
            return match.value || match.symbol || "";
        }
        return null;
    },
    renderPairDropdownOptions: function(pairs, options) {
        if (!selectPairDropdown) {
            return;
        }

        const opts = options || {};
        const availablePairs = Array.isArray(pairs) ? pairs : [];
        const previousValue = typeof opts.previousValue === "string" ? opts.previousValue : (selectPairDropdown.value || "");
        const preferredValue = typeof opts.preferredValue === "string" ? opts.preferredValue : "";
        const fallbackValue = typeof opts.fallbackValue === "string" ? opts.fallbackValue : "";
        const pairConfig = settingsConfig && settingsConfig["pair"] ? settingsConfig["pair"] : null;
        const currentPairValue = pairConfig && pairConfig.value ? pairConfig.value.value : "";

        this.removeAllOptions(selectPairDropdown);

        const emptyOption = document.createElement("option");
        emptyOption.text = "";
        emptyOption.value = "";
        selectPairDropdown.add(emptyOption);

        for (let i = 0; i < availablePairs.length; i++) {
            const pair = availablePairs[i];
            const option = document.createElement("option");
            option.value = pair.value;
            option.text = pair.display || pair.value;
            selectPairDropdown.add(option);
        }

        const normalizedPreferred = this.findMatchingPairValue(availablePairs, preferredValue);
        const normalizedPrevious = this.findMatchingPairValue(availablePairs, previousValue);
        const normalizedCurrent = this.findMatchingPairValue(availablePairs, currentPairValue);
        const normalizedFallback = this.findMatchingPairValue(availablePairs, fallbackValue);

        const targetValue = normalizedPreferred || normalizedPrevious || normalizedCurrent || normalizedFallback || "";
        if (targetValue) {
            selectPairDropdown.value = targetValue;
        } else {
            selectPairDropdown.value = "";
        }
    },
    updatePairSearchFeedback: function(matchesCount, query) {
        if (!pairSearchFeedback) {
            return;
        }
        const hasQuery = !!(query && query.trim());
        if (hasQuery && matchesCount === 0) {
            pairSearchFeedback.textContent = "No matches for \"" + query.trim() + "\"";
            pairSearchFeedback.style.display = "";
        } else {
            pairSearchFeedback.textContent = "";
            pairSearchFeedback.style.display = "none";
        }
    },
    applyPairFilter: function(rawTerm, options) {
        const term = (rawTerm || "").trim();
        const normalizedTerm = term.toUpperCase();
        const state = this.pairDropdownState;
        state.filterTerm = term;

        const sourcePairs = Array.isArray(state.allPairs) ? state.allPairs : [];
        let filtered = sourcePairs;
        if (normalizedTerm) {
            filtered = sourcePairs.filter(function(pair) {
                const value = (pair.value || "").toUpperCase();
                const symbol = (pair.symbol || "").toUpperCase();
                const display = (pair.display || "").toUpperCase();
                return value.indexOf(normalizedTerm) !== -1 || symbol.indexOf(normalizedTerm) !== -1 || display.indexOf(normalizedTerm) !== -1;
            });
        }

        state.filteredPairs = filtered;

        const opts = options || {};
        const previousValue = typeof opts.previousValue === "string" ? opts.previousValue : (selectPairDropdown ? selectPairDropdown.value : "");
        const preferredValue = typeof opts.preferredValue === "string" ? opts.preferredValue : "";
        const fallbackCandidate = typeof opts.fallbackValue === "string" ? opts.fallbackValue : (filtered[0] ? filtered[0].value : "");

        this.renderPairDropdownOptions(filtered, {
            previousValue: previousValue,
            preferredValue: preferredValue,
            fallbackValue: fallbackCandidate
        });
        this.updatePairSearchFeedback(filtered.length, term);
    },
    setPairDropdownData: function(provider, pairs, options) {
        const normalizedPairs = Array.isArray(pairs) ? pairs.slice(0) : [];
        this.pairDropdownState.allPairs = normalizedPairs;
        this.pairDropdownState.provider = (provider || "").toUpperCase();

        const opts = options || {};
        const shouldResetFilter = opts.resetFilter !== false;
        if (pairSearchInput) {
            if (shouldResetFilter) {
                pairSearchInput.value = "";
            }
            pairSearchInput.disabled = normalizedPairs.length === 0;
        }

        const filterTerm = shouldResetFilter ? "" : this.pairDropdownState.filterTerm;
        this.applyPairFilter(filterTerm, {
            previousValue: opts.previousValue,
            preferredValue: opts.preferredValue,
            fallbackValue: opts.savedValue
        });
    },
    handlePairSearchInput: function(value) {
        this.applyPairFilter(value, {
            previousValue: selectPairDropdown ? selectPairDropdown.value : ""
        });
    },
    handlePairSearchKeydown: function(evt) {
        if (!evt) {
            return;
        }

        if (evt.key === "ArrowDown" || evt.key === "Down") {
            evt.preventDefault();
            this.focusPairDropdown();
            this.movePairSelection(1);
        } else if (evt.key === "ArrowUp" || evt.key === "Up") {
            evt.preventDefault();
            this.focusPairDropdown();
            this.movePairSelection(-1);
        } else if (evt.key === "Enter") {
            evt.preventDefault();
            this.selectPairFromSearch();
        } else if (evt.key === "Escape") {
            if (pairSearchInput && pairSearchInput.value) {
                evt.preventDefault();
                pairSearchInput.value = "";
                const pairConfig = settingsConfig && settingsConfig["pair"] ? settingsConfig["pair"] : null;
                const currentValue = pairConfig && pairConfig.value ? pairConfig.value.value : "";
                this.applyPairFilter("", {
                    previousValue: currentValue
                });
            }
        }
    },
    focusPairDropdown: function() {
        if (!selectPairDropdown) {
            return;
        }
        selectPairDropdown.focus();
        if (selectPairDropdown.options.length > 1 && selectPairDropdown.selectedIndex < 1) {
            selectPairDropdown.selectedIndex = 1;
        }
    },
    movePairSelection: function(offset) {
        if (!selectPairDropdown) {
            return;
        }
        const optionsLength = selectPairDropdown.options.length;
        if (optionsLength <= 1) {
            return;
        }

        let nextIndex = selectPairDropdown.selectedIndex;
        if (nextIndex < 1) {
            nextIndex = offset > 0 ? 1 : optionsLength - 1;
        } else {
            nextIndex = nextIndex + offset;
            if (nextIndex < 1) {
                nextIndex = optionsLength - 1;
            } else if (nextIndex >= optionsLength) {
                nextIndex = 1;
            }
        }

        selectPairDropdown.selectedIndex = nextIndex;
    },
    selectPairFromSearch: function() {
        if (!selectPairDropdown) {
            return;
        }

        let value = selectPairDropdown.value;
        if (!value && this.pairDropdownState.filteredPairs.length > 0) {
            value = this.pairDropdownState.filteredPairs[0].value;
        }

        if (value) {
            this.applyPairSelection(value);
        }
    },
    applyPairSelection: function(value) {
        if (!selectPairDropdown) {
            return;
        }
        selectPairDropdown.value = value || "";
        if (typeof selectPairDropdown.onchange === "function") {
            selectPairDropdown.onchange();
        }
    },
    syncPairSelectionDisplay: function() {
        if (!selectPairDropdown) {
            return;
        }
        const pairConfig = settingsConfig && settingsConfig["pair"] ? settingsConfig["pair"] : null;
        const currentValue = pairConfig && pairConfig.value ? pairConfig.value.value : "";
        if (!currentValue) {
            selectPairDropdown.value = "";
            return;
        }

        const available = this.pairDropdownState.filteredPairs.length > 0 ? this.pairDropdownState.filteredPairs : this.pairDropdownState.allPairs;
        const matchValue = this.findMatchingPairValue(available, currentValue) || currentValue;
        selectPairDropdown.value = matchValue;
    },

    setupNetworkStatusElements: function() {
        if (this.networkStatusInitialized) {
            return;
        }

        networkStatusManager.ensure("providers");
        networkStatusManager.ensure("pairs");
        networkStatusManager.ensure("currencies");

        const self = this;
        this.retryCallbacks = {
            providers: async function() {
                await self.populateProvidersDropdown(true);
                const exchangeDropdown = settingsConfig["exchange"]["value"];
                const provider = exchangeDropdown ? exchangeDropdown.value : "";
                if (provider) {
                    await self.populatePairsDropdown(provider, { forceRefresh: true });
                }
            },
            pairs: async function() {
                const exchangeDropdown = settingsConfig["exchange"]["value"];
                const provider = exchangeDropdown ? exchangeDropdown.value : "";
                if (provider) {
                    await self.populatePairsDropdown(provider, { forceRefresh: true });
                }
            },
            currencies: async function() {
                await self.populateCurrenciesDropdown(true);
            }
        };

        this.networkStatusInitialized = true;
    },

    populateProvidersDropdown: async function(forceRefresh) {
        const exchangeDropdown = settingsConfig["exchange"]["value"];
        if (!exchangeDropdown) {
            return [];
        }

        const previousValue = exchangeDropdown.value;
        const providers = await this.getProviders({
            forceRefresh: !!forceRefresh
        });
        const list = Array.isArray(providers) ? providers.slice(0) : [];

        this.removeAllOptions(exchangeDropdown);

        list.sort();
        list.forEach(function(provider) {
            const option = document.createElement("option");
            option.text = provider;
            option.value = provider;
            exchangeDropdown.add(option);
        });

        const savedExchange = currentSettings["exchange"] || settingsConfig["exchange"]["default"] || "";
        const preferred = previousValue || savedExchange;

        if (preferred && list.indexOf(preferred) !== -1) {
            exchangeDropdown.value = preferred;
        } else if (savedExchange && list.indexOf(savedExchange) !== -1) {
            exchangeDropdown.value = savedExchange;
        } else if (list.length > 0) {
            exchangeDropdown.value = list[0];
        } else {
            exchangeDropdown.value = "";
        }

        exchangeDropdown.disabled = list.length === 0;
        return list;
    },

    populatePairsDropdown: async function(provider, options) {
        const opts = options || {};
        const exchangeDropdown = settingsConfig["exchange"]["value"];
        const currentProvider = provider || (exchangeDropdown ? exchangeDropdown.value : "");
        if (!currentProvider) {
            this.resetPairDropdown();
            return [];
        }

        const expectedProvider = currentProvider.toUpperCase();
        const pairs = await this.getPairs(currentProvider, {
            forceRefresh: !!opts.forceRefresh
        });

        const exchangeValue = exchangeDropdown ? (exchangeDropdown.value || "").toUpperCase() : "";
        if (exchangeValue && exchangeValue !== expectedProvider) {
            return pairs;
        }

        const normalized = Array.isArray(pairs) ? pairs.slice(0) : [];
        normalized.sort(function(a, b) {
            const aP = a["display"] || a["symbol"];
            const bP = b["display"] || b["symbol"];

            if (aP > bP) {
                return 1;
            }

            if (aP < bP) {
                return -1;
            }

            return 0;
        });

        const savedPair = (currentSettings["pair"] || "").toUpperCase();
        const previousValue = selectPairDropdown ? selectPairDropdown.value : "";
        const preferredPair = (previousValue || savedPair || "").toUpperCase();

        this.setPairDropdownData(currentProvider, normalized, {
            previousValue: previousValue,
            preferredValue: preferredPair,
            savedValue: savedPair,
            resetFilter: !opts.preserveFilter
        });

        const hasPairs = normalized.length > 0;
        this.setPairUIVisibility(hasPairs);

        if (selectPairDropdown) {
            selectPairDropdown.disabled = !hasPairs;
        }
        if (pairSearchInput) {
            pairSearchInput.disabled = !hasPairs;
        }
        if (!hasPairs) {
            this.updatePairSearchFeedback(0, pairSearchInput ? pairSearchInput.value : "");
        }
        return normalized;
    },

    populateCurrenciesDropdown: async function(forceRefresh) {
        const toCurrencyDropDown = settingsConfig["currency"]["value"];
        if (!toCurrencyDropDown) {
            return [];
        }

        const previousValue = toCurrencyDropDown.value;
        const currencies = await this.getCurrencies({
            forceRefresh: !!forceRefresh
        });
        const list = Array.isArray(currencies) ? currencies.slice(0) : [];

        this.removeAllOptions(toCurrencyDropDown);

        const emptyOption = document.createElement("option");
        emptyOption.text = "";
        emptyOption.value = "";
        toCurrencyDropDown.add(emptyOption);

        list.sort();
        list.forEach(function(currency) {
            const option = document.createElement("option");
            option.text = currency;
            option.value = currency;
            toCurrencyDropDown.add(option);
        });

        const savedCurrency = currentSettings["currency"] || settingsConfig["currency"]["default"] || "";
        const preferred = previousValue || savedCurrency;

        if (preferred && list.indexOf(preferred) !== -1) {
            toCurrencyDropDown.value = preferred;
        } else if (savedCurrency && list.indexOf(savedCurrency) !== -1) {
            toCurrencyDropDown.value = savedCurrency;
        } else {
            toCurrencyDropDown.value = "";
        }

        toCurrencyDropDown.disabled = list.length === 0;
        return list;
    },

    handleExchangeChange: async function(options) {
        const opts = options || {};
        const exchangeDropdown = settingsConfig["exchange"]["value"];
        const provider = exchangeDropdown ? exchangeDropdown.value : "";
        if (!provider) {
            this.resetPairDropdown();
            lastDisplayedExchange = provider;
            return;
        }

        await this.populatePairsDropdown(provider, {
            forceRefresh: !!opts.forceRefresh
        });
        lastDisplayedExchange = provider;
    },

    initDom: function() {
        this.setupNetworkStatusElements();
        this.initPairsDropDown();
        this.initCurrenciesDropDown();
        this.renderConnectionStateHelp();

        const jThis = this;
        const callback = function() {
            jThis.checkNewSettings();
            jThis.refreshMenus();
        };

        for (const k in settingsConfig) {
            const setting = settingsConfig[k];
            if (setting["value"]) {
                setting["value"].onchange = callback;
                setting["value"].onkeyup = callback;
            }
        }
    },
    renderConnectionStateHelp: function() {
        if (!connectionStatusIconsModule || typeof connectionStatusIconsModule.renderConnectionStatusIcon !== "function") {
            return;
        }

        const canvases = document.querySelectorAll("canvas.connection-state-icon");
        if (!canvases || canvases.length === 0) {
            return;
        }

        const fallbackStates = {
            LIVE: "live",
            DETACHED: "detached",
            BACKUP: "backup",
            BROKEN: "broken"
        };
        const states = connectionStatesModule || fallbackStates;

        for (let i = 0; i < canvases.length; i++) {
            const canvas = canvases[i] as HTMLCanvasElement;
            if (!canvas) {
                continue;
            }

            const stateKey = (canvas.getAttribute("data-connection-state") || "").toUpperCase();
            const resolvedState = (states && states[stateKey]) ? states[stateKey] : stateKey.toLowerCase();
            const context = canvas.getContext("2d");
            if (!context || !resolvedState) {
                continue;
            }

            context.clearRect(0, 0, canvas.width, canvas.height);

            const minDimension = Math.min(canvas.width || 0, canvas.height || 0);
            const multiplier = Math.max(minDimension > 0 ? (minDimension / 32) : 1, 0.6);

            connectionStatusIconsModule.renderConnectionStatusIcon({
                canvas: canvas,
                canvasContext: context,
                state: resolvedState,
                color: "#ffffff",
                sizeMultiplier: multiplier,
                position: "TOP_RIGHT",
                connectionStates: states
            });
        }
    },
    initPairsDropDown: async function() {
        const exchangeDropdown = settingsConfig["exchange"]["value"];
        if (!exchangeDropdown) {
            return;
        }

        this.setupNetworkStatusElements();

        if (!this.exchangeDropdownInitialized) {
            const thisTmp = this;
            const originalCallback = typeof exchangeDropdown.onchange === "function" ? exchangeDropdown.onchange : function() {};
            exchangeDropdown.onchange = function() {
                if (typeof originalCallback === "function") {
                    originalCallback.call(this);
                }
                thisTmp.handleExchangeChange();
                thisTmp.checkNewSettings();
            };

            selectPairDropdown.onchange = function() {
                const pairInput = settingsConfig["pair"]["value"];
                pairInput.value = selectPairDropdown.value;
                if (typeof pairInput.onchange === "function") {
                    pairInput.onchange();
                }
            };

            if (pairSearchInput) {
                pairSearchInput.addEventListener("input", function(event) {
                    thisTmp.handlePairSearchInput(event.target.value);
                });
                pairSearchInput.addEventListener("keydown", function(event) {
                    thisTmp.handlePairSearchKeydown(event);
                });
            }

            this.exchangeDropdownInitialized = true;
        }

        await this.populateProvidersDropdown();

        const candidateExchange = currentSettings["exchange"] || settingsConfig["exchange"]["default"] || "";
        if (candidateExchange) {
            const hasCandidate = Array.from(exchangeDropdown.options).some(function(option) {
                return (option.value || "").toUpperCase() === candidateExchange.toUpperCase();
            });
            if (hasCandidate) {
                exchangeDropdown.value = candidateExchange;
            }
        }

        const activeExchange = exchangeDropdown.value || candidateExchange;
        lastDisplayedExchange = activeExchange;
        await this.populatePairsDropdown(activeExchange, { initial: true });
        this.refreshValues();
    },
    getProviders: async function(options) {
        this.setupNetworkStatusElements();
        const opts = options || {};
        const cacheKey = "getProviders";
        const cachedEntry = getCachedEntry(cacheKey);
        let providers = cachedEntry ? cachedEntry.data : null;
        const forceRefresh = !!opts.forceRefresh;
        const shouldFetch = forceRefresh || !cachedEntry;
        const retryHandler = this.retryCallbacks && typeof this.retryCallbacks.providers === "function" ? this.retryCallbacks.providers : null;

        if (shouldFetch) {
            networkStatusManager.setState("providers", {
                message: networkStatusManager.config.providers.loadingMessage,
                spinner: true,
                disableSelect: true
            });

            try {
                const responseJson = await fetchJsonWithRetry(tProxyBase + "/api/Ticker/json/providers", {
                    attempts: FETCH_MAX_ATTEMPTS,
                    timeout: FETCH_TIMEOUT_MS,
                    retryBaseDelay: RETRY_BASE_DELAY_MS,
                    onAttemptStart: function(info) {
                        if (info.attempt === 1) {
                            networkStatusManager.setState("providers", {
                                message: networkStatusManager.config.providers.loadingMessage,
                                spinner: true,
                                disableSelect: true
                            });
                        } else {
                            networkStatusManager.setState("providers", {
                                message: networkStatusManager.config.providers.retryMessage,
                                spinner: true,
                                disableSelect: true,
                                tone: "warning"
                            });
                        }
                    },
                    onAttemptError: function(info) {
                        console.error("Provider fetch attempt " + info.attempt + " failed", info.error);
                    }
                });

                providers = Array.isArray(responseJson) ? responseJson.slice(0) : [];
                setCachedEntry(cacheKey, providers);
                networkStatusManager.clear("providers");
            } catch (err) {
                console.error("Failed to load providers", err);
                this.log("getProviders error", err);

                if (cachedEntry && Array.isArray(cachedEntry.data) && cachedEntry.data.length > 0) {
                    networkStatusManager.setState("providers", {
                        message: "Using cached providers. Connection issue detected.",
                        spinner: false,
                        disableSelect: false,
                        tone: "warning",
                        showRetry: !!retryHandler,
                        onRetry: retryHandler
                    });
                    networkStatusManager.showWarning("providers", buildStaleDataMessage(cachedEntry.timestamp));
                    return cachedEntry.data;
                }

                networkStatusManager.setState("providers", {
                    message: "Network error. Please check connection and try again.",
                    spinner: false,
                    disableSelect: true,
                    tone: "error",
                    showRetry: !!retryHandler,
                    onRetry: retryHandler
                });
                networkStatusManager.showWarning("providers", "");
                return [];
            }
        } else if (cachedEntry) {
            providers = cachedEntry.data;
            networkStatusManager.clear("providers");
        }

        const normalizedProviders = Array.isArray(providers) ? providers : [];
        this.log("getProviders", normalizedProviders);
        networkStatusManager.showWarning("providers", "");
        return normalizedProviders;
    },
    getPairs: async function(provider, options) {
        this.setupNetworkStatusElements();
        const opts = options || {};
        if (!provider) {
            return [];
        }

        const cacheKey = "getPairs_" + provider;
        const cachedEntry = getCachedEntry(cacheKey);
        const forceRefresh = !!opts.forceRefresh;
        const retryHandler = this.retryCallbacks && typeof this.retryCallbacks.pairs === "function" ? this.retryCallbacks.pairs : null;
        let pairs = cachedEntry ? cachedEntry.data : null;
        const shouldFetch = forceRefresh || !cachedEntry;

        if (shouldFetch) {
            networkStatusManager.setState("pairs", {
                message: networkStatusManager.config.pairs.loadingMessage,
                spinner: true,
                disableSelect: true
            });

            const providerModule = this.resolveProviderModule(provider);
            if (providerModule && typeof providerModule.getPairs === "function") {
                try {
                    pairs = await providerModule.getPairs();
                } catch (err) {
                    console.error("Error fetching direct pairs for provider " + provider, err);
                    this.log("Error fetching direct pairs", err);
                    pairs = null;
                }
            }

            if (!Array.isArray(pairs) || pairs.length === 0) {
                const url = tProxyBase + "/api/Ticker/json/symbols?provider=" + encodeURIComponent(provider);

                try {
                    const responseJson = await fetchJsonWithRetry(url, {
                        attempts: FETCH_MAX_ATTEMPTS,
                        timeout: FETCH_TIMEOUT_MS,
                        retryBaseDelay: RETRY_BASE_DELAY_MS,
                        onAttemptStart: function(info) {
                            if (info.attempt === 1) {
                                networkStatusManager.setState("pairs", {
                                    message: networkStatusManager.config.pairs.loadingMessage,
                                    spinner: true,
                                    disableSelect: true
                                });
                            } else {
                                networkStatusManager.setState("pairs", {
                                    message: networkStatusManager.config.pairs.retryMessage,
                                    spinner: true,
                                    disableSelect: true,
                                    tone: "warning"
                                });
                            }
                        },
                        onAttemptError: function(info) {
                            console.error("Pairs fetch attempt " + info.attempt + " failed", info.error);
                        }
                    });

                    pairs = responseJson;
                } catch (err) {
                    console.error("Error fetching pairs from proxy for provider " + provider, err);
                    this.log("Error fetching pairs from proxy", err);

                    if (cachedEntry && Array.isArray(cachedEntry.data) && cachedEntry.data.length > 0) {
                        networkStatusManager.setState("pairs", {
                            message: "Using cached pairs. Connection issue detected.",
                            spinner: false,
                            disableSelect: false,
                            tone: "warning",
                            showRetry: !!retryHandler,
                            onRetry: retryHandler
                        });
                        networkStatusManager.showWarning("pairs", buildStaleDataMessage(cachedEntry.timestamp));
                        return cachedEntry.data;
                    }

                    networkStatusManager.setState("pairs", {
                        message: "Network error. Please check connection and try again.",
                        spinner: false,
                        disableSelect: true,
                        tone: "error",
                        showRetry: !!retryHandler,
                        onRetry: retryHandler
                    });
                    networkStatusManager.showWarning("pairs", "");
                    return [];
                }
            }
        } else if (cachedEntry) {
            networkStatusManager.clear("pairs");
            networkStatusManager.showWarning("pairs", "");
            return cachedEntry.data;
        }

        const normalizedPairs = normalizePairsList(pairs);
        if (normalizedPairs.length > 0) {
            setCachedEntry(cacheKey, normalizedPairs);
        } else if (cachedEntry && Array.isArray(cachedEntry.data) && cachedEntry.data.length > 0 && shouldFetch) {
            networkStatusManager.setState("pairs", {
                message: "Using cached pairs. Connection issue detected.",
                spinner: false,
                disableSelect: false,
                tone: "warning",
                showRetry: !!retryHandler,
                onRetry: retryHandler
            });
            networkStatusManager.showWarning("pairs", buildStaleDataMessage(cachedEntry.timestamp));
            return cachedEntry.data;
        }

        this.log("getPairs", normalizedPairs);
        networkStatusManager.clear("pairs");
        networkStatusManager.showWarning("pairs", "");
        return normalizedPairs;
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
    initCurrenciesDropDown: async function() {
        this.setupNetworkStatusElements();
        await this.populateCurrenciesDropdown();
        this.refreshValues();
    },
    getCurrencies: async function(options) {
        this.setupNetworkStatusElements();
        const opts = options || {};
        const cacheKey = "getCurrencies";
        const cachedEntry = getCachedEntry(cacheKey);
        let currencies = cachedEntry ? cachedEntry.data : null;
        const forceRefresh = !!opts.forceRefresh;
        const shouldFetch = forceRefresh || !cachedEntry;
        const retryHandler = this.retryCallbacks && typeof this.retryCallbacks.currencies === "function" ? this.retryCallbacks.currencies : null;

        if (shouldFetch) {
            networkStatusManager.setState("currencies", {
                message: networkStatusManager.config.currencies.loadingMessage,
                spinner: true,
                disableSelect: true
            });

            try {
                const responseJson = await fetchJsonWithRetry(tProxyBase + "/api/Ticker/json/currencies", {
                    attempts: FETCH_MAX_ATTEMPTS,
                    timeout: FETCH_TIMEOUT_MS,
                    retryBaseDelay: RETRY_BASE_DELAY_MS,
                    onAttemptStart: function(info) {
                        if (info.attempt === 1) {
                            networkStatusManager.setState("currencies", {
                                message: networkStatusManager.config.currencies.loadingMessage,
                                spinner: true,
                                disableSelect: true
                            });
                        } else {
                            networkStatusManager.setState("currencies", {
                                message: networkStatusManager.config.currencies.retryMessage,
                                spinner: true,
                                disableSelect: true,
                                tone: "warning"
                            });
                        }
                    },
                    onAttemptError: function(info) {
                        console.error("Currencies fetch attempt " + info.attempt + " failed", info.error);
                    }
                });

                currencies = Array.isArray(responseJson) ? responseJson.slice(0) : [];
                setCachedEntry(cacheKey, currencies);
                networkStatusManager.clear("currencies");
            } catch (err) {
                console.error("Failed to load currencies", err);
                this.log("getCurrencies error", err);

                if (cachedEntry && Array.isArray(cachedEntry.data) && cachedEntry.data.length > 0) {
                    networkStatusManager.setState("currencies", {
                        message: "Using cached currencies. Connection issue detected.",
                        spinner: false,
                        disableSelect: false,
                        tone: "warning",
                        showRetry: !!retryHandler,
                        onRetry: retryHandler
                    });
                    networkStatusManager.showWarning("currencies", buildStaleDataMessage(cachedEntry.timestamp));
                    return cachedEntry.data;
                }

                networkStatusManager.setState("currencies", {
                    message: "Network error. Please check connection and try again.",
                    spinner: false,
                    disableSelect: true,
                    tone: "error",
                    showRetry: !!retryHandler,
                    onRetry: retryHandler
                });
                networkStatusManager.showWarning("currencies", "");
                return [];
            }
        } else if (cachedEntry) {
            networkStatusManager.clear("currencies");
            networkStatusManager.showWarning("currencies", "");
            return cachedEntry.data;
        }

        const normalizedCurrencies = Array.isArray(currencies) ? currencies : [];
        this.log("getCurrencies", normalizedCurrencies);
        networkStatusManager.showWarning("currencies", "");
        return normalizedCurrencies;

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

        // Legacy pair pipe fallback; remove when PI drops combined value support.
        const pairElements = this.splitPairValue(incoming["pair"]);
        if (pairElements) {
            for (const k in pairElements) {
                if (Object.prototype.hasOwnProperty.call(pairElements, k)) {
                    incoming[k] = pairElements[k];
                }
            }
        }
        setCurrentSettings(incoming);
        this.refreshValues();
        this.displayExpressionErrors({});
    },
    checkNewSettings: function() {
        this.log("checkNewSettings");

        // Pull DOM values into `currentSettings` snapshot.
        for (const k in settingsConfig) {
            const settingConfig = settingsConfig[k];
            if (settingConfig["getValue"]) {
                currentSettings[k] = settingConfig["getValue"]() || settingConfig["default"];
            } else if (settingConfig["value"]) {
                currentSettings[k] = settingConfig["value"].value || settingConfig["default"];
            }
        }

        const sanitizedSettings = setCurrentSettings(currentSettings);
        const validation = this.validateRuleExpressions(sanitizedSettings);
        this.displayExpressionErrors(validation.errors);
        if (validation.hasErrors) {
            this.log("Expression validation failed", validation.errors);
            return;
        }

        this.saveSettings();
    },
    refreshValues: function() {
        this.log("refreshValues");

        if (lastDisplayedExchange !== currentSettings["exchange"]) {
            this.initPairsDropDown();
            return;
        }

        // Push stored settings into inputs.
        for (const k in settingsConfig) {
            const settingConfig = settingsConfig[k];
            if (settingConfig["setValue"]) {
                settingConfig["setValue"](currentSettings[k]);
            } else if (settingConfig["value"]) {
                settingConfig["value"].value = currentSettings[k];
            }
        }

        this.syncPairSelectionDisplay();
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
        if (!elements) {
            return;
        }

        for (let index = 0; index < elements.length; index++) {
            elements[index].style.display = display;
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

function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, infoJson, actionInfoJson) {
    uuid = inUUID;
    // Stream Deck passes strings; parse the JSON payloads before using them.
    actionInfo = JSON.parse(actionInfoJson); // cache the info
    const parsedInfo = JSON.parse(infoJson);
    websocket = new WebSocket('ws://127.0.0.1:' + inPort);

    // Load saved PI settings if provided.
    pi.extractSettings(actionInfo.payload.settings);
    // console.log(actionInfo.payload.settings);

    // Register PI once the websocket reports `onopen`.
    websocket.onopen = function () {
        const json = {
            event: inRegisterEvent,
            uuid: inUUID,
            info: parsedInfo
        };
        // register property inspector to Stream Deck
        websocket.send(JSON.stringify(json));
    };

    websocket.onmessage = function (evt) {
        // Received message from Stream Deck
        JSON.parse(evt.data);
        // console.log("Received message", jsonObj);
    };
}

if (typeof window !== "undefined") {
    window.connectElgatoStreamDeckSocket = connectElgatoStreamDeckSocket;
}
