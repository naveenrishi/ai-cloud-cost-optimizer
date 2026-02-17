import api from './api';

export interface CloudAccount {
  id: string;
  provider: 'AWS' | 'AZURE' | 'GCP';
  accountName: string;
  accountId: string;
  status: string;
  isDemo: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
}

export interface CreateCloudAccountData {
  provider: 'AWS' | 'AZURE' | 'GCP';
  accountName: string;
  accountId: string;
  isDemo: boolean;
}

class CloudAccountService {
  async getAll(): Promise<CloudAccount[]> {
    const response = await api.get<CloudAccount[]>('/api/cloud-accounts');
    return response.data;
  }

  async create(data: CreateCloudAccountData): Promise<CloudAccount> {
    const response = await api.post<CloudAccount>('/api/cloud-accounts', data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/api/cloud-accounts/${id}`);
  }

  async sync(id: string): Promise<void> {
    await api.post(`/api/cloud-accounts/${id}/sync`);
  }
}

export default new CloudAccountService();