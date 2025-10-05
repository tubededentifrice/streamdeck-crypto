const formatters = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/formatters");

describe("formatters", () => {
    describe("getRoundedValue", () => {
        test("applies multiplier before formatting in auto mode", () => {
            const result = formatters.getRoundedValue(150.1234, 2, 10, "auto");
            expect(result).toBe("1501.23");
        });

        test("falls back to default precision when digits invalid", () => {
            const result = formatters.getRoundedValue(123.456, "abc", 1, "plain");
            expect(result).toBe("123.46");
        });

        test("handles negative values with plain format", () => {
            const result = formatters.getRoundedValue(-9.8765, 3, 1, "plain");
            expect(result).toBe("-9.877");
        });

        test("uses compact suffix only when threshold exceeded", () => {
            const small = formatters.getRoundedValue(999, 1, 1, "compact");
            expect(small).toBe("999.0");

            const large = formatters.getRoundedValue(1500000, 2, 1, "compact");
            expect(large).toBe("1.50M");
        });

        test("formats with grouping in full mode", () => {
            const formatted = formatters.getRoundedValue(123456.789, 2, 1, "full");
            expect(formatted.replace(/,/g, "")).toBe("123456.79");
        });
    });

    describe("normalizeValue", () => {
        test("returns middle when min equals max", () => {
            expect(formatters.normalizeValue(10, 10, 10)).toBe(0.5);
        });

        test("clamps to 0 when below min", () => {
            expect(formatters.normalizeValue(-5, 0, 10)).toBeLessThanOrEqual(0);
        });

        test("clamps to 1 when above max", () => {
            expect(formatters.normalizeValue(25, 0, 10)).toBeGreaterThanOrEqual(1);
        });

        test("computes ratio within range", () => {
            expect(formatters.normalizeValue(5, 0, 20)).toBeCloseTo(0.25);
        });
    });
});
