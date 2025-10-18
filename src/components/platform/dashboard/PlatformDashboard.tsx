// src/components/platform/dashboard/PlatformDashboard.tsx
import React, { memo, useMemo, useCallback, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { usePlatformAuth } from "../../../context/PlatformAuthContext";
import { useTranslation } from "../../../hooks/useTranslation";
import { ErrorBoundary } from "../../ui";
import { ROUTES } from "../../../constants";
import RedirectingLoader from "../../common/redirectingLoader/RedirectingLoader";
import { PlatformDashboardData } from "../../../models/Platform";
import { platformStatsService } from "../../../services/platformStatsService";
import "./PlatformDashboard.css";

interface PlatformDashboardCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  colorClass: string;
  count?: number;
}

const PlatformDashboard: React.FC = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { platformUser, platformLogout, isPlatformAuthenticated } = usePlatformAuth();
  const { t } = useTranslation();
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [language] = useState("en");
  
  // Platform statistics state
  const [dashboardData, setDashboardData] = useState<PlatformDashboardData>({
    platformStats: null,
    loading: true,
    error: null,
    lastUpdated: null
  });
  
  // UI State for dropdowns
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutRole, setLogoutRole] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load platform statistics
  const loadPlatformStats = useCallback(async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await platformStatsService.getPlatformStats();
      
      if (response.status === 'SUCCESS' && response.data) {
        setDashboardData(prev => ({
          ...prev,
          platformStats: response.data!,
          loading: false,
          error: null,
          lastUpdated: new Date().toISOString()
        }));
      } else {
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: response.message || 'Failed to load platform statistics'
        }));
      }
    } catch (error: any) {
      console.error('Error loading platform statistics:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load platform statistics'
      }));
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    if (isPlatformAuthenticated) {
      loadPlatformStats();
    }
  }, [isPlatformAuthenticated, loadPlatformStats]);

  // Platform dashboard cards with real statistics
  const platformCards = useMemo<PlatformDashboardCard[]>(() => [
    {
      id: "tenant-management",
      title: t("platform.navigation.tenants") || "Tenant Management",
      subtitle: t("platform.dashboard.cards.tenants.subtitle") || "Manage organizations and workspaces",
      icon: "bi-buildings",
      route: ROUTES.PLATFORM.TENANTS,
      colorClass: "card-primary",
      count: dashboardData.platformStats?.totalTenants || 0
    },
    {
      id: "user-management", 
      title: t("platform.navigation.tenantUsers") || "Tenant User Management",
      subtitle: t("platform.dashboard.cards.tenantUsers.subtitle") || "Manage Super Admin users across tenants",
      icon: "bi-people-fill",
      route: ROUTES.PLATFORM.TENANT_USERS,
      colorClass: "card-success",
      count: dashboardData.platformStats?.totalTenantUsers || 0
    },
    {
      id: "subscription-management",
      title: t("platform.navigation.subscriptions") || "Tenant Subscription Management",
      subtitle: t("platform.dashboard.cards.subscriptions.subtitle") || "Manage tenant subscription plans and billing",
      icon: "bi-credit-card-2-front",
      route: ROUTES.PLATFORM.TENANT_SUBSCRIPTIONS,
      colorClass: "card-info",
      count: dashboardData.platformStats?.totalTenants || 0
    },
    {
      id: "analytics",
      title: t("platform.navigation.analytics") || "Analytics",
      subtitle: t("platform.dashboard.cards.analytics.subtitle") || "Platform usage and performance metrics",
      icon: "bi-graph-up-arrow",
      route: "/platform/analytics",
      colorClass: "card-info",
      count: dashboardData.platformStats ? (dashboardData.platformStats.totalSuperAdmins + dashboardData.platformStats.totalAdmins) : 0
    },
    {
      id: "system-config",
      title: t("platform.navigation.settings") || "System Configuration", 
      subtitle: t("platform.dashboard.cards.settings.subtitle") || "Global settings and integrations",
      icon: "bi-gear-fill",
      route: "/platform/settings",
      colorClass: "card-warning",
      count: 0
    },
    {
      id: "api-management",
      title: t("platform.dashboard.cards.api.title") || "API Management",
      subtitle: t("platform.dashboard.cards.api.subtitle") || "Monitor API usage and endpoints",
      icon: "bi-code-slash",
      route: "/platform/api",
      colorClass: "card-secondary",
      count: 24
    },
    {
      id: "backup-restore",
      title: t("platform.dashboard.cards.backup.title") || "Backup & Restore",
      subtitle: t("platform.dashboard.cards.backup.subtitle") || "Data backup and recovery operations",
      icon: "bi-hdd-stack",
      route: "/platform/backup",
      colorClass: "card-danger",
      count: 0
    }
  ], [t, dashboardData.platformStats]);

  // Filter cards based on search term
  const visibleCards = useMemo(() => {
    if (!searchTerm) return platformCards;
    return platformCards.filter(card =>
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [platformCards, searchTerm]);

  // Handle card click navigation
  const handleCardClick = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  // Handle platform logout
  const handlePlatformLogout = useCallback(() => {
    setShowUserDropdown(false);
    
    // Capture role at start to prevent flickering
    setLogoutRole("PLATFORM_ADMIN");
    setIsLoggingOut(true);
    
    // Clear platform auth immediately
    platformLogout();
    
    // Short delay for visual feedback then force navigation
    setTimeout(() => {
      window.location.href = '/platform-home';
    }, 800);
  }, [platformLogout]);

  // Handle dropdown clicks
  const handleProfileClick = useCallback(() => {
    setShowUserDropdown(false);
    navigate(ROUTES.PLATFORM.PROFILE);
  }, [navigate]);

  const handleSettingsClick = useCallback(() => {
    setShowUserDropdown(false);
    navigate(ROUTES.PLATFORM.SETTINGS);
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check platform authentication
  useEffect(() => {
    if (!isPlatformAuthenticated) {
      navigate(ROUTES.PLATFORM.LOGIN);
    }
  }, [isPlatformAuthenticated, navigate]);

  // Show logout loader if logging out
  if (isLoggingOut) {
    return <RedirectingLoader 
      message={t("platform.dashboard.loggingOut") || "Logging out..."} 
      role={logoutRole || "PLATFORM_ADMIN"} 
      duration={800} 
      showProgress={false} 
    />;
  }

  return (
    <ErrorBoundary>
      <div className="platform-dashboard">
        <div className="dashboard-layout">
          {/* Left Sidebar */}
          <div key={language} className="left-sidebar">
            <div className="sidebar-header">
              <h6 className="sidebar-title">
                <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                {t('platform.dashboard.sidebar.title') || 'Platform Tools'}
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
                    placeholder={t('platform.dashboard.sidebar.searchPlaceholder') || 'Search platform tools...'}
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
                  {t('platform.dashboard.sidebar.noItemsFound') || 'No tools found'}
                </div>
              ) : (
                visibleCards.map((card, index) => (
                  <div
                    key={`${card.id}-${language}`}
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
                        {card.count !== undefined && (
                          <span className="menu-item-count">
                            {card.count}
                          </span>
                        )}
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
              <div className="platform-info position-relative" ref={dropdownRef}>
                <div 
                  className="platform-user-card"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="platform-avatar">
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <div className="platform-details">
                    <span className="platform-name">{platformUser?.name || 'Platform Admin'}</span>
                    <span className="platform-role">{t('platform.dashboard.sidebar.adminRole') || 'Platform Administrator'}</span>
                  </div>
                  <div className="platform-dropdown-arrow">
                    <i className={`bi bi-chevron-${showUserDropdown ? 'up' : 'down'}`}></i>
                  </div>
                </div>

                {/* Platform User Dropdown */}
                {showUserDropdown && (
                  <div className="platform-user-dropdown">
                    <div className="dropdown-header">
                      <div className="user-info">
                        <i className="bi bi-person-circle me-2"></i>
                        <div>
                          <div className="user-name">{platformUser?.name || 'Platform Admin'}</div>
                          <div className="user-role text-muted small">{t('platform.dashboard.sidebar.adminRole') || 'Platform Administrator'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-body">
                      <button 
                        className="dropdown-item"
                        onClick={handleProfileClick}
                      >
                        <i className="bi bi-person-badge me-2"></i>
                        {t('navigation.myProfile') || 'My Profile'}
                      </button>
                      <button 
                        className="dropdown-item"
                        onClick={handleSettingsClick}
                      >
                        <i className="bi bi-gear me-2"></i>
                        {t('navigation.settings') || 'Settings'}
                      </button>
                      <div className="dropdown-divider"></div>
                      <button 
                        className="dropdown-item text-danger"
                        onClick={handlePlatformLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        {t('navigation.logout') || 'Logout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="main-content">
            {/* Welcome Section */}
            <div className="welcome-section mb-4">
              <div className="welcome-card platform-welcome">
                <div className="welcome-content">
                  <h4 className="welcome-title">
                    {t('platform.dashboard.welcome.title') || 'Welcome to Platform Administration'}, {platformUser?.name || user?.name || 'User'}
                  </h4>
                  <p className="welcome-subtitle">
                    {t('platform.dashboard.welcome.subtitle') || 'Manage your workplace tracking platform from this centralized dashboard'}
                  </p>
                </div>
                <div className="welcome-icon">
                  <i className="bi bi-speedometer2"></i>
                </div>
              </div>
            </div>

            {/* Platform Stats Section */}
            <div className="stats-section mb-4">
              {dashboardData.loading && (
                <div className="loading-section text-center py-4">
                  <div className="spinner-border text-primary me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span>Loading platform statistics...</span>
                </div>
              )}

              {dashboardData.error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>
                    <strong>Error:</strong> {dashboardData.error}
                    <button 
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={loadPlatformStats}
                    >
                      <i className="bi bi-arrow-clockwise"></i> Retry
                    </button>
                  </div>
                </div>
              )}

              {!dashboardData.loading && !dashboardData.error && dashboardData.platformStats && (
                <>
                  <div className="row g-3">
                    <div className="col-lg-3 col-md-6">
                      <div className="stat-card stat-primary">
                        <div className="stat-icon">
                          <i className="bi bi-buildings"></i>
                        </div>
                        <div className="stat-content">
                          <div className="stat-number">{dashboardData.platformStats.totalTenants}</div>
                          <div className="stat-label">{t('platform.dashboard.stats.totalTenants') || 'Total Tenants'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <div className="stat-card stat-success">
                        <div className="stat-icon">
                          <i className="bi bi-people-fill"></i>
                        </div>
                        <div className="stat-content">
                          <div className="stat-number">{dashboardData.platformStats.totalTenantUsers}</div>
                          <div className="stat-label">{t('platform.dashboard.stats.totalUsers') || 'Total Platform Users'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <div className="stat-card stat-info">
                        <div className="stat-icon">
                          <i className="bi bi-person-badge"></i>
                        </div>
                        <div className="stat-content">
                          <div className="stat-number">{dashboardData.platformStats.totalSuperAdmins}</div>
                          <div className="stat-label">{t('platform.dashboard.stats.superAdmins') || 'Super Admins'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <div className="stat-card stat-warning">
                        <div className="stat-icon">
                          <i className="bi bi-person-check"></i>
                        </div>
                        <div className="stat-content">
                          <div className="stat-number">{dashboardData.platformStats.totalAdmins}</div>
                          <div className="stat-label">{t('platform.dashboard.stats.admins') || 'Admins'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Statistics Row */}
                  <div className="row g-3 mt-2">
                    <div className="col-lg-3 col-md-6">
                      <div className="stat-card stat-secondary">
                        <div className="stat-icon">
                          <i className="bi bi-person"></i>
                        </div>
                        <div className="stat-content">
                          <div className="stat-number">{dashboardData.platformStats.totalUsers}</div>
                          <div className="stat-label">{t('platform.dashboard.stats.regularUsers') || 'Regular Users'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <div className="stat-card stat-success">
                        <div className="stat-icon">
                          <i className="bi bi-calculator"></i>
                        </div>
                        <div className="stat-content">
                          <div className="stat-number">
                            {dashboardData.platformStats.totalTenants > 0 
                              ? Math.round(dashboardData.platformStats.totalTenantUsers / dashboardData.platformStats.totalTenants)
                              : 0
                            }
                          </div>
                          <div className="stat-label">{t('platform.dashboard.stats.avgUsersPerTenant') || 'Avg Users/Tenant'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <div className="stat-card stat-info">
                        <div className="stat-icon">
                          <i className="bi bi-percent"></i>
                        </div>
                        <div className="stat-content">
                          <div className="stat-number">
                            {dashboardData.platformStats.totalTenantUsers > 0 
                              ? ((dashboardData.platformStats.totalSuperAdmins / dashboardData.platformStats.totalTenantUsers) * 100).toFixed(1)
                              : 0
                            }%
                          </div>
                          <div className="stat-label">{t('platform.dashboard.stats.superAdminRatio') || 'Super Admin %'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <div className="stat-card stat-primary">
                        <div className="stat-icon">
                          <i className="bi bi-clock-history"></i>
                        </div>
                        <div className="stat-content">
                          <div className="stat-number">
                            {dashboardData.lastUpdated 
                              ? new Date(dashboardData.lastUpdated).toLocaleTimeString()
                              : '--'
                            }
                          </div>
                          <div className="stat-label">{t('platform.dashboard.stats.lastUpdated') || 'Last Updated'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Actions Grid */}
            <div className="quick-actions-section">
              <h5 className="section-title">
                <i className="bi bi-lightning-charge me-2"></i>
                {t('platform.dashboard.quickActions.title') || 'Quick Actions'}
              </h5>
              <div className="row g-4">
                {platformCards.map((card) => (
                  <div key={card.id} className="col-lg-4 col-md-6">
                    <div 
                      className={`quick-action-card ${card.colorClass}`}
                      onClick={() => handleCardClick(card.route)}
                    >
                      <div className="card-header">
                        <div className="card-icon">
                          <i className={`bi ${card.icon}`}></i>
                        </div>
                        {card.count !== undefined && (
                          <div className="card-badge">
                            {card.count}
                          </div>
                        )}
                      </div>
                      <div className="card-body">
                        <h6 className="card-title">{card.title}</h6>
                        <p className="card-description">{card.subtitle}</p>
                      </div>
                      <div className="card-footer">
                        <span className="action-link">
                          {t('platform.dashboard.quickActions.manage') || 'Manage'} 
                          <i className="bi bi-arrow-right ms-1"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tenant Statistics Breakdown Table */}
            {!dashboardData.loading && !dashboardData.error && dashboardData.platformStats && (
              <div className="tenant-breakdown-section mt-5">
                <h5 className="section-title">
                  <i className="bi bi-table me-2"></i>
                  {t('platform.dashboard.tenantBreakdown.title') || 'Tenant-wise Statistics'}
                </h5>
                <div className="table-card">
                  <div className="card-header">
                    <div className="header-content">
                      <h6 className="card-title mb-0">
                        {t('platform.dashboard.tenantBreakdown.subtitle') || 'Detailed breakdown of users across all tenants'}
                      </h6>
                      <span className="badge bg-primary">
                        {dashboardData.platformStats.tenantStats.length} {t('platform.dashboard.tenantBreakdown.tenantsCount') || 'Tenants'}
                      </span>
                    </div>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th scope="col">
                              <i className="bi bi-building me-1"></i>
                              {t('platform.dashboard.tenantBreakdown.tenantName') || 'Tenant Name'}
                            </th>
                            <th scope="col" className="text-center">
                              <i className="bi bi-person-badge me-1"></i>
                              {t('platform.dashboard.tenantBreakdown.superAdmins') || 'Super Admins'}
                            </th>
                            <th scope="col" className="text-center">
                              <i className="bi bi-person-check me-1"></i>
                              {t('platform.dashboard.tenantBreakdown.admins') || 'Admins'}
                            </th>
                            <th scope="col" className="text-center">
                              <i className="bi bi-person me-1"></i>
                              {t('platform.dashboard.tenantBreakdown.users') || 'Users'}
                            </th>
                            <th scope="col" className="text-center">
                              <i className="bi bi-people me-1"></i>
                              {t('platform.dashboard.tenantBreakdown.totalUsers') || 'Total Users'}
                            </th>
                            <th scope="col" className="text-center">
                              <i className="bi bi-pie-chart me-1"></i>
                              {t('platform.dashboard.tenantBreakdown.distribution') || 'Distribution'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.platformStats.tenantStats.map((tenant) => (
                            <tr key={tenant.tenantId}>
                              <td>
                                <div className="tenant-info">
                                  <div className="tenant-name">{tenant.tenantName}</div>
                                  <small className="text-muted">ID: {tenant.tenantId}</small>
                                </div>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-primary rounded-pill">
                                  {tenant.superAdminCount}
                                </span>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-success rounded-pill">
                                  {tenant.adminCount}
                                </span>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-info rounded-pill">
                                  {tenant.userCount}
                                </span>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-dark rounded-pill">
                                  {tenant.totalTenantUsers}
                                </span>
                              </td>
                              <td className="text-center">
                                <div className="distribution-chart">
                                  <div className="progress" style={{ height: '20px' }}>
                                    {tenant.totalTenantUsers > 0 && (
                                      <>
                                        <div 
                                          className="progress-bar bg-primary" 
                                          role="progressbar" 
                                          style={{ 
                                            width: `${(tenant.superAdminCount / tenant.totalTenantUsers) * 100}%` 
                                          }}
                                          title={`Super Admins: ${((tenant.superAdminCount / tenant.totalTenantUsers) * 100).toFixed(1)}%`}
                                        ></div>
                                        <div 
                                          className="progress-bar bg-success" 
                                          role="progressbar" 
                                          style={{ 
                                            width: `${(tenant.adminCount / tenant.totalTenantUsers) * 100}%` 
                                          }}
                                          title={`Admins: ${((tenant.adminCount / tenant.totalTenantUsers) * 100).toFixed(1)}%`}
                                        ></div>
                                        <div 
                                          className="progress-bar bg-info" 
                                          role="progressbar" 
                                          style={{ 
                                            width: `${(tenant.userCount / tenant.totalTenantUsers) * 100}%` 
                                          }}
                                          title={`Users: ${((tenant.userCount / tenant.totalTenantUsers) * 100).toFixed(1)}%`}
                                        ></div>
                                      </>
                                    )}
                                  </div>
                                  <small className="text-muted d-block mt-1">
                                    {tenant.totalTenantUsers > 0 
                                      ? `${((tenant.superAdminCount / tenant.totalTenantUsers) * 100).toFixed(0)}% / ${((tenant.adminCount / tenant.totalTenantUsers) * 100).toFixed(0)}% / ${((tenant.userCount / tenant.totalTenantUsers) * 100).toFixed(0)}%`
                                      : 'No users'
                                    }
                                  </small>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="row text-center">
                      <div className="col-md-3">
                        <div className="summary-stat">
                          <div className="stat-value text-primary">{dashboardData.platformStats.totalSuperAdmins}</div>
                          <div className="stat-label">Total Super Admins</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="summary-stat">
                          <div className="stat-value text-success">{dashboardData.platformStats.totalAdmins}</div>
                          <div className="stat-label">Total Admins</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="summary-stat">
                          <div className="stat-value text-info">{dashboardData.platformStats.totalUsers}</div>
                          <div className="stat-label">Total Users</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="summary-stat">
                          <div className="stat-value text-dark">{dashboardData.platformStats.totalTenantUsers}</div>
                          <div className="stat-label">Total Platform Users</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity Section */}
            <div className="recent-activity-section mt-5">
              <h5 className="section-title">
                <i className="bi bi-clock-history me-2"></i>
                {t('platform.dashboard.recentActivity.title') || 'Recent Platform Activity'}
              </h5>
              <div className="activity-card">
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon success">
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">New tenant "Acme Corp" was successfully onboarded</div>
                      <div className="activity-time">2 hours ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon info">
                      <i className="bi bi-info-circle"></i>
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">System backup completed successfully</div>
                      <div className="activity-time">4 hours ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon warning">
                      <i className="bi bi-exclamation-triangle"></i>
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">API rate limit reached for tenant "TechStart"</div>
                      <div className="activity-time">6 hours ago</div>
                    </div>
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

PlatformDashboard.displayName = "PlatformDashboard";

export default PlatformDashboard;