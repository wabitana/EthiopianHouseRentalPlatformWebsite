"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
function validateRequest(schema) {
    return async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            // Assign parsed values back to request
            req.body = parsed.body || req.body;
            req.query = parsed.query || req.query;
            req.params = parsed.params || req.params;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.errors.map((e) => ({
                    field: e.path.join('.').replace(/^(body|query|params)\./, ''),
                    message: e.message,
                }));
                return next(new errors_1.ValidationError('Validation failed for request parameters', formattedErrors));
            }
            next(error);
        }
    };
}
