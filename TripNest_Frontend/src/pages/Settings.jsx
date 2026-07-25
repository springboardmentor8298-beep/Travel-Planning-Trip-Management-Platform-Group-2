import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Moon, Sun, Globe, Bell, Check, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { settings, updateSettings } = useAppContext();
  const { t, i18n } = useTranslation();

  // Dark Mode Class Syncing
  useEffect(() => {
    if (settings.appearance === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.appearance]);

  const handleAppearanceToggle = (mode) => {
    updateSettings({ ...settings, appearance: mode });
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    updateSettings({ ...settings, language: lang });
  };

  const handleNotificationToggle = (field) => {
    const updatedNotifications = {
      ...settings.notifications,
      [field]: !settings.notifications[field]
    };
    updateSettings({ ...settings, notifications: updatedNotifications });
  };

  return (
    <div className="max-w-3xl space-y-6">
      
      {/* 1. Appearance Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3 dark:border-slate-805">
          <Sun className="w-5 h-5 text-slate-500" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white m-0">
            {t('settings.appearance', { defaultValue: 'Appearance & Theme' })}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Light Theme Trigger */}
          <button
            type="button"
            onClick={() => handleAppearanceToggle('light')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
              settings.appearance === 'light'
                ? 'border-slate-400 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
                : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-850/25 dark:text-slate-400 dark:hover:bg-slate-850/50'
            }`}
          >
            <Sun className="w-6 h-6" />
            <span className="text-xs font-bold">{t('settings.lightMode', { defaultValue: 'Light Mode' })}</span>
            {settings.appearance === 'light' && <Check className="w-4 h-4 mt-1 text-slate-600 dark:text-slate-300" />}
          </button>

          {/* Dark Theme Trigger */}
          <button
            type="button"
            onClick={() => handleAppearanceToggle('dark')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
              settings.appearance === 'dark'
                ? 'border-slate-400 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
                : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-850/25 dark:text-slate-400 dark:hover:bg-slate-850/50'
            }`}
          >
            <Moon className="w-6 h-6" />
            <span className="text-xs font-bold">{t('settings.darkMode', { defaultValue: 'Dark Mode' })}</span>
            {settings.appearance === 'dark' && <Check className="w-4 h-4 mt-1 text-slate-600 dark:text-slate-300" />}
          </button>
        </div>
      </div>

      {/* 2. Localization & Language */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3 dark:border-slate-805">
          <Globe className="w-5 h-5 text-slate-500" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white m-0">
            {t('settings.languageRegion', { defaultValue: 'Language & Region' })}
          </h3>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-450 uppercase tracking-wider dark:text-slate-500">
            {t('settings.systemLanguage', { defaultValue: 'System Language' })}
          </label>
          <select
            value={i18n.language || 'en'}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full sm:w-72 px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 font-semibold"
          >
            <option value="en">🇬🇧 English</option>
            <option value="hi">🇮🇳 हिन्दी</option>
            <option value="te">🇮🇳 తెలుగు</option>
            <option value="ta">🇮🇳 தமிழ்</option>
          </select>
          <p className="text-[10px] text-slate-400 mt-1 leading-normal">
            {t('settings.languageDescription', { defaultValue: 'This will translate structural titles and system notifications. Seed data content remains untouched.' })}
          </p>
        </div>
      </div>

      {/* 3. Notifications Configuration */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3 dark:border-slate-805">
          <Bell className="w-5 h-5 text-slate-500" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white m-0">
            {t('settings.notificationsTitle', { defaultValue: 'Notification Subscriptions' })}
          </h3>
        </div>

        <div className="space-y-4 divide-y divide-slate-50 dark:divide-slate-855">
          {/* Email Alerts Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                {t('settings.emailDigests', { defaultValue: 'Email Digests' })}
              </h4>
              <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
                {t('settings.emailDigestsDesc', { defaultValue: 'Receive weekly travel itineraries and cost reports via email.' })}
              </p>
            </div>
            <button
              onClick={() => handleNotificationToggle('emailAlerts')}
              className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                settings.notifications.emailAlerts ? 'bg-[#0e87da]' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <div 
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                  settings.notifications.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Trip Reminders Toggle */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                {t('settings.tripReminders', { defaultValue: 'Trip Reminders' })}
              </h4>
              <p className="text-xs text-slate-455 dark:text-slate-500 mt-0.5">
                {t('settings.tripRemindersDesc', { defaultValue: 'Get toast alerts for flight boarding times and scheduled hotel check-ins.' })}
              </p>
            </div>
            <button
              onClick={() => handleNotificationToggle('tripReminders')}
              className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                settings.notifications.tripReminders ? 'bg-[#0e87da]' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <div 
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                  settings.notifications.tripReminders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Budget Alerts Toggle */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                {t('settings.budgetAlerts', { defaultValue: 'Budget Alerts' })}
              </h4>
              <p className="text-xs text-slate-455 dark:text-slate-500 mt-0.5">
                {t('settings.budgetAlertsDesc', { defaultValue: 'Alert me when logged expenses cross 90% of allocated budget parameters.' })}
              </p>
            </div>
            <button
              onClick={() => handleNotificationToggle('budgetAlerts')}
              className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                settings.notifications.budgetAlerts ? 'bg-[#0e87da]' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <div 
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                  settings.notifications.budgetAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Settings;
