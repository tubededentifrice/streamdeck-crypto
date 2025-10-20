"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // com.courcelle.cryptoticker-dev.sdPlugin/js/signalr_v8.0.0.min.js
  var require_signalr_v8_0_0_min = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/signalr_v8.0.0.min.js"(exports, module) {
      "use strict";
      var t;
      var e;
      t = self, e = () => (() => {
        var t2 = { d: (e3, s2) => {
          for (var i2 in s2) t2.o(s2, i2) && !t2.o(e3, i2) && Object.defineProperty(e3, i2, { enumerable: true, get: s2[i2] });
        } };
        t2.g = function() {
          if ("object" == typeof globalThis) return globalThis;
          try {
            return this || new Function("return this")();
          } catch (t3) {
            if ("object" == typeof window) return window;
          }
        }(), t2.o = (t3, e3) => Object.prototype.hasOwnProperty.call(t3, e3), t2.r = (t3) => {
          "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t3, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(t3, "t", { value: true });
        };
        var e2, s = {};
        t2.r(s), t2.d(s, { AbortError: () => r, DefaultHttpClient: () => H, HttpClient: () => d, HttpError: () => i, HttpResponse: () => u, HttpTransportType: () => F, HubConnection: () => q, HubConnectionBuilder: () => tt, HubConnectionState: () => A, JsonHubProtocol: () => Y, LogLevel: () => e2, MessageType: () => x, NullLogger: () => f, Subject: () => U, TimeoutError: () => n, TransferFormat: () => B, VERSION: () => p });
        class i extends Error {
          constructor(t3, e3) {
            const s2 = new.target.prototype;
            super(`${t3}: Status code '${e3}'`), this.statusCode = e3, this.__proto__ = s2;
          }
        }
        class n extends Error {
          constructor(t3 = "A timeout occurred.") {
            const e3 = new.target.prototype;
            super(t3), this.__proto__ = e3;
          }
        }
        class r extends Error {
          constructor(t3 = "An abort occurred.") {
            const e3 = new.target.prototype;
            super(t3), this.__proto__ = e3;
          }
        }
        class o extends Error {
          constructor(t3, e3) {
            const s2 = new.target.prototype;
            super(t3), this.transport = e3, this.errorType = "UnsupportedTransportError", this.__proto__ = s2;
          }
        }
        class h extends Error {
          constructor(t3, e3) {
            const s2 = new.target.prototype;
            super(t3), this.transport = e3, this.errorType = "DisabledTransportError", this.__proto__ = s2;
          }
        }
        class c extends Error {
          constructor(t3, e3) {
            const s2 = new.target.prototype;
            super(t3), this.transport = e3, this.errorType = "FailedToStartTransportError", this.__proto__ = s2;
          }
        }
        class a extends Error {
          constructor(t3) {
            const e3 = new.target.prototype;
            super(t3), this.errorType = "FailedToNegotiateWithServerError", this.__proto__ = e3;
          }
        }
        class l extends Error {
          constructor(t3, e3) {
            const s2 = new.target.prototype;
            super(t3), this.innerErrors = e3, this.__proto__ = s2;
          }
        }
        class u {
          constructor(t3, e3, s2) {
            this.statusCode = t3, this.statusText = e3, this.content = s2;
          }
        }
        class d {
          get(t3, e3) {
            return this.send({ ...e3, method: "GET", url: t3 });
          }
          post(t3, e3) {
            return this.send({ ...e3, method: "POST", url: t3 });
          }
          delete(t3, e3) {
            return this.send({ ...e3, method: "DELETE", url: t3 });
          }
          getCookieString(t3) {
            return "";
          }
        }
        !function(t3) {
          t3[t3.Trace = 0] = "Trace", t3[t3.Debug = 1] = "Debug", t3[t3.Information = 2] = "Information", t3[t3.Warning = 3] = "Warning", t3[t3.Error = 4] = "Error", t3[t3.Critical = 5] = "Critical", t3[t3.None = 6] = "None";
        }(e2 || (e2 = {}));
        class f {
          constructor() {
          }
          log(t3, e3) {
          }
        }
        f.instance = new f();
        const p = "8.0.0";
        class w {
          static isRequired(t3, e3) {
            if (null == t3) throw new Error(`The '${e3}' argument is required.`);
          }
          static isNotEmpty(t3, e3) {
            if (!t3 || t3.match(/^\s*$/)) throw new Error(`The '${e3}' argument should not be empty.`);
          }
          static isIn(t3, e3, s2) {
            if (!(t3 in e3)) throw new Error(`Unknown ${s2} value: ${t3}.`);
          }
        }
        class g {
          static get isBrowser() {
            return !g.isNode && "object" == typeof window && "object" == typeof window.document;
          }
          static get isWebWorker() {
            return !g.isNode && "object" == typeof self && "importScripts" in self;
          }
          static get isReactNative() {
            return !g.isNode && "object" == typeof window && void 0 === window.document;
          }
          static get isNode() {
            return "undefined" != typeof process && process.release && "node" === process.release.name;
          }
        }
        function m(t3, e3) {
          let s2 = "";
          return y(t3) ? (s2 = `Binary data of length ${t3.byteLength}`, e3 && (s2 += `. Content: '${function(t4) {
            const e4 = new Uint8Array(t4);
            let s3 = "";
            return e4.forEach((t5) => {
              s3 += `0x${t5 < 16 ? "0" : ""}${t5.toString(16)} `;
            }), s3.substr(0, s3.length - 1);
          }(t3)}'`)) : "string" == typeof t3 && (s2 = `String data of length ${t3.length}`, e3 && (s2 += `. Content: '${t3}'`)), s2;
        }
        function y(t3) {
          return t3 && "undefined" != typeof ArrayBuffer && (t3 instanceof ArrayBuffer || t3.constructor && "ArrayBuffer" === t3.constructor.name);
        }
        async function b(t3, s2, i2, n2, r2, o2) {
          const h2 = {}, [c2, a2] = $();
          h2[c2] = a2, t3.log(e2.Trace, `(${s2} transport) sending data. ${m(r2, o2.logMessageContent)}.`);
          const l2 = y(r2) ? "arraybuffer" : "text", u2 = await i2.post(n2, { content: r2, headers: { ...h2, ...o2.headers }, responseType: l2, timeout: o2.timeout, withCredentials: o2.withCredentials });
          t3.log(e2.Trace, `(${s2} transport) request complete. Response status: ${u2.statusCode}.`);
        }
        class v {
          constructor(t3, e3) {
            this.i = t3, this.h = e3;
          }
          dispose() {
            const t3 = this.i.observers.indexOf(this.h);
            t3 > -1 && this.i.observers.splice(t3, 1), 0 === this.i.observers.length && this.i.cancelCallback && this.i.cancelCallback().catch((t4) => {
            });
          }
        }
        class E {
          constructor(t3) {
            this.l = t3, this.out = console;
          }
          log(t3, s2) {
            if (t3 >= this.l) {
              const i2 = `[${(/* @__PURE__ */ new Date()).toISOString()}] ${e2[t3]}: ${s2}`;
              switch (t3) {
                case e2.Critical:
                case e2.Error:
                  this.out.error(i2);
                  break;
                case e2.Warning:
                  this.out.warn(i2);
                  break;
                case e2.Information:
                  this.out.info(i2);
                  break;
                default:
                  this.out.log(i2);
              }
            }
          }
        }
        function $() {
          let t3 = "X-SignalR-User-Agent";
          return g.isNode && (t3 = "User-Agent"), [t3, C(p, S(), g.isNode ? "NodeJS" : "Browser", k())];
        }
        function C(t3, e3, s2, i2) {
          let n2 = "Microsoft SignalR/";
          const r2 = t3.split(".");
          return n2 += `${r2[0]}.${r2[1]}`, n2 += ` (${t3}; `, n2 += e3 && "" !== e3 ? `${e3}; ` : "Unknown OS; ", n2 += `${s2}`, n2 += i2 ? `; ${i2}` : "; Unknown Runtime Version", n2 += ")", n2;
        }
        function S() {
          if (!g.isNode) return "";
          switch (process.platform) {
            case "win32":
              return "Windows NT";
            case "darwin":
              return "macOS";
            case "linux":
              return "Linux";
            default:
              return process.platform;
          }
        }
        function k() {
          if (g.isNode) return process.versions.node;
        }
        function P(t3) {
          return t3.stack ? t3.stack : t3.message ? t3.message : `${t3}`;
        }
        class T extends d {
          constructor(e3) {
            super(), this.u = e3, this.p = fetch.bind(function() {
              if ("undefined" != typeof globalThis) return globalThis;
              if ("undefined" != typeof self) return self;
              if ("undefined" != typeof window) return window;
              if (void 0 !== t2.g) return t2.g;
              throw new Error("could not find global");
            }()), this.m = AbortController, this.m;
          }
          async send(t3) {
            if (t3.abortSignal && t3.abortSignal.aborted) throw new r();
            if (!t3.method) throw new Error("No method defined.");
            if (!t3.url) throw new Error("No url defined.");
            const s2 = new this.m();
            let o2;
            t3.abortSignal && (t3.abortSignal.onabort = () => {
              s2.abort(), o2 = new r();
            });
            let h2, c2 = null;
            if (t3.timeout) {
              const i2 = t3.timeout;
              c2 = setTimeout(() => {
                s2.abort(), this.u.log(e2.Warning, "Timeout from HTTP request."), o2 = new n();
              }, i2);
            }
            "" === t3.content && (t3.content = void 0), t3.content && (t3.headers = t3.headers || {}, y(t3.content) ? t3.headers["Content-Type"] = "application/octet-stream" : t3.headers["Content-Type"] = "text/plain;charset=UTF-8");
            try {
              h2 = await this.p(t3.url, { body: t3.content, cache: "no-cache", credentials: true === t3.withCredentials ? "include" : "same-origin", headers: { "X-Requested-With": "XMLHttpRequest", ...t3.headers }, method: t3.method, mode: "cors", redirect: "follow", signal: s2.signal });
            } catch (t4) {
              if (o2) throw o2;
              throw this.u.log(e2.Warning, `Error from HTTP request. ${t4}.`), t4;
            } finally {
              c2 && clearTimeout(c2), t3.abortSignal && (t3.abortSignal.onabort = null);
            }
            if (!h2.ok) {
              const t4 = await I(h2, "text");
              throw new i(t4 || h2.statusText, h2.status);
            }
            const a2 = I(h2, t3.responseType), l2 = await a2;
            return new u(h2.status, h2.statusText, l2);
          }
          getCookieString(t3) {
            let e3 = "";
            return g.isNode && this.v && this.v.getCookies(t3, (t4, s2) => e3 = s2.join("; ")), e3;
          }
        }
        function I(t3, e3) {
          let s2;
          switch (e3) {
            case "arraybuffer":
              s2 = t3.arrayBuffer();
              break;
            case "text":
            default:
              s2 = t3.text();
              break;
            case "blob":
            case "document":
            case "json":
              throw new Error(`${e3} is not supported.`);
          }
          return s2;
        }
        class _ extends d {
          constructor(t3) {
            super(), this.u = t3;
          }
          send(t3) {
            return t3.abortSignal && t3.abortSignal.aborted ? Promise.reject(new r()) : t3.method ? t3.url ? new Promise((s2, o2) => {
              const h2 = new XMLHttpRequest();
              h2.open(t3.method, t3.url, true), h2.withCredentials = void 0 === t3.withCredentials || t3.withCredentials, h2.setRequestHeader("X-Requested-With", "XMLHttpRequest"), "" === t3.content && (t3.content = void 0), t3.content && (y(t3.content) ? h2.setRequestHeader("Content-Type", "application/octet-stream") : h2.setRequestHeader("Content-Type", "text/plain;charset=UTF-8"));
              const c2 = t3.headers;
              c2 && Object.keys(c2).forEach((t4) => {
                h2.setRequestHeader(t4, c2[t4]);
              }), t3.responseType && (h2.responseType = t3.responseType), t3.abortSignal && (t3.abortSignal.onabort = () => {
                h2.abort(), o2(new r());
              }), t3.timeout && (h2.timeout = t3.timeout), h2.onload = () => {
                t3.abortSignal && (t3.abortSignal.onabort = null), h2.status >= 200 && h2.status < 300 ? s2(new u(h2.status, h2.statusText, h2.response || h2.responseText)) : o2(new i(h2.response || h2.responseText || h2.statusText, h2.status));
              }, h2.onerror = () => {
                this.u.log(e2.Warning, `Error from HTTP request. ${h2.status}: ${h2.statusText}.`), o2(new i(h2.statusText, h2.status));
              }, h2.ontimeout = () => {
                this.u.log(e2.Warning, "Timeout from HTTP request."), o2(new n());
              }, h2.send(t3.content);
            }) : Promise.reject(new Error("No url defined.")) : Promise.reject(new Error("No method defined."));
          }
        }
        class H extends d {
          constructor(t3) {
            if (super(), "undefined" != typeof fetch || g.isNode) this.$ = new T(t3);
            else {
              if ("undefined" == typeof XMLHttpRequest) throw new Error("No usable HttpClient found.");
              this.$ = new _(t3);
            }
          }
          send(t3) {
            return t3.abortSignal && t3.abortSignal.aborted ? Promise.reject(new r()) : t3.method ? t3.url ? this.$.send(t3) : Promise.reject(new Error("No url defined.")) : Promise.reject(new Error("No method defined."));
          }
          getCookieString(t3) {
            return this.$.getCookieString(t3);
          }
        }
        class D {
          static write(t3) {
            return `${t3}${D.RecordSeparator}`;
          }
          static parse(t3) {
            if (t3[t3.length - 1] !== D.RecordSeparator) throw new Error("Message is incomplete.");
            const e3 = t3.split(D.RecordSeparator);
            return e3.pop(), e3;
          }
        }
        D.RecordSeparatorCode = 30, D.RecordSeparator = String.fromCharCode(D.RecordSeparatorCode);
        class R {
          writeHandshakeRequest(t3) {
            return D.write(JSON.stringify(t3));
          }
          parseHandshakeResponse(t3) {
            let e3, s2;
            if (y(t3)) {
              const i3 = new Uint8Array(t3), n3 = i3.indexOf(D.RecordSeparatorCode);
              if (-1 === n3) throw new Error("Message is incomplete.");
              const r2 = n3 + 1;
              e3 = String.fromCharCode.apply(null, Array.prototype.slice.call(i3.slice(0, r2))), s2 = i3.byteLength > r2 ? i3.slice(r2).buffer : null;
            } else {
              const i3 = t3, n3 = i3.indexOf(D.RecordSeparator);
              if (-1 === n3) throw new Error("Message is incomplete.");
              const r2 = n3 + 1;
              e3 = i3.substring(0, r2), s2 = i3.length > r2 ? i3.substring(r2) : null;
            }
            const i2 = D.parse(e3), n2 = JSON.parse(i2[0]);
            if (n2.type) throw new Error("Expected a handshake response from the server.");
            return [s2, n2];
          }
        }
        var x, A;
        !function(t3) {
          t3[t3.Invocation = 1] = "Invocation", t3[t3.StreamItem = 2] = "StreamItem", t3[t3.Completion = 3] = "Completion", t3[t3.StreamInvocation = 4] = "StreamInvocation", t3[t3.CancelInvocation = 5] = "CancelInvocation", t3[t3.Ping = 6] = "Ping", t3[t3.Close = 7] = "Close", t3[t3.Ack = 8] = "Ack", t3[t3.Sequence = 9] = "Sequence";
        }(x || (x = {}));
        class U {
          constructor() {
            this.observers = [];
          }
          next(t3) {
            for (const e3 of this.observers) e3.next(t3);
          }
          error(t3) {
            for (const e3 of this.observers) e3.error && e3.error(t3);
          }
          complete() {
            for (const t3 of this.observers) t3.complete && t3.complete();
          }
          subscribe(t3) {
            return this.observers.push(t3), new v(this, t3);
          }
        }
        class L {
          constructor(t3, e3, s2) {
            this.C = 1e5, this.S = [], this.k = 0, this.P = false, this.T = 1, this.I = 0, this._ = 0, this.H = false, this.D = t3, this.R = e3, this.C = s2;
          }
          async A(t3) {
            const e3 = this.D.writeMessage(t3);
            let s2 = Promise.resolve();
            if (this.U(t3)) {
              this.k++;
              let t4 = () => {
              }, i2 = () => {
              };
              y(e3) ? this._ += e3.byteLength : this._ += e3.length, this._ >= this.C && (s2 = new Promise((e4, s3) => {
                t4 = e4, i2 = s3;
              })), this.S.push(new N(e3, this.k, t4, i2));
            }
            try {
              this.H || await this.R.send(e3);
            } catch {
              this.L();
            }
            await s2;
          }
          N(t3) {
            let e3 = -1;
            for (let s2 = 0; s2 < this.S.length; s2++) {
              const i2 = this.S[s2];
              if (i2.q <= t3.sequenceId) e3 = s2, y(i2.M) ? this._ -= i2.M.byteLength : this._ -= i2.M.length, i2.j();
              else {
                if (!(this._ < this.C)) break;
                i2.j();
              }
            }
            -1 !== e3 && (this.S = this.S.slice(e3 + 1));
          }
          W(t3) {
            if (this.P) return t3.type === x.Sequence && (this.P = false, true);
            if (!this.U(t3)) return true;
            const e3 = this.T;
            return this.T++, e3 <= this.I ? (e3 === this.I && this.O(), false) : (this.I = e3, this.O(), true);
          }
          F(t3) {
            t3.sequenceId > this.T ? this.R.stop(new Error("Sequence ID greater than amount of messages we've received.")) : this.T = t3.sequenceId;
          }
          L() {
            this.H = true, this.P = true;
          }
          async B() {
            const t3 = 0 !== this.S.length ? this.S[0].q : this.k + 1;
            await this.R.send(this.D.writeMessage({ type: x.Sequence, sequenceId: t3 }));
            const e3 = this.S;
            for (const t4 of e3) await this.R.send(t4.M);
            this.H = false;
          }
          X(t3) {
            null != t3 || (t3 = new Error("Unable to reconnect to server."));
            for (const e3 of this.S) e3.J(t3);
          }
          U(t3) {
            switch (t3.type) {
              case x.Invocation:
              case x.StreamItem:
              case x.Completion:
              case x.StreamInvocation:
              case x.CancelInvocation:
                return true;
              case x.Close:
              case x.Sequence:
              case x.Ping:
              case x.Ack:
                return false;
            }
          }
          O() {
            void 0 === this.V && (this.V = setTimeout(async () => {
              try {
                this.H || await this.R.send(this.D.writeMessage({ type: x.Ack, sequenceId: this.I }));
              } catch {
              }
              clearTimeout(this.V), this.V = void 0;
            }, 1e3));
          }
        }
        class N {
          constructor(t3, e3, s2, i2) {
            this.M = t3, this.q = e3, this.j = s2, this.J = i2;
          }
        }
        !function(t3) {
          t3.Disconnected = "Disconnected", t3.Connecting = "Connecting", t3.Connected = "Connected", t3.Disconnecting = "Disconnecting", t3.Reconnecting = "Reconnecting";
        }(A || (A = {}));
        class q {
          static create(t3, e3, s2, i2, n2, r2, o2) {
            return new q(t3, e3, s2, i2, n2, r2, o2);
          }
          constructor(t3, s2, i2, n2, r2, o2, h2) {
            this.K = 0, this.G = () => {
              this.u.log(e2.Warning, "The page is being frozen, this will likely lead to the connection being closed and messages being lost. For more information see the docs at https://learn.microsoft.com/aspnet/core/signalr/javascript-client#bsleep");
            }, w.isRequired(t3, "connection"), w.isRequired(s2, "logger"), w.isRequired(i2, "protocol"), this.serverTimeoutInMilliseconds = null != r2 ? r2 : 3e4, this.keepAliveIntervalInMilliseconds = null != o2 ? o2 : 15e3, this.Y = null != h2 ? h2 : 1e5, this.u = s2, this.D = i2, this.connection = t3, this.Z = n2, this.tt = new R(), this.connection.onreceive = (t4) => this.et(t4), this.connection.onclose = (t4) => this.st(t4), this.it = {}, this.nt = {}, this.rt = [], this.ot = [], this.ht = [], this.ct = 0, this.lt = false, this.ut = A.Disconnected, this.dt = false, this.ft = this.D.writeMessage({ type: x.Ping });
          }
          get state() {
            return this.ut;
          }
          get connectionId() {
            return this.connection && this.connection.connectionId || null;
          }
          get baseUrl() {
            return this.connection.baseUrl || "";
          }
          set baseUrl(t3) {
            if (this.ut !== A.Disconnected && this.ut !== A.Reconnecting) throw new Error("The HubConnection must be in the Disconnected or Reconnecting state to change the url.");
            if (!t3) throw new Error("The HubConnection url must be a valid url.");
            this.connection.baseUrl = t3;
          }
          start() {
            return this.wt = this.gt(), this.wt;
          }
          async gt() {
            if (this.ut !== A.Disconnected) return Promise.reject(new Error("Cannot start a HubConnection that is not in the 'Disconnected' state."));
            this.ut = A.Connecting, this.u.log(e2.Debug, "Starting HubConnection.");
            try {
              await this.yt(), g.isBrowser && window.document.addEventListener("freeze", this.G), this.ut = A.Connected, this.dt = true, this.u.log(e2.Debug, "HubConnection connected successfully.");
            } catch (t3) {
              return this.ut = A.Disconnected, this.u.log(e2.Debug, `HubConnection failed to start successfully because of error '${t3}'.`), Promise.reject(t3);
            }
          }
          async yt() {
            this.bt = void 0, this.lt = false;
            const t3 = new Promise((t4, e3) => {
              this.vt = t4, this.Et = e3;
            });
            await this.connection.start(this.D.transferFormat);
            try {
              let s2 = this.D.version;
              this.connection.features.reconnect || (s2 = 1);
              const i2 = { protocol: this.D.name, version: s2 };
              if (this.u.log(e2.Debug, "Sending handshake request."), await this.$t(this.tt.writeHandshakeRequest(i2)), this.u.log(e2.Information, `Using HubProtocol '${this.D.name}'.`), this.Ct(), this.St(), this.kt(), await t3, this.bt) throw this.bt;
              !!this.connection.features.reconnect && (this.Pt = new L(this.D, this.connection, this.Y), this.connection.features.disconnected = this.Pt.L.bind(this.Pt), this.connection.features.resend = () => {
                if (this.Pt) return this.Pt.B();
              }), this.connection.features.inherentKeepAlive || await this.$t(this.ft);
            } catch (t4) {
              throw this.u.log(e2.Debug, `Hub handshake failed with error '${t4}' during start(). Stopping HubConnection.`), this.Ct(), this.Tt(), await this.connection.stop(t4), t4;
            }
          }
          async stop() {
            const t3 = this.wt;
            this.connection.features.reconnect = false, this.It = this._t(), await this.It;
            try {
              await t3;
            } catch (t4) {
            }
          }
          _t(t3) {
            if (this.ut === A.Disconnected) return this.u.log(e2.Debug, `Call to HubConnection.stop(${t3}) ignored because it is already in the disconnected state.`), Promise.resolve();
            if (this.ut === A.Disconnecting) return this.u.log(e2.Debug, `Call to HttpConnection.stop(${t3}) ignored because the connection is already in the disconnecting state.`), this.It;
            const s2 = this.ut;
            return this.ut = A.Disconnecting, this.u.log(e2.Debug, "Stopping HubConnection."), this.Ht ? (this.u.log(e2.Debug, "Connection stopped during reconnect delay. Done reconnecting."), clearTimeout(this.Ht), this.Ht = void 0, this.Dt(), Promise.resolve()) : (s2 === A.Connected && this.Rt(), this.Ct(), this.Tt(), this.bt = t3 || new r("The connection was stopped before the hub handshake could complete."), this.connection.stop(t3));
          }
          async Rt() {
            try {
              await this.xt(this.At());
            } catch {
            }
          }
          stream(t3, ...e3) {
            const [s2, i2] = this.Ut(e3), n2 = this.Lt(t3, e3, i2);
            let r2;
            const o2 = new U();
            return o2.cancelCallback = () => {
              const t4 = this.Nt(n2.invocationId);
              return delete this.it[n2.invocationId], r2.then(() => this.xt(t4));
            }, this.it[n2.invocationId] = (t4, e4) => {
              e4 ? o2.error(e4) : t4 && (t4.type === x.Completion ? t4.error ? o2.error(new Error(t4.error)) : o2.complete() : o2.next(t4.item));
            }, r2 = this.xt(n2).catch((t4) => {
              o2.error(t4), delete this.it[n2.invocationId];
            }), this.qt(s2, r2), o2;
          }
          $t(t3) {
            return this.kt(), this.connection.send(t3);
          }
          xt(t3) {
            return this.Pt ? this.Pt.A(t3) : this.$t(this.D.writeMessage(t3));
          }
          send(t3, ...e3) {
            const [s2, i2] = this.Ut(e3), n2 = this.xt(this.Mt(t3, e3, true, i2));
            return this.qt(s2, n2), n2;
          }
          invoke(t3, ...e3) {
            const [s2, i2] = this.Ut(e3), n2 = this.Mt(t3, e3, false, i2);
            return new Promise((t4, e4) => {
              this.it[n2.invocationId] = (s3, i4) => {
                i4 ? e4(i4) : s3 && (s3.type === x.Completion ? s3.error ? e4(new Error(s3.error)) : t4(s3.result) : e4(new Error(`Unexpected message type: ${s3.type}`)));
              };
              const i3 = this.xt(n2).catch((t5) => {
                e4(t5), delete this.it[n2.invocationId];
              });
              this.qt(s2, i3);
            });
          }
          on(t3, e3) {
            t3 && e3 && (t3 = t3.toLowerCase(), this.nt[t3] || (this.nt[t3] = []), -1 === this.nt[t3].indexOf(e3) && this.nt[t3].push(e3));
          }
          off(t3, e3) {
            if (!t3) return;
            t3 = t3.toLowerCase();
            const s2 = this.nt[t3];
            if (s2) if (e3) {
              const i2 = s2.indexOf(e3);
              -1 !== i2 && (s2.splice(i2, 1), 0 === s2.length && delete this.nt[t3]);
            } else delete this.nt[t3];
          }
          onclose(t3) {
            t3 && this.rt.push(t3);
          }
          onreconnecting(t3) {
            t3 && this.ot.push(t3);
          }
          onreconnected(t3) {
            t3 && this.ht.push(t3);
          }
          et(t3) {
            if (this.Ct(), this.lt || (t3 = this.jt(t3), this.lt = true), t3) {
              const s2 = this.D.parseMessages(t3, this.u);
              for (const t4 of s2) if (!this.Pt || this.Pt.W(t4)) switch (t4.type) {
                case x.Invocation:
                  this.Wt(t4);
                  break;
                case x.StreamItem:
                case x.Completion: {
                  const s3 = this.it[t4.invocationId];
                  if (s3) {
                    t4.type === x.Completion && delete this.it[t4.invocationId];
                    try {
                      s3(t4);
                    } catch (t5) {
                      this.u.log(e2.Error, `Stream callback threw error: ${P(t5)}`);
                    }
                  }
                  break;
                }
                case x.Ping:
                  break;
                case x.Close: {
                  this.u.log(e2.Information, "Close message received from server.");
                  const s3 = t4.error ? new Error("Server returned an error on close: " + t4.error) : void 0;
                  true === t4.allowReconnect ? this.connection.stop(s3) : this.It = this._t(s3);
                  break;
                }
                case x.Ack:
                  this.Pt && this.Pt.N(t4);
                  break;
                case x.Sequence:
                  this.Pt && this.Pt.F(t4);
                  break;
                default:
                  this.u.log(e2.Warning, `Invalid message type: ${t4.type}.`);
              }
            }
            this.St();
          }
          jt(t3) {
            let s2, i2;
            try {
              [i2, s2] = this.tt.parseHandshakeResponse(t3);
            } catch (t4) {
              const s3 = "Error parsing handshake response: " + t4;
              this.u.log(e2.Error, s3);
              const i3 = new Error(s3);
              throw this.Et(i3), i3;
            }
            if (s2.error) {
              const t4 = "Server returned handshake error: " + s2.error;
              this.u.log(e2.Error, t4);
              const i3 = new Error(t4);
              throw this.Et(i3), i3;
            }
            return this.u.log(e2.Debug, "Server handshake complete."), this.vt(), i2;
          }
          kt() {
            this.connection.features.inherentKeepAlive || (this.K = (/* @__PURE__ */ new Date()).getTime() + this.keepAliveIntervalInMilliseconds, this.Tt());
          }
          St() {
            if (!(this.connection.features && this.connection.features.inherentKeepAlive || (this.Ot = setTimeout(() => this.serverTimeout(), this.serverTimeoutInMilliseconds), void 0 !== this.Ft))) {
              let t3 = this.K - (/* @__PURE__ */ new Date()).getTime();
              t3 < 0 && (t3 = 0), this.Ft = setTimeout(async () => {
                if (this.ut === A.Connected) try {
                  await this.$t(this.ft);
                } catch {
                  this.Tt();
                }
              }, t3);
            }
          }
          serverTimeout() {
            this.connection.stop(new Error("Server timeout elapsed without receiving a message from the server."));
          }
          async Wt(t3) {
            const s2 = t3.target.toLowerCase(), i2 = this.nt[s2];
            if (!i2) return this.u.log(e2.Warning, `No client method with the name '${s2}' found.`), void (t3.invocationId && (this.u.log(e2.Warning, `No result given for '${s2}' method and invocation ID '${t3.invocationId}'.`), await this.xt(this.Bt(t3.invocationId, "Client didn't provide a result.", null))));
            const n2 = i2.slice(), r2 = !!t3.invocationId;
            let o2, h2, c2;
            for (const i3 of n2) try {
              const n3 = o2;
              o2 = await i3.apply(this, t3.arguments), r2 && o2 && n3 && (this.u.log(e2.Error, `Multiple results provided for '${s2}'. Sending error to server.`), c2 = this.Bt(t3.invocationId, "Client provided multiple results.", null)), h2 = void 0;
            } catch (t4) {
              h2 = t4, this.u.log(e2.Error, `A callback for the method '${s2}' threw error '${t4}'.`);
            }
            c2 ? await this.xt(c2) : r2 ? (h2 ? c2 = this.Bt(t3.invocationId, `${h2}`, null) : void 0 !== o2 ? c2 = this.Bt(t3.invocationId, null, o2) : (this.u.log(e2.Warning, `No result given for '${s2}' method and invocation ID '${t3.invocationId}'.`), c2 = this.Bt(t3.invocationId, "Client didn't provide a result.", null)), await this.xt(c2)) : o2 && this.u.log(e2.Error, `Result given for '${s2}' method but server is not expecting a result.`);
          }
          st(t3) {
            this.u.log(e2.Debug, `HubConnection.connectionClosed(${t3}) called while in state ${this.ut}.`), this.bt = this.bt || t3 || new r("The underlying connection was closed before the hub handshake could complete."), this.vt && this.vt(), this.Xt(t3 || new Error("Invocation canceled due to the underlying connection being closed.")), this.Ct(), this.Tt(), this.ut === A.Disconnecting ? this.Dt(t3) : this.ut === A.Connected && this.Z ? this.Jt(t3) : this.ut === A.Connected && this.Dt(t3);
          }
          Dt(t3) {
            if (this.dt) {
              this.ut = A.Disconnected, this.dt = false, this.Pt && (this.Pt.X(null != t3 ? t3 : new Error("Connection closed.")), this.Pt = void 0), g.isBrowser && window.document.removeEventListener("freeze", this.G);
              try {
                this.rt.forEach((e3) => e3.apply(this, [t3]));
              } catch (s2) {
                this.u.log(e2.Error, `An onclose callback called with error '${t3}' threw error '${s2}'.`);
              }
            }
          }
          async Jt(t3) {
            const s2 = Date.now();
            let i2 = 0, n2 = void 0 !== t3 ? t3 : new Error("Attempting to reconnect due to a unknown error."), r2 = this.zt(i2++, 0, n2);
            if (null === r2) return this.u.log(e2.Debug, "Connection not reconnecting because the IRetryPolicy returned null on the first reconnect attempt."), void this.Dt(t3);
            if (this.ut = A.Reconnecting, t3 ? this.u.log(e2.Information, `Connection reconnecting because of error '${t3}'.`) : this.u.log(e2.Information, "Connection reconnecting."), 0 !== this.ot.length) {
              try {
                this.ot.forEach((e3) => e3.apply(this, [t3]));
              } catch (s3) {
                this.u.log(e2.Error, `An onreconnecting callback called with error '${t3}' threw error '${s3}'.`);
              }
              if (this.ut !== A.Reconnecting) return void this.u.log(e2.Debug, "Connection left the reconnecting state in onreconnecting callback. Done reconnecting.");
            }
            for (; null !== r2; ) {
              if (this.u.log(e2.Information, `Reconnect attempt number ${i2} will start in ${r2} ms.`), await new Promise((t4) => {
                this.Ht = setTimeout(t4, r2);
              }), this.Ht = void 0, this.ut !== A.Reconnecting) return void this.u.log(e2.Debug, "Connection left the reconnecting state during reconnect delay. Done reconnecting.");
              try {
                if (await this.yt(), this.ut = A.Connected, this.u.log(e2.Information, "HubConnection reconnected successfully."), 0 !== this.ht.length) try {
                  this.ht.forEach((t4) => t4.apply(this, [this.connection.connectionId]));
                } catch (t4) {
                  this.u.log(e2.Error, `An onreconnected callback called with connectionId '${this.connection.connectionId}; threw error '${t4}'.`);
                }
                return;
              } catch (t4) {
                if (this.u.log(e2.Information, `Reconnect attempt failed because of error '${t4}'.`), this.ut !== A.Reconnecting) return this.u.log(e2.Debug, `Connection moved to the '${this.ut}' from the reconnecting state during reconnect attempt. Done reconnecting.`), void (this.ut === A.Disconnecting && this.Dt());
                n2 = t4 instanceof Error ? t4 : new Error(t4.toString()), r2 = this.zt(i2++, Date.now() - s2, n2);
              }
            }
            this.u.log(e2.Information, `Reconnect retries have been exhausted after ${Date.now() - s2} ms and ${i2} failed attempts. Connection disconnecting.`), this.Dt();
          }
          zt(t3, s2, i2) {
            try {
              return this.Z.nextRetryDelayInMilliseconds({ elapsedMilliseconds: s2, previousRetryCount: t3, retryReason: i2 });
            } catch (i3) {
              return this.u.log(e2.Error, `IRetryPolicy.nextRetryDelayInMilliseconds(${t3}, ${s2}) threw error '${i3}'.`), null;
            }
          }
          Xt(t3) {
            const s2 = this.it;
            this.it = {}, Object.keys(s2).forEach((i2) => {
              const n2 = s2[i2];
              try {
                n2(null, t3);
              } catch (s3) {
                this.u.log(e2.Error, `Stream 'error' callback called with '${t3}' threw error: ${P(s3)}`);
              }
            });
          }
          Tt() {
            this.Ft && (clearTimeout(this.Ft), this.Ft = void 0);
          }
          Ct() {
            this.Ot && clearTimeout(this.Ot);
          }
          Mt(t3, e3, s2, i2) {
            if (s2) return 0 !== i2.length ? { arguments: e3, streamIds: i2, target: t3, type: x.Invocation } : { arguments: e3, target: t3, type: x.Invocation };
            {
              const s3 = this.ct;
              return this.ct++, 0 !== i2.length ? { arguments: e3, invocationId: s3.toString(), streamIds: i2, target: t3, type: x.Invocation } : { arguments: e3, invocationId: s3.toString(), target: t3, type: x.Invocation };
            }
          }
          qt(t3, e3) {
            if (0 !== t3.length) {
              e3 || (e3 = Promise.resolve());
              for (const s2 in t3) t3[s2].subscribe({ complete: () => {
                e3 = e3.then(() => this.xt(this.Bt(s2)));
              }, error: (t4) => {
                let i2;
                i2 = t4 instanceof Error ? t4.message : t4 && t4.toString ? t4.toString() : "Unknown error", e3 = e3.then(() => this.xt(this.Bt(s2, i2)));
              }, next: (t4) => {
                e3 = e3.then(() => this.xt(this.Vt(s2, t4)));
              } });
            }
          }
          Ut(t3) {
            const e3 = [], s2 = [];
            for (let i2 = 0; i2 < t3.length; i2++) {
              const n2 = t3[i2];
              if (this.Kt(n2)) {
                const r2 = this.ct;
                this.ct++, e3[r2] = n2, s2.push(r2.toString()), t3.splice(i2, 1);
              }
            }
            return [e3, s2];
          }
          Kt(t3) {
            return t3 && t3.subscribe && "function" == typeof t3.subscribe;
          }
          Lt(t3, e3, s2) {
            const i2 = this.ct;
            return this.ct++, 0 !== s2.length ? { arguments: e3, invocationId: i2.toString(), streamIds: s2, target: t3, type: x.StreamInvocation } : { arguments: e3, invocationId: i2.toString(), target: t3, type: x.StreamInvocation };
          }
          Nt(t3) {
            return { invocationId: t3, type: x.CancelInvocation };
          }
          Vt(t3, e3) {
            return { invocationId: t3, item: e3, type: x.StreamItem };
          }
          Bt(t3, e3, s2) {
            return e3 ? { error: e3, invocationId: t3, type: x.Completion } : { invocationId: t3, result: s2, type: x.Completion };
          }
          At() {
            return { type: x.Close };
          }
        }
        const M = [0, 2e3, 1e4, 3e4, null];
        class j {
          constructor(t3) {
            this.Gt = void 0 !== t3 ? [...t3, null] : M;
          }
          nextRetryDelayInMilliseconds(t3) {
            return this.Gt[t3.previousRetryCount];
          }
        }
        class W {
        }
        W.Authorization = "Authorization", W.Cookie = "Cookie";
        class O extends d {
          constructor(t3, e3) {
            super(), this.Qt = t3, this.Yt = e3;
          }
          async send(t3) {
            let e3 = true;
            this.Yt && (!this.Zt || t3.url && t3.url.indexOf("/negotiate?") > 0) && (e3 = false, this.Zt = await this.Yt()), this.te(t3);
            const s2 = await this.Qt.send(t3);
            return e3 && 401 === s2.statusCode && this.Yt ? (this.Zt = await this.Yt(), this.te(t3), await this.Qt.send(t3)) : s2;
          }
          te(t3) {
            t3.headers || (t3.headers = {}), this.Zt ? t3.headers[W.Authorization] = `Bearer ${this.Zt}` : this.Yt && t3.headers[W.Authorization] && delete t3.headers[W.Authorization];
          }
          getCookieString(t3) {
            return this.Qt.getCookieString(t3);
          }
        }
        var F, B;
        !function(t3) {
          t3[t3.None = 0] = "None", t3[t3.WebSockets = 1] = "WebSockets", t3[t3.ServerSentEvents = 2] = "ServerSentEvents", t3[t3.LongPolling = 4] = "LongPolling";
        }(F || (F = {})), function(t3) {
          t3[t3.Text = 1] = "Text", t3[t3.Binary = 2] = "Binary";
        }(B || (B = {}));
        class X {
          constructor() {
            this.ee = false, this.onabort = null;
          }
          abort() {
            this.ee || (this.ee = true, this.onabort && this.onabort());
          }
          get signal() {
            return this;
          }
          get aborted() {
            return this.ee;
          }
        }
        class J {
          get pollAborted() {
            return this.se.aborted;
          }
          constructor(t3, e3, s2) {
            this.$ = t3, this.u = e3, this.se = new X(), this.ie = s2, this.ne = false, this.onreceive = null, this.onclose = null;
          }
          async connect(t3, s2) {
            if (w.isRequired(t3, "url"), w.isRequired(s2, "transferFormat"), w.isIn(s2, B, "transferFormat"), this.re = t3, this.u.log(e2.Trace, "(LongPolling transport) Connecting."), s2 === B.Binary && "undefined" != typeof XMLHttpRequest && "string" != typeof new XMLHttpRequest().responseType) throw new Error("Binary protocols over XmlHttpRequest not implementing advanced features are not supported.");
            const [n2, r2] = $(), o2 = { [n2]: r2, ...this.ie.headers }, h2 = { abortSignal: this.se.signal, headers: o2, timeout: 1e5, withCredentials: this.ie.withCredentials };
            s2 === B.Binary && (h2.responseType = "arraybuffer");
            const c2 = `${t3}&_=${Date.now()}`;
            this.u.log(e2.Trace, `(LongPolling transport) polling: ${c2}.`);
            const a2 = await this.$.get(c2, h2);
            200 !== a2.statusCode ? (this.u.log(e2.Error, `(LongPolling transport) Unexpected response code: ${a2.statusCode}.`), this.oe = new i(a2.statusText || "", a2.statusCode), this.ne = false) : this.ne = true, this.he = this.ce(this.re, h2);
          }
          async ce(t3, s2) {
            try {
              for (; this.ne; ) try {
                const n2 = `${t3}&_=${Date.now()}`;
                this.u.log(e2.Trace, `(LongPolling transport) polling: ${n2}.`);
                const r2 = await this.$.get(n2, s2);
                204 === r2.statusCode ? (this.u.log(e2.Information, "(LongPolling transport) Poll terminated by server."), this.ne = false) : 200 !== r2.statusCode ? (this.u.log(e2.Error, `(LongPolling transport) Unexpected response code: ${r2.statusCode}.`), this.oe = new i(r2.statusText || "", r2.statusCode), this.ne = false) : r2.content ? (this.u.log(e2.Trace, `(LongPolling transport) data received. ${m(r2.content, this.ie.logMessageContent)}.`), this.onreceive && this.onreceive(r2.content)) : this.u.log(e2.Trace, "(LongPolling transport) Poll timed out, reissuing.");
              } catch (t4) {
                this.ne ? t4 instanceof n ? this.u.log(e2.Trace, "(LongPolling transport) Poll timed out, reissuing.") : (this.oe = t4, this.ne = false) : this.u.log(e2.Trace, `(LongPolling transport) Poll errored after shutdown: ${t4.message}`);
              }
            } finally {
              this.u.log(e2.Trace, "(LongPolling transport) Polling complete."), this.pollAborted || this.ae();
            }
          }
          async send(t3) {
            return this.ne ? b(this.u, "LongPolling", this.$, this.re, t3, this.ie) : Promise.reject(new Error("Cannot send until the transport is connected"));
          }
          async stop() {
            this.u.log(e2.Trace, "(LongPolling transport) Stopping polling."), this.ne = false, this.se.abort();
            try {
              await this.he, this.u.log(e2.Trace, `(LongPolling transport) sending DELETE request to ${this.re}.`);
              const t3 = {}, [s2, n2] = $();
              t3[s2] = n2;
              const r2 = { headers: { ...t3, ...this.ie.headers }, timeout: this.ie.timeout, withCredentials: this.ie.withCredentials };
              let o2;
              try {
                await this.$.delete(this.re, r2);
              } catch (t4) {
                o2 = t4;
              }
              o2 ? o2 instanceof i && (404 === o2.statusCode ? this.u.log(e2.Trace, "(LongPolling transport) A 404 response was returned from sending a DELETE request.") : this.u.log(e2.Trace, `(LongPolling transport) Error sending a DELETE request: ${o2}`)) : this.u.log(e2.Trace, "(LongPolling transport) DELETE request accepted.");
            } finally {
              this.u.log(e2.Trace, "(LongPolling transport) Stop finished."), this.ae();
            }
          }
          ae() {
            if (this.onclose) {
              let t3 = "(LongPolling transport) Firing onclose event.";
              this.oe && (t3 += " Error: " + this.oe), this.u.log(e2.Trace, t3), this.onclose(this.oe);
            }
          }
        }
        class z {
          constructor(t3, e3, s2, i2) {
            this.$ = t3, this.Zt = e3, this.u = s2, this.ie = i2, this.onreceive = null, this.onclose = null;
          }
          async connect(t3, s2) {
            return w.isRequired(t3, "url"), w.isRequired(s2, "transferFormat"), w.isIn(s2, B, "transferFormat"), this.u.log(e2.Trace, "(SSE transport) Connecting."), this.re = t3, this.Zt && (t3 += (t3.indexOf("?") < 0 ? "?" : "&") + `access_token=${encodeURIComponent(this.Zt)}`), new Promise((i2, n2) => {
              let r2, o2 = false;
              if (s2 === B.Text) {
                if (g.isBrowser || g.isWebWorker) r2 = new this.ie.EventSource(t3, { withCredentials: this.ie.withCredentials });
                else {
                  const e3 = this.$.getCookieString(t3), s3 = {};
                  s3.Cookie = e3;
                  const [i3, n3] = $();
                  s3[i3] = n3, r2 = new this.ie.EventSource(t3, { withCredentials: this.ie.withCredentials, headers: { ...s3, ...this.ie.headers } });
                }
                try {
                  r2.onmessage = (t4) => {
                    if (this.onreceive) try {
                      this.u.log(e2.Trace, `(SSE transport) data received. ${m(t4.data, this.ie.logMessageContent)}.`), this.onreceive(t4.data);
                    } catch (t5) {
                      return void this.le(t5);
                    }
                  }, r2.onerror = (t4) => {
                    o2 ? this.le() : n2(new Error("EventSource failed to connect. The connection could not be found on the server, either the connection ID is not present on the server, or a proxy is refusing/buffering the connection. If you have multiple servers check that sticky sessions are enabled."));
                  }, r2.onopen = () => {
                    this.u.log(e2.Information, `SSE connected to ${this.re}`), this.ue = r2, o2 = true, i2();
                  };
                } catch (t4) {
                  return void n2(t4);
                }
              } else n2(new Error("The Server-Sent Events transport only supports the 'Text' transfer format"));
            });
          }
          async send(t3) {
            return this.ue ? b(this.u, "SSE", this.$, this.re, t3, this.ie) : Promise.reject(new Error("Cannot send until the transport is connected"));
          }
          stop() {
            return this.le(), Promise.resolve();
          }
          le(t3) {
            this.ue && (this.ue.close(), this.ue = void 0, this.onclose && this.onclose(t3));
          }
        }
        class V {
          constructor(t3, e3, s2, i2, n2, r2) {
            this.u = s2, this.Yt = e3, this.de = i2, this.fe = n2, this.$ = t3, this.onreceive = null, this.onclose = null, this.pe = r2;
          }
          async connect(t3, s2) {
            let i2;
            return w.isRequired(t3, "url"), w.isRequired(s2, "transferFormat"), w.isIn(s2, B, "transferFormat"), this.u.log(e2.Trace, "(WebSockets transport) Connecting."), this.Yt && (i2 = await this.Yt()), new Promise((n2, r2) => {
              let o2;
              t3 = t3.replace(/^http/, "ws");
              const h2 = this.$.getCookieString(t3);
              let c2 = false;
              if (g.isNode || g.isReactNative) {
                const e3 = {}, [s3, n3] = $();
                e3[s3] = n3, i2 && (e3[W.Authorization] = `Bearer ${i2}`), h2 && (e3[W.Cookie] = h2), o2 = new this.fe(t3, void 0, { headers: { ...e3, ...this.pe } });
              } else i2 && (t3 += (t3.indexOf("?") < 0 ? "?" : "&") + `access_token=${encodeURIComponent(i2)}`);
              o2 || (o2 = new this.fe(t3)), s2 === B.Binary && (o2.binaryType = "arraybuffer"), o2.onopen = (s3) => {
                this.u.log(e2.Information, `WebSocket connected to ${t3}.`), this.we = o2, c2 = true, n2();
              }, o2.onerror = (t4) => {
                let s3 = null;
                s3 = "undefined" != typeof ErrorEvent && t4 instanceof ErrorEvent ? t4.error : "There was an error with the transport", this.u.log(e2.Information, `(WebSockets transport) ${s3}.`);
              }, o2.onmessage = (t4) => {
                if (this.u.log(e2.Trace, `(WebSockets transport) data received. ${m(t4.data, this.de)}.`), this.onreceive) try {
                  this.onreceive(t4.data);
                } catch (t5) {
                  return void this.le(t5);
                }
              }, o2.onclose = (t4) => {
                if (c2) this.le(t4);
                else {
                  let e3 = null;
                  e3 = "undefined" != typeof ErrorEvent && t4 instanceof ErrorEvent ? t4.error : "WebSocket failed to connect. The connection could not be found on the server, either the endpoint may not be a SignalR endpoint, the connection ID is not present on the server, or there is a proxy blocking WebSockets. If you have multiple servers check that sticky sessions are enabled.", r2(new Error(e3));
                }
              };
            });
          }
          send(t3) {
            return this.we && this.we.readyState === this.fe.OPEN ? (this.u.log(e2.Trace, `(WebSockets transport) sending data. ${m(t3, this.de)}.`), this.we.send(t3), Promise.resolve()) : Promise.reject("WebSocket is not in the OPEN state");
          }
          stop() {
            return this.we && this.le(void 0), Promise.resolve();
          }
          le(t3) {
            this.we && (this.we.onclose = () => {
            }, this.we.onmessage = () => {
            }, this.we.onerror = () => {
            }, this.we.close(), this.we = void 0), this.u.log(e2.Trace, "(WebSockets transport) socket closed."), this.onclose && (!this.ge(t3) || false !== t3.wasClean && 1e3 === t3.code ? t3 instanceof Error ? this.onclose(t3) : this.onclose() : this.onclose(new Error(`WebSocket closed with status code: ${t3.code} (${t3.reason || "no reason given"}).`)));
          }
          ge(t3) {
            return t3 && "boolean" == typeof t3.wasClean && "number" == typeof t3.code;
          }
        }
        class K {
          constructor(t3, s2 = {}) {
            var i2;
            if (this.me = () => {
            }, this.features = {}, this.ye = 1, w.isRequired(t3, "url"), this.u = void 0 === (i2 = s2.logger) ? new E(e2.Information) : null === i2 ? f.instance : void 0 !== i2.log ? i2 : new E(i2), this.baseUrl = this.be(t3), (s2 = s2 || {}).logMessageContent = void 0 !== s2.logMessageContent && s2.logMessageContent, "boolean" != typeof s2.withCredentials && void 0 !== s2.withCredentials) throw new Error("withCredentials option was not a 'boolean' or 'undefined' value");
            s2.withCredentials = void 0 === s2.withCredentials || s2.withCredentials, s2.timeout = void 0 === s2.timeout ? 1e5 : s2.timeout;
            let n2 = null, r2 = null;
            g.isNode && (n2 = function() {
              throw new Error("Trying to import 'ws' in the browser.");
            }(), r2 = function() {
              throw new Error("Trying to import 'eventsource' in the browser.");
            }()), g.isNode || "undefined" == typeof WebSocket || s2.WebSocket ? g.isNode && !s2.WebSocket && n2 && (s2.WebSocket = n2) : s2.WebSocket = WebSocket, g.isNode || "undefined" == typeof EventSource || s2.EventSource ? g.isNode && !s2.EventSource && void 0 !== r2 && (s2.EventSource = r2) : s2.EventSource = EventSource, this.$ = new O(s2.httpClient || new H(this.u), s2.accessTokenFactory), this.ut = "Disconnected", this.dt = false, this.ie = s2, this.onreceive = null, this.onclose = null;
          }
          async start(t3) {
            if (t3 = t3 || B.Binary, w.isIn(t3, B, "transferFormat"), this.u.log(e2.Debug, `Starting connection with transfer format '${B[t3]}'.`), "Disconnected" !== this.ut) return Promise.reject(new Error("Cannot start an HttpConnection that is not in the 'Disconnected' state."));
            if (this.ut = "Connecting", this.ve = this.yt(t3), await this.ve, "Disconnecting" === this.ut) {
              const t4 = "Failed to start the HttpConnection before stop() was called.";
              return this.u.log(e2.Error, t4), await this.It, Promise.reject(new r(t4));
            }
            if ("Connected" !== this.ut) {
              const t4 = "HttpConnection.startInternal completed gracefully but didn't enter the connection into the connected state!";
              return this.u.log(e2.Error, t4), Promise.reject(new r(t4));
            }
            this.dt = true;
          }
          send(t3) {
            return "Connected" !== this.ut ? Promise.reject(new Error("Cannot send data if the connection is not in the 'Connected' State.")) : (this.Ee || (this.Ee = new G(this.transport)), this.Ee.send(t3));
          }
          async stop(t3) {
            return "Disconnected" === this.ut ? (this.u.log(e2.Debug, `Call to HttpConnection.stop(${t3}) ignored because the connection is already in the disconnected state.`), Promise.resolve()) : "Disconnecting" === this.ut ? (this.u.log(e2.Debug, `Call to HttpConnection.stop(${t3}) ignored because the connection is already in the disconnecting state.`), this.It) : (this.ut = "Disconnecting", this.It = new Promise((t4) => {
              this.me = t4;
            }), await this._t(t3), void await this.It);
          }
          async _t(t3) {
            this.$e = t3;
            try {
              await this.ve;
            } catch (t4) {
            }
            if (this.transport) {
              try {
                await this.transport.stop();
              } catch (t4) {
                this.u.log(e2.Error, `HttpConnection.transport.stop() threw error '${t4}'.`), this.Ce();
              }
              this.transport = void 0;
            } else this.u.log(e2.Debug, "HttpConnection.transport is undefined in HttpConnection.stop() because start() failed.");
          }
          async yt(t3) {
            let s2 = this.baseUrl;
            this.Yt = this.ie.accessTokenFactory, this.$.Yt = this.Yt;
            try {
              if (this.ie.skipNegotiation) {
                if (this.ie.transport !== F.WebSockets) throw new Error("Negotiation can only be skipped when using the WebSocket transport directly.");
                this.transport = this.Se(F.WebSockets), await this.ke(s2, t3);
              } else {
                let e3 = null, i2 = 0;
                do {
                  if (e3 = await this.Pe(s2), "Disconnecting" === this.ut || "Disconnected" === this.ut) throw new r("The connection was stopped during negotiation.");
                  if (e3.error) throw new Error(e3.error);
                  if (e3.ProtocolVersion) throw new Error("Detected a connection attempt to an ASP.NET SignalR Server. This client only supports connecting to an ASP.NET Core SignalR Server. See https://aka.ms/signalr-core-differences for details.");
                  if (e3.url && (s2 = e3.url), e3.accessToken) {
                    const t4 = e3.accessToken;
                    this.Yt = () => t4, this.$.Zt = t4, this.$.Yt = void 0;
                  }
                  i2++;
                } while (e3.url && i2 < 100);
                if (100 === i2 && e3.url) throw new Error("Negotiate redirection limit exceeded.");
                await this.Te(s2, this.ie.transport, e3, t3);
              }
              this.transport instanceof J && (this.features.inherentKeepAlive = true), "Connecting" === this.ut && (this.u.log(e2.Debug, "The HttpConnection connected successfully."), this.ut = "Connected");
            } catch (t4) {
              return this.u.log(e2.Error, "Failed to start the connection: " + t4), this.ut = "Disconnected", this.transport = void 0, this.me(), Promise.reject(t4);
            }
          }
          async Pe(t3) {
            const s2 = {}, [n2, r2] = $();
            s2[n2] = r2;
            const o2 = this.Ie(t3);
            this.u.log(e2.Debug, `Sending negotiation request: ${o2}.`);
            try {
              const t4 = await this.$.post(o2, { content: "", headers: { ...s2, ...this.ie.headers }, timeout: this.ie.timeout, withCredentials: this.ie.withCredentials });
              if (200 !== t4.statusCode) return Promise.reject(new Error(`Unexpected status code returned from negotiate '${t4.statusCode}'`));
              const e3 = JSON.parse(t4.content);
              return (!e3.negotiateVersion || e3.negotiateVersion < 1) && (e3.connectionToken = e3.connectionId), e3.useStatefulReconnect && true !== this.ie._e ? Promise.reject(new a("Client didn't negotiate Stateful Reconnect but the server did.")) : e3;
            } catch (t4) {
              let s3 = "Failed to complete negotiation with the server: " + t4;
              return t4 instanceof i && 404 === t4.statusCode && (s3 += " Either this is not a SignalR endpoint or there is a proxy blocking the connection."), this.u.log(e2.Error, s3), Promise.reject(new a(s3));
            }
          }
          He(t3, e3) {
            return e3 ? t3 + (-1 === t3.indexOf("?") ? "?" : "&") + `id=${e3}` : t3;
          }
          async Te(t3, s2, i2, n2) {
            let o2 = this.He(t3, i2.connectionToken);
            if (this.De(s2)) return this.u.log(e2.Debug, "Connection was provided an instance of ITransport, using that directly."), this.transport = s2, await this.ke(o2, n2), void (this.connectionId = i2.connectionId);
            const h2 = [], a2 = i2.availableTransports || [];
            let u2 = i2;
            for (const i3 of a2) {
              const a3 = this.Re(i3, s2, n2, true === (null == u2 ? void 0 : u2.useStatefulReconnect));
              if (a3 instanceof Error) h2.push(`${i3.transport} failed:`), h2.push(a3);
              else if (this.De(a3)) {
                if (this.transport = a3, !u2) {
                  try {
                    u2 = await this.Pe(t3);
                  } catch (t4) {
                    return Promise.reject(t4);
                  }
                  o2 = this.He(t3, u2.connectionToken);
                }
                try {
                  return await this.ke(o2, n2), void (this.connectionId = u2.connectionId);
                } catch (t4) {
                  if (this.u.log(e2.Error, `Failed to start the transport '${i3.transport}': ${t4}`), u2 = void 0, h2.push(new c(`${i3.transport} failed: ${t4}`, F[i3.transport])), "Connecting" !== this.ut) {
                    const t5 = "Failed to select transport before stop() was called.";
                    return this.u.log(e2.Debug, t5), Promise.reject(new r(t5));
                  }
                }
              }
            }
            return h2.length > 0 ? Promise.reject(new l(`Unable to connect to the server with any of the available transports. ${h2.join(" ")}`, h2)) : Promise.reject(new Error("None of the transports supported by the client are supported by the server."));
          }
          Se(t3) {
            switch (t3) {
              case F.WebSockets:
                if (!this.ie.WebSocket) throw new Error("'WebSocket' is not supported in your environment.");
                return new V(this.$, this.Yt, this.u, this.ie.logMessageContent, this.ie.WebSocket, this.ie.headers || {});
              case F.ServerSentEvents:
                if (!this.ie.EventSource) throw new Error("'EventSource' is not supported in your environment.");
                return new z(this.$, this.$.Zt, this.u, this.ie);
              case F.LongPolling:
                return new J(this.$, this.u, this.ie);
              default:
                throw new Error(`Unknown transport: ${t3}.`);
            }
          }
          ke(t3, e3) {
            return this.transport.onreceive = this.onreceive, this.features.reconnect ? this.transport.onclose = async (s2) => {
              let i2 = false;
              if (this.features.reconnect) {
                try {
                  this.features.disconnected(), await this.transport.connect(t3, e3), await this.features.resend();
                } catch {
                  i2 = true;
                }
                i2 && this.Ce(s2);
              } else this.Ce(s2);
            } : this.transport.onclose = (t4) => this.Ce(t4), this.transport.connect(t3, e3);
          }
          Re(t3, s2, i2, n2) {
            const r2 = F[t3.transport];
            if (null == r2) return this.u.log(e2.Debug, `Skipping transport '${t3.transport}' because it is not supported by this client.`), new Error(`Skipping transport '${t3.transport}' because it is not supported by this client.`);
            if (!function(t4, e3) {
              return !t4 || 0 != (e3 & t4);
            }(s2, r2)) return this.u.log(e2.Debug, `Skipping transport '${F[r2]}' because it was disabled by the client.`), new h(`'${F[r2]}' is disabled by the client.`, r2);
            if (!(t3.transferFormats.map((t4) => B[t4]).indexOf(i2) >= 0)) return this.u.log(e2.Debug, `Skipping transport '${F[r2]}' because it does not support the requested transfer format '${B[i2]}'.`), new Error(`'${F[r2]}' does not support ${B[i2]}.`);
            if (r2 === F.WebSockets && !this.ie.WebSocket || r2 === F.ServerSentEvents && !this.ie.EventSource) return this.u.log(e2.Debug, `Skipping transport '${F[r2]}' because it is not supported in your environment.'`), new o(`'${F[r2]}' is not supported in your environment.`, r2);
            this.u.log(e2.Debug, `Selecting transport '${F[r2]}'.`);
            try {
              return this.features.reconnect = r2 === F.WebSockets ? n2 : void 0, this.Se(r2);
            } catch (t4) {
              return t4;
            }
          }
          De(t3) {
            return t3 && "object" == typeof t3 && "connect" in t3;
          }
          Ce(t3) {
            if (this.u.log(e2.Debug, `HttpConnection.stopConnection(${t3}) called while in state ${this.ut}.`), this.transport = void 0, t3 = this.$e || t3, this.$e = void 0, "Disconnected" !== this.ut) {
              if ("Connecting" === this.ut) throw this.u.log(e2.Warning, `Call to HttpConnection.stopConnection(${t3}) was ignored because the connection is still in the connecting state.`), new Error(`HttpConnection.stopConnection(${t3}) was called while the connection is still in the connecting state.`);
              if ("Disconnecting" === this.ut && this.me(), t3 ? this.u.log(e2.Error, `Connection disconnected with error '${t3}'.`) : this.u.log(e2.Information, "Connection disconnected."), this.Ee && (this.Ee.stop().catch((t4) => {
                this.u.log(e2.Error, `TransportSendQueue.stop() threw error '${t4}'.`);
              }), this.Ee = void 0), this.connectionId = void 0, this.ut = "Disconnected", this.dt) {
                this.dt = false;
                try {
                  this.onclose && this.onclose(t3);
                } catch (s2) {
                  this.u.log(e2.Error, `HttpConnection.onclose(${t3}) threw error '${s2}'.`);
                }
              }
            } else this.u.log(e2.Debug, `Call to HttpConnection.stopConnection(${t3}) was ignored because the connection is already in the disconnected state.`);
          }
          be(t3) {
            if (0 === t3.lastIndexOf("https://", 0) || 0 === t3.lastIndexOf("http://", 0)) return t3;
            if (!g.isBrowser) throw new Error(`Cannot resolve '${t3}'.`);
            const s2 = window.document.createElement("a");
            return s2.href = t3, this.u.log(e2.Information, `Normalizing '${t3}' to '${s2.href}'.`), s2.href;
          }
          Ie(t3) {
            const e3 = new URL(t3);
            e3.pathname.endsWith("/") ? e3.pathname += "negotiate" : e3.pathname += "/negotiate";
            const s2 = new URLSearchParams(e3.searchParams);
            return s2.has("negotiateVersion") || s2.append("negotiateVersion", this.ye.toString()), s2.has("useStatefulReconnect") ? "true" === s2.get("useStatefulReconnect") && (this.ie._e = true) : true === this.ie._e && s2.append("useStatefulReconnect", "true"), e3.search = s2.toString(), e3.toString();
          }
        }
        class G {
          constructor(t3) {
            this.xe = t3, this.Ae = [], this.Ue = true, this.Le = new Q(), this.Ne = new Q(), this.qe = this.Me();
          }
          send(t3) {
            return this.je(t3), this.Ne || (this.Ne = new Q()), this.Ne.promise;
          }
          stop() {
            return this.Ue = false, this.Le.resolve(), this.qe;
          }
          je(t3) {
            if (this.Ae.length && typeof this.Ae[0] != typeof t3) throw new Error(`Expected data to be of type ${typeof this.Ae} but was of type ${typeof t3}`);
            this.Ae.push(t3), this.Le.resolve();
          }
          async Me() {
            for (; ; ) {
              if (await this.Le.promise, !this.Ue) {
                this.Ne && this.Ne.reject("Connection stopped.");
                break;
              }
              this.Le = new Q();
              const t3 = this.Ne;
              this.Ne = void 0;
              const e3 = "string" == typeof this.Ae[0] ? this.Ae.join("") : G.We(this.Ae);
              this.Ae.length = 0;
              try {
                await this.xe.send(e3), t3.resolve();
              } catch (e4) {
                t3.reject(e4);
              }
            }
          }
          static We(t3) {
            const e3 = t3.map((t4) => t4.byteLength).reduce((t4, e4) => t4 + e4), s2 = new Uint8Array(e3);
            let i2 = 0;
            for (const e4 of t3) s2.set(new Uint8Array(e4), i2), i2 += e4.byteLength;
            return s2.buffer;
          }
        }
        class Q {
          constructor() {
            this.promise = new Promise((t3, e3) => [this.j, this.Oe] = [t3, e3]);
          }
          resolve() {
            this.j();
          }
          reject(t3) {
            this.Oe(t3);
          }
        }
        class Y {
          constructor() {
            this.name = "json", this.version = 2, this.transferFormat = B.Text;
          }
          parseMessages(t3, s2) {
            if ("string" != typeof t3) throw new Error("Invalid input for JSON hub protocol. Expected a string.");
            if (!t3) return [];
            null === s2 && (s2 = f.instance);
            const i2 = D.parse(t3), n2 = [];
            for (const t4 of i2) {
              const i3 = JSON.parse(t4);
              if ("number" != typeof i3.type) throw new Error("Invalid payload.");
              switch (i3.type) {
                case x.Invocation:
                  this.U(i3);
                  break;
                case x.StreamItem:
                  this.Fe(i3);
                  break;
                case x.Completion:
                  this.Be(i3);
                  break;
                case x.Ping:
                case x.Close:
                  break;
                case x.Ack:
                  this.Xe(i3);
                  break;
                case x.Sequence:
                  this.Je(i3);
                  break;
                default:
                  s2.log(e2.Information, "Unknown message type '" + i3.type + "' ignored.");
                  continue;
              }
              n2.push(i3);
            }
            return n2;
          }
          writeMessage(t3) {
            return D.write(JSON.stringify(t3));
          }
          U(t3) {
            this.ze(t3.target, "Invalid payload for Invocation message."), void 0 !== t3.invocationId && this.ze(t3.invocationId, "Invalid payload for Invocation message.");
          }
          Fe(t3) {
            if (this.ze(t3.invocationId, "Invalid payload for StreamItem message."), void 0 === t3.item) throw new Error("Invalid payload for StreamItem message.");
          }
          Be(t3) {
            if (t3.result && t3.error) throw new Error("Invalid payload for Completion message.");
            !t3.result && t3.error && this.ze(t3.error, "Invalid payload for Completion message."), this.ze(t3.invocationId, "Invalid payload for Completion message.");
          }
          Xe(t3) {
            if ("number" != typeof t3.sequenceId) throw new Error("Invalid SequenceId for Ack message.");
          }
          Je(t3) {
            if ("number" != typeof t3.sequenceId) throw new Error("Invalid SequenceId for Sequence message.");
          }
          ze(t3, e3) {
            if ("string" != typeof t3 || "" === t3) throw new Error(e3);
          }
        }
        const Z = { trace: e2.Trace, debug: e2.Debug, info: e2.Information, information: e2.Information, warn: e2.Warning, warning: e2.Warning, error: e2.Error, critical: e2.Critical, none: e2.None };
        class tt {
          configureLogging(t3) {
            if (w.isRequired(t3, "logging"), void 0 !== t3.log) this.logger = t3;
            else if ("string" == typeof t3) {
              const e3 = function(t4) {
                const e4 = Z[t4.toLowerCase()];
                if (void 0 !== e4) return e4;
                throw new Error(`Unknown log level: ${t4}`);
              }(t3);
              this.logger = new E(e3);
            } else this.logger = new E(t3);
            return this;
          }
          withUrl(t3, e3) {
            return w.isRequired(t3, "url"), w.isNotEmpty(t3, "url"), this.url = t3, this.httpConnectionOptions = "object" == typeof e3 ? { ...this.httpConnectionOptions, ...e3 } : { ...this.httpConnectionOptions, transport: e3 }, this;
          }
          withHubProtocol(t3) {
            return w.isRequired(t3, "protocol"), this.protocol = t3, this;
          }
          withAutomaticReconnect(t3) {
            if (this.reconnectPolicy) throw new Error("A reconnectPolicy has already been set.");
            return t3 ? Array.isArray(t3) ? this.reconnectPolicy = new j(t3) : this.reconnectPolicy = t3 : this.reconnectPolicy = new j(), this;
          }
          withServerTimeout(t3) {
            return w.isRequired(t3, "milliseconds"), this.Ve = t3, this;
          }
          withKeepAliveInterval(t3) {
            return w.isRequired(t3, "milliseconds"), this.Ke = t3, this;
          }
          withStatefulReconnect(t3) {
            return void 0 === this.httpConnectionOptions && (this.httpConnectionOptions = {}), this.httpConnectionOptions._e = true, this.Y = null == t3 ? void 0 : t3.bufferSize, this;
          }
          build() {
            const t3 = this.httpConnectionOptions || {};
            if (void 0 === t3.logger && (t3.logger = this.logger), !this.url) throw new Error("The 'HubConnectionBuilder.withUrl' method must be called before building the connection.");
            const e3 = new K(this.url, t3);
            return q.create(e3, this.logger || f.instance, this.protocol || new Y(), this.reconnectPolicy, this.Ve, this.Ke, this.Y);
          }
        }
        return Uint8Array.prototype.indexOf || Object.defineProperty(Uint8Array.prototype, "indexOf", { value: Array.prototype.indexOf, writable: true }), Uint8Array.prototype.slice || Object.defineProperty(Uint8Array.prototype, "slice", { value: function(t3, e3) {
          return new Uint8Array(Array.prototype.slice.call(this, t3, e3));
        }, writable: true }), Uint8Array.prototype.forEach || Object.defineProperty(Uint8Array.prototype, "forEach", { value: Array.prototype.forEach, writable: true }), s;
      })(), "object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : "object" == typeof exports ? exports.signalR = e() : t.signalR = e();
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/config.ts
  var require_config = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/config.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        if (typeof module === "object" && module.exports) {
          module.exports = factory();
        } else {
          const config = factory();
          root.CryptoTickerConfig = Object.assign({}, root.CryptoTickerConfig || {}, config);
        }
      })(typeof self !== "undefined" ? self : exports, function buildConfig() {
        return {
          tProxyBase: "https://tproxyv8.opendle.com",
          fallbackPollIntervalMs: 6e4,
          staleTickerTimeoutMs: 5 * 60 * 1e3,
          binanceRestBaseUrl: "https://api.binance.com",
          binanceWsBaseUrl: "wss://stream.binance.com:9443/ws",
          binanceSymbolOverrides: {},
          bitfinexRestBaseUrl: "https://api-pub.bitfinex.com",
          bitfinexWsBaseUrl: "wss://api-pub.bitfinex.com/ws/2",
          bitfinexSymbolOverrides: {},
          messages: {
            loading: "LOADING...",
            stale: "STALE",
            noData: "NO DATA",
            misconfigured: "INVALID PAIR",
            conversionError: "CONVERT ERROR"
          }
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/providers/connection-states.ts
  var require_connection_states = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/providers/connection-states.ts"(exports, module) {
      "use strict";
      var ConnectionStates = {
        LIVE: "live",
        DETACHED: "detached",
        BACKUP: "backup",
        BROKEN: "broken"
      };
      (function(root, factory) {
        const globalRoot = typeof globalThis !== "undefined" ? globalThis : root;
        const exportsValue = factory();
        if (typeof module === "object" && module.exports) {
          module.exports = exportsValue;
        }
        if (globalRoot) {
          globalRoot.CryptoTickerConnectionStates = exportsValue;
        }
      })(typeof self !== "undefined" ? self : exports, function buildConnectionStates() {
        return ConnectionStates;
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/providers/subscription-key.ts
  var require_subscription_key = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/providers/subscription-key.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        const globalRoot = typeof globalThis !== "undefined" ? globalThis : root;
        const exportsValue = factory();
        if (typeof module === "object" && module.exports) {
          module.exports = exportsValue;
        }
        if (globalRoot) {
          globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
          globalRoot.CryptoTickerProviders.buildSubscriptionKey = exportsValue.buildSubscriptionKey;
        }
      })(typeof self !== "undefined" ? self : exports, function buildSubscriptionKeyModule() {
        function buildSubscriptionKey(exchange, symbol, fromCurrency, toCurrency) {
          const exchangePart = exchange || "";
          const symbolPart = symbol || "";
          const fromPart = fromCurrency || null;
          const toPart = toCurrency || null;
          let convertPart = "";
          if (fromPart !== null && toPart !== null && fromPart !== toPart) {
            convertPart = "__" + fromPart + "_" + toPart;
          }
          return exchangePart + "__" + symbolPart + convertPart;
        }
        return {
          buildSubscriptionKey
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/providers/provider-interface.ts
  var require_provider_interface = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/providers/provider-interface.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        const globalRoot = typeof globalThis !== "undefined" ? globalThis : root;
        const exportsValue = factory();
        if (typeof module === "object" && module.exports) {
          module.exports = exportsValue;
        }
        if (globalRoot) {
          globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
          globalRoot.CryptoTickerProviders.ProviderInterface = exportsValue.ProviderInterface;
        }
      })(typeof self !== "undefined" ? self : exports, function buildProviderInterface() {
        function noop() {
        }
        class ProviderInterface {
          constructor(options) {
            const opts = options || {};
            this.baseUrl = typeof opts.baseUrl === "string" ? opts.baseUrl : "";
            this.logger = typeof opts.logger === "function" ? opts.logger : noop;
          }
          getId() {
            throw new Error("Provider must implement getId()");
          }
          subscribeTicker(_params, _handlers) {
            throw new Error("Provider must implement subscribeTicker()");
          }
          async fetchTicker(_params) {
            throw new Error("Provider must implement fetchTicker()");
          }
          getCachedTicker(_key) {
            return null;
          }
          async fetchCandles(_params) {
            throw new Error("Provider must implement fetchCandles()");
          }
          ensureConnection() {
          }
          async fetchConversionRate(fromCurrency, toCurrency) {
            if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) {
              return 1;
            }
            return 1;
          }
        }
        return {
          ProviderInterface
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/providers/ticker-subscription-manager.ts
  var require_ticker_subscription_manager = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/providers/ticker-subscription-manager.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        const globalRoot = typeof globalThis !== "undefined" ? globalThis : root;
        const args = typeof module === "object" && module.exports ? [
          require_subscription_key(),
          require_connection_states()
        ] : [
          root == null ? void 0 : root.CryptoTickerProviders,
          root == null ? void 0 : root.CryptoTickerConnectionStates
        ];
        const exportsValue = factory(
          args[0],
          args[1]
        );
        if (typeof module === "object" && module.exports) {
          module.exports = exportsValue;
        }
        if (globalRoot) {
          globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
          globalRoot.CryptoTickerProviders.TickerSubscriptionManager = exportsValue.TickerSubscriptionManager;
        }
      })(typeof self !== "undefined" ? self : exports, function(subscriptionKeyModule, connectionStatesModule) {
        const buildSubscriptionKey = subscriptionKeyModule.buildSubscriptionKey || subscriptionKeyModule;
        const ConnectionStates = connectionStatesModule || {
          LIVE: "live",
          DETACHED: "detached",
          BACKUP: "backup",
          BROKEN: "broken"
        };
        const DEFAULT_FALLBACK_POLL_INTERVAL_MS = 6e4;
        const DEFAULT_STALE_TICKER_TIMEOUT_MS = 5 * 60 * 1e3;
        function noop() {
        }
        function normalizeHandlers(handlers) {
          const h = handlers || {};
          return {
            onData: typeof h.onData === "function" ? h.onData : null,
            onError: typeof h.onError === "function" ? h.onError : null
          };
        }
        function copyParams(params) {
          const p = params || {};
          const fromCurrency = p.fromCurrency || null;
          const toCurrency = p.toCurrency || null;
          return {
            exchange: p.exchange,
            symbol: p.symbol,
            fromCurrency,
            toCurrency
          };
        }
        class TickerSubscriptionManager {
          constructor(options) {
            const opts = options || {};
            this.logger = typeof opts.logger === "function" ? opts.logger : noop;
            this.fetchTickerFn = typeof opts.fetchTicker === "function" ? opts.fetchTicker : null;
            this.subscribeStreamingFn = typeof opts.subscribeStreaming === "function" ? opts.subscribeStreaming : null;
            this.unsubscribeStreamingFn = typeof opts.unsubscribeStreaming === "function" ? opts.unsubscribeStreaming : null;
            this.ensureConnectionFn = typeof opts.ensureConnection === "function" ? opts.ensureConnection : null;
            this.subscriptionKeyBuilder = typeof opts.buildSubscriptionKey === "function" ? opts.buildSubscriptionKey : buildSubscriptionKey;
            this.fallbackPollIntervalMs = typeof opts.fallbackPollIntervalMs === "number" ? opts.fallbackPollIntervalMs : DEFAULT_FALLBACK_POLL_INTERVAL_MS;
            this.staleTickerTimeoutMs = typeof opts.staleTickerTimeoutMs === "number" ? opts.staleTickerTimeoutMs : DEFAULT_STALE_TICKER_TIMEOUT_MS;
            this.connectionStates = ConnectionStates;
            this.entries = {};
            this.cache = {};
          }
          // Subscribe entry: start streaming if possible and kick REST fetch so key paints immediately.
          subscribe(params, handlers) {
            const normalizedHandlers = normalizeHandlers(handlers);
            const entry = this.getOrCreateEntry(params);
            entry.subscribers.push(normalizedHandlers);
            if (this.ensureConnectionFn) {
              try {
                this.ensureConnectionFn();
              } catch (err) {
                this.logger("TickerSubscriptionManager: ensureConnection error", err);
              }
            }
            this.ensureStreaming(entry);
            this.startFallbackPolling(entry);
            const self2 = this;
            if (this.fetchTickerFn) {
              this.fetchTickerFn(entry.params).then(function(ticker) {
                self2.applyTickerStateFromFetch(entry, ticker);
                self2.cache[entry.key] = ticker;
                self2.notifySubscribers(entry, ticker);
              }).catch(function(err) {
                self2.logger("TickerSubscriptionManager: fetchTicker error", err);
                if (normalizedHandlers.onError) {
                  try {
                    normalizedHandlers.onError(err);
                  } catch (handlerErr) {
                    self2.logger("TickerSubscriptionManager: onError handler threw", handlerErr);
                  }
                }
              });
            }
            return {
              key: entry.key,
              unsubscribe: () => {
                this.unsubscribe(entry.key, normalizedHandlers);
              }
            };
          }
          unsubscribe(key, subscriber) {
            const entry = this.entries[key];
            if (!entry) {
              return;
            }
            const idx = entry.subscribers.indexOf(subscriber);
            if (idx >= 0) {
              entry.subscribers.splice(idx, 1);
            }
            if (entry.subscribers.length === 0) {
              this.stopFallbackPolling(entry);
              this.stopStreaming(entry);
              delete this.entries[key];
            }
          }
          getCachedTicker(key) {
            return this.cache[key] || null;
          }
          handleStreamingUpdate(key, ticker) {
            const entry = this.entries[key];
            if (!entry) {
              return;
            }
            entry.lastStreamUpdate = Date.now();
            this.setEntryConnectionState(entry, this.connectionStates.LIVE, ticker);
            this.cache[key] = ticker;
            this.notifySubscribers(entry, ticker);
          }
          getEntry(key) {
            return this.entries[key] || null;
          }
          handleStreamingUpdateFromParts(exchange, symbol, fromCurrency, toCurrency, ticker) {
            const key = this.buildKey(exchange, symbol, fromCurrency, toCurrency);
            this.handleStreamingUpdate(key, ticker);
          }
          buildKey(exchange, symbol, fromCurrency, toCurrency) {
            return this.subscriptionKeyBuilder(exchange, symbol, fromCurrency, toCurrency);
          }
          buildKeyFromParams(params) {
            const p = params || {};
            return this.buildKey(p.exchange, p.symbol, p.fromCurrency, p.toCurrency);
          }
          forEachEntry(callback) {
            if (typeof callback !== "function") {
              return;
            }
            const keys = Object.keys(this.entries);
            for (let i = 0; i < keys.length; i++) {
              const key = keys[i];
              callback(this.entries[key]);
            }
          }
          ensureStreaming(entry) {
            if (!entry || entry.streamingActive || !this.subscribeStreamingFn) {
              if (entry && !entry.streamingActive) {
                entry.streamingActive = Boolean(this.subscribeStreamingFn);
              }
              return;
            }
            try {
              const result = this.subscribeStreamingFn(entry);
              if (result && typeof result.then === "function") {
                result.then(() => {
                  entry.streamingActive = true;
                }).catch((err) => {
                  entry.streamingActive = false;
                  this.logger("TickerSubscriptionManager: subscribeStreaming promise rejected", err);
                });
              } else if (result === false) {
                entry.streamingActive = false;
              } else {
                entry.streamingActive = true;
              }
            } catch (err) {
              entry.streamingActive = false;
              this.logger("TickerSubscriptionManager: subscribeStreaming error", err);
            }
          }
          stopStreaming(entry) {
            if (!entry || !this.unsubscribeStreamingFn || !entry.streamingActive) {
              return;
            }
            try {
              const result = this.unsubscribeStreamingFn(entry);
              if (result && typeof result.then === "function") {
                result.then(() => {
                  entry.streamingActive = false;
                }).catch((err) => {
                  this.logger("TickerSubscriptionManager: unsubscribeStreaming promise rejected", err);
                });
              } else {
                entry.streamingActive = false;
              }
            } catch (err) {
              entry.streamingActive = false;
              this.logger("TickerSubscriptionManager: unsubscribeStreaming error", err);
            }
          }
          notifySubscribers(entry, ticker) {
            if (!entry) {
              return;
            }
            const subscribers = entry.subscribers;
            for (let i = 0; i < subscribers.length; i++) {
              const subscriber = subscribers[i];
              if (subscriber && subscriber.onData) {
                try {
                  subscriber.onData(ticker);
                } catch (err) {
                  this.logger("TickerSubscriptionManager: onData handler threw", err);
                }
              }
            }
          }
          startFallbackPolling(entry) {
            if (!entry || entry.fallbackTimerId || !this.fetchTickerFn) {
              return;
            }
            const self2 = this;
            entry.fallbackTimerId = setInterval(function() {
              self2.pollEntryIfNeeded(entry);
            }, this.fallbackPollIntervalMs);
          }
          stopFallbackPolling(entry) {
            if (!entry || !entry.fallbackTimerId) {
              return;
            }
            clearInterval(entry.fallbackTimerId);
            entry.fallbackTimerId = null;
          }
          pollEntryIfNeeded(entry) {
            if (!entry || !this.fetchTickerFn) {
              return;
            }
            if (!this.shouldPollEntry(entry)) {
              return;
            }
            const self2 = this;
            this.fetchTickerFn(entry.params).then(function(ticker) {
              self2.applyTickerStateFromFetch(entry, ticker);
              self2.cache[entry.key] = ticker;
              self2.notifySubscribers(entry, ticker);
            }).catch(function(err) {
              self2.logger("TickerSubscriptionManager: fallback fetch error", err);
              self2.handleFetchError(entry);
            });
          }
          // Poll only when streaming idle or stale to reduce backend load yet recover from socket hiccups.
          shouldPollEntry(entry) {
            if (!entry) {
              return false;
            }
            if (!entry.streamingActive) {
              return true;
            }
            const lastUpdate = entry.lastStreamUpdate || 0;
            if (!lastUpdate) {
              return true;
            }
            const elapsed = Date.now() - lastUpdate;
            return elapsed > this.staleTickerTimeoutMs;
          }
          getOrCreateEntry(params) {
            const key = this.buildKeyFromParams(params);
            let entry = this.entries[key];
            if (!entry) {
              entry = {
                key,
                params: copyParams(params),
                subscribers: [],
                streamingActive: false,
                lastStreamUpdate: 0,
                fallbackTimerId: null,
                meta: {},
                connectionState: null
              };
              this.entries[key] = entry;
            }
            return entry;
          }
          setEntryConnectionState(entry, state, ticker) {
            if (!entry) {
              return;
            }
            entry.connectionState = state;
            if (ticker && typeof ticker === "object") {
              ticker.connectionState = state;
            }
          }
          applyTickerStateFromFetch(entry, ticker) {
            if (!entry || !ticker) {
              return;
            }
            const state = ticker.connectionState || (entry.streamingActive ? this.connectionStates.LIVE : this.connectionStates.DETACHED);
            this.setEntryConnectionState(entry, state, ticker);
          }
          // REST failure: mark BROKEN and cache placeholder so later subscribers see same status tile.
          handleFetchError(entry) {
            if (!entry) {
              return;
            }
            this.setEntryConnectionState(entry, this.connectionStates.BROKEN);
            const key = entry.key;
            const cached = this.cache[key];
            if (cached) {
              cached.connectionState = this.connectionStates.BROKEN;
              this.notifySubscribers(entry, cached);
              return;
            }
            const fallbackTicker = {
              changeDaily: 0,
              changeDailyPercent: 0,
              last: 0,
              volume: 0,
              high: 0,
              low: 0,
              pair: entry.params.symbol,
              pairDisplay: entry.params.symbol,
              connectionState: this.connectionStates.BROKEN
            };
            this.cache[key] = fallbackTicker;
            this.notifySubscribers(entry, fallbackTicker);
          }
        }
        return {
          TickerSubscriptionManager
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/providers/generic-provider.ts
  var require_generic_provider = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/providers/generic-provider.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        const globalRoot = typeof globalThis !== "undefined" ? globalThis : root;
        const args = typeof module === "object" && module.exports ? [
          require_provider_interface(),
          require_subscription_key(),
          require_ticker_subscription_manager(),
          require_connection_states()
        ] : [
          root == null ? void 0 : root.CryptoTickerProviders,
          root == null ? void 0 : root.CryptoTickerProviders,
          root == null ? void 0 : root.CryptoTickerProviders,
          root == null ? void 0 : root.CryptoTickerConnectionStates
        ];
        const exportsValue = factory(
          args[0],
          args[1],
          args[2],
          args[3]
        );
        if (typeof module === "object" && module.exports) {
          module.exports = exportsValue;
        }
        if (globalRoot) {
          globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
          globalRoot.CryptoTickerProviders.GenericProvider = exportsValue.GenericProvider;
        }
      })(typeof self !== "undefined" ? self : exports, function(providerInterfaceModule, subscriptionKeyModule, managerModule, connectionStatesModule) {
        const ProviderInterface = providerInterfaceModule.ProviderInterface || providerInterfaceModule;
        const buildSubscriptionKey = subscriptionKeyModule.buildSubscriptionKey || subscriptionKeyModule;
        const TickerSubscriptionManager = managerModule.TickerSubscriptionManager || managerModule;
        const ConnectionStates = connectionStatesModule || {
          LIVE: "live",
          DETACHED: "detached",
          BACKUP: "backup",
          BROKEN: "broken"
        };
        const CONNECTION_STATE_CONNECTED = "Connected";
        const DEFAULT_RETRY_DELAY_MS = 5e3;
        const TPROXY_CACHE_BYPASS_PARAM = "_ctBust";
        function appendCacheBypassParam(url) {
          if (!url || typeof url !== "string") {
            return url;
          }
          try {
            const parsed = new URL(url);
            parsed.searchParams.set(TPROXY_CACHE_BYPASS_PARAM, Date.now().toString());
            return parsed.toString();
          } catch (err) {
            const separator = url.indexOf("?") === -1 ? "?" : "&";
            return url + separator + TPROXY_CACHE_BYPASS_PARAM + "=" + Date.now();
          }
        }
        class GenericProvider extends ProviderInterface {
          constructor(options) {
            super(options);
            const opts = options || {};
            this.retryDelayMs = typeof opts.retryDelayMs === "number" ? opts.retryDelayMs : DEFAULT_RETRY_DELAY_MS;
            this.connection = null;
            this.shouldReconnect = true;
            this.connectionState = "Disconnected";
            this.startingConnection = false;
            this.normalizedBaseUrl = (this.baseUrl || "").replace(/\/$/, "");
            const managerOptions = {
              logger: (...args) => {
                this.logger(...args);
              },
              fetchTicker: this.rawFetchTicker.bind(this),
              subscribeStreaming: this.subscribeEntry.bind(this),
              unsubscribeStreaming: this.unsubscribeEntry.bind(this),
              ensureConnection: this.ensureConnection.bind(this),
              buildSubscriptionKey: function(exchange, symbol, fromCurrency, toCurrency) {
                return buildSubscriptionKey(exchange, symbol, fromCurrency, toCurrency);
              },
              fallbackPollIntervalMs: opts.fallbackPollIntervalMs,
              staleTickerTimeoutMs: opts.staleTickerTimeoutMs
            };
            this.subscriptionManager = new TickerSubscriptionManager(managerOptions);
          }
          getId() {
            return "GENERIC";
          }
          subscribeTicker(params, handlers) {
            return this.subscriptionManager.subscribe(params, handlers);
          }
          getCachedTicker(key) {
            return this.subscriptionManager.getCachedTicker(key);
          }
          ensureConnection() {
            if (this.connection && (this.connectionState === CONNECTION_STATE_CONNECTED || this.startingConnection)) {
              return;
            }
            if (typeof signalR === "undefined" || !signalR.HubConnectionBuilder) {
              this.logger("GenericProvider: SignalR not available, skipping WebSocket connection.");
              return;
            }
            if (!this.connection) {
              this.connection = new signalR.HubConnectionBuilder().withUrl(this.baseUrl + "/tickerhub").withAutomaticReconnect().configureLogging(signalR.LogLevel.Warning).build();
              const self2 = this;
              this.connection.on("ticker", function(ticker) {
                self2.handleTickerMessage(ticker);
              });
              this.connection.onreconnected(function() {
                self2.logger("GenericProvider: connection re-established, resubscribing.");
                self2.onConnectionEstablished();
              });
              this.connection.onclose(function() {
                self2.connectionState = "Disconnected";
                if (self2.shouldReconnect) {
                  setTimeout(function() {
                    self2.startConnection();
                  }, self2.retryDelayMs);
                }
              });
            }
            this.startConnection();
          }
          startConnection() {
            if (!this.connection || this.startingConnection || this.connectionState === CONNECTION_STATE_CONNECTED) {
              return;
            }
            const self2 = this;
            this.startingConnection = true;
            this.connection.start().then(function() {
              self2.connectionState = CONNECTION_STATE_CONNECTED;
              self2.startingConnection = false;
              self2.onConnectionEstablished();
            }).catch(function(err) {
              self2.connectionState = "Disconnected";
              self2.startingConnection = false;
              self2.logger("GenericProvider: error starting connection", err);
              setTimeout(function() {
                self2.startConnection();
              }, self2.retryDelayMs);
            });
          }
          isConnected() {
            return this.connection && this.connectionState === CONNECTION_STATE_CONNECTED;
          }
          onConnectionEstablished() {
            const self2 = this;
            this.subscriptionManager.forEachEntry(function(entry) {
              if (entry) {
                entry.streamingActive = false;
                if (entry.meta) {
                  entry.meta.isSubscribed = false;
                  entry.meta.pending = true;
                }
                self2.subscriptionManager.ensureStreaming(entry);
              }
            });
          }
          subscribeEntry(entry) {
            if (!entry) {
              return false;
            }
            entry.meta = entry.meta || {};
            if (!this.connection) {
              this.ensureConnection();
              entry.meta.pending = true;
              entry.streamingActive = false;
              return false;
            }
            if (!this.isConnected()) {
              this.startConnection();
              entry.meta.pending = true;
              entry.streamingActive = false;
              return false;
            }
            if (entry.meta.isSubscribed) {
              entry.meta.pending = false;
              return true;
            }
            entry.meta.pending = true;
            const params = entry.params;
            const self2 = this;
            return this.connection.invoke(
              "Subscribe",
              params.exchange,
              params.symbol,
              params.fromCurrency,
              params.toCurrency
            ).then(function() {
              entry.meta.isSubscribed = true;
              entry.meta.pending = false;
              entry.streamingActive = true;
              return true;
            }).catch(function(err) {
              entry.meta.isSubscribed = false;
              entry.meta.pending = false;
              entry.streamingActive = false;
              self2.logger("GenericProvider: error invoking Subscribe", err);
              return false;
            });
          }
          unsubscribeEntry(entry) {
            if (!entry) {
              return true;
            }
            entry.meta = entry.meta || {};
            if (!this.connection || !entry.meta.isSubscribed) {
              entry.meta.isSubscribed = false;
              entry.streamingActive = false;
              return true;
            }
            const params = entry.params;
            const self2 = this;
            return this.connection.invoke(
              "Unsubscribe",
              params.exchange,
              params.symbol,
              params.fromCurrency,
              params.toCurrency
            ).then(function() {
              entry.meta.isSubscribed = false;
              entry.streamingActive = false;
              return true;
            }).catch(function(err) {
              entry.meta.isSubscribed = false;
              entry.streamingActive = false;
              self2.logger("GenericProvider: error invoking Unsubscribe", err);
              return false;
            });
          }
          fetchTicker(params) {
            return this.rawFetchTicker(params);
          }
          rawFetchTicker(params) {
            const exchange = params.exchange || "";
            const symbol = params.symbol || "";
            const fromCurrency = params.fromCurrency || "USD";
            const toCurrency = params.toCurrency || null;
            const base = (this.baseUrl || "").replace(/\/$/, "");
            const pathExchange = encodeURIComponent(exchange);
            const pathSymbol = encodeURIComponent(symbol);
            let url = base + "/api/Ticker/json/" + pathExchange + "/" + pathSymbol + "?fromCurrency=" + encodeURIComponent(fromCurrency);
            if (toCurrency !== null) {
              url += "&toCurrency=" + encodeURIComponent(toCurrency);
            }
            const self2 = this;
            const request = this.buildProxyRequestConfig(url);
            return fetch(request.url, request.options).then(function(response) {
              return response.json();
            }).then(function(json) {
              const ticker = self2.transformTickerResponse(json);
              ticker.connectionState = ConnectionStates.BACKUP;
              return ticker;
            }).catch(function(err) {
              self2.logger("GenericProvider: error fetching ticker", err);
              const key = self2.subscriptionManager.buildKey(exchange, symbol, fromCurrency, toCurrency);
              const cached = self2.subscriptionManager.getCachedTicker(key);
              if (cached) {
                cached.connectionState = cached.connectionState || ConnectionStates.BACKUP;
                return cached;
              }
              const fallback = self2.buildEmptyTicker(symbol);
              fallback.connectionState = ConnectionStates.BROKEN;
              return fallback;
            });
          }
          handleTickerMessage(message) {
            if (!message) {
              return;
            }
            const provider = message.provider || message["provider"];
            const symbol = message.symbol || message["symbol"];
            const fromCurrency = message.conversionFromCurrency || message["conversionFromCurrency"] || null;
            const toCurrency = message.conversionToCurrency || message["conversionToCurrency"] || null;
            const key = this.subscriptionManager.buildKey(provider, symbol, fromCurrency, toCurrency);
            const ticker = this.transformTickerResponse(message);
            const entry = this.subscriptionManager.getEntry(key);
            if (entry && entry.meta) {
              entry.meta.isSubscribed = true;
              entry.meta.pending = false;
              entry.streamingActive = true;
            }
            this.subscriptionManager.handleStreamingUpdate(key, ticker);
          }
          async fetchCandles(params) {
            const exchange = params.exchange;
            const symbol = params.symbol;
            const interval = params.interval;
            const limit = typeof params.limit === "number" && params.limit > 0 ? params.limit : 24;
            const base = this.baseUrl.replace(/\/$/, "");
            const url = base + "/api/Candles/json/" + encodeURIComponent(exchange) + "/" + encodeURIComponent(symbol) + "/" + interval + "?limit=" + limit;
            try {
              const request = this.buildProxyRequestConfig(url);
              const response = await fetch(request.url, request.options);
              if (!response || !response.ok) {
                throw new Error("GenericProvider: candles response not ok");
              }
              const json = await response.json();
              if (Array.isArray(json.candles)) {
                return json.candles;
              }
              return [];
            } catch (err) {
              this.logger("GenericProvider: error fetching candles", err);
              throw err;
            }
          }
          // Build fetch options that disable caching when targeting the tproxy backend.
          buildProxyRequestConfig(url, baseOptions) {
            if (!url || typeof url !== "string") {
              return {
                url,
                options: baseOptions
              };
            }
            const normalizedBase = this.normalizedBaseUrl;
            const normalizedUrl = url.replace(/\/$/, "");
            if (!normalizedBase || normalizedUrl.indexOf(normalizedBase) !== 0) {
              return {
                url,
                options: baseOptions
              };
            }
            const options = Object.assign({}, baseOptions || {});
            options.cache = "no-store";
            const headers = Object.assign({}, options.headers || {});
            headers["cache-control"] = "no-cache";
            headers["pragma"] = "no-cache";
            options.headers = headers;
            return {
              url: appendCacheBypassParam(url),
              options
            };
          }
          transformTickerResponse(responseJson) {
            const json = responseJson || {};
            return {
              changeDaily: json["dailyChange"] || 0,
              changeDailyPercent: json["dailyChangeRelative"] || 0,
              last: json["last"] || 0,
              volume: json["volume"] || 0,
              high: json["high24h"] || 0,
              low: json["low24h"] || 0,
              pair: json["symbol"] || json["pair"] || "",
              pairDisplay: json["symbolDisplay"] || json["symbol"] || json["pair"] || ""
            };
          }
          buildEmptyTicker(symbol) {
            const sym = symbol || "";
            return {
              changeDaily: 0,
              changeDailyPercent: 0,
              last: 0,
              volume: 0,
              high: 0,
              low: 0,
              pair: sym,
              pairDisplay: sym,
              connectionState: ConnectionStates.BROKEN
            };
          }
        }
        return {
          GenericProvider
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/default-settings.ts
  var require_default_settings = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/default-settings.ts"(exports, module) {
      "use strict";
      (function loadDefaults(root, factory) {
        const exports2 = factory();
        if (typeof module === "object" && module.exports) {
          module.exports = exports2;
        }
        if (root && typeof root === "object") {
          root.CryptoTickerDefaults = exports2;
        }
      })(typeof self !== "undefined" ? self : exports, function buildDefaults() {
        function clone(obj) {
          if (obj === null || typeof obj !== "object") {
            return obj;
          }
          if (Array.isArray(obj)) {
            return obj.map((item) => clone(item));
          }
          const copy = {};
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              copy[key] = clone(obj[key]);
            }
          }
          return copy;
        }
        function buildStringNormalizer(options) {
          const normalizeCase = options == null ? void 0 : options.case;
          const allowEmpty = (options == null ? void 0 : options.allowEmptyString) === true;
          const allowNull = (options == null ? void 0 : options.allowNull) === true;
          const trim = Object.prototype.hasOwnProperty.call(options || {}, "trim") ? !!(options == null ? void 0 : options.trim) : true;
          const allowedValues = Array.isArray(options == null ? void 0 : options.allowedValues) ? options == null ? void 0 : options.allowedValues : null;
          return function normalizeString(value) {
            if (value === void 0) {
              return null;
            }
            if (value === null) {
              return allowNull ? null : "";
            }
            let str = String(value);
            if (trim) {
              str = str.trim();
            }
            if (!str && !allowEmpty) {
              return null;
            }
            if (normalizeCase === "upper") {
              str = str.toUpperCase();
            } else if (normalizeCase === "lower") {
              str = str.toLowerCase();
            }
            if (allowedValues && allowedValues.length > 0) {
              const lookup = normalizeCase === "lower" ? str.toLowerCase() : normalizeCase === "upper" ? str.toUpperCase() : str;
              const matches = allowedValues.some((allowed) => {
                if (normalizeCase === "lower") {
                  return allowed.toLowerCase() === lookup;
                }
                if (normalizeCase === "upper") {
                  return allowed.toUpperCase() === lookup;
                }
                return allowed === lookup;
              });
              if (!matches) {
                return null;
              }
              if (normalizeCase === "lower" || normalizeCase === "upper") {
                return lookup;
              }
              return str;
            }
            return str;
          };
        }
        function buildNumberNormalizer(options) {
          const min = typeof (options == null ? void 0 : options.min) === "number" ? options.min : null;
          const max = typeof (options == null ? void 0 : options.max) === "number" ? options.max : null;
          const integer = (options == null ? void 0 : options.integer) === true;
          return function normalizeNumber(value) {
            if (value === void 0 || value === null || value === "") {
              return null;
            }
            let numeric = typeof value === "number" ? value : parseFloat(String(value));
            if (Number.isNaN(numeric)) {
              return null;
            }
            if (integer) {
              numeric = Math.round(numeric);
            }
            if (min !== null && numeric < min) {
              numeric = min;
            }
            if (max !== null && numeric > max) {
              numeric = max;
            }
            return numeric;
          };
        }
        const settingsSchema = {
          title: {
            type: "string",
            default: "",
            normalize: buildStringNormalizer({ allowEmptyString: true, allowNull: true, trim: true })
          },
          exchange: {
            type: "string",
            default: "BINANCE",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "upper" })
          },
          pair: {
            type: "string",
            default: "BTCUSD",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "upper" })
          },
          fromCurrency: {
            type: "string",
            default: "USD",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "upper" })
          },
          currency: {
            type: "string",
            default: "",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: true, case: "upper", allowNull: true })
          },
          candlesInterval: {
            type: "string",
            default: "1h",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false })
          },
          candlesDisplayed: {
            type: "number",
            default: 20,
            normalize: buildNumberNormalizer({ min: 5, max: 60, integer: true })
          },
          multiplier: {
            type: "number",
            default: 1,
            normalize: buildNumberNormalizer({ min: 0 })
          },
          digits: {
            type: "number",
            default: 2,
            normalize: buildNumberNormalizer({ min: 0, max: 10, integer: true })
          },
          highLowDigits: {
            type: "string",
            default: "",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: true })
          },
          font: {
            type: "string",
            default: "Lato,'Roboto Condensed',Helvetica,Calibri,sans-serif",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false })
          },
          fontSizeBase: {
            type: "number",
            default: 25,
            normalize: buildNumberNormalizer({ min: 1, max: 200, integer: true })
          },
          fontSizePrice: {
            type: "number",
            default: 35,
            normalize: buildNumberNormalizer({ min: 1, max: 200, integer: true })
          },
          fontSizeHighLow: {
            type: "string",
            default: "",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: true })
          },
          fontSizeChange: {
            type: "number",
            default: 19,
            normalize: buildNumberNormalizer({ min: 1, max: 200, integer: true })
          },
          priceFormat: {
            type: "string",
            default: "compact",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "lower" })
          },
          backgroundColor: {
            type: "string",
            default: "#000000",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false })
          },
          textColor: {
            type: "string",
            default: "#ffffff",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false })
          },
          displayHighLow: {
            type: "string",
            default: "on",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "lower", allowedValues: ["on", "off"] })
          },
          displayHighLowBar: {
            type: "string",
            default: "on",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "lower", allowedValues: ["on", "off"] })
          },
          displayDailyChange: {
            type: "string",
            default: "on",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "lower", allowedValues: ["on", "off"] })
          },
          displayConnectionStatusIcon: {
            type: "string",
            default: "OFF",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "upper", allowedValues: ["OFF", "TOP_RIGHT", "BOTTOM_LEFT"] })
          },
          alertRule: {
            type: "string",
            default: "",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: true })
          },
          backgroundColorRule: {
            type: "string",
            default: "",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: true })
          },
          textColorRule: {
            type: "string",
            default: "",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: true })
          },
          mode: {
            type: "string",
            default: "ticker",
            normalize: buildStringNormalizer({ trim: true, allowEmptyString: false, case: "lower", allowedValues: ["ticker", "candles"] })
          }
        };
        function coerceValue(schemaEntry, value, hasValue) {
          if (!schemaEntry || typeof schemaEntry !== "object") {
            return { value, error: null };
          }
          const normalizer = schemaEntry.normalize;
          const defaultValue = schemaEntry.default;
          if (typeof normalizer !== "function") {
            const resolved = value === void 0 ? clone(defaultValue) : value;
            return { value: resolved, error: null };
          }
          const normalized = normalizer(value);
          if (normalized === null || normalized === void 0) {
            const fallbackNormalized = normalizer(defaultValue);
            const fallback = fallbackNormalized === null || fallbackNormalized === void 0 ? clone(defaultValue) : fallbackNormalized;
            return {
              value: fallback,
              error: hasValue ? "Invalid " + schemaEntry.type : null
            };
          }
          return {
            value: normalized,
            error: null
          };
        }
        function validateSettings(input) {
          const provided = input && typeof input === "object" ? input : {};
          const normalized = {};
          const errors = [];
          for (const key in settingsSchema) {
            if (!Object.prototype.hasOwnProperty.call(settingsSchema, key)) {
              continue;
            }
            const schemaEntry = settingsSchema[key];
            const hasValue = Object.prototype.hasOwnProperty.call(provided, key);
            const rawValue = hasValue ? provided[key] : void 0;
            const result = coerceValue(schemaEntry, rawValue, hasValue);
            normalized[key] = result.value;
            if (result.error) {
              errors.push({ key, message: result.error });
            }
          }
          for (const extraKey in provided) {
            if (!Object.prototype.hasOwnProperty.call(settingsSchema, extraKey) && Object.prototype.hasOwnProperty.call(provided, extraKey)) {
              normalized[extraKey] = provided[extraKey];
            }
          }
          return {
            settings: normalized,
            errors
          };
        }
        function applyDefaults(partialSettings) {
          const result = validateSettings(partialSettings);
          return result.settings;
        }
        const defaultSettings = applyDefaults(null);
        return {
          settingsSchema,
          defaultSettings,
          getDefaultSettings: function() {
            return clone(defaultSettings);
          },
          validateSettings: function(settings) {
            const result = validateSettings(settings);
            return {
              settings: result.settings,
              errors: result.errors.slice(0)
            };
          },
          applyDefaults
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/providers/websocket-connection-pool.ts
  var require_websocket_connection_pool = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/providers/websocket-connection-pool.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        const globalRoot = typeof globalThis !== "undefined" ? globalThis : root;
        const exportsValue = factory();
        if (typeof module === "object" && module.exports) {
          module.exports = exportsValue;
        }
        if (globalRoot) {
          globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
          globalRoot.CryptoTickerProviders.WebSocketConnectionPool = exportsValue.WebSocketConnectionPool;
        }
      })(typeof self !== "undefined" ? self : exports, function() {
        function noop() {
        }
        function mergeMeta(target, updates) {
          if (!updates || typeof updates !== "object") {
            return target;
          }
          const keys = Object.keys(updates);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            target[key] = updates[key];
          }
          return target;
        }
        class WebSocketConnectionPool {
          constructor(options) {
            const opts = options || {};
            this.logger = typeof opts.logger === "function" ? opts.logger : noop;
            this.createWebSocket = typeof opts.createWebSocket === "function" ? opts.createWebSocket : null;
            this.subscribeHandler = typeof opts.subscribe === "function" ? opts.subscribe : null;
            this.unsubscribeHandler = typeof opts.unsubscribe === "function" ? opts.unsubscribe : null;
            this.handleMessageFn = typeof opts.handleMessage === "function" ? opts.handleMessage : null;
            this.onOpen = typeof opts.onOpen === "function" ? opts.onOpen : null;
            this.onError = typeof opts.onError === "function" ? opts.onError : null;
            this.onClose = typeof opts.onClose === "function" ? opts.onClose : null;
            this.reconnectDelayMs = typeof opts.reconnectDelayMs === "number" ? opts.reconnectDelayMs : 5e3;
            this.autoCloseDelayMs = typeof opts.autoCloseDelayMs === "number" ? opts.autoCloseDelayMs : 0;
            this.shouldResubscribeOnReconnect = opts.shouldResubscribeOnReconnect !== false;
            this.symbolEntries = {};
            this.ws = null;
            this.wsClosedByUser = false;
            this.reconnectTimer = null;
            this.closeTimer = null;
            this.isConnecting = false;
          }
          // Pool used by Binance/Bitfinex: multiplex symbols on one socket to stay under WebView limits.
          subscribe(symbol, subscriberOptions) {
            const normalizedSymbol = typeof symbol === "string" ? symbol : "";
            if (!normalizedSymbol) {
              this.logger("WebSocketConnectionPool: subscribe called without symbol");
              return null;
            }
            if (!this.createWebSocket) {
              this.logger("WebSocketConnectionPool: createWebSocket not configured");
              return null;
            }
            const subscriber = this.buildSubscriber(subscriberOptions);
            if (!subscriber.onData) {
              this.logger("WebSocketConnectionPool: subscriber missing onData handler for", normalizedSymbol);
              return null;
            }
            let entry = this.symbolEntries[normalizedSymbol];
            if (!entry) {
              entry = {
                symbol: normalizedSymbol,
                subscribers: [],
                subscribed: false,
                subscriptionRequested: false,
                meta: {}
              };
              this.symbolEntries[normalizedSymbol] = entry;
            }
            entry.subscribers.push(subscriber);
            this.clearCloseTimer();
            this.ensureConnection();
            if (this.isSocketOpen() && !entry.subscribed && !entry.subscriptionRequested) {
              this.requestSubscribe(entry);
            }
            const self2 = this;
            return {
              symbol: normalizedSymbol,
              unsubscribe: function() {
                self2.removeSubscriber(normalizedSymbol, subscriber);
              },
              updateMetadata: function(updates) {
                self2.updateSymbolMetadata(normalizedSymbol, updates);
              },
              getMetadata: function() {
                const target = self2.symbolEntries[normalizedSymbol];
                return target ? target.meta : null;
              }
            };
          }
          removeSubscriber(symbol, subscriber) {
            const entry = this.symbolEntries[symbol];
            if (!entry) {
              return;
            }
            const idx = entry.subscribers.indexOf(subscriber);
            if (idx >= 0) {
              entry.subscribers.splice(idx, 1);
            }
            if (entry.subscribers.length > 0) {
              return;
            }
            if (this.isSocketOpen() && this.unsubscribeHandler && (entry.subscribed || entry.subscriptionRequested)) {
              try {
                this.unsubscribeHandler(this.ws, symbol, entry.meta);
              } catch (err) {
                this.logger("WebSocketConnectionPool: unsubscribe handler error", err);
              }
            }
            delete this.symbolEntries[symbol];
            this.maybeCloseConnection();
          }
          ensureConnection() {
            if (this.ws || this.isConnecting) {
              return;
            }
            let ws = null;
            try {
              ws = this.createWebSocket();
            } catch (err) {
              this.logger("WebSocketConnectionPool: failed to create WebSocket", err);
              return;
            }
            if (!ws) {
              this.logger("WebSocketConnectionPool: createWebSocket returned falsy value");
              this.scheduleReconnect();
              return;
            }
            this.ws = ws;
            this.wsClosedByUser = false;
            this.isConnecting = true;
            this.attachSocketHandlers(ws);
          }
          attachSocketHandlers(ws) {
            const self2 = this;
            ws.onopen = function() {
              self2.isConnecting = false;
              if (self2.onOpen) {
                try {
                  self2.onOpen(self2.ws);
                } catch (err) {
                  self2.logger("WebSocketConnectionPool: onOpen handler error", err);
                }
              }
              self2.flushPendingSubscriptions();
            };
            ws.onmessage = function(event) {
              if (!self2.handleMessageFn) {
                return;
              }
              try {
                self2.handleMessageFn(event, self2.buildMessageHelpers());
              } catch (err) {
                self2.logger("WebSocketConnectionPool: handleMessage error", err);
              }
            };
            ws.onerror = function(err) {
              if (self2.onError) {
                try {
                  self2.onError(err);
                } catch (handlerErr) {
                  self2.logger("WebSocketConnectionPool: onError handler error", handlerErr);
                }
              }
            };
            ws.onclose = function(event) {
              self2.handleSocketClose(event);
            };
          }
          handleSocketClose(event) {
            if (this.onClose) {
              try {
                this.onClose(event);
              } catch (err) {
                this.logger("WebSocketConnectionPool: onClose handler error", err);
              }
            }
            const hadSubscribers = this.hasSubscribers();
            this.isConnecting = false;
            this.ws = null;
            if (!this.wsClosedByUser && hadSubscribers) {
              this.resetSubscriptionState();
              this.notifyAllDisconnected();
              this.scheduleReconnect();
              return;
            }
            this.wsClosedByUser = false;
            this.resetSubscriptionState();
          }
          resetSubscriptionState() {
            const symbols = Object.keys(this.symbolEntries);
            for (let i = 0; i < symbols.length; i++) {
              const entry = this.symbolEntries[symbols[i]];
              entry.subscribed = false;
              entry.subscriptionRequested = false;
            }
          }
          scheduleReconnect() {
            if (this.reconnectTimer || !this.hasSubscribers()) {
              return;
            }
            const self2 = this;
            this.reconnectTimer = setTimeout(function() {
              self2.reconnectTimer = null;
              if (!self2.hasSubscribers()) {
                return;
              }
              self2.ensureConnection();
            }, this.reconnectDelayMs);
          }
          clearReconnectTimer() {
            if (this.reconnectTimer) {
              clearTimeout(this.reconnectTimer);
              this.reconnectTimer = null;
            }
          }
          flushPendingSubscriptions() {
            const symbols = Object.keys(this.symbolEntries);
            for (let i = 0; i < symbols.length; i++) {
              const entry = this.symbolEntries[symbols[i]];
              if (!entry.subscribed && !entry.subscriptionRequested) {
                this.requestSubscribe(entry);
              }
            }
          }
          requestSubscribe(entry) {
            if (!entry || !this.isSocketOpen()) {
              return;
            }
            if (!this.subscribeHandler) {
              entry.subscribed = true;
              this.notifySubscribed(entry.symbol, null);
              return;
            }
            try {
              entry.subscriptionRequested = true;
              this.subscribeHandler(this.ws, entry.symbol, entry.meta);
            } catch (err) {
              entry.subscriptionRequested = false;
              this.logger("WebSocketConnectionPool: subscribe handler error", err);
              this.notifySubscribeError(entry.symbol, err);
            }
          }
          notifySubscribed(symbol, metaUpdates) {
            const entry = this.symbolEntries[symbol];
            if (!entry) {
              return;
            }
            if (entry.subscribed) {
              if (metaUpdates) {
                mergeMeta(entry.meta, metaUpdates);
              }
              return;
            }
            entry.subscribed = true;
            entry.subscriptionRequested = false;
            if (metaUpdates) {
              mergeMeta(entry.meta, metaUpdates);
            }
            const subscribers = entry.subscribers;
            for (let i = 0; i < subscribers.length; i++) {
              const subscriber = subscribers[i];
              if (subscriber.onSubscribed) {
                try {
                  subscriber.onSubscribed(subscriber.context);
                } catch (err) {
                  this.logger("WebSocketConnectionPool: onSubscribed handler error", err);
                }
              }
            }
          }
          notifySubscribeError(symbol, err) {
            const entry = this.symbolEntries[symbol];
            if (!entry) {
              return;
            }
            const subscribers = entry.subscribers;
            for (let i = 0; i < subscribers.length; i++) {
              const subscriber = subscribers[i];
              if (subscriber.onError) {
                try {
                  subscriber.onError(err, subscriber.context);
                } catch (handlerErr) {
                  this.logger("WebSocketConnectionPool: onError handler error", handlerErr);
                }
              }
            }
          }
          notifyAllDisconnected() {
            const symbols = Object.keys(this.symbolEntries);
            for (let i = 0; i < symbols.length; i++) {
              this.notifyDisconnected(symbols[i]);
            }
          }
          notifyDisconnected(symbol) {
            const entry = this.symbolEntries[symbol];
            if (!entry) {
              return;
            }
            const subscribers = entry.subscribers;
            for (let i = 0; i < subscribers.length; i++) {
              const subscriber = subscribers[i];
              if (subscriber.onDisconnected) {
                try {
                  subscriber.onDisconnected(subscriber.context);
                } catch (err) {
                  this.logger("WebSocketConnectionPool: onDisconnected handler error", err);
                }
              }
            }
          }
          // Notify each subscriber; keep context so provider metadata (chanId etc.) sticks around.
          dispatch(symbol, payload, rawMessage) {
            const entry = this.symbolEntries[symbol];
            if (!entry) {
              return;
            }
            const subscribers = entry.subscribers;
            for (let i = 0; i < subscribers.length; i++) {
              const subscriber = subscribers[i];
              if (!subscriber.onData) {
                continue;
              }
              try {
                subscriber.onData(payload, rawMessage, subscriber.context);
              } catch (err) {
                this.logger("WebSocketConnectionPool: subscriber onData error", err);
              }
            }
          }
          dispatchToAll(payload, rawMessage) {
            const symbols = Object.keys(this.symbolEntries);
            for (let i = 0; i < symbols.length; i++) {
              this.dispatch(symbols[i], payload, rawMessage);
            }
          }
          markSymbolSubscribed(symbol, metaUpdates) {
            this.notifySubscribed(symbol, metaUpdates);
          }
          markSymbolUnsubscribed(symbol) {
            const entry = this.symbolEntries[symbol];
            if (!entry) {
              return;
            }
            entry.subscribed = false;
            entry.subscriptionRequested = false;
          }
          updateSymbolMetadata(symbol, updates) {
            const entry = this.symbolEntries[symbol];
            if (!entry) {
              return;
            }
            mergeMeta(entry.meta, updates);
          }
          getSymbolMetadata(symbol) {
            const entry = this.symbolEntries[symbol];
            return entry ? entry.meta : null;
          }
          findSymbolByMeta(predicate) {
            if (typeof predicate !== "function") {
              return null;
            }
            const symbols = Object.keys(this.symbolEntries);
            for (let i = 0; i < symbols.length; i++) {
              const entry = this.symbolEntries[symbols[i]];
              if (predicate(entry.meta, entry.symbol)) {
                return entry.symbol;
              }
            }
            return null;
          }
          hasSubscribers() {
            const symbols = Object.keys(this.symbolEntries);
            for (let i = 0; i < symbols.length; i++) {
              if (this.symbolEntries[symbols[i]].subscribers.length > 0) {
                return true;
              }
            }
            return false;
          }
          maybeCloseConnection() {
            if (this.hasSubscribers()) {
              return;
            }
            if (this.autoCloseDelayMs > 0) {
              this.scheduleCloseTimer();
            } else {
              this.closeConnection();
            }
          }
          scheduleCloseTimer() {
            if (this.closeTimer) {
              return;
            }
            const self2 = this;
            this.closeTimer = setTimeout(function() {
              self2.closeTimer = null;
              if (!self2.hasSubscribers()) {
                self2.closeConnection();
              }
            }, this.autoCloseDelayMs);
          }
          clearCloseTimer() {
            if (this.closeTimer) {
              clearTimeout(this.closeTimer);
              this.closeTimer = null;
            }
          }
          closeConnection() {
            this.clearReconnectTimer();
            if (!this.ws) {
              return;
            }
            this.wsClosedByUser = true;
            try {
              this.ws.close();
            } catch (err) {
              this.logger("WebSocketConnectionPool: error closing WebSocket", err);
            }
            this.ws = null;
          }
          buildSubscriber(options) {
            const opts = options || {};
            return {
              context: opts.context || null,
              onData: typeof opts.onData === "function" ? opts.onData : null,
              onError: typeof opts.onError === "function" ? opts.onError : null,
              onSubscribed: typeof opts.onSubscribed === "function" ? opts.onSubscribed : null,
              onDisconnected: typeof opts.onDisconnected === "function" ? opts.onDisconnected : null
            };
          }
          buildMessageHelpers() {
            const self2 = this;
            return {
              dispatch: function(symbol, payload, rawMessage) {
                self2.dispatch(symbol, payload, rawMessage);
              },
              dispatchToAll: function(payload, rawMessage) {
                self2.dispatchToAll(payload, rawMessage);
              },
              markSubscribed: function(symbol, metaUpdates) {
                self2.markSymbolSubscribed(symbol, metaUpdates);
              },
              markUnsubscribed: function(symbol) {
                self2.markSymbolUnsubscribed(symbol);
              },
              updateMetadata: function(symbol, updates) {
                self2.updateSymbolMetadata(symbol, updates);
              },
              getMetadata: function(symbol) {
                return self2.getSymbolMetadata(symbol);
              },
              findSymbol: function(predicate) {
                return self2.findSymbolByMeta(predicate);
              },
              getActiveSymbols: function() {
                return Object.keys(self2.symbolEntries);
              }
            };
          }
          isSocketOpen() {
            return this.ws && this.ws.readyState === 1;
          }
        }
        return {
          WebSocketConnectionPool
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/providers/binance-provider.ts
  var require_binance_provider = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/providers/binance-provider.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        const globalRoot = typeof globalThis !== "undefined" ? globalThis : root;
        const args = typeof module === "object" && module.exports ? [
          require_provider_interface(),
          require_generic_provider(),
          require_ticker_subscription_manager(),
          require_connection_states(),
          require_websocket_connection_pool()
        ] : [
          root == null ? void 0 : root.CryptoTickerProviders,
          root == null ? void 0 : root.CryptoTickerProviders,
          root == null ? void 0 : root.CryptoTickerProviders,
          root == null ? void 0 : root.CryptoTickerConnectionStates,
          root == null ? void 0 : root.CryptoTickerProviders
        ];
        const exportsValue = factory(
          args[0],
          args[1],
          args[2],
          args[3],
          args[4]
        );
        if (typeof module === "object" && module.exports) {
          module.exports = exportsValue;
        }
        if (globalRoot) {
          globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
          globalRoot.CryptoTickerProviders.BinanceProvider = exportsValue.BinanceProvider;
        }
      })(typeof self !== "undefined" ? self : exports, function(providerInterfaceModule, genericModule, managerModule, connectionStatesModule, poolModule) {
        const ProviderInterface = providerInterfaceModule.ProviderInterface || providerInterfaceModule;
        const GenericProvider = genericModule.GenericProvider || genericModule;
        const TickerSubscriptionManager = managerModule.TickerSubscriptionManager || managerModule;
        const ConnectionStates = connectionStatesModule || {
          LIVE: "live",
          DETACHED: "detached",
          BACKUP: "backup",
          BROKEN: "broken"
        };
        const WebSocketConnectionPool = poolModule.WebSocketConnectionPool || poolModule;
        const DEFAULT_WS_RECONNECT_DELAY_MS = 5e3;
        function getWebSocketConstructor() {
          if (typeof WebSocket !== "undefined") {
            return WebSocket;
          }
          if (typeof window !== "undefined" && window.WebSocket) {
            return window.WebSocket;
          }
          if (typeof global !== "undefined" && global.WebSocket) {
            return global.WebSocket;
          }
          return null;
        }
        function toNumber(value) {
          const parsed = parseFloat(value);
          if (isNaN(parsed)) {
            return 0;
          }
          return parsed;
        }
        function toPercent(value) {
          return toNumber(value) / 100;
        }
        function mapIntervalToBinance(interval) {
          switch (interval) {
            case "MINUTES_1":
              return "1m";
            case "MINUTES_5":
              return "5m";
            case "MINUTES_15":
              return "15m";
            case "HOURS_1":
              return "1h";
            case "HOURS_6":
              return "6h";
            case "HOURS_12":
              return "12h";
            case "DAYS_1":
              return "1d";
            case "DAYS_7":
              return "1w";
            case "MONTHS_1":
              return "1M";
          }
          return null;
        }
        class BinanceProvider extends ProviderInterface {
          constructor(options) {
            super(options);
            const opts = options || {};
            this.genericFallback = opts.genericFallback instanceof GenericProvider ? opts.genericFallback : new GenericProvider(options);
            this.restBaseUrl = typeof opts.binanceRestBaseUrl === "string" && opts.binanceRestBaseUrl.length > 0 ? opts.binanceRestBaseUrl : "https://api.binance.com";
            this.wsBaseUrl = typeof opts.binanceWsBaseUrl === "string" && opts.binanceWsBaseUrl.length > 0 ? opts.binanceWsBaseUrl : "wss://stream.binance.com:9443/ws";
            this.symbolOverrides = opts.binanceSymbolOverrides || {};
            this.wsReconnectDelayMs = typeof opts.retryDelayMs === "number" ? opts.retryDelayMs : DEFAULT_WS_RECONNECT_DELAY_MS;
            const managerOptions = {
              logger: (...args) => {
                this.logger(...args);
              },
              fetchTicker: this.fetchTickerDirect.bind(this),
              subscribeStreaming: this.subscribeStream.bind(this),
              unsubscribeStreaming: this.unsubscribeStream.bind(this),
              fallbackPollIntervalMs: opts.fallbackPollIntervalMs,
              staleTickerTimeoutMs: opts.staleTickerTimeoutMs
            };
            this.subscriptionManager = new TickerSubscriptionManager(managerOptions);
            this.wsRequestId = 0;
            this.webSocketPool = new WebSocketConnectionPool({
              logger: (...args) => {
                this.logger(...args);
              },
              reconnectDelayMs: this.wsReconnectDelayMs,
              createWebSocket: () => {
                const WebSocketCtor = getWebSocketConstructor();
                if (!WebSocketCtor) {
                  this.logger("BinanceProvider: WebSocket not available in this environment");
                  return null;
                }
                const url = this.wsBaseUrl.replace(/\/$/, "");
                try {
                  return new WebSocketCtor(url);
                } catch (err) {
                  this.logger("BinanceProvider: error creating pooled WebSocket", err);
                  return null;
                }
              },
              subscribe: (ws, symbol) => {
                this.sendBinanceSubscription(ws, symbol, true);
              },
              unsubscribe: (ws, symbol) => {
                this.sendBinanceSubscription(ws, symbol, false);
              },
              handleMessage: (event, helpers) => {
                this.handlePoolMessage(event, helpers);
              },
              onError: (err) => {
                this.logger("BinanceProvider: pooled WebSocket error", err);
              },
              onClose: () => {
                this.wsRequestId = 0;
              }
            });
          }
          getId() {
            return "BINANCE";
          }
          subscribeTicker(params, handlers) {
            return this.subscriptionManager.subscribe(params, handlers);
          }
          getCachedTicker(key) {
            const cached = this.subscriptionManager.getCachedTicker(key);
            if (cached) {
              return cached;
            }
            if (this.genericFallback && typeof this.genericFallback.getCachedTicker === "function") {
              return this.genericFallback.getCachedTicker(key);
            }
            return null;
          }
          ensureConnection() {
            const self2 = this;
            this.subscriptionManager.forEachEntry(function(entry) {
              self2.subscriptionManager.ensureStreaming(entry);
            });
          }
          async fetchTicker(params) {
            try {
              return await this.fetchTickerDirect(params);
            } catch (err) {
              this.logger("BinanceProvider: direct fetch failed, using fallback", err);
              if (this.genericFallback && typeof this.genericFallback.fetchTicker === "function") {
                return this.genericFallback.fetchTicker(params);
              }
              throw err;
            }
          }
          async fetchTickerDirect(params) {
            const symbol = this.resolveSymbol(params);
            if (!symbol) {
              throw new Error("BinanceProvider: unable to resolve symbol for " + (params.symbol || ""));
            }
            const url = this.buildRestUrl(symbol);
            try {
              const response = await fetch(url);
              if (!response || !response.ok) {
                throw new Error("BinanceProvider: REST response not ok for " + symbol);
              }
              const json = await response.json();
              const ticker = this.transformRestTicker(json, params, symbol);
              ticker.connectionState = ConnectionStates.DETACHED;
              return ticker;
            } catch (err) {
              this.logger("BinanceProvider: REST fetch error", err);
              if (this.genericFallback && typeof this.genericFallback.fetchTicker === "function") {
                const fallbackTicker = await this.genericFallback.fetchTicker(params);
                if (fallbackTicker && typeof fallbackTicker === "object" && !fallbackTicker.connectionState) {
                  fallbackTicker.connectionState = ConnectionStates.BACKUP;
                }
                return fallbackTicker;
              }
              throw err;
            }
          }
          subscribeStream(entry) {
            if (!entry) {
              return false;
            }
            const meta = this.ensureEntryMeta(entry);
            meta.binanceSymbol = this.resolveSymbol(entry.params);
            if (!meta.binanceSymbol) {
              this.logger("BinanceProvider: cannot subscribe, unresolved symbol", entry.params);
              return false;
            }
            const subscriptionHandle = this.webSocketPool.subscribe(meta.binanceSymbol, {
              context: entry,
              onData: (payload) => {
                const ticker = this.transformStreamTicker(payload, entry, meta.binanceSymbol);
                this.subscriptionManager.handleStreamingUpdate(entry.key, ticker);
              },
              onSubscribed: () => {
                entry.streamingActive = true;
              },
              onDisconnected: () => {
                entry.streamingActive = false;
              },
              onError: (err) => {
                this.logger("BinanceProvider: subscription error", err);
              }
            });
            if (!subscriptionHandle) {
              entry.streamingActive = false;
              return false;
            }
            meta.poolSubscription = subscriptionHandle;
            entry.streamingActive = true;
            return true;
          }
          unsubscribeStream(entry) {
            if (!entry) {
              return true;
            }
            const meta = this.ensureEntryMeta(entry);
            if (meta.poolSubscription && typeof meta.poolSubscription.unsubscribe === "function") {
              meta.poolSubscription.unsubscribe();
            }
            meta.poolSubscription = null;
            entry.streamingActive = false;
            return true;
          }
          // Binance tickers usually end with USDT; remap PI-friendly USD symbols to live endpoints.
          resolveSymbol(params) {
            if (!params) {
              return null;
            }
            const original = (params.symbol || "").toUpperCase();
            if (!original) {
              return null;
            }
            if (this.symbolOverrides && this.symbolOverrides[original]) {
              return (this.symbolOverrides[original] || "").toUpperCase();
            }
            if (original.endsWith("USD")) {
              return original.slice(0, -3) + "USDT";
            }
            return original;
          }
          buildRestUrl(symbol) {
            const base = this.restBaseUrl.replace(/\/$/, "");
            return base + "/api/v3/ticker/24hr?symbol=" + encodeURIComponent(symbol);
          }
          sendBinanceSubscription(ws, symbol, subscribe) {
            if (!ws || !symbol) {
              return;
            }
            const streamName = symbol.toLowerCase() + "@ticker";
            const payload = {
              method: subscribe ? "SUBSCRIBE" : "UNSUBSCRIBE",
              params: [streamName],
              id: this.nextWsRequestId()
            };
            try {
              ws.send(JSON.stringify(payload));
            } catch (err) {
              this.logger("BinanceProvider: error sending subscription message", err);
            }
          }
          nextWsRequestId() {
            this.wsRequestId += 1;
            if (this.wsRequestId > 1e6) {
              this.wsRequestId = 1;
            }
            return this.wsRequestId;
          }
          handlePoolMessage(event, helpers) {
            if (!event) {
              return;
            }
            let message = event.data;
            if (!message) {
              return;
            }
            if (typeof message === "string") {
              try {
                message = JSON.parse(message);
              } catch (err) {
                this.logger("BinanceProvider: failed to parse WebSocket message", err);
                return;
              }
            }
            if (!message) {
              return;
            }
            if (Array.isArray(message)) {
              return;
            }
            if (message.error) {
              this.logger("BinanceProvider: WebSocket error message", message.error);
              return;
            }
            if (typeof message.result !== "undefined") {
              return;
            }
            let payload = message;
            if (message.data && typeof message.data === "object") {
              payload = message.data;
            }
            if (!payload || typeof payload !== "object") {
              return;
            }
            const symbol = (payload.s || payload.symbol || "").toUpperCase();
            if (!symbol) {
              return;
            }
            helpers.markSubscribed(symbol);
            helpers.dispatch(symbol, payload, message);
          }
          transformRestTicker(json, params, resolvedSymbol) {
            const pair = params && params.symbol ? params.symbol : resolvedSymbol;
            return {
              changeDaily: toNumber(json["priceChange"]),
              changeDailyPercent: toPercent(json["priceChangePercent"]),
              last: toNumber(json["lastPrice"]),
              volume: toNumber(json["volume"]),
              high: toNumber(json["highPrice"]),
              low: toNumber(json["lowPrice"]),
              pair,
              pairDisplay: pair
            };
          }
          transformStreamTicker(json, entry, resolvedSymbol) {
            const params = entry ? entry.params : null;
            const pair = params && params.symbol ? params.symbol : resolvedSymbol;
            return {
              changeDaily: toNumber(json["p"] || json["priceChange"]),
              changeDailyPercent: toPercent(json["P"] || json["priceChangePercent"]),
              last: toNumber(json["c"] || json["lastPrice"]),
              volume: toNumber(json["v"] || json["volume"]),
              high: toNumber(json["h"] || json["highPrice"]),
              low: toNumber(json["l"] || json["lowPrice"]),
              pair,
              pairDisplay: pair
            };
          }
          ensureEntryMeta(entry) {
            entry.meta = entry.meta || {};
            return entry.meta;
          }
          async fetchCandles(params) {
            const symbol = this.resolveSymbol(params);
            if (!symbol) {
              throw new Error("BinanceProvider: unable to resolve symbol for candles");
            }
            const interval = mapIntervalToBinance(params.interval);
            if (!interval) {
              throw new Error("BinanceProvider: unsupported interval " + params.interval);
            }
            const limit = Math.min(Math.max(parseInt(params.limit, 10) || 24, 1), 1e3);
            const base = this.restBaseUrl.replace(/\/$/, "");
            const url = base + "/api/v3/klines?symbol=" + encodeURIComponent(symbol) + "&interval=" + encodeURIComponent(interval) + "&limit=" + limit;
            try {
              const response = await fetch(url);
              if (!response || !response.ok) {
                throw new Error("BinanceProvider: candles response not ok");
              }
              const json = await response.json();
              if (!Array.isArray(json)) {
                throw new Error("BinanceProvider: unexpected candles payload");
              }
              return json.map(function(item) {
                return {
                  ts: Math.floor((item[0] || 0) / 1e3),
                  open: toNumber(item[1]),
                  high: toNumber(item[2]),
                  low: toNumber(item[3]),
                  close: toNumber(item[4]),
                  volume: toNumber(item[5]),
                  volumeQuote: toNumber(item[7])
                };
              });
            } catch (err) {
              this.logger("BinanceProvider: error fetching candles", err);
              if (this.genericFallback && typeof this.genericFallback.fetchCandles === "function") {
                return this.genericFallback.fetchCandles(params);
              }
              throw err;
            }
          }
        }
        return {
          BinanceProvider
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/providers/bitfinex-provider.ts
  var require_bitfinex_provider = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/providers/bitfinex-provider.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        const globalRoot = typeof globalThis !== "undefined" ? globalThis : root;
        const args = typeof module === "object" && module.exports ? [
          require_provider_interface(),
          require_generic_provider(),
          require_ticker_subscription_manager(),
          require_connection_states(),
          require_websocket_connection_pool()
        ] : [
          root == null ? void 0 : root.CryptoTickerProviders,
          root == null ? void 0 : root.CryptoTickerProviders,
          root == null ? void 0 : root.CryptoTickerProviders,
          root == null ? void 0 : root.CryptoTickerConnectionStates,
          root == null ? void 0 : root.CryptoTickerProviders
        ];
        const exportsValue = factory(
          args[0],
          args[1],
          args[2],
          args[3],
          args[4]
        );
        if (typeof module === "object" && module.exports) {
          module.exports = exportsValue;
        }
        if (globalRoot) {
          globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
          globalRoot.CryptoTickerProviders.BitfinexProvider = exportsValue.BitfinexProvider;
        }
      })(typeof self !== "undefined" ? self : exports, function(providerInterfaceModule, genericModule, managerModule, connectionStatesModule, poolModule) {
        const ProviderInterface = providerInterfaceModule.ProviderInterface || providerInterfaceModule;
        const GenericProvider = genericModule.GenericProvider || genericModule;
        const TickerSubscriptionManager = managerModule.TickerSubscriptionManager || managerModule;
        const ConnectionStates = connectionStatesModule || {
          LIVE: "live",
          DETACHED: "detached",
          BACKUP: "backup",
          BROKEN: "broken"
        };
        const WebSocketConnectionPool = poolModule.WebSocketConnectionPool || poolModule;
        const DEFAULT_WS_RECONNECT_DELAY_MS = 5e3;
        function getWebSocketConstructor() {
          if (typeof WebSocket !== "undefined") {
            return WebSocket;
          }
          if (typeof window !== "undefined" && window.WebSocket) {
            return window.WebSocket;
          }
          if (typeof global !== "undefined" && global.WebSocket) {
            return global.WebSocket;
          }
          return null;
        }
        function toNumber(val) {
          const parsed = parseFloat(val);
          if (isNaN(parsed)) {
            return 0;
          }
          return parsed;
        }
        function mapIntervalToBitfinex(interval) {
          switch (interval) {
            case "MINUTES_1":
              return "1m";
            case "MINUTES_5":
              return "5m";
            case "MINUTES_15":
              return "15m";
            case "HOURS_1":
              return "1h";
            case "HOURS_6":
              return "6h";
            case "HOURS_12":
              return "12h";
            case "DAYS_1":
              return "1D";
            case "DAYS_7":
              return "1W";
            case "MONTHS_1":
              return "1M";
          }
          return null;
        }
        class BitfinexProvider extends ProviderInterface {
          constructor(options) {
            super(options);
            const opts = options || {};
            this.genericFallback = opts.genericFallback instanceof GenericProvider ? opts.genericFallback : new GenericProvider(options);
            this.restBaseUrl = typeof opts.bitfinexRestBaseUrl === "string" && opts.bitfinexRestBaseUrl.length > 0 ? opts.bitfinexRestBaseUrl : "https://api-pub.bitfinex.com";
            this.wsBaseUrl = typeof opts.bitfinexWsBaseUrl === "string" && opts.bitfinexWsBaseUrl.length > 0 ? opts.bitfinexWsBaseUrl : "wss://api-pub.bitfinex.com/ws/2";
            this.symbolOverrides = opts.bitfinexSymbolOverrides || {};
            this.wsReconnectDelayMs = typeof opts.retryDelayMs === "number" ? opts.retryDelayMs : DEFAULT_WS_RECONNECT_DELAY_MS;
            const managerOptions = {
              logger: (...args) => {
                this.logger(...args);
              },
              fetchTicker: this.fetchTickerDirect.bind(this),
              subscribeStreaming: this.subscribeStream.bind(this),
              unsubscribeStreaming: this.unsubscribeStream.bind(this),
              fallbackPollIntervalMs: opts.fallbackPollIntervalMs,
              staleTickerTimeoutMs: opts.staleTickerTimeoutMs
            };
            this.subscriptionManager = new TickerSubscriptionManager(managerOptions);
            this.channelIdToSymbol = {};
            this.webSocketPool = new WebSocketConnectionPool({
              logger: (...args) => {
                this.logger(...args);
              },
              reconnectDelayMs: this.wsReconnectDelayMs,
              createWebSocket: () => {
                const WebSocketCtor = getWebSocketConstructor();
                if (!WebSocketCtor) {
                  this.logger("BitfinexProvider: WebSocket not available in this environment");
                  return null;
                }
                const url = this.wsBaseUrl.replace(/\/$/, "");
                try {
                  return new WebSocketCtor(url);
                } catch (err) {
                  this.logger("BitfinexProvider: error creating pooled WebSocket", err);
                  return null;
                }
              },
              subscribe: (ws, symbol) => {
                this.sendBitfinexSubscribe(ws, symbol);
              },
              unsubscribe: (ws, symbol, meta) => {
                this.sendBitfinexUnsubscribe(ws, symbol, meta);
              },
              handleMessage: (event, helpers) => {
                this.handlePoolMessage(event, helpers);
              },
              onError: (err) => {
                this.logger("BitfinexProvider: pooled WebSocket error", err);
              },
              onClose: () => {
                this.channelIdToSymbol = {};
              }
            });
          }
          getId() {
            return "BITFINEX";
          }
          subscribeTicker(params, handlers) {
            return this.subscriptionManager.subscribe(params, handlers);
          }
          getCachedTicker(key) {
            const cached = this.subscriptionManager.getCachedTicker(key);
            if (cached) {
              return cached;
            }
            if (this.genericFallback && typeof this.genericFallback.getCachedTicker === "function") {
              return this.genericFallback.getCachedTicker(key);
            }
            return null;
          }
          ensureConnection() {
            const self2 = this;
            this.subscriptionManager.forEachEntry(function(entry) {
              self2.subscriptionManager.ensureStreaming(entry);
            });
          }
          async fetchTicker(params) {
            try {
              return await this.fetchTickerDirect(params);
            } catch (err) {
              this.logger("BitfinexProvider: direct fetch failed, using fallback", err);
              if (this.genericFallback && typeof this.genericFallback.fetchTicker === "function") {
                return this.genericFallback.fetchTicker(params);
              }
              throw err;
            }
          }
          async fetchTickerDirect(params) {
            const symbol = this.resolveSymbol(params);
            if (!symbol) {
              throw new Error("BitfinexProvider: unable to resolve symbol for " + (params.symbol || ""));
            }
            const url = this.buildRestUrl(symbol);
            try {
              const response = await fetch(url);
              if (!response || !response.ok) {
                throw new Error("BitfinexProvider: REST response not ok for " + symbol);
              }
              const json = await response.json();
              const ticker = this.transformRestTicker(json, params, symbol);
              ticker.connectionState = ConnectionStates.DETACHED;
              return ticker;
            } catch (err) {
              this.logger("BitfinexProvider: REST fetch error", err);
              if (this.genericFallback && typeof this.genericFallback.fetchTicker === "function") {
                const fallbackTicker = await this.genericFallback.fetchTicker(params);
                if (fallbackTicker && typeof fallbackTicker === "object" && !fallbackTicker.connectionState) {
                  fallbackTicker.connectionState = ConnectionStates.BACKUP;
                }
                return fallbackTicker;
              }
              throw err;
            }
          }
          subscribeStream(entry) {
            if (!entry) {
              return false;
            }
            const meta = this.ensureEntryMeta(entry);
            meta.bitfinexSymbol = this.resolveSymbol(entry.params);
            if (!meta.bitfinexSymbol) {
              this.logger("BitfinexProvider: cannot subscribe, unresolved symbol", entry.params);
              return false;
            }
            meta.chanId = null;
            const subscriptionHandle = this.webSocketPool.subscribe(meta.bitfinexSymbol, {
              context: entry,
              onData: (payload) => {
                const ticker = this.buildTickerFromArray(payload, entry);
                if (ticker) {
                  this.subscriptionManager.handleStreamingUpdate(entry.key, ticker);
                }
              },
              onSubscribed: () => {
                entry.streamingActive = true;
                const poolMeta = subscriptionHandle.getMetadata ? subscriptionHandle.getMetadata() : null;
                if (poolMeta && poolMeta.chanId) {
                  meta.chanId = poolMeta.chanId;
                  this.channelIdToSymbol[meta.chanId] = meta.bitfinexSymbol;
                }
              },
              onDisconnected: () => {
                entry.streamingActive = false;
                meta.chanId = null;
              },
              onError: (err) => {
                this.logger("BitfinexProvider: subscription error", err);
              }
            });
            if (!subscriptionHandle) {
              entry.streamingActive = false;
              return false;
            }
            meta.poolSubscription = subscriptionHandle;
            entry.streamingActive = true;
            return true;
          }
          unsubscribeStream(entry) {
            if (!entry) {
              return true;
            }
            const meta = this.ensureEntryMeta(entry);
            if (meta.poolSubscription && typeof meta.poolSubscription.unsubscribe === "function") {
              meta.poolSubscription.unsubscribe();
            }
            meta.poolSubscription = null;
            meta.chanId = null;
            entry.streamingActive = false;
            return true;
          }
          resolveSymbol(params) {
            if (!params) {
              return null;
            }
            const original = (params.symbol || "").toUpperCase();
            if (!original) {
              return null;
            }
            if (this.symbolOverrides && this.symbolOverrides[original]) {
              return (this.symbolOverrides[original] || "").toUpperCase();
            }
            const sanitized = original.replace(/[:/]/g, "");
            if (!sanitized) {
              return null;
            }
            const upper = sanitized.toUpperCase();
            const withoutLeadingT = upper.startsWith("T") ? upper.substring(1) : upper;
            return "t" + withoutLeadingT;
          }
          buildRestUrl(symbol) {
            const base = this.restBaseUrl.replace(/\/$/, "");
            return base + "/v2/ticker/" + encodeURIComponent(symbol);
          }
          sendBitfinexSubscribe(ws, symbol) {
            if (!ws || !symbol) {
              return;
            }
            const payload = {
              event: "subscribe",
              channel: "ticker",
              symbol
            };
            try {
              ws.send(JSON.stringify(payload));
            } catch (err) {
              this.logger("BitfinexProvider: error sending subscribe", err);
            }
          }
          sendBitfinexUnsubscribe(ws, symbol, meta) {
            if (!ws) {
              return;
            }
            const chanId = meta && meta.chanId;
            if (!chanId) {
              return;
            }
            try {
              ws.send(JSON.stringify({
                event: "unsubscribe",
                chanId
              }));
            } catch (err) {
              this.logger("BitfinexProvider: error sending unsubscribe", err);
            }
          }
          handlePoolMessage(event, helpers) {
            if (!event) {
              return;
            }
            let message = event.data;
            if (!message) {
              return;
            }
            if (typeof message === "string") {
              try {
                message = JSON.parse(message);
              } catch (err) {
                this.logger("BitfinexProvider: failed to parse WebSocket message", err);
                return;
              }
            }
            if (!message) {
              return;
            }
            if (Array.isArray(message)) {
              this.handleBitfinexDataArray(message, helpers);
              return;
            }
            if (message && typeof message === "object") {
              this.handleBitfinexEvent(message, helpers);
            }
          }
          handleBitfinexEvent(eventObj, helpers) {
            if (!eventObj || typeof eventObj !== "object") {
              return;
            }
            const eventType = eventObj.event;
            if (eventType === "subscribed" && eventObj.channel === "ticker") {
              const symbol = typeof eventObj.symbol === "string" ? eventObj.symbol : "";
              if (!symbol) {
                return;
              }
              const chanId = eventObj.chanId;
              if (chanId) {
                this.channelIdToSymbol[chanId] = symbol;
              }
              helpers.markSubscribed(symbol, {
                chanId: chanId || null
              });
              return;
            }
            if (eventType === "unsubscribed") {
              const chanId = eventObj.chanId;
              let symbol = null;
              if (chanId) {
                symbol = this.channelIdToSymbol[chanId] || helpers.findSymbol(function(meta) {
                  return meta && meta.chanId === chanId;
                });
                delete this.channelIdToSymbol[chanId];
              }
              if (symbol) {
                helpers.markUnsubscribed(symbol);
                helpers.updateMetadata(symbol, { chanId: null });
              }
              return;
            }
            if (eventType === "error") {
              this.logger("BitfinexProvider: subscription error", eventObj);
            }
          }
          handleBitfinexDataArray(arr, helpers) {
            if (!Array.isArray(arr) || arr.length < 2) {
              return;
            }
            const chanId = arr[0];
            const data = arr[1];
            if (data === "hb") {
              return;
            }
            if (!Array.isArray(data)) {
              return;
            }
            const symbol = this.channelIdToSymbol[chanId] || helpers.findSymbol(function(meta) {
              return meta && meta.chanId === chanId;
            });
            if (!symbol) {
              return;
            }
            helpers.dispatch(symbol, data, arr);
          }
          buildTickerFromArray(data, entry) {
            if (!Array.isArray(data)) {
              return null;
            }
            const params = entry ? entry.params : null;
            const pair = params && params.symbol ? params.symbol : this.ensureEntryMeta(entry).bitfinexSymbol;
            return {
              changeDaily: toNumber(data[4]),
              changeDailyPercent: toNumber(data[5]),
              last: toNumber(data[6]),
              volume: toNumber(data[7]),
              high: toNumber(data[8]),
              low: toNumber(data[9]),
              pair,
              pairDisplay: pair
            };
          }
          transformRestTicker(json, params, resolvedSymbol) {
            if (!Array.isArray(json)) {
              throw new Error("BitfinexProvider: unexpected REST payload for " + resolvedSymbol);
            }
            const pair = params && params.symbol ? params.symbol : resolvedSymbol;
            return {
              changeDaily: toNumber(json[4]),
              changeDailyPercent: toNumber(json[5]),
              last: toNumber(json[6]),
              volume: toNumber(json[7]),
              high: toNumber(json[8]),
              low: toNumber(json[9]),
              pair,
              pairDisplay: pair
            };
          }
          ensureEntryMeta(entry) {
            entry.meta = entry.meta || {};
            return entry.meta;
          }
          async fetchCandles(params) {
            const symbol = this.resolveSymbol(params);
            if (!symbol) {
              throw new Error("BitfinexProvider: unable to resolve symbol for candles");
            }
            const interval = mapIntervalToBitfinex(params.interval);
            if (!interval) {
              throw new Error("BitfinexProvider: unsupported interval " + params.interval);
            }
            const limit = Math.min(Math.max(parseInt(params.limit, 10) || 24, 1), 1e3);
            const base = this.restBaseUrl.replace(/\/$/, "");
            const url = base + "/v2/candles/trade:" + interval + ":" + encodeURIComponent(symbol) + "/hist?limit=" + limit;
            try {
              const response = await fetch(url);
              if (!response || !response.ok) {
                throw new Error("BitfinexProvider: candles response not ok");
              }
              const json = await response.json();
              if (!Array.isArray(json)) {
                throw new Error("BitfinexProvider: unexpected candles payload");
              }
              return json.map(function(item) {
                return {
                  ts: Math.floor((item[0] || 0) / 1e3),
                  open: toNumber(item[1]),
                  close: toNumber(item[2]),
                  high: toNumber(item[3]),
                  low: toNumber(item[4]),
                  volume: toNumber(item[5]),
                  volumeQuote: toNumber(item[5])
                };
              });
            } catch (err) {
              this.logger("BitfinexProvider: error fetching candles", err);
              if (this.genericFallback && typeof this.genericFallback.fetchCandles === "function") {
                return this.genericFallback.fetchCandles(params);
              }
              throw err;
            }
          }
        }
        return {
          BitfinexProvider
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/providers/yfinance-provider.ts
  var require_yfinance_provider = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/providers/yfinance-provider.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        const globalRoot = typeof globalThis !== "undefined" ? globalThis : root;
        const args = typeof module === "object" && module.exports ? [
          require_provider_interface(),
          require_generic_provider(),
          require_ticker_subscription_manager(),
          require_subscription_key()
        ] : [
          root == null ? void 0 : root.CryptoTickerProviders,
          root == null ? void 0 : root.CryptoTickerProviders,
          root == null ? void 0 : root.CryptoTickerProviders,
          root == null ? void 0 : root.CryptoTickerProviders
        ];
        const exportsValue = factory(
          args[0],
          args[1],
          args[2],
          args[3]
        );
        if (typeof module === "object" && module.exports) {
          module.exports = exportsValue;
        }
        if (globalRoot) {
          globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
          globalRoot.CryptoTickerProviders.YFinanceProvider = exportsValue.YFinanceProvider;
        }
      })(typeof self !== "undefined" ? self : exports, function(providerInterfaceModule, genericModule, managerModule, subscriptionKeyModule) {
        const ProviderInterface = providerInterfaceModule.ProviderInterface || providerInterfaceModule;
        const GenericProvider = genericModule.GenericProvider || genericModule;
        const TickerSubscriptionManager = managerModule.TickerSubscriptionManager || managerModule;
        const buildSubscriptionKey = subscriptionKeyModule.buildSubscriptionKey || subscriptionKeyModule;
        class YFinanceProvider extends ProviderInterface {
          constructor(options) {
            super(options);
            const opts = options || {};
            this.genericFallback = opts.genericFallback instanceof GenericProvider ? opts.genericFallback : new GenericProvider(options);
            const managerOptions = {
              logger: (...args) => {
                this.logger(...args);
              },
              fetchTicker: (params) => this.genericFallback.fetchTicker(params),
              subscribeStreaming: null,
              unsubscribeStreaming: null,
              ensureConnection: null,
              buildSubscriptionKey: function(exchange, symbol, fromCurrency, toCurrency) {
                return buildSubscriptionKey(exchange, symbol, fromCurrency, toCurrency);
              },
              fallbackPollIntervalMs: opts.fallbackPollIntervalMs,
              staleTickerTimeoutMs: opts.staleTickerTimeoutMs
            };
            this.subscriptionManager = new TickerSubscriptionManager(managerOptions);
          }
          getId() {
            return "YFINANCE";
          }
          ensureConnection() {
          }
          subscribeTicker(params, handlers) {
            return this.subscriptionManager.subscribe(params, handlers);
          }
          async fetchTicker(params) {
            return this.genericFallback.fetchTicker(params);
          }
          async fetchCandles(params) {
            if (this.genericFallback && typeof this.genericFallback.fetchCandles === "function") {
              return this.genericFallback.fetchCandles(params);
            }
            return ProviderInterface.prototype.fetchCandles.call(this, params);
          }
          getCachedTicker(key) {
            const cached = this.subscriptionManager.getCachedTicker(key);
            if (cached) {
              return cached;
            }
            return this.genericFallback.getCachedTicker(key);
          }
        }
        return {
          YFinanceProvider
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/providers/provider-registry.ts
  var require_provider_registry = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/providers/provider-registry.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        const globalRoot = typeof globalThis !== "undefined" ? globalThis : root;
        const args = typeof module === "object" && module.exports ? [
          require_generic_provider(),
          require_binance_provider(),
          require_bitfinex_provider(),
          require_yfinance_provider()
        ] : [
          root == null ? void 0 : root.CryptoTickerProviders,
          root == null ? void 0 : root.CryptoTickerProviders,
          root == null ? void 0 : root.CryptoTickerProviders,
          root == null ? void 0 : root.CryptoTickerProviders
        ];
        const exportsValue = factory(
          args[0],
          args[1],
          args[2],
          args[3]
        );
        if (typeof module === "object" && module.exports) {
          module.exports = exportsValue;
        }
        if (globalRoot) {
          globalRoot.CryptoTickerProviders = globalRoot.CryptoTickerProviders || {};
          globalRoot.CryptoTickerProviders.ProviderRegistry = exportsValue.ProviderRegistry;
        }
      })(typeof self !== "undefined" ? self : exports, function(genericModule, binanceModule, bitfinexModule, yfinanceModule) {
        const GenericProvider = genericModule.GenericProvider || genericModule;
        const BinanceProvider = binanceModule.BinanceProvider || binanceModule;
        const BitfinexProvider = bitfinexModule.BitfinexProvider || bitfinexModule;
        const YFinanceProvider = yfinanceModule.YFinanceProvider || yfinanceModule;
        class ProviderRegistry {
          constructor(options) {
            const opts = options || {};
            this.logger = typeof opts.logger === "function" ? opts.logger : function() {
            };
            this.baseUrl = opts.baseUrl || "";
            this.providers = {};
            this.fallbackPollIntervalMs = typeof opts.fallbackPollIntervalMs === "number" ? opts.fallbackPollIntervalMs : void 0;
            this.staleTickerTimeoutMs = typeof opts.staleTickerTimeoutMs === "number" ? opts.staleTickerTimeoutMs : void 0;
            this.binanceRestBaseUrl = typeof opts.binanceRestBaseUrl === "string" && opts.binanceRestBaseUrl.length > 0 ? opts.binanceRestBaseUrl : "https://api.binance.com";
            this.binanceWsBaseUrl = typeof opts.binanceWsBaseUrl === "string" && opts.binanceWsBaseUrl.length > 0 ? opts.binanceWsBaseUrl : "wss://stream.binance.com:9443/ws";
            this.binanceSymbolOverrides = opts.binanceSymbolOverrides || {};
            this.bitfinexRestBaseUrl = typeof opts.bitfinexRestBaseUrl === "string" && opts.bitfinexRestBaseUrl.length > 0 ? opts.bitfinexRestBaseUrl : "https://api-pub.bitfinex.com";
            this.bitfinexWsBaseUrl = typeof opts.bitfinexWsBaseUrl === "string" && opts.bitfinexWsBaseUrl.length > 0 ? opts.bitfinexWsBaseUrl : "wss://api-pub.bitfinex.com/ws/2";
            this.bitfinexSymbolOverrides = opts.bitfinexSymbolOverrides || {};
            const genericOptions = {
              baseUrl: this.baseUrl,
              logger: this.logger,
              fallbackPollIntervalMs: this.fallbackPollIntervalMs,
              staleTickerTimeoutMs: this.staleTickerTimeoutMs
            };
            this.genericProvider = opts.genericProvider instanceof GenericProvider ? opts.genericProvider : new GenericProvider(genericOptions);
            this.register(this.genericProvider);
            this.register(new BinanceProvider({
              baseUrl: this.baseUrl,
              logger: this.logger,
              fallbackPollIntervalMs: this.fallbackPollIntervalMs,
              staleTickerTimeoutMs: this.staleTickerTimeoutMs,
              genericFallback: this.genericProvider,
              binanceRestBaseUrl: this.binanceRestBaseUrl,
              binanceWsBaseUrl: this.binanceWsBaseUrl,
              binanceSymbolOverrides: this.binanceSymbolOverrides
            }));
            this.register(new BitfinexProvider({
              baseUrl: this.baseUrl,
              logger: this.logger,
              fallbackPollIntervalMs: this.fallbackPollIntervalMs,
              staleTickerTimeoutMs: this.staleTickerTimeoutMs,
              genericFallback: this.genericProvider,
              bitfinexRestBaseUrl: this.bitfinexRestBaseUrl,
              bitfinexWsBaseUrl: this.bitfinexWsBaseUrl,
              bitfinexSymbolOverrides: this.bitfinexSymbolOverrides
            }));
            this.register(new YFinanceProvider({
              baseUrl: this.baseUrl,
              logger: this.logger,
              fallbackPollIntervalMs: this.fallbackPollIntervalMs,
              staleTickerTimeoutMs: this.staleTickerTimeoutMs,
              genericFallback: this.genericProvider
            }));
          }
          register(provider) {
            if (!provider || typeof provider.getId !== "function") {
              return;
            }
            const id = provider.getId();
            if (id) {
              this.providers[id.toUpperCase()] = provider;
            }
          }
          getProvider(exchange) {
            const key = (exchange || "").toUpperCase();
            return this.providers[key] || this.genericProvider;
          }
          getGenericProvider() {
            return this.genericProvider;
          }
          ensureAllConnections() {
            const keys = Object.keys(this.providers);
            for (let i = 0; i < keys.length; i++) {
              const provider = this.providers[keys[i]];
              if (provider && typeof provider.ensureConnection === "function") {
                provider.ensureConnection();
              }
            }
          }
        }
        return {
          ProviderRegistry
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/formatters.ts
  var require_formatters = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/formatters.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        const exports2 = factory();
        if (typeof module === "object" && module.exports) {
          module.exports = exports2;
        }
        if (root && typeof root === "object") {
          root.CryptoTickerFormatters = exports2;
        }
      })(typeof self !== "undefined" ? self : exports, function() {
        const NUMERIC_FORMATS = ["auto", "full", "compact", "plain"];
        const COMPACT_UNITS = [
          { value: 1e12, suffix: "T" },
          { value: 1e9, suffix: "B" },
          { value: 1e6, suffix: "M" },
          { value: 1e3, suffix: "K" }
        ];
        function getRoundedValue(value, digits, multiplier, format) {
          const formatOption = format || "auto";
          const parsedDigits = typeof digits === "number" ? digits : parseInt(String(digits != null ? digits : ""), 10);
          let precision = parsedDigits;
          if (Number.isNaN(precision) || precision < 0) {
            precision = 2;
          }
          const scaledValue = value * (typeof multiplier === "number" ? multiplier : 1);
          const absoluteValue = Math.abs(scaledValue);
          const sign = scaledValue < 0 ? "-" : "";
          function roundWithPrecision(val, localPrecision) {
            const pow = Math.pow(10, localPrecision);
            return Math.round(val * pow) / pow;
          }
          function toLocale(val, options) {
            try {
              return val.toLocaleString(void 0, options);
            } catch (err) {
              return val.toString();
            }
          }
          let formattedValue = "";
          const fixedDigits = Math.max(0, precision);
          switch (formatOption) {
            case "full": {
              const roundedFull = roundWithPrecision(absoluteValue, fixedDigits);
              formattedValue = toLocale(roundedFull, {
                minimumFractionDigits: fixedDigits,
                maximumFractionDigits: fixedDigits,
                useGrouping: true
              });
              break;
            }
            case "compact": {
              let suffix = "";
              let compactValue = absoluteValue;
              for (const unit of COMPACT_UNITS) {
                if (absoluteValue >= unit.value * 100) {
                  suffix = unit.suffix;
                  compactValue = absoluteValue / unit.value;
                  break;
                }
              }
              const roundedCompact = roundWithPrecision(compactValue, fixedDigits);
              formattedValue = toLocale(roundedCompact, {
                minimumFractionDigits: fixedDigits,
                maximumFractionDigits: fixedDigits,
                useGrouping: !suffix
              }) + suffix;
              break;
            }
            case "plain": {
              const roundedPlain = roundWithPrecision(absoluteValue, fixedDigits);
              formattedValue = toLocale(roundedPlain, {
                minimumFractionDigits: fixedDigits,
                maximumFractionDigits: fixedDigits,
                useGrouping: false
              });
              break;
            }
            case "auto":
            default: {
              let autoSuffix = "";
              let autoValue = absoluteValue;
              if (absoluteValue > 1e5) {
                autoSuffix = "K";
                autoValue = absoluteValue / 1e3;
              }
              const roundedAuto = roundWithPrecision(autoValue, fixedDigits);
              formattedValue = toLocale(roundedAuto, {
                minimumFractionDigits: fixedDigits,
                maximumFractionDigits: fixedDigits,
                useGrouping: false
              }) + autoSuffix;
              break;
            }
          }
          return sign + formattedValue;
        }
        function normalizeValue(value, min, max) {
          if (max - min === 0) {
            return 0.5;
          }
          return (value - min) / (max - min);
        }
        return {
          getRoundedValue,
          normalizeValue
        };
      });
    }
  });

  // node_modules/expr-eval/dist/bundle.js
  var require_bundle = __commonJS({
    "node_modules/expr-eval/dist/bundle.js"(exports, module) {
      (function(global2, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global2 = global2 || self, factory(global2.exprEval = {}));
      })(exports, function(exports2) {
        "use strict";
        var INUMBER = "INUMBER";
        var IOP1 = "IOP1";
        var IOP2 = "IOP2";
        var IOP3 = "IOP3";
        var IVAR = "IVAR";
        var IVARNAME = "IVARNAME";
        var IFUNCALL = "IFUNCALL";
        var IFUNDEF = "IFUNDEF";
        var IEXPR = "IEXPR";
        var IEXPREVAL = "IEXPREVAL";
        var IMEMBER = "IMEMBER";
        var IENDSTATEMENT = "IENDSTATEMENT";
        var IARRAY = "IARRAY";
        function Instruction(type, value) {
          this.type = type;
          this.value = value !== void 0 && value !== null ? value : 0;
        }
        Instruction.prototype.toString = function() {
          switch (this.type) {
            case INUMBER:
            case IOP1:
            case IOP2:
            case IOP3:
            case IVAR:
            case IVARNAME:
            case IENDSTATEMENT:
              return this.value;
            case IFUNCALL:
              return "CALL " + this.value;
            case IFUNDEF:
              return "DEF " + this.value;
            case IARRAY:
              return "ARRAY " + this.value;
            case IMEMBER:
              return "." + this.value;
            default:
              return "Invalid Instruction";
          }
        };
        function unaryInstruction(value) {
          return new Instruction(IOP1, value);
        }
        function binaryInstruction(value) {
          return new Instruction(IOP2, value);
        }
        function ternaryInstruction(value) {
          return new Instruction(IOP3, value);
        }
        function simplify(tokens, unaryOps, binaryOps, ternaryOps, values) {
          var nstack = [];
          var newexpression = [];
          var n1, n2, n3;
          var f;
          for (var i = 0; i < tokens.length; i++) {
            var item = tokens[i];
            var type = item.type;
            if (type === INUMBER || type === IVARNAME) {
              if (Array.isArray(item.value)) {
                nstack.push.apply(nstack, simplify(item.value.map(function(x) {
                  return new Instruction(INUMBER, x);
                }).concat(new Instruction(IARRAY, item.value.length)), unaryOps, binaryOps, ternaryOps, values));
              } else {
                nstack.push(item);
              }
            } else if (type === IVAR && values.hasOwnProperty(item.value)) {
              item = new Instruction(INUMBER, values[item.value]);
              nstack.push(item);
            } else if (type === IOP2 && nstack.length > 1) {
              n2 = nstack.pop();
              n1 = nstack.pop();
              f = binaryOps[item.value];
              item = new Instruction(INUMBER, f(n1.value, n2.value));
              nstack.push(item);
            } else if (type === IOP3 && nstack.length > 2) {
              n3 = nstack.pop();
              n2 = nstack.pop();
              n1 = nstack.pop();
              if (item.value === "?") {
                nstack.push(n1.value ? n2.value : n3.value);
              } else {
                f = ternaryOps[item.value];
                item = new Instruction(INUMBER, f(n1.value, n2.value, n3.value));
                nstack.push(item);
              }
            } else if (type === IOP1 && nstack.length > 0) {
              n1 = nstack.pop();
              f = unaryOps[item.value];
              item = new Instruction(INUMBER, f(n1.value));
              nstack.push(item);
            } else if (type === IEXPR) {
              while (nstack.length > 0) {
                newexpression.push(nstack.shift());
              }
              newexpression.push(new Instruction(IEXPR, simplify(item.value, unaryOps, binaryOps, ternaryOps, values)));
            } else if (type === IMEMBER && nstack.length > 0) {
              n1 = nstack.pop();
              nstack.push(new Instruction(INUMBER, n1.value[item.value]));
            } else {
              while (nstack.length > 0) {
                newexpression.push(nstack.shift());
              }
              newexpression.push(item);
            }
          }
          while (nstack.length > 0) {
            newexpression.push(nstack.shift());
          }
          return newexpression;
        }
        function substitute(tokens, variable, expr) {
          var newexpression = [];
          for (var i = 0; i < tokens.length; i++) {
            var item = tokens[i];
            var type = item.type;
            if (type === IVAR && item.value === variable) {
              for (var j = 0; j < expr.tokens.length; j++) {
                var expritem = expr.tokens[j];
                var replitem;
                if (expritem.type === IOP1) {
                  replitem = unaryInstruction(expritem.value);
                } else if (expritem.type === IOP2) {
                  replitem = binaryInstruction(expritem.value);
                } else if (expritem.type === IOP3) {
                  replitem = ternaryInstruction(expritem.value);
                } else {
                  replitem = new Instruction(expritem.type, expritem.value);
                }
                newexpression.push(replitem);
              }
            } else if (type === IEXPR) {
              newexpression.push(new Instruction(IEXPR, substitute(item.value, variable, expr)));
            } else {
              newexpression.push(item);
            }
          }
          return newexpression;
        }
        function evaluate(tokens, expr, values) {
          var nstack = [];
          var n1, n2, n3;
          var f, args, argCount;
          if (isExpressionEvaluator(tokens)) {
            return resolveExpression(tokens, values);
          }
          var numTokens = tokens.length;
          for (var i = 0; i < numTokens; i++) {
            var item = tokens[i];
            var type = item.type;
            if (type === INUMBER || type === IVARNAME) {
              nstack.push(item.value);
            } else if (type === IOP2) {
              n2 = nstack.pop();
              n1 = nstack.pop();
              if (item.value === "and") {
                nstack.push(n1 ? !!evaluate(n2, expr, values) : false);
              } else if (item.value === "or") {
                nstack.push(n1 ? true : !!evaluate(n2, expr, values));
              } else if (item.value === "=") {
                f = expr.binaryOps[item.value];
                nstack.push(f(n1, evaluate(n2, expr, values), values));
              } else {
                f = expr.binaryOps[item.value];
                nstack.push(f(resolveExpression(n1, values), resolveExpression(n2, values)));
              }
            } else if (type === IOP3) {
              n3 = nstack.pop();
              n2 = nstack.pop();
              n1 = nstack.pop();
              if (item.value === "?") {
                nstack.push(evaluate(n1 ? n2 : n3, expr, values));
              } else {
                f = expr.ternaryOps[item.value];
                nstack.push(f(resolveExpression(n1, values), resolveExpression(n2, values), resolveExpression(n3, values)));
              }
            } else if (type === IVAR) {
              if (item.value in expr.functions) {
                nstack.push(expr.functions[item.value]);
              } else if (item.value in expr.unaryOps && expr.parser.isOperatorEnabled(item.value)) {
                nstack.push(expr.unaryOps[item.value]);
              } else {
                var v = values[item.value];
                if (v !== void 0) {
                  nstack.push(v);
                } else {
                  throw new Error("undefined variable: " + item.value);
                }
              }
            } else if (type === IOP1) {
              n1 = nstack.pop();
              f = expr.unaryOps[item.value];
              nstack.push(f(resolveExpression(n1, values)));
            } else if (type === IFUNCALL) {
              argCount = item.value;
              args = [];
              while (argCount-- > 0) {
                args.unshift(resolveExpression(nstack.pop(), values));
              }
              f = nstack.pop();
              if (f.apply && f.call) {
                nstack.push(f.apply(void 0, args));
              } else {
                throw new Error(f + " is not a function");
              }
            } else if (type === IFUNDEF) {
              nstack.push(function() {
                var n22 = nstack.pop();
                var args2 = [];
                var argCount2 = item.value;
                while (argCount2-- > 0) {
                  args2.unshift(nstack.pop());
                }
                var n12 = nstack.pop();
                var f2 = function() {
                  var scope = Object.assign({}, values);
                  for (var i2 = 0, len = args2.length; i2 < len; i2++) {
                    scope[args2[i2]] = arguments[i2];
                  }
                  return evaluate(n22, expr, scope);
                };
                Object.defineProperty(f2, "name", {
                  value: n12,
                  writable: false
                });
                values[n12] = f2;
                return f2;
              }());
            } else if (type === IEXPR) {
              nstack.push(createExpressionEvaluator(item, expr));
            } else if (type === IEXPREVAL) {
              nstack.push(item);
            } else if (type === IMEMBER) {
              n1 = nstack.pop();
              nstack.push(n1[item.value]);
            } else if (type === IENDSTATEMENT) {
              nstack.pop();
            } else if (type === IARRAY) {
              argCount = item.value;
              args = [];
              while (argCount-- > 0) {
                args.unshift(nstack.pop());
              }
              nstack.push(args);
            } else {
              throw new Error("invalid Expression");
            }
          }
          if (nstack.length > 1) {
            throw new Error("invalid Expression (parity)");
          }
          return nstack[0] === 0 ? 0 : resolveExpression(nstack[0], values);
        }
        function createExpressionEvaluator(token, expr, values) {
          if (isExpressionEvaluator(token)) return token;
          return {
            type: IEXPREVAL,
            value: function(scope) {
              return evaluate(token.value, expr, scope);
            }
          };
        }
        function isExpressionEvaluator(n) {
          return n && n.type === IEXPREVAL;
        }
        function resolveExpression(n, values) {
          return isExpressionEvaluator(n) ? n.value(values) : n;
        }
        function expressionToString(tokens, toJS) {
          var nstack = [];
          var n1, n2, n3;
          var f, args, argCount;
          for (var i = 0; i < tokens.length; i++) {
            var item = tokens[i];
            var type = item.type;
            if (type === INUMBER) {
              if (typeof item.value === "number" && item.value < 0) {
                nstack.push("(" + item.value + ")");
              } else if (Array.isArray(item.value)) {
                nstack.push("[" + item.value.map(escapeValue).join(", ") + "]");
              } else {
                nstack.push(escapeValue(item.value));
              }
            } else if (type === IOP2) {
              n2 = nstack.pop();
              n1 = nstack.pop();
              f = item.value;
              if (toJS) {
                if (f === "^") {
                  nstack.push("Math.pow(" + n1 + ", " + n2 + ")");
                } else if (f === "and") {
                  nstack.push("(!!" + n1 + " && !!" + n2 + ")");
                } else if (f === "or") {
                  nstack.push("(!!" + n1 + " || !!" + n2 + ")");
                } else if (f === "||") {
                  nstack.push("(function(a,b){ return Array.isArray(a) && Array.isArray(b) ? a.concat(b) : String(a) + String(b); }((" + n1 + "),(" + n2 + ")))");
                } else if (f === "==") {
                  nstack.push("(" + n1 + " === " + n2 + ")");
                } else if (f === "!=") {
                  nstack.push("(" + n1 + " !== " + n2 + ")");
                } else if (f === "[") {
                  nstack.push(n1 + "[(" + n2 + ") | 0]");
                } else {
                  nstack.push("(" + n1 + " " + f + " " + n2 + ")");
                }
              } else {
                if (f === "[") {
                  nstack.push(n1 + "[" + n2 + "]");
                } else {
                  nstack.push("(" + n1 + " " + f + " " + n2 + ")");
                }
              }
            } else if (type === IOP3) {
              n3 = nstack.pop();
              n2 = nstack.pop();
              n1 = nstack.pop();
              f = item.value;
              if (f === "?") {
                nstack.push("(" + n1 + " ? " + n2 + " : " + n3 + ")");
              } else {
                throw new Error("invalid Expression");
              }
            } else if (type === IVAR || type === IVARNAME) {
              nstack.push(item.value);
            } else if (type === IOP1) {
              n1 = nstack.pop();
              f = item.value;
              if (f === "-" || f === "+") {
                nstack.push("(" + f + n1 + ")");
              } else if (toJS) {
                if (f === "not") {
                  nstack.push("(!" + n1 + ")");
                } else if (f === "!") {
                  nstack.push("fac(" + n1 + ")");
                } else {
                  nstack.push(f + "(" + n1 + ")");
                }
              } else if (f === "!") {
                nstack.push("(" + n1 + "!)");
              } else {
                nstack.push("(" + f + " " + n1 + ")");
              }
            } else if (type === IFUNCALL) {
              argCount = item.value;
              args = [];
              while (argCount-- > 0) {
                args.unshift(nstack.pop());
              }
              f = nstack.pop();
              nstack.push(f + "(" + args.join(", ") + ")");
            } else if (type === IFUNDEF) {
              n2 = nstack.pop();
              argCount = item.value;
              args = [];
              while (argCount-- > 0) {
                args.unshift(nstack.pop());
              }
              n1 = nstack.pop();
              if (toJS) {
                nstack.push("(" + n1 + " = function(" + args.join(", ") + ") { return " + n2 + " })");
              } else {
                nstack.push("(" + n1 + "(" + args.join(", ") + ") = " + n2 + ")");
              }
            } else if (type === IMEMBER) {
              n1 = nstack.pop();
              nstack.push(n1 + "." + item.value);
            } else if (type === IARRAY) {
              argCount = item.value;
              args = [];
              while (argCount-- > 0) {
                args.unshift(nstack.pop());
              }
              nstack.push("[" + args.join(", ") + "]");
            } else if (type === IEXPR) {
              nstack.push("(" + expressionToString(item.value, toJS) + ")");
            } else if (type === IENDSTATEMENT) ;
            else {
              throw new Error("invalid Expression");
            }
          }
          if (nstack.length > 1) {
            if (toJS) {
              nstack = [nstack.join(",")];
            } else {
              nstack = [nstack.join(";")];
            }
          }
          return String(nstack[0]);
        }
        function escapeValue(v) {
          if (typeof v === "string") {
            return JSON.stringify(v).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
          }
          return v;
        }
        function contains(array, obj) {
          for (var i = 0; i < array.length; i++) {
            if (array[i] === obj) {
              return true;
            }
          }
          return false;
        }
        function getSymbols(tokens, symbols, options) {
          options = options || {};
          var withMembers = !!options.withMembers;
          var prevVar = null;
          for (var i = 0; i < tokens.length; i++) {
            var item = tokens[i];
            if (item.type === IVAR || item.type === IVARNAME) {
              if (!withMembers && !contains(symbols, item.value)) {
                symbols.push(item.value);
              } else if (prevVar !== null) {
                if (!contains(symbols, prevVar)) {
                  symbols.push(prevVar);
                }
                prevVar = item.value;
              } else {
                prevVar = item.value;
              }
            } else if (item.type === IMEMBER && withMembers && prevVar !== null) {
              prevVar += "." + item.value;
            } else if (item.type === IEXPR) {
              getSymbols(item.value, symbols, options);
            } else if (prevVar !== null) {
              if (!contains(symbols, prevVar)) {
                symbols.push(prevVar);
              }
              prevVar = null;
            }
          }
          if (prevVar !== null && !contains(symbols, prevVar)) {
            symbols.push(prevVar);
          }
        }
        function Expression(tokens, parser) {
          this.tokens = tokens;
          this.parser = parser;
          this.unaryOps = parser.unaryOps;
          this.binaryOps = parser.binaryOps;
          this.ternaryOps = parser.ternaryOps;
          this.functions = parser.functions;
        }
        Expression.prototype.simplify = function(values) {
          values = values || {};
          return new Expression(simplify(this.tokens, this.unaryOps, this.binaryOps, this.ternaryOps, values), this.parser);
        };
        Expression.prototype.substitute = function(variable, expr) {
          if (!(expr instanceof Expression)) {
            expr = this.parser.parse(String(expr));
          }
          return new Expression(substitute(this.tokens, variable, expr), this.parser);
        };
        Expression.prototype.evaluate = function(values) {
          values = values || {};
          return evaluate(this.tokens, this, values);
        };
        Expression.prototype.toString = function() {
          return expressionToString(this.tokens, false);
        };
        Expression.prototype.symbols = function(options) {
          options = options || {};
          var vars = [];
          getSymbols(this.tokens, vars, options);
          return vars;
        };
        Expression.prototype.variables = function(options) {
          options = options || {};
          var vars = [];
          getSymbols(this.tokens, vars, options);
          var functions = this.functions;
          return vars.filter(function(name) {
            return !(name in functions);
          });
        };
        Expression.prototype.toJSFunction = function(param, variables) {
          var expr = this;
          var f = new Function(param, "with(this.functions) with (this.ternaryOps) with (this.binaryOps) with (this.unaryOps) { return " + expressionToString(this.simplify(variables).tokens, true) + "; }");
          return function() {
            return f.apply(expr, arguments);
          };
        };
        var TEOF = "TEOF";
        var TOP = "TOP";
        var TNUMBER = "TNUMBER";
        var TSTRING = "TSTRING";
        var TPAREN = "TPAREN";
        var TBRACKET = "TBRACKET";
        var TCOMMA = "TCOMMA";
        var TNAME = "TNAME";
        var TSEMICOLON = "TSEMICOLON";
        function Token(type, value, index2) {
          this.type = type;
          this.value = value;
          this.index = index2;
        }
        Token.prototype.toString = function() {
          return this.type + ": " + this.value;
        };
        function TokenStream(parser, expression) {
          this.pos = 0;
          this.current = null;
          this.unaryOps = parser.unaryOps;
          this.binaryOps = parser.binaryOps;
          this.ternaryOps = parser.ternaryOps;
          this.consts = parser.consts;
          this.expression = expression;
          this.savedPosition = 0;
          this.savedCurrent = null;
          this.options = parser.options;
          this.parser = parser;
        }
        TokenStream.prototype.newToken = function(type, value, pos) {
          return new Token(type, value, pos != null ? pos : this.pos);
        };
        TokenStream.prototype.save = function() {
          this.savedPosition = this.pos;
          this.savedCurrent = this.current;
        };
        TokenStream.prototype.restore = function() {
          this.pos = this.savedPosition;
          this.current = this.savedCurrent;
        };
        TokenStream.prototype.next = function() {
          if (this.pos >= this.expression.length) {
            return this.newToken(TEOF, "EOF");
          }
          if (this.isWhitespace() || this.isComment()) {
            return this.next();
          } else if (this.isRadixInteger() || this.isNumber() || this.isOperator() || this.isString() || this.isParen() || this.isBracket() || this.isComma() || this.isSemicolon() || this.isNamedOp() || this.isConst() || this.isName()) {
            return this.current;
          } else {
            this.parseError('Unknown character "' + this.expression.charAt(this.pos) + '"');
          }
        };
        TokenStream.prototype.isString = function() {
          var r = false;
          var startPos = this.pos;
          var quote = this.expression.charAt(startPos);
          if (quote === "'" || quote === '"') {
            var index2 = this.expression.indexOf(quote, startPos + 1);
            while (index2 >= 0 && this.pos < this.expression.length) {
              this.pos = index2 + 1;
              if (this.expression.charAt(index2 - 1) !== "\\") {
                var rawString = this.expression.substring(startPos + 1, index2);
                this.current = this.newToken(TSTRING, this.unescape(rawString), startPos);
                r = true;
                break;
              }
              index2 = this.expression.indexOf(quote, index2 + 1);
            }
          }
          return r;
        };
        TokenStream.prototype.isParen = function() {
          var c = this.expression.charAt(this.pos);
          if (c === "(" || c === ")") {
            this.current = this.newToken(TPAREN, c);
            this.pos++;
            return true;
          }
          return false;
        };
        TokenStream.prototype.isBracket = function() {
          var c = this.expression.charAt(this.pos);
          if ((c === "[" || c === "]") && this.isOperatorEnabled("[")) {
            this.current = this.newToken(TBRACKET, c);
            this.pos++;
            return true;
          }
          return false;
        };
        TokenStream.prototype.isComma = function() {
          var c = this.expression.charAt(this.pos);
          if (c === ",") {
            this.current = this.newToken(TCOMMA, ",");
            this.pos++;
            return true;
          }
          return false;
        };
        TokenStream.prototype.isSemicolon = function() {
          var c = this.expression.charAt(this.pos);
          if (c === ";") {
            this.current = this.newToken(TSEMICOLON, ";");
            this.pos++;
            return true;
          }
          return false;
        };
        TokenStream.prototype.isConst = function() {
          var startPos = this.pos;
          var i = startPos;
          for (; i < this.expression.length; i++) {
            var c = this.expression.charAt(i);
            if (c.toUpperCase() === c.toLowerCase()) {
              if (i === this.pos || c !== "_" && c !== "." && (c < "0" || c > "9")) {
                break;
              }
            }
          }
          if (i > startPos) {
            var str = this.expression.substring(startPos, i);
            if (str in this.consts) {
              this.current = this.newToken(TNUMBER, this.consts[str]);
              this.pos += str.length;
              return true;
            }
          }
          return false;
        };
        TokenStream.prototype.isNamedOp = function() {
          var startPos = this.pos;
          var i = startPos;
          for (; i < this.expression.length; i++) {
            var c = this.expression.charAt(i);
            if (c.toUpperCase() === c.toLowerCase()) {
              if (i === this.pos || c !== "_" && (c < "0" || c > "9")) {
                break;
              }
            }
          }
          if (i > startPos) {
            var str = this.expression.substring(startPos, i);
            if (this.isOperatorEnabled(str) && (str in this.binaryOps || str in this.unaryOps || str in this.ternaryOps)) {
              this.current = this.newToken(TOP, str);
              this.pos += str.length;
              return true;
            }
          }
          return false;
        };
        TokenStream.prototype.isName = function() {
          var startPos = this.pos;
          var i = startPos;
          var hasLetter = false;
          for (; i < this.expression.length; i++) {
            var c = this.expression.charAt(i);
            if (c.toUpperCase() === c.toLowerCase()) {
              if (i === this.pos && (c === "$" || c === "_")) {
                if (c === "_") {
                  hasLetter = true;
                }
                continue;
              } else if (i === this.pos || !hasLetter || c !== "_" && (c < "0" || c > "9")) {
                break;
              }
            } else {
              hasLetter = true;
            }
          }
          if (hasLetter) {
            var str = this.expression.substring(startPos, i);
            this.current = this.newToken(TNAME, str);
            this.pos += str.length;
            return true;
          }
          return false;
        };
        TokenStream.prototype.isWhitespace = function() {
          var r = false;
          var c = this.expression.charAt(this.pos);
          while (c === " " || c === "	" || c === "\n" || c === "\r") {
            r = true;
            this.pos++;
            if (this.pos >= this.expression.length) {
              break;
            }
            c = this.expression.charAt(this.pos);
          }
          return r;
        };
        var codePointPattern = /^[0-9a-f]{4}$/i;
        TokenStream.prototype.unescape = function(v) {
          var index2 = v.indexOf("\\");
          if (index2 < 0) {
            return v;
          }
          var buffer = v.substring(0, index2);
          while (index2 >= 0) {
            var c = v.charAt(++index2);
            switch (c) {
              case "'":
                buffer += "'";
                break;
              case '"':
                buffer += '"';
                break;
              case "\\":
                buffer += "\\";
                break;
              case "/":
                buffer += "/";
                break;
              case "b":
                buffer += "\b";
                break;
              case "f":
                buffer += "\f";
                break;
              case "n":
                buffer += "\n";
                break;
              case "r":
                buffer += "\r";
                break;
              case "t":
                buffer += "	";
                break;
              case "u":
                var codePoint = v.substring(index2 + 1, index2 + 5);
                if (!codePointPattern.test(codePoint)) {
                  this.parseError("Illegal escape sequence: \\u" + codePoint);
                }
                buffer += String.fromCharCode(parseInt(codePoint, 16));
                index2 += 4;
                break;
              default:
                throw this.parseError('Illegal escape sequence: "\\' + c + '"');
            }
            ++index2;
            var backslash = v.indexOf("\\", index2);
            buffer += v.substring(index2, backslash < 0 ? v.length : backslash);
            index2 = backslash;
          }
          return buffer;
        };
        TokenStream.prototype.isComment = function() {
          var c = this.expression.charAt(this.pos);
          if (c === "/" && this.expression.charAt(this.pos + 1) === "*") {
            this.pos = this.expression.indexOf("*/", this.pos) + 2;
            if (this.pos === 1) {
              this.pos = this.expression.length;
            }
            return true;
          }
          return false;
        };
        TokenStream.prototype.isRadixInteger = function() {
          var pos = this.pos;
          if (pos >= this.expression.length - 2 || this.expression.charAt(pos) !== "0") {
            return false;
          }
          ++pos;
          var radix;
          var validDigit;
          if (this.expression.charAt(pos) === "x") {
            radix = 16;
            validDigit = /^[0-9a-f]$/i;
            ++pos;
          } else if (this.expression.charAt(pos) === "b") {
            radix = 2;
            validDigit = /^[01]$/i;
            ++pos;
          } else {
            return false;
          }
          var valid = false;
          var startPos = pos;
          while (pos < this.expression.length) {
            var c = this.expression.charAt(pos);
            if (validDigit.test(c)) {
              pos++;
              valid = true;
            } else {
              break;
            }
          }
          if (valid) {
            this.current = this.newToken(TNUMBER, parseInt(this.expression.substring(startPos, pos), radix));
            this.pos = pos;
          }
          return valid;
        };
        TokenStream.prototype.isNumber = function() {
          var valid = false;
          var pos = this.pos;
          var startPos = pos;
          var resetPos = pos;
          var foundDot = false;
          var foundDigits = false;
          var c;
          while (pos < this.expression.length) {
            c = this.expression.charAt(pos);
            if (c >= "0" && c <= "9" || !foundDot && c === ".") {
              if (c === ".") {
                foundDot = true;
              } else {
                foundDigits = true;
              }
              pos++;
              valid = foundDigits;
            } else {
              break;
            }
          }
          if (valid) {
            resetPos = pos;
          }
          if (c === "e" || c === "E") {
            pos++;
            var acceptSign = true;
            var validExponent = false;
            while (pos < this.expression.length) {
              c = this.expression.charAt(pos);
              if (acceptSign && (c === "+" || c === "-")) {
                acceptSign = false;
              } else if (c >= "0" && c <= "9") {
                validExponent = true;
                acceptSign = false;
              } else {
                break;
              }
              pos++;
            }
            if (!validExponent) {
              pos = resetPos;
            }
          }
          if (valid) {
            this.current = this.newToken(TNUMBER, parseFloat(this.expression.substring(startPos, pos)));
            this.pos = pos;
          } else {
            this.pos = resetPos;
          }
          return valid;
        };
        TokenStream.prototype.isOperator = function() {
          var startPos = this.pos;
          var c = this.expression.charAt(this.pos);
          if (c === "+" || c === "-" || c === "*" || c === "/" || c === "%" || c === "^" || c === "?" || c === ":" || c === ".") {
            this.current = this.newToken(TOP, c);
          } else if (c === "\u2219" || c === "\u2022") {
            this.current = this.newToken(TOP, "*");
          } else if (c === ">") {
            if (this.expression.charAt(this.pos + 1) === "=") {
              this.current = this.newToken(TOP, ">=");
              this.pos++;
            } else {
              this.current = this.newToken(TOP, ">");
            }
          } else if (c === "<") {
            if (this.expression.charAt(this.pos + 1) === "=") {
              this.current = this.newToken(TOP, "<=");
              this.pos++;
            } else {
              this.current = this.newToken(TOP, "<");
            }
          } else if (c === "|") {
            if (this.expression.charAt(this.pos + 1) === "|") {
              this.current = this.newToken(TOP, "||");
              this.pos++;
            } else {
              return false;
            }
          } else if (c === "=") {
            if (this.expression.charAt(this.pos + 1) === "=") {
              this.current = this.newToken(TOP, "==");
              this.pos++;
            } else {
              this.current = this.newToken(TOP, c);
            }
          } else if (c === "!") {
            if (this.expression.charAt(this.pos + 1) === "=") {
              this.current = this.newToken(TOP, "!=");
              this.pos++;
            } else {
              this.current = this.newToken(TOP, c);
            }
          } else {
            return false;
          }
          this.pos++;
          if (this.isOperatorEnabled(this.current.value)) {
            return true;
          } else {
            this.pos = startPos;
            return false;
          }
        };
        TokenStream.prototype.isOperatorEnabled = function(op) {
          return this.parser.isOperatorEnabled(op);
        };
        TokenStream.prototype.getCoordinates = function() {
          var line = 0;
          var column;
          var newline = -1;
          do {
            line++;
            column = this.pos - newline;
            newline = this.expression.indexOf("\n", newline + 1);
          } while (newline >= 0 && newline < this.pos);
          return {
            line,
            column
          };
        };
        TokenStream.prototype.parseError = function(msg) {
          var coords = this.getCoordinates();
          throw new Error("parse error [" + coords.line + ":" + coords.column + "]: " + msg);
        };
        function ParserState(parser, tokenStream, options) {
          this.parser = parser;
          this.tokens = tokenStream;
          this.current = null;
          this.nextToken = null;
          this.next();
          this.savedCurrent = null;
          this.savedNextToken = null;
          this.allowMemberAccess = options.allowMemberAccess !== false;
        }
        ParserState.prototype.next = function() {
          this.current = this.nextToken;
          return this.nextToken = this.tokens.next();
        };
        ParserState.prototype.tokenMatches = function(token, value) {
          if (typeof value === "undefined") {
            return true;
          } else if (Array.isArray(value)) {
            return contains(value, token.value);
          } else if (typeof value === "function") {
            return value(token);
          } else {
            return token.value === value;
          }
        };
        ParserState.prototype.save = function() {
          this.savedCurrent = this.current;
          this.savedNextToken = this.nextToken;
          this.tokens.save();
        };
        ParserState.prototype.restore = function() {
          this.tokens.restore();
          this.current = this.savedCurrent;
          this.nextToken = this.savedNextToken;
        };
        ParserState.prototype.accept = function(type, value) {
          if (this.nextToken.type === type && this.tokenMatches(this.nextToken, value)) {
            this.next();
            return true;
          }
          return false;
        };
        ParserState.prototype.expect = function(type, value) {
          if (!this.accept(type, value)) {
            var coords = this.tokens.getCoordinates();
            throw new Error("parse error [" + coords.line + ":" + coords.column + "]: Expected " + (value || type));
          }
        };
        ParserState.prototype.parseAtom = function(instr) {
          var unaryOps = this.tokens.unaryOps;
          function isPrefixOperator(token) {
            return token.value in unaryOps;
          }
          if (this.accept(TNAME) || this.accept(TOP, isPrefixOperator)) {
            instr.push(new Instruction(IVAR, this.current.value));
          } else if (this.accept(TNUMBER)) {
            instr.push(new Instruction(INUMBER, this.current.value));
          } else if (this.accept(TSTRING)) {
            instr.push(new Instruction(INUMBER, this.current.value));
          } else if (this.accept(TPAREN, "(")) {
            this.parseExpression(instr);
            this.expect(TPAREN, ")");
          } else if (this.accept(TBRACKET, "[")) {
            if (this.accept(TBRACKET, "]")) {
              instr.push(new Instruction(IARRAY, 0));
            } else {
              var argCount = this.parseArrayList(instr);
              instr.push(new Instruction(IARRAY, argCount));
            }
          } else {
            throw new Error("unexpected " + this.nextToken);
          }
        };
        ParserState.prototype.parseExpression = function(instr) {
          var exprInstr = [];
          if (this.parseUntilEndStatement(instr, exprInstr)) {
            return;
          }
          this.parseVariableAssignmentExpression(exprInstr);
          if (this.parseUntilEndStatement(instr, exprInstr)) {
            return;
          }
          this.pushExpression(instr, exprInstr);
        };
        ParserState.prototype.pushExpression = function(instr, exprInstr) {
          for (var i = 0, len = exprInstr.length; i < len; i++) {
            instr.push(exprInstr[i]);
          }
        };
        ParserState.prototype.parseUntilEndStatement = function(instr, exprInstr) {
          if (!this.accept(TSEMICOLON)) return false;
          if (this.nextToken && this.nextToken.type !== TEOF && !(this.nextToken.type === TPAREN && this.nextToken.value === ")")) {
            exprInstr.push(new Instruction(IENDSTATEMENT));
          }
          if (this.nextToken.type !== TEOF) {
            this.parseExpression(exprInstr);
          }
          instr.push(new Instruction(IEXPR, exprInstr));
          return true;
        };
        ParserState.prototype.parseArrayList = function(instr) {
          var argCount = 0;
          while (!this.accept(TBRACKET, "]")) {
            this.parseExpression(instr);
            ++argCount;
            while (this.accept(TCOMMA)) {
              this.parseExpression(instr);
              ++argCount;
            }
          }
          return argCount;
        };
        ParserState.prototype.parseVariableAssignmentExpression = function(instr) {
          this.parseConditionalExpression(instr);
          while (this.accept(TOP, "=")) {
            var varName = instr.pop();
            var varValue = [];
            var lastInstrIndex = instr.length - 1;
            if (varName.type === IFUNCALL) {
              if (!this.tokens.isOperatorEnabled("()=")) {
                throw new Error("function definition is not permitted");
              }
              for (var i = 0, len = varName.value + 1; i < len; i++) {
                var index2 = lastInstrIndex - i;
                if (instr[index2].type === IVAR) {
                  instr[index2] = new Instruction(IVARNAME, instr[index2].value);
                }
              }
              this.parseVariableAssignmentExpression(varValue);
              instr.push(new Instruction(IEXPR, varValue));
              instr.push(new Instruction(IFUNDEF, varName.value));
              continue;
            }
            if (varName.type !== IVAR && varName.type !== IMEMBER) {
              throw new Error("expected variable for assignment");
            }
            this.parseVariableAssignmentExpression(varValue);
            instr.push(new Instruction(IVARNAME, varName.value));
            instr.push(new Instruction(IEXPR, varValue));
            instr.push(binaryInstruction("="));
          }
        };
        ParserState.prototype.parseConditionalExpression = function(instr) {
          this.parseOrExpression(instr);
          while (this.accept(TOP, "?")) {
            var trueBranch = [];
            var falseBranch = [];
            this.parseConditionalExpression(trueBranch);
            this.expect(TOP, ":");
            this.parseConditionalExpression(falseBranch);
            instr.push(new Instruction(IEXPR, trueBranch));
            instr.push(new Instruction(IEXPR, falseBranch));
            instr.push(ternaryInstruction("?"));
          }
        };
        ParserState.prototype.parseOrExpression = function(instr) {
          this.parseAndExpression(instr);
          while (this.accept(TOP, "or")) {
            var falseBranch = [];
            this.parseAndExpression(falseBranch);
            instr.push(new Instruction(IEXPR, falseBranch));
            instr.push(binaryInstruction("or"));
          }
        };
        ParserState.prototype.parseAndExpression = function(instr) {
          this.parseComparison(instr);
          while (this.accept(TOP, "and")) {
            var trueBranch = [];
            this.parseComparison(trueBranch);
            instr.push(new Instruction(IEXPR, trueBranch));
            instr.push(binaryInstruction("and"));
          }
        };
        var COMPARISON_OPERATORS = ["==", "!=", "<", "<=", ">=", ">", "in"];
        ParserState.prototype.parseComparison = function(instr) {
          this.parseAddSub(instr);
          while (this.accept(TOP, COMPARISON_OPERATORS)) {
            var op = this.current;
            this.parseAddSub(instr);
            instr.push(binaryInstruction(op.value));
          }
        };
        var ADD_SUB_OPERATORS = ["+", "-", "||"];
        ParserState.prototype.parseAddSub = function(instr) {
          this.parseTerm(instr);
          while (this.accept(TOP, ADD_SUB_OPERATORS)) {
            var op = this.current;
            this.parseTerm(instr);
            instr.push(binaryInstruction(op.value));
          }
        };
        var TERM_OPERATORS = ["*", "/", "%"];
        ParserState.prototype.parseTerm = function(instr) {
          this.parseFactor(instr);
          while (this.accept(TOP, TERM_OPERATORS)) {
            var op = this.current;
            this.parseFactor(instr);
            instr.push(binaryInstruction(op.value));
          }
        };
        ParserState.prototype.parseFactor = function(instr) {
          var unaryOps = this.tokens.unaryOps;
          function isPrefixOperator(token) {
            return token.value in unaryOps;
          }
          this.save();
          if (this.accept(TOP, isPrefixOperator)) {
            if (this.current.value !== "-" && this.current.value !== "+") {
              if (this.nextToken.type === TPAREN && this.nextToken.value === "(") {
                this.restore();
                this.parseExponential(instr);
                return;
              } else if (this.nextToken.type === TSEMICOLON || this.nextToken.type === TCOMMA || this.nextToken.type === TEOF || this.nextToken.type === TPAREN && this.nextToken.value === ")") {
                this.restore();
                this.parseAtom(instr);
                return;
              }
            }
            var op = this.current;
            this.parseFactor(instr);
            instr.push(unaryInstruction(op.value));
          } else {
            this.parseExponential(instr);
          }
        };
        ParserState.prototype.parseExponential = function(instr) {
          this.parsePostfixExpression(instr);
          while (this.accept(TOP, "^")) {
            this.parseFactor(instr);
            instr.push(binaryInstruction("^"));
          }
        };
        ParserState.prototype.parsePostfixExpression = function(instr) {
          this.parseFunctionCall(instr);
          while (this.accept(TOP, "!")) {
            instr.push(unaryInstruction("!"));
          }
        };
        ParserState.prototype.parseFunctionCall = function(instr) {
          var unaryOps = this.tokens.unaryOps;
          function isPrefixOperator(token) {
            return token.value in unaryOps;
          }
          if (this.accept(TOP, isPrefixOperator)) {
            var op = this.current;
            this.parseAtom(instr);
            instr.push(unaryInstruction(op.value));
          } else {
            this.parseMemberExpression(instr);
            while (this.accept(TPAREN, "(")) {
              if (this.accept(TPAREN, ")")) {
                instr.push(new Instruction(IFUNCALL, 0));
              } else {
                var argCount = this.parseArgumentList(instr);
                instr.push(new Instruction(IFUNCALL, argCount));
              }
            }
          }
        };
        ParserState.prototype.parseArgumentList = function(instr) {
          var argCount = 0;
          while (!this.accept(TPAREN, ")")) {
            this.parseExpression(instr);
            ++argCount;
            while (this.accept(TCOMMA)) {
              this.parseExpression(instr);
              ++argCount;
            }
          }
          return argCount;
        };
        ParserState.prototype.parseMemberExpression = function(instr) {
          this.parseAtom(instr);
          while (this.accept(TOP, ".") || this.accept(TBRACKET, "[")) {
            var op = this.current;
            if (op.value === ".") {
              if (!this.allowMemberAccess) {
                throw new Error('unexpected ".", member access is not permitted');
              }
              this.expect(TNAME);
              instr.push(new Instruction(IMEMBER, this.current.value));
            } else if (op.value === "[") {
              if (!this.tokens.isOperatorEnabled("[")) {
                throw new Error('unexpected "[]", arrays are disabled');
              }
              this.parseExpression(instr);
              this.expect(TBRACKET, "]");
              instr.push(binaryInstruction("["));
            } else {
              throw new Error("unexpected symbol: " + op.value);
            }
          }
        };
        function add(a, b) {
          return Number(a) + Number(b);
        }
        function sub(a, b) {
          return a - b;
        }
        function mul(a, b) {
          return a * b;
        }
        function div(a, b) {
          return a / b;
        }
        function mod(a, b) {
          return a % b;
        }
        function concat(a, b) {
          if (Array.isArray(a) && Array.isArray(b)) {
            return a.concat(b);
          }
          return "" + a + b;
        }
        function equal(a, b) {
          return a === b;
        }
        function notEqual(a, b) {
          return a !== b;
        }
        function greaterThan(a, b) {
          return a > b;
        }
        function lessThan(a, b) {
          return a < b;
        }
        function greaterThanEqual(a, b) {
          return a >= b;
        }
        function lessThanEqual(a, b) {
          return a <= b;
        }
        function andOperator(a, b) {
          return Boolean(a && b);
        }
        function orOperator(a, b) {
          return Boolean(a || b);
        }
        function inOperator(a, b) {
          return contains(b, a);
        }
        function sinh(a) {
          return (Math.exp(a) - Math.exp(-a)) / 2;
        }
        function cosh(a) {
          return (Math.exp(a) + Math.exp(-a)) / 2;
        }
        function tanh(a) {
          if (a === Infinity) return 1;
          if (a === -Infinity) return -1;
          return (Math.exp(a) - Math.exp(-a)) / (Math.exp(a) + Math.exp(-a));
        }
        function asinh(a) {
          if (a === -Infinity) return a;
          return Math.log(a + Math.sqrt(a * a + 1));
        }
        function acosh(a) {
          return Math.log(a + Math.sqrt(a * a - 1));
        }
        function atanh(a) {
          return Math.log((1 + a) / (1 - a)) / 2;
        }
        function log10(a) {
          return Math.log(a) * Math.LOG10E;
        }
        function neg(a) {
          return -a;
        }
        function not(a) {
          return !a;
        }
        function trunc(a) {
          return a < 0 ? Math.ceil(a) : Math.floor(a);
        }
        function random(a) {
          return Math.random() * (a || 1);
        }
        function factorial(a) {
          return gamma(a + 1);
        }
        function isInteger(value) {
          return isFinite(value) && value === Math.round(value);
        }
        var GAMMA_G = 4.7421875;
        var GAMMA_P = [
          0.9999999999999971,
          57.15623566586292,
          -59.59796035547549,
          14.136097974741746,
          -0.4919138160976202,
          3399464998481189e-20,
          4652362892704858e-20,
          -9837447530487956e-20,
          1580887032249125e-19,
          -21026444172410488e-20,
          21743961811521265e-20,
          -1643181065367639e-19,
          8441822398385275e-20,
          -26190838401581408e-21,
          36899182659531625e-22
        ];
        function gamma(n) {
          var t, x;
          if (isInteger(n)) {
            if (n <= 0) {
              return isFinite(n) ? Infinity : NaN;
            }
            if (n > 171) {
              return Infinity;
            }
            var value = n - 2;
            var res = n - 1;
            while (value > 1) {
              res *= value;
              value--;
            }
            if (res === 0) {
              res = 1;
            }
            return res;
          }
          if (n < 0.5) {
            return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n));
          }
          if (n >= 171.35) {
            return Infinity;
          }
          if (n > 85) {
            var twoN = n * n;
            var threeN = twoN * n;
            var fourN = threeN * n;
            var fiveN = fourN * n;
            return Math.sqrt(2 * Math.PI / n) * Math.pow(n / Math.E, n) * (1 + 1 / (12 * n) + 1 / (288 * twoN) - 139 / (51840 * threeN) - 571 / (2488320 * fourN) + 163879 / (209018880 * fiveN) + 5246819 / (75246796800 * fiveN * n));
          }
          --n;
          x = GAMMA_P[0];
          for (var i = 1; i < GAMMA_P.length; ++i) {
            x += GAMMA_P[i] / (n + i);
          }
          t = n + GAMMA_G + 0.5;
          return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
        }
        function stringOrArrayLength(s) {
          if (Array.isArray(s)) {
            return s.length;
          }
          return String(s).length;
        }
        function hypot() {
          var sum = 0;
          var larg = 0;
          for (var i = 0; i < arguments.length; i++) {
            var arg = Math.abs(arguments[i]);
            var div2;
            if (larg < arg) {
              div2 = larg / arg;
              sum = sum * div2 * div2 + 1;
              larg = arg;
            } else if (arg > 0) {
              div2 = arg / larg;
              sum += div2 * div2;
            } else {
              sum += arg;
            }
          }
          return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
        }
        function condition(cond, yep, nope) {
          return cond ? yep : nope;
        }
        function roundTo(value, exp) {
          if (typeof exp === "undefined" || +exp === 0) {
            return Math.round(value);
          }
          value = +value;
          exp = -+exp;
          if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
            return NaN;
          }
          value = value.toString().split("e");
          value = Math.round(+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)));
          value = value.toString().split("e");
          return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp));
        }
        function setVar(name, value, variables) {
          if (variables) variables[name] = value;
          return value;
        }
        function arrayIndex(array, index2) {
          return array[index2 | 0];
        }
        function max(array) {
          if (arguments.length === 1 && Array.isArray(array)) {
            return Math.max.apply(Math, array);
          } else {
            return Math.max.apply(Math, arguments);
          }
        }
        function min(array) {
          if (arguments.length === 1 && Array.isArray(array)) {
            return Math.min.apply(Math, array);
          } else {
            return Math.min.apply(Math, arguments);
          }
        }
        function arrayMap(f, a) {
          if (typeof f !== "function") {
            throw new Error("First argument to map is not a function");
          }
          if (!Array.isArray(a)) {
            throw new Error("Second argument to map is not an array");
          }
          return a.map(function(x, i) {
            return f(x, i);
          });
        }
        function arrayFold(f, init, a) {
          if (typeof f !== "function") {
            throw new Error("First argument to fold is not a function");
          }
          if (!Array.isArray(a)) {
            throw new Error("Second argument to fold is not an array");
          }
          return a.reduce(function(acc, x, i) {
            return f(acc, x, i);
          }, init);
        }
        function arrayFilter(f, a) {
          if (typeof f !== "function") {
            throw new Error("First argument to filter is not a function");
          }
          if (!Array.isArray(a)) {
            throw new Error("Second argument to filter is not an array");
          }
          return a.filter(function(x, i) {
            return f(x, i);
          });
        }
        function stringOrArrayIndexOf(target, s) {
          if (!(Array.isArray(s) || typeof s === "string")) {
            throw new Error("Second argument to indexOf is not a string or array");
          }
          return s.indexOf(target);
        }
        function arrayJoin(sep, a) {
          if (!Array.isArray(a)) {
            throw new Error("Second argument to join is not an array");
          }
          return a.join(sep);
        }
        function sign(x) {
          return (x > 0) - (x < 0) || +x;
        }
        var ONE_THIRD = 1 / 3;
        function cbrt(x) {
          return x < 0 ? -Math.pow(-x, ONE_THIRD) : Math.pow(x, ONE_THIRD);
        }
        function expm1(x) {
          return Math.exp(x) - 1;
        }
        function log1p(x) {
          return Math.log(1 + x);
        }
        function log2(x) {
          return Math.log(x) / Math.LN2;
        }
        function Parser(options) {
          this.options = options || {};
          this.unaryOps = {
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            asin: Math.asin,
            acos: Math.acos,
            atan: Math.atan,
            sinh: Math.sinh || sinh,
            cosh: Math.cosh || cosh,
            tanh: Math.tanh || tanh,
            asinh: Math.asinh || asinh,
            acosh: Math.acosh || acosh,
            atanh: Math.atanh || atanh,
            sqrt: Math.sqrt,
            cbrt: Math.cbrt || cbrt,
            log: Math.log,
            log2: Math.log2 || log2,
            ln: Math.log,
            lg: Math.log10 || log10,
            log10: Math.log10 || log10,
            expm1: Math.expm1 || expm1,
            log1p: Math.log1p || log1p,
            abs: Math.abs,
            ceil: Math.ceil,
            floor: Math.floor,
            round: Math.round,
            trunc: Math.trunc || trunc,
            "-": neg,
            "+": Number,
            exp: Math.exp,
            not,
            length: stringOrArrayLength,
            "!": factorial,
            sign: Math.sign || sign
          };
          this.binaryOps = {
            "+": add,
            "-": sub,
            "*": mul,
            "/": div,
            "%": mod,
            "^": Math.pow,
            "||": concat,
            "==": equal,
            "!=": notEqual,
            ">": greaterThan,
            "<": lessThan,
            ">=": greaterThanEqual,
            "<=": lessThanEqual,
            and: andOperator,
            or: orOperator,
            "in": inOperator,
            "=": setVar,
            "[": arrayIndex
          };
          this.ternaryOps = {
            "?": condition
          };
          this.functions = {
            random,
            fac: factorial,
            min,
            max,
            hypot: Math.hypot || hypot,
            pyt: Math.hypot || hypot,
            // backward compat
            pow: Math.pow,
            atan2: Math.atan2,
            "if": condition,
            gamma,
            roundTo,
            map: arrayMap,
            fold: arrayFold,
            filter: arrayFilter,
            indexOf: stringOrArrayIndexOf,
            join: arrayJoin
          };
          this.consts = {
            E: Math.E,
            PI: Math.PI,
            "true": true,
            "false": false
          };
        }
        Parser.prototype.parse = function(expr) {
          var instr = [];
          var parserState = new ParserState(
            this,
            new TokenStream(this, expr),
            { allowMemberAccess: this.options.allowMemberAccess }
          );
          parserState.parseExpression(instr);
          parserState.expect(TEOF, "EOF");
          return new Expression(instr, this);
        };
        Parser.prototype.evaluate = function(expr, variables) {
          return this.parse(expr).evaluate(variables);
        };
        var sharedParser = new Parser();
        Parser.parse = function(expr) {
          return sharedParser.parse(expr);
        };
        Parser.evaluate = function(expr, variables) {
          return sharedParser.parse(expr).evaluate(variables);
        };
        var optionNameMap = {
          "+": "add",
          "-": "subtract",
          "*": "multiply",
          "/": "divide",
          "%": "remainder",
          "^": "power",
          "!": "factorial",
          "<": "comparison",
          ">": "comparison",
          "<=": "comparison",
          ">=": "comparison",
          "==": "comparison",
          "!=": "comparison",
          "||": "concatenate",
          "and": "logical",
          "or": "logical",
          "not": "logical",
          "?": "conditional",
          ":": "conditional",
          "=": "assignment",
          "[": "array",
          "()=": "fndef"
        };
        function getOptionName(op) {
          return optionNameMap.hasOwnProperty(op) ? optionNameMap[op] : op;
        }
        Parser.prototype.isOperatorEnabled = function(op) {
          var optionName = getOptionName(op);
          var operators = this.options.operators || {};
          return !(optionName in operators) || !!operators[optionName];
        };
        var index = {
          Parser,
          Expression
        };
        exports2.Expression = Expression;
        exports2.Parser = Parser;
        exports2.default = index;
        Object.defineProperty(exports2, "__esModule", { value: true });
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/expression-evaluator.ts
  var require_expression_evaluator = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/expression-evaluator.ts"(exports, module) {
      "use strict";
      var ExpressionEvaluator = class {
        constructor(options, ParserCtor) {
          const evaluatorOptions = options || {};
          const allowed = Array.isArray(evaluatorOptions.allowedVariables) && evaluatorOptions.allowedVariables.length > 0 ? evaluatorOptions.allowedVariables.slice() : DEFAULT_ALLOWED_VARIABLES.slice();
          this.allowedVariables = allowed;
          const ParserFactory = ParserCtor || getDefaultParser();
          this.parser = new ParserFactory({
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
        validate(expression) {
          let entry;
          try {
            entry = this.getCacheEntry(expression);
          } catch (err) {
            const error = err instanceof Error ? err.message : "Invalid expression";
            return {
              ok: false,
              error
            };
          }
          if (!entry) {
            return {
              ok: false,
              error: "Expression cannot be empty"
            };
          }
          if (entry.disallowedVariables.length > 0) {
            return {
              ok: false,
              error: "Unknown variables: " + entry.disallowedVariables.join(", ") + ". Allowed variables: " + this.allowedVariables.join(", ")
            };
          }
          return {
            ok: true,
            variables: entry.variables.slice()
          };
        }
        evaluate(expression, variables) {
          const entry = this.getCacheEntry(expression);
          if (!entry) {
            throw new Error("Expression cannot be empty");
          }
          if (entry.disallowedVariables.length > 0) {
            throw new Error(
              "Unknown variables: " + entry.disallowedVariables.join(", ") + ". Allowed variables: " + this.allowedVariables.join(", ")
            );
          }
          const sanitized = {};
          const source = variables || {};
          for (const name of this.allowedVariables) {
            const rawValue = Object.prototype.hasOwnProperty.call(source, name) ? source[name] : void 0;
            if (DEFAULT_ALLOWED_VARIABLES.indexOf(name) !== -1) {
              sanitized[name] = normalizeNumericValue(rawValue);
              continue;
            }
            if (typeof rawValue === "number") {
              sanitized[name] = Number.isFinite(rawValue) ? rawValue : 0;
            } else if (typeof rawValue === "boolean" || typeof rawValue === "string") {
              sanitized[name] = rawValue;
            } else if (rawValue === void 0 || rawValue === null) {
              sanitized[name] = 0;
            } else {
              sanitized[name] = rawValue;
            }
          }
          return entry.compiled.evaluate(sanitized);
        }
        clearCache() {
          this.cache = {};
        }
        getCacheEntry(expression) {
          const normalized = this.normalizeExpression(expression);
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
            throw this.wrapParseError(err);
          }
          const variables = compiled.variables({ withMembers: false }) || [];
          const disallowed = variables.filter((variableName) => this.allowedVariables.indexOf(variableName) === -1);
          const entry = {
            expression: normalized,
            compiled,
            variables: variables.slice(),
            disallowedVariables: disallowed.slice()
          };
          this.cache[normalized] = entry;
          return entry;
        }
        normalizeExpression(expression) {
          if (typeof expression !== "string") {
            return "";
          }
          return expression.trim();
        }
        wrapParseError(error) {
          const message = error && typeof error === "object" && error instanceof Error && error.message ? enhanceErrorMessage(error.message) : "Invalid expression";
          const wrappedError = new Error(message);
          if (error && typeof error === "object") {
            wrappedError.originalError = error;
          }
          return wrappedError;
        }
      };
      var DEFAULT_ALLOWED_VARIABLES = ["value", "high", "low", "changeDaily", "changeDailyPercent", "volume"];
      function cloneArray(source) {
        return source ? source.slice() : [];
      }
      function normalizeNumericValue(value) {
        if (value === void 0 || value === null) {
          return 0;
        }
        if (typeof value === "number") {
          if (!Number.isFinite(value)) {
            return 0;
          }
          return value;
        }
        if (typeof value === "string" && value.trim() !== "") {
          const parsed = Number(value);
          if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
            return parsed;
          }
        }
        return 0;
      }
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
        if (overrides && typeof overrides === "object") {
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
          return "Invalid expression";
        }
        if (message.indexOf("member access is not permitted") >= 0) {
          return message + '. Remove object-style prefixes (for example use "value" instead of "values.last").';
        }
        return message;
      }
      function getDefaultParser() {
        if (typeof __require === "function") {
          try {
            const exprEval = require_bundle();
            if (exprEval && exprEval.Parser) {
              return exprEval.Parser;
            }
          } catch (err) {
          }
        }
        const root = typeof globalThis !== "undefined" ? globalThis : {};
        const parserFromGlobal = root.exprEval && root.exprEval.Parser;
        if (parserFromGlobal) {
          return parserFromGlobal;
        }
        throw new Error("expr-eval dependency is missing");
      }
      (function loadExpressionEvaluator(root, factory) {
        const parserCtor = getDefaultParser();
        const exports2 = factory(parserCtor);
        if (typeof module === "object" && module.exports) {
          module.exports = exports2;
        }
        if (root && typeof root === "object") {
          root.CryptoTickerExpressionEvaluator = exports2;
        }
      })(typeof self !== "undefined" ? self : exports, function buildExports(Parser) {
        return {
          createEvaluator: (options) => new ExpressionEvaluator(options, Parser),
          ExpressionEvaluator,
          normalizeNumericValue,
          buildBaseContext,
          buildContext,
          allowedVariables: cloneArray(DEFAULT_ALLOWED_VARIABLES)
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/alert-manager.ts
  var require_alert_manager = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/alert-manager.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        const expressionEvaluatorModule = typeof module === "object" && module.exports ? require_expression_evaluator() : root == null ? void 0 : root.CryptoTickerExpressionEvaluator;
        const dependency = factory(expressionEvaluatorModule);
        if (typeof module === "object" && module.exports) {
          module.exports = dependency;
        }
        if (root && typeof root === "object") {
          root.CryptoTickerAlertManager = dependency;
        }
      })(typeof self !== "undefined" ? self : exports, function(expressionEvaluator) {
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
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/ticker-state.ts
  var require_ticker_state = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/ticker-state.ts"(exports, module) {
      "use strict";
      (function loadTickerState(root, factory) {
        const exports2 = factory();
        if (typeof module === "object" && module.exports) {
          module.exports = exports2;
        }
        if (root && typeof root === "object") {
          root.CryptoTickerState = exports2;
        }
      })(typeof self !== "undefined" ? self : exports, function buildTickerState() {
        const contextDetails = {};
        const contextSubscriptions = {};
        const contextConnectionStates = {};
        const conversionRatesCache = {};
        const candlesCache = {};
        const lastGoodTickerValues = {};
        function setContextDetails(context, settings) {
          contextDetails[context] = {
            context,
            settings
          };
        }
        function getContextDetails(context) {
          return contextDetails[context] || null;
        }
        function forEachContext(callback) {
          Object.keys(contextDetails).forEach((ctx) => {
            callback(contextDetails[ctx], ctx);
          });
        }
        function clearContextDetails(context) {
          delete contextDetails[context];
          delete lastGoodTickerValues[context];
        }
        function setSubscription(context, subscription) {
          if (!context) {
            return;
          }
          contextSubscriptions[context] = subscription || null;
        }
        function getSubscription(context) {
          if (!context) {
            return null;
          }
          return contextSubscriptions[context] || null;
        }
        function clearSubscription(context) {
          if (!context) {
            return;
          }
          delete contextSubscriptions[context];
        }
        function setConnectionState(context, state) {
          if (!context) {
            return;
          }
          if (state) {
            contextConnectionStates[context] = state;
          }
        }
        function getConnectionState(context) {
          if (!context) {
            return null;
          }
          return contextConnectionStates[context] || null;
        }
        function clearConnectionState(context) {
          if (!context) {
            return;
          }
          delete contextConnectionStates[context];
          delete lastGoodTickerValues[context];
        }
        function getOrCreateConversionRateEntry(key) {
          if (!conversionRatesCache[key]) {
            conversionRatesCache[key] = {};
          }
          return conversionRatesCache[key];
        }
        function setConversionRateEntry(key, entry) {
          conversionRatesCache[key] = entry;
        }
        function getCandlesCacheEntry(key) {
          return candlesCache[key];
        }
        function setCandlesCacheEntry(key, entry) {
          candlesCache[key] = entry;
        }
        function resetAllState() {
          Object.keys(contextDetails).forEach((key) => {
            delete contextDetails[key];
          });
          Object.keys(contextSubscriptions).forEach((key) => {
            const sub = contextSubscriptions[key];
            if (sub && typeof sub.unsubscribe === "function") {
              try {
                sub.unsubscribe();
              } catch (err) {
              }
            }
            delete contextSubscriptions[key];
          });
          Object.keys(contextConnectionStates).forEach((key) => {
            delete contextConnectionStates[key];
          });
          Object.keys(conversionRatesCache).forEach((key) => {
            delete conversionRatesCache[key];
          });
          Object.keys(candlesCache).forEach((key) => {
            delete candlesCache[key];
          });
          Object.keys(lastGoodTickerValues).forEach((key) => {
            delete lastGoodTickerValues[key];
          });
        }
        function setLastGoodTicker(context, values, timestamp) {
          if (!context || !values) {
            return;
          }
          const safeTimestamp = typeof timestamp === "number" ? timestamp : Date.now();
          lastGoodTickerValues[context] = {
            values: Object.assign({}, values),
            timestamp: safeTimestamp
          };
        }
        function getLastGoodTicker(context) {
          if (!context) {
            return null;
          }
          return lastGoodTickerValues[context] || null;
        }
        function clearLastGoodTicker(context) {
          if (!context) {
            return;
          }
          delete lastGoodTickerValues[context];
        }
        return {
          setContextDetails,
          getContextDetails,
          forEachContext,
          clearContextDetails,
          setSubscription,
          getSubscription,
          clearSubscription,
          setConnectionState,
          getConnectionState,
          clearConnectionState,
          getOrCreateConversionRateEntry,
          setConversionRateEntry,
          getCandlesCacheEntry,
          setCandlesCacheEntry,
          resetAllState,
          setLastGoodTicker,
          getLastGoodTicker,
          clearLastGoodTicker
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/settings-manager.ts
  var require_settings_manager = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/settings-manager.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        const globalScope = typeof globalThis !== "undefined" ? globalThis : root;
        const tickerStateModule = typeof module === "object" && module.exports ? require_ticker_state() : root == null ? void 0 : root.CryptoTickerState;
        const exportsValue = factory(tickerStateModule, globalScope);
        if (typeof module === "object" && module.exports) {
          module.exports = exportsValue;
        }
        if (root && typeof root === "object") {
          root.CryptoTickerSettingsManager = exportsValue;
        }
      })(typeof self !== "undefined" ? self : exports, function buildSettingsManager(tickerState, globalRoot) {
        function requireOrNull(modulePath) {
          if (typeof __require === "function") {
            try {
              return __require(modulePath);
            } catch (err) {
              return null;
            }
          }
          return null;
        }
        function resolveDefaultSettingsModule() {
          if (globalRoot && typeof globalRoot.CryptoTickerDefaults !== "undefined") {
            return globalRoot.CryptoTickerDefaults;
          }
          return requireOrNull("./default-settings");
        }
        const defaultSettingsModule = resolveDefaultSettingsModule();
        function ensureDefaultSettingsModule() {
          if (!defaultSettingsModule) {
            throw new Error("Default settings module is not available");
          }
          return defaultSettingsModule;
        }
        function applyDefaultSettings(partial) {
          const moduleRef = ensureDefaultSettingsModule();
          if (typeof moduleRef.applyDefaults === "function") {
            return moduleRef.applyDefaults(partial);
          }
          if (moduleRef.defaultSettings) {
            return Object.assign({}, moduleRef.defaultSettings, partial || {});
          }
          return Object.assign({}, partial || {});
        }
        function getDefaultSettingsSnapshot() {
          const moduleRef = ensureDefaultSettingsModule();
          if (typeof moduleRef.getDefaultSettings === "function") {
            return moduleRef.getDefaultSettings();
          }
          if (moduleRef.defaultSettings) {
            return JSON.parse(JSON.stringify(moduleRef.defaultSettings));
          }
          return {};
        }
        const defaultSettings = getDefaultSettingsSnapshot();
        function refreshSettings(options) {
          const context = options.context;
          const settings = options.settings;
          const updateSubscription = options.updateSubscription;
          const normalizedSettings = applyDefaultSettings(settings);
          tickerState.setContextDetails(context, normalizedSettings);
          if (typeof updateSubscription === "function") {
            updateSubscription(normalizedSettings);
          }
          return normalizedSettings;
        }
        const settingsSchema = defaultSettingsModule && defaultSettingsModule.settingsSchema ? defaultSettingsModule.settingsSchema : null;
        return {
          applyDefaultSettings,
          getDefaultSettingsSnapshot,
          defaultSettings,
          settingsSchema,
          refreshSettings
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/constants.ts
  var require_constants = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/constants.ts"(exports, module) {
      "use strict";
      var CONSTANTS = {
        TIMESTAMP_SECONDS_THRESHOLD: 9999999999,
        DEFAULT_PRICE_BAR_POSITION: 0.5
      };
      (function factoryLoader(root, factory) {
        const exports2 = factory();
        if (typeof module === "object" && module.exports) {
          module.exports = exports2;
        } else {
          const current = root.CryptoTickerConstants || {};
          root.CryptoTickerConstants = Object.assign({}, current, exports2);
        }
      })(typeof globalThis !== "undefined" ? globalThis : self, function buildConstants() {
        return CONSTANTS;
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/connection-status-icons.ts
  var require_connection_status_icons = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/connection-status-icons.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        const exportsValue = factory();
        if (typeof module === "object" && module.exports) {
          module.exports = exportsValue;
        }
        if (root && typeof root === "object") {
          root.CryptoTickerConnectionStatusIcons = exportsValue;
        }
      })(typeof self !== "undefined" ? self : exports, function buildConnectionStatusIcons() {
        function getFallbackConnectionStates() {
          return {
            LIVE: "live",
            DETACHED: "detached",
            BACKUP: "backup",
            BROKEN: "broken"
          };
        }
        function normalizeConnectionStates(states) {
          if (!states || typeof states !== "object") {
            return getFallbackConnectionStates();
          }
          const fallback = getFallbackConnectionStates();
          const normalized = {};
          for (const key in fallback) {
            if (!Object.prototype.hasOwnProperty.call(fallback, key)) {
              continue;
            }
            const fallbackValue = fallback[key];
            const candidate = states[key];
            normalized[key] = typeof candidate === "string" && candidate ? candidate : fallbackValue;
          }
          return normalized;
        }
        function renderConnectionStatusIcon(params) {
          const canvasContext = params.canvasContext;
          const canvas = params.canvas;
          const state = params.state;
          const color = params.color;
          const sizeMultiplier = params.sizeMultiplier;
          const position = params.position;
          const providedConnectionStates = params.connectionStates;
          if (!canvas || !canvasContext || !state) {
            return;
          }
          const connectionStates = normalizeConnectionStates(providedConnectionStates);
          const pos = (position || "OFF").toUpperCase();
          if (pos === "OFF") {
            return;
          }
          const iconState = String(state).toLowerCase();
          const multiplier = typeof sizeMultiplier === "number" && Number.isFinite(sizeMultiplier) && sizeMultiplier > 0 ? sizeMultiplier : 1;
          const iconSize = 20 * multiplier;
          const margin = 4 * multiplier;
          let x = canvas.width - iconSize - margin;
          let y = margin;
          if (pos === "BOTTOM_LEFT") {
            x = margin;
            y = canvas.height - iconSize - margin;
          }
          canvasContext.save();
          canvasContext.translate(x, y);
          canvasContext.lineWidth = Math.max(1.5 * multiplier, 1);
          canvasContext.strokeStyle = color;
          canvasContext.fillStyle = color;
          function drawPolygon(points) {
            if (!Array.isArray(points) || points.length === 0) {
              return;
            }
            canvasContext.beginPath();
            for (let i = 0; i < points.length; i++) {
              const pt = points[i];
              const px = pt[0] * iconSize;
              const py = pt[1] * iconSize;
              if (i === 0) {
                canvasContext.moveTo(px, py);
              } else {
                canvasContext.lineTo(px, py);
              }
            }
            canvasContext.closePath();
            canvasContext.fill();
          }
          if (iconState === connectionStates.LIVE) {
            drawPolygon([
              [0.7545784909869392, 0],
              [0.18263591551829597, 0.5685964091677761],
              [0.3947756629367107, 0.5685964091677761],
              [0.23171302126434715, 1],
              [0.8173281041988991, 0.43136761054941897],
              [0.6051523764976793, 0.43136761054941897]
            ]);
          } else if (iconState === connectionStates.DETACHED) {
            drawPolygon([
              [0, 0.45],
              [0.4, 0.45],
              [0.4, 0.6],
              [0, 0.6]
            ]);
            drawPolygon([
              [0.6, 0.45],
              [1, 0.45],
              [1, 0.6],
              [0.6, 0.6]
            ]);
          } else if (iconState === connectionStates.BACKUP) {
            drawPolygon([
              [0, 0.3],
              [0.4, 0.3],
              [0.4, 0.38],
              [0, 0.38]
            ]);
            drawPolygon([
              [0.6, 0.3],
              [1, 0.3],
              [1, 0.38],
              [0.6, 0.38]
            ]);
            drawPolygon([
              [0, 0.62],
              [0.4, 0.62],
              [0.4, 0.7],
              [0, 0.7]
            ]);
            drawPolygon([
              [0.6, 0.62],
              [1, 0.62],
              [1, 0.7],
              [0.6, 0.7]
            ]);
          } else if (iconState === connectionStates.BROKEN) {
            canvasContext.save();
            canvasContext.fillStyle = "#ff0000";
            canvasContext.beginPath();
            canvasContext.moveTo(iconSize * 0.46, iconSize * 0.32);
            canvasContext.lineTo(iconSize * 0.42, iconSize * 0.38);
            canvasContext.lineTo(iconSize * 0.46, iconSize * 0.44);
            canvasContext.lineTo(iconSize * 0.41, iconSize * 0.5);
            canvasContext.lineTo(iconSize * 0.43, iconSize * 0.88);
            canvasContext.lineTo(iconSize * 0.3, iconSize * 0.73);
            canvasContext.lineTo(iconSize * 0.18, iconSize * 0.62);
            canvasContext.bezierCurveTo(
              iconSize * 0.08,
              iconSize * 0.52,
              iconSize * 0.08,
              iconSize * 0.38,
              iconSize * 0.15,
              iconSize * 0.28
            );
            canvasContext.bezierCurveTo(
              iconSize * 0.25,
              iconSize * 0.16,
              iconSize * 0.4,
              iconSize * 0.2,
              iconSize * 0.46,
              iconSize * 0.32
            );
            canvasContext.closePath();
            canvasContext.fill();
            canvasContext.beginPath();
            canvasContext.moveTo(iconSize * 0.54, iconSize * 0.28);
            canvasContext.lineTo(iconSize * 0.58, iconSize * 0.34);
            canvasContext.lineTo(iconSize * 0.54, iconSize * 0.4);
            canvasContext.lineTo(iconSize * 0.59, iconSize * 0.46);
            canvasContext.lineTo(iconSize * 0.57, iconSize * 0.84);
            canvasContext.lineTo(iconSize * 0.7, iconSize * 0.69);
            canvasContext.lineTo(iconSize * 0.82, iconSize * 0.58);
            canvasContext.bezierCurveTo(
              iconSize * 0.92,
              iconSize * 0.48,
              iconSize * 0.92,
              iconSize * 0.34,
              iconSize * 0.85,
              iconSize * 0.24
            );
            canvasContext.bezierCurveTo(
              iconSize * 0.75,
              iconSize * 0.12,
              iconSize * 0.6,
              iconSize * 0.16,
              iconSize * 0.54,
              iconSize * 0.28
            );
            canvasContext.closePath();
            canvasContext.fill();
            canvasContext.restore();
          }
          canvasContext.restore();
        }
        return {
          renderConnectionStatusIcon
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/canvas-renderer.ts
  var require_canvas_renderer = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/canvas-renderer.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        const dependencyArgs = typeof module === "object" && module.exports ? [
          require_alert_manager(),
          require_formatters(),
          require_expression_evaluator(),
          require_constants(),
          require_connection_status_icons()
        ] : [
          root == null ? void 0 : root.CryptoTickerAlertManager,
          root == null ? void 0 : root.CryptoTickerFormatters,
          root == null ? void 0 : root.CryptoTickerExpressionEvaluator,
          root == null ? void 0 : root.CryptoTickerConstants,
          root == null ? void 0 : root.CryptoTickerConnectionStatusIcons
        ];
        const exportsValue = factory(
          dependencyArgs[0],
          dependencyArgs[1],
          dependencyArgs[2],
          dependencyArgs[3],
          dependencyArgs[4]
        );
        if (typeof module === "object" && module.exports) {
          module.exports = exportsValue;
        }
        if (root && typeof root === "object") {
          root.CryptoTickerCanvasRenderer = exportsValue;
        }
      })(typeof self !== "undefined" ? self : exports, function(alertManager, formatters, expressionEvaluator, constants, connectionStatusIcons) {
        if (!alertManager) {
          throw new Error("Alert manager dependency is missing");
        }
        if (!formatters) {
          throw new Error("Formatters dependency is missing");
        }
        if (!expressionEvaluator) {
          throw new Error("Expression evaluator dependency is missing");
        }
        const sharedConstants = constants || {};
        const TIMESTAMP_SECONDS_THRESHOLD = typeof sharedConstants.TIMESTAMP_SECONDS_THRESHOLD === "number" ? sharedConstants.TIMESTAMP_SECONDS_THRESHOLD : 9999999999;
        const DEFAULT_PRICE_BAR_POSITION = typeof sharedConstants.DEFAULT_PRICE_BAR_POSITION === "number" ? sharedConstants.DEFAULT_PRICE_BAR_POSITION : 0.5;
        function createColorRuleEvaluator() {
          const allowed = expressionEvaluator.allowedVariables.slice(0);
          const extras = [
            "alert",
            "backgroundColor",
            "textColor",
            "defaultBackgroundColor",
            "defaultTextColor"
          ];
          for (let i = 0; i < extras.length; i++) {
            if (allowed.indexOf(extras[i]) === -1) {
              allowed.push(extras[i]);
            }
          }
          return expressionEvaluator.createEvaluator({
            allowedVariables: allowed
          });
        }
        const colorRuleEvaluator = createColorRuleEvaluator();
        const connectionStatusIconsModule = connectionStatusIcons && typeof connectionStatusIcons === "object" ? connectionStatusIcons : null;
        const renderConnectionStatusIcon = connectionStatusIconsModule && typeof connectionStatusIconsModule.renderConnectionStatusIcon === "function" ? connectionStatusIconsModule.renderConnectionStatusIcon : function renderConnectionStatusIconFallback() {
        };
        function getCanvasSizeMultiplier(canvasWidth, canvasHeight) {
          return Math.max(canvasWidth / 144, canvasHeight / 144);
        }
        function getCandlesDisplayCount(settings) {
          const parsed = parseInt(settings["candlesDisplayed"]);
          if (isNaN(parsed)) {
            return 20;
          }
          return Math.min(60, Math.max(5, parsed));
        }
        function drawPriceCursorTriangle(canvasContext, cursorPositionX, lineY, triangleSide, fillStyle) {
          const triangleHeight = Math.sqrt(0.75 * Math.pow(triangleSide, 2));
          canvasContext.beginPath();
          canvasContext.moveTo(cursorPositionX - triangleSide / 2, lineY - triangleHeight / 3);
          canvasContext.lineTo(cursorPositionX + triangleSide / 2, lineY - triangleHeight / 3);
          canvasContext.lineTo(cursorPositionX, lineY + triangleHeight * 2 / 3);
          canvasContext.fillStyle = fillStyle;
          canvasContext.fill();
        }
        function splitMessageIntoLines(canvasContext, message, maxWidth, font) {
          if (!message && message !== 0) {
            return [""];
          }
          const rawSegments = String(message).split(/\r?\n/);
          const lines = [];
          function splitLongWord(word) {
            const characters = word.split("");
            const chunks = [];
            let current = "";
            for (let i = 0; i < characters.length; i++) {
              const candidate = current + characters[i];
              if (canvasContext.measureText(candidate).width > maxWidth && current) {
                chunks.push(current);
                current = characters[i];
              } else {
                current = candidate;
              }
            }
            if (current) {
              chunks.push(current);
            }
            return chunks;
          }
          canvasContext.font = font;
          for (let i = 0; i < rawSegments.length; i++) {
            const segment = rawSegments[i];
            if (!segment || segment.trim() === "") {
              lines.push("");
              continue;
            }
            const words = segment.trim().split(/\s+/);
            let currentLine = words.shift() || "";
            while (words.length > 0) {
              const word = words.shift();
              const candidate = currentLine ? currentLine + " " + word : word;
              if (canvasContext.measureText(candidate).width <= maxWidth) {
                currentLine = candidate;
                continue;
              }
              if (currentLine) {
                lines.push(currentLine);
              }
              if (canvasContext.measureText(word).width <= maxWidth) {
                currentLine = word;
              } else {
                const chunks = splitLongWord(word);
                for (let c = 0; c < chunks.length - 1; c++) {
                  lines.push(chunks[c]);
                }
                currentLine = chunks.length > 0 ? chunks[chunks.length - 1] : "";
              }
            }
            if (currentLine) {
              lines.push(currentLine);
            }
          }
          if (lines.length === 0) {
            lines.push("");
          }
          return lines;
        }
        function formatTimestampForDisplay(timestamp) {
          if (timestamp === null || timestamp === void 0) {
            return null;
          }
          const numericTimestamp = typeof timestamp === "number" ? timestamp : parseFloat(timestamp);
          if (!Number.isFinite(numericTimestamp)) {
            return null;
          }
          const normalized = numericTimestamp > TIMESTAMP_SECONDS_THRESHOLD ? numericTimestamp : numericTimestamp * 1e3;
          const date = new Date(normalized);
          if (isNaN(date.getTime())) {
            return null;
          }
          try {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          } catch (err) {
            return date.toISOString();
          }
        }
        function renderMessageCanvas(params) {
          const canvas = params.canvas;
          const canvasContext = params.canvasContext;
          const message = params.message;
          const backgroundColor = params.backgroundColor || "#000000";
          const textColor = params.textColor || "#ffffff";
          const fontFamily = params.font || "Lato";
          const explicitFontSize = params.fontSize;
          const connectionStates = params.connectionStates;
          const connectionState = params.connectionState;
          const connectionIconSetting = (params.displayConnectionStatusIcon || "OFF").toUpperCase();
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const sizeMultiplier = getCanvasSizeMultiplier(canvasWidth, canvasHeight);
          const padding = 12 * sizeMultiplier;
          const baseFontSize = explicitFontSize ? explicitFontSize * sizeMultiplier : Math.max(22 * sizeMultiplier, 14);
          const font = "bold " + baseFontSize + "px " + fontFamily;
          const lineHeight = baseFontSize * 1.25;
          canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
          canvasContext.fillStyle = backgroundColor;
          canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
          const maxLineWidth = canvasWidth - padding * 2;
          const lines = splitMessageIntoLines(canvasContext, message, maxLineWidth, font);
          let availableHeight = canvasHeight - padding * 2;
          if (connectionIconSetting !== "OFF" && connectionStates) {
            availableHeight -= 28 * sizeMultiplier;
          }
          const totalTextHeight = lineHeight * lines.length;
          let startY = padding + (availableHeight - totalTextHeight) / 2 + lineHeight / 2;
          if (startY < padding + lineHeight / 2) {
            startY = padding + lineHeight / 2;
          }
          canvasContext.fillStyle = textColor;
          canvasContext.textAlign = "center";
          canvasContext.textBaseline = "middle";
          canvasContext.font = font;
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line) {
              canvasContext.fillText(line, canvasWidth / 2, startY + i * lineHeight);
            }
          }
          if (connectionIconSetting !== "OFF" && connectionStates) {
            renderConnectionStatusIcon({
              canvas,
              canvasContext,
              state: connectionState,
              color: textColor,
              sizeMultiplier,
              position: connectionIconSetting,
              connectionStates
            });
          }
        }
        function renderTickerCanvas(params) {
          const canvas = params.canvas;
          const canvasContext = params.canvasContext;
          const settings = params.settings || {};
          const values = params.values || {};
          const context = params.context;
          const connectionStates = params.connectionStates;
          const connectionState = params.connectionState;
          const dataStateRaw = params.dataState || "live";
          const infoMessage = params.infoMessage || "";
          const lastValidTimestamp = params.lastValidTimestamp || values.lastUpdated || null;
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const sizeMultiplier = getCanvasSizeMultiplier(canvasWidth, canvasHeight);
          const textPadding = 10 * sizeMultiplier;
          const pair = settings["pair"];
          const pairDisplay = settings["title"] || values["pairDisplay"] || values["pair"] || pair || "";
          const multiplier = settings["multiplier"] || 1;
          const priceFormat = settings["priceFormat"] || "compact";
          function parseNumberSetting(value, fallback) {
            const parsed = parseFloat(value);
            if (isNaN(parsed) || parsed <= 0) {
              return fallback;
            }
            return parsed;
          }
          function parseDigitsSetting(value, fallback) {
            const parsed = parseInt(value, 10);
            if (isNaN(parsed) || parsed < 0) {
              return fallback;
            }
            return parsed;
          }
          const digits = parseDigitsSetting(settings["digits"], 2);
          const highLowDigits = parseDigitsSetting(settings["highLowDigits"], digits);
          const baseFontSize = parseNumberSetting(settings["fontSizeBase"], 25);
          const priceFontSize = parseNumberSetting(settings["fontSizePrice"], baseFontSize * 35 / 25);
          const highLowFontSize = parseNumberSetting(settings["fontSizeHighLow"], baseFontSize);
          const changeFontSize = parseNumberSetting(settings["fontSizeChange"], baseFontSize * 19 / 25);
          const defaultBackgroundColor = settings["backgroundColor"] || "#000000";
          const defaultTextColor = settings["textColor"] || "#ffffff";
          let backgroundColor = defaultBackgroundColor;
          let textColor = defaultTextColor;
          const effectiveConnectionState = connectionState || values.connectionState || null;
          const priceValue = typeof values.last === "number" && Number.isFinite(values.last) ? values.last : null;
          const highValue = typeof values.high === "number" && Number.isFinite(values.high) ? values.high : null;
          const lowValue = typeof values.low === "number" && Number.isFinite(values.low) ? values.low : null;
          const changeDailyPercentValue = typeof values.changeDailyPercent === "number" && Number.isFinite(values.changeDailyPercent) ? values.changeDailyPercent : null;
          const changePercent = changeDailyPercentValue !== null ? changeDailyPercentValue * 100 : null;
          const dataState = typeof dataStateRaw === "string" ? dataStateRaw.toLowerCase() : "live";
          const degradedColor = dataState === "stale" ? "#f6a623" : dataState === "missing" ? "#d9534f" : null;
          const alertEvaluation = alertManager.evaluateAlert({
            context,
            settings,
            values,
            backgroundColor,
            textColor
          });
          const alert = alertEvaluation.alertMode;
          backgroundColor = alertEvaluation.backgroundColor;
          textColor = alertEvaluation.textColor;
          const baseColorContext = expressionEvaluator.buildContext(values, {
            alert,
            backgroundColor,
            textColor,
            defaultBackgroundColor,
            defaultTextColor
          });
          if (settings["backgroundColorRule"]) {
            try {
              const result = colorRuleEvaluator.evaluate(settings["backgroundColorRule"], baseColorContext);
              const stringResult = String(result || "").trim();
              if (stringResult) {
                backgroundColor = stringResult;
                baseColorContext.backgroundColor = backgroundColor;
              }
            } catch (err) {
              console.error("Error evaluating backgroundColorRule", {
                context,
                expression: settings["backgroundColorRule"],
                values,
                error: err instanceof Error ? err.message : err
              });
            }
          }
          if (settings["textColorRule"]) {
            try {
              baseColorContext.textColor = textColor;
              const result = colorRuleEvaluator.evaluate(settings["textColorRule"], baseColorContext);
              const stringResult = String(result || "").trim();
              if (stringResult) {
                textColor = stringResult;
                baseColorContext.textColor = textColor;
              }
            } catch (err) {
              console.error("Error evaluating textColorRule", {
                context,
                expression: settings["textColorRule"],
                values,
                error: err instanceof Error ? err.message : err
              });
            }
          }
          canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
          canvasContext.fillStyle = backgroundColor;
          canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
          const font = settings["font"] || "Lato";
          const baseFont = baseFontSize * sizeMultiplier + "px " + font;
          canvasContext.font = baseFont;
          canvasContext.fillStyle = textColor;
          canvasContext.textAlign = "left";
          canvasContext.textBaseline = "alphabetic";
          const pairBaselineY = 25 * sizeMultiplier;
          let pairTextX = textPadding;
          if (degradedColor) {
            const indicatorRadius = 5 * sizeMultiplier;
            const indicatorCenterX = textPadding + indicatorRadius;
            const indicatorCenterY = pairBaselineY - baseFontSize * sizeMultiplier * 0.4;
            canvasContext.beginPath();
            canvasContext.fillStyle = degradedColor;
            canvasContext.arc(indicatorCenterX, indicatorCenterY, indicatorRadius, 0, Math.PI * 2);
            canvasContext.fill();
            canvasContext.fillStyle = textColor;
            pairTextX += indicatorRadius * 2 + 6 * sizeMultiplier;
          }
          if (pairDisplay) {
            canvasContext.fillText(pairDisplay, pairTextX, pairBaselineY);
          }
          if (dataState === "stale") {
            const staleLabelBase = infoMessage ? infoMessage.toUpperCase() : "STALE";
            const staleTime = formatTimestampForDisplay(lastValidTimestamp);
            const staleLabel = staleTime ? staleLabelBase + " \u2022 " + staleTime : staleLabelBase;
            const staleFontSizePx = Math.max(14, baseFontSize * 0.6) * sizeMultiplier;
            canvasContext.font = staleFontSizePx + "px " + font;
            canvasContext.fillStyle = degradedColor || textColor;
            canvasContext.fillText(staleLabel, pairTextX, pairBaselineY + staleFontSizePx + 4 * sizeMultiplier);
            canvasContext.font = baseFont;
            canvasContext.fillStyle = textColor;
          }
          const shouldDisplayDetails = dataState !== "missing";
          if (!shouldDisplayDetails) {
            const messageText = infoMessage ? infoMessage.toUpperCase() : "NO DATA";
            const messageFontSizePx = Math.max(26, baseFontSize) * sizeMultiplier;
            const messageFont = "bold " + messageFontSizePx + "px " + font;
            canvasContext.font = messageFont;
            canvasContext.fillStyle = degradedColor || textColor;
            const previousAlign = canvasContext.textAlign;
            const previousBaseline = canvasContext.textBaseline;
            canvasContext.textAlign = "center";
            canvasContext.textBaseline = "middle";
            const maxWidth = canvasWidth - textPadding * 2;
            const messageLines = splitMessageIntoLines(canvasContext, messageText, maxWidth, messageFont);
            const lineHeight = messageFontSizePx * 1.1;
            const totalHeight = lineHeight * messageLines.length;
            const startY = (canvasHeight - totalHeight) / 2 + lineHeight / 2;
            for (let i = 0; i < messageLines.length; i++) {
              canvasContext.fillText(messageLines[i], canvasWidth / 2, startY + i * lineHeight);
            }
            canvasContext.textAlign = previousAlign;
            canvasContext.textBaseline = previousBaseline;
            canvasContext.font = baseFont;
            canvasContext.fillStyle = textColor;
          } else {
            const priceText = priceValue !== null ? formatters.getRoundedValue(priceValue, digits, multiplier, priceFormat) : "--";
            canvasContext.font = "bold " + priceFontSize * sizeMultiplier + "px " + font;
            canvasContext.fillStyle = textColor;
            canvasContext.textAlign = "left";
            canvasContext.fillText(priceText, textPadding, 60 * sizeMultiplier);
            if (settings["displayHighLow"] !== "off") {
              canvasContext.font = highLowFontSize * sizeMultiplier + "px " + font;
              canvasContext.fillStyle = textColor;
              canvasContext.textAlign = "left";
              const lowText = lowValue !== null ? formatters.getRoundedValue(lowValue, highLowDigits, multiplier, priceFormat) : "--";
              canvasContext.fillText(lowText, textPadding, 90 * sizeMultiplier);
              canvasContext.textAlign = "right";
              const highText = highValue !== null ? formatters.getRoundedValue(highValue, highLowDigits, multiplier, priceFormat) : "--";
              canvasContext.fillText(highText, canvasWidth - textPadding, 135 * sizeMultiplier);
            }
            if (settings["displayDailyChange"] !== "off" && changePercent !== null) {
              const originalFillColor = canvasContext.fillStyle;
              let digitsPercent = 2;
              if (Math.abs(changePercent) >= 100) {
                digitsPercent = 0;
              } else if (Math.abs(changePercent) >= 10) {
                digitsPercent = 1;
              }
              let changePercentDisplay = formatters.getRoundedValue(changePercent, digitsPercent, 1, "plain");
              if (changePercent > 0) {
                changePercentDisplay = "+" + changePercentDisplay;
                canvasContext.fillStyle = "green";
              } else if (changePercent < 0) {
                canvasContext.fillStyle = "red";
              } else {
                canvasContext.fillStyle = originalFillColor;
              }
              canvasContext.font = changeFontSize * sizeMultiplier + "px " + font;
              canvasContext.textAlign = "right";
              canvasContext.fillText(changePercentDisplay, canvasWidth - textPadding, 90 * sizeMultiplier);
              canvasContext.fillStyle = originalFillColor;
            }
            if (settings["displayHighLowBar"] !== "off" && highValue !== null && lowValue !== null && priceValue !== null) {
              const lineY = 104 * sizeMultiplier;
              const padding = 5 * sizeMultiplier;
              const lineWidth = 6 * sizeMultiplier;
              const range = highValue - lowValue;
              const percent = range > 0 ? Math.min(Math.max((priceValue - lowValue) / range, 0), 1) : DEFAULT_PRICE_BAR_POSITION;
              const lineLength = canvasWidth - padding * 2;
              const cursorPositionX = padding + Math.round(lineLength * percent);
              const triangleSide = 12 * sizeMultiplier;
              canvasContext.beginPath();
              canvasContext.moveTo(padding, lineY);
              canvasContext.lineTo(cursorPositionX, lineY);
              canvasContext.lineWidth = lineWidth;
              canvasContext.strokeStyle = "green";
              canvasContext.stroke();
              canvasContext.beginPath();
              canvasContext.moveTo(cursorPositionX, lineY);
              canvasContext.lineTo(canvasWidth - padding, lineY);
              canvasContext.lineWidth = lineWidth;
              canvasContext.strokeStyle = "red";
              canvasContext.stroke();
              drawPriceCursorTriangle(canvasContext, cursorPositionX, lineY, triangleSide, textColor);
            }
          }
          const connectionIconSetting = (settings["displayConnectionStatusIcon"] || "OFF").toUpperCase();
          if (connectionIconSetting !== "OFF") {
            renderConnectionStatusIcon({
              canvas,
              canvasContext,
              state: effectiveConnectionState,
              color: textColor,
              sizeMultiplier,
              position: connectionIconSetting,
              connectionStates
            });
          }
        }
        function renderCandlesCanvas(params) {
          const canvas = params.canvas;
          const canvasContext = params.canvasContext;
          const settings = params.settings || {};
          const candlesNormalized = params.candlesNormalized || [];
          const connectionStates = params.connectionStates;
          const connectionState = params.connectionState;
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const sizeMultiplier = getCanvasSizeMultiplier(canvasWidth, canvasHeight);
          const padding = 10 * sizeMultiplier;
          const connectionIconSetting = (settings["displayConnectionStatusIcon"] || "OFF").toUpperCase();
          const effectiveConnectionState = connectionState || null;
          const backgroundColor = settings["backgroundColor"] || "#000000";
          const textColor = settings["textColor"] || "#ffffff";
          const candlesToDisplay = candlesNormalized.slice(-getCandlesDisplayCount(settings));
          const candleCount = candlesToDisplay.length;
          const paddingWidth = canvasWidth - 2 * padding;
          const paddingHeight = canvasHeight - 2 * padding;
          const candleWidth = candleCount > 0 ? paddingWidth / candleCount : paddingWidth;
          const wickWidth = Math.max(2 * sizeMultiplier, candleWidth * 0.15);
          const bodyWidth = Math.max(4 * sizeMultiplier, candleWidth * 0.6);
          canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
          canvasContext.fillStyle = backgroundColor;
          canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
          const font = settings["font"] || "Lato";
          canvasContext.font = 15 * sizeMultiplier + "px " + font;
          canvasContext.fillStyle = textColor;
          const interval = settings["candlesInterval"] || "1h";
          canvasContext.textAlign = "right";
          canvasContext.fillText(interval, canvasWidth - 10 * sizeMultiplier, canvasHeight - 5 * sizeMultiplier);
          candlesToDisplay.forEach(function(candleNormalized) {
            const xPosition = Math.round(padding + Math.round(candleNormalized.timePercent * paddingWidth));
            const highPosition = Math.round(padding + paddingHeight - candleNormalized.highPercent * paddingHeight);
            const lowPosition = Math.round(padding + paddingHeight - candleNormalized.lowPercent * paddingHeight);
            canvasContext.beginPath();
            canvasContext.moveTo(xPosition, highPosition);
            canvasContext.lineTo(xPosition, lowPosition);
            canvasContext.lineWidth = wickWidth;
            canvasContext.strokeStyle = candleNormalized.closePercent > candleNormalized.openPercent ? "#1c9900" : "#a10";
            canvasContext.stroke();
            const openPosition = Math.round(padding + paddingHeight - candleNormalized.openPercent * paddingHeight);
            const closePosition = Math.round(padding + paddingHeight - candleNormalized.closePercent * paddingHeight);
            const candleMin = Math.min(openPosition, closePosition);
            const candleMax = Math.max(openPosition, closePosition);
            canvasContext.beginPath();
            canvasContext.rect(
              Math.round(xPosition - bodyWidth / 2),
              candleMin,
              Math.round(bodyWidth),
              Math.max(1, candleMax - candleMin)
            );
            canvasContext.fillStyle = candleNormalized.closePercent > candleNormalized.openPercent ? "#1c9900" : "#a10";
            canvasContext.fill();
          });
          if (connectionIconSetting !== "OFF") {
            renderConnectionStatusIcon({
              canvas,
              canvasContext,
              state: effectiveConnectionState,
              color: textColor,
              sizeMultiplier,
              position: connectionIconSetting,
              connectionStates
            });
          }
        }
        return {
          getCanvasSizeMultiplier,
          getCandlesDisplayCount,
          renderConnectionStatusIcon,
          renderTickerCanvas,
          renderCandlesCanvas,
          renderMessageCanvas
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.ts
  var require_ticker = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.ts"(exports, module) {
      "use strict";
      var defaultConfig = {
        "tProxyBase": "https://tproxyv8.opendle.com",
        "fallbackPollIntervalMs": 6e4,
        "staleTickerTimeoutMs": 6 * 60 * 1e3,
        "messages": {
          "loading": "LOADING...",
          "stale": "STALE",
          "noData": "NO DATA",
          "misconfigured": "INVALID PAIR",
          "conversionError": "CONVERSION ERROR"
        }
      };
      function requireOrNull(modulePath) {
        if (typeof __require === "function") {
          try {
            return __require(modulePath);
          } catch (err) {
            return null;
          }
        }
        return null;
      }
      function resolveGlobalConfig() {
        if (typeof CryptoTickerConfig !== "undefined") {
          return CryptoTickerConfig;
        }
        return null;
      }
      function normalizeCurrencyCode(value) {
        if (typeof value === "string") {
          const trimmed = value.trim();
          if (trimmed.length === 0) {
            return null;
          }
          return trimmed.toUpperCase();
        }
        if (value === null || value === void 0) {
          return null;
        }
        return String(value).trim().toUpperCase() || null;
      }
      var moduleConfig = requireOrNull("./config");
      var constantsModule = requireOrNull("./constants");
      var globalConfig = resolveGlobalConfig();
      var runtimeConfig = Object.assign({}, defaultConfig, moduleConfig || {}, globalConfig || {});
      var constants = constantsModule || (typeof CryptoTickerConstants !== "undefined" ? CryptoTickerConstants : null) || {};
      var TIMESTAMP_SECONDS_THRESHOLD = typeof constants.TIMESTAMP_SECONDS_THRESHOLD === "number" ? constants.TIMESTAMP_SECONDS_THRESHOLD : 9999999999;
      var tProxyBase = runtimeConfig.tProxyBase;
      var tProxyBaseNormalized = typeof tProxyBase === "string" ? tProxyBase.replace(/\/$/, "") : "";
      var TPROXY_CACHE_BYPASS_PARAM = "_ctBust";
      var DEFAULT_MESSAGE_CONFIG = defaultConfig.messages;
      var messageConfig = Object.assign({}, DEFAULT_MESSAGE_CONFIG, runtimeConfig && runtimeConfig.messages || {});
      function appendTProxyCacheBypassParam(url) {
        if (!url || typeof url !== "string") {
          return url;
        }
        try {
          const parsed = new URL(url);
          parsed.searchParams.set(TPROXY_CACHE_BYPASS_PARAM, Date.now().toString());
          return parsed.toString();
        } catch (err) {
          const separator = url.indexOf("?") === -1 ? "?" : "&";
          return url + separator + TPROXY_CACHE_BYPASS_PARAM + "=" + Date.now();
        }
      }
      function buildTProxyRequestConfig(url, baseOptions) {
        if (!url || typeof url !== "string") {
          return {
            url,
            options: baseOptions
          };
        }
        const normalizedUrl = url.replace(/\/$/, "");
        if (!tProxyBaseNormalized || normalizedUrl.indexOf(tProxyBaseNormalized) !== 0) {
          return {
            url,
            options: baseOptions
          };
        }
        const options = Object.assign({}, baseOptions || {});
        options.cache = "no-store";
        const headers = Object.assign({}, options.headers || {});
        headers["cache-control"] = "no-cache";
        headers["pragma"] = "no-cache";
        options.headers = headers;
        return {
          url: appendTProxyCacheBypassParam(url),
          options
        };
      }
      var subscriptionKeyModule = requireOrNull("./providers/subscription-key");
      var globalProviders = typeof CryptoTickerProviders !== "undefined" ? CryptoTickerProviders : null;
      var buildSubscriptionKey = subscriptionKeyModule && subscriptionKeyModule.buildSubscriptionKey ? subscriptionKeyModule.buildSubscriptionKey : globalProviders && typeof globalProviders.buildSubscriptionKey === "function" ? globalProviders.buildSubscriptionKey : function(exchange, symbol, fromCurrency, toCurrency) {
        const exchangePart = exchange || "";
        const symbolPart = symbol || "";
        const fromPart = fromCurrency || null;
        const toPart = toCurrency || null;
        let convertPart = "";
        if (fromPart !== null && toPart !== null && fromPart !== toPart) {
          convertPart = "__" + fromPart + "_" + toPart;
        }
        return exchangePart + "__" + symbolPart + convertPart;
      };
      var connectionStatesModule = requireOrNull("./providers/connection-states");
      var connectionStates = connectionStatesModule || (typeof CryptoTickerConnectionStates !== "undefined" ? CryptoTickerConnectionStates : {
        LIVE: "live",
        DETACHED: "detached",
        BACKUP: "backup",
        BROKEN: "broken"
      });
      var canvasRendererModule = requireOrNull("./canvas-renderer");
      var alertManagerModule = requireOrNull("./alert-manager");
      var formattersModule = requireOrNull("./formatters");
      var tickerStateModule = requireOrNull("./ticker-state");
      var settingsManagerModule = requireOrNull("./settings-manager");
      var canvasRenderer = canvasRendererModule || (typeof CryptoTickerCanvasRenderer !== "undefined" ? CryptoTickerCanvasRenderer : null);
      var alertManager = alertManagerModule || (typeof CryptoTickerAlertManager !== "undefined" ? CryptoTickerAlertManager : null);
      var formatters = formattersModule || (typeof CryptoTickerFormatters !== "undefined" ? CryptoTickerFormatters : null);
      var tickerState = tickerStateModule || (typeof CryptoTickerState !== "undefined" ? CryptoTickerState : null);
      var settingsManager = settingsManagerModule || (typeof CryptoTickerSettingsManager !== "undefined" ? CryptoTickerSettingsManager : null);
      if (!canvasRenderer || !alertManager || !formatters || !tickerState || !settingsManager) {
        throw new Error("CryptoTicker dependencies are not available");
      }
      var loggingEnabled = false;
      var websocket = null;
      var canvas;
      var canvasContext;
      var screenshotMode = false;
      var CONVERSION_CACHE_TTL_MS = 60 * 60 * 1e3;
      var providerRegistrySingleton = null;
      var applyDefaultSettings = settingsManager.applyDefaultSettings;
      var defaultSettings = settingsManager.defaultSettings;
      var getDefaultSettingsSnapshot = settingsManager.getDefaultSettingsSnapshot;
      var settingsSchema = settingsManager.settingsSchema;
      var tickerAction = {
        type: "com.courcelle.cryptoticker.ticker",
        log: function(...data) {
          if (loggingEnabled) {
            console.log(...data);
          }
        },
        setContextConnectionState: function(context, state) {
          tickerState.setConnectionState(context, state);
        },
        getContextConnectionState: function(context) {
          return tickerState.getConnectionState(context);
        },
        clearContextConnectionState: function(context) {
          tickerState.clearConnectionState(context);
        },
        getProviderRegistry: function() {
          if (!providerRegistrySingleton) {
            const providerRegistryModule = requireOrNull("./providers/provider-registry");
            const ProviderRegistryClass = providerRegistryModule && providerRegistryModule.ProviderRegistry ? providerRegistryModule.ProviderRegistry : globalProviders && globalProviders.ProviderRegistry ? globalProviders.ProviderRegistry : null;
            if (!ProviderRegistryClass) {
              throw new Error("ProviderRegistry is not available");
            }
            providerRegistrySingleton = new ProviderRegistryClass({
              baseUrl: tProxyBase,
              logger: (...args) => {
                this.log(...args);
              },
              fallbackPollIntervalMs: runtimeConfig.fallbackPollIntervalMs,
              staleTickerTimeoutMs: runtimeConfig.staleTickerTimeoutMs,
              binanceRestBaseUrl: runtimeConfig.binanceRestBaseUrl,
              binanceWsBaseUrl: runtimeConfig.binanceWsBaseUrl,
              binanceSymbolOverrides: runtimeConfig.binanceSymbolOverrides,
              bitfinexRestBaseUrl: runtimeConfig.bitfinexRestBaseUrl,
              bitfinexWsBaseUrl: runtimeConfig.bitfinexWsBaseUrl,
              bitfinexSymbolOverrides: runtimeConfig.bitfinexSymbolOverrides
            });
          }
          return providerRegistrySingleton;
        },
        websocketSend: function(object) {
          if (websocket) {
            websocket.send(object);
          }
        },
        onKeyDown: async function(context, settings, _coordinates, _userDesiredState) {
          switch (settings.mode) {
            case "candles":
              settings.mode = "ticker";
              break;
            case "ticker":
            default:
              if (alertManager.shouldDisarmOnKeyPress(context)) {
                alertManager.disarmAlert(context);
              } else {
                settings.mode = "candles";
              }
              break;
          }
          this.websocketSend(JSON.stringify({
            "event": "setSettings",
            "context": context,
            "payload": settings
          }));
          this.refreshTimer(context, settings);
        },
        onKeyUp: function(_context, _settings, _coordinates, _userDesiredState) {
        },
        onWillAppear: async function(context, settings, _coordinates) {
          this.initCanvas();
          this.refreshTimer(context, settings);
        },
        refreshTimers: async function() {
          tickerState.forEachContext((details) => {
            this.refreshTimer(
              details["context"],
              details["settings"]
            );
          });
        },
        refreshTimer: async function(context, settings) {
          const normalizedSettings = this.refreshSettings(context, settings);
          this.updateTicker(context, normalizedSettings);
        },
        connect: function() {
          const registry = this.getProviderRegistry();
          if (registry && typeof registry.ensureAllConnections === "function") {
            registry.ensureAllConnections();
          }
        },
        updateSubscription: function(context, settings) {
          const exchange = settings["exchange"];
          const pair = settings["pair"];
          const currencies = this.resolveConversionCurrencies(settings["fromCurrency"], settings["currency"]);
          const subscriptionKey = this.getSubscriptionContextKey(exchange, pair, currencies.from, null);
          const current = tickerState.getSubscription(context);
          if (current && current.key === subscriptionKey) {
            return current;
          }
          if (current && typeof current.unsubscribe === "function") {
            try {
              current.unsubscribe();
            } catch (err) {
              this.log("Error unsubscribing from provider", err);
            }
            tickerState.clearSubscription(context);
            this.clearContextConnectionState(context);
          }
          const registry = this.getProviderRegistry();
          const provider = registry.getProvider(exchange);
          const params = {
            exchange,
            symbol: pair,
            fromCurrency: currencies.from,
            toCurrency: null
          };
          const self2 = this;
          try {
            const handle = provider.subscribeTicker(params, {
              onData: async function(tickerValues) {
                const details = tickerState.getContextDetails(context);
                if (!details) {
                  return;
                }
                self2.setContextConnectionState(details.context, tickerValues && tickerValues.connectionState);
                try {
                  const convertedTicker = await self2.convertTickerValues(
                    tickerValues,
                    details.settings && details.settings.fromCurrency,
                    details.settings && details.settings.currency
                  );
                  await self2.updateCanvas(details.context, details.settings, convertedTicker);
                } catch (err) {
                  self2.log("Error updating canvas from subscription", err);
                }
              },
              onError: function(error) {
                self2.log("Provider subscription error", error);
                self2.setContextConnectionState(context, connectionStates.BROKEN);
              }
            });
            tickerState.setSubscription(context, {
              key: subscriptionKey,
              unsubscribe: handle && typeof handle.unsubscribe === "function" ? handle.unsubscribe : function() {
              },
              providerId: provider.getId ? provider.getId() : null
            });
            return tickerState.getSubscription(context);
          } catch (err) {
            this.log("Error subscribing to provider", err);
          }
          return null;
        },
        refreshSettings: function(context, settings) {
          return settingsManager.refreshSettings({
            context,
            settings,
            updateSubscription: (normalizedSettings) => {
              this.updateSubscription(context, normalizedSettings);
            }
          });
        },
        getSubscriptionContextKey: function(exchange, pair, fromCurrency, toCurrency) {
          return buildSubscriptionKey(exchange, pair, fromCurrency, toCurrency);
        },
        // Decide if conversion needed; empty/same override → `to:null`.
        resolveConversionCurrencies: function(fromCurrency, toCurrency) {
          const resolvedFrom = normalizeCurrencyCode(fromCurrency) || "USD";
          const resolvedTo = normalizeCurrencyCode(toCurrency);
          if (!resolvedTo || resolvedTo === resolvedFrom) {
            return {
              from: resolvedFrom,
              to: null
            };
          }
          return {
            from: resolvedFrom,
            to: resolvedTo
          };
        },
        getConversionRate: async function(fromCurrency, toCurrency) {
          const from = normalizeCurrencyCode(fromCurrency);
          const to = normalizeCurrencyCode(toCurrency);
          if (!from || !to || from === to) {
            return 1;
          }
          const key = from + "_" + to;
          const now = Date.now();
          const cacheEntry = tickerState.getOrCreateConversionRateEntry(key);
          if (typeof cacheEntry.rate === "number" && cacheEntry.rate > 0 && cacheEntry.fetchedAt && now - cacheEntry.fetchedAt < CONVERSION_CACHE_TTL_MS) {
            return cacheEntry.rate;
          }
          if (cacheEntry.promise) {
            try {
              return await cacheEntry.promise;
            } catch (promiseErr) {
              this.log("Conversion rate promise failed", promiseErr);
            }
          }
          const fetchFn = typeof fetch === "function" ? fetch : null;
          if (!fetchFn) {
            return typeof cacheEntry.rate === "number" && cacheEntry.rate > 0 ? cacheEntry.rate : 1;
          }
          const baseUrl = (tProxyBase || "").replace(/\/$/, "");
          if (!baseUrl) {
            return typeof cacheEntry.rate === "number" && cacheEntry.rate > 0 ? cacheEntry.rate : 1;
          }
          const url = baseUrl + "/api/ticker/json/currency/" + encodeURIComponent(from) + "/" + encodeURIComponent(to);
          const self2 = this;
          cacheEntry.promise = async function() {
            try {
              const request = buildTProxyRequestConfig(url);
              const response = await fetchFn(request.url, request.options);
              if (!response || !response.ok) {
                throw new Error("Conversion rate response not ok");
              }
              const json = await response.json();
              const parsedRate = json && json.rate !== void 0 ? parseFloat(json.rate) : NaN;
              if (!parsedRate || !isFinite(parsedRate) || parsedRate <= 0) {
                throw new Error("Invalid conversion rate");
              }
              cacheEntry.rate = parsedRate;
              cacheEntry.fetchedAt = Date.now();
              return parsedRate;
            } catch (err) {
              self2.log("Error fetching conversion rate", err);
              throw err;
            } finally {
              delete cacheEntry.promise;
            }
          }();
          try {
            return await cacheEntry.promise;
          } catch (err) {
            if (typeof cacheEntry.rate === "number" && cacheEntry.rate > 0) {
              return cacheEntry.rate;
            }
            return 1;
          }
        },
        convertTickerValues: async function(tickerValues, fromCurrency, toCurrency) {
          if (!tickerValues) {
            return tickerValues;
          }
          const currencies = this.resolveConversionCurrencies(fromCurrency, toCurrency);
          if (!currencies.to) {
            return tickerValues;
          }
          const existingTo = normalizeCurrencyCode(tickerValues.conversionToCurrency);
          const existingFrom = normalizeCurrencyCode(tickerValues.conversionFromCurrency);
          if (existingTo === currencies.to && existingFrom === currencies.from) {
            return tickerValues;
          }
          let rate = null;
          try {
            rate = await this.getConversionRate(currencies.from, currencies.to);
          } catch (err) {
            this.log("Conversion rate error", err);
            return this.createConversionErrorValues(tickerValues);
          }
          if (!rate || !isFinite(rate) || rate <= 0) {
            return this.createConversionErrorValues(tickerValues);
          }
          return this.applyTickerConversion(tickerValues, rate, currencies.from, currencies.to);
        },
        // Strip numeric fields when conversion fails so UI shows metadata + error text only.
        createConversionErrorValues: function(tickerValues) {
          const errorValues = Object.assign({}, tickerValues);
          const numericKeys = [
            "last",
            "high",
            "low",
            "open",
            "close",
            "changeDaily",
            "changeDailyPercent",
            "volume"
          ];
          for (let i = 0; i < numericKeys.length; i++) {
            const key = numericKeys[i];
            if (Object.prototype.hasOwnProperty.call(errorValues, key)) {
              delete errorValues[key];
            }
          }
          errorValues.conversionRate = null;
          errorValues.conversionError = true;
          return errorValues;
        },
        // Multiply numeric fields; parse strings providers sometimes emit.
        applyTickerConversion: function(tickerValues, rate, fromCurrency, toCurrency) {
          if (!tickerValues || typeof tickerValues !== "object") {
            return tickerValues;
          }
          const converted = Object.assign({}, tickerValues);
          const keysToConvert = [
            "last",
            "high",
            "low",
            "open",
            "close",
            "changeDaily"
          ];
          for (let i = 0; i < keysToConvert.length; i++) {
            const key = keysToConvert[i];
            if (!Object.prototype.hasOwnProperty.call(tickerValues, key)) {
              continue;
            }
            const value = tickerValues[key];
            const numeric = typeof value === "number" ? value : parseFloat(value);
            if (!isNaN(numeric)) {
              converted[key] = numeric * rate;
            }
          }
          converted.conversionRate = rate;
          converted.conversionFromCurrency = fromCurrency;
          converted.conversionToCurrency = toCurrency;
          return converted;
        },
        // Clone candles before scaling price/quote volume; keep shared cache untouched.
        applyCandlesConversion: function(candles, rate) {
          if (!Array.isArray(candles) || !rate || !isFinite(rate) || rate <= 0) {
            return candles;
          }
          return candles.map(function(candle) {
            if (!candle || typeof candle !== "object") {
              return candle;
            }
            const converted = Object.assign({}, candle);
            const priceKeys = ["open", "close", "high", "low"];
            for (let i = 0; i < priceKeys.length; i++) {
              const key = priceKeys[i];
              if (!Object.prototype.hasOwnProperty.call(candle, key)) {
                continue;
              }
              const value = candle[key];
              const numeric = typeof value === "number" ? value : parseFloat(value);
              if (!isNaN(numeric)) {
                converted[key] = numeric * rate;
              }
            }
            if (Object.prototype.hasOwnProperty.call(candle, "volumeQuote")) {
              const volumeValue = candle["volumeQuote"];
              const volumeNumeric = typeof volumeValue === "number" ? volumeValue : parseFloat(volumeValue);
              if (!isNaN(volumeNumeric)) {
                converted["volumeQuote"] = volumeNumeric * rate;
              }
            }
            return converted;
          });
        },
        updateTicker: async function(context, settings) {
          const pair = settings["pair"];
          const values = await this.getTickerValue(pair, settings.currency, settings.exchange, settings.fromCurrency);
          this.setContextConnectionState(context, values && values.connectionState);
          this.updateCanvas(context, settings, values);
        },
        initCanvas: function() {
          canvas = document.getElementById("ticker");
          canvasContext = canvas.getContext("2d");
        },
        updateCanvas: async function(context, settings, tickerValues) {
          this.log("updateCanvas", context, settings, tickerValues);
          const connectionState = tickerValues && tickerValues.connectionState || this.getContextConnectionState(context);
          switch (settings.mode) {
            case "candles": {
              const candleValues = await this.getCandles(settings);
              this.updateCanvasCandles(context, settings, candleValues, connectionState);
              break;
            }
            case "ticker":
            default:
              this.updateCanvasTicker(context, settings, tickerValues, connectionState);
              break;
          }
        },
        /**
         * Normalize raw ticker payload: parse numeric fields, flag basic metadata, align timestamp.
         *
         * @param {Object} values Raw ticker payload.
         * @returns {{values:Object, hasAny:boolean, hasCritical:boolean, timestamp:(number|null)}} Parsed summary consumed by renderers.
         */
        sanitizeTickerValues: function(values) {
          if (!values || typeof values !== "object") {
            return {
              values: {},
              hasAny: false,
              hasCritical: false,
              timestamp: null
            };
          }
          const sanitized = Object.assign({}, values);
          function parseNumeric(value, fallback, roundInteger) {
            if (typeof value === "number" && Number.isFinite(value)) {
              return roundInteger ? Math.round(value) : value;
            }
            if (typeof value === "string") {
              const trimmed = value.trim();
              if (trimmed) {
                const parsed = roundInteger ? parseInt(trimmed, 10) : parseFloat(trimmed);
                if (!isNaN(parsed) && Number.isFinite(parsed)) {
                  return roundInteger ? Math.round(parsed) : parsed;
                }
              }
            }
            return fallback;
          }
          const last = parseNumeric(values.last, null, false);
          if (last === null) {
            delete sanitized.last;
          } else {
            sanitized.last = last;
          }
          const numericDefaults = {
            high: null,
            low: null,
            volume: 0,
            changeDaily: 0,
            changeDailyPercent: 0
          };
          Object.keys(numericDefaults).forEach((key) => {
            const fallback = numericDefaults[key];
            const parsed = parseNumeric(values[key], fallback, false);
            if (parsed === null || parsed === void 0 || !Number.isFinite(parsed)) {
              delete sanitized[key];
            } else if (parsed === fallback && values[key] === void 0) {
              if (fallback === null) {
                delete sanitized[key];
              } else {
                sanitized[key] = fallback;
              }
            } else {
              sanitized[key] = parsed;
            }
          });
          const timestampCandidateKeys = ["lastUpdated", "timestamp", "time", "updatedAt"];
          let timestamp = null;
          for (let i = 0; i < timestampCandidateKeys.length; i++) {
            const key = timestampCandidateKeys[i];
            const hasValueKey = Object.prototype.hasOwnProperty.call(values, key);
            if (!hasValueKey) {
              continue;
            }
            const parsed = parseNumeric(values[key], null, true);
            if (parsed !== null && parsed !== void 0) {
              const normalizedTimestamp = parsed > TIMESTAMP_SECONDS_THRESHOLD ? parsed : parsed * 1e3;
              timestamp = normalizedTimestamp;
              sanitized.lastUpdated = normalizedTimestamp;
              break;
            }
          }
          if (typeof sanitized.pairDisplay !== "string") {
            delete sanitized.pairDisplay;
          }
          return {
            values: sanitized,
            hasAny: Object.keys(values).length > 0,
            hasCritical: last !== null,
            timestamp
          };
        },
        buildTickerRenderContext: function(context, settings, rawValues, connectionState) {
          const sanitizedResult = this.sanitizeTickerValues(rawValues);
          const sanitizedValues = sanitizedResult.values;
          const now = Date.now();
          let dataState = "missing";
          let infoMessage = null;
          let lastValidTimestamp = null;
          let renderValues = sanitizedValues;
          let degradedReason = null;
          const effectiveConnectionState = connectionState || sanitizedValues.connectionState || null;
          const cached = tickerState.getLastGoodTicker(context);
          const isBroken = effectiveConnectionState === connectionStates.BROKEN;
          const liveLikeStates = [connectionStates.LIVE, connectionStates.BACKUP, connectionStates.DETACHED];
          const isConnectionLiveLike = liveLikeStates.indexOf(effectiveConnectionState) !== -1;
          const looksLikeEmptyTicker = sanitizedResult.hasCritical && Number.isFinite(sanitizedValues.last) && sanitizedValues.last === 0 && (!Number.isFinite(sanitizedValues.high) || sanitizedValues.high === 0) && (!Number.isFinite(sanitizedValues.low) || sanitizedValues.low === 0) && (!Number.isFinite(sanitizedValues.volume) || sanitizedValues.volume === 0) && sanitizedResult.timestamp === null;
          const treatAsMisconfigured = sanitizedResult.hasCritical && (!isConnectionLiveLike || isBroken) && looksLikeEmptyTicker;
          const hasConversionError = !!sanitizedValues.conversionError;
          if (hasConversionError) {
            dataState = "missing";
            renderValues = Object.assign({}, sanitizedValues);
            const fallbackPair = settings["title"] || sanitizedValues["pairDisplay"] || sanitizedValues["pair"] || settings["pair"] || "";
            if (!renderValues.pairDisplay && fallbackPair) {
              renderValues.pairDisplay = fallbackPair;
            }
            infoMessage = messageConfig.conversionError || "CONVERSION ERROR";
            degradedReason = "conversion_error";
            return {
              values: renderValues,
              dataState,
              infoMessage,
              lastValidTimestamp,
              degradedReason
            };
          }
          if (sanitizedResult.hasCritical && !isBroken && !treatAsMisconfigured) {
            const recordedAt = sanitizedResult.timestamp || now;
            sanitizedValues.lastUpdated = recordedAt;
            tickerState.setLastGoodTicker(context, sanitizedValues, recordedAt);
            lastValidTimestamp = recordedAt;
            dataState = "live";
            renderValues = Object.assign({}, sanitizedValues);
          } else if (cached && cached.values && typeof cached.values === "object" && Number.isFinite(cached.values.last)) {
            dataState = "stale";
            renderValues = Object.assign({}, cached.values);
            lastValidTimestamp = cached.timestamp;
            if (!renderValues.lastUpdated) {
              renderValues.lastUpdated = cached.timestamp;
            }
            infoMessage = messageConfig.stale;
            degradedReason = sanitizedResult.hasAny ? "partial" : "missing";
          } else {
            dataState = "missing";
            renderValues = Object.assign({}, sanitizedValues);
            const fallbackPair = settings["title"] || sanitizedValues["pairDisplay"] || sanitizedValues["pair"] || settings["pair"] || "";
            if (!renderValues.pairDisplay && fallbackPair) {
              renderValues.pairDisplay = fallbackPair;
            }
            if (treatAsMisconfigured || isBroken) {
              infoMessage = messageConfig.misconfigured || messageConfig.noData;
              degradedReason = "misconfigured";
            } else {
              infoMessage = messageConfig.loading;
              degradedReason = sanitizedResult.hasAny ? "partial" : "none";
            }
          }
          if (!infoMessage && dataState === "missing") {
            infoMessage = isBroken ? messageConfig.misconfigured || messageConfig.noData : messageConfig.loading;
          }
          if (!infoMessage && dataState === "live" && isBroken) {
            infoMessage = messageConfig.misconfigured || messageConfig.noData;
          }
          if (!infoMessage && dataState === "stale" && !messageConfig.stale) {
            infoMessage = "STALE";
          }
          return {
            values: renderValues,
            dataState,
            infoMessage,
            lastValidTimestamp,
            degradedReason
          };
        },
        displayMessage: function(context, message, options) {
          this.initCanvas();
          const opts = options || {};
          const normalizedSettings = applyDefaultSettings(opts.settings || {});
          const backgroundColor = opts.backgroundColor || normalizedSettings.backgroundColor || "#000000";
          const textColor = opts.textColor || normalizedSettings.textColor || "#ffffff";
          const font = opts.font || normalizedSettings.font || "Lato";
          const fontSize = opts.fontSize || null;
          const desiredConnectionState = opts.connectionState || null;
          const displayConnectionIcon = opts.displayConnectionStatusIcon || normalizedSettings.displayConnectionStatusIcon || "OFF";
          if (desiredConnectionState) {
            this.setContextConnectionState(context, desiredConnectionState);
          }
          canvasRenderer.renderMessageCanvas({
            canvas,
            canvasContext,
            message,
            backgroundColor,
            textColor,
            font,
            fontSize,
            connectionStates,
            connectionState: desiredConnectionState || this.getContextConnectionState(context),
            displayConnectionStatusIcon: displayConnectionIcon
          });
          this.sendCanvas(context);
        },
        getCanvasSizeMultiplier: function(canvasWidth, canvasHeight) {
          return canvasRenderer.getCanvasSizeMultiplier(canvasWidth, canvasHeight);
        },
        getCandlesDisplayCount: function(settings) {
          return canvasRenderer.getCandlesDisplayCount(settings);
        },
        updateCanvasTicker: function(context, settings, values, connectionState) {
          this.log("updateCanvasTicker", context, settings, values);
          const renderContext = this.buildTickerRenderContext(context, settings, values, connectionState);
          canvasRenderer.renderTickerCanvas({
            canvas,
            canvasContext,
            settings,
            values: renderContext.values,
            context,
            connectionStates,
            connectionState: connectionState || values && values.connectionState || null,
            dataState: renderContext.dataState,
            infoMessage: renderContext.infoMessage,
            lastValidTimestamp: renderContext.lastValidTimestamp,
            degradedReason: renderContext.degradedReason
          });
          this.sendCanvas(context);
        },
        updateCanvasCandles: function(context, settings, candlesNormalized, connectionState) {
          this.log("updateCanvasCandles", context, settings, candlesNormalized);
          canvasRenderer.renderCandlesCanvas({
            canvas,
            canvasContext,
            settings,
            candlesNormalized,
            connectionStates,
            connectionState: connectionState || this.getContextConnectionState(context)
          });
          this.sendCanvas(context);
        },
        sendCanvas: function(context) {
          var json = {
            "event": "setImage",
            "context": context,
            "payload": {
              "image": canvas.toDataURL(),
              "target": DestinationEnum.HARDWARE_AND_SOFTWARE
            }
          };
          this.websocketSend(JSON.stringify(json));
        },
        getRoundedValue: function(value, digits, multiplier, format) {
          return formatters.getRoundedValue(value, digits, multiplier, format);
        },
        getTickerValue: async function(pair, toCurrency, exchange, fromCurrency) {
          const registry = this.getProviderRegistry();
          const provider = registry.getProvider(exchange);
          const currencies = this.resolveConversionCurrencies(fromCurrency, toCurrency);
          const params = {
            exchange,
            symbol: pair,
            fromCurrency: currencies.from,
            toCurrency: null
          };
          try {
            const ticker = await provider.fetchTicker(params);
            const convertedTicker = await this.convertTickerValues(ticker, currencies.from, currencies.to);
            const finalTicker = convertedTicker || ticker;
            if (finalTicker && typeof finalTicker === "object" && !finalTicker.connectionState) {
              finalTicker.connectionState = connectionStates.DETACHED;
            }
            return finalTicker;
          } catch (err) {
            this.log("Error fetching ticker", err);
            const subscriptionKey = this.getSubscriptionContextKey(exchange, pair, currencies.from, null);
            if (provider && typeof provider.getCachedTicker === "function") {
              const cached = provider.getCachedTicker(subscriptionKey);
              if (cached) {
                const convertedCached = await this.convertTickerValues(cached, currencies.from, currencies.to);
                const finalCached = convertedCached || cached;
                if (finalCached && !finalCached.connectionState) {
                  finalCached.connectionState = connectionStates.BACKUP;
                }
                return finalCached;
              }
            }
            return {
              "changeDaily": 0,
              "changeDailyPercent": 0,
              "last": 0,
              "volume": 0,
              "high": 0,
              "low": 0,
              "pair": pair,
              "pairDisplay": pair,
              "connectionState": connectionStates.BROKEN
            };
          }
        },
        getCandles: async function(settings) {
          this.log("getCandles");
          const exchange = settings["exchange"];
          const pair = settings["pair"];
          const interval = this.convertCandlesInterval(settings["candlesInterval"] || "1h");
          const candlesCount = this.getCandlesDisplayCount(settings);
          const currencies = this.resolveConversionCurrencies(settings["fromCurrency"], settings["currency"]);
          const cacheCurrencyKey = currencies.to || currencies.from || "";
          const cacheKey = exchange + "_" + pair + "_" + interval + "_" + candlesCount + "_" + cacheCurrencyKey;
          let cache = tickerState.getCandlesCacheEntry(cacheKey);
          if (!cache) {
            cache = {};
            tickerState.setCandlesCacheEntry(cacheKey, cache);
          }
          const now = (/* @__PURE__ */ new Date()).getTime();
          const t = "time";
          const c = "candles";
          if (cache[t] && cache[t] > now - 60 * 1e3) {
            return cache[c];
          }
          const fetchParams = {
            exchange,
            symbol: pair,
            interval,
            limit: 24
          };
          let rawCandles = null;
          try {
            const registry = this.getProviderRegistry();
            const provider = registry.getProvider(exchange);
            if (provider && typeof provider.fetchCandles === "function") {
              rawCandles = await provider.fetchCandles(fetchParams);
            }
            if (!Array.isArray(rawCandles)) {
              rawCandles = null;
            }
            if (rawCandles === null) {
              const genericProvider = registry.getGenericProvider();
              if (genericProvider && typeof genericProvider.fetchCandles === "function") {
                rawCandles = await genericProvider.fetchCandles(fetchParams);
                if (!Array.isArray(rawCandles)) {
                  rawCandles = null;
                }
              }
            }
          } catch (err) {
            this.log("Error fetching provider candles", err);
            rawCandles = null;
          }
          if (rawCandles === null) {
            try {
              const proxyUrl = tProxyBase + "/api/Candles/json/" + exchange + "/" + pair + "/" + interval + "?limit=24";
              const request = buildTProxyRequestConfig(proxyUrl);
              const response = await fetch(
                request.url,
                request.options
              );
              const responseJson = await response.json();
              if (responseJson && Array.isArray(responseJson.candles)) {
                rawCandles = responseJson.candles;
              }
            } catch (e) {
              this.log("Error fetching candles from proxy", e);
            }
          }
          if (!Array.isArray(rawCandles)) {
            return cache[c] || [];
          }
          const preparedCandles = this.prepareCandlesForDisplay(rawCandles, candlesCount);
          let candlesForDisplay = preparedCandles;
          if (currencies.to) {
            try {
              const rate = await this.getConversionRate(currencies.from, currencies.to);
              if (rate && isFinite(rate) && rate > 0) {
                candlesForDisplay = this.applyCandlesConversion(preparedCandles, rate);
              }
            } catch (err) {
              this.log("Conversion rate error for candles", err);
            }
          }
          const val = this.getCandlesNormalized(candlesForDisplay);
          cache[t] = now;
          cache[c] = val;
          return cache[c];
        },
        convertCandlesInterval: function(interval) {
          switch (interval) {
            case "1m":
              return "MINUTES_1";
            case "5m":
              return "MINUTES_5";
            case "15m":
              return "MINUTES_15";
            case "1h":
              return "HOURS_1";
            case "6h":
              return "HOURS_6";
            case "12h":
              return "HOURS_12";
            case "1D":
              return "DAYS_1";
            case "7D":
              return "DAYS_7";
            case "1M":
              return "MONTHS_1";
          }
          return interval;
        },
        prepareCandlesForDisplay: function(candles, maxCount) {
          if (!Array.isArray(candles) || candles.length === 0) {
            return [];
          }
          const sanitized = candles.map(function(candle) {
            if (!candle) {
              return null;
            }
            let ts = candle["ts"];
            if (typeof ts !== "number") {
              const openTime = candle["openTime"];
              if (openTime) {
                const parsedOpenTime = Date.parse(openTime);
                if (!isNaN(parsedOpenTime)) {
                  ts = Math.floor(parsedOpenTime / 1e3);
                }
              }
            }
            if (typeof ts !== "number" || isNaN(ts)) {
              return null;
            }
            return {
              candle,
              ts
            };
          }).filter(function(item) {
            return item !== null;
          }).sort(function(a, b) {
            return a.ts - b.ts;
          }).map(function(item) {
            if (item.candle["ts"] === item.ts) {
              return item.candle;
            }
            return Object.assign({}, item.candle, {
              "ts": item.ts
            });
          });
          if (typeof maxCount === "number" && maxCount > 0 && sanitized.length > maxCount) {
            return sanitized.slice(-maxCount);
          }
          return sanitized;
        },
        getCandlesNormalized: function(candles) {
          let min = Number.POSITIVE_INFINITY;
          let max = 0;
          let volumeMin = Number.POSITIVE_INFINITY;
          let volumeMax = 0;
          let timeMin = Number.POSITIVE_INFINITY;
          let timeMax = 0;
          (candles || []).forEach(function(candle) {
            timeMin = Math.min(timeMin, candle["ts"]);
            timeMax = Math.max(timeMax, candle["ts"]);
            min = Math.min(min, candle["open"]);
            min = Math.min(min, candle["close"]);
            min = Math.min(min, candle["high"]);
            min = Math.min(min, candle["low"]);
            max = Math.max(max, candle["open"]);
            max = Math.max(max, candle["close"]);
            max = Math.max(max, candle["high"]);
            max = Math.max(max, candle["low"]);
            volumeMin = Math.min(volumeMin, candle["volumeQuote"]);
            volumeMax = Math.max(volumeMax, candle["volumeQuote"]);
          });
          const jThis = this;
          const candlesNormalized = [];
          (candles || []).forEach(function(candle) {
            candlesNormalized.push({
              timePercent: jThis.normalizeValue(candle["ts"], timeMin, timeMax),
              openPercent: jThis.normalizeValue(candle["open"], min, max),
              closePercent: jThis.normalizeValue(candle["close"], min, max),
              highPercent: jThis.normalizeValue(candle["high"], min, max),
              lowPercent: jThis.normalizeValue(candle["low"], min, max),
              volumePercent: jThis.normalizeValue(candle["volumeQuote"], volumeMin, volumeMax)
            });
          });
          this.log("getCandlesNormalized", candlesNormalized);
          return candlesNormalized;
        },
        normalizeValue: function(value, min, max) {
          return formatters.normalizeValue(value, min, max);
        }
      };
      tickerAction.defaultSettings = defaultSettings;
      tickerAction.applyDefaultSettings = applyDefaultSettings;
      tickerAction.getDefaultSettings = function() {
        return getDefaultSettingsSnapshot();
      };
      tickerAction.settingsSchema = settingsSchema;
      function connectElgatoStreamDeckSocket(inPort, pluginUUID, inRegisterEvent, _inApplicationInfo, _inActionInfo) {
        websocket = new WebSocket("ws://127.0.0.1:" + inPort);
        function registerPlugin(inPluginUUID) {
          var json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
          };
          tickerAction.websocketSend(JSON.stringify(json));
        }
        ;
        websocket.onopen = function() {
          registerPlugin(pluginUUID);
        };
        websocket.onmessage = async function(evt) {
          var jsonObj = JSON.parse(evt.data);
          const event = jsonObj["event"];
          const context = jsonObj["context"];
          const jsonPayload = jsonObj["payload"] || {};
          let settingsPayload = jsonPayload["settings"];
          if (!settingsPayload && event === "sendToPlugin") {
            settingsPayload = jsonPayload;
          }
          let settings = settingsPayload;
          const coordinates = jsonPayload["coordinates"];
          const userDesiredState = jsonPayload["userDesiredState"];
          const ignoredEvents = [
            "deviceDidConnect",
            "titleParametersDidChange"
          ];
          if (ignoredEvents.indexOf(event) >= 0) {
            return;
          }
          if (settings != null) {
            settings = applyDefaultSettings(settings);
          }
          if (event == "keyDown") {
            await tickerAction.onKeyDown(context, settings, coordinates, userDesiredState);
          } else if (event == "keyUp") {
            await tickerAction.onKeyUp(context, settings, coordinates, userDesiredState);
          } else if (event == "willAppear") {
            await tickerAction.onWillAppear(context, settings, coordinates);
          } else if (settings != null) {
            tickerAction.refreshSettings(context, settings);
            tickerAction.refreshTimer(context, settings);
          }
        };
        websocket.onclose = function() {
        };
        setInterval(async function() {
          await tickerAction.refreshTimers();
        }, 3e5);
      }
      if (screenshotMode) {
        loggingEnabled = true;
        tickerAction.connect();
        const settings = applyDefaultSettings({
          digits: 0,
          pair: "LTCUSD",
          mode: "ticker"
        });
        const context = "test";
        const coordinates = {
          "column": 1,
          "row": 1
        };
        const userDesiredState = null;
        setTimeout(function() {
          tickerAction.onWillAppear(context, settings, coordinates);
          setInterval(async function() {
            await tickerAction.onKeyDown(context, settings, coordinates, userDesiredState);
            await tickerAction.onKeyUp(context, settings, coordinates, userDesiredState);
          }, 5e3);
        }, 1e3);
      }
      if (typeof module !== "undefined") {
        module.exports = tickerAction;
      }
      if (typeof window !== "undefined") {
        window.connectElgatoStreamDeckSocket = connectElgatoStreamDeckSocket;
      }
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/entries/plugin-entry.ts
  var import_signalr_v8_0_0_min = __toESM(require_signalr_v8_0_0_min());
  var import_config = __toESM(require_config());
  var import_connection_states = __toESM(require_connection_states());
  var import_subscription_key = __toESM(require_subscription_key());
  var import_provider_interface = __toESM(require_provider_interface());
  var import_ticker_subscription_manager = __toESM(require_ticker_subscription_manager());
  var import_generic_provider = __toESM(require_generic_provider());
  var import_default_settings = __toESM(require_default_settings());
  var import_websocket_connection_pool = __toESM(require_websocket_connection_pool());
  var import_binance_provider = __toESM(require_binance_provider());
  var import_bitfinex_provider = __toESM(require_bitfinex_provider());
  var import_yfinance_provider = __toESM(require_yfinance_provider());
  var import_provider_registry = __toESM(require_provider_registry());
  var import_formatters = __toESM(require_formatters());
  var import_expression_evaluator = __toESM(require_expression_evaluator());
  var import_alert_manager = __toESM(require_alert_manager());
  var import_ticker_state = __toESM(require_ticker_state());
  var import_settings_manager = __toESM(require_settings_manager());
  var import_canvas_renderer = __toESM(require_canvas_renderer());
  var import_ticker = __toESM(require_ticker());
})();
//# sourceMappingURL=plugin.bundle.js.map
