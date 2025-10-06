declare module 'expr-eval' {
  interface ParserOperators {
    add?: boolean;
    subtract?: boolean;
    multiply?: boolean;
    divide?: boolean;
    remainder?: boolean;
    power?: boolean;
    factorial?: boolean;
    comparison?: boolean;
    logical?: boolean;
    conditional?: boolean;
    concatenate?: boolean;
    assignment?: boolean;
    array?: boolean;
    fndef?: boolean;
  }

  interface ParserOptions {
    operators?: ParserOperators;
    allowMemberAccess?: boolean;
  }

  interface Expression {
    variables(options?: { withMembers?: boolean }): string[];
    evaluate(context?: Record<string, unknown>): unknown;
  }

  interface ParserConstructor {
    new (options?: ParserOptions): ParserInstance;
  }

  interface ParserInstance {
    parse(expression: string): Expression;
  }

  export const Parser: ParserConstructor;
}
