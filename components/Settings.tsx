import React, { useState } from 'react';
import { Profile, Theme } from '../types';
import { UserGroupIcon, SunIcon, MoonIcon } from './Icons';

interface SettingsProps {
  profiles: Profile[];
  activeProfile: Profile | null;
  updateActiveProfile: (updatedProfile: Profile) => void;
  setActiveProfileId: (id: string) => void;
  addProfile: (name: string) => void;
  deleteProfile: (id: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const Settings: React.FC<SettingsProps> = ({
  profiles,
  activeProfile,
  updateActiveProfile,
  setActiveProfileId,
  addProfile,
  deleteProfile,
  theme,
  setTheme
}) => {
  const [newProfileName, setNewProfileName] = useState('');

  if (!activeProfile) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading profile...
      </div>
    );
  }

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSalary = e.target.value ? parseInt(e.target.value, 10) : 0;
    updateActiveProfile({ ...activeProfile, monthlySalary: newSalary });
  };

  const handleOvertimeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = e.target.value ? parseFloat(e.target.value) : null;
    updateActiveProfile({ ...activeProfile, overtimeRate: newRate });
  };

  const handleWeeklyOffChange = (dayIndex: number) => {
    const currentOffDays = activeProfile.weeklyOffDays;
    let newOffDays;
    if (currentOffDays.includes(dayIndex)) {
      newOffDays = currentOffDays.filter(d => d !== dayIndex);
    } else {
      if (currentOffDays.length < 2) {
        newOffDays = [...currentOffDays, dayIndex];
      } else {
        // Optional: show a message that max 2 days can be selected
        return;
      }
    }
    updateActiveProfile({ ...activeProfile, weeklyOffDays: newOffDays });
  };
  
  const handleAddProfile = () => {
    if (newProfileName.trim()) {
      addProfile(newProfileName.trim());
      setNewProfileName('');
    }
  };
  
  const handleDeleteProfile = () => {
    if(window.confirm(`Are you sure you want to delete profile "${activeProfile.name}"? This action cannot be undone.`)) {
      deleteProfile(activeProfile.id);
    }
  }
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="p-4 space-y-8 text-gray-800 dark:text-gray-200">
      {/* Profile Management Section */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mb-4 flex items-center">
          <UserGroupIcon className="w-6 h-6 mr-2" />
          Profile Management
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="profile-select" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Active Profile
            </label>
            <select
              id="profile-select"
              value={activeProfile.id}
              onChange={(e) => setActiveProfileId(e.target.value)}
              className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="New Profile Name"
              className="flex-grow p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            />
            <button
              onClick={handleAddProfile}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md font-semibold"
            >
              Add
            </button>
          </div>
          {profiles.length > 1 && (
             <button
              onClick={handleDeleteProfile}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold text-white"
            >
              Delete Current Profile
            </button>
          )}
        </div>
      </div>

      {/* Appearance Section */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mb-4">Appearance</h3>
        <div className="flex justify-between items-center">
          <span className="font-medium">Theme</span>
          <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center">
             <SunIcon className={`w-6 h-6 transition-colors ${theme === 'light' ? 'text-yellow-500' : 'text-gray-500'}`}/>
             <MoonIcon className={`w-6 h-6 transition-colors ${theme === 'dark' ? 'text-blue-400' : 'text-gray-500'}`}/>
          </button>
        </div>
      </div>

      {/* Income Settings Section */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
         <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mb-4">Income Settings</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="monthly-salary" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Monthly Salary
            </label>
            <input
              id="monthly-salary"
              type="number"
              value={activeProfile.monthlySalary}
              onChange={handleSalaryChange}
              className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="e.g., 30000"
            />
          </div>
          <div>
            <label htmlFor="overtime-rate" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Custom Overtime Rate (per hour)
            </label>
            <input
              id="overtime-rate"
              type="number"
              value={activeProfile.overtimeRate ?? ''}
              onChange={handleOvertimeRateChange}
              className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Auto-calculated if blank"
            />
          </div>
        </div>
      </div>
      
      {/* Work Schedule Settings Section */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mb-2">Weekly Off Days</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select up to two weekly off days.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {WEEK_DAYS.map((day, index) => (
            <button
              key={index}
              onClick={() => handleWeeklyOffChange(index)}
              className={`p-4 rounded-lg text-center font-semibold transition-colors ${
                activeProfile.weeklyOffDays.includes(index)
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};