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
  User,
  Shield,
  UserCheck,
  XCircle
} from 'lucide-react';
import { 
  fetchPartnerSchoolInfo, 
  fetchPartnerSchoolStats, 
  fetchPartnerSchoolStudents,
  fetchApplicationsForVerification,
  fetchVerificationStats,
  verifyApplication,
  uploadEnrollmentData,
  fetchEnrollmentData,
  uploadFlexibleData,
  fetchFlexibleStudents
} from '../services/partnerSchoolService';
import { API_CONFIG } from '../config/api';

const PartnerSchoolDashboard = () => {
  const { currentUser, logout, isLoggingOut, token } = useAuthStore();
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
  
  // School information state
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [schoolStats, setSchoolStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verification state
  const [verificationApplications, setVerificationApplications] = useState([]);
  const [verificationStats, setVerificationStats] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState(null);

  // Enrollment data state
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadMode, setUploadMode] = useState('merge');
  const [parsedCSVData, setParsedCSVData] = useState(null);
  const [parsedHeaders, setParsedHeaders] = useState(null);

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

  const handleVerifyEnrollment = async (applicationId, isEnrolled) => {
    try {
      const studentId = verificationApplications.find(app => app.id === applicationId)?.studentId;
      if (!studentId) {
        console.error('Student ID not found for application:', applicationId);
        return;
      }

      const response = await fetch(`${API_CONFIG.SCHOLARSHIP_SERVICE.BASE_URL}/api/partner-school/verification/students/${studentId}/enrollment`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_currently_enrolled: isEnrolled,
          verification_notes: isEnrolled ? 'Verified as currently enrolled by partner school' : 'Confirmed not currently enrolled by partner school'
        }),
      });

      if (response.ok) {
        // Refresh the verification data
        await fetchVerificationData();
        console.log(`Enrollment status updated for application ${applicationId}: ${isEnrolled ? 'enrolled' : 'not enrolled'}`);
      } else {
        console.error('Failed to update enrollment status:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating enrollment status:', error);
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
      'verification': ['Partner School', 'Verification'],
      'reports': ['Partner School', 'Reports'],
      'settings': ['Partner School', 'Settings']
    };
    return breadcrumbs[activeTab] || ['Partner School', 'Overview'];
  };

  // Fetch school information on component mount
  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }


      try {
        setLoading(true);
        setError(null);

        // Fetch school info and stats in parallel
        const [schoolData, statsData] = await Promise.all([
          fetchPartnerSchoolInfo(token),
          fetchPartnerSchoolStats(token)
        ]);

        setSchoolInfo(schoolData);
        setSchoolStats(statsData);
      } catch (err) {
        console.error('Error fetching school data:', err);
        
        // Handle specific error cases
        if (err.message.includes('No school assigned')) {
          setError('No school has been assigned to your account. Please contact the administrator to assign a school to your account.');
        } else {
          setError(err.message);
        }
        
        setSchoolInfo(null);
        setSchoolStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolData();
  }, [token, currentUser]);

  // Generate stats data from API response
  const statsData = schoolStats ? [
    {
      title: "Total Applications",
      value: schoolStats.total_applications?.toLocaleString() || "0",
      change: `+${schoolStats.recent_applications || 0} this month`,
      changeType: schoolStats.recent_applications > 0 ? "increase" : "neutral",
      icon: Users,
      color: "green"
    },
    {
      title: "Pending Applications",
      value: schoolStats.pending_applications?.toLocaleString() || "0",
      change: "Awaiting review",
      changeType: "neutral",
      icon: Clock,
      color: "blue"
    },
    {
      title: "Approved Applications",
      value: schoolStats.approved_applications?.toLocaleString() || "0",
      change: "Successfully processed",
      changeType: "increase",
      icon: CheckCircle,
      color: "green"
    },
    {
      title: "Rejected Applications",
      value: schoolStats.rejected_applications?.toLocaleString() || "0",
      change: "Not approved",
      changeType: schoolStats.rejected_applications > 0 ? "decrease" : "neutral",
      icon: AlertCircle,
      color: schoolStats.rejected_applications > 0 ? "red" : "green"
    }
  ] : [];

  // Fetch students data when students tab is active
  useEffect(() => {
    if (activeTab === 'students' && token) {
      fetchStudentsData();
      fetchEnrollmentDataFromAPI();
    } else {
      // Clear students data when not on students tab
      setStudents([]);
    }
  }, [activeTab, token]);

  const fetchStudentsData = async () => {
    try {
      console.log('🔍 Starting fetchStudentsData...');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Filter status:', filterStatus);
      console.log('Search term:', searchTerm);
      
      // Fetch both regular students and flexible students data
      const [studentsData, flexibleData] = await Promise.allSettled([
        fetchPartnerSchoolStudents(token, { 
          status: filterStatus, 
          search: searchTerm 
        }),
        fetchFlexibleStudents(token, { 
          search: searchTerm 
        })
      ]);
      
      // Handle the results
      const studentsResult = studentsData.status === 'fulfilled' ? studentsData.value : null;
      const flexibleResult = flexibleData.status === 'fulfilled' ? flexibleData.value : null;
      
      if (studentsData.status === 'rejected') {
        console.error('❌ Error fetching regular students:', studentsData.reason);
      }
      if (flexibleData.status === 'rejected') {
        console.error('❌ Error fetching flexible students:', flexibleData.reason);
      }
      
      console.log('✅ Students data received:', studentsResult);
      console.log('✅ Flexible data received:', flexibleResult);
      
      // Handle paginated response for regular students
      const studentsArray = studentsResult ? (studentsResult.data?.data || studentsResult.data || []) : [];
      const flexibleArray = flexibleResult ? (flexibleResult.data?.data || flexibleResult.data || []) : [];
      
      console.log('Processed students array:', studentsArray);
      console.log('Processed flexible array:', flexibleArray);
      
      // Convert flexible data to student format for display
      const flexibleStudents = flexibleArray.map(flexible => {
        console.log('Processing flexible student:', flexible);
        return {
          id: flexible.id,
          student_id_number: flexible.student_id_number,
          first_name: flexible.first_name,
          last_name: flexible.last_name,
          full_name: flexible.full_name,
          flexibleData: flexible.data,
          headers: flexible.headers,
          uploaded_at: flexible.uploaded_at,
          isFlexible: true
        };
      });
      
      // Group flexible students by student_id_number and keep the most recent record
      const groupedFlexibleStudents = flexibleStudents.reduce((acc, student) => {
        const key = student.student_id_number;
        if (!acc[key] || new Date(student.uploaded_at) > new Date(acc[key].uploaded_at)) {
          acc[key] = student;
        }
        return acc;
      }, {});
      
      // Convert back to array
      const uniqueFlexibleStudents = Object.values(groupedFlexibleStudents);
      
      console.log('Grouped flexible students:', uniqueFlexibleStudents);
      console.log('Total flexible students after grouping:', uniqueFlexibleStudents.length);
      
      // Combine both arrays
      const allStudents = [...studentsArray, ...uniqueFlexibleStudents];
      
      // Debug each student's data
      allStudents.forEach((student, index) => {
        console.log(`Student ${index + 1}:`, {
          id: student.id,
          student_id_number: student.student_id_number,
          first_name: student.first_name,
          last_name: student.last_name,
          isFlexible: student.isFlexible,
          flexibleData: student.flexibleData,
          enrollmentData: student.enrollmentData,
          scholarshipApplications: student.scholarshipApplications
        });
      });
      
      setStudents(allStudents);
    } catch (err) {
      console.error('Error fetching students data:', err);
      // Set empty array on error instead of mock data
      setStudents([]);
    }
  };

  const fetchEnrollmentDataFromAPI = async () => {
    setEnrollmentLoading(true);
    setEnrollmentError(null);
    
    try {
      const enrollmentDataResponse = await fetchEnrollmentData(token, { 
        status: filterStatus, 
        search: searchTerm 
      });
      console.log('Enrollment data received:', enrollmentDataResponse);
      console.log('Enrollment data array:', enrollmentDataResponse.data);
      // Handle paginated response
      const enrollmentArray = enrollmentDataResponse.data?.data || enrollmentDataResponse.data || [];
      console.log('Processed enrollment array:', enrollmentArray);
      setEnrollmentData(enrollmentArray);
    } catch (err) {
      console.error('Error fetching enrollment data:', err);
      setEnrollmentError(err.message);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  // Fetch verification data when verification tab is active
  useEffect(() => {
    if (activeTab === 'verification' && token) {
      fetchVerificationData();
    }
  }, [activeTab, token]);

  const fetchVerificationData = async () => {
    setVerificationLoading(true);
    setVerificationError(null);
    
    try {
      const [applicationsData, statsData] = await Promise.all([
        fetchApplicationsForVerification(token, { status: filterStatus, search: searchTerm }),
        fetchVerificationStats(token)
      ]);
      
      setVerificationApplications(applicationsData.applications || []);
      setVerificationStats(statsData);
    } catch (err) {
      console.error('Error fetching verification data:', err);
      setVerificationError(err.message);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadProgress({ status: 'processing', message: 'Processing CSV file...' });
      
      try {
        // Parse CSV file
        const csvData = await parseCSVFile(file);
        const headers = Object.keys(csvData[0] || {});
        
        console.log('Parsed CSV data:', csvData);
        console.log('Headers:', headers);
        console.log('Number of records:', csvData.length);
        
        setUploadProgress({ 
          status: 'ready', 
          message: `File processed successfully! ${csvData.length} student records found. Ready to upload.` 
        });
        
        // Store the parsed data for upload
        setParsedCSVData(csvData);
        setParsedHeaders(headers);
        
      } catch (error) {
        console.error('Error processing CSV file:', error);
        setUploadProgress({ status: 'error', message: 'Error processing CSV file: ' + error.message });
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Define a comprehensive mapping for flexible header recognition
  const headerMap = {
    'student_id_number': [
      'student_id_number', 'student id', 'id number', 'student_id', 'student_no', 'student number',
      'studentid', 'studentno', 'id', 'student', 'studentidnumber', 'studentnumber',
      'student id number', 'student no', 'student number', 'id no', 'idno'
    ],
    'first_name': [
      'first_name', 'first name', 'given name', 'fname', 'firstname', 'givenname',
      'first', 'name', 'firstname', 'given', 'f name', 'first name'
    ],
    'last_name': [
      'last_name', 'last name', 'surname', 'lname', 'lastname', 'family name',
      'last', 'surname', 'family', 'l name', 'last name', 'familyname'
    ],
    'enrollment_year': [
      'enrollment_year', 'enrollment year', 'academic year', 'school year',
      'enrollmentyear', 'academicyear', 'schoolyear', 'academic_year', 'school_year',
      'enrollment year', 'academic year', 'school year'
    ],
    'enrollment_term': [
      'enrollment_term', 'enrollment term', 'semester', 'term', 'enrollmentterm',
      'sem', 'semester term', 'term semester', 'enrollment term', 'enrollment',
      'term', 'semester', 'period', 'quarter', 'trimester'
    ],
    'is_currently_enrolled': [
      'is_currently_enrolled', 'currently enrolled', 'enrolled', 'current enrollment',
      'iscurrentlyenrolled', 'currentlyenrolled', 'currentenrollment', 'enrolled status',
      'enrollment status', 'status', 'active', 'current', 'enrolled status',
      'currently enrolled', 'current enrollment', 'enrollment status', 'enrollment_status'
    ],
    'enrollment_date': [
      'enrollment_date', 'enrollment date', 'date enrolled', 'enrollmentdate',
      'dateenrolled', 'enroll date', 'enroll_date', 'date of enrollment',
      'enrollment date', 'date enrolled', 'enroll date', 'date of enrollment'
    ],
    'program': [
      'program', 'course', 'degree', 'program of study', 'course of study',
      'degree program', 'major', 'field of study', 'programofstudy',
      'courseofstudy', 'degreeprogram', 'fieldofstudy', 'program of study',
      'course of study', 'degree program', 'field of study'
    ],
    'year_level': [
      'year_level', 'year level', 'level', 'grade level', 'yearlevel',
      'gradelevel', 'grade', 'class', 'year level', 'grade level',
      'academic level', 'academiclevel', 'level year', 'year grade',
      'student level', 'studentlevel', 'academic standing', 'standing'
    ]
  };

  // Define value mappings for smart value recognition
  const valueMaps = {
    'enrollment_term': {
      '1st semester': '1st Semester',
      'first semester': '1st Semester',
      '1st sem': '1st Semester',
      'first sem': '1st Semester',
      'sem 1': '1st Semester',
      'semester 1': '1st Semester',
      '1': '1st Semester',
      '2nd semester': '2nd Semester',
      'second semester': '2nd Semester',
      '2nd sem': '2nd Semester',
      'second sem': '2nd Semester',
      'sem 2': '2nd Semester',
      'semester 2': '2nd Semester',
      '2': '2nd Semester',
      'summer': 'Summer',
      'summer term': 'Summer',
      'summer semester': 'Summer',
      'SUMMER': 'Summer', // Uppercase version
      'midyear': 'Midyear',
      'mid year': 'Midyear',
      'mid-year': 'Midyear',
      'FIRST': '1st Semester', // Uppercase version
      'SECOND': '2nd Semester' // Uppercase version
    },
    'is_currently_enrolled': {
      'true': 'true',
      'yes': 'true',
      'y': 'true',
      '1': 'true',
      'enrolled': 'true',
      'active': 'true',
      'current': 'true',
      'ACTIVE': 'true', // Uppercase version
      'false': 'false',
      'no': 'false',
      'n': 'false',
      '0': 'false',
      'not enrolled': 'false',
      'inactive': 'false',
      'dropped': 'false',
      'graduated': 'false', // Treat graduated as false but with warning
      'INACTIVE': 'false', // Uppercase version
      'DROPPED': 'false', // Uppercase version
      'GRADUATED': 'false' // Uppercase version
    },
    'year_level': {
      '1st year': '1st Year',
      'first year': '1st Year',
      'first_year': '1st Year',
      '1st yr': '1st Year',
      'first yr': '1st Year',
      'year 1': '1st Year',
      '1': '1st Year',
      '2nd year': '2nd Year',
      'second year': '2nd Year',
      'second_year': '2nd Year',
      '2nd yr': '2nd Year',
      'second yr': '2nd Year',
      'year 2': '2nd Year',
      '2': '2nd Year',
      '3rd year': '3rd Year',
      'third year': '3rd Year',
      'third_year': '3rd Year',
      '3rd yr': '3rd Year',
      'third yr': '3rd Year',
      'year 3': '3rd Year',
      '3': '3rd Year',
      '4th year': '4th Year',
      'fourth year': '4th Year',
      'fourth_year': '4th Year',
      '4th yr': '4th Year',
      'fourth yr': '4th Year',
      'year 4': '4th Year',
      '4': '4th Year',
      '5th year': '5th Year',
      'fifth year': '5th Year',
      'fifth_year': '5th Year',
      '5th yr': '5th Year',
      'fifth yr': '5th Year',
      'year 5': '5th Year',
      '5': '5th Year',
      // Handle grade levels
      'grade 12': '12th Grade',
      'grade_12': '12th Grade',
      'grade12': '12th Grade',
      '12th grade': '12th Grade',
      'grade 11': '11th Grade',
      'grade_11': '11th Grade',
      'grade11': '11th Grade',
      '11th grade': '11th Grade',
      'grade 10': '10th Grade',
      'grade_10': '10th Grade',
      'grade10': '10th Grade',
      '10th grade': '10th Grade',
      'grade 9': '9th Grade',
      'grade_9': '9th Grade',
      'grade9': '9th Grade',
      '9th grade': '9th Grade',
      'grade 8': '8th Grade',
      'grade_8': '8th Grade',
      'grade8': '8th Grade',
      '8th grade': '8th Grade',
      'grade 7': '7th Grade',
      'grade_7': '7th Grade',
      'grade7': '7th Grade',
      '7th grade': '7th Grade',
      // Uppercase versions
      'FIRST_YEAR': '1st Year',
      'SECOND_YEAR': '2nd Year',
      'THIRD_YEAR': '3rd Year',
      'FOURTH_YEAR': '4th Year',
      'FIFTH_YEAR': '5th Year',
      'GRADE_12': '12th Grade',
      'GRADE_11': '11th Grade',
      'GRADE_10': '10th Grade',
      'GRADE_9': '9th Grade',
      'GRADE_8': '8th Grade',
      'GRADE_7': '7th Grade'
    },
    'program': {
      // Computer Science variations
      'computer science': 'Bachelor of Science in Computer Science',
      'bs computer science': 'Bachelor of Science in Computer Science',
      'bscs': 'Bachelor of Science in Computer Science',
      'cs': 'Bachelor of Science in Computer Science',
      'computer sci': 'Bachelor of Science in Computer Science',
      'comp sci': 'Bachelor of Science in Computer Science',
      
      // Psychology variations
      'psychology': 'Bachelor of Arts in Psychology',
      'ba psychology': 'Bachelor of Arts in Psychology',
      'bapsych': 'Bachelor of Arts in Psychology',
      'psych': 'Bachelor of Arts in Psychology',
      
      // Engineering variations
      'civil engineering': 'Bachelor of Science in Civil Engineering',
      'bs civil engineering': 'Bachelor of Science in Civil Engineering',
      'bscivil': 'Bachelor of Science in Civil Engineering',
      'ce': 'Bachelor of Science in Civil Engineering',
      
      'electrical engineering': 'Bachelor of Science in Electrical Engineering',
      'bs electrical engineering': 'Bachelor of Science in Electrical Engineering',
      'bsee': 'Bachelor of Science in Electrical Engineering',
      'ee': 'Bachelor of Science in Electrical Engineering',
      
      'mechanical engineering': 'Bachelor of Science in Mechanical Engineering',
      'bs mechanical engineering': 'Bachelor of Science in Mechanical Engineering',
      'bsme': 'Bachelor of Science in Mechanical Engineering',
      'me': 'Bachelor of Science in Mechanical Engineering',
      
      // Business variations
      'business administration': 'Bachelor of Science in Business Administration',
      'bsba': 'Bachelor of Science in Business Administration',
      'bs business admin': 'Bachelor of Science in Business Administration',
      'business admin': 'Bachelor of Science in Business Administration',
      
      // Education variations
      'elementary education': 'Bachelor of Elementary Education',
      'beed': 'Bachelor of Elementary Education',
      'bs elementary ed': 'Bachelor of Elementary Education',
      
      'secondary education': 'Bachelor of Secondary Education',
      'bsed': 'Bachelor of Secondary Education',
      'bs secondary ed': 'Bachelor of Secondary Education',
      
      // Nursing variations
      'nursing': 'Bachelor of Science in Nursing',
      'bsn': 'Bachelor of Science in Nursing',
      'bs nursing': 'Bachelor of Science in Nursing',
      
      // Accountancy variations
      'accountancy': 'Bachelor of Science in Accountancy',
      'bsa': 'Bachelor of Science in Accountancy',
      'bs accountancy': 'Bachelor of Science in Accountancy',
      'accounting': 'Bachelor of Science in Accountancy'
    }
  };

  // Function to normalize a header name with fuzzy matching
  const normalizeHeader = (csvHeader) => {
    if (!csvHeader || typeof csvHeader !== 'string') return null;
    
    // Clean the header: remove quotes, extra spaces, and convert to lowercase
    const cleanHeader = csvHeader.trim().replace(/['"]/g, '').toLowerCase();
    
    // Remove all non-alphanumeric characters for better matching
    const normalizedHeader = cleanHeader.replace(/[^a-z0-9]/g, '');
    
    // First try exact matches
    for (const canonicalField in headerMap) {
      if (headerMap[canonicalField].some(alias => 
        alias.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedHeader
      )) {
        return canonicalField;
      }
    }
    
    // Then try partial matches (contains)
    for (const canonicalField in headerMap) {
      if (headerMap[canonicalField].some(alias => 
        normalizedHeader.includes(alias.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
        alias.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalizedHeader)
      )) {
        return canonicalField;
      }
    }
    
    // Finally try word-based matching
    const words = normalizedHeader.split(/(?=[a-z])/).filter(w => w.length > 2);
    for (const canonicalField in headerMap) {
      for (const alias of headerMap[canonicalField]) {
        const aliasWords = alias.toLowerCase().replace(/[^a-z0-9]/g, '').split(/(?=[a-z])/).filter(w => w.length > 2);
        if (words.some(word => aliasWords.some(aliasWord => 
          word.includes(aliasWord) || aliasWord.includes(word)
        ))) {
          return canonicalField;
        }
      }
    }
    
    return null; // Return null if no match found
  };

  // Function to normalize field values with smart recognition
  const normalizeValue = (field, value) => {
    if (!value || typeof value !== 'string') return value;
    
    const cleanValue = value.trim().toLowerCase();
    
    // Handle name fields - capitalize properly
    if (field === 'first_name' || field === 'last_name') {
      return value.trim().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
    
    // Handle student ID - ensure it's uppercase and clean
    if (field === 'student_id_number') {
      return value.trim().toUpperCase();
    }
    
    // Handle enrollment year - normalize format
    if (field === 'enrollment_year') {
      const yearMatch = cleanValue.match(/(\d{4})[-\/]?(\d{4})?/);
      if (yearMatch) {
        const startYear = yearMatch[1];
        const endYear = yearMatch[2] || (parseInt(startYear) + 1).toString();
        return `${startYear}-${endYear}`;
      }
    }
    
    // Handle enrollment date - normalize format
    if (field === 'enrollment_date') {
      // Try to parse various date formats
      const dateFormats = [
        /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/, // MM/DD/YYYY or MM-DD-YYYY
        /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/, // YYYY/MM/DD or YYYY-MM-DD
        /(\d{1,2})\s+(\d{1,2})\s+(\d{4})/, // MM DD YYYY
      ];
      
      for (const format of dateFormats) {
        const match = value.match(format);
        if (match) {
          let year, month, day;
          if (format === dateFormats[0]) {
            // MM/DD/YYYY format
            [, month, day, year] = match;
          } else if (format === dateFormats[1]) {
            // YYYY/MM/DD format
            [, year, month, day] = match;
          } else {
            // MM DD YYYY format
            [, month, day, year] = match;
          }
          
          // Ensure two digits for month and day
          month = month.padStart(2, '0');
          day = day.padStart(2, '0');
          
          return `${year}-${month}-${day}`;
        }
      }
    }
    
    // Check if this field has value mappings
    if (valueMaps[field]) {
      // First try exact match
      if (valueMaps[field][cleanValue]) {
        return valueMaps[field][cleanValue];
      }
      
      // Then try partial matching
      for (const [key, normalizedValue] of Object.entries(valueMaps[field])) {
        if (cleanValue.includes(key) || key.includes(cleanValue)) {
          return normalizedValue;
        }
      }
      
      // For enrollment_term, try to extract semester number
      if (field === 'enrollment_term') {
        const semesterMatch = cleanValue.match(/(\d+)(?:st|nd|rd|th)?\s*(?:sem|semester)/);
        if (semesterMatch) {
          const num = parseInt(semesterMatch[1]);
          if (num === 1) return '1st Semester';
          if (num === 2) return '2nd Semester';
        }
        
        // Check for summer/midyear keywords
        if (cleanValue.includes('summer')) return 'Summer';
        if (cleanValue.includes('midyear') || cleanValue.includes('mid year')) return 'Midyear';
      }
      
      // For year_level, try to extract year number
      if (field === 'year_level') {
        // Handle FIRST_YEAR, SECOND_YEAR, etc.
        if (cleanValue === 'first_year') return '1st Year';
        if (cleanValue === 'second_year') return '2nd Year';
        if (cleanValue === 'third_year') return '3rd Year';
        if (cleanValue === 'fourth_year') return '4th Year';
        if (cleanValue === 'fifth_year') return '5th Year';
        
        // Handle GRADE_12, GRADE_11, etc.
        const gradeMatch = cleanValue.match(/grade[_\s]*(\d+)/);
        if (gradeMatch) {
          const grade = parseInt(gradeMatch[1]);
          if (grade >= 7 && grade <= 12) {
            return `${grade}th Grade`;
          }
        }
        
        // Handle regular year patterns
        const yearMatch = cleanValue.match(/(\d+)(?:st|nd|rd|th)?\s*(?:year|yr)/);
        if (yearMatch) {
          const num = parseInt(yearMatch[1]);
          if (num >= 1 && num <= 5) {
            const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th'];
            return `${ordinals[num]} Year`;
          }
        }
      }
      
      // For is_currently_enrolled, try boolean detection
      if (field === 'is_currently_enrolled') {
        if (cleanValue === 'true' || cleanValue === 'yes' || cleanValue === '1' || 
            cleanValue === 'y' || cleanValue === 'enrolled' || cleanValue === 'active') {
          return 'true';
        }
        if (cleanValue === 'false' || cleanValue === 'no' || cleanValue === '0' || 
            cleanValue === 'n' || cleanValue === 'not enrolled' || cleanValue === 'inactive') {
          return 'false';
        }
        if (cleanValue === 'graduated') {
          return 'false'; // Treat graduated as false
        }
      }
      
      // For program, try to find partial matches
      if (field === 'program') {
        for (const [key, normalizedValue] of Object.entries(valueMaps[field])) {
          if (cleanValue.includes(key) || key.includes(cleanValue)) {
            return normalizedValue;
          }
        }
        
        // Try to detect common program patterns
        if (cleanValue.includes('computer') && cleanValue.includes('science')) {
          return 'Bachelor of Science in Computer Science';
        }
        if (cleanValue.includes('psychology') || cleanValue.includes('psych')) {
          return 'Bachelor of Arts in Psychology';
        }
        if (cleanValue.includes('engineering')) {
          if (cleanValue.includes('civil')) return 'Bachelor of Science in Civil Engineering';
          if (cleanValue.includes('electrical')) return 'Bachelor of Science in Electrical Engineering';
          if (cleanValue.includes('mechanical')) return 'Bachelor of Science in Mechanical Engineering';
        }
        if (cleanValue.includes('business') || cleanValue.includes('admin')) {
          return 'Bachelor of Science in Business Administration';
        }
        if (cleanValue.includes('nursing')) {
          return 'Bachelor of Science in Nursing';
        }
        if (cleanValue.includes('accounting') || cleanValue.includes('accountancy')) {
          return 'Bachelor of Science in Accountancy';
        }
      }
    }
    
    return value; // Return original value if no normalization found
  };

  // CSV parsing function with intelligent header mapping
  const parseCSVFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target.result;
          const lines = csv.split('\n').filter(line => line.trim());
          const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          
          // Map raw headers to normalized field names
          const headerMapping = {};
          const normalizedHeaders = [];
          
          rawHeaders.forEach(rawHeader => {
            const normalizedHeader = normalizeHeader(rawHeader);
            if (normalizedHeader) {
              headerMapping[rawHeader] = normalizedHeader;
              if (!normalizedHeaders.includes(normalizedHeader)) {
                normalizedHeaders.push(normalizedHeader);
              }
            }
          });
          
          console.log('=== CSV HEADER MAPPING DEBUG ===');
          console.log('Raw headers from CSV:', rawHeaders);
          console.log('Header mapping:', headerMapping);
          console.log('Normalized headers:', normalizedHeaders);
          console.log('Unmapped headers:', rawHeaders.filter(h => !headerMapping[h]));
          console.log('================================');
          
          const data = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            
            rawHeaders.forEach((rawHeader, index) => {
              const normalizedHeader = headerMapping[rawHeader];
              if (normalizedHeader) {
                const rawValue = values[index] || '';
                // Apply smart value normalization
                const normalizedValue = normalizeValue(normalizedHeader, rawValue);
                
                // Log value transformations for debugging
                if (rawValue !== normalizedValue) {
                  console.log(`Value normalized: "${rawValue}" → "${normalizedValue}" (field: ${normalizedHeader})`);
                } else {
                  console.log(`Value kept as-is: "${rawValue}" (field: ${normalizedHeader})`);
                }
                
                row[normalizedHeader] = normalizedValue;
              }
            });
            
            data.push(row);
          }
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // CSV validation function
  const validateCSVData = (data) => {
    const requiredFields = ['student_id_number', 'first_name', 'last_name', 'enrollment_term'];
    let validRecords = 0;
    let errorRecords = 0;
    let warningRecords = 0;
    const errors = [];
    const warnings = [];
    const validData = [];

    data.forEach((row, index) => {
      let hasErrors = false;
      let hasWarnings = false;
      const rowErrors = [];
      const rowWarnings = [];
      
      // Check for missing required fields
      requiredFields.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          rowErrors.push(`Missing required field '${field}'`);
          hasErrors = true;
        }
      });

      // Check if we have either enrollment_year OR enrollment_date
      if ((!row.enrollment_year || row.enrollment_year.trim() === '') && 
          (!row.enrollment_date || row.enrollment_date.trim() === '')) {
        rowErrors.push(`Must provide either 'enrollment_year' or 'enrollment_date'`);
        hasErrors = true;
      }

      // Check for valid enrollment year format (YYYY-YYYY) if provided
      if (row.enrollment_year && row.enrollment_year.trim() !== '' && !/^\d{4}-\d{4}$/.test(row.enrollment_year.trim())) {
        rowErrors.push(`Invalid enrollment_year format. Expected YYYY-YYYY, got: ${row.enrollment_year}`);
        hasErrors = true;
      }

      // Check for valid enrollment term
      const validTerms = ['1st Semester', '2nd Semester', 'Summer', 'Midyear'];
      if (row.enrollment_term && !validTerms.includes(row.enrollment_term.trim())) {
        rowErrors.push(`Invalid enrollment_term. Expected one of: ${validTerms.join(', ')}, got: ${row.enrollment_term}`);
        hasErrors = true;
      }

      // Check for valid boolean values for is_currently_enrolled
      if (row.is_currently_enrolled) {
        const validBooleanValues = ['true', 'false', 'yes', 'no', '1', '0', 'y', 'n'];
        const graduatedValues = ['graduated'];
        
        if (graduatedValues.includes(row.is_currently_enrolled.toLowerCase().trim())) {
          rowWarnings.push(`Student is marked as '${row.is_currently_enrolled}' - treated as not currently enrolled`);
          hasWarnings = true;
        } else if (!validBooleanValues.includes(row.is_currently_enrolled.toLowerCase().trim())) {
          rowErrors.push(`Invalid is_currently_enrolled value. Expected true/false/yes/no/1/0, got: ${row.is_currently_enrolled}`);
          hasErrors = true;
        }
      }

      // Check for valid date format if provided
      if (row.enrollment_date && row.enrollment_date.trim() !== '') {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(row.enrollment_date.trim())) {
          rowErrors.push(`Invalid enrollment_date format. Expected YYYY-MM-DD, got: ${row.enrollment_date}`);
          hasErrors = true;
        }
      }

      if (hasErrors) {
        errorRecords++;
        errors.push(`Row ${index + 1}: ${rowErrors.join('; ')}`);
      } else {
        validRecords++;
        validData.push(row); // Add valid row to validData array
        if (hasWarnings) {
          warningRecords++;
          warnings.push(`Row ${index + 1}: ${rowWarnings.join('; ')}`);
        }
      }
    });

    return {
      totalRecords: data.length,
      validRecords,
      errorRecords,
      warningRecords,
      newRecords: validRecords,
      updatedRecords: 0,
      errors,
      warnings,
      validData
    };
  };

  // Download CSV template
  const downloadTemplate = () => {
    const templateData = [
      {
        'Student ID': '2024-001234',
        'First Name': 'Juan',
        'Last Name': 'Dela Cruz',
        'Academic Year': '2024-2025',
        'Semester': '1st Semester',
        'Currently Enrolled': 'true',
        'Enrollment Date': '2024-08-15',
        'Program': 'Bachelor of Science in Computer Science',
        'Year Level': '1st Year'
      },
      {
        'Student ID': '2024-001235',
        'First Name': 'Maria',
        'Last Name': 'Santos',
        'Academic Year': '', // Optional - will be auto-generated from enrollment_date
        'Semester': '1st Semester',
        'Currently Enrolled': 'true',
        'Enrollment Date': '2024-08-16',
        'Program': 'Bachelor of Arts in Psychology',
        'Year Level': '2nd Year'
      },
      {
        'Student ID': '2024-001236',
        'First Name': 'Jose',
        'Last Name': 'Garcia',
        'Academic Year': '2024',
        'Semester': '1st sem', // Will be normalized to "1st Semester"
        'Currently Enrolled': 'yes', // Will be normalized to "true"
        'Enrollment Date': '08/20/2024', // Will be normalized to "2024-08-20"
        'Program': 'CS', // Will be normalized to "Bachelor of Science in Computer Science"
        'Year Level': '1' // Will be normalized to "1st Year"
      }
    ];

    const headers = ['Student ID', 'First Name', 'Last Name', 'Academic Year', 'Semester', 'Currently Enrolled', 'Enrollment Date', 'Program', 'Year Level'];
    const csvContent = [
      headers.join(','),
      ...templateData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'enrollment_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload CSV data
  const handleCSVUpload = async () => {
    if (!uploadFile || !parsedCSVData) return;

    setUploadProgress({ status: 'uploading', message: 'Uploading student data...' });

    try {
      console.log('Uploading flexible CSV data:', parsedCSVData);
      console.log('Headers:', parsedHeaders);
      console.log('Number of records:', parsedCSVData.length);
      
      const result = await uploadEnrollmentData(token, parsedCSVData, uploadMode);
      
      setUploadProgress({ 
        status: 'success', 
        message: `Successfully uploaded ${result.data?.processed_count || result.processed} student records` 
      });
      
      // Refresh students data
      await fetchStudentsData();
      
      // Reset form
      setUploadFile(null);
      setUploadProgress(null);
      setParsedCSVData(null);
      setParsedHeaders(null);
      
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setUploadProgress({ 
        status: 'error', 
        message: 'Upload failed: ' + error.message 
      });
    }
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
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              </div>
            ) : schoolInfo ? (
              <>
                <p className="text-gray-600 dark:text-gray-300">
                  Welcome back, {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Representative'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {schoolInfo.school.full_name || schoolInfo.school.name}
                  {schoolInfo.school.campus && schoolInfo.school.name !== schoolInfo.school.full_name && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {schoolInfo.school.campus}
                    </span>
                  )}
                </p>
                {schoolInfo.school.address && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    📍 {schoolInfo.school.address}, {schoolInfo.school.city}, {schoolInfo.school.province}
                  </p>
                )}
              </>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <div>
                    <p className="text-red-800 dark:text-red-200 font-medium">Unable to load school information</p>
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading school information...</p>
            )}
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
        {loading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border-l-4 p-6 border border-slate-200 dark:border-slate-700 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          ))
        ) : (
          statsData.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            onClick={() => setActiveTab('verification')}
            className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Shield className="w-8 h-8 text-[#4A90E2]" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">Verify Students</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Verify scholarship applications</p>
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
            <p className="text-gray-600 dark:text-gray-300">Upload any CSV file - we'll extract the required fields automatically</p>
          </div>
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
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload Any Student Data File</h4>
          <p className="text-gray-600 dark:text-gray-300 mb-2">Drag and drop your CSV file here or click to browse</p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
            🎯 <strong>Smart Extraction:</strong> We automatically find and extract:
            <br />• Student ID (any format: ID, Student Number, etc.)
            <br />• First Name (any format: First Name, Given Name, etc.)
            <br />• Last Name (any format: Last Name, Surname, etc.)
            <br />• All students will be marked as "Enrolled"
          </p>
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

      {/* File Information and Upload Section */}
      {uploadFile && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">File Ready for Upload</h3>
          
          {/* File Details */}
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-4">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{uploadFile.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Size: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Type: {uploadFile.type || 'CSV file'}
                </p>
                {parsedCSVData && (
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    📊 {parsedCSVData.length} student records found
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Upload Mode Selection */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Update Mode:</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadMode"
                  value="merge"
                  checked={uploadMode === 'merge'}
                  onChange={(e) => setUploadMode(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Merge (Add to existing data)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadMode"
                  value="replace"
                  checked={uploadMode === 'replace'}
                  onChange={(e) => setUploadMode(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Replace All (Delete existing data)</span>
              </label>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className={`mb-4 p-4 rounded-lg ${
              uploadProgress.status === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
              uploadProgress.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
              'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
            }`}>
              <div className="flex items-center space-x-2">
                {uploadProgress.status === 'success' && <CheckCircle className="w-5 h-5" />}
                {uploadProgress.status === 'error' && <XCircle className="w-5 h-5" />}
                {uploadProgress.status === 'processing' && <Clock className="w-5 h-5 animate-spin" />}
                {uploadProgress.status === 'uploading' && <CloudUpload className="w-5 h-5 animate-pulse" />}
                <span className="font-medium">{uploadProgress.message}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button 
              onClick={handleCSVUpload}
              disabled={uploadProgress?.status === 'uploading' || uploadProgress?.status === 'processing'}
              className="bg-[#4CAF50] text-white px-6 py-2 rounded-lg hover:bg-[#45A049] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadProgress?.status === 'uploading' ? 'Uploading...' : 'Upload Data'}
            </button>
            <button 
              onClick={() => {
                setUploadFile(null);
                setUploadProgress(null);
              }}
              className="bg-gray-600 dark:bg-slate-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
          <div className="flex flex-col space-y-4">
            {/* Upload Mode Selection */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Update Mode:</label>
              <div className="flex space-x-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="uploadMode"
                    value="merge"
                    checked={uploadMode === 'merge'}
                    onChange={(e) => setUploadMode(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Merge (Recommended)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="uploadMode"
                    value="replace"
                    checked={uploadMode === 'replace'}
                    onChange={(e) => setUploadMode(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Replace All</span>
                </label>
              </div>
            </div>
            
            {/* Upload Progress */}
            {uploadProgress && (
              <div className={`p-4 rounded-lg ${
                uploadProgress.status === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
                uploadProgress.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
              }`}>
                <div className="flex items-center space-x-2">
                  {uploadProgress.status === 'success' && <CheckCircle className="w-5 h-5" />}
                  {uploadProgress.status === 'error' && <XCircle className="w-5 h-5" />}
                  {uploadProgress.status === 'processing' && <Clock className="w-5 h-5 animate-spin" />}
                  {uploadProgress.status === 'uploading' && <CloudUpload className="w-5 h-5 animate-pulse" />}
                  <span className="font-medium">{uploadProgress.message}</span>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
           {/* Error Details */}
           {validationResults?.errors && validationResults.errors.length > 0 && (
             <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
               <h4 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-3">Error Details:</h4>
               <div className="max-h-60 overflow-y-auto">
                 {validationResults.errors.slice(0, 10).map((error, index) => (
                   <div key={index} className="text-sm text-red-700 dark:text-red-300 mb-1 p-2 bg-red-100 dark:bg-red-800/30 rounded">
                     {error}
                   </div>
                 ))}
                 {validationResults.errors.length > 10 && (
                   <div className="text-sm text-red-600 dark:text-red-400 font-medium mt-2">
                     ... and {validationResults.errors.length - 10} more errors
                   </div>
                 )}
               </div>
             </div>
           )}

           {/* Warning Details */}
           {validationResults?.warnings && validationResults.warnings.length > 0 && (
             <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
               <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-3">Warning Details:</h4>
               <div className="max-h-60 overflow-y-auto">
                 {validationResults.warnings.slice(0, 10).map((warning, index) => (
                   <div key={index} className="text-sm text-yellow-700 dark:text-yellow-300 mb-1 p-2 bg-yellow-100 dark:bg-yellow-800/30 rounded">
                     {warning}
                   </div>
                 ))}
                 {validationResults.warnings.length > 10 && (
                   <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium mt-2">
                     ... and {validationResults.warnings.length - 10} more warnings
                   </div>
                 )}
               </div>
             </div>
           )}

           <div className="flex space-x-4">
             {validationResults && validationResults.errorRecords === 0 && (
               <button 
                 onClick={handleCSVUpload}
                 disabled={uploadProgress?.status === 'uploading'}
                 className="bg-[#4CAF50] text-white px-6 py-2 rounded-lg hover:bg-[#45A049] disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {uploadProgress?.status === 'uploading' ? 'Uploading...' : 'Upload Data'}
               </button>
             )}
             <button 
               onClick={downloadTemplate}
               className="bg-gray-600 dark:bg-slate-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-slate-700"
             >
               Download Template
             </button>
             {validationResults?.errors && validationResults.errors.length > 0 && (
               <button className="bg-red-600 dark:bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-700">
                 Download Error Report
               </button>
             )}
           </div>
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
              <option value="all">All Students</option>
              <option value="enrolled">Enrolled</option>
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
              {students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <Users className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No students found</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchTerm || filterStatus !== 'all' 
                            ? 'No students match your current search or filter criteria.'
                            : 'Upload student enrollment data to get started.'
                          }
                        </p>
                      </div>
                      {!searchTerm && filterStatus === 'all' && (
                        <button 
                          onClick={() => setActiveTab('upload')}
                          className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg hover:bg-[#45A049] transition-colors"
                        >
                          Upload Student Data
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : students
                .filter(student => {
                  // Check status filter
                  let statusMatch = true;
                  if (filterStatus === 'enrolled') {
                    // For flexible data, always show as enrolled
                    if (student.isFlexible && student.flexibleData) {
                      statusMatch = true;
                    } else {
                      // For regular enrollment data, check is_currently_enrolled
                      const studentEnrollmentData = student.enrollmentData || [];
                      const latestEnrollment = studentEnrollmentData[0];
                      statusMatch = latestEnrollment && latestEnrollment.is_currently_enrolled;
                    }
                  }
                  
                  // Check search term
                  const searchMatch = searchTerm === '' || 
                    (student.first_name && student.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (student.last_name && student.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (student.student_id_number && student.student_id_number.toLowerCase().includes(searchTerm.toLowerCase()));
                  
                  return statusMatch && searchMatch;
                })
                .map((student) => {
                  // Get enrollment data for this student from the student object
                  const studentEnrollmentData = student.enrollmentData || [];
                  const latestEnrollment = studentEnrollmentData[0]; // Most recent enrollment data
                  
                  // Debug logging
                  console.log('Student:', student.student_id_number, 'Enrollment data:', studentEnrollmentData);
                  console.log('Latest enrollment:', latestEnrollment);
                  if (student.isFlexible && student.flexibleData) {
                    console.log('Flexible data for', student.student_id_number, ':', student.flexibleData);
                    console.log('Year Level:', student.flexibleData.year_level);
                    console.log('Program:', student.flexibleData.program);
                    console.log('Enrollment Date:', student.flexibleData.enrollment_date);
                  }
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {student.student_id_number || student.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {student.full_name || student.name || `${student.first_name} ${student.last_name}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {/* Application Status */}
                          {student.scholarshipApplications && student.scholarshipApplications.length > 0 && (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              student.scholarshipApplications[0].status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                              student.scholarshipApplications[0].status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                              student.scholarshipApplications[0].status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}>
                              App: {student.scholarshipApplications[0].status}
                            </span>
                          )}
                          {/* Flexible Data Status - Always Enrolled */}
                          {student.isFlexible && student.flexibleData && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                              Enrolled
                            </span>
                          )}
                          {/* Regular Enrollment Status */}
                          {!student.isFlexible && latestEnrollment && (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              latestEnrollment.is_currently_enrolled ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}>
                              Enrolled: {latestEnrollment.is_currently_enrolled ? 'Yes' : 'No'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {student.isFlexible && student.flexibleData ? 
                          (student.flexibleData.year_level || student.flexibleData['year level'] || student.flexibleData.grade || 'N/A') :
                          (latestEnrollment?.year_level || student.currentAcademicRecord?.year_level || student.yearLevel || 'N/A')
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {student.isFlexible && student.flexibleData ? 
                          (student.flexibleData.program || student.flexibleData.course || student.flexibleData.major || 'N/A') :
                          (latestEnrollment?.program || student.currentAcademicRecord?.program || student.program || 'N/A')
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {student.isFlexible && student.flexibleData ? 
                          (student.flexibleData.enrollment_date || student.flexibleData['enrollment date'] || student.flexibleData.date || 'N/A') :
                          (latestEnrollment?.enrollment_date || student.enrollmentDate || 'N/A')
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                          {latestEnrollment && (
                            <button className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300" title="Enrollment Data Available">
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

  const renderVerification = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Verification</h1>
            <p className="text-gray-600 dark:text-gray-300">Verify scholarship applicants' enrollment status against your school's academic records</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search applications..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Applications</option>
              <option value="needs_verification">Needs Verification</option>
              <option value="pending">Pending Verification</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Verification Process Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">Verification Process</h3>
            <div className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
              <p><strong>How it works:</strong> Students submit applications with enrollment status set to "not enrolled" by default. Your job is to verify their actual enrollment status against your school's academic records.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="font-medium">⚠️ <strong>Needs Verification:</strong> Student marked as not enrolled BUT has current academic record</p>
                  <p className="font-medium">✅ <strong>Verified Enrolled:</strong> Student confirmed enrolled AND has current academic record</p>
                </div>
                <div>
                  <p className="font-medium">❌ <strong>Claims Enrolled (No Record):</strong> Student marked as enrolled BUT no current academic record</p>
                  <p className="font-medium">ℹ️ <strong>Not Enrolled:</strong> Student confirmed not enrolled AND no current academic record</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm border-l-4 border-l-[#4CAF50] p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Verification</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {verificationStats?.pending_verification || 0}
              </p>
              <p className="text-sm text-[#4CAF50]">
                ↗ +{verificationStats?.pending_this_week || 0} this week
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-800">
              <Clock className="w-6 h-6 text-[#4CAF50]" />
            </div>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm border-l-4 border-l-[#4A90E2] p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Verified Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {verificationStats?.verified_students || 0}
              </p>
              <p className="text-sm text-[#4CAF50]">
                ↗ +{verificationStats?.verified_this_week || 0} this week
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-800">
              <UserCheck className="w-6 h-6 text-[#4A90E2]" />
            </div>
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow-sm border-l-4 border-l-[#FDA811] p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Rejected Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {verificationStats?.rejected_applications || 0}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                ↘ -{verificationStats?.rejected_this_week || 0} this week
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-800">
              <XCircle className="w-6 h-6 text-[#FDA811]" />
            </div>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm border-l-4 border-l-[#4CAF50] p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Verification Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {verificationStats?.verification_rate || 0}%
              </p>
              <p className="text-sm text-[#4CAF50]">↗ Updated</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-800">
              <ShieldCheck className="w-6 h-6 text-[#4CAF50]" />
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Application
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Enrollment Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Verification Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {verificationLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                      <span className="text-gray-600 dark:text-gray-400">Loading applications...</span>
                    </div>
                  </td>
                </tr>
              ) : verificationError ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="text-red-600 dark:text-red-400">
                      Error loading applications: {verificationError}
                    </div>
                  </td>
                </tr>
              ) : verificationApplications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="text-gray-600 dark:text-gray-400">
                      No applications found for verification.
                    </div>
                  </td>
                </tr>
              ) : (
                verificationApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{application.applicationNumber}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{application.scholarshipType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{application.studentName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">ID: {application.studentId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900 dark:text-white">{application.yearLevel} - {application.program}</div>
                      <div className={`text-sm ${
                        application.verificationColor === 'green' ? 'text-green-600 dark:text-green-400' :
                        application.verificationColor === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                        application.verificationColor === 'red' ? 'text-red-600 dark:text-red-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {application.verificationMessage || 'Status Unknown'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Claims: {application.isCurrentlyEnrolled ? 'Yes' : 'No'} | 
                        School Record: {application.academicRecordExists ? 'Found' : 'Missing'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      application.applicationStatus === 'verified' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                      application.applicationStatus === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                      application.applicationStatus === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {application.applicationStatus === 'verified' ? '✓ Verified' :
                       application.applicationStatus === 'pending' ? '⏳ Pending' :
                       application.applicationStatus === 'rejected' ? '✗ Rejected' :
                       application.applicationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={application.verificationNotes}>
                      {application.verificationNotes}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(application.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      {application.verificationStatus === 'needs_verification' && (
                        <>
                          <button 
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                            title="Verify Enrolled"
                            onClick={() => handleVerifyEnrollment(application.id, true)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300"
                            title="Confirm Not Enrolled"
                            onClick={() => handleVerifyEnrollment(application.id, false)}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {application.applicationStatus === 'pending' && application.verificationStatus !== 'needs_verification' && (
                        <>
                          <button className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <UserCheck className="w-8 h-8 text-[#4CAF50]" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">Bulk Verify</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Verify multiple applications</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <FileText className="w-8 h-8 text-[#4A90E2]" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">Export Report</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Download verification report</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
            <Shield className="w-8 h-8 text-[#FDA811]" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">Sync Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Update enrollment records</p>
            </div>
          </button>
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
                  value={schoolInfo?.school?.name || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-600 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Campus</label>
                <input
                  type="text"
                  value={schoolInfo?.school?.campus || 'Main Campus'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-600 text-gray-900 dark:text-white"
                />
              </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Person</label>
                 <input
                   type="text"
                   value={currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : ''}
                   readOnly
                   className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-600 text-gray-900 dark:text-white"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                 <input
                   type="email"
                   value={schoolInfo?.school?.email || ''}
                   readOnly
                   className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-600 text-gray-900 dark:text-white"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                 <input
                   type="text"
                   value={schoolInfo?.school?.contact_number || ''}
                   readOnly
                   className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-600 text-gray-900 dark:text-white"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                 <input
                   type="text"
                   value={schoolInfo?.school?.address ? `${schoolInfo.school.address}, ${schoolInfo.school.city}, ${schoolInfo.school.province}` : ''}
                   readOnly
                   className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-600 text-gray-900 dark:text-white"
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
                 <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                   {loading ? (
                     <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                   ) : schoolInfo ? (
                     schoolInfo.school.name.split(' ')[0]
                   ) : (
                     'School'
                   )}
                 </h1>
                 <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Partner School</p>
               </div>
             )}
           </div>
         </div>
         <hr className="border-slate-200 dark:border-slate-700 mx-2 flex-shrink-0" />
        
        <nav className="flex-1 p-2 md:p-4 space-y-1 md:space-y-2 overflow-y-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'verification', label: 'Verification', icon: Shield },
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
              <span>{currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Representative'}</span>
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
        {activeTab === 'verification' && renderVerification()}
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
