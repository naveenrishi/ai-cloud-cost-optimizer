import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import costService from '../services/cost.service';
import { logger } from '../utils/logger';

class CostController {
  async getSummary(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { cloudAccountId } = req.query as any;
      const summary = await costService.getSummary(userId, cloudAccountId);
      res.status(200).json(summary);
    } catch (error: any) {
      logger.error('Get cost summary error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTrends(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { days, cloudAccountId } = req.query as any;
      const trends = await costService.getTrends(
        userId,
        days ? parseInt(days) : 30,
        cloudAccountId
      );
      res.status(200).json(trends);
    } catch (error: any) {
      logger.error('Get cost trends error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getServiceBreakdown(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { cloudAccountId } = req.query as any;
      const breakdown = await costService.getServiceBreakdown(userId, cloudAccountId);
      res.status(200).json(breakdown);
    } catch (error: any) {
      logger.error('Get service breakdown error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getProviderBreakdown(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const breakdown = await costService.getProviderBreakdown(userId);
      res.status(200).json(breakdown);
    } catch (error: any) {
      logger.error('Get provider breakdown error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new CostController();