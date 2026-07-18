const expressionEvaluator = require('../com.courcelle.cryptoticker-dev.sdPlugin/js/expression-evaluator');

describe('expression evaluator', () => {
  test('preserves documented arithmetic, logical, and ternary rules', () => {
    const evaluator = expressionEvaluator.createEvaluator();
    const context = expressionEvaluator.buildBaseContext({
      last: 125,
      high: 130,
      low: 100,
      changeDailyPercent: 0.05
    });

    expect(evaluator.evaluate('value > 100 && high >= value ? value * 2 : low', context)).toBe(250);
    expect(evaluator.evaluate('value > 100 and not (low > value)', context)).toBe(true);
  });

  test('allows color strings without exposing objects or functions', () => {
    const evaluator = expressionEvaluator.createEvaluator({
      allowedVariables: expressionEvaluator.allowedVariables.concat(['alert', 'defaultTextColor'])
    });

    expect(
      evaluator.evaluate("alert ? '#ff0000' : defaultTextColor", {
        alert: true,
        defaultTextColor: '#ffffff'
      })
    ).toBe('#ff0000');
  });

  test.each([
    ['value.constructor', 'Member access is not permitted'],
    ['valueOf()', 'Function calls are not permitted'],
    ['value ** 2', 'Unsupported binary operator'],
    ['[value]', 'Unsupported expression syntax']
  ])('rejects unsupported syntax: %s', (expression, expectedError) => {
    const result = expressionEvaluator.createEvaluator().validate(expression);

    expect(result.ok).toBe(false);
    expect(result.error).toContain(expectedError);
  });

  test('treats prototype-shaped expressions as ordinary unknown variables', () => {
    const evaluator = expressionEvaluator.createEvaluator();

    expect(evaluator.validate('__proto__')).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.stringContaining('Unknown variables')
      })
    );
  });
});
