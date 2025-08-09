tickerAction.sendCanvas = function () {};

async function loadPreviews() {
    const response = await fetch("/dev/options.json");
    const options = await response.json();
    const container = document.getElementById("previews");
    for (let index = 0; index < options.length; index++) {
        const opt = options[index];
        const wrapper = document.createElement("div");
        wrapper.className = "preview";
        const canv = document.createElement("canvas");
        canv.width = 288;
        canv.height = 288;
        wrapper.appendChild(canv);
        const label = document.createElement("div");
        label.className = "label";
        label.textContent = opt.name || "Option " + (index + 1);
        wrapper.appendChild(label);
        container.appendChild(wrapper);

        canvas = canv;
        canvasContext = canv.getContext("2d");
        const settings = Object.assign({}, defaultSettings, opt.settings);
        if (settings.mode === "candles") {
            const candles = await tickerAction.getCandles(settings);
            tickerAction.updateCanvasCandles(index.toString(), settings, candles);
        } else {
            const values = await tickerAction.getTickerValue(
                settings.pair,
                settings.currency,
                settings.exchange
            );
            tickerAction.updateCanvasTicker(index.toString(), settings, values);
        }
    }
}

loadPreviews();
