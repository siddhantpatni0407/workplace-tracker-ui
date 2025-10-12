import { TaskStatus, TaskPriority, TaskType } from '../enums/TaskEnums';
import { ApiResponse } from './Api';

// Base task interface
export interface BaseTask {
  userTaskId?: number;
  userId: number;
  taskTitle: string;
  taskDescription?: string;
  taskDate: string; // yyyy-MM-dd format
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  taskType?: TaskType;
  dueDate?: string; // yyyy-MM-dd format
  reminderDate?: string; // yyyy-MM-dd HH:mm format
  tags?: string[];
  parentTaskId?: number;
  createdBy?: number;
  remarks?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  createdDate?: string;
  modifiedDate?: string;
}

// Task interface with required fields
export interface Task extends BaseTask {
  userTaskId: number;
  createdDate: string;
  modifiedDate?: string;
}

// Task form data interface for creating/updating tasks
export interface TaskFormData {
  taskTitle: string;
  taskDescription?: string;
  taskDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  taskType?: TaskType;
  dueDate?: string;
  reminderDate?: string;
  tags?: string[];
  parentTaskId?: number;
  remarks?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
}

// Task update interface
export interface TaskUpdateData extends TaskFormData {
  userTaskId: number;
}

// Task filter parameters
export interface TaskFilterParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  taskType?: TaskType;
  createdBy?: number;
  startDate?: string;
  endDate?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
  isOverdue?: boolean;
  searchTerm?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  month?: number;
  year?: number;
}

// Task statistics interface
export interface TaskStatsResponse {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  onHoldTasks: number;
  cancelledTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  tasksByPriority: {
    [key in TaskPriority]: number;
  };
  tasksByCategory: {
    [category: string]: number;
  };
  tasksByStatus: {
    [key in TaskStatus]: number;
  };
  tasksTrend: {
    date: string;
    created: number;
    completed: number;
  }[];
}

// Task comment interface
export interface TaskComment {
  commentId: number;
  taskId: number;
  userId: number;
  userName: string;
  comment: string;
  createdDate: string;
  modifiedDate?: string;
}

// Task attachment interface
export interface TaskAttachment {
  attachmentId: number;
  taskId: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: number;
  uploadedDate: string;
}

// Subtask interface
export interface SubTask {
  subTaskId: number;
  parentTaskId: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignedTo?: number;
  createdDate: string;
  modifiedDate?: string;
}

// Task template interface
export interface TaskTemplate {
  templateId: number;
  templateName: string;
  description?: string;
  taskData: Partial<TaskFormData>;
  createdBy: number;
  isPublic: boolean;
  createdDate: string;
  modifiedDate?: string;
}

// Recurring task pattern interface
export interface RecurringTaskPattern {
  patternId: number;
  taskId: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: string;
  isActive: boolean;
  createdDate: string;
}

// Task API response types
export type TaskResponse = ApiResponse<Task>;
export type TaskListResponse = ApiResponse<Task[]>;
export type TaskStatsApiResponse = ApiResponse<TaskStatsResponse>;
export type TaskCommentsResponse = ApiResponse<TaskComment[]>;
export type TaskAttachmentsResponse = ApiResponse<TaskAttachment[]>;
export type SubTasksResponse = ApiResponse<SubTask[]>;
export type TaskTemplatesResponse = ApiResponse<TaskTemplate[]>;

// Task creation/update response
export interface TaskCreateResponse extends ApiResponse<Task> {
  taskId?: number;
}

// Bulk task operations
export interface BulkTaskUpdateData {
  userTaskIds: number[];
  updates: Partial<TaskFormData>;
}

export interface BulkTaskDeleteData {
  userTaskIds: number[];
}

export type BulkTaskResponse = ApiResponse<{
  updated: number;
  failed: number;
  errors?: string[];
}>;

// Task export data
export interface TaskExportData {
  format: 'CSV' | 'XLSX' | 'PDF';
  filters?: TaskFilterParams;
  fields?: string[];
  includeComments?: boolean;
  includeAttachments?: boolean;
}

// Quick task creation
export interface QuickTaskData {
  title: string;
  priority: TaskPriority;
  dueDate?: string;
  category?: string;
}