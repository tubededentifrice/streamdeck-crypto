/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

(function (root: Record<string, unknown> | undefined, factory: (expressionEvaluator: ExpressionEvaluatorModule | undefined) => CryptoTickerAlertManager) {
    const expressionEvaluatorModule = typeof module === "object" && module.exports
        ? require("./expression-evaluator")
        : root?.CryptoTickerExpressionEvaluator;

    const dependency = factory(expressionEvaluatorModule as ExpressionEvaluatorModule | undefined);

    if (typeof module === "object" && module.exports) {
        module.exports = dependency;
    }

    if (root && typeof root === "object") {
        (root as AlertManagerGlobalRoot).CryptoTickerAlertManager = dependency;
    }
}(typeof self !== "undefined" ? (self as unknown as Record<string, unknown>) : (this as unknown as Record<string, unknown>), function (expressionEvaluator: ExpressionEvaluatorModule | undefined): CryptoTickerAlertManager {
    if (!expressionEvaluator) {
        throw new Error("Expression evaluator dependency is missing");
    }

    const evaluator = expressionEvaluator;
    const alertRuleEvaluator = evaluator.createEvaluator();
    const alertStatuses: Record<string, "on" | "off" | "error"> = {};
    const alertArmedStates: Record<string, "on" | "off"> = {};

    function getAlertStatus(context: string): "on" | "off" | "error" {
        return alertStatuses[context] || "off";
    }

    function isAlertArmed(context: string): boolean {
        return alertArmedStates[context] !== "off";
    }

    function disarmAlert(context: string): void {
        alertArmedStates[context] = "off";
    }

    function armAlert(context: string): void {
        alertArmedStates[context] = "on";
    }

    function shouldDisarmOnKeyPress(context: string): boolean {
        return isAlertArmed(context) && getAlertStatus(context) === "on";
    }

    function clearContext(context: string): void {
        delete alertStatuses[context];
        delete alertArmedStates[context];
    }

    function evaluateAlert(params: EvaluateAlertParams): EvaluateAlertResult {
        const context = params.context;
        const settings = params.settings || ({} as CryptoTickerSettings & Record<string, unknown>);
        const values = params.values || {};
        let backgroundColor = params.backgroundColor;
        let textColor = params.textColor;
        let alertMode = false;

        const alertRule = settings.alertRule;
        if (!alertRule) {
            alertStatuses[context] = "off";
            return {
                alertMode,
                backgroundColor,
                textColor
            };
        }

        try {
            const contextVariables = evaluator.buildBaseContext(values);
            const evaluationResult = alertRuleEvaluator.evaluate(alertRule, contextVariables);

            if (evaluationResult) {
                alertStatuses[context] = "on";
                if (isAlertArmed(context)) {
                    alertMode = true;
                    const tmp = backgroundColor;
                    backgroundColor = textColor;
                    textColor = tmp;
                }
            } else {
                alertStatuses[context] = "off";
                armAlert(context);
            }
        } catch (err) {
            alertStatuses[context] = "error";
            console.error("Error evaluating alertRule", {
                context,
                settings,
                values,
                error: err instanceof Error ? err.message : err
            });
        }

        return {
            alertMode,
            backgroundColor,
            textColor
        };
    }

    return {
        evaluateAlert,
        shouldDisarmOnKeyPress,
        disarmAlert,
        armAlert,
        clearContext,
        getAlertStatus,
        isAlertArmed
    };
}));

interface AlertManagerGlobalRoot extends Record<string, unknown> {
    CryptoTickerAlertManager?: CryptoTickerAlertManager;
    CryptoTickerExpressionEvaluator?: ExpressionEvaluatorModule;
}

interface EvaluateAlertParams {
    context: string;
    settings?: CryptoTickerSettings & Record<string, unknown>;
    values?: CryptoTickerTickerData | Record<string, unknown>;
    backgroundColor: string;
    textColor: string;
}

interface EvaluateAlertResult {
    alertMode: boolean;
    backgroundColor: string;
    textColor: string;
}

interface CryptoTickerAlertManager {
    evaluateAlert(params: EvaluateAlertParams): EvaluateAlertResult;
    shouldDisarmOnKeyPress(context: string): boolean;
    disarmAlert(context: string): void;
    armAlert(context: string): void;
    clearContext(context: string): void;
    getAlertStatus(context: string): "on" | "off" | "error";
    isAlertArmed(context: string): boolean;
}

interface ExpressionEvaluatorModule {
    createEvaluator(options?: ExpressionEvaluatorOptions): ExpressionEvaluatorInstance;
    buildBaseContext(values: Record<string, unknown>): Record<string, number>;
}

interface ExpressionEvaluatorOptions {
    allowedVariables?: string[];
}

interface ExpressionEvaluatorInstance {
    evaluate(expression: string, variables: Record<string, unknown>): unknown;
}
