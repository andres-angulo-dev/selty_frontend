import type { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpProblem, sendProblem } from './problem';

// ============================================
// ERROR HANDLING — the last middlewares. Every error leaves as a problem
// document. Security: an unexpected error never shows its message or its
// stack to the client (they can reveal file paths, SQL, secrets); they go to
// the logs with the request id instead.
// ============================================

/**
 * Errors raised while reading the body (express.json(), from body-parser) carry
 * a `type` and a 4xx `status`, with `expose: true`: the client sent something
 * unreadable (broken JSON, unknown charset, too large, aborted upload).
 */
const isBodyReadError = (error: unknown): error is { type: string; status: number } => {
    if (typeof error !== 'object' || error === null) return false;
    const { type, status, expose } = error as { type?: unknown; status?: unknown; expose?: unknown };
    return typeof type === 'string' && typeof status === 'number' && status >= 400 && status < 500 && expose === true;
};

// Title per body error; any other 4xx from body-parser is a plain "Bad request"
const BODY_ERROR_TITLES: Record<string, string> = {
    'entity.parse.failed': 'Malformed JSON',
    'entity.too.large': 'Payload too large',
    'encoding.unsupported': 'Unsupported media type',
    'charset.unsupported': 'Unsupported media type',
};

/** No route matched: 404 */
export const notFound: RequestHandler = () => {
    throw new HttpProblem(404, 'Not found');
};

/**
 * Turns any thrown error into a problem document.
 * Express 5 also sends here the rejections of async routes.
 */
export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    // The answer has already started (headers sent): a new one cannot be
    // written. Express's own handler then closes the connection.
    if (res.headersSent) {
        req.log.error({ err: error }, 'error after the response started');
        next(error);
        return;
    }

    if (error instanceof HttpProblem) {
        sendProblem(res, error, req.path);
        return;
    }

    // The body could not be read: the client's fault, said plainly
    if (isBodyReadError(error)) {
        const title = BODY_ERROR_TITLES[error.type] ?? 'Bad request';
        sendProblem(res, new HttpProblem(error.status, title), req.path);
        return;
    }

    // Unexpected: full details in the logs only
    req.log.error({ err: error }, 'unexpected error');
    sendProblem(res, new HttpProblem(500, 'Internal error'), req.path);
};
