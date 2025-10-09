import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

function StatsCard({ title, value, change, trend, icon: Icon, color }) {
    const colorClasses = {
        blue: {
            gradient: 'from-[var(--color-secondary)] to-[#3A7BD5]',
            bg: 'bg-[var(--color-secondary)]/10 dark:bg-[var(--color-secondary)]/20',
            icon: 'text-[var(--color-secondary)] dark:text-[#3A7BD5]',
            border: 'border-[var(--color-secondary)]/20',
            shadow: 'hover:shadow-[var(--color-secondary)]/20'
        },
        green: {
            gradient: 'from-[var(--color-primary)] to-[#45A049]',
            bg: 'bg-[var(--color-primary)]/10 dark:bg-[var(--color-primary)]/20',
            icon: 'text-[var(--color-primary)] dark:text-[#45A049]',
            border: 'border-[var(--color-primary)]/20',
            shadow: 'hover:shadow-[var(--color-primary)]/20'
        },
        purple: {
            gradient: 'from-purple-500 to-purple-600',
            bg: 'bg-purple-500/10 dark:bg-purple-500/20',
            icon: 'text-purple-600 dark:text-purple-400',
            border: 'border-purple-500/20',
            shadow: 'hover:shadow-purple-500/20'
        },
        orange: {
            gradient: 'from-[var(--color-accent)] to-[#E6940F]',
            bg: 'bg-[var(--color-accent)]/10 dark:bg-[var(--color-accent)]/20',
            icon: 'text-[var(--color-accent)] dark:text-[#E6940F]',
            border: 'border-[var(--color-accent)]/20',
            shadow: 'hover:shadow-[var(--color-accent)]/20'
        },
        red: {
            gradient: 'from-red-500 to-red-600',
            bg: 'bg-red-500/10 dark:bg-red-500/20',
            icon: 'text-red-600 dark:text-red-400',
            border: 'border-red-500/20',
            shadow: 'hover:shadow-red-500/20'
        }
    };

    const colorClass = colorClasses[color] || colorClasses.blue;

    return (
        <div className={`group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl ${colorClass.shadow} transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden`}>
            {/* Decorative background gradient */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
            
            <div className="relative">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colorClass.bg} border ${colorClass.border} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${colorClass.icon}`} />
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                        trend === 'up' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                        {trend === 'up' ? (
                            <TrendingUp className="w-3 h-3" />
                        ) : (
                            <TrendingDown className="w-3 h-3" />
                        )}
                        {change}
                    </div>
                </div>
                
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 tracking-wide uppercase">
                        {title}
                    </h3>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text">
                        {value}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span>vs last month</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                </div>
            </div>
        </div>
    );
}

export default StatsCard; 
