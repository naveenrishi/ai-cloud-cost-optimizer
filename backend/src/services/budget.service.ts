import prisma from '../config/database';
import { logger } from '../utils/logger';

class BudgetService {
  async createBudget(userId: string, data: {
    name: string;
    amount: number;
    period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    cloudAccountId?: string;
    alertThreshold: number;
  }) {
    const budget = await prisma.budget.create({
      data: {
        userId,
        name: data.name,
        amount: data.amount,
        period: data.period,
        cloudAccountId: data.cloudAccountId || null,
        alertThresholds: { default: data.alertThreshold }
      }
    });

    logger.info(`Budget created: ${budget.id}`);
    return budget;
  }

  async getBudgets(userId: string) {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const budgetsWithSpend = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = new Date();
        startDate.setDate(1);

        const where: any = { date: { gte: startDate } };

        if (budget.cloudAccountId) {
          where.cloudAccountId = budget.cloudAccountId;
        } else {
          const accounts = await prisma.cloudAccount.findMany({
            where: { userId },
            select: { id: true }
          });
          where.cloudAccountId = { in: accounts.map(a => a.id) };
        }

        const spent = await prisma.costData.aggregate({
          where,
          _sum: { costAmount: true }
        });

        const currentSpend = Number(spent._sum.costAmount || 0);
        const budgetAmount = Number(budget.amount);
        const thresholds = budget.alertThresholds as any;
        const alertThreshold = thresholds?.default || 80;
        const percentage = (currentSpend / budgetAmount) * 100;
        const isOverBudget = percentage >= 100;
        const isNearLimit = percentage >= alertThreshold;

        return {
          ...budget,
          alertThreshold,
          currentSpend: parseFloat(currentSpend.toFixed(2)),
          percentage: parseFloat(percentage.toFixed(1)),
          isOverBudget,
          isNearLimit,
          remaining: parseFloat((budgetAmount - currentSpend).toFixed(2))
        };
      })
    );

    return budgetsWithSpend;
  }

  async deleteBudget(userId: string, budgetId: string) {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId }
    });

    if (!budget) throw new Error('Budget not found');

    await prisma.budget.delete({ where: { id: budgetId } });
    return { message: 'Budget deleted successfully' };
  }

  async updateBudget(userId: string, budgetId: string, data: {
    amount?: number;
    alertThreshold?: number;
    name?: string;
  }) {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId }
    });

    if (!budget) throw new Error('Budget not found');

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.amount) updateData.amount = data.amount;
    if (data.alertThreshold) {
      updateData.alertThresholds = { default: data.alertThreshold };
    }

    return prisma.budget.update({
      where: { id: budgetId },
      data: updateData
    });
  }
}

export default new BudgetService();
