import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import {
  Task,
  TaskFormData,
  TaskUpdateData,
  TaskFilterParams,
  TaskResponse,
  TaskListResponse,
  TaskStatsApiResponse,
  TaskCreateResponse,
  BulkTaskUpdateData,
  BulkTaskDeleteData,
  BulkTaskResponse,
  QuickTaskData,
  TaskCommentsResponse,
  SubTask,
  SubTasksResponse
} from '../models/Task';
import { TaskStatus, TaskPriority } from '../enums/TaskEnums';
import { ApiStatus } from '../enums/ApiEnums';

class TaskService {
  // Get all tasks for a user with optional filters
  async getTasksByUser(userId: number, filters?: TaskFilterParams): Promise<TaskListResponse> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.TASKS.GET_BY_USER}?${params}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch tasks',
        data: []
      };
    }
  }

  // Get a specific task by ID
  async getTaskById(userTaskId: number): Promise<TaskResponse> {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.TASKS.GET_BY_ID}/${userTaskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch task',
        data: undefined
      };
    }
  }

  // Create a new task
  async createTask(userId: number, taskData: TaskFormData): Promise<TaskCreateResponse> {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.TASKS.CREATE, {
        ...taskData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to create task',
        data: undefined
      };
    }
  }

  // Update an existing task
  async updateTask(taskData: TaskUpdateData): Promise<TaskResponse> {
    try {
      const response = await axiosInstance.put(
        `${API_ENDPOINTS.TASKS.UPDATE}/${taskData.userTaskId}`,
        taskData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to update task',
        data: undefined
      };
    }
  }

  // Delete a task
  async deleteTask(userTaskId: number): Promise<TaskResponse> {
    try {
      const response = await axiosInstance.delete(`${API_ENDPOINTS.TASKS.DELETE}/${userTaskId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to delete task',
        data: undefined
      };
    }
  }

  // Update task status
  async updateTaskStatus(userTaskId: number, status: TaskStatus): Promise<TaskResponse> {
    try {
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.TASKS.UPDATE_STATUS}/${userTaskId}`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to update task status',
        data: undefined
      };
    }
  }

  // Update task priority
  async updateTaskPriority(userTaskId: number, priority: TaskPriority): Promise<TaskResponse> {
    try {
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.TASKS.UPDATE_PRIORITY}/${userTaskId}`,
        { priority }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating task priority:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to update task priority',
        data: undefined
      };
    }
  }

  // Get task statistics
  async getTaskStats(userId: number, filters?: TaskFilterParams): Promise<TaskStatsApiResponse> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.TASKS.GET_STATS}?${params}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching task statistics:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch task statistics',
        data: undefined
      };
    }
  }

  // Search tasks
  async searchTasks(userId: number, searchTerm: string, filters?: TaskFilterParams): Promise<TaskListResponse> {
    try {
      const params = new URLSearchParams();
      params.append('searchTerm', searchTerm);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.TASKS.SEARCH}?${params}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching tasks:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to search tasks',
        data: []
      };
    }
  }

  // Get overdue tasks (userId now extracted from token)
  async getOverdueTasks(): Promise<TaskListResponse> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.TASKS.GET_OVERDUE);
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue tasks:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch overdue tasks',
        data: []
      };
    }
  }

  // Get tasks by status
  async getTasksByStatus(userId: number, status: TaskStatus): Promise<TaskListResponse> {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.TASKS.GET_BY_STATUS}/${status}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch tasks by status',
        data: []
      };
    }
  }

  // Get tasks by priority
  async getTasksByPriority(userId: number, priority: TaskPriority): Promise<TaskListResponse> {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.TASKS.GET_BY_PRIORITY}/${priority}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks by priority:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch tasks by priority',
        data: []
      };
    }
  }

  // Bulk update tasks
  async bulkUpdateTasks(data: BulkTaskUpdateData): Promise<BulkTaskResponse> {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.TASKS.BULK_UPDATE, data);
      return response.data;
    } catch (error) {
      console.error('Error bulk updating tasks:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to bulk update tasks',
        data: { updated: 0, failed: 0 }
      };
    }
  }

  // Bulk delete tasks
  async bulkDeleteTasks(data: BulkTaskDeleteData): Promise<BulkTaskResponse> {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.TASKS.BULK_DELETE, { data });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting tasks:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to bulk delete tasks',
        data: { updated: 0, failed: 0 }
      };
    }
  }

  // Duplicate a task
  async duplicateTask(userTaskId: number): Promise<TaskCreateResponse> {
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.TASKS.DUPLICATE}/${userTaskId}`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating task:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to duplicate task',
        data: undefined
      };
    }
  }

  // Create quick task
  async createQuickTask(userId: number, quickTaskData: QuickTaskData): Promise<TaskCreateResponse> {
    try {
      const taskData: TaskFormData = {
        taskTitle: quickTaskData.title,
        taskDate: new Date().toISOString().split('T')[0],
        status: 'NOT_STARTED' as TaskStatus,
        priority: quickTaskData.priority,
        category: quickTaskData.category,
        dueDate: quickTaskData.dueDate
      };

      return await this.createTask(userId, taskData);
    } catch (error) {
      console.error('Error creating quick task:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to create quick task',
        data: undefined
      };
    }
  }

  // Get task comments
  async getTaskComments(taskId: number): Promise<TaskCommentsResponse> {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.TASKS.GET_COMMENTS}/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task comments:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch task comments',
        data: []
      };
    }
  }

  // Add task comment
  async addTaskComment(taskId: number, comment: string): Promise<TaskResponse> {
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.TASKS.ADD_COMMENT}/${taskId}`, {
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Error adding task comment:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to add task comment',
        data: undefined
      };
    }
  }

  // Get subtasks
  async getSubTasks(parentTaskId: number): Promise<SubTasksResponse> {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.TASKS.GET_SUBTASKS}/${parentTaskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch subtasks',
        data: []
      };
    }
  }

  // Create subtask
  async createSubTask(parentTaskId: number, subTaskData: Partial<SubTask>): Promise<TaskResponse> {
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.TASKS.CREATE_SUBTASK}/${parentTaskId}`, subTaskData);
      return response.data;
    } catch (error) {
      console.error('Error creating subtask:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to create subtask',
        data: undefined
      };
    }
  }

  // Get tasks for today
  async getTodayTasks(userId: number): Promise<TaskListResponse> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const filters: TaskFilterParams = {
        startDate: today,
        endDate: today
      };
      return await this.getTasksByUser(userId, filters);
    } catch (error) {
      console.error('Error fetching today tasks:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch today tasks',
        data: []
      };
    }
  }

  // Get tasks for this week
  async getWeekTasks(userId: number): Promise<TaskListResponse> {
    try {
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      
      const filters: TaskFilterParams = {
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: endOfWeek.toISOString().split('T')[0]
      };
      return await this.getTasksByUser(userId, filters);
    } catch (error) {
      console.error('Error fetching week tasks:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch week tasks',
        data: []
      };
    }
  }

  // Mark task as complete
  async markTaskComplete(taskId: number): Promise<TaskResponse> {
    return await this.updateTaskStatus(taskId, TaskStatus.COMPLETED);
  }

  // Mark task as in progress
  async markTaskInProgress(taskId: number): Promise<TaskResponse> {
    return await this.updateTaskStatus(taskId, TaskStatus.IN_PROGRESS);
  }

  // Archive task (mark as cancelled)
  async archiveTask(taskId: number): Promise<TaskResponse> {
    return await this.updateTaskStatus(taskId, TaskStatus.CANCELLED);
  }

  // Helper function to format task date
  formatTaskDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  // Helper function to calculate days until due
  getDaysUntilDue(dueDate: string): number {
    try {
      const due = new Date(dueDate);
      const today = new Date();
      const diffTime = due.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  }

  // Helper function to check if task is overdue
  isTaskOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate < today && task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.CANCELLED;
  }
}

export const taskService = new TaskService();