"use strict";

(function (root: Record<string, unknown> | undefined, factory: () => CryptoTickerFormatters) {
    const exports = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = exports;
    }
    if (root && typeof root === "object") {
        (root as FormattersGlobalRoot).CryptoTickerFormatters = exports;
    }
}(typeof self !== "undefined" ? (self as unknown as Record<string, unknown>) : (this as unknown as Record<string, unknown>), function (): CryptoTickerFormatters {
    // Use const assertion for literal types
    const NUMERIC_FORMATS = ["auto", "full", "compact", "plain"] as const;
    type NumericFormatMode = typeof NUMERIC_FORMATS[number];

    const COMPACT_UNITS = [
        { value: 1_000_000_000_000, suffix: "T" },
        { value: 1_000_000_000, suffix: "B" },
        { value: 1_000_000, suffix: "M" },
        { value: 1_000, suffix: "K" }
    ] as const;

    const DEFAULT_THOUSANDS_SEPARATOR = ",";
    const DEFAULT_DECIMAL_SEPARATOR = ".";

    function resolveSeparators(options?: NumericSeparatorOptions | null) {
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
    function getRoundedValue(
        value: number,
        digits: number | string | null | undefined,
        multiplier: number | null | undefined,
        format?: string | null,
        separators?: NumericSeparatorOptions | null
    ): string {
        // Backward compatibility: map old values to new ones
        const formatOption = (format || "auto") as NumericFormatMode;
        const parsedDigits = typeof digits === "number" ? digits : parseInt(String(digits ?? ""), 10);
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

        function roundWithPrecision(val: number, localPrecision: number): number {
            const pow = Math.pow(10, localPrecision);
            return Math.round(val * pow) / pow;
        }

        function formatRounded(val: number, useGrouping: boolean): string {
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
    function normalizeValue(value: number, min: number, max: number): number {
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

interface NumericSeparatorOptions {
    thousandsSeparator?: string | null | undefined;
    decimalSeparator?: string | null | undefined;
}

interface FormattersGlobalRoot extends Record<string, unknown> {
    CryptoTickerFormatters?: CryptoTickerFormatters;
}

interface CryptoTickerFormatters {
    getRoundedValue(
        value: number,
        digits: number | string | null | undefined,
        multiplier: number | null | undefined,
        format?: string | null,
        separators?: NumericSeparatorOptions | null
    ): string;
    normalizeValue(value: number, min: number, max: number): number;
}
