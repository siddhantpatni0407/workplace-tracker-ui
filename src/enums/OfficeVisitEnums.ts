// src/enums/OfficeVisitEnums.ts

export enum VisitType {
  WFO = 'WFO',
  WFH = 'WFH', 
  HYBRID = 'HYBRID',
  OTHERS = 'OTHERS'
}

export enum VisitTypeFilter {
  WFO = 'WFO',
  WFH = 'WFH',
  HYBRID = 'HYBRID', 
  OTHERS = 'OTHERS',
  ALL = 'ALL'
}

export enum DayLabel {
  NONE = 'NONE',
  HOLIDAY = 'HOLIDAY',
  LEAVE = 'LEAVE',
  WEEKEND = 'WEEKEND'
}

export enum DayLabelFilter {
  NONE = 'NONE',
  HOLIDAY = 'HOLIDAY',
  LEAVE = 'LEAVE',
  WEEKEND = 'WEEKEND',
  ALL = 'ALL'
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

// Display labels
export const VisitTypeLabels: Record<VisitType, string> = {
  [VisitType.WFO]: 'Work From Office',
  [VisitType.WFH]: 'Work From Home',
  [VisitType.HYBRID]: 'Hybrid', 
  [VisitType.OTHERS]: 'Others'
};

export const VisitTypeFilterLabels: Record<VisitTypeFilter, string> = {
  [VisitTypeFilter.WFO]: 'Work From Office',
  [VisitTypeFilter.WFH]: 'Work From Home',
  [VisitTypeFilter.HYBRID]: 'Hybrid',
  [VisitTypeFilter.OTHERS]: 'Others',
  [VisitTypeFilter.ALL]: 'All Types'
};

export const DayLabelLabels: Record<DayLabel, string> = {
  [DayLabel.NONE]: 'Regular Day',
  [DayLabel.HOLIDAY]: 'Holiday',
  [DayLabel.LEAVE]: 'Leave',
  [DayLabel.WEEKEND]: 'Weekend'
};

export const DayLabelFilterLabels: Record<DayLabelFilter, string> = {
  [DayLabelFilter.NONE]: 'Regular Day',
  [DayLabelFilter.HOLIDAY]: 'Holiday',
  [DayLabelFilter.LEAVE]: 'Leave', 
  [DayLabelFilter.WEEKEND]: 'Weekend',
  [DayLabelFilter.ALL]: 'All Days'
};

export const DayOfWeekLabels: Record<DayOfWeek, string> = {
  [DayOfWeek.SUNDAY]: 'Sunday',
  [DayOfWeek.MONDAY]: 'Monday',
  [DayOfWeek.TUESDAY]: 'Tuesday',
  [DayOfWeek.WEDNESDAY]: 'Wednesday',
  [DayOfWeek.THURSDAY]: 'Thursday',
  [DayOfWeek.FRIDAY]: 'Friday',
  [DayOfWeek.SATURDAY]: 'Saturday'
};

export const DayOfWeekShortLabels: Record<DayOfWeek, string> = {
  [DayOfWeek.SUNDAY]: 'Sun',
  [DayOfWeek.MONDAY]: 'Mon',
  [DayOfWeek.TUESDAY]: 'Tue',
  [DayOfWeek.WEDNESDAY]: 'Wed',
  [DayOfWeek.THURSDAY]: 'Thu',
  [DayOfWeek.FRIDAY]: 'Fri',
  [DayOfWeek.SATURDAY]: 'Sat'
};

// Chart colors for visit types
export const VisitTypeColors: Record<VisitType, string> = {
  [VisitType.WFO]: '#4f46e5',     // Indigo
  [VisitType.WFH]: '#06b6d4',     // Cyan
  [VisitType.HYBRID]: '#f59e0b',  // Amber
  [VisitType.OTHERS]: '#ef4444'   // Red
};