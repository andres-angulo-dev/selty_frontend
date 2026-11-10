import { defineConfig } from 'vitest/config';

// ============================================
// API tests: the test database is migrated once, then test files run one
// after the other, since they share that database and empty its tables.
// ============================================

export default defineConfig({
    test: {
        globalSetup: ['./src/test/globalSetup.ts'],
        fileParallelism: false,
    },
});
