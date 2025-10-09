import React from 'react';
import { scholarshipApiService } from '../../../../services/scholarshipApiService';
import { 
  Search, 
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Award,
  DollarSign,
  Users,
  Tag,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  PhilippinePeso
} from 'lucide-react';

function ScholarshipPrograms() {
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [expandedCategories, setExpandedCategories] = React.useState(new Set());

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      const categoriesData = await scholarshipApiService.getScholarshipCategories();
      setCategories(categoriesData || []);
    } catch (e) {
      console.error('Error loading programs:', e);
      setError('Failed to load scholarship programs. Please try refreshing.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData(true);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'merit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'need_based':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'special':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'renewal':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    return '₱' + amount.toLocaleString('en-PH', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const filteredCategories = React.useMemo(() => {
    return categories.filter(cat => {
      const matchesSearch = searchTerm === '' || 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || cat.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [categories, searchTerm, typeFilter]);

  const stats = React.useMemo(() => {
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.is_active).length;
    const totalSubcategories = categories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0);
    const byType = categories.reduce((acc, cat) => {
      acc[cat.type] = (acc[cat.type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalCategories,
      activeCategories,
      totalSubcategories,
      merit: byType.merit || 0,
      needBased: byType.need_based || 0,
      special: byType.special || 0,
      renewal: byType.renewal || 0
    };
  }, [categories]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Scholarship Programs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage scholarship categories and subcategories
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Program
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">Error Loading Data</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Categories</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalCategories}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.activeCategories} active</div>
            </div>
            <Award className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Subcategories</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalSubcategories}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total programs</div>
            </div>
            <Tag className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Merit-Based</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.merit}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">categories</div>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Need-Based</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.needBased}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">categories</div>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
        {/* Filter Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="merit">Merit-Based</option>
              <option value="need_based">Need-Based</option>
              <option value="special">Special</option>
              <option value="renewal">Renewal</option>
            </select>
          </div>
        </div>

        {/* Programs List */}
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading programs...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No programs found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your search or create a new program
            </p>
            <button className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Create Program
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {filteredCategories.map((category) => (
              <div key={category.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                {/* Category Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(category.type)}`}>
                        {category.type.replace('_', ' ')}
                      </span>
                      {category.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <Eye className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          <EyeOff className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {category.description}
                      </p>
                    )}
                    {category.subcategories && category.subcategories.length > 0 && (
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                      >
                        {expandedCategories.has(category.id) ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide {category.subcategories.length} subcategories
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show {category.subcategories.length} subcategories
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {expandedCategories.has(category.id) && category.subcategories && category.subcategories.length > 0 && (
                  <div className="mt-4 ml-4 space-y-3 border-l-2 border-gray-200 dark:border-slate-600 pl-4">
                    {category.subcategories.map((sub) => (
                      <div key={sub.id} className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {sub.name}
                              </h4>
                              {sub.is_active ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  Inactive
                                </span>
                              )}
                            </div>
                            {sub.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {sub.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              {sub.amount && (
                                <div className="flex items-center gap-1">
                                  <PhilippinePeso className="w-3 h-3" />
                                  <span>{formatCurrency(sub.amount)}</span>
                                </div>
                              )}
                              <span className={`px-2 py-0.5 rounded ${getTypeColor(sub.type)}`}>
                                {sub.type.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors" title="Edit">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScholarshipPrograms;

