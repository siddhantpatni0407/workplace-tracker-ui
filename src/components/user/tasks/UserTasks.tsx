import React, { useEffect, useState, useRef, useCallback } from "react";
import Header from "../../common/header/Header";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import { useTranslation } from "../../../hooks/useTranslation";
import { taskService } from "../../../services/taskService";
import { 
  Task, 
  TaskFormData, 
  TaskUpdateData, 
  TaskStatsResponse
} from "../../../models/Task";
import { 
  TaskStatus, 
  TaskPriority, 
  TaskCategory,
  TaskType,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG
} from "../../../enums/TaskEnums";
import { ApiStatus } from "../../../enums/ApiEnums";
import "./user-tasks.css";

const UserTasks: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const userId = ((user as any)?.userId ?? (user as any)?.id) as number | undefined;

  // State for tasks and UI
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "overdue" | "all">("all");
  const [sortBy] = useState<"dueDate" | "priority" | "status" | "createdDate">("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Enhanced features states
  const [showBulkActions, setShowBulkActions] = useState(false);
  // const [showTemplateModal, setShowTemplateModal] = useState(false);
  // const [showImportModal, setShowImportModal] = useState(false);
  // const [showExportModal, setShowExportModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'calendar'>('table');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Form states
  const [formData, setFormData] = useState<TaskFormData>({
    taskTitle: "",
    taskDate: new Date().toISOString().split('T')[0],
    status: TaskStatus.NOT_STARTED,
    priority: TaskPriority.MEDIUM,
    category: TaskCategory.WORK,
    taskDescription: "",
    taskType: undefined,
    dueDate: "",
    reminderDate: "",
    tags: [],
    parentTaskId: undefined,
    remarks: "",
    isRecurring: false,
    recurringPattern: ""
  });

  const formRef = useRef<HTMLInputElement | null>(null);

  // Utility function to normalize and validate task data
  const normalizeTask = (task: any): Task | null => {
    try {
      // Check if required fields exist
      if (!task || typeof task !== 'object') return null;
      if (!task.userTaskId && !task.taskId) return null;
      if (!task.taskTitle) return null;
      
      // Normalize the task object
      const normalizedTask: Task = {
        userTaskId: task.userTaskId || task.taskId,
        userId: task.userId || userId || 0,
        taskTitle: task.taskTitle || 'Untitled Task',
        taskDescription: task.taskDescription || task.description || '',
        taskDate: task.taskDate || task.date || new Date().toISOString().split('T')[0],
        status: task.status || TaskStatus.NOT_STARTED,
        priority: task.priority || TaskPriority.MEDIUM,
        category: task.category || TaskCategory.WORK,
        taskType: task.taskType || task.type,
        dueDate: task.dueDate || task.due_date,
        reminderDate: task.reminderDate || task.reminder_date,
        tags: Array.isArray(task.tags) ? task.tags : [],
        parentTaskId: task.parentTaskId || task.parent_task_id,
        createdBy: task.createdBy || task.created_by || task.userId,
        remarks: task.remarks || '',
        isRecurring: Boolean(task.isRecurring || task.is_recurring),
        recurringPattern: task.recurringPattern || task.recurring_pattern,
        createdDate: task.createdDate || task.created_date || task.createdAt || new Date().toISOString(),
        modifiedDate: task.modifiedDate || task.modified_date || task.updatedAt
      };

      return normalizedTask;
    } catch (error) {
      console.error('Error normalizing task:', error, task);
      return null;
    }
  };

  // Safe task rendering helper
  const safeRenderTask = (task: Task, renderFn: (task: Task) => React.ReactNode) => {
    try {
      if (!task || !task.userTaskId) {
        console.warn('Invalid task data:', task);
        return null;
      }
      return renderFn(task);
    } catch (error) {
      console.error('Error rendering task:', error, task);
      return (
        <div key={task?.userTaskId || Math.random()} className="alert alert-warning">
          Error rendering task: {task?.taskTitle || 'Unknown task'}
        </div>
      );
    }
  };

  // Load tasks
  const loadTasks = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const response = await taskService.getTasksByUser(userId);
      console.log("API Response:", response); // Debug log
      
      // Handle different response structures
      if (response.status === ApiStatus.SUCCESS) {
        // Normalize different possible API response shapes (similar to User Notes):
        // - response.data => Task[]
        // - response.data => { data: Task[] }
        // - response.data => { data: { data: Task[] } } (double-wrapped)
        // - response.data => { tasks: Task[] } (legacy)
        let tasksArray: any[] = [];
        const respData = response.data;
        
        console.log("Raw Response Data:", respData); // Debug log
        console.log("Response Data Type:", typeof respData, Array.isArray(respData)); // Debug log

        if (!respData) {
          tasksArray = [];
        } else if (Array.isArray(respData)) {
          // response.data is already an array
          tasksArray = respData as any[];
        } else if (Array.isArray((respData as any).data)) {
          // response.data.data -> array of tasks
          tasksArray = (respData as any).data;
        } else if (Array.isArray((respData as any).data?.data)) {
          // response.data.data.data -> nested array
          tasksArray = (respData as any).data.data;
        } else if (Array.isArray((respData as any).tasks)) {
          // legacy shape: response.data.tasks
          tasksArray = (respData as any).tasks;
        } else {
          tasksArray = [];
        }
        
        console.log("Extracted Tasks Array:", tasksArray); // Debug log
        
        // Normalize and validate task data
        const normalizedTasks = tasksArray
          .map(normalizeTask)
          .filter((task): task is Task => task !== null);
        
        console.log("Normalized Tasks:", normalizedTasks); // Debug log
        setTasks(normalizedTasks);
      } else {
        console.error("API Error Response:", response);
        toast.error(response.message || "Failed to load tasks");
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load task statistics
  const loadStats = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await taskService.getTaskStats(userId);
      console.log("Stats API Response:", response); // Debug log
      
      if (response.status === ApiStatus.SUCCESS) {
        const statsData = response.data;
        console.log("Stats Data:", statsData); // Debug log
        setStats(statsData || null);
      }
    } catch (error) {
      console.error("Error loading task stats:", error);
    }
  }, [userId]);

  // Filter and sort tasks
  useEffect(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.taskTitle.toLowerCase().includes(query) ||
        (task.taskDescription && task.taskDescription.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "ALL") {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Apply category filter
    if (categoryFilter !== "ALL") {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    // Apply date filter
    const today = new Date().toISOString().split('T')[0];
    const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const oneMonthFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    switch (dateFilter) {
      case "today":
        filtered = filtered.filter(task => task.dueDate === today);
        break;
      case "week":
        filtered = filtered.filter(task => task.dueDate && task.dueDate <= oneWeekFromNow);
        break;
      case "month":
        filtered = filtered.filter(task => task.dueDate && task.dueDate <= oneMonthFromNow);
        break;
      case "overdue":
        filtered = filtered.filter(task => 
          task.dueDate && 
          task.dueDate < today && 
          task.status !== TaskStatus.COMPLETED
        );
        break;
    }

    // Sort tasks
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "dueDate":
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = a.dueDate.localeCompare(b.dueDate);
          break;
        case "priority":
          const priorityOrder = { [TaskPriority.URGENT]: 4, [TaskPriority.HIGH]: 3, [TaskPriority.MEDIUM]: 2, [TaskPriority.LOW]: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "createdDate":
          comparison = a.createdDate.localeCompare(b.createdDate);
          break;
        default:
          comparison = a.taskTitle.localeCompare(b.taskTitle);
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, dateFilter, sortBy, sortOrder]);

  // Helper function to format datetime for backend
  const formatDateTimeForAPI = (dateTimeString: string): string => {
    if (!dateTimeString) return dateTimeString;
    
    // If the datetime string doesn't have seconds, add ":00"
    if (dateTimeString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
      return dateTimeString + ":00";
    }
    
    return dateTimeString;
  };

  // Helper function to format datetime from API to HTML datetime-local format
  const formatDateTimeForInput = (dateTimeString: string): string => {
    if (!dateTimeString) return "";
    
    // If the datetime string has seconds, remove them for datetime-local input
    if (dateTimeString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      return dateTimeString.substring(0, 16); // Keep only YYYY-MM-DDTHH:mm
    }
    
    return dateTimeString;
  };

  // Prepare form data for API submission
  const prepareFormDataForAPI = (data: TaskFormData): TaskFormData => {
    const formatted = {
      ...data,
      reminderDate: data.reminderDate ? formatDateTimeForAPI(data.reminderDate) : data.reminderDate
    };
    
    // Debug log for datetime formatting
    if (data.reminderDate) {
      console.log('DateTime formatting:', {
        original: data.reminderDate,
        formatted: formatted.reminderDate
      });
    }
    
    return formatted;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      if (editing) {
        const preparedFormData = prepareFormDataForAPI(formData);
        const updateData: TaskUpdateData = {
          userTaskId: editing.userTaskId,
          ...preparedFormData
        };
        const response = await taskService.updateTask(updateData);
        if (response.status === ApiStatus.SUCCESS) {
          toast.success("Task updated successfully");
          setShowModal(false);
          setEditing(null);
          loadTasks();
        } else {
          toast.error(response.message || "Failed to update task");
        }
      } else {
        const preparedFormData = prepareFormDataForAPI(formData);
        const response = await taskService.createTask(userId, preparedFormData);
        if (response.status === ApiStatus.SUCCESS) {
          toast.success("Task created successfully");
          setShowModal(false);
          loadTasks();
        } else {
          toast.error(response.message || "Failed to create task");
        }
      }
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task");
    }
  };

  // Handle task status change
  const handleStatusChange = async (userTaskId: number, newStatus: TaskStatus) => {
    try {
      const response = await taskService.updateTaskStatus(userTaskId, newStatus);
      if (response.status === ApiStatus.SUCCESS) {
        toast.success(`Task marked as ${TASK_STATUS_CONFIG[newStatus].label.toLowerCase()}`);
        loadTasks();
      } else {
        toast.error(response.message || "Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    }
  };

  // Handle task deletion
  const handleDelete = async () => {
    if (!deletingTask) return;
    
    try {
      const response = await taskService.deleteTask(deletingTask.userTaskId);
      if (response.status === ApiStatus.SUCCESS) {
        toast.success("Task deleted successfully");
        setShowDeleteModal(false);
        setDeletingTask(null);
        loadTasks();
      } else {
        toast.error(response.message || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  // Handle task duplication
  const handleDuplicateTask = async (task: Task) => {
    if (!task) return;
    
    try {
      const response = await taskService.duplicateTask(task.userTaskId);
      if (response.status === ApiStatus.SUCCESS) {
        toast.success("Task duplicated successfully");
        loadTasks(); // Reload tasks to show the duplicated task
      } else {
        toast.error(response.message || "Failed to duplicate task");
      }
    } catch (error) {
      console.error("Error duplicating task:", error);
      toast.error("Failed to duplicate task");
    }
  };

  // Open modal for new task
  const openNewTaskModal = () => {
    setEditing(null);
    setFormData({
      taskTitle: "",
      taskDate: new Date().toISOString().split('T')[0],
      status: TaskStatus.NOT_STARTED,
      priority: TaskPriority.MEDIUM,
      category: TaskCategory.WORK,
      taskDescription: "",
      taskType: undefined,
      dueDate: "",
      reminderDate: "",
      tags: [],
      parentTaskId: undefined,
      remarks: "",
      isRecurring: false,
      recurringPattern: ""
    });
    setShowModal(true);
    setTimeout(() => formRef.current?.focus(), 100);
  };

  // Open modal for editing task
  const openEditTaskModal = (task: Task) => {
    setEditing(task);
    setFormData({
      taskTitle: task.taskTitle,
      taskDate: task.taskDate,
      status: task.status,
      priority: task.priority,
      category: task.category,
      taskDescription: task.taskDescription || "",
      taskType: task.taskType || undefined,
      dueDate: task.dueDate || "",
      reminderDate: formatDateTimeForInput(task.reminderDate || ""),
      tags: task.tags || [],
      parentTaskId: task.parentTaskId || undefined,
      remarks: task.remarks || "",
      isRecurring: task.isRecurring || false,
      recurringPattern: task.recurringPattern || ""
    });
    setShowModal(true);
    setTimeout(() => formRef.current?.focus(), 100);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Check if task is overdue
  const isOverdue = (task: Task) => {
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate && task.dueDate < today && task.status !== TaskStatus.COMPLETED;
  };

  // Enhanced Functions for additional features
  const exportTasks = () => {
    try {
      const exportData = {
        tasks: filteredTasks,
        exportDate: new Date().toISOString(),
        totalCount: filteredTasks.length
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success("Tasks exported successfully");
    } catch (error) {
      console.error("Error exporting tasks:", error);
      toast.error("Failed to export tasks");
    }
  };

  const handleBulkStatusChange = async (newStatus: TaskStatus) => {
    try {
      for (const userTaskId of selectedTasks) {
        await taskService.updateTaskStatus(userTaskId, newStatus);
      }
      toast.success(`${selectedTasks.length} tasks updated to ${TASK_STATUS_CONFIG[newStatus].label}`);
      setSelectedTasks([]);
      setShowBulkActions(false);
      loadTasks();
    } catch (error) {
      console.error("Error bulk updating task status:", error);
      toast.error("Failed to update task status");
    }
  };

  const handleBulkPriorityChange = async (newPriority: TaskPriority) => {
    try {
      for (const userTaskId of selectedTasks) {
        const task = tasks.find(t => t.userTaskId === userTaskId);
        if (task) {
          const updateData: TaskUpdateData = {
            userTaskId: task.userTaskId,
            taskTitle: task.taskTitle,
            taskDate: task.taskDate,
            status: task.status,
            priority: newPriority,
            category: task.category,
            taskDescription: task.taskDescription || "",
            dueDate: task.dueDate || ""
          };
          await taskService.updateTask(updateData);
        }
      }
      toast.success(`${selectedTasks.length} tasks updated to ${TASK_PRIORITY_CONFIG[newPriority].label} priority`);
      setSelectedTasks([]);
      setShowBulkActions(false);
      loadTasks();
    } catch (error) {
      console.error("Error bulk updating task priority:", error);
      toast.error("Failed to update task priority");
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} selected tasks?`)) {
      try {
        for (const userTaskId of selectedTasks) {
          await taskService.deleteTask(userTaskId);
        }
        toast.success(`${selectedTasks.length} tasks deleted`);
        setSelectedTasks([]);
        setShowBulkActions(false);
        loadTasks();
      } catch (error) {
        console.error("Error bulk deleting tasks:", error);
        toast.error("Failed to delete tasks");
      }
    }
  };

  const hasSelectedTasks = selectedTasks.length > 0;

  // Helper functions for enhanced task display
  const getTaskIcon = (category: string | undefined): string => {
    if (!category) return 'fa-circle';
    
    const iconMap: Record<string, string> = {
      'WORK': 'fa-briefcase',
      'PERSONAL': 'fa-user',
      'PROJECT': 'fa-project-diagram',
      'MEETING': 'fa-users',
      'LEARNING': 'fa-graduation-cap',
      'ADMIN': 'fa-cog',
      'OTHER': 'fa-circle'
    };
    return iconMap[category.toUpperCase()] || 'fa-circle';
  };

  const getTaskProgress = (status: TaskStatus): number => {
    const progressMap: Record<TaskStatus, number> = {
      [TaskStatus.NOT_STARTED]: 0,
      [TaskStatus.IN_PROGRESS]: 50,
      [TaskStatus.COMPLETED]: 100,
      [TaskStatus.ON_HOLD]: 25,
      [TaskStatus.CANCELLED]: 0
    };
    return progressMap[status] || 0;
  };

  const getDaysRemaining = (dueDate: string): string => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `${diffDays} days remaining`;
    }
  };

  useEffect(() => {
    loadTasks();
    loadStats();
  }, [userId, loadTasks, loadStats]);

  if (!userId) {
    return (
      <div className="container-fluid py-3">
        <Header title={t('tasks.title')} subtitle={t('tasks.subtitle')} />
        <div className="alert alert-warning">{t('tasks.pleaseLoginToViewTasks')}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <Header title={t('tasks.title')} subtitle={t('tasks.subtitle')} />

      {/* Statistics Cards */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card stat-card text-center">
              <div className="card-body">
                <h5 className="card-title text-primary">{stats.totalTasks}</h5>
                <p className="card-text">{t('tasks.totalTasks')}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stat-card text-center">
              <div className="card-body">
                <h5 className="card-title text-success">{stats.completedTasks}</h5>
                <p className="card-text">{t('tasks.completedTasks')}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stat-card text-center">
              <div className="card-body">
                <h5 className="card-title text-warning">{stats.inProgressTasks}</h5>
                <p className="card-text">{t('tasks.pendingTasks')}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stat-card text-center">
              <div className="card-body">
                <h5 className="card-title text-danger">{stats.overdueTasks}</h5>
                <p className="card-text">{t('tasks.overdueTasks')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="card mb-3 control-card shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-auto">
              <button className="btn btn-primary btn-sm" onClick={openNewTaskModal}>
                <i className="fa fa-plus me-2"></i>{t('tasks.newTask')}
              </button>
            </div>
            
            <div className="col-auto">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder={t('tasks.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "200px" }}
              />
            </div>

            <div className="col-auto">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "ALL")}
              >
                <option value="ALL">{t('tasks.allStatus')}</option>
                {Object.values(TaskStatus).map(status => (
                  <option key={status} value={status}>
                    {TASK_STATUS_CONFIG[status].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-auto">
              <select
                className="form-select form-select-sm"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "ALL")}
              >
                <option value="ALL">{t('tasks.allPriority')}</option>
                {Object.values(TaskPriority).map(priority => (
                  <option key={priority} value={priority}>
                    {TASK_PRIORITY_CONFIG[priority].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-auto">
              <select
                className="form-select form-select-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as TaskCategory | "ALL")}
              >
                <option value="ALL">{t('tasks.allCategories')}</option>
                {Object.values(TaskCategory).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-auto">
              <select
                className="form-select form-select-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
              >
                <option value="all">{t('tasks.allTasks')}</option>
                <option value="today">{t('tasks.dueToday')}</option>
                <option value="week">{t('tasks.dueThisWeek')}</option>
                <option value="month">{t('tasks.dueThisMonth')}</option>
                <option value="overdue">{t('tasks.overdue')}</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="col-auto">
              <div className="btn-group" role="group">
                <button
                  className={`btn btn-outline-secondary btn-sm ${viewMode === 'table' ? "active" : ""}`}
                  onClick={() => setViewMode('table')}
                  title={t('tasks.tableView')}
                >
                  <i className="fa fa-table"></i>
                </button>
                <button
                  className={`btn btn-outline-secondary btn-sm ${viewMode === 'kanban' ? "active" : ""}`}
                  onClick={() => setViewMode('kanban')}
                  title={t('tasks.kanbanView')}
                >
                  <i className="fa fa-th"></i>
                </button>
                <button
                  className={`btn btn-outline-secondary btn-sm ${viewMode === 'calendar' ? "active" : ""}`}
                  onClick={() => setViewMode('calendar')}
                  title={t('tasks.calendarView')}
                >
                  <i className="fa fa-calendar"></i>
                </button>
              </div>
            </div>

            {/* Enhanced Options */}
            <div className="col-auto">
              <div className="btn-group" role="group">
                <button
                  className="btn btn-outline-info btn-sm"
                  onClick={() => toast.info(t('tasks.templatesComingSoon'))}
                  title={t('tasks.useTemplates')}
                >
                  <i className="fa fa-file-text"></i>
                </button>
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => toast.info(t('tasks.importComingSoon'))}
                  title={t('tasks.importTasks')}
                >
                  <i className="fa fa-upload"></i>
                </button>
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => exportTasks()}
                  title={t('tasks.exportTasks')}
                >
                  <i className="fa fa-download"></i>
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowQuickAdd(!showQuickAdd)}
                  title={t('tasks.quickAddTask')}
                >
                  <i className="fa fa-plus-circle"></i>
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {hasSelectedTasks && (
              <div className="col-auto">
                <div className="btn-group" role="group">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    title={t('tasks.bulkActions')}
                  >
                    <i className="fa fa-check-square me-1"></i>
                    {selectedTasks.length} {t('tasks.selected')}
                  </button>
                  {showBulkActions && (
                    <div className="dropdown-menu show position-relative">
                      <button
                        className="dropdown-item"
                        onClick={() => handleBulkStatusChange(TaskStatus.COMPLETED)}
                      >
                        <i className="fa fa-check me-2"></i>{t('tasks.markCompleted')}
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() => handleBulkStatusChange(TaskStatus.IN_PROGRESS)}
                      >
                        <i className="fa fa-play me-2"></i>{t('tasks.markInProgress')}
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() => handleBulkPriorityChange(TaskPriority.HIGH)}
                      >
                        <i className="fa fa-exclamation me-2"></i>{t('tasks.setHighPriority')}
                      </button>
                      <div className="dropdown-divider"></div>
                      <button
                        className="dropdown-item text-danger"
                        onClick={() => handleBulkDelete()}
                      >
                        <i className="fa fa-trash me-2"></i>{t('tasks.deleteSelected')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="col-auto">
              <div className="btn-group" role="group">
                <button
                  className={`btn btn-outline-secondary btn-sm ${sortOrder === "asc" ? "active" : ""}`}
                  onClick={() => setSortOrder("asc")}
                >
                  <i className="fa fa-sort-up"></i>
                </button>
                <button
                  className={`btn btn-outline-secondary btn-sm ${sortOrder === "desc" ? "active" : ""}`}
                  onClick={() => setSortOrder("desc")}
                >
                  <i className="fa fa-sort-down"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="card shadow-sm">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              {t('tasks.tasksList')} ({filteredTasks.length})
              {selectedTasks.length > 0 && (
                <span className="ms-2 text-muted">({selectedTasks.length} {t('tasks.selected')})</span>
              )}
            </h6>
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted">{t('tasks.view')}:</small>
              <div className="btn-group btn-group-sm" role="group">
                <button
                  className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('table')}
                  title={t('tasks.tableView')}
                >
                  <i className="fa fa-list"></i>
                </button>
                <button
                  className={`btn ${viewMode === 'kanban' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('kanban')}
                  title={t('tasks.kanbanView')}
                >
                  <i className="fa fa-th"></i>
                </button>
                <button
                  className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('calendar')}
                  title={t('tasks.calendarView')}
                >
                  <i className="fa fa-calendar"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {isLoading ? (
            <div className="text-center p-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">{t('tasks.loading')}</span>
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center p-4 text-muted">
              <i className="fa fa-tasks fa-3x mb-3 text-primary"></i>
              <h5>{t('tasks.noTasksFound')}</h5>
              <p className="mb-3">{t('tasks.getStartedMessage')}</p>
              <button className="btn btn-primary" onClick={openNewTaskModal}>
                <i className="fa fa-plus me-2"></i>{t('tasks.createFirstTask')}
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedTasks.length === filteredTasks.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTasks(filteredTasks.map(t => t.userTaskId));
                          } else {
                            setSelectedTasks([]);
                          }
                        }}
                      />
                    </th>
                    <th>{t('tasks.task')}</th>
                    <th>{t('tasks.priority')}</th>
                    <th>{t('tasks.category')}</th>
                    <th>{t('tasks.taskType') || 'Type'}</th>
                    <th>{t('tasks.status')}</th>
                    <th>{t('tasks.dueDate')}</th>
                    <th>{t('tasks.tags') || 'Tags'}</th>
                    <th>{t('tasks.progress')}</th>
                    <th style={{ width: '120px' }}>{t('tasks.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => safeRenderTask(task, (task) => (
                    <tr key={task.userTaskId} className={`${isOverdue(task) ? "table-danger" : ""} task-row`}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedTasks.includes(task.userTaskId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTasks([...selectedTasks, task.userTaskId]);
                            } else {
                              setSelectedTasks(selectedTasks.filter(id => id !== task.userTaskId));
                            }
                          }}
                        />
                      </td>
                      <td>
                        <div className="task-info">
                          <div 
                            className="task-title fw-bold" 
                            onClick={() => {
                              setViewingTask(task);
                              setShowViewModal(true);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <i className={`fa ${getTaskIcon(task.category)} me-2 text-primary`}></i>
                            {task.taskTitle}
                          </div>
                          {task.taskDescription && (
                            <small className="text-muted task-description">
                              {task.taskDescription.substring(0, 60)}
                              {task.taskDescription.length > 60 && "..."}
                            </small>
                          )}
                          <div className="task-meta mt-1">
                            <small className="text-muted">
                              Created {formatDate(task.createdDate)}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span 
                          className={`badge priority-badge priority-${task.priority.toLowerCase()}`}
                        >
                          <i className={`fa ${TASK_PRIORITY_CONFIG[task.priority].icon} me-1`}></i>
                          {TASK_PRIORITY_CONFIG[task.priority].label}
                        </span>
                      </td>
                      <td>
                        <span className={`badge category-badge category-${(task.category || 'other').toLowerCase()}`}>
                          <i className={`fa ${getTaskIcon(task.category)} me-1`}></i>
                          {task.category || 'Other'}
                        </span>
                      </td>
                      <td>
                        {task.taskType ? (
                          <span className={`badge bg-info text-dark`}>
                            {task.taskType}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <select
                          className={`form-select form-select-sm status-select status-${task.status.toLowerCase().replace('_', '-')}`}
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.userTaskId, e.target.value as TaskStatus)}
                        >
                          {Object.values(TaskStatus).map(status => (
                            <option key={status} value={status}>
                              {TASK_STATUS_CONFIG[status].label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="due-date-container">
                          {task.dueDate ? (
                            <div className={`due-date ${isOverdue(task) ? "overdue" : ""}`}>
                              <i className="fa fa-calendar-alt me-1"></i>
                              {formatDate(task.dueDate)}
                              {isOverdue(task) && <i className="fa fa-exclamation-triangle ms-1 text-danger"></i>}
                              <div className="days-remaining">
                                {getDaysRemaining(task.dueDate)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted">
                              <i className="fa fa-calendar-times me-1"></i>
                              {t('tasks.noDueDate')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="tags-container">
                          {task.tags && task.tags.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {task.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="badge bg-secondary text-white small">
                                  {tag}
                                </span>
                              ))}
                              {task.tags.length > 2 && (
                                <span className="badge bg-light text-dark small">
                                  +{task.tags.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="progress-container">
                          <div className="progress progress-sm">
                            <div 
                              className={`progress-bar progress-bar-${task.status.toLowerCase().replace('_', '-')}`}
                              style={{ width: `${getTaskProgress(task.status)}%` }}
                            ></div>
                          </div>
                          <small className="text-muted">{getTaskProgress(task.status)}%</small>
                        </div>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => openEditTaskModal(task)}
                            title={t('tasks.editTask')}
                          >
                            <i className="fa fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => handleDuplicateTask(task)}
                            title={t('tasks.duplicateTask') || 'Duplicate Task'}
                          >
                            <i className="fa fa-copy"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => {
                              setDeletingTask(task);
                              setShowDeleteModal(true);
                            }}
                            title={t('tasks.deleteTask')}
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          ) : viewMode === 'kanban' ? (
            <div className="p-3">
              <div className="row g-3">
                {filteredTasks.map((task) => safeRenderTask(task, (safeTask) => (
                  <div key={safeTask.userTaskId} className="col-lg-4 col-md-6">
                    <div className={`card task-card h-100 ${isOverdue(safeTask) ? 'border-danger' : ''} ${selectedTasks.includes(safeTask.userTaskId) ? 'selected' : ''}`}>
                      <div className="card-header d-flex justify-content-between align-items-center p-2">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedTasks.includes(safeTask.userTaskId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTasks([...selectedTasks, safeTask.userTaskId]);
                              } else {
                                setSelectedTasks(selectedTasks.filter(id => id !== safeTask.userTaskId));
                              }
                            }}
                          />
                        </div>
                        <div className="dropdown">
                          <button className="btn btn-sm" data-bs-toggle="dropdown">
                            <i className="fa fa-ellipsis-v"></i>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                              <button className="dropdown-item" onClick={() => openEditTaskModal(safeTask)}>
                                <i className="fa fa-edit me-2"></i>Edit
                              </button>
                            </li>
                            <li>
                              <button className="dropdown-item text-success" onClick={() => handleDuplicateTask(safeTask)}>
                                <i className="fa fa-copy me-2"></i>Duplicate
                              </button>
                            </li>
                            <li>
                              <button className="dropdown-item text-danger" onClick={() => {
                                setDeletingTask(safeTask);
                                setShowDeleteModal(true);
                              }}>
                                <i className="fa fa-trash me-2"></i>Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="card-body p-3">
                        <div className="d-flex align-items-start mb-2">
                          <i className={`fa ${getTaskIcon(safeTask.category)} me-2 text-primary flex-shrink-0 mt-1`}></i>
                          <h6 
                            className="card-title mb-0 flex-grow-1 task-title-clickable"
                            onClick={() => {
                              setViewingTask(safeTask);
                              setShowViewModal(true);
                            }}
                          >
                            {safeTask.taskTitle}
                          </h6>
                        </div>
                        
                        {safeTask.taskDescription && (
                          <p className="card-text text-muted small mb-3">
                            {safeTask.taskDescription.substring(0, 100)}
                            {safeTask.taskDescription.length > 100 && "..."}
                          </p>
                        )}

                        <div className="d-flex gap-2 mb-3 flex-wrap">
                          <span className={`badge priority-badge priority-${safeTask.priority.toLowerCase()}`}>
                            <i className={`fa ${TASK_PRIORITY_CONFIG[safeTask.priority].icon} me-1`}></i>
                            {TASK_PRIORITY_CONFIG[safeTask.priority].label}
                          </span>
                          <span className={`badge category-badge category-${(safeTask.category || 'other').toLowerCase()}`}>
                            {safeTask.category || 'Other'}
                          </span>
                          {safeTask.taskType && (
                            <span className="badge bg-info text-dark">
                              {safeTask.taskType}
                            </span>
                          )}
                          {safeTask.tags && safeTask.tags.length > 0 && (
                            <>
                              {safeTask.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="badge bg-secondary text-white small">
                                  {tag}
                                </span>
                              ))}
                              {safeTask.tags.length > 3 && (
                                <span className="badge bg-light text-dark small">
                                  +{safeTask.tags.length - 3}
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        <div className="progress mb-2" style={{ height: '6px' }}>
                          <div 
                            className={`progress-bar progress-bar-${safeTask.status.toLowerCase().replace('_', '-')}`}
                            style={{ width: `${getTaskProgress(safeTask.status)}%` }}
                          ></div>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted">{t('tasks.progress')}: {getTaskProgress(safeTask.status)}%</small>
                          <select
                            className={`form-select form-select-sm status-select status-${safeTask.status.toLowerCase().replace('_', '-')}`}
                            value={safeTask.status}
                            onChange={(e) => handleStatusChange(safeTask.userTaskId, e.target.value as TaskStatus)}
                            style={{ width: 'auto', fontSize: '0.75rem' }}
                          >
                            {Object.values(TaskStatus).map(status => (
                              <option key={status} value={status}>
                                {TASK_STATUS_CONFIG[status].label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {safeTask.dueDate && (
                          <div className={`due-date-card ${isOverdue(safeTask) ? "overdue" : ""}`}>
                            <i className="fa fa-calendar-alt me-1"></i>
                            <small>{t('tasks.due')}: {formatDate(safeTask.dueDate)}</small>
                            {isOverdue(safeTask) && <i className="fa fa-exclamation-triangle ms-1"></i>}
                            <div className="days-remaining-small">
                              {getDaysRemaining(safeTask.dueDate)}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="card-footer p-2 bg-transparent">
                        <small className="text-muted">
                          <i className="fa fa-clock me-1"></i>
                          {t('tasks.created')} {formatDate(safeTask.createdDate)}
                        </small>
                      </div>
                    </div>
                  </div>
                )))}
              </div>
            </div>
          ) : (
            <div className="p-3">
              <div className="timeline-view">
                <h6 className="mb-3"><i className="fa fa-calendar me-2"></i>{t('tasks.timelineView')}</h6>
                <div className="timeline-container">
                  {filteredTasks
                    .filter(task => task.dueDate)
                    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
                    .map((task) => safeRenderTask(task, (safeTask) => (
                      <div key={safeTask.userTaskId} className={`timeline-item ${isOverdue(safeTask) ? 'overdue' : ''}`}>
                        <div className="timeline-marker">
                          <i className={`fa ${getTaskIcon(safeTask.category)}`}></i>
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h6 className="timeline-title">{safeTask.taskTitle}</h6>
                            <small className="timeline-date">{formatDate(safeTask.dueDate!)}</small>
                          </div>
                          {safeTask.taskDescription && (
                            <p className="timeline-description">{safeTask.taskDescription}</p>
                          )}
                          <div className="timeline-meta">
                            <span className={`badge priority-badge priority-${safeTask.priority.toLowerCase()}`}>
                              {TASK_PRIORITY_CONFIG[safeTask.priority].label}
                            </span>
                            <span className={`badge category-badge category-${(safeTask.category || 'other').toLowerCase()}`}>
                              {safeTask.category || 'Other'}
                            </span>
                            <select
                              className={`form-select form-select-sm status-select status-${safeTask.status.toLowerCase().replace('_', '-')} ms-2`}
                              value={safeTask.status}
                              onChange={(e) => handleStatusChange(safeTask.userTaskId, e.target.value as TaskStatus)}
                              style={{ width: 'auto', display: 'inline-block' }}
                            >
                              {Object.values(TaskStatus).map(status => (
                                <option key={status} value={status}>
                                  {TASK_STATUS_CONFIG[status].label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )))}
                  {filteredTasks.filter(task => !task.dueDate).length > 0 && (
                    <div className="mt-4">
                      <h6 className="text-muted">{t('tasks.tasksWithoutDueDates')}:</h6>
                      {filteredTasks.filter(task => !task.dueDate).map(task => safeRenderTask(task, (safeTask) => (
                        <div key={safeTask.userTaskId} className="timeline-item no-date">
                          <div className="timeline-marker">
                            <i className={`fa ${getTaskIcon(safeTask.category)}`}></i>
                          </div>
                          <div className="timeline-content">
                            <h6 className="timeline-title">{safeTask.taskTitle}</h6>
                            {safeTask.taskDescription && (
                              <p className="timeline-description">{safeTask.taskDescription}</p>
                            )}
                            <div className="timeline-meta">
                              <span className={`badge priority-badge priority-${safeTask.priority.toLowerCase()}`}>
                                {TASK_PRIORITY_CONFIG[safeTask.priority].label}
                              </span>
                              <span className={`badge category-badge category-${(safeTask.category || 'other').toLowerCase()}`}>
                                {safeTask.category || 'Other'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editing ? t('tasks.editTask') : t('tasks.newTask')}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">{t('tasks.taskTitle')} *</label>
                      <input
                        ref={formRef}
                        type="text"
                        className="form-control"
                        value={formData.taskTitle}
                        onChange={(e) => setFormData({ ...formData, taskTitle: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label">{t('tasks.description')}</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.taskDescription}
                        onChange={(e) => setFormData({ ...formData, taskDescription: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">{t('tasks.priority')}</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                      >
                        {Object.values(TaskPriority).map(priority => (
                          <option key={priority} value={priority}>
                            {TASK_PRIORITY_CONFIG[priority].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">{t('tasks.category')}</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                      >
                        {Object.values(TaskCategory).map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">{t('tasks.taskDate')}</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.taskDate}
                        onChange={(e) => setFormData({ ...formData, taskDate: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">{t('tasks.dueDate')}</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">{t('tasks.status')}</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                      >
                        {Object.values(TaskStatus).map(status => (
                          <option key={status} value={status}>
                            {TASK_STATUS_CONFIG[status].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">{t('tasks.taskType') || 'Task Type'}</label>
                      <select
                        className="form-select"
                        value={formData.taskType || ""}
                        onChange={(e) => setFormData({ ...formData, taskType: e.target.value as TaskType || undefined })}
                      >
                        <option value="">{t('tasks.selectTaskType') || 'Select Task Type'}</option>
                        {Object.values(TaskType).map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">{t('tasks.reminderDate') || 'Reminder Date'}</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.reminderDate}
                        onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">{t('tasks.parentTask') || 'Parent Task ID'}</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Enter parent task ID"
                        value={formData.parentTaskId || ""}
                        onChange={(e) => setFormData({ ...formData, parentTaskId: e.target.value ? parseInt(e.target.value) : undefined })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">{t('tasks.tags') || 'Tags'}</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter tags separated by commas"
                        value={formData.tags?.join(', ') || ""}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">{t('tasks.remarks') || 'Remarks'}</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Additional remarks or notes"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.isRecurring}
                          onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                        />
                        <label className="form-check-label">
                          {t('tasks.isRecurring') || 'Recurring Task'}
                        </label>
                      </div>
                    </div>

                    {formData.isRecurring && (
                      <div className="col-md-6">
                        <label className="form-label">{t('tasks.recurringPattern') || 'Recurring Pattern'}</label>
                        <select
                          className="form-select"
                          value={formData.recurringPattern}
                          onChange={(e) => setFormData({ ...formData, recurringPattern: e.target.value })}
                        >
                          <option value="">{t('tasks.selectPattern') || 'Select Pattern'}</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    {t('tasks.cancel')}
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editing ? t('tasks.updateTask') : t('tasks.createTask')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Task Modal */}
      {showViewModal && viewingTask && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{viewingTask.taskTitle}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <strong>{t('tasks.priority')}:</strong>
                    <span 
                      className="badge ms-2"
                      style={{
                        backgroundColor: TASK_PRIORITY_CONFIG[viewingTask.priority].bgColor,
                        color: TASK_PRIORITY_CONFIG[viewingTask.priority].color
                      }}
                    >
                      <i className={`fa ${TASK_PRIORITY_CONFIG[viewingTask.priority].icon} me-1`}></i>
                      {TASK_PRIORITY_CONFIG[viewingTask.priority].label}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <strong>{t('tasks.category')}:</strong>
                    <span className="badge bg-secondary ms-2">
                      <i className="fa fa-folder me-1"></i>
                      {viewingTask.category}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <strong>{t('tasks.status')}:</strong>
                    <span 
                      className="badge ms-2"
                      style={{
                        backgroundColor: TASK_STATUS_CONFIG[viewingTask.status].bgColor,
                        color: TASK_STATUS_CONFIG[viewingTask.status].color
                      }}
                    >
                      {TASK_STATUS_CONFIG[viewingTask.status].label}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <strong>{t('tasks.dueDate')}:</strong>
                    <span className="ms-2">
                      {viewingTask.dueDate ? formatDate(viewingTask.dueDate) : t('tasks.noDueDate')}
                    </span>
                  </div>
                  <div className="col-12">
                    <strong>{t('tasks.description')}:</strong>
                    <p className="mt-2">{viewingTask.taskDescription || t('tasks.noDescription')}</p>
                  </div>
                  {viewingTask.taskType && (
                    <div className="col-md-6">
                      <strong>{t('tasks.taskType') || 'Task Type'}:</strong>
                      <span className="badge bg-info text-dark ms-2">
                        {viewingTask.taskType}
                      </span>
                    </div>
                  )}
                  {viewingTask.reminderDate && (
                    <div className="col-md-6">
                      <strong>{t('tasks.reminderDate') || 'Reminder Date'}:</strong>
                      <span className="ms-2">{formatDate(viewingTask.reminderDate)}</span>
                    </div>
                  )}
                  {viewingTask.tags && viewingTask.tags.length > 0 && (
                    <div className="col-12">
                      <strong>{t('tasks.tags') || 'Tags'}:</strong>
                      <div className="mt-2">
                        {viewingTask.tags.map((tag, index) => (
                          <span key={index} className="badge bg-secondary text-white me-2 mb-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewingTask.parentTaskId && (
                    <div className="col-md-6">
                      <strong>{t('tasks.parentTask') || 'Parent Task ID'}:</strong>
                      <span className="ms-2">{viewingTask.parentTaskId}</span>
                    </div>
                  )}
                  {viewingTask.remarks && (
                    <div className="col-12">
                      <strong>{t('tasks.remarks') || 'Remarks'}:</strong>
                      <p className="mt-2">{viewingTask.remarks}</p>
                    </div>
                  )}
                  {viewingTask.isRecurring && (
                    <div className="col-md-6">
                      <strong>{t('tasks.recurringPattern') || 'Recurring Pattern'}:</strong>
                      <span className="ms-2">
                        <span className="badge bg-warning text-dark">
                          <i className="fa fa-repeat me-1"></i>
                          {viewingTask.recurringPattern || 'Yes'}
                        </span>
                      </span>
                    </div>
                  )}
                  <div className="col-md-6">
                    <strong>{t('tasks.created')}:</strong>
                    <span className="ms-2">{formatDate(viewingTask.createdDate)}</span>
                  </div>
                  <div className="col-md-6">
                    <strong>{t('tasks.lastModified')}:</strong>
                    <span className="ms-2">{formatDate(viewingTask.modifiedDate || viewingTask.createdDate)}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  {t('tasks.close')}
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    setShowViewModal(false);
                    handleDuplicateTask(viewingTask);
                  }}
                >
                  <i className="fa fa-copy me-1"></i>
                  {t('tasks.duplicateTask') || 'Duplicate'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowViewModal(false);
                    openEditTaskModal(viewingTask);
                  }}
                >
                  {t('tasks.editTask')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingTask && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t('tasks.confirmDelete')}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>{t('tasks.confirmDeleteMessage')}: "{deletingTask.taskTitle}"?</p>
                <p className="text-muted">{t('tasks.actionCannotBeUndone')}</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  {t('tasks.cancel')}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  {t('tasks.deleteTask')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(showModal || showViewModal || showDeleteModal) && (
        <div className="modal-backdrop show"></div>
      )}
    </div>
  );
};

export default UserTasks;
