import express, { type Express, type Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { pino, type Logger } from 'pino';
import { pinoHttp } from 'pino-http';
import { LIMITS } from './config/limits';
import type { Database } from './db/client';
import { healthRoutes } from './features/health/health.routes';
import { LocalDiskStorage, type ObjectStorage } from './media/objectStorage';
import { mediaRoutes } from './media/media.routes';
import { errorHandler, notFound } from './shared/http/errorHandler';

// ============================================
// APP — builds the Express application without starting it, so the tests
// send requests to it directly (supertest) and server.ts only listens.
// ============================================

export interface AppDeps {
    /** Database; optional only for the tests of the bare skeleton */
    db?: Database;
    /** Logs; silent by default (tests) */
    logger?: Logger;
    /** Extra routes, for tests only: lets them trigger each error case */
    extraRoutes?: Router;
    /**
     * Number of proxies in front of the server (the tunnel, later the host's
     * load balancer). 0 = clients connect directly. See TRUST_PROXY_HOPS in env.ts.
     */
    trustProxyHops?: number;
    /** Photo files; defaults to the `storage` folder of the current directory */
    storage?: ObjectStorage;
}

// Security: request parts never written to the logs. A session token or a
// cookie in a log file is a stolen account for whoever reads that file.
const REDACTED_LOG_PATHS = [
    'req.headers.authorization',
    'req.headers.cookie',
    'res.headers["set-cookie"]',
];

/**
 * @returns The configured application. Middlewares run in this order.
 */
export const createApp = ({
    db,
    logger = pino({ level: 'silent' }),
    extraRoutes,
    trustProxyHops = 0,
    storage = new LocalDiskStorage('storage'),
}: AppDeps = {}): Express => {
    const app = express();

    // Security: no "X-Powered-By: Express" (helmet removes it too; this is explicit)
    app.disable('x-powered-by');

    // Security: behind a proxy every request seems to come from the proxy, so
    // the limit per IP would be shared by all users. Trusting exactly N hops
    // makes req.ip the real client. Never `true`: a client could then fake its
    // address with its own X-Forwarded-For header and escape the limit.
    app.set('trust proxy', trustProxyHops);

    // 1. Security headers (nosniff, no framing, strict referrer...)
    app.use(helmet());

    // 2. One log line per request, with an id reused by the error handler
    app.use(pinoHttp({ logger, redact: REDACTED_LOG_PATHS }));

    // 3. Baseline limit per IP; answers 429 with standard RateLimit headers
    app.use(
        rateLimit({
            windowMs: LIMITS.rateLimitWindowMs,
            limit: LIMITS.rateLimitMaxRequests,
            standardHeaders: 'draft-8',
            legacyHeaders: false,
        }),
    );

    // 4. JSON bodies only, size capped
    app.use(express.json({ limit: LIMITS.jsonBodyMax }));

    // 5. Routes
    app.use(healthRoutes(db));
    app.use(mediaRoutes(storage));
    if (extraRoutes) app.use(extraRoutes);

    // 6. Nothing matched, then every error as a problem document
    app.use(notFound);
    app.use(errorHandler);

    return app;
};
