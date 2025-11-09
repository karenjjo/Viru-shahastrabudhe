export enum AttendanceStatus {
  Present = 'P',
  Absent = 'A',
  Holiday = 'H',
  HolidayWorked = 'HP',
  WeeklyOff = 'W',
}

export interface AttendanceRecord {
  status: AttendanceStatus;
  overtime: number;
}

export type AttendanceData = {
  [day: string]: AttendanceRecord;
};

export interface MonthlyData {
  attendance: AttendanceData;
  paidAmount: number;
}

export interface Profile {
  id: string;
  name: string;
  monthlySalary: number;
  overtimeRate: number | null;
  weeklyOffDays: number[]; // 0 for Sunday, 1 for Monday, etc.
  monthlyData: {
    [key: string]: MonthlyData; // Key format: "YYYY-MM"
  };
}

export type Theme = 'light' | 'dark';

export interface AppData {
  profiles: Profile[];
  activeProfileId: string | null;
  theme: Theme;
}