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
  FileText,
  ChevronLeft,
  ChevronRight
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

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Create modal form state
  const [createFormData, setCreateFormData] = useState({
    interviewType: 'online',
    platform: 'zoom',
    meetingLink: '',
    studentId: '',
    interviewDate: '',
    interviewTime: '',
    duration: '30',
    interviewer: '',
    notes: ''
  });
  const [createFormErrors, setCreateFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use mock data for development (API not implemented yet)
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
          studentPhone: '+63 912 345 6790',
          interviewer: 'Prof. John Smith',
          interviewerEmail: 'john.smith@scholarship.gov.ph',
          interviewDate: '2024-02-16',
          interviewTime: '14:00',
          duration: 45,
          type: 'online',
          platform: 'Microsoft Teams',
          meetingLink: 'https://teams.microsoft.com/l/meetup-join/123456789',
          status: 'scheduled',
          notes: 'Follow-up interview for merit scholarship',
          documents: ['Transcript', 'Recommendation Letter', 'Portfolio'],
          createdAt: '2024-01-21'
        },
        {
          id: 3,
          studentName: 'Pedro Rodriguez',
          studentId: '2024-003',
          studentEmail: 'pedro.rodriguez@email.com',
          studentPhone: '+63 912 345 6791',
          interviewer: 'Dr. Ana Lopez',
          interviewerEmail: 'ana.lopez@scholarship.gov.ph',
          interviewDate: '2024-02-17',
          interviewTime: '09:30',
          duration: 60,
          type: 'online',
          platform: 'Google Meet',
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          status: 'completed',
          notes: 'Final interview for full scholarship',
          documents: ['Transcript', 'Recommendation Letter', 'Research Proposal'],
          createdAt: '2024-01-22'
        },
        {
          id: 4,
          studentName: 'Sofia Martinez',
          studentId: '2024-004',
          studentEmail: 'sofia.martinez@email.com',
          studentPhone: '+63 912 345 6792',
          interviewer: 'Dr. Carlos Reyes',
          interviewerEmail: 'carlos.reyes@scholarship.gov.ph',
          interviewDate: '2024-02-18',
          interviewTime: '11:00',
          duration: 30,
          type: 'online',
          platform: 'Cisco Webex',
          meetingLink: 'https://company.webex.com/meet/carlos.reyes',
          status: 'scheduled',
          notes: 'Interview for international scholarship program',
          documents: ['Transcript', 'Recommendation Letter', 'Language Certificate'],
          createdAt: '2024-01-23'
        }
      ];
      
      setSchedules(mockSchedules);
    } catch (e) {
      console.error('Error loading interview schedules:', e);
      setError('Failed to load interview schedules: ' + e.message);
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

  const handleCompleteInterview = async (scheduleId, result, notes = '') => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, status: 'completed', interviewResult: result, notes: notes }
          : schedule
      ));
      
        alert('Interview completed successfully');
    } catch (e) {
      console.error('Error completing interview:', e);
      alert('Failed to complete interview: ' + e.message);
    }
  };

  const handleRescheduleInterview = async (scheduleId, newDate, newTime, reason = '') => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, interviewDate: newDate, interviewTime: newTime, status: 'scheduled' }
          : schedule
      ));
      
        alert('Interview rescheduled successfully');
    } catch (e) {
      console.error('Error rescheduling interview:', e);
      alert('Failed to reschedule interview: ' + e.message);
    }
  };

  const handleCancelInterview = async (scheduleId, reason = '') => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, status: 'cancelled' }
          : schedule
      ));
      
        alert('Interview cancelled successfully');
    } catch (e) {
      console.error('Error cancelling interview:', e);
      alert('Failed to cancel interview: ' + e.message);
    }
  };

  const handleMarkNoShow = async (scheduleId, notes = '') => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, status: 'no_show' }
          : schedule
      ));
      
        alert('Interview marked as no show');
    } catch (e) {
      console.error('Error marking as no show:', e);
      alert('Failed to mark as no show: ' + e.message);
    }
  };

  const handleScheduleInterview = async (applicationId, interviewData) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // This function would typically add a new schedule to the list
      // For now, we'll just show a success message
        alert('Interview scheduled successfully');
    } catch (e) {
      console.error('Error scheduling interview:', e);
      alert('Failed to schedule interview: ' + e.message);
    }
  };

  const handleAutoScheduleInterview = async (applicationId) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // This function would typically add a new schedule to the list
      // For now, we'll just show a success message
        alert('Interview scheduled automatically');
    } catch (e) {
      console.error('Error auto-scheduling interview:', e);
      alert('Failed to auto-schedule interview: ' + e.message);
    }
  };

  // Bulk Operations
  const handleBulkSendReminders = async () => {
    if (selectedSchedules.length === 0) return;
    
    const confirmed = window.confirm(`Send reminders to ${selectedSchedules.length} student(s)?`);
    if (!confirmed) return;

    try {
      // For now, just show a success message
      // In a real implementation, this would send email/SMS reminders
      alert(`Reminders sent to ${selectedSchedules.length} student(s)`);
      setSelectedSchedules([]);
    } catch (e) {
      console.error('Error sending reminders:', e);
      alert('Failed to send some reminders: ' + e.message);
    }
  };

  const handleBulkCancel = async () => {
    if (selectedSchedules.length === 0) return;
    
    const reason = window.prompt(`Enter reason for cancelling ${selectedSchedules.length} interview(s):`);
    if (!reason) return;

    try {
      const promises = selectedSchedules.map(scheduleId => {
        return handleCancelInterview(scheduleId, reason);
      });

      await Promise.all(promises);
      setSelectedSchedules([]);
      alert(`Successfully cancelled ${selectedSchedules.length} interview(s)`);
    } catch (e) {
      console.error('Error in bulk cancel:', e);
      alert('Failed to cancel some interviews: ' + e.message);
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
                onClick={() => handleViewDetails(schedule)}
                className={`flex items-center space-x-2 ${viewMode === 'list' ? 'px-4 py-2 text-sm font-semibold' : 'px-3 py-1.5 text-sm'} bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md flex-shrink-0`}
              >
                <Eye className={`${viewMode === 'list' ? 'w-4 h-4' : 'w-4 h-4'}`} />
                <span>View Details</span>
              </button>
              {schedule.type === 'online' && schedule.meetingLink && (
                <button
                  onClick={() => handleJoinMeeting(schedule)}
                  className={`flex items-center space-x-2 ${viewMode === 'list' ? 'px-4 py-2 text-sm font-semibold' : 'px-3 py-1.5 text-sm'} bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md flex-shrink-0`}
                >
                  <Video className={`${viewMode === 'list' ? 'w-4 h-4' : 'w-4 h-4'}`} />
                  <span>Join Meeting</span>
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button 
                onClick={() => handleEditSchedule(schedule)}
                className={`${viewMode === 'list' ? 'p-2' : 'p-1.5'} bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md`} 
                title="Edit"
              >
                <Edit className={`${viewMode === 'list' ? 'w-5 h-5' : 'w-4 h-4'}`} />
              </button>
              <button 
                onClick={() => handleDeleteSchedule(schedule)}
                className={`${viewMode === 'list' ? 'p-2' : 'p-1.5'} bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md`} 
                title="Delete"
              >
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

  // Button handler functions
  const handleViewDetails = (schedule) => {
    setActiveSchedule(schedule);
    setIsViewModalOpen(true);
  };

  const handleEditSchedule = (schedule) => {
    setActiveSchedule(schedule);
    setIsEditModalOpen(true);
  };

  const handleDeleteSchedule = (schedule) => {
    setActiveSchedule(schedule);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSchedule = async () => {
    if (!activeSchedule) return;
    
    setActionLoading(true);
    try {
      // Since we're using mock data, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove from local state
      setSchedules(prev => prev.filter(s => s.id !== activeSchedule.id));
      setIsDeleteModalOpen(false);
      setActiveSchedule(null);
      
      // Show success message
      alert('Interview schedule deleted successfully!');
    } catch (error) {
      console.error('Error deleting interview schedule:', error);
      alert('Failed to delete interview schedule: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinMeeting = (schedule) => {
    if (schedule.meetingLink) {
      window.open(schedule.meetingLink, '_blank');
    } else {
      alert('No meeting link available for this interview.');
    }
  };

  // Form handling functions
  const handleCreateFormChange = (field, value) => {
    setCreateFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (createFormErrors[field]) {
      setCreateFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateCreateForm = () => {
    const errors = {};
    
    if (!createFormData.studentId) {
      errors.studentId = 'Please select a student';
    }
    if (!createFormData.interviewDate) {
      errors.interviewDate = 'Please select an interview date';
    }
    if (!createFormData.interviewTime) {
      errors.interviewTime = 'Please select an interview time';
    }
    if (!createFormData.interviewer) {
      errors.interviewer = 'Please enter interviewer name';
    }
    if (createFormData.interviewType === 'online' && !createFormData.meetingLink) {
      errors.meetingLink = 'Please enter meeting link for online interviews';
    }
    
    setCreateFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCreateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Here you would make the API call to create the interview schedule
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the new schedule to the list (mock data)
      const newSchedule = {
        id: Date.now(), // Temporary ID
        studentName: 'New Student', // This would come from the selected student
        studentId: createFormData.studentId,
        studentEmail: 'student@email.com',
        studentPhone: '+63 912 345 6789',
        interviewer: createFormData.interviewer,
        interviewerEmail: 'interviewer@email.com',
        interviewDate: createFormData.interviewDate,
        interviewTime: createFormData.interviewTime,
        duration: parseInt(createFormData.duration),
        type: createFormData.interviewType,
        platform: createFormData.interviewType === 'online' ? createFormData.platform : null,
        meetingLink: createFormData.interviewType === 'online' ? createFormData.meetingLink : null,
        location: createFormData.interviewType === 'in-person' ? 'TBD' : null,
        status: 'scheduled',
        notes: createFormData.notes,
        documents: ['Transcript', 'Recommendation Letter'],
        createdAt: new Date().toISOString()
      };
      
      setSchedules(prev => [newSchedule, ...prev]);
      setIsCreateModalOpen(false);
      setCreateFormData({
        interviewType: 'online',
        platform: 'zoom',
        meetingLink: '',
        studentId: '',
        interviewDate: '',
        interviewTime: '',
        duration: '30',
        interviewer: '',
        notes: ''
      });
      setCreateFormErrors({});
      
      alert('Interview schedule created successfully!');
    } catch (error) {
      console.error('Error creating interview schedule:', error);
      alert('Failed to create interview schedule: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setCreateFormData({
      interviewType: 'online',
      platform: 'zoom',
      meetingLink: '',
      studentId: '',
      interviewDate: '',
      interviewTime: '',
      duration: '30',
      interviewer: '',
      notes: ''
    });
    setCreateFormErrors({});
  };

  // Utility function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString; // Return original if parsing fails
    }
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
                className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'} transition-colors`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 ${viewMode === 'calendar' ? 'bg-orange-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'} rounded-r-lg transition-colors`}
              >
                <Calendar className="w-4 h-4" />
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
                <button 
                  onClick={handleBulkSendReminders}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Send Reminders
                </button>
                <button 
                  onClick={handleBulkCancel}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
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
      ) : viewMode === 'calendar' ? (
        <CalendarView schedules={sortedSchedules} />
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-3'}>
          {sortedSchedules.map((schedule) => (
            <ScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
      )}

      {/* Create Schedule Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule New Interview</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="space-y-6">
              {/* Interview Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Interview Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer ${
                    createFormData.interviewType === 'online' 
                      ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="interviewType"
                      value="online"
                      checked={createFormData.interviewType === 'online'}
                      onChange={(e) => handleCreateFormChange('interviewType', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <Video className={`w-5 h-5 ${createFormData.interviewType === 'online' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                      <div>
                        <div className={`text-sm font-medium ${createFormData.interviewType === 'online' ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>Online Interview</div>
                        <div className={`text-xs ${createFormData.interviewType === 'online' ? 'text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>Video conference meeting</div>
                      </div>
                    </div>
                  </label>
                  <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer ${
                    createFormData.interviewType === 'in-person' 
                      ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="interviewType"
                      value="in-person"
                      checked={createFormData.interviewType === 'in-person'}
                      onChange={(e) => handleCreateFormChange('interviewType', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <MapPin className={`w-5 h-5 ${createFormData.interviewType === 'in-person' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                      <div>
                        <div className={`text-sm font-medium ${createFormData.interviewType === 'in-person' ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>In-Person Interview</div>
                        <div className={`text-xs ${createFormData.interviewType === 'in-person' ? 'text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>Physical meeting location</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Online Platform Selection */}
              {createFormData.interviewType === 'online' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Online Platform
                  </label>
                  <select 
                    value={createFormData.platform}
                    onChange={(e) => handleCreateFormChange('platform', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="meet">Google Meet</option>
                    <option value="webex">Cisco Webex</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              {/* Meeting Link */}
              {createFormData.interviewType === 'online' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={createFormData.meetingLink}
                    onChange={(e) => handleCreateFormChange('meetingLink', e.target.value)}
                    placeholder="https://zoom.us/j/123456789"
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      createFormErrors.meetingLink ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-slate-600'
                    }`}
                  />
                  {createFormErrors.meetingLink && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{createFormErrors.meetingLink}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Enter the meeting URL that students will use to join the interview
                  </p>
                </div>
              )}

              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Student
                </label>
                <select 
                  value={createFormData.studentId}
                  onChange={(e) => handleCreateFormChange('studentId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    createFormErrors.studentId ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-slate-600'
                  }`}
                >
                  <option value="">Choose a student...</option>
                  <option value="1">John Doe (2024-001)</option>
                  <option value="2">Jane Smith (2024-002)</option>
                  <option value="3">Mike Johnson (2024-003)</option>
                </select>
                {createFormErrors.studentId && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{createFormErrors.studentId}</p>
                )}
              </div>

              {/* Interview Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interview Date
                  </label>
                  <input
                    type="date"
                    value={createFormData.interviewDate}
                    onChange={(e) => handleCreateFormChange('interviewDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      createFormErrors.interviewDate ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-slate-600'
                    }`}
                  />
                  {createFormErrors.interviewDate && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{createFormErrors.interviewDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interview Time
                  </label>
                  <input
                    type="time"
                    value={createFormData.interviewTime}
                    onChange={(e) => handleCreateFormChange('interviewTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      createFormErrors.interviewTime ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-slate-600'
                    }`}
                  />
                  {createFormErrors.interviewTime && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{createFormErrors.interviewTime}</p>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <select 
                  value={createFormData.duration}
                  onChange={(e) => handleCreateFormChange('duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>

              {/* Interviewer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interviewer
                </label>
                <input
                  type="text"
                  value={createFormData.interviewer}
                  onChange={(e) => handleCreateFormChange('interviewer', e.target.value)}
                  placeholder="Enter interviewer name"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    createFormErrors.interviewer ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-slate-600'
                  }`}
                />
                {createFormErrors.interviewer && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{createFormErrors.interviewer}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interview Notes
                </label>
                <textarea
                  rows={3}
                  value={createFormData.notes}
                  onChange={(e) => handleCreateFormChange('notes', e.target.value)}
                  placeholder="Any special instructions or notes for the interview..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetCreateForm();
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Schedule Interview</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && activeSchedule && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsViewModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interview Details</h3>
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Student Information */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Student Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{activeSchedule.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Student ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{activeSchedule.studentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{activeSchedule.studentEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{activeSchedule.studentPhone}</p>
                  </div>
                </div>
              </div>

              {/* Interview Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Interview Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date & Time</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(activeSchedule.interviewDate)} at {formatTime(activeSchedule.interviewTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                    <p className="font-medium text-gray-900 dark:text-white">{activeSchedule.duration || 'N/A'} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{activeSchedule.type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activeSchedule.status || 'unknown')}`}>
                      {getStatusIcon(activeSchedule.status || 'unknown')}
                      <span className="ml-1 capitalize">{activeSchedule.status || 'Unknown'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Meeting Details */}
              {activeSchedule.type === 'online' && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Meeting Details</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Platform</p>
                      <p className="font-medium text-gray-900 dark:text-white">{activeSchedule.platform}</p>
                    </div>
                    {activeSchedule.meetingLink && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Meeting Link</p>
                        <a 
                          href={activeSchedule.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                          {activeSchedule.meetingLink}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Interviewer Information */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Interviewer Information</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{activeSchedule.interviewer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{activeSchedule.interviewerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {activeSchedule.notes && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Notes</h4>
                  <p className="text-gray-700 dark:text-gray-300">{activeSchedule.notes}</p>
                </div>
              )}

              {/* Documents */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Required Documents</h4>
                <div className="flex flex-wrap gap-2">
                  {activeSchedule.documents.map((doc, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                Close
              </button>
              {activeSchedule.type === 'online' && activeSchedule.meetingLink && (
                <button
                  onClick={() => handleJoinMeeting(activeSchedule)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Meeting</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && activeSchedule && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Interview Schedule</h3>
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete the interview schedule for <strong>{activeSchedule.studentName}</strong>?
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Warning:</strong> This action cannot be undone. The interview schedule will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSchedule}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Schedule</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Calendar View Component
const CalendarView = ({ schedules }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };
  
  const getSchedulesForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(schedule => 
      schedule.interviewDate === dateStr
    );
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };
  
  const days = getDaysInMonth(currentDate);
  const monthName = formatDate(currentDate);
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {monthName}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const daySchedules = getSchedulesForDate(day);
            const isToday = day && day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border border-gray-200 dark:border-slate-700 ${
                  day ? 'bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-900'
                } ${isToday ? 'ring-2 ring-orange-500' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {daySchedules.slice(0, 3).map(schedule => (
                        <div
                          key={schedule.id}
                          className="text-xs p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded truncate"
                          title={`${schedule.studentName} - ${schedule.interviewTime}`}
                        >
                          {schedule.studentName}
                        </div>
                      ))}
                      {daySchedules.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{daySchedules.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InterviewSchedules;
