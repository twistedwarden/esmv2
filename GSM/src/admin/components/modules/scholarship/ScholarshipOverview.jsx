import React from 'react';
import { scholarshipApiService } from '../../../../services/scholarshipApiService';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp,
  PhilippinePeso,
  Calendar,
  Award,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Eye,
  ChevronRight,
  Loader2
} from 'lucide-react';

function ScholarshipOverview() {
  const [stats, setStats] = React.useState({
    totalApplications: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    underReview: 0,
    totalBudget: 0,
    budgetUsed: 0,
    activeScholarships: 0,
    upcomingDeadlines: 0
  });
  const [recentApplications, setRecentApplications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      const [overview, byStatus, apps] = await Promise.all([
        scholarshipApiService.getStatsOverview().catch(() => null),
        scholarshipApiService.getApplicationsByStatus().catch(() => null),
        scholarshipApiService.getApplications({ per_page: 10 }).catch(() => null),
      ]);

      if (overview) {
        setStats(prev => ({
          ...prev,
          totalApplications: overview.totalApplications ?? 0,
          totalBudget: overview.totalBudget ?? 0,
          budgetUsed: overview.budgetUsed ?? 0,
          activeScholarships: overview.activeScholarships ?? 0,
          upcomingDeadlines: overview.upcomingDeadlines ?? 0,
        }));
      }

      if (byStatus) {
        const pending = byStatus.pending ?? 0;
        const underReview = byStatus.under_review ?? 0;
        setStats(prev => ({
          ...prev,
          approved: byStatus.approved ?? 0,
          rejected: byStatus.rejected ?? 0,
          pendingReview: pending,
          underReview: underReview,
        }));
      }

      if (apps && Array.isArray(apps.data)) {
        const mapped = apps.data.map(a => ({
          id: a.id,
          applicationNumber: a.application_number || `APP-${a.id}`,
          name: `${a.student?.first_name ?? ''} ${a.student?.last_name ?? ''}`.trim() || 'Unknown',
          studentId: a.student?.student_id_number || a.student_id || 'N/A',
          program: a.student?.current_academic_record?.program || a.category?.name || 'N/A',
          gpa: a.student?.current_academic_record?.general_weighted_average || a.student?.current_academic_record?.gpa || 'N/A',
          status: a.status,
          type: a.type,
          submittedDate: a.submitted_at || a.created_at,
          amount: a.requested_amount || 0,
          category: a.category?.name || 'N/A',
          subcategory: a.subcategory?.name || 'N/A',
        }));
        setRecentApplications(mapped);
      }
    } catch (e) {
      console.error('Error loading data:', e);
      setError('Failed to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'submitted':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-3.5 h-3.5" />;
      case 'submitted':
      case 'pending':
        return <Clock className="w-3.5 h-3.5" />;
      case 'under_review':
        return <Search className="w-3.5 h-3.5" />;
      case 'approved':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'rejected':
        return <XCircle className="w-3.5 h-3.5" />;
      case 'on_hold':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'cancelled':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-PH', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const getBudgetPercentage = () => {
    if (stats.totalBudget === 0) return 0;
    return ((stats.budgetUsed / stats.totalBudget) * 100).toFixed(1);
  };

  const getRemainingBudget = () => {
    return stats.totalBudget - stats.budgetUsed;
  };

  const filteredApplications = React.useMemo(() => {
    return recentApplications.filter(app => {
      const matchesSearch = searchTerm === '' || 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [recentApplications, searchTerm, statusFilter]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-3"></div>
                <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[1, 2].map(i => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-32 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Scholarship Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and manage scholarship applications and awards
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
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
            onClick={handleRefresh}
            className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.totalApplications.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    All time submissions
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Needs Attention</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {(stats.pendingReview + stats.underReview).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Pending ({stats.pendingReview}) · Review ({stats.underReview})
                  </p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                  <Clock className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.approved.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Active scholarships
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget Utilization</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {getBudgetPercentage()}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    ₱{formatCurrency(stats.budgetUsed)} of ₱{formatCurrency(stats.totalBudget)}
                  </p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                  <PhilippinePeso className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Overview Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Overview</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total: ₱{formatCurrency(stats.totalBudget)}
                </span>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Used Budget</span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      ₱{formatCurrency(stats.budgetUsed)} ({getBudgetPercentage()}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${getBudgetPercentage()}%` }}
                    >
                      {parseFloat(getBudgetPercentage()) > 15 && (
                        <span className="text-xs text-white font-medium">{getBudgetPercentage()}%</span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Remaining Budget</span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      ₱{formatCurrency(getRemainingBudget())} ({(100 - parseFloat(getBudgetPercentage())).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${100 - parseFloat(getBudgetPercentage())}%` }}
                    >
                      {(100 - parseFloat(getBudgetPercentage())) > 15 && (
                        <span className="text-xs text-white font-medium">{(100 - parseFloat(getBudgetPercentage())).toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Status Distribution */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Application Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Approved</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.approved}</span>
                </div>
                <div className="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Under Review</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.underReview}</span>
                </div>
                <div className="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.pendingReview}</span>
                </div>
                <div className="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rejected</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.rejected}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Applications Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Applications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {filteredApplications.length} of {recentApplications.length} applications
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  {/* Status Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'No applications found' : 'No applications yet'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Applications will appear here once submitted'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Application
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredApplications.map((application) => (
                      <tr 
                        key={application.id} 
                        className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {application.applicationNumber}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {application.type === 'renewal' ? (
                                <span className="inline-flex items-center gap-1">
                                  <RefreshCw className="w-3 h-3" />
                                  Renewal
                                </span>
                              ) : (
                                'New Application'
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {application.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {application.studentId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {application.category}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {application.subcategory}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                            <PhilippinePeso className="w-4 h-4 mr-1 text-gray-400" />
                            {formatCurrency(application.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            <span className="capitalize">{application.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(application.submittedDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                            title="View Application"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pending Actions Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800/50">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-yellow-200 dark:bg-yellow-900/40 p-3 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-700 dark:text-yellow-400" />
                </div>
                <span className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
                  {stats.pendingReview + stats.underReview}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Pending Actions</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Applications awaiting review or approval
              </p>
              <button className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-200 transition-colors">
                Review Now
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Success Rate Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800/50">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-green-200 dark:bg-green-900/40 p-3 rounded-lg">
                  <Award className="w-6 h-6 text-green-700 dark:text-green-400" />
                </div>
                <span className="text-2xl font-bold text-green-900 dark:text-green-300">
                  {stats.totalApplications > 0 ? Math.round((stats.approved / stats.totalApplications) * 100) : 0}%
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Approval Rate</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                {stats.approved} approved out of {stats.totalApplications} total
              </p>
              <button className="flex items-center gap-2 text-sm font-medium text-green-800 dark:text-green-300 hover:text-green-900 dark:hover:text-green-200 transition-colors">
                View Details
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Budget Status Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800/50">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-orange-200 dark:bg-orange-900/40 p-3 rounded-lg">
                  <PhilippinePeso className="w-6 h-6 text-orange-700 dark:text-orange-400" />
                </div>
                <span className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                  {getBudgetPercentage()}%
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Budget Status</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                ₱{formatCurrency(getRemainingBudget())} remaining
              </p>
              <button className="flex items-center gap-2 text-sm font-medium text-orange-800 dark:text-orange-300 hover:text-orange-900 dark:hover:text-orange-200 transition-colors">
                Manage Budget
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ScholarshipOverview; 