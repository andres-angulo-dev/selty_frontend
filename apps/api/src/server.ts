import { pino } from 'pino';
import { createApp } from './app';
import { loadEnv } from './config/env';

// ============================================
// SERVER — reads the settings, builds the app, listens.
// Started by `npm run dev -w @sialty/api` (tsx, settings from apps/api/.env).
// ============================================

const env = loadEnv(process.env);
const logger = pino({ level: env.NODE_ENV === 'production' ? 'info' : 'debug' });

const server = createApp({ logger }).listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
});

// A port already taken (another project's dev server...) must stop the start-up
// with a clear message, not leave the requests going to the other program
server.on('error', (error: NodeJS.ErrnoException) => {
    logger.fatal(
        error.code === 'EADDRINUSE' ? `Port ${env.PORT} is already used: change PORT in apps/api/.env` : error.message,
    );
    process.exit(1);
});

// Stop cleanly (Ctrl+C, or the host stopping the server): finish the requests
// in progress, then exit
const shutdown = (signal: string): void => {
    logger.info(`${signal} received, closing`);
    server.close(() => process.exit(0));
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
