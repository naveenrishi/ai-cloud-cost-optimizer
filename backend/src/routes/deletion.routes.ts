import { Router } from 'express';
import deletionController from '../controllers/deletion.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', deletionController.getAll);
router.post('/', deletionController.record);
router.get('/analytics', deletionController.getAnalytics);

export default router;