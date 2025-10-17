/**
 * Reusable Chart Components for Education Monitoring
 */

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// Color palette for consistent theming
export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  warning: '#F97316',
  info: '#06B6D4',
  success: '#22C55E',
  purple: '#8B5CF6',
  pink: '#EC4899',
  gray: '#6B7280'
};

export const CHART_COLOR_ARRAY = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.accent,
  CHART_COLORS.danger,
  CHART_COLORS.warning,
  CHART_COLORS.info,
  CHART_COLORS.success,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
  CHART_COLORS.gray
];

/**
 * Custom Tooltip Component
 */
export const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatter ? formatter(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * GPA Distribution Bar Chart
 */
export const GPADistributionChart = ({ data, className = "" }) => {
  const chartData = Object.entries(data).map(([grade, count]) => ({
    grade,
    count,
    percentage: ((count / Object.values(data).reduce((sum, val) => sum + val, 0)) * 100).toFixed(1)
  }));

  return (
    <div className={`w-full h-80 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="grade" 
            className="text-xs"
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis className="text-xs" />
          <Tooltip 
            content={<CustomTooltip formatter={(value) => `${value} students`} />}
          />
          <Bar 
            dataKey="count" 
            fill={CHART_COLORS.primary}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Program Performance Bar Chart
 */
export const ProgramPerformanceChart = ({ data, className = "" }) => {
  return (
    <div className={`w-full h-80 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          layout="horizontal"
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis type="number" domain={[0, 4]} className="text-xs" />
          <YAxis dataKey="name" type="category" width={120} className="text-xs" />
          <Tooltip 
            content={<CustomTooltip formatter={(value) => value.toFixed(2)} />}
          />
          <Bar 
            dataKey="averageGPA" 
            fill={CHART_COLORS.secondary}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Trend Line Chart
 */
export const TrendLineChart = ({ data, dataKey, name, className = "" }) => {
  return (
    <div className={`w-full h-80 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="year" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip 
            content={<CustomTooltip formatter={(value) => value.toFixed(2)} />}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={CHART_COLORS.primary}
            strokeWidth={3}
            dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: CHART_COLORS.primary, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Area Chart for Trends
 */
export const TrendAreaChart = ({ data, dataKey, name, className = "" }) => {
  return (
    <div className={`w-full h-80 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="year" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip 
            content={<CustomTooltip formatter={(value) => value.toFixed(2)} />}
          />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={CHART_COLORS.primary}
            fill={CHART_COLORS.primary}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Pie Chart for Distribution
 */
export const DistributionPieChart = ({ data, dataKey, nameKey, className = "" }) => {
  return (
    <div className={`w-full h-80 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} (${percentage}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]} />
            ))}
          </Pie>
          <Tooltip 
            content={<CustomTooltip formatter={(value) => `${value} students`} />}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Multi-line Chart for Comparisons
 */
export const ComparisonLineChart = ({ data, lines, className = "" }) => {
  return (
    <div className={`w-full h-80 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="year" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip 
            content={<CustomTooltip formatter={(value) => value.toFixed(2)} />}
          />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]}
              strokeWidth={2}
              dot={{ fill: CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * KPI Card Component
 */
export const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = CHART_COLORS.primary,
  trend,
  className = ""
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="mt-2 flex items-center text-xs">
              <span className={`${trend > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );
};

/**
 * Loading Chart Component
 */
export const LoadingChart = ({ className = "" }) => {
  return (
    <div className={`w-full h-80 flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-500">Loading chart...</p>
      </div>
    </div>
  );
};

/**
 * Empty State Component
 */
export const EmptyChart = ({ message = "No data available", className = "" }) => {
  return (
    <div className={`w-full h-80 flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
};

// Export Recharts components with expected names
export { BarChart, LineChart, PieChart, AreaChart } from 'recharts';

