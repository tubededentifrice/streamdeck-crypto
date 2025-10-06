'use strict';

interface ExpressionEvaluatorOptions {
  allowedVariables?: string[];
}

interface ParserExpression {
  variables(options?: { withMembers?: boolean }): string[];
  evaluate(context?: Record<string, unknown>): unknown;
}

interface ParserInstance {
  parse(expression: string): ParserExpression;
}

interface ParserConstructor {
  new (options?: unknown): ParserInstance;
}

interface ExpressionCacheEntry {
  expression: string;
  compiled: ParserExpression;
  variables: string[];
  disallowedVariables: string[];
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

class ExpressionEvaluator {
  public readonly allowedVariables: string[];
  private readonly parser: ParserInstance;
  private cache: Record<string, ExpressionCacheEntry>;

  constructor(options?: ExpressionEvaluatorOptions, ParserCtor?: ParserConstructor) {
    const evaluatorOptions = options || {};
    const allowed =
      Array.isArray(evaluatorOptions.allowedVariables) && evaluatorOptions.allowedVariables.length > 0
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

  validate(expression: unknown): ValidationResult {
    let entry: ExpressionCacheEntry | null;
    try {
      entry = this.getCacheEntry(expression);
    } catch (err) {
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
        error:
          'Unknown variables: ' +
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

  evaluate(expression: unknown, variables?: Record<string, unknown> | null): unknown {
    const entry = this.getCacheEntry(expression);
    if (!entry) {
      throw new Error('Expression cannot be empty');
    }

    if (entry.disallowedVariables.length > 0) {
      throw new Error(
        'Unknown variables: ' +
          entry.disallowedVariables.join(', ') +
          '. Allowed variables: ' +
          this.allowedVariables.join(', ')
      );
    }

    const sanitized: Record<string, unknown> = {};
    const source = variables || {};
    for (const name of this.allowedVariables) {
      const rawValue = Object.prototype.hasOwnProperty.call(source, name)
        ? (source as Record<string, unknown>)[name]
        : undefined;

      if (DEFAULT_ALLOWED_VARIABLES.indexOf(name) !== -1) {
        sanitized[name] = normalizeNumericValue(rawValue);
        continue;
      }

      if (typeof rawValue === 'number') {
        sanitized[name] = Number.isFinite(rawValue) ? rawValue : 0;
      } else if (typeof rawValue === 'boolean' || typeof rawValue === 'string') {
        sanitized[name] = rawValue;
      } else if (rawValue === undefined || rawValue === null) {
        sanitized[name] = 0;
      } else {
        sanitized[name] = rawValue;
      }
    }

    return entry.compiled.evaluate(sanitized);
  }

  clearCache(): void {
    this.cache = {};
  }

  private getCacheEntry(expression: unknown): ExpressionCacheEntry | null {
    const normalized = this.normalizeExpression(expression);
    if (!normalized) {
      return null;
    }

    if (this.cache[normalized]) {
      return this.cache[normalized];
    }

    let compiled: ParserExpression;
    try {
      compiled = this.parser.parse(normalized);
    } catch (err) {
      throw this.wrapParseError(err);
    }

    const variables = compiled.variables({ withMembers: false }) || [];
    const disallowed = variables.filter((variableName) => this.allowedVariables.indexOf(variableName) === -1);

    const entry: ExpressionCacheEntry = {
      expression: normalized,
      compiled,
      variables: variables.slice(),
      disallowedVariables: disallowed.slice()
    };
    this.cache[normalized] = entry;
    return entry;
  }

  private normalizeExpression(expression: unknown): string {
    if (typeof expression !== 'string') {
      return '';
    }
    return expression.trim();
  }

  private wrapParseError(error: unknown): Error {
    const message =
      error && typeof error === 'object' && error instanceof Error && error.message
        ? enhanceErrorMessage(error.message)
        : 'Invalid expression';
    const wrappedError = new Error(message);
    if (error && typeof error === 'object') {
      (wrappedError as Error & { originalError?: unknown }).originalError = error;
    }
    return wrappedError;
  }
}

const DEFAULT_ALLOWED_VARIABLES = ['value', 'high', 'low', 'changeDaily', 'changeDailyPercent', 'volume'];

function cloneArray<T>(source: T[] | null | undefined): T[] {
  return source ? source.slice() : [];
}

// Providers sometimes send strings/null; coerce to safe numbers so expressions never throw.
function normalizeNumericValue(value: unknown): number {
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
function buildBaseContext(values: Record<string, unknown> | null | undefined): Record<string, unknown> {
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
    for (const key in overrides) {
      if (Object.prototype.hasOwnProperty.call(overrides, key)) {
        context[key] = overrides[key];
      }
    }
  }

  return context;
}

function enhanceErrorMessage(message: string): string {
  if (!message) {
    return 'Invalid expression';
  }

  if (message.indexOf('member access is not permitted') >= 0) {
    return (
      message + '. Remove object-style prefixes (for example use "value" instead of "values.last").'
    );
  }

  return message;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createEvaluator(options?: ExpressionEvaluatorOptions): ExpressionEvaluator {
  return new ExpressionEvaluator(options);
}

function getDefaultParser(): ParserConstructor {
  if (typeof require === 'function') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const exprEval = require('expr-eval');
      if (exprEval && exprEval.Parser) {
        return exprEval.Parser as ParserConstructor;
      }
    } catch (err) {
      // ignore, fall back to global
    }
  }

  const root = typeof globalThis !== 'undefined' ? (globalThis as unknown as Record<string, unknown>) : {};
  const parserFromGlobal = root.exprEval && (root.exprEval as Record<string, unknown>).Parser;
  if (parserFromGlobal) {
    return parserFromGlobal as ParserConstructor;
  }

  throw new Error('expr-eval dependency is missing');
}

(function loadExpressionEvaluator(root: Record<string, unknown>, factory: (Parser: ParserConstructor) => ExpressionEvaluatorExports) {
  const parserCtor = getDefaultParser();
  const exports = factory(parserCtor);
  if (typeof module === 'object' && module.exports) {
    module.exports = exports;
  } else {
    root.CryptoTickerExpressionEvaluator = exports;
  }
})(typeof self !== 'undefined' ? (self as unknown as Record<string, unknown>) : (this as unknown as Record<string, unknown>), function buildExports(
  Parser
): ExpressionEvaluatorExports {
  return {
    createEvaluator: (options?: ExpressionEvaluatorOptions) => new ExpressionEvaluator(options, Parser),
    ExpressionEvaluator,
    normalizeNumericValue,
    buildBaseContext,
    buildContext,
    allowedVariables: cloneArray(DEFAULT_ALLOWED_VARIABLES)
  };
});
