import sharp from 'sharp';
import type { Database } from '../db/client';
import { media } from '../db/schema';
import type { ObjectStorage } from './objectStorage';

// ============================================
// IMAGE PROCESSING — the original upload is never kept or sent. The server
// makes a blurred version (visitors) and two sizes (members).
// ============================================

/** Width of the blurred version: so small that the picture cannot be recognised once enlarged */
const BLUR_WIDTH = 32;
const SIZE_SMALL = 400;
const SIZE_LARGE = 1080;

export interface ProcessedImage {
    blur: Buffer;
    w400: Buffer;
    w1080: Buffer;
    /** Size of the original once its EXIF orientation is applied */
    width: number;
    height: number;
}

/**
 * Turns an upload into the three files we keep.
 * Security: `rotate()` applies the EXIF orientation, and since `withMetadata`
 * is never called, sharp drops all metadata (GPS position, camera, dates).
 * @param input Image file bytes (any format sharp reads)
 * @returns The three WebP files and the oriented size
 * @throws Error when the input is not an image
 */
export const processImage = async (input: Buffer): Promise<ProcessedImage> => {
    // Reads the oriented original once, then every output starts from it
    const oriented = await sharp(input).rotate().toBuffer({ resolveWithObject: true });
    const { width, height } = oriented.info;

    const resize = (target: number): Promise<Buffer> =>
        sharp(oriented.data).resize({ width: target, withoutEnlargement: true }).webp().toBuffer();

    return {
        blur: await sharp(oriented.data).resize({ width: BLUR_WIDTH }).webp().toBuffer(),
        w400: await resize(SIZE_SMALL),
        w1080: await resize(SIZE_LARGE),
        width,
        height,
    };
};

/**
 * Processes and stores a photo, then records it.
 * @param storage Where the files go
 * @param db Database
 * @param input Upload bytes
 * @param prefix Folder name in the keys (e.g. "annonce")
 * @param ownerProfileId The person who uploaded it
 * @returns The media id
 */
export const storeImage = async (
    storage: ObjectStorage,
    db: Database,
    input: Buffer,
    prefix: string,
    ownerProfileId: string,
): Promise<string> => {
    const processed = await processImage(input);
    const base = `${prefix}/${crypto.randomUUID()}`;
    const keys = {
        blurKey: `${base}/blur.webp`,
        key400: `${base}/400.webp`,
        key1080: `${base}/1080.webp`,
    };

    await storage.put(keys.blurKey, processed.blur, 'image/webp');
    await storage.put(keys.key400, processed.w400, 'image/webp');
    await storage.put(keys.key1080, processed.w1080, 'image/webp');

    const [row] = await db
        .insert(media)
        .values({
            ownerProfileId,
            ...keys,
            width: processed.width,
            height: processed.height,
        })
        .returning({ id: media.id });
    return row.id;
};
