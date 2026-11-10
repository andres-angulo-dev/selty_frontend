import type { Response } from 'express';

// ============================================
// PROBLEM DOCUMENTS (RFC 9457) — the one shape of every API error.
// The app reads `errors` to show FormErrorSummary under a refused form.
// ============================================

/** One invalid field: `field` is the path in the body ("location.city") */
export interface FieldError {
    field: string;
    message: string;
}

/** Body of an error response, sent as application/problem+json */
export interface ProblemBody {
    type: 'about:blank';
    title: string;
    status: number;
    detail?: string;
    instance: string;
    errors?: FieldError[];
}

/**
 * An error a route throws on purpose: its title and detail are written for the
 * client and are sent as they are. Anything else that is thrown becomes a
 * generic 500, whose message stays in the logs.
 */
export class HttpProblem extends Error {
    constructor(
        readonly status: number,
        readonly title: string,
        readonly options: { detail?: string; errors?: FieldError[] } = {},
    ) {
        super(title);
        this.name = 'HttpProblem';
    }
}

/**
 * Sends a problem document.
 * @param res Express response
 * @param instance The request path, so the client knows which call failed
 */
export const sendProblem = (res: Response, problem: HttpProblem, instance: string): void => {
    const body: ProblemBody = {
        type: 'about:blank',
        title: problem.title,
        status: problem.status,
        ...(problem.options.detail ? { detail: problem.options.detail } : {}),
        instance,
        ...(problem.options.errors ? { errors: problem.options.errors } : {}),
    };
    // res.json keeps a content type already set, so the problem type survives
    res.status(problem.status).type('application/problem+json').json(body);
};
