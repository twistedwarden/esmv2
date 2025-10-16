import React, { useState, useEffect } from 'react';
import { 
  Users,
  GraduationCap, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  School,
  Award,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  Download,
  RefreshCw,
  Plus,
  Filter,
  Search,
  HandCoins,
  UserCheck,
  FileBarChart,
  Target,
  Zap
} from 'lucide-react';
import { LoadingDashboard } from '../../ui/LoadingSpinner';
import StandardLoading from '../../ui/StandardLoading';
import AnimatedCard, { StatsCard as AnimatedStatsCard } from '../../ui/AnimatedCard';
import AnimatedContainer, { AnimatedGrid, AnimatedSection } from '../../ui/AnimatedContainer';
import { transitions } from '../../../../utils/transitions';
import StatsCard from './components/StatsCard';
import ChartCard from './components/ChartCard';
import RecentActivities from './components/RecentActivities';
import PerformanceMetrics from './components/PerformanceMetrics';

function DashboardOverview() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data based on actual system structure
  const mockDashboardData = {
    overview: {
      totalApplications: 1247,
      approvedApplications: 892,
      pendingReview: 234,
      rejectedApplications: 121,
      totalBudget: 45200000,
      disbursedAmount: 32100000,
      remainingBudget: 13100000,
      activeStudents: 892,
      partnerSchools: 45,
      sscReviews: 156,
      interviewsScheduled: 89
    },
    applicationTrends: {
      monthly: [
        { month: 'Jan', applications: 65, approved: 45, rejected: 8 },
        { month: 'Feb', applications: 78, approved: 52, rejected: 12 },
        { month: 'Mar', applications: 90, approved: 68, rejected: 15 },
        { month: 'Apr', applications: 81, approved: 58, rejected: 11 },
        { month: 'May', applications: 96, approved: 72, rejected: 18 },
        { month: 'Jun', applications: 105, approved: 78, rejected: 22 }
      ]
    },
    statusDistribution: {
      approved: 45,
      pending: 30,
      rejected: 15,
      underReview: 10
    },
    sscWorkflow: {
      documentVerification: 45,
      financialReview: 32,
      academicReview: 28,
      finalApproval: 15
    },
    scholarshipCategories: {
      'Merit Scholarship': 456,
      'Need-Based Scholarship': 321,
      'Special Program': 234,
      'Renewal': 236
    },
    recentActivities: [
      {
        id: 1,
        type: 'application_approved',
        title: 'Application Approved',
        description: 'APP-2024-000123 approved for John Doe',
        timestamp: '2 minutes ago',
        icon: CheckCircle,
        color: 'text-green-600'
      },
      {
        id: 2,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        description: 'Interview scheduled for Jane Smith on Dec 15, 2024',
        timestamp: '15 minutes ago',
        icon: Calendar,
        color: 'text-blue-600'
      },
      {
        id: 3,
        type: 'document_uploaded',
        title: 'Document Uploaded',
        description: 'New document uploaded for APP-2024-000124',
        timestamp: '1 hour ago',
        icon: FileText,
        color: 'text-purple-600'
      },
      {
        id: 4,
        type: 'payment_disbursed',
        title: 'Payment Disbursed',
        description: '₱25,000 disbursed to Maria Garcia',
        timestamp: '2 hours ago',
        icon: DollarSign,
        color: 'text-green-600'
      },
      {
        id: 5,
        type: 'application_rejected',
        title: 'Application Rejected',
        description: 'APP-2024-000125 rejected - incomplete documents',
        timestamp: '3 hours ago',
        icon: XCircle,
        color: 'text-red-600'
      }
    ],
    topSchools: [
      { name: 'University of the Philippines', applications: 156, approved: 98 },
      { name: 'Ateneo de Manila University', applications: 134, approved: 89 },
      { name: 'De La Salle University', applications: 98, approved: 67 },
      { name: 'University of Santo Tomas', applications: 87, approved: 54 },
      { name: 'Polytechnic University', applications: 76, approved: 45 }
    ]
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDashboardData(mockDashboardData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return <StandardLoading variant="module" module="dashboard" message="Loading dashboard..." />;
  }

  const { overview, applicationTrends, statusDistribution, sscWorkflow, scholarshipCategories, recentActivities, topSchools } = dashboardData;

  return (
    <AnimatedContainer variant="page" className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">ESM Dashboard</h1>
            <p className="text-blue-100 text-lg">
              Education & Scholarship Management System - GoServePH
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Last updated: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm">System Status: Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <AnimatedGrid columns={4} staggerDelay={0.1}>
        <AnimatedStatsCard
          title="Total Applications"
          value={overview.totalApplications.toLocaleString()}
          icon={FileText}
          color="blue"
          index={0}
        />
        <AnimatedStatsCard
          title="Approved Applications"
          value={overview.approvedApplications.toLocaleString()}
          icon={CheckCircle}
          color="green"
          index={1}
        />
        <AnimatedStatsCard
          title="Pending Review"
          value={overview.pendingReview.toLocaleString()}
          icon={Clock}
          color="yellow"
          index={2}
        />
        <AnimatedStatsCard
          title="Total Budget"
          value={`₱${(overview.totalBudget / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          color="emerald"
          index={3}
        />
      </AnimatedGrid>

      {/* Secondary Metrics */}
      <AnimatedGrid columns={4} staggerDelay={0.1}>
        <AnimatedStatsCard
          title="Active Students"
          value={overview.activeStudents.toLocaleString()}
          icon={Users}
          color="indigo"
          index={0}
        />
        <AnimatedStatsCard
          title="Partner Schools"
          value={overview.partnerSchools.toLocaleString()}
          icon={School}
          color="purple"
          index={1}
        />
        <AnimatedStatsCard
          title="SSC Reviews"
          value={overview.sscReviews.toLocaleString()}
          icon={Award}
          color="orange"
          index={2}
        />
        <AnimatedStatsCard
          title="Interviews Scheduled"
          value={overview.interviewsScheduled.toLocaleString()}
          icon={Calendar}
          color="pink"
          index={3}
        />
      </AnimatedGrid>

      {/* Charts and Analytics */}
      <AnimatedGrid columns={2} staggerDelay={0.1}>
        <ChartCard
          title="Application Trends"
          subtitle="Monthly application submissions and approvals"
          type="line"
          data={{
            labels: applicationTrends.monthly.map(item => item.month),
            datasets: [
              {
                label: 'Applications',
                data: applicationTrends.monthly.map(item => item.applications),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
              },
              {
                label: 'Approved',
                data: applicationTrends.monthly.map(item => item.approved),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4
              }
            ]
          }}
        />
        <ChartCard
          title="Application Status Distribution"
          subtitle="Current status breakdown"
          type="doughnut"
          data={{
            labels: ['Approved', 'Pending', 'Rejected', 'Under Review'],
            datasets: [{
              data: [statusDistribution.approved, statusDistribution.pending, statusDistribution.rejected, statusDistribution.underReview],
              backgroundColor: [
                'rgb(34, 197, 94)',
                'rgb(251, 191, 36)',
                'rgb(239, 68, 68)',
                'rgb(59, 130, 246)'
              ]
            }]
          }}
        />
      </AnimatedGrid>

      {/* SSC Workflow and Scholarship Categories */}
      <AnimatedGrid columns={2} staggerDelay={0.1}>
        <ChartCard
          title="SSC Review Workflow"
          subtitle="Applications in each review stage"
          type="bar"
          data={{
            labels: ['Document Verification', 'Financial Review', 'Academic Review', 'Final Approval'],
            datasets: [{
              label: 'Applications',
              data: [sscWorkflow.documentVerification, sscWorkflow.financialReview, sscWorkflow.academicReview, sscWorkflow.finalApproval],
              backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(251, 191, 36, 0.8)',
                'rgba(168, 85, 247, 0.8)'
              ]
            }]
          }}
        />
        <ChartCard
          title="Scholarship Categories"
          subtitle="Distribution by scholarship type"
          type="pie"
          data={{
            labels: Object.keys(scholarshipCategories),
            datasets: [{
              data: Object.values(scholarshipCategories),
              backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(251, 191, 36, 0.8)',
                'rgba(168, 85, 247, 0.8)'
              ]
            }]
          }}
        />
      </AnimatedGrid>

      {/* Bottom Section */}
      <AnimatedGrid columns={3} staggerDelay={0.1}>
        <RecentActivities activities={recentActivities} />
        <PerformanceMetrics />
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Partner Schools</h3>
          <div className="space-y-4">
            {topSchools.map((school, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{school.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {school.applications} applications, {school.approved} approved
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.round((school.approved / school.applications) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500">approval rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedGrid>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.hash = '#scholarship/application'}
            className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>Review Applications</span>
          </button>
          <button 
            onClick={() => window.location.hash = '#scholarship/ssc'}
            className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <Award className="w-5 h-5" />
            <span>SSC Reviews</span>
          </button>
          <button 
            onClick={() => window.location.hash = '#partner-school'}
            className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <School className="w-5 h-5" />
            <span>Partner Schools</span>
          </button>
          <button 
            onClick={() => window.location.hash = '#user-management'}
            className="flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>User Management</span>
          </button>
        </div>
      </div>
    </AnimatedContainer>
  );
}

export default DashboardOverview;