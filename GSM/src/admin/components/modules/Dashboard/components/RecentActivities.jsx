import React, { useState } from 'react';
import { 
    UserPlus, 
    FileText, 
    Award, 
    AlertCircle,
    CheckCircle,
    Clock,
    ArrowRight,
    MoreVertical
} from 'lucide-react';

function RecentActivities() {
    const [hoveredActivity, setHoveredActivity] = useState(null);

    const activities = [
        {
            id: 1,
            type: 'application',
            title: 'New scholarship application',
            description: 'Maria Santos submitted application for Academic Excellence Program',
            time: '2 hours ago',
            icon: FileText,
            color: 'blue',
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            id: 2,
            type: 'approval',
            title: 'Application approved',
            description: 'John Dela Cruz approved for Financial Aid Program',
            time: '4 hours ago',
            icon: CheckCircle,
            color: 'green',
            gradient: 'from-green-500 to-emerald-500'
        },
        {
            id: 3,
            type: 'registration',
            title: 'New student registered',
            description: 'Anna Rodriguez enrolled in Partner School Database',
            time: '6 hours ago',
            icon: UserPlus,
            color: 'purple',
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            id: 4,
            type: 'award',
            title: 'Scholarship awarded',
            description: 'Sports Excellence Program awarded to 15 students',
            time: '1 day ago',
            icon: Award,
            color: 'orange',
            gradient: 'from-orange-500 to-amber-500'
        },
        {
            id: 5,
            type: 'alert',
            title: 'Document verification needed',
            description: 'Review pending for 3 applications',
            time: '1 day ago',
            icon: AlertCircle,
            color: 'red',
            gradient: 'from-red-500 to-rose-500'
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20',
            green: 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/20',
            purple: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/20',
            orange: 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/20',
            red: 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/20'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        Recent Activities
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Latest updates and actions
                    </p>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    View All
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
            
            <div className="space-y-3">
                {activities.map((activity) => {
                    const IconComponent = activity.icon;
                    const isHovered = hoveredActivity === activity.id;
                    
                    return (
                        <div 
                            key={activity.id} 
                            className={`group relative flex items-start gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer border ${
                                isHovered 
                                    ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 shadow-md' 
                                    : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                            }`}
                            onMouseEnter={() => setHoveredActivity(activity.id)}
                            onMouseLeave={() => setHoveredActivity(null)}
                        >
                            {/* Activity indicator line */}
                            {activity.id !== activities.length && (
                                <div className="absolute left-[30px] top-14 w-0.5 h-[calc(100%+0.75rem)] bg-slate-200 dark:bg-slate-700" />
                            )}
                            
                            {/* Icon */}
                            <div className={`relative z-10 p-2.5 rounded-xl border-2 ${getColorClasses(activity.color)} transition-transform ${isHovered ? 'scale-110' : ''}`}>
                                <IconComponent className="w-5 h-5" />
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {activity.title}
                                    </h4>
                                    <button className={`p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                                        <MoreVertical className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                                    {activity.description}
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        {activity.time}
                                    </div>
                                    <div className={`ml-auto flex items-center gap-1 text-xs font-medium transition-all ${
                                        isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                                    }`}>
                                        <span className={`bg-gradient-to-r ${activity.gradient} bg-clip-text text-transparent`}>
                                            View details
                                        </span>
                                        <ArrowRight className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Activity summary */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Total activities today</span>
                    <span className="font-bold text-slate-900 dark:text-white">24 activities</span>
                </div>
            </div>
        </div>
    );
}

export default RecentActivities; 