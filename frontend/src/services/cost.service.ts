import api from './api';

export interface CostSummary {
  totalCost: number;
  mtdCost: number;
  previousMonthCost: number;
  forecastedCost: number;
  currency: string;
  percentageChange: number;
}

export interface CostTrend {
  date: string;
  cost: number;
  provider?: string;
}

export interface ServiceBreakdown {
  service: string;
  cost: number;
  percentage: number;
}

export interface ProviderBreakdown {
  provider: string;
  cost: number;
  percentage: number;
}

class CostService {
  async getSummary(cloudAccountId?: string): Promise<CostSummary> {
    const params = cloudAccountId ? { cloudAccountId } : {};
    const response = await api.get<CostSummary>('/api/costs/summary', { params });
    return response.data;
  }

  async getTrends(days: number = 30, cloudAccountId?: string): Promise<CostTrend[]> {
    const params: any = { days };
    if (cloudAccountId) params.cloudAccountId = cloudAccountId;
    const response = await api.get<CostTrend[]>('/api/costs/trends', { params });
    return response.data;
  }

  async getServiceBreakdown(cloudAccountId?: string): Promise<ServiceBreakdown[]> {
    const params = cloudAccountId ? { cloudAccountId } : {};
    const response = await api.get<ServiceBreakdown[]>('/api/costs/breakdown', { params });
    return response.data;
  }

  async getProviderBreakdown(): Promise<ProviderBreakdown[]> {
    const response = await api.get<ProviderBreakdown[]>('/api/costs/providers');
    return response.data;
  }
}

export default new CostService();