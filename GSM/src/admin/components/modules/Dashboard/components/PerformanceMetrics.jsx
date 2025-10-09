import React, { useState } from 'react';
import { TrendingUp, Target, Users, BookOpen, ArrowUpRight } from 'lucide-react';

function PerformanceMetrics() {
    const [hoveredMetric, setHoveredMetric] = useState(null);

    const metrics = [
        {
            title: 'Academic Performance',
            current: 85,
            target: 90,
            icon: BookOpen,
            color: 'blue',
            trend: '+2.3%'
        },
        {
            title: 'Scholarship Retention',
            current: 92,
            target: 95,
            icon: Target,
            color: 'green',
            trend: '+1.8%'
        },
        {
            title: 'Student Engagement',
            current: 78,
            target: 85,
            icon: Users,
            color: 'purple',
            trend: '+4.2%'
        },
        {
            title: 'Program Effectiveness',
            current: 88,
            target: 90,
            icon: TrendingUp,
            color: 'orange',
            trend: '+3.1%'
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: {
                gradient: 'from-blue-500 to-cyan-500',
                bg: 'bg-blue-500',
                light: 'bg-blue-500/10 dark:bg-blue-500/20',
                text: 'text-blue-600 dark:text-blue-400',
                ring: 'ring-blue-500/20'
            },
            green: {
                gradient: 'from-green-500 to-emerald-500',
                bg: 'bg-green-500',
                light: 'bg-green-500/10 dark:bg-green-500/20',
                text: 'text-green-600 dark:text-green-400',
                ring: 'ring-green-500/20'
            },
            purple: {
                gradient: 'from-purple-500 to-pink-500',
                bg: 'bg-purple-500',
                light: 'bg-purple-500/10 dark:bg-purple-500/20',
                text: 'text-purple-600 dark:text-purple-400',
                ring: 'ring-purple-500/20'
            },
            orange: {
                gradient: 'from-orange-500 to-amber-500',
                bg: 'bg-orange-500',
                light: 'bg-orange-500/10 dark:bg-orange-500/20',
                text: 'text-orange-600 dark:text-orange-400',
                ring: 'ring-orange-500/20'
            }
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        Performance Metrics
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Current vs Target Performance
                    </p>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    View Details
                    <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metrics.map((metric, index) => {
                    const IconComponent = metric.icon;
                    const colorClass = getColorClasses(metric.color);
                    const percentage = (metric.current / metric.target) * 100;
                    const isHovered = hoveredMetric === index;
                    
                    return (
                        <div 
                            key={index} 
                            className={`relative p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                                isHovered 
                                    ? `border-${metric.color}-500/50 shadow-lg ${colorClass.ring} ring-4` 
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                            onMouseEnter={() => setHoveredMetric(index)}
                            onMouseLeave={() => setHoveredMetric(null)}
                        >
                            {/* Background gradient */}
                            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${colorClass.gradient} opacity-0 ${isHovered ? 'opacity-5' : ''} transition-opacity`} />
                            
                            <div className="relative space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl ${colorClass.light} border-2 border-${metric.color}-500/20`}>
                                            <IconComponent className={`w-5 h-5 ${colorClass.text}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {metric.title}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                                Target: {metric.target}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-3xl font-bold" style={{ color: 'var(--color-secondary)' }}>
                                            {metric.current}%
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
                                        <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                                        <span className="text-xs font-bold text-green-700 dark:text-green-400">
                                            {metric.trend}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Circular progress */}
                                <div className="relative pt-2">
                                    <svg className="w-full h-3" viewBox="0 0 200 12">
                                        {/* Background track */}
                                        <rect
                                            x="0"
                                            y="0"
                                            width="200"
                                            height="12"
                                            rx="6"
                                            fill="currentColor"
                                            className="text-slate-200 dark:text-slate-700"
                                        />
                                        {/* Progress */}
                                        <rect
                                            x="0"
                                            y="0"
                                            width={`${Math.min(percentage, 100) * 2}`}
                                            height="12"
                                            rx="6"
                                            className={`transition-all duration-1000 ease-out`}
                                            fill={`url(#gradient-${index})`}
                                        />
                                        <defs>
                                            <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="1" />
                                                <stop offset="100%" stopColor="#3A7BD5" stopOpacity="0.8" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PerformanceMetrics; 