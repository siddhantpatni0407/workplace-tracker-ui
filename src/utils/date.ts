// src/utils/date.ts
import { format, parseISO, isValid, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

/**
 * Date utility functions
 */
export class DateUtils {
  /**
   * Format date to display string
   */
  static formatDate(date: string | Date, formatStr: string = 'dd MMM yyyy'): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return 'Invalid Date';
      return format(dateObj, formatStr);
    } catch (error) {
      return 'Invalid Date';
    }
  }

  /**
   * Format date for API (yyyy-MM-dd)
   */
  static formatForApi(date: string | Date): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      return format(dateObj, 'yyyy-MM-dd');
    } catch (error) {
      return '';
    }
  }

  /**
   * Format date for input field
   */
  static formatForInput(date: string | Date): string {
    return this.formatForApi(date);
  }

  /**
   * Get current date in API format
   */
  static getCurrentDate(): string {
    return this.formatForApi(new Date());
  }

  /**
   * Get current year
   */
  static getCurrentYear(): number {
    return new Date().getFullYear();
  }

  /**
   * Get start of current month
   */
  static getStartOfMonth(date?: string | Date): string {
    const dateObj = date ? (typeof date === 'string' ? parseISO(date) : date) : new Date();
    return this.formatForApi(startOfMonth(dateObj));
  }

  /**
   * Get end of current month
   */
  static getEndOfMonth(date?: string | Date): string {
    const dateObj = date ? (typeof date === 'string' ? parseISO(date) : date) : new Date();
    return this.formatForApi(endOfMonth(dateObj));
  }

  /**
   * Add months to date
   */
  static addMonths(date: string | Date, months: number): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return this.formatForApi(addMonths(dateObj, months));
  }

  /**
   * Subtract months from date
   */
  static subtractMonths(date: string | Date, months: number): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return this.formatForApi(subMonths(dateObj, months));
  }

  /**
   * Check if date is today
   */
  static isToday(date: string | Date): boolean {
    const today = this.getCurrentDate();
    const checkDate = this.formatForApi(date);
    return today === checkDate;
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: string | Date): boolean {
    const today = this.getCurrentDate();
    const checkDate = this.formatForApi(date);
    return checkDate < today;
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: string | Date): boolean {
    const today = this.getCurrentDate();
    const checkDate = this.formatForApi(date);
    return checkDate > today;
  }

  /**
   * Get day of week (0 = Sunday, 6 = Saturday)
   */
  static getDayOfWeek(date: string | Date): number {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj.getDay();
  }

  /**
   * Check if date is weekend
   */
  static isWeekend(date: string | Date): boolean {
    const dayOfWeek = this.getDayOfWeek(date);
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  }

  /**
   * Get month name
   */
  static getMonthName(monthNumber: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || '';
  }

  /**
   * Get short month name
   */
  static getShortMonthName(monthNumber: number): string {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNumber - 1] || '';
  }

  /**
   * Calculate age
   */
  static calculateAge(birthDate: string | Date): number {
    const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Get date range for filters
   */
  static getDateRange(period: 'week' | 'month' | 'quarter' | 'year', date?: Date): { start: string; end: string } {
    const baseDate = date || new Date();
    
    switch (period) {
      case 'week':
        const startOfWeek = new Date(baseDate);
        startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return {
          start: this.formatForApi(startOfWeek),
          end: this.formatForApi(endOfWeek)
        };
        
      case 'month':
        return {
          start: this.getStartOfMonth(baseDate),
          end: this.getEndOfMonth(baseDate)
        };
        
      case 'quarter':
        const quarter = Math.floor(baseDate.getMonth() / 3);
        const startOfQuarter = new Date(baseDate.getFullYear(), quarter * 3, 1);
        const endOfQuarter = new Date(baseDate.getFullYear(), quarter * 3 + 3, 0);
        return {
          start: this.formatForApi(startOfQuarter),
          end: this.formatForApi(endOfQuarter)
        };
        
      case 'year':
        const startOfYear = new Date(baseDate.getFullYear(), 0, 1);
        const endOfYear = new Date(baseDate.getFullYear(), 11, 31);
        return {
          start: this.formatForApi(startOfYear),
          end: this.formatForApi(endOfYear)
        };
        
      default:
        return {
          start: this.getCurrentDate(),
          end: this.getCurrentDate()
        };
    }
  }

  /**
   * Parse date from various formats
   */
  static parseDate(dateString: string): Date | null {
    try {
      // Try ISO format first
      let date = parseISO(dateString);
      if (isValid(date)) return date;

      // Try other common formats - for now just try standard Date constructor
      try {
        date = new Date(dateString);
        if (isValid(date)) return date;
      } catch {
        // Ignore
      }

      return null;
    } catch {
      return null;
    }
  }
}