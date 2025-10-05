/* global tickerAction */

const DEFAULT_RANGE = 1;
const SAMPLE_CANDLE_COUNT = 20;
const CANDLE_MARGIN_FACTOR = 0.05;

const globalScope = typeof window !== "undefined" ? window : globalThis;
const defaultsModule = typeof CryptoTickerDefaults !== "undefined" ? CryptoTickerDefaults : null;
const previewTickerAction = typeof tickerAction !== "undefined" ? tickerAction : null;

if (!previewTickerAction) {
    throw new Error("Ticker action dependency is missing for the preview page");
}

const previewBaseDefaults = defaultsModule && typeof defaultsModule.getDefaultSettings === "function"
    ? defaultsModule.getDefaultSettings()
    : (typeof previewTickerAction.getDefaultSettings === "function"
        ? previewTickerAction.getDefaultSettings()
        : {});

const applyPreviewDefaults = defaultsModule && typeof defaultsModule.applyDefaults === "function"
    ? function (partial) {
        return defaultsModule.applyDefaults(partial || {});
    }
    : function (partial) {
        return Object.assign({}, previewBaseDefaults, partial || {});
    };

previewTickerAction.sendCanvas = function () {};

function assignCanvasGlobals(canvasElement) {
    globalScope.canvas = canvasElement;
    globalScope.canvasContext = canvasElement.getContext("2d");
}

function generateSampleCandles(values) {
    const candles = [];
    const high = values.high || 0;
    const low = values.low || 0;
    const volume = values.volume || 0;
    const range = high - low || DEFAULT_RANGE;
    const count = SAMPLE_CANDLE_COUNT;
    for (let i = 0; i < count; i++) {
        const open = low + (range * i) / count;
        const close = low + (range * (i + 0.5)) / count;
        const highVal = Math.max(open, close) + range * CANDLE_MARGIN_FACTOR;
        const lowVal = Math.min(open, close) - range * CANDLE_MARGIN_FACTOR;
        candles.push({
            ts: i,
            open: open,
            close: close,
            high: highVal,
            low: lowVal,
            volumeQuote: volume
        });
    }
    return previewTickerAction.getCandlesNormalized(candles);
}

async function loadPreviews() {
    const usePrecomputed = document.getElementById("precomputedToggle").checked;
    const response = await fetch("/dev/options.json");
    const options = await response.json();
    const container = document.getElementById("previews");
    container.innerHTML = "";
    for (let index = 0; index < options.length; index++) {
        const opt = options[index];
        const group = document.createElement("div");
        group.className = "preview-group";
        const canvasRow = document.createElement("div");
        canvasRow.className = "canvas-row";
        const tickerCanvas = document.createElement("canvas");
        tickerCanvas.width = 288;
        tickerCanvas.height = 288;
        canvasRow.appendChild(tickerCanvas);
        const candleCanvas = document.createElement("canvas");
        candleCanvas.width = 288;
        candleCanvas.height = 288;
        canvasRow.appendChild(candleCanvas);
        group.appendChild(canvasRow);
        const label = document.createElement("div");
        label.className = "label";
        label.textContent = opt.name || "Option " + (index + 1);
        group.appendChild(label);
        const settings = applyPreviewDefaults(opt.settings);
        const settingsDiv = document.createElement("pre");
        settingsDiv.className = "settings";
        settingsDiv.textContent = JSON.stringify(settings, null, 4);
        group.appendChild(settingsDiv);
        container.appendChild(group);

        assignCanvasGlobals(tickerCanvas);
        let tickerValues;
        if (usePrecomputed && opt.values) {
            tickerValues = opt.values;
        } else {
            tickerValues = await previewTickerAction.getTickerValue(
                settings.pair,
                settings.currency,
                settings.exchange
            );
        }
        previewTickerAction.updateCanvasTicker(index + "-ticker", settings, tickerValues, tickerValues && tickerValues.connectionState);

        assignCanvasGlobals(candleCanvas);
        let candleValues;
        if (usePrecomputed && opt.values) {
            candleValues = generateSampleCandles(opt.values);
        } else {
            candleValues = await previewTickerAction.getCandles(settings);
        }
        previewTickerAction.updateCanvasCandles(index + "-candles", settings, candleValues, tickerValues && tickerValues.connectionState);
    }
}

document.getElementById("precomputedToggle").addEventListener("change", loadPreviews);
loadPreviews();
