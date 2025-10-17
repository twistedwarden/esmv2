/**
 * Report Generator - Central report generation with filters and export options
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  Eye, 
  RefreshCw,
  Settings,
  BarChart3,
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToastContext } from '../../../../../components/providers/ToastProvider';
import { educationDataService } from '../shared/DataAggregator';
import { 
  exportToPDF, 
  exportToExcel, 
  exportToCSV, 
  generateReportData,
  exportAllFormats 
} from './ExportService';

const ReportGenerator = () => {
  const { showSuccess, showError } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  
  const [filters, setFilters] = useState({
    reportType: 'academic-performance',
    dateRange: '30d',
    yearLevel: 'all',
    program: 'all',
    school: 'all',
    includeCharts: true,
    includeSummary: true
  });

  const [availableData, setAvailableData] = useState({
    programs: [],
    schools: [],
    yearLevels: []
  });

  const reportTypes = [
    {
      id: 'academic-performance',
      name: 'Academic Performance Report',
      description: 'GPA distribution, program performance, and academic trends',
      icon: BarChart3,
      color: 'bg-blue-500'
    },
    {
      id: 'enrollment-statistics',
      name: 'Enrollment Statistics',
      description: 'Student enrollment by program, school, and demographics',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      id: 'student-progress',
      name: 'Student Progress Report',
      description: 'Individual student progress and academic trends',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      id: 'program-outcomes',
      name: 'Program Outcomes Report',
      description: 'Program effectiveness and completion rates',
      icon: GraduationCap,
      color: 'bg-orange-500'
    },
    {
      id: 'custom-report',
      name: 'Custom Report Builder',
      description: 'Create custom reports with selected metrics',
      icon: Settings,
      color: 'bg-gray-500'
    }
  ];

  useEffect(() => {
    loadAvailableData();
  }, []);

  const loadAvailableData = async () => {
    setLoading(true);
    try {
      const data = await educationDataService.getAcademicOverview();
      setAvailableData({
        programs: data.metrics?.programStats || [],
        schools: data.metrics?.schoolStats || [],
        yearLevels: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']
      });
    } catch (error) {
      console.error('Error loading available data:', error);
      showError('Failed to load available data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const data = await educationDataService.getAcademicOverview(filters);
      const report = generateReportData(data.metrics, filters.reportType, {
        includeCharts: filters.includeCharts,
        includeSummary: filters.includeSummary
      });
      
      setReportData(report);
      setPreviewData(report);
      showSuccess('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      showError('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (format) => {
    if (!reportData) {
      showError('Please generate a report first');
      return;
    }

    try {
      switch (format) {
        case 'pdf':
          await exportToPDF(reportData, filters.reportType, {
            title: reportTypes.find(r => r.id === filters.reportType)?.name,
            includeCharts: filters.includeCharts
          });
          showSuccess('PDF exported successfully');
          break;
        case 'excel':
          await exportToExcel(reportData, filters.reportType, {
            includeCharts: filters.includeCharts
          });
          showSuccess('Excel file exported successfully');
          break;
        case 'csv':
          exportToCSV(reportData, filters.reportType);
          showSuccess('CSV file exported successfully');
          break;
        case 'all':
          exportAllFormats(reportData, filters.reportType, {
            includeCharts: filters.includeCharts
          });
          showSuccess('All formats exported successfully');
          break;
        default:
          showError('Unknown export format');
      }
    } catch (error) {
      console.error('Export error:', error);
      showError(`Failed to export ${format.toUpperCase()}`);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500 rounded-lg flex-shrink-0">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Report Generator
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate and export education monitoring reports
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Report Type Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Report Type
            </h3>
            <div className="space-y-3">
              {reportTypes.map((report) => (
                <button
                  key={report.id}
                  onClick={() => handleFilterChange('reportType', report.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    filters.reportType === report.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${report.color}`}>
                      <report.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {report.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Filters
            </h3>
            <div className="space-y-4">
              <div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Year Level
                </label>
                <select
                  value={filters.yearLevel}
                  onChange={(e) => handleFilterChange('yearLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Year Levels</option>
                  {availableData.yearLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Program
                </label>
                <select
                  value={filters.program}
                  onChange={(e) => handleFilterChange('program', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Programs</option>
                  {availableData.programs.map((program, index) => (
                    <option key={index} value={program.name}>{program.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  School
                </label>
                <select
                  value={filters.school}
                  onChange={(e) => handleFilterChange('school', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Schools</option>
                  {availableData.schools.map((school, index) => (
                    <option key={index} value={school.name}>{school.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Options
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.includeCharts}
                  onChange={(e) => handleFilterChange('includeCharts', e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Include charts and graphs
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.includeSummary}
                  onChange={(e) => handleFilterChange('includeSummary', e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Include summary section
                </span>
              </label>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateReport}
            disabled={generating || loading}
            className="w-full flex items-center justify-center space-x-2 bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {generating ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
            <span>{generating ? 'Generating...' : 'Generate Report'}</span>
          </button>
        </div>

        {/* Report Preview and Export */}
        <div className="lg:col-span-2 space-y-6">
          {previewData ? (
            <>
              {/* Export Options */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Export Options
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Excel</span>
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('all')}
                    className="flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>All</span>
                  </button>
                </div>
              </div>

              {/* Report Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Report Preview
                </h3>
                
                {/* Summary */}
                {previewData.summary && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(previewData.summary).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{key}</div>
                          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tables Preview */}
                {previewData.tables && previewData.tables.length > 0 && (
                  <div className="space-y-6">
                    {previewData.tables.map((table, index) => (
                      <div key={index}>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          {table.title}
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                {table.columns.map((col, colIndex) => (
                                  <th
                                    key={colIndex}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                  >
                                    {col.header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {table.data.slice(0, 5).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {table.columns.map((col, colIndex) => (
                                    <td
                                      key={colIndex}
                                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                                    >
                                      {row[col.key] || '-'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {table.data.length > 5 && (
                            <div className="text-center py-2 text-sm text-gray-500">
                              ... and {table.data.length - 5} more rows
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No report generated
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Select a report type and click "Generate Report" to get started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
