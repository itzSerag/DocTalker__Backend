import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { connectDB, disconnectDB } from './config/database';

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`DocTalker Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('HTTP server closed.');
        process.exit(0);
      });

      // Force shutdown after 10s if hung
      setTimeout(() => {
        console.error('Forcing shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error: any) {
    console.error('Fatal: Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
