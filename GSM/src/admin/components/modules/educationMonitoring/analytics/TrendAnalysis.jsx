import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { educationDataService } from '../shared/DataAggregator';

const TrendAnalysis = () => {
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    yearRange: '3',
    program: 'all',
    school: 'all',
    metric: 'gpa'
  });

  useEffect(() => {
    loadTrendData();
  }, [filters]);

  const loadTrendData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await educationDataService.getAcademicOverview(filters);
      setTrendData(data);
    } catch (err) {
      console.error('Error loading trend data:', err);
      setError('Failed to load trend data');
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

  const exportTrendData = () => {
    if (!trendData) return;
    
    const csvContent = generateTrendCSV(trendData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trend-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const generateTrendCSV = (data) => {
    const headers = ['Year', 'Total Students', 'Average GPA', 'Graduation Rate', 'Program Count'];
    const rows = data.metrics.trends.map(trend => [
      trend.year,
      trend.totalRecords,
      trend.averageGPA,
      'N/A', // Graduation rate not in trends
      'N/A'  // Program count not in trends
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const calculateTrendDirection = (data) => {
    if (!data || data.length < 2) return 'stable';
    
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    
    if (latest.averageGPA > previous.averageGPA) return 'up';
    if (latest.averageGPA < previous.averageGPA) return 'down';
    return 'stable';
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-orange-500" />
          <span className="text-gray-600">Loading trend analysis...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={loadTrendData}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const trendDirection = calculateTrendDirection(trendData?.metrics?.trends || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trend Analysis</h2>
          <p className="text-gray-600">Historical performance trends and patterns</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportTrendData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={loadTrendData}
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
            value={filters.yearRange}
            onChange={(e) => handleFilterChange('yearRange', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="1">Last Year</option>
            <option value="3">Last 3 Years</option>
            <option value="5">Last 5 Years</option>
            <option value="all">All Time</option>
          </select>

          <select
            value={filters.program}
            onChange={(e) => handleFilterChange('program', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All Programs</option>
            {trendData?.metrics?.programStats?.map(program => (
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
            {trendData?.metrics?.schoolStats?.map(school => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>

          <select
            value={filters.metric}
            onChange={(e) => handleFilterChange('metric', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="gpa">Average GPA</option>
            <option value="enrollment">Enrollment</option>
            <option value="graduation">Graduation Rate</option>
          </select>
        </div>
      </div>

      {/* Trend Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Average GPA</p>
              <p className="text-2xl font-bold text-gray-900">
                {trendData?.metrics?.averageGPA?.toFixed(2) || 'N/A'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getTrendIcon(trendDirection)}
              <span className={`text-sm font-medium ${getTrendColor(trendDirection)}`}>
                {trendDirection === 'up' ? 'Improving' : trendDirection === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {trendData?.metrics?.totalStudents || 0}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Graduation Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {trendData?.metrics?.graduationRate?.toFixed(1) || 0}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">GPA Trend Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData?.metrics?.trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis domain={[0, 4]} />
                <Tooltip 
                  formatter={(value, name) => [value, 'GPA']}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="averageGPA" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollment Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData?.metrics?.trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, 'Students']}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <Legend />
                <Bar dataKey="totalRecords" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Program Performance Comparison */}
      {trendData?.metrics?.programStats && trendData.metrics.programStats.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Performance Comparison</h3>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trendData.metrics.programStats.map((program, index) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Trend Insights</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            • Average GPA has {trendDirection === 'up' ? 'improved' : trendDirection === 'down' ? 'declined' : 'remained stable'} over the selected period
          </p>
          <p>
            • Total enrollment shows {trendData?.metrics?.trends?.length > 0 ? 'consistent' : 'variable'} growth patterns
          </p>
          <p>
            • Program diversity includes {trendData?.metrics?.programStats?.length || 0} different academic programs
          </p>
          <p>
            • Data covers {trendData?.metrics?.trends?.length || 0} academic years of historical information
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysis;
