import React, { useMemo, useState, useEffect } from 'react';
import { Profile, AttendanceStatus, MonthlyData } from '../types';
import { 
    BriefcaseIcon, CheckCircleIcon, XCircleIcon, GiftIcon, ClockIcon, CurrencyRupeeIcon, ReceiptPercentIcon, ExclamationTriangleIcon, TrashIcon
} from './Icons';

interface SummaryProps {
  year: number;
  month: number;
  activeProfile: Profile | null;
  currentMonthData: MonthlyData;
  updateCurrentMonthData: (data: MonthlyData) => void;
  deleteCurrentMonthData: () => void;
  monthKey: string;
}

const SummaryItem: React.FC<{ icon: React.ReactNode, label: string, value: string | number, colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center shadow-md">
        <div className={`mr-4 p-3 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">{label}</span>
            <p className="font-bold text-xl text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const FinanceItem: React.FC<{ label: string, value: string, isTotal?: boolean }> = ({ label, value, isTotal = false }) => (
    <div className={`flex justify-between items-center py-2 ${isTotal ? 'border-t border-gray-200 dark:border-gray-700 mt-2 pt-2' : ''}`}>
        <span className={`text-gray-600 dark:text-gray-400 ${isTotal ? 'font-bold' : ''}`}>{label}</span>
        <span className={`font-bold ${isTotal ? 'text-xl text-green-500' : 'text-lg text-gray-800 dark:text-white'}`}>{value}</span>
    </div>
);


export const Summary: React.FC<SummaryProps> = ({ year, month, activeProfile, currentMonthData, updateCurrentMonthData, deleteCurrentMonthData, monthKey }) => {
  const [paidInput, setPaidInput] = useState<string>('');
  
  useEffect(() => {
    if (currentMonthData) {
        setPaidInput(currentMonthData.paidAmount > 0 ? currentMonthData.paidAmount.toString() : '');
    }
  }, [currentMonthData]);

  const calculations = useMemo(() => {
    if (!activeProfile) return null;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let workingDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
        const dayOfWeek = new Date(year, month, day).getDay();
        if (!activeProfile.weeklyOffDays.includes(dayOfWeek)) {
            workingDays++;
        }
    }
    
    let present = 0;
    let absent = 0;
    let holidays = 0;
    let holidaysWorked = 0;
    let totalOvertimeHours = 0;
    
    const attendance = currentMonthData.attendance;

    Object.values(attendance).forEach(record => {
        if (!record) return;
        switch(record.status) {
            case AttendanceStatus.Present: present++; break;
            case AttendanceStatus.Absent: absent++; break;
            case AttendanceStatus.Holiday: holidays++; break;
            case AttendanceStatus.HolidayWorked: holidaysWorked++; break;
        }
        totalOvertimeHours += record.overtime || 0;
    });

    const dailyRate = activeProfile.monthlySalary && workingDays > 0 ? activeProfile.monthlySalary / workingDays : 0;
    const baseIncome = present * dailyRate;
    const holidayIncome = (holidays * dailyRate) + (holidaysWorked * dailyRate * 2);
    
    const overtimeRate = activeProfile.overtimeRate ?? (dailyRate / 8);
    const overtimeIncome = totalOvertimeHours * overtimeRate;

    const totalIncome = baseIncome + holidayIncome + overtimeIncome;

    return {
        workingDays,
        present,
        absent,
        holidays: holidays + holidaysWorked,
        totalOvertimeHours: totalOvertimeHours.toFixed(2),
        dailyRate,
        baseIncome,
        holidayIncome,
        overtimeIncome,
        totalIncome,
    };
  }, [activeProfile, year, month, currentMonthData]);

  const handlePaymentUpdate = () => {
    const newPaidAmount = paidInput ? parseFloat(paidInput) : 0;
    updateCurrentMonthData({
        ...currentMonthData,
        paidAmount: newPaidAmount,
    });
  };

  const handleDeleteMonthData = () => {
    const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
    if(window.confirm(`Are you sure you want to delete all attendance and payment data for ${monthName}? This action cannot be undone.`)) {
        deleteCurrentMonthData();
    }
  }

  if (!calculations || !activeProfile) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Select a profile to see the summary.
      </div>
    );
  }
  
  const paidAmount = currentMonthData.paidAmount || 0;
  const pendingAmount = calculations.totalIncome - paidAmount;
  const hasDataForMonth = Object.keys(currentMonthData.attendance).length > 0 || currentMonthData.paidAmount > 0;


  return (
    <div className="p-4 space-y-6">
        {/* Attendance Summary */}
        <div className="grid grid-cols-2 gap-4">
            <SummaryItem icon={<BriefcaseIcon className="w-6 h-6 text-white"/>} label="Working Days" value={calculations.workingDays} colorClass="bg-blue-500" />
            <SummaryItem icon={<CheckCircleIcon className="w-6 h-6 text-white"/>} label="Present" value={calculations.present} colorClass="bg-green-500" />
            <SummaryItem icon={<XCircleIcon className="w-6 h-6 text-white"/>} label="Absent" value={calculations.absent} colorClass="bg-red-500" />
            <SummaryItem icon={<GiftIcon className="w-6 h-6 text-white"/>} label="Holidays" value={calculations.holidays} colorClass="bg-indigo-500" />
            <SummaryItem icon={<ClockIcon className="w-6 h-6 text-white"/>} label="OT Hours" value={calculations.totalOvertimeHours} colorClass="bg-yellow-500" />
        </div>
        
        {/* Income Breakdown */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-2">
            <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mb-2 flex items-center">
                <CurrencyRupeeIcon className="w-6 h-6 mr-2" />
                Income Details
            </h3>
            <FinanceItem label="Daily Rate" value={`₹${calculations.dailyRate.toFixed(2)}`} />
            <FinanceItem label="Base Income" value={`₹${calculations.baseIncome.toFixed(2)}`} />
            <FinanceItem label="Holiday Pay" value={`₹${calculations.holidayIncome.toFixed(2)}`} />
            <FinanceItem label="Overtime Income" value={`₹${calculations.overtimeIncome.toFixed(2)}`} />
            <FinanceItem label="Total Income" value={`₹${calculations.totalIncome.toFixed(2)}`} isTotal />
        </div>

        {/* Payment Status Section */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-4">
            <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400">Payment Status</h3>
            <div className="space-y-4">
                <div className="flex items-center p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                    <ReceiptPercentIcon className="w-7 h-7 mr-3 text-green-500"/>
                    <div>
                        <p className="text-sm text-green-700 dark:text-green-300">Paid Amount</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{paidAmount.toFixed(2)}</p>
                    </div>
                </div>
                 <div className="flex items-center p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/50">
                    <ExclamationTriangleIcon className="w-7 h-7 mr-3 text-yellow-500"/>
                    <div>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">Pending Amount</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">₹{pendingAmount.toFixed(2)}</p>
                    </div>
                </div>
            </div>
             <div className="flex items-center gap-2 pt-2">
                <input 
                    type="number" 
                    placeholder="Enter amount paid"
                    value={paidInput}
                    onChange={(e) => setPaidInput(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handlePaymentUpdate} className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md font-semibold">Save</button>
            </div>
        </div>

        {/* Monthly Actions */}
        {hasDataForMonth && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mb-4">Monthly Actions</h3>
                <button 
                    onClick={handleDeleteMonthData}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    <TrashIcon className="w-6 h-6" />
                    Delete This Month's Data
                </button>
            </div>
        )}
    </div>
  );
};