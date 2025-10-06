import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import Header from '../../common/header/Header';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { dailyTaskService, dateUtils, DailyTaskApiResponse } from '../../../services/dailyTaskService';
import './daily-task-updates.css';
import { 
  DailyTask, 
  DailyTaskFormData, 
  DailyTaskFilters, 
  DailyTaskSort,
  DateSelection,
  DailyTaskComponentState,
  ModalState
} from '../../../models/DailyTask';
import { 
  DailyTaskStatus, 
  DailyTaskPriority, 
  DailyTaskType, 
  DailyTaskSortDirection,
  DAILY_TASK_MONTH_CONFIG 
} from '../../../enums/DailyTaskEnums';
import { 
  DAILY_TASK_DEFAULTS,
  DATE_CONFIG,
  VALIDATION_RULES,
  UI_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '../../../constants/dailyTaskConstants';

// Utility function to format date to DD-MM-YYYY
const formatDateToDDMMYYYY = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Utility function to transform API response to component DailyTask interface
const transformApiToTask = (apiTask: DailyTaskApiResponse): DailyTask => {
  return {
    id: apiTask.dailyTaskId.toString(),
    date: apiTask.dailyTaskDate,
    day: dateUtils.getDayName(apiTask.dailyTaskDate),
    taskNumber: apiTask.taskNumber,
    projectCode: apiTask.projectCode || '',
    projectName: apiTask.projectName || '',
    storyTaskBugNumber: apiTask.storyTaskBugNumber || '',
    taskDetails: apiTask.taskDetails || '',
    remarks: apiTask.remarks || '',
    status: DAILY_TASK_DEFAULTS.STATUS, // API doesn't provide status, use default
    priority: DAILY_TASK_DEFAULTS.PRIORITY, // API doesn't provide priority, use default
    type: DAILY_TASK_DEFAULTS.TYPE, // API doesn't provide type, use default
    userId: apiTask.userId,
    createdAt: new Date(apiTask.createdDate),
    updatedAt: new Date(apiTask.modifiedDate)
  };
};

// Form validation function
const validateFormData = (data: DailyTaskFormData, isEditing = false): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required fields according to API documentation
  if (!data.date) {
    errors.push('Date is required');
  }
  
  // Optional field validations with backend constraints
  if (data.projectCode && data.projectCode.length > 50) {
    errors.push('Project code cannot exceed 50 characters');
  }
  
  if (data.projectName && data.projectName.length > 100) {
    errors.push('Project name cannot exceed 100 characters');
  }
  
  if (data.storyTaskBugNumber && data.storyTaskBugNumber.length > 50) {
    errors.push('Story/Task/Bug number cannot exceed 50 characters');
  }
  
  if (data.taskDetails && data.taskDetails.length > 1000) {
    errors.push('Task details cannot exceed 1000 characters');
  }
  
  if (data.remarks && data.remarks.length > 500) {
    errors.push('Remarks cannot exceed 500 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const DailyTaskUpdates: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = ((user as any)?.userId ?? (user as any)?.id) as number | undefined;

  // Date filters using constants
  const today = new Date();
  const [year, setYear] = useState<number>(DATE_CONFIG.DEFAULT_YEAR);
  const [month, setMonth] = useState<number>(DATE_CONFIG.DEFAULT_MONTH);
  
  // Table data and states
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Bulk operations
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [sortField, setSortField] = useState<keyof DailyTask>('date');
  const [sortDirection, setSortDirection] = useState<DailyTaskSortDirection>(UI_CONFIG.TABLE.DEFAULT_SORT_DIRECTION as DailyTaskSortDirection);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [formData, setFormData] = useState<DailyTaskFormData>({
    date: new Date().toISOString().split('T')[0],
    taskNumber: '', // Keep for display, but won't be sent to API for create
    projectCode: '',
    projectName: '',
    storyTaskBugNumber: '',
    taskDetails: '',
    remarks: '',
    status: DAILY_TASK_DEFAULTS.STATUS,
    priority: DAILY_TASK_DEFAULTS.PRIORITY,
    type: DAILY_TASK_DEFAULTS.TYPE
  });

  // Delete confirmation
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DailyTask | null>(null);
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);

  // Refs
  const formFirstRef = useRef<HTMLInputElement | null>(null);

  // Generate years for dropdown using constants
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: DATE_CONFIG.YEAR_RANGE.PAST_YEARS + DATE_CONFIG.YEAR_RANGE.FUTURE_YEARS + 1 }, 
      (_, i) => currentYear - DATE_CONFIG.YEAR_RANGE.PAST_YEARS + i);
  }, []);

  // Generate months for dropdown using constants
  const months = useMemo(() => DAILY_TASK_MONTH_CONFIG, []);



  // Load tasks for selected month/year
  const loadTasks = useCallback(async (selectedYear = year, selectedMonth = month) => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Get date range for the selected month/year
      const { startDate, endDate } = dateUtils.getMonthDateRange(selectedYear, selectedMonth);
      
      // Call API to get tasks by date range
      const response = await dailyTaskService.getTasksByDateRange(userId, startDate, endDate);
      
      if (response.status === 'SUCCESS' && response.data) {
        // Transform API response to component DailyTask format
        const transformedTasks = response.data.map(transformApiToTask);
        setTasks(transformedTasks);
      } else {
        console.warn('No tasks found for the selected period');
        setTasks([]);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error(ERROR_MESSAGES.API.UNKNOWN);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, year, month]);

  // Load tasks when component mounts or filters change
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = tasks.filter(task => 
        task.taskNumber.toLowerCase().includes(query) ||
        task.projectCode.toLowerCase().includes(query) ||
        task.projectName.toLowerCase().includes(query) ||
        (task.storyTaskBugNumber && task.storyTaskBugNumber.toLowerCase().includes(query)) ||
        task.taskDetails.toLowerCase().includes(query) ||
        (task.remarks && task.remarks.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === DailyTaskSortDirection.ASC ? -1 : 1;
      if (bValue == null) return sortDirection === DailyTaskSortDirection.ASC ? 1 : -1;
      
      if (aValue < bValue) return sortDirection === DailyTaskSortDirection.ASC ? -1 : 1;
      if (aValue > bValue) return sortDirection === DailyTaskSortDirection.ASC ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [tasks, searchQuery, sortField, sortDirection]);

  // Group tasks by date for better display
  const groupedTasks = useMemo(() => {
    const groups: { [date: string]: DailyTask[] } = {};
    
    filteredAndSortedTasks.forEach(task => {
      if (!groups[task.date]) {
        groups[task.date] = [];
      }
      groups[task.date].push(task);
    });
    
    return Object.entries(groups)
      .sort(([dateA], [dateB]) => sortDirection === DailyTaskSortDirection.DESC ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB))
      .map(([date, tasks]) => ({ date, tasks }));
  }, [filteredAndSortedTasks, sortDirection]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle year/month filter changes
  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    loadTasks(newYear, month);
  };

  const handleMonthChange = (newMonth: number) => {
    setMonth(newMonth);
    loadTasks(year, newMonth);
  };

  // Handle sorting
  const handleSort = (field: keyof DailyTask) => {
    if (sortField === field) {
      setSortDirection(sortDirection === DailyTaskSortDirection.ASC ? DailyTaskSortDirection.DESC : DailyTaskSortDirection.ASC);
    } else {
      setSortField(field);
      setSortDirection(DailyTaskSortDirection.ASC);
    }
  };

  // Bulk selection functions
  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      setShowBulkActions(newSet.size > 0);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allTaskIds = filteredAndSortedTasks.map(task => task.id);
    const allSelected = allTaskIds.every(id => selectedTasks.has(id));
    
    if (allSelected) {
      setSelectedTasks(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedTasks(new Set(allTaskIds));
      setShowBulkActions(true);
    }
  };

  const clearSelection = () => {
    setSelectedTasks(new Set());
    setShowBulkActions(false);
  };

  // Bulk operations
  const handleBulkDelete = () => {
    if (selectedTasks.size === 0) return;
    setConfirmBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      // Get selected task IDs and convert to numbers for API call
      const taskIds = Array.from(selectedTasks).map(id => parseInt(id));
      
      // Delete tasks individually since there's no bulk delete API
      const deletePromises = taskIds.map(async (taskId) => {
        try {
          await dailyTaskService.deleteTask(taskId);
          return { success: true, taskId };
        } catch (error) {
          console.error(`Failed to delete task ${taskId}:`, error);
          return { success: false, taskId, error };
        }
      });

      const results = await Promise.all(deletePromises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        // Remove successfully deleted tasks from local state
        const successfulIds = successful.map(r => r.taskId.toString());
        setTasks(prev => prev.filter(task => !successfulIds.includes(task.id)));
        
        if (failed.length === 0) {
          toast.success(`Successfully deleted ${successful.length} task(s)`);
        } else {
          toast.success(`Deleted ${successful.length} task(s), ${failed.length} failed`);
          toast.error(`Failed to delete ${failed.length} task(s)`);
        }
      } else {
        toast.error('Failed to delete all selected tasks');
      }

      clearSelection();
      setConfirmBulkDeleteOpen(false);
    } catch (error) {
      console.error('Error during bulk delete:', error);
      toast.error('An error occurred while deleting tasks');
      setConfirmBulkDeleteOpen(false);
    }
  };

  const handleBulkEdit = () => {
    setBulkEditMode(true);
    setShowModal(true);
  };

  const handleBulkUpdate = async (updates: Partial<DailyTaskFormData>) => {
    if (selectedTasks.size === 0 || !userId) return;

    try {
      // Update tasks individually since there's no bulk update API
      const updatePromises = Array.from(selectedTasks).map(async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return { success: false, taskId, error: 'Task not found' };

        try {
          const updateData = {
            userId,
            dailyTaskDate: updates.date || task.date,
            projectCode: updates.projectCode || task.projectCode || undefined,
            projectName: updates.projectName || task.projectName || undefined,
            storyTaskBugNumber: updates.storyTaskBugNumber || task.storyTaskBugNumber || undefined,
            taskDetails: updates.taskDetails || task.taskDetails || undefined,
            remarks: updates.remarks || task.remarks || undefined
          };

          const response = await dailyTaskService.updateTask(parseInt(taskId), updateData);
          
          if (response.status === 'SUCCESS' && response.data) {
            return { 
              success: true, 
              taskId, 
              updatedTask: transformApiToTask(response.data) 
            };
          } else {
            return { success: false, taskId, error: response.message || 'Update failed' };
          }
        } catch (error) {
          console.error(`Failed to update task ${taskId}:`, error);
          return { 
            success: false, 
            taskId, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      });

      const results = await Promise.all(updatePromises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        // Update local state with successfully updated tasks
        setTasks(prev => prev.map(task => {
          const successResult = successful.find(r => r.taskId === task.id);
          return (successResult && 'updatedTask' in successResult && successResult.updatedTask) ? successResult.updatedTask : task;
        }));

        if (failed.length === 0) {
          toast.success(`Successfully updated ${successful.length} task(s)`);
        } else {
          toast.success(`Updated ${successful.length} task(s), ${failed.length} failed`);
          toast.error(`Failed to update ${failed.length} task(s)`);
        }
      } else {
        toast.error('Failed to update all selected tasks');
      }
      
      clearSelection();
      setBulkEditMode(false);
      setShowModal(false);
    } catch (error) {
      console.error('Error during bulk update:', error);
      toast.error('An error occurred while updating tasks');
      setBulkEditMode(false);
      setShowModal(false);
    }
  };

  // Export functionality
  const handleExportTasks = (exportType: 'current' | 'year' | 'all' = 'current') => {
    let tasksToExport = [];
    let filename = '';

    switch (exportType) {
      case 'current':
        tasksToExport = filteredAndSortedTasks;
        filename = `daily-tasks-${year}-${month.toString().padStart(2, '0')}.csv`;
        break;
      case 'year':
        tasksToExport = tasks.filter((task: DailyTask) => {
          const taskDate = new Date(task.date);
          return taskDate.getFullYear() === year;
        });
        filename = `daily-tasks-${year}.csv`;
        break;
      case 'all':
        tasksToExport = tasks;
        filename = `daily-tasks-all.csv`;
        break;
    }

    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Day,Task Number,Project Code,Project Name,Story/Task/Bug Number,Task Details,Remarks\n" +
      tasksToExport.map((task: DailyTask) => 
        `"${formatDateToDDMMYYYY(task.date)}","${task.day}","${task.taskNumber}","${task.projectCode}","${task.projectName}","${task.storyTaskBugNumber}","${task.taskDetails}","${task.remarks}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    const exportTypeText = exportType === 'current' ? `current month (${tasksToExport.length} tasks)` :
                          exportType === 'year' ? `year ${year} (${tasksToExport.length} tasks)` :
                          `all tasks (${tasksToExport.length} tasks)`;
    toast.success(`Tasks exported successfully - ${exportTypeText}`);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'a':
            e.preventDefault();
            handleSelectAll();
            break;
          case 'n':
            e.preventDefault();
            openAddModal();
            break;
          case 'e':
            if (selectedTasks.size > 0) {
              e.preventDefault();
              handleBulkEdit();
            }
            break;
          case 'Delete':
          case 'Backspace':
            if (selectedTasks.size > 0) {
              e.preventDefault();
              handleBulkDelete();
            }
            break;
        }
      } else if (e.key === 'Escape') {
        if (showModal) {
          closeModal();
        } else if (selectedTasks.size > 0) {
          clearSelection();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedTasks, showModal]);

  // Task statistics
  const taskStats = useMemo(() => {
    const stats = {
      total: filteredAndSortedTasks.length,
      completed: filteredAndSortedTasks.filter(task => task.remarks && task.remarks.toLowerCase().includes('completed')).length,
      pending: 0,
      byProject: {} as { [key: string]: number },
      byDay: {} as { [key: string]: number },
      totalDays: new Set(filteredAndSortedTasks.map(task => task.date)).size
    };

    stats.pending = stats.total - stats.completed;

    filteredAndSortedTasks.forEach(task => {
      stats.byProject[task.projectCode] = (stats.byProject[task.projectCode] || 0) + 1;
      stats.byDay[task.day] = (stats.byDay[task.day] || 0) + 1;
    });

    return stats;
  }, [filteredAndSortedTasks]);

  // Handle add/edit task
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('User ID is required');
      return;
    }

    // Validate form data
    const validation = validateFormData(formData, !!editingTask);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setIsLoading(true);

    try {
      if (bulkEditMode) {
        // Handle bulk update
        const updates: Partial<DailyTaskFormData> = {};
        Object.entries(formData).forEach(([key, value]) => {
          if (value.trim() !== '') {
            updates[key as keyof DailyTaskFormData] = value;
          }
        });
        await handleBulkUpdate(updates);
      } else if (editingTask) {
        // Update existing task via API
        const updateData = {
          userId,
          dailyTaskDate: formData.date,
          projectCode: formData.projectCode || undefined,
          projectName: formData.projectName || undefined,
          storyTaskBugNumber: formData.storyTaskBugNumber || undefined,
          taskDetails: formData.taskDetails || undefined,
          remarks: formData.remarks || undefined
        };

        const response = await dailyTaskService.updateTask(parseInt(editingTask.id), updateData);
        
        if (response.status === 'SUCCESS' && response.data) {
          // Update local state with the response data
          const updatedTask = transformApiToTask(response.data);
          setTasks(prev => prev.map(task => 
            task.id === editingTask.id ? updatedTask : task
          ));
          toast.success(SUCCESS_MESSAGES.TASK_UPDATED);
          closeModal();
        }
      } else {
        // Create new task via API
        const createData = {
          userId,
          dailyTaskDate: formData.date,
          projectCode: formData.projectCode || undefined,
          projectName: formData.projectName || undefined,
          storyTaskBugNumber: formData.storyTaskBugNumber || undefined,
          taskDetails: formData.taskDetails || undefined,
          remarks: formData.remarks || undefined
        };

        const response = await dailyTaskService.createTask(createData);
        
        if (response.status === 'SUCCESS' && response.data) {
          // Add new task to local state
          const newTask = transformApiToTask(response.data);
          setTasks(prev => [...prev, newTask]);
          toast.success(SUCCESS_MESSAGES.TASK_CREATED);
          closeModal();
        }
      }
    } catch (error) {
      console.error('Error saving task:', error);
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.API.UNKNOWN;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete task
  const handleDeleteTask = async () => {
    if (!deleteTarget) return;

    try {
      // Call API to delete the task
      await dailyTaskService.deleteTask(parseInt(deleteTarget.id));
      
      // Remove from local state
      setTasks(prev => prev.filter(task => task.id !== deleteTarget.id));
      toast.success(SUCCESS_MESSAGES.TASK_DELETED);
      setConfirmDeleteOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      toast.error(errorMessage);
    }
  };

  // Open modal for adding new task
  const openAddModal = () => {
    setEditingTask(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      taskNumber: '',
      projectCode: '',
      projectName: '',
      storyTaskBugNumber: '',
      taskDetails: '',
      remarks: ''
    });
    setShowModal(true);
    setTimeout(() => formFirstRef.current?.focus(), 100);
  };

  // Open modal for editing task
  const openEditModal = (task: DailyTask) => {
    setEditingTask(task);
    setFormData({
      date: task.date,
      taskNumber: task.taskNumber,
      projectCode: task.projectCode,
      projectName: task.projectName,
      storyTaskBugNumber: task.storyTaskBugNumber,
      taskDetails: task.taskDetails,
      remarks: task.remarks
    });
    setShowModal(true);
    setTimeout(() => formFirstRef.current?.focus(), 100);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setBulkEditMode(false);
  };

  // Open delete confirmation
  const openDeleteConfirm = (task: DailyTask) => {
    setDeleteTarget(task);
    setConfirmDeleteOpen(true);
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="daily-task-updates">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-task-updates">
      {/* Header */}
      <Header
        title="Daily Task Updates"
        subtitle="Manage and track your daily task progress"
      />

      {/* Filters Section */}
      {showFilters && (
        <div className="container-fluid">
          <div className="filters-section">
            <div className="row align-items-end">
              <div className="col-md-3">
                <label htmlFor="yearSelect" className="form-label fw-semibold">
                  <i className="bi bi-calendar3 me-2"></i>
                  Year
                </label>
                <select
                  id="yearSelect"
                  className="form-select"
                  value={year}
                  onChange={(e) => handleYearChange(parseInt(e.target.value))}
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label htmlFor="monthSelect" className="form-label fw-semibold">
                  <i className="bi bi-calendar-month me-2"></i>
                  Month
                </label>
                <select
                  id="monthSelect"
                  className="form-select"
                  value={month}
                  onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="searchInput" className="form-label fw-semibold">
                  <i className="bi bi-search me-2"></i>
                  Search Tasks
                </label>
                <input
                  type="text"
                  id="searchInput"
                  className="form-control"
                  placeholder="Search by task number, project, or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container-fluid">
        {/* Action Buttons Section */}
        <div className="container-fluid mb-3" style={{position: 'relative', zIndex: 1050}}>
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-end gap-2" style={{position: 'relative', zIndex: 1055}}>
                <button
                  className={`btn btn-filter-toggle ${showFilters ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setShowFilters(!showFilters)}
                  title={showFilters ? 'Hide Filters' : 'Show Filters'}
                >
                  <i className={`bi ${showFilters ? 'bi-funnel-fill' : 'bi-funnel'} me-2`}></i>
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                <div className="dropdown" style={{position: 'relative', zIndex: 1055}}>
                  <button
                    className="btn btn-outline-primary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    disabled={isLoading}
                  >
                    <i className="bi bi-download me-2"></i>
                    Export CSV
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" style={{zIndex: 1060}}>
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={() => handleExportTasks('current')}
                        disabled={filteredAndSortedTasks.length === 0}
                      >
                        <i className="bi bi-calendar-month me-2"></i>
                        Current Month ({filteredAndSortedTasks.length} tasks)
                      </button>
                    </li>
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={() => handleExportTasks('year')}
                      >
                        <i className="bi bi-calendar-year me-2"></i>
                        Complete Year {year}
                      </button>
                    </li>
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={() => handleExportTasks('all')}
                      >
                        <i className="bi bi-database me-2"></i>
                        All Tasks
                      </button>
                    </li>
                  </ul>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={openAddModal}
                  disabled={isLoading}
                  title="Add new task"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add New Task
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="table-section">
          <div className="table-header">
            <h5 className="mb-0">
              <i className="bi bi-table me-2"></i>
              Daily Tasks ({filteredAndSortedTasks.length})
              {selectedTasks.size > 0 && (
                <span className="ms-2 badge bg-primary">
                  {selectedTasks.size} selected
                </span>
              )}
            </h5>
          </div>

          {/* Bulk Actions Toolbar */}
          {showBulkActions && (
            <div className="bulk-actions-toolbar">
              <div className="bulk-actions-content">
                <div className="bulk-actions-info">
                  <i className="bi bi-check-square me-2"></i>
                  <strong>{selectedTasks.size}</strong> task(s) selected
                </div>
                <div className="bulk-actions-buttons">
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={handleBulkEdit}
                    title="Bulk Edit Selected Tasks"
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Bulk Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger me-2"
                    onClick={handleBulkDelete}
                    title="Delete Selected Tasks"
                  >
                    <i className="bi bi-trash me-1"></i>
                    Delete Selected
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={clearSelection}
                    title="Clear Selection"
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {filteredAndSortedTasks.length === 0 ? (
            <div className="empty-state">
              <div className="text-center py-5">
                <i className="bi bi-clipboard-x display-1 text-muted"></i>
                <h4 className="mt-3">No tasks found</h4>
                <p className="text-muted mb-4">
                  {searchQuery ? 'No tasks match your search criteria.' : 'No tasks have been added for the selected month.'}
                </p>
                <button
                  className="btn btn-primary"
                  onClick={openAddModal}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Your First Task
                </button>
              </div>
            </div>
          ) : (
            <div className="table-responsive shadow-sm">
              <table className="table table-striped table-hover table-bordered mb-0">
                <thead className="table-dark sticky-top">
                  <tr>
                    <th scope="col" className="text-center" style={{width: '50px'}}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={filteredAndSortedTasks.length > 0 && filteredAndSortedTasks.every(task => selectedTasks.has(task.id))}
                        onChange={handleSelectAll}
                        title="Select All Tasks"
                      />
                    </th>
                    <th scope="col" className="sortable text-nowrap" onClick={() => handleSort('date')} style={{cursor: 'pointer'}}>
                      <i className="bi bi-calendar-event me-2"></i>
                      Date
                      <i className={`bi ${sortField === 'date' ? (sortDirection === DailyTaskSortDirection.ASC ? 'bi-sort-up' : 'bi-sort-down') : 'bi-arrow-down-up'} ms-1`}></i>
                    </th>
                    <th scope="col" className="text-center">
                      <i className="bi bi-calendar-day me-2"></i>
                      Day
                    </th>
                    <th scope="col" className="sortable text-nowrap" onClick={() => handleSort('taskNumber')} style={{cursor: 'pointer'}}>
                      <i className="bi bi-hash me-2"></i>
                      Task Number
                      <i className={`bi ${sortField === 'taskNumber' ? (sortDirection === DailyTaskSortDirection.ASC ? 'bi-sort-up' : 'bi-sort-down') : 'bi-arrow-down-up'} ms-1`}></i>
                    </th>
                    <th scope="col" className="sortable text-nowrap" onClick={() => handleSort('projectCode')} style={{cursor: 'pointer'}}>
                      <i className="bi bi-folder me-2"></i>
                      Project Code
                      <i className={`bi ${sortField === 'projectCode' ? (sortDirection === DailyTaskSortDirection.ASC ? 'bi-sort-up' : 'bi-sort-down') : 'bi-arrow-down-up'} ms-1`}></i>
                    </th>
                    <th scope="col" className="sortable" onClick={() => handleSort('projectName')} style={{cursor: 'pointer'}}>
                      <i className="bi bi-briefcase me-2"></i>
                      Project Name
                      <i className={`bi ${sortField === 'projectName' ? (sortDirection === DailyTaskSortDirection.ASC ? 'bi-sort-up' : 'bi-sort-down') : 'bi-arrow-down-up'} ms-1`}></i>
                    </th>
                    <th scope="col" className="text-center">
                      <i className="bi bi-ticket-detailed me-2"></i>
                      Story/Task/Bug #
                    </th>
                    <th scope="col">
                      <i className="bi bi-list-task me-2"></i>
                      Task Details
                    </th>
                    <th scope="col">
                      <i className="bi bi-chat-square-text me-2"></i>
                      Remarks
                    </th>
                    <th scope="col" className="text-center" style={{width: '120px'}}>
                      <i className="bi bi-gear me-2"></i>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedTasks.map((group, groupIndex) => (
                    group.tasks.map((task, taskIndex) => (
                      <tr key={task.id} className={`align-middle ${selectedTasks.has(task.id) ? 'table-active' : ''}`}>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedTasks.has(task.id)}
                            onChange={() => handleSelectTask(task.id)}
                          />
                        </td>
                        <td className="text-nowrap">
                          {taskIndex === 0 ? (
                            <div className="d-flex align-items-center">
                              <span className="fw-bold text-primary">{formatDateToDDMMYYYY(task.date)}</span>
                              {group.tasks.length > 1 && (
                                <span className="badge bg-info ms-2">
                                  {group.tasks.length} tasks
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-center">
                              <span className="text-muted fs-4">″</span>
                            </div>
                          )}
                        </td>
                        <td className="text-center">
                          {taskIndex === 0 ? (
                            <span className="badge bg-secondary">{task.day}</span>
                          ) : (
                            <span className="text-muted fs-4">″</span>
                          )}
                        </td>
                        <td className="text-center">
                          <span className="badge bg-primary fs-6">{task.taskNumber}</span>
                        </td>
                        <td className="text-center">
                          <span className="fw-bold text-primary">{task.projectCode}</span>
                        </td>
                        <td>
                          <span className="text-dark">{task.projectName}</span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-info text-dark">{task.storyTaskBugNumber}</span>
                        </td>
                        <td>
                          <div className="text-truncate" style={{maxWidth: '300px'}} title={task.taskDetails}>
                            {task.taskDetails}
                          </div>
                        </td>
                        <td>
                          <div className="text-truncate" style={{maxWidth: '200px'}} title={task.remarks || 'No remarks'}>
                            {task.remarks || <span className="text-muted fst-italic">No remarks</span>}
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm" role="group" aria-label="Task actions">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => openEditModal(task)}
                              title="Edit Task"
                              type="button"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => openDeleteConfirm(task)}
                              title="Delete Task"
                              type="button"
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="modal-title">
                <i className={`bi ${bulkEditMode ? 'bi-pencil-square' : editingTask ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
                {bulkEditMode ? `Bulk Edit ${selectedTasks.size} Task(s)` : editingTask ? 'Edit Task' : 'Add New Task'}
              </h4>
              <button className="btn-close" onClick={closeModal}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <form onSubmit={handleSaveTask}>
              <div className="modal-body">
                {bulkEditMode && (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Bulk Edit Mode:</strong> Only fill in the fields you want to update for all selected tasks. Empty fields will remain unchanged.
                  </div>
                )}
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="date" className="form-label">
                        <i className="bi bi-calendar-event me-2"></i>
                        Date {!bulkEditMode && '*'}
                      </label>
                      <input
                        ref={formFirstRef}
                        type="date"
                        id="date"
                        name="date"
                        className="form-control"
                        value={formData.date}
                        onChange={handleInputChange}
                        required={!bulkEditMode}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="taskNumber" className="form-label">
                        <i className="bi bi-hash me-2"></i>
                        Task Number {editingTask ? '' : '(Generated automatically)'}
                      </label>
                      <input
                        type="text"
                        id="taskNumber"
                        name="taskNumber"
                        className="form-control"
                        value={formData.taskNumber || (editingTask ? '' : 'Auto-generated on save')}
                        onChange={handleInputChange}
                        placeholder={editingTask ? "e.g., TSK-001" : "Auto-generated on save"}
                        readOnly={!editingTask}
                        disabled={!editingTask && !bulkEditMode}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="projectCode" className="form-label">
                        <i className="bi bi-code-square me-2"></i>
                        Project Code {!bulkEditMode && '*'}
                      </label>
                      <input
                        type="text"
                        id="projectCode"
                        name="projectCode"
                        className="form-control"
                        value={formData.projectCode}
                        onChange={handleInputChange}
                        placeholder="e.g., WPT"
                        required={!bulkEditMode}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="projectName" className="form-label">
                        <i className="bi bi-briefcase me-2"></i>
                        Project Name {!bulkEditMode && '*'}
                      </label>
                      <input
                        type="text"
                        id="projectName"
                        name="projectName"
                        className="form-control"
                        value={formData.projectName}
                        onChange={handleInputChange}
                        placeholder="e.g., Workplace Tracker"
                        required={!bulkEditMode}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="storyTaskBugNumber" className="form-label">
                    <i className="bi bi-ticket-detailed me-2"></i>
                    Story/Task/Bug Number {!bulkEditMode && '*'}
                  </label>
                  <input
                    type="text"
                    id="storyTaskBugNumber"
                    name="storyTaskBugNumber"
                    className="form-control"
                    value={formData.storyTaskBugNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., WPT-123"
                    required={!bulkEditMode}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="taskDetails" className="form-label">
                    <i className="bi bi-clipboard-data me-2"></i>
                    Task Details {!bulkEditMode && '*'}
                  </label>
                  <textarea
                    id="taskDetails"
                    name="taskDetails"
                    className="form-control"
                    value={formData.taskDetails}
                    onChange={handleInputChange}
                    placeholder="Describe the task details..."
                    rows={3}
                    required={!bulkEditMode}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="remarks" className="form-label">
                    <i className="bi bi-chat-text me-2"></i>
                    Remarks
                  </label>
                  <textarea
                    id="remarks"
                    name="remarks"
                    className="form-control"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    placeholder="Add any additional remarks..."
                    rows={2}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      {bulkEditMode ? 'Updating...' : editingTask ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      {bulkEditMode ? `Update ${selectedTasks.size} Task(s)` : editingTask ? 'Update Task' : 'Add Task'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteOpen && deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-container modal-sm">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                Confirm Delete
              </h5>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this task?</p>
              <div className="task-preview">
                <strong>Task:</strong> {deleteTarget.taskNumber}<br />
                <strong>Project:</strong> {deleteTarget.projectName}<br />
                <strong>Date:</strong> {deleteTarget.date}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setConfirmDeleteOpen(false);
                  setDeleteTarget(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteTask}
              >
                <i className="bi bi-trash me-2"></i>
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {confirmBulkDeleteOpen && (
        <div className="modal-overlay">
          <div className="modal-container modal-sm">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                Confirm Bulk Delete
              </h5>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the selected tasks?</p>
              <div className="alert alert-warning">
                <i className="bi bi-info-circle me-2"></i>
                This action will permanently delete <strong>{selectedTasks.size}</strong> task(s) and cannot be undone.
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmBulkDeleteOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmBulkDelete}
              >
                <i className="bi bi-trash me-2"></i>
                Delete {selectedTasks.size} Task(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTaskUpdates;