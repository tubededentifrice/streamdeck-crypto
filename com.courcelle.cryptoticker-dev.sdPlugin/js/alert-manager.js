/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";
(function (root, factory) {
    const expressionEvaluatorModule = typeof module === "object" && module.exports
        ? require("./expression-evaluator")
        : root === null || root === void 0 ? void 0 : root.CryptoTickerExpressionEvaluator;
    const dependency = factory(expressionEvaluatorModule);
    if (typeof module === "object" && module.exports) {
        module.exports = dependency;
    }
    if (root && typeof root === "object") {
        root.CryptoTickerAlertManager = dependency;
    }
}(typeof self !== "undefined" ? self : this, function (expressionEvaluator) {
    if (!expressionEvaluator) {
        throw new Error("Expression evaluator dependency is missing");
    }
    const evaluator = expressionEvaluator;
    const alertRuleEvaluator = evaluator.createEvaluator();
    const alertStatuses = {};
    const alertArmedStates = {};
    function getAlertStatus(context) {
        return alertStatuses[context] || "off";
    }
    function isAlertArmed(context) {
        return alertArmedStates[context] !== "off";
    }
    function disarmAlert(context) {
        alertArmedStates[context] = "off";
    }
    function armAlert(context) {
        alertArmedStates[context] = "on";
    }
    function shouldDisarmOnKeyPress(context) {
        return isAlertArmed(context) && getAlertStatus(context) === "on";
    }
    function clearContext(context) {
        delete alertStatuses[context];
        delete alertArmedStates[context];
    }
    function evaluateAlert(params) {
        const context = params.context;
        const settings = params.settings || {};
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
            }
            else {
                alertStatuses[context] = "off";
                armAlert(context);
            }
        }
        catch (err) {
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
