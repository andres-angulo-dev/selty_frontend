import { DrizzleQueryError } from 'drizzle-orm';

// ============================================
// LOG SERIALIZERS — what a request or an error becomes in a log line.
// Security / privacy: a log file is read by more people, and kept longer,
// than the data itself. Two leaks are closed here, for every route:
// - the query string (the feed's ?lat=&lng= says where a person is);
// - user data carried by a failed SQL query:
//   * drizzle-orm's DrizzleQueryError writes the bound values in its message
//     and stack ("Failed query: <sql>\nparams: 2.6553,48.5421") and keeps them
//     in `params`. A value can itself contain a newline, so values are never
//     searched for in the text: message and stack are CUT at the first
//     "\nparams:", only the SQL before it stays (placeholders $1, $2...);
//   * the database's own error (pg DatabaseError) can quote the input
//     ('invalid input syntax for type uuid: "..."'), so only its class and its
//     SQLSTATE code are logged (57014 = statement timeout...), never its
//     message, stack or detail.
// The errors are serialized here from the original object, not from pino's
// standard output: that one folds every cause's message into the message.
// ============================================

/** The standard serialized request of pino-http (only the keys handled here are typed) */
interface SerializedRequest {
    url?: string;
    query?: unknown;
    [key: string]: unknown;
}

/** An error as it appears in a log line */
type LoggedError = Record<string, unknown>;

/** Where drizzle-orm starts listing the bound values */
const PARAMS_MARKER = '\nparams:';

/** A SQLSTATE: five digits or capital letters ("57014", "22P02") */
const SQLSTATE = /^[0-9A-Z]{5}$/;

/** Errors nested deeper than this (cause of a cause...) are not detailed */
const MAX_ERROR_DEPTH = 5;

/** Keys never copied from an error: values (params), quoted rows (detail), handled apart (message, stack, cause) */
const SKIPPED_ERROR_KEYS = new Set(['message', 'stack', 'cause', 'params', 'detail', 'raw']);

/**
 * Request serializer for pino-http: keeps the path, drops the query string and
 * its parsed copy.
 * @param req request already serialized by pino-std-serializers
 * @returns a new object, `url` without "?..."
 */
export const withoutQueryString = (req: SerializedRequest): SerializedRequest => {
    const { query: _query, ...rest } = req;
    return { ...rest, url: req.url?.split('?')[0] };
};

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

/** An Error, or an object shaped like one (pino-http may hand over a plain copy) */
const isErrorLike = (value: unknown): value is Record<string, unknown> =>
    value instanceof Error || (isObject(value) && typeof value.message === 'string' && 'stack' in value);

/** drizzle-orm's query error (class check, or its shape when it comes from another copy of the package) */
const isQueryError = (err: Record<string, unknown>): boolean =>
    err instanceof DrizzleQueryError || (typeof err.query === 'string' && Array.isArray(err.params));

/** A database error: carries a SQLSTATE code (a Node system error such as EPIPE carries `syscall` instead) */
const isDatabaseError = (err: Record<string, unknown>): boolean =>
    typeof err.code === 'string' && SQLSTATE.test(err.code) && !('syscall' in err);

const typeOf = (err: Record<string, unknown>): string =>
    typeof err.constructor === 'function' && err.constructor.name ? err.constructor.name : String(err.name ?? 'Error');

/** Keeps only what precedes the bound values; a text without them is unchanged */
const beforeParams = (text: unknown): string | undefined => {
    if (typeof text !== 'string') return undefined;
    const index = text.indexOf(PARAMS_MARKER);
    return index === -1 ? text : text.slice(0, index);
};

/**
 * One error as a safe log object.
 * @param err   the original error (or an error-shaped object)
 * @param seen  errors already on the path: a self-reference stops here
 * @param depth nesting level, capped by MAX_ERROR_DEPTH
 */
const toLoggedError = (err: Record<string, unknown>, seen: WeakSet<object>, depth: number): LoggedError => {
    const type = typeOf(err);
    if (seen.has(err) || depth > MAX_ERROR_DEPTH) return { type, truncated: true };
    seen.add(err);

    if (isDatabaseError(err)) return { type, code: err.code };

    const queryError = isQueryError(err);
    const logged: LoggedError = {
        type,
        message: queryError ? beforeParams(err.message) : err.message,
        stack: queryError ? beforeParams(err.stack) : err.stack,
    };

    for (const [key, value] of Object.entries(err)) {
        if (SKIPPED_ERROR_KEYS.has(key)) continue;
        if (isErrorLike(value)) logged[key] = toLoggedError(value, seen, depth + 1);
        else if (Array.isArray(value)) {
            logged[key] = value.map((item) => (isErrorLike(item) ? toLoggedError(item, seen, depth + 1) : item));
        } else if (!isObject(value)) logged[key] = value;
        // Other nested objects are left out: they may hold anything, cycles included
    }

    const cause = err.cause;
    if (isErrorLike(cause)) {
        if (isDatabaseError(cause)) {
            logged.causeType = typeOf(cause);
            logged.causeCode = cause.code;
        } else {
            logged.cause = toLoggedError(cause, seen, depth + 1);
        }
    }
    return logged;
};

/**
 * Error serializer for a logger made with pino() (it receives the raw error).
 * @param err anything logged under `err`
 * @returns a safe log object for an error; any other value unchanged
 */
export const serializeLogError = (err: unknown): unknown =>
    isErrorLike(err) ? toLoggedError(err, new WeakSet(), 0) : err;

/**
 * Error serializer for pino-http, which first runs the standard serializer
 * then this one: the original error is taken back from its `raw` key.
 * @param err error already serialized by pino-std-serializers
 * @returns the same safe log object as serializeLogError
 */
export const withoutQueryParams = (err: unknown): unknown => {
    const raw = isObject(err) && 'raw' in err ? err.raw : err;
    return serializeLogError(raw);
};

/** Serializers for every pino() logger the app creates (server, default of createApp) */
export const LOGGER_SERIALIZERS = { err: serializeLogError };
