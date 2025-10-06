"use strict";

(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory(require("./ticker-state"), typeof globalThis !== "undefined" ? globalThis : root);
    } else {
        root.CryptoTickerSettingsManager = factory(root.CryptoTickerState, root);
    }
}(typeof self !== "undefined" ? self : this, function (tickerState, globalRoot) {
    // Shared helper that tolerates bundler environments (PI, Jest) where a
    // module might not be available. Returning null keeps the plugin graceful
    // instead of throwing during initialization.
    function requireOrNull(modulePath) {
        if (typeof require === "function") {
            try {
                return require(modulePath);
            } catch (err) {
                return null;
            }
        }

        return null;
    }

    // Default settings can be injected through a global (Stream Deck runtime)
    // or loaded from disk (unit tests / preview). Resolve once to avoid costly
    // disk reads on every refresh.
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

    // Merge arbitrary partial settings with the defaults, relying on the
    // module implementation to coerce values. Using this indirection keeps the
    // manager agnostic of schema changes.
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

    // Refresh is invoked from both the action and the PI. Beyond applying
    // defaults we persist the normalized snapshot so other modules (alerts,
    // provider routing) can read consistent settings without juggling events.
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
