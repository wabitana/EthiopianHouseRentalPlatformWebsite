"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found', code = 'NOT_FOUND') {
        super(message, 404, code);
    }
}
exports.NotFoundError = NotFoundError;
class BadRequestError extends AppError {
    constructor(message = 'Bad request', code = 'BAD_REQUEST') {
        super(message, 400, code);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access', code = 'UNAUTHORIZED') {
        super(message, 401, code);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden', code = 'FORBIDDEN') {
        super(message, 403, code);
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends AppError {
    constructor(message = 'Resource conflict', code = 'CONFLICT') {
        super(message, 409, code);
    }
}
exports.ConflictError = ConflictError;
class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors) {
        super(message, 422, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
