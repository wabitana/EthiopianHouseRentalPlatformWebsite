"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.withDbRetry = withDbRetry;
const database_1 = require("./config/database");
exports.prisma = database_1.prisma;
async function withDbRetry(fn, retries = 3, delayMs = 1000) {
    let attempt = 0;
    while (attempt < retries) {
        try {
            return await fn();
        }
        catch (err) {
            attempt++;
            if (attempt >= retries)
                throw err;
            console.warn(`[Prisma Retry] Database query failed (attempt ${attempt}/${retries}). Retrying in ${delayMs}ms... Error: ${err?.message || err}`);
            await new Promise((res) => setTimeout(res, delayMs));
        }
    }
    throw new Error('Database operation failed after max retries');
}
exports.default = exports.prisma;
