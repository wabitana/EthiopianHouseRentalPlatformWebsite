"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const client_1 = require("@prisma/client");
const env_1 = require("./env");
exports.prisma = global.prisma ||
    new client_1.PrismaClient({
        log: ['error', 'warn'],
    });
if (env_1.env.NODE_ENV !== 'production') {
    global.prisma = exports.prisma;
}
async function connectDatabase() {
    try {
        await exports.prisma.$connect();
        console.log('PostgreSQL database connected successfully via Prisma.');
    }
    catch (error) {
        console.error('Database connection failed:', error);
    }
}
async function disconnectDatabase() {
    await exports.prisma.$disconnect();
}
