import api from './api';

export interface Deletion {
  id: string;
  cloudAccountId: string;
  resourceId: string;
  resourceType: string;
  resourceName: string | null;
  deletedAt: string;
  deletedBy: string | null;
  deletionMethod: string;
  monthlyCostBefore: number | null;
  estimatedSavings: number | null;
  deletionReason: string | null;
  cloudAccount: {
    provider: string;
    accountName: string;
  };
}

export interface DeletionAnalytics {
  totalDeletions: number;
  totalSavings: number;
  recentDeletions: number;
  byResourceType: {
    resourceType: string;
    count: number;
    savings: number;
  }[];
}

export interface RecordDeletionData {
  cloudAccountId: string;
  resourceId: string;
  resourceType: string;
  resourceName?: string;
  deletionMethod: 'MANUAL' | 'AUTOMATED' | 'RECOMMENDATION';
  monthlyCostBefore?: number;
  deletionReason?: string;
}

class DeletionService {
  async getAll(filters?: {
    resourceType?: string;
    cloudAccountId?: string;
  }): Promise<Deletion[]> {
    const response = await api.get<Deletion[]>('/api/deletions', {
      params: filters
    });
    return response.data;
  }

  async record(data: RecordDeletionData): Promise<Deletion> {
    const response = await api.post<Deletion>('/api/deletions', data);
    return response.data;
  }

  async getAnalytics(): Promise<DeletionAnalytics> {
    const response = await api.get<DeletionAnalytics>('/api/deletions/analytics');
    return response.data;
  }
}

export default new DeletionService();