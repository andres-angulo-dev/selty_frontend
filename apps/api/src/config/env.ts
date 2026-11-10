import { z } from 'zod';

// ============================================
// ENVIRONMENT — read and checked once, at start-up.
// A missing or wrong setting stops the server with a message naming every
// problem, instead of failing later on the first request that needs it.
// Security: values never appear in the message (DATABASE_URL holds a password).
// ============================================

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
});

export type Env = z.infer<typeof envSchema>;

/**
 * @param source The variables to read (process.env in the server, a plain object in tests)
 * @returns The checked settings
 * @throws Error listing each invalid or missing variable by name
 */
export const loadEnv = (source: NodeJS.ProcessEnv): Env => {
    const result = envSchema.safeParse(source);
    if (result.success) return result.data;

    // One line per problem: "DATABASE_URL: must start with postgres://"
    const problems = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment:\n${problems.join('\n')}`);
};
