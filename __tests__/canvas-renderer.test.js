const canvasRenderer = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/canvas-renderer");

describe("canvas-renderer helpers", () => {
    test("calculates canvas size multiplier", () => {
        expect(canvasRenderer.getCanvasSizeMultiplier(288, 144)).toBe(2);
    });

    test("limits candle display count", () => {
        expect(canvasRenderer.getCandlesDisplayCount({ candlesDisplayed: "100" })).toBe(60);
        expect(canvasRenderer.getCandlesDisplayCount({ candlesDisplayed: "3" })).toBe(5);
    });
});
