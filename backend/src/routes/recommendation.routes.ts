import { Router } from 'express';
import recommendationController from '../controllers/recommendation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/generate', recommendationController.generate);
router.get('/', recommendationController.getAll);
router.get('/savings', recommendationController.getSavingsSummary);
router.post('/:id/implement', recommendationController.implement);
router.post('/:id/dismiss', recommendationController.dismiss);

export default router;