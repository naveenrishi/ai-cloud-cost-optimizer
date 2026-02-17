interface MockCostData {
    date: Date;
    service: string;
    region: string;
    costAmount: number;
    currency: string;
    tags?: any;
  }
  
  export class MockDataGenerator {
    // Generate cost data for last 30 days
    static generateCostData(provider: 'AWS' | 'AZURE' | 'GCP'): MockCostData[] {
      const data: MockCostData[] = [];
      const today = new Date();
      
      // Services by provider
      const services = this.getServicesForProvider(provider);
      const regions = this.getRegionsForProvider(provider);
  
      // Generate data for last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
  
        services.forEach(service => {
          regions.forEach(region => {
            const baseCost = this.getBaseCostForService(service);
            const variance = (Math.random() - 0.5) * 0.3; // ±15% variance
            const cost = baseCost * (1 + variance);
  
            data.push({
              date,
              service,
              region,
              costAmount: parseFloat(cost.toFixed(2)),
              currency: 'USD',
              tags: {
                environment: Math.random() > 0.5 ? 'production' : 'development',
                team: this.getRandomTeam()
              }
            });
          });
        });
      }
  
      return data;
    }
  
    private static getServicesForProvider(provider: string): string[] {
      const serviceMap: Record<string, string[]> = {
        AWS: ['EC2', 'RDS', 'S3', 'Lambda', 'CloudFront', 'EBS'],
        AZURE: ['Virtual Machines', 'SQL Database', 'Blob Storage', 'Functions', 'CDN'],
        GCP: ['Compute Engine', 'Cloud SQL', 'Cloud Storage', 'Cloud Functions', 'Cloud CDN']
      };
      return serviceMap[provider] || [];
    }
  
    private static getRegionsForProvider(provider: string): string[] {
      const regionMap: Record<string, string[]> = {
        AWS: ['us-east-1', 'us-west-2', 'eu-west-1'],
        AZURE: ['East US', 'West Europe', 'Southeast Asia'],
        GCP: ['us-central1', 'europe-west1', 'asia-east1']
      };
      return regionMap[provider] || [];
    }
  
    private static getBaseCostForService(service: string): number {
      const costMap: Record<string, number> = {
        // AWS
        'EC2': 450,
        'RDS': 320,
        'S3': 180,
        'Lambda': 85,
        'CloudFront': 120,
        'EBS': 95,
        // Azure
        'Virtual Machines': 480,
        'SQL Database': 340,
        'Blob Storage': 160,
        'Functions': 75,
        'CDN': 110,
        // GCP
        'Compute Engine': 460,
        'Cloud SQL': 330,
        'Cloud Storage': 170,
        'Cloud Functions': 80,
        'Cloud CDN': 115
      };
      return costMap[service] || 100;
    }
  
    private static getRandomTeam(): string {
      const teams = ['Engineering', 'Data Science', 'DevOps', 'Marketing', 'Product'];
      return teams[Math.floor(Math.random() * teams.length)];
    }
  
    // Generate mock resources for recommendations
    static generateMockResources(provider: 'AWS' | 'AZURE' | 'GCP') {
      const resourceTypes = this.getResourceTypesForProvider(provider);
      const resources = [];
  
      for (let i = 0; i < 15; i++) {
        const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
        resources.push({
          resourceId: `${provider.toLowerCase()}-${type.toLowerCase()}-${i + 1}`,
          resourceType: type,
          resourceName: `${type}-${i + 1}`,
          region: this.getRegionsForProvider(provider)[0],
          monthlyCost: parseFloat((Math.random() * 500).toFixed(2)),
          cpuUtilization: parseFloat((Math.random() * 100).toFixed(1)),
          status: Math.random() > 0.8 ? 'idle' : 'running',
          createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
        });
      }
  
      return resources;
    }
  
    private static getResourceTypesForProvider(provider: string): string[] {
      const typeMap: Record<string, string[]> = {
        AWS: ['EC2', 'RDS', 'EBS', 'S3'],
        AZURE: ['VM', 'SQL', 'Disk', 'Storage'],
        GCP: ['VM', 'SQL', 'Disk', 'Storage']
      };
      return typeMap[provider] || [];
    }
  }