"use strict";

(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory(require("./alert-manager"), require("./formatters"));
    } else {
        root.CryptoTickerCanvasRenderer = factory(root.CryptoTickerAlertManager, root.CryptoTickerFormatters);
    }
}(typeof self !== "undefined" ? self : this, function (alertManager, formatters) {
    if (!alertManager) {
        throw new Error("Alert manager dependency is missing");
    }
    if (!formatters) {
        throw new Error("Formatters dependency is missing");
    }

    function getCanvasSizeMultiplier(canvasWidth, canvasHeight) {
        return Math.max(canvasWidth / 144, canvasHeight / 144);
    }

    function getCandlesDisplayCount(settings) {
        const parsed = parseInt(settings["candlesDisplayed"]);
        if (isNaN(parsed)) {
            return 20;
        }
        return Math.min(60, Math.max(5, parsed));
    }

    function renderConnectionStatusIcon(params) {
    const canvasContext = params.canvasContext;
    const canvas = params.canvas;
    const state = params.state;
    const color = params.color;
    const sizeMultiplier = params.sizeMultiplier;
    const position = params.position;
    const connectionStates = params.connectionStates;

    if (!state) {
        return;
    }

    const pos = (position || "OFF").toUpperCase();
    if (pos === "OFF") {
        return;
    }

    const iconState = String(state).toLowerCase();
    const iconSize = 20 * sizeMultiplier;
    const margin = 4 * sizeMultiplier;

    let x = canvas.width - iconSize - margin;
    let y = margin;
    if (pos === "BOTTOM_LEFT") {
        x = margin;
        y = canvas.height - iconSize - margin;
    }

    canvasContext.save();
    canvasContext.translate(x, y);
    canvasContext.lineWidth = Math.max(1.5 * sizeMultiplier, 1);
    canvasContext.strokeStyle = color;
    canvasContext.fillStyle = color;

    function drawPolygon(points) {
        if (!Array.isArray(points) || points.length === 0) {
            return;
        }
        canvasContext.beginPath();
        for (let i = 0; i < points.length; i++) {
            const pt = points[i];
            const px = pt[0] * iconSize;
            const py = pt[1] * iconSize;
            if (i === 0) {
                canvasContext.moveTo(px, py);
            } else {
                canvasContext.lineTo(px, py);
            }
        }
        canvasContext.closePath();
        canvasContext.fill();
    }

    if (iconState === connectionStates.LIVE) {
        drawPolygon([
            [0.7545784909869392, 0],
            [0.18263591551829597, 0.5685964091677761],
            [0.3947756629367107, 0.5685964091677761],
            [0.23171302126434715, 1],
            [0.8173281041988991, 0.43136761054941897],
            [0.6051523764976793, 0.43136761054941897]
        ]);
    } else if (iconState === connectionStates.DETACHED) {
        drawPolygon([
            [0.0, 0.45], [0.4, 0.45], [0.4, 0.6], [0.0, 0.6]
        ]);
        drawPolygon([
            [0.6, 0.45], [1.0, 0.45], [1.0, 0.6], [0.6, 0.6]
        ]);
    } else if (iconState === connectionStates.BACKUP) {
        drawPolygon([
            [0.0, 0.3], [0.4, 0.3], [0.4, 0.38], [0.0, 0.38]
        ]);
        drawPolygon([
            [0.6, 0.3], [1.0, 0.3], [1.0, 0.38], [0.6, 0.38]
        ]);

        drawPolygon([
            [0.0, 0.62], [0.4, 0.62], [0.4, 0.7], [0.0, 0.7]
        ]);
        drawPolygon([
            [0.6, 0.62], [1.0, 0.62], [1.0, 0.7], [0.6, 0.7]
        ]);
    } else if (iconState === connectionStates.BROKEN) {
        function drawRoundedRect(width, height, radius) {
            const r = Math.min(radius, Math.min(width, height) / 2);
            canvasContext.beginPath();
            canvasContext.moveTo(r, 0);
            canvasContext.lineTo(width - r, 0);
            canvasContext.quadraticCurveTo(width, 0, width, r);
            canvasContext.lineTo(width, height - r);
            canvasContext.quadraticCurveTo(width, height, width - r, height);
            canvasContext.lineTo(r, height);
            canvasContext.quadraticCurveTo(0, height, 0, height - r);
            canvasContext.lineTo(0, r);
            canvasContext.quadraticCurveTo(0, 0, r, 0);
            canvasContext.closePath();
            canvasContext.fill();
        }

        const linkWidth = iconSize * 0.55;
        const linkHeight = iconSize * 0.28;
        const linkRadius = iconSize * 0.12;
        const rotation = -Math.PI / 6;

        canvasContext.save();
        canvasContext.translate(iconSize * 0.08, iconSize * 0.4);
        canvasContext.rotate(rotation);
        drawRoundedRect(linkWidth, linkHeight, linkRadius);
        canvasContext.restore();

        canvasContext.save();
        canvasContext.translate(iconSize * 0.45, iconSize * 0.05);
        canvasContext.rotate(rotation);
        drawRoundedRect(linkWidth, linkHeight, linkRadius);
        canvasContext.restore();

        drawPolygon([
            [0.38, 0.32], [0.55, 0.22], [0.62, 0.38], [0.5, 0.48], [0.56, 0.62], [0.4, 0.58]
        ]);
    }

    canvasContext.restore();
    }

    function renderTickerCanvas(params) {
    const canvas = params.canvas;
    const canvasContext = params.canvasContext;
    const settings = params.settings || {};
    const values = params.values || {};
    const context = params.context;
    const connectionStates = params.connectionStates;
    const connectionState = params.connectionState;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const sizeMultiplier = getCanvasSizeMultiplier(canvasWidth, canvasHeight);

    const textPadding = 10 * sizeMultiplier;

    const pair = settings["pair"];
    const pairDisplay = settings["title"] || values["pairDisplay"] || pair;
    const multiplier = settings["multiplier"] || 1;
    const priceFormat = settings["priceFormat"] || "compact";

    function parseNumberSetting(value, fallback) {
        const parsed = parseFloat(value);
        if (isNaN(parsed) || parsed <= 0) {
            return fallback;
        }
        return parsed;
    }

    function parseDigitsSetting(value, fallback) {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed < 0) {
            return fallback;
        }
        return parsed;
    }

    const digits = parseDigitsSetting(settings["digits"], 2);
    const highLowDigits = parseDigitsSetting(settings["highLowDigits"], digits);
    const baseFontSize = parseNumberSetting(settings["fontSizeBase"], 25);
    const priceFontSize = parseNumberSetting(settings["fontSizePrice"], baseFontSize * 35 / 25);
    const highLowFontSize = parseNumberSetting(settings["fontSizeHighLow"], baseFontSize);
    const changeFontSize = parseNumberSetting(settings["fontSizeChange"], baseFontSize * 19 / 25);
    let backgroundColor = settings["backgroundColor"] || "#000000";
    let textColor = settings["textColor"] || "#ffffff";
    const effectiveConnectionState = connectionState || values.connectionState || null;

    const changeDailyPercent = values.changeDailyPercent || 0;
    const changePercent = changeDailyPercent * 100;

    const alertEvaluation = alertManager.evaluateAlert({
        context: context,
        settings: settings,
        values: values,
        backgroundColor: backgroundColor,
        textColor: textColor
    });

    const alert = alertEvaluation.alertMode;
    backgroundColor = alertEvaluation.backgroundColor;
    textColor = alertEvaluation.textColor;

    if (settings["backgroundColorRule"]) {
        try {
            backgroundColor = eval(settings["backgroundColorRule"]) || backgroundColor;
        } catch (err) {
            console.error("Error evaluating backgroundColorRule", context, settings, values, err);
        }
    }
    if (settings["textColorRule"]) {
        try {
            textColor = eval(settings["textColorRule"]) || textColor;
        } catch (err) {
            console.error("Error evaluating textColorRule", context, settings, values, err);
        }
    }

    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
    canvasContext.fillStyle = backgroundColor;
    canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

    const font = settings["font"] || "Lato";
    canvasContext.font = (baseFontSize * sizeMultiplier) + "px " + font;
    canvasContext.fillStyle = textColor;

    canvasContext.textAlign = "left";
    canvasContext.fillText(pairDisplay, 10 * sizeMultiplier, 25 * sizeMultiplier);

    canvasContext.font = "bold " + (priceFontSize * sizeMultiplier) + "px " + font;
    canvasContext.fillText(
        formatters.getRoundedValue(values["last"] || 0, digits, multiplier, priceFormat),
        textPadding,
        60 * sizeMultiplier
    );

    if (settings["displayHighLow"] !== "off") {
        canvasContext.font = (highLowFontSize * sizeMultiplier) + "px " + font;
        canvasContext.fillText(
            formatters.getRoundedValue(values["low"] || 0, highLowDigits, multiplier, priceFormat),
            textPadding,
            90 * sizeMultiplier
        );

        canvasContext.textAlign = "right";
        canvasContext.fillText(
            formatters.getRoundedValue(values["high"] || 0, highLowDigits, multiplier, priceFormat),
            canvasWidth - textPadding,
            135 * sizeMultiplier
        );
    }

    if (settings["displayDailyChange"] !== "off") {
        const originalFillColor = canvasContext.fillStyle;

        let digitsPercent = 2;
        if (Math.abs(changePercent) >= 100) {
            digitsPercent = 0;
        } else if (Math.abs(changePercent) >= 10) {
            digitsPercent = 1;
        }
        let changePercentDisplay = formatters.getRoundedValue(changePercent, digitsPercent, 1, "plain");
        if (changePercent > 0) {
            changePercentDisplay = "+" + changePercentDisplay;
            canvasContext.fillStyle = "green";
        } else {
            canvasContext.fillStyle = "red";
        }

        canvasContext.font = (changeFontSize * sizeMultiplier) + "px " + font;
        canvasContext.textAlign = "right";
        canvasContext.fillText(
            changePercentDisplay,
            canvasWidth - textPadding,
            90 * sizeMultiplier
        );

        canvasContext.fillStyle = originalFillColor;
    }

    if (settings["displayHighLowBar"] !== "off") {
        const lineY = 104 * sizeMultiplier;
        const padding = 5 * sizeMultiplier;
        const lineWidth = 6 * sizeMultiplier;

        const high = values.high || 0;
        const low = values.low || 0;
        const last = values.last || 0;
        const range = high - low;
        const percent = range > 0 ? (last - low) / range : 0.5;
        const lineLength = canvasWidth - padding * 2;
        const cursorPositionX = padding + Math.round(lineLength * percent);

        const triangleSide = 12 * sizeMultiplier;
        const triangleHeight = Math.sqrt(3 / 4 * Math.pow(triangleSide, 2));

        canvasContext.beginPath();
        canvasContext.moveTo(padding, lineY);
        canvasContext.lineTo(cursorPositionX, lineY);
        canvasContext.lineWidth = lineWidth;
        canvasContext.strokeStyle = "green";
        canvasContext.stroke();

        canvasContext.beginPath();
        canvasContext.moveTo(cursorPositionX, lineY);
        canvasContext.lineTo(canvasWidth - padding, lineY);
        canvasContext.lineWidth = lineWidth;
        canvasContext.strokeStyle = "red";
        canvasContext.stroke();

        canvasContext.beginPath();
        canvasContext.moveTo(cursorPositionX - triangleSide / 2, lineY - triangleHeight / 3);
        canvasContext.lineTo(cursorPositionX + triangleSide / 2, lineY - triangleHeight / 3);
        canvasContext.lineTo(cursorPositionX, lineY + triangleHeight * 2 / 3);
        canvasContext.fillStyle = textColor;
        canvasContext.fill();
    }

    const connectionIconSetting = (settings["displayConnectionStatusIcon"] || "OFF").toUpperCase();
    if (connectionIconSetting !== "OFF") {
        renderConnectionStatusIcon({
            canvas: canvas,
            canvasContext: canvasContext,
            state: effectiveConnectionState,
            color: textColor,
            sizeMultiplier: sizeMultiplier,
            position: connectionIconSetting,
            connectionStates: connectionStates
        });
    }
    }

    function renderCandlesCanvas(params) {
    const canvas = params.canvas;
    const canvasContext = params.canvasContext;
    const settings = params.settings || {};
    const candlesNormalized = params.candlesNormalized || [];
    const connectionStates = params.connectionStates;
    const connectionState = params.connectionState;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const sizeMultiplier = getCanvasSizeMultiplier(canvasWidth, canvasHeight);

    const padding = 10 * sizeMultiplier;
    const connectionIconSetting = (settings["displayConnectionStatusIcon"] || "OFF").toUpperCase();
    const effectiveConnectionState = connectionState || null;
    const backgroundColor = settings["backgroundColor"] || "#000000";
    const textColor = settings["textColor"] || "#ffffff";

    const candlesToDisplay = candlesNormalized.slice(-getCandlesDisplayCount(settings));
    const candleCount = candlesToDisplay.length;
    const paddingWidth = canvasWidth - (2 * padding);
    const paddingHeight = canvasHeight - (2 * padding);
    const candleWidth = candleCount > 0 ? paddingWidth / candleCount : paddingWidth;
    const wickWidth = Math.max(2 * sizeMultiplier, candleWidth * 0.15);
    const bodyWidth = Math.max(4 * sizeMultiplier, candleWidth * 0.6);

    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
    canvasContext.fillStyle = backgroundColor;
    canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

    const font = settings["font"] || "Lato";
    canvasContext.font = (15 * sizeMultiplier) + "px " + font;
    canvasContext.fillStyle = textColor;

    const interval = settings["candlesInterval"] || "1h";
    canvasContext.textAlign = "left";
    canvasContext.fillText(interval, 10 * sizeMultiplier, canvasHeight - (5 * sizeMultiplier));

    candlesToDisplay.forEach(function (candleNormalized) {
        const xPosition = Math.round(padding + Math.round(candleNormalized.timePercent * paddingWidth));
        const highPosition = Math.round(padding + paddingHeight - (candleNormalized.highPercent * paddingHeight));
        const lowPosition = Math.round(padding + paddingHeight - (candleNormalized.lowPercent * paddingHeight));

        canvasContext.beginPath();
        canvasContext.moveTo(xPosition, highPosition);
        canvasContext.lineTo(xPosition, lowPosition);
        canvasContext.lineWidth = wickWidth;
        canvasContext.strokeStyle = candleNormalized.closePercent > candleNormalized.openPercent ? "#1c9900" : "#a10";
        canvasContext.stroke();

        const openPosition = Math.round(padding + paddingHeight - (candleNormalized.openPercent * paddingHeight));
        const closePosition = Math.round(padding + paddingHeight - (candleNormalized.closePercent * paddingHeight));
        const candleMin = Math.min(openPosition, closePosition);
        const candleMax = Math.max(openPosition, closePosition);

        canvasContext.beginPath();
        canvasContext.rect(
            Math.round(xPosition - bodyWidth / 2),
            candleMin,
            Math.round(bodyWidth),
            Math.max(1, candleMax - candleMin)
        );
        canvasContext.fillStyle = candleNormalized.closePercent > candleNormalized.openPercent ? "#1c9900" : "#a10";
        canvasContext.fill();
    });

    if (connectionIconSetting !== "OFF") {
        renderConnectionStatusIcon({
            canvas: canvas,
            canvasContext: canvasContext,
            state: effectiveConnectionState,
            color: textColor,
            sizeMultiplier: sizeMultiplier,
            position: connectionIconSetting,
            connectionStates: connectionStates
        });
    }
    }

    return {
        getCanvasSizeMultiplier,
        getCandlesDisplayCount,
        renderConnectionStatusIcon,
        renderTickerCanvas,
        renderCandlesCanvas
    };
}));
