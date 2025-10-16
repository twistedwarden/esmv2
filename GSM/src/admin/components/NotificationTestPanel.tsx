import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { motion } from 'framer-motion';

const NotificationTestPanel: React.FC = () => {
  const { notificationCounts, refreshNotifications, markAsRead, triggerNotification } = useNotifications();

  const simulateNotifications = () => {
    // This would normally be called by API responses
    // For demo purposes, we'll just refresh the notifications
    refreshNotifications();
  };

  const clearAllNotifications = () => {
    markAsRead('scholarship');
    markAsRead('schoolAid');
    markAsRead('studentRegistry');
    markAsRead('auditLogs');
    markAsRead('security');
  };

  const simulateUserRegistration = () => {
    // Simulate a new user registration
    triggerNotification('studentRegistry', 'newStudents');
  };

  const simulateScholarshipApplication = () => {
    // Simulate a new scholarship application
    triggerNotification('scholarship', 'applications');
  };

  return (
    <motion.div 
      className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Notification System Test Panel
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Notifications</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Scholarship Applications:</span>
                <span className="font-semibold text-orange-600">{notificationCounts.scholarship.applications}</span>
              </div>
              <div className="flex justify-between">
                <span>School Aid Applications:</span>
                <span className="font-semibold text-orange-600">{notificationCounts.schoolAid.applications}</span>
              </div>
              <div className="flex justify-between">
                <span>New Students:</span>
                <span className="font-semibold text-orange-600">{notificationCounts.studentRegistry.newStudents}</span>
              </div>
              <div className="flex justify-between">
                <span>Audit Logs:</span>
                <span className="font-semibold text-orange-600">{notificationCounts.auditLogs.newLogs}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Threats:</span>
                <span className="font-semibold text-orange-600">{notificationCounts.security.threats}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Actions</h4>
            <div className="space-y-2">
              <button
                onClick={simulateNotifications}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Refresh Notifications
              </button>
              <button
                onClick={simulateUserRegistration}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Simulate User Registration
              </button>
              <button
                onClick={simulateScholarshipApplication}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Simulate Scholarship Application
              </button>
              <button
                onClick={clearAllNotifications}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Clear All Notifications
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">How it works:</h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Red dots appear on sidebar modules when there are new notifications</li>
            <li>• Clicking on a module or sub-module marks it as read</li>
            <li>• Notifications are automatically refreshed every 30 seconds</li>
            <li>• The system tracks different types of notifications per module</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationTestPanel;
