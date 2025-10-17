import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  PieChart,
  Activity
} from 'lucide-react';
import { scholarshipApiService } from '../../../../../services/scholarshipApiService';

function ReportingAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const getPercentageChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch real data from API endpoints
      const [sscStats, applicationsByType, applicationsByStatus, sscDecisions] = await Promise.all([
        scholarshipApiService.getSscStatistics().catch(() => null),
        scholarshipApiService.getApplicationsByType().catch(() => null),
        scholarshipApiService.getApplicationsByStatus().catch(() => null),
        scholarshipApiService.getAllSscDecisions({ per_page: 1000 }).catch(() => null)
      ]);

      // Process SSC statistics
      if (sscStats) {
        setStats({
          totalApplications: sscStats.totalApplications || 0,
          approvedApplications: sscStats.approved || 0,
          rejectedApplications: sscStats.rejected || 0,
          pendingApplications: sscStats.pendingReview || 0,
          underAppeal: 0, // This would need a specific API endpoint
          averageProcessingTime: sscStats.averageProcessingTime || 0,
          committeeMembers: 0, // This would need a specific API endpoint
          activeMembers: 0, // This would need a specific API endpoint
          thisMonthDecisions: sscStats.thisMonthDecisions || 0,
          lastMonthDecisions: 0, // This would need a specific API endpoint
          approvalRate: sscStats.totalApplications > 0 ? 
            ((sscStats.approved / sscStats.totalApplications) * 100).toFixed(1) : 0,
          averageScore: 0, // This would need a specific API endpoint
          topPerformingMember: 'N/A', // This would need a specific API endpoint
          mostActiveMember: 'N/A' // This would need a specific API endpoint
        });
      }

      // Process chart data from available API responses
      const chartData = {
        applicationsByMonth: [], // This would need a specific API endpoint
        applicationsByCategory: applicationsByType ? 
          applicationsByType.map(item => ({
            category: item.category_name || 'Unknown',
            count: item.count || 0,
            percentage: item.percentage || 0
          })) : [],
        applicationsBySchool: [], // This would need a specific API endpoint
        memberPerformance: [], // This would need a specific API endpoint
        processingTimeTrends: [] // This would need a specific API endpoint
      };

      setChartData(chartData);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Error loading analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingUp className="h-4 w-4 transform rotate-180" />;
    return <Activity className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reporting & Analytics</h1>
            <p className="text-gray-600">SSC performance metrics and application analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'applications', label: 'Applications' },
            { id: 'members', label: 'Member Performance' },
            { id: 'trends', label: 'Trends' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                  <div className="flex items-center text-sm">
                    <span className={getChangeColor(12)}>+12%</span>
                    <span className="ml-1 text-gray-500">from last month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approvalRate}%</p>
                  <div className="flex items-center text-sm">
                    <span className={getChangeColor(5.2)}>+5.2%</span>
                    <span className="ml-1 text-gray-500">from last month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageProcessingTime} days</p>
                  <div className="flex items-center text-sm">
                    <span className={getChangeColor(-0.3)}>-0.3 days</span>
                    <span className="ml-1 text-gray-500">from last month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeMembers}/{stats.committeeMembers}</p>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600">83% participation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Applications Trend */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Month</h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {chartData.applicationsByMonth?.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="w-full bg-gray-200 rounded-t" style={{ height: `${(item.applications / 70) * 200}px` }}>
                      <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(item.approved / item.applications) * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{item.month}</p>
                    <p className="text-xs text-gray-500">{item.applications}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications by Category */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Category</h3>
              <div className="space-y-3">
                {chartData.applicationsByCategory?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                      <span className="text-sm text-gray-700">{item.category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      <span className="text-xs text-gray-500">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div>
          {/* Application Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approvedApplications}</p>
                  <p className="text-sm text-gray-500">71.5% of total</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejectedApplications}</p>
                  <p className="text-sm text-gray-500">18.8% of total</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
                  <p className="text-sm text-gray-500">7.1% of total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Applications by School */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Applications by School</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {chartData.applicationsBySchool?.map((school, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{school.school}</p>
                      <div className="mt-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(school.count / 250) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-medium text-gray-900">{school.count}</p>
                      <p className="text-xs text-gray-500">{school.approved} approved</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Performance Tab */}
      {activeTab === 'members' && (
        <div>
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Member Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Decisions Made
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approval Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chartData.memberPerformance?.map((member, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.member}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.decisions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.avgScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.approvalRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${member.approvalRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {member.approvalRate >= 80 ? 'Excellent' : 
                             member.approvalRate >= 70 ? 'Good' : 
                             member.approvalRate >= 60 ? 'Average' : 'Needs Improvement'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Processing Time Trends */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Time Trends</h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {chartData.processingTimeTrends?.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t" 
                      style={{ height: `${(item.avgTime / 4) * 200}px` }}
                    ></div>
                    <p className="text-xs text-gray-600 mt-2">{item.week}</p>
                    <p className="text-xs text-gray-500">{item.avgTime} days</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Decisions */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Decisions</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-lg font-semibold text-gray-900">{stats.thisMonthDecisions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Month</span>
                  <span className="text-lg font-semibold text-gray-900">{stats.lastMonthDecisions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Change</span>
                  <span className={`text-sm font-medium ${getChangeColor(9.9)}`}>
                    +9.9%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportingAnalytics;
