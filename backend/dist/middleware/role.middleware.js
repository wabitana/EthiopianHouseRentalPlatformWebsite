"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = authorizeRoles;
const errors_1 = require("../utils/errors");
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_1.UnauthorizedError('User authentication required'));
        }
        const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
        if (!hasRole) {
            return next(new errors_1.ForbiddenError('You do not have permission to access this resource'));
        }
        next();
    };
}
