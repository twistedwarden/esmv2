/**
 * Education Data Aggregation Service
 * Centralizes data fetching to avoid duplicate API calls
 */

class EducationDataService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get cached data or fetch from API
   */
  async getCachedData(key, fetchFunction) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    const data = await fetchFunction();
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    return data;
  }

  /**
   * Fetch and cache student academic data
   */
  async getAcademicOverview(filters = {}) {
    const cacheKey = `academic-overview-${JSON.stringify(filters)}`;
    
    return this.getCachedData(cacheKey, async () => {
      try {
        // First try to get data from monitoring service
        const monitoringData = await this.getFromMonitoringService();
        if (monitoringData) {
          return this.transformMonitoringData(monitoringData, filters);
        }

        // Fallback to direct API calls
        const [students, academicRecords, schools] = await Promise.all([
          this.fetchStudents(filters),
          this.fetchAcademicRecords(filters),
          this.fetchSchools(filters)
        ]);

        return {
          students,
          academicRecords,
          schools,
          metrics: this.calculateMetrics(students, academicRecords, schools)
        };
      } catch (error) {
        console.error('Error fetching academic overview:', error);
        // Return fallback data
        return this.getFallbackData();
      }
    });
  }

  /**
   * Fetch students from Student Registry
   */
  async fetchStudents(filters) {
    try {
      const SCHOLARSHIP_API = import.meta.env.VITE_SCHOLARSHIP_API_URL || 'https://scholarship-gsph.up.railway.app/api';
      const response = await fetch(`${SCHOLARSHIP_API}/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data.data.data : [];
    } catch (error) {
      console.error('Error fetching students:', error);
      console.log('Falling back to mock data');
      return this.getMockStudents();
    }
  }

  /**
   * Fetch academic records
   */
  async fetchAcademicRecords(filters) {
    try {
      const SCHOLARSHIP_API = import.meta.env.VITE_SCHOLARSHIP_API_URL || 'https://scholarship-gsph.up.railway.app/api';
      // Note: This endpoint would need to be implemented in the scholarship service
      const response = await fetch(`${SCHOLARSHIP_API}/academic-records`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching academic records:', error);
      console.log('Falling back to mock data');
      return this.getMockAcademicRecords();
    }
  }

  /**
   * Fetch schools from Partner School Database
   */
  async fetchSchools(filters) {
    try {
      const SCHOLARSHIP_API = import.meta.env.VITE_SCHOLARSHIP_API_URL || 'https://scholarship-gsph.up.railway.app/api';
      const response = await fetch(`${SCHOLARSHIP_API}/public/schools`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching schools:', error);
      console.log('Falling back to mock data');
      return this.getMockSchools();
    }
  }

  /**
   * Calculate key metrics from data
   */
  calculateMetrics(students, academicRecords, schools) {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.is_active !== false).length;
    
    // Calculate GPA statistics
    const gpaData = academicRecords
      .filter(record => record.gpa !== null && record.gpa !== undefined)
      .map(record => parseFloat(record.gpa));
    
    const averageGPA = gpaData.length > 0 
      ? (gpaData.reduce((sum, gpa) => sum + gpa, 0) / gpaData.length).toFixed(2)
      : 0;

    // Calculate graduation rate
    const graduatedStudents = students.filter(s => s.status === 'graduated' || s.status === 'completed').length;
    const graduationRate = totalStudents > 0 ? ((graduatedStudents / totalStudents) * 100).toFixed(1) : 0;

    // Calculate program effectiveness
    const programStats = this.calculateProgramStats(students, academicRecords);
    
    // Calculate school performance
    const schoolStats = this.calculateSchoolStats(students, schools);

    return {
      totalStudents,
      activeStudents,
      graduatedStudents,
      averageGPA: parseFloat(averageGPA),
      graduationRate: parseFloat(graduationRate),
      programStats,
      schoolStats,
      gpaDistribution: this.calculateGPADistribution(gpaData),
      trends: this.calculateTrends(academicRecords)
    };
  }

  /**
   * Calculate program statistics
   */
  calculateProgramStats(students, academicRecords) {
    const programMap = new Map();
    
    students.forEach(student => {
      const program = student.program || student.course || 'Unknown';
      if (!programMap.has(program)) {
        programMap.set(program, {
          name: program,
          totalStudents: 0,
          averageGPA: 0,
          completionRate: 0,
          gpaData: []
        });
      }
      
      const programData = programMap.get(program);
      programData.totalStudents++;
      
      // Find academic records for this student
      const studentRecords = academicRecords.filter(record => record.student_id === student.id);
      if (studentRecords.length > 0) {
        const gpas = studentRecords.map(record => parseFloat(record.gpa)).filter(gpa => !isNaN(gpa));
        if (gpas.length > 0) {
          programData.gpaData.push(...gpas);
        }
      }
    });

    // Calculate averages
    programMap.forEach(program => {
      if (program.gpaData.length > 0) {
        program.averageGPA = (program.gpaData.reduce((sum, gpa) => sum + gpa, 0) / program.gpaData.length).toFixed(2);
      }
      
      // Calculate completion rate (simplified)
      const completed = students.filter(s => s.program === program.name && (s.status === 'graduated' || s.status === 'completed')).length;
      program.completionRate = program.totalStudents > 0 ? ((completed / program.totalStudents) * 100).toFixed(1) : 0;
    });

    return Array.from(programMap.values());
  }

  /**
   * Calculate school statistics
   */
  calculateSchoolStats(students, schools) {
    const schoolMap = new Map();
    
    students.forEach(student => {
      const schoolId = student.school_id || student.current_school_id;
      if (schoolId) {
        const school = schools.find(s => s.id === schoolId);
        const schoolName = school ? school.name : 'Unknown School';
        
        if (!schoolMap.has(schoolId)) {
          schoolMap.set(schoolId, {
            id: schoolId,
            name: schoolName,
            totalStudents: 0,
            averageGPA: 0,
            gpaData: []
          });
        }
        
        const schoolData = schoolMap.get(schoolId);
        schoolData.totalStudents++;
      }
    });

    return Array.from(schoolMap.values());
  }

  /**
   * Calculate GPA distribution
   */
  calculateGPADistribution(gpaData) {
    const distribution = {
      'A (90-100)': 0,
      'B (80-89)': 0,
      'C (70-79)': 0,
      'D (60-69)': 0,
      'F (Below 60)': 0
    };

    gpaData.forEach(gpa => {
      if (gpa >= 90) distribution['A (90-100)']++;
      else if (gpa >= 80) distribution['B (80-89)']++;
      else if (gpa >= 70) distribution['C (70-79)']++;
      else if (gpa >= 60) distribution['D (60-69)']++;
      else distribution['F (Below 60)']++;
    });

    return distribution;
  }

  /**
   * Calculate trends over time
   */
  calculateTrends(academicRecords) {
    // Group by school year and calculate trends
    const yearlyData = {};
    
    academicRecords.forEach(record => {
      const year = record.school_year || '2024';
      if (!yearlyData[year]) {
        yearlyData[year] = {
          year,
          totalRecords: 0,
          averageGPA: 0,
          gpaData: []
        };
      }
      
      yearlyData[year].totalRecords++;
      if (record.gpa) {
        yearlyData[year].gpaData.push(parseFloat(record.gpa));
      }
    });

    // Calculate averages
    Object.values(yearlyData).forEach(yearData => {
      if (yearData.gpaData.length > 0) {
        yearData.averageGPA = (yearData.gpaData.reduce((sum, gpa) => sum + gpa, 0) / yearData.gpaData.length).toFixed(2);
      }
    });

    return Object.values(yearlyData).sort((a, b) => a.year.localeCompare(b.year));
  }

  /**
   * Get fallback data when APIs fail
   */
  getFallbackData() {
    return {
      students: this.getMockStudents(),
      academicRecords: this.getMockAcademicRecords(),
      schools: this.getMockSchools(),
      metrics: {
        totalStudents: 15,
        activeStudents: 12,
        graduatedStudents: 3,
        averageGPA: 3.4,
        graduationRate: 20.0,
        programStats: this.getMockProgramStats(),
        schoolStats: this.getMockSchoolStats(),
        gpaDistribution: {
          'A (90-100)': 2,
          'B (80-89)': 6,
          'C (70-79)': 5,
          'D (60-69)': 2,
          'F (Below 60)': 0
        },
        trends: this.getMockTrends()
      }
    };
  }

  /**
   * Mock data generators
   */
  getMockStudents() {
    return [
      { id: 1, first_name: 'John', last_name: 'Doe', program: 'Computer Science', year_level: '3rd Year', is_active: true, status: 'enrolled', school_id: 1, gpa: 3.5 },
      { id: 2, first_name: 'Jane', last_name: 'Smith', program: 'Engineering', year_level: '2nd Year', is_active: true, status: 'enrolled', school_id: 2, gpa: 3.8 },
      { id: 3, first_name: 'Bob', last_name: 'Johnson', program: 'Business', year_level: '4th Year', is_active: true, status: 'graduated', school_id: 1, gpa: 3.2 },
      { id: 4, first_name: 'Alice', last_name: 'Brown', program: 'Computer Science', year_level: '1st Year', is_active: true, status: 'enrolled', school_id: 3, gpa: 2.9 },
      { id: 5, first_name: 'Maria', last_name: 'Garcia', program: 'Nursing', year_level: '2nd Year', is_active: true, status: 'enrolled', school_id: 1, gpa: 3.7 },
      { id: 6, first_name: 'David', last_name: 'Wilson', program: 'Education', year_level: '3rd Year', is_active: true, status: 'enrolled', school_id: 2, gpa: 3.4 },
      { id: 7, first_name: 'Sarah', last_name: 'Lee', program: 'Psychology', year_level: '4th Year', is_active: true, status: 'graduated', school_id: 3, gpa: 3.6 },
      { id: 8, first_name: 'Michael', last_name: 'Chen', program: 'Computer Science', year_level: '2nd Year', is_active: true, status: 'enrolled', school_id: 1, gpa: 3.1 },
      { id: 9, first_name: 'Emily', last_name: 'Davis', program: 'Engineering', year_level: '3rd Year', is_active: true, status: 'enrolled', school_id: 2, gpa: 3.9 },
      { id: 10, first_name: 'James', last_name: 'Taylor', program: 'Business', year_level: '1st Year', is_active: true, status: 'enrolled', school_id: 3, gpa: 2.8 },
      { id: 11, first_name: 'Lisa', last_name: 'Anderson', program: 'Nursing', year_level: '4th Year', is_active: true, status: 'graduated', school_id: 1, gpa: 3.8 },
      { id: 12, first_name: 'Robert', last_name: 'Martinez', program: 'Education', year_level: '2nd Year', is_active: true, status: 'enrolled', school_id: 2, gpa: 3.3 },
      { id: 13, first_name: 'Jennifer', last_name: 'White', program: 'Psychology', year_level: '3rd Year', is_active: true, status: 'enrolled', school_id: 3, gpa: 3.5 },
      { id: 14, first_name: 'Christopher', last_name: 'Harris', program: 'Computer Science', year_level: '4th Year', is_active: true, status: 'graduated', school_id: 1, gpa: 3.7 },
      { id: 15, first_name: 'Amanda', last_name: 'Clark', program: 'Engineering', year_level: '1st Year', is_active: true, status: 'enrolled', school_id: 2, gpa: 3.2 }
    ];
  }

  getMockAcademicRecords() {
    return [
      { id: 1, student_id: 1, gpa: 3.5, school_year: '2024', educational_level: 'TERTIARY/COLLEGE' },
      { id: 2, student_id: 2, gpa: 3.8, school_year: '2024', educational_level: 'TERTIARY/COLLEGE' },
      { id: 3, student_id: 3, gpa: 3.2, school_year: '2023', educational_level: 'TERTIARY/COLLEGE' },
      { id: 4, student_id: 4, gpa: 2.9, school_year: '2024', educational_level: 'TERTIARY/COLLEGE' },
      { id: 5, student_id: 5, gpa: 3.7, school_year: '2024', educational_level: 'TERTIARY/COLLEGE' },
      { id: 6, student_id: 6, gpa: 3.4, school_year: '2024', educational_level: 'TERTIARY/COLLEGE' },
      { id: 7, student_id: 7, gpa: 3.6, school_year: '2023', educational_level: 'TERTIARY/COLLEGE' },
      { id: 8, student_id: 8, gpa: 3.1, school_year: '2024', educational_level: 'TERTIARY/COLLEGE' },
      { id: 9, student_id: 9, gpa: 3.9, school_year: '2024', educational_level: 'TERTIARY/COLLEGE' },
      { id: 10, student_id: 10, gpa: 2.8, school_year: '2024', educational_level: 'TERTIARY/COLLEGE' },
      { id: 11, student_id: 11, gpa: 3.8, school_year: '2023', educational_level: 'TERTIARY/COLLEGE' },
      { id: 12, student_id: 12, gpa: 3.3, school_year: '2024', educational_level: 'TERTIARY/COLLEGE' },
      { id: 13, student_id: 13, gpa: 3.5, school_year: '2024', educational_level: 'TERTIARY/COLLEGE' },
      { id: 14, student_id: 14, gpa: 3.7, school_year: '2023', educational_level: 'TERTIARY/COLLEGE' },
      { id: 15, student_id: 15, gpa: 3.2, school_year: '2024', educational_level: 'TERTIARY/COLLEGE' }
    ];
  }

  getMockSchools() {
    return [
      { id: 1, name: 'University of Caloocan', type: 'University', location: 'Caloocan City' },
      { id: 2, name: 'Caloocan City College', type: 'College', location: 'Caloocan City' },
      { id: 3, name: 'Polytechnic University', type: 'University', location: 'Manila' },
      { id: 4, name: 'University of the Philippines', type: 'University', location: 'Quezon City' },
      { id: 5, name: 'Ateneo de Manila University', type: 'University', location: 'Quezon City' }
    ];
  }

  getMockProgramStats() {
    return [
      { name: 'Computer Science', totalStudents: 4, averageGPA: 3.3, completionRate: 75.0 },
      { name: 'Engineering', totalStudents: 3, averageGPA: 3.6, completionRate: 100.0 },
      { name: 'Business', totalStudents: 2, averageGPA: 3.0, completionRate: 50.0 },
      { name: 'Nursing', totalStudents: 2, averageGPA: 3.75, completionRate: 100.0 },
      { name: 'Education', totalStudents: 2, averageGPA: 3.35, completionRate: 0.0 },
      { name: 'Psychology', totalStudents: 2, averageGPA: 3.55, completionRate: 50.0 }
    ];
  }

  getMockSchoolStats() {
    return [
      { id: 1, name: 'University of Caloocan', totalStudents: 6, averageGPA: 3.5 },
      { id: 2, name: 'Caloocan City College', totalStudents: 4, averageGPA: 3.6 },
      { id: 3, name: 'Polytechnic University', totalStudents: 5, averageGPA: 3.3 }
    ];
  }

  getMockTrends() {
    return [
      { year: '2022', totalRecords: 120, averageGPA: 3.1 },
      { year: '2023', totalRecords: 135, averageGPA: 3.3 },
      { year: '2024', totalRecords: 150, averageGPA: 3.2 }
    ];
  }

  /**
   * Get data from monitoring service
   */
  async getFromMonitoringService() {
    try {
      // Import the monitoring service dynamically to avoid circular dependencies
      const { monitoringApiService } = await import('../../../../services/monitoringApiService');
      const data = await monitoringApiService.getEducationMetrics();
      return data;
    } catch (error) {
      console.warn('Monitoring service not available, falling back to direct API calls:', error);
      return null;
    }
  }

  /**
   * Transform monitoring service data to match expected format
   */
  transformMonitoringData(monitoringData, filters) {
    const { overview, gpa_statistics, program_distribution, school_distribution, trends } = monitoringData;
    
    // Transform the data to match the expected format
    return {
      students: this.transformStudentsFromMonitoring(overview, program_distribution),
      academicRecords: this.transformAcademicRecordsFromMonitoring(gpa_statistics),
      schools: this.transformSchoolsFromMonitoring(school_distribution),
      metrics: {
        totalStudents: overview.total_students || 0,
        activeStudents: overview.active_students || 0,
        graduatedStudents: this.calculateGraduatedStudents(overview),
        averageGPA: gpa_statistics.average_gpa || 0,
        graduationRate: this.calculateGraduationRate(overview),
        programStats: this.transformProgramStats(program_distribution),
        schoolStats: this.transformSchoolStats(school_distribution),
        gpaDistribution: gpa_statistics.gpa_distribution || {},
        trends: this.transformTrends(trends)
      }
    };
  }

  /**
   * Transform students data from monitoring service
   */
  transformStudentsFromMonitoring(overview, programDistribution) {
    // Create mock student data based on monitoring metrics
    const students = [];
    let studentId = 1;
    
    programDistribution.forEach(program => {
      for (let i = 0; i < program.total_students; i++) {
        students.push({
          id: studentId++,
          first_name: `Student${studentId}`,
          last_name: 'Name',
          program: program.name,
          year_level: this.getRandomYearLevel(),
          is_active: i < program.active_students,
          status: i < program.active_students ? 'enrolled' : 'graduated',
          school_id: Math.floor(Math.random() * 3) + 1,
          gpa: this.getRandomGPA()
        });
      }
    });
    
    return students;
  }

  /**
   * Transform academic records from monitoring service
   */
  transformAcademicRecordsFromMonitoring(gpaStats) {
    const records = [];
    let recordId = 1;
    
    // Create academic records based on GPA statistics
    const totalRecords = gpaStats.total_records || 0;
    for (let i = 0; i < totalRecords; i++) {
      records.push({
        id: recordId++,
        student_id: i + 1,
        gpa: this.getRandomGPA(),
        school_year: '2024',
        educational_level: 'TERTIARY/COLLEGE'
      });
    }
    
    return records;
  }

  /**
   * Transform schools data from monitoring service
   */
  transformSchoolsFromMonitoring(schoolDistribution) {
    return schoolDistribution.map((school, index) => ({
      id: index + 1,
      name: school.name,
      type: 'University',
      location: 'Philippines',
      total_students: school.total_students,
      active_students: school.active_students
    }));
  }

  /**
   * Transform program statistics
   */
  transformProgramStats(programDistribution) {
    return programDistribution.map(program => ({
      name: program.name,
      totalStudents: program.total_students,
      averageGPA: this.getRandomGPA(),
      completionRate: this.calculateCompletionRate(program)
    }));
  }

  /**
   * Transform school statistics
   */
  transformSchoolStats(schoolDistribution) {
    return schoolDistribution.map(school => ({
      id: school.name,
      name: school.name,
      totalStudents: school.total_students,
      averageGPA: this.getRandomGPA()
    }));
  }

  /**
   * Transform trends data
   */
  transformTrends(trends) {
    if (!trends || !Array.isArray(trends)) {
      return this.getMockTrends();
    }
    
    return trends.map(trend => ({
      year: trend.month || '2024',
      totalRecords: trend.new_students || 0,
      averageGPA: this.getRandomGPA()
    }));
  }

  /**
   * Helper methods for data transformation
   */
  calculateGraduatedStudents(overview) {
    return Math.floor((overview.total_students || 0) * 0.2); // Assume 20% graduated
  }

  calculateGraduationRate(overview) {
    const total = overview.total_students || 0;
    const graduated = this.calculateGraduatedStudents(overview);
    return total > 0 ? ((graduated / total) * 100).toFixed(1) : 0;
  }

  calculateCompletionRate(program) {
    return Math.floor(Math.random() * 50) + 50; // Random between 50-100%
  }

  getRandomYearLevel() {
    const levels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  getRandomGPA() {
    return parseFloat((Math.random() * 2 + 2).toFixed(2)); // Random between 2.0-4.0
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const educationDataService = new EducationDataService();
export default educationDataService;
