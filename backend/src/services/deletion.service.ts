import prisma from '../config/database';
import { logger } from '../utils/logger';

class DeletionService {
  async getDeletions(userId: string, filters?: {
    resourceType?: string;
    startDate?: string;
    endDate?: string;
    cloudAccountId?: string;
  }) {
    const accounts = filters?.cloudAccountId
      ? [{ id: filters.cloudAccountId }]
      : await prisma.cloudAccount.findMany({
          where: { userId },
          select: { id: true }
        });

    const accountIds = accounts.map((a: any) => a.id);

    const where: any = {
      cloudAccountId: { in: accountIds }
    };

    if (filters?.resourceType) {
      where.resourceType = filters.resourceType;
    }

    if (filters?.startDate || filters?.endDate) {
      where.deletedAt = {};
      if (filters.startDate) where.deletedAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.deletedAt.lte = new Date(filters.endDate);
    }

    return prisma.resourceDeletion.findMany({
      where,
      orderBy: { deletedAt: 'desc' },
      include: {
        cloudAccount: {
          select: { provider: true, accountName: true }
        }
      }
    });
  }

  async recordDeletion(userId: string, data: {
    cloudAccountId: string;
    resourceId: string;
    resourceType: string;
    resourceName?: string;
    deletedBy?: string;
    deletionMethod: 'MANUAL' | 'AUTOMATED' | 'RECOMMENDATION';
    monthlyCostBefore?: number;
    deletionReason?: string;
    recommendationId?: string;
  }) {
    // Verify account ownership
    const account = await prisma.cloudAccount.findFirst({
      where: { id: data.cloudAccountId, userId }
    });

    if (!account) throw new Error('Cloud account not found');

    const deletion = await prisma.resourceDeletion.create({
      data: {
        cloudAccountId: data.cloudAccountId,
        resourceId: data.resourceId,
        resourceType: data.resourceType,
        resourceName: data.resourceName,
        deletedAt: new Date(),
        deletedBy: data.deletedBy || 'user',
        deletionMethod: data.deletionMethod,
        monthlyCostBefore: data.monthlyCostBefore,
        estimatedSavings: data.monthlyCostBefore,
        deletionReason: data.deletionReason,
        recommendationId: data.recommendationId,
        protectionStatus: 'NONE'
      }
    });

    logger.info(`Recorded deletion: ${deletion.id}`);
    return deletion;
  }

  async getDeletionAnalytics(userId: string) {
    const accounts = await prisma.cloudAccount.findMany({
      where: { userId },
      select: { id: true }
    });

    const accountIds = accounts.map(a => a.id);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalDeletions,
      totalSavings,
      recentDeletions,
      byResourceType
    ] = await Promise.all([
      // Total deletions
      prisma.resourceDeletion.count({
        where: { cloudAccountId: { in: accountIds } }
      }),
      // Total savings
      prisma.resourceDeletion.aggregate({
        where: { cloudAccountId: { in: accountIds } },
        _sum: { estimatedSavings: true }
      }),
      // Recent 30 days
      prisma.resourceDeletion.count({
        where: {
          cloudAccountId: { in: accountIds },
          deletedAt: { gte: thirtyDaysAgo }
        }
      }),
      // By resource type
      prisma.resourceDeletion.groupBy({
        by: ['resourceType'],
        where: { cloudAccountId: { in: accountIds } },
        _count: true,
        _sum: { estimatedSavings: true }
      })
    ]);

    return {
      totalDeletions,
      totalSavings: parseFloat(
        Number(totalSavings._sum.estimatedSavings || 0).toFixed(2)
      ),
      recentDeletions,
      byResourceType: byResourceType.map(item => ({
        resourceType: item.resourceType,
        count: item._count,
        savings: parseFloat(
          Number(item._sum.estimatedSavings || 0).toFixed(2)
        )
      }))
    };
  }
}

export default new DeletionService();