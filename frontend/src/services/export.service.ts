import api from './api';

class ExportService {
  async exportCosts(days: number = 30): Promise<void> {
    const response = await api.get(`/api/export/costs?days=${days}`, {
      responseType: 'blob'
    });
    this.downloadFile(response.data, 'cloud-costs.csv');
  }

  async exportRecommendations(): Promise<void> {
    const response = await api.get('/api/export/recommendations', {
      responseType: 'blob'
    });
    this.downloadFile(response.data, 'recommendations.csv');
  }

  async exportDeletions(): Promise<void> {
    const response = await api.get('/api/export/deletions', {
      responseType: 'blob'
    });
    this.downloadFile(response.data, 'deletions.csv');
  }

  private downloadFile(data: Blob, filename: string): void {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export default new ExportService();