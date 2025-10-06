"use strict";
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
(function (root, factory) {
    const globalRoot = typeof globalThis !== "undefined" ? globalThis : root;
    const namespace = (globalRoot && globalRoot.CryptoTickerPIProviders)
        ? globalRoot.CryptoTickerPIProviders
        : null;
    const provider = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = provider;
    }
    if (namespace && typeof namespace.registerProvider === "function") {
        namespace.registerProvider(provider);
    }
}(typeof self !== "undefined" ? self : this, function () {
    const API_URL = "https://api.binance.com/api/v3/exchangeInfo";
    async function getPairs() {
        const response = await fetch(API_URL);
        const json = await response.json();
        const symbols = Array.isArray(json.symbols) ? json.symbols : [];
        return symbols
            // Filter out delisted/maintenance symbols so the PI only lists live markets.
            .filter(function (item) {
            if (!item) {
                return false;
            }
            if (item.status && item.status !== "TRADING") {
                return false;
            }
            const symbol = item.symbol || "";
            return symbol.length > 0;
        })
            .map(function (item) {
            const symbol = (item.symbol || "").toUpperCase();
            return {
                value: symbol,
                display: symbol,
                symbol: symbol
            };
        });
    }
    return {
        id: "BINANCE",
        getPairs: getPairs
    };
}));
