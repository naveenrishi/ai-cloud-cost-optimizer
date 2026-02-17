import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import recommendationService, { Recommendation, SavingsSummary } from '../services/recommendation.service';
import cloudAccountService, { CloudAccount } from '../services/cloudAccount.service';

const priorityColors: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700 border-red-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW: 'bg-green-100 text-green-700 border-green-200'
};

const typeIcons: Record<string, string> = {
  DELETE_IDLE: '🗑️',
  RIGHT_SIZE: '📉',
  RESERVED_INSTANCE: '💰',
  STORAGE_OPTIMIZATION: '💾',
  SPOT_INSTANCE: '⚡'
};

export default function Recommendations() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [summary, setSummary] = useState<SavingsSummary | null>(null);
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recs, savingsSummary, accountsData] = await Promise.all([
        recommendationService.getAll(),
        recommendationService.getSavingsSummary(),
        cloudAccountService.getAll()
      ]);
      setRecommendations(recs);
      setSummary(savingsSummary);
      setAccounts(accountsData);
      if (accountsData.length > 0 && !selectedAccount) {
        setSelectedAccount(accountsData[0].id);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedAccount) return;
    setIsGenerating(true);
    try {
      await recommendationService.generate(selectedAccount);
      await loadData();
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImplement = async (id: string) => {
    try {
      await recommendationService.implement(id);
      setRecommendations(prev => prev.filter(r => r.id !== id));
      await loadData();
    } catch (error) {
      console.error('Error implementing recommendation:', error);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await recommendationService.dismiss(id);
      setRecommendations(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);

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
              <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-0.5">
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
            <h2 className="text-2xl font-bold text-gray-900">💡 Cost Recommendations</h2>
            <p className="text-gray-500 mt-1">AI-powered suggestions to reduce your cloud costs</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.provider} - {acc.accountName}
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedAccount}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {isGenerating ? '⏳ Analyzing...' : '🔍 Scan for Savings'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Potential Savings</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(summary.potentialSavings)}</p>
              <p className="text-xs text-gray-400 mt-1">per month</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Actual Savings</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(summary.actualSavings)}</p>
              <p className="text-xs text-gray-400 mt-1">implemented</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-500">
              <p className="text-sm text-gray-500">Open Items</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{summary.pendingCount}</p>
              <p className="text-xs text-gray-400 mt-1">recommendations</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
              <p className="text-sm text-gray-500">Implemented</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{summary.implementedCount}</p>
              <p className="text-xs text-gray-400 mt-1">completed</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && recommendations.length === 0 && (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Recommendations Yet</h3>
            <p className="text-gray-500 mb-6">Click "Scan for Savings" to analyze your cloud resources</p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedAccount}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isGenerating ? '⏳ Analyzing...' : '🔍 Scan for Savings'}
            </button>
          </div>
        )}

        {/* Recommendations List */}
        {recommendations.length > 0 && (
          <div className="space-y-4">
            {recommendations.map(rec => (
              <div key={rec.id} className="bg-white rounded-lg shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{typeIcons[rec.type] || '💡'}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColors[rec.priority]}`}>
                            {rec.priority}
                          </span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {rec.type.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{rec.description}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(rec.estimatedSavings)}</p>
                      <p className="text-xs text-gray-400">per month</p>
                    </div>
                  </div>

                  {/* Expanded Steps */}
                  {expandedId === rec.id && rec.implementationSteps?.steps && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-gray-700 mb-3">📋 Implementation Steps:</h4>
                      <ol className="space-y-2">
                        {rec.implementationSteps.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleImplement(rec.id)}
                      className="px-4 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      ✅ Mark Implemented
                    </button>
                    <button
                      onClick={() => handleDismiss(rec.id)}
                      className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
                      className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100"
                    >
                      {expandedId === rec.id ? '▲ Hide Steps' : '▼ Show Steps'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}