"use strict";
(function (root, factory) {
    const exports = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = exports;
    }
    if (root && typeof root === "object") {
        root.CryptoTickerFormatters = exports;
    }
}(typeof self !== "undefined" ? self : this, function () {
    // Use const assertion for literal types
    const NUMERIC_FORMATS = ["auto", "full", "compact", "plain"];
    // Use readonly tuple for compact units
    const COMPACT_UNITS = [
        { value: 1000000000000, suffix: "T" },
        { value: 1000000000, suffix: "B" },
        { value: 1000000, suffix: "M" },
        { value: 1000, suffix: "K" }
    ];
    // Shared formatter for action + PI: handles localization, scaling, compact suffixes, and bad input.
    function getRoundedValue(value, digits, multiplier, format) {
        const formatOption = (format || "auto");
        const parsedDigits = typeof digits === "number" ? digits : parseInt(String(digits !== null && digits !== void 0 ? digits : ""), 10);
        let precision = parsedDigits;
        if (Number.isNaN(precision) || precision < 0) {
            precision = 2;
        }
        const scaledValue = value * (typeof multiplier === "number" ? multiplier : 1);
        const absoluteValue = Math.abs(scaledValue);
        const sign = scaledValue < 0 ? "-" : "";
        function roundWithPrecision(val, localPrecision) {
            const pow = Math.pow(10, localPrecision);
            return Math.round(val * pow) / pow;
        }
        function toLocale(val, options) {
            try {
                return val.toLocaleString(undefined, options);
            }
            catch (err) {
                return val.toString();
            }
        }
        let formattedValue = "";
        const fixedDigits = Math.max(0, precision);
        switch (formatOption) {
            case "full": {
                const roundedFull = roundWithPrecision(absoluteValue, fixedDigits);
                formattedValue = toLocale(roundedFull, {
                    minimumFractionDigits: fixedDigits,
                    maximumFractionDigits: fixedDigits,
                    useGrouping: true
                });
                break;
            }
            case "compact": {
                // T=trillion, B=billion, M=million, K=thousand; pick largest threshold that fits.
                let suffix = "";
                let compactValue = absoluteValue;
                for (const unit of COMPACT_UNITS) {
                    if (absoluteValue >= unit.value) {
                        suffix = unit.suffix;
                        compactValue = absoluteValue / unit.value;
                        break;
                    }
                }
                const roundedCompact = roundWithPrecision(compactValue, fixedDigits);
                formattedValue = toLocale(roundedCompact, {
                    minimumFractionDigits: fixedDigits,
                    maximumFractionDigits: fixedDigits,
                    useGrouping: !suffix
                }) + suffix;
                break;
            }
            case "plain": {
                const roundedPlain = roundWithPrecision(absoluteValue, fixedDigits);
                formattedValue = toLocale(roundedPlain, {
                    minimumFractionDigits: fixedDigits,
                    maximumFractionDigits: fixedDigits,
                    useGrouping: false
                });
                break;
            }
            case "auto":
            default: {
                // Legacy auto mode: add K suffix above 100k threshold only.
                let autoSuffix = "";
                let autoValue = absoluteValue;
                if (absoluteValue > 100000) {
                    autoSuffix = "K";
                    autoValue = absoluteValue / 1000;
                }
                const roundedAuto = roundWithPrecision(autoValue, fixedDigits);
                formattedValue = toLocale(roundedAuto, {
                    minimumFractionDigits: fixedDigits,
                    maximumFractionDigits: fixedDigits,
                    useGrouping: false
                }) + autoSuffix;
                break;
            }
        }
        return sign + formattedValue;
    }
    // Normalize into [0,1] for price cursors; clamp to 0.5 when min==max prevents divide-by-zero.
    function normalizeValue(value, min, max) {
        if (max - min === 0) {
            return 0.5;
        }
        return (value - min) / (max - min);
    }
    return {
        getRoundedValue,
        normalizeValue
    };
}));
