import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  FileCheck,
  DollarSign,
  Calendar,
  Award,
  BarChart3,
  Settings
} from 'lucide-react';

function SSCOverview() {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    underAppeal: 0,
    totalMembers: 0,
    activeMembers: 0,
    averageProcessingTime: 0,
    thisMonthDecisions: 0,
    pendingAppeals: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Mock data - replace with actual API calls
        setStats({
          totalApplications: 1247,
          pendingReview: 89,
          approved: 892,
          rejected: 234,
          underAppeal: 32,
          totalMembers: 12,
          activeMembers: 10,
          averageProcessingTime: 3.2,
          thisMonthDecisions: 156,
          pendingAppeals: 8
        });

        setRecentActivities([
          {
            id: 1,
            type: 'approval',
            applicationId: 'APP-2024-001',
            member: 'Dr. Maria Santos',
            timestamp: '2024-01-15T10:30:00Z',
            status: 'approved'
          },
          {
            id: 2,
            type: 'review',
            applicationId: 'APP-2024-002',
            member: 'Prof. Juan Cruz',
            timestamp: '2024-01-15T09:15:00Z',
            status: 'under_review'
          },
          {
            id: 3,
            type: 'appeal',
            applicationId: 'APP-2024-003',
            member: 'Dr. Ana Reyes',
            timestamp: '2024-01-14T16:45:00Z',
            status: 'appeal_received'
          }
        ]);
      } catch (err) {
        setError('Failed to load SSC data');
        console.error('Error loading SSC data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: 'blue',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Pending Review',
      value: stats.pendingReview,
      icon: Clock,
      color: 'yellow',
      change: '-5%',
      changeType: 'negative'
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'green',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      color: 'red',
      change: '+3%',
      changeType: 'positive'
    },
    {
      title: 'Under Appeal',
      value: stats.underAppeal,
      icon: AlertTriangle,
      color: 'orange',
      change: '+2%',
      changeType: 'positive'
    },
    {
      title: 'Active Members',
      value: `${stats.activeMembers}/${stats.totalMembers}`,
      icon: Users,
      color: 'purple',
      change: '100%',
      changeType: 'neutral'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200'
    };
    return colors[color] || colors.blue;
  };

  const getChangeColor = (changeType) => {
    const colors = {
      positive: 'text-green-600',
      negative: 'text-red-600',
      neutral: 'text-gray-600'
    };
    return colors[changeType] || colors.neutral;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
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
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SSC Dashboard</h1>
        <p className="text-gray-600">Student Services Committee - Application Review & Decision Management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className={`text-sm ${getChangeColor(card.changeType)}`}>
                    {card.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getColorClasses(card.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pending Applications */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Applications</h3>
            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {stats.pendingReview} pending
            </span>
          </div>
          <p className="text-gray-600 mb-4">
            Applications awaiting SSC review and decision
          </p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
            Review Applications
          </button>
        </div>

        {/* Appeals */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Appeals</h3>
            <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {stats.pendingAppeals} pending
            </span>
          </div>
          <p className="text-gray-600 mb-4">
            Applications flagged for appeal by students
          </p>
          <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors">
            Review Appeals
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        </div>
        <div className="p-6">
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activities</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {activity.type === 'approval' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {activity.type === 'review' && <Clock className="h-5 w-5 text-yellow-500" />}
                      {activity.type === 'appeal' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type === 'approval' && 'Application approved'}
                        {activity.type === 'review' && 'Application under review'}
                        {activity.type === 'appeal' && 'Appeal received'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.applicationId} • {activity.member}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SSCOverview;
