import path from 'node:path';
import { loadEnv } from '../../src/config/env';
import { createDb } from '../../src/db/client';
import { syncReference } from '../../src/db/syncReference';
import { seedContent } from '../../src/features/seed/seedContent';
import { LocalDiskStorage } from '../../src/media/objectStorage';
import { seedData } from './data';

// ============================================
// DEVELOPMENT SEED — `npm run db:seed -w @sialty/api`
// EMPTIES the content tables of the development database, then fills them with
// the app's sample data. Photos are downloaded from the urls of the mocks.
// Security: refuses to run in production or on any database not named sialty_dev,
// because it deletes every person, professional, annonce, offer and request.
// ============================================

/** Seconds a photo download may take before the seed gives up */
const DOWNLOAD_TIMEOUT_MS = 20_000;

/**
 * Downloads a photo. fetch follows redirects (picsum.photos redirects).
 * @param url Address of the photo
 * @returns The file bytes
 * @throws Error when the answer is not a success or not an image
 */
const fetchImage = async (url: string): Promise<Buffer> => {
    const response = await fetch(url, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
    if (!response.ok) throw new Error(`Photo download failed (${response.status}): ${url}`);
    const type = response.headers.get('content-type') ?? '';
    if (!type.startsWith('image/')) throw new Error(`Not an image (${type || 'no content-type'}): ${url}`);
    return Buffer.from(await response.arrayBuffer());
};

const env = loadEnv(process.env);
if (env.NODE_ENV === 'production') {
    throw new Error('The seed never runs in production');
}
if (!env.DATABASE_URL.endsWith('sialty_dev')) {
    throw new Error('The seed only runs on the sialty_dev database (DATABASE_URL must end with sialty_dev)');
}

const { db, close } = createDb(env.DATABASE_URL);
try {
    // The development database may not hold the trades and categories yet
    await syncReference(db);
    const storage = new LocalDiskStorage(path.resolve(env.STORAGE_DIR));
    const counts = await seedContent(db, storage, seedData, fetchImage);
    console.log(
        `Seed: ${counts.professionals} professionals, ${counts.annonces} annonces, ${counts.offers} offers, ${counts.requests} requests, ${counts.photos} photos`,
    );
} finally {
    await close();
}
