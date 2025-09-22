// Daily Task Models for the workplace tracker application

import { DailyTaskStatus, DailyTaskPriority, DailyTaskType, DailyTaskSortDirection, ViewMode, ExportFormat } from '../enums/DailyTaskEnums';
import { ApiResponse } from './Api';

// Base Daily Task interface
export interface BaseDailyTask {
  id?: string;
  date: string; // yyyy-MM-dd format
  day: string; // Day of the week (e.g., "Monday")
  taskNumber: string;
  projectCode: string;
  projectName: string;
  storyTaskBugNumber?: string;
  taskDetails: string;
  remarks?: string;
  status?: DailyTaskStatus;
  priority?: DailyTaskPriority;
  type?: DailyTaskType;
  estimatedHours?: number;
  actualHours?: number;
  userId: number;
  createdBy?: number;
  assignedTo?: number;
  reviewedBy?: number;
  reviewedAt?: string;
  tags?: string[];
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Daily Task interface with required fields
export interface DailyTask extends BaseDailyTask {
  id: string;
  status: DailyTaskStatus;
  priority: DailyTaskPriority;
  type: DailyTaskType;
}

// Daily Task form data interface for creating/updating tasks
export interface DailyTaskFormData {
  date: string;
  taskNumber: string;
  projectCode: string;
  projectName: string;
  storyTaskBugNumber?: string;
  taskDetails: string;
  remarks?: string;
  status?: DailyTaskStatus;
  priority?: DailyTaskPriority;
  type?: DailyTaskType;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  attachments?: string[];
}

// Daily Task filter interface
export interface DailyTaskFilters {
  dateFrom?: string;
  dateTo?: string;
  projectCode?: string;
  projectName?: string;
  status?: DailyTaskStatus[];
  priority?: DailyTaskPriority[];
  type?: DailyTaskType[];
  userId?: number;
  assignedTo?: number;
  searchQuery?: string;
  tags?: string[];
}

// Daily Task sort configuration
export interface DailyTaskSort {
  field: keyof DailyTask;
  direction: DailyTaskSortDirection;
}

// Daily Task pagination interface
export interface DailyTaskPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Daily Task view preferences
export interface DailyTaskViewPreferences {
  mode: ViewMode;
  showFilters: boolean;
  groupBy?: keyof DailyTask;
  columnsVisible: string[];
  sort: DailyTaskSort;
  pagination: Pick<DailyTaskPagination, 'pageSize'>;
}

// Grouped daily tasks interface
export interface GroupedDailyTasks {
  [key: string]: DailyTask[];
}

// Daily Task statistics interface
export interface DailyTaskStatistics {
  total: number;
  byStatus: Record<DailyTaskStatus, number>;
  byPriority: Record<DailyTaskPriority, number>;
  byType: Record<DailyTaskType, number>;
  totalEstimatedHours: number;
  totalActualHours: number;
  averageTasksPerDay: number;
  completionRate: number;
}

// Daily Task export options
export interface DailyTaskExportOptions {
  format: ExportFormat;
  filters?: DailyTaskFilters;
  dateRange: {
    from: string;
    to: string;
  };
  includeFields: string[];
  fileName?: string;
}

// Daily Task bulk update interface
export interface DailyTaskBulkUpdate {
  taskIds: string[];
  updates: Partial<DailyTaskFormData>;
}

// Daily Task search result interface
export interface DailyTaskSearchResult {
  tasks: DailyTask[];
  pagination: DailyTaskPagination;
  filters: DailyTaskFilters;
  sort: DailyTaskSort;
  statistics: DailyTaskStatistics;
}

// API Response types
export interface DailyTaskApiResponse extends ApiResponse {
  data: DailyTask;
}

export interface DailyTaskListApiResponse extends ApiResponse {
  data: {
    tasks: DailyTask[];
    pagination: DailyTaskPagination;
    statistics?: DailyTaskStatistics;
  };
}

export interface DailyTaskBulkApiResponse extends ApiResponse {
  data: {
    updated: string[];
    failed: string[];
    errors: Record<string, string>;
  };
}

// Form validation result interface
export interface DailyTaskValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

// Daily Task template interface
export interface DailyTaskTemplate {
  id: string;
  name: string;
  description?: string;
  template: Partial<DailyTaskFormData>;
  isDefault: boolean;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Daily Task comment interface
export interface DailyTaskComment {
  id: string;
  taskId: string;
  userId: number;
  userName: string;
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Daily Task history interface
export interface DailyTaskHistory {
  id: string;
  taskId: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  changes: Record<string, { from: any; to: any }>;
  userId: number;
  userName: string;
  timestamp: Date;
}

// Daily Task notification interface
export interface DailyTaskNotification {
  id: string;
  taskId: string;
  userId: number;
  type: 'reminder' | 'overdue' | 'status_change' | 'assignment';
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Month/Year selection interface
export interface DateSelection {
  year: number;
  month: number;
}

// Table column configuration
export interface TableColumn {
  key: keyof DailyTask;
  label: string;
  sortable: boolean;
  filterable: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
  visible: boolean;
}

// Daily Task form field configuration
export interface DailyTaskFormField {
  name: keyof DailyTaskFormData;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number';
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: any; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    min?: number;
    max?: number;
  };
}

// Modal state interface
export interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view' | 'bulk-edit';
  data?: DailyTask | DailyTask[];
  loading: boolean;
}

// Component state interface
export interface DailyTaskComponentState {
  tasks: DailyTask[];
  filteredTasks: DailyTask[];
  groupedTasks: GroupedDailyTasks;
  selectedTasks: Set<string>;
  filters: DailyTaskFilters;
  sort: DailyTaskSort;
  pagination: DailyTaskPagination;
  viewPreferences: DailyTaskViewPreferences;
  modal: ModalState;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  dateSelection: DateSelection;
}

// Export utility types
export type DailyTaskField = keyof DailyTask;
export type DailyTaskFormFieldKey = keyof DailyTaskFormData;
export type DailyTaskFilterField = keyof DailyTaskFilters;

// Type guards
export const isDailyTask = (obj: any): obj is DailyTask => {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.taskNumber === 'string' &&
    typeof obj.projectCode === 'string' &&
    typeof obj.projectName === 'string' &&
    typeof obj.taskDetails === 'string' &&
    typeof obj.userId === 'number';
};

export const isDailyTaskFormData = (obj: any): obj is DailyTaskFormData => {
  return obj && 
    typeof obj.date === 'string' &&
    typeof obj.taskNumber === 'string' &&
    typeof obj.projectCode === 'string' &&
    typeof obj.projectName === 'string' &&
    typeof obj.taskDetails === 'string';
};