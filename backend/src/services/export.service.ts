import prisma from '../config/database';

class ExportService {
  async exportCostsToCsv(userId: string, days: number = 30): Promise<string> {
    const accounts = await prisma.cloudAccount.findMany({
      where: { userId },
      select: { id: true, provider: true, accountName: true }
    });

    const accountMap = new Map(accounts.map(a => [a.id, a]));
    const accountIds = accounts.map(a => a.id);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const costs = await prisma.costData.findMany({
      where: {
        cloudAccountId: { in: accountIds },
        date: { gte: startDate }
      },
      orderBy: { date: 'desc' }
    });

    // Build CSV
    const headers = [
      'Date',
      'Provider',
      'Account Name',
      'Service',
      'Region',
      'Cost (USD)'
    ].join(',');

    const rows = costs.map(cost => {
      const account = accountMap.get(cost.cloudAccountId);
      return [
        new Date(cost.date).toISOString().split('T')[0],
        account?.provider || '',
        account?.accountName || '',
        cost.service,
        cost.region || '',
        cost.costAmount.toFixed(2)
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  }

  async exportRecommendationsToCsv(userId: string): Promise<string> {
    const accounts = await prisma.cloudAccount.findMany({
      where: { userId },
      select: { id: true, provider: true, accountName: true }
    });

    const accountMap = new Map(accounts.map(a => [a.id, a]));
    const accountIds = accounts.map(a => a.id);

    const recommendations = await prisma.recommendation.findMany({
      where: { cloudAccountId: { in: accountIds } },
      orderBy: { estimatedSavings: 'desc' }
    });

    const headers = [
      'Title',
      'Type',
      'Priority',
      'Status',
      'Estimated Savings (USD/mo)',
      'Provider',
      'Account',
      'Resource ID'
    ].join(',');

    const rows = recommendations.map(rec => {
      const account = accountMap.get(rec.cloudAccountId);
      return [
        `"${rec.title}"`,
        rec.type,
        rec.priority,
        rec.status,
        Number(rec.estimatedSavings).toFixed(2),
        account?.provider || '',
        account?.accountName || '',
        rec.resourceId
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  }

  async exportDeletionsToCsv(userId: string): Promise<string> {
    const accounts = await prisma.cloudAccount.findMany({
      where: { userId },
      select: { id: true, provider: true, accountName: true }
    });

    const accountMap = new Map(accounts.map(a => [a.id, a]));
    const accountIds = accounts.map(a => a.id);

    const deletions = await prisma.resourceDeletion.findMany({
      where: { cloudAccountId: { in: accountIds } },
      orderBy: { deletedAt: 'desc' }
    });

    const headers = [
      'Date',
      'Resource Name',
      'Resource ID',
      'Resource Type',
      'Provider',
      'Account',
      'Method',
      'Monthly Savings (USD)',
      'Reason'
    ].join(',');

    const rows = deletions.map(del => {
      const account = accountMap.get(del.cloudAccountId);
      return [
        new Date(del.deletedAt).toISOString().split('T')[0],
        `"${del.resourceName || ''}"`,
        del.resourceId,
        del.resourceType,
        account?.provider || '',
        account?.accountName || '',
        del.deletionMethod,
        Number(del.estimatedSavings || 0).toFixed(2),
        `"${del.deletionReason || ''}"`
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  }
}

export default new ExportService();