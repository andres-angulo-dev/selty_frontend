import express, { type Express, type Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { pino, type Logger } from 'pino';
import { pinoHttp } from 'pino-http';
import { LIMITS } from './config/limits';
import type { Database } from './db/client';
import { feedRoutes } from './features/feed/feed.routes';
import { healthRoutes } from './features/health/health.routes';
import { publicReadRoutes } from './features/publicRead/publicRead.routes';
import { referenceRoutes } from './features/reference/reference.routes';
import { LocalDiskStorage, type ObjectStorage } from './media/objectStorage';
import { mediaRoutes } from './media/media.routes';
import { errorHandler, notFound } from './shared/http/errorHandler';
import { HttpProblem } from './shared/http/problem';
import { LOGGER_SERIALIZERS, withoutQueryParams, withoutQueryString } from './shared/logging/logSerializers';

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
    logger = pino({ level: 'silent', serializers: LOGGER_SERIALIZERS }),
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

    // 2. One log line per request, with an id reused by the error handler.
    // Security / privacy (logSerializers.ts): no query string, and no values
    // bound to a failed SQL query, whatever logger was passed in. pino-http
    // gives these serializers to req.log too (the error handler's logger).
    app.use(
        pinoHttp({
            logger,
            redact: REDACTED_LOG_PATHS,
            serializers: { req: withoutQueryString, err: withoutQueryParams },
        }),
    );

    // 3. Blurred photos, BEFORE the limit: one feed page carries 20 to 60 of them
    // and a pro page up to 100, so counting them would answer 429 on images after
    // a few screens (sooner behind a mobile carrier's shared IP). They are public,
    // immutable (cached a year by the client), unguessable and cheap to serve.
    // Security: only the blurred version is reachable here (media.routes.ts);
    // the clear photos of plan 4 go behind the session check AND the limit.
    // Security: misses are limited per IP (successful answers are not counted),
    // so key probing and disk reads for unknown keys stay bounded. Same key as
    // the baseline (req.ip, through 'trust proxy'); 429 as a problem document.
    app.use(
        '/v1/media',
        rateLimit({
            windowMs: LIMITS.rateLimitWindowMs,
            limit: LIMITS.mediaFailedLookupsPerWindow,
            skipSuccessfulRequests: true,
            standardHeaders: false,
            legacyHeaders: false,
            handler: (_req, _res, next) => next(new HttpProblem(429, 'Too many requests')),
        }),
    );
    app.use(mediaRoutes(storage));

    // 4. Baseline limit per IP; answers 429 with standard RateLimit headers
    app.use(
        rateLimit({
            windowMs: LIMITS.rateLimitWindowMs,
            limit: LIMITS.rateLimitMaxRequests,
            standardHeaders: 'draft-8',
            legacyHeaders: false,
        }),
    );

    // 5. JSON bodies only, size capped
    app.use(express.json({ limit: LIMITS.jsonBodyMax }));

    // 6. Routes
    app.use(healthRoutes(db));
    // Routes that read the database; absent in the tests of the bare skeleton
    if (db) {
        app.use(referenceRoutes(db));
        app.use(publicReadRoutes(db));
        app.use(feedRoutes(db));
    }
    if (extraRoutes) app.use(extraRoutes);

    // 7. Nothing matched, then every error as a problem document
    app.use(notFound);
    app.use(errorHandler);

    return app;
};
