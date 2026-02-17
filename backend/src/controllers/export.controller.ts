import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import exportService from '../services/export.service';
import { logger } from '../utils/logger';

class ExportController {
  async exportCosts(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { days } = req.query as any;
      const csv = await exportService.exportCostsToCsv(userId, days ? parseInt(days) : 30);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=cloud-costs.csv');
      res.status(200).send(csv);
    } catch (error: any) {
      logger.error('Export costs error:', error);
      res.status(500).json({ error: 'Export failed' });
    }
  }

  async exportRecommendations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const csv = await exportService.exportRecommendationsToCsv(userId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=recommendations.csv');
      res.status(200).send(csv);
    } catch (error: any) {
      logger.error('Export recommendations error:', error);
      res.status(500).json({ error: 'Export failed' });
    }
  }

  async exportDeletions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const csv = await exportService.exportDeletionsToCsv(userId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=deletions.csv');
      res.status(200).send(csv);
    } catch (error: any) {
      logger.error('Export deletions error:', error);
      res.status(500).json({ error: 'Export failed' });
    }
  }
}

export default new ExportController();