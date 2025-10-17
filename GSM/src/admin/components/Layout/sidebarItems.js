// Sidebar items configuration for Sidebar.jsx
import { LayoutDashboard, GraduationCap, HandCoins, ClipboardList, Library, FileBarChart, Settings, Users, Shield, ShieldCheck, Archive } from 'lucide-react';
import translationService from '../../../services/translationService';

const allSidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    {
         id: 'scholarship', icon: GraduationCap, label: 'Scholarship',
         subItems: [
             { id: 'scholarship-applications', label: 'Applications' },
             { id: 'scholarship-programs', label: 'Programs' },
             { id: 'scholarship-ssc', label: 'SSC Management' }
         ]
     },
    {
        id: 'sad', icon: HandCoins, label: 'School Aid Distribution',
        subItems: [
            { id: 'sad-overview', label: 'Overview' }
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
            { id: 'emr-dashboard', label: 'Dashboard' },
            { id: 'emr-reports', label: 'Reports' },
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
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'archived', icon: Archive, label: 'Archived Data' }
];

// Function to get translated sidebar items based on user role
export const getSidebarItems = (userRole, userSystemRole, t = null) => {
    // If no translation function provided, use the service directly
    if (!t) {
        try {
            // Ensure translations are loaded before using
            translationService.ensureTranslationsLoaded();
            t = translationService.t.bind(translationService);
            
            // Debug logging
            const status = translationService.getStatus();
            console.log('Sidebar translation status:', status);
        } catch (error) {
            console.error('Translation service error:', error);
            // Fallback function that returns the key as-is
            t = (key) => key;
        }
    }
    // SSC members only see Scholarship module and Settings
    if (userRole === 'ssc' || String(userRole).startsWith('ssc_')) {
        return [
            { id: 'dashboard', icon: LayoutDashboard, label: t('Dashboard') },
            {
                id: 'scholarship', icon: GraduationCap, label: t('Scholarship'),
                subItems: [
                    { id: 'scholarship-ssc', label: t('SSC Management') }
                ]
            },
            { id: 'settings', icon: Settings, label: t('Settings') }
        ];
    }
    
    // Staff users are restricted - they must have a system_role from scholarship service
    if (userRole === 'staff') {
        // If no system_role, deny all access
        if (!userSystemRole) {
            return [
                { id: 'access-denied', icon: Shield, label: t('Access Denied') }
            ];
        }
        
        // Staff with interviewer system role see only interview-related modules
        if (userSystemRole === 'interviewer') {
            return [
                { id: 'dashboard', icon: LayoutDashboard, label: t('Dashboard') },
                {
                    id: 'interviews', icon: ClipboardList, label: t('My Interviews'),
                    subItems: [
                        { id: 'interviews-pending', label: t('Pending Interviews') },
                        { id: 'interviews-completed', label: t('Completed') },
                        { id: 'interviews-all', label: t('All Interviews') }
                    ]
                },
                { id: 'settings', icon: Settings, label: t('Settings') }
            ];
        }
        
        // Staff with other system roles see limited modules based on their role
        if (userSystemRole === 'reviewer') {
            return [
                { id: 'dashboard', icon: LayoutDashboard, label: t('Dashboard') },
                {
                    id: 'scholarship', icon: GraduationCap, label: t('Scholarship'),
                    subItems: [
                        { id: 'scholarship-applications', label: t('Applications') }
                    ]
                },
                { id: 'settings', icon: Settings, label: t('Settings') }
            ];
        }
        
        if (userSystemRole === 'coordinator') {
            return [
                { id: 'dashboard', icon: LayoutDashboard, label: t('Dashboard') },
                {
                    id: 'scholarship', icon: GraduationCap, label: t('Scholarship'),
                    subItems: [
                        { id: 'scholarship-applications', label: t('Applications') },
                        { id: 'scholarship-programs', label: t('Programs') }
                    ]
                },
                {
                    id: 'studentRegistry', icon: ClipboardList, label: t('Student Registry'),
                    subItems: [
                        { id: 'studentRegistry-overview', label: t('Overview') },
                        { id: 'studentRegistry-active-students', label: t('Active Students') }
                    ]
                },
                { id: 'settings', icon: Settings, label: t('Settings') }
            ];
        }
        
        // For any other system_role, show limited access
        return [
            { id: 'dashboard', icon: LayoutDashboard, label: t('Dashboard') },
            { id: 'settings', icon: Settings, label: t('Settings') }
        ];
    }
    
    // Admin users see all modules
    if (userRole === 'admin') {
        return allSidebarItems.map(item => ({
            ...item,
            label: t(item.label),
            subItems: item.subItems ? item.subItems.map(subItem => ({
                ...subItem,
                label: t(subItem.label)
            })) : undefined
        }));
    }
    
    // Default: no access
    return [
        { id: 'access-denied', icon: Shield, label: t('Access Denied') }
    ];
};

// Default export for backward compatibility
const sidebarItems = allSidebarItems;
export default sidebarItems; 