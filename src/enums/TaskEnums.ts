// Task-related enums for the workplace tracker application

export enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TaskCategory {
  WORK = 'WORK',
  PERSONAL = 'PERSONAL',
  PROJECT = 'PROJECT',
  MEETING = 'MEETING',
  LEARNING = 'LEARNING',
  ADMIN = 'ADMIN',
  OTHER = 'OTHER'
}

export enum TaskType {
  TASK = 'TASK',
  SUBTASK = 'SUBTASK',
  MILESTONE = 'MILESTONE',
  BUG = 'BUG',
  FEATURE = 'FEATURE'
}

// Configuration objects for UI display
export const TASK_STATUS_CONFIG = {
  [TaskStatus.NOT_STARTED]: {
    label: 'Not Started',
    color: '#6c757d',
    bgColor: '#f8f9fa',
    icon: 'bi-circle'
  },
  [TaskStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: '#0d6efd',
    bgColor: '#e7f1ff',
    icon: 'bi-arrow-clockwise'
  },
  [TaskStatus.COMPLETED]: {
    label: 'Completed',
    color: '#198754',
    bgColor: '#d1e7dd',
    icon: 'bi-check-circle-fill'
  },
  [TaskStatus.ON_HOLD]: {
    label: 'On Hold',
    color: '#fd7e14',
    bgColor: '#fff3cd',
    icon: 'bi-pause-circle'
  },
  [TaskStatus.CANCELLED]: {
    label: 'Cancelled',
    color: '#dc3545',
    bgColor: '#f8d7da',
    icon: 'bi-x-circle'
  }
};

export const TASK_PRIORITY_CONFIG = {
  [TaskPriority.LOW]: {
    label: 'Low',
    color: '#198754',
    bgColor: '#d1e7dd',
    icon: 'bi-arrow-down'
  },
  [TaskPriority.MEDIUM]: {
    label: 'Medium',
    color: '#fd7e14',
    bgColor: '#fff3cd',
    icon: 'bi-dash'
  },
  [TaskPriority.HIGH]: {
    label: 'High',
    color: '#dc3545',
    bgColor: '#f8d7da',
    icon: 'bi-arrow-up'
  },
  [TaskPriority.URGENT]: {
    label: 'Urgent',
    color: '#d63384',
    bgColor: '#f7d6e6',
    icon: 'bi-exclamation-triangle-fill'
  }
};

export const TASK_CATEGORIES = [
  'Work',
  'Personal',
  'Project',
  'Meeting',
  'Learning',
  'Admin',
  'Other'
];