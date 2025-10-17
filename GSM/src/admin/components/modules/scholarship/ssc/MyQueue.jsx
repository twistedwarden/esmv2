import React, { useState, useEffect } from 'react';
import { useToast } from '../../../../../hooks/useToast';

function MyQueue() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
  });
  const { showToast } = useToast();

  // Fetch my assigned applications
  const fetchMyApplications = async (page = 1) => {
    try {
      setLoading(true);
      setError('');

      const { scholarshipApiService } = await import('../../../../../services/scholarshipApiService');
      const response = await scholarshipApiService.getMySscApplications({
        search: searchTerm || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        per_page: pagination.per_page,
        page: page
      });

      setApplications(response.data || []);
      setPagination({
        current_page: response.current_page || 1,
        per_page: response.per_page || 15,
        total: response.total || 0,
        last_page: response.last_page || 1
      });
    } catch (err) {
      setError('Failed to load your assigned applications');
      console.error('Error fetching my applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, [searchTerm, sortBy, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMyApplications();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectApplication = (applicationId) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map(app => app.id));
    }
  };

  const getStageBadge = (status) => {
    const stageMapping = {
      'ssc_document_verification': { label: 'Document Verification', color: 'bg-blue-100 text-blue-800' },
      'ssc_financial_review': { label: 'Financial Review', color: 'bg-yellow-100 text-yellow-800' },
      'ssc_academic_review': { label: 'Academic Review', color: 'bg-purple-100 text-purple-800' },
      'ssc_final_approval': { label: 'Final Approval', color: 'bg-green-100 text-green-800' },
    };

    const stage = stageMapping[status];
    // Show content when stage is available
    if (!stage) {
        return null;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stage.color}`}>
        {stage.label}
      </span>
    );
  };

  const getStageProgress = (application) => {
    const stages = [
      { key: 'ssc_document_verification', label: 'Documents' },
      { key: 'ssc_financial_review', label: 'Financial' },
      { key: 'ssc_academic_review', label: 'Academic' },
      { key: 'ssc_final_approval', label: 'Final' },
    ];

    const currentIndex = stages.findIndex(stage => stage.key === application.status);
    
    return (
      <div className="flex items-center space-x-2">
        {stages.map((stage, index) => (
          <div key={stage.key} className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${
              index <= currentIndex 
                ? 'bg-orange-500' 
                : 'bg-gray-200'
            }`} />
            {index < stages.length - 1 && (
              <div className={`w-8 h-0.5 ${
                index < currentIndex 
                  ? 'bg-orange-500' 
                  : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
        <span className="ml-2 text-xs text-gray-500">
          {stages[currentIndex]?.label || 'Unknown'}
        </span>
      </div>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-gray-600">Loading your assigned applications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => fetchMyApplications()}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            My Assigned Applications
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Applications assigned to your role for review
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {pagination.total} applications
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="block px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="updated_at-desc">Latest Updated</option>
              <option value="updated_at-asc">Oldest Updated</option>
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="requested_amount-desc">Highest Amount</option>
              <option value="requested_amount-asc">Lowest Amount</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No applications assigned</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You don't have any applications assigned to your role at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(application.id)}
                      onChange={() => handleSelectApplication(application.id)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <div className="flex items-center space-x-2">
                      {getStageBadge(application.status)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {application.application_number}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {application.student?.first_name} {application.student?.last_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {application.student?.student_id_number}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">School</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {application.school?.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Requested Amount</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(application.requested_amount)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Progress</p>
                    {getStageProgress(application)}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Updated: {formatDate(application.updated_at)}</span>
                    <span>Category: {application.category?.name}</span>
                  </div>
                </div>

                <div className="ml-6 flex flex-col space-y-2">
                  <button
                    className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    Review
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchMyApplications(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            
            <button
              onClick={() => fetchMyApplications(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyQueue;
