"use strict";

(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.CryptoTickerAlertManager = factory();
    }
}(typeof self !== "undefined" ? self : this, function () {
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
            const value = values.last;
            const change = values.changeDaily;
            const changePercent = values.changeDailyPercent;
            const high = values.high;
            const low = values.low;
            const volume = values.volume;
            const open = values.open;
            const close = values.close;

            if (eval(alertRule)) {
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
            console.error("Error evaluating alertRule", context, settings, values, err);
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
