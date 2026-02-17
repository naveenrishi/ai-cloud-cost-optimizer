import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cloudAccountService from '../services/cloudAccount.service';

const providers = [
  {
    id: 'AWS',
    name: 'Amazon Web Services',
    icon: '☁️',
    color: 'bg-orange-50 border-orange-200',
    selectedColor: 'bg-orange-100 border-orange-500',
    description: 'Connect your AWS account to track EC2, RDS, S3 and more'
  },
  {
    id: 'AZURE',
    name: 'Microsoft Azure',
    icon: '🔷',
    color: 'bg-blue-50 border-blue-200',
    selectedColor: 'bg-blue-100 border-blue-500',
    description: 'Connect your Azure account to track VMs, SQL, Storage and more'
  },
  {
    id: 'GCP',
    name: 'Google Cloud Platform',
    icon: '🌐',
    color: 'bg-green-50 border-green-200',
    selectedColor: 'bg-green-100 border-green-500',
    description: 'Connect your GCP account to track Compute, Cloud SQL and more'
  }
];

export default function ConnectCloud() {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [accountName, setAccountName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedProvider) {
      setError('Please select a cloud provider');
      return;
    }

    setIsLoading(true);
    try {
      await cloudAccountService.create({
        provider: selectedProvider as 'AWS' | 'AZURE' | 'GCP',
        accountName,
        accountId,
        isDemo: true
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">AI Cloud Cost Optimizer</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Connect a Cloud Account
          </h2>
          <p className="text-gray-500">
            Add a demo cloud account to start tracking costs
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Provider Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Select Cloud Provider
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {providers.map(provider => (
                <div
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedProvider === provider.id
                      ? provider.selectedColor
                      : provider.color + ' hover:shadow-md'
                  }`}
                >
                  <div className="text-3xl mb-2">{provider.icon}</div>
                  <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{provider.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900">Account Details</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Production AWS Account"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 123456789012"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-700">
                🎮 <strong>Demo Mode:</strong> This will generate realistic sample cost data
                so you can explore all features without a real cloud account.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !selectedProvider}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium text-lg"
          >
            {isLoading ? 'Connecting & Generating Demo Data...' : 'Connect Account'}
          </button>
        </form>
      </main>
    </div>
  );
}