import React, { useState, useEffect } from 'react';
import SSCOverview from './SSCOverview';
import MyQueue from './MyQueue';
import ApplicationReview from './ApplicationReview';
import DecisionHistory from './DecisionHistory';
import SSCMemberManagement from './SSCMemberManagement';
import DocumentVerificationReview from './DocumentVerificationReview';
import FinancialReview from './FinancialReview';
import AcademicReview from './AcademicReview';
import FinalApprovalReview from './FinalApprovalReview';
import { sscRoleService } from '../../../../../services/sscRoleService';

function SSCManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [allowedTabs, setAllowedTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState(null);

  // All available tabs
  const allTabs = [
    { id: 'overview', label: 'Overview', component: SSCOverview },
    { id: 'my-queue', label: 'My Queue', component: MyQueue },
    { id: 'document-verification', label: 'Document Verification', component: DocumentVerificationReview },
    { id: 'financial-review', label: 'Financial Review', component: FinancialReview },
    { id: 'academic-review', label: 'Academic Review', component: AcademicReview },
    { id: 'final-approval', label: 'Final Approval', component: FinalApprovalReview },
    { id: 'history', label: 'Decision History', component: DecisionHistory },
    { id: 'applications', label: 'All Applications', component: ApplicationReview },
    { id: 'members', label: 'SSC Members', component: SSCMemberManagement }
  ];

  // Fetch user's SSC roles and determine allowed tabs
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const roles = await sscRoleService.fetchUserRoles(true); // Force refresh
        console.log('SSCManagement - User Roles:', roles);
        setUserRoles(roles);
        
        const allowed = await sscRoleService.getAllowedTabs();
        console.log('SSCManagement - Allowed Tabs:', allowed);
        setAllowedTabs(allowed);

        // Set default active tab based on user's role
        const primaryTab = await sscRoleService.getPrimaryTab();
        console.log('SSCManagement - Primary Tab:', primaryTab);
        if (allowed.includes(primaryTab)) {
          setActiveTab(primaryTab);
        } else if (allowed.length > 0) {
          setActiveTab(allowed[0]);
        }
      } catch (error) {
        console.error('Error fetching SSC roles:', error);
        // Default to overview if error
        setAllowedTabs(['overview']);
        setActiveTab('overview');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Filter tabs based on user's role
  const tabs = allTabs.filter(tab => allowedTabs.includes(tab.id));

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || SSCOverview;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            SSC Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Loading your SSC role information...
          </p>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          SSC Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {(() => {
            console.log('SSCManagement - Header Logic:', {
              is_chairperson: userRoles?.is_chairperson,
              role_labels: userRoles?.role_labels,
              userRoles: userRoles
            });
            return userRoles?.is_chairperson 
              ? 'SSC Chairperson - Final Approval & Decision Management'
              : userRoles?.role_labels?.join(', ') || 'Scholarship Screening Committee - Application Review';
          })()}
        </p>
      </div>

      {/* SSC Sub-navigation */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Render Active Component */}
      <ActiveComponent />
    </div>
  );
}

export default SSCManagement;
