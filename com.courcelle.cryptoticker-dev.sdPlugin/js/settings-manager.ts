/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

(function (root: Record<string, unknown> | undefined, factory: (tickerState: TickerStateModule, globalRoot: GlobalRootScope) => CryptoTickerSettingsManager) {
    const globalScope = typeof globalThis !== "undefined" ? globalThis : root;
    const tickerStateModule = (typeof module === "object" && module.exports
        ? require("./ticker-state")
        : root?.CryptoTickerState) as TickerStateModule;

    const exportsValue = factory(tickerStateModule, globalScope as GlobalRootScope);

    if (typeof module === "object" && module.exports) {
        module.exports = exportsValue;
    }

    if (root && typeof root === "object") {
        (root as GlobalRootScope).CryptoTickerSettingsManager = exportsValue;
    }
}(typeof self !== "undefined" ? (self as unknown as Record<string, unknown>) : (this as unknown as Record<string, unknown>), function buildSettingsManager(tickerState: TickerStateModule, globalRoot: GlobalRootScope): CryptoTickerSettingsManager {
    function requireOrNull(modulePath: string): DefaultSettingsModule | null {
        if (typeof require === "function") {
            try {
                return require(modulePath);
            } catch (err) {
                return null;
            }
        }

        return null;
    }

    function resolveDefaultSettingsModule(): DefaultSettingsModule | null {
        if (globalRoot && typeof globalRoot.CryptoTickerDefaults !== "undefined") {
            return globalRoot.CryptoTickerDefaults as DefaultSettingsModule;
        }
        return requireOrNull("./default-settings");
    }

    const defaultSettingsModule = resolveDefaultSettingsModule();

    function ensureDefaultSettingsModule(): DefaultSettingsModule {
        if (!defaultSettingsModule) {
            throw new Error("Default settings module is not available");
        }
        return defaultSettingsModule;
    }

    function applyDefaultSettings(partial: unknown): CryptoTickerSettings & Record<string, unknown> {
        const moduleRef = ensureDefaultSettingsModule();
        if (typeof moduleRef.applyDefaults === "function") {
            return moduleRef.applyDefaults(partial);
        }
        if (moduleRef.defaultSettings) {
            return Object.assign({}, moduleRef.defaultSettings, partial || {});
        }
        return Object.assign({}, partial || {}) as CryptoTickerSettings & Record<string, unknown>;
    }

    function getDefaultSettingsSnapshot(): CryptoTickerSettings & Record<string, unknown> {
        const moduleRef = ensureDefaultSettingsModule();
        if (typeof moduleRef.getDefaultSettings === "function") {
            return moduleRef.getDefaultSettings();
        }
        if (moduleRef.defaultSettings) {
            return JSON.parse(JSON.stringify(moduleRef.defaultSettings));
        }
        return {} as CryptoTickerSettings & Record<string, unknown>;
    }

    const defaultSettings = getDefaultSettingsSnapshot();

    function refreshSettings(options: RefreshSettingsOptions): CryptoTickerSettings & Record<string, unknown> {
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

interface CryptoTickerSettingsManager {
    applyDefaultSettings(partial: unknown): CryptoTickerSettings & Record<string, unknown>;
    getDefaultSettingsSnapshot(): CryptoTickerSettings & Record<string, unknown>;
    defaultSettings: CryptoTickerSettings & Record<string, unknown>;
    settingsSchema: unknown;
    refreshSettings(options: RefreshSettingsOptions): CryptoTickerSettings & Record<string, unknown>;
}

interface RefreshSettingsOptions {
    context: string;
    settings: unknown;
    updateSubscription?: (settings: CryptoTickerSettings & Record<string, unknown>) => void;
}

interface TickerStateModule {
    setContextDetails(context: string, settings: CryptoTickerSettings & Record<string, unknown>): void;
}

interface DefaultSettingsModule {
    settingsSchema?: unknown;
    defaultSettings?: CryptoTickerSettings & Record<string, unknown>;
    getDefaultSettings?: () => CryptoTickerSettings & Record<string, unknown>;
    applyDefaults?: (partial: unknown) => CryptoTickerSettings & Record<string, unknown>;
}

interface GlobalRootScope extends Record<string, unknown> {
    CryptoTickerDefaults?: DefaultSettingsModule;
    CryptoTickerState?: TickerStateModule;
    CryptoTickerSettingsManager?: CryptoTickerSettingsManager;
}
