import api from './api';

export interface Recommendation {
  id: string;
  cloudAccountId: string;
  resourceId: string;
  type: string;
  title: string;
  description: string;
  estimatedSavings: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  implementationSteps: { steps: string[] };
  createdAt: string;
}

export interface SavingsSummary {
  potentialSavings: number;
  actualSavings: number;
  pendingCount: number;
  implementedCount: number;
}

class RecommendationService {
  async getAll(cloudAccountId?: string): Promise<Recommendation[]> {
    const params = cloudAccountId ? { cloudAccountId } : {};
    const response = await api.get<Recommendation[]>('/api/recommendations', { params });
    return response.data;
  }

  async generate(cloudAccountId: string): Promise<void> {
    await api.post('/api/recommendations/generate', { cloudAccountId });
  }

  async getSavingsSummary(): Promise<SavingsSummary> {
    const response = await api.get<SavingsSummary>('/api/recommendations/savings');
    return response.data;
  }

  async implement(id: string): Promise<void> {
    await api.post(`/api/recommendations/${id}/implement`);
  }

  async dismiss(id: string): Promise<void> {
    await api.post(`/api/recommendations/${id}/dismiss`);
  }
}

export default new RecommendationService();