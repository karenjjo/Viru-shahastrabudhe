import React, { useState, useMemo } from 'react';
import { AttendanceStatus, MonthlyData } from '../types';
import { XCircleIcon } from './Icons';

interface CalendarProps {
  year: number;
  month: number;
  weeklyOffDays: number[];
  currentMonthData: MonthlyData;
  updateCurrentMonthData: (data: MonthlyData) => void;
}

const statusOptions = [
  { value: AttendanceStatus.Present, label: 'P', color: 'bg-green-600 hover:bg-green-700' },
  { value: AttendanceStatus.Absent, label: 'A', color: 'bg-red-600 hover:bg-red-700' },
  { value: AttendanceStatus.Holiday, label: 'H', color: 'bg-blue-600 hover:bg-blue-700' },
  { value: AttendanceStatus.HolidayWorked, label: 'HP', color: 'bg-purple-600 hover:bg-purple-700' },
];

export const Calendar: React.FC<CalendarProps> = ({ year, month, weeklyOffDays, currentMonthData, updateCurrentMonthData }) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [overtimeInput, setOvertimeInput] = useState<string>('');

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const attendance = currentMonthData.attendance;

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ key: `empty-${i}`, empty: true });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      const isWeeklyOff = weeklyOffDays.includes(dayOfWeek);
      const record = attendance[dateString];
      const status = record ? record.status : (isWeeklyOff ? AttendanceStatus.WeeklyOff : undefined);
      const overtime = record ? record.overtime : 0;
      days.push({ key: dateString, day, status, overtime, isWeeklyOff });
    }
    return days;
  }, [year, month, daysInMonth, firstDayOfMonth, attendance, weeklyOffDays]);

  const handleDayClick = (day: number) => {
    if (selectedDay === day) {
        setSelectedDay(null);
        setOvertimeInput('');
    } else {
        setSelectedDay(day);
        const dateString = new Date(year, month, day).toISOString().split('T')[0];
        const overtime = attendance[dateString]?.overtime || 0;
        setOvertimeInput(overtime > 0 ? overtime.toString() : '');
    }
  };

  const handleStatusChange = (status: AttendanceStatus) => {
    if (selectedDay === null) return;
    const dateString = new Date(year, month, selectedDay).toISOString().split('T')[0];
    const newAttendance = { ...attendance };
    newAttendance[dateString] = {
        status,
        overtime: newAttendance[dateString]?.overtime || 0
    };
    updateCurrentMonthData({ ...currentMonthData, attendance: newAttendance });
    setSelectedDay(null);
    setOvertimeInput('');
  };
  
  const handleOvertimeChange = () => {
    if (selectedDay === null) return;
    const dateString = new Date(year, month, selectedDay).toISOString().split('T')[0];
    const newAttendance = { ...attendance };
    const overtimeValue = overtimeInput ? parseFloat(overtimeInput) : 0;
    
    if (newAttendance[dateString]) {
        newAttendance[dateString].overtime = overtimeValue;
    } else {
        const dayOfWeek = new Date(year, month, selectedDay).getDay();
        const isWeeklyOff = weeklyOffDays.includes(dayOfWeek);
        newAttendance[dateString] = {
            status: isWeeklyOff ? AttendanceStatus.WeeklyOff : AttendanceStatus.Present,
            overtime: overtimeValue
        };
    }
    updateCurrentMonthData({ ...currentMonthData, attendance: newAttendance });
    setSelectedDay(null);
    setOvertimeInput('');
  };

  const getStatusColor = (status?: AttendanceStatus) => {
    switch(status) {
        case AttendanceStatus.Present: return 'bg-green-500 text-white';
        case AttendanceStatus.Absent: return 'bg-red-500 text-white';
        case AttendanceStatus.Holiday: return 'bg-blue-500 text-white';
        case AttendanceStatus.HolidayWorked: return 'bg-purple-500 text-white';
        case AttendanceStatus.WeeklyOff: return 'bg-yellow-400 text-black';
        default: return 'bg-gray-200 dark:bg-gray-600';
    }
  };

  return (
    <div className="p-2 md:p-4">
      <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs md:text-sm font-bold text-gray-400 mb-2">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {calendarDays.map(d => {
          if (d.empty) return <div key={d.key}></div>;
          
          return (
            <div 
                key={d.key}
                onClick={() => !d.isWeeklyOff && handleDayClick(d.day)} 
                className={`aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all duration-200
                    ${getStatusColor(d.status)} 
                    ${selectedDay === d.day ? 'ring-4 ring-cyan-400 dark:ring-cyan-500' : 'hover:bg-opacity-80'}
                    ${d.isWeeklyOff ? 'cursor-not-allowed opacity-70' : ''}`}
            >
                <span className="font-bold text-lg">{d.day}</span>
                {d.overtime > 0 && <span className="text-xs text-black bg-yellow-300 px-1 rounded-full mt-1">{d.overtime}h</span>}
            </div>
          )
        })}
      </div>

      {/* Action Panel */}
      {selectedDay !== null && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 animate-fade-in-up">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
              Edit Day: {new Date(year, month, selectedDay).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
            </h3>
            <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <XCircleIcon className="w-7 h-7" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Mark Attendance:</p>
                <div className="grid grid-cols-4 gap-2">
                    {statusOptions.map(opt => (
                        <button key={opt.value} onClick={() => handleStatusChange(opt.value)}
                            className={`${opt.color} text-white font-bold rounded-md py-3 flex items-center justify-center text-lg transition-transform active:scale-95`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Add Overtime (hours):</p>
              <div className="flex items-center gap-2">
                  <input 
                      type="number" 
                      placeholder="e.g., 2.5"
                      value={overtimeInput}
                      onChange={(e) => setOvertimeInput(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <button onClick={handleOvertimeChange} className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md font-semibold transition-transform active:scale-95">Set</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};