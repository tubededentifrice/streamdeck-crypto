const canvasRenderer = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/canvas-renderer");
const connectionStates = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/providers/connection-states");
const { createMockCanvas } = require("../test-utils/mock-canvas");

describe("canvas-renderer helpers", () => {
    test("calculates canvas size multiplier", () => {
        expect(canvasRenderer.getCanvasSizeMultiplier(288, 144)).toBe(2);
    });

    test("limits candle display count", () => {
        expect(canvasRenderer.getCandlesDisplayCount({ candlesDisplayed: "100" })).toBe(60);
        expect(canvasRenderer.getCandlesDisplayCount({ candlesDisplayed: "3" })).toBe(5);
    });
});

describe("canvas rendering", () => {
    test("renderTickerCanvas draws price, high/low, and connection icon", () => {
        const { canvas, context, operations } = createMockCanvas();
        canvasRenderer.renderTickerCanvas({
            canvas,
            canvasContext: context,
            settings: {
                font: "Lato",
                priceFormat: "plain",
                displayHighLow: "on",
                displayDailyChange: "on",
                displayHighLowBar: "on",
                displayConnectionStatusIcon: "TOP_RIGHT",
                backgroundColor: "#111111",
                textColor: "#ffffff",
                digits: 2,
                highLowDigits: 2,
                fontSizeBase: 20,
                fontSizePrice: 30,
                multiplier: 1
            },
            values: {
                pairDisplay: "BTC/USD",
                last: 20000,
                high: 21000,
                low: 19000,
                changeDailyPercent: 0.0123
            },
            connectionStates,
            connectionState: connectionStates.LIVE,
            context: "ctx"
        });

        expect(operations.find(op => op.type === "fillRect" && op.fillStyle === "#111111")).toBeDefined();
        expect(operations.find(op => op.type === "fillText" && op.text === "BTC/USD")).toBeDefined();
        expect(operations.find(op => op.type === "fillText" && op.text === "20000.00")).toBeDefined();
        expect(operations.find(op => op.type === "fill" && op.fillStyle === "#ffffff")).toBeDefined();
    });

    test("renderTickerCanvas shows stale indicator and timestamp", () => {
        const { canvas, context, operations } = createMockCanvas();
        canvasRenderer.renderTickerCanvas({
            canvas,
            canvasContext: context,
            settings: {
                font: "Lato",
                backgroundColor: "#000000",
                textColor: "#eeeeee",
                displayConnectionStatusIcon: "BOTTOM_LEFT"
            },
            values: { pairDisplay: "ETH/USD", last: 1200, high: 1300, low: 1100 },
            dataState: "stale",
            infoMessage: "Stale data",
            lastValidTimestamp: 1700000000,
            connectionStates,
            connectionState: connectionStates.BROKEN,
            context: "ctx"
        });

        const texts = operations.filter(op => op.type === "fillText").map(op => op.text);
        expect(texts.find(text => text && text.includes("STALE DATA"))).toBeDefined();
        expect(operations.find(op => op.type === "fill" && op.fillStyle === "#f6a623")).toBeDefined();
    });

    test("renderMessageCanvas centers multiline text", () => {
        const { canvas, context, operations } = createMockCanvas();
        canvasRenderer.renderMessageCanvas({
            canvas,
            canvasContext: context,
            message: "Line one\nLine two",
            backgroundColor: "#222222",
            textColor: "#fafafa",
            font: "Lato",
            connectionStates,
            connectionState: connectionStates.DETACHED,
            displayConnectionStatusIcon: "TOP_RIGHT"
        });

        const messageOps = operations.filter(op => op.type === "fillText");
        expect(messageOps).toHaveLength(2);
        messageOps.forEach(op => {
            expect(op.textAlign).toBe("center");
        });
    });

    test("renderCandlesCanvas draws wicks and bodies for normalized candles", () => {
        const { canvas, context, operations } = createMockCanvas();
        canvasRenderer.renderCandlesCanvas({
            canvas,
            canvasContext: context,
            settings: {
                backgroundColor: "#010101",
                textColor: "#ffffff",
                font: "Lato",
                candlesInterval: "1h",
                candlesDisplayed: 10,
                displayConnectionStatusIcon: "OFF"
            },
            candlesNormalized: [
                { timePercent: 0.1, openPercent: 0.4, closePercent: 0.6, highPercent: 0.7, lowPercent: 0.3 },
                { timePercent: 0.9, openPercent: 0.6, closePercent: 0.2, highPercent: 0.8, lowPercent: 0.1 }
            ],
            connectionStates,
            connectionState: connectionStates.LIVE
        });

        expect(operations.filter(op => op.type === "stroke")).not.toHaveLength(0);
        expect(operations.find(op => op.type === "rect")).toBeDefined();
    });
});
