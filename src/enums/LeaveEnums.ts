// src/enums/LeaveEnums.ts

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  CASUAL = 'CASUAL',
  EMERGENCY = 'EMERGENCY',
  BEREAVEMENT = 'BEREAVEMENT',
  STUDY = 'STUDY',
  UNPAID = 'UNPAID'
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum DayPart {
  FULL = 'FULL',
  AM = 'AM',
  PM = 'PM'
}

export enum LeaveTypeFilter {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  CASUAL = 'CASUAL',
  EMERGENCY = 'EMERGENCY',
  BEREAVEMENT = 'BEREAVEMENT',
  STUDY = 'STUDY',
  UNPAID = 'UNPAID',
  ALL = 'ALL'
}

export enum LeaveStatusFilter {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  WITHDRAWN = 'WITHDRAWN',
  ALL = 'ALL'
}

// Display labels
export const LeaveTypeLabels: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: 'Annual Leave',
  [LeaveType.SICK]: 'Sick Leave',
  [LeaveType.MATERNITY]: 'Maternity Leave',
  [LeaveType.PATERNITY]: 'Paternity Leave',
  [LeaveType.CASUAL]: 'Casual Leave',
  [LeaveType.EMERGENCY]: 'Emergency Leave',
  [LeaveType.BEREAVEMENT]: 'Bereavement Leave',
  [LeaveType.STUDY]: 'Study Leave',
  [LeaveType.UNPAID]: 'Unpaid Leave'
};

export const LeaveStatusLabels: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: 'Pending',
  [LeaveStatus.APPROVED]: 'Approved',
  [LeaveStatus.REJECTED]: 'Rejected',
  [LeaveStatus.CANCELLED]: 'Cancelled',
  [LeaveStatus.WITHDRAWN]: 'Withdrawn'
};

export const LeaveTypeFilterLabels: Record<LeaveTypeFilter, string> = {
  [LeaveTypeFilter.ANNUAL]: 'Annual Leave',
  [LeaveTypeFilter.SICK]: 'Sick Leave',
  [LeaveTypeFilter.MATERNITY]: 'Maternity Leave',
  [LeaveTypeFilter.PATERNITY]: 'Paternity Leave',
  [LeaveTypeFilter.CASUAL]: 'Casual Leave',
  [LeaveTypeFilter.EMERGENCY]: 'Emergency Leave',
  [LeaveTypeFilter.BEREAVEMENT]: 'Bereavement Leave',
  [LeaveTypeFilter.STUDY]: 'Study Leave',
  [LeaveTypeFilter.UNPAID]: 'Unpaid Leave',
  [LeaveTypeFilter.ALL]: 'All Types'
};

export const LeaveStatusFilterLabels: Record<LeaveStatusFilter, string> = {
  [LeaveStatusFilter.PENDING]: 'Pending',
  [LeaveStatusFilter.APPROVED]: 'Approved',
  [LeaveStatusFilter.REJECTED]: 'Rejected',
  [LeaveStatusFilter.CANCELLED]: 'Cancelled',
  [LeaveStatusFilter.WITHDRAWN]: 'Withdrawn',
  [LeaveStatusFilter.ALL]: 'All Status'
};

// Status colors
export const LeaveStatusColors: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: '#f59e0b',     // Amber
  [LeaveStatus.APPROVED]: '#10b981',    // Emerald
  [LeaveStatus.REJECTED]: '#ef4444',    // Red
  [LeaveStatus.CANCELLED]: '#6b7280',   // Gray
  [LeaveStatus.WITHDRAWN]: '#8b5cf6'    // Violet
};

// Type colors
export const LeaveTypeColors: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: '#3b82f6',        // Blue
  [LeaveType.SICK]: '#ef4444',          // Red
  [LeaveType.MATERNITY]: '#ec4899',     // Pink
  [LeaveType.PATERNITY]: '#06b6d4',     // Cyan
  [LeaveType.CASUAL]: '#10b981',        // Emerald
  [LeaveType.EMERGENCY]: '#f59e0b',     // Amber
  [LeaveType.BEREAVEMENT]: '#6b7280',   // Gray
  [LeaveType.STUDY]: '#8b5cf6',         // Violet
  [LeaveType.UNPAID]: '#64748b'         // Slate
};