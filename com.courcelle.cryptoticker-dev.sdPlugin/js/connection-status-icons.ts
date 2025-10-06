/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use strict";

(function (root: Record<string, unknown> | undefined, factory: () => ConnectionStatusIconsModule) {
    const exportsValue = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = exportsValue;
    }

    if (root && typeof root === "object") {
        (root as ConnectionStatusIconsGlobalRoot).CryptoTickerConnectionStatusIcons = exportsValue;
    }
}(typeof self !== "undefined" ? (self as unknown as Record<string, unknown>) : (this as unknown as Record<string, unknown>), function buildConnectionStatusIcons(): ConnectionStatusIconsModule {
    function getFallbackConnectionStates() {
        return {
            LIVE: "live",
            DETACHED: "detached",
            BACKUP: "backup",
            BROKEN: "broken"
        };
    }

    function normalizeConnectionStates(states: Record<string, string> | null | undefined) {
        if (!states || typeof states !== "object") {
            return getFallbackConnectionStates();
        }

        const fallback = getFallbackConnectionStates();
        const normalized = {} as Record<string, string>;

        for (const key in fallback) {
            if (!Object.prototype.hasOwnProperty.call(fallback, key)) {
                continue;
            }

            const fallbackValue = fallback[key];
            const candidate = states[key];
            normalized[key] = typeof candidate === "string" && candidate ? candidate : fallbackValue;
        }

        return normalized;
    }

    function renderConnectionStatusIcon(params: RenderConnectionStatusIconParams) {
        const canvasContext = params.canvasContext;
        const canvas = params.canvas;
        const state = params.state;
        const color = params.color;
        const sizeMultiplier = params.sizeMultiplier;
        const position = params.position;
        const providedConnectionStates = params.connectionStates;

        if (!canvas || !canvasContext || !state) {
            return;
        }

        const connectionStates = normalizeConnectionStates(providedConnectionStates);

        const pos = (position || "OFF").toUpperCase();
        if (pos === "OFF") {
            return;
        }

        const iconState = String(state).toLowerCase();
        const multiplier = typeof sizeMultiplier === "number" && Number.isFinite(sizeMultiplier) && sizeMultiplier > 0 ? sizeMultiplier : 1;
        const iconSize = 20 * multiplier;
        const margin = 4 * multiplier;

        let x = canvas.width - iconSize - margin;
        let y = margin;
        if (pos === "BOTTOM_LEFT") {
            x = margin;
            y = canvas.height - iconSize - margin;
        }

        canvasContext.save();
        canvasContext.translate(x, y);
        canvasContext.lineWidth = Math.max(1.5 * multiplier, 1);
        canvasContext.strokeStyle = color;
        canvasContext.fillStyle = color;

        function drawPolygon(points: number[][]) {
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
            canvasContext.save();
            canvasContext.fillStyle = "#ff0000";

            canvasContext.beginPath();
            canvasContext.moveTo(iconSize * 0.46, iconSize * 0.32);
            canvasContext.lineTo(iconSize * 0.42, iconSize * 0.38);
            canvasContext.lineTo(iconSize * 0.46, iconSize * 0.44);
            canvasContext.lineTo(iconSize * 0.41, iconSize * 0.50);
            canvasContext.lineTo(iconSize * 0.43, iconSize * 0.88);
            canvasContext.lineTo(iconSize * 0.30, iconSize * 0.73);
            canvasContext.lineTo(iconSize * 0.18, iconSize * 0.62);
            canvasContext.bezierCurveTo(
                iconSize * 0.08, iconSize * 0.52,
                iconSize * 0.08, iconSize * 0.38,
                iconSize * 0.15, iconSize * 0.28
            );
            canvasContext.bezierCurveTo(
                iconSize * 0.25, iconSize * 0.16,
                iconSize * 0.40, iconSize * 0.20,
                iconSize * 0.46, iconSize * 0.32
            );
            canvasContext.closePath();
            canvasContext.fill();

            canvasContext.beginPath();
            canvasContext.moveTo(iconSize * 0.54, iconSize * 0.28);
            canvasContext.lineTo(iconSize * 0.58, iconSize * 0.34);
            canvasContext.lineTo(iconSize * 0.54, iconSize * 0.40);
            canvasContext.lineTo(iconSize * 0.59, iconSize * 0.46);
            canvasContext.lineTo(iconSize * 0.57, iconSize * 0.84);
            canvasContext.lineTo(iconSize * 0.70, iconSize * 0.69);
            canvasContext.lineTo(iconSize * 0.82, iconSize * 0.58);
            canvasContext.bezierCurveTo(
                iconSize * 0.92, iconSize * 0.48,
                iconSize * 0.92, iconSize * 0.34,
                iconSize * 0.85, iconSize * 0.24
            );
            canvasContext.bezierCurveTo(
                iconSize * 0.75, iconSize * 0.12,
                iconSize * 0.60, iconSize * 0.16,
                iconSize * 0.54, iconSize * 0.28
            );
            canvasContext.closePath();
            canvasContext.fill();

            canvasContext.restore();
        }

        canvasContext.restore();
    }

    return {
        renderConnectionStatusIcon: renderConnectionStatusIcon
    };
}));

interface RenderConnectionStatusIconParams {
    canvasContext: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    state: string;
    color: string;
    sizeMultiplier: number;
    position: string;
    connectionStates?: Record<string, string>;
}

interface ConnectionStatusIconsModule {
    renderConnectionStatusIcon: (params: RenderConnectionStatusIconParams) => void;
}

interface ConnectionStatusIconsGlobalRoot extends Record<string, unknown> {
    CryptoTickerConnectionStatusIcons?: ConnectionStatusIconsModule;
}

