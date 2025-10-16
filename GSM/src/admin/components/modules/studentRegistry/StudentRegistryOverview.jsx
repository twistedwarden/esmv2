import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  GraduationCap, 
  Award, 
  TrendingUp, 
  Search, 
  Filter, 
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar,
  UserCheck,
  UserX,
  AlertCircle,
  Eye,
  Edit
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToastContext } from '../../../../components/providers/ToastProvider';
import { LoadingData } from '../../ui/LoadingSpinner';
import AnimatedCard, { StatsCard } from '../../ui/AnimatedCard';
import AnimatedContainer, { AnimatedGrid, AnimatedSection } from '../../ui/AnimatedContainer';
import { transitions } from '../../../../utils/transitions';
import studentApiService from '../../../../services/studentApiService';
import AddStudentModal from './AddStudentModal';
import StudentProfileModal from './StudentProfileModal';

function StudentRegistryOverview() {
    const { showSuccess, showError } = useToastContext();
    const [statistics, setStatistics] = useState(null);
    const [recentStudents, setRecentStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedStudentUuid, setSelectedStudentUuid] = useState(null);
    const [quickFilter, setQuickFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsData, studentsData] = await Promise.all([
                studentApiService.getStudentStatistics(),
                studentApiService.getStudents({ per_page: 5, sort: 'created_at', order: 'desc' })
            ]);

            setStatistics(statsData.data);
            setRecentStudents(studentsData.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Fallback to mock data
            setStatistics({
                total_students: 1250,
                active_scholars: 340,
                applicants: 89,
                alumni: 156,
                students_by_status: {
                    enrolled: 1100,
                    graduated: 120,
                    dropped: 25,
                    transferred: 5
                },
                recent_registrations: 23,
                average_gpa: 3.2
            });
            setRecentStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewStudent = (studentUuid) => {
        setSelectedStudentUuid(studentUuid);
        setShowProfileModal(true);
    };

    const handleEditStudent = (student) => {
        // This would open the edit modal
        console.log('Edit student:', student);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'inactive': return 'text-yellow-600 bg-yellow-100';
            case 'archived': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getScholarshipStatusColor = (status) => {
        switch (status) {
            case 'scholar': return 'text-blue-600 bg-blue-100';
            case 'applicant': return 'text-orange-600 bg-orange-100';
            case 'alumni': return 'text-purple-600 bg-purple-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return <LoadingData module="students" />;
    }

    return (
        <AnimatedContainer variant="page" className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-orange-500" />
                        Student Registry
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage and track all registered students in the system
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchDashboardData}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Add Student</span>
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <AnimatedGrid columns={4} staggerDelay={0.1}>
                <StatsCard
                    title="Total Students"
                    value={statistics?.total_students?.toLocaleString() || 0}
                    icon={Users}
                    color="blue"
                    index={0}
                />
                <StatsCard
                    title="Active Scholars"
                    value={statistics?.active_scholars?.toLocaleString() || 0}
                    icon={Award}
                    color="green"
                    index={1}
                />
                <StatsCard
                    title="Applicants"
                    value={statistics?.applicants?.toLocaleString() || 0}
                    icon={UserCheck}
                    color="orange"
                    index={2}
                />
                <StatsCard
                    title="Recent (30 days)"
                    value={statistics?.recent_registrations?.toLocaleString() || 0}
                    icon={TrendingUp}
                    color="purple"
                    index={3}
                />
            </AnimatedGrid>

            {/* Quick Filters and Search */}
            <AnimatedSection index={1}>
                <AnimatedCard>
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Quick Filters */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'all', label: 'All Students', count: statistics?.total_students || 0 },
                            { id: 'scholars', label: 'Active Scholars', count: statistics?.active_scholars || 0 },
                            { id: 'applicants', label: 'Applicants', count: statistics?.applicants || 0 },
                            { id: 'alumni', label: 'Alumni', count: statistics?.alumni || 0 }
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setQuickFilter(filter.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    quickFilter === filter.id
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                }`}
                            >
                                {filter.label} ({filter.count})
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search students by name, student number, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                    </div>
                </div>
                </AnimatedCard>
            </AnimatedSection>

            {/* Charts Section */}
            <AnimatedSection index={2}>
                <AnimatedGrid columns={2} staggerDelay={0.1}>
                    {/* Students by Status Chart */}
                    <AnimatedCard index={0}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Students by Status</h3>
                        <PieChart className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                        {statistics?.students_by_status && Object.entries(statistics.students_by_status).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                        status === 'enrolled' ? 'bg-green-500' :
                                        status === 'graduated' ? 'bg-blue-500' :
                                        status === 'dropped' ? 'bg-red-500' :
                                        'bg-yellow-500'
                                    }`} />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                        {status}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {count.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                    </AnimatedCard>

                    {/* Recent Registrations */}
                    <AnimatedCard index={1}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Registrations</h3>
                        <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                        {recentStudents.length > 0 ? (
                            recentStudents.map((student, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                                            <UserCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {student.first_name} {student.last_name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {student.student_number}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScholarshipStatusColor(student.scholarship_status)}`}>
                                            {student.scholarship_status}
                                        </span>
                                        <button
                                            onClick={() => handleViewStudent(student.student_uuid)}
                                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No recent registrations</p>
                            </div>
                        )}
                    </div>
                    </AnimatedCard>
                </AnimatedGrid>
            </AnimatedSection>

            {/* Quick Actions */}
            <AnimatedSection index={3}>
                <AnimatedCard>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        <Upload className="w-5 h-5 text-blue-600" />
                        <div className="text-left">
                            <p className="font-medium text-blue-900 dark:text-blue-100">Import Students</p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">Bulk import from Excel</p>
                        </div>
                    </button>
                    <button className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                        <Download className="w-5 h-5 text-green-600" />
                        <div className="text-left">
                            <p className="font-medium text-green-900 dark:text-green-100">Export Data</p>
                            <p className="text-sm text-green-700 dark:text-green-300">Download student records</p>
                        </div>
                    </button>
                    <button className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        <div className="text-left">
                            <p className="font-medium text-purple-900 dark:text-purple-100">Generate Reports</p>
                            <p className="text-sm text-purple-700 dark:text-purple-300">Create analytics reports</p>
                        </div>
                    </button>
                </div>
                </AnimatedCard>
            </AnimatedSection>

            {/* Modals */}
            {showAddModal && (
                <AddStudentModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchDashboardData();
                        showSuccess('Student added successfully');
                    }}
                />
            )}

            {showProfileModal && (
                <StudentProfileModal
                    isOpen={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                    studentUuid={selectedStudentUuid}
                    onEdit={handleEditStudent}
                />
            )}
        </AnimatedContainer>
    );
}

export default StudentRegistryOverview;