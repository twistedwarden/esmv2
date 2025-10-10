import React, { useEffect, useState } from 'react';
import { scholarshipApiService } from '../../../../../services/scholarshipApiService';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  User,
  Calendar,
  PhilippinePeso,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Star,
  AlertTriangle,
  CheckSquare,
  Square,
  RefreshCw,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  X,
  Plus,
  Minus,
  BarChart3,
  TrendingUp,
  Users,
  Award,
  BookOpen,
  School,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  FileCheck,
  Shield,
  Zap,
  AlertCircle,
  Flag,
  Edit3,
  Send,
  DollarSign
} from 'lucide-react';

function ScholarshipApplications() {
  // Core state
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    level: 'all',
    school: 'all',
    dateFrom: '',
    dateTo: '',
    minGwa: '',
    maxGwa: '',
    priority: 'all'
  });
  
  // UI state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeApplication, setActiveApplication] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [approveAmount, setApproveAmount] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [complianceReason, setComplianceReason] = useState('');
  const [complianceType, setComplianceType] = useState('incorrect_info');
  const [reviewAction, setReviewAction] = useState('approve'); // 'approve', 'compliance', 'reject'
  const [docDownloadingId, setDocDownloadingId] = useState(null);
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    underReview: 0
  });

  // Fetch applications
  useEffect(() => {
    fetchApplications();
  }, [filters, searchTerm]);

  const fetchApplications = async () => {
      try {
        setLoading(true);
        setError('');
      
        const params = {};
      if (filters.status !== 'all') params.status = filters.status;
        if (searchTerm) params.search = searchTerm;

        const resp = await scholarshipApiService.getApplications(params);
        const list = Array.isArray(resp.data) ? resp.data : [];
      
        const mapped = list.map(a => ({
          id: a.id,
          name: `${a.student?.first_name ?? ''} ${a.student?.last_name ?? ''}`.trim() || 'Unknown',
          studentId: a.student?.student_id_number || a.student_id || '',
          email: a.student?.email_address || '',
          phone: a.student?.contact_number || '',
          scholarIdNumber: a.application_number || '',
          schoolName: a.school?.name || '',
          gradeYearLevel: a.student?.current_academic_record?.year_level || '',
          generalWeightedAverage: a.student?.current_academic_record?.general_weighted_average || a.student?.current_academic_record?.gpa || '',
          scholarshipCategory: a.category?.name || '',
          scholarshipSubCategory: a.subcategory?.name || '',
          currentEducationalLevel: a.student?.current_academic_record?.educational_level || '',
          schoolYear: a.student?.current_academic_record?.school_year || '',
          schoolTerm: a.student?.current_academic_record?.school_term || '',
          status: a.status,
          submittedDate: a.submitted_at || a.created_at,
        requestedAmount: a.requested_amount || 0,
        approvedAmount: a.approved_amount || 0,
        priority: a.priority || 'normal',
        documents: a.documents || []
        }));
      
        setApplications(mapped);
      updateStats(mapped);
      } catch (e) {
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

  const updateStats = (apps) => {
    const newStats = {
      total: apps.length,
      pending: apps.filter(app => app.status === 'pending').length,
      approved: apps.filter(app => app.status === 'approved').length,
      rejected: apps.filter(app => app.status === 'rejected').length,
      underReview: apps.filter(app => app.status === 'under_review').length
    };
    setStats(newStats);
  };

  // Filter and sort applications
  const filteredApplications = applications.filter(app => {
    const matchesStatus = filters.status === 'all' || app.status === filters.status;
    const matchesCategory = filters.category === 'all' || (app.scholarshipCategory || '').toLowerCase().includes(filters.category.toLowerCase());
    const matchesLevel = filters.level === 'all' || (app.currentEducationalLevel || '').toLowerCase().includes(filters.level.toLowerCase());
    const matchesSchool = filters.school === 'all' || (app.schoolName || '').toLowerCase().includes(filters.school.toLowerCase());
    const matchesPriority = filters.priority === 'all' || app.priority === filters.priority;
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (app.schoolName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (app.scholarshipCategory || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date range filter
    const appDate = new Date(app.submittedDate);
    const matchesDateFrom = !filters.dateFrom || appDate >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || appDate <= new Date(filters.dateTo);
    
    // GWA range filter
    const gwa = parseFloat(app.generalWeightedAverage || 0);
    const matchesMinGwa = !filters.minGwa || gwa >= parseFloat(filters.minGwa);
    const matchesMaxGwa = !filters.maxGwa || gwa <= parseFloat(filters.maxGwa);
    
    return matchesStatus && matchesCategory && matchesLevel && matchesSchool && 
           matchesPriority && matchesSearch && matchesDateFrom && matchesDateTo && 
           matchesMinGwa && matchesMaxGwa;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'gwa':
        aValue = parseFloat(a.generalWeightedAverage || 0);
        bValue = parseFloat(b.generalWeightedAverage || 0);
        break;
      case 'amount':
        aValue = parseFloat(a.requestedAmount || 0);
        bValue = parseFloat(b.requestedAmount || 0);
        break;
      case 'date':
      default:
        aValue = new Date(a.submittedDate);
        bValue = new Date(b.submittedDate);
        break;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Status helpers
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'under_review':
        return <FileText className="w-4 h-4" />;
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

  // Selection handlers
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

  // Filter handlers
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      category: 'all',
      level: 'all',
      school: 'all',
      dateFrom: '',
      dateTo: '',
      minGwa: '',
      maxGwa: '',
      priority: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== 'all' && value !== '') || searchTerm;
  };

  // Action handlers
  const openReview = async (app) => {
    try {
      console.log('Opening review modal for application:', app);
      setIsReviewModalOpen(true);
      setReviewLoading(true);
      setReviewAction('approve'); // Default to approve view
      
      // Ensure we have a valid application object
      if (!app || !app.id) {
        console.error('Invalid application object:', app);
        setActiveApplication(null);
        return;
      }

      try {
        const detailed = await scholarshipApiService.getApplication(app.id);
        setActiveApplication(detailed || app);
        setApproveAmount(detailed?.approved_amount || '');
      } catch (apiError) {
        console.warn('Failed to fetch detailed application, using basic data:', apiError);
        setActiveApplication(app);
      }
      
      setRejectReason('');
      setComplianceReason('');
      setComplianceType('incorrect_info');
    } catch (error) {
      console.error('Error opening review modal:', error);
      setActiveApplication(null);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!activeApplication) return;
    setReviewLoading(true);
    try {
      const amt = parseFloat(approveAmount || '0');
      await scholarshipApiService.approveApplication(activeApplication.id, isNaN(amt) ? 0 : amt);
      await fetchApplications();
      setIsReviewModalOpen(false);
    } catch (e) {
      console.error('Approve failed', e);
      alert('Approve failed. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReject = async () => {
    if (!activeApplication) return;
    if (!rejectReason?.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    setReviewLoading(true);
    try {
      await scholarshipApiService.rejectApplication(activeApplication.id, rejectReason.trim());
      await fetchApplications();
      setIsReviewModalOpen(false);
    } catch (e) {
      console.error('Reject failed', e);
      alert('Reject failed. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleComplianceSubmit = async () => {
    if (!activeApplication) return;
    if (!complianceReason?.trim()) {
      alert('Please enter a compliance reason.');
      return;
    }
    
    setReviewLoading(true);
    try {
      // Here you would call your API to flag the application for compliance issues
      console.log('Flagging application for compliance:', {
        applicationId: activeApplication.id,
        type: complianceType,
        reason: complianceReason.trim()
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await fetchApplications();
      setIsReviewModalOpen(false);
      alert('Application flagged for compliance review. Student will be notified to correct the information.');
    } catch (e) {
      console.error('Compliance flagging failed', e);
      alert('Failed to flag application for compliance. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleViewDocument = (docId, fileName) => {
    console.log('Viewing document:', docId, fileName);
    // Implement document viewing logic here
    alert(`Viewing document: ${fileName}`);
  };

  const handleDownloadDocument = async (docId, fileName) => {
    setDocDownloadingId(docId);
    try {
      console.log('Downloading document:', docId, fileName);
      // Implement document download logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate download
      alert(`Downloaded: ${fileName}`);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDocDownloadingId(null);
    }
  };


  // Application Card Component
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
                <User className={`${viewMode === 'list' ? 'h-4 w-4' : 'h-6 w-6'} text-orange-600 dark:text-orange-400`} />
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
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
              {getStatusIcon(application.status)}
              <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
            </span>
            {application.priority !== 'normal' && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(application.priority)}`}>
                <Star className="w-3 h-3 mr-1" />
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
            <span className="truncate">{application.schoolName || 'No school specified'}</span>
          </div>

          {/* Academic Info - Responsive Grid */}
          <div className={`grid gap-3 ${
            viewMode === 'list' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
              : 'grid-cols-1 sm:grid-cols-2'
          }`}>
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} min-w-0`}>
              <GraduationCap className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">GWA:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {application.generalWeightedAverage || 'N/A'}
              </span>
            </div>
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} min-w-0`}>
              <BookOpen className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">Level:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {application.currentEducationalLevel || 'N/A'}
              </span>
            </div>
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} min-w-0`}>
              <Award className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">Category:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {application.scholarshipCategory || 'N/A'}
              </span>
            </div>
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} min-w-0`}>
              <PhilippinePeso className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">Amount:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">
                ₱{parseFloat(application.requestedAmount || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Additional Info for List View */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 min-w-0">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Submitted: {new Date(application.submittedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 min-w-0">
                <FileCheck className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{application.documents?.length || 0} documents</span>
              </div>
            </div>
          )}

          {/* Grid View Additional Info */}
          {viewMode === 'grid' && (
            <>
              {/* Submitted Date */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 min-w-0">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Submitted: {new Date(application.submittedDate).toLocaleDateString()}</span>
              </div>

              {/* Documents Count */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 min-w-0">
                <FileCheck className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{application.documents?.length || 0} documents uploaded</span>
              </div>
            </>
          )}
        </div>

        {/* Actions - Responsive Layout */}
        <div className={`${viewMode === 'list' ? 'mt-3 pt-3' : 'mt-6 pt-4'} border-t border-gray-200 dark:border-slate-700`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => openReview(application)}
                className={`flex items-center space-x-2 ${viewMode === 'list' ? 'px-4 py-2 text-sm font-semibold' : 'px-3 py-1.5 text-sm'} bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md flex-shrink-0`}
              >
                <Eye className={`${viewMode === 'list' ? 'w-4 h-4' : 'w-4 h-4'}`} />
                <span>Review</span>
              </button>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button className={`${viewMode === 'list' ? 'p-2' : 'p-1.5'} bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md`} title="Approve">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Scholarship Applications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review and manage scholarship applications
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Review Selected
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Under Review</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.underReview}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
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
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
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
                  <option value="tertiary">Tertiary Students</option>
                  <option value="senior high">Senior High School</option>
                  <option value="technical">Technical Vocational</option>
                  <option value="als">Alternative Learning System</option>
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
                  <option value="senior high school">Senior High School</option>
                  <option value="tertiary">Tertiary/College</option>
                  <option value="technical">Technical Vocational</option>
                  <option value="graduate">Graduate School</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => updateFilter('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">School</label>
                <select
                  value={filters.school}
                  onChange={(e) => updateFilter('school', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Schools</option>
                  <option value="university">University</option>
                  <option value="college">College</option>
                  <option value="high school">High School</option>
                </select>
              </div>
                </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                </div>
              
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                </div>
              
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min GWA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={filters.minGwa}
                  onChange={(e) => updateFilter('minGwa', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max GWA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={filters.maxGwa}
                  onChange={(e) => updateFilter('maxGwa', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
            </div>
          </div>
        </div>
      )}

        {/* Active Filter Chips */}
        {hasActiveFilters() && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.status !== 'all' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                Status: {filters.status}
                <button onClick={() => updateFilter('status', 'all')} className="ml-1 hover:text-orange-600 dark:hover:text-orange-200">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Category: {filters.category}
                <button onClick={() => updateFilter('category', 'all')} className="ml-1 hover:text-blue-600 dark:hover:text-blue-200">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.level !== 'all' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                Level: {filters.level}
                <button onClick={() => updateFilter('level', 'all')} className="ml-1 hover:text-green-600 dark:hover:text-green-200">
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
                <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                  Approve
                      </button>
                <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                  Reject
                      </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                  Mark for Review
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
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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

      {/* Review Modal - Large Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsReviewModalOpen(false)} />
          <div className="relative z-10 w-full max-w-7xl h-[90vh] bg-white dark:bg-slate-800 rounded-xl shadow-2xl flex flex-col lg:flex-row overflow-hidden">
            {/* Left Sidebar - Actions */}
            <div className="w-full lg:w-80 bg-gray-50 dark:bg-slate-900 border-r-0 lg:border-r border-b lg:border-b-0 border-gray-200 dark:border-slate-700 flex flex-col flex-shrink-0 max-h-96 lg:max-h-none overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review Application</h3>
                  <button 
                    onClick={() => setIsReviewModalOpen(false)} 
                    className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 lg:p-6 space-y-2 lg:space-y-3">
                <button
                  onClick={() => setReviewAction('approve')}
                  className={`w-full p-3 lg:p-4 rounded-lg border-2 transition-all ${
                    reviewAction === 'approve'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                    <div className="text-left">
                      <div className="font-semibold text-sm lg:text-base">Approve</div>
                      <div className="text-xs lg:text-sm opacity-75">Approve this application</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setReviewAction('compliance')}
                  className={`w-full p-3 lg:p-4 rounded-lg border-2 transition-all ${
                    reviewAction === 'compliance'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                      : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <Flag className="w-4 h-4 lg:w-5 lg:h-5" />
                    <div className="text-left">
                      <div className="font-semibold text-sm lg:text-base">Compliance</div>
                      <div className="text-xs lg:text-sm opacity-75">Flag for compliance issues</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setReviewAction('reject')}
                  className={`w-full p-3 lg:p-4 rounded-lg border-2 transition-all ${
                    reviewAction === 'reject'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <XCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                    <div className="text-left">
                      <div className="font-semibold text-sm lg:text-base">Reject</div>
                      <div className="text-xs lg:text-sm opacity-75">Reject this application</div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Action Form */}
              <div className="flex-1 p-4 lg:p-6">
                {reviewAction === 'approve' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Approved Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={approveAmount}
                        onChange={(e) => setApproveAmount(e.target.value)}
                        placeholder="Enter approved amount"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <button
                      onClick={handleApprove}
                      disabled={reviewLoading || !approveAmount.trim()}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {reviewLoading ? 'Processing...' : 'Approve Application'}
                    </button>
                  </div>
                )}

                {reviewAction === 'compliance' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Issue Type
                      </label>
                      <select
                        value={complianceType}
                        onChange={(e) => setComplianceType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="incorrect_info">Incorrect Information</option>
                        <option value="missing_documents">Missing Documents</option>
                        <option value="invalid_documents">Invalid Documents</option>
                        <option value="incomplete_application">Incomplete Application</option>
                        <option value="eligibility_issues">Eligibility Issues</option>
                        <option value="academic_requirements">Academic Requirements Not Met</option>
                        <option value="financial_documents">Financial Documents Issues</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Detailed Reason
                      </label>
                      <textarea
                        value={complianceReason}
                        onChange={(e) => setComplianceReason(e.target.value)}
                        placeholder="Please provide specific details about the compliance issue..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                      />
                    </div>
                    <button
                      onClick={handleComplianceSubmit}
                      disabled={reviewLoading || !complianceReason.trim()}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {reviewLoading ? 'Processing...' : 'Flag for Compliance'}
                    </button>
                  </div>
                )}

                {reviewAction === 'reject' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rejection Reason
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Please provide a detailed reason for rejection..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                      />
                    </div>
                    <button
                      onClick={handleReject}
                      disabled={reviewLoading || !rejectReason.trim()}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {reviewLoading ? 'Processing...' : 'Reject Application'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Application Details */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 min-h-0">
              <div className="p-4 lg:p-6">
                {reviewLoading && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-gray-500 mx-auto mb-4" />
                      <div className="text-gray-500">Loading application details...</div>
                    </div>
                  </div>
                )}
                
                {!reviewLoading && activeApplication ? (
                  <div className="space-y-8">
                    {console.log('Rendering application details for:', activeApplication)}
                    {/* Application Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {activeApplication.student?.first_name || 'N/A'} {activeApplication.student?.last_name || 'N/A'}
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {activeApplication.student?.student_id_number || 'N/A'} • {activeApplication.student?.email_address || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Application #{activeApplication.application_number || activeApplication.id || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activeApplication.status || 'pending')}`}>
                            {getStatusIcon(activeApplication.status || 'pending')}
                            <span className="ml-2 capitalize">{(activeApplication.status || 'pending').replace('_', ' ')}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-500" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Full Name</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activeApplication.student?.first_name} {activeApplication.student?.middle_name} {activeApplication.student?.last_name}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activeApplication.student?.birth_date ? new Date(activeApplication.student.birth_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Contact Number</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activeApplication.student?.contact_number || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Address</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activeApplication.student?.addresses?.[0]?.address_line_1 || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">City</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activeApplication.student?.addresses?.[0]?.city || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Province</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activeApplication.student?.addresses?.[0]?.province || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <School className="w-5 h-5 mr-2 text-green-500" />
                        Academic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">School</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activeApplication.school?.name || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Educational Level</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activeApplication.student?.current_academic_record?.educational_level || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Year Level</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activeApplication.student?.current_academic_record?.year_level || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">GWA/GPA</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activeApplication.student?.current_academic_record?.general_weighted_average || activeApplication.student?.current_academic_record?.gpa || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">School Year</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activeApplication.student?.current_academic_record?.school_year || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Semester</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activeApplication.student?.current_academic_record?.school_term || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-yellow-500" />
                        Financial Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Requested Amount</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            ₱{activeApplication.requested_amount ? parseFloat(activeApplication.requested_amount).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Approved Amount</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            ₱{activeApplication.approved_amount ? parseFloat(activeApplication.approved_amount).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Family Income</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activeApplication.student?.financial_information?.family_monthly_income_range || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Student Employed</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activeApplication.student?.is_employed ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">4Ps Beneficiary</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activeApplication.student?.financial_information?.is_4ps_beneficiary ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">PWD</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activeApplication.student?.is_pwd ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <FileCheck className="w-5 h-5 mr-2 text-purple-500" />
                        Documents
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">File</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {(activeApplication.documents || []).length === 0 && (
                              <tr><td className="px-4 py-3 text-gray-500 dark:text-gray-400" colSpan={4}>No documents uploaded.</td></tr>
                            )}
                            {(activeApplication.documents || []).map(doc => (
                              <tr key={doc.id}>
                                <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{doc.document_type?.name || '—'}</td>
                                <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{doc.file_name}</td>
                                <td className="px-4 py-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    doc.status === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    doc.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  }`}>
                                    {doc.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleViewDocument(doc.id, doc.file_name)}
                                      className="p-1.5 rounded border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400"
                                      title="View"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDownloadDocument(doc.id, doc.file_name)}
                                      className="p-1.5 rounded border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400"
                                      disabled={docDownloadingId === doc.id}
                                      title="Download"
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Application Not Found</h3>
                      <p className="text-gray-500 dark:text-gray-400">Unable to load application details. Please try again.</p>
                      <button
                        onClick={() => setIsReviewModalOpen(false)}
                        className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        Close Modal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ScholarshipApplications; 