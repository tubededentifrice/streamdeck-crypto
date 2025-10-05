class MockWebSocket {
    constructor() {
        this.readyState = MockWebSocket.CONNECTING;
        this.sentMessages = [];
        this.closeCalled = false;
        this.onopen = null;
        this.onmessage = null;
        this.onerror = null;
        this.onclose = null;
    }

    send(payload) {
        this.sentMessages.push(payload);
    }

    close(code, reason) {
        this.closeCalled = true;
        this.readyState = MockWebSocket.CLOSED;
        if (typeof this.onclose === "function") {
            this.onclose({ code, reason });
        }
    }

    triggerOpen() {
        this.readyState = MockWebSocket.OPEN;
        if (typeof this.onopen === "function") {
            this.onopen();
        }
    }

    triggerMessage(data) {
        if (typeof this.onmessage === "function") {
            this.onmessage({ data });
        }
    }

    triggerError(error) {
        if (typeof this.onerror === "function") {
            this.onerror(error);
        }
    }

    triggerClose(event) {
        this.readyState = MockWebSocket.CLOSED;
        if (typeof this.onclose === "function") {
            this.onclose(event || {});
        }
    }
}

MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;

module.exports = {
    MockWebSocket
};
