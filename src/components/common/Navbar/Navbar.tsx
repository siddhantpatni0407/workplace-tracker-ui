// src/components/common/navbar/Navbar.tsx
import React, { memo, useMemo, useCallback, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { UserRole } from "../../../enums";
import ThemeToggle from "../theme/ThemeToggle";
import LanguageSelector from "../language-selector/LanguageSelector";
import { useTranslation } from "../../../hooks/useTranslation";
import "./Navbar.css";

interface NavLinkItem {
  to: string;
  label: string;
  icon: string;
  roles?: UserRole[];
}

interface DropdownItem extends NavLinkItem {
  divider?: boolean;
}

const Navbar: React.FC = memo(() => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Memoize admin navigation items
  const adminNavItems = useMemo<DropdownItem[]>(() => [
    { to: "/user-management", label: t("navigation.userManagement"), icon: "bi-people-fill" },
    { to: "/user-analytics", label: t("navigation.userAnalytics"), icon: "bi-bar-chart-line-fill" },
    { to: "/holiday-management", label: t("navigation.holidayManagement"), icon: "bi-calendar-event-fill" },
    { to: "/leave-policies", label: t("navigation.leavePolicies"), icon: "bi-file-earmark-medical-fill" },
    { to: "/admin/backup", label: t("navigation.dbBackup"), icon: "bi-hdd-fill" },
    { to: "/attendance", label: t("navigation.attendance"), icon: "bi-calendar-check-fill" }
  ], [t]);

  // Memoize user navigation items
  const userNavItems = useMemo<DropdownItem[]>(() => [
    { to: "/user-tasks", label: t("navigation.userTasks"), icon: "bi-check2-square" },
    { to: "/office-visit", label: t("navigation.officeVisit"), icon: "bi-building" },
    { to: "/office-visit-analytics", label: t("navigation.officeVisitAnalytics"), icon: "bi-bar-chart-line-fill" },
    { to: "/apply-leave", label: t("navigation.applyLeave"), icon: "bi-plus-square-dotted" },
    { to: "/leave-policy", label: t("navigation.leavePolicy"), icon: "bi-file-earmark-text-fill" },
    { to: "/holiday-tracker", label: t("navigation.holidayTracker"), icon: "bi-calendar-event" },
    { to: "/user-notes", label: t("navigation.userNotes"), icon: "bi-journal-text" }
  ], [t]);

  // Memoize profile navigation items
  const profileNavItems = useMemo<DropdownItem[]>(() => [
    { to: "/profile", label: t("navigation.myProfile"), icon: "bi-person-badge-fill" },
    { to: "/user-settings", label: t("navigation.settings"), icon: "bi-sliders2-vertical" },
    { to: "", label: "", icon: "", divider: true },
    { to: "/logout", label: t("navigation.logout"), icon: "bi-box-arrow-right" }
  ], [t]);

  // Memoize brand link based on user role
  const brandLink = useMemo(() => {
    if (!user) return "/";
    return user.role === UserRole.ADMIN ? "/admin-dashboard" : "/user-dashboard";
  }, [user]);

  // Memoize home link based on user role
  const homeLink = useMemo(() => {
    if (!user) return "/";
    return user.role === UserRole.ADMIN ? "/admin-dashboard" : "/user-dashboard";
  }, [user]);

  // Check if current path is active
  const isActiveLink = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  // Check if we're on any User Tools page
  const isUserToolsActive = useCallback(() => {
    const userToolsPaths = ['/user-tasks', '/user-notes', '/office-visit', '/office-visit-analytics', '/apply-leave', '/leave-policy', '/holiday-tracker'];
    return userToolsPaths.includes(location.pathname);
  }, [location.pathname]);

  // Handle logout with confirmation
  const handleLogout = useCallback(() => {
    setActiveDropdown(null);
    logout();
  }, [logout]);

  // Handle dropdown toggle
  const handleDropdownToggle = useCallback((dropdownId: string) => {
    setActiveDropdown(current => current === dropdownId ? null : dropdownId);
  }, []);

  // Close dropdown when clicking outside
  const handleDropdownBlur = useCallback(() => {
    // Use setTimeout to allow click events to process first
    setTimeout(() => setActiveDropdown(null), 150);
  }, []);

  // Render navigation link with active state
  const renderNavLink = useCallback((to: string, children: React.ReactNode, className: string = "nav-link text-white nav-hover") => {
    const isActive = isActiveLink(to);
    const linkClasses = `${className} ${isActive ? 'active' : ''}`;
    
    return (
      <Link className={linkClasses} to={to} aria-current={isActive ? 'page' : undefined}>
        {children}
      </Link>
    );
  }, [isActiveLink]);

  // Render dropdown item
  const renderDropdownItem = useCallback((item: DropdownItem, onClick?: () => void) => {
    if (item.divider) {
      return <li key="divider"><hr className="dropdown-divider" /></li>;
    }

    const isActive = isActiveLink(item.to);
    const itemClasses = `dropdown-item ${isActive ? 'active' : ''}`;

    if (item.label === t("navigation.logout")) {
      return (
        <li key={item.to}>
          <button 
            className="dropdown-item text-danger" 
            onClick={handleLogout}
            type="button"
          >
            <i className={`${item.icon} me-2`} aria-hidden="true"></i>
            {item.label}
          </button>
        </li>
      );
    }

    return (
      <li key={item.to}>
        <Link 
          className={itemClasses} 
          to={item.to}
          onClick={onClick}
          aria-current={isActive ? 'page' : undefined}
        >
          <i className={`${item.icon} me-2`} aria-hidden="true"></i>
          {item.label}
        </Link>
      </li>
    );
  }, [isActiveLink, handleLogout, t]);

  // Render dropdown menu
  const renderDropdownMenu = useCallback((
    items: DropdownItem[], 
    menuId: string, 
    labelledBy: string,
    isOpen: boolean
  ) => {
    return (
      <ul
        className={`dropdown-menu dropdown-menu-dark shadow-lg animate-fade ${isOpen ? 'show' : ''}`}
        aria-labelledby={labelledBy}
        id={menuId}
        style={{ display: isOpen ? 'block' : 'none' }}
      >
        {items.map(item => renderDropdownItem(item, () => setActiveDropdown(null)))}
      </ul>
    );
  }, [renderDropdownItem]);

  // Memoize user display name
  const userDisplayName = useMemo(() => {
    return user?.name || t("navigation.profile");
  }, [user?.name, t]);

  // Check if user has specific role
  const hasRole = useCallback((role: UserRole) => {
    return user?.role === role;
  }, [user?.role]);

  return (
    <nav 
      className="navbar navbar-expand-lg custom-navbar fixed-top shadow-sm" 
      role="navigation"
      aria-label={t("navigation.mainNavigation")}
    >
      <div className="container-fluid">
        {/* Brand */}
        <Link
          className="navbar-brand fw-bold text-white"
          to={brandLink}
          aria-label={t("navigation.workplaceTracker")}
        >
          <i className="bi bi-briefcase-fill me-2" aria-hidden="true"></i>
          {t("navigation.workplaceTracker")}
        </Link>

        {/* Mobile Toggler */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label={t("navigation.toggleMenu")}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto align-items-lg-center">
            {/* Home Link */}
            <li className="nav-item">
              {renderNavLink(homeLink, t("navigation.home"))}
            </li>

            {/* Admin Tools Dropdown */}
            {hasRole(UserRole.ADMIN) && (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle text-white btn btn-link nav-hover"
                  id="adminMenu"
                  type="button"
                  onClick={() => handleDropdownToggle('admin')}
                  onBlur={handleDropdownBlur}
                  aria-expanded={activeDropdown === 'admin'}
                  aria-haspopup="true"
                >
                  <i className="bi bi-gear-fill me-1" aria-hidden="true"></i> 
                  {t("navigation.adminTools")}
                </button>
                {renderDropdownMenu(adminNavItems, 'adminDropdown', 'adminMenu', activeDropdown === 'admin')}
              </li>
            )}

            {/* User Tools Dropdown */}
            {hasRole(UserRole.USER) && (
              <li className="nav-item dropdown">
                <button
                  className={`nav-link dropdown-toggle text-white btn btn-link nav-hover ${isUserToolsActive() ? 'active' : ''}`}
                  id="userTools"
                  type="button"
                  onClick={() => handleDropdownToggle('user')}
                  onBlur={handleDropdownBlur}
                  aria-expanded={activeDropdown === 'user'}
                  aria-haspopup="true"
                >
                  <i className="bi bi-tools me-1" aria-hidden="true"></i> 
                  {t("navigation.userTools")}
                  {(isActiveLink('/user-tasks') || isActiveLink('/user-notes')) && (
                    <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.6rem' }}>
                      {isActiveLink('/user-tasks') ? 'Tasks' : 'Notes'}
                    </span>
                  )}
                </button>
                {renderDropdownMenu(userNavItems, 'userDropdown', 'userTools', activeDropdown === 'user')}
              </li>
            )}

            {/* About Link */}
            <li className="nav-item">
              {renderNavLink("/about", t("navigation.about"))}
            </li>

            {/* Contact Link */}
            <li className="nav-item">
              {renderNavLink("/contact", t("navigation.contact"))}
            </li>
          </ul>

          {/* Right Side Navigation */}
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {/* Language Selector */}
            <li className="nav-item d-flex align-items-center me-2">
              <LanguageSelector />
            </li>
            
            {/* Theme Toggle */}
            <li className="nav-item d-flex align-items-center me-2">
              <ThemeToggle />
            </li>

            {/* User Profile Menu */}
            {user ? (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle text-white btn btn-link nav-hover"
                  id="userMenu"
                  type="button"
                  onClick={() => handleDropdownToggle('profile')}
                  onBlur={handleDropdownBlur}
                  aria-expanded={activeDropdown === 'profile'}
                  aria-haspopup="true"
                  aria-label={t("navigation.profileMenu", { name: userDisplayName })}
                >
                  <i className="bi bi-person-circle me-1" aria-hidden="true"></i>
                  {userDisplayName}
                </button>
                {renderDropdownMenu(profileNavItems, 'profileDropdown', 'userMenu', activeDropdown === 'profile')}
              </li>
            ) : (
              <li className="nav-item">
                {renderNavLink("/login", 
                  <>
                    <i className="bi bi-box-arrow-in-right me-1" aria-hidden="true"></i>
                    {t("navigation.login")}
                  </>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
