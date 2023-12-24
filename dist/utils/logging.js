"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.LogLevels = void 0;
var LogLevels;
(function (LogLevels) {
    LogLevels["Error"] = "ERROR";
    LogLevels["Info"] = "INFO";
    LogLevels["WARN"] = "WARN";
})(LogLevels || (exports.LogLevels = LogLevels = {}));
const log = (level, message, args) => {
    switch (level) {
        case LogLevels.Error:
            console.error(message, args);
            break;
        case LogLevels.Info:
            console.info(message, args);
            break;
        case LogLevels.WARN:
            console.log(message, args);
            break;
        default:
            console.log("Invalid log level");
    }
};
exports.log = log;
