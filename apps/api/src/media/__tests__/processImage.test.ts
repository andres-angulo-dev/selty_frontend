import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { processImage } from '../processImage';

// ============================================
// processImage: the server makes every file a visitor or member will see.
// Inputs are generated here, no fixture file.
// ============================================

/** @returns A plain JPEG of the given size */
const makeJpeg = (width: number, height: number): Promise<Buffer> =>
    sharp({ create: { width, height, channels: 3, background: '#c33' } })
        .jpeg()
        .toBuffer();

describe('processImage', () => {
    it('makes a 32 px blur and 400 / 1080 px versions', async () => {
        const out = await processImage(await makeJpeg(1200, 800));
        expect((await sharp(out.blur).metadata()).width).toBe(32);
        expect((await sharp(out.w400).metadata()).width).toBe(400);
        expect((await sharp(out.w1080).metadata()).width).toBe(1080);
        expect(out).toMatchObject({ width: 1200, height: 800 });
    });

    it('outputs WebP', async () => {
        const out = await processImage(await makeJpeg(1200, 800));
        expect((await sharp(out.w1080).metadata()).format).toBe('webp');
        expect((await sharp(out.blur).metadata()).format).toBe('webp');
    });

    it('never enlarges a small image', async () => {
        const out = await processImage(await makeJpeg(300, 200));
        expect((await sharp(out.w1080).metadata()).width).toBe(300);
        expect((await sharp(out.w400).metadata()).width).toBe(300);
    });

    it('applies the EXIF orientation to the reported size', async () => {
        // Orientation 6 = rotated a quarter turn: a 1200x800 file shows as 800x1200
        const input = await sharp({
            create: { width: 1200, height: 800, channels: 3, background: '#c33' },
        })
            .jpeg()
            .withMetadata({ orientation: 6 })
            .toBuffer();
        const out = await processImage(input);
        expect(out.width).toBeLessThan(out.height);
        expect(out).toMatchObject({ width: 800, height: 1200 });
    });

    it('strips metadata from every output', async () => {
        const input = await sharp({
            create: { width: 1200, height: 800, channels: 3, background: '#c33' },
        })
            .jpeg()
            .withMetadata({
                orientation: 6,
                exif: { IFD0: { Copyright: 'secret-gps' } },
            })
            .toBuffer();
        // The marker really is in the input, so the assertions below prove something
        expect(input.includes('secret-gps')).toBe(true);

        const out = await processImage(input);
        for (const file of [out.blur, out.w400, out.w1080]) {
            expect((await sharp(file).metadata()).exif).toBeUndefined();
            expect(file.includes('secret-gps')).toBe(false);
        }
    });

    it('refuses a file that is not an image', async () => {
        await expect(processImage(Buffer.from('not an image'))).rejects.toThrow();
    });
});
