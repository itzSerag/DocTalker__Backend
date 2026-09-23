import dotenv from 'dotenv';
dotenv.config();

// Validate environment variables on startup
import './config/validateEnv';

import { App } from './app';
import { connectDB, disconnectDB } from './config/database';
import logger from './utils/logger';

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
    try {
        // Connect to database
        await connectDB();

        const app = App();

        const server = app.listen(PORT, '0.0.0.0', () => {
            logger.info(`DocTalker Server running on http://0.0.0.0:${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            logger.info(`Received ${signal}. Shutting down gracefully...`);
            server.close(async () => {
                await disconnectDB();
                logger.info('HTTP server closed.');
                process.exit(0);
            });

            // Force shutdown after 10s if hung
            setTimeout(() => {
                logger.error('Forcing shutdown after timeout.');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (error: any) {
        logger.fatal({ err: error }, `Fatal: Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();
