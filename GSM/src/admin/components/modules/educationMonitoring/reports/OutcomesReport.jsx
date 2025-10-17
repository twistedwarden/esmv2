/**
 * Outcomes Report - Program effectiveness and educational outcomes
 */

import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Award, 
  Users, 
  BookOpen,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToastContext } from '../../../../../components/providers/ToastProvider';
import { educationDataService } from '../shared/DataAggregator';
import { 
  ProgramPerformanceChart, 
  TrendAreaChart, 
  DistributionPieChart,
  KPICard,
  LoadingChart,
  EmptyChart 
} from '../shared/ChartComponents';
import { exportToPDF, generateReportData } from './ExportService';

const OutcomesReport = () => {
  const { showSuccess, showError } = useToastContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: '1y',
    program: 'all',
    school: 'all'
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await educationDataService.getAcademicOverview(filters);
      setData(result);
    } catch (error) {
      console.error('Error fetching outcomes data:', error);
      showError('Failed to load outcomes data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!data) return;
    
    const reportData = generateReportData(data.metrics, 'program-outcomes');
    await exportToPDF(reportData, 'program-outcomes', {
      title: 'Program Outcomes Report',
      subtitle: 'Educational effectiveness and completion analysis'
    });
    showSuccess('Outcomes report exported successfully');
  };

  const calculateOutcomes = (metrics) => {
    if (!metrics) return null;

    const outcomes = {
      overallEffectiveness: 0,
      programCount: metrics.programStats?.length || 0,
      totalStudents: metrics.totalStudents || 0,
      averageCompletionRate: 0,
      highPerformingPrograms: 0,
      needsImprovementPrograms: 0,
      retentionRate: 0,
      graduationRate: metrics.graduationRate || 0
    };

    if (metrics.programStats && metrics.programStats.length > 0) {
      const completionRates = metrics.programStats.map(p => parseFloat(p.completionRate) || 0);
      outcomes.averageCompletionRate = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
      
      const gpas = metrics.programStats.map(p => parseFloat(p.averageGPA) || 0);
      outcomes.overallEffectiveness = gpas.reduce((sum, gpa) => sum + gpa, 0) / gpas.length;
      
      outcomes.highPerformingPrograms = metrics.programStats.filter(p => 
        parseFloat(p.averageGPA) >= 3.5 && parseFloat(p.completionRate) >= 80
      ).length;
      
      outcomes.needsImprovementPrograms = metrics.programStats.filter(p => 
        parseFloat(p.averageGPA) < 3.0 || parseFloat(p.completionRate) < 70
      ).length;
    }

    if (metrics.totalStudents && metrics.activeStudents) {
      outcomes.retentionRate = (metrics.activeStudents / metrics.totalStudents) * 100;
    }

    return outcomes;
  };

  const outcomes = calculateOutcomes(data?.metrics);

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
          <span className="text-lg text-gray-600 dark:text-gray-400">
            Loading outcomes report...
          </span>
        </div>
      </div>
    );
  }

  if (!data || !outcomes) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyChart message="No outcomes data available" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500 rounded-lg flex-shrink-0">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Program Outcomes Report
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Educational effectiveness and completion analysis
            </p>
          </div>
        </div>
        
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Key Outcomes KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard
          title="Overall Effectiveness"
          value={outcomes.overallEffectiveness.toFixed(2)}
          subtitle="Average program performance"
          icon={Target}
          color="text-blue-600"
          trend={outcomes.overallEffectiveness >= 3.5 ? 5.2 : outcomes.overallEffectiveness >= 3.0 ? 2.1 : -1.5}
        />
        <KPICard
          title="Average Completion Rate"
          value={`${outcomes.averageCompletionRate.toFixed(1)}%`}
          subtitle="Program completion success"
          icon={Award}
          color="text-green-600"
          trend={outcomes.averageCompletionRate >= 80 ? 3.8 : outcomes.averageCompletionRate >= 70 ? 1.2 : -2.3}
        />
        <KPICard
          title="Retention Rate"
          value={`${outcomes.retentionRate.toFixed(1)}%`}
          subtitle="Student retention"
          icon={Users}
          color="text-purple-600"
          trend={outcomes.retentionRate >= 90 ? 4.1 : outcomes.retentionRate >= 80 ? 1.8 : -1.2}
        />
        <KPICard
          title="Graduation Rate"
          value={`${outcomes.graduationRate.toFixed(1)}%`}
          subtitle="Overall graduation success"
          icon={BookOpen}
          color="text-orange-600"
          trend={outcomes.graduationRate >= 80 ? 6.2 : outcomes.graduationRate >= 60 ? 2.5 : -3.1}
        />
      </div>

      {/* Program Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Program Performance Comparison
          </h3>
          <ProgramPerformanceChart 
            data={data.metrics?.programStats?.map(program => ({
              name: program.name.length > 15 ? program.name.substring(0, 15) + '...' : program.name,
              fullName: program.name,
              averageGPA: parseFloat(program.averageGPA) || 0,
              totalStudents: program.totalStudents,
              completionRate: parseFloat(program.completionRate) || 0
            })) || []} 
          />
        </div>

        {/* Program Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Program Distribution
          </h3>
          <DistributionPieChart
            data={data.metrics?.programStats?.map(program => ({
              name: program.name,
              students: program.totalStudents,
              percentage: ((program.totalStudents / data.metrics.totalStudents) * 100).toFixed(1)
            })) || []}
            dataKey="students"
            nameKey="name"
          />
        </div>
      </div>

      {/* Performance Trends */}
      {data.metrics?.trends && data.metrics.trends.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Trends Over Time
          </h3>
          <TrendAreaChart 
            data={data.metrics.trends.map(trend => ({
              year: trend.year,
              averageGPA: parseFloat(trend.averageGPA) || 0,
              totalRecords: trend.totalRecords
            }))}
            dataKey="averageGPA"
            name="Average GPA"
          />
        </div>
      )}

      {/* Program Effectiveness Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Program Effectiveness Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{outcomes.highPerformingPrograms}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">High Performing Programs</div>
            <div className="text-xs text-gray-500 mt-1">GPA ≥ 3.5 & Completion ≥ 80%</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <BarChart3 className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">
              {data.metrics?.programStats?.length - outcomes.highPerformingPrograms - outcomes.needsImprovementPrograms || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Moderate Programs</div>
            <div className="text-xs text-gray-500 mt-1">Average performance</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{outcomes.needsImprovementPrograms}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Need Improvement</div>
            <div className="text-xs text-gray-500 mt-1">GPA &lt; 3.0 or Completion &lt; 70%</div>
          </div>
        </div>

        {/* Detailed Program Table */}
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
                  Effectiveness
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.metrics?.programStats?.map((program, index) => {
                const gpa = parseFloat(program.averageGPA) || 0;
                const completion = parseFloat(program.completionRate) || 0;
                const isHighPerforming = gpa >= 3.5 && completion >= 80;
                const needsImprovement = gpa < 3.0 || completion < 70;
                
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {program.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {program.totalStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {gpa.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {completion.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {((gpa + completion / 100) / 2).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isHighPerforming
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : needsImprovement
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {isHighPerforming ? 'Excellent' : 
                         needsImprovement ? 'Needs Improvement' : 'Good'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OutcomesReport;
