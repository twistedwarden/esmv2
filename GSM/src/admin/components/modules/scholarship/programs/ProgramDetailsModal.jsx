import React, { useState, useEffect } from 'react';
import { X, Edit, Trash2, ToggleLeft, ToggleRight, Calendar, Users, PhilippinePeso, Award } from 'lucide-react';
import { scholarshipApiService } from '../../../../../services/scholarshipApiService';

const ProgramDetailsModal = ({ isOpen, onClose, programId, onEdit, onDelete, onStatusToggle }) => {
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && programId) {
      loadProgram();
    }
  }, [isOpen, programId]);

  const loadProgram = async () => {
    setLoading(true);
    setError('');
    try {
      const programData = await scholarshipApiService.getScholarshipProgram(programId);
      setProgram(programData);
    } catch (err) {
      setError(err.message || 'Failed to load program details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    try {
      const updatedProgram = await scholarshipApiService.toggleProgramStatus(programId);
      setProgram(updatedProgram);
      onStatusToggle?.(updatedProgram);
    } catch (err) {
      setError(err.message || 'Failed to toggle program status');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
      try {
        await scholarshipApiService.deleteScholarshipProgram(programId);
        onDelete?.(programId);
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete program');
      }
    }
  };

  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
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

  if (loading) {
    return (
      <div className="fixed inset-0 backdrop-blur bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-4xl mx-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading program details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 backdrop-blur bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-4xl mx-4">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!program) return null;

  return (
    <div className="fixed inset-0 backdrop-blur bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {program.name}
              </h2>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(program.status)}`}>
                {program.status}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(program.type)}`}>
                {formatType(program.type)}
              </span>
            </div>
            {program.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {program.description}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Award Amount</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ₱{program.award_amount?.toLocaleString()}
                </p>
              </div>
              <Award className="w-6 h-6 text-orange-500" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recipients</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {program.current_recipients}/{program.max_recipients}
                </p>
              </div>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ₱{program.total_budget?.toLocaleString()}
                </p>
              </div>
              <PhilippinePeso className="w-6 h-6 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Budget Used</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {program.budget_utilization_percentage?.toFixed(1)}%
                </p>
              </div>
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Budget Utilization Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Budget Utilization</span>
            <span className="text-gray-900 dark:text-white font-medium">
              ₱{program.budget_used?.toLocaleString()} of ₱{program.total_budget?.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
            <div 
              className="bg-orange-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${program.budget_utilization_percentage || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Program Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Key Dates</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Application Deadline:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(program.application_deadline).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(program.start_date).toLocaleDateString()}
                </span>
              </div>
              {program.end_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(program.end_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Program Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(program.status)}`}>
                  {program.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${program.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {program.is_active ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Accepting Applications:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${program.is_accepting_applications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {program.is_accepting_applications ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        {program.requirements && program.requirements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Requirements</h3>
            <ul className="list-disc list-inside space-y-1">
              {program.requirements.map((req, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-400">
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits */}
        {program.benefits && program.benefits.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Benefits</h3>
            <ul className="list-disc list-inside space-y-1">
              {program.benefits.map((benefit, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-400">
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Application Instructions */}
        {program.application_instructions && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Application Instructions</h3>
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {program.application_instructions}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-slate-700">
          <div className="flex space-x-3">
            <button
              onClick={() => onEdit?.(program)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Program
            </button>
            <button
              onClick={handleStatusToggle}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
            >
              {program.status === 'active' ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
              {program.status === 'active' ? 'Pause' : 'Activate'}
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetailsModal;
