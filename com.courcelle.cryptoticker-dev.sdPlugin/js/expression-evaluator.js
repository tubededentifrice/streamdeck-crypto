'use strict';
class ExpressionEvaluator {
    constructor(options, ParserCtor) {
        const evaluatorOptions = options || {};
        const allowed = Array.isArray(evaluatorOptions.allowedVariables) && evaluatorOptions.allowedVariables.length > 0
            ? evaluatorOptions.allowedVariables.slice()
            : DEFAULT_ALLOWED_VARIABLES.slice();
        this.allowedVariables = allowed;
        const ParserFactory = ParserCtor || getDefaultParser();
        this.parser = new ParserFactory({
            operators: {
                add: true,
                subtract: true,
                multiply: true,
                divide: true,
                remainder: true,
                power: false,
                factorial: false,
                comparison: true,
                logical: true,
                conditional: true,
                concatenate: false,
                assignment: false,
                array: false,
                fndef: false
            },
            allowMemberAccess: false
        });
        this.cache = {};
    }
    validate(expression) {
        let entry;
        try {
            entry = this.getCacheEntry(expression);
        }
        catch (err) {
            const error = err instanceof Error ? err.message : 'Invalid expression';
            return {
                ok: false,
                error
            };
        }
        if (!entry) {
            return {
                ok: false,
                error: 'Expression cannot be empty'
            };
        }
        if (entry.disallowedVariables.length > 0) {
            return {
                ok: false,
                error: 'Unknown variables: ' +
                    entry.disallowedVariables.join(', ') +
                    '. Allowed variables: ' +
                    this.allowedVariables.join(', ')
            };
        }
        return {
            ok: true,
            variables: entry.variables.slice()
        };
    }
    evaluate(expression, variables) {
        const entry = this.getCacheEntry(expression);
        if (!entry) {
            throw new Error('Expression cannot be empty');
        }
        if (entry.disallowedVariables.length > 0) {
            throw new Error('Unknown variables: ' +
                entry.disallowedVariables.join(', ') +
                '. Allowed variables: ' +
                this.allowedVariables.join(', '));
        }
        const sanitized = {};
        const source = variables || {};
        for (const name of this.allowedVariables) {
            const rawValue = Object.prototype.hasOwnProperty.call(source, name)
                ? source[name]
                : undefined;
            if (DEFAULT_ALLOWED_VARIABLES.indexOf(name) !== -1) {
                sanitized[name] = normalizeNumericValue(rawValue);
                continue;
            }
            if (typeof rawValue === 'number') {
                sanitized[name] = Number.isFinite(rawValue) ? rawValue : 0;
            }
            else if (typeof rawValue === 'boolean' || typeof rawValue === 'string') {
                sanitized[name] = rawValue;
            }
            else if (rawValue === undefined || rawValue === null) {
                sanitized[name] = 0;
            }
            else {
                sanitized[name] = rawValue;
            }
        }
        return entry.compiled.evaluate(sanitized);
    }
    clearCache() {
        this.cache = {};
    }
    getCacheEntry(expression) {
        const normalized = this.normalizeExpression(expression);
        if (!normalized) {
            return null;
        }
        if (this.cache[normalized]) {
            return this.cache[normalized];
        }
        let compiled;
        try {
            compiled = this.parser.parse(normalized);
        }
        catch (err) {
            throw this.wrapParseError(err);
        }
        const variables = compiled.variables({ withMembers: false }) || [];
        const disallowed = variables.filter((variableName) => this.allowedVariables.indexOf(variableName) === -1);
        const entry = {
            expression: normalized,
            compiled,
            variables: variables.slice(),
            disallowedVariables: disallowed.slice()
        };
        this.cache[normalized] = entry;
        return entry;
    }
    normalizeExpression(expression) {
        if (typeof expression !== 'string') {
            return '';
        }
        return expression.trim();
    }
    wrapParseError(error) {
        const message = error && typeof error === 'object' && error instanceof Error && error.message
            ? enhanceErrorMessage(error.message)
            : 'Invalid expression';
        const wrappedError = new Error(message);
        if (error && typeof error === 'object') {
            wrappedError.originalError = error;
        }
        return wrappedError;
    }
}
const DEFAULT_ALLOWED_VARIABLES = ['value', 'high', 'low', 'changeDaily', 'changeDailyPercent', 'volume'];
function cloneArray(source) {
    return source ? source.slice() : [];
}
// Providers sometimes send strings/null; coerce to safe numbers so expressions never throw.
function normalizeNumericValue(value) {
    if (value === undefined || value === null) {
        return 0;
    }
    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            return 0;
        }
        return value;
    }
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return 0;
}
// Canonical expression variable map keeps alerts and color rules in sync across action + PI.
function buildBaseContext(values) {
    const source = values || {};
    return {
        value: normalizeNumericValue(source.last),
        high: normalizeNumericValue(source.high),
        low: normalizeNumericValue(source.low),
        changeDaily: normalizeNumericValue(source.changeDaily),
        changeDailyPercent: normalizeNumericValue(source.changeDailyPercent),
        volume: normalizeNumericValue(source.volume)
    };
}
function buildContext(values, overrides) {
    const context = buildBaseContext(values);
    if (overrides && typeof overrides === 'object') {
        for (const key in overrides) {
            if (Object.prototype.hasOwnProperty.call(overrides, key)) {
                context[key] = overrides[key];
            }
        }
    }
    return context;
}
function enhanceErrorMessage(message) {
    if (!message) {
        return 'Invalid expression';
    }
    if (message.indexOf('member access is not permitted') >= 0) {
        return (message + '. Remove object-style prefixes (for example use "value" instead of "values.last").');
    }
    return message;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createEvaluator(options) {
    return new ExpressionEvaluator(options);
}
function getDefaultParser() {
    if (typeof require === 'function') {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const exprEval = require('expr-eval');
            if (exprEval && exprEval.Parser) {
                return exprEval.Parser;
            }
        }
        catch (err) {
            // ignore, fall back to global
        }
    }
    const root = typeof globalThis !== 'undefined' ? globalThis : {};
    const parserFromGlobal = root.exprEval && root.exprEval.Parser;
    if (parserFromGlobal) {
        return parserFromGlobal;
    }
    throw new Error('expr-eval dependency is missing');
}
(function loadExpressionEvaluator(root, factory) {
    const parserCtor = getDefaultParser();
    const exports = factory(parserCtor);
    if (typeof module === 'object' && module.exports) {
        module.exports = exports;
    }
    if (root && typeof root === 'object') {
        root.CryptoTickerExpressionEvaluator = exports;
    }
})(typeof self !== 'undefined' ? self : this, function buildExports(Parser) {
    return {
        createEvaluator: (options) => new ExpressionEvaluator(options, Parser),
        ExpressionEvaluator,
        normalizeNumericValue,
        buildBaseContext,
        buildContext,
        allowedVariables: cloneArray(DEFAULT_ALLOWED_VARIABLES)
    };
});
