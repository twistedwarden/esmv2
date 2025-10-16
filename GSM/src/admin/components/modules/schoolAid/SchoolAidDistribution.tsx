import { useState } from 'react';
import { 
  FileText, 
  DollarSign
} from 'lucide-react';
import { TabConfig, ScholarshipApplication } from './types';
import ApplicationsTab from './tabs/ApplicationsTab';
import PaymentsTab from './tabs/PaymentsTab';
import PaymentModal from './components/PaymentModal';
import { schoolAidService } from './services/schoolAidService';

const SchoolAidDistribution = () => {
  const [activeTab, setActiveTab] = useState('applications');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    application: undefined as ScholarshipApplication | undefined,
    mode: 'view' as 'view' | 'process' | 'edit'
  });

  const tabs: TabConfig[] = [
    {
      id: 'applications',
      label: 'Processing Grants',
      icon: FileText,
      component: ApplicationsTab,
      submodules: []
    },
    {
      id: 'payments',
      label: 'Disbursement',
      icon: DollarSign,
      component: PaymentsTab,
      statusFilter: ['grants_processing'],
      submodules: []
    }
  ];

  const activeTabConfig = tabs.find(tab => tab.id === activeTab);

  const handleProcessPayment = async (application: ScholarshipApplication): Promise<void> => {
    try {
      console.log('Processing payment for:', application);
      
      // Process payment through service
      const paymentRecord = await schoolAidService.processPayment(application.id, 'bank_transfer');
      
      // Update application status to processing
      await schoolAidService.updateApplicationStatus(application.id, 'grants_processing');
      
      console.log('Payment processed successfully:', paymentRecord);
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  };

  const handleBatchProcessPayments = async (applicationIds: string[]) => {
    try {
      console.log('Batch processing payments for:', applicationIds);
      
      // Update all applications to processing status
      await schoolAidService.batchUpdateApplications(applicationIds, 'grants_processing');
      
      // Process each payment
      for (const applicationId of applicationIds) {
        await schoolAidService.processPayment(applicationId, 'bank_transfer');
      }
      
      console.log('Batch payment processing completed');
    } catch (error) {
      console.error('Error batch processing payments:', error);
      throw error;
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      await schoolAidService.updateApplicationStatus(applicationId, 'approved');
      console.log('Application approved:', applicationId);
    } catch (error) {
      console.error('Error approving application:', error);
      throw error;
    }
  };

  const handleRejectApplication = async (applicationId: string, reason: string) => {
    try {
      await schoolAidService.updateApplicationStatus(applicationId, 'rejected', reason);
      console.log('Application rejected:', applicationId, reason);
    } catch (error) {
      console.error('Error rejecting application:', error);
      throw error;
    }
  };

  const handleProcessGrant = async (application: ScholarshipApplication) => {
    try {
      // Process grant using the dedicated API endpoint
      const result = await schoolAidService.processGrant(application.id);
      console.log('Grant processing initiated for application:', application.id, result);
      
      // Show success message or notification
      // You can add additional logic here for grant processing
      // For example, creating disbursement records, sending notifications, etc.
      
    } catch (error) {
      console.error('Error processing grant:', error);
      throw error;
    }
  };

  const renderTabContent = () => {
    if (!activeTabConfig || !activeTabConfig.component) return null;
    
    const Component = activeTabConfig.component;
    const submoduleConfig = {
      id: activeTabConfig.id,
      label: activeTabConfig.label,
      description: '',
      component: Component,
      statusFilter: activeTabConfig.statusFilter,
      actions: []
    };
    
    return (
      <Component
        submodule={submoduleConfig}
        activeTab={activeTab}
        activeSubmodule={activeTab}
        selectedApplications={selectedApplications}
        setSelectedApplications={setSelectedApplications}
        modalState={modalState}
        setModalState={setModalState}
        onProcessPayment={handleProcessPayment}
        onProcessGrant={handleProcessGrant}
        onBatchProcessPayments={handleBatchProcessPayments}
        onApproveApplication={handleApproveApplication}
        onRejectApplication={handleRejectApplication}
      />
    );
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
        <h1 className="text-2xl font-bold text-gray-900">School Aid Distribution</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage and track scholarship fund disbursements to students
        </p>
          </div>
          {selectedApplications.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedApplications.length} selected
              </span>
              <button 
                onClick={() => setSelectedApplications([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    transition-colors duration-200 relative
                    ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {tab.badge && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>


      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        modalState={modalState}
        setModalState={setModalState}
        onProcessPayment={handleProcessPayment}
      />
    </div>
  );
};

export default SchoolAidDistribution;

