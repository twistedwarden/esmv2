import React, { useState } from 'react';
import ApplicationOverview from './ApplicationOverview';
import ScholarshipApplications from './ScholarshipApplications';
import VerifiedEnrolledStudents from './VerifiedEnrolledStudents';
import InterviewSchedules from './InterviewSchedules';
import EndorseToSSC from './EndorseToSSC';

function ApplicationManagement() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', component: ApplicationOverview },
    { id: 'applications', label: 'Application Review', component: ScholarshipApplications },
    { id: 'verified', label: 'Verified Enrolled Students', component: VerifiedEnrolledStudents },
    { id: 'interviews', label: 'Interview Schedules', component: InterviewSchedules },
    { id: 'endorse', label: 'Endorse to SSC', component: EndorseToSSC }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ApplicationOverview;

  return (
    <div>
      {/* Application Sub-navigation */}
      <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
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

export default ApplicationManagement;
