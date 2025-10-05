function createMockCanvas(width = 144, height = 144) {
    const operations = [];
    const context = {
        fillStyle: "#000000",
        strokeStyle: "#000000",
        font: "",
        textAlign: "left",
        textBaseline: "alphabetic",
        lineWidth: 1,
        operations,
        save() {
            operations.push({ type: "save" });
        },
        restore() {
            operations.push({ type: "restore" });
        },
        beginPath() {
            operations.push({ type: "beginPath" });
        },
        closePath() {
            operations.push({ type: "closePath" });
        },
        moveTo(x, y) {
            operations.push({ type: "moveTo", x, y });
        },
        lineTo(x, y) {
            operations.push({ type: "lineTo", x, y });
        },
        quadraticCurveTo(cpx, cpy, x, y) {
            operations.push({
                type: "quadraticCurveTo",
                cpx,
                cpy,
                x,
                y
            });
        },
        arc(x, y, radius, startAngle, endAngle) {
            operations.push({
                type: "arc",
                x,
                y,
                radius,
                startAngle,
                endAngle
            });
        },
        translate(x, y) {
            operations.push({ type: "translate", x, y });
        },
        rotate(radians) {
            operations.push({ type: "rotate", radians });
        },
        clearRect(x, y, widthArg, heightArg) {
            operations.push({ type: "clearRect", x, y, width: widthArg, height: heightArg });
        },
        fillRect(x, y, widthArg, heightArg) {
            operations.push({
                type: "fillRect",
                x,
                y,
                width: widthArg,
                height: heightArg,
                fillStyle: this.fillStyle
            });
        },
        rect(x, y, widthArg, heightArg) {
            operations.push({
                type: "rect",
                x,
                y,
                width: widthArg,
                height: heightArg
            });
        },
        fill() {
            operations.push({ type: "fill", fillStyle: this.fillStyle });
        },
        stroke() {
            operations.push({ type: "stroke", strokeStyle: this.strokeStyle, lineWidth: this.lineWidth });
        },
        fillText(text, x, y) {
            operations.push({
                type: "fillText",
                text,
                x,
                y,
                font: this.font,
                fillStyle: this.fillStyle,
                textAlign: this.textAlign
            });
        },
        measureText(text) {
            return { width: text.length * 10 };
        }
    };

    const canvas = {
        width,
        height
    };

    return { canvas, context, operations };
}

module.exports = {
    createMockCanvas
};
