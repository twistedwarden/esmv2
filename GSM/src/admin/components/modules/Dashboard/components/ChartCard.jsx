import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

function ChartCard({ title, subtitle, icon: Icon, data, type }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const renderLineChart = () => {
        const maxValue = Math.max(...data.map(d => d.students));
        const minValue = Math.min(...data.map(d => d.students));
        const range = maxValue - minValue;

        return (
            <div className="h-64 relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between px-4 pb-8 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-full border-t border-slate-200/50 dark:border-slate-700/50" />
                    ))}
                </div>
                
                <div className="h-full flex items-end justify-between px-4 pb-4 gap-2">
                    {data.map((item, index) => {
                        const height = range > 0 ? ((item.students - minValue) / range) * 200 + 20 : 120;
                        const isHovered = hoveredIndex === index;
                        
                        return (
                            <div 
                                key={index} 
                                className="flex-1 flex flex-col items-center group"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {/* Value tooltip */}
                                <div className={`mb-2 px-2 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-lg transition-all duration-200 ${
                                    isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                                }`}>
                                    {item.students.toLocaleString()}
                                </div>
                                
                                {/* Bar */}
                                <div className="relative w-full flex justify-center">
                                    <div
                                        className={`w-full max-w-[40px] bg-gradient-to-t from-blue-500 via-blue-400 to-cyan-400 rounded-t-lg transition-all duration-500 shadow-lg ${
                                            isHovered ? 'shadow-blue-500/50 scale-105' : ''
                                        }`}
                                        style={{ height: `${height}px` }}
                                    />
                                </div>
                                
                                {/* Month label */}
                                <div className={`text-xs mt-2 transition-colors ${
                                    isHovered 
                                        ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                                        : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                    {item.month}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Trend line indicator */}
                <div className="absolute top-2 right-4 flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">+23.5%</span>
                </div>
            </div>
        );
    };

    const renderPieChart = () => {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = 0;

        return (
            <div className="h-64 flex items-center justify-center gap-8">
                <div className="relative">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl scale-110" />
                    
                    <svg width="200" height="200" className="transform -rotate-90 relative">
                        {/* Background circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r="85"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-slate-200/30 dark:text-slate-700/30"
                        />
                        
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const angle = (item.value / total) * 360;
                            const startAngle = currentAngle;
                            currentAngle += angle;

                            const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                            const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                            const x2 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
                            const y2 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);

                            const largeArcFlag = angle > 180 ? 1 : 0;

                            return (
                                <g key={index}>
                                    <path
                                        d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                        fill={item.color}
                                        className="hover:opacity-80 transition-all duration-300 cursor-pointer hover:scale-105"
                                        style={{ transformOrigin: '100px 100px' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.filter = 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.filter = 'none';
                                        }}
                                    />
                                </g>
                            );
                        })}
                    </svg>
                    
                    {/* Center content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center bg-white dark:bg-slate-800 rounded-full w-28 h-28 flex flex-col items-center justify-center shadow-lg">
                            <div className="text-3xl font-bold" style={{ color: 'var(--color-secondary)' }}>
                                {total}%
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                Total
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Legend */}
                <div className="space-y-3">
                    {data.map((item, index) => (
                        <div 
                            key={index} 
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                        >
                            <div
                                className="w-4 h-4 rounded-full shadow-md group-hover:scale-125 transition-transform"
                                style={{ backgroundColor: item.color }}
                            />
                            <div className="flex-1">
                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {item.name}
                                </div>
                            </div>
                            <div className="text-sm font-bold px-2 py-1 rounded" style={{ 
                                color: 'var(--color-secondary)',
                                backgroundColor: 'rgba(74, 144, 226, 0.1)'
                            }}>
                                {item.value}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {subtitle}
                    </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-xl border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
            </div>
            {type === 'line' ? renderLineChart() : renderPieChart()}
        </div>
    );
}

export default ChartCard; 