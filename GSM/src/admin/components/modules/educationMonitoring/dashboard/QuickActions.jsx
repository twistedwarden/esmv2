/**
 * Quick Actions - Quick access to common tasks
 */

import React from 'react';
import { 
  FileText, 
  Download, 
  BarChart3, 
  Users, 
  Settings,
  RefreshCw,
  Filter,
  Calendar,
  BookOpen,
  TrendingUp
} from 'lucide-react';

const QuickActions = ({ onAction }) => {
  const actions = [
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create academic performance report',
      icon: FileText,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white'
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download data in various formats',
      icon: Download,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white'
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'Open detailed analytics dashboard',
      icon: BarChart3,
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-white'
    },
    {
      id: 'manage-students',
      title: 'Manage Students',
      description: 'Access student registry',
      icon: Users,
      color: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-white'
    },
    {
      id: 'refresh-data',
      title: 'Refresh Data',
      description: 'Update all metrics and charts',
      icon: RefreshCw,
      color: 'bg-gray-500 hover:bg-gray-600',
      textColor: 'text-white'
    },
    {
      id: 'filter-data',
      title: 'Filter Data',
      description: 'Apply filters to current view',
      icon: Filter,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      textColor: 'text-white'
    },
    {
      id: 'schedule-report',
      title: 'Schedule Report',
      description: 'Set up automated reports',
      icon: Calendar,
      color: 'bg-pink-500 hover:bg-pink-600',
      textColor: 'text-white'
    },
    {
      id: 'program-analysis',
      title: 'Program Analysis',
      description: 'Analyze program effectiveness',
      icon: BookOpen,
      color: 'bg-cyan-500 hover:bg-cyan-600',
      textColor: 'text-white'
    },
    {
      id: 'trend-analysis',
      title: 'Trend Analysis',
      description: 'View historical trends',
      icon: TrendingUp,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      textColor: 'text-white'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure dashboard settings',
      icon: Settings,
      color: 'bg-gray-600 hover:bg-gray-700',
      textColor: 'text-white'
    }
  ];

  const handleAction = (actionId) => {
    if (onAction) {
      onAction(actionId);
    } else {
      // Default actions
      switch (actionId) {
        case 'generate-report':
          // Navigate to reports page
          window.location.hash = '#emr-reports';
          break;
        case 'view-analytics':
          // Navigate to analytics page
          window.location.hash = '#emr-analytics';
          break;
        case 'manage-students':
          // Navigate to student registry
          window.location.hash = '#studentRegistry-overview';
          break;
        case 'refresh-data':
          // Refresh the page
          window.location.reload();
          break;
        default:
          console.log(`Action ${actionId} clicked`);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {actions.length} actions available
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id)}
            className={`${action.color} ${action.textColor} rounded-lg p-4 text-left transition-all duration-200 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <div className="flex items-center mb-2">
              <action.icon className="h-5 w-5 mr-2" />
              <span className="font-medium text-sm">{action.title}</span>
            </div>
            <p className="text-xs opacity-90">{action.description}</p>
          </button>
        ))}
      </div>

      {/* Recent Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Recent Actions
        </h4>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span>Last report generated 2 hours ago</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span>Data refreshed 30 minutes ago</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
            <span>Analytics viewed 1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
