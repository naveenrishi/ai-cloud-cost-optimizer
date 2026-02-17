import api from './api';

export interface Budget {
  id: string;
  name: string;
  amount: number;
  period: string;
  alertThreshold: number;
  currentSpend: number;
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
  remaining: number;
  cloudAccount?: {
    provider: string;
    accountName: string;
  };
}

export interface CreateBudgetData {
  name: string;
  amount: number;
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  cloudAccountId?: string;
  alertThreshold: number;
}

class BudgetService {
  async getAll(): Promise<Budget[]> {
    const response = await api.get<Budget[]>('/api/budgets');
    return response.data;
  }

  async create(data: CreateBudgetData): Promise<Budget> {
    const response = await api.post<Budget>('/api/budgets', data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/api/budgets/${id}`);
  }

  async update(id: string, data: Partial<CreateBudgetData>): Promise<Budget> {
    const response = await api.put<Budget>(`/api/budgets/${id}`, data);
    return response.data;
  }
}

export default new BudgetService();