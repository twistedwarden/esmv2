/**
 * Academic Insights - Academic performance insights and charts
 */

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle,
  BookOpen,
  Award,
  Target
} from 'lucide-react';
import { 
  GPADistributionChart, 
  ProgramPerformanceChart, 
  TrendAreaChart,
  LoadingChart,
  EmptyChart 
} from '../shared/ChartComponents';

const AcademicInsights = ({ metrics, loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <LoadingChart />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <LoadingChart />
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <EmptyChart message="No academic data available" />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <EmptyChart message="No program data available" />
          </div>
        </div>
      </div>
    );
  }

  // Prepare GPA distribution data
  const gpaDistributionData = metrics.gpaDistribution || {};

  // Prepare program performance data
  const programPerformanceData = metrics.programStats?.map(program => ({
    name: program.name.length > 15 ? program.name.substring(0, 15) + '...' : program.name,
    fullName: program.name,
    averageGPA: parseFloat(program.averageGPA) || 0,
    totalStudents: program.totalStudents,
    completionRate: parseFloat(program.completionRate) || 0
  })) || [];

  // Prepare trend data
  const trendData = metrics.trends?.map(trend => ({
    year: trend.year,
    averageGPA: parseFloat(trend.averageGPA) || 0,
    totalRecords: trend.totalRecords
  })) || [];

  // Calculate insights
  const insights = calculateInsights(metrics);

  return (
    <div className="space-y-6">
      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-full ${insight.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                <insight.icon className={`h-5 w-5 ${insight.color}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {insight.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              GPA Distribution
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <BookOpen className="h-4 w-4 mr-1" />
              {Object.values(gpaDistributionData).reduce((sum, val) => sum + val, 0)} students
            </div>
          </div>
          <GPADistributionChart data={gpaDistributionData} />
        </div>

        {/* Program Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Program Performance
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <Award className="h-4 w-4 mr-1" />
              {programPerformanceData.length} programs
            </div>
          </div>
          <ProgramPerformanceChart data={programPerformanceData} />
        </div>
      </div>

      {/* Trend Analysis */}
      {trendData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Academic Performance Trends
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              {trendData.length} years of data
            </div>
          </div>
          <TrendAreaChart 
            data={trendData} 
            dataKey="averageGPA" 
            name="Average GPA"
          />
        </div>
      )}

      {/* Program Details Table */}
      {programPerformanceData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Program Details
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Avg GPA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {programPerformanceData.map((program, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {program.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {program.totalStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {program.averageGPA.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {program.completionRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        program.averageGPA >= 3.5 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : program.averageGPA >= 3.0
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {program.averageGPA >= 3.5 ? 'Excellent' : 
                         program.averageGPA >= 3.0 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Calculate key insights from metrics
 */
const calculateInsights = (metrics) => {
  const insights = [];

  // GPA Insight
  if (metrics.averageGPA) {
    if (metrics.averageGPA >= 3.5) {
      insights.push({
        title: 'Excellent Performance',
        description: `Average GPA of ${metrics.averageGPA.toFixed(2)}`,
        icon: CheckCircle,
        color: 'text-green-600'
      });
    } else if (metrics.averageGPA >= 3.0) {
      insights.push({
        title: 'Good Performance',
        description: `Average GPA of ${metrics.averageGPA.toFixed(2)}`,
        icon: TrendingUp,
        color: 'text-yellow-600'
      });
    } else {
      insights.push({
        title: 'Needs Attention',
        description: `Average GPA of ${metrics.averageGPA.toFixed(2)}`,
        icon: AlertCircle,
        color: 'text-red-600'
      });
    }
  }

  // Graduation Rate Insight
  if (metrics.graduationRate) {
    if (metrics.graduationRate >= 80) {
      insights.push({
        title: 'High Success Rate',
        description: `${metrics.graduationRate.toFixed(1)}% graduation rate`,
        icon: Award,
        color: 'text-green-600'
      });
    } else if (metrics.graduationRate >= 60) {
      insights.push({
        title: 'Moderate Success',
        description: `${metrics.graduationRate.toFixed(1)}% graduation rate`,
        icon: TrendingUp,
        color: 'text-yellow-600'
      });
    } else {
      insights.push({
        title: 'Low Success Rate',
        description: `${metrics.graduationRate.toFixed(1)}% graduation rate`,
        icon: TrendingDown,
        color: 'text-red-600'
      });
    }
  }

  // Program Diversity Insight
  if (metrics.programStats && metrics.programStats.length > 0) {
    insights.push({
      title: 'Program Diversity',
      description: `${metrics.programStats.length} active programs`,
      icon: BookOpen,
      color: 'text-blue-600'
    });
  }

  // Retention Rate Insight
  if (metrics.totalStudents && metrics.activeStudents) {
    const retentionRate = (metrics.activeStudents / metrics.totalStudents) * 100;
    if (retentionRate >= 90) {
      insights.push({
        title: 'Excellent Retention',
        description: `${retentionRate.toFixed(1)}% retention rate`,
        icon: Target,
        color: 'text-green-600'
      });
    } else if (retentionRate >= 75) {
      insights.push({
        title: 'Good Retention',
        description: `${retentionRate.toFixed(1)}% retention rate`,
        icon: TrendingUp,
        color: 'text-yellow-600'
      });
    } else {
      insights.push({
        title: 'Retention Concerns',
        description: `${retentionRate.toFixed(1)}% retention rate`,
        icon: AlertCircle,
        color: 'text-red-600'
      });
    }
  }

  return insights;
};

export default AcademicInsights;
