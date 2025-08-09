const DEFAULT_RANGE = 1;
const SAMPLE_CANDLE_COUNT = 20;

tickerAction.sendCanvas = function () {};

function generateSampleCandles(values) {
    const candles = [];
    const high = values.high || 0;
    const low = values.low || 0;
    const volumeQuote = values.volume || 0;
    const range = high - low || DEFAULT_RANGE;
    const count = SAMPLE_CANDLE_COUNT;
    for (let i = 0; i < count; i++) {
        const open = low + (range * i) / count;
        const close = low + (range * (i + 0.5)) / count;
        const highVal = Math.max(open, close) + range * 0.05;
        const lowVal = Math.min(open, close) - range * 0.05;
        candles.push({
            ts: i,
            open: open,
            close: close,
            high: highVal,
            low: lowVal,
            volumeQuote: volume
        });
    }
    return tickerAction.getCandlesNormalized(candles);
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
        const settings = Object.assign({}, defaultSettings, opt.settings);
        const settingsDiv = document.createElement("pre");
        settingsDiv.className = "settings";
        settingsDiv.textContent = JSON.stringify(settings, null, 4);
        group.appendChild(settingsDiv);
        container.appendChild(group);

        canvas = tickerCanvas;
        canvasContext = tickerCanvas.getContext("2d");
        let tickerValues;
        if (usePrecomputed && opt.values) {
            tickerValues = opt.values;
        } else {
            tickerValues = await tickerAction.getTickerValue(
                settings.pair,
                settings.currency,
                settings.exchange
            );
        }
        tickerAction.updateCanvasTicker(index + "-ticker", settings, tickerValues);

        canvas = candleCanvas;
        canvasContext = candleCanvas.getContext("2d");
        let candleValues;
        if (usePrecomputed && opt.values) {
            candleValues = generateSampleCandles(opt.values);
        } else {
            candleValues = await tickerAction.getCandles(settings);
        }
        tickerAction.updateCanvasCandles(index + "-candles", settings, candleValues);
    }
}

document.getElementById("precomputedToggle").addEventListener("change", loadPreviews);
loadPreviews();
