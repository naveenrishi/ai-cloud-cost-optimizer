import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: '📊',
    title: 'Multi-Cloud Dashboard',
    description: 'Track costs across AWS, Azure, and GCP in one unified dashboard with real-time charts and analytics.'
  },
  {
    icon: '💡',
    title: 'AI Recommendations',
    description: 'Get intelligent cost-saving recommendations powered by AI. Identify idle resources and optimization opportunities.'
  },
  {
    icon: '💥',
    title: 'Nuke Tracker',
    description: 'Track every deleted resource with full audit trail. Measure exactly how much money you save from cleanup activities.'
  },
  {
    icon: '🔔',
    title: 'Budget Alerts',
    description: 'Set spending limits and get alerted before you go over budget. Never get surprised by a cloud bill again.'
  },
  {
    icon: '📤',
    title: 'CSV Export',
    description: 'Export all your cost data, recommendations and deletion history to CSV for further analysis and reporting.'
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Enterprise-grade security with JWT authentication. Your cloud credentials are never stored in plain text.'
  }
];

const stats = [
  { value: '$2.4M+', label: 'Cloud costs tracked' },
  { value: '45%', label: 'Average cost reduction' },
  { value: '500+', label: 'Resources optimized' },
  { value: '3', label: 'Cloud providers supported' }
];

const providers = [
  { name: 'Amazon Web Services', icon: '☁️', color: 'text-orange-500' },
  { name: 'Microsoft Azure', icon: '🔷', color: 'text-blue-500' },
  { name: 'Google Cloud Platform', icon: '🌐', color: 'text-green-500' }
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☁️</span>
            <span className="text-xl font-bold text-gray-900">AI Cloud Cost Optimizer</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-gray-900 font-medium text-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span>🚀</span>
            <span>Now supporting AWS, Azure & GCP</span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Stop Overpaying for
            <span className="text-blue-600"> Cloud Infrastructure</span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered multi-cloud cost optimizer that identifies waste, recommends savings,
            and tracks every infrastructure change. Save up to 45% on your cloud bill.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg shadow-lg shadow-blue-200 transition-all hover:shadow-xl hover:scale-105"
            >
              Start Saving Today →
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-lg border border-gray-200 shadow transition-all"
            >
              View Demo
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-4">
            No credit card required • Free demo data included
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-blue-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cloud Providers */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-8">
            Supports all major cloud providers
          </p>
          <div className="flex justify-center gap-12 flex-wrap">
            {providers.map((provider, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-4xl">{provider.icon}</span>
                <span className="text-gray-700 font-semibold">{provider.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to control cloud costs
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              From real-time cost tracking to AI-powered recommendations,
              we have all the tools you need to optimize your cloud spend.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-gray-500 text-lg">Get started in minutes, not days</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect your cloud',
                description: 'Link your AWS, Azure, or GCP account. Use demo mode to explore without real credentials.',
                icon: '🔗'
              },
              {
                step: '02',
                title: 'Analyze your costs',
                description: 'Our AI engine scans your infrastructure and identifies waste, idle resources and savings opportunities.',
                icon: '🔍'
              },
              {
                step: '03',
                title: 'Save money',
                description: 'Implement recommendations, track deletions, set budgets and watch your cloud bill shrink.',
                icon: '💰'
              }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl text-3xl mb-4">
                  {item.icon}
                </div>
                <div className="text-blue-600 font-bold text-sm mb-2">STEP {item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to slash your cloud costs?
          </h2>
          <p className="text-blue-200 text-lg mb-10">
            Join hundreds of teams using AI Cloud Cost Optimizer to save money on their cloud infrastructure.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-bold text-lg shadow-xl transition-all hover:scale-105"
          >
            Get Started Free →
          </button>
          <p className="text-blue-300 text-sm mt-4">
            No credit card required • Demo data included • Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">☁️</span>
              <span className="text-white font-bold">AI Cloud Cost Optimizer</span>
            </div>
            <div className="flex gap-6 text-sm">
              <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">
                Sign In
              </button>
              <button onClick={() => navigate('/register')} className="hover:text-white transition-colors">
                Sign Up
              </button>
            </div>
            <p className="text-sm">
              © 2026 AI Cloud Cost Optimizer. Built with ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}