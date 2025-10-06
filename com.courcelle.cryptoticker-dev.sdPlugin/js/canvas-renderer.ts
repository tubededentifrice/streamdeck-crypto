/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use strict";

(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory(require("./alert-manager"), require("./formatters"), require("./expression-evaluator"), require("./constants"));
    } else {
        root.CryptoTickerCanvasRenderer = factory(
            root.CryptoTickerAlertManager,
            root.CryptoTickerFormatters,
            root.CryptoTickerExpressionEvaluator,
            root.CryptoTickerConstants
        );
    }
}(typeof self !== "undefined" ? self : this, function (alertManager, formatters, expressionEvaluator, constants) {
    if (!alertManager) {
        throw new Error("Alert manager dependency is missing");
    }
    if (!formatters) {
        throw new Error("Formatters dependency is missing");
    }
    if (!expressionEvaluator) {
        throw new Error("Expression evaluator dependency is missing");
    }

    const sharedConstants = constants || {};
    const TIMESTAMP_SECONDS_THRESHOLD = typeof sharedConstants.TIMESTAMP_SECONDS_THRESHOLD === "number" ? sharedConstants.TIMESTAMP_SECONDS_THRESHOLD : 9999999999;
    const DEFAULT_PRICE_BAR_POSITION = typeof sharedConstants.DEFAULT_PRICE_BAR_POSITION === "number" ? sharedConstants.DEFAULT_PRICE_BAR_POSITION : 0.5;

    function createColorRuleEvaluator() {
        const allowed = expressionEvaluator.allowedVariables.slice(0);
        const extras = [
            "alert",
            "backgroundColor",
            "textColor",
            "defaultBackgroundColor",
            "defaultTextColor"
        ];
        for (let i = 0; i < extras.length; i++) {
            if (allowed.indexOf(extras[i]) === -1) {
                allowed.push(extras[i]);
            }
        }
        return expressionEvaluator.createEvaluator({
            allowedVariables: allowed
        });
    }

    const colorRuleEvaluator = createColorRuleEvaluator();

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
        const drawRoundedRect = function (width, height, radius) {
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
        };

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

    /**
     * Draw the equilateral price cursor at the given anchor; uses equilateral geometry to center base and tip.
     *
     * @param {CanvasRenderingContext2D} canvasContext Target context.
     * @param {number} cursorPositionX Triangle center X.
     * @param {number} lineY Baseline Y used for centering.
     * @param {number} triangleSide Side length.
     * @param {string} fillStyle Fill color.
     */
    function drawPriceCursorTriangle(canvasContext, cursorPositionX, lineY, triangleSide, fillStyle) {
        const triangleHeight = Math.sqrt(0.75 * Math.pow(triangleSide, 2));
        canvasContext.beginPath();
        canvasContext.moveTo(cursorPositionX - (triangleSide / 2), lineY - (triangleHeight / 3));
        canvasContext.lineTo(cursorPositionX + (triangleSide / 2), lineY - (triangleHeight / 3));
        canvasContext.lineTo(cursorPositionX, lineY + (triangleHeight * 2 / 3));
        canvasContext.fillStyle = fillStyle;
        canvasContext.fill();
    }

    function splitMessageIntoLines(canvasContext, message, maxWidth, font) {
        if (!message && message !== 0) {
            return [""];
        }

        const rawSegments = String(message).split(/\r?\n/);
        const lines = [];

        function splitLongWord(word) {
            const characters = word.split("");
            const chunks = [];
            let current = "";
            for (let i = 0; i < characters.length; i++) {
                const candidate = current + characters[i];
                if (canvasContext.measureText(candidate).width > maxWidth && current) {
                    chunks.push(current);
                    current = characters[i];
                } else {
                    current = candidate;
                }
            }
            if (current) {
                chunks.push(current);
            }
            return chunks;
        }

        canvasContext.font = font;

        for (let i = 0; i < rawSegments.length; i++) {
            const segment = rawSegments[i];
            if (!segment || segment.trim() === "") {
                lines.push("");
                continue;
            }

            const words = segment.trim().split(/\s+/);
            let currentLine = words.shift() || "";

            while (words.length > 0) {
                const word = words.shift();
                const candidate = currentLine ? currentLine + " " + word : word;

                if (canvasContext.measureText(candidate).width <= maxWidth) {
                    currentLine = candidate;
                    continue;
                }

                if (currentLine) {
                    lines.push(currentLine);
                }

                if (canvasContext.measureText(word).width <= maxWidth) {
                    currentLine = word;
                } else {
                    const chunks = splitLongWord(word);
                    for (let c = 0; c < chunks.length - 1; c++) {
                        lines.push(chunks[c]);
                    }
                    currentLine = chunks.length > 0 ? chunks[chunks.length - 1] : "";
                }
            }

            if (currentLine) {
                lines.push(currentLine);
            }
        }

        if (lines.length === 0) {
            lines.push("");
        }

        return lines;
    }

    function formatTimestampForDisplay(timestamp) {
        if (timestamp === null || timestamp === undefined) {
            return null;
        }

        const numericTimestamp = typeof timestamp === "number" ? timestamp : parseFloat(timestamp);
        if (!Number.isFinite(numericTimestamp)) {
            return null;
        }

        const normalized = numericTimestamp > TIMESTAMP_SECONDS_THRESHOLD ? numericTimestamp : numericTimestamp * 1000;
        const date = new Date(normalized);
        if (isNaN(date.getTime())) {
            return null;
        }

        try {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch (err) {
            return date.toISOString();
        }
    }

    function renderMessageCanvas(params) {
        const canvas = params.canvas;
        const canvasContext = params.canvasContext;
        const message = params.message;
        const backgroundColor = params.backgroundColor || "#000000";
        const textColor = params.textColor || "#ffffff";
        const fontFamily = params.font || "Lato";
        const explicitFontSize = params.fontSize;
        const connectionStates = params.connectionStates;
        const connectionState = params.connectionState;
        const connectionIconSetting = (params.displayConnectionStatusIcon || "OFF").toUpperCase();

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const sizeMultiplier = getCanvasSizeMultiplier(canvasWidth, canvasHeight);
        const padding = 12 * sizeMultiplier;
        const baseFontSize = explicitFontSize ? explicitFontSize * sizeMultiplier : Math.max(22 * sizeMultiplier, 14);
        const font = "bold " + baseFontSize + "px " + fontFamily;
        const lineHeight = baseFontSize * 1.25;

        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
        canvasContext.fillStyle = backgroundColor;
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

        const maxLineWidth = canvasWidth - (padding * 2);
        const lines = splitMessageIntoLines(canvasContext, message, maxLineWidth, font);

        let availableHeight = canvasHeight - (padding * 2);
        if (connectionIconSetting !== "OFF" && connectionStates) {
            availableHeight -= 28 * sizeMultiplier;
        }

        const totalTextHeight = lineHeight * lines.length;
        let startY = padding + (availableHeight - totalTextHeight) / 2 + (lineHeight / 2);
        if (startY < padding + (lineHeight / 2)) {
            startY = padding + (lineHeight / 2);
        }

        canvasContext.fillStyle = textColor;
        canvasContext.textAlign = "center";
        canvasContext.textBaseline = "middle";
        canvasContext.font = font;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line) {
                canvasContext.fillText(line, canvasWidth / 2, startY + (i * lineHeight));
            }
        }

        if (connectionIconSetting !== "OFF" && connectionStates) {
            renderConnectionStatusIcon({
                canvas: canvas,
                canvasContext: canvasContext,
                state: connectionState,
                color: textColor,
                sizeMultiplier: sizeMultiplier,
                position: connectionIconSetting,
                connectionStates: connectionStates
            });
        }
    }

    function renderTickerCanvas(params) {
        const canvas = params.canvas;
        const canvasContext = params.canvasContext;
        const settings = params.settings || {};
        const values = params.values || {};
        const context = params.context;
        const connectionStates = params.connectionStates;
        const connectionState = params.connectionState;
        const dataStateRaw = params.dataState || "live";
        const infoMessage = params.infoMessage || "";
        const lastValidTimestamp = params.lastValidTimestamp || values.lastUpdated || null;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const sizeMultiplier = getCanvasSizeMultiplier(canvasWidth, canvasHeight);

        const textPadding = 10 * sizeMultiplier;

        const pair = settings["pair"];
        const pairDisplay = settings["title"] || values["pairDisplay"] || values["pair"] || pair || "";
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
        const defaultBackgroundColor = settings["backgroundColor"] || "#000000";
        const defaultTextColor = settings["textColor"] || "#ffffff";
        let backgroundColor = defaultBackgroundColor;
        let textColor = defaultTextColor;
        const effectiveConnectionState = connectionState || values.connectionState || null;

        const priceValue = typeof values.last === "number" && Number.isFinite(values.last) ? values.last : null;
        const highValue = typeof values.high === "number" && Number.isFinite(values.high) ? values.high : null;
        const lowValue = typeof values.low === "number" && Number.isFinite(values.low) ? values.low : null;
        const changeDailyPercentValue = typeof values.changeDailyPercent === "number" && Number.isFinite(values.changeDailyPercent)
            ? values.changeDailyPercent
            : null;
        const changePercent = changeDailyPercentValue !== null ? changeDailyPercentValue * 100 : null;

        const dataState = typeof dataStateRaw === "string" ? dataStateRaw.toLowerCase() : "live";
        // Add subtle dot for stale/missing so frozen price is explained.
        const degradedColor = dataState === "stale"
            ? "#f6a623"
            : dataState === "missing"
                ? "#d9534f"
                : null;

        // Alerts may swap colors; do this before color rules so expressions see alert palette.
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

        // Color rules read both values and palette (support `alert ? '#ff0000' : defaultBackgroundColor`).
        const baseColorContext = expressionEvaluator.buildContext(values, {
            alert: alert,
            backgroundColor: backgroundColor,
            textColor: textColor,
            defaultBackgroundColor: defaultBackgroundColor,
            defaultTextColor: defaultTextColor
        });

        if (settings["backgroundColorRule"]) {
            // Allow expressions to repaint background (e.g. change %); log but continue on errors.
            try {
                const result = colorRuleEvaluator.evaluate(settings["backgroundColorRule"], baseColorContext);
                const stringResult = String(result || "").trim();
                if (stringResult) {
                    backgroundColor = stringResult;
                    baseColorContext.backgroundColor = backgroundColor;
                }
            } catch (err) {
                console.error("Error evaluating backgroundColorRule", {
                    context: context,
                    expression: settings["backgroundColorRule"],
                    values: values,
                    error: err instanceof Error ? err.message : err
                });
            }
        }
        if (settings["textColorRule"]) {
            try {
                baseColorContext.textColor = textColor;
                const result = colorRuleEvaluator.evaluate(settings["textColorRule"], baseColorContext);
                const stringResult = String(result || "").trim();
                if (stringResult) {
                    textColor = stringResult;
                    baseColorContext.textColor = textColor;
                }
            } catch (err) {
                console.error("Error evaluating textColorRule", {
                    context: context,
                    expression: settings["textColorRule"],
                    values: values,
                    error: err instanceof Error ? err.message : err
                });
            }
        }

        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
        canvasContext.fillStyle = backgroundColor;
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

        const font = settings["font"] || "Lato";
        const baseFont = (baseFontSize * sizeMultiplier) + "px " + font;
        canvasContext.font = baseFont;
        canvasContext.fillStyle = textColor;
        canvasContext.textAlign = "left";
        canvasContext.textBaseline = "alphabetic";

        const pairBaselineY = 25 * sizeMultiplier;
        let pairTextX = textPadding;
        // Degraded dot stays visible even under alert colors so user knows data is frozen.
        if (degradedColor) {
            const indicatorRadius = 5 * sizeMultiplier;
            const indicatorCenterX = textPadding + indicatorRadius;
            const indicatorCenterY = pairBaselineY - (baseFontSize * sizeMultiplier * 0.4);
            canvasContext.beginPath();
            canvasContext.fillStyle = degradedColor;
            canvasContext.arc(indicatorCenterX, indicatorCenterY, indicatorRadius, 0, Math.PI * 2);
            canvasContext.fill();
            canvasContext.fillStyle = textColor;
            pairTextX += (indicatorRadius * 2) + (6 * sizeMultiplier);
        }

        if (pairDisplay) {
            canvasContext.fillText(pairDisplay, pairTextX, pairBaselineY);
        }

        if (dataState === "stale") {
            const staleLabelBase = infoMessage ? infoMessage.toUpperCase() : "STALE";
            const staleTime = formatTimestampForDisplay(lastValidTimestamp);
            const staleLabel = staleTime ? (staleLabelBase + " • " + staleTime) : staleLabelBase;
            const staleFontSizePx = Math.max(14, baseFontSize * 0.6) * sizeMultiplier;
            canvasContext.font = staleFontSizePx + "px " + font;
            canvasContext.fillStyle = degradedColor || textColor;
            canvasContext.fillText(staleLabel, pairTextX, pairBaselineY + staleFontSizePx + (4 * sizeMultiplier));
            canvasContext.font = baseFont;
            canvasContext.fillStyle = textColor;
        }

        const shouldDisplayDetails = dataState !== "missing";

        if (!shouldDisplayDetails) {
            const messageText = infoMessage ? infoMessage.toUpperCase() : "NO DATA";
            const messageFontSizePx = Math.max(26, baseFontSize) * sizeMultiplier;
            const messageFont = "bold " + messageFontSizePx + "px " + font;
            canvasContext.font = messageFont;
            canvasContext.fillStyle = degradedColor || textColor;
            const previousAlign = canvasContext.textAlign;
            const previousBaseline = canvasContext.textBaseline;
            canvasContext.textAlign = "center";
            canvasContext.textBaseline = "middle";
            const maxWidth = canvasWidth - (textPadding * 2);
            const messageLines = splitMessageIntoLines(canvasContext, messageText, maxWidth, messageFont);
            const lineHeight = messageFontSizePx * 1.1;
            const totalHeight = lineHeight * messageLines.length;
            const startY = (canvasHeight - totalHeight) / 2 + (lineHeight / 2);
            for (let i = 0; i < messageLines.length; i++) {
                canvasContext.fillText(messageLines[i], canvasWidth / 2, startY + (i * lineHeight));
            }
            canvasContext.textAlign = previousAlign;
            canvasContext.textBaseline = previousBaseline;
            canvasContext.font = baseFont;
            canvasContext.fillStyle = textColor;
        } else {
            const priceText = priceValue !== null
                ? formatters.getRoundedValue(priceValue, digits, multiplier, priceFormat)
                : "--";
            canvasContext.font = "bold " + (priceFontSize * sizeMultiplier) + "px " + font;
            canvasContext.fillStyle = textColor;
            canvasContext.textAlign = "left";
            canvasContext.fillText(priceText, textPadding, 60 * sizeMultiplier);

            if (settings["displayHighLow"] !== "off") {
                canvasContext.font = (highLowFontSize * sizeMultiplier) + "px " + font;
                canvasContext.fillStyle = textColor;
                canvasContext.textAlign = "left";
                const lowText = lowValue !== null
                    ? formatters.getRoundedValue(lowValue, highLowDigits, multiplier, priceFormat)
                    : "--";
                canvasContext.fillText(lowText, textPadding, 90 * sizeMultiplier);

                canvasContext.textAlign = "right";
                const highText = highValue !== null
                    ? formatters.getRoundedValue(highValue, highLowDigits, multiplier, priceFormat)
                    : "--";
                canvasContext.fillText(highText, canvasWidth - textPadding, 135 * sizeMultiplier);
            }

            if (settings["displayDailyChange"] !== "off" && changePercent !== null) {
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
                } else if (changePercent < 0) {
                    canvasContext.fillStyle = "red";
                } else {
                    canvasContext.fillStyle = originalFillColor;
                }

                canvasContext.font = (changeFontSize * sizeMultiplier) + "px " + font;
                canvasContext.textAlign = "right";
                canvasContext.fillText(changePercentDisplay, canvasWidth - textPadding, 90 * sizeMultiplier);

                canvasContext.fillStyle = originalFillColor;
            }

            if (settings["displayHighLowBar"] !== "off" && highValue !== null && lowValue !== null && priceValue !== null) {
                const lineY = 104 * sizeMultiplier;
                const padding = 5 * sizeMultiplier;
                const lineWidth = 6 * sizeMultiplier;

                const range = highValue - lowValue;
                const percent = range > 0
                    ? Math.min(Math.max((priceValue - lowValue) / range, 0), 1)
                    : DEFAULT_PRICE_BAR_POSITION;
                const lineLength = canvasWidth - (padding * 2);
                const cursorPositionX = padding + Math.round(lineLength * percent);

                const triangleSide = 12 * sizeMultiplier;

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

                drawPriceCursorTriangle(canvasContext, cursorPositionX, lineY, triangleSide, textColor);
            }
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

    // Upstream outputs normalized candles; keep newest N for 144x144 readability.
    const candlesToDisplay = candlesNormalized.slice(-getCandlesDisplayCount(settings));
    const candleCount = candlesToDisplay.length;
    const paddingWidth = canvasWidth - (2 * padding);
    const paddingHeight = canvasHeight - (2 * padding);
    // Divide available width by candle count; wick/body ratios keep visuals balanced at small sizes.
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
    canvasContext.textAlign = "right";
    canvasContext.fillText(interval, canvasWidth - (10 * sizeMultiplier), canvasHeight - (5 * sizeMultiplier));

    candlesToDisplay.forEach(function (candleNormalized) {
        const xPosition = Math.round(padding + Math.round(candleNormalized.timePercent * paddingWidth));
        const highPosition = Math.round(padding + paddingHeight - (candleNormalized.highPercent * paddingHeight));
        const lowPosition = Math.round(padding + paddingHeight - (candleNormalized.lowPercent * paddingHeight));

        canvasContext.beginPath();
        canvasContext.moveTo(xPosition, highPosition);
        canvasContext.lineTo(xPosition, lowPosition);
        canvasContext.lineWidth = wickWidth;
        // Classic green/up vs red/down; compare percents so flat candles still consistent.
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
        renderCandlesCanvas,
        renderMessageCanvas
    };
}));
