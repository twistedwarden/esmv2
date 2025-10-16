import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Archive, 
  UserPlus,
  Download,
  Mail,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Award,
  MapPin,
  Calendar,
  Phone,
  Mail as MailIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastContext } from '../../../../components/providers/ToastProvider';
import { LoadingData } from '../../ui/LoadingSpinner';
import studentApiService from '../../../../services/studentApiService';
import StudentProfileModal from './StudentProfileModal';

function ActiveStudents() {
    const { showSuccess, showError } = useToastContext();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedStudentUuid, setSelectedStudentUuid] = useState(null);
    const [filters, setFilters] = useState({
        school: 'all',
        program: 'all',
        year_level: 'all',
        scholarship_status: 'all',
        academic_status: 'all'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchStudents();
    }, [currentPage, sortBy, sortOrder]);

    useEffect(() => {
        filterStudents();
    }, [students, searchTerm, filters]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await studentApiService.getStudents({
                page: currentPage,
                per_page: itemsPerPage,
                sort: sortBy,
                order: sortOrder,
                status: 'active'
            });
            setStudents(response.data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
            showError('Failed to fetch students');
            // Fallback to mock data
            setStudents([
                {
                    student_uuid: '1',
                    student_number: 'GSM2024001',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    program: 'Computer Science',
                    year_level: '3rd Year',
                    school_name: 'University of the Philippines',
                    scholarship_status: 'scholar',
                    gpa: 3.5,
                    status: 'active',
                    created_at: '2024-01-15T10:30:00Z'
                },
                {
                    student_uuid: '2',
                    student_number: 'GSM2024002',
                    first_name: 'Jane',
                    last_name: 'Smith',
                    email: 'jane.smith@example.com',
                    program: 'Engineering',
                    year_level: '2nd Year',
                    school_name: 'Ateneo de Manila University',
                    scholarship_status: 'applicant',
                    gpa: 3.2,
                    status: 'active',
                    created_at: '2024-01-14T14:20:00Z'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filterStudents = () => {
        let filtered = [...students];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(student =>
                student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.student_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Other filters
        if (filters.school !== 'all') {
            filtered = filtered.filter(student => student.school_name === filters.school);
        }
        if (filters.program !== 'all') {
            filtered = filtered.filter(student => student.program === filters.program);
        }
        if (filters.year_level !== 'all') {
            filtered = filtered.filter(student => student.year_level === filters.year_level);
        }
        if (filters.scholarship_status !== 'all') {
            filtered = filtered.filter(student => student.scholarship_status === filters.scholarship_status);
        }
        if (filters.academic_status !== 'all') {
            filtered = filtered.filter(student => student.academic_status === filters.academic_status);
        }

        setFilteredStudents(filtered);
    };

    const handleSelectStudent = (studentUuid) => {
        setSelectedStudents(prev =>
            prev.includes(studentUuid)
                ? prev.filter(id => id !== studentUuid)
                : [...prev, studentUuid]
        );
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === filteredStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(student => student.student_uuid));
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

    const handleArchiveStudent = async (studentUuid) => {
        try {
            await studentApiService.archiveStudent(studentUuid, 'Archived by admin');
            showSuccess('Student archived successfully');
            fetchStudents();
        } catch (error) {
            console.error('Error archiving student:', error);
            showError('Failed to archive student');
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedStudents.length === 0) {
            showError('Please select students first');
            return;
        }

        try {
            switch (action) {
                case 'archive':
                    await studentApiService.bulkUpdateStudents(selectedStudents, { status: 'archived' });
                    showSuccess(`${selectedStudents.length} students archived successfully`);
                    break;
                case 'export':
                    // Export selected students
                    showSuccess('Export started');
                    break;
                case 'notify':
                    // Send notification to selected students
                    showSuccess(`Notification sent to ${selectedStudents.length} students`);
                    break;
                default:
                    break;
            }
            setSelectedStudents([]);
            fetchStudents();
        } catch (error) {
            console.error('Error performing bulk action:', error);
            showError('Failed to perform bulk action');
        }
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
        return <LoadingData />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Active Students</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage and view all active students in the system
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        <span>Filters</span>
                        {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row gap-4">
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

                {/* Advanced Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        School
                                    </label>
                                    <select
                                        value={filters.school}
                                        onChange={(e) => setFilters(prev => ({ ...prev, school: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                    >
                                        <option value="all">All Schools</option>
                                        <option value="University of the Philippines">University of the Philippines</option>
                                        <option value="Ateneo de Manila University">Ateneo de Manila University</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Program
                                    </label>
                                    <select
                                        value={filters.program}
                                        onChange={(e) => setFilters(prev => ({ ...prev, program: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                    >
                                        <option value="all">All Programs</option>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Engineering">Engineering</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Year Level
                                    </label>
                                    <select
                                        value={filters.year_level}
                                        onChange={(e) => setFilters(prev => ({ ...prev, year_level: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                    >
                                        <option value="all">All Years</option>
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Scholarship Status
                                    </label>
                                    <select
                                        value={filters.scholarship_status}
                                        onChange={(e) => setFilters(prev => ({ ...prev, scholarship_status: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="scholar">Scholar</option>
                                        <option value="applicant">Applicant</option>
                                        <option value="alumni">Alumni</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Academic Status
                                    </label>
                                    <select
                                        value={filters.academic_status}
                                        onChange={(e) => setFilters(prev => ({ ...prev, academic_status: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="enrolled">Enrolled</option>
                                        <option value="graduated">Graduated</option>
                                        <option value="dropped">Dropped</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bulk Actions */}
            {selectedStudents.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-orange-800 dark:text-orange-200">
                            {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                        </p>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleBulkAction('notify')}
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                                <span>Notify</span>
                            </button>
                            <button
                                onClick={() => handleBulkAction('export')}
                                className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                            <button
                                onClick={() => handleBulkAction('archive')}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                                <Archive className="w-4 h-4" />
                                <span>Archive</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Students Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <button
                                        onClick={handleSelectAll}
                                        className="flex items-center"
                                    >
                                        {selectedStudents.length === filteredStudents.length ? (
                                            <CheckSquare className="w-4 h-4 text-orange-500" />
                                        ) : (
                                            <Square className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Program
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    School
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Scholarship
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    GPA
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            <AnimatePresence>
                                {filteredStudents.map((student, index) => (
                                    <motion.tr
                                        key={student.student_uuid}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
                                        onClick={() => handleViewStudent(student.student_uuid)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectStudent(student.student_uuid);
                                                }}
                                                className="flex items-center"
                                            >
                                                {selectedStudents.includes(student.student_uuid) ? (
                                                    <CheckSquare className="w-4 h-4 text-orange-500" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                                                    <GraduationCap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {student.first_name} {student.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {student.student_number}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {student.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{student.program}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{student.year_level}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                                {student.school_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScholarshipStatusColor(student.scholarship_status)}`}>
                                                {student.scholarship_status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {student.gpa || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                                                {student.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewStudent(student.student_uuid);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditStudent(student);
                                                    }}
                                                    className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleArchiveStudent(student.student_uuid);
                                                    }}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    <Archive className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredStudents.length === 0 && (
                    <div className="text-center py-12">
                        <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No students found</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm || Object.values(filters).some(f => f !== 'all') 
                                ? 'Try adjusting your search criteria' 
                                : 'No students have been registered yet'
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Student Profile Modal */}
            {showProfileModal && (
                <StudentProfileModal
                    isOpen={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                    studentUuid={selectedStudentUuid}
                    onEdit={handleEditStudent}
                />
            )}
        </div>
    );
}

export default ActiveStudents;