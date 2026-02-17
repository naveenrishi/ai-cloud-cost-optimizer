import { Router } from 'express';
import budgetController from '../controllers/budget.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', budgetController.create);
router.get('/', budgetController.getAll);
router.put('/:id', budgetController.update);
router.delete('/:id', budgetController.delete);

export default router;