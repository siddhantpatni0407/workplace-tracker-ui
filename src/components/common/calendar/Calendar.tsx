import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { DateUtils } from '../../../utils/date';
import {
  ActivityType,
  FilterStatus,
  QuickStatIcon,
  DashboardCardCategory
} from '../../../enums/DashboardEnums';
import {
  VisitType,
  VisitTypeLabels,
  DayOfWeek
} from '../../../enums/OfficeVisitEnums';
import {
  UserRole,
  DateFormat,
  WeekStartDay
} from '../../../enums/UserEnums';
import {
  COLORS,
  ANIMATION,
  Z_INDEX
} from '../../../constants';
import { OfficeVisit, DailyView } from '../../../models/OfficeVisit';
import { Holiday } from '../../../models/Holiday';
import { Leave } from '../../../models/Leave';
import { Task } from '../../../models/Task';
import {
  CalendarEvent,
  CalendarEventType,
  EventFilterType,
  CalendarProps,
  CalendarDayData,
  CalendarViewType
} from '../../../models/Calendar';
import './calendar.css';

// Re-export Calendar types for convenience
export type {
  CalendarEvent,
  CalendarEventType,
  EventFilterType,
  CalendarProps,
  CalendarDayData,
  CalendarViewType
} from '../../../models/Calendar';

