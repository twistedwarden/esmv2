import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Target, 
  Award, 
  Users, 
  TrendingUp,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { educationDataService } from '../shared/DataAggregator';

const ProgramEffectiveness = () => {
  const [effectivenessData, setEffectivenessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: '2024',
    program: 'all',
    school: 'all',
    metric: 'completion'
  });

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    loadEffectivenessData();
  }, [filters]);

  const loadEffectivenessData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await educationDataService.getAcademicOverview(filters);
      setEffectivenessData(data);
    } catch (err) {
      console.error('Error loading effectiveness data:', err);
      setError('Failed to load effectiveness data');
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

  const exportEffectivenessData = () => {
    if (!effectivenessData) return;
    
    const csvContent = generateEffectivenessCSV(effectivenessData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `program-effectiveness-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const generateEffectivenessCSV = (data) => {
    const headers = ['Program', 'Total Students', 'Average GPA', 'Completion Rate', 'Effectiveness Score'];
    const rows = data.metrics.programStats.map(program => [
      program.name,
      program.totalStudents,
      program.averageGPA,
      program.completionRate,
      calculateEffectivenessScore(program)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const calculateEffectivenessScore = (program) => {
    // Weighted score: 40% completion rate + 30% GPA + 30% student count (normalized)
    const completionWeight = 0.4;
    const gpaWeight = 0.3;
    const studentWeight = 0.3;
    
    const normalizedGPA = (program.averageGPA / 4.0) * 100; // Normalize GPA to 0-100
    const normalizedStudents = Math.min((program.totalStudents / 100) * 100, 100); // Cap at 100
    
    return Math.round(
      (program.completionRate * completionWeight) +
      (normalizedGPA * gpaWeight) +
      (normalizedStudents * studentWeight)
    );
  };

  const getEffectivenessLevel = (score) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-600', icon: CheckCircle };
    if (score >= 60) return { level: 'Good', color: 'text-blue-600', icon: Award };
    if (score >= 40) return { level: 'Fair', color: 'text-yellow-600', icon: AlertCircle };
    return { level: 'Needs Improvement', color: 'text-red-600', icon: XCircle };
  };

  const preparePieData = (programStats) => {
    return programStats.map((program, index) => ({
      name: program.name,
      value: calculateEffectivenessScore(program),
      students: program.totalStudents,
      gpa: program.averageGPA,
      completion: program.completionRate,
      color: COLORS[index % COLORS.length]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-orange-500" />
          <span className="text-gray-600">Loading program effectiveness data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={loadEffectivenessData}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const pieData = preparePieData(effectivenessData?.metrics?.programStats || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Program Effectiveness</h2>
          <p className="text-gray-600">Educational program performance and outcomes analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportEffectivenessData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={loadEffectivenessData}
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
            {effectivenessData?.metrics?.programStats?.map(program => (
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
            {effectivenessData?.metrics?.schoolStats?.map(school => (
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
            <option value="completion">Completion Rate</option>
            <option value="gpa">Average GPA</option>
            <option value="students">Student Count</option>
            <option value="overall">Overall Score</option>
          </select>
        </div>
      </div>

      {/* Effectiveness Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Programs</p>
              <p className="text-2xl font-bold text-gray-900">
                {effectivenessData?.metrics?.programStats?.length || 0}
              </p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {effectivenessData?.metrics?.programStats?.length > 0 
                  ? (effectivenessData.metrics.programStats.reduce((sum, p) => sum + parseFloat(p.completionRate), 0) / effectivenessData.metrics.programStats.length).toFixed(1)
                  : 0}%
              </p>
            </div>
            <Award className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg GPA</p>
              <p className="text-2xl font-bold text-gray-900">
                {effectivenessData?.metrics?.averageGPA?.toFixed(2) || 'N/A'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {effectivenessData?.metrics?.totalStudents || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program Effectiveness Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Effectiveness Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value}% effectiveness`,
                    props.payload.name
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Program Performance Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Performance Comparison</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={effectivenessData?.metrics?.programStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'averageGPA' ? value.toFixed(2) : `${value}%`,
                    name === 'averageGPA' ? 'GPA' : 'Completion Rate'
                  ]}
                />
                <Legend />
                <Bar dataKey="completionRate" fill="#3b82f6" name="Completion Rate" />
                <Bar dataKey="averageGPA" fill="#f97316" name="Average GPA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Program Details Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Program Analysis</h3>
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
                  Effectiveness Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {effectivenessData?.metrics?.programStats?.map((program, index) => {
                const score = calculateEffectivenessScore(program);
                const effectiveness = getEffectivenessLevel(score);
                const IconComponent = effectiveness.icon;
                
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {score}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <IconComponent className={`w-4 h-4 ${effectiveness.color}`} />
                        <span className={effectiveness.color}>
                          {effectiveness.level}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Program Improvement Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800">High Performing Programs</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {effectivenessData?.metrics?.programStats
                ?.filter(p => calculateEffectivenessScore(p) >= 80)
                .map(program => (
                  <li key={program.name}>• {program.name} - Consider expanding capacity</li>
                ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800">Programs Needing Attention</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {effectivenessData?.metrics?.programStats
                ?.filter(p => calculateEffectivenessScore(p) < 60)
                .map(program => (
                  <li key={program.name}>• {program.name} - Review curriculum and support systems</li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramEffectiveness;
