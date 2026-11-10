import type { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpProblem, sendProblem } from './problem';

// ============================================
// ERROR HANDLING — the last middlewares. Every error leaves as a problem
// document. Security: an unexpected error never shows its message or its
// stack to the client (they can reveal file paths, SQL, secrets); they go to
// the logs with the request id instead.
// ============================================

/** Errors raised by express.json() carry a `type` (body-parser) */
const hasBodyParserType = (error: unknown): error is { type: string } =>
    typeof error === 'object' && error !== null && typeof (error as { type?: unknown }).type === 'string';

/** No route matched: 404 */
export const notFound: RequestHandler = () => {
    throw new HttpProblem(404, 'Not found');
};

/**
 * Turns any thrown error into a problem document.
 * Express 5 also sends here the rejections of async routes.
 */
export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
    if (error instanceof HttpProblem) {
        sendProblem(res, error, req.path);
        return;
    }

    // The body could not be read: the client's fault, said plainly
    if (hasBodyParserType(error)) {
        if (error.type === 'entity.parse.failed') {
            sendProblem(res, new HttpProblem(400, 'Malformed JSON'), req.path);
            return;
        }
        if (error.type === 'entity.too.large') {
            sendProblem(res, new HttpProblem(413, 'Payload too large'), req.path);
            return;
        }
    }

    // Unexpected: full details in the logs only
    req.log.error({ err: error }, 'unexpected error');
    sendProblem(res, new HttpProblem(500, 'Internal error'), req.path);
};
