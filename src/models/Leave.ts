// src/models/Leave.ts
import { UserRole } from './User';

export interface Leave {
  leaveId?: number;
  userId: number;
  leaveType: LeaveType;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approvedBy?: number;
  approvedDate?: string;
  rejectionReason?: string;
  emergencyContact?: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveFormData {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  emergencyContact?: string;
  attachments?: File[];
}

export interface LeavePolicy {
  policyId?: number;
  leaveType: LeaveType;
  maxDaysPerYear: number;
  maxConsecutiveDays: number;
  requiresApproval: boolean;
  advanceNoticeRequired: number; // days
  description?: string;
  isCarryForward: boolean;
  carryForwardLimit?: number;
  isActive: boolean;
  applicableRoles: UserRole[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LeavePolicyFormData {
  leaveType: LeaveType;
  maxDaysPerYear: number;
  maxConsecutiveDays: number;
  requiresApproval: boolean;
  advanceNoticeRequired: number;
  description?: string;
  isCarryForward: boolean;
  carryForwardLimit?: number;
  applicableRoles: UserRole[];
}

export interface LeaveBalance {
  userId: number;
  leaveType: LeaveType;
  totalAllowed: number;
  used: number;
  remaining: number;
  carryForward: number;
  year: number;
}

export interface LeaveStats {
  totalApplications: number;
  approved: number;
  pending: number;
  rejected: number;
  byType: Array<{
    type: LeaveType;
    count: number;
  }>;
  byMonth: Array<{
    month: string;
    count: number;
  }>;
}

// Leave Types
export type LeaveType = 
  | 'ANNUAL' 
  | 'SICK' 
  | 'MATERNITY' 
  | 'PATERNITY' 
  | 'CASUAL' 
  | 'EMERGENCY' 
  | 'BEREAVEMENT' 
  | 'STUDY' 
  | 'UNPAID';

// Leave Status
export type LeaveStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'WITHDRAWN';

// Filter types
export type LeaveStatusFilter = LeaveStatus | 'ALL';
export type LeaveTypeFilter = LeaveType | 'ALL';

export interface LeaveFilters {
  status: LeaveStatusFilter;
  type: LeaveTypeFilter;
  startDate?: string;
  endDate?: string;
  searchQuery: string;
}