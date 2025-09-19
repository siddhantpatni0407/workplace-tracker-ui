// src/models/Calendar.ts

import { ActivityType } from '../enums/DashboardEnums';
import { VisitType } from '../enums/OfficeVisitEnums';

/**
 * Calendar Event interface with flexible typing for backward compatibility
 * Supports both ActivityType enum values and legacy string types
 */
export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string (yyyy-MM-dd)
  type: ActivityType | 'visit' | 'holiday' | 'leave' | 'task'; // Support both enums and legacy strings
  visitType?: VisitType;
  status?: string;
  description?: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Calendar event type mappings for backward compatibility
 * Maps between ActivityType enum and legacy string values
 */
export type CalendarEventType = ActivityType | 'visit' | 'holiday' | 'leave' | 'task';

/**
 * Event filter type using proper enums and legacy support
 * Used for filtering calendar events by type
 */
export type EventFilterType = 'all' | ActivityType | 'visit' | 'wfh' | 'wfo' | 'holiday' | 'leave' | 'task';

/**
 * Calendar view options
 */
export type CalendarViewType = 'month' | 'week' | 'day';

/**
 * Calendar props interface for component configuration
 */
export interface CalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
  showMonthYearFilters?: boolean;
  defaultView?: CalendarViewType;
  enableFiltering?: boolean;
  enableExport?: boolean;
  showLegend?: boolean;
}

/**
 * Calendar day data structure
 * Contains information about a specific day in the calendar
 */
export interface CalendarDayData {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: CalendarEvent[];
  isSelected?: boolean;
  isDisabled?: boolean;
}

/**
 * Calendar export data structure
 */
export interface CalendarExportData {
  title: string;
  date: string;
  type: string;
  description: string;
  status: string;
  visitType?: string;
}

/**
 * Calendar filter configuration
 */
export interface CalendarFilterConfig {
  eventType: EventFilterType;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  userIds?: number[];
  statuses?: string[];
}

/**
 * Calendar navigation configuration
 */
export interface CalendarNavigationConfig {
  enableNavigation: boolean;
  enableTodayButton: boolean;
  enableViewSwitcher: boolean;
  minDate?: Date;
  maxDate?: Date;
}

/**
 * Calendar color configuration
 * Maps event types to their display colors
 */
export interface CalendarColorConfig {
  holiday: string;
  leave: string;
  wfo: string;
  wfh: string;
  task: string;
  default: string;
}

/**
 * Calendar icon configuration
 * Maps event types to their display icons
 */
export interface CalendarIconConfig {
  holiday: string;
  leave: string;
  wfo: string;
  wfh: string;
  task: string;
  default: string;
}