import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  School,
  GraduationCap,
  Calendar,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  AlertTriangle,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  X,
  CheckSquare,
  Square
} from 'lucide-react';

function VerifiedEnrolledStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    school: 'all',
    level: 'all',
    verificationStatus: 'all'
  });
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockStudents = [
        {
          id: 1,
          name: 'Juan Dela Cruz',
          studentId: '2024-001',
          email: 'juan.delacruz@email.com',
          phone: '+63 912 345 6789',
          schoolName: 'University of the Philippines',
          schoolType: 'State University',
          educationalLevel: 'Tertiary',
          yearLevel: '2nd Year',
          course: 'Bachelor of Science in Computer Science',
          gwa: '1.25',
          verificationStatus: 'verified',
          enrollmentStatus: 'enrolled',
          verificationDate: '2024-01-15',
          scholarshipAmount: 25000,
          documents: 8
        },
        {
          id: 2,
          name: 'Maria Santos',
          studentId: '2024-002',
          email: 'maria.santos@email.com',
          phone: '+63 923 456 7890',
          schoolName: 'Ateneo de Manila University',
          schoolType: 'Private University',
          educationalLevel: 'Tertiary',
          yearLevel: '1st Year',
          course: 'Bachelor of Science in Psychology',
          gwa: '1.50',
          verificationStatus: 'pending',
          enrollmentStatus: 'enrolled',
          verificationDate: '2024-01-20',
          scholarshipAmount: 30000,
          documents: 7
        },
        {
          id: 3,
          name: 'Pedro Reyes',
          studentId: '2024-003',
          email: 'pedro.reyes@email.com',
          phone: '+63 934 567 8901',
          schoolName: 'De La Salle University',
          schoolType: 'Private University',
          educationalLevel: 'Tertiary',
          yearLevel: '3rd Year',
          course: 'Bachelor of Science in Engineering',
          gwa: '1.75',
          verificationStatus: 'verified',
          enrollmentStatus: 'enrolled',
          verificationDate: '2024-01-18',
          scholarshipAmount: 20000,
          documents: 9
        }
      ];
      
      setStudents(mockStudents);
    } catch (e) {
      setError('Failed to load verified students');
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getVerificationStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.schoolName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || student.enrollmentStatus === filters.status;
    const matchesSchool = filters.school === 'all' || student.schoolType === filters.school;
    const matchesLevel = filters.level === 'all' || student.educationalLevel === filters.level;
    const matchesVerification = filters.verificationStatus === 'all' || student.verificationStatus === filters.verificationStatus;
    
    return matchesSearch && matchesStatus && matchesSchool && matchesLevel && matchesVerification;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'gwa':
        aValue = parseFloat(a.gwa);
        bValue = parseFloat(b.gwa);
        break;
      case 'amount':
        aValue = a.scholarshipAmount;
        bValue = b.scholarshipAmount;
        break;
      case 'date':
        aValue = new Date(a.verificationDate);
        bValue = new Date(b.verificationDate);
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const StudentCard = ({ student }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 group ${
      viewMode === 'list' ? 'rounded-lg' : 'rounded-xl'
    }`}>
      <div className={viewMode === 'list' ? 'p-4' : 'p-6'}>
        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 ${viewMode === 'list' ? 'mb-3' : 'mb-4'}`}>
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={selectedStudents.includes(student.id)}
                onChange={() => handleSelectStudent(student.id)}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
            </div>
            <div className={`flex-shrink-0 ${viewMode === 'list' ? 'h-8 w-8' : 'h-12 w-12'}`}>
              <div className={`${viewMode === 'list' ? 'h-8 w-8' : 'h-12 w-12'} rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 flex items-center justify-center`}>
                <School className={`${viewMode === 'list' ? 'h-4 w-4' : 'h-6 w-6'} text-green-600 dark:text-green-400`} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`${viewMode === 'list' ? 'text-base font-semibold' : 'text-lg font-semibold'} text-gray-900 dark:text-white truncate`}>
                {student.name}
              </h3>
              <p className={`${viewMode === 'list' ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400 truncate`}>
                {student.studentId}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getVerificationStatusColor(student.verificationStatus)}`}>
              {getVerificationStatusIcon(student.verificationStatus)}
              <span className="ml-1 capitalize">{student.verificationStatus}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className={viewMode === 'list' ? 'space-y-2' : 'space-y-4'}>
          {/* School Info */}
          <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
            <School className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} flex-shrink-0`} />
            <span className="truncate">{student.schoolName}</span>
          </div>

          {/* Academic Info */}
          <div className={`grid gap-3 ${
            viewMode === 'list' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
              : 'grid-cols-1 sm:grid-cols-2'
          }`}>
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} min-w-0`}>
              <GraduationCap className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">GWA:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {student.gwa}
              </span>
            </div>
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} min-w-0`}>
              <School className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">Level:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {student.educationalLevel}
              </span>
            </div>
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} min-w-0`}>
              <Calendar className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">Year:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {student.yearLevel}
              </span>
            </div>
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} min-w-0`}>
              <FileText className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">Amount:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">
                ₱{student.scholarshipAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Additional Info for List View */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 min-w-0">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Verified: {new Date(student.verificationDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 min-w-0">
                <FileText className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{student.documents} documents</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`${viewMode === 'list' ? 'mt-3 pt-3' : 'mt-6 pt-4'} border-t border-gray-200 dark:border-slate-700`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                className={`flex items-center space-x-2 ${viewMode === 'list' ? 'px-4 py-2 text-sm font-semibold' : 'px-3 py-1.5 text-sm'} bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md flex-shrink-0`}
              >
                <Eye className={`${viewMode === 'list' ? 'w-4 h-4' : 'w-4 h-4'}`} />
                <span>View Details</span>
              </button>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button className={`${viewMode === 'list' ? 'p-2' : 'p-1.5'} bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md`} title="Verify">
                <CheckCircle className={`${viewMode === 'list' ? 'w-5 h-5' : 'w-4 h-4'}`} />
              </button>
              <button className={`${viewMode === 'list' ? 'p-2' : 'p-1.5'} bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md`} title="Reject">
                <XCircle className={`${viewMode === 'list' ? 'w-5 h-5' : 'w-4 h-4'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleSelectStudent = (id) => {
    setSelectedStudents(prev => 
      prev.includes(id) 
        ? prev.filter(studentId => studentId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === sortedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(sortedStudents.map(student => student.id));
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      school: 'all',
      level: 'all',
      verificationStatus: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== 'all') || searchTerm;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Verified Enrolled Students
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and verify student enrollment status
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Bulk Verify
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search and Basic Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 min-w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.verificationStatus}
              onChange={(e) => updateFilter('verificationStatus', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                showAdvancedFilters 
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300'
                  : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Advanced</span>
            </button>
            
            <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'} rounded-l-lg transition-colors`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'} rounded-r-lg transition-colors`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="gwa">Sort by GWA</option>
              <option value="amount">Sort by Amount</option>
              <option value="date">Sort by Date</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">School Type</label>
                <select
                  value={filters.school}
                  onChange={(e) => updateFilter('school', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Schools</option>
                  <option value="State University">State University</option>
                  <option value="Private University">Private University</option>
                  <option value="College">College</option>
                  <option value="High School">High School</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Educational Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => updateFilter('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  <option value="Senior High School">Senior High School</option>
                  <option value="Tertiary">Tertiary</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enrollment Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="not_enrolled">Not Enrolled</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {hasActiveFilters() && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.verificationStatus !== 'all' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                Status: {filters.verificationStatus}
                <button onClick={() => updateFilter('verificationStatus', 'all')} className="ml-1 hover:text-orange-600 dark:hover:text-orange-200">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-purple-600 dark:hover:text-purple-200">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button onClick={clearAllFilters} className="text-sm text-gray-600 dark:text-gray-300 underline hover:text-gray-800 dark:hover:text-gray-100">
              Clear all filters
            </button>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-800 dark:text-orange-200">
                {selectedStudents.length} student(s) selected
              </span>
              <div className="flex space-x-2">
                <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                  Verify Selected
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                  Reject Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Students Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading students...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      ) : sortedStudents.length === 0 ? (
        <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-12 text-center">
          <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No students found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-3'}>
          {sortedStudents.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}

export default VerifiedEnrolledStudents;
