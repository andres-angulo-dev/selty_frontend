import { DrizzleQueryError } from 'drizzle-orm';
import { pino } from 'pino';
import { describe, expect, it } from 'vitest';
import { LOGGER_SERIALIZERS, withoutQueryString } from '../logSerializers';

// ============================================
// Log serializers: a logged SQL failure keeps its query and its cause's code,
// never the values bound to it; a logged request keeps its path only.
// ============================================

/** Logs `err` through a pino() logger configured like the server's, returns the line */
const logLine = (err: unknown): string => {
    const lines: string[] = [];
    const logger = pino({ level: 'info', serializers: LOGGER_SERIALIZERS }, { write: (line: string) => lines.push(line) });
    logger.error({ err }, 'boom');
    return lines.join('');
};

describe('error serializer', () => {
    it('drops the bound values of a Drizzle query error, keeps the SQL and the cause code', () => {
        const cause = Object.assign(new Error('duplicate key value'), {
            code: '23505',
            detail: 'Key (email)=(sophie@example.fr) already exists.',
        });
        const line = logLine(new DrizzleQueryError('select * from feed where x = $1 and y = $2', [2.6553, 48.5421], cause));
        const logged = JSON.parse(line).err;

        expect(logged.type).toBe('DrizzleQueryError');
        expect(logged.message).toContain('select * from feed where x = $1');
        expect(logged.causeCode).toBe('23505');
        expect(logged).not.toHaveProperty('params');
        expect(line).not.toContain('2.6553');
        expect(line).not.toContain('48.5421');
        expect(line).not.toContain('params:');
        expect(line).not.toContain('sophie@example.fr');
    });

    it('drops every bound value, even after a newline inside one of them', () => {
        const err = new DrizzleQueryError('insert into requests (title, description) values ($1, $2)', [
            'Fuite',
            'Bonjour\nSECRET-MARKER rue des Lilas',
        ], new Error('boom'));
        const line = logLine(err);
        expect(line).not.toContain('SECRET-MARKER');
        expect(line).not.toContain('Lilas');
        expect(JSON.parse(line).err.message).toContain('insert into requests');
    });

    it('logs only the class and the SQLSTATE of a database cause, never its message (it can echo input)', () => {
        const cause = Object.assign(new Error('invalid input syntax for type uuid: "secret-input"'), { code: '22P02' });
        const line = logLine(new DrizzleQueryError('select * from annonces where id = $1', ['secret-input'], cause));
        const logged = JSON.parse(line).err;
        expect(line).not.toContain('secret-input');
        expect(logged.causeCode).toBe('22P02');
        expect(logged.causeType).toBe('Error');
    });

    it('logs a database error met on its own as class and code only', () => {
        const line = logLine(Object.assign(new Error('value "secret-input" out of range'), { code: '22003' }));
        expect(line).not.toContain('secret-input');
        expect(JSON.parse(line).err).toMatchObject({ code: '22003' });
    });

    it('does not throw on a self-referencing error', () => {
        const err = new Error('outer') as Error & { inner?: unknown };
        const inner = { message: 'inner', stack: 'inner stack', self: null as unknown };
        inner.self = inner;
        err.inner = inner;
        (err as Error & { cause?: unknown }).cause = err;
        expect(() => logLine(err)).not.toThrow();
        expect(JSON.parse(logLine(err)).err.message).toContain('outer');
    });

    it('cuts the bound values of ANY error whose text copies Drizzle\'s, not only a recognised query error', () => {
        const line = logLine(new Error('wrapped: Failed query: select 1\nparams: 48.5421,2.6553'));
        const logged = JSON.parse(line).err;
        expect(logged.message).toBe('wrapped: Failed query: select 1');
        expect(line).not.toContain('48.5421');
        expect(line).not.toContain('2.6553');
    });

    it('leaves an ordinary error readable', () => {
        const logged = JSON.parse(logLine(new Error('plain failure'))).err;
        expect(logged.message).toBe('plain failure');
        expect(logged.stack).toContain('plain failure');
    });
});

describe('request serializer', () => {
    it('keeps the path, drops the query string and its parsed copy', () => {
        expect(withoutQueryString({ method: 'GET', url: '/v1/feed?lat=48.5&lng=2.6', query: { lat: '48.5' } })).toEqual({
            method: 'GET',
            url: '/v1/feed',
        });
    });
});
