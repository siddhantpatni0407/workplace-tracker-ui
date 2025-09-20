import React, { memo, useMemo, useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "../../../hooks/useTranslation";
import { UserRole } from "../../../enums";
import { ErrorBoundary } from "../../ui";
import { Calendar, CalendarEvent } from "../../common/calendar";
import { ROUTES } from "../../../constants";
import { YEAR_FILTER, MONTH_FILTER, STATUS_FILTER } from "../../../constants/ui/filters";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import { 
  DashboardCard, 
  DashboardData, 
  DashboardFilters,
  QuickStatItem 
} from "../../../models/Dashboard";
import { 
  StatColorClass, 
  BgGradientClass
} from "../../../enums/DashboardEnums";
import "./user-dashboard.css";

const UserDashboard: React.FC = memo(() => {
    const { user, isLoading } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentDate] = useState(new Date());
    const userId = ((user as any)?.userId ?? (user as any)?.id) as number | undefined;

    // Real data state using same pattern as existing components
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        holidays: [],
        visits: [],
        leaves: [],
        leaveBalance: [],
        policies: [],
        dailyView: [],
        loading: true,
        lastUpdated: ""
    });

    // Filter states
    const [filters, setFilters] = useState<DashboardFilters>({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        status: ''
    });

    // Quick Access search state
    const [searchTerm, setSearchTerm] = useState('');

    // Real API data loading functions using same pattern as existing components
    const loadHolidays = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.HOLIDAYS.GET_ALL);
            if (!res.ok) throw new Error('Failed to fetch holidays');
            const body = await res.json();
            return body?.data ?? [];
        } catch (err) {
            console.error('loadHolidays', err);
            return [];
        }
    };

    const loadUserLeaves = async () => {
        if (!userId) return [];
        try {
            const res = await fetch(API_ENDPOINTS.USER_LEAVES.GET_BY_USER(userId));
            if (!res.ok) throw new Error('Failed to fetch leaves');
            const body = await res.json();
            return body?.data ?? [];
        } catch (err) {
            console.error('loadUserLeaves', err);
            return [];
        }
    };

    const loadOfficeVisits = async () => {
        if (!userId) return [];
        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth() + 1;
            const url = `${API_ENDPOINTS.VISITS.LIST}?userId=${userId}&year=${year}&month=${month}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch visits');
            const body = await res.json();
            return body?.data ?? [];
        } catch (err) {
            console.error('loadOfficeVisits', err);
            return [];
        }
    };

    const loadLeaveBalance = async () => {
        if (!userId) return [];
        try {
            const policies = await fetch(API_ENDPOINTS.LEAVE_POLICIES.GET_ALL);
            if (!policies.ok) throw new Error('Failed to fetch policies');
            const policiesBody = await policies.json();
            const policiesList = policiesBody?.data ?? [];
            
            console.log('Leave Policies Data:', policiesList); // Debug log to check policy data
            
            const currentYear = new Date().getFullYear();
            const balancePromises = policiesList.map(async (policy: any) => {
                try {
                    const res = await fetch(API_ENDPOINTS.USER_LEAVE_BALANCE.GET(userId, policy.policyId, currentYear));
                    if (!res.ok) {
                        // If no balance data, create default entry with policy info
                        const defaultAllocation = policy.defaultAnnualDays || policy.defaultDays || policy.default_days || policy.defaultAllocation || 1;
                        return {
                            policyId: policy.policyId,
                            policyCode: policy.policyCode,
                            policyName: policy.policyName,
                            policyDescription: policy.description,
                            defaultDays: defaultAllocation,
                            allocatedDays: defaultAllocation,
                            usedDays: 0,
                            remainingDays: defaultAllocation,
                            year: currentYear
                        };
                    }
                    const body = await res.json();
                    const balanceData = body?.data;
                    if (balanceData) {
                        // Combine policy info with balance data
                        return {
                            ...balanceData,
                            policyCode: policy.policyCode,
                            policyName: policy.policyName,
                            policyDescription: policy.description,
                            defaultDays: policy.defaultDays
                        };
                    } else {
                        // If API returns but no data, create default entry
                        const defaultAllocation = policy.defaultAnnualDays || policy.defaultDays || policy.default_days || policy.defaultAllocation || 1;
                        return {
                            policyId: policy.policyId,
                            policyCode: policy.policyCode,
                            policyName: policy.policyName,
                            policyDescription: policy.description,
                            defaultDays: defaultAllocation,
                            allocatedDays: defaultAllocation,
                            usedDays: 0,
                            remainingDays: defaultAllocation,
                            year: currentYear
                        };
                    }
                } catch {
                    // If API call fails, create default entry with policy info
                    const defaultAllocation = policy.defaultAnnualDays || policy.defaultDays || policy.default_days || policy.defaultAllocation || 1;
                    return {
                        policyId: policy.policyId,
                        policyCode: policy.policyCode,
                        policyName: policy.policyName,
                        policyDescription: policy.description,
                        defaultDays: defaultAllocation,
                        allocatedDays: defaultAllocation,
                        usedDays: 0,
                        remainingDays: defaultAllocation,
                        year: currentYear
                    };
                }
            });
            
            const balances = await Promise.all(balancePromises);
            return balances; // Return all policies, don't filter out any
        } catch (err) {
            console.error('loadLeaveBalance', err);
            return [];
        }
    };

    const loadDashboardData = async () => {
        setDashboardData(prev => ({ ...prev, loading: true }));
        
        try {
            const [holidays, visits, leaves, leaveBalance] = await Promise.all([
                loadHolidays(),
                loadOfficeVisits(),
                loadUserLeaves(),
                loadLeaveBalance()
            ]);

            setDashboardData({
                holidays,
                visits,
                leaves,
                leaveBalance,
                policies: [],
                dailyView: [],
                loading: false,
                lastUpdated: new Date().toISOString()
            });
        } catch (err) {
            console.error('loadDashboardData', err);
            setDashboardData(prev => ({ ...prev, loading: false }));
        }
    };

    // Load data on component mount and when userId changes
    useEffect(() => {
        if (userId) {
            loadDashboardData();
        }
    }, [userId]);

    // Quick stats data from real API data
    const quickStats = useMemo(() => {
        if (dashboardData.loading) {
            return [
                {
                    label: "Leave Balance",
                    value: "Loading...",
                    icon: "bi-hourglass-split",
                    colorClass: "stat-loading",
                    bgGradient: "loading-gradient",
                    hasBreakdown: true,
                    breakdown: [
                        { type: "Loading...", remaining: "...", used: "...", allocated: "..." }
                    ]
                },
                {
                    label: "Office Visits",
                    value: "Loading...", 
                    icon: "bi-hourglass-split",
                    colorClass: "stat-loading",
                    bgGradient: "loading-gradient"
                },
                {
                    label: "WFH Days",
                    value: "Loading...",
                    icon: "bi-hourglass-split", 
                    colorClass: "stat-loading",
                    bgGradient: "loading-gradient"
                },
                {
                    label: "Attendance Rate",
                    value: "Loading...",
                    icon: "bi-hourglass-split",
                    colorClass: "stat-loading",
                    bgGradient: "loading-gradient"
                },
                {
                    label: "Total Holidays",
                    value: "Loading...",
                    icon: "bi-hourglass-split",
                    colorClass: "stat-loading",
                    bgGradient: "loading-gradient"
                }
            ];
        }

        // Calculate real stats from API data with filters applied
        const totalLeaveBalance = dashboardData.leaveBalance.reduce((sum: number, balance: any) => {
            // Use remainingDays if available, otherwise calculate allocatedDays - usedDays
            const remaining = balance?.remainingDays ?? ((balance?.allocatedDays || 0) - (balance?.usedDays || 0));
            return sum + remaining;
        }, 0);

        // Filter visits based on selected month/year
        const filteredVisits = dashboardData.visits.filter((visit: any) => {
            const visitDate = new Date(visit.visitDate);
            const matchesMonth = !filters.month || visitDate.getMonth() + 1 === filters.month;
            const matchesYear = !filters.year || visitDate.getFullYear() === filters.year;
            const matchesStatus = !filters.status || visit.visitType === filters.status;
            return matchesMonth && matchesYear && matchesStatus;
        });

        const officeVisits = filteredVisits.filter((visit: any) => visit.visitType === 'WFO').length;
        const wfhDays = filteredVisits.filter((visit: any) => visit.visitType === 'WFH').length;
        
        // Total holidays count (all holidays like Holiday Tracker, not filtered by year)
        const totalHolidays = dashboardData.holidays.length;

        // Calculate attendance rate for current month
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        const workingDaysInMonth = 22;
        
        const currentMonthOfficeVisits = dashboardData.visits.filter((visit: any) => {
            const visitDate = new Date(visit.visitDate);
            const isCurrentMonth = visitDate.getMonth() + 1 === currentMonth && 
                                   visitDate.getFullYear() === currentYear;
            const isOfficeVisit = visit.visitType === 'WFO';
            return isCurrentMonth && isOfficeVisit;
        }).length;
        
        const attendanceRate = Math.round((currentMonthOfficeVisits / workingDaysInMonth) * 100);

        return [
            {
                label: "Leave Balance", 
                value: `${totalLeaveBalance}`,
                unit: "days",
                icon: "bi-calendar-check",
                colorClass: StatColorClass.LEAVE,
                bgGradient: BgGradientClass.LEAVE,
                valueColor: "#28a745"
            },
            {
                label: "Office Visits",
                value: officeVisits.toString(),
                unit: "visits",
                icon: "bi-building",
                colorClass: StatColorClass.OFFICE,
                bgGradient: BgGradientClass.OFFICE,
                valueColor: "#007bff"
            },
            {
                label: "WFH Days",
                value: wfhDays.toString(),
                unit: "days",
                icon: "bi-house",
                colorClass: StatColorClass.WFH,
                bgGradient: BgGradientClass.WFH,
                valueColor: "#6f42c1"
            },
            {
                label: "Attendance Rate",
                value: `${attendanceRate}`,
                unit: "%",
                icon: "bi-graph-up-arrow",
                colorClass: StatColorClass.OFFICE,
                bgGradient: BgGradientClass.OFFICE,
                valueColor: "#20c997"
            },
            {
                label: "Total Holidays",
                value: totalHolidays.toString(),
                unit: "holidays",
                icon: "bi-calendar-heart",
                colorClass: StatColorClass.HOLIDAYS,
                bgGradient: BgGradientClass.HOLIDAYS,
                valueColor: "#fd7e14"
            }
        ];
    }, [dashboardData, filters]);

    // Leave Policy Breakdown data
    const leaveBreakdownData = useMemo(() => {
        if (dashboardData.loading) {
            return [
                { type: "Loading...", code: "", remaining: 0, used: 0, allocated: 0, description: "" }
            ];
        }

        return dashboardData.leaveBalance.map((balance: any) => {
            // Create user-friendly policy name
            let displayName = balance?.policyName || '';
            
            // If no policy name, create one from policy code
            if (!displayName && balance?.policyCode) {
                const code = balance.policyCode.toUpperCase();
                switch (code) {
                    case 'ANNUAL':
                        displayName = 'Annual Leave';
                        break;
                    case 'CASUAL':
                        displayName = 'Casual Leave';
                        break;
                    case 'SICK':
                        displayName = 'Sick Leave';
                        break;
                    case 'SPECIAL':
                        displayName = 'Special Leave';
                        break;
                    case 'MATERNITY':
                        displayName = 'Maternity Leave';
                        break;
                    case 'PATERNITY':
                        displayName = 'Paternity Leave';
                        break;
                    case 'COMP':
                    case 'COMPENSATORY':
                        displayName = 'Compensatory Leave';
                        break;
                    case 'PERSONAL':
                        displayName = 'Personal Leave';
                        break;
                    default:
                        displayName = `${code} Leave`;
                }
            }
            
            // Final fallback
            if (!displayName) {
                displayName = 'Leave Policy';
            }
            
            return {
                type: displayName,
                code: balance?.policyCode || '',
                remaining: balance?.remainingDays ?? ((balance?.allocatedDays || balance?.defaultDays || balance?.defaultAnnualDays || 1) - (balance?.usedDays || 0)),
                used: balance?.usedDays || 0,
                allocated: balance?.allocatedDays || balance?.defaultDays || balance?.defaultAnnualDays || 1,
                description: balance?.policyDescription || ''
            };
        });
    }, [dashboardData]);

    // Real-time analytics data from API
    const analyticsData = useMemo(() => {
        if (dashboardData.loading) {
            return [
                {
                    title: "Office Attendance",
                    description: "Track your office visits and work patterns",
                    value: "Loading...",
                    icon: "bi-hourglass-split"
                },
                {
                    title: "Task Completion", 
                    description: "Your productivity and task management",
                    value: "Loading...",
                    icon: "bi-hourglass-split"
                },
                {
                    title: "Leave Applications",
                    description: "Your leave requests and approvals", 
                    value: "Loading...",
                    icon: "bi-hourglass-split"
                }
            ];
        }

        // Calculate analytics from real API data
        const currentDate = new Date();
        const workingDaysInMonth = 22; // Approximate working days in a month
        
        // Filter visits for current month and only count WFO (Work From Office) for office attendance
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        const currentMonthVisits = dashboardData.visits.filter((visit: any) => {
            const visitDate = new Date(visit.visitDate);
            const isCurrentMonth = visitDate.getMonth() + 1 === currentMonth && 
                                   visitDate.getFullYear() === currentYear;
            const isOfficeVisit = visit.visitType === 'WFO'; // Only count Work From Office visits
            return isCurrentMonth && isOfficeVisit;
        }).length;
        
        const attendancePercentage = Math.round((currentMonthVisits / workingDaysInMonth) * 100);
        
        const leaveApplications = dashboardData.leaves.length;

        return [
            {
                title: "Office Attendance",
                description: "Track your office visits and work patterns",
                value: `${attendancePercentage}% this month`,
                icon: "bi-graph-up-arrow"
            },
            {
                title: "Task Completion",
                description: "Your productivity and task management", 
                value: "Tasks API needed", // Placeholder until tasks API is implemented
                icon: "bi-check-circle-fill"
            },
            {
                title: "Leave Applications",
                description: "Your leave requests and approvals",
                value: `${leaveApplications} applications`,
                icon: "bi-calendar-check"
            }
        ];
    }, [dashboardData]);

    // Real-time recent activity from API data
    const recentActivity = useMemo(() => {
        if (dashboardData.loading) {
            return [
                {
                    id: 1,
                    type: 'loading',
                    title: 'Loading recent activities...',
                    time: 'Loading...',
                    icon: 'bi-hourglass-split'
                }
            ];
        }

        // Generate recent activity from actual API data
        const activities: any[] = [];

        // Add recent leaves
        dashboardData.leaves
            .filter((leave: any) => leave.appliedDate)
            .slice(0, 3)
            .forEach((leave: any, index: number) => {
                const appliedDate = new Date(leave.appliedDate);
                const now = new Date();
                const diffTime = now.getTime() - appliedDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let timeText = '';
                if (diffDays === 0) timeText = 'Today';
                else if (diffDays === 1) timeText = '1 day ago';
                else if (diffDays < 7) timeText = `${diffDays} days ago`;
                else timeText = `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`;

                activities.push({
                    id: `leave-${index}`,
                    type: 'leave',
                    title: `Applied for ${leave.leaveType || 'Annual'} Leave (${leave.leaveReason || 'Personal'})`,
                    time: timeText,
                    icon: 'bi-calendar-check'
                });
            });

        // Add recent office visits
        dashboardData.visits
            .slice(0, 2)
            .forEach((visit: any, index: number) => {
                const visitDate = new Date(visit.visitDate);
                const now = new Date();
                const diffTime = now.getTime() - visitDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let timeText = '';
                if (diffDays === 0) timeText = 'Today';
                else if (diffDays === 1) timeText = '1 day ago';
                else if (diffDays < 7) timeText = `${diffDays} days ago`;
                else timeText = `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`;

                activities.push({
                    id: `visit-${index}`,
                    type: 'office_visit',
                    title: `${visit.visitType === 'WFO' ? 'Checked in to office (WFO)' : 'Working from home (WFH)'}`,
                    time: timeText,
                    icon: visit.visitType === 'WFO' ? 'bi-building' : 'bi-house'
                });
            });

        // Sort by most recent and take top 4
        activities.sort((a, b) => {
            const timeA = a.time.includes('day') ? parseInt(a.time) : (a.time.includes('week') ? parseInt(a.time) * 7 : 0);
            const timeB = b.time.includes('day') ? parseInt(b.time) : (b.time.includes('week') ? parseInt(b.time) * 7 : 0);
            return timeA - timeB;
        });

        return activities.slice(0, 4);
    }, [dashboardData]);

    // Real-time upcoming holidays from API data
    const upcomingHolidays = useMemo(() => {
        if (dashboardData.loading) {
            return [
                {
                    day: '--',
                    month: '---',
                    title: 'Loading holidays...',
                    type: 'loading',
                    date: ''
                }
            ];
        }

        // Filter and format upcoming holidays from real API data
        const today = new Date();
        return dashboardData.holidays
            .filter((holiday: any) => new Date(holiday.holidayDate) >= today)
            .sort((a: any, b: any) => new Date(a.holidayDate).getTime() - new Date(b.holidayDate).getTime())
            .slice(0, 3)
            .map((holiday: any) => {
                const date = new Date(holiday.holidayDate);
                return {
                    day: date.getDate().toString().padStart(2, '0'),
                    month: date.toLocaleDateString('en-US', { month: 'short' }),
                    title: holiday.holidayName || holiday.name,
                    type: holiday.holidayType || 'mandatory',
                    date: holiday.holidayDate
                };
            });
    }, [dashboardData]);

    // Calendar events for the Calendar component
    const calendarEvents = useMemo((): CalendarEvent[] => {
        if (dashboardData.loading) return [];

        const events: CalendarEvent[] = [];

        // Add holidays
        dashboardData.holidays.forEach((holiday: any) => {
            events.push({
                id: `holiday-${holiday.id || holiday.holidayId}`,
                title: holiday.holidayName || holiday.name,
                date: holiday.holidayDate,
                type: 'holiday',
                description: `${holiday.holidayType || 'Holiday'} - ${holiday.description || ''}`
            });
        });

        // Add leaves
        dashboardData.leaves.forEach((leave: any) => {
            const startDate = new Date(leave.startDate);
            const endDate = new Date(leave.endDate);
            
            // Add event for each day of the leave
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                events.push({
                    id: `leave-${leave.id || leave.leaveId}-${d.toISOString().split('T')[0]}`,
                    title: `${leave.leaveType || 'Personal'} Leave`,
                    date: d.toISOString().split('T')[0],
                    type: 'leave',
                    status: leave.status,
                    description: leave.notes || leave.reason || leave.description || 'Leave application'
                });
            }
        });

        // Add office visits
        dashboardData.visits.forEach((visit: any) => {
            events.push({
                id: `visit-${visit.id || visit.visitId}`,
                title: visit.visitType === 'WFO' ? 'Office Visit' : 'Work From Home',
                date: visit.visitDate,
                type: 'visit',
                status: visit.status,
                description: `${visit.visitType} - ${visit.description || 'Office visit record'}`
            });
        });

        return events;
    }, [dashboardData]);

    // Calendar event handlers
    const handleDateClick = useCallback((date: Date) => {
        console.log('Date clicked:', date);
        // You can add navigation or modal opening logic here
    }, []);

    const handleEventClick = useCallback((event: CalendarEvent) => {
        console.log('Event clicked:', event);
        // You can add navigation based on event type
        switch (event.type) {
            case 'holiday':
                navigate(ROUTES.USER.HOLIDAY_TRACKER);
                break;
            case 'leave':
                navigate(ROUTES.USER.LEAVE_MANAGEMENT);
                break;
            case 'visit':
                navigate(ROUTES.USER.OFFICE_VISIT);
                break;
            default:
                break;
        }
    }, [navigate]);

    // Filter handlers
    const handleFilterChange = (filterType: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: filterType === 'month' || filterType === 'year' ? parseInt(value) || 0 : value
        }));
    };

    const applyFilters = () => {
        // Filters are automatically applied through useMemo dependencies
        // This function can be used for additional actions like analytics
        console.log('Filters applied:', filters);
    };

    // Calculate notification badges for quick access items
    const getNotificationCount = useCallback((cardId: string): number => {
        if (dashboardData.loading) return 0;
        
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        
        switch (cardId) {
            case 'leave-management':
                // Count pending leave applications
                return dashboardData.leaves.filter((leave: any) => 
                    leave.status === 'PENDING' || leave.status === 'pending'
                ).length;
                
            case 'office-visit':
                // Count this month's office visits
                return dashboardData.visits.filter((visit: any) => {
                    const visitDate = new Date(visit.visitDate);
                    return visitDate.getFullYear() === currentYear && 
                           visitDate.getMonth() + 1 === currentMonth;
                }).length;
                
            case 'holidays':
                // Count upcoming holidays in next 30 days
                const next30Days = new Date();
                next30Days.setDate(today.getDate() + 30);
                return dashboardData.holidays.filter((holiday: any) => {
                    const holidayDate = new Date(holiday.holidayDate);
                    return holidayDate >= today && holidayDate <= next30Days;
                }).length;
                
            case 'tasks':
                // This would show pending tasks when tasks API is available
                return 0; // Placeholder
                
            case 'my-notes':
                // This would show recent notes count
                return 0; // Placeholder
                
            default:
                return 0;
        }
    }, [dashboardData]);

    // Memoize dashboard cards configuration
    const cards = useMemo<DashboardCard[]>(() => [
        {
            id: "profile",
            title: t('dashboard.userDashboard.cards.profile.title'),
            subtitle: t('dashboard.userDashboard.cards.profile.subtitle'),
            icon: "bi-person-badge-fill",
            colorClass: "card-primary",
            route: ROUTES.USER.PROFILE
        },
        {
            id: "settings",
            title: t('dashboard.userDashboard.cards.settings.title'),
            subtitle: t('dashboard.userDashboard.cards.settings.subtitle'),
            icon: "bi-sliders2-vertical",
            colorClass: "card-info",
            route: ROUTES.USER.SETTINGS
        },
        {
            id: "tasks",
            title: t('dashboard.userDashboard.cards.tasks.title'),
            subtitle: t('dashboard.userDashboard.cards.tasks.subtitle'),
            icon: "bi-list-task",
            colorClass: "card-secondary",
            route: ROUTES.USER.USER_TASKS
        },
        {
            id: "office-visit",
            title: t('dashboard.userDashboard.cards.officeVisit.title'),
            subtitle: t('dashboard.userDashboard.cards.officeVisit.subtitle'),
            icon: "bi-building",
            colorClass: "card-warning",
            route: ROUTES.USER.OFFICE_VISIT
        },
        {
            id: "office-visit-analytics",
            title: t('dashboard.userDashboard.cards.officeVisitAnalytics.title'),
            subtitle: t('dashboard.userDashboard.cards.officeVisitAnalytics.subtitle'),
            icon: "bi-graph-up",
            colorClass: "card-success",
            route: ROUTES.USER.OFFICE_VISIT_ANALYTICS
        },
        {
            id: "leave-management",
            title: t('dashboard.userDashboard.cards.leaveManagement.title'),
            subtitle: t('dashboard.userDashboard.cards.leaveManagement.subtitle'),
            icon: "bi-calendar-check",
            colorClass: "card-warning",
            route: ROUTES.USER.LEAVE_MANAGEMENT
        },
        {
            id: "leave-policy",
            title: t('dashboard.userDashboard.cards.leavePolicy.title'),
            subtitle: t('dashboard.userDashboard.cards.leavePolicy.subtitle'),
            icon: "bi-file-earmark-text-fill",
            colorClass: "card-dark",
            route: ROUTES.USER.LEAVE_POLICY
        },
        {
            id: "holidays",
            title: t('dashboard.userDashboard.cards.holidays.title'),
            subtitle: t('dashboard.userDashboard.cards.holidays.subtitle'),
            icon: "bi-sun-fill",
            colorClass: "card-light",
            route: ROUTES.USER.HOLIDAY_TRACKER
        },
        {
            id: "my-notes",
            title: t('dashboard.userDashboard.cards.notes.title'),
            subtitle: t('dashboard.userDashboard.cards.notes.subtitle'),
            icon: "bi-journal-text",
            colorClass: "card-primary",
            route: ROUTES.USER.USER_NOTES
        }
    ], [t]);

    // Memoize user display name
    const userDisplayName = useMemo(() => {
        return user?.name ? `, ${user.name}` : "";
    }, [user?.name]);

    // Handle card navigation with useCallback
    const handleCardClick = useCallback((route: string) => {
        navigate(route);
    }, [navigate]);

    // Check if user has access to specific features
    const hasAccess = useCallback((card: DashboardCard) => {
        if (!card.roles || card.roles.length === 0) return true;
        return card.roles.includes(user?.role as UserRole);
    }, [user?.role]);

    // Filter cards based on user permissions and search
    const visibleCards = useMemo(() => {
        let filteredCards = cards.filter(hasAccess);
        
        // Apply search filter
        if (searchTerm.trim()) {
            filteredCards = filteredCards.filter(card => 
                card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                card.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return filteredCards;
    }, [cards, hasAccess, searchTerm]);

    if (isLoading || dashboardData.loading) {
        return (
            <div className="user-dashboard container-fluid py-4">
                <div className="d-flex justify-content-center align-items-center" style={{minHeight: '50vh'}}>
                    <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Loading dashboard data...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (dashboardData.error) {
        return (
            <div className="user-dashboard container-fluid py-4">
                <div className="alert alert-warning text-center">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Unable to load dashboard data. Please refresh the page.
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="user-dashboard">
                <div className="dashboard-layout">
                    {/* Left Sidebar */}
                    <div className="left-sidebar">
                        <div className="sidebar-header">
                            <h6 className="sidebar-title">
                                <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                                Quick Access
                            </h6>
                        </div>

                        {/* Search Controls */}
                        <div className="sidebar-controls">
                            <div className="search-box mb-3">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text">
                                        <i className="bi bi-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search quick access..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            type="button"
                                            onClick={() => setSearchTerm('')}
                                        >
                                            <i className="bi bi-x"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="sidebar-menu">
                            {visibleCards.length === 0 ? (
                                <div className="text-center text-muted py-3">
                                    <i className="bi bi-search me-2"></i>
                                    No items found
                                </div>
                            ) : (
                                visibleCards.map((card, index) => (
                                    <div 
                                        key={card.id} 
                                        className={`sidebar-menu-item ${card.colorClass}`}
                                        onClick={() => handleCardClick(card.route)}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="right"
                                        title={card.subtitle}
                                    >
                                        <div className="menu-item-icon">
                                            <i className={`bi ${card.icon}`}></i>
                                        </div>
                                        <div className="menu-item-content">
                                            <div className="menu-item-header">
                                                <span className="menu-item-title">
                                                    {card.title}
                                                </span>
                                            </div>
                                            <span className="menu-item-subtitle">{card.subtitle}</span>
                                        </div>
                                        <div className="menu-item-arrow">
                                            <i className="bi bi-chevron-right"></i>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Sidebar Footer */}
                        <div className="sidebar-footer">
                            <div className="user-info" onClick={() => navigate(ROUTES.USER.PROFILE)}>
                                <div className="user-avatar">
                                    <i className="bi bi-person-circle"></i>
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{user?.name || 'User'}</span>
                                    <span className="user-role">{user?.role || 'Employee'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="main-content">
                        {/* Filters Section */}
                        <div className="filters-section mb-4">
                            <div className="row g-3 align-items-center">
                                <div className="col-md-3">
                                    <label htmlFor="monthFilter" className="form-label">Month</label>
                                    <select 
                                        className="form-select" 
                                        id="monthFilter"
                                        value={filters.month || ''}
                                        onChange={(e) => handleFilterChange('month', e.target.value)}
                                    >
                                        <option value="">All Months</option>
                                        <option value="1">January</option>
                                        <option value="2">February</option>
                                        <option value="3">March</option>
                                        <option value="4">April</option>
                                        <option value="5">May</option>
                                        <option value="6">June</option>
                                        <option value="7">July</option>
                                        <option value="8">August</option>
                                        <option value="9">September</option>
                                        <option value="10">October</option>
                                        <option value="11">November</option>
                                        <option value="12">December</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="yearFilter" className="form-label">Year</label>
                                    <select 
                                        className="form-select" 
                                        id="yearFilter"
                                        value={filters.year}
                                        onChange={(e) => handleFilterChange('year', e.target.value)}
                                    >
                                        {YEAR_FILTER.AVAILABLE_YEARS.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="statusFilter" className="form-label">Status</label>
                                    <select 
                                        className="form-select" 
                                        id="statusFilter"
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        <option value="WFO">Work From Office</option>
                                        <option value="WFH">Work From Home</option>
                                        <option value="HOLIDAY">Holiday</option>
                                        <option value="LEAVE">On Leave</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <button className="btn btn-primary mt-4" onClick={applyFilters}>
                                        <i className="bi bi-funnel me-2"></i>Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Section */}
                        <div className="quick-stats-section">
                            <div className="stats-header">
                                <div className="stats-title-container">
                                    <h4 className="stats-title">
                                        <i className="bi bi-speedometer2 me-2"></i>
                                        Quick Analytics
                                    </h4>
                                    <p className="stats-subtitle">Real-time insights into your work patterns and performance</p>
                                </div>
                                <div className="stats-header-decoration">
                                    <div className="decoration-line"></div>
                                    <div className="decoration-dot"></div>
                                </div>
                            </div>
                            
                            <div className="row g-3">
                                {quickStats.map((stat, index) => (
                                    <div key={index} className="col-xl-2 col-lg-4 col-md-6">
                                        <div className={`quick-stat-card ${stat.colorClass} ${(stat as any).bgGradient || ''}`}>
                                            <div className="stat-content">
                                                <div className="stat-header">
                                                    <i className={stat.icon}></i>
                                                    <span className="stat-label">{stat.label}</span>
                                                </div>
                                                <div className="stat-value-container">
                                                    <span className="stat-value" style={{ color: (stat as any).valueColor || 'inherit' }}>{stat.value}</span>
                                                    {(stat as any).unit && <span className="stat-unit">{(stat as any).unit}</span>}
                                                </div>
                                            </div>
                                            <div className="stat-animation"></div>
                                            <div className="stat-hover-effect"></div>
                                        </div>
                                    </div>
                                ))}

                                {/* Leave Policy Breakdown Card */}
                                {!dashboardData.loading && leaveBreakdownData.length > 0 && (
                                    <div className="col-xl-4 col-lg-6 col-md-12">
                                        <div className="leave-policy-breakdown-card">
                                            <div className="breakdown-card-header">
                                                <div className="breakdown-title">
                                                    <i className="bi bi-list-ul me-2"></i>
                                                    <span>Leave Policy Breakdown</span>
                                                </div>
                                                <div className="breakdown-subtitle">Detailed view of your leave policies</div>
                                            </div>
                                            <div className="breakdown-card-content">
                                                {leaveBreakdownData.map((item: any, idx: number) => (
                                                    <div key={idx} className="policy-breakdown-item">
                                                        <div className="policy-header">
                                                            {item.code && (
                                                                <span className="policy-code-badge">{item.code}</span>
                                                            )}
                                                            <span className="policy-name">{item.type}</span>
                                                        </div>
                                                        <div className="policy-stats">
                                                            <div className="stat-group remaining">
                                                                <span className="stat-number">{item.remaining}</span>
                                                                <span className="stat-label">Available</span>
                                                            </div>
                                                            <div className="stat-group used">
                                                                <span className="stat-number">{item.used}</span>
                                                                <span className="stat-label">Used</span>
                                                            </div>
                                                            <div className="stat-group total">
                                                                <span className="stat-number">{item.allocated}</span>
                                                                <span className="stat-label">Total</span>
                                                            </div>
                                                            <div className="stat-progress">
                                                                <div className="progress-bar">
                                                                    <div 
                                                                        className="progress-fill" 
                                                                        style={{
                                                                            width: `${item.allocated > 0 ? ((item.used / item.allocated) * 100) : 0}%`
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <span className="progress-text">
                                                                    {item.allocated > 0 ? Math.round((item.used / item.allocated) * 100) : 0}% Used
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dashboard Content Grid */}
                        <div className="row g-4 mt-2">
                            {/* Main Dashboard Section */}
                            <div className="col-xl-8 col-lg-7">
                                {/* Calendar Section */}
                                <div className="dashboard-section">
                                    <div className="section-header">
                                        <h5 className="section-title">
                                            <i className="bi bi-calendar3 me-2"></i>
                                            Calendar Overview
                                        </h5>
                                        <span className="section-subtitle">View your schedule, holidays, leaves, and office visits</span>
                                    </div>
                                    <div className="calendar-container">
                                        <Calendar
                                            events={calendarEvents}
                                            onDateClick={handleDateClick}
                                            onEventClick={handleEventClick}
                                            className="dashboard-calendar"
                                        />
                                    </div>
                                </div>

                                {/* Analytics Section */}
                                <div className="dashboard-section mt-4">
                                    <div className="section-header">
                                        <h5 className="section-title">
                                            <i className="bi bi-bar-chart-line me-2"></i>
                                            Analytics Overview
                                        </h5>
                                        <span className="section-subtitle">Monitor your performance and productivity</span>
                                    </div>
                                    <div className="analytics-grid">
                                        {analyticsData.map((item, index) => (
                                            <div key={index} className="analytics-card">
                                                <div className="analytics-icon">
                                                    <i className={`bi ${item.icon}`}></i>
                                                </div>
                                                <div className="analytics-content">
                                                    <h6>{item.title}</h6>
                                                    <p>{item.description}</p>
                                                    <div className="analytics-value">{item.value}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Activity Section */}
                                <div className="dashboard-section mt-4">
                                    <div className="section-header">
                                        <h5 className="section-title">
                                            <i className="bi bi-clock-history me-2"></i>
                                            Recent Activity
                                        </h5>
                                        <span className="section-subtitle">Your latest workplace activities</span>
                                    </div>
                                    <div className="activity-list-container">
                                        <div className="activity-list">
                                            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                                                <div key={index} className="activity-item">
                                                    <div className={`activity-icon ${activity.color}`}>
                                                        <i className={`bi ${activity.icon}`}></i>
                                                    </div>
                                                    <div className="activity-content">
                                                        <span className="activity-title">{activity.title}</span>
                                                        <span className="activity-time">{activity.time}</span>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center text-muted py-4">
                                                    <i className="bi bi-clock-history me-2"></i>
                                                    No recent activity found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar with Real-time Data */}
                            <div className="col-xl-4 col-lg-5">
                                {/* Leave Balance Section */}
                                <div className="sidebar-section">
                                    <div className="section-header">
                                        <h5 className="section-title">
                                            <i className="bi bi-calendar-check me-2"></i>
                                            Leave Balance
                                        </h5>
                                    </div>
                                    <div className="leave-balance-overview">
                                        <div className="balance-card">
                                            <div className="balance-header">
                                                <span className="balance-label">Available Leave</span>
                                                <span className="balance-value">
                                                    {dashboardData.loading ? '...' : `${dashboardData.leaveBalance.reduce((sum: number, balance: any) => {
                                                        const remaining = balance?.remainingDays ?? ((balance?.allocatedDays || 0) - (balance?.usedDays || 0));
                                                        return sum + remaining;
                                                    }, 0)} days`}
                                                </span>
                                            </div>
                                            <div className="balance-progress">
                                                <div className="progress">
                                                    <div 
                                                        className="progress-bar bg-success" 
                                                        style={{
                                                            width: `${!dashboardData.loading && dashboardData.leaveBalance.length > 0 ? 
                                                                (() => {
                                                                    const totalAllocated = dashboardData.leaveBalance.reduce((sum: number, balance: any) => sum + (balance?.allocatedDays || 0), 0);
                                                                    const totalUsed = dashboardData.leaveBalance.reduce((sum: number, balance: any) => sum + (balance?.usedDays || 0), 0);
                                                                    return totalAllocated > 0 ? Math.max(0, ((totalAllocated - totalUsed) / totalAllocated) * 100) : 0;
                                                                })() : 0}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="balance-details">
                                                <small>
                                                    Used: {dashboardData.loading ? '...' : dashboardData.leaveBalance.reduce((sum: number, balance: any) => sum + (balance?.usedDays || 0), 0)} days | 
                                                    Total: {dashboardData.loading ? '...' : dashboardData.leaveBalance.reduce((sum: number, balance: any) => sum + (balance?.allocatedDays || 0), 0)} days
                                                </small>
                                            </div>
                                        </div>
                                        <div className="balance-actions">
                                            <button className="btn btn-sm btn-outline-light me-2" onClick={() => handleCardClick(ROUTES.USER.LEAVE_MANAGEMENT)}>
                                                Apply Leave
                                            </button>
                                            <button className="btn btn-sm btn-light" onClick={() => handleCardClick(ROUTES.USER.LEAVE_POLICY)}>
                                                View Policy
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* HelpDesk Requests Section - Mock with API structure */}
                                <div className="sidebar-section mt-4">
                                    <div className="section-header">
                                        <h5 className="section-title">
                                            <i className="bi bi-headset me-2"></i>
                                            HelpDesk Request
                                            <span className="badge bg-success ms-2">✓</span>
                                        </h5>
                                    </div>
                                    <div className="helpdesk-overview">
                                        {/* This would be populated with real helpdesk data when API is available */}
                                        <div className="text-center text-muted py-4">
                                            <i className="bi bi-headset me-2"></i>
                                            No helpdesk requests found
                                            <br />
                                            <small>Connect helpdesk API to view requests</small>
                                        </div>
                                    </div>
                                </div>

                                {/* Office Visit Status */}
                                <div className="sidebar-section mt-4">
                                    <div className="section-header">
                                        <h5 className="section-title">
                                            <i className="bi bi-building me-2"></i>
                                            Office Visits
                                        </h5>
                                    </div>
                                    <div className="office-visit-overview">
                                        <div className="visit-stats">
                                            <div className="visit-stat">
                                                <span className="visit-value">
                                                    {dashboardData.loading ? '...' : dashboardData.visits.filter((visit: any) => visit.visitType === 'WFO').length}
                                                </span>
                                                <span className="visit-label">WFO Days</span>
                                            </div>
                                            <div className="visit-stat">
                                                <span className="visit-value">
                                                    {dashboardData.loading ? '...' : `${Math.round((dashboardData.visits.filter((visit: any) => visit.visitType === 'WFO').length / 22) * 100)}%`}
                                                </span>
                                                <span className="visit-label">Office Attendance</span>
                                            </div>
                                        </div>
                                        <button className="btn btn-primary btn-sm w-100 mt-3" onClick={() => handleCardClick(ROUTES.USER.OFFICE_VISIT)}>
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Log Visit
                                        </button>
                                    </div>
                                </div>

                                {/* Skills / Profile Update - Mock with API structure */}
                                <div className="sidebar-section mt-4">
                                    <div className="section-header">
                                        <h5 className="section-title">
                                            <i className="bi bi-person-gear me-2"></i>
                                            Skills / Profile update
                                        </h5>
                                    </div>
                                    <div className="skills-overview">
                                        {/* This would be populated with real profile data when API is available */}
                                        <div className="text-center text-muted py-4">
                                            <i className="bi bi-person-gear me-2"></i>
                                            Profile data not available
                                            <br />
                                            <small>Connect profile API to view updates</small>
                                        </div>
                                        <button className="btn btn-outline-primary btn-sm w-100 mt-3" onClick={() => navigate('/user/profile')}>
                                            <i className="bi bi-pencil-square me-2"></i>
                                            Update Profile
                                        </button>
                                    </div>
                                </div>

                                {/* Calendar Events */}
                                <div className="sidebar-section mt-4">
                                    <div className="section-header">
                                        <h5 className="section-title">
                                            <i className="bi bi-calendar-event me-2"></i>
                                            Holiday List
                                        </h5>
                                    </div>
                                    <div className="calendar-overview">
                                        <div className="events-list">
                                            {dashboardData.loading ? (
                                                <div className="text-center py-3">
                                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                        <span className="visually-hidden">Loading holidays...</span>
                                                    </div>
                                                </div>
                                            ) : upcomingHolidays.length > 0 ? upcomingHolidays.map((holiday: any, index: number) => (
                                                <div key={index} className="event-item">
                                                    <div className="event-date">
                                                        <span className="date-day">{holiday.day}</span>
                                                        <span className="date-month">{holiday.month}</span>
                                                    </div>
                                                    <div className="event-details">
                                                        <span className="event-title">{holiday.title}</span>
                                                        <span className="event-type">
                                                            {new Date(holiday.date).toLocaleDateString('en-US', { 
                                                                day: 'numeric', 
                                                                month: 'short', 
                                                                year: 'numeric' 
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center text-muted py-3">
                                                    <i className="bi bi-calendar-x me-2"></i>
                                                    No upcoming holidays
                                                </div>
                                            )}
                                        </div>
                                        <button className="btn btn-link btn-sm w-100 mt-2" onClick={() => handleCardClick(ROUTES.USER.HOLIDAY_TRACKER)}>
                                            See All <i className="bi bi-arrow-right"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Notes Section */}
                                <div className="sidebar-section mt-4">
                                    <div className="section-header">
                                        <h5 className="section-title">
                                            <i className="bi bi-sticky me-2"></i>
                                            Sticky Notes / To do List
                                        </h5>
                                    </div>
                                    <div className="notes-preview">
                                        <div className="notes-action" onClick={() => handleCardClick(ROUTES.USER.USER_NOTES)}>
                                            <div className="notes-icon">
                                                <i className="bi bi-plus-circle"></i>
                                            </div>
                                            <div className="notes-content">
                                                <span className="notes-title">
                                                    Create your first note !!!
                                                </span>
                                                <span className="notes-subtitle">
                                                    Start organizing your thoughts
                                                </span>
                                            </div>
                                        </div>
                                        <button className="btn btn-link btn-sm w-100" onClick={() => handleCardClick(ROUTES.USER.USER_TASKS)}>
                                            See Tasks <i className="bi bi-arrow-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
});

UserDashboard.displayName = 'UserDashboard';

export default UserDashboard;
