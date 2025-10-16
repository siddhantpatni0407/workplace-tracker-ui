// src/components/platform/dashboard/PlatformDashboard.tsx
import React, { memo, useMemo, useCallback, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { usePlatformAuth } from "../../../context/PlatformAuthContext";
import { useTranslation } from "../../../hooks/useTranslation";
import { ErrorBoundary } from "../../ui";
import { ROUTES } from "../../../constants";
import RedirectingLoader from "../../common/redirectingLoader/RedirectingLoader";
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
  
  // UI State for dropdowns
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutRole, setLogoutRole] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Platform dashboard cards
  const platformCards = useMemo<PlatformDashboardCard[]>(() => [
    {
      id: "tenant-management",
      title: t("platform.navigation.tenants") || "Tenant Management",
      subtitle: t("platform.dashboard.cards.tenants.subtitle") || "Manage organizations and workspaces",
      icon: "bi-buildings",
      route: ROUTES.PLATFORM.TENANTS,
      colorClass: "card-primary",
      count: 12
    },
    {
      id: "user-management", 
      title: t("platform.navigation.users") || "User Management",
      subtitle: t("platform.dashboard.cards.users.subtitle") || "Manage platform administrators",
      icon: "bi-people-fill",
      route: "/platform/users",
      colorClass: "card-success",
      count: 8
    },
    {
      id: "analytics",
      title: t("platform.navigation.analytics") || "Analytics",
      subtitle: t("platform.dashboard.cards.analytics.subtitle") || "Platform usage and performance metrics",
      icon: "bi-graph-up-arrow",
      route: "/platform/analytics",
      colorClass: "card-info",
      count: 0
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
  ], [t]);

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
                    {t('platform.dashboard.welcome.title') || 'Welcome to Platform Administration'}, {user?.name || 'Admin'}
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
              <div className="row g-3">
                <div className="col-lg-3 col-md-6">
                  <div className="stat-card stat-primary">
                    <div className="stat-icon">
                      <i className="bi bi-buildings"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">12</div>
                      <div className="stat-label">{t('platform.dashboard.stats.activeTenants') || 'Active Tenants'}</div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="stat-card stat-success">
                    <div className="stat-icon">
                      <i className="bi bi-people-fill"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">1,247</div>
                      <div className="stat-label">{t('platform.dashboard.stats.totalUsers') || 'Total Users'}</div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="stat-card stat-info">
                    <div className="stat-icon">
                      <i className="bi bi-graph-up-arrow"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">98.5%</div>
                      <div className="stat-label">{t('platform.dashboard.stats.uptime') || 'System Uptime'}</div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="stat-card stat-warning">
                    <div className="stat-icon">
                      <i className="bi bi-server"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">2.1GB</div>
                      <div className="stat-label">{t('platform.dashboard.stats.storage') || 'Storage Used'}</div>
                    </div>
                  </div>
                </div>
              </div>
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