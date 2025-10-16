import React, { useMemo, useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "../../../hooks/useTranslation";
import { UserRole } from "../../../enums";
import { ErrorBoundary } from "../../ui";
import { ROUTES } from "../../../constants";
import axiosInstance from "../../../services/axiosInstance";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import "./super-admin-dashboard.css";
import LastLoginPopup from "../../common/login/lastLoginPopup/LastLoginPopup";

interface SuperAdminCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  colorClass: string;
  route: string;
  requiresRole?: UserRole;
  category?: 'platform' | 'tenant' | 'analytics' | 'system';
}

interface SuperAdminQuickStat {
  id: string;
  label: string;
  value: string | number;
  icon: string;
  colorClass: string;
  bgGradient?: string;
}

interface SuperAdminDashboardData {
  totalTenants: number;
  activeTenants: number;
  totalPlatformUsers: number;
  totalEndUsers: number;
  activeSubscriptions: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  loading: boolean;
  error?: string;
}

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const [dashboardData, setDashboardData] = useState<SuperAdminDashboardData>({
    totalTenants: 0,
    activeTenants: 0,
    totalPlatformUsers: 0,
    totalEndUsers: 0,
    activeSubscriptions: 0,
    systemHealth: 'good',
    loading: true
  });

  // Check user authorization
  useEffect(() => {
    if (user?.role !== UserRole.SUPER_ADMIN) {
      navigate(ROUTES.PUBLIC.HOME);
    }
  }, [user, navigate]);

  // Super Admin Cards Configuration
  const superAdminCards: SuperAdminCard[] = useMemo(
    () => [
      // Platform Management
      {
        id: "platform-management",
        title: t("superAdmin.platformManagement"),
        subtitle: t("superAdmin.platformManagementDesc"),
        icon: "bi-diagram-3",
        colorClass: "primary",
        route: ROUTES.SUPER_ADMIN.PLATFORM_MANAGEMENT,
        category: "platform",
      },
      {
        id: "tenant-management",
        title: t("superAdmin.tenantManagement"),
        subtitle: t("superAdmin.tenantManagementDesc"),
        icon: "bi-building",
        colorClass: "info",
        route: ROUTES.SUPER_ADMIN.TENANT_MANAGEMENT,
        category: "tenant",
      },
      {
        id: "subscription-management",
        title: t("superAdmin.subscriptionManagement"),
        subtitle: t("superAdmin.subscriptionManagementDesc"),
        icon: "bi-credit-card",
        colorClass: "success",
        route: ROUTES.SUPER_ADMIN.SUBSCRIPTION_MANAGEMENT,
        category: "platform",
      },

      // Analytics & Monitoring
      {
        id: "global-analytics",
        title: t("superAdmin.globalAnalytics"),
        subtitle: t("superAdmin.globalAnalyticsDesc"),
        icon: "bi-graph-up-arrow",
        colorClass: "warning",
        route: ROUTES.SUPER_ADMIN.GLOBAL_ANALYTICS,
        category: "analytics",
      },
      {
        id: "system-monitoring",
        title: t("superAdmin.systemMonitoring"),
        subtitle: t("superAdmin.systemMonitoringDesc"),
        icon: "bi-activity",
        colorClass: "danger",
        route: ROUTES.SUPER_ADMIN.SYSTEM_MONITORING,
        category: "system",
      },
      {
        id: "audit-logs",
        title: t("superAdmin.auditLogs"),
        subtitle: t("superAdmin.auditLogsDesc"),
        icon: "bi-journal-text",
        colorClass: "dark",
        route: ROUTES.SUPER_ADMIN.AUDIT_LOGS,
        category: "system",
      },

      // System Management
      {
        id: "backup-management",
        title: t("superAdmin.backupManagement"),
        subtitle: t("superAdmin.backupManagementDesc"),
        icon: "bi-cloud-download",
        colorClass: "secondary",
        route: ROUTES.SUPER_ADMIN.BACKUP_MANAGEMENT,
        category: "system",
      },
      {
        id: "settings",
        title: t("superAdmin.systemSettings"),
        subtitle: t("superAdmin.systemSettingsDesc"),
        icon: "bi-gear",
        colorClass: "primary",
        route: ROUTES.SUPER_ADMIN.SETTINGS,
        category: "system",
      },
    ],
    [t]
  );

  // Quick Stats Configuration
  const quickStats: SuperAdminQuickStat[] = useMemo(
    () => [
      {
        id: "total-tenants",
        label: t("superAdmin.stats.totalTenants"),
        value: dashboardData.totalTenants,
        icon: "bi-building",
        colorClass: "primary",
        bgGradient: "bg-gradient-primary"
      },
      {
        id: "active-tenants",
        label: t("superAdmin.stats.activeTenants"),
        value: dashboardData.activeTenants,
        icon: "bi-check-circle",
        colorClass: "success",
        bgGradient: "bg-gradient-success"
      },
      {
        id: "platform-users",
        label: t("superAdmin.stats.platformUsers"),
        value: dashboardData.totalPlatformUsers,
        icon: "bi-person-badge",
        colorClass: "info",
        bgGradient: "bg-gradient-info"
      },
      {
        id: "end-users",
        label: t("superAdmin.stats.endUsers"),
        value: dashboardData.totalEndUsers,
        icon: "bi-people",
        colorClass: "warning",
        bgGradient: "bg-gradient-warning"
      },
      {
        id: "subscriptions",
        label: t("superAdmin.stats.activeSubscriptions"),
        value: dashboardData.activeSubscriptions,
        icon: "bi-credit-card",
        colorClass: "success",
        bgGradient: "bg-gradient-success"
      },
      {
        id: "system-health",
        label: t("superAdmin.stats.systemHealth"),
        value: dashboardData.systemHealth.toUpperCase(),
        icon: "bi-activity",
        colorClass: dashboardData.systemHealth === 'excellent' ? 'success' : 
                   dashboardData.systemHealth === 'good' ? 'info' :
                   dashboardData.systemHealth === 'warning' ? 'warning' : 'danger',
        bgGradient: dashboardData.systemHealth === 'excellent' ? 'bg-gradient-success' : 
                   dashboardData.systemHealth === 'good' ? 'bg-gradient-info' :
                   dashboardData.systemHealth === 'warning' ? 'bg-gradient-warning' : 'bg-gradient-danger'
      }
    ],
    [t, dashboardData]
  );

  // Fetch dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: undefined }));

      // Mock data for now - replace with actual API calls
      const mockData: SuperAdminDashboardData = {
        totalTenants: 25,
        activeTenants: 23,
        totalPlatformUsers: 15,
        totalEndUsers: 1250,
        activeSubscriptions: 22,
        systemHealth: 'excellent',
        loading: false
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDashboardData(mockData);
    } catch (error: any) {
      console.error("Error loading super admin dashboard data:", error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to load dashboard data"
      }));
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle card click navigation
  const handleCardClick = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  // Group cards by category
  const cardsByCategory = useMemo(() => {
    return superAdminCards.reduce((acc, card) => {
      const category = card.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(card);
      return acc;
    }, {} as Record<string, SuperAdminCard[]>);
  }, [superAdminCards]);

  // Render loading state
  if (dashboardData.loading) {
    return (
      <div className="super-admin-dashboard loading-container">
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="super-admin-dashboard">
        <LastLoginPopup />
        
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="header-content">
                  <div className="header-text">
                    <h1 className="dashboard-title">
                      {t("superAdmin.welcome", { name: user?.name || "Super Admin" })}
                    </h1>
                    <p className="dashboard-subtitle">
                      {t("superAdmin.dashboardSubtitle")}
                    </p>
                  </div>
                  <div className="header-actions">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={loadDashboardData}
                      disabled={dashboardData.loading}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      {t("common.refresh")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="quick-stats-section">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <h3 className="section-title">{t("superAdmin.quickOverview")}</h3>
              </div>
            </div>
            <div className="row g-3">
              {quickStats.map((stat) => (
                <div key={stat.id} className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                  <div className={`stat-card ${stat.bgGradient}`}>
                    <div className="stat-icon">
                      <i className={`${stat.icon} text-white`}></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value text-white">{stat.value}</div>
                      <div className="stat-label text-white-50">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Management Cards Section */}
        <div className="management-section">
          <div className="container-fluid">
            {Object.entries(cardsByCategory).map(([category, cards]) => (
              <div key={category} className="category-section">
                <div className="row">
                  <div className="col-12">
                    <h3 className="section-title">
                      {t(`superAdmin.categories.${category}`)}
                    </h3>
                  </div>
                </div>
                <div className="row g-4">
                  {cards.map((card) => (
                    <div key={card.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                      <div 
                        className={`management-card border-${card.colorClass} cursor-pointer`}
                        onClick={() => handleCardClick(card.route)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleCardClick(card.route);
                          }
                        }}
                      >
                        <div className="card-body">
                          <div className="card-icon-wrapper">
                            <div className={`card-icon bg-${card.colorClass}`}>
                              <i className={`${card.icon} text-white`}></i>
                            </div>
                          </div>
                          <div className="card-content">
                            <h5 className="card-title">{card.title}</h5>
                            <p className="card-subtitle text-muted">{card.subtitle}</p>
                          </div>
                          <div className="card-arrow">
                            <i className={`bi bi-arrow-right text-${card.colorClass}`}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {dashboardData.error && (
          <div className="error-section">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {dashboardData.error}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SuperAdminDashboard;