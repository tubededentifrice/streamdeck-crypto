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
    const API_URL = "https://api-pub.bitfinex.com/v2/conf/pub:list:pair:exchange";
    async function getPairs() {
        const response = await fetch(API_URL);
        const json = await response.json();
        const list = Array.isArray(json) && Array.isArray(json[0]) ? json[0] : [];
        return list.map(function (value) {
            const display = (value || "").toUpperCase();
            // Strip punctuation (e.g., ":") so subscription keys match provider expectations.
            const sanitized = display.replace(/[:/]/g, "");
            return {
                value: display,
                display: display,
                symbol: sanitized
            };
        });
    }
    return {
        id: "BITFINEX",
        getPairs: getPairs
    };
}));
