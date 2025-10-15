// Sidebar items configuration for Sidebar.jsx
import { LayoutDashboard, GraduationCap, HandCoins, ClipboardList, Library, FileBarChart, Settings, Users, Shield, ShieldCheck } from 'lucide-react';

const allSidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    {
         id: 'scholarship', icon: GraduationCap, label: 'Scholarship',
         subItems: [
             { id: 'scholarship-overview', label: 'Overview' },
             { id: 'scholarship-applications', label: 'Applications' },
             { id: 'scholarship-programs', label: 'Programs' },
             { id: 'scholarship-ssc', label: 'SSC Management' }
         ]
     },
    {
        id: 'sad', icon: HandCoins, label: 'School Aid Distribution',
        subItems: [
            { id: 'sad-overview', label: 'Overview' },
            { id: 'sad-applications', label: 'Applications' },
            { id: 'sad-payment-processing', label: 'Payment Processing' },
            { id: 'sad-distribution-logs', label: 'Distribution Logs' },
            { id: 'sad-fund-allocation', label: 'Fund Allocation' },
            { id: 'sad-analytics', label: 'Analytics' }
        ]
    },
    {
        id: 'studentRegistry', icon: ClipboardList, label: 'Student Registry',
        subItems: [
            { id: 'studentRegistry-overview', label: 'Overview' },
            { id: 'studentRegistry-active-students', label: 'Active Students' },
            { id: 'studentRegistry-archived-students', label: 'Archived Students' },
            { id: 'studentRegistry-scholars', label: 'Scholars' },
            { id: 'studentRegistry-bulk-operations', label: 'Bulk Operations' },
            { id: 'studentRegistry-reports', label: 'Reports & Analytics' },
            { id: 'studentRegistry-import-export', label: 'Import/Export' }
        ]
    },
    {
        id: 'psd', icon: Library, label: 'Partner School Database',
        subItems: [
            { id: 'psd-school-management', label: 'School Management' },
            { id: 'psd-student-population', label: 'Student Population' },
            { id: 'psd-verification', label: 'Verification & Accreditation' },
            { id: 'psd-analytics', label: 'Analytics & Reports' },
            { id: 'psd-settings', label: 'Settings' }
        ]
    },
    {
        id: 'emr', icon: FileBarChart, label: 'Education Monitoring',
        subItems: [
            { id: 'emr-overview', label: 'Overview' },
            { id: 'emr-academic-performance', label: 'Academic Performance' },
            { id: 'emr-enrollment-statistics', label: 'Enrollment Statistics' },
            { id: 'emr-student-progress', label: 'Student Progress' },
            { id: 'emr-analytics', label: 'Analytics' }
        ]
    },
    { id: 'user-management', icon: Users, label: 'User Management' },
    { id: 'audit-logs', icon: Shield, label: 'Audit Logs' },
    { 
        id: 'security', icon: ShieldCheck, label: 'Security',
        subItems: [
            { id: 'security-dashboard', label: 'Document Security' },
            { id: 'security-threats', label: 'Threat Monitoring' },
            { id: 'security-quarantine', label: 'Quarantine' },
            { id: 'security-settings', label: 'Security Settings' }
        ]
    },
    { id: 'settings', icon: Settings, label: 'Settings' }
];

// Function to get sidebar items based on user role
export const getSidebarItems = (userRole, userSystemRole = null) => {
    // SSC members only see Scholarship module and Settings
    if (userRole === 'ssc') {
        return [
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            {
                id: 'scholarship', icon: GraduationCap, label: 'Scholarship',
                subItems: [
                    { id: 'scholarship-ssc', label: 'SSC Management' }
                ]
            },
            { id: 'settings', icon: Settings, label: 'Settings' }
        ];
    }
    
    // Staff users are restricted - they must have a system_role from scholarship service
    if (userRole === 'staff') {
        // If no system_role, deny all access
        if (!userSystemRole) {
            return [
                { id: 'access-denied', icon: Shield, label: 'Access Denied' }
            ];
        }
        
        // Staff with interviewer system role see only interview-related modules
        if (userSystemRole === 'interviewer') {
            return [
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                {
                    id: 'interviews', icon: ClipboardList, label: 'My Interviews',
                    subItems: [
                        { id: 'interviews-pending', label: 'Pending Interviews' },
                        { id: 'interviews-completed', label: 'Completed' },
                        { id: 'interviews-all', label: 'All Interviews' }
                    ]
                },
                { id: 'settings', icon: Settings, label: 'Settings' }
            ];
        }
        
        // Staff with other system roles see limited modules based on their role
        if (userSystemRole === 'reviewer') {
            return [
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                {
                    id: 'scholarship', icon: GraduationCap, label: 'Scholarship',
                    subItems: [
                        { id: 'scholarship-overview', label: 'Overview' },
                        { id: 'scholarship-applications', label: 'Applications' }
                    ]
                },
                { id: 'settings', icon: Settings, label: 'Settings' }
            ];
        }
        
        if (userSystemRole === 'coordinator') {
            return [
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                {
                    id: 'scholarship', icon: GraduationCap, label: 'Scholarship',
                    subItems: [
                        { id: 'scholarship-overview', label: 'Overview' },
                        { id: 'scholarship-applications', label: 'Applications' },
                        { id: 'scholarship-programs', label: 'Programs' }
                    ]
                },
                {
                    id: 'studentRegistry', icon: ClipboardList, label: 'Student Registry',
                    subItems: [
                        { id: 'studentRegistry-overview', label: 'Overview' },
                        { id: 'studentRegistry-active-students', label: 'Active Students' }
                    ]
                },
                { id: 'settings', icon: Settings, label: 'Settings' }
            ];
        }
        
        // For any other system_role, show limited access
        return [
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'settings', icon: Settings, label: 'Settings' }
        ];
    }
    
    // Admin users see all modules
    if (userRole === 'admin') {
        return allSidebarItems;
    }
    
    // Default: no access
    return [
        { id: 'access-denied', icon: Shield, label: 'Access Denied' }
    ];
};

// Default export for backward compatibility
const sidebarItems = allSidebarItems;
export default sidebarItems; 