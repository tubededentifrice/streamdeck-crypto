const formatters = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/formatters");

describe("formatters", () => {
    test("getRoundedValue handles compact format", () => {
        expect(formatters.getRoundedValue(150000, 2, 1, "compact")).toBe("150.00K");
    });

    test("normalizeValue centers when range is zero", () => {
        expect(formatters.normalizeValue(10, 10, 10)).toBe(0.5);
    });
});
