(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.CryptoTickerDefaults = factory();
    }
}(typeof self !== "undefined" ? self : this, function () {
    // Minimal deep clone so defaults stay isolated between PI and action contexts.
    function clone(obj) {
        if (obj === null || typeof obj !== "object") {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(clone);
        }
        const copy = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                copy[key] = clone(obj[key]);
            }
        }
        return copy;
    }

    // Build schema-driven string normalizer handling trim/case/allow-lists in one place.
    function buildStringNormalizer(options) {
        const normalizeCase = options && options.case;
        const allowEmpty = options && options.allowEmptyString === true;
        const allowNull = options && options.allowNull === true;
        const trim = options && Object.prototype.hasOwnProperty.call(options, "trim") ? options.trim : true;
        const allowedValues = options && Array.isArray(options.allowedValues) ? options.allowedValues : null;

        return function normalizeString(value) {
            if (value === undefined) {
                return null;
            }

            if (value === null) {
                return allowNull ? null : "";
            }

            let str = String(value);
            if (trim) {
                str = str.trim();
            }

            if (!str && !allowEmpty) {
                return null;
            }

            if (normalizeCase === "upper") {
                str = str.toUpperCase();
            } else if (normalizeCase === "lower") {
                str = str.toLowerCase();
            }

            if (allowedValues && allowedValues.length > 0) {
                const lookup = normalizeCase === "lower"
                    ? str.toLowerCase()
                    : normalizeCase === "upper"
                        ? str.toUpperCase()
                        : str;

                const matches = allowedValues.some(function (allowed) {
                    if (normalizeCase === "lower") {
                        return allowed.toLowerCase() === lookup;
                    }
                    if (normalizeCase === "upper") {
                        return allowed.toUpperCase() === lookup;
                    }
                    return allowed === lookup;
                });

                if (!matches) {
                    return null;
                }

                if (normalizeCase === "lower") {
                    return lookup;
                }
                if (normalizeCase === "upper") {
                    return lookup;
                }
                return str;
            }

            return str;
        };
    }

    // Normalize numeric inputs consistently (slider/text/PI) with optional clamp + integer support.
    function buildNumberNormalizer(options) {
        const min = options && typeof options.min === "number" ? options.min : null;
        const max = options && typeof options.max === "number" ? options.max : null;
        const integer = options && options.integer === true;

        return function normalizeNumber(value) {
            if (value === undefined || value === null || value === "") {
                return null;
            }

            let numeric = typeof value === "number" ? value : parseFloat(String(value));
            if (isNaN(numeric)) {
                return null;
            }

            if (integer) {
                numeric = Math.round(numeric);
            }

            if (min !== null && numeric < min) {
                numeric = min;
            }

            if (max !== null && numeric > max) {
                numeric = max;
            }

            return numeric;
        };
    }

    // Schema defines type, default, and normalize fn for each setting; drives validation + coercion.
    const settingsSchema = {
        title: {
            type: "string",
            default: "",
            normalize: buildStringNormalizer({ allowEmptyString: true, allowNull: true, trim: true })
        },
        exchange: {
            type: "string",
            default: "BINANCE",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "upper" })
        },
        pair: {
            type: "string",
            default: "BTCUSD",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "upper" })
        },
        fromCurrency: {
            type: "string",
            default: "USD",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "upper" })
        },
        currency: {
            type: "string",
            default: "",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: true, case: "upper", allowNull: true })
        },
        candlesInterval: {
            type: "string",
            default: "1h",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false })
        },
        candlesDisplayed: {
            type: "number",
            default: 20,
            normalize: buildNumberNormalizer({ min: 5, max: 60, integer: true })
        },
        multiplier: {
            type: "number",
            default: 1,
            normalize: buildNumberNormalizer({ min: 0 })
        },
        digits: {
            type: "number",
            default: 2,
            normalize: buildNumberNormalizer({ min: 0, max: 10, integer: true })
        },
        highLowDigits: {
            type: "string",
            default: "",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: true })
        },
        font: {
            type: "string",
            default: "Lato,'Roboto Condensed',Helvetica,Calibri,sans-serif",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false })
        },
        fontSizeBase: {
            type: "number",
            default: 25,
            normalize: buildNumberNormalizer({ min: 1, max: 200, integer: true })
        },
        fontSizePrice: {
            type: "number",
            default: 35,
            normalize: buildNumberNormalizer({ min: 1, max: 200, integer: true })
        },
        fontSizeHighLow: {
            type: "string",
            default: "",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: true })
        },
        fontSizeChange: {
            type: "number",
            default: 19,
            normalize: buildNumberNormalizer({ min: 1, max: 200, integer: true })
        },
        priceFormat: {
            type: "string",
            default: "compact",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "lower" })
        },
        backgroundColor: {
            type: "string",
            default: "#000000",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false })
        },
        textColor: {
            type: "string",
            default: "#ffffff",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false })
        },
        displayHighLow: {
            type: "string",
            default: "on",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "lower", allowedValues: ["on", "off"] })
        },
        displayHighLowBar: {
            type: "string",
            default: "on",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "lower", allowedValues: ["on", "off"] })
        },
        displayDailyChange: {
            type: "string",
            default: "on",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "lower", allowedValues: ["on", "off"] })
        },
        displayConnectionStatusIcon: {
            type: "string",
            default: "OFF",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "upper", allowedValues: ["OFF", "TOP_RIGHT", "BOTTOM_LEFT"] })
        },
        alertRule: {
            type: "string",
            default: "",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: true })
        },
        backgroundColorRule: {
            type: "string",
            default: "",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: true })
        },
        textColorRule: {
            type: "string",
            default: "",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: true })
        },
        mode: {
            type: "string",
            default: "ticker",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "lower", allowedValues: ["ticker", "candles"] })
        }
    };

    // Core coercion pipeline: normalize value and return optional error so callers can surface validation once.
    function coerceValue(schemaEntry, value, hasValue) {
        if (!schemaEntry || typeof schemaEntry !== "object") {
            return { value: value, error: null };
        }

        const normalizer = schemaEntry.normalize;
        const defaultValue = schemaEntry.default;
        if (typeof normalizer !== "function") {
            return {
                value: value === undefined ? clone(defaultValue) : value,
                error: null
            };
        }

        const normalized = normalizer(value);
        if (normalized === null || normalized === undefined) {
            const fallback = normalizer(defaultValue);
            return {
                value: fallback,
                error: hasValue ? "Invalid " + schemaEntry.type : null
            };
        }

        return {
            value: normalized,
            error: null
        };
    }

    // Validate settings but keep unknown keys for forward compatibility.
    function validateSettings(input) {
        const provided = input && typeof input === "object" ? input : {};
        const normalized = {};
        const errors = [];

        for (const key in settingsSchema) {
            if (!Object.prototype.hasOwnProperty.call(settingsSchema, key)) {
                continue;
            }
            const schemaEntry = settingsSchema[key];
            const hasValue = Object.prototype.hasOwnProperty.call(provided, key);
            const rawValue = hasValue ? provided[key] : undefined;
            const result = coerceValue(schemaEntry, rawValue, hasValue);
            normalized[key] = result.value;
            if (result.error) {
                errors.push({ key: key, message: result.error });
            }
        }

        // Pass-through unknown keys so future settings remain after downgrade.
        for (const extraKey in provided) {
            if (!Object.prototype.hasOwnProperty.call(settingsSchema, extraKey) && Object.prototype.hasOwnProperty.call(provided, extraKey)) {
                normalized[extraKey] = provided[extraKey];
            }
        }

        return {
            settings: normalized,
            errors: errors
        };
    }

    function applyDefaults(partialSettings) {
        const result = validateSettings(partialSettings);
        return result.settings;
    }

    const defaultSettings = applyDefaults(null);

    return {
        settingsSchema: settingsSchema,
        defaultSettings: defaultSettings,
        getDefaultSettings: function () {
            return clone(defaultSettings);
        },
        validateSettings: function (settings) {
            const result = validateSettings(settings);
            return {
                settings: result.settings,
                errors: result.errors.slice(0)
            };
        },
        applyDefaults: applyDefaults
    };
}));
