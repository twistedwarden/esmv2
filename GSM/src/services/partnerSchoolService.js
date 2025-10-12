import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.SCHOLARSHIP_SERVICE.BASE_URL;

/**
 * Fetch school information for the current partner school representative
 */
export const fetchPartnerSchoolInfo = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/partner-school/info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch school info');
    }
  } catch (error) {
    console.error('Error fetching partner school info:', error);
    throw error;
  }
};

/**
 * Fetch statistics for the partner school
 */
export const fetchPartnerSchoolStats = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/partner-school/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch school stats');
    }
  } catch (error) {
    console.error('Error fetching partner school stats:', error);
    throw error;
  }
};

/**
 * Fetch students for the partner school
 */
export const fetchPartnerSchoolStudents = async (token, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/api/partner-school/students?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch students');
    }
  } catch (error) {
    console.error('Error fetching partner school students:', error);
    throw error;
  }
};

/**
 * Fetch scholarship applications for verification
 */
export const fetchApplicationsForVerification = async (token, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/api/partner-school/verification/applications?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch applications for verification');
    }
  } catch (error) {
    console.error('Error fetching applications for verification:', error);
    throw error;
  }
};

/**
 * Verify a scholarship application
 */
export const verifyApplication = async (token, applicationId, verificationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/partner-school/verification/applications/${applicationId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verificationData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to verify application');
    }
  } catch (error) {
    console.error('Error verifying application:', error);
    throw error;
  }
};

/**
 * Get verification statistics
 */
export const fetchVerificationStats = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/partner-school/verification/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch verification stats');
    }
  } catch (error) {
    console.error('Error fetching verification stats:', error);
    throw error;
  }
};

/**
 * Upload enrollment data CSV
 */
export const uploadEnrollmentData = async (token, csvData, updateMode = 'merge') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/partner-school/enrollment/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        csv_data: csvData,
        update_mode: updateMode
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to upload enrollment data');
    }
  } catch (error) {
    console.error('Error uploading enrollment data:', error);
    throw error;
  }
};

/**
 * Fetch enrollment data for the partner school
 */
export const fetchEnrollmentData = async (token, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/api/partner-school/enrollment/data?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch enrollment data');
    }
  } catch (error) {
    console.error('Error fetching enrollment data:', error);
    throw error;
  }
};

// Flexible data upload (accepts any CSV structure)
export const uploadFlexibleData = async (token, csvData, headers, updateMode = 'merge') => {
  try {
    console.log('uploadFlexibleData called with:', { token, csvDataLength: csvData.length, headers, updateMode });
    console.log('API_BASE_URL:', API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/api/partner-school/flexible/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        csv_data: csvData,
        headers: headers,
        update_mode: updateMode
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Upload response:', data);
    
    if (data.success) {
      return data;
    } else {
      throw new Error(data.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Error uploading flexible data:', error);
    throw error;
  }
};

// Fetch flexible students data
export const fetchFlexibleStudents = async (token, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    queryParams.append('per_page', params.per_page || 1000); // Request up to 1000 records
    if (params.search) queryParams.append('search', params.search);
    
    const response = await fetch(`${API_BASE_URL}/api/partner-school/flexible/students?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch flexible students');
    }
  } catch (error) {
    console.error('Error fetching flexible students:', error);
    throw error;
  }
};