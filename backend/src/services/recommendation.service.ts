import prisma from '../config/database';
import { logger } from '../utils/logger';
import { MockDataGenerator } from '../utils/mockData';
import { RecommendationType, Priority } from '@prisma/client';

class RecommendationService {
  async generateRecommendations(userId: string, cloudAccountId: string) {
    // Verify ownership
    const account = await prisma.cloudAccount.findFirst({
      where: { id: cloudAccountId, userId }
    });

    if (!account) throw new Error('Cloud account not found');

    // Delete existing recommendations
    await prisma.recommendation.deleteMany({
      where: { cloudAccountId }
    });

    // Generate mock resources
    const resources = MockDataGenerator.generateMockResources(
      account.provider as 'AWS' | 'AZURE' | 'GCP'
    );

    // Generate recommendations based on resources
    const recommendations = [];

    for (const resource of resources) {
      // Idle resource detection (CPU < 5%)
      if (resource.cpuUtilization < 5 && resource.status === 'idle') {
        recommendations.push({
          cloudAccountId,
          resourceId: resource.resourceId,
          type: 'DELETE_IDLE',
          title: `Idle ${resource.resourceType} detected: ${resource.resourceName}`,
          description: `This ${resource.resourceType} has been running with ${resource.cpuUtilization}% CPU utilization for the past 30 days. Consider terminating it to save costs.`,
          estimatedSavings: resource.monthlyCost,
          priority: resource.monthlyCost > 200 ? 'HIGH' : 'MEDIUM',
          status: 'PENDING',
          implementationSteps: {
            steps: [
              `Log into your ${account.provider} console`,
              `Navigate to ${resource.resourceType} section`,
              `Find resource: ${resource.resourceName} (${resource.resourceId})`,
              `Verify no critical workloads are running`,
              `Terminate/delete the resource`,
              `Monitor for 24 hours to confirm no impact`
            ]
          }
        });
      }

      // Oversized instance detection (CPU < 20%)
      if (resource.cpuUtilization > 5 && resource.cpuUtilization < 20) {
        recommendations.push({
          cloudAccountId,
          resourceId: resource.resourceId,
          type: 'RIGHT_SIZE',
          title: `Right-size ${resource.resourceType}: ${resource.resourceName}`,
          description: `This ${resource.resourceType} is running at only ${resource.cpuUtilization}% CPU. Downsizing to a smaller instance type could save up to 40% on costs.`,
          estimatedSavings: resource.monthlyCost * 0.4,
          priority: resource.monthlyCost > 300 ? 'HIGH' : 'MEDIUM',
          status: 'PENDING',
          implementationSteps: {
            steps: [
              `Review current instance type and usage metrics`,
              `Identify the next smaller instance type`,
              `Schedule a maintenance window`,
              `Stop the instance`,
              `Change instance type to smaller size`,
              `Start the instance and monitor performance`
            ]
          }
        });
      }

      // Reserved instance recommendation (high usage)
      if (resource.cpuUtilization > 70 && resource.monthlyCost > 200) {
        recommendations.push({
          cloudAccountId,
          resourceId: resource.resourceId,
          type: 'RESERVED_INSTANCE',
          title: `Use Reserved Instance for: ${resource.resourceName}`,
          description: `This ${resource.resourceType} has consistent high usage (${resource.cpuUtilization}% CPU). Switching to a reserved instance could save up to 60% compared to on-demand pricing.`,
          estimatedSavings: resource.monthlyCost * 0.6,
          priority: 'HIGH',
          status: 'PENDING',
          implementationSteps: {
            steps: [
              `Review usage patterns over the last 3 months`,
              `Choose between 1-year or 3-year reservation`,
              `Purchase reserved instance in the console`,
              `Apply reservation to existing instance`,
              `Track savings in billing dashboard`
            ]
          }
        });
      }
    }

    // Add storage optimization recommendations
    recommendations.push({
      cloudAccountId,
      resourceId: `storage-opt-${cloudAccountId}`,
      type: 'STORAGE_OPTIMIZATION',
      title: 'Old snapshots detected - Clean up storage',
      description: 'Found 12 EBS snapshots older than 90 days totaling 2.4TB. Deleting unused snapshots can significantly reduce storage costs.',
      estimatedSavings: 85.50,
      priority: 'LOW',
      status: 'PENDING',
      implementationSteps: {
        steps: [
          'Navigate to EC2 > Snapshots in AWS Console',
          'Filter snapshots older than 90 days',
          'Verify snapshots are not needed for compliance',
          'Select and delete old snapshots',
          'Set up automated snapshot lifecycle policies'
        ]
      }
    });

    // Save recommendations to database
if (recommendations.length > 0) {
    await prisma.recommendation.createMany({
      data: recommendations.map(rec => ({
        cloudAccountId: rec.cloudAccountId,
        resourceId: rec.resourceId,
        type: rec.type as RecommendationType,
        title: rec.title,
        description: rec.description,
        estimatedSavings: parseFloat(rec.estimatedSavings.toFixed(2)),
        priority: rec.priority as Priority,
        status: 'PENDING',
        implementationSteps: rec.implementationSteps
      }))
    });
  }

    logger.info(`Generated ${recommendations.length} recommendations for account ${cloudAccountId}`);
    return recommendations.length;
  }

  async getRecommendations(userId: string, cloudAccountId?: string) {
    const accounts = cloudAccountId
      ? [{ id: cloudAccountId }]
      : await prisma.cloudAccount.findMany({
          where: { userId },
          select: { id: true }
        });

    const accountIds = accounts.map(a => a.id);

    return prisma.recommendation.findMany({
      where: {
        cloudAccountId: { in: accountIds },
        status: 'PENDING'
      },
      orderBy: [
        { priority: 'asc' },
        { estimatedSavings: 'desc' }
      ]
    });
  }

  async getSavingsSummary(userId: string) {
    const accounts = await prisma.cloudAccount.findMany({
      where: { userId },
      select: { id: true }
    });

    const accountIds = accounts.map(a => a.id);

    const [pending, implemented] = await Promise.all([
      prisma.recommendation.aggregate({
        where: {
          cloudAccountId: { in: accountIds },
          status: 'PENDING'
        },
        _sum: { estimatedSavings: true },
        _count: true
      }),
      prisma.recommendation.aggregate({
        where: {
          cloudAccountId: { in: accountIds },
          status: 'IMPLEMENTED'
        },
        _sum: { estimatedSavings: true },
        _count: true
      })
    ]);

    return {
      potentialSavings: parseFloat(
        Number(pending._sum.estimatedSavings || 0).toFixed(2)
      ),
      actualSavings: parseFloat(
        Number(implemented._sum.estimatedSavings || 0).toFixed(2)
      ),
      pendingCount: pending._count,
      implementedCount: implemented._count
    };
  }

  async updateStatus(
    userId: string,
    recommendationId: string,
    status: 'IMPLEMENTED' | 'DISMISSED'
  ) {
    const rec = await prisma.recommendation.findFirst({
      where: { id: recommendationId },
      include: { cloudAccount: true }
    });

    if (!rec || rec.cloudAccount.userId !== userId) {
      throw new Error('Recommendation not found');
    }

    return prisma.recommendation.update({
      where: { id: recommendationId },
      data: { status }
    });
  }
}

export default new RecommendationService();