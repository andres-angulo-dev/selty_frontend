import { defineConfig } from 'drizzle-kit';

// ============================================
// drizzle-kit writes the migration files from the schema (npm run db:generate).
// It never touches a database here: migrations are applied by src/db/migrate.ts.
// ============================================

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/db/schema/index.ts',
    out: './drizzle',
});
