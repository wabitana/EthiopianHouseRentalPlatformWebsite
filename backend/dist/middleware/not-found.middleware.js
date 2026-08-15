"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
const errors_1 = require("../utils/errors");
function notFoundHandler(req, res, next) {
    next(new errors_1.NotFoundError(`Route not found - ${req.method} ${req.originalUrl}`));
}
