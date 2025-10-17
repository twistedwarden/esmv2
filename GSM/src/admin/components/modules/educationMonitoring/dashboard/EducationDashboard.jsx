/**
 * Education Dashboard - Main unified dashboard component
 */

import React, { useState, useEffect } from 'react';
import { 
  FileBarChart, 
  RefreshCw, 
  Filter, 
  Calendar,
  Download,
  Settings,
  TrendingUp,
  Users,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { useToastContext } from '../../../../../components/providers/ToastProvider';
import { educationDataService } from '../shared/DataAggregator';
import MetricsPanel from './MetricsPanel';
import AcademicInsights from './AcademicInsights';
import QuickActions from './QuickActions';

const EducationDashboard = () => {
  const { showSuccess, showError } = useToastContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    yearLevel: 'all',
    program: 'all',
    school: 'all',
    dateRange: '30d'
  });

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [filters]);

  const fetchData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const result = await educationDataService.getAcademicOverview(filters);
      setData(result);
      
      if (!silent) {
        showSuccess('Education data loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching education data:', error);
      showError('Failed to load education data. Using cached data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    educationDataService.clearCache();
    fetchData();
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'generate-report':
        // Navigate to reports
        window.location.hash = '#emr-reports';
        break;
      case 'view-analytics':
        // Navigate to analytics
        window.location.hash = '#emr-analytics';
        break;
      case 'manage-students':
        // Navigate to student registry
        window.location.hash = '#studentRegistry-overview';
        break;
      case 'refresh-data':
        handleRefresh();
        break;
      default:
        console.log(`Quick action ${actionId} triggered`);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
          <span className="text-lg text-gray-600 dark:text-gray-400">
            Loading education dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500 rounded-lg flex-shrink-0">
            <FileBarChart className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Education Monitoring Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track academic performance and educational outcomes
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year Level
            </label>
            <select
              value={filters.yearLevel}
              onChange={(e) => handleFilterChange('yearLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Year Levels</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="5th Year">5th Year</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Program
            </label>
            <select
              value={filters.program}
              onChange={(e) => handleFilterChange('program', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Programs</option>
              {data?.programStats?.map((program, index) => (
                <option key={index} value={program.name}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              School
            </label>
            <select
              value={filters.school}
              onChange={(e) => handleFilterChange('school', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Schools</option>
              {data?.schoolStats?.map((school, index) => (
                <option key={index} value={school.name}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Panel */}
      <MetricsPanel metrics={data?.metrics} loading={loading} />

      {/* Academic Insights */}
      <AcademicInsights metrics={data?.metrics} loading={loading} />

      {/* Quick Actions */}
      <QuickActions onAction={handleQuickAction} />

      {/* Data Summary */}
      {data && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Data Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {data.students?.length || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Students
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data.academicRecords?.length || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Academic Records
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {data.schools?.length || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Partner Schools
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationDashboard;
