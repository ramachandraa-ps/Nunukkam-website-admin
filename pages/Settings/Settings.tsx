import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

const Settings: React.FC = () => {
  const { addToast } = useStore();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security'>('general');

  const [settings, setSettings] = useState({
    siteName: 'Nunukkam Admin',
    siteEmail: 'admin@nunukkam.com',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    sessionTimeout: '30',
    twoFactorAuth: false,
  });

  const handleSave = () => {
    addToast('success', 'Settings saved successfully');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'security', label: 'Security', icon: 'security' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage application settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">General Settings</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                      Site Email
                    </label>
                    <input
                      type="email"
                      value={settings.siteEmail}
                      onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                      Date Format
                    </label>
                    <select
                      value={settings.dateFormat}
                      onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notification Settings</h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive email updates about system activities</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${settings.emailNotifications ? 'bg-primary-700' : 'bg-gray-300'}`}>
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                      <p className="text-sm text-gray-500">Receive browser push notifications</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${settings.pushNotifications ? 'bg-primary-700' : 'bg-gray-300'}`}>
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Weekly Reports</p>
                      <p className="text-sm text-gray-500">Receive weekly summary reports via email</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${settings.weeklyReports ? 'bg-primary-700' : 'bg-gray-300'}`}>
                      <input
                        type="checkbox"
                        checked={settings.weeklyReports}
                        onChange={(e) => setSettings({ ...settings, weeklyReports: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.weeklyReports ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                    </div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Security Settings</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <select
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                      className="w-full max-w-xs px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>

                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${settings.twoFactorAuth ? 'bg-primary-700' : 'bg-gray-300'}`}>
                      <input
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                    </div>
                  </label>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex gap-3">
                      <span className="material-symbols-outlined text-yellow-600">warning</span>
                      <div>
                        <p className="font-medium text-yellow-800">Password Policy</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Passwords must be at least 8 characters with uppercase, lowercase, number, and special character.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleSave}
                className="px-8 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
