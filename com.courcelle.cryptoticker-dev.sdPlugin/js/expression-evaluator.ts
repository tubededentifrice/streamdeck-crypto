'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */

interface ExpressionEvaluatorOptions {
  allowedVariables?: string[];
}

interface ExpressionNode {
  type: string;
  name?: string;
  value?: unknown;
  operator?: string;
  argument?: ExpressionNode;
  left?: ExpressionNode;
  right?: ExpressionNode;
  test?: ExpressionNode;
  consequent?: ExpressionNode;
  alternate?: ExpressionNode;
  object?: ExpressionNode;
  property?: ExpressionNode;
  arguments?: ExpressionNode[];
  expressions?: ExpressionNode[];
}

interface JsepParser {
  (expression: string): ExpressionNode;
  addBinaryOp?(operator: string, precedence: number): void;
  addUnaryOp?(operator: string): void;
}

interface ExpressionCacheEntry {
  expression: string;
  compiled: ExpressionNode;
  variables: string[];
  disallowedVariables: string[];
  validationError: string | null;
}

interface ValidationResult {
  ok: boolean;
  error?: string;
  variables?: string[];
}

interface ExpressionEvaluatorExports {
  createEvaluator(options?: ExpressionEvaluatorOptions): ExpressionEvaluator;
  ExpressionEvaluator: typeof ExpressionEvaluator;
  normalizeNumericValue(value: unknown): number;
  buildBaseContext(values: Record<string, unknown> | null | undefined): Record<string, unknown>;
  buildContext(
    values: Record<string, unknown> | null | undefined,
    overrides?: Record<string, unknown> | null
  ): Record<string, unknown>;
  allowedVariables: string[];
}

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
  public readonly allowedVariables: string[];
  private readonly parser: JsepParser;
  private readonly cache: Map<string, ExpressionCacheEntry>;

  constructor(options?: ExpressionEvaluatorOptions, parser?: JsepParser) {
    const evaluatorOptions = options || {};
    this.allowedVariables =
      Array.isArray(evaluatorOptions.allowedVariables) &&
      evaluatorOptions.allowedVariables.length > 0
        ? evaluatorOptions.allowedVariables.slice()
        : DEFAULT_ALLOWED_VARIABLES.slice();
    this.parser = parser || getDefaultParser();
    this.cache = new Map();
  }

  validate(expression: unknown): ValidationResult {
    let entry: ExpressionCacheEntry | null;
    try {
      entry = this.getCacheEntry(expression);
    } catch (err) {
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

  evaluate(expression: unknown, variables?: Record<string, unknown> | null): unknown {
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

    const sanitized = Object.create(null) as Record<string, unknown>;
    const source = variables || {};
    for (const name of this.allowedVariables) {
      const rawValue = Object.prototype.hasOwnProperty.call(source, name)
        ? source[name]
        : undefined;

      if (DEFAULT_ALLOWED_VARIABLES.indexOf(name) !== -1) {
        sanitized[name] = normalizeNumericValue(rawValue);
      } else if (typeof rawValue === 'number') {
        sanitized[name] = Number.isFinite(rawValue) ? rawValue : 0;
      } else if (typeof rawValue === 'boolean' || typeof rawValue === 'string') {
        sanitized[name] = rawValue;
      } else {
        sanitized[name] = 0;
      }
    }

    return evaluateNode(entry.compiled, sanitized);
  }

  clearCache(): void {
    this.cache.clear();
  }

  private getCacheEntry(expression: unknown): ExpressionCacheEntry | null {
    const normalized = this.normalizeExpression(expression);
    if (!normalized) {
      return null;
    }

    const cached = this.cache.get(normalized);
    if (cached) {
      return cached;
    }

    let compiled: ExpressionNode;
    try {
      compiled = this.parser(normalized);
    } catch (err) {
      throw this.wrapParseError(err);
    }

    const variables = new Set<string>();
    const validationError = validateNode(compiled, variables);
    const variableList = Array.from(variables);
    const disallowedVariables = variableList.filter(
      (variableName) => this.allowedVariables.indexOf(variableName) === -1
    );

    const entry: ExpressionCacheEntry = {
      expression: normalized,
      compiled,
      variables: variableList,
      disallowedVariables,
      validationError
    };
    this.cache.set(normalized, entry);
    return entry;
  }

  private normalizeExpression(expression: unknown): string {
    return typeof expression === 'string' ? expression.trim() : '';
  }

  private buildUnknownVariablesError(disallowedVariables: string[]): string {
    return (
      'Unknown variables: ' +
      disallowedVariables.join(', ') +
      '. Allowed variables: ' +
      this.allowedVariables.join(', ')
    );
  }

  private wrapParseError(error: unknown): Error {
    const message =
      error instanceof Error && error.message
        ? enhanceErrorMessage(error.message)
        : 'Invalid expression';
    const wrappedError = new Error(message);
    (wrappedError as Error & { originalError?: unknown }).originalError = error;
    return wrappedError;
  }
}

function validateNode(node: ExpressionNode | undefined, variables: Set<string>): string | null {
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
      if (
        !node.operator ||
        (!BINARY_OPERATORS.has(node.operator) && !LOGICAL_OPERATORS.has(node.operator))
      ) {
        return 'Unsupported binary operator: ' + (node.operator || 'unknown');
      }
      return validateNode(node.left, variables) || validateNode(node.right, variables);
    case 'ConditionalExpression':
      return (
        validateNode(node.test, variables) ||
        validateNode(node.consequent, variables) ||
        validateNode(node.alternate, variables)
      );
    case 'MemberExpression':
      return 'Member access is not permitted. Use a listed variable directly.';
    case 'CallExpression':
      return 'Function calls are not permitted';
    default:
      return 'Unsupported expression syntax: ' + node.type;
  }
}

