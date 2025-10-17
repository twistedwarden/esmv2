import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
// Analytics component with comprehensive performance data
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { educationDataService } from '../shared/DataAggregator';

const PerformanceAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: '2024',
    program: 'all',
    school: 'all',
    view: 'overview'
  });
  const [visibleCharts, setVisibleCharts] = useState({
    enrollment: true,
    gpa: true,
    programs: true,
    yearLevels: true,
    trends: true
  });

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await educationDataService.getAcademicOverview(filters);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleChartVisibility = (chart) => {
    setVisibleCharts(prev => ({
      ...prev,
      [chart]: !prev[chart]
    }));
  };

  const exportAnalyticsData = () => {
    if (!analyticsData) return;
    
    const csvContent = generateAnalyticsCSV(analyticsData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const generateAnalyticsCSV = (data) => {
    const headers = ['Metric', 'Value', 'Category', 'Year'];
    const rows = [];
    
    // Add program stats
    data.metrics.programStats.forEach(program => {
      rows.push(['Program Students', program.totalStudents, program.name, filters.year]);
      rows.push(['Program GPA', program.averageGPA, program.name, filters.year]);
      rows.push(['Program Completion', program.completionRate, program.name, filters.year]);
    });
    
    // Add overall metrics
    rows.push(['Total Students', data.metrics.totalStudents, 'Overall', filters.year]);
    rows.push(['Average GPA', data.metrics.averageGPA, 'Overall', filters.year]);
    rows.push(['Graduation Rate', data.metrics.graduationRate, 'Overall', filters.year]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const prepareChartData = (data) => {
    if (!data) return {};

    // Prepare enrollment trend data
    const enrollmentData = data.metrics.trends.map(trend => ({
      year: trend.year,
      students: trend.totalRecords,
      gpa: trend.averageGPA
    }));

    // Prepare program distribution data
    const programData = data.metrics.programStats.map((program, index) => ({
      name: program.name,
      value: program.totalStudents,
      gpa: program.averageGPA,
      completion: program.completionRate,
      color: COLORS[index % COLORS.length]
    }));

    // Prepare GPA distribution data
    const gpaDistribution = Object.entries(data.metrics.gpaDistribution).map(([grade, count]) => ({
      name: grade,
      value: count,
      percentage: ((count / data.metrics.totalStudents) * 100).toFixed(1)
    }));

    // Prepare year level distribution (mock data for now)
    const yearLevelData = [
      { name: '1st Year', value: Math.floor(data.metrics.totalStudents * 0.25) },
      { name: '2nd Year', value: Math.floor(data.metrics.totalStudents * 0.30) },
      { name: '3rd Year', value: Math.floor(data.metrics.totalStudents * 0.25) },
      { name: '4th Year', value: Math.floor(data.metrics.totalStudents * 0.20) }
    ];

    return {
      enrollmentData,
      programData,
      gpaDistribution,
      yearLevelData
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-orange-500" />
          <span className="text-gray-600">Loading analytics data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={loadAnalyticsData}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const chartData = prepareChartData(analyticsData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
          <p className="text-gray-600">Comprehensive academic performance analysis and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportAnalyticsData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={loadAnalyticsData}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="all">All Years</option>
          </select>

          <select
            value={filters.program}
            onChange={(e) => handleFilterChange('program', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All Programs</option>
            {analyticsData?.metrics?.programStats?.map(program => (
              <option key={program.name} value={program.name}>
                {program.name}
              </option>
            ))}
          </select>

          <select
            value={filters.school}
            onChange={(e) => handleFilterChange('school', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All Schools</option>
            {analyticsData?.metrics?.schoolStats?.map(school => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>

          <select
            value={filters.view}
            onChange={(e) => handleFilterChange('view', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="overview">Overview</option>
            <option value="detailed">Detailed</option>
            <option value="comparative">Comparative</option>
          </select>
        </div>
      </div>

      {/* Chart Visibility Controls */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-wrap gap-4">
          <span className="text-sm font-medium text-gray-700">Show Charts:</span>
          {Object.entries(visibleCharts).map(([chart, visible]) => (
            <button
              key={chart}
              onClick={() => toggleChartVisibility(chart)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                visible 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="capitalize">{chart.replace(/([A-Z])/g, ' $1').trim()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData?.metrics?.totalStudents || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average GPA</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData?.metrics?.averageGPA?.toFixed(2) || 'N/A'}
              </p>
            </div>
            <Award className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Graduation Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData?.metrics?.graduationRate?.toFixed(1) || 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Programs</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData?.metrics?.programStats?.length || 0}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trends */}
        {visibleCharts.enrollment && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData.enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="students" fill="#3b82f6" name="Students" />
                  <Line yAxisId="right" type="monotone" dataKey="gpa" stroke="#f97316" strokeWidth={3} name="GPA" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Program Distribution */}
        {visibleCharts.programs && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.programData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.programData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, 'Students']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* GPA Distribution */}
        {visibleCharts.gpa && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">GPA Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.gpaDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [value, 'Students']} />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Year Level Distribution */}
        {visibleCharts.yearLevels && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Year Level Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.yearLevelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [value, 'Students']} />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Performance Trends */}
      {visibleCharts.trends && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} name="Students" />
                <Line yAxisId="right" type="monotone" dataKey="gpa" stroke="#f97316" strokeWidth={3} name="GPA" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Program Performance Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Performance Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg GPA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData?.metrics?.programStats?.map((program, index) => {
                const performance = program.completionRate >= 80 ? 'Excellent' : 
                                 program.completionRate >= 60 ? 'Good' : 
                                 program.completionRate >= 40 ? 'Fair' : 'Needs Improvement';
                const performanceColor = program.completionRate >= 80 ? 'text-green-600' : 
                                       program.completionRate >= 60 ? 'text-blue-600' : 
                                       program.completionRate >= 40 ? 'text-yellow-600' : 'text-red-600';
                
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {program.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {program.totalStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {program.averageGPA}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {program.completionRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${performanceColor}`}>
                        {performance}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Insights */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
        <h3 className="text-lg font-semibold text-orange-900 mb-4">Analytics Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-orange-800">Key Findings</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Total of {analyticsData?.metrics?.totalStudents || 0} students across {analyticsData?.metrics?.programStats?.length || 0} programs</li>
              <li>• Average GPA of {analyticsData?.metrics?.averageGPA?.toFixed(2) || 'N/A'} across all programs</li>
              <li>• Graduation rate of {analyticsData?.metrics?.graduationRate?.toFixed(1) || 0}% for current cohort</li>
              <li>• {analyticsData?.metrics?.programStats?.filter(p => p.completionRate >= 80).length || 0} programs performing excellently</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-orange-800">Recommendations</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Focus on programs with completion rates below 60%</li>
              <li>• Consider expanding high-performing programs</li>
              <li>• Implement additional support for struggling students</li>
              <li>• Regular monitoring of GPA trends and patterns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
