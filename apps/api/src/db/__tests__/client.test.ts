import { pino } from 'pino';
import { describe, expect, it } from 'vitest';
import { createDb } from '../client';
import { TEST_DATABASE_URL } from '../../test/db';

// ============================================
// A connection that drops while idle (PostgreSQL restarted, network cut) makes
// the pool emit "error". With nobody listening, Node stops the whole server.
// ============================================

describe('createDb', () => {
    it('keeps the server alive and logs it when an idle connection drops', async () => {
        const lines: string[] = [];
        const logger = pino({ level: 'error' }, { write: (line: string) => lines.push(line) });
        const { db, close } = createDb(TEST_DATABASE_URL, logger);

        // The pool behind Drizzle; emitting by hand stands for a dropped connection
        expect(() => db.$client.emit('error', new Error('terminating connection'))).not.toThrow();
        expect(lines.join('')).toContain('idle database connection lost');

        await close();
    });

    it('closes once even when asked twice (two Ctrl+C)', async () => {
        const { close } = createDb(TEST_DATABASE_URL);
        await close();
        await expect(close()).resolves.toBeUndefined();
    });
});
