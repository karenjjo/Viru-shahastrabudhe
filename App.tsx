import React, { useState, useMemo, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { Summary } from './components/Summary';
import { Settings } from './components/Settings';
import { DataManagement } from './components/DataManagement';
import { CalendarIcon, ChartBarIcon, CogIcon } from './components/Icons';
import useLocalStorage from './hooks/useLocalStorage';
import { AppData, Profile, MonthlyData, Theme } from './types';

type Tab = 'calendar' | 'summary' | 'settings';

const createDefaultProfile = (): Profile => ({
  id: Date.now().toString(),
  name: 'Default Profile',
  monthlySalary: 0,
  overtimeRate: null,
  weeklyOffDays: [0], // Sunday
  monthlyData: {},
});

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<Tab>('calendar');
  const [appData, setAppData] = useLocalStorage<AppData>('worker-attendance-data-v3', {
    profiles: [],
    activeProfileId: null,
    theme: 'dark',
  });

  useEffect(() => {
    // Apply theme to the root element
    const root = document.documentElement;
    if (appData.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [appData.theme]);

  useEffect(() => {
    if (appData.profiles.length === 0) {
      const defaultProfile = createDefaultProfile();
      setAppData(prev => ({
        ...prev,
        profiles: [defaultProfile],
        activeProfileId: defaultProfile.id,
      }));
    } else if (!appData.activeProfileId || !appData.profiles.find(p => p.id === appData.activeProfileId)) {
      setAppData((prev: AppData) => ({
        ...prev,
        activeProfileId: prev.profiles[0].id,
      }));
    }
  }, [appData.profiles, appData.activeProfileId, setAppData]);
  
  const activeProfile = useMemo(() => {
    return appData.profiles.find(p => p.id === appData.activeProfileId) || null;
  }, [appData]);

  const monthKey = useMemo(() => {
      return `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
  }, [currentDate]);

  const currentMonthData = useMemo((): MonthlyData => {
    if (!activeProfile) return { attendance: {}, paidAmount: 0 };
    return activeProfile.monthlyData[monthKey] || { attendance: {}, paidAmount: 0 };
  }, [activeProfile, monthKey]);

  const handleUpdateCurrentMonthData = (updatedMonthData: MonthlyData) => {
    if (!activeProfile) return;
    setAppData((prev: AppData) => ({
      ...prev,
      profiles: prev.profiles.map(p => {
        if (p.id === activeProfile.id) {
          const newMonthlyData = { ...p.monthlyData, [monthKey]: updatedMonthData };
          return { ...p, monthlyData: newMonthlyData };
        }
        return p;
      })
    }));
  };

  const handleDeleteCurrentMonthData = () => {
    if (!activeProfile) return;
    setAppData((prev: AppData) => ({
        ...prev,
        profiles: prev.profiles.map(p => {
            if (p.id === activeProfile.id) {
                const newMonthlyData = { ...p.monthlyData };
                delete newMonthlyData[monthKey];
                return { ...p, monthlyData: newMonthlyData };
            }
            return p;
        })
    }));
  };

  const handleUpdateActiveProfile = (updatedProfile: Profile) => {
    setAppData((prev: AppData) => ({
      ...prev,
      profiles: prev.profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p)
    }));
  };
  
  const handleSetTheme = (theme: Theme) => {
    setAppData(prev => ({ ...prev, theme }));
  };

  const handleSetActiveProfileId = (id: string) => {
    setAppData((prev: AppData) => ({...prev, activeProfileId: id}));
  };

  const handleAddProfile = (name: string) => {
    const newProfile: Profile = {
        id: Date.now().toString(),
        name,
        monthlySalary: 0,
        overtimeRate: null,
        weeklyOffDays: [0],
        monthlyData: {},
    };
    setAppData((prev: AppData) => ({
        ...prev,
        profiles: [...prev.profiles, newProfile],
        activeProfileId: newProfile.id
    }));
  };

  const handleDeleteProfile = (id: string) => {
    setAppData((prev: AppData) => {
        const remainingProfiles = prev.profiles.filter(p => p.id !== id);
        if (remainingProfiles.length === 0) {
            const newDefault = createDefaultProfile();
            return {
                ...prev,
                profiles: [newDefault],
                activeProfileId: newDefault.id,
            };
        }
        
        const newActiveId = id === prev.activeProfileId ? remainingProfiles[0].id : prev.activeProfileId;
        
        return {
            ...prev,
            profiles: remainingProfiles,
            activeProfileId: newActiveId,
        };
    });
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1); // Set to the first to avoid month-end issues
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const renderContent = () => {
    if (!activeProfile) {
        return <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading profile...</div>;
    }
    switch (activeTab) {
      case 'calendar':
        return <Calendar 
            year={currentDate.getFullYear()} 
            month={currentDate.getMonth()} 
            weeklyOffDays={activeProfile.weeklyOffDays}
            currentMonthData={currentMonthData}
            updateCurrentMonthData={handleUpdateCurrentMonthData}
        />;
      case 'summary':
        return <Summary 
            year={currentDate.getFullYear()} 
            month={currentDate.getMonth()} 
            activeProfile={activeProfile}
            currentMonthData={currentMonthData}
            updateCurrentMonthData={handleUpdateCurrentMonthData}
            deleteCurrentMonthData={handleDeleteCurrentMonthData}
            monthKey={monthKey}
        />;
      case 'settings':
        return (
          <>
            <Settings 
              profiles={appData.profiles}
              activeProfile={activeProfile}
              updateActiveProfile={handleUpdateActiveProfile}
              setActiveProfileId={handleSetActiveProfileId}
              addProfile={handleAddProfile}
              deleteProfile={handleDeleteProfile}
              theme={appData.theme}
              setTheme={handleSetTheme}
            />
            <DataManagement activeProfile={activeProfile} updateActiveProfile={handleUpdateActiveProfile} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white flex flex-col max-w-lg mx-auto font-sans">
      <header className="bg-white dark:bg-gray-800 p-4 shadow-md z-10">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => changeMonth(-1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">&lt;</button>
          <h2 className="text-xl font-bold text-center">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => changeMonth(1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">&gt;</button>
        </div>
        <div className="text-center text-cyan-600 dark:text-cyan-400 font-semibold truncate">
            {activeProfile ? activeProfile.name : "No Profile Selected"}
        </div>
      </header>
      
      <main className="flex-grow overflow-y-auto pb-20">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3">
        <TabButton icon={<CalendarIcon className="w-6 h-6 mx-auto"/>} label="Calendar" isActive={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        <TabButton icon={<ChartBarIcon className="w-6 h-6 mx-auto"/>} label="Summary" isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
        <TabButton icon={<CogIcon className="w-6 h-6 mx-auto"/>} label="Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>
    </div>
  );
};

interface TabButtonProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-3 transition-colors ${isActive ? 'text-cyan-500 dark:text-cyan-400 bg-gray-100 dark:bg-gray-700' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
        {icon}
        <span className="text-xs mt-1">{label}</span>
    </button>
);


export default App;