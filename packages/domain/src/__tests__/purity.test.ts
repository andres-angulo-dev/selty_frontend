import { describe, expect, it } from 'vitest';

// ============================================
// Guard: @sialty/domain runs on the phone AND on the server. It must never
// import a UI library or code of an app, or the server would break (or pull
// React Native in). Reads every source file and checks its imports.
// ============================================

// Raw text of every source file (tests included), keyed by path
const sources = import.meta.glob<string>('../**/*.ts', { query: '?raw', import: 'default', eager: true });

// An import or re-export line (not a comment) whose target belongs to an app
// or a UI library. `m`: ^ matches at the start of every line.
const FORBIDDEN =
    /^\s*(import|export)\b[^\n]*from\s+['"](react|react-native|expo[^'"]*|@expo\/[^'"]*|@\/[^'"]*|[^'"]*apps\/[^'"]*)['"]/m;

describe('domain purity', () => {
    it('catches a forbidden import but not a comment that mentions one', () => {
        expect("import { View } from 'react-native';").toMatch(FORBIDDEN);
        expect("export { Strings } from '@/shared/constants';").toMatch(FORBIDDEN);
        expect("// screens still import from '@/shared/types'").not.toMatch(FORBIDDEN);
        expect("import { z } from 'zod';").not.toMatch(FORBIDDEN);
    });

    it('reads the source files', () => {
        expect(Object.keys(sources).length).toBeGreaterThan(10);
    });

    it.each(Object.entries(sources))('%s imports no app or UI code', (_path, text) => {
        expect(text).not.toMatch(FORBIDDEN);
    });
});
