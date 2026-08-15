"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, data, message, statusCode = 200, meta) {
    const response = {
        success: true,
        ...(message && { message }),
        data,
        ...(meta && { meta }),
    };
    return res.status(statusCode).json(response);
}
function sendError(res, message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details) {
    const response = {
        success: false,
        error: {
            code,
            message,
            ...(details && { details }),
        },
    };
    return res.status(statusCode).json(response);
}
