import React from 'react';
import {
	Users,
	GraduationCap,
	TrendingUp,
	Award,
	School,
	Calendar,
	PieChart,
	HandCoins,
	FileBarChart,
	UserPlus,
	Download,
	Filter,
	RefreshCw,
	Sparkles,
	ArrowUpRight,
} from 'lucide-react';
import StatsCard from './components/StatsCard';
import ChartCard from './components/ChartCard';
import RecentActivities from './components/RecentActivities';
import PerformanceMetrics from './components/PerformanceMetrics';

function DashboardOverview() {
	// Mock stats
	const stats = [
		{ title: 'Active Scholarships', value: '3,421', change: '+12.3%', trend: 'up', icon: GraduationCap, color: 'green' },
		{ title: 'School Aid Distributed', value: '₱1,245,000', change: '+15.2%', trend: 'up', icon: HandCoins, color: 'blue' },
		{ title: 'Registered Students', value: '12,847', change: '+5.2%', trend: 'up', icon: Users, color: 'purple' },
		{ title: 'Partner Schools', value: '156', change: '+2.1%', trend: 'up', icon: School, color: 'orange' },
	];

	// Mock chart data
	const scholarshipApplicationsTrend = [
		{ month: 'Jan', applications: 320 },
		{ month: 'Feb', applications: 410 },
		{ month: 'Mar', applications: 390 },
		{ month: 'Apr', applications: 450 },
		{ month: 'May', applications: 500 },
		{ month: 'Jun', applications: 530 },
		{ month: 'Jul', applications: 600 },
	];
	const schoolAidDistribution = [
		{ name: 'Educational Supplies', value: 36, color: '#3B82F6' },
		{ name: 'Transportation Aid', value: 28, color: '#10B981' },
		{ name: 'Meal Allowance', value: 20, color: '#F59E0B' },
		{ name: 'Uniform Assistance', value: 16, color: '#8B5CF6' },
	];
	const studentRegistryGrowth = [
		{ month: 'Jan', students: 10500 },
		{ month: 'Feb', students: 10800 },
		{ month: 'Mar', students: 11200 },
		{ month: 'Apr', students: 11600 },
		{ month: 'May', students: 12000 },
		{ month: 'Jun', students: 12400 },
		{ month: 'Jul', students: 12847 },
	];
	const partnerSchoolTypes = [
		{ name: 'Public High School', value: 40, color: '#3B82F6' },
		{ name: 'Private Elementary', value: 30, color: '#10B981' },
		{ name: 'Public Elementary', value: 20, color: '#F59E0B' },
		{ name: 'Private High School', value: 10, color: '#8B5CF6' },
	];
	const reportCategories = [
		{ name: 'Academic', value: 8, color: '#3B82F6' },
		{ name: 'Enrollment', value: 6, color: '#10B981' },
		{ name: 'Scholarship', value: 5, color: '#F59E0B' },
		{ name: 'Financial', value: 3, color: '#8B5CF6' },
		{ name: 'Compliance', value: 2, color: '#EF4444' },
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="relative rounded-3xl p-8 shadow-xl overflow-hidden" style={{
				background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
				border: '1px solid rgba(76, 175, 80, 0.2)'
			}}>
				{/* Animated background elements */}
				<div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{
					background: 'linear-gradient(135deg, rgba(253, 168, 17, 0.3) 0%, rgba(74, 144, 226, 0.3) 100%)'
				}} />
				<div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{
					background: 'linear-gradient(45deg, rgba(76, 175, 80, 0.3) 0%, rgba(74, 144, 226, 0.3) 100%)'
				}} />
				
				<div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
					<div className="flex-1">
						<div className="flex items-center gap-3 mb-3">
							<div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
								<Sparkles className="w-6 h-6 text-white" />
							</div>
							<h1 className="text-3xl font-bold text-white">
								Education & Scholarship Dashboard
							</h1>
						</div>
						<p className="text-white dark:text-slate-300 text-lg">
							Real-time overview of all education and scholarship modules performance
						</p>
						<div className="flex items-center gap-2 mt-4 text-sm text-white dark:text-slate-400">
							<Calendar className="w-4 h-4" />
							<span>Last updated: {new Date().toLocaleDateString('en-US', { 
								weekday: 'long', 
								year: 'numeric', 
								month: 'long', 
								day: 'numeric' 
							})}</span>
						</div>
					</div>
					
					<div className="flex flex-wrap items-center gap-3">
						<button className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all duration-300 hover:scale-105 border border-white/30 flex items-center gap-2">
							<RefreshCw className="w-4 h-4" />
							<span className="font-medium">Refresh</span>
						</button>
						<button className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all duration-300 hover:scale-105 border border-white/30 flex items-center gap-2">
							<Filter className="w-4 h-4" />
							<span className="font-medium">Filter</span>
						</button>
						<button className="px-5 py-2.5 bg-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2 font-semibold" style={{
							color: 'var(--color-primary)',
							'&:hover': {
								backgroundColor: 'rgba(76, 175, 80, 0.1)'
							}
						}}>
							<Download className="w-4 h-4" />
							<span>Export Report</span>
						</button>
					</div>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{stats.map((stat, index) => (
					<StatsCard key={index} {...stat} />
				))}
			</div>

			{/* Charts Section */}
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-bold text-slate-900 dark:text-white">Analytics Overview</h2>
						<p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Visual insights and trends</p>
					</div>
				</div>
				
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<ChartCard
						title="Scholarship Applications Trend"
						subtitle="Monthly applications received"
						icon={TrendingUp}
						data={scholarshipApplicationsTrend.map(d => ({ month: d.month, students: d.applications }))}
						type="line"
					/>
					<ChartCard
						title="School Aid Distribution"
						subtitle="By aid type"
						icon={PieChart}
						data={schoolAidDistribution}
						type="pie"
					/>
				</div>
				
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<ChartCard
						title="Student Registry Growth"
						subtitle="Monthly student registrations"
						icon={Users}
						data={studentRegistryGrowth}
						type="line"
					/>
					<ChartCard
						title="Partner School Types"
						subtitle="Distribution by type"
						icon={School}
						data={partnerSchoolTypes}
						type="pie"
					/>
				</div>
			</div>

			{/* Performance Metrics and Activities */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<PerformanceMetrics />
				</div>
				<div>
					<RecentActivities />
				</div>
			</div>

			{/* Quick Actions */}
			<div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Quick Actions</h3>
						<p className="text-sm text-slate-600 dark:text-slate-400">Frequently used tasks and shortcuts</p>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
					<button className="group relative flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-2xl hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-500/20 hover:-translate-y-1">
						<div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="relative p-4 bg-green-500/10 dark:bg-green-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
							<Award className="w-8 h-8 text-green-600 dark:text-green-400" />
						</div>
						<div className="relative text-center">
							<div className="font-bold text-slate-900 dark:text-white mb-1">New Scholarship</div>
							<div className="text-xs text-slate-600 dark:text-slate-400">Create program</div>
						</div>
						<ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
					</button>
					
					<button className="group relative flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-2xl hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500/20 hover:-translate-y-1">
						<div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="relative p-4 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
							<HandCoins className="w-8 h-8 text-blue-600 dark:text-blue-400" />
						</div>
						<div className="relative text-center">
							<div className="font-bold text-slate-900 dark:text-white mb-1">Distribute Aid</div>
							<div className="text-xs text-slate-600 dark:text-slate-400">Process aid</div>
						</div>
						<ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
					</button>
					
					<button className="group relative flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-2xl hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-500/20 hover:-translate-y-1">
						<div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="relative p-4 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
							<UserPlus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
						</div>
						<div className="relative text-center">
							<div className="font-bold text-slate-900 dark:text-white mb-1">Register Student</div>
							<div className="text-xs text-slate-600 dark:text-slate-400">Add student</div>
						</div>
						<ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
					</button>
					
					<button className="group relative flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-2xl hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-500/20 hover:-translate-y-1">
						<div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="relative p-4 bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
							<School className="w-8 h-8 text-orange-600 dark:text-orange-400" />
						</div>
						<div className="relative text-center">
							<div className="font-bold text-slate-900 dark:text-white mb-1">Partner School</div>
							<div className="text-xs text-slate-600 dark:text-slate-400">Register school</div>
						</div>
						<ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-orange-600 dark:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
					</button>
					
					<button className="group relative flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-2xl hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-slate-500/20 hover:-translate-y-1">
						<div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-slate-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="relative p-4 bg-slate-500/10 dark:bg-slate-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
							<FileBarChart className="w-8 h-8 text-slate-600 dark:text-slate-400" />
						</div>
						<div className="relative text-center">
							<div className="font-bold text-slate-900 dark:text-white mb-1">Generate Report</div>
							<div className="text-xs text-slate-600 dark:text-slate-400">Create report</div>
						</div>
						<ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
					</button>
				</div>
			</div>
		</div>
	);
}

export default DashboardOverview; 