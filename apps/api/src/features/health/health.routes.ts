import { Router } from 'express';

// ============================================
// HEALTH — tells whether the server answers. Used to check the tunnel from
// the iPhone, and later by the host to restart a stuck server.
// ============================================

export const healthRoutes = (): Router => {
    const router = Router();

    router.get('/v1/health', (_req, res) => {
        res.json({ status: 'ok' });
    });

    return router;
};
