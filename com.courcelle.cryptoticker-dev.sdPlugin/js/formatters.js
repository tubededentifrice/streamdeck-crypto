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
    const COMPACT_UNITS = [
        { value: 1000000000000, suffix: "T" },
        { value: 1000000000, suffix: "B" },
        { value: 1000000, suffix: "M" },
        { value: 1000, suffix: "K" }
    ];
    const DEFAULT_THOUSANDS_SEPARATOR = ",";
    const DEFAULT_DECIMAL_SEPARATOR = ".";
    function resolveSeparators(options) {
        const thousandsCandidate = options && typeof options.thousandsSeparator === "string"
            ? options.thousandsSeparator
            : null;
        const decimalCandidate = options && typeof options.decimalSeparator === "string"
            ? options.decimalSeparator
            : null;
        const thousandsSeparator = thousandsCandidate && thousandsCandidate.length > 0
            ? thousandsCandidate
            : DEFAULT_THOUSANDS_SEPARATOR;
        const decimalSeparator = decimalCandidate && decimalCandidate.length > 0
            ? decimalCandidate
            : DEFAULT_DECIMAL_SEPARATOR;
        return {
            thousandsSeparator,
            decimalSeparator
        };
    }
    // Shared formatter for action + PI: handles localization, scaling, compact suffixes, and bad input.
    function getRoundedValue(value, digits, multiplier, format, separators) {
        // Backward compatibility: map old values to new ones
        const formatOption = (format || "auto");
        const parsedDigits = typeof digits === "number" ? digits : parseInt(String(digits !== null && digits !== void 0 ? digits : ""), 10);
        let precision = parsedDigits;
        if (Number.isNaN(precision) || precision < 0) {
            precision = 2;
        }
        const scaledValue = value * (typeof multiplier === "number" ? multiplier : 1);
        const absoluteValue = Math.abs(scaledValue);
        const sign = scaledValue < 0 ? "-" : "";
        const resolvedSeparators = resolveSeparators(separators);
        const thousandsSeparator = resolvedSeparators.thousandsSeparator;
        const decimalSeparator = resolvedSeparators.decimalSeparator;
        function roundWithPrecision(val, localPrecision) {
            const pow = Math.pow(10, localPrecision);
            return Math.round(val * pow) / pow;
        }
        function formatRounded(val, useGrouping) {
            const fixedString = val.toFixed(fixedDigits);
            let integerPart = fixedString;
            let fractionalPart = "";
            const decimalIndex = fixedString.indexOf(".");
            if (decimalIndex >= 0) {
                integerPart = fixedString.slice(0, decimalIndex);
                fractionalPart = fixedString.slice(decimalIndex + 1);
            }
            let groupedInteger = integerPart;
            if (useGrouping && thousandsSeparator) {
                groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
            }
            if (fractionalPart && fixedDigits > 0) {
                return groupedInteger + decimalSeparator + fractionalPart;
            }
            if (fixedDigits > 0) {
                return groupedInteger + decimalSeparator + "0".repeat(fixedDigits);
            }
            return groupedInteger;
        }
        let formattedValue = "";
        const fixedDigits = Math.max(0, precision);
        switch (formatOption) {
            case "full":
            case "plain": {
                const roundedPlain = roundWithPrecision(absoluteValue, fixedDigits);
                formattedValue = formatRounded(roundedPlain, formatOption === "full");
                break;
            }
            case "auto":
            case "compact":
            default: {
                // T=trillion, B=billion, M=million, K=thousand; pick largest threshold that fits.
                let suffix = "";
                let compactValue = absoluteValue;
                for (const unit of COMPACT_UNITS) {
                    // Keep thousands readable unless the number is large enough, but allow higher units sooner for clarity.
                    const threshold = unit.suffix === "K" ? unit.value * 100 : unit.value;
                    if (absoluteValue >= threshold) {
                        suffix = unit.suffix;
                        compactValue = absoluteValue / unit.value;
                        break;
                    }
                }
                const roundedCompact = roundWithPrecision(compactValue, fixedDigits);
                formattedValue = formatRounded(roundedCompact, !suffix) + suffix;
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
