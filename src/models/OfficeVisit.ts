// src/models/OfficeVisit.ts

export interface OfficeVisit {
  officeVisitId?: number;
  userId: number;
  visitDate: string; // yyyy-MM-dd
  dayOfWeek: number; // 1-7
  visitType: VisitType;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfficeVisitFormData {
  visitDate: string;
  visitType: VisitType;
  notes?: string;
}

export interface DailyView {
  date: string; // yyyy-MM-dd
  dayOfWeek: number;
  label: DayLabel;
  visitType?: VisitType;
  notes?: string;
  isEditable: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export interface OfficeVisitDTO {
  officeVisitId?: number;
  userId?: number;
  visitDate?: string; // yyyy-MM-dd
  dayOfWeek?: number;
  visitType?: VisitType;
  notes?: string | null;
}

export interface DailyViewDTO {
  date: string;
  dayOfWeek: number;
  label: string; // Uses values from DayLabel enum
  holidayName?: string | null;
  holidayType?: string | null;
  leavePolicyCode?: string | null;
  leaveDays?: number | null;
  leaveDayPart?: string | null;
  leaveNotes?: string | null;
  visitType?: string | null;
  visitNotes?: string | null;
}

export interface VisitSummary {
  totalDays: number;
  wfo: number;
  wfh: number;
  hybrid: number;
  others: number;
  leave: number;
  holiday: number;
  workingDays: number;
  month: string;
  year: number;
}

export interface MonthlyVisitData {
  visits: OfficeVisit[];
  dailyView: DailyView[];
  summary: VisitSummary;
}

// Visit Types
export type VisitType = 'WFO' | 'WFH' | 'HYBRID' | 'OTHERS';

// Day Labels for calendar view
export type DayLabel = 'NONE' | 'HOLIDAY' | 'LEAVE' | 'WEEKEND';

// Filter options
export type VisitTypeFilter = VisitType | 'ALL';
export type DayLabelFilter = DayLabel | 'ALL';

export interface VisitFilters {
  visitType: VisitTypeFilter;
  dayLabel: DayLabelFilter;
  searchQuery: string;
  showAllDays: boolean;
}

// Chart data for analytics
export interface VisitChartData {
  name: string;
  value: number;
  color?: string;
}

export interface WeeklyVisitData {
  week: string;
  wfo: number;
  wfh: number;
  hybrid: number;
  others: number;
}