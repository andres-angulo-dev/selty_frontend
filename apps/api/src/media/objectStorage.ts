import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { HttpProblem } from '../shared/http/problem';

// ============================================
// OBJECT STORAGE — where photo files live. An interface so the local disk
// (development) can be replaced by a bucket (production) without touching
// the callers.
// ============================================

/** Where files are kept: put and get by key */
export interface ObjectStorage {
    /** Stores a file under a key (overwrites) */
    put(key: string, body: Buffer, contentType: string): Promise<void>;
    /** @returns The file, or null when the key holds nothing */
    get(key: string): Promise<Buffer | null>;
}

/**
 * The only shape of key accepted: lowercase segments joined by "/", ending in
 * ".webp". Security: no ".", no "..", no backslash, no encoded character, so
 * a key can never walk out of the storage folder.
 */
export const MEDIA_KEY = /^[a-z0-9-]+(\/[a-z0-9-]+)*\.webp$/;

/** Files in a folder of the local disk (development and tests) */
export class LocalDiskStorage implements ObjectStorage {
    private readonly root: string;

    /** @param root Folder holding every file (made when the first file is put) */
    constructor(root: string) {
        this.root = path.resolve(root);
    }

    /**
     * Security: two checks, the key shape first, then the resolved path (defence in depth).
     * @returns The absolute path of the key
     * @throws Error when the key is refused
     */
    private resolveKey(key: string): string {
        if (!MEDIA_KEY.test(key)) throw new Error('Invalid storage key');
        const full = path.resolve(this.root, key);
        if (!full.startsWith(this.root + path.sep)) throw new Error('Invalid storage key');
        return full;
    }

    async put(key: string, body: Buffer, _contentType: string): Promise<void> {
        const full = this.resolveKey(key);
        await mkdir(path.dirname(full), { recursive: true });
        await writeFile(full, body);
    }

    /** @throws HttpProblem 404 for a refused key; null for a missing file */
    async get(key: string): Promise<Buffer | null> {
        let full: string;
        try {
            full = this.resolveKey(key);
        } catch {
            throw new HttpProblem(404, 'Not found');
        }
        try {
            return await readFile(full);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
            throw error;
        }
    }
}
