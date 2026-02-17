import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import deletionService, { Deletion, DeletionAnalytics, RecordDeletionData } from '../services/deletion.service';
import cloudAccountService, { CloudAccount } from '../services/cloudAccount.service';

export default function NukeTracker() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [deletions, setDeletions] = useState<Deletion[]>([]);
  const [analytics, setAnalytics] = useState<DeletionAnalytics | null>(null);
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRecordForm, setShowRecordForm] = useState(false);

  const [formData, setFormData] = useState<RecordDeletionData>({
    cloudAccountId: '',
    resourceId: '',
    resourceType: 'EC2',
    resourceName: '',
    deletionMethod: 'MANUAL',
    monthlyCostBefore: 0,
    deletionReason: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [deletionsData, analyticsData, accountsData] = await Promise.all([
        deletionService.getAll(),
        deletionService.getAnalytics(),
        cloudAccountService.getAll()
      ]);
      setDeletions(deletionsData);
      setAnalytics(analyticsData);
      setAccounts(accountsData);
      if (accountsData.length > 0) {
        setFormData(prev => ({ ...prev, cloudAccountId: accountsData[0].id }));
      }
    } catch (error) {
      console.error('Error loading nuke tracker data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await deletionService.record(formData);
      setShowRecordForm(false);
      setFormData(prev => ({
        ...prev,
        resourceId: '',
        resourceName: '',
        monthlyCostBefore: 0,
        deletionReason: ''
      }));
      await loadData();
    } catch (error) {
      console.error('Error recording deletion:', error);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);

  const getMethodBadge = (method: string) => {
    const styles: Record<string, string> = {
      MANUAL: 'bg-gray-100 text-gray-700',
      AUTOMATED: 'bg-blue-100 text-blue-700',
      RECOMMENDATION: 'bg-green-100 text-green-700'
    };
    return styles[method] || 'bg-gray-100 text-gray-700';
  };

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = { AWS: '☁️', AZURE: '🔷', GCP: '🌐' };
    return icons[provider] || '☁️';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
              ☁️ AI Cloud Cost Optimizer
            </h1>
            <div className="flex gap-4 text-sm">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/recommendations')}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Recommendations
              </button>
              <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-0.5">
                💥 Nuke Tracker
              </button>
              <button
                onClick={() => navigate('/budgets')}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                🔔 Budgets
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">{user?.name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">💥 Infrastructure Nuke Tracker</h2>
            <p className="text-gray-500 mt-1">Track all deleted/terminated resources and savings</p>
          </div>
          <button
            onClick={() => setShowRecordForm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
          >
            💥 Record Deletion
          </button>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500">
              <p className="text-sm text-gray-500">Total Deletions</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{analytics.totalDeletions}</p>
              <p className="text-xs text-gray-400 mt-1">all time</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Total Savings</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(analytics.totalSavings)}</p>
              <p className="text-xs text-gray-400 mt-1">per month</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Last 30 Days</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{analytics.recentDeletions}</p>
              <p className="text-xs text-gray-400 mt-1">deletions</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
              <p className="text-sm text-gray-500">Resource Types</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{analytics.byResourceType.length}</p>
              <p className="text-xs text-gray-400 mt-1">unique types</p>
            </div>
          </div>
        )}

        {/* Resource Type Breakdown */}
        {analytics && analytics.byResourceType.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Savings by Resource Type</h3>
            <div className="space-y-3">
              {analytics.byResourceType.map(item => (
                <div key={item.resourceType} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-700 font-medium">{item.resourceType}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {item.count} deleted
                    </span>
                  </div>
                  <span className="text-green-600 font-semibold">
                    {formatCurrency(item.savings)}/mo saved
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Record Deletion Modal */}
        {showRecordForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
              <h3 className="text-lg font-bold mb-4">💥 Record Resource Deletion</h3>
              <form onSubmit={handleRecord} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cloud Account</label>
                  <select
                    value={formData.cloudAccountId}
                    onChange={(e) => setFormData(prev => ({ ...prev, cloudAccountId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {getProviderIcon(acc.provider)} {acc.accountName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resource ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. i-1234567890"
                      value={formData.resourceId}
                      onChange={(e) => setFormData(prev => ({ ...prev, resourceId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name</label>
                    <input
                      type="text"
                      placeholder="e.g. prod-web-server"
                      value={formData.resourceName}
                      onChange={(e) => setFormData(prev => ({ ...prev, resourceName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                    <select
                      value={formData.resourceType}
                      onChange={(e) => setFormData(prev => ({ ...prev, resourceType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EC2">EC2 Instance</option>
                      <option value="RDS">RDS Database</option>
                      <option value="S3">S3 Bucket</option>
                      <option value="EBS">EBS Volume</option>
                      <option value="VM">Virtual Machine</option>
                      <option value="Storage">Storage Account</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deletion Method</label>
                    <select
                      value={formData.deletionMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, deletionMethod: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MANUAL">Manual</option>
                      <option value="AUTOMATED">Automated</option>
                      <option value="RECOMMENDATION">From Recommendation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Cost Before Deletion ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 150.00"
                    value={formData.monthlyCostBefore || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyCostBefore: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Deletion</label>
                  <textarea
                    placeholder="Why was this resource deleted?"
                    value={formData.deletionReason}
                    onChange={(e) => setFormData(prev => ({ ...prev, deletionReason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                  >
                    💥 Record Deletion
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRecordForm(false)}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Deletions Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Deletion History</h3>
          </div>
          {deletions.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">💥</div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">No Deletions Recorded</h3>
              <p className="text-gray-500 mb-4">Start tracking deleted resources to measure your savings</p>
              <button
                onClick={() => setShowRecordForm(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Record First Deletion
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Resource</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Type</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Account</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Method</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Savings</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deletions.map(deletion => (
                    <tr key={deletion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{deletion.resourceName || deletion.resourceId}</p>
                        <p className="text-xs text-gray-400">{deletion.resourceId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {deletion.resourceType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span>{getProviderIcon(deletion.cloudAccount?.provider || '')}</span>
                        <span className="ml-1 text-gray-600">{deletion.cloudAccount?.accountName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodBadge(deletion.deletionMethod)}`}>
                          {deletion.deletionMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-600 font-semibold">
                          {deletion.estimatedSavings ? formatCurrency(deletion.estimatedSavings) + '/mo' : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(deletion.deletedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
