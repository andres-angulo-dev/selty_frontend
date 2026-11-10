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
