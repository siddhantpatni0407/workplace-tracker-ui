import { taskService } from './taskService';
import { noteService } from './noteService';
import holidayService from './holidayService';
import { officeVisitService } from './officeVisitService';
import { leaveService } from './leaveService';
import { ApiStatus } from '../enums/ApiEnums';
import { ApiResponse } from '../models/Api';
import { TaskStatus } from '../enums/TaskEnums';
import { NoteSortBy, NoteSortOrder } from '../enums/NoteEnums';
import { DashboardData } from '../models/Dashboard';

export interface DashboardStats {
  tasksCompleted: number;
  totalTasks: number;
  taskCompletionPercentage: number;
  pendingTasks: number;
  leaveBalance: {
    totalLeave: number;
    usedLeave: number;
    availableLeave: number;
    utilizationPercentage: number;
  };
  officeVisits: {
    totalVisits: number;
    currentMonthVisits: number;
    attendancePercentage: number;
    lastVisitDate?: string;
  };
  notes: {
    totalNotes: number;
    recentNotes: any[];
  };
  holidays: any[];
  recentActivity: any[];
}

class DashboardService {
  // Get comprehensive dashboard data
  async getDashboardData(userId: number): Promise<ApiResponse<DashboardStats>> {
    try {
      // Fetch all data in parallel
      const [
        tasksResponse,
        leaveBalanceResponse,
        officeVisitsResponse,
        notesResponse,
        holidaysResponse,
        recentNotesResponse,
      ] = await Promise.allSettled([
        taskService.getTasksByUser(userId, {
          limit: 100,
        }),
        leaveService.getLeaveBalanceSummary(),
        officeVisitService.getVisitsSummary(userId),
        noteService.getNotesByUser(userId, { limit: 10 }),
        holidayService.getHolidays(),
        noteService.getNotesByUser(userId, {
          limit: 5,
          sortBy: NoteSortBy.MODIFIED_DATE,
          sortOrder: NoteSortOrder.DESC,
        }),
      ]);

      // Process tasks data
      let tasksCompleted = 0;
      let totalTasks = 0;
      let pendingTasks = 0;

      if (
        tasksResponse.status === 'fulfilled' &&
        tasksResponse.value.status === ApiStatus.SUCCESS
      ) {
        const tasks = tasksResponse.value.data || [];
        totalTasks = tasks.length;
        tasksCompleted = tasks.filter((task: any) => task.status === TaskStatus.COMPLETED).length;
        pendingTasks = tasks.filter(
          (task: any) =>
            task.status === TaskStatus.NOT_STARTED || task.status === TaskStatus.IN_PROGRESS
        ).length;
      }

      const taskCompletionPercentage =
        totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

      // Process leave balance data
      let leaveBalance = {
        totalLeave: 0,
        usedLeave: 0,
        availableLeave: 0,
        utilizationPercentage: 0,
      };

      if (
        leaveBalanceResponse.status === 'fulfilled' &&
        leaveBalanceResponse.value.status === ApiStatus.SUCCESS
      ) {
        leaveBalance = leaveBalanceResponse.value.data || {
          totalLeave: 0,
          usedLeave: 0,
          availableLeave: 0,
          utilizationPercentage: 0,
        };
      }

      // Process office visits data
      let officeVisits = {
        totalVisits: 0,
        currentMonthVisits: 0,
        attendancePercentage: 0,
      };

      if (
        officeVisitsResponse.status === 'fulfilled' &&
        officeVisitsResponse.value.status === ApiStatus.SUCCESS
      ) {
        officeVisits = officeVisitsResponse.value.data || officeVisits;
      }

      // Process notes data
      let notesCount = 0;
      let recentNotes: any[] = [];

      if (
        notesResponse.status === 'fulfilled' &&
        notesResponse.value.status === ApiStatus.SUCCESS
      ) {
        const allNotes = notesResponse.value.data || [];
        notesCount = allNotes.length;
      }

      if (
        recentNotesResponse.status === 'fulfilled' &&
        recentNotesResponse.value.status === ApiStatus.SUCCESS
      ) {
        recentNotes = recentNotesResponse.value.data || [];
      }

      // Process holidays data
      let holidays: any[] = [];
      if (holidaysResponse.status === 'fulfilled') {
        // holidayService.getHolidays() returns HolidayDTO[] directly
        const holidayData = holidaysResponse.value;
        if (Array.isArray(holidayData)) {
          holidays = holidayData;
        }
      }

      // Filter upcoming holidays
      const today = new Date();
      const upcomingHolidays = holidays
        .filter((holiday: any) => new Date(holiday.date) >= today)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

      // Create recent activity from multiple sources
      const recentActivity = this.createRecentActivity(
        tasksResponse.status === 'fulfilled' ? tasksResponse.value.data || [] : [],
        officeVisitsResponse.status === 'fulfilled' ? officeVisitsResponse.value.data : null,
        recentNotes
      );

      const dashboardData: DashboardStats = {
        tasksCompleted,
        totalTasks,
        taskCompletionPercentage,
        pendingTasks,
        leaveBalance,
        officeVisits,
        notes: {
          totalNotes: notesCount,
          recentNotes,
        },
        holidays: upcomingHolidays,
        recentActivity,
      };

      return {
        status: ApiStatus.SUCCESS,
        data: dashboardData,
        message: 'Dashboard data fetched successfully',
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        status: ApiStatus.ERROR,
        data: {
          tasksCompleted: 0,
          totalTasks: 0,
          taskCompletionPercentage: 0,
          pendingTasks: 0,
          leaveBalance: {
            totalLeave: 0,
            usedLeave: 0,
            availableLeave: 0,
            utilizationPercentage: 0,
          },
          officeVisits: {
            totalVisits: 0,
            currentMonthVisits: 0,
            attendancePercentage: 0,
          },
          notes: {
            totalNotes: 0,
            recentNotes: [],
          },
          holidays: [],
          recentActivity: [],
        },
        message: 'Failed to fetch dashboard data',
      };
    }
  }

  // Create recent activity timeline
  private createRecentActivity(tasks: any[], officeVisits: any, notes: any[]): any[] {
    const activities: any[] = [];

    // Add recent task activities
    if (Array.isArray(tasks)) {
      tasks
        .filter((task: any) => task.status === TaskStatus.COMPLETED)
        .slice(0, 3)
        .forEach((task: any) => {
          activities.push({
            type: 'task',
            title: `Task completed: ${task.title}`,
            time: this.getRelativeTime(task.updatedAt || task.createdAt),
            icon: 'bi-check-circle',
            color: 'bg-success',
          });
        });
    }

    // Add office visit activity
    if (officeVisits && officeVisits.lastVisitDate) {
      activities.push({
        type: 'visit',
        title: 'Office visit logged',
        time: this.getRelativeTime(officeVisits.lastVisitDate),
        icon: 'bi-building',
        color: 'bg-primary',
      });
    }

    // Add recent note activities
    if (Array.isArray(notes)) {
      notes.slice(0, 2).forEach((note: any) => {
        activities.push({
          type: 'note',
          title: `Note updated: ${note.title || 'Untitled'}`,
          time: this.getRelativeTime(note.updatedAt || note.createdAt),
          icon: 'bi-journal-text',
          color: 'bg-info',
        });
      });
    }

    // Sort by time and return latest 5
    return activities
      .sort((a, b) => {
        // This is a simple sort, you might want to implement proper date sorting
        return b.time.localeCompare(a.time);
      })
      .slice(0, 5);
  }

  // Helper to get relative time
  private getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
