import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import cloudAccountService, { CloudAccount } from '../services/cloudAccount.service';
import costService, { CostSummary, CostTrend, ServiceBreakdown } from '../services/cost.service';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [trends, setTrends] = useState<CostTrend[]>([]);
  const [breakdown, setBreakdown] = useState<ServiceBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [selectedAccount]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const accountId = selectedAccount === 'all' ? undefined : selectedAccount;
      const [accountsData, summaryData, trendsData, breakdownData] = await Promise.all([
        cloudAccountService.getAll(),
        costService.getSummary(accountId),
        costService.getTrends(30, accountId),
        costService.getServiceBreakdown(accountId)
      ]);
      setAccounts(accountsData);
      setSummary(summaryData);
      setTrends(trendsData);
      setBreakdown(breakdownData.slice(0, 6));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = { AWS: '☁️', AZURE: '🔷', GCP: '🌐' };
    return icons[provider] || '☁️';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading your cloud cost data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">☁️ AI Cloud Cost Optimizer</h1>
            <div className="flex gap-4 text-sm">
              <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-0.5">
                Dashboard
              </button>
              <button
                onClick={() => navigate('/recommendations')}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Recommendations
              </button>
              <button
                onClick={() => navigate('/nuke-tracker')}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
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
            <span className="text-gray-600 text-sm">Welcome, {user?.name}</span>
            <button
              onClick={() => navigate('/connect-cloud')}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Add Account
            </button>
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

        {/* No Accounts State */}
        {accounts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">☁️</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Cloud Accounts Connected</h2>
            <p className="text-gray-500 mb-8">Connect a demo cloud account to start tracking costs</p>
            <button
              onClick={() => navigate('/connect-cloud')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium"
            >
              + Connect Your First Account
            </button>
          </div>
        )}

        {/* Main Dashboard */}
        {accounts.length > 0 && (
          <>
            {/* Account Filter */}
            <div className="mb-6 flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedAccount('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  selectedAccount === 'all'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                All Accounts
              </button>
              {accounts.map(account => (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccount(account.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    selectedAccount === account.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {getProviderIcon(account.provider)} {account.accountName}
                </button>
              ))}
            </div>

            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-sm text-gray-500 mb-1">Month to Date</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.mtdCost)}</p>
                  <p className={`text-sm mt-2 ${summary.percentageChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {summary.percentageChange > 0 ? '↑' : '↓'} {Math.abs(summary.percentageChange)}% vs last month
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-sm text-gray-500 mb-1">Last 30 Days</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.totalCost)}</p>
                  <p className="text-sm text-gray-400 mt-2">Total cloud spend</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-sm text-gray-500 mb-1">Previous Month</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.previousMonthCost)}</p>
                  <p className="text-sm text-gray-400 mt-2">Last month total</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-sm text-gray-500 mb-1">Forecasted</p>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(summary.forecastedCost)}</p>
                  <p className="text-sm text-gray-400 mt-2">This month estimate</p>
                </div>
              </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Cost Trend (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(val) => val.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val.toFixed(0)}`} />
                    <Tooltip formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Cost']} />
                    <Line type="monotone" dataKey="cost" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Cost by Service</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="cost"
                      nameKey="service"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ service, percentage }) => `${service} ${percentage}%`}
                      labelLine={false}
                    >
                      {breakdown.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Cost']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Connected Accounts Table */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Connected Accounts</h3>
                <button
                  onClick={() => navigate('/connect-cloud')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  + Add Account
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-gray-500">Provider</th>
                      <th className="text-left py-2 text-gray-500">Account Name</th>
                      <th className="text-left py-2 text-gray-500">Account ID</th>
                      <th className="text-left py-2 text-gray-500">Status</th>
                      <th className="text-left py-2 text-gray-500">Last Sync</th>
                      <th className="text-left py-2 text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map(account => (
                      <tr key={account.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">
                          <span className="text-lg">{getProviderIcon(account.provider)}</span>
                          <span className="ml-2 font-medium">{account.provider}</span>
                        </td>
                        <td className="py-3">{account.accountName}</td>
                        <td className="py-3 text-gray-500">{account.accountId}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            {account.status}
                          </span>
                          {account.isDemo && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              DEMO
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-gray-500">
                          {account.lastSyncedAt
                            ? new Date(account.lastSyncedAt).toLocaleDateString()
                            : 'Never'}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => cloudAccountService.sync(account.id).then(loadData)}
                            className="text-blue-600 hover:underline text-xs mr-3"
                          >
                            Sync
                          </button>
                          <button
                            onClick={() => cloudAccountService.delete(account.id).then(loadData)}
                            className="text-red-600 hover:underline text-xs"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}