import dotenv from 'dotenv';
import http from 'http';
import { createApp } from './app';
import { logger } from './lib/logger';
import * as deployment from './lib/deployment';
import { initRedis } from './lib/redisCache';
import { setupSocket, getIO } from './lib/socket';
import { initializeScheduler, shutdownScheduler } from './lib/scheduler';

// Load environment variables first
dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

// Initialize services and start server
async function startServer() {
    const app = createApp();

    // Create HTTP server from Express app
    const httpServer = http.createServer(app);

    // Initialize Redis (non-blocking, falls back to memory cache)
    try {
        const redisConnected = await initRedis();
        if (redisConnected) {
            logger.info('✅ Redis connected');
        } else {
            logger.info('ℹ️  Redis not configured, using in-memory cache');
        }
    } catch (err) {
        logger.warn('⚠️  Redis initialization failed, using in-memory cache');
    }

    // Initialize Socket.io for real-time communication
    try {
        setupSocket(httpServer);
        logger.info('🔌 Socket.io initialized');
    } catch (err) {
        logger.warn('⚠️  Socket.io initialization failed:', err);
    }

    const server = httpServer.listen(PORT, () => {
        logger.info(`🚀 API running on http://localhost:${PORT}`);
        logger.info(`📚 API docs available at http://localhost:${PORT}/docs`);
        logger.info(`❤️  Health check at http://localhost:${PORT}/health`);
        logger.info(`🔌 Socket.io ready at ws://localhost:${PORT}`);
        
        // Initialize deployment tracking
        deployment.initDeployment(server);
        
        // Initialize scheduled tasks (job alerts, pre-apply processing)
        initializeScheduler();
    });

    // Enhanced graceful shutdown with connection draining
    deployment.registerShutdownHandlers(server);

    return server;
}

// Only start the server if we're not in test mode, or if strictly requested
let serverPromise: Promise<any> | undefined; // Using any to avoid type complexity with http types

if (process.env.NODE_ENV !== 'test') {
    serverPromise = startServer().catch((err) => {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    });
}

export { serverPromise as server, getIO };
export default createApp;
