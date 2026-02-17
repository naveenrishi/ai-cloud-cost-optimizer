import prisma from '../config/database';

class CostService {
  async getSummary(userId: string, cloudAccountId?: string) {
    const accountFilter = await this.getAccountFilter(userId, cloudAccountId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total cost (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [mtdData, lastMonthData, totalData] = await Promise.all([
      // Month to date
      prisma.costData.aggregate({
        where: { cloudAccountId: accountFilter, date: { gte: startOfMonth } },
        _sum: { costAmount: true }
      }),
      // Last month
      prisma.costData.aggregate({
        where: {
          cloudAccountId: accountFilter,
          date: { gte: startOfLastMonth, lte: endOfLastMonth }
        },
        _sum: { costAmount: true }
      }),
      // Last 30 days total
      prisma.costData.aggregate({
        where: { cloudAccountId: accountFilter, date: { gte: thirtyDaysAgo } },
        _sum: { costAmount: true }
      })
    ]);

    const mtdCost = Number(mtdData._sum.costAmount || 0);
    const lastMonthCost = Number(lastMonthData._sum.costAmount || 0);
    const totalCost = Number(totalData._sum.costAmount || 0);

    // Calculate percentage change
    const percentageChange = lastMonthCost > 0
      ? ((mtdCost - lastMonthCost) / lastMonthCost) * 100
      : 0;

    // Simple forecast (MTD * days in month / current day)
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const forecastedCost = (mtdCost / dayOfMonth) * daysInMonth;

    return {
      totalCost: parseFloat(totalCost.toFixed(2)),
      mtdCost: parseFloat(mtdCost.toFixed(2)),
      previousMonthCost: parseFloat(lastMonthCost.toFixed(2)),
      forecastedCost: parseFloat(forecastedCost.toFixed(2)),
      currency: 'USD',
      percentageChange: parseFloat(percentageChange.toFixed(1))
    };
  }

  async getTrends(userId: string, days: number = 30, cloudAccountId?: string) {
    const accountFilter = await this.getAccountFilter(userId, cloudAccountId);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const costs = await prisma.costData.groupBy({
      by: ['date'],
      where: { cloudAccountId: accountFilter, date: { gte: startDate } },
      _sum: { costAmount: true },
      orderBy: { date: 'asc' }
    });

    return costs.map(item => ({
      date: item.date.toISOString().split('T')[0],
      cost: parseFloat(Number(item._sum.costAmount || 0).toFixed(2))
    }));
  }

  async getServiceBreakdown(userId: string, cloudAccountId?: string) {
    const accountFilter = await this.getAccountFilter(userId, cloudAccountId);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const services = await prisma.costData.groupBy({
      by: ['service'],
      where: { cloudAccountId: accountFilter, date: { gte: thirtyDaysAgo } },
      _sum: { costAmount: true },
      orderBy: { _sum: { costAmount: 'desc' } }
    });

    const total = services.reduce(
      (sum, s) => sum + Number(s._sum.costAmount || 0), 0
    );

    return services.map(item => ({
      service: item.service,
      cost: parseFloat(Number(item._sum.costAmount || 0).toFixed(2)),
      percentage: parseFloat(((Number(item._sum.costAmount || 0) / total) * 100).toFixed(1))
    }));
  }

  async getProviderBreakdown(userId: string) {
    const accounts = await prisma.cloudAccount.findMany({
      where: { userId },
      select: { id: true, provider: true }
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const providerCosts = await Promise.all(
      accounts.map(async account => {
        const result = await prisma.costData.aggregate({
          where: {
            cloudAccountId: account.id,
            date: { gte: thirtyDaysAgo }
          },
          _sum: { costAmount: true }
        });
        return {
          provider: account.provider,
          cost: Number(result._sum.costAmount || 0)
        };
      })
    );

    // Group by provider
    const grouped = providerCosts.reduce((acc: any, item) => {
      if (!acc[item.provider]) acc[item.provider] = 0;
      acc[item.provider] += item.cost;
      return acc;
    }, {});

    const total = Object.values(grouped).reduce(
      (sum: any, cost: any) => sum + cost, 0
    ) as number;

    return Object.entries(grouped).map(([provider, cost]: any) => ({
      provider,
      cost: parseFloat(cost.toFixed(2)),
      percentage: parseFloat(((cost / total) * 100).toFixed(1))
    }));
  }

  private async getAccountFilter(userId: string, cloudAccountId?: string) {
    if (cloudAccountId) return cloudAccountId;

    const accounts = await prisma.cloudAccount.findMany({
      where: { userId },
      select: { id: true }
    });

    return { in: accounts.map(a => a.id) };
  }
}

export default new CostService();