import path from 'node:path';
import { pino } from 'pino';
import { createApp } from './app';
import { loadEnv } from './config/env';
import { createDb } from './db/client';
import { LocalDiskStorage } from './media/objectStorage';
import { LOGGER_SERIALIZERS } from './shared/logging/logSerializers';

// ============================================
// SERVER — reads the settings, opens the database, builds the app, listens.
// Started by `npm run dev -w @sialty/api` (tsx, settings from apps/api/.env).
// ============================================

const env = loadEnv(process.env);
// Errors logged outside a request (pool, startup) lose their bound SQL values too
const logger = pino({ level: env.NODE_ENV === 'production' ? 'info' : 'debug', serializers: LOGGER_SERIALIZERS });
const database = createDb(env.DATABASE_URL, logger);

const app = createApp({
    db: database.db,
    logger,
    trustProxyHops: env.TRUST_PROXY_HOPS,
    storage: new LocalDiskStorage(path.resolve(env.STORAGE_DIR)),
});
const server = app.listen(env.PORT, env.HOST, () => {
    logger.info(`API listening on http://${env.HOST}:${env.PORT}`);
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
// in progress, close the database connections, then exit.
// A second signal is ignored; a request that never ends cannot block the stop:
// after 10 s the process exits anyway (unref: this timer alone keeps nothing alive).
const SHUTDOWN_TIMEOUT_MS = 10_000;
let isClosing = false;

const shutdown = (signal: string): void => {
    if (isClosing) return;
    isClosing = true;
    logger.info(`${signal} received, closing`);

    setTimeout(() => {
        logger.error('requests still running after 10 s, forced exit');
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();

    server.close(() => {
        void database.close().finally(() => process.exit(0));
    });
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
