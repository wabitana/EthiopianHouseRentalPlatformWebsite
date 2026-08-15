"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const storage_1 = require("./config/storage");
const logger_1 = require("./utils/logger");
async function startServer() {
    try {
        (0, storage_1.ensureStorageDirectories)();
        await (0, database_1.connectDatabase)();
        await (0, redis_1.connectRedis)();
        const server = app_1.app.listen(env_1.env.PORT, () => {
            logger_1.logger.info(`🚀 Ethiopian Property Platform API running on port ${env_1.env.PORT}`);
            logger_1.logger.info(`🔗 Base URL: http://localhost:${env_1.env.PORT}${env_1.env.API_PREFIX}`);
            logger_1.logger.info(`🏥 Health Check: http://localhost:${env_1.env.PORT}${env_1.env.API_PREFIX}/health`);
        });
        const shutdown = async (signal) => {
            logger_1.logger.info(`Received ${signal}. Shutting down gracefully...`);
            server.close(async () => {
                await (0, database_1.disconnectDatabase)();
                logger_1.logger.info('Server and connections closed.');
                process.exit(0);
            });
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
