"use strict";

(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.CryptoTickerFormatters = factory();
    }
}(typeof self !== "undefined" ? self : this, function () {
    // Entry point used by both the plugin and PI to print numbers. Handles
    // localization, optional scaling (multiplier), and compact suffixes while
    // staying resilient to bogus input from upstream providers.
    function getRoundedValue(value, digits, multiplier, format) {
        const formatOption = format || "auto";
        let precision = parseInt(digits);
        if (isNaN(precision) || precision < 0) {
            precision = 2;
        }

        const scaledValue = value * multiplier;
        const absoluteValue = Math.abs(scaledValue);
        const sign = scaledValue < 0 ? "-" : "";

        function roundWithPrecision(val, localPrecision) {
            const pow = Math.pow(10, localPrecision);
            return Math.round(val * pow) / pow;
        }

        function toLocale(val, options) {
            try {
                return val.toLocaleString(undefined, options);
            } catch (err) {
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
                const units = [
                    { value: 1000000000000, suffix: "T" },
                    { value: 1000000000, suffix: "B" },
                    { value: 1000000, suffix: "M" },
                    { value: 1000, suffix: "K" }
                ];
                let suffix = "";
                let compactValue = absoluteValue;
                for (const unit of units) {
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

    // Maps a raw numeric value into a [0,1] domain. Used for price cursors on
    // the high/low bar; guard against `min === max` to avoid a divide-by-zero
    // when exchanges deliver flat data.
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
