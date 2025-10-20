'use strict';

interface StringNormalizerOptions {
  case?: 'upper' | 'lower';
  allowEmptyString?: boolean;
  allowNull?: boolean;
  trim?: boolean;
  allowedValues?: string[];
}

interface NumberNormalizerOptions {
  min?: number;
  max?: number;
  integer?: boolean;
}

type Normalizer<T> = (value: unknown) => T | null | undefined;

type SettingsSchemaType = 'string' | 'number';

interface SettingsSchemaEntry<T> {
  type: SettingsSchemaType;
  default: T;
  normalize: Normalizer<T>;
}

interface SettingsValidationError {
  key: string;
  message: string;
}

interface SettingsValidationResult {
  settings: NormalizedSettings;
  errors: SettingsValidationError[];
}

interface CryptoTickerDefaultsExports {
  settingsSchema: SettingsSchema;
  defaultSettings: NormalizedSettings;
  getDefaultSettings(): NormalizedSettings;
  validateSettings(settings: unknown): SettingsValidationResult;
  applyDefaults(partialSettings: unknown): NormalizedSettings;
}

type SettingsSchema = Record<keyof CryptoTickerSettings, SettingsSchemaEntry<CryptoTickerSettings[keyof CryptoTickerSettings]>>;

type NormalizedSettings = CryptoTickerSettings & Record<string, unknown>;

interface GlobalDefaultsRoot extends Record<string, unknown> {
  CryptoTickerDefaults?: CryptoTickerDefaultsExports;
}

