import { describe, expect, it } from 'vitest';

// ============================================
// Guard: @sialty/domain runs on the phone AND on the server. It must never
// import a UI library or code of an app, or the server would break (or pull
// React Native in). Reads every source file and checks its imports.
// ============================================

// Raw text of every source file (tests included), keyed by path
const sources = import.meta.glob<string>('../**/*.ts', { query: '?raw', import: 'default', eager: true });

// Module names that belong to an app or a UI library
const TARGET = String.raw`['"](react|react-native|expo[^'"]*|@expo\/[^'"]*|@\/[^'"]*|[^'"]*apps\/[^'"]*)['"]`;

// A line (not a comment) that loads one of them: `import ... from`, `export ... from`,
// a bare `import 'x'`, a `require('x')` or a dynamic `import('x')`.
// `m`: ^ matches at the start of every line.
const FORBIDDEN = new RegExp(
    String.raw`^\s*(?:(?:import|export)\b[^\n]*from\s+|import\s+|[^\n/]*\b(?:require|import)\s*\(\s*)` + TARGET,
    'm',
);

describe('domain purity', () => {
    it('catches a forbidden import but not a comment that mentions one', () => {
        expect("import { View } from 'react-native';").toMatch(FORBIDDEN);
        expect("export { Strings } from '@/shared/constants';").toMatch(FORBIDDEN);
        expect("import 'react-native';").toMatch(FORBIDDEN);
        expect("const Constants = require('expo-constants');").toMatch(FORBIDDEN);
        expect("const screen = await import('@/features/home');").toMatch(FORBIDDEN);
        expect("// a require('react') in a comment").not.toMatch(FORBIDDEN);
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
