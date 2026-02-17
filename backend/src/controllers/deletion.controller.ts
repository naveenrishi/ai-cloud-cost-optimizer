import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import deletionService from '../services/deletion.service';
import { logger } from '../utils/logger';

class DeletionController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { resourceType, startDate, endDate, cloudAccountId } = req.query as any;

      const deletions = await deletionService.getDeletions(userId, {
        resourceType,
        startDate,
        endDate,
        cloudAccountId
      });

      res.status(200).json(deletions);
    } catch (error: any) {
      logger.error('Get deletions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async record(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const {
        cloudAccountId,
        resourceId,
        resourceType,
        resourceName,
        deletedBy,
        deletionMethod,
        monthlyCostBefore,
        deletionReason,
        recommendationId
      } = req.body;

      if (!cloudAccountId || !resourceId || !resourceType || !deletionMethod) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const deletion = await deletionService.recordDeletion(userId, {
        cloudAccountId,
        resourceId,
        resourceType,
        resourceName,
        deletedBy,
        deletionMethod,
        monthlyCostBefore,
        deletionReason,
        recommendationId
      });

      res.status(201).json(deletion);
    } catch (error: any) {
      logger.error('Record deletion error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getAnalytics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const analytics = await deletionService.getDeletionAnalytics(userId);
      res.status(200).json(analytics);
    } catch (error: any) {
      logger.error('Get deletion analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new DeletionController();