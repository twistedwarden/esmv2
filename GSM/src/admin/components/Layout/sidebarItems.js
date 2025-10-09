// Sidebar items configuration for Sidebar.jsx
import { 
    LayoutDashboard, 
    GraduationCap, 
    HandCoins, 
    ClipboardList, 
    Library, 
    FileBarChart, 
    Settings 
} from 'lucide-react';

const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { 
        id: 'scholarship-overview', 
        icon: GraduationCap, 
        label: 'Scholarship',
        subItems: [
            { id: 'scholarship-overview', label: 'Overview' },
            { id: 'scholarship-applications', label: 'Applications' },
            { id: 'scholarship-programs', label: 'Programs' },
            { id: 'scholarship-students', label: 'Students' },
            { id: 'scholarship-documents', label: 'Documents' },
            { id: 'scholarship-reports', label: 'Reports' },
            { id: 'scholarship-settings', label: 'Settings' }
        ]
    },
    { id: 'sad-overview', icon: HandCoins, label: 'School Aid Distribution' },
    { id: 'studentRegistry-overview', icon: ClipboardList, label: 'Student Registry' },
    { id: 'psd-overview', icon: Library, label: 'Partner School Database' },
    { id: 'emr-overview', icon: FileBarChart, label: 'Education Monitoring' },
    { id: 'settings', icon: Settings, label: 'Settings' }
];

export default sidebarItems; 