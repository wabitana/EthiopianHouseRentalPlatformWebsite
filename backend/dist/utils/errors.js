"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Permission denied') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class ValidationError extends AppError {
    constructor(message = 'Invalid input data') {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
