import React, { useEffect, useState } from 'react';
import { scholarshipApiService } from '../../../../services/scholarshipApiService';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  PhilippinePeso, 
  Calendar, 
  Award,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import CreateProgramModal from './programs/CreateProgramModal';
import ProgramDetailsModal from './programs/ProgramDetailsModal';

function ScholarshipPrograms() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState(null);

  const [programs, setPrograms] = useState([]);
  const [statistics, setStatistics] = useState({
    total_programs: 0,
    active_programs: 0,
    total_recipients: 0,
    total_budget: 0,
    budget_used: 0,
    budget_utilization_percentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPrograms();
    loadStatistics();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await scholarshipApiService.getScholarshipPrograms({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        per_page: 50
      });
      setPrograms(response.data || []);
    } catch (e) {
      setError('Failed to load scholarship programs');
      console.error('Error loading programs:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await scholarshipApiService.getProgramStatistics();
      setStatistics(stats);
    } catch (e) {
      console.error('Error loading statistics:', e);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadPrograms();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'merit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'need_based':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'field_specific':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'service_based':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400';
      case 'special':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      case 'renewal':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatType = (type) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleViewDetails = (programId) => {
    setSelectedProgramId(programId);
    setShowDetailsModal(true);
  };

  const handleEditProgram = (program) => {
    // TODO: Implement edit functionality
    console.log('Edit program:', program);
  };

  const handleDeleteProgram = (programId) => {
    // TODO: Implement delete functionality
    console.log('Delete program:', programId);
    loadPrograms();
  };

  const handleStatusToggle = (program) => {
    // TODO: Implement status toggle functionality
    console.log('Toggle status for program:', program);
    loadPrograms();
  };

  const handleCreateSuccess = () => {
    loadPrograms();
    loadStatistics();
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Scholarship Programs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and monitor scholarship programs
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Program
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Programs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statistics.active_programs || 0}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Recipients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statistics.total_recipients || 0}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₱{(statistics.total_budget || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
              <PhilippinePeso className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Budget Used</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(statistics.budget_utilization_percentage || 0).toFixed(1)}%
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>

          <button className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading && (
          <div className="col-span-2 p-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded">Loading programs…</div>
        )}
        {error && (
          <div className="col-span-2 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded">{error}</div>
        )}
        {programs.length === 0 && !loading && (
          <div className="col-span-2 p-8 text-center text-gray-500 dark:text-gray-400">
            <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No programs found</p>
            <p>Create your first scholarship program to get started.</p>
          </div>
        )}
        {programs.map((program) => (
          <div key={program.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {program.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(program.status)}`}>
                      {program.status}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {program.description}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(program.type)}`}>
                    {formatType(program.type)}
                  </span>
                </div>
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Award Amount</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ₱{program.award_amount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Recipients</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {program.current_recipients}/{program.max_recipients}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Budget Utilization</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {program.budget_utilization_percentage?.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${program.budget_utilization_percentage || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Deadline: {new Date(program.application_deadline).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <PhilippinePeso className="w-4 h-4 mr-1" />
                  {program.total_budget?.toLocaleString()} budget
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => handleViewDetails(program.id)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                <button 
                  onClick={() => handleEditProgram(program)}
                  className="bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteProgram(program.id)}
                  className="bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <CreateProgramModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <ProgramDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        programId={selectedProgramId}
        onEdit={handleEditProgram}
        onDelete={handleDeleteProgram}
        onStatusToggle={handleStatusToggle}
      />
    </div>
  );
}

export default ScholarshipPrograms; 