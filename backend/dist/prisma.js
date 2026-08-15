"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.withDbRetry = withDbRetry;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient({
    log: ['error', 'warn'],
});
// Helper for database queries with automatic retry for transient connection issues (P1001)
async function withDbRetry(fn, maxRetries = 3) {
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            return await fn();
        }
        catch (error) {
            attempts++;
            if (error?.code === 'P1001' && attempts < maxRetries) {
                console.warn(`⚠️ Database connection warning (P1001). Retrying attempt ${attempts}/${maxRetries}...`);
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
            }
            else {
                throw error;
            }
        }
    }
    throw new Error('Database connection failed after maximum retries');
}
