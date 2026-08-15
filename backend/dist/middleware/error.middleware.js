"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require("../utils/errors");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) {
    logger_1.logger.error(`Error processing ${req.method} ${req.originalUrl}:`, err);
    if (err instanceof errors_1.AppError) {
        return (0, response_1.sendError)(res, err.message, err.statusCode, err.code, err.errors || undefined);
    }
    // Handle unexpected operational errors
    const isDev = env_1.env.NODE_ENV === 'development';
    return (0, response_1.sendError)(res, isDev ? err.message : 'An unexpected error occurred on the server', 500, 'INTERNAL_SERVER_ERROR', isDev ? err.stack : undefined);
}
