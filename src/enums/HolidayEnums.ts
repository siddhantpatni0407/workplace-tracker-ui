// src/enums/HolidayEnums.ts

export enum HolidayType {
  MANDATORY = 'MANDATORY',
  OPTIONAL = 'OPTIONAL'
}

export enum HolidayTypeFilter {
  MANDATORY = 'MANDATORY',
  OPTIONAL = 'OPTIONAL',
  ALL = 'ALL'
}

export enum HolidayQuickFilter {
  ALL = 'ALL',
  UPCOMING = 'UPCOMING',
  TODAY = 'TODAY',
  THIS_MONTH = 'THIS_MONTH'
}

export enum Month {
  ALL = 'ALL',
  JANUARY = '01',
  FEBRUARY = '02',
  MARCH = '03',
  APRIL = '04',
  MAY = '05',
  JUNE = '06',
  JULY = '07',
  AUGUST = '08',
  SEPTEMBER = '09',
  OCTOBER = '10',
  NOVEMBER = '11',
  DECEMBER = '12'
}

// Display labels
export const HolidayTypeLabels: Record<HolidayType, string> = {
  [HolidayType.MANDATORY]: 'Mandatory',
  [HolidayType.OPTIONAL]: 'Optional'
};

export const HolidayTypeFilterLabels: Record<HolidayTypeFilter, string> = {
  [HolidayTypeFilter.MANDATORY]: 'Mandatory',
  [HolidayTypeFilter.OPTIONAL]: 'Optional',
  [HolidayTypeFilter.ALL]: 'All Types'
};

export const HolidayQuickFilterLabels: Record<HolidayQuickFilter, string> = {
  [HolidayQuickFilter.ALL]: 'All Holidays',
  [HolidayQuickFilter.UPCOMING]: 'Upcoming',
  [HolidayQuickFilter.TODAY]: 'Today',
  [HolidayQuickFilter.THIS_MONTH]: 'This Month'
};

export const MonthLabels: Record<Month, string> = {
  [Month.ALL]: 'All Months',
  [Month.JANUARY]: 'January',
  [Month.FEBRUARY]: 'February',
  [Month.MARCH]: 'March',
  [Month.APRIL]: 'April',
  [Month.MAY]: 'May',
  [Month.JUNE]: 'June',
  [Month.JULY]: 'July',
  [Month.AUGUST]: 'August',
  [Month.SEPTEMBER]: 'September',
  [Month.OCTOBER]: 'October',
  [Month.NOVEMBER]: 'November',
  [Month.DECEMBER]: 'December'
};

export const MonthShortLabels: Record<Month, string> = {
  [Month.ALL]: 'All',
  [Month.JANUARY]: 'Jan',
  [Month.FEBRUARY]: 'Feb', 
  [Month.MARCH]: 'Mar',
  [Month.APRIL]: 'Apr',
  [Month.MAY]: 'May',
  [Month.JUNE]: 'Jun',
  [Month.JULY]: 'Jul',
  [Month.AUGUST]: 'Aug',
  [Month.SEPTEMBER]: 'Sep',
  [Month.OCTOBER]: 'Oct',
  [Month.NOVEMBER]: 'Nov',
  [Month.DECEMBER]: 'Dec'
};

// Holiday type colors
export const HolidayTypeColors: Record<HolidayType, string> = {
  [HolidayType.MANDATORY]: '#dc2626',  // Red
  [HolidayType.OPTIONAL]: '#059669'    // Green
};