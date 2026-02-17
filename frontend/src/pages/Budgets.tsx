import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import budgetService, { Budget, CreateBudgetData } from '../services/budget.service';
import cloudAccountService, { CloudAccount } from '../services/cloudAccount.service';
import exportService from '../services/export.service';

export default function Budgets() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [formData, setFormData] = useState<CreateBudgetData>({
    name: '',
    amount: 1000,
    period: 'MONTHLY',
    cloudAccountId: '',
    alertThreshold: 80
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [budgetsData, accountsData] = await Promise.all([
        budgetService.getAll(),
        cloudAccountService.getAll()
      ]);
      setBudgets(budgetsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await budgetService.create({
        ...formData,
        cloudAccountId: formData.cloudAccountId || undefined
      });
      setShowForm(false);
      setFormData({
        name: '',
        amount: 1000,
        period: 'MONTHLY',
        cloudAccountId: '',
        alertThreshold: 80
      });
      await loadData();
    } catch (error) {
      console.error('Error creating budget:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await budgetService.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const handleExport = async (type: 'costs' | 'recommendations' | 'deletions') => {
    setIsExporting(true);
    try {
      if (type === 'costs') await exportService.exportCosts(30);
      if (type === 'recommendations') await exportService.exportRecommendations();
      if (type === 'deletions') await exportService.exportDeletions();
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);

  const getProgressColor = (budget: Budget) => {
    if (budget.isOverBudget) return 'bg-red-500';
    if (budget.isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (budget: Budget) => {
    if (budget.isOverBudget) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          🚨 Over Budget
        </span>
      );
    }
    if (budget.isNearLimit) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
          ⚠️ Near Limit
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
        ✅ On Track
      </span>
    );
  };

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpend = budgets.reduce((sum, b) => sum + b.currentSpend, 0);
  const alertCount = budgets.filter(b => b.isNearLimit || b.isOverBudget).length;

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
              <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-900">Dashboard</button>
              <button onClick={() => navigate('/recommendations')} className="text-gray-500 hover:text-gray-900">Recommendations</button>
              <button onClick={() => navigate('/nuke-tracker')} className="text-gray-500 hover:text-gray-900">💥 Nuke Tracker</button>
              <button className="text-blue-600 font-medium border-b-2 border-blue-600">🔔 Budgets</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">{user?.name}</span>
            <button onClick={logout} className="px-4 py-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🔔 Budget Alerts & Export</h2>
            <p className="text-gray-500 mt-1">Set spending limits and export your data</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            + Create Budget
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Total Budget</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(totalBudget)}</p>
            <p className="text-xs text-gray-400 mt-1">{budgets.length} active budgets</p>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-orange-500">
            <p className="text-sm text-gray-500">Total Spend (MTD)</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(totalSpend)}</p>
            <p className="text-xs text-gray-400 mt-1">across all budgets</p>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500">
            <p className="text-sm text-gray-500">Active Alerts</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{alertCount}</p>
            <p className="text-xs text-gray-400 mt-1">budgets need attention</p>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">📤 Export Data</h3>
          <p className="text-gray-500 text-sm mb-4">
            Download your cloud cost data as CSV files for further analysis
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => handleExport('costs')}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
            >
              📊 Export Costs (CSV)
            </button>
            <button
              onClick={() => handleExport('recommendations')}
              disabled={isExporting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
            >
              💡 Export Recommendations (CSV)
            </button>
            <button
              onClick={() => handleExport('deletions')}
              disabled={isExporting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
            >
              💥 Export Deletions (CSV)
            </button>
          </div>
          {isExporting && (
            <p className="text-sm text-gray-500 mt-3 animate-pulse">
              ⏳ Preparing your export...
            </p>
          )}
        </div>

        {/* Budgets List */}
        {budgets.length === 0 && !isLoading ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No Budgets Created</h3>
            <p className="text-gray-500 mb-4">Create a budget to track spending and get alerts</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create First Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {budgets.map(budget => (
              <div key={budget.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{budget.name}</h3>
                    <p className="text-sm text-gray-500">
                      {budget.period} budget
                      {budget.cloudAccount && ` • ${budget.cloudAccount.provider} - ${budget.cloudAccount.accountName}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(budget)}
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      Spent: <strong>{formatCurrency(budget.currentSpend)}</strong>
                    </span>
                    <span className="text-gray-600">
                      Budget: <strong>{formatCurrency(Number(budget.amount))}</strong>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getProgressColor(budget)}`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className={budget.isOverBudget ? 'text-red-500' : 'text-gray-400'}>
                      {budget.percentage}% used
                    </span>
                    <span className={budget.remaining < 0 ? 'text-red-500' : 'text-green-600'}>
                      {budget.remaining < 0
                        ? `${formatCurrency(Math.abs(budget.remaining))} over budget`
                        : `${formatCurrency(budget.remaining)} remaining`}
                    </span>
                  </div>
                </div>

                {/* Alert Threshold */}
                <div className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                  <span>⚠️ Alert at {Number(budget.alertThreshold)}% of budget</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Budget Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold mb-4">🔔 Create Budget Alert</h3>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Production AWS Budget"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget Amount ($)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Period
                    </label>
                    <select
                      value={formData.period}
                      onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cloud Account (Optional)
                  </label>
                  <select
                    value={formData.cloudAccountId}
                    onChange={(e) => setFormData(prev => ({ ...prev, cloudAccountId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Accounts</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.provider} - {acc.accountName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alert Threshold: {formData.alertThreshold}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={formData.alertThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, alertThreshold: parseInt(e.target.value) }))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>50%</span>
                    <span>Alert when {formData.alertThreshold}% is used</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                  >
                    Create Budget
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}