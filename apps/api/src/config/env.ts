import { z } from 'zod';

// ============================================
// ENVIRONMENT — read and checked once, at start-up.
// A missing or wrong setting stops the server with a message naming every
// problem, instead of failing later on the first request that needs it.
// Security: values never appear in the message (DATABASE_URL holds a password).
// ============================================

// Comma-separated text ("a, b,") to a clean list (["a", "b"])
// The default is written as text and goes through the same cleaning.
const commaList = (defaultText: string) =>
    z
        .string()
        .default(defaultText)
        .transform((text) =>
            text
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item.length > 0),
        );

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    // From text ("3000") to a valid TCP port
    PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
    // postgres:// or postgresql://, the two forms accepted by the driver
    DATABASE_URL: z.string().regex(/^postgres(ql)?:\/\//, 'must start with postgres://'),
    // Proxies in front of the server: 1 behind the tunnel, 0 when called directly.
    // A number, never "true" (see app.ts: a client could fake its address).
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
    // Network interface to listen on. 127.0.0.1 = this machine only: the tunnel
    // (on this machine) still reaches it, but no device of the local network can
    // call the API directly with a forged X-Forwarded-For. A host sets 0.0.0.0.
    // Folder of the photo files, relative to apps/api (the folder npm runs the server from)
    STORAGE_DIR: z.string().min(1).default('storage'),
    HOST: z.string().min(1).default('127.0.0.1'),

    // --- Authentication (Better Auth) ---
    // Security: required, NO default. A default secret could reach production and
    // let anyone forge sessions. 32 characters minimum (openssl rand -base64 32).
    BETTER_AUTH_SECRET: z.string().min(32, 'must be at least 32 characters'),
    // Hosts the API may be reached on (the tunnel address changes at each start,
    // hence the wildcard). Comma list, trimmed, empty items dropped.
    AUTH_ALLOWED_HOSTS: commaList('localhost:4000,127.0.0.1:4000,*.trycloudflare.com'),
    // Base URL used when the request host is not in the allowed list
    AUTH_FALLBACK_URL: z.string().url().default('http://localhost:4000'),
    // Headers read, in order, to find the client address (behind the tunnel)
    AUTH_IP_HEADERS: commaList('cf-connecting-ip'),

    // --- E-mail (sign-in codes) ---
    // Local catcher by default (nothing leaves this machine in development)
    SMTP_HOST: z.string().min(1).default('127.0.0.1'),
    SMTP_PORT: z.coerce.number().int().min(1).max(65_535).default(1025),
    MAIL_FROM: z.string().min(1).default('Sialty <no-reply@sialty.test>'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * @param source The variables to read (process.env in the server, a plain object in tests)
 * @returns The checked settings
 * @throws Error listing each invalid or missing variable by name
 */
export const loadEnv = (source: NodeJS.ProcessEnv): Env => {
    const result = envSchema.safeParse(source);

    // One line per problem: "DATABASE_URL: must start with postgres://"
    const problems = result.success
        ? []
        : result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);

    // Security: in production the allowed hosts must be listed explicitly and never
    // use a wildcard. The development default (*.trycloudflare.com) would let any
    // tunnel host set Better Auth's base URL. Checked on the raw source because the
    // schema default hides whether the variable was set. Values never appear.
    if (source.NODE_ENV === 'production') {
        const raw = source.AUTH_ALLOWED_HOSTS;
        if (raw === undefined || raw.trim() === '') {
            problems.push('AUTH_ALLOWED_HOSTS: must be set explicitly in production');
        } else if (raw.includes('*')) {
            problems.push('AUTH_ALLOWED_HOSTS: must not contain a wildcard in production');
        }

        // Security: the header carrying the client address must be named explicitly. Without
        // it Better Auth cannot read an address and its limiter would put every client in one
        // bucket (one abuser locks everybody out); a default header (cf-connecting-ip) behind
        // another proxy is chosen by the client itself, so it could dodge the limit.
        const ipHeaders = source.AUTH_IP_HEADERS;
        if (ipHeaders === undefined || ipHeaders.trim() === '') {
            problems.push('AUTH_IP_HEADERS: must be set explicitly in production');
        }
    }

    if (result.success && problems.length === 0) return result.data;
    throw new Error(`Invalid environment:\n${problems.join('\n')}`);
};
