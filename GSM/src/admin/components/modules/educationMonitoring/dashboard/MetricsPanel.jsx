/**
 * Metrics Panel - KPI cards with real-time data
 */

import React from 'react';
import { 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Award,
  BookOpen,
  School,
  Target,
  BarChart3
} from 'lucide-react';
import { KPICard } from '../shared/ChartComponents';

const MetricsPanel = ({ metrics, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
              <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div className="h-6 w-6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="col-span-full flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <BarChart3 className="h-12 w-12" />
            </div>
            <p className="mt-2 text-sm text-gray-500">No metrics data available</p>
          </div>
        </div>
      </div>
    );
  }

  const kpiData = [
    {
      title: 'Total Students',
      value: metrics.totalStudents?.toLocaleString() || '0',
      subtitle: 'All enrolled students',
      icon: Users,
      color: 'text-blue-600',
      trend: 5.2
    },
    {
      title: 'Active Students',
      value: metrics.activeStudents?.toLocaleString() || '0',
      subtitle: 'Currently enrolled',
      icon: BookOpen,
      color: 'text-green-600',
      trend: 3.1
    },
    {
      title: 'Average GPA',
      value: metrics.averageGPA?.toFixed(2) || '0.00',
      subtitle: 'Overall performance',
      icon: TrendingUp,
      color: 'text-purple-600',
      trend: 0.2
    },
    {
      title: 'Graduation Rate',
      value: `${metrics.graduationRate?.toFixed(1) || '0.0'}%`,
      subtitle: 'Success rate',
      icon: GraduationCap,
      color: 'text-orange-600',
      trend: 2.8
    },
    {
      title: 'Graduated Students',
      value: metrics.graduatedStudents?.toLocaleString() || '0',
      subtitle: 'Completed programs',
      icon: Award,
      color: 'text-emerald-600',
      trend: 8.5
    },
    {
      title: 'Programs Offered',
      value: metrics.programStats?.length?.toString() || '0',
      subtitle: 'Active programs',
      icon: School,
      color: 'text-indigo-600',
      trend: 0
    },
    {
      title: 'Partner Schools',
      value: metrics.schoolStats?.length?.toString() || '0',
      subtitle: 'Affiliated institutions',
      icon: School,
      color: 'text-cyan-600',
      trend: 1.2
    },
    {
      title: 'Success Rate',
      value: `${((metrics.activeStudents / metrics.totalStudents) * 100)?.toFixed(1) || '0.0'}%`,
      subtitle: 'Retention rate',
      icon: Target,
      color: 'text-pink-600',
      trend: 1.5
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpiData.slice(0, 4).map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            icon={kpi.icon}
            color={kpi.color}
            trend={kpi.trend}
          />
        ))}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpiData.slice(4).map((kpi, index) => (
          <KPICard
            key={index + 4}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            icon={kpi.icon}
            color={kpi.color}
            trend={kpi.trend}
          />
        ))}
      </div>

      {/* Program Performance Summary */}
      {metrics.programStats && metrics.programStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Program Performance Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.programStats.slice(0, 3).map((program, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {program.name}
                </h4>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Students:</span>
                    <span className="font-medium">{program.totalStudents}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Avg GPA:</span>
                    <span className="font-medium">{program.averageGPA}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Completion:</span>
                    <span className="font-medium">{program.completionRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsPanel;
