import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  Phone,
  Mail,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  X,
  Video,
  MessageSquare,
  FileText
} from 'lucide-react';

function InterviewSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    interviewer: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockSchedules = [
        {
          id: 1,
          studentName: 'Juan Dela Cruz',
          studentId: '2024-001',
          studentEmail: 'juan.delacruz@email.com',
          studentPhone: '+63 912 345 6789',
          interviewer: 'Dr. Maria Santos',
          interviewerEmail: 'maria.santos@scholarship.gov.ph',
          interviewDate: '2024-02-15',
          interviewTime: '10:00',
          duration: 30,
          type: 'online',
          platform: 'Zoom',
          meetingLink: 'https://zoom.us/j/123456789',
          status: 'scheduled',
          notes: 'Initial interview for scholarship application',
          documents: ['Transcript', 'Recommendation Letter'],
          createdAt: '2024-01-20'
        },
        {
          id: 2,
          studentName: 'Maria Garcia',
          studentId: '2024-002',
          studentEmail: 'maria.garcia@email.com',
          studentPhone: '+63 923 456 7890',
          interviewer: 'Prof. Pedro Reyes',
          interviewerEmail: 'pedro.reyes@scholarship.gov.ph',
          interviewDate: '2024-02-16',
          interviewTime: '14:00',
          duration: 45,
          type: 'in-person',
          platform: null,
          meetingLink: null,
          location: 'Scholarship Office, Room 201',
          status: 'completed',
          notes: 'Interview completed successfully',
          documents: ['Transcript', 'Recommendation Letter', 'Financial Documents'],
          createdAt: '2024-01-21'
        },
        {
          id: 3,
          studentName: 'Pedro Santos',
          studentId: '2024-003',
          studentEmail: 'pedro.santos@email.com',
          studentPhone: '+63 934 567 8901',
          interviewer: 'Dr. Ana Lopez',
          interviewerEmail: 'ana.lopez@scholarship.gov.ph',
          interviewDate: '2024-02-17',
          interviewTime: '09:30',
          duration: 30,
          type: 'online',
          platform: 'Google Meet',
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          status: 'cancelled',
          notes: 'Student requested to reschedule',
          documents: ['Transcript'],
          createdAt: '2024-01-22'
        }
      ];
      
      setSchedules(mockSchedules);
    } catch (e) {
      setError('Failed to load interview schedules');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'rescheduled':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'online':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'in-person':
        return <MapPin className="w-4 h-4 text-green-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.interviewer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || schedule.status === filters.status;
    const matchesInterviewer = filters.interviewer === 'all' || schedule.interviewer === filters.interviewer;
    
    // Date range filter
    const scheduleDate = new Date(schedule.interviewDate);
    const matchesDateFrom = !filters.dateFrom || scheduleDate >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || scheduleDate <= new Date(filters.dateTo);
    
    return matchesSearch && matchesStatus && matchesInterviewer && matchesDateFrom && matchesDateTo;
  });

  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'student':
        aValue = a.studentName.toLowerCase();
        bValue = b.studentName.toLowerCase();
        break;
      case 'interviewer':
        aValue = a.interviewer.toLowerCase();
        bValue = b.interviewer.toLowerCase();
        break;
      case 'date':
      default:
        aValue = new Date(a.interviewDate);
        bValue = new Date(b.interviewDate);
        break;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const ScheduleCard = ({ schedule }) => (
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
                checked={selectedSchedules.includes(schedule.id)}
                onChange={() => handleSelectSchedule(schedule.id)}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
            </div>
            <div className={`flex-shrink-0 ${viewMode === 'list' ? 'h-8 w-8' : 'h-12 w-12'}`}>
              <div className={`${viewMode === 'list' ? 'h-8 w-8' : 'h-12 w-12'} rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center`}>
                <Calendar className={`${viewMode === 'list' ? 'h-4 w-4' : 'h-6 w-6'} text-blue-600 dark:text-blue-400`} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`${viewMode === 'list' ? 'text-base font-semibold' : 'text-lg font-semibold'} text-gray-900 dark:text-white truncate`}>
                {schedule.studentName}
              </h3>
              <p className={`${viewMode === 'list' ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400 truncate`}>
                {schedule.studentId}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
              {getStatusIcon(schedule.status)}
              <span className="ml-1 capitalize">{schedule.status}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className={viewMode === 'list' ? 'space-y-2' : 'space-y-4'}>
          {/* Interview Details */}
          <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
            <Calendar className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} flex-shrink-0`} />
            <span className="truncate">
              {new Date(schedule.interviewDate).toLocaleDateString()} at {schedule.interviewTime}
            </span>
          </div>

          {/* Interview Info */}
          <div className={`grid gap-3 ${
            viewMode === 'list' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
              : 'grid-cols-1 sm:grid-cols-2'
          }`}>
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} min-w-0`}>
              <Users className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">Interviewer:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {schedule.interviewer}
              </span>
            </div>
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} min-w-0`}>
              {getTypeIcon(schedule.type)}
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">Type:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {schedule.type}
              </span>
            </div>
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} min-w-0`}>
              <Clock className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">Duration:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {schedule.duration} min
              </span>
            </div>
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} min-w-0`}>
              <FileText className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">Documents:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {schedule.documents.length}
              </span>
            </div>
          </div>

          {/* Additional Info for List View */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 min-w-0">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{schedule.studentEmail}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 min-w-0">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{schedule.studentPhone}</span>
              </div>
            </div>
          )}

          {/* Platform/Location Info */}
          {schedule.type === 'online' && schedule.platform && (
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
              <Video className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} flex-shrink-0`} />
              <span className="truncate">{schedule.platform}</span>
            </div>
          )}

          {schedule.type === 'in-person' && schedule.location && (
            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
              <MapPin className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} flex-shrink-0`} />
              <span className="truncate">{schedule.location}</span>
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
              {schedule.type === 'online' && schedule.meetingLink && (
                <button
                  className={`flex items-center space-x-2 ${viewMode === 'list' ? 'px-4 py-2 text-sm font-semibold' : 'px-3 py-1.5 text-sm'} bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md flex-shrink-0`}
                >
                  <Video className={`${viewMode === 'list' ? 'w-4 h-4' : 'w-4 h-4'}`} />
                  <span>Join Meeting</span>
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button className={`${viewMode === 'list' ? 'p-2' : 'p-1.5'} bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md`} title="Edit">
                <Edit className={`${viewMode === 'list' ? 'w-5 h-5' : 'w-4 h-4'}`} />
              </button>
              <button className={`${viewMode === 'list' ? 'p-2' : 'p-1.5'} bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md`} title="Delete">
                <Trash2 className={`${viewMode === 'list' ? 'w-5 h-5' : 'w-4 h-4'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleSelectSchedule = (id) => {
    setSelectedSchedules(prev => 
      prev.includes(id) 
        ? prev.filter(scheduleId => scheduleId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedSchedules.length === sortedSchedules.length) {
      setSelectedSchedules([]);
    } else {
      setSelectedSchedules(sortedSchedules.map(schedule => schedule.id));
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      interviewer: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== 'all' && value !== '') || searchTerm;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Interview Schedules
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and schedule scholarship interviews
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Interview
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
                placeholder="Search schedules..."
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
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
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
              <option value="student">Sort by Student</option>
              <option value="interviewer">Sort by Interviewer</option>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interviewer</label>
                <select
                  value={filters.interviewer}
                  onChange={(e) => updateFilter('interviewer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Interviewers</option>
                  <option value="Dr. Maria Santos">Dr. Maria Santos</option>
                  <option value="Prof. Pedro Reyes">Prof. Pedro Reyes</option>
                  <option value="Dr. Ana Lopez">Dr. Ana Lopez</option>
                </select>
              </div>

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
        {selectedSchedules.length > 0 && (
          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-800 dark:text-orange-200">
                {selectedSchedules.length} schedule(s) selected
              </span>
              <div className="flex space-x-2">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                  Send Reminders
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                  Cancel Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Schedules Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading schedules...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      ) : sortedSchedules.length === 0 ? (
        <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No schedules found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or create a new schedule.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-3'}>
          {sortedSchedules.map((schedule) => (
            <ScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
      )}

      {/* Create Schedule Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule New Interview</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Interview scheduling form would go here. This is a placeholder for the create interview functionality.
              </p>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                  Schedule Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewSchedules;
