import express, { type Express, type Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { pino, type Logger } from 'pino';
import { pinoHttp } from 'pino-http';
import { LIMITS } from './config/limits';
import { healthRoutes } from './features/health/health.routes';
import { errorHandler, notFound } from './shared/http/errorHandler';

// ============================================
// APP — builds the Express application without starting it, so the tests
// send requests to it directly (supertest) and server.ts only listens.
// ============================================

export interface AppDeps {
    /** Logs; silent by default (tests) */
    logger?: Logger;
    /** Extra routes, for tests only: lets them trigger each error case */
    extraRoutes?: Router;
}

/**
 * @returns The configured application. Middlewares run in this order.
 */
export const createApp = ({ logger = pino({ level: 'silent' }), extraRoutes }: AppDeps = {}): Express => {
    const app = express();

    // Security: no "X-Powered-By: Express" (helmet removes it too; this is explicit)
    app.disable('x-powered-by');

    // 1. Security headers (nosniff, no framing, strict referrer...)
    app.use(helmet());

    // 2. One log line per request, with an id reused by the error handler
    app.use(pinoHttp({ logger }));

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
    app.use(healthRoutes());
    if (extraRoutes) app.use(extraRoutes);

    // 6. Nothing matched, then every error as a problem document
    app.use(notFound);
    app.use(errorHandler);

    return app;
};
