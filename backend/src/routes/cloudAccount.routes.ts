import { Router } from 'express';
import cloudAccountController from '../controllers/cloudAccount.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', cloudAccountController.create);
router.get('/', cloudAccountController.getAll);
router.delete('/:id', cloudAccountController.delete);
router.post('/:id/sync', cloudAccountController.sync);

export default router;