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
        const defaultSettings2 = applyDefaults(null);
        return {
          settingsSchema,
          defaultSettings: defaultSettings2,
          getDefaultSettings: function() {
            return clone(defaultSettings2);
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

  // node_modules/expr-eval/dist/bundle.js
  var require_bundle = __commonJS({
    "node_modules/expr-eval/dist/bundle.js"(exports, module) {
      (function(global, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = global || self, factory(global.exprEval = {}));
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

  // com.courcelle.cryptoticker-dev.sdPlugin/js/pi/providers/index.ts
  var require_providers = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/pi/providers/index.ts"(exports) {
      "use strict";
      (function(root) {
        const namespace = root.CryptoTickerPIProviders = root.CryptoTickerPIProviders || {};
        const providers = namespace._providers = namespace._providers || {};
        namespace.registerProvider = function(provider) {
          if (!provider || typeof provider.id !== "string") {
            return;
          }
          providers[provider.id.toUpperCase()] = provider;
        };
        namespace.getProvider = function(providerId) {
          if (typeof providerId !== "string") {
            return null;
          }
          return providers[providerId.toUpperCase()] || null;
        };
        namespace.listProviders = function() {
          return Object.keys(providers);
        };
      })(typeof self !== "undefined" ? self : exports);
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/pi/providers/binance.ts
  var require_binance = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/pi/providers/binance.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        const globalRoot = typeof globalThis !== "undefined" ? globalThis : root;
        const namespace = globalRoot && globalRoot.CryptoTickerPIProviders ? globalRoot.CryptoTickerPIProviders : null;
        const provider = factory();
        if (typeof module === "object" && module.exports) {
          module.exports = provider;
        }
        if (namespace && typeof namespace.registerProvider === "function") {
          namespace.registerProvider(provider);
        }
      })(typeof self !== "undefined" ? self : exports, function() {
        const API_URL = "https://api.binance.com/api/v3/exchangeInfo";
        async function getPairs() {
          const response = await fetch(API_URL);
          const json = await response.json();
          const symbols = Array.isArray(json.symbols) ? json.symbols : [];
          return symbols.filter(function(item) {
            if (!item) {
              return false;
            }
            if (item.status && item.status !== "TRADING") {
              return false;
            }
            const symbol = item.symbol || "";
            return symbol.length > 0;
          }).map(function(item) {
            const symbol = (item.symbol || "").toUpperCase();
            return {
              value: symbol,
              display: symbol,
              symbol
            };
          });
        }
        return {
          id: "BINANCE",
          getPairs
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/pi/providers/bitfinex.ts
  var require_bitfinex = __commonJS({
    "com.courcelle.cryptoticker-dev.sdPlugin/js/pi/providers/bitfinex.ts"(exports, module) {
      "use strict";
      (function(root, factory) {
        const globalRoot = typeof globalThis !== "undefined" ? globalThis : root;
        const namespace = globalRoot && globalRoot.CryptoTickerPIProviders ? globalRoot.CryptoTickerPIProviders : null;
        const provider = factory();
        if (typeof module === "object" && module.exports) {
          module.exports = provider;
        }
        if (namespace && typeof namespace.registerProvider === "function") {
          namespace.registerProvider(provider);
        }
      })(typeof self !== "undefined" ? self : exports, function() {
        const API_URL = "https://api-pub.bitfinex.com/v2/conf/pub:list:pair:exchange";
        async function getPairs() {
          const response = await fetch(API_URL);
          const json = await response.json();
          const list = Array.isArray(json) && Array.isArray(json[0]) ? json[0] : [];
          return list.map(function(value) {
            const display = (value || "").toUpperCase();
            const sanitized = display.replace(/[:/]/g, "");
            return {
              value: display,
              display,
              symbol: sanitized
            };
          });
        }
        return {
          id: "BITFINEX",
          getPairs
        };
      });
    }
  });

  // com.courcelle.cryptoticker-dev.sdPlugin/js/entries/pi-entry.ts
  var import_config = __toESM(require_config());
  var import_connection_states = __toESM(require_connection_states());
  var import_default_settings = __toESM(require_default_settings());
  var import_expression_evaluator = __toESM(require_expression_evaluator());
  var import_providers = __toESM(require_providers());
  var import_binance = __toESM(require_binance());
  var import_bitfinex = __toESM(require_bitfinex());

  // com.courcelle.cryptoticker-dev.sdPlugin/js/pi.ts
  var websocket = null;
  var uuid = null;
  var actionInfo = {};
  var expressionEvaluatorModule = typeof CryptoTickerExpressionEvaluator !== "undefined" ? CryptoTickerExpressionEvaluator : null;
  var connectionStatesModule = typeof CryptoTickerConnectionStates !== "undefined" ? CryptoTickerConnectionStates : {
    LIVE: "live",
    DETACHED: "detached",
    BACKUP: "backup",
    BROKEN: "broken"
  };
  var connectionStatusIconsModule = typeof CryptoTickerConnectionStatusIcons !== "undefined" ? CryptoTickerConnectionStatusIcons : null;
  var expressionEvaluatorInstances = function() {
    if (!expressionEvaluatorModule) {
      return {
        alert: null,
        color: null
      };
    }
    const baseAllowed = expressionEvaluatorModule.allowedVariables ? expressionEvaluatorModule.allowedVariables.slice(0) : [];
    const colorAllowed = baseAllowed.slice(0);
    const extraColorVariables = [
      "alert",
      "backgroundColor",
      "textColor",
      "defaultBackgroundColor",
      "defaultTextColor"
    ];
    for (let i = 0; i < extraColorVariables.length; i++) {
      if (colorAllowed.indexOf(extraColorVariables[i]) === -1) {
        colorAllowed.push(extraColorVariables[i]);
      }
    }
    return {
      alert: expressionEvaluatorModule.createEvaluator(),
      color: expressionEvaluatorModule.createEvaluator({
        allowedVariables: colorAllowed
      })
    };
  }();
  var EXPRESSION_SAMPLE_VALUES = {
    last: 100,
    high: 120,
    low: 80,
    changeDaily: 2,
    changeDailyPercent: 0.02,
    volume: 1e5
  };
  var EXPRESSION_SAMPLE_COLOR_OVERRIDES = {
    alert: false,
    backgroundColor: "#000000",
    textColor: "#ffffff",
    defaultBackgroundColor: "#000000",
    defaultTextColor: "#ffffff"
  };
  function buildSampleAlertContext() {
    if (!expressionEvaluatorModule) {
      return {};
    }
    return expressionEvaluatorModule.buildBaseContext(EXPRESSION_SAMPLE_VALUES);
  }
  function buildSampleColorContext() {
    if (!expressionEvaluatorModule) {
      return {};
    }
    return expressionEvaluatorModule.buildContext(
      EXPRESSION_SAMPLE_VALUES,
      Object.assign({}, EXPRESSION_SAMPLE_COLOR_OVERRIDES)
    );
  }
  var expressionValidationTargets = [
    {
      key: "alertRule",
      evaluator: expressionEvaluatorInstances.alert,
      contextBuilder: buildSampleAlertContext
    },
    {
      key: "backgroundColorRule",
      evaluator: expressionEvaluatorInstances.color,
      contextBuilder: buildSampleColorContext
    },
    {
      key: "textColorRule",
      evaluator: expressionEvaluatorInstances.color,
      contextBuilder: buildSampleColorContext
    }
  ];
  var tProxyBase = "https://tproxyv8.opendle.com";
  var tProxyBaseNormalized = typeof tProxyBase === "string" ? tProxyBase.replace(/\/$/, "") : "";
  var TPROXY_CACHE_BYPASS_PARAM = "_ctBust";
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
  function applyTProxyCacheBypass(url, baseOptions) {
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
      url: appendCacheBypassParam(url),
      options
    };
  }
  var loggingEnabled = false;
  var selectPairDropdown = document.getElementById("select-pair-dropdown");
  var pairSearchInput = document.getElementById("select-pair-search");
  var pairSearchFeedback = document.getElementById("pair-search-feedback");
  var FETCH_TIMEOUT_MS = 1e4;
  var FETCH_MAX_ATTEMPTS = 3;
  var RETRY_BASE_DELAY_MS = 600;
  var MAX_RETRY_DELAY_MS = 5e3;
  function wait(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  }
  function safeInvokeRetryCallback(callback, payload, label) {
    if (typeof callback !== "function") {
      return;
    }
    try {
      callback(payload);
    } catch (callbackErr) {
      console.error("fetchJsonWithRetry " + label + " failed", callbackErr);
    }
  }
  function createAbortControllerWithTimeout(timeout) {
    if (typeof AbortController === "undefined") {
      return {
        controller: null,
        timerId: null
      };
    }
    const controller = new AbortController();
    const timerId = setTimeout(function() {
      controller.abort();
    }, timeout);
    return {
      controller,
      timerId
    };
  }
  function clearAbortTimer(timerId) {
    if (timerId) {
      clearTimeout(timerId);
    }
  }
  async function performJsonFetch(url, controller, baseFetchOptions) {
    const fetchOptions = Object.assign({}, baseFetchOptions || {});
    if (controller) {
      fetchOptions.signal = controller.signal;
    }
    const proxySafeRequest = applyTProxyCacheBypass(url, fetchOptions);
    const response = await fetch(proxySafeRequest.url, proxySafeRequest.options);
    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }
    const raw = await response.text();
    if (!raw || raw.trim().length === 0) {
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch (err) {
      const parseError = err instanceof Error ? err : new Error(String(err));
      parseError.message = "Failed to parse JSON response from " + url + ": " + parseError.message;
      throw parseError;
    }
  }
  function formatCacheTimestamp(timestamp) {
    if (!timestamp) {
      return "";
    }
    try {
      return new Date(timestamp).toLocaleString();
    } catch (err) {
      return new Date(timestamp).toString();
    }
  }
  function buildStaleDataMessage(timestamp) {
    const formatted = formatCacheTimestamp(timestamp);
    if (!formatted) {
      return "Showing cached data. Data may be outdated.";
    }
    return "Showing cached data from " + formatted + ". Data may be outdated.";
  }
  var networkStatusManager = /* @__PURE__ */ function() {
    const config = {
      providers: {
        selectId: "select-provider",
        loadingMessage: "Loading providers...",
        retryMessage: "Failed to load providers. Retrying..."
      },
      pairs: {
        selectId: "select-pair-dropdown",
        extraDisableIds: ["select-pair-search"],
        loadingMessage: "Loading pairs...",
        retryMessage: "Failed to load pairs. Retrying..."
      },
      currencies: {
        selectId: "select-currency",
        loadingMessage: "Loading currencies...",
        retryMessage: "Failed to load currencies. Retrying..."
      }
    };
    const state = {};
    function ensure(key) {
      if (state[key]) {
        return state[key];
      }
      const conf = config[key];
      if (!conf) {
        return null;
      }
      const select = document.getElementById(conf.selectId);
      if (!select || !select.parentNode) {
        return null;
      }
      const extraDisableElements = [];
      if (Array.isArray(conf.extraDisableIds)) {
        conf.extraDisableIds.forEach(function(extraId) {
          const extraElement = document.getElementById(extraId);
          if (extraElement) {
            extraDisableElements.push(extraElement);
          }
        });
      }
      const status = document.createElement("div");
      status.className = "pi-network-status";
      status.setAttribute("role", "status");
      status.style.display = "none";
      const spinner = document.createElement("span");
      spinner.className = "pi-network-status__spinner";
      status.appendChild(spinner);
      const text = document.createElement("span");
      text.className = "pi-network-status__text";
      status.appendChild(text);
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "pi-network-status__retry";
      retry.textContent = "Retry";
      retry.style.display = "none";
      status.appendChild(retry);
      select.parentNode.appendChild(status);
      const warning = document.createElement("div");
      warning.className = "pi-network-status__warning";
      warning.style.display = "none";
      select.parentNode.appendChild(warning);
      state[key] = {
        select,
        status,
        spinner,
        text,
        retry,
        warning,
        extraDisableElements
      };
      return state[key];
    }
    function setState(key, options) {
      const entry = ensure(key);
      if (!entry) {
        return;
      }
      const opts = options || {};
      entry.status.style.display = opts.message ? "" : "none";
      entry.text.textContent = opts.message || "";
      entry.spinner.style.display = opts.spinner ? "" : "none";
      entry.retry.style.display = opts.showRetry ? "" : "none";
      entry.retry.onclick = typeof opts.onRetry === "function" ? opts.onRetry : null;
      entry.status.classList.remove("is-error", "is-warning", "is-success");
      if (opts.tone === "error") {
        entry.status.classList.add("is-error");
      } else if (opts.tone === "warning") {
        entry.status.classList.add("is-warning");
      } else if (opts.tone === "success") {
        entry.status.classList.add("is-success");
      }
      if (entry.select) {
        entry.select.disabled = !!opts.disableSelect;
      }
      if (entry.extraDisableElements && entry.extraDisableElements.length) {
        for (let i = 0; i < entry.extraDisableElements.length; i++) {
          const target = entry.extraDisableElements[i];
          if (target) {
            target.disabled = !!opts.disableSelect;
          }
        }
      }
    }
    function showWarning(key, message) {
      const entry = ensure(key);
      if (!entry) {
        return;
      }
      const msg = message || "";
      entry.warning.style.display = msg ? "" : "none";
      entry.warning.textContent = msg;
    }
    function clear(key) {
      setState(key, {});
      showWarning(key, "");
      const entry = state[key];
      if (entry && entry.select) {
        entry.select.disabled = false;
      }
    }
    return {
      ensure,
      setState,
      showWarning,
      clear,
      config
    };
  }();
  async function fetchJsonWithRetry(url, options) {
    const opts = options || {};
    const attempts = Math.max(1, opts.attempts || FETCH_MAX_ATTEMPTS);
    const timeout = opts.timeout || FETCH_TIMEOUT_MS;
    let lastError = null;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      safeInvokeRetryCallback(opts.onAttemptStart, {
        attempt,
        maxAttempts: attempts
      }, "onAttemptStart");
      const abortContext = createAbortControllerWithTimeout(timeout);
      try {
        const fetchOptions = opts.fetchOptions || {};
        const result = await performJsonFetch(url, abortContext.controller, fetchOptions);
        clearAbortTimer(abortContext.timerId);
        return result;
      } catch (err) {
        lastError = err;
        clearAbortTimer(abortContext.timerId);
        safeInvokeRetryCallback(opts.onAttemptError, {
          attempt,
          maxAttempts: attempts,
          error: err
        }, "onAttemptError");
        if (attempt < attempts) {
          const delayBase = opts.retryBaseDelay || RETRY_BASE_DELAY_MS;
          const delay = Math.min(MAX_RETRY_DELAY_MS, delayBase * Math.pow(2, attempt - 1));
          await wait(delay);
        }
      }
    }
    safeInvokeRetryCallback(opts.onFinalFailure, { error: lastError }, "onFinalFailure");
    throw lastError || new Error("Request failed");
  }
  function normalizePairsList(pairs) {
    return (pairs || []).map(function(item) {
      if (!item) {
        return null;
      }
      if (typeof item === "string") {
        const value2 = item.toUpperCase();
        return {
          value: value2,
          symbol: value2.replace(/[:/]/g, ""),
          display: value2
        };
      }
      const rawValue = item.value !== void 0 ? item.value : item.display || item.symbol || "";
      const value = (rawValue || "").toUpperCase();
      if (!value) {
        return null;
      }
      const normalizedSymbol = (item.symbol || value.replace(/[:/]/g, "")).toUpperCase();
      const display = (item.display || value).toUpperCase();
      return {
        value,
        symbol: normalizedSymbol,
        display
      };
    }).filter(function(item) {
      return item !== null;
    });
  }
  var defaultSettingsModule = typeof CryptoTickerDefaults !== "undefined" ? CryptoTickerDefaults : null;
  function ensureDefaultSettingsModule() {
    if (!defaultSettingsModule) {
      throw new Error("Default settings module is not available");
    }
    return defaultSettingsModule;
  }
  function applyDefaultSettings(partialSettings) {
    const moduleRef = ensureDefaultSettingsModule();
    if (typeof moduleRef.applyDefaults === "function") {
      return moduleRef.applyDefaults(partialSettings);
    }
    if (moduleRef.defaultSettings) {
      return Object.assign({}, moduleRef.defaultSettings, partialSettings || {});
    }
    return Object.assign({}, partialSettings || {});
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
  var defaultSettings = getDefaultSettingsSnapshot();
  var settingsConfig = {
    "title": {
      "default": defaultSettings.title,
      "value": document.getElementById("input-title")
    },
    "exchange": {
      "default": defaultSettings.exchange,
      "value": document.getElementById("select-provider")
    },
    "pair": {
      "default": defaultSettings.pair,
      "value": document.getElementById("select-pair"),
      "setValue": function(val) {
        this.value.value = val;
        selectPairDropdown.value = val;
      }
    },
    "fromCurrency": {
      "default": defaultSettings.fromCurrency
    },
    "currency": {
      "default": defaultSettings.currency,
      "value": document.getElementById("select-currency")
    },
    "candlesInterval": {
      "default": defaultSettings.candlesInterval,
      "value": document.getElementById("candlesInterval")
    },
    "candlesDisplayed": {
      "default": defaultSettings.candlesDisplayed,
      "value": document.getElementById("candlesDisplayed")
    },
    "multiplier": {
      "default": defaultSettings.multiplier,
      "value": document.getElementById("multiplier")
    },
    "digits": {
      "default": defaultSettings.digits,
      "value": document.getElementById("digits")
    },
    "highLowDigits": {
      "default": defaultSettings.highLowDigits,
      "value": document.getElementById("highLowDigits")
    },
    "priceFormat": {
      "default": defaultSettings.priceFormat,
      "value": document.getElementById("priceFormat")
    },
    "font": {
      "default": defaultSettings.font,
      "value": document.getElementById("font")
    },
    "fontSizeBase": {
      "default": defaultSettings.fontSizeBase,
      "value": document.getElementById("fontSizeBase")
    },
    "fontSizePrice": {
      "default": defaultSettings.fontSizePrice,
      "value": document.getElementById("fontSizePrice")
    },
    "fontSizeHighLow": {
      "default": defaultSettings.fontSizeHighLow,
      "value": document.getElementById("fontSizeHighLow")
    },
    "fontSizeChange": {
      "default": defaultSettings.fontSizeChange,
      "value": document.getElementById("fontSizeChange")
    },
    "backgroundColor": {
      "default": defaultSettings.backgroundColor,
      "value": document.getElementById("backgroundColor")
    },
    "textColor": {
      "default": defaultSettings.textColor,
      "value": document.getElementById("textColor")
    },
    "displayHighLow": {
      "default": defaultSettings.displayHighLow,
      "value": document.getElementById("displayHighLow"),
      "getValue": function() {
        return this.value.checked ? "on" : "off";
      },
      "setValue": function(val) {
        this.value.checked = val !== "off";
      }
    },
    "displayHighLowBar": {
      "default": defaultSettings.displayHighLowBar,
      "value": document.getElementById("displayHighLowBar"),
      "getValue": function() {
        return this.value.checked ? "on" : "off";
      },
      "setValue": function(val) {
        this.value.checked = val !== "off";
      }
    },
    "displayDailyChange": {
      "default": defaultSettings.displayDailyChange,
      "value": document.getElementById("displayDailyChange"),
      "getValue": function() {
        return this.value.checked ? "on" : "off";
      },
      "setValue": function(val) {
        this.value.checked = val !== "off";
      }
    },
    "displayConnectionStatusIcon": {
      "default": defaultSettings.displayConnectionStatusIcon,
      "value": document.getElementById("displayConnectionStatusIcon"),
      "getValue": function() {
        return (this.value.value || defaultSettings.displayConnectionStatusIcon).toUpperCase();
      },
      "setValue": function(val) {
        const normalized = (val || defaultSettings.displayConnectionStatusIcon).toUpperCase();
        this.value.value = normalized;
      }
    },
    "alertRule": {
      "default": defaultSettings.alertRule,
      "value": document.getElementById("alertRule"),
      "errorElement": document.getElementById("alertRuleError")
    },
    "backgroundColorRule": {
      "default": defaultSettings.backgroundColorRule,
      "value": document.getElementById("backgroundColorRule"),
      "errorElement": document.getElementById("backgroundColorRuleError")
    },
    "textColorRule": {
      "default": defaultSettings.textColorRule,
      "value": document.getElementById("textColorRule"),
      "errorElement": document.getElementById("textColorRuleError")
    },
    "mode": {
      "default": defaultSettings.mode
    }
  };
  var currentSettings = applyDefaultSettings({});
  var cache = {};
  function getCachedEntry(cacheKey) {
    const entry = cache[cacheKey];
    if (!entry || typeof entry !== "object" || !Object.prototype.hasOwnProperty.call(entry, "data")) {
      return null;
    }
    return entry;
  }
  function setCachedEntry(cacheKey, data) {
    cache[cacheKey] = {
      data,
      timestamp: Date.now()
    };
    return cache[cacheKey];
  }
  var lastDisplayedExchange = null;
  var currencyRelatedElements = document.getElementsByClassName("currencyRelated");
  function setCurrentSettings(values) {
    const sanitized = applyDefaultSettings(values || {});
    for (const key in currentSettings) {
      if (Object.prototype.hasOwnProperty.call(currentSettings, key)) {
        delete currentSettings[key];
      }
    }
    Object.assign(currentSettings, sanitized);
    return currentSettings;
  }
  var pi = {
    pairDropdownState: {
      allPairs: [],
      filteredPairs: [],
      filterTerm: "",
      provider: ""
    },
    log: function(...data) {
      if (loggingEnabled) {
        console.log(...data);
      }
    },
    displayExpressionErrors: function(errors) {
      const map = errors || {};
      for (let i = 0; i < expressionValidationTargets.length; i++) {
        const target = expressionValidationTargets[i];
        const config = settingsConfig[target.key];
        if (!config || !config.errorElement) {
          continue;
        }
        const message = map[target.key] || "";
        config.errorElement.textContent = message;
        if (message) {
          config.errorElement.classList.add("is-visible");
        } else {
          config.errorElement.classList.remove("is-visible");
        }
      }
    },
    // Parse + evaluate expressions against sample context; report syntax, runtime, Inf/NaN errors.
    validateRuleExpressions: function(settings) {
      const result = {
        hasErrors: false,
        errors: {}
      };
      for (let i = 0; i < expressionValidationTargets.length; i++) {
        const target = expressionValidationTargets[i];
        const expressionValue = (settings[target.key] || "").trim();
        if (!expressionValue) {
          result.errors[target.key] = "";
          continue;
        }
        if (!target.evaluator || typeof target.contextBuilder !== "function") {
          result.errors[target.key] = "";
          continue;
        }
        const validation = target.evaluator.validate(expressionValue);
        if (!validation.ok) {
          result.errors[target.key] = validation.error;
          result.hasErrors = true;
          continue;
        }
        try {
          const evaluationContext = target.contextBuilder() || {};
          const evaluationResult = target.evaluator.evaluate(expressionValue, evaluationContext);
          if (typeof evaluationResult === "number" && !isFinite(evaluationResult)) {
            result.errors[target.key] = "Expression resulted in an invalid number. Check for division by zero.";
            result.hasErrors = true;
          } else if (typeof evaluationResult === "number" && isNaN(evaluationResult)) {
            result.errors[target.key] = "Expression resulted in NaN. Verify the operators and inputs.";
            result.hasErrors = true;
          } else {
            result.errors[target.key] = "";
          }
        } catch (err) {
          const message = err && err.message ? err.message : "Invalid expression";
          result.errors[target.key] = message;
          result.hasErrors = true;
        }
      }
      return result;
    },
    setPairUIVisibility: function(isVisible) {
      const displayValue = isVisible ? "" : "none";
      const dropdownGroup = document.getElementById("select-pair-dropdown-group");
      const searchGroup = document.getElementById("pair-search-group");
      if (dropdownGroup) {
        dropdownGroup.style.display = displayValue;
      }
      if (searchGroup) {
        searchGroup.style.display = displayValue;
      }
    },
    resetPairDropdown: function() {
      this.pairDropdownState.allPairs = [];
      this.pairDropdownState.filteredPairs = [];
      this.pairDropdownState.filterTerm = "";
      this.pairDropdownState.provider = "";
      if (selectPairDropdown) {
        this.removeAllOptions(selectPairDropdown);
        const emptyOption = document.createElement("option");
        emptyOption.text = "";
        emptyOption.value = "";
        selectPairDropdown.add(emptyOption);
        selectPairDropdown.disabled = true;
      }
      if (pairSearchInput) {
        pairSearchInput.value = "";
        pairSearchInput.disabled = true;
      }
      this.updatePairSearchFeedback(0, "");
      this.setPairUIVisibility(false);
    },
    findMatchingPairValue: function(pairs, identifier) {
      if (!identifier) {
        return null;
      }
      const normalized = identifier.toUpperCase();
      const list = Array.isArray(pairs) ? pairs : [];
      const match = list.find(function(pair) {
        if (!pair) {
          return false;
        }
        const value = (pair.value || "").toUpperCase();
        const symbol = (pair.symbol || "").toUpperCase();
        const display = (pair.display || "").toUpperCase();
        return value === normalized || symbol === normalized || display === normalized;
      });
      if (match) {
        return match.value || match.symbol || "";
      }
      return null;
    },
    renderPairDropdownOptions: function(pairs, options) {
      if (!selectPairDropdown) {
        return;
      }
      const opts = options || {};
      const availablePairs = Array.isArray(pairs) ? pairs : [];
      const previousValue = typeof opts.previousValue === "string" ? opts.previousValue : selectPairDropdown.value || "";
      const preferredValue = typeof opts.preferredValue === "string" ? opts.preferredValue : "";
      const fallbackValue = typeof opts.fallbackValue === "string" ? opts.fallbackValue : "";
      const pairConfig = settingsConfig && settingsConfig["pair"] ? settingsConfig["pair"] : null;
      const currentPairValue = pairConfig && pairConfig.value ? pairConfig.value.value : "";
      this.removeAllOptions(selectPairDropdown);
      const emptyOption = document.createElement("option");
      emptyOption.text = "";
      emptyOption.value = "";
      selectPairDropdown.add(emptyOption);
      for (let i = 0; i < availablePairs.length; i++) {
        const pair = availablePairs[i];
        const option = document.createElement("option");
        option.value = pair.value;
        option.text = pair.display || pair.value;
        selectPairDropdown.add(option);
      }
      const normalizedPreferred = this.findMatchingPairValue(availablePairs, preferredValue);
      const normalizedPrevious = this.findMatchingPairValue(availablePairs, previousValue);
      const normalizedCurrent = this.findMatchingPairValue(availablePairs, currentPairValue);
      const normalizedFallback = this.findMatchingPairValue(availablePairs, fallbackValue);
      const targetValue = normalizedPreferred || normalizedPrevious || normalizedCurrent || normalizedFallback || "";
      if (targetValue) {
        selectPairDropdown.value = targetValue;
      } else {
        selectPairDropdown.value = "";
      }
    },
    updatePairSearchFeedback: function(matchesCount, query) {
      if (!pairSearchFeedback) {
        return;
      }
      const hasQuery = !!(query && query.trim());
      if (hasQuery && matchesCount === 0) {
        pairSearchFeedback.textContent = 'No matches for "' + query.trim() + '"';
        pairSearchFeedback.style.display = "";
      } else {
        pairSearchFeedback.textContent = "";
        pairSearchFeedback.style.display = "none";
      }
    },
    applyPairFilter: function(rawTerm, options) {
      const term = (rawTerm || "").trim();
      const normalizedTerm = term.toUpperCase();
      const state = this.pairDropdownState;
      state.filterTerm = term;
      const sourcePairs = Array.isArray(state.allPairs) ? state.allPairs : [];
      let filtered = sourcePairs;
      if (normalizedTerm) {
        filtered = sourcePairs.filter(function(pair) {
          const value = (pair.value || "").toUpperCase();
          const symbol = (pair.symbol || "").toUpperCase();
          const display = (pair.display || "").toUpperCase();
          return value.indexOf(normalizedTerm) !== -1 || symbol.indexOf(normalizedTerm) !== -1 || display.indexOf(normalizedTerm) !== -1;
        });
      }
      state.filteredPairs = filtered;
      const opts = options || {};
      const previousValue = typeof opts.previousValue === "string" ? opts.previousValue : selectPairDropdown ? selectPairDropdown.value : "";
      const preferredValue = typeof opts.preferredValue === "string" ? opts.preferredValue : "";
      const fallbackCandidate = typeof opts.fallbackValue === "string" ? opts.fallbackValue : filtered[0] ? filtered[0].value : "";
      this.renderPairDropdownOptions(filtered, {
        previousValue,
        preferredValue,
        fallbackValue: fallbackCandidate
      });
      this.updatePairSearchFeedback(filtered.length, term);
    },
    setPairDropdownData: function(provider, pairs, options) {
      const normalizedPairs = Array.isArray(pairs) ? pairs.slice(0) : [];
      this.pairDropdownState.allPairs = normalizedPairs;
      this.pairDropdownState.provider = (provider || "").toUpperCase();
      const opts = options || {};
      const shouldResetFilter = opts.resetFilter !== false;
      if (pairSearchInput) {
        if (shouldResetFilter) {
          pairSearchInput.value = "";
        }
        pairSearchInput.disabled = normalizedPairs.length === 0;
      }
      const filterTerm = shouldResetFilter ? "" : this.pairDropdownState.filterTerm;
      this.applyPairFilter(filterTerm, {
        previousValue: opts.previousValue,
        preferredValue: opts.preferredValue,
        fallbackValue: opts.savedValue
      });
    },
    handlePairSearchInput: function(value) {
      this.applyPairFilter(value, {
        previousValue: selectPairDropdown ? selectPairDropdown.value : ""
      });
    },
    handlePairSearchKeydown: function(evt) {
      if (!evt) {
        return;
      }
      if (evt.key === "ArrowDown" || evt.key === "Down") {
        evt.preventDefault();
        this.focusPairDropdown();
        this.movePairSelection(1);
      } else if (evt.key === "ArrowUp" || evt.key === "Up") {
        evt.preventDefault();
        this.focusPairDropdown();
        this.movePairSelection(-1);
      } else if (evt.key === "Enter") {
        evt.preventDefault();
        this.selectPairFromSearch();
      } else if (evt.key === "Escape") {
        if (pairSearchInput && pairSearchInput.value) {
          evt.preventDefault();
          pairSearchInput.value = "";
          const pairConfig = settingsConfig && settingsConfig["pair"] ? settingsConfig["pair"] : null;
          const currentValue = pairConfig && pairConfig.value ? pairConfig.value.value : "";
          this.applyPairFilter("", {
            previousValue: currentValue
          });
        }
      }
    },
    focusPairDropdown: function() {
      if (!selectPairDropdown) {
        return;
      }
      selectPairDropdown.focus();
      if (selectPairDropdown.options.length > 1 && selectPairDropdown.selectedIndex < 1) {
        selectPairDropdown.selectedIndex = 1;
      }
    },
    movePairSelection: function(offset) {
      if (!selectPairDropdown) {
        return;
      }
      const optionsLength = selectPairDropdown.options.length;
      if (optionsLength <= 1) {
        return;
      }
      let nextIndex = selectPairDropdown.selectedIndex;
      if (nextIndex < 1) {
        nextIndex = offset > 0 ? 1 : optionsLength - 1;
      } else {
        nextIndex = nextIndex + offset;
        if (nextIndex < 1) {
          nextIndex = optionsLength - 1;
        } else if (nextIndex >= optionsLength) {
          nextIndex = 1;
        }
      }
      selectPairDropdown.selectedIndex = nextIndex;
    },
    selectPairFromSearch: function() {
      if (!selectPairDropdown) {
        return;
      }
      let value = selectPairDropdown.value;
      if (!value && this.pairDropdownState.filteredPairs.length > 0) {
        value = this.pairDropdownState.filteredPairs[0].value;
      }
      if (value) {
        this.applyPairSelection(value);
      }
    },
    applyPairSelection: function(value) {
      if (!selectPairDropdown) {
        return;
      }
      selectPairDropdown.value = value || "";
      if (typeof selectPairDropdown.onchange === "function") {
        selectPairDropdown.onchange();
      }
    },
    syncPairSelectionDisplay: function() {
      if (!selectPairDropdown) {
        return;
      }
      const pairConfig = settingsConfig && settingsConfig["pair"] ? settingsConfig["pair"] : null;
      const currentValue = pairConfig && pairConfig.value ? pairConfig.value.value : "";
      if (!currentValue) {
        selectPairDropdown.value = "";
        return;
      }
      const available = this.pairDropdownState.filteredPairs.length > 0 ? this.pairDropdownState.filteredPairs : this.pairDropdownState.allPairs;
      const matchValue = this.findMatchingPairValue(available, currentValue) || currentValue;
      selectPairDropdown.value = matchValue;
    },
    setupNetworkStatusElements: function() {
      if (this.networkStatusInitialized) {
        return;
      }
      networkStatusManager.ensure("providers");
      networkStatusManager.ensure("pairs");
      networkStatusManager.ensure("currencies");
      const self2 = this;
      this.retryCallbacks = {
        providers: async function() {
          await self2.populateProvidersDropdown(true);
          const exchangeDropdown = settingsConfig["exchange"]["value"];
          const provider = exchangeDropdown ? exchangeDropdown.value : "";
          if (provider) {
            await self2.populatePairsDropdown(provider, { forceRefresh: true });
          }
        },
        pairs: async function() {
          const exchangeDropdown = settingsConfig["exchange"]["value"];
          const provider = exchangeDropdown ? exchangeDropdown.value : "";
          if (provider) {
            await self2.populatePairsDropdown(provider, { forceRefresh: true });
          }
        },
        currencies: async function() {
          await self2.populateCurrenciesDropdown(true);
        }
      };
      this.networkStatusInitialized = true;
    },
    populateProvidersDropdown: async function(forceRefresh) {
      const exchangeDropdown = settingsConfig["exchange"]["value"];
      if (!exchangeDropdown) {
        return [];
      }
      const previousValue = exchangeDropdown.value;
      const providers = await this.getProviders({
        forceRefresh: !!forceRefresh
      });
      const list = Array.isArray(providers) ? providers.slice(0) : [];
      this.removeAllOptions(exchangeDropdown);
      list.sort();
      list.forEach(function(provider) {
        const option = document.createElement("option");
        option.text = provider;
        option.value = provider;
        exchangeDropdown.add(option);
      });
      const savedExchange = currentSettings["exchange"] || settingsConfig["exchange"]["default"] || "";
      const preferred = previousValue || savedExchange;
      if (preferred && list.indexOf(preferred) !== -1) {
        exchangeDropdown.value = preferred;
      } else if (savedExchange && list.indexOf(savedExchange) !== -1) {
        exchangeDropdown.value = savedExchange;
      } else if (list.length > 0) {
        exchangeDropdown.value = list[0];
      } else {
        exchangeDropdown.value = "";
      }
      exchangeDropdown.disabled = list.length === 0;
      return list;
    },
    populatePairsDropdown: async function(provider, options) {
      const opts = options || {};
      const exchangeDropdown = settingsConfig["exchange"]["value"];
      const currentProvider = provider || (exchangeDropdown ? exchangeDropdown.value : "");
      if (!currentProvider) {
        this.resetPairDropdown();
        return [];
      }
      const expectedProvider = currentProvider.toUpperCase();
      const pairs = await this.getPairs(currentProvider, {
        forceRefresh: !!opts.forceRefresh
      });
      const exchangeValue = exchangeDropdown ? (exchangeDropdown.value || "").toUpperCase() : "";
      if (exchangeValue && exchangeValue !== expectedProvider) {
        return pairs;
      }
      const normalized = Array.isArray(pairs) ? pairs.slice(0) : [];
      normalized.sort(function(a, b) {
        const aP = a["display"] || a["symbol"];
        const bP = b["display"] || b["symbol"];
        if (aP > bP) {
          return 1;
        }
        if (aP < bP) {
          return -1;
        }
        return 0;
      });
      const savedPair = (currentSettings["pair"] || "").toUpperCase();
      const previousValue = selectPairDropdown ? selectPairDropdown.value : "";
      const preferredPair = (previousValue || savedPair || "").toUpperCase();
      this.setPairDropdownData(currentProvider, normalized, {
        previousValue,
        preferredValue: preferredPair,
        savedValue: savedPair,
        resetFilter: !opts.preserveFilter
      });
      const hasPairs = normalized.length > 0;
      this.setPairUIVisibility(hasPairs);
      if (selectPairDropdown) {
        selectPairDropdown.disabled = !hasPairs;
      }
      if (pairSearchInput) {
        pairSearchInput.disabled = !hasPairs;
      }
      if (!hasPairs) {
        this.updatePairSearchFeedback(0, pairSearchInput ? pairSearchInput.value : "");
      }
      return normalized;
    },
    populateCurrenciesDropdown: async function(forceRefresh) {
      const toCurrencyDropDown = settingsConfig["currency"]["value"];
      if (!toCurrencyDropDown) {
        return [];
      }
      const previousValue = toCurrencyDropDown.value;
      const currencies = await this.getCurrencies({
        forceRefresh: !!forceRefresh
      });
      const list = Array.isArray(currencies) ? currencies.slice(0) : [];
      this.removeAllOptions(toCurrencyDropDown);
      const emptyOption = document.createElement("option");
      emptyOption.text = "";
      emptyOption.value = "";
      toCurrencyDropDown.add(emptyOption);
      list.sort();
      list.forEach(function(currency) {
        const option = document.createElement("option");
        option.text = currency;
        option.value = currency;
        toCurrencyDropDown.add(option);
      });
      const savedCurrency = currentSettings["currency"] || settingsConfig["currency"]["default"] || "";
      const preferred = previousValue || savedCurrency;
      if (preferred && list.indexOf(preferred) !== -1) {
        toCurrencyDropDown.value = preferred;
      } else if (savedCurrency && list.indexOf(savedCurrency) !== -1) {
        toCurrencyDropDown.value = savedCurrency;
      } else {
        toCurrencyDropDown.value = "";
      }
      toCurrencyDropDown.disabled = list.length === 0;
      return list;
    },
    handleExchangeChange: async function(options) {
      const opts = options || {};
      const exchangeDropdown = settingsConfig["exchange"]["value"];
      const provider = exchangeDropdown ? exchangeDropdown.value : "";
      if (!provider) {
        this.resetPairDropdown();
        lastDisplayedExchange = provider;
        return;
      }
      await this.populatePairsDropdown(provider, {
        forceRefresh: !!opts.forceRefresh
      });
      lastDisplayedExchange = provider;
    },
    initDom: function() {
      this.setupNetworkStatusElements();
      this.initPairsDropDown();
      this.initCurrenciesDropDown();
      this.renderConnectionStateHelp();
      const jThis = this;
      const callback = function() {
        jThis.checkNewSettings();
        jThis.refreshMenus();
      };
      for (const k in settingsConfig) {
        const setting = settingsConfig[k];
        if (setting["value"]) {
          setting["value"].onchange = callback;
          setting["value"].onkeyup = callback;
        }
      }
    },
    renderConnectionStateHelp: function() {
      if (!connectionStatusIconsModule || typeof connectionStatusIconsModule.renderConnectionStatusIcon !== "function") {
        return;
      }
      const canvases = document.querySelectorAll("canvas.connection-state-icon");
      if (!canvases || canvases.length === 0) {
        return;
      }
      const fallbackStates = {
        LIVE: "live",
        DETACHED: "detached",
        BACKUP: "backup",
        BROKEN: "broken"
      };
      const states = connectionStatesModule || fallbackStates;
      for (let i = 0; i < canvases.length; i++) {
        const canvas = canvases[i];
        if (!canvas) {
          continue;
        }
        const stateKey = (canvas.getAttribute("data-connection-state") || "").toUpperCase();
        const resolvedState = states && states[stateKey] ? states[stateKey] : stateKey.toLowerCase();
        const context = canvas.getContext("2d");
        if (!context || !resolvedState) {
          continue;
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        const minDimension = Math.min(canvas.width || 0, canvas.height || 0);
        const multiplier = Math.max(minDimension > 0 ? minDimension / 32 : 1, 0.6);
        connectionStatusIconsModule.renderConnectionStatusIcon({
          canvas,
          canvasContext: context,
          state: resolvedState,
          color: "#ffffff",
          sizeMultiplier: multiplier,
          position: "TOP_RIGHT",
          connectionStates: states
        });
      }
    },
    initPairsDropDown: async function() {
      const exchangeDropdown = settingsConfig["exchange"]["value"];
      if (!exchangeDropdown) {
        return;
      }
      this.setupNetworkStatusElements();
      if (!this.exchangeDropdownInitialized) {
        const thisTmp = this;
        const originalCallback = typeof exchangeDropdown.onchange === "function" ? exchangeDropdown.onchange : function() {
        };
        exchangeDropdown.onchange = function() {
          if (typeof originalCallback === "function") {
            originalCallback.call(this);
          }
          thisTmp.handleExchangeChange();
          thisTmp.checkNewSettings();
        };
        selectPairDropdown.onchange = function() {
          const pairInput = settingsConfig["pair"]["value"];
          pairInput.value = selectPairDropdown.value;
          if (typeof pairInput.onchange === "function") {
            pairInput.onchange();
          }
        };
        if (pairSearchInput) {
          pairSearchInput.addEventListener("input", function(event) {
            thisTmp.handlePairSearchInput(event.target.value);
          });
          pairSearchInput.addEventListener("keydown", function(event) {
            thisTmp.handlePairSearchKeydown(event);
          });
        }
        this.exchangeDropdownInitialized = true;
      }
      await this.populateProvidersDropdown();
      const candidateExchange = currentSettings["exchange"] || settingsConfig["exchange"]["default"] || "";
      if (candidateExchange) {
        const hasCandidate = Array.from(exchangeDropdown.options).some(function(option) {
          return (option.value || "").toUpperCase() === candidateExchange.toUpperCase();
        });
        if (hasCandidate) {
          exchangeDropdown.value = candidateExchange;
        }
      }
      const activeExchange = exchangeDropdown.value || candidateExchange;
      lastDisplayedExchange = activeExchange;
      await this.populatePairsDropdown(activeExchange, { initial: true });
      this.refreshValues();
    },
    getProviders: async function(options) {
      this.setupNetworkStatusElements();
      const opts = options || {};
      const cacheKey = "getProviders";
      const cachedEntry = getCachedEntry(cacheKey);
      let providers = cachedEntry ? cachedEntry.data : null;
      const forceRefresh = !!opts.forceRefresh;
      const shouldFetch = forceRefresh || !cachedEntry;
      const retryHandler = this.retryCallbacks && typeof this.retryCallbacks.providers === "function" ? this.retryCallbacks.providers : null;
      if (shouldFetch) {
        networkStatusManager.setState("providers", {
          message: networkStatusManager.config.providers.loadingMessage,
          spinner: true,
          disableSelect: true
        });
        try {
          const responseJson = await fetchJsonWithRetry(tProxyBase + "/api/Ticker/json/providers", {
            attempts: FETCH_MAX_ATTEMPTS,
            timeout: FETCH_TIMEOUT_MS,
            retryBaseDelay: RETRY_BASE_DELAY_MS,
            onAttemptStart: function(info) {
              if (info.attempt === 1) {
                networkStatusManager.setState("providers", {
                  message: networkStatusManager.config.providers.loadingMessage,
                  spinner: true,
                  disableSelect: true
                });
              } else {
                networkStatusManager.setState("providers", {
                  message: networkStatusManager.config.providers.retryMessage,
                  spinner: true,
                  disableSelect: true,
                  tone: "warning"
                });
              }
            },
            onAttemptError: function(info) {
              console.error("Provider fetch attempt " + info.attempt + " failed", info.error);
            }
          });
          providers = Array.isArray(responseJson) ? responseJson.slice(0) : [];
          setCachedEntry(cacheKey, providers);
          networkStatusManager.clear("providers");
        } catch (err) {
          console.error("Failed to load providers", err);
          this.log("getProviders error", err);
          if (cachedEntry && Array.isArray(cachedEntry.data) && cachedEntry.data.length > 0) {
            networkStatusManager.setState("providers", {
              message: "Using cached providers. Connection issue detected.",
              spinner: false,
              disableSelect: false,
              tone: "warning",
              showRetry: !!retryHandler,
              onRetry: retryHandler
            });
            networkStatusManager.showWarning("providers", buildStaleDataMessage(cachedEntry.timestamp));
            return cachedEntry.data;
          }
          networkStatusManager.setState("providers", {
            message: "Network error. Please check connection and try again.",
            spinner: false,
            disableSelect: true,
            tone: "error",
            showRetry: !!retryHandler,
            onRetry: retryHandler
          });
          networkStatusManager.showWarning("providers", "");
          return [];
        }
      } else if (cachedEntry) {
        providers = cachedEntry.data;
        networkStatusManager.clear("providers");
      }
      const normalizedProviders = Array.isArray(providers) ? providers : [];
      this.log("getProviders", normalizedProviders);
      networkStatusManager.showWarning("providers", "");
      return normalizedProviders;
    },
    getPairs: async function(provider, options) {
      this.setupNetworkStatusElements();
      const opts = options || {};
      if (!provider) {
        return [];
      }
      const cacheKey = "getPairs_" + provider;
      const cachedEntry = getCachedEntry(cacheKey);
      const forceRefresh = !!opts.forceRefresh;
      const retryHandler = this.retryCallbacks && typeof this.retryCallbacks.pairs === "function" ? this.retryCallbacks.pairs : null;
      let pairs = cachedEntry ? cachedEntry.data : null;
      const shouldFetch = forceRefresh || !cachedEntry;
      if (shouldFetch) {
        networkStatusManager.setState("pairs", {
          message: networkStatusManager.config.pairs.loadingMessage,
          spinner: true,
          disableSelect: true
        });
        const providerModule = this.resolveProviderModule(provider);
        if (providerModule && typeof providerModule.getPairs === "function") {
          try {
            pairs = await providerModule.getPairs();
          } catch (err) {
            console.error("Error fetching direct pairs for provider " + provider, err);
            this.log("Error fetching direct pairs", err);
            pairs = null;
          }
        }
        if (!Array.isArray(pairs) || pairs.length === 0) {
          const url = tProxyBase + "/api/Ticker/json/symbols?provider=" + encodeURIComponent(provider);
          try {
            const responseJson = await fetchJsonWithRetry(url, {
              attempts: FETCH_MAX_ATTEMPTS,
              timeout: FETCH_TIMEOUT_MS,
              retryBaseDelay: RETRY_BASE_DELAY_MS,
              onAttemptStart: function(info) {
                if (info.attempt === 1) {
                  networkStatusManager.setState("pairs", {
                    message: networkStatusManager.config.pairs.loadingMessage,
                    spinner: true,
                    disableSelect: true
                  });
                } else {
                  networkStatusManager.setState("pairs", {
                    message: networkStatusManager.config.pairs.retryMessage,
                    spinner: true,
                    disableSelect: true,
                    tone: "warning"
                  });
                }
              },
              onAttemptError: function(info) {
                console.error("Pairs fetch attempt " + info.attempt + " failed", info.error);
              }
            });
            pairs = responseJson;
          } catch (err) {
            console.error("Error fetching pairs from proxy for provider " + provider, err);
            this.log("Error fetching pairs from proxy", err);
            if (cachedEntry && Array.isArray(cachedEntry.data) && cachedEntry.data.length > 0) {
              networkStatusManager.setState("pairs", {
                message: "Using cached pairs. Connection issue detected.",
                spinner: false,
                disableSelect: false,
                tone: "warning",
                showRetry: !!retryHandler,
                onRetry: retryHandler
              });
              networkStatusManager.showWarning("pairs", buildStaleDataMessage(cachedEntry.timestamp));
              return cachedEntry.data;
            }
            networkStatusManager.setState("pairs", {
              message: "Network error. Please check connection and try again.",
              spinner: false,
              disableSelect: true,
              tone: "error",
              showRetry: !!retryHandler,
              onRetry: retryHandler
            });
            networkStatusManager.showWarning("pairs", "");
            return [];
          }
        }
      } else if (cachedEntry) {
        networkStatusManager.clear("pairs");
        networkStatusManager.showWarning("pairs", "");
        return cachedEntry.data;
      }
      const normalizedPairs = normalizePairsList(pairs);
      if (normalizedPairs.length > 0) {
        setCachedEntry(cacheKey, normalizedPairs);
      } else if (cachedEntry && Array.isArray(cachedEntry.data) && cachedEntry.data.length > 0 && shouldFetch) {
        networkStatusManager.setState("pairs", {
          message: "Using cached pairs. Connection issue detected.",
          spinner: false,
          disableSelect: false,
          tone: "warning",
          showRetry: !!retryHandler,
          onRetry: retryHandler
        });
        networkStatusManager.showWarning("pairs", buildStaleDataMessage(cachedEntry.timestamp));
        return cachedEntry.data;
      }
      this.log("getPairs", normalizedPairs);
      networkStatusManager.clear("pairs");
      networkStatusManager.showWarning("pairs", "");
      return normalizedPairs;
    },
    resolveProviderModule: function(provider) {
      if (typeof provider !== "string") {
        return null;
      }
      if (typeof CryptoTickerPIProviders !== "undefined" && CryptoTickerPIProviders.getProvider) {
        return CryptoTickerPIProviders.getProvider(provider);
      }
      return null;
    },
    initCurrenciesDropDown: async function() {
      this.setupNetworkStatusElements();
      await this.populateCurrenciesDropdown();
      this.refreshValues();
    },
    getCurrencies: async function(options) {
      this.setupNetworkStatusElements();
      const opts = options || {};
      const cacheKey = "getCurrencies";
      const cachedEntry = getCachedEntry(cacheKey);
      let currencies = cachedEntry ? cachedEntry.data : null;
      const forceRefresh = !!opts.forceRefresh;
      const shouldFetch = forceRefresh || !cachedEntry;
      const retryHandler = this.retryCallbacks && typeof this.retryCallbacks.currencies === "function" ? this.retryCallbacks.currencies : null;
      if (shouldFetch) {
        networkStatusManager.setState("currencies", {
          message: networkStatusManager.config.currencies.loadingMessage,
          spinner: true,
          disableSelect: true
        });
        try {
          const responseJson = await fetchJsonWithRetry(tProxyBase + "/api/Ticker/json/currencies", {
            attempts: FETCH_MAX_ATTEMPTS,
            timeout: FETCH_TIMEOUT_MS,
            retryBaseDelay: RETRY_BASE_DELAY_MS,
            onAttemptStart: function(info) {
              if (info.attempt === 1) {
                networkStatusManager.setState("currencies", {
                  message: networkStatusManager.config.currencies.loadingMessage,
                  spinner: true,
                  disableSelect: true
                });
              } else {
                networkStatusManager.setState("currencies", {
                  message: networkStatusManager.config.currencies.retryMessage,
                  spinner: true,
                  disableSelect: true,
                  tone: "warning"
                });
              }
            },
            onAttemptError: function(info) {
              console.error("Currencies fetch attempt " + info.attempt + " failed", info.error);
            }
          });
          currencies = Array.isArray(responseJson) ? responseJson.slice(0) : [];
          setCachedEntry(cacheKey, currencies);
          networkStatusManager.clear("currencies");
        } catch (err) {
          console.error("Failed to load currencies", err);
          this.log("getCurrencies error", err);
          if (cachedEntry && Array.isArray(cachedEntry.data) && cachedEntry.data.length > 0) {
            networkStatusManager.setState("currencies", {
              message: "Using cached currencies. Connection issue detected.",
              spinner: false,
              disableSelect: false,
              tone: "warning",
              showRetry: !!retryHandler,
              onRetry: retryHandler
            });
            networkStatusManager.showWarning("currencies", buildStaleDataMessage(cachedEntry.timestamp));
            return cachedEntry.data;
          }
          networkStatusManager.setState("currencies", {
            message: "Network error. Please check connection and try again.",
            spinner: false,
            disableSelect: true,
            tone: "error",
            showRetry: !!retryHandler,
            onRetry: retryHandler
          });
          networkStatusManager.showWarning("currencies", "");
          return [];
        }
      } else if (cachedEntry) {
        networkStatusManager.clear("currencies");
        networkStatusManager.showWarning("currencies", "");
        return cachedEntry.data;
      }
      const normalizedCurrencies = Array.isArray(currencies) ? currencies : [];
      this.log("getCurrencies", normalizedCurrencies);
      networkStatusManager.showWarning("currencies", "");
      return normalizedCurrencies;
    },
    removeAllOptions: function(selectElement) {
      var i, L = selectElement.options.length - 1;
      for (i = L; i >= 0; i--) {
        selectElement.remove(i);
      }
    },
    extractSettings: function(settings) {
      this.log("extractSettings", settings);
      const incoming = settings ? Object.assign({}, settings) : {};
      const pairElements = this.splitPairValue(incoming["pair"]);
      if (pairElements) {
        for (const k in pairElements) {
          if (Object.prototype.hasOwnProperty.call(pairElements, k)) {
            incoming[k] = pairElements[k];
          }
        }
      }
      setCurrentSettings(incoming);
      this.refreshValues();
      this.displayExpressionErrors({});
    },
    checkNewSettings: function() {
      this.log("checkNewSettings");
      for (const k in settingsConfig) {
        const settingConfig = settingsConfig[k];
        if (settingConfig["getValue"]) {
          currentSettings[k] = settingConfig["getValue"]() || settingConfig["default"];
        } else if (settingConfig["value"]) {
          currentSettings[k] = settingConfig["value"].value || settingConfig["default"];
        }
      }
      const sanitizedSettings = setCurrentSettings(currentSettings);
      const validation = this.validateRuleExpressions(sanitizedSettings);
      this.displayExpressionErrors(validation.errors);
      if (validation.hasErrors) {
        this.log("Expression validation failed", validation.errors);
        return;
      }
      this.saveSettings();
    },
    refreshValues: function() {
      this.log("refreshValues");
      if (lastDisplayedExchange !== currentSettings["exchange"]) {
        this.initPairsDropDown();
        return;
      }
      for (const k in settingsConfig) {
        const settingConfig = settingsConfig[k];
        if (settingConfig["setValue"]) {
          settingConfig["setValue"](currentSettings[k]);
        } else if (settingConfig["value"]) {
          settingConfig["value"].value = currentSettings[k];
        }
      }
      this.syncPairSelectionDisplay();
      this.refreshMenus();
    },
    refreshMenus: function() {
      if (currentSettings && currentSettings["pair"] && currentSettings["pair"].indexOf("USD") >= 0) {
        this.applyDisplay(currencyRelatedElements, "block");
      } else {
        this.applyDisplay(currencyRelatedElements, "none");
        settingsConfig["currency"]["value"].value = "USD";
      }
    },
    applyDisplay: function(elements, display) {
      if (!elements) {
        return;
      }
      for (let index = 0; index < elements.length; index++) {
        elements[index].style.display = display;
      }
    },
    splitPairValue: function(value) {
      if (value && value.indexOf("|") >= 0) {
        const elements = value.split("|");
        return {
          "pair": elements[1],
          "exchange": elements[0].toUpperCase()
        };
      }
      return null;
    },
    saveSettings: function() {
      this.log("saveSettings", currentSettings);
      setCurrentSettings(currentSettings);
      if (websocket && websocket.readyState === 1) {
        const jsonSetSettings = {
          "event": "setSettings",
          "context": uuid,
          "payload": currentSettings
        };
        websocket.send(JSON.stringify(jsonSetSettings));
        const jsonPlugin = {
          "action": actionInfo["action"],
          "event": "sendToPlugin",
          "context": uuid,
          "payload": currentSettings
        };
        websocket.send(JSON.stringify(jsonPlugin));
      }
    }
  };
  pi.initDom();
  function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, infoJson, actionInfoJson) {
    uuid = inUUID;
    actionInfo = JSON.parse(actionInfoJson);
    const parsedInfo = JSON.parse(infoJson);
    websocket = new WebSocket("ws://127.0.0.1:" + inPort);
    pi.extractSettings(actionInfo.payload.settings);
    websocket.onopen = function() {
      const json = {
        event: inRegisterEvent,
        uuid: inUUID,
        info: parsedInfo
      };
      websocket.send(JSON.stringify(json));
    };
    websocket.onmessage = function(evt) {
      JSON.parse(evt.data);
    };
  }
  if (typeof window !== "undefined") {
    window.connectElgatoStreamDeckSocket = connectElgatoStreamDeckSocket;
  }
})();
//# sourceMappingURL=pi.bundle.js.map
