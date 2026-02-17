import { Router } from 'express';
import exportController from '../controllers/export.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/costs', exportController.exportCosts);
router.get('/recommendations', exportController.exportRecommendations);
router.get('/deletions', exportController.exportDeletions);

export default router;