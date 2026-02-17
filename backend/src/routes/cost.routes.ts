import { Router } from 'express';
import costController from '../controllers/cost.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/summary', costController.getSummary);
router.get('/trends', costController.getTrends);
router.get('/breakdown', costController.getServiceBreakdown);
router.get('/providers', costController.getProviderBreakdown);

export default router;