const alertManager = require("../com.courcelle.cryptoticker-dev.sdPlugin/js/alert-manager");

describe("alert-manager", () => {
    const context = "ctx";

    afterEach(() => {
        alertManager.clearContext(context);
        alertManager.armAlert(context);
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
});
