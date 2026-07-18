'use strict';
const DEFAULT_ALLOWED_VARIABLES = [
    'value',
    'high',
    'low',
    'changeDaily',
    'changeDailyPercent',
    'volume'
];
const BINARY_OPERATORS = new Set([
    '+',
    '-',
    '*',
    '/',
    '%',
    '<',
    '<=',
    '>',
    '>=',
    '==',
    '!=',
    '===',
    '!=='
]);
const LOGICAL_OPERATORS = new Set(['&&', '||', 'and', 'or']);
const UNARY_OPERATORS = new Set(['+', '-', '!', 'not']);
class ExpressionEvaluator {
    constructor(options, parser) {
        const evaluatorOptions = options || {};
        this.allowedVariables =
            Array.isArray(evaluatorOptions.allowedVariables) &&
                evaluatorOptions.allowedVariables.length > 0
                ? evaluatorOptions.allowedVariables.slice()
                : DEFAULT_ALLOWED_VARIABLES.slice();
        this.parser = parser || getDefaultParser();
        this.cache = new Map();
    }
    validate(expression) {
        let entry;
        try {
            entry = this.getCacheEntry(expression);
        }
        catch (err) {
            return {
                ok: false,
                error: err instanceof Error ? err.message : 'Invalid expression'
            };
        }
        if (!entry) {
            return {
                ok: false,
                error: 'Expression cannot be empty'
            };
        }
        if (entry.validationError) {
            return {
                ok: false,
                error: entry.validationError
            };
        }
        if (entry.disallowedVariables.length > 0) {
            return {
                ok: false,
                error: this.buildUnknownVariablesError(entry.disallowedVariables)
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
        if (entry.validationError) {
            throw new Error(entry.validationError);
        }
        if (entry.disallowedVariables.length > 0) {
            throw new Error(this.buildUnknownVariablesError(entry.disallowedVariables));
        }
        const sanitized = Object.create(null);
        const source = variables || {};
        for (const name of this.allowedVariables) {
            const rawValue = Object.prototype.hasOwnProperty.call(source, name)
                ? source[name]
                : undefined;
            if (DEFAULT_ALLOWED_VARIABLES.indexOf(name) !== -1) {
                sanitized[name] = normalizeNumericValue(rawValue);
            }
            else if (typeof rawValue === 'number') {
                sanitized[name] = Number.isFinite(rawValue) ? rawValue : 0;
            }
            else if (typeof rawValue === 'boolean' || typeof rawValue === 'string') {
                sanitized[name] = rawValue;
            }
            else {
                sanitized[name] = 0;
            }
        }
        return evaluateNode(entry.compiled, sanitized);
    }
    clearCache() {
        this.cache.clear();
    }
    getCacheEntry(expression) {
        const normalized = this.normalizeExpression(expression);
        if (!normalized) {
            return null;
        }
        const cached = this.cache.get(normalized);
        if (cached) {
            return cached;
        }
        let compiled;
        try {
            compiled = this.parser(normalized);
        }
        catch (err) {
            throw this.wrapParseError(err);
        }
        const variables = new Set();
        const validationError = validateNode(compiled, variables);
        const variableList = Array.from(variables);
        const disallowedVariables = variableList.filter((variableName) => this.allowedVariables.indexOf(variableName) === -1);
        const entry = {
            expression: normalized,
            compiled,
            variables: variableList,
            disallowedVariables,
            validationError
        };
        this.cache.set(normalized, entry);
        return entry;
    }
    normalizeExpression(expression) {
        return typeof expression === 'string' ? expression.trim() : '';
    }
    buildUnknownVariablesError(disallowedVariables) {
        return ('Unknown variables: ' +
            disallowedVariables.join(', ') +
            '. Allowed variables: ' +
            this.allowedVariables.join(', '));
    }
    wrapParseError(error) {
        const message = error instanceof Error && error.message
            ? enhanceErrorMessage(error.message)
            : 'Invalid expression';
        const wrappedError = new Error(message);
        wrappedError.originalError = error;
        return wrappedError;
    }
}
function validateNode(node, variables) {
    if (!node || typeof node !== 'object') {
        return 'Invalid expression node';
    }
    switch (node.type) {
        case 'Literal':
            return null;
        case 'Identifier':
            if (!node.name) {
                return 'Invalid variable name';
            }
            variables.add(node.name);
            return null;
        case 'UnaryExpression':
            if (!node.operator || !UNARY_OPERATORS.has(node.operator)) {
                return 'Unsupported unary operator: ' + (node.operator || 'unknown');
            }
            return validateNode(node.argument, variables);
        case 'BinaryExpression':
            if (!node.operator ||
                (!BINARY_OPERATORS.has(node.operator) && !LOGICAL_OPERATORS.has(node.operator))) {
                return 'Unsupported binary operator: ' + (node.operator || 'unknown');
            }
            return validateNode(node.left, variables) || validateNode(node.right, variables);
        case 'ConditionalExpression':
            return (validateNode(node.test, variables) ||
                validateNode(node.consequent, variables) ||
                validateNode(node.alternate, variables));
        case 'MemberExpression':
            return 'Member access is not permitted. Use a listed variable directly.';
        case 'CallExpression':
            return 'Function calls are not permitted';
        default:
            return 'Unsupported expression syntax: ' + node.type;
    }
}
function evaluateNode(node, variables) {
    if (!node) {
        throw new Error('Invalid expression node');
    }
    switch (node.type) {
        case 'Literal':
            return node.value;
        case 'Identifier':
            if (!node.name || !Object.prototype.hasOwnProperty.call(variables, node.name)) {
                throw new Error('Unknown variable: ' + (node.name || ''));
            }
            return variables[node.name];
        case 'UnaryExpression':
            return evaluateUnary(node.operator, evaluateNode(node.argument, variables));
        case 'BinaryExpression':
            return evaluateBinary(node, variables);
        case 'ConditionalExpression':
            return evaluateNode(node.test, variables)
                ? evaluateNode(node.consequent, variables)
                : evaluateNode(node.alternate, variables);
        default:
            throw new Error('Unsupported expression syntax: ' + node.type);
    }
}
function evaluateUnary(operator, value) {
    switch (operator) {
        case '+':
            return Number(value);
        case '-':
            return -Number(value);
        case '!':
        case 'not':
            return !value;
        default:
            throw new Error('Unsupported unary operator: ' + (operator || 'unknown'));
    }
}
function evaluateBinary(node, variables) {
    const operator = node.operator;
    const left = evaluateNode(node.left, variables);
    if (operator === '&&' || operator === 'and') {
        return left && evaluateNode(node.right, variables);
    }
    if (operator === '||' || operator === 'or') {
        return left || evaluateNode(node.right, variables);
    }
    const right = evaluateNode(node.right, variables);
    switch (operator) {
        case '+':
            return typeof left === 'string' || typeof right === 'string'
                ? String(left) + String(right)
                : Number(left) + Number(right);
        case '-':
            return Number(left) - Number(right);
        case '*':
            return Number(left) * Number(right);
        case '/':
            return Number(left) / Number(right);
        case '%':
            return Number(left) % Number(right);
        case '<':
            return left < right;
        case '<=':
            return left <= right;
        case '>':
            return left > right;
        case '>=':
            return left >= right;
        // Intentional loose equality preserves the legacy rule language.
        case '==':
            // eslint-disable-next-line eqeqeq
            return left == right;
        case '!=':
            // eslint-disable-next-line eqeqeq
            return left != right;
        case '===':
            return left === right;
        case '!==':
            return left !== right;
        default:
            throw new Error('Unsupported binary operator: ' + (operator || 'unknown'));
    }
}
// Providers sometimes send strings/null; coerce to safe numbers so expressions never throw.
function normalizeNumericValue(value) {
    if (value === undefined || value === null) {
        return 0;
    }
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
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
        for (const key of Object.keys(overrides)) {
            context[key] = overrides[key];
        }
    }
    return context;
}
function enhanceErrorMessage(message) {
    if (!message) {
        return 'Invalid expression';
    }
    if (message.toLowerCase().indexOf('member') >= 0) {
        return (message + '. Remove object-style prefixes (for example use "value" instead of "values.last").');
    }
    return message;
}
function getDefaultParser() {
    var _a, _b, _c;
    if (typeof require === 'function') {
        const jsepModule = require('jsep');
        const parser = (jsepModule && (jsepModule.default || jsepModule));
        if (parser && typeof parser === 'function') {
            (_a = parser.addBinaryOp) === null || _a === void 0 ? void 0 : _a.call(parser, 'and', 2);
            (_b = parser.addBinaryOp) === null || _b === void 0 ? void 0 : _b.call(parser, 'or', 1);
            (_c = parser.addUnaryOp) === null || _c === void 0 ? void 0 : _c.call(parser, 'not');
            return parser;
        }
    }
    throw new Error('jsep dependency is missing');
}
(function loadExpressionEvaluator(root, factory) {
    const exports = factory(getDefaultParser());
    if (typeof module === 'object' && module.exports) {
        module.exports = exports;
    }
    if (root && typeof root === 'object') {
        root.CryptoTickerExpressionEvaluator = exports;
    }
})(typeof self !== 'undefined'
    ? self
    : this, function buildExports(parser) {
    return {
        createEvaluator: (options) => new ExpressionEvaluator(options, parser),
        ExpressionEvaluator,
        normalizeNumericValue,
        buildBaseContext,
        buildContext,
        allowedVariables: DEFAULT_ALLOWED_VARIABLES.slice()
    };
});
