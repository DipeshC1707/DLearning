"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class errorHandler extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = errorHandler;