export const Calendar: React.FC<CalendarProps> = ({
  events = [],
  onDateClick,
  onEventClick,
  className = '',
  showMonthYearFilters = true
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewFilter, setViewFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [showPopupModal, setShowPopupModal] = useState(false);
  const [customDropdownOpen, setCustomDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.custom-dropdown')) {
        setCustomDropdownOpen(false);
      }
    };

    if (customDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [customDropdownOpen]);

  // Helper functions to identify WFH and WFO events
  const isWFHEvent = (event: CalendarEvent) => {
    if (event.type !== ActivityType.OFFICE_VISIT && event.type !== 'visit') return false;

    // Check visitType first if available
    if (event.visitType === VisitType.WFH) return true;

    const title = event.title?.toLowerCase() || '';
    const description = event.description?.toLowerCase() || '';

    // Check for specific WFH indicators
    return title.includes('wfh') || title.includes('work from home') ||
      description.includes('wfh') || description.includes('work from home') ||
      (title.includes('home') && !title.includes('office')) ||
      (description.includes('home') && !description.includes('office'));
  };

  const isWFOEvent = (event: CalendarEvent) => {
    if (event.type !== ActivityType.OFFICE_VISIT && event.type !== 'visit') return false;

    // Check visitType first if available
    if (event.visitType === VisitType.WFO) return true;

    const title = event.title?.toLowerCase() || '';
    const description = event.description?.toLowerCase() || '';

    // Check for specific WFO indicators
    const hasWFOIndicators = title.includes('wfo') || title.includes('office visit') || title.includes('office') ||
      description.includes('wfo') || description.includes('office visit') || description.includes('office');

    // Check if it's NOT a WFH event
    const hasWFHIndicators = title.includes('wfh') || title.includes('work from home') ||
      description.includes('wfh') || description.includes('work from home') ||
      (title.includes('home') && !title.includes('office')) ||
      (description.includes('home') && !description.includes('office'));

    // It's WFO if it has WFO indicators and doesn't have WFH indicators
    return hasWFOIndicators && !hasWFHIndicators;
  };

  // Filter events based on selected filter using proper enums
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Apply type filter
    if (viewFilter !== 'all') {
      filtered = filtered.filter(event => {
        if (viewFilter === 'wfh') {
          return isWFHEvent(event);
        } else if (viewFilter === 'wfo') {
          return isWFOEvent(event);
        }

        // Convert event type to string for comparison
        const eventTypeStr = String(event.type);
        const filterStr = String(viewFilter);

        // Handle ActivityType enum mappings
        switch (viewFilter) {
          case ActivityType.OFFICE_VISIT:
          case 'visit':
            return eventTypeStr === ActivityType.OFFICE_VISIT || eventTypeStr === 'visit';
          case ActivityType.HOLIDAY:
          case 'holiday':
            return eventTypeStr === ActivityType.HOLIDAY || eventTypeStr === 'holiday';
          case ActivityType.LEAVE:
          case 'leave':
            return eventTypeStr === ActivityType.LEAVE || eventTypeStr === 'leave';
          case ActivityType.TASK:
          case 'task':
            return eventTypeStr === ActivityType.TASK || eventTypeStr === 'task';
          case ActivityType.NOTE:
          case 'note':
            return eventTypeStr === ActivityType.NOTE || eventTypeStr === 'note';
          default:
            return eventTypeStr === filterStr;
        }
      });
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(event => {
        const eventStatus = event.status?.toLowerCase() || '';
        return eventStatus === statusFilter.toLowerCase();
      });
    }

    return filtered;
  }, [events, viewFilter, statusFilter]);

  // Get calendar data using proper CalendarDayData type
  const calendarData: CalendarDayData[] = useMemo(() => {
    if (calendarView === 'week') {
      // Week view: show 7 days starting from the selected date's week
      const startOfWeek = new Date(selectedDate || currentDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Go to Sunday

      const days: CalendarDayData[] = [];
      const current = new Date(startOfWeek);

      // Generate 7 days for the week
      for (let i = 0; i < 7; i++) {
        const dayEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.toDateString() === current.toDateString();
        });

        days.push({
          date: new Date(current),
          isCurrentMonth: true, // In week view, all days are considered current
          isToday: current.toDateString() === new Date().toDateString(),
          isWeekend: current.getDay() === 0 || current.getDay() === 6,
          events: dayEvents,
          isSelected: selectedDate?.toDateString() === current.toDateString(),
          isDisabled: false
        });

        current.setDate(current.getDate() + 1);
      }

      return days;
    } else {
      // Month view: existing logic
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Get first day of month and calculate starting date
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());

      const days: CalendarDayData[] = [];
      const current = new Date(startDate);

      // Generate 42 days (6 weeks)
      for (let i = 0; i < 42; i++) {
        const dayEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.toDateString() === current.toDateString();
        });

        days.push({
          date: new Date(current),
          isCurrentMonth: current.getMonth() === month,
          isToday: current.toDateString() === new Date().toDateString(),
          isWeekend: current.getDay() === 0 || current.getDay() === 6,
          events: dayEvents,
          isSelected: selectedDate?.toDateString() === current.toDateString(),
          isDisabled: false
        });

        current.setDate(current.getDate() + 1);
      }

      return days;
    }
  }, [currentDate, filteredEvents, selectedDate, calendarView]);

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (calendarView === 'week') {
      // Week navigation: move by 7 days
      setSelectedDate(prev => {
        const newDate = new Date(prev || currentDate);
        if (direction === 'prev') {
          newDate.setDate(newDate.getDate() - 7);
        } else {
          newDate.setDate(newDate.getDate() + 7);
        }
        return newDate;
      });
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        if (direction === 'prev') {
          newDate.setDate(newDate.getDate() - 7);
        } else {
          newDate.setDate(newDate.getDate() + 7);
        }
        return newDate;
      });
    } else {
      // Month navigation: existing logic
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        if (direction === 'prev') {
          newDate.setMonth(prev.getMonth() - 1);
        } else {
          newDate.setMonth(prev.getMonth() + 1);
        }
        return newDate;
      });
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleMonthChange = (month: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(month);
      return newDate;
    });
  };

  const handleYearChange = (year: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
  };

  const handleViewChange = (view: 'month' | 'week') => {
    setCalendarView(view);
    if (view === 'week' && !selectedDate) {
      setSelectedDate(new Date()); // Ensure selectedDate is set for week view
    }
  };

  // Generate year options (current year ± 10 years)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  }, []);

  // Month options
  const monthOptions = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ];

  // Handle popup modal
  const handleViewInPopup = () => {
    setShowPopupModal(true);
  };

  // Handle calendar export
  const handleExportCalendar = () => {
    const exportData = events.map(event => ({
      title: event.title,
      date: event.date,
      type: event.type,
      description: event.description || '',
      status: event.status || ''
    }));

    // Create CSV content
    const csvHeaders = ['Title', 'Date', 'Type', 'Description', 'Status'];
    const csvRows = exportData.map(event => [
      event.title,
      event.date,
      event.type,
      event.description,
      event.status
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calendar-events-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick?.(event);
  };

  // Get event color based on type using theme constants
  const getEventColor = (type: CalendarEventType | 'wfo' | 'wfh'): string => {
    switch (type) {
      case ActivityType.HOLIDAY:
      case 'holiday':
        return COLORS.ERROR[600]; // Red for holidays
      case ActivityType.LEAVE:
      case 'leave':
        return COLORS.PRIMARY[600]; // Purple for leaves
      case ActivityType.OFFICE_VISIT:
      case 'visit':
        return COLORS.SUCCESS[600]; // Default green for office visits
      case ActivityType.TASK:
      case 'task':
        return COLORS.WARNING[600]; // Orange for tasks
      case 'wfo':
        return COLORS.SUCCESS[600]; // Green for Work from Office
      case 'wfh':
        return COLORS.INFO[700]; // Blue for Work from Home
      default:
        return COLORS.NEUTRAL[500]; // Gray for unknown types
    }
  };

  // Enhanced event color function that can handle visit subtypes
  const getEnhancedEventColor = (event: CalendarEvent) => {
    // Handle visit types with enhanced logic
    if (event.type === ActivityType.OFFICE_VISIT || event.type === 'visit') {
      // Check visitType first if available
      if (event.visitType === VisitType.WFH) {
        return COLORS.INFO[700]; // Blue for WFH
      }
      if (event.visitType === VisitType.WFO) {
        return COLORS.SUCCESS[600]; // Green for WFO
      }

      // Fallback to title/description analysis
      const title = event.title?.toLowerCase() || '';
      const description = event.description?.toLowerCase() || '';

      // Check for Work from Home indicators first
      if (title.includes('wfh') || title.includes('work from home') || title.includes('home') ||
        description.includes('wfh') || description.includes('work from home') || description.includes('home')) {
        return COLORS.INFO[700]; // Blue for WFH
      }

      // Check for Work from Office indicators
      if (title.includes('wfo') || title.includes('office visit') || title.includes('office') ||
        description.includes('wfo') || description.includes('office visit') || description.includes('office')) {
        return COLORS.SUCCESS[600]; // Green for WFO
      }

      // Default fallback for visit type events
      return COLORS.SUCCESS[600]; // Default to green for WFO
    }

    return getEventColor(event.type);
  };

  // Get event icon based on type using proper enums
  const getEventIcon = (type: CalendarEventType | 'wfo' | 'wfh'): string => {
    switch (type) {
      case ActivityType.HOLIDAY:
      case 'holiday':
        return QuickStatIcon.CALENDAR_HEART; // 'bi-calendar-heart'
      case ActivityType.LEAVE:
      case 'leave':
        return 'bi-calendar-x';
      case ActivityType.OFFICE_VISIT:
      case 'visit':
        return QuickStatIcon.BUILDING; // 'bi-building'
      case ActivityType.TASK:
      case 'task':
        return QuickStatIcon.CHECK_CIRCLE_FILL; // 'bi-check-circle-fill'
      case 'wfo':
        return QuickStatIcon.BUILDING; // 'bi-building'
      case 'wfh':
        return QuickStatIcon.HOUSE; // 'bi-house'
      default:
        return 'bi-circle-fill';
    }
  };

  // Enhanced event icon function that can handle visit subtypes
  const getEnhancedEventIcon = (event: CalendarEvent) => {
    // Handle visit types with enhanced logic
    if (event.type === ActivityType.OFFICE_VISIT || event.type === 'visit') {
      // Check visitType first if available
      if (event.visitType === VisitType.WFH) {
        return QuickStatIcon.HOUSE; // 'bi-house'
      }
      if (event.visitType === VisitType.WFO) {
        return QuickStatIcon.BUILDING; // 'bi-building'
      }

      // Fallback to title/description analysis
      const title = event.title?.toLowerCase() || '';
      const description = event.description?.toLowerCase() || '';

      // Check for Work from Home indicators first
      if (title.includes('wfh') || title.includes('work from home') || title.includes('home') ||
        description.includes('wfh') || description.includes('work from home') || description.includes('home')) {
        return QuickStatIcon.HOUSE; // 'bi-house'
      }

      // Check for Work from Office indicators
      if (title.includes('wfo') || title.includes('office visit') || title.includes('office') ||
        description.includes('wfo') || description.includes('office visit') || description.includes('office')) {
        return QuickStatIcon.BUILDING; // 'bi-building'
      }

      // Default fallback for visit type events
      return QuickStatIcon.BUILDING; // Default to building for WFO
    }
    return getEventIcon(event.type);
  };

  // Get display title for events (transform long titles to short labels)
  const getEventDisplayTitle = (event: CalendarEvent) => {
    // Handle visit types with enhanced logic
    if (event.type === ActivityType.OFFICE_VISIT || event.type === 'visit') {
      // Check visitType first if available
      if (event.visitType === VisitType.WFH) {
        return VisitTypeLabels[VisitType.WFH].split(' ').map(word => word[0]).join(''); // 'WFH'
      }
      if (event.visitType === VisitType.WFO) {
        return VisitTypeLabels[VisitType.WFO].split(' ').map(word => word[0]).join(''); // 'WFO'
      }

      // Fallback to title/description analysis
      const title = event.title?.toLowerCase() || '';
      const description = event.description?.toLowerCase() || '';

      // Check for Work from Home indicators first
      if (title.includes('wfh') || title.includes('work from home') ||
        description.includes('wfh') || description.includes('work from home') ||
        (title.includes('home') && !title.includes('office')) ||
        (description.includes('home') && !description.includes('office'))) {
        return 'WFH';
      }

      // Check for Work from Office indicators
      if (title.includes('wfo') || title.includes('office visit') || title.includes('office') ||
        description.includes('wfo') || description.includes('office visit') || description.includes('office')) {
        return 'WFO';
      }

      // Default fallback for visit type events
      return 'WFO'; // Default to WFO for office visits
    }

    // Handle leave events - prioritize description/notes over title
    if (event.type === ActivityType.LEAVE || String(event.type) === 'leave') {
      // Check if description contains the specific leave reason/notes
      if (event.description && event.description.trim()) {
        return event.description;
      }
      // Check for notes field (used in UserLeaveDTO)
      if ((event as any).notes && (event as any).notes.trim()) {
        return (event as any).notes;
      }
      // Check for reason field (used in Leave interface)
      if ((event as any).reason && (event as any).reason.trim()) {
        return (event as any).reason;
      }
      // Check if title has specific leave reason (not generic "Personal Leave")
      if (event.title && !event.title.toLowerCase().includes('personal leave')) {
        return event.title;
      }
      // Fallback to title if no description
      return event.title || 'Leave';
    }

    // Return original title for other event types
    return event.title;
  };

  return (
    <div className={`calendar-component ${className}`}>
      {/* Enhanced Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button
            className="nav-btn nav-btn-prev"
            onClick={() => navigateMonth('prev')}
            title="Previous Month"
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          <div className="current-month">
            {showMonthYearFilters && calendarView === 'month' ? (
              <div className="month-year-filters">
                <div className="filter-wrapper">
                  <i className="bi bi-calendar3 filter-icon"></i>
                  <select
                    className="form-select form-select-sm me-2"
                    value={currentDate.getMonth()}
                    onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                  >
                    {monthOptions.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-wrapper">
                  <i className="bi bi-calendar-event filter-icon"></i>
                  <select
                    className="form-select form-select-sm"
                    value={currentDate.getFullYear()}
                    onChange={(e) => handleYearChange(parseInt(e.target.value))}
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="month-year-display">
                <i className="bi bi-calendar3 display-icon"></i>
                <h4 className="month-year">
                  {calendarView === 'week' ?
                    `Week of ${(selectedDate || currentDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}` :
                    currentDate.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })
                  }
                </h4>
              </div>
            )}
          </div>

          <button
            className="nav-btn nav-btn-next"
            onClick={() => navigateMonth('next')}
            title="Next Month"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>

        <div className="calendar-controls">
          <button
            className="control-btn today-btn"
            onClick={goToToday}
            title="Go to Today"
          >
            <i className="bi bi-calendar-today me-1"></i>
            <span>Today</span>
          </button>

          <div className="view-toggle-group" role="group">
            <button
              type="button"
              className={`view-toggle ${calendarView === 'month' ? 'active' : ''}`}
              onClick={() => handleViewChange('month')}
              title="Month View"
            >
              <i className="bi bi-grid-3x3-gap me-1"></i>
              <span>Month</span>
            </button>
            <button
              type="button"
              className={`view-toggle ${calendarView === 'week' ? 'active' : ''}`}
              onClick={() => handleViewChange('week')}
              title="Week View"
            >
              <i className="bi bi-list me-1"></i>
              <span>Week</span>
            </button>
          </div>

          {/* Enhanced Calendar Actions Menu */}
          <div className="custom-dropdown">
            <button
              className="actions-btn"
              type="button"
              onClick={() => setCustomDropdownOpen(!customDropdownOpen)}
              aria-expanded={customDropdownOpen}
              title="Calendar Actions"
            >
              <i className="bi bi-three-dots-vertical"></i>
            </button>
            {customDropdownOpen && (
              <div className="custom-dropdown-menu">
                <button className="custom-dropdown-item" type="button" onClick={() => {
                  handleViewInPopup();
                  setCustomDropdownOpen(false);
                }}>
                  <i className="bi bi-arrows-fullscreen me-2"></i>
                  View in Popup
                </button>
                <button className="custom-dropdown-item" type="button" onClick={() => {
                  handleExportCalendar();
                  setCustomDropdownOpen(false);
                }}>
                  <i className="bi bi-download me-2"></i>
                  Export Calendar
                </button>
                <hr className="custom-dropdown-divider" />
                <button className="custom-dropdown-item" type="button" onClick={() => {
                  setCustomDropdownOpen(false);
                }}>
                  <i className="bi bi-gear me-2"></i>
                  Calendar Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Filter Controls */}
      <div className="calendar-filters">
        <div className="filter-section">
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="eventFilter" className="form-label">
                <i className="bi bi-eye-fill me-1"></i>
                Show Events:
              </label>
              <select
                id="eventFilter"
                className="form-select form-select-sm"
                value={viewFilter}
                onChange={(e) => setViewFilter(e.target.value)}
              >
                <option value="all">🌟 All Events</option>
                <option value="holiday">🎉 Holidays</option>
                <option value="leave">🏖️ Leaves</option>
                <option value="wfh">🏠 Work From Home</option>
                <option value="wfo">🏢 Work From Office</option>
                <option value="task">✅ Tasks</option>
                <option value="note">📝 Notes</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="statusFilter" className="form-label">
                <i className="bi bi-check-circle-fill me-1"></i>
                Status:
              </label>
              <select
                id="statusFilter"
                className="form-select form-select-sm"
                value={statusFilter || 'all'}
                onChange={(e) => setStatusFilter(e.target.value === 'all' ? null : e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="approved">✅ Approved</option>
                <option value="completed">🎯 Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="legend-section">
          <div className="event-legend">
            <div className="legend-item" data-type="holiday">
              <span className="legend-color holiday-color" style={{ backgroundColor: COLORS.ERROR[600] }}></span>
              <span className="legend-label">Holidays</span>
              <span className="legend-count">{filteredEvents.filter(e => {
                if (e.type !== 'holiday') return false;
                const eventDate = new Date(e.date);
                return eventDate.getMonth() === currentDate.getMonth() &&
                  eventDate.getFullYear() === currentDate.getFullYear();
              }).length}</span>
            </div>
            <div className="legend-item" data-type="leave">
              <span className="legend-color leave-color" style={{ backgroundColor: COLORS.PRIMARY[600] }}></span>
              <span className="legend-label">Leaves</span>
              <span className="legend-count">{filteredEvents.filter(e => {
                if (e.type !== 'leave') return false;
                const eventDate = new Date(e.date);
                return eventDate.getMonth() === currentDate.getMonth() &&
                  eventDate.getFullYear() === currentDate.getFullYear();
              }).length}</span>
            </div>
            <div className="legend-item" data-type="wfo">
              <span className="legend-color wfo-color" style={{ backgroundColor: COLORS.SUCCESS[600] }}></span>
              <span className="legend-label">WFO</span>
              <span className="legend-count">{filteredEvents.filter(e => {
                if (e.type !== 'visit' || (e.visitType !== VisitType.WFO && !e.title?.includes('Office'))) return false;
                const eventDate = new Date(e.date);
                return eventDate.getMonth() === currentDate.getMonth() &&
                  eventDate.getFullYear() === currentDate.getFullYear();
              }).length}</span>
            </div>
            <div className="legend-item" data-type="wfh">
              <span className="legend-color wfh-color" style={{ backgroundColor: COLORS.INFO[700] }}></span>
              <span className="legend-label">WFH</span>
              <span className="legend-count">{filteredEvents.filter(e => {
                if (e.type !== 'visit' || (e.visitType !== VisitType.WFH && !e.title?.includes('Home'))) return false;
                const eventDate = new Date(e.date);
                return eventDate.getMonth() === currentDate.getMonth() &&
                  eventDate.getFullYear() === currentDate.getFullYear();
              }).length}</span>
            </div>
            <div className="legend-item" data-type="task">
              <span className="legend-color task-color" style={{ backgroundColor: COLORS.WARNING[600] }}></span>
              <span className="legend-label">Tasks</span>
              <span className="legend-count">{filteredEvents.filter(e => {
                if (e.type !== 'task') return false;
                const eventDate = new Date(e.date);
                return eventDate.getMonth() === currentDate.getMonth() &&
                  eventDate.getFullYear() === currentDate.getFullYear();
              }).length}</span>
            </div>
            <div className="legend-item" data-type="note">
              <span className="legend-color note-color" style={{ backgroundColor: COLORS.SECONDARY[500] }}></span>
              <span className="legend-label">Notes</span>
              <span className="legend-count">{filteredEvents.filter(e => {
                if (e.type !== 'note') return false;
                const eventDate = new Date(e.date);
                return eventDate.getMonth() === currentDate.getMonth() &&
                  eventDate.getFullYear() === currentDate.getFullYear();
              }).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`calendar-grid ${calendarView === 'week' ? 'week-view' : 'month-view'}`}>
        {/* Weekday Headers */}
        <div className="calendar-weekdays">
          {calendarView === 'week' ?
            ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            )) :
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))
          }
        </div>

        {/* Calendar Days */}
        <div className={`calendar-days ${calendarView === 'week' ? 'week-days' : 'month-days'}`}>
          {calendarData.map((day, index) => {
            return (
              <div
                key={index}
                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''
                  } ${day.isToday ? 'today' : ''
                  } ${day.isSelected ? 'selected' : ''
                  } ${day.events.length > 0 ? 'has-events' : ''
                  } ${day.isWeekend ? 'weekend' : ''
                  } ${calendarView === 'week' ? 'week-day' : 'month-day'
                  }`}
                onClick={() => handleDateClick(day.date)}
              >
                <div className="day-number">
                  {day.date.getDate()}
                </div>

                {day.events.length > 0 && (
                  <div className="day-events">
                    {day.events.slice(0, 2).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className="calendar-event"
                        style={{ backgroundColor: getEnhancedEventColor(event) }}
                        onClick={(e) => handleEventClick(event, e)}
                        title={event.title}
                      >
                        <i className={`bi ${getEnhancedEventIcon(event)}`}></i>
                        <span className="event-title">{getEventDisplayTitle(event)}</span>
                      </div>
                    ))}
                    {day.events.length > 2 && (
                      <div className="event-more">
                        +{day.events.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="selected-date-events">
          <h6 className="events-title">
            <i className="bi bi-calendar-event me-2"></i>
            Events for {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h6>

          {filteredEvents.filter(event =>
            new Date(event.date).toDateString() === selectedDate.toDateString()
          ).length === 0 ? (
            <div className="no-events">
              <i className="bi bi-calendar-x me-2"></i>
              No events for this date
            </div>
          ) : (
            <div className="events-list">
              {filteredEvents
                .filter(event =>
                  new Date(event.date).toDateString() === selectedDate.toDateString()
                )
                .map((event, index) => (
                  <div
                    key={index}
                    className="event-item"
                    onClick={() => onEventClick?.(event)}
                  >
                    <div
                      className="event-indicator"
                      style={{ backgroundColor: getEnhancedEventColor(event) }}
                    >
                      <i className={`bi ${getEnhancedEventIcon(event)}`}></i>
                    </div>
                    <div className="event-details">
                      <div className="event-title">{getEventDisplayTitle(event)}</div>
                      <div className="event-meta">
                        <span className="event-type">{event.type}</span>
                        {event.status && (
                          <span className="event-status">{event.status}</span>
                        )}
                      </div>
                      {event.description && (
                        <div className="event-description">{event.description}</div>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}

      {/* Calendar Popup Modal */}
      {showPopupModal && (
        <div className="calendar-modal-overlay">
          <div className="modal fade show calendar-popup-modal" style={{ display: 'block' }} aria-modal="true">
            <div className="modal-dialog modal-xl">
              <div className="modal-content calendar-modal-content">
                <div className="modal-header calendar-modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-calendar3 me-2"></i>
                    Calendar View - {currentDate.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h5>
                  <button
                    type="button"
                    className="btn-close calendar-modal-close"
                    onClick={() => setShowPopupModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body p-0">
                  <div className="calendar-popup-content">
                    {/* Calendar Grid */}
                    <div className="calendar-grid-popup">
                      {/* Weekday Headers */}
                      <div className="calendar-weekdays">
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                          <div key={day} className="weekday-header-popup">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Days */}
                      <div className="calendar-days-popup">
                        {calendarData.map((day, index) => {
                          return (
                            <div
                              key={index}
                              className={`calendar-day-popup ${!day.isCurrentMonth ? 'other-month' : ''
                                } ${day.isToday ? 'today' : ''
                                } ${day.isSelected ? 'selected' : ''
                                } ${day.events.length > 0 ? 'has-events' : ''
                                } ${day.isWeekend ? 'weekend' : ''
                                }`}
                              onClick={() => handleDateClick(day.date)}
                            >
                              <div className="day-number-popup">
                                {day.date.getDate()}
                              </div>

                              {day.events.length > 0 && (
                                <div className="day-events-popup">
                                  {day.events.map((event, eventIndex) => (
                                    <div
                                      key={eventIndex}
                                      className="calendar-event-popup"
                                      style={{ backgroundColor: getEnhancedEventColor(event) }}
                                      onClick={(e) => handleEventClick(event, e)}
                                      title={getEventDisplayTitle(event)}
                                    >
                                      <i className={`bi ${getEnhancedEventIcon(event)}`}></i>
                                      <span className="event-title-popup">{getEventDisplayTitle(event)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer calendar-modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleExportCalendar}
                  >
                    <i className="bi bi-download me-2"></i>
                    Export Calendar
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPopupModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;