tickerAction.sendCanvas = function () {};

fetch("options.json")
    .then(res => res.json())
    .then(options => {
        const container = document.getElementById("previews");
        options.forEach((opt, index) => {
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
            let canvas = canv;
            let canvasContext = canv.getContext("2d");
            const settings = Object.assign({}, defaultSettings, opt.settings);
            if (settings.mode === "candles" && opt.candles) {
                const candles = tickerAction.getCandlesNormalized(opt.candles);
                tickerAction.updateCanvasCandles(index.toString(), settings, candles);
            } else {
                tickerAction.updateCanvasTicker(index.toString(), settings, opt.values);
            }
        });
    });
