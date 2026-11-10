import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { HttpProblem, type FieldError } from './problem';

// ============================================
// VALIDATION — every route checks what it receives with a Zod schema
// (the same ones as the app, from @sialty/domain). Never trust the client.
// ============================================

interface RequestSchemas {
    body?: ZodType;
    query?: ZodType;
    params?: ZodType;
}

/**
 * Checks the parts of the request that have a schema.
 * On success the parsed values replace the raw ones: `req.body` for the body
 * (unknown keys dropped, texts trimmed...), `res.locals.query` and
 * `res.locals.params` for the others (Express 5 makes req.query read-only).
 * On failure: 400 "Invalid request", one entry per invalid field.
 */
export const validate = (schemas: RequestSchemas): RequestHandler => (req, res, next) => {
    const errors: FieldError[] = [];

    for (const part of ['body', 'query', 'params'] as const) {
        const schema = schemas[part];
        if (!schema) continue;

        const result = schema.safeParse(req[part]);
        if (!result.success) {
            for (const issue of result.error.issues) {
                errors.push({ field: issue.path.map(String).join('.'), message: issue.message });
            }
            continue;
        }
        if (part === 'body') req.body = result.data;
        else res.locals[part] = result.data;
    }

    if (errors.length > 0) {
        throw new HttpProblem(400, 'Invalid request', { errors });
    }
    next();
};
