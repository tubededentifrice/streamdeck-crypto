'use strict';

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('expr-eval').Parser);
  } else {
    if (!root.exprEval || !root.exprEval.Parser) {
      throw new Error('expr-eval dependency is missing');
    }
    root.CryptoTickerExpressionEvaluator = factory(root.exprEval.Parser);
  }
})(typeof self !== 'undefined' ? self : this, function (Parser) {
  // Restrict expressions to vetted variables so user input cannot reach arbitrary properties; PI whitelists extras when needed.
  const DEFAULT_ALLOWED_VARIABLES = [
    'value',
    'high',
    'low',
    'changeDaily',
    'changeDailyPercent',
    'volume'
  ];

  function cloneArray(source) {
    return source ? source.slice(0) : [];
  }

  // Providers sometimes send strings/null; coerce to safe numbers so expressions never throw.
  function normalizeNumericValue(value) {
    if (value === undefined || value === null) {
      return 0;
    }

    if (typeof value === 'number') {
      if (!isFinite(value)) {
        return 0;
      }
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (!isNaN(parsed) && isFinite(parsed)) {
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
      return (
        message +
        '. Remove object-style prefixes (for example use "value" instead of "values.last").'
      );
    }

    return message;
  }

  // Thin expr-eval wrapper adding variable whitelisting, caching, and friendlier user errors.
  function ExpressionEvaluator(options) {
    const evaluatorOptions = options || {};
    const allowed =
      Array.isArray(evaluatorOptions.allowedVariables) &&
      evaluatorOptions.allowedVariables.length > 0
        ? cloneArray(evaluatorOptions.allowedVariables)
        : cloneArray(DEFAULT_ALLOWED_VARIABLES);

    this.allowedVariables = allowed;
    this.parser = new Parser({
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

  ExpressionEvaluator.prototype._normalizeExpression = function (expression) {
    if (typeof expression !== 'string') {
      return '';
    }
    return expression.trim();
  };

  ExpressionEvaluator.prototype._wrapParseError = function (error) {
    const message =
      error && error.message ? enhanceErrorMessage(error.message) : 'Invalid expression';
    const wrapped = new Error(message);
    wrapped.originalError = error;
    return wrapped;
  };

  // Parse + cache compiled AST; cache persists until plugin restart so repeated evals stay fast.
  ExpressionEvaluator.prototype._getCacheEntry = function (expression) {
    const normalized = this._normalizeExpression(expression);
    if (!normalized) {
      return null;
    }

    if (this.cache[normalized]) {
      return this.cache[normalized];
    }

    let compiled;
    try {
      compiled = this.parser.parse(normalized);
    } catch (err) {
      throw this._wrapParseError(err);
    }

    const variables = compiled.variables({ withMembers: false });
    const disallowed = [];
    for (let i = 0; i < variables.length; i++) {
      const variableName = variables[i];
      if (this.allowedVariables.indexOf(variableName) === -1) {
        disallowed.push(variableName);
      }
    }

    const entry = {
      expression: normalized,
      compiled: compiled,
      variables: cloneArray(variables),
      disallowedVariables: cloneArray(disallowed)
    };
    this.cache[normalized] = entry;
    return entry;
  };

  ExpressionEvaluator.prototype.validate = function (expression) {
    let entry;
    try {
      entry = this._getCacheEntry(expression);
    } catch (err) {
      return {
        ok: false,
        error: err.message
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
      variables: cloneArray(entry.variables)
    };
  };

  ExpressionEvaluator.prototype.evaluate = function (expression, variables) {
    const entry = this._getCacheEntry(expression);
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

    const sanitized = {};
    const source = variables || {};
    for (let i = 0; i < this.allowedVariables.length; i++) {
      const name = this.allowedVariables[i];
      const rawValue = Object.prototype.hasOwnProperty.call(source, name)
        ? source[name]
        : undefined;

      if (DEFAULT_ALLOWED_VARIABLES.indexOf(name) !== -1) {
        sanitized[name] = normalizeNumericValue(rawValue);
        continue;
      }

      if (typeof rawValue === 'number') {
        sanitized[name] = isFinite(rawValue) ? rawValue : 0;
      } else if (typeof rawValue === 'boolean' || typeof rawValue === 'string') {
        sanitized[name] = rawValue;
      } else if (rawValue === undefined || rawValue === null) {
        sanitized[name] = 0;
      } else {
        sanitized[name] = rawValue;
      }
    }

    return entry.compiled.evaluate(sanitized);
  };

  ExpressionEvaluator.prototype.clearCache = function () {
    this.cache = {};
  };

  function createEvaluator(options) {
    return new ExpressionEvaluator(options);
  }

  return {
    createEvaluator: createEvaluator,
    ExpressionEvaluator: ExpressionEvaluator,
    normalizeNumericValue: normalizeNumericValue,
    buildBaseContext: buildBaseContext,
    buildContext: buildContext,
    allowedVariables: cloneArray(DEFAULT_ALLOWED_VARIABLES)
  };
});