(function loadDefaults(root: Record<string, unknown> | undefined, factory: () => CryptoTickerDefaultsExports) {
  const exports = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = exports;
  }
  if (root && typeof root === 'object') {
    (root as GlobalDefaultsRoot).CryptoTickerDefaults = exports;
  }
})(typeof self !== 'undefined' ? (self as unknown as Record<string, unknown>) : (this as unknown as Record<string, unknown>), function buildDefaults(): CryptoTickerDefaultsExports {
  function clone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => clone(item)) as unknown as T;
    }
    const copy: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        copy[key] = clone((obj as Record<string, unknown>)[key]);
      }
    }
    return copy as T;
  }

  function buildStringNormalizer(options?: StringNormalizerOptions): Normalizer<string> {
    const normalizeCase = options?.case;
    const allowEmpty = options?.allowEmptyString === true;
    const allowNull = options?.allowNull === true;
    const trim = Object.prototype.hasOwnProperty.call(options || {}, 'trim') ? !!options?.trim : true;
    const allowedValues = Array.isArray(options?.allowedValues) ? options?.allowedValues : null;

    return function normalizeString(value: unknown): string | null {
      if (value === undefined) {
        return null;
      }

      if (value === null) {
        return allowNull ? null : '';
      }

      let str = String(value);
      if (trim) {
        str = str.trim();
      }

      if (!str && !allowEmpty) {
        return null;
      }

      if (normalizeCase === 'upper') {
        str = str.toUpperCase();
      } else if (normalizeCase === 'lower') {
        str = str.toLowerCase();
      }

      if (allowedValues && allowedValues.length > 0) {
        const lookup = normalizeCase === 'lower' ? str.toLowerCase() : normalizeCase === 'upper' ? str.toUpperCase() : str;

        const matches = allowedValues.some((allowed) => {
          if (normalizeCase === 'lower') {
            return allowed.toLowerCase() === lookup;
          }
          if (normalizeCase === 'upper') {
            return allowed.toUpperCase() === lookup;
          }
          return allowed === lookup;
        });

        if (!matches) {
          return null;
        }

        if (normalizeCase === 'lower' || normalizeCase === 'upper') {
          return lookup;
        }
        return str;
      }

      return str;
    };
  }

  function buildNumberNormalizer(options?: NumberNormalizerOptions): Normalizer<number> {
    const min = typeof options?.min === 'number' ? options.min : null;
    const max = typeof options?.max === 'number' ? options.max : null;
    const integer = options?.integer === true;

    return function normalizeNumber(value: unknown): number | null {
      if (value === undefined || value === null || value === '') {
        return null;
      }

      let numeric = typeof value === 'number' ? value : parseFloat(String(value));
      if (Number.isNaN(numeric)) {
        return null;
      }

      if (integer) {
        numeric = Math.round(numeric);
      }

      if (min !== null && numeric < min) {
        numeric = min;
      }

      if (max !== null && numeric > max) {
        numeric = max;
      }

      return numeric;
    };
  }

  const settingsSchema: SettingsSchema = {
    title: {
      type: 'string',
      default: '',
      normalize: buildStringNormalizer({ allowEmptyString: true, allowNull: true, trim: true })
    },
    exchange: {
      type: 'string',
      default: 'BINANCE',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: 'upper' })
    },
    pair: {
      type: 'string',
      default: 'BTCUSD',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: 'upper' })
    },
    fromCurrency: {
      type: 'string',
      default: 'USD',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: 'upper' })
    },
    currency: {
      type: 'string',
      default: '',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: true, case: 'upper', allowNull: true })
    },
    candlesInterval: {
      type: 'string',
      default: '1h',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: false })
    },
    candlesDisplayed: {
      type: 'number',
      default: 20,
      normalize: buildNumberNormalizer({ min: 5, max: 60, integer: true })
    },
    multiplier: {
      type: 'number',
      default: 1,
      normalize: buildNumberNormalizer({ min: 0 })
    },
    digits: {
      type: 'number',
      default: 2,
      normalize: buildNumberNormalizer({ min: 0, max: 10, integer: true })
    },
    highLowDigits: {
      type: 'string',
      default: '',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: true })
    },
    font: {
      type: 'string',
      default: "Lato,'Roboto Condensed',Helvetica,Calibri,sans-serif",
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: false })
    },
    fontSizeBase: {
      type: 'number',
      default: 25,
      normalize: buildNumberNormalizer({ min: 1, max: 200, integer: true })
    },
    fontSizePrice: {
      type: 'number',
      default: 35,
      normalize: buildNumberNormalizer({ min: 1, max: 200, integer: true })
    },
    fontSizeHighLow: {
      type: 'string',
      default: '',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: true })
    },
    fontSizeChange: {
      type: 'number',
      default: 19,
      normalize: buildNumberNormalizer({ min: 1, max: 200, integer: true })
    },
    priceFormat: {
      type: 'string',
      default: 'auto',
      normalize: function(value: unknown): string | null {
        const baseNormalizer = buildStringNormalizer({ trim: true, allowEmptyString: false, case: 'lower' });
        const normalized = baseNormalizer(value);
        if (!normalized) {
          return null;
        }
        // Backward compatibility: map old values to new ones
        if (normalized === 'compact') {
          return 'auto';
        }
        if (normalized === 'plain') {
          return 'full';
        }
        // Only allow 'auto' and 'full'
        if (normalized === 'auto' || normalized === 'full') {
          return normalized;
        }
        // Invalid value, return null to fall back to default
        return null;
      }
    },
    backgroundColor: {
      type: 'string',
      default: '#000000',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: false })
    },
    textColor: {
      type: 'string',
      default: '#ffffff',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: false })
    },
    displayHighLow: {
      type: 'string',
      default: 'on',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: 'lower', allowedValues: ['on', 'off'] })
    },
    displayHighLowBar: {
      type: 'string',
      default: 'on',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: 'lower', allowedValues: ['on', 'off'] })
    },
    displayDailyChange: {
      type: 'string',
      default: 'on',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: 'lower', allowedValues: ['on', 'off'] })
    },
    displayConnectionStatusIcon: {
      type: 'string',
      default: 'OFF',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: 'upper', allowedValues: ['OFF', 'TOP_RIGHT', 'BOTTOM_LEFT'] })
    },
    alertRule: {
      type: 'string',
      default: '',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: true })
    },
    backgroundColorRule: {
      type: 'string',
      default: '',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: true })
    },
    textColorRule: {
      type: 'string',
      default: '',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: true })
    },
    mode: {
      type: 'string',
      default: 'ticker',
      normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: 'lower', allowedValues: ['ticker', 'candles'] })
    }
  };

  function coerceValue<T>(schemaEntry: SettingsSchemaEntry<T>, value: unknown, hasValue: boolean): { value: T; error: string | null } {
    if (!schemaEntry || typeof schemaEntry !== 'object') {
      return { value: value as T, error: null };
    }

    const normalizer = schemaEntry.normalize;
    const defaultValue = schemaEntry.default;
    if (typeof normalizer !== 'function') {
      const resolved = value === undefined ? clone(defaultValue) : (value as T);
      return { value: resolved, error: null };
    }

    const normalized = normalizer(value);
    if (normalized === null || normalized === undefined) {
      const fallbackNormalized = normalizer(defaultValue);
      const fallback = fallbackNormalized === null || fallbackNormalized === undefined ? clone(defaultValue) : (fallbackNormalized as T);
      return {
        value: fallback,
        error: hasValue ? 'Invalid ' + schemaEntry.type : null
      };
    }

    return {
      value: normalized as T,
      error: null
    };
  }

  function validateSettings(input: unknown): SettingsValidationResult {
    const provided = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
    const normalized: Record<string, unknown> = {};
    const errors: SettingsValidationError[] = [];

    for (const key in settingsSchema) {
      if (!Object.prototype.hasOwnProperty.call(settingsSchema, key)) {
        continue;
      }
      const schemaEntry = settingsSchema[key as keyof CryptoTickerSettings];
      const hasValue = Object.prototype.hasOwnProperty.call(provided, key);
      const rawValue = hasValue ? provided[key] : undefined;
      const result = coerceValue(schemaEntry, rawValue, hasValue);
      normalized[key] = result.value;
      if (result.error) {
        errors.push({ key, message: result.error });
      }
    }

    for (const extraKey in provided) {
      if (
        !Object.prototype.hasOwnProperty.call(settingsSchema, extraKey) &&
        Object.prototype.hasOwnProperty.call(provided, extraKey)
      ) {
        normalized[extraKey] = provided[extraKey];
      }
    }

    return {
      settings: normalized as NormalizedSettings,
      errors
    };
  }

  function applyDefaults(partialSettings: unknown): NormalizedSettings {
    const result = validateSettings(partialSettings);
    return result.settings;
  }

  const defaultSettings = applyDefaults(null);

  return {
    settingsSchema,
    defaultSettings,
    getDefaultSettings: function (): NormalizedSettings {
      return clone(defaultSettings);
    },
    validateSettings: function (settings: unknown): SettingsValidationResult {
      const result = validateSettings(settings);
      return {
        settings: result.settings,
        errors: result.errors.slice(0)
      };
    },
    applyDefaults
  };
});
