import { app } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { ensureStorageDirectories } from './config/storage';
import { logger } from './utils/logger';

async function startServer() {
  try {
    ensureStorageDirectories();
    await connectDatabase();
    await connectRedis();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Ethiopian Property Platform API running on port ${env.PORT}`);
      logger.info(`🔗 Base URL: http://localhost:${env.PORT}${env.API_PREFIX}`);
      logger.info(`🏥 Health Check: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info('Server and connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
