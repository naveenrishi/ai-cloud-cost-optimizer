import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import recommendationService from '../services/recommendation.service';
import { logger } from '../utils/logger';

class RecommendationController {
  async generate(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { cloudAccountId } = req.body;

      if (!cloudAccountId) {
        return res.status(400).json({ error: 'cloudAccountId is required' });
      }

      const count = await recommendationService.generateRecommendations(
        userId,
        cloudAccountId
      );

      res.status(200).json({
        message: `Generated ${count} recommendations`,
        count
      });
    } catch (error: any) {
      logger.error('Generate recommendations error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { cloudAccountId } = req.query as any;

      const recommendations = await recommendationService.getRecommendations(
        userId,
        cloudAccountId
      );

      res.status(200).json(recommendations);
    } catch (error: any) {
      logger.error('Get recommendations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSavingsSummary(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const summary = await recommendationService.getSavingsSummary(userId);
      res.status(200).json(summary);
    } catch (error: any) {
      logger.error('Get savings summary error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async implement(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const rec = await recommendationService.updateStatus(
        userId, id, 'IMPLEMENTED'
      );

      res.status(200).json(rec);
    } catch (error: any) {
      logger.error('Implement recommendation error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async dismiss(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const rec = await recommendationService.updateStatus(
        userId, id, 'DISMISSED'
      );

      res.status(200).json(rec);
    } catch (error: any) {
      logger.error('Dismiss recommendation error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

export default new RecommendationController();