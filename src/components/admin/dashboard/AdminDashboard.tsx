import React, { memo, useMemo, useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "../../../hooks/useTranslation";
import { UserRole } from "../../../enums";
import { ErrorBoundary } from "../../ui";
import { ROUTES } from "../../../constants";
import axiosInstance from "../../../services/axiosInstance";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import holidayService from "../../../services/holidayService";
import leavePolicyService from "../../../services/leavePolicyService";
import "./admin-dashboard.css";
import LastLoginPopup from "../../common/login/lastLoginPopup/LastLoginPopup";

interface AdminCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  colorClass: string;
  route: string;
  requiresRole?: UserRole;
  category?: 'management' | 'analytics' | 'system' | 'data';
}

interface AdminQuickStat {
  id: string;
  label: string;
  value: string | number;
  icon: string;
  colorClass: string;
  bgGradient?: string;
}

interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalHolidays: number;
  leavePolicies: number;
  systemHealth: 'good' | 'warning' | 'error';
  loading: boolean;
  error?: string;
}

const AdminDashboard: React.FC = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalHolidays: 0,
    leavePolicies: 0,
    systemHealth: 'good',
    loading: true,
    error: undefined
  });
  const [searchTerm, setSearchTerm] = useState<string>('');

  const adminCards: AdminCard[] = useMemo(() => [
    {
      id: "user-management",
      title: t('admin.dashboard.cards.userManagement.title') || "User Management",
      subtitle: t('admin.dashboard.cards.userManagement.description') || "Manage users, roles, and permissions",
      icon: "bi bi-people",
      colorClass: "card-user-management",
      route: ROUTES.ADMIN.USER_MANAGEMENT,
      requiresRole: UserRole.ADMIN,
      category: 'management'
    },
    {
      id: "holiday-management",
      title: t('admin.dashboard.cards.holidayManagement.title') || "Holiday Management",
      subtitle: t('admin.dashboard.cards.holidayManagement.description') || "Configure holidays and calendar events",
      icon: "bi bi-calendar-event",
      colorClass: "card-holiday-management",
      route: ROUTES.ADMIN.HOLIDAY_MANAGEMENT,
      requiresRole: UserRole.ADMIN,
      category: 'management'
    },
    {
      id: "leave-policy",
      title: t('admin.dashboard.cards.leavePolicyManagement.title') || "Leave Policy Management",
      subtitle: t('admin.dashboard.cards.leavePolicyManagement.description') || "Configure leave policies and rules",
      icon: "bi bi-clipboard-check",
      colorClass: "card-leave-policy",
      route: ROUTES.ADMIN.LEAVE_POLICY_MANAGEMENT,
      requiresRole: UserRole.ADMIN,
      category: 'management'
    },
    {
      id: "reports",
      title: t('admin.dashboard.cards.reports.title') || "Analytics & Reports",
      subtitle: t('admin.dashboard.cards.reports.description') || "View comprehensive reports and insights",
      icon: "bi bi-bar-chart",
      colorClass: "card-reports",
      route: ROUTES.ADMIN.REPORTS,
      requiresRole: UserRole.ADMIN,
      category: 'analytics'
    },
    {
      id: "database-backup",
      title: t('admin.dashboard.cards.databaseBackup.title') || "Database Backup",
      subtitle: t('admin.dashboard.cards.databaseBackup.description') || "Manage database backups and restore",
      icon: "bi bi-database",
      colorClass: "card-database-backup",
      route: ROUTES.ADMIN.BACKUP || "/admin/backup",
      requiresRole: UserRole.ADMIN,
      category: 'system'
    }
  ], [t]);

  const quickStats: AdminQuickStat[] = useMemo(() => [
    {
      id: "total-users",
      label: t('admin.dashboard.stats.totalUsers') || "Total Users",
      value: dashboardData.totalUsers,
      icon: "bi bi-people",
      colorClass: "stat-users",
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      id: "active-users",
      label: t('admin.dashboard.stats.activeUsers') || "Active Users",
      value: dashboardData.activeUsers,
      icon: "bi bi-person-check",
      colorClass: "stat-active",
      bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      id: "inactive-users",
      label: t('admin.dashboard.stats.inactiveUsers') || "Inactive Users",
      value: dashboardData.inactiveUsers,
      icon: "bi bi-person-x",
      colorClass: "stat-inactive",
      bgGradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
    },
    {
      id: "total-holidays",
      label: t('admin.dashboard.stats.totalHolidays') || "Total Holidays",
      value: dashboardData.totalHolidays,
      icon: "bi bi-calendar3",
      colorClass: "stat-holidays",
      bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    },
    {
      id: "leave-policies",
      label: t('admin.dashboard.stats.leavePolicies') || "Leave Policies",
      value: dashboardData.leavePolicies,
      icon: "bi bi-clipboard-check",
      colorClass: "stat-policies",
      bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    }
  ], [t, dashboardData]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: undefined }));
      
      // Fetch real data from various services
      const [usersResponse, holidaysData, leavePoliciesData] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.USERS.GET_ALL),
        holidayService.getHolidays(),
        leavePolicyService.getAll()
      ]);

      // Process users data
      let totalUsers = 0;
      let activeUsers = 0;
      let inactiveUsers = 0;

      if (usersResponse?.data?.status === "SUCCESS" && Array.isArray(usersResponse.data.data)) {
        const users = usersResponse.data.data;
        totalUsers = users.length;
        activeUsers = users.filter((user: any) => user.isActive).length;
        inactiveUsers = totalUsers - activeUsers;
      }

      // Process holidays data
      const totalHolidays = Array.isArray(holidaysData) ? holidaysData.length : 0;

      // Process leave policies data
      const leavePolicies = Array.isArray(leavePoliciesData) ? leavePoliciesData.length : 0;

      setDashboardData({
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalHolidays,
        leavePolicies,
        systemHealth: 'good',
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDashboardData({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalHolidays: 0,
        leavePolicies: 0,
        systemHealth: 'warning',
        loading: false,
        error: 'Unable to load dashboard data'
      });
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const filteredCards = useMemo(() => {
    return adminCards.filter(card => {
      const matchesSearch = !searchTerm || 
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [adminCards, searchTerm]);

  const handleCardClick = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  if (dashboardData.loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="admin-dashboard">
        <LastLoginPopup />
        
        <div className="dashboard-layout">
          {/* Left Sidebar */}
          <div className="left-sidebar">
            <div className="sidebar-header">
              <h6 className="sidebar-title">
                <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                {t('admin.dashboard.sidebar.quickAccess') || 'Quick Access'}
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
                    placeholder={t('admin.dashboard.search.placeholder') || 'Search admin tools...'}
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
              {filteredCards.length === 0 ? (
                <div className="text-center text-muted py-3">
                  <i className="bi bi-search me-2"></i>
                  {t('admin.dashboard.search.noResults') || 'No tools found'}
                </div>
              ) : (
                filteredCards.map((card, index) => (
                  <div
                    key={card.id}
                    className={`sidebar-menu-item ${card.colorClass}`}
                    onClick={() => handleCardClick(card.route)}
                    data-bs-toggle="tooltip"
                    data-bs-placement="right"
                    title={card.subtitle}
                  >
                    <div className="menu-item-icon">
                      <i className={card.icon}></i>
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
              <div className="user-info">
                <div className="user-avatar">
                  <i className="bi bi-person-circle"></i>
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.name || 'Admin'}</span>
                  <span className="user-role">{user?.role || 'Administrator'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="main-content">
            {/* Welcome Section */}
            <div className="welcome-section mb-4">
              <div className="welcome-card">
                <div className="welcome-content">
                  <h4 className="welcome-title">
                    {t('admin.dashboard.welcome.title') || 'Welcome'}, {user?.name || 'Admin'}!
                  </h4>
                  <p className="welcome-subtitle">
                    {t('admin.dashboard.welcome.subtitle') || 'Manage your workplace efficiently with comprehensive administrative tools'}
                  </p>
                </div>
              </div>
            </div>



            {/* Quick Stats Section */}
            <div className="quick-stats-section">
              <div className="section-header">
                <h6 className="section-title">
                  <i className="bi bi-speedometer2 me-2"></i>
                  {t('admin.dashboard.stats.title') || 'Quick Statistics'}
                </h6>
              </div>
              <div className="row g-3">
                {quickStats.map((stat) => (
                  <div key={stat.id} className="col-lg-3 col-md-6 col-sm-6">
                    <div className={`quick-stat-card ${stat.colorClass}`}>
                      <div className="stat-card-icon">
                        <i className={stat.icon}></i>
                      </div>
                      <div className="stat-card-content">
                        <div className="stat-info">
                          <span className="stat-label">{stat.label}</span>
                        </div>
                        <div className="stat-value-container">
                          <div className="main-value-section">
                            <span className="stat-value">{stat.value}</span>
                          </div>
                        </div>
                      </div>
                      <div className="stat-animation"></div>
                      <div className="stat-hover-effect"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="row g-4 mt-2">
              {/* Main Dashboard Section */}
              <div className="col-xl-12 col-lg-12">
                <div className="dashboard-section">
                  <div className="section-header">
                    <h6 className="section-title">
                      <i className="bi bi-grid-3x3-gap me-2"></i>
                      {t('admin.dashboard.tools.title') || 'Administrative Tools'}
                    </h6>
                    <p className="section-subtitle">
                      {t('admin.dashboard.tools.subtitle') || 'Access comprehensive tools to manage your workplace effectively'}
                    </p>
                  </div>

                  <div className="row g-3">
                    {filteredCards.map((card) => (
                      <div key={card.id} className="col-xl-4 col-lg-6 col-md-6">
                        <div
                          className={`dashboard-feature-card ${card.colorClass}`}
                          onClick={() => handleCardClick(card.route)}
                        >
                          <div className="card-header">
                            <div className="card-logo">
                              <i className={card.icon}></i>
                            </div>
                          </div>
                          <div className="card-content">
                            <h5 className="card-title">{card.title}</h5>
                            <p className="card-subtitle">{card.subtitle}</p>
                          </div>
                          <div className="card-footer">
                            <span className="card-cta">
                              <i className="bi bi-arrow-right me-1"></i>
                              {t('admin.dashboard.tools.openButton') || 'Open'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {dashboardData.error && (
              <div className="alert alert-warning" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {dashboardData.error}
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

AdminDashboard.displayName = 'AdminDashboard';

export default AdminDashboard;