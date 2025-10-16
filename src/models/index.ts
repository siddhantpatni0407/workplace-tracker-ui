// src/models/index.ts

// User related exports
export * from './User';

// Tenant related exports
export * from './Tenant';

// Office Visit related exports
export * from './OfficeVisit';

// Holiday related exports
export * from './Holiday';

// Leave related exports
export * from './Leave';

// Task related exports
export * from './Task';

// Daily Task related exports - specific exports to avoid conflicts
export {
  type BaseDailyTask,
  type DailyTask,
  type DailyTaskFormData,
  type DailyTaskFilters,
  type DailyTaskSort,
  type DailyTaskPagination,
  type DailyTaskViewPreferences,
  type GroupedDailyTasks,
  type DailyTaskStatistics,
  type DailyTaskExportOptions,
  type DailyTaskBulkUpdate,
  type DailyTaskSearchResult,
  type DailyTaskApiResponse,
  type DailyTaskListApiResponse,
  type DailyTaskBulkApiResponse,
  type DailyTaskValidationResult,
  type DailyTaskTemplate,
  type DailyTaskComment,
  type DailyTaskHistory,
  type DailyTaskNotification,
  type DateSelection,
  type TableColumn,
  type DailyTaskFormField,
  type ModalState,
  type DailyTaskComponentState,
  type DailyTaskField,
  type DailyTaskFormFieldKey,
  type DailyTaskFilterField,
  isDailyTask,
  isDailyTaskFormData
} from './DailyTask';

// Note related exports
export * from './Note';

// Location related exports
export * from './Location';

// Dashboard related exports
export * from './Dashboard';

// Calendar related exports
export * from './Calendar';

// API related exports
export * from './Api';

// Form related exports
export * from './Form';

// Specific re-exports from existing types to avoid conflicts
export type { LoginCredentials, SignupData, AuthResponse } from '../types/auth';
export type { ResponseDTO } from '../types/api';
export type { HolidayDTO } from '../types/holiday';
export type { LeavePolicyDTO } from '../types/leavePolicy';