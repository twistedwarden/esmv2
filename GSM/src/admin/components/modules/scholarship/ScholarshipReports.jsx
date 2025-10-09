import React from 'react';
import { scholarshipApiService } from '../../../../services/scholarshipApiService';
import { 
  Download,
  FileText,
  TrendingUp,
  Users,
  PhilippinePeso,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

function ScholarshipReports() {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [overview, byStatus, byType] = await Promise.all([
        scholarshipApiService.getStatsOverview().catch(() => null),
        scholarshipApiService.getApplicationsByStatus().catch(() => null),
        scholarshipApiService.getApplicationsByType().catch(() => null),
      ]);

      setStats({ overview, byStatus, byType });
    } catch (e) {
      console.error('Error loading reports:', e);
      setError('Failed to load reports. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const reportTypes = [
    {
      id: 'applications',
      title: 'Application Report',
      description: 'Detailed report of all scholarship applications',
      icon: FileText,
      color: 'blue'
    },
    {
      id: 'financial',
      title: 'Financial Report',
      description: 'Budget utilization and disbursement details',
      icon: PhilippinePeso,
      color: 'green'
    },
    {
      id: 'students',
      title: 'Student Demographics',
      description: 'Student profiles and enrollment statistics',
      icon: Users,
      color: 'purple'
    },
    {
      id: 'performance',
      title: 'Performance Analytics',
      description: 'Approval rates and processing times',
      icon: TrendingUp,
      color: 'orange'
    },
    {
      id: 'categories',
      title: 'Program Report',
      description: 'Breakdown by scholarship categories',
      icon: BarChart3,
      color: 'indigo'
    },
    {
      id: 'timeline',
      title: 'Timeline Report',
      description: 'Applications and approvals over time',
      icon: Calendar,
      color: 'red'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
      red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Generate and download scholarship program reports
          </p>
        </div>
        <button 
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">Error Loading Data</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
          </div>
          <button 
            onClick={loadData}
            className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Quick Stats */}
      {stats?.overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Applications</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.overview.totalApplications || 0}
                </div>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.byStatus?.approved || 0}
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Scholarships</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.overview.activeScholarships || 0}
                </div>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Budget Used</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ₱{(stats.overview.budgetUsed || 0).toLocaleString()}
                </div>
              </div>
              <PhilippinePeso className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Report Types */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Available Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => (
            <div 
              key={report.id}
              className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-lg ${getColorClasses(report.color)} flex items-center justify-center mb-4`}>
                <report.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {report.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {report.description}
              </p>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex-1">
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
                <button className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex-1">
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Report Builder */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Custom Report Builder
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Create a custom report with specific date ranges and filters
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
        <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          <BarChart3 className="w-4 h-4" />
          Generate Custom Report
        </button>
      </div>
    </div>
  );
}

export default ScholarshipReports;

