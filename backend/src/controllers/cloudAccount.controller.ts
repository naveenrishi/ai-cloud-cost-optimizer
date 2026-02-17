import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import cloudAccountService from '../services/cloudAccount.service';
import { logger } from '../utils/logger';

class CloudAccountController {
  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { provider, accountName, accountId, isDemo } = req.body;

      if (!provider || !accountName || !accountId) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const validProviders = ['AWS', 'AZURE', 'GCP'];
      if (!validProviders.includes(provider)) {
        return res.status(400).json({ error: 'Invalid provider' });
      }

      const cloudAccount = await cloudAccountService.createCloudAccount(userId, {
        provider,
        accountName,
        accountId,
        isDemo: isDemo ?? true
      });

      res.status(201).json(cloudAccount);
    } catch (error: any) {
      logger.error('Create cloud account error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const accounts = await cloudAccountService.getCloudAccounts(userId);
      res.status(200).json(accounts);
    } catch (error: any) {
      logger.error('Get cloud accounts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await cloudAccountService.deleteCloudAccount(userId, id);
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Delete cloud account error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async sync(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await cloudAccountService.syncCloudAccount(userId, id);
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Sync cloud account error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

export default new CloudAccountController();