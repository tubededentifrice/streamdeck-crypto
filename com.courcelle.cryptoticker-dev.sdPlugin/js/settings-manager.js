/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";
(function (root, factory) {
    const globalScope = typeof globalThis !== "undefined" ? globalThis : root;
    const tickerStateModule = (typeof module === "object" && module.exports
        ? require("./ticker-state")
        : root === null || root === void 0 ? void 0 : root.CryptoTickerState);
    const exportsValue = factory(tickerStateModule, globalScope);
    if (typeof module === "object" && module.exports) {
        module.exports = exportsValue;
    }
    if (root && typeof root === "object") {
        root.CryptoTickerSettingsManager = exportsValue;
    }
}(typeof self !== "undefined" ? self : this, function buildSettingsManager(tickerState, globalRoot) {
    function requireOrNull(modulePath) {
        if (typeof require === "function") {
            try {
                return require(modulePath);
            }
            catch (err) {
                return null;
            }
        }
        return null;
    }
    function resolveDefaultSettingsModule() {
        if (globalRoot && typeof globalRoot.CryptoTickerDefaults !== "undefined") {
            return globalRoot.CryptoTickerDefaults;
        }
        return requireOrNull("./default-settings");
    }
    const defaultSettingsModule = resolveDefaultSettingsModule();
    function ensureDefaultSettingsModule() {
        if (!defaultSettingsModule) {
            throw new Error("Default settings module is not available");
        }
        return defaultSettingsModule;
    }
    function applyDefaultSettings(partial) {
        const moduleRef = ensureDefaultSettingsModule();
        if (typeof moduleRef.applyDefaults === "function") {
            return moduleRef.applyDefaults(partial);
        }
        if (moduleRef.defaultSettings) {
            return Object.assign({}, moduleRef.defaultSettings, partial || {});
        }
        return Object.assign({}, partial || {});
    }
    function getDefaultSettingsSnapshot() {
        const moduleRef = ensureDefaultSettingsModule();
        if (typeof moduleRef.getDefaultSettings === "function") {
            return moduleRef.getDefaultSettings();
        }
        if (moduleRef.defaultSettings) {
            return JSON.parse(JSON.stringify(moduleRef.defaultSettings));
        }
        return {};
    }
    const defaultSettings = getDefaultSettingsSnapshot();
    function refreshSettings(options) {
        const context = options.context;
        const settings = options.settings;
        const updateSubscription = options.updateSubscription;
        const normalizedSettings = applyDefaultSettings(settings);
        tickerState.setContextDetails(context, normalizedSettings);
        if (typeof updateSubscription === "function") {
            updateSubscription(normalizedSettings);
        }
        return normalizedSettings;
    }
    const settingsSchema = defaultSettingsModule && defaultSettingsModule.settingsSchema
        ? defaultSettingsModule.settingsSchema
        : null;
    return {
        applyDefaultSettings,
        getDefaultSettingsSnapshot,
        defaultSettings,
        settingsSchema,
        refreshSettings
    };
}));
