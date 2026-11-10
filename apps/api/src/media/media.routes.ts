import { Router } from 'express';
import { HttpProblem } from '../shared/http/problem';
import { MEDIA_KEY, type ObjectStorage } from './objectStorage';

// ============================================
// MEDIA ROUTE — serves the blurred photos, the only ones visitors may see.
// ============================================

/**
 * @param storage Where the files are read from
 * @returns GET /v1/media/*key, which only answers keys ending in /blur.webp
 */
export const mediaRoutes = (storage: ObjectStorage): Router => {
    const router = Router();

    router.get('/v1/media/*key', async (req, res) => {
        // Express 5: a wildcard gives the segments as an array
        const parts = req.params.key as unknown;
        const key = Array.isArray(parts) ? parts.join('/') : String(parts);

        // Security: validate the shape before touching the disk, and serve blur only
        // (sharp versions are for members; the original does not exist)
        if (!MEDIA_KEY.test(key) || !key.endsWith('/blur.webp')) throw new HttpProblem(404, 'Not found');

        const file = await storage.get(key);
        if (!file) throw new HttpProblem(404, 'Not found');

        // The key holds a random id and never changes content: cache for a year
        res.set('Cache-Control', 'public, max-age=31536000, immutable').type('image/webp').send(file);
    });

    return router;
};
