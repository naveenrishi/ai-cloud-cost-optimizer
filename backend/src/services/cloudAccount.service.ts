import prisma from '../config/database';
import { MockDataGenerator } from '../utils/mockData';
import { logger } from '../utils/logger';

interface CreateCloudAccountDto {
  provider: 'AWS' | 'AZURE' | 'GCP';
  accountName: string;
  accountId: string;
  isDemo?: boolean;
}

class CloudAccountService {
  async createCloudAccount(userId: string, data: CreateCloudAccountDto) {
    // Create cloud account
    const cloudAccount = await prisma.cloudAccount.create({
      data: {
        userId,
        provider: data.provider,
        accountName: data.accountName,
        accountId: data.accountId,
        credentialsEncrypted: 'demo-credentials', // For demo mode
        isDemo: data.isDemo ?? true,
        status: 'ACTIVE',
        lastSyncedAt: new Date()
      }
    });

    // Generate and store mock cost data if demo mode
    if (cloudAccount.isDemo) {
      await this.generateDemoData(cloudAccount.id, data.provider);
    }

    logger.info(`Cloud account created: ${cloudAccount.id}`);
    return cloudAccount;
  }

  async getCloudAccounts(userId: string) {
    return prisma.cloudAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteCloudAccount(userId: string, accountId: string) {
    // Verify ownership
    const account = await prisma.cloudAccount.findFirst({
      where: { id: accountId, userId }
    });

    if (!account) {
      throw new Error('Cloud account not found');
    }

    // Delete account and all related data (cascade)
    await prisma.cloudAccount.delete({
      where: { id: accountId }
    });

    logger.info(`Cloud account deleted: ${accountId}`);
    return { message: 'Cloud account deleted successfully' };
  }

  async syncCloudAccount(userId: string, accountId: string) {
    const account = await prisma.cloudAccount.findFirst({
      where: { id: accountId, userId }
    });

    if (!account) {
      throw new Error('Cloud account not found');
    }

    if (account.isDemo) {
      // Re-generate demo data
      await this.generateDemoData(accountId, account.provider as any);
    }

    // Update last synced time
    await prisma.cloudAccount.update({
      where: { id: accountId },
      data: { lastSyncedAt: new Date() }
    });

    return { message: 'Sync completed successfully' };
  }

  private async generateDemoData(cloudAccountId: string, provider: 'AWS' | 'AZURE' | 'GCP') {
    // Delete existing cost data
    await prisma.costData.deleteMany({
      where: { cloudAccountId }
    });

    // Generate new mock data
    const mockData = MockDataGenerator.generateCostData(provider);

    // Insert in batches
    const batchSize = 50;
    for (let i = 0; i < mockData.length; i += batchSize) {
      const batch = mockData.slice(i, i + batchSize);
      await prisma.costData.createMany({
        data: batch.map(item => ({
          cloudAccountId,
          date: item.date,
          service: item.service,
          region: item.region,
          costAmount: item.costAmount,
          currency: item.currency,
          tags: item.tags
        }))
      });
    }

    logger.info(`Generated ${mockData.length} mock cost records for account ${cloudAccountId}`);
  }
}

export default new CloudAccountService();