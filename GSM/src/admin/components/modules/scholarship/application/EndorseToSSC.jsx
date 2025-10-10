import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Send,
  RefreshCw,
  AlertTriangle,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  X,
  Users,
  School,
  Calendar,
  DollarSign,
  GraduationCap,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  FileCheck,
  Shield,
  Zap,
  AlertCircle,
  Flag,
  Edit3
} from 'lucide-react';

function EndorseToSSC() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    level: 'all',
    school: 'all',
    endorsementStatus: 'all'
  });
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isEndorseModalOpen, setIsEndorseModalOpen] = useState(false);
  const [activeApplication, setActiveApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - applications ready for SSC endorsement
      const mockApplications = [
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
          scholarshipCategory: 'Academic Excellence',
          scholarshipSubCategory: 'Dean\'s List',
          requestedAmount: 25000,
          approvedAmount: 25000,
          endorsementStatus: 'ready',
          interviewCompleted: true,
          verificationCompleted: true,
          documentsVerified: true,
          submittedDate: '2024-01-15',
          approvedDate: '2024-01-20',
          documents: 8,
          priority: 'high'
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
          scholarshipCategory: 'Financial Need',
          scholarshipSubCategory: '4Ps Beneficiary',
          requestedAmount: 30000,
          approvedAmount: 30000,
          endorsementStatus: 'endorsed',
          interviewCompleted: true,
          verificationCompleted: true,
          documentsVerified: true,
          submittedDate: '2024-01-20',
          approvedDate: '2024-01-25',
          endorsedDate: '2024-01-30',
          documents: 7,
          priority: 'medium'
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
          scholarshipCategory: 'Academic Excellence',
          scholarshipSubCategory: 'Honor Student',
          requestedAmount: 20000,
          approvedAmount: 20000,
          endorsementStatus: 'ready',
          interviewCompleted: true,
          verificationCompleted: true,
          documentsVerified: true,
          submittedDate: '2024-01-18',
          approvedDate: '2024-01-22',
          documents: 9,
          priority: 'normal'
        }
      ];
      
      setApplications(mockApplications);
    } catch (e) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getEndorsementStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'endorsed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getEndorsementStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'endorsed':
        return <Award className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.scholarshipCategory.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || app.endorsementStatus === filters.status;
    const matchesCategory = filters.category === 'all' || app.scholarshipCategory === filters.category;
    const matchesLevel = filters.level === 'all' || app.educationalLevel === filters.level;
    const matchesSchool = filters.school === 'all' || app.schoolType === filters.school;
    const matchesEndorsement = filters.endorsementStatus === 'all' || app.endorsementStatus === filters.endorsementStatus;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesLevel && matchesSchool && matchesEndorsement;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
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
        aValue = a.approvedAmount;
        bValue = b.approvedAmount;
        break;
      case 'date':
      default:
        aValue = new Date(a.approvedDate);
        bValue = new Date(b.approvedDate);
        break;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const ApplicationCard = ({ application }) => (
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
                checked={selectedApplications.includes(application.id)}
                onChange={() => handleSelectApplication(application.id)}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
            </div>
            <div className={`flex-shrink-0 ${viewMode === 'list' ? 'h-8 w-8' : 'h-12 w-12'}`}>
              <div className={`${viewMode === 'list' ? 'h-8 w-8' : 'h-12 w-12'} rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center`}>
                <Award className={`${viewMode === 'list' ? 'h-4 w-4' : 'h-6 w-6'} text-orange-600 dark:text-orange-400`} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`${viewMode === 'list' ? 'text-base font-semibold' : 'text-lg font-semibold'} text-gray-900 dark:text-white truncate`}>
                {application.name}
              </h3>
              <p className={`${viewMode === 'list' ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400 truncate`}>
                {application.studentId}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getEndorsementStatusColor(application.endorsementStatus)}`}>
              {getEndorsementStatusIcon(application.endorsementStatus)}
              <span className="ml-1 capitalize">{application.endorsementStatus}</span>
            </span>
            {application.priority !== 'normal' && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(application.priority)}`}>
                {application.priority}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={viewMode === 'list' ? 'space-y-2' : 'space-y-4'}>
          {/* School Info */}
          <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
            <School className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} flex-shrink-0`} />
            <span className="truncate">{application.schoolName}</span>
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
                {application.gwa}
              </span>
            </div>
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} min-w-0`}>
              <BookOpen className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">Level:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {application.educationalLevel}
              </span>
            </div>
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} min-w-0`}>
              <Award className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">Category:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {application.scholarshipCategory}
              </span>
            </div>
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} min-w-0`}>
              <DollarSign className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">Amount:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">
                ₱{application.approvedAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Additional Info for List View */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 min-w-0">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Approved: {new Date(application.approvedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 min-w-0">
                <FileCheck className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{application.documents} documents</span>
              </div>
            </div>
          )}

          {/* Verification Status */}
          <div className={`flex items-center space-x-4 ${viewMode === 'list' ? 'text-xs' : 'text-sm'}`}>
            <div className="flex items-center space-x-1">
              <CheckCircle className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-green-500`} />
              <span className="text-gray-600 dark:text-gray-400">Interview</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-green-500`} />
              <span className="text-gray-600 dark:text-gray-400">Verification</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-green-500`} />
              <span className="text-gray-600 dark:text-gray-400">Documents</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`${viewMode === 'list' ? 'mt-3 pt-3' : 'mt-6 pt-4'} border-t border-gray-200 dark:border-slate-700`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => openEndorseModal(application)}
                className={`flex items-center space-x-2 ${viewMode === 'list' ? 'px-4 py-2 text-sm font-semibold' : 'px-3 py-1.5 text-sm'} bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md flex-shrink-0`}
              >
                <Send className={`${viewMode === 'list' ? 'w-4 h-4' : 'w-4 h-4'}`} />
                <span>Endorse to SSC</span>
              </button>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button className={`${viewMode === 'list' ? 'p-2' : 'p-1.5'} bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md`} title="View Details">
                <Eye className={`${viewMode === 'list' ? 'w-5 h-5' : 'w-4 h-4'}`} />
              </button>
              <button className={`${viewMode === 'list' ? 'p-2' : 'p-1.5'} bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md`} title="Track Status">
                <ExternalLink className={`${viewMode === 'list' ? 'w-5 h-5' : 'w-4 h-4'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleSelectApplication = (id) => {
    setSelectedApplications(prev => 
      prev.includes(id) 
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === sortedApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(sortedApplications.map(app => app.id));
    }
  };

  const openEndorseModal = (application) => {
    setActiveApplication(application);
    setIsEndorseModalOpen(true);
  };

  const handleEndorseToSSC = async () => {
    if (!activeApplication) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update application status
      setApplications(prev => prev.map(app => 
        app.id === activeApplication.id 
          ? { ...app, endorsementStatus: 'endorsed', endorsedDate: new Date().toISOString() }
          : app
      ));
      
      setIsEndorseModalOpen(false);
      alert('Application successfully endorsed to SSC!');
    } catch (error) {
      console.error('Endorsement failed:', error);
      alert('Failed to endorse application. Please try again.');
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      category: 'all',
      level: 'all',
      school: 'all',
      endorsementStatus: 'all'
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
            Endorse to SSC
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Forward approved applications to Scholarship Selection Committee
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Bulk Endorse
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
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.endorsementStatus}
              onChange={(e) => updateFilter('endorsementStatus', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="ready">Ready for Endorsement</option>
              <option value="endorsed">Endorsed</option>
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
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="gwa">Sort by GWA</option>
              <option value="amount">Sort by Amount</option>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="Academic Excellence">Academic Excellence</option>
                  <option value="Financial Need">Financial Need</option>
                  <option value="Special Programs">Special Programs</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
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
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {hasActiveFilters() && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.endorsementStatus !== 'all' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                Status: {filters.endorsementStatus}
                <button onClick={() => updateFilter('endorsementStatus', 'all')} className="ml-1 hover:text-orange-600 dark:hover:text-orange-200">
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
        {selectedApplications.length > 0 && (
          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-800 dark:text-orange-200">
                {selectedApplications.length} application(s) selected
              </span>
              <div className="flex space-x-2">
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                  Endorse Selected
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Applications Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading applications...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      ) : sortedApplications.length === 0 ? (
        <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-12 text-center">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-3'}>
          {sortedApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}

      {/* Endorse Modal */}
      {isEndorseModalOpen && activeApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEndorseModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Endorse to SSC</h3>
              <button 
                onClick={() => setIsEndorseModalOpen(false)} 
                className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Application Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Student:</span>
                    <span className="ml-2 text-blue-900 dark:text-blue-100 font-medium">{activeApplication.name}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Student ID:</span>
                    <span className="ml-2 text-blue-900 dark:text-blue-100 font-medium">{activeApplication.studentId}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">School:</span>
                    <span className="ml-2 text-blue-900 dark:text-blue-100 font-medium">{activeApplication.schoolName}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Amount:</span>
                    <span className="ml-2 text-blue-900 dark:text-blue-100 font-medium">₱{activeApplication.approvedAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Verification Status</h4>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 dark:text-green-200">Interview Completed</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 dark:text-green-200">Verification Completed</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 dark:text-green-200">Documents Verified</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm">
                This application has completed all required verification steps and is ready for SSC review. 
                Click "Endorse to SSC" to forward this application to the Scholarship Selection Committee.
              </p>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsEndorseModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEndorseToSSC}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Endorse to SSC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EndorseToSSC;
