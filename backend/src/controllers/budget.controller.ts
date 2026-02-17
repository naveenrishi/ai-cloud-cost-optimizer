import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import budgetService from '../services/budget.service';
import { logger } from '../utils/logger';

class BudgetController {
  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { name, amount, period, cloudAccountId, alertThreshold } = req.body;

      if (!name || !amount || !period) {
        return res.status(400).json({ error: 'Name, amount and period are required' });
      }

      const budget = await budgetService.createBudget(userId, {
        name,
        amount: parseFloat(amount),
        period,
        cloudAccountId,
        alertThreshold: alertThreshold || 80
      });

      res.status(201).json(budget);
    } catch (error: any) {
      logger.error('Create budget error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const budgets = await budgetService.getBudgets(userId);
      res.status(200).json(budgets);
    } catch (error: any) {
      logger.error('Get budgets error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await budgetService.deleteBudget(userId, id);
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Delete budget error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await budgetService.updateBudget(userId, id, req.body);
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Update budget error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

export default new BudgetController();