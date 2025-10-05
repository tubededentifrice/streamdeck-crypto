const alertManager = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/alert-manager");

describe("alert-manager", () => {
    const context = "ctx";

    beforeEach(() => {
        alertManager.clearContext(context);
        alertManager.armAlert(context);
    });

    afterEach(() => {
        alertManager.clearContext(context);
    });

    test("evaluateAlert swaps colors when armed and rule matches", () => {
        const result = alertManager.evaluateAlert({
            context,
            settings: { alertRule: "value > 100" },
            values: { last: 150 },
            backgroundColor: "#000000",
            textColor: "#ffffff"
        });

        expect(result.alertMode).toBe(true);
        expect(result.backgroundColor).toBe("#ffffff");
        expect(result.textColor).toBe("#000000");
        expect(alertManager.getAlertStatus(context)).toBe("on");
    });

    test("shouldDisarmOnKeyPress returns false when alert inactive", () => {
        alertManager.evaluateAlert({
            context,
            settings: { alertRule: "value > 100" },
            values: { last: 50 },
            backgroundColor: "#000",
            textColor: "#fff"
        });

        expect(alertManager.shouldDisarmOnKeyPress(context)).toBe(false);
    });

    test("set status to error when expression is invalid", () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        try {
            const result = alertManager.evaluateAlert({
                context,
                settings: { alertRule: "values.last > 10" },
                values: { last: 200 },
                backgroundColor: "#000",
                textColor: "#fff"
            });

            expect(result.alertMode).toBe(false);
            expect(alertManager.getAlertStatus(context)).toBe("error");
        } finally {
            consoleErrorSpy.mockRestore();
        }
    });

    test("disarmAlert toggles alert state after a trigger", () => {
        alertManager.evaluateAlert({
            context,
            settings: { alertRule: "value > 1" },
            values: { last: 5 },
            backgroundColor: "#111",
            textColor: "#eee"
        });

        expect(alertManager.shouldDisarmOnKeyPress(context)).toBe(true);
        alertManager.disarmAlert(context);
        expect(alertManager.shouldDisarmOnKeyPress(context)).toBe(false);
        expect(alertManager.isAlertArmed(context)).toBe(false);
    });

    test("evaluateAlert arms context for future triggers when rule false", () => {
        alertManager.disarmAlert(context);
        const result = alertManager.evaluateAlert({
            context,
            settings: { alertRule: "value > 999" },
            values: { last: 10 },
            backgroundColor: "#123",
            textColor: "#456"
        });

        expect(result.alertMode).toBe(false);
        expect(alertManager.isAlertArmed(context)).toBe(true);
        expect(alertManager.getAlertStatus(context)).toBe("off");
    });
});
