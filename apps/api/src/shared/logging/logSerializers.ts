import { stdSerializers } from 'pino';

// ============================================
// LOG SERIALIZERS — what a request or an error becomes in a log line.
// Security / privacy: a log file is read by more people, and kept longer,
// than the data itself. Two leaks are closed here, for every route:
// - the query string (the feed's ?lat=&lng= says where a person is);
// - the values bound to a failed SQL query. drizzle-orm's DrizzleQueryError
//   writes them in its message ("Failed query: <sql>\nparams: 2.6553,48.5421")
//   and keeps them in `params`; they can be a position, a name, an e-mail...
//   The SQL text stays (placeholders $1, $2 only) and so does the cause's
//   code (57014 = statement timeout...): enough to understand the failure.
// ============================================

/** The standard serialized request of pino-http (only the keys handled here are typed) */
interface SerializedRequest {
    url?: string;
    query?: unknown;
    [key: string]: unknown;
}

/** A serialized error as pino-std-serializers makes it (`raw` = the original, not enumerable) */
interface SerializedError {
    message?: unknown;
    stack?: unknown;
    raw?: unknown;
    [key: string]: unknown;
}

/** "\nparams: ..." up to the end of its line, as drizzle-orm writes it in message and stack */
const BOUND_PARAMS_LINE = /\nparams: [^\n]*/g;

/**
 * Keys dropped at every level: `params` = the bound values; `detail` = pg's
 * detail line, which quotes row values ("Key (email)=(a@b.fr) already exists")
 */
const DROPPED_ERROR_KEYS = new Set(['params', 'detail', 'raw']);

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

const scrubText = (value: unknown): unknown =>
    typeof value === 'string' ? value.replace(BOUND_PARAMS_LINE, '') : value;

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/** Code of the error's cause (pg's SQLSTATE), which the standard serializer folds into the message */
const causeCodeOf = (raw: unknown): string | undefined => {
    const cause = isPlainRecord(raw) || raw instanceof Error ? (raw as { cause?: unknown }).cause : undefined;
    const code = cause && typeof cause === 'object' ? (cause as { code?: unknown }).code : undefined;
    return typeof code === 'string' ? code : undefined;
};

/**
 * Error serializer for pino-http, which first runs the standard serializer
 * then this one.
 * @param err error already serialized by pino-std-serializers
 * @returns a new object without bound query values (message, stack, `params`,
 *          nested errors), with `causeCode` when the cause has a code
 */
export const withoutQueryParams = (err: SerializedError): SerializedError => {
    if (!isPlainRecord(err)) return err;
    const safe: SerializedError = {};
    for (const [key, value] of Object.entries(err)) {
        if (DROPPED_ERROR_KEYS.has(key)) continue;
        if (key === 'message' || key === 'stack') safe[key] = scrubText(value);
        else if (Array.isArray(value)) safe[key] = value.map((item) => (isPlainRecord(item) ? withoutQueryParams(item) : item));
        else if (isPlainRecord(value) && ('message' in value || 'stack' in value)) safe[key] = withoutQueryParams(value);
        else safe[key] = value;
    }
    const causeCode = causeCodeOf(err.raw);
    if (causeCode && safe.causeCode === undefined) safe.causeCode = causeCode;
    return safe;
};

/**
 * Error serializer for a logger made with pino() (it receives the raw error).
 * @param err anything logged under `err`
 * @returns the standard serialization, then withoutQueryParams
 */
export const serializeLogError = (err: unknown): unknown => {
    const serialized: unknown = stdSerializers.err(err as Error);
    return isPlainRecord(serialized) ? withoutQueryParams(serialized) : serialized;
};

/** Serializers for every pino() logger the app creates (server, default of createApp) */
export const LOGGER_SERIALIZERS = { err: serializeLogError };
