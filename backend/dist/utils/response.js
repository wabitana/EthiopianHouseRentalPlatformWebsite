"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
function successResponse(res, data, statusCode = 200, message) {
    return res.status(statusCode).json({
        success: true,
        ...(message && { message }),
        data,
    });
}
function errorResponse(res, message, statusCode = 400, errorCode) {
    return res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode || 'BAD_REQUEST',
            message,
        },
    });
}
