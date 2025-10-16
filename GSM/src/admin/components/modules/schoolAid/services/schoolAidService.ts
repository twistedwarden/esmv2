// School Aid Distribution Service
import { ScholarshipApplication, PaymentRecord, ProcessingMetrics } from '../types';

const API_BASE_URL = import.meta.env.VITE_AID_API_URL || 'http://localhost:8002/api';

class SchoolAidService {
  // Applications
  async getApplications(filters?: {
    status?: string;
    priority?: string;
    search?: string;
    submodule?: string;
  }): Promise<ScholarshipApplication[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.submodule) params.append('submodule', filters.submodule);

    const response = await fetch(`${API_BASE_URL}/school-aid/applications?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch applications: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async updateApplicationStatus(applicationId: string, status: string, notes?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/school-aid/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, notes }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update application status: ${response.statusText}`);
    }
  }

  async processGrant(applicationId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/school-aid/applications/${applicationId}/process-grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to process grant: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async batchUpdateApplications(applicationIds: string[], status: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/school-aid/applications/batch-update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ applicationIds, status }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to batch update applications: ${response.statusText}`);
    }
  }

  // Payments
  async processPayment(applicationId: string, paymentMethod: string): Promise<PaymentRecord> {
    const response = await fetch(`${API_BASE_URL}/school-aid/payments/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ applicationId, paymentMethod }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to process payment: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async retryPayment(paymentId: string): Promise<PaymentRecord> {
    const response = await fetch(`${API_BASE_URL}/school-aid/payments/${paymentId}/retry`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to retry payment: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getPaymentRecords(filters?: { status?: string }): Promise<PaymentRecord[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);

    const response = await fetch(`${API_BASE_URL}/school-aid/payments?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch payment records: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Analytics
  async getMetrics(): Promise<ProcessingMetrics> {
    const response = await fetch(`${API_BASE_URL}/school-aid/metrics`);
    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getAnalyticsData(type: string, dateRange: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/school-aid/analytics/${type}?range=${dateRange}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch analytics data: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Settings
  async getSettings(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/school-aid/settings`);
    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async updateSettings(settings: any): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/school-aid/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update settings: ${response.statusText}`);
    }
  }

  async testConfiguration(type: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/school-aid/settings/test/${type}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to test configuration: ${response.statusText}`);
    }
    
    return await response.json();
  }

}

export const schoolAidService = new SchoolAidService();