function evaluateNode(
  node: ExpressionNode | undefined,
  variables: Record<string, unknown>
): unknown {
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

function evaluateUnary(operator: string | undefined, value: unknown): unknown {
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

function evaluateBinary(node: ExpressionNode, variables: Record<string, unknown>): unknown {
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
      return (left as number) < (right as number);
    case '<=':
      return (left as number) <= (right as number);
    case '>':
      return (left as number) > (right as number);
    case '>=':
      return (left as number) >= (right as number);
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
function normalizeNumericValue(value: unknown): number {
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
function buildBaseContext(
  values: Record<string, unknown> | null | undefined
): Record<string, unknown> {
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

function buildContext(
  values: Record<string, unknown> | null | undefined,
  overrides?: Record<string, unknown> | null
): Record<string, unknown> {
  const context = buildBaseContext(values);
  if (overrides && typeof overrides === 'object') {
    for (const key of Object.keys(overrides)) {
      context[key] = overrides[key];
    }
  }
  return context;
}

function enhanceErrorMessage(message: string): string {
  if (!message) {
    return 'Invalid expression';
  }
  if (message.toLowerCase().indexOf('member') >= 0) {
    return (
      message + '. Remove object-style prefixes (for example use "value" instead of "values.last").'
    );
  }
  return message;
}

function getDefaultParser(): JsepParser {
  if (typeof require === 'function') {
    const jsepModule = require('jsep');
    const parser = (jsepModule && (jsepModule.default || jsepModule)) as JsepParser;
    if (parser && typeof parser === 'function') {
      parser.addBinaryOp?.('and', 2);
      parser.addBinaryOp?.('or', 1);
      parser.addUnaryOp?.('not');
      return parser;
    }
  }
  throw new Error('jsep dependency is missing');
}

(function loadExpressionEvaluator(
  root: Record<string, unknown> | undefined,
  factory: (parser: JsepParser) => ExpressionEvaluatorExports
) {
  const exports = factory(getDefaultParser());
  if (typeof module === 'object' && module.exports) {
    module.exports = exports;
  }
  if (root && typeof root === 'object') {
    (root as ExpressionEvaluatorGlobalRoot).CryptoTickerExpressionEvaluator = exports;
  }
})(
  typeof self !== 'undefined'
    ? (self as unknown as Record<string, unknown>)
    : (this as unknown as Record<string, unknown>),
  function buildExports(parser): ExpressionEvaluatorExports {
    return {
      createEvaluator: (options?: ExpressionEvaluatorOptions) =>
        new ExpressionEvaluator(options, parser),
      ExpressionEvaluator,
      normalizeNumericValue,
      buildBaseContext,
      buildContext,
      allowedVariables: DEFAULT_ALLOWED_VARIABLES.slice()
    };
  }
);

interface ExpressionEvaluatorGlobalRoot extends Record<string, unknown> {
  CryptoTickerExpressionEvaluator?: ExpressionEvaluatorExports;
}
