// Daily Task specific enums for the workplace tracker application

export enum DailyTaskStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING_REVIEW = 'PENDING_REVIEW'
}

export enum DailyTaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum DailyTaskType {
  DEVELOPMENT = 'DEVELOPMENT',
  TESTING = 'TESTING',
  BUG_FIX = 'BUG_FIX',
  DOCUMENTATION = 'DOCUMENTATION',
  MEETING = 'MEETING',
  RESEARCH = 'RESEARCH',
  REVIEW = 'REVIEW',
  DEPLOYMENT = 'DEPLOYMENT',
  SUPPORT = 'SUPPORT',
  OTHER = 'OTHER'
}

export enum DailyTaskSortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export enum ViewMode {
  TABLE = 'TABLE',
  GROUPED = 'GROUPED',
  CALENDAR = 'CALENDAR'
}

export enum ExportFormat {
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  PDF = 'PDF'
}

// DailyTask month enum for better type safety
export enum DailyTaskMonth {
  JANUARY = 1,
  FEBRUARY = 2,
  MARCH = 3,
  APRIL = 4,
  MAY = 5,
  JUNE = 6,
  JULY = 7,
  AUGUST = 8,
  SEPTEMBER = 9,
  OCTOBER = 10,
  NOVEMBER = 11,
  DECEMBER = 12
}

// Configuration objects for UI display
export const DAILY_TASK_STATUS_CONFIG = {
  [DailyTaskStatus.DRAFT]: {
    label: 'Draft',
    color: '#6c757d',
    bgColor: '#f8f9fa',
    icon: 'bi-file-earmark',
    badgeClass: 'bg-secondary'
  },
  [DailyTaskStatus.SUBMITTED]: {
    label: 'Submitted',
    color: '#0d6efd',
    bgColor: '#e7f1ff',
    icon: 'bi-file-earmark-arrow-up',
    badgeClass: 'bg-primary'
  },
  [DailyTaskStatus.APPROVED]: {
    label: 'Approved',
    color: '#198754',
    bgColor: '#d1e7dd',
    icon: 'bi-check-circle-fill',
    badgeClass: 'bg-success'
  },
  [DailyTaskStatus.REJECTED]: {
    label: 'Rejected',
    color: '#dc3545',
    bgColor: '#f8d7da',
    icon: 'bi-x-circle-fill',
    badgeClass: 'bg-danger'
  },
  [DailyTaskStatus.PENDING_REVIEW]: {
    label: 'Pending Review',
    color: '#fd7e14',
    bgColor: '#fff3cd',
    icon: 'bi-clock-history',
    badgeClass: 'bg-warning'
  }
};

export const DAILY_TASK_PRIORITY_CONFIG = {
  [DailyTaskPriority.LOW]: {
    label: 'Low',
    color: '#198754',
    bgColor: '#d1e7dd',
    icon: 'bi-arrow-down',
    badgeClass: 'bg-success'
  },
  [DailyTaskPriority.MEDIUM]: {
    label: 'Medium',
    color: '#fd7e14',
    bgColor: '#fff3cd',
    icon: 'bi-dash',
    badgeClass: 'bg-warning'
  },
  [DailyTaskPriority.HIGH]: {
    label: 'High',
    color: '#dc3545',
    bgColor: '#f8d7da',
    icon: 'bi-arrow-up',
    badgeClass: 'bg-danger'
  },
  [DailyTaskPriority.CRITICAL]: {
    label: 'Critical',
    color: '#d63384',
    bgColor: '#f7d6e6',
    icon: 'bi-exclamation-triangle-fill',
    badgeClass: 'bg-danger'
  }
};

export const DAILY_TASK_TYPE_CONFIG = {
  [DailyTaskType.DEVELOPMENT]: {
    label: 'Development',
    icon: 'bi-code-slash',
    color: '#0d6efd'
  },
  [DailyTaskType.TESTING]: {
    label: 'Testing',
    icon: 'bi-bug',
    color: '#198754'
  },
  [DailyTaskType.BUG_FIX]: {
    label: 'Bug Fix',
    icon: 'bi-wrench',
    color: '#dc3545'
  },
  [DailyTaskType.DOCUMENTATION]: {
    label: 'Documentation',
    icon: 'bi-file-text',
    color: '#6c757d'
  },
  [DailyTaskType.MEETING]: {
    label: 'Meeting',
    icon: 'bi-people',
    color: '#fd7e14'
  },
  [DailyTaskType.RESEARCH]: {
    label: 'Research',
    icon: 'bi-search',
    color: '#6f42c1'
  },
  [DailyTaskType.REVIEW]: {
    label: 'Review',
    icon: 'bi-eye',
    color: '#20c997'
  },
  [DailyTaskType.DEPLOYMENT]: {
    label: 'Deployment',
    icon: 'bi-cloud-upload',
    color: '#0dcaf0'
  },
  [DailyTaskType.SUPPORT]: {
    label: 'Support',
    icon: 'bi-life-preserver',
    color: '#d63384'
  },
  [DailyTaskType.OTHER]: {
    label: 'Other',
    icon: 'bi-three-dots',
    color: '#adb5bd'
  }
};

// Month configuration for dropdowns
export const DAILY_TASK_MONTH_CONFIG = [
  { value: DailyTaskMonth.JANUARY, label: 'January', short: 'Jan' },
  { value: DailyTaskMonth.FEBRUARY, label: 'February', short: 'Feb' },
  { value: DailyTaskMonth.MARCH, label: 'March', short: 'Mar' },
  { value: DailyTaskMonth.APRIL, label: 'April', short: 'Apr' },
  { value: DailyTaskMonth.MAY, label: 'May', short: 'May' },
  { value: DailyTaskMonth.JUNE, label: 'June', short: 'Jun' },
  { value: DailyTaskMonth.JULY, label: 'July', short: 'Jul' },
  { value: DailyTaskMonth.AUGUST, label: 'August', short: 'Aug' },
  { value: DailyTaskMonth.SEPTEMBER, label: 'September', short: 'Sep' },
  { value: DailyTaskMonth.OCTOBER, label: 'October', short: 'Oct' },
  { value: DailyTaskMonth.NOVEMBER, label: 'November', short: 'Nov' },
  { value: DailyTaskMonth.DECEMBER, label: 'December', short: 'Dec' }
];