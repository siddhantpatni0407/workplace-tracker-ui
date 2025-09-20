// src/models/Dashboard.ts
import { UserRole } from '../enums/UserEnums';
import { 
  DashboardCardCategory, 
  ActivityType, 
  StatColorClass, 
  BgGradientClass 
} from '../enums/DashboardEnums';

/**
 * Dashboard card configuration interface
 * Represents individual cards/tiles shown on the dashboard
 */
export interface DashboardCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  colorClass: string;
  route: string;
  roles?: UserRole[];
  category?: DashboardCardCategory;
}

/**
 * Dashboard data interface
 * Contains all the real-time data fetched from APIs for dashboard display
 */
export interface DashboardData {
  holidays: any[];
  visits: any[];
  leaves: any[];
  leaveBalance: any[];
  policies: any[];
  dailyView: any[];
  loading: boolean;
  error?: string;
  lastUpdated: string;
}

/**
 * Dashboard filter interface
 * Contains filter states for dashboard data filtering
 */
export interface DashboardFilters {
  month: number;
  year: number;
  status: string;
}

/**
 * Quick stats item interface
 * Represents individual statistics cards in the quick stats section
 */
export interface QuickStatItem {
  label: string;
  value: string;
  unit?: string;
  icon: string;
  colorClass: StatColorClass;
  bgGradient?: BgGradientClass;
  valueColor?: string;
}

/**
 * Analytics data item interface
 * Represents analytics cards in the dashboard
 */
export interface AnalyticsDataItem {
  title: string;
  description: string;
  value: string;
  icon: string;
}

/**
 * Recent activity item interface
 * Represents items in the recent activity timeline
 */
export interface RecentActivityItem {
  id: string | number;
  type: ActivityType;
  title: string;
  time: string;
  icon: string;
}

/**
 * Upcoming holiday item interface
 * Represents holiday items in the upcoming holidays section
 */
export interface UpcomingHolidayItem {
  day: string;
  month: string;
  title: string;
  type: string;
  date: string;
}