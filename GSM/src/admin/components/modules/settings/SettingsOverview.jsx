import React, { useState, useEffect } from 'react';
import { 
    User, 
    Lock, 
    Bell, 
    Moon, 
    Settings as SettingsIcon,
    Shield,
    Database,
    Download,
    RefreshCw,
    Eye,
    EyeOff,
    Save,
    AlertCircle,
    CheckCircle,
    Server,
    BarChart3,
    Users,
    FileText,
    Trash2
} from 'lucide-react';
import { LoadingData } from '../../ui/LoadingSpinner';
import { settingsService } from '../../../../services/settingsService';
import { useToastContext } from '../../../../components/providers/ToastProvider';
import { useAuthStore } from '../../../../store/v1authStore';
import NotificationTestPanel from '../../NotificationTestPanel';

function SettingsOverview() {
    const { showSuccess, showError } = useToastContext();
    const { currentUser, updateCurrentUser } = useAuthStore();
    
    // State management
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [showNotificationTestPanel, setShowNotificationTestPanel] = useState(false);
    
    // Profile state
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        email: '',
        mobile: '',
        address: ''
    });
    
    // Password state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
    
    // Notifications state
    const [notifications, setNotifications] = useState({
        email_notifications: true,
        sms_alerts: false,
        push_notifications: true,
        weekly_reports: true,
        system_updates: true
    });
    
    // System settings state
    const [systemSettings, setSystemSettings] = useState({
        theme: 'light',
        language: 'en',
        timezone: 'Asia/Manila',
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
        items_per_page: 25,
        auto_logout: 30,
        session_timeout: 60
    });
    
    // System health state
    const [systemHealth, setSystemHealth] = useState(null);
    const [adminStats, setAdminStats] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            
            // Load user profile from settings service
            const userProfile = await settingsService.getCurrentUserProfile();
            setProfile({
                first_name: userProfile.first_name || userProfile.name?.split(' ')[0] || '',
                last_name: userProfile.last_name || userProfile.name?.split(' ').slice(-1)[0] || '',
                middle_name: userProfile.middle_name || '',
                email: userProfile.email || '',
                mobile: userProfile.mobile || userProfile.phone || '',
                address: userProfile.address || ''
            });
            
            // Load notification preferences
            const notificationPrefs = await settingsService.getNotificationPreferences();
            setNotifications(notificationPrefs);
            
            // Load system settings
            const systemPrefs = await settingsService.getSystemSettings();
            setSystemSettings(systemPrefs);
            
            // Load system health
            try {
                const health = await settingsService.getSystemHealth();
                setSystemHealth(health);
            } catch (error) {
                console.warn('Could not load system health:', error);
            }
            
            // Load admin stats
            try {
                const stats = await settingsService.getAdminStats();
                setAdminStats(stats);
            } catch (error) {
                console.warn('Could not load admin stats:', error);
            }
            
        } catch (error) {
            console.error('Error loading settings:', error);
            showError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    // Password strength validation
    const validatePasswordStrength = (password) => {
        const feedback = [];
        let score = 0;

        if (password.length >= 8) {
            feedback.push({ text: 'At least 8 characters', valid: true });
            score += 20;
        } else {
            feedback.push({ text: 'At least 8 characters', valid: false });
        }

        if (/[a-z]/.test(password)) {
            feedback.push({ text: 'One lowercase letter', valid: true });
            score += 20;
        } else {
            feedback.push({ text: 'One lowercase letter', valid: false });
        }

        if (/[A-Z]/.test(password)) {
            feedback.push({ text: 'One uppercase letter', valid: true });
            score += 20;
        } else {
            feedback.push({ text: 'One uppercase letter', valid: false });
        }

        if (/\d/.test(password)) {
            feedback.push({ text: 'One number', valid: true });
            score += 20;
        } else {
            feedback.push({ text: 'One number', valid: false });
        }

        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            feedback.push({ text: 'One special character', valid: true });
            score += 20;
        } else {
            feedback.push({ text: 'One special character', valid: false });
        }

        return { score, feedback };
    };

    const handleProfileChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handlePasswordChange = (field, value) => {
        setPasswordForm(prev => ({ ...prev, [field]: value }));
        
        if (field === 'newPassword') {
            const strength = validatePasswordStrength(value);
            setPasswordStrength(strength);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleNotificationChange = (field, value) => {
        setNotifications(prev => ({ ...prev, [field]: value }));
    };

    const handleSystemSettingChange = (field, value) => {
        setSystemSettings(prev => ({ ...prev, [field]: value }));
    };

    const saveProfile = async () => {
        try {
            setSaving(true);
            console.log('Saving profile:', profile);
            const result = await settingsService.updateUserProfile(profile);
            console.log('Profile update result:', result);
            
            // Update the auth store with the new profile data
            if (result.success && result.data) {
                // Update the current user in the auth store using the new method
                updateCurrentUser({
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    middle_name: profile.middle_name,
                    email: profile.email,
                    mobile: profile.mobile,
                    address: profile.address
                });
                
                console.log('Profile updated in auth store');
            }
            
            showSuccess('Profile updated successfully');
        } catch (error) {
            console.error('Profile update error:', error);
            showError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const changePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showError('New passwords do not match');
            return;
        }

        if (passwordStrength.score < 100) {
            showError('Please ensure all password requirements are met');
            return;
        }

        try {
            setSaving(true);
            await settingsService.changePassword(passwordForm);
            showSuccess('Password changed successfully');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setPasswordStrength({ score: 0, feedback: [] });
        } catch (error) {
            showError('Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const saveNotifications = async () => {
        try {
            setSaving(true);
            await settingsService.updateNotificationPreferences(notifications);
            showSuccess('Notification preferences updated');
        } catch (error) {
            showError('Failed to update notification preferences');
        } finally {
            setSaving(false);
        }
    };

    const saveSystemSettings = async () => {
        try {
            setSaving(true);
            await settingsService.updateSystemSettings(systemSettings);
            showSuccess('System settings updated');
        } catch (error) {
            showError('Failed to update system settings');
        } finally {
            setSaving(false);
        }
    };

    const exportData = async (type) => {
        try {
            await settingsService.exportSystemData(type);
            showSuccess(`Data exported successfully`);
        } catch (error) {
            showError('Failed to export data');
        }
    };

    const clearCache = async () => {
        try {
            await settingsService.clearSystemCache();
            showSuccess('System cache cleared');
        } catch (error) {
            showError('Failed to clear cache');
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'system', label: 'System', icon: SettingsIcon },
        { id: 'admin', label: 'Admin Tools', icon: Shield }
    ];

    if (loading) {
        return <LoadingData />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your profile, account, notifications, and system preferences.</p>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="border-b border-slate-200 dark:border-slate-700">
                    <nav className="flex space-x-8 px-6">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                        activeTab === tab.id
                                            ? 'border-orange-500 text-orange-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
            </div>

                <div className="p-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={profile.first_name}
                                        onChange={(e) => handleProfileChange('first_name', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={profile.last_name}
                                        onChange={(e) => handleProfileChange('last_name', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Middle Name</label>
                                    <input
                                        type="text"
                                        value={profile.middle_name}
                                        onChange={(e) => handleProfileChange('middle_name', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => handleProfileChange('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mobile</label>
                                    <input
                                        type="tel"
                                        value={profile.mobile}
                                        onChange={(e) => handleProfileChange('mobile', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Address</label>
                                    <textarea
                                        value={profile.address}
                                        onChange={(e) => handleProfileChange('address', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={saveProfile}
                                    disabled={saving}
                                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div className="max-w-md">
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Change Password</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.current ? "text" : "password"}
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                                className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('current')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPasswords.current ? (
                                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-slate-400" />
                                                )}
                                            </button>
                                        </div>
                    </div>
                        <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? "text" : "password"}
                                                value={passwordForm.newPassword}
                                                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                                className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('new')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPasswords.new ? (
                                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-slate-400" />
                                                )}
                                            </button>
                                        </div>
                                        {passwordForm.newPassword && (
                                            <div className="mt-2">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                                passwordStrength.score < 40 ? 'bg-red-500' :
                                                                passwordStrength.score < 70 ? 'bg-yellow-500' : 'bg-green-500'
                                                            }`}
                                                            style={{ width: `${passwordStrength.score}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">{passwordStrength.score}%</span>
                                                </div>
                                                <div className="space-y-1">
                                                    {passwordStrength.feedback.map((item, index) => (
                                                        <div key={index} className="flex items-center space-x-2 text-sm">
                                                            {item.valid ? (
                                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                            ) : (
                                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                                            )}
                                                            <span className={item.valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                                {item.text}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                        </div>
                        <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? "text" : "password"}
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                                className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPasswords.confirm ? (
                                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-slate-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={changePassword}
                                        disabled={saving || passwordStrength.score < 100 || passwordForm.newPassword !== passwordForm.confirmPassword}
                                        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        <Lock className="w-4 h-4" />
                                        <span>{saving ? 'Changing...' : 'Change Password'}</span>
                                    </button>
                        </div>
                    </div>
                </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            {/* Notification Test Panel Toggle */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                            Notification Test Panel
                                        </h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                            Show/hide the notification system test panel for debugging and testing purposes
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showNotificationTestPanel}
                                            onChange={(e) => setShowNotificationTestPanel(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Notification Test Panel */}
                            {showNotificationTestPanel && (
                                <NotificationTestPanel />
                            )}

                            {/* Regular Notification Settings */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
                                {Object.entries(notifications).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                                                {key.replace(/_/g, ' ')}
                                            </h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {key === 'email_notifications' && 'Receive notifications via email'}
                                                {key === 'sms_alerts' && 'Receive SMS alerts for important updates'}
                                                {key === 'push_notifications' && 'Receive push notifications in browser'}
                                                {key === 'weekly_reports' && 'Receive weekly summary reports'}
                                                {key === 'system_updates' && 'Receive system maintenance notifications'}
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={value}
                                                onChange={(e) => handleNotificationChange(key, e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={saveNotifications}
                                    disabled={saving}
                                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* System Tab */}
                    {activeTab === 'system' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Theme</label>
                                    <select
                                        value={systemSettings.theme}
                                        onChange={(e) => handleSystemSettingChange('theme', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    >
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                        <option value="auto">Auto</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Language</label>
                                    <select
                                        value={systemSettings.language}
                                        onChange={(e) => handleSystemSettingChange('language', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    >
                                        <option value="en">English</option>
                                        <option value="fil">Filipino</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Timezone</label>
                                    <select
                                        value={systemSettings.timezone}
                                        onChange={(e) => handleSystemSettingChange('timezone', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    >
                                        <option value="Asia/Manila">Asia/Manila</option>
                                        <option value="UTC">UTC</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date Format</label>
                                    <select
                                        value={systemSettings.date_format}
                                        onChange={(e) => handleSystemSettingChange('date_format', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    >
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Time Format</label>
                                    <select
                                        value={systemSettings.time_format}
                                        onChange={(e) => handleSystemSettingChange('time_format', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    >
                                        <option value="12h">12 Hour</option>
                                        <option value="24h">24 Hour</option>
                                    </select>
                    </div>
                        <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Items Per Page</label>
                                    <select
                                        value={systemSettings.items_per_page}
                                        onChange={(e) => handleSystemSettingChange('items_per_page', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                        </div>
                    </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={saveSystemSettings}
                                    disabled={saving}
                                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                                </button>
                    </div>
                </div>
                    )}

                    {/* Admin Tools Tab */}
                    {activeTab === 'admin' && (
                        <div className="space-y-6">
                            {/* System Health */}
                            {systemHealth && (
                                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 flex items-center">
                                        <Server className="w-5 h-5 mr-2" />
                                        System Health
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{systemHealth.uptime || '99.9%'}</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">Uptime</div>
                    </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{systemHealth.memory_usage || '45%'}</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">Memory Usage</div>
                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">{systemHealth.cpu_usage || '23%'}</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">CPU Usage</div>
                        </div>
                    </div>
                </div>
                            )}

                            {/* Admin Stats */}
                            {adminStats && (
                                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-2" />
                                        System Statistics
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{adminStats.total_users || '0'}</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">Total Users</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{adminStats.active_sessions || '0'}</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">Active Sessions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{adminStats.total_requests || '0'}</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">API Requests</div>
                    </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{adminStats.error_rate || '0%'}</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">Error Rate</div>
                        </div>
                    </div>
                                </div>
                            )}

                            {/* Admin Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <button
                                    onClick={() => exportData('users')}
                                    className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                                >
                                    <Users className="w-6 h-6 text-blue-500 mb-2" />
                                    <div className="font-medium text-slate-900 dark:text-white">Export Users</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Download user data as CSV</div>
                                </button>

                                <button
                                    onClick={() => exportData('applications')}
                                    className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                                >
                                    <FileText className="w-6 h-6 text-green-500 mb-2" />
                                    <div className="font-medium text-slate-900 dark:text-white">Export Applications</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Download application data</div>
                                </button>

                                <button
                                    onClick={clearCache}
                                    className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                                >
                                    <RefreshCw className="w-6 h-6 text-orange-500 mb-2" />
                                    <div className="font-medium text-slate-900 dark:text-white">Clear Cache</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Clear system cache</div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SettingsOverview; 