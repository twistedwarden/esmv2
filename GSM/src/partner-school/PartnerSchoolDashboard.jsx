import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/v1authStore';
import { 
  Upload, 
  Download, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CloudUpload,
  ShieldCheck,
  History,
  BookOpen,
  LogOut,
  Home,
  GraduationCap,
  Bell,
  Menu,
  User
} from 'lucide-react';

const PartnerSchoolDashboard = () => {
  const { currentUser, logout, isLoggingOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadFile, setUploadFile] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFieldGuide, setShowFieldGuide] = useState(false);
  const [theme, setTheme] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Theme management
  React.useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/';
    }
  };

  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const getBreadcrumb = () => {
    const breadcrumbs = {
      'overview': ['Partner School', 'Overview'],
      'upload': ['Partner School', 'Upload Data'],
      'students': ['Partner School', 'Students'],
      'reports': ['Partner School', 'Reports'],
      'settings': ['Partner School', 'Settings']
    };
    return breadcrumbs[activeTab] || ['Partner School', 'Overview'];
  };

  // Mock data for demonstration
  const schoolInfo = {
    name: 'Caloocan City Science High School',
    code: 'CCSHS-001',
    contactPerson: 'Dr. Maria Santos',
    email: 'principal@ccshs.edu.ph',
    phone: '+63-2-1234-5678'
  };

  const statsData = [
    {
      title: "Total Students",
      value: "2,500",
      change: "+150",
      changeType: "increase",
      icon: Users,
      color: "green"
    },
    {
      title: "Active Enrollments",
      value: "2,300",
      change: "+120",
      changeType: "increase",
      icon: GraduationCap,
      color: "green"
    },
    {
      title: "Last Upload",
      value: "Jan 15, 2024",
      change: "2 days ago",
      changeType: "neutral",
      icon: Clock,
      color: "blue"
    },
    {
      title: "Data Quality",
      value: "98.5%",
      change: "+2.1%",
      changeType: "increase",
      icon: ShieldCheck,
      color: "green"
    }
  ];

  const mockStudents = [
    {
      id: 1,
      studentId: "2024-001",
      name: "Juan Cruz Santos",
      status: "ACTIVE",
      yearLevel: "GRADE_11",
      program: "STEM",
      enrollmentDate: "2024-06-15",
      lastUpdated: "2024-01-15"
    },
    {
      id: 2,
      studentId: "2024-002",
      name: "Maria Santos Garcia",
      status: "ACTIVE",
      yearLevel: "FIRST_YEAR",
      program: "ABM",
      enrollmentDate: "2024-06-15",
      lastUpdated: "2024-01-15"
    },
    {
      id: 3,
      studentId: "2024-003",
      name: "Pedro Reyes Martinez",
      status: "GRADUATED",
      yearLevel: "GRADE_12",
      program: "STEM",
      enrollmentDate: "2023-06-15",
      lastUpdated: "2024-01-10"
    }
  ];

  useEffect(() => {
    setStudents(mockStudents);
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadFile(file);
      // Simulate validation
      setTimeout(() => {
        setValidationResults({
          totalRecords: 150,
          validRecords: 145,
          errorRecords: 3,
          warningRecords: 2,
          newRecords: 50,
          updatedRecords: 95
        });
      }, 1000);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setUploadFile(file);
    }
  };

  const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border-l-4 p-6 border border-slate-200 dark:border-slate-700 ${
      color === 'blue' ? 'border-l-[#4A90E2] bg-blue-50 dark:bg-blue-900/20' :
      color === 'green' ? 'border-l-[#4CAF50] bg-green-50 dark:bg-green-900/20' :
      color === 'purple' ? 'border-l-[#4CAF50] bg-green-50 dark:bg-green-900/20' :
      'border-l-[#FDA811] bg-orange-50 dark:bg-orange-900/20'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className={`text-sm ${
            changeType === 'increase' ? 'text-[#4CAF50]' :
            changeType === 'decrease' ? 'text-red-600 dark:text-red-400' :
            'text-gray-600 dark:text-gray-400'
          }`}>
            {changeType === 'increase' ? '↗' : changeType === 'decrease' ? '↘' : '→'} {change}
          </p>
        </div>
        <div className={`p-3 rounded-full ${
          color === 'blue' ? 'bg-blue-100 dark:bg-blue-800' :
          color === 'green' ? 'bg-green-100 dark:bg-green-800' :
          color === 'purple' ? 'bg-green-100 dark:bg-green-800' :
          'bg-orange-100 dark:bg-orange-800'
        }`}>
          <Icon className={`w-6 h-6 ${
            color === 'blue' ? 'text-[#4A90E2]' :
            color === 'green' ? 'text-[#4CAF50]' :
            color === 'purple' ? 'text-[#4CAF50]' :
            'text-[#FDA811]'
          }`} />
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Partner School Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Welcome back, {schoolInfo.contactPerson}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{schoolInfo.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search students, uploads..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <button 
              onClick={() => setActiveTab('upload')}
              className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg hover:bg-[#45A049] flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveTab('upload')}
            className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <CloudUpload className="w-8 h-8 text-[#4CAF50]" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">Upload Student Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Upload enrollment data</p>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <Users className="w-8 h-8 text-[#4CAF50]" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">Manage Students</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">View and edit student records</p>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-[#4CAF50]" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">View Reports</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Generate and download reports</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activities</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Data upload completed</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">150 records processed successfully</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">New student registered</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">Juan Cruz Santos - Grade 11</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">4 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="space-y-6">
      {/* Upload Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Student Data</h1>
            <p className="text-gray-600 dark:text-gray-300">Upload your school's enrollment data</p>
          </div>
          <button
            onClick={() => setShowFieldGuide(true)}
            className="flex items-center space-x-2 text-[#4CAF50] hover:text-[#45A049] text-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Field Guide</span>
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <div
          className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-[#4CAF50] hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CloudUpload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload Student Enrollment Data</h4>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Drag and drop your CSV file here or click to browse</p>
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="bg-[#4CAF50] text-white px-6 py-2 rounded-lg hover:bg-[#45A049] cursor-pointer inline-block"
          >
            Choose File
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Accepted formats: .csv, .xlsx • Max file size: 10MB
          </p>
        </div>
      </div>

      {/* File Requirements */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">File Requirements</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
            <span>File must be in CSV format</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
            <span>Maximum file size: 10MB</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
            <span>Must include all required fields</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
            <span>Data must be for current academic year</span>
          </li>
        </ul>
      </div>

       {/* Validation Results */}
       {validationResults && (
         <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Validation Results</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
             <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
               <p className="text-2xl font-bold text-[#4CAF50] dark:text-green-300">{validationResults.validRecords}</p>
               <p className="text-sm text-green-800 dark:text-green-300">Valid Records</p>
             </div>
             <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
               <p className="text-2xl font-bold text-red-600 dark:text-red-400">{validationResults.errorRecords}</p>
               <p className="text-sm text-red-800 dark:text-red-300">Error Records</p>
             </div>
             <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
               <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{validationResults.warningRecords}</p>
               <p className="text-sm text-yellow-800 dark:text-yellow-300">Warning Records</p>
             </div>
             <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
               <p className="text-2xl font-bold text-[#4CAF50] dark:text-green-300">{validationResults.newRecords}</p>
               <p className="text-sm text-green-800 dark:text-green-300">New Records</p>
             </div>
           </div>
           <div className="flex space-x-4">
             <button className="bg-[#4CAF50] text-white px-6 py-2 rounded-lg hover:bg-[#45A049]">
               Preview Changes
             </button>
             <button className="bg-gray-600 dark:bg-slate-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-slate-700">
               Download Error Report
             </button>
           </div>
         </div>
       )}
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage student enrollment data</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="GRADUATED">Graduated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Year Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Enrollment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {students
                .filter(student => 
                  (filterStatus === 'all' || student.status === filterStatus) &&
                  (searchTerm === '' || student.name.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {student.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                      student.status === 'INACTIVE' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                      student.status === 'GRADUATED' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {student.yearLevel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {student.program}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {student.enrollmentDate}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                     <div className="flex space-x-2">
                       <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                         <Eye className="w-4 h-4" />
                       </button>
                       <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                         <Edit className="w-4 h-4" />
                       </button>
                       <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                         <Trash2 className="w-4 h-4" />
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
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reports & Analytics</h1>
        
        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Enrollment by Year Level</h3>
            <div className="h-64 flex items-center justify-center">
              <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Program Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>

        {/* Available Reports */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-[#4CAF50]" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Enrollment Summary</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Overview by year level and program</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last generated: 2024-01-15</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-8 h-8 text-[#4CAF50]" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Scholarship Recipients</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">List of scholarship students</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last generated: 2024-01-10</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-8 h-8 text-[#4CAF50]" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Data Quality Report</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Data completeness analysis</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last generated: 2024-01-12</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
        
        <div className="space-y-8">
          {/* School Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">School Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">School Name</label>
                <input
                  type="text"
                  value={schoolInfo.name}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">School Code</label>
                <input
                  type="text"
                  value={schoolInfo.code}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Person</label>
                 <input
                   type="text"
                   value={schoolInfo.contactPerson}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                 <input
                   type="email"
                   value={schoolInfo.email}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                 />
               </div>
            </div>
          </div>

           {/* Upload Settings */}
           <div>
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Settings</h3>
             <div className="space-y-4">
               <div className="flex items-center">
                 <input
                   type="checkbox"
                   id="auto-approve"
                   className="h-4 w-4 text-[#4CAF50] focus:ring-[#4CAF50] border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                 />
                 <label htmlFor="auto-approve" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                   Auto-approve uploads
                 </label>
               </div>
               <div className="flex items-center">
                 <input
                   type="checkbox"
                   id="require-verification"
                   defaultChecked
                   className="h-4 w-4 text-[#4CAF50] focus:ring-[#4CAF50] border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                 />
                 <label htmlFor="require-verification" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                   Require manual verification
                 </label>
               </div>
             </div>
           </div>

          <div className="flex justify-end">
            <button className="bg-[#4CAF50] text-white px-6 py-2 rounded-lg hover:bg-[#45A049]">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Mobile Overlay */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 ${sidebarCollapsed ? (isMobile ? '-translate-x-full' : 'w-16') : 'w-64'} bg-white border-r border-slate-200/50 flex flex-col transition-all duration-300 ease-in-out shadow-lg dark:bg-slate-900 dark:border-slate-700/50 z-50`}>
         <div className={`${sidebarCollapsed ? 'p-3' : 'p-6'} flex-shrink-0`}>
           <div className="flex items-center space-x-3">
             <div className="w-10 h-10 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
               <img src="/GSM_logo.png" alt="GSM Logo" className="w-full h-full object-contain" />
             </div>
             {!sidebarCollapsed && (
               <div className="min-w-0">
                 <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">{schoolInfo.name.split(' ')[0]}</h1>
                 <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Partner School</p>
               </div>
             )}
           </div>
         </div>
         <hr className="border-slate-200 dark:border-slate-700 mx-2 flex-shrink-0" />
        
        <nav className="flex-1 p-2 md:p-4 space-y-1 md:space-y-2 overflow-y-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'upload', label: 'Upload Data', icon: Upload },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
               className={`w-full flex items-center space-x-3 p-2 md:p-2 rounded-xl transition-all duration-200 text-left ${sidebarCollapsed ? 'px-2 justify-center' : 'px-3'} ${
                 activeTab === item.id
                   ? 'bg-orange-200 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-semibold'
                   : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300'
               }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

         {/* Logout button at the bottom */}
         <div className="flex-shrink-0 p-2 md:p-4 border-t border-slate-200 dark:border-slate-700">
           <button
             onClick={handleLogout}
             disabled={isLoggingOut}
             className={`w-full flex items-center space-x-3 p-2 md:p-3 rounded-xl transition-all duration-200 text-left ${sidebarCollapsed ? 'px-2 justify-center' : 'px-3'} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed`}
           >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            )}
          </button>
        </div>
      </div>

      {/* Header */}
      <div className={`${isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-16' : 'ml-64')} bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 transition-all duration-300 dark:bg-slate-800 dark:border-slate-700/50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors duration-200" 
              onClick={handleSidebarToggle}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <div className="hidden md:flex items-center space-x-1">
                <h1 className="text-md font-bold dark:text-white">EDUCATION & SCHOLARSHIP MANAGEMENT</h1>
              </div>
               <div>
                 <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                   {getBreadcrumb().join(' > ')}
                 </span>
               </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <User className="w-4 h-4" />
              <span>{currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : schoolInfo.contactPerson}</span>
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                {currentUser?.role || 'ps_rep'}
              </span>
            </div>
            
            <button className="relative rounded-xl p-2 text-slate-600 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 w-4 h-4 text-white text-xs bg-red-500 rounded-full flex items-center justify-center">1</span>
            </button>
            
            <button 
              className="ml-2 rounded-xl p-2 bg-slate-300 text-slate-600 hover:bg-slate-400 dark:bg-slate-700 dark:text-yellow-400 dark:hover:bg-slate-900 transition-colors cursor-pointer" 
              onClick={toggleTheme} 
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path stroke="currentColor" strokeWidth="2" d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.46 6.46L5.05 5.05m13.9 0l-1.41 1.41M6.46 17.54l-1.41 1.41"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke="currentColor" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-16' : 'ml-64')} p-6 transition-all duration-300 bg-gray-50 dark:bg-slate-900 min-h-screen`}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'upload' && renderUpload()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'settings' && renderSettings()}
      </div>

       {/* Field Guide Modal */}
       {showFieldGuide && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
             <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
               <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Upload Field Guide</h2>
               <button
                 onClick={() => setShowFieldGuide(false)}
                 className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
               >
                 ✕
               </button>
             </div>
             <div className="p-6">
               <div className="space-y-6">
                 <div>
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Required Fields</h3>
                   <div className="space-y-3">
                     {[
                       { field: 'student_id_number', description: 'Unique student identifier', example: '2024-001' },
                       { field: 'first_name', description: 'Student\'s first name', example: 'Juan' },
                       { field: 'last_name', description: 'Student\'s last name', example: 'Cruz' },
                       { field: 'enrollment_status', description: 'ACTIVE, INACTIVE, GRADUATED, or DROPPED', example: 'ACTIVE' },
                       { field: 'academic_year', description: 'Academic year (YYYY-YYYY)', example: '2024-2025' },
                       { field: 'semester', description: 'FIRST, SECOND, or SUMMER', example: 'FIRST' },
                       { field: 'year_level', description: 'GRADE_7 to GRADE_12 or FIRST_YEAR to FIFTH_YEAR', example: 'GRADE_11' },
                       { field: 'enrollment_date', description: 'Date in YYYY-MM-DD format', example: '2024-06-15' }
                     ].map((item, index) => (
                       <div key={index} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                         <div className="flex items-center justify-between">
                           <div>
                             <h4 className="font-semibold text-gray-900 dark:text-white">{item.field}</h4>
                             <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                           </div>
                           <code className="text-sm bg-white dark:bg-slate-600 text-gray-900 dark:text-white px-2 py-1 rounded border border-gray-200 dark:border-slate-600">{item.example}</code>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default PartnerSchoolDashboard;
