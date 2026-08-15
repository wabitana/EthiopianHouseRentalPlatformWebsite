"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const token_service_1 = require("../services/token.service");
const errors_1 = require("../utils/errors");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new errors_1.UnauthorizedError('Missing or invalid Authorization header'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = token_service_1.TokenService.verifyAccessToken(token);
        req.user = payload;
        next();
    }
    catch (error) {
        return next(new errors_1.UnauthorizedError('Invalid or expired token'));
    }
}
