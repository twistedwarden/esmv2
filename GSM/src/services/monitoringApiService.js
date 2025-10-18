import { API_CONFIG, getMonitoringServiceUrl } from '../config/api';

class MonitoringApiService {
  constructor() {
    this.baseUrl = API_CONFIG.MONITORING_SERVICE.BASE_URL;
  }

  /**
   * Make HTTP request to monitoring service
   */
  async makeRequest(endpoint, options = {}) {
    const url = getMonitoringServiceUrl(endpoint);
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Monitoring API request failed:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive education metrics
   */
  async getEducationMetrics(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams 
        ? `${API_CONFIG.MONITORING_SERVICE.ENDPOINTS.EDUCATION_METRICS}?${queryParams}`
        : API_CONFIG.MONITORING_SERVICE.ENDPOINTS.EDUCATION_METRICS;
      
      const response = await this.makeRequest(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching education metrics:', error);
      throw error;
    }
  }

  /**
   * Get student performance trends
   */
  async getStudentTrends(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams 
        ? `${API_CONFIG.MONITORING_SERVICE.ENDPOINTS.STUDENT_TRENDS}?${queryParams}`
        : API_CONFIG.MONITORING_SERVICE.ENDPOINTS.STUDENT_TRENDS;
      
      const response = await this.makeRequest(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching student trends:', error);
      throw error;
    }
  }

  /**
   * Get program effectiveness data
   */
  async getProgramEffectiveness(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams 
        ? `${API_CONFIG.MONITORING_SERVICE.ENDPOINTS.PROGRAM_EFFECTIVENESS}?${queryParams}`
        : API_CONFIG.MONITORING_SERVICE.ENDPOINTS.PROGRAM_EFFECTIVENESS;
      
      const response = await this.makeRequest(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching program effectiveness:', error);
      throw error;
    }
  }

  /**
   * Get school performance data
   */
  async getSchoolPerformance(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams 
        ? `${API_CONFIG.MONITORING_SERVICE.ENDPOINTS.SCHOOL_PERFORMANCE}?${queryParams}`
        : API_CONFIG.MONITORING_SERVICE.ENDPOINTS.SCHOOL_PERFORMANCE;
      
      const response = await this.makeRequest(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching school performance:', error);
      throw error;
    }
  }

  /**
   * Generate monitoring report
   */
  async generateReport(reportData) {
    try {
      const response = await this.makeRequest(
        API_CONFIG.MONITORING_SERVICE.ENDPOINTS.GENERATE_REPORT,
        {
          method: 'POST',
          body: JSON.stringify(reportData),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Test connection to scholarship service
   */
  async testScholarshipConnection() {
    try {
      const response = await this.makeRequest(
        API_CONFIG.MONITORING_SERVICE.ENDPOINTS.TEST_SCHOLARSHIP_CONNECTION
      );
      return response;
    } catch (error) {
      console.error('Error testing scholarship connection:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.makeRequest(API_CONFIG.MONITORING_SERVICE.ENDPOINTS.HEALTH);
      return response;
    } catch (error) {
      console.error('Error checking monitoring service health:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const monitoringApiService = new MonitoringApiService();
export default monitoringApiService;
