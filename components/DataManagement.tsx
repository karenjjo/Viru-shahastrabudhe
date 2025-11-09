import React, { useRef } from 'react';
import { Profile } from '../types';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from './Icons';

interface DataManagementProps {
  activeProfile: Profile | null;
  updateActiveProfile: (profile: Profile) => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ activeProfile, updateActiveProfile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!activeProfile) {
      alert("No active profile to export.");
      return;
    }
    const dataStr = JSON.stringify(activeProfile, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `attendance_data_${activeProfile.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File content is not a string");
        
        const importedProfile = JSON.parse(text);
        
        // Basic validation for imported profile
        if (importedProfile && importedProfile.id && importedProfile.name && importedProfile.monthlyData) {
          if(window.confirm(`This will overwrite all data for the current profile "${activeProfile?.name}". Are you sure you want to continue?`)){
            // Keep the current profile's ID and name but update the rest
             updateActiveProfile({
                ...activeProfile!,
                monthlySalary: importedProfile.monthlySalary,
                overtimeRate: importedProfile.overtimeRate,
                weeklyOffDays: importedProfile.weeklyOffDays,
                monthlyData: importedProfile.monthlyData,
             });
             alert("Profile data imported successfully.");
          }
        } else {
          throw new Error("Invalid profile file format. The file must contain 'id', 'name', and 'monthlyData' properties.");
        }

      } catch (error) {
        console.error("Failed to import data:", error);
        alert(`Failed to import data. Please make sure it's a valid JSON file exported from this app. Error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        // Reset file input to allow importing the same file again
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 space-y-4">
       <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mb-4">Export/Import Profile Data</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Backup or restore data for the currently active profile ({activeProfile?.name}). This is useful for transferring data between devices.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            <ArrowDownTrayIcon className="w-6 h-6" />
            Export Data
          </button>
          <button
            onClick={handleImportClick}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            <ArrowUpTrayIcon className="w-6 h-6" />
            Import Data
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="application/json"
          />
        </div>
       </div>
    </div>
  );
};