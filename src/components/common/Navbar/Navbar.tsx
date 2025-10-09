// src/components/common/navbar/Navbar.tsx
import React, { memo, useMemo, useCallback, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { UserRole } from "../../../enums";
import ThemeToggle from "../theme/ThemeToggle";
import LanguageSelector from "../language-selector/LanguageSelector";
import { useTranslation } from "../../../hooks/useTranslation";
import { ROUTES } from "../../../constants";
import UserNotifications, { NotificationBadge } from "../notifications/UserNotifications";
import { SessionTimer } from "../sessionTimer/SessionTimer";
import "./navbar.css";

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

  // UI state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // refs for outside click handling
  const navRef = useRef<HTMLElement | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Admin & User items
  const adminNavItems = useMemo<DropdownItem[]>(
    () => [
      { to: ROUTES.ADMIN.USER_MANAGEMENT, label: t("navigation.userManagement"), icon: "bi-people-fill" },
      { to: ROUTES.ADMIN.REPORTS, label: t("navigation.userAnalytics"), icon: "bi-bar-chart-line-fill" },
      { to: ROUTES.ADMIN.HOLIDAY_MANAGEMENT, label: t("navigation.holidayManagement"), icon: "bi-calendar-event-fill" },
      { to: ROUTES.ADMIN.LEAVE_POLICY_MANAGEMENT, label: t("navigation.leavePolicies"), icon: "bi-file-earmark-medical-fill" },
      { to: ROUTES.ADMIN.BACKUP, label: t("navigation.dbBackup"), icon: "bi-hdd-fill" },
      { to: ROUTES.ADMIN.SYSTEM, label: t("navigation.attendance"), icon: "bi-calendar-check-fill" }
    ],
    [t]
  );

  const userNavItems = useMemo<DropdownItem[]>(
    () => [
      { to: ROUTES.USER.USER_TASKS, label: t("navigation.userTasks"), icon: "bi-check2-square" },
      { to: ROUTES.USER.DAILY_TASK_UPDATES, label: "Daily Task Updates", icon: "bi-clipboard-check" },
      { to: ROUTES.USER.USER_NOTES, label: t("navigation.userNotes"), icon: "bi-journal-text" },
      { to: ROUTES.USER.OFFICE_VISIT, label: t("navigation.officeVisit"), icon: "bi-building" },
      { to: ROUTES.USER.OFFICE_VISIT_ANALYTICS, label: t("navigation.officeVisitAnalytics"), icon: "bi-bar-chart-line-fill" },
      { to: ROUTES.USER.LEAVE_MANAGEMENT, label: t("navigation.leaveManagement"), icon: "bi-calendar-check" },
      { to: ROUTES.USER.LEAVE_POLICY, label: t("navigation.leavePolicy"), icon: "bi-file-earmark-text-fill" },
      { to: ROUTES.USER.HOLIDAY_TRACKER, label: t("navigation.holidayTracker"), icon: "bi-calendar-event" }
    ],
    [t]
  );

  const profileNavItems = useMemo<DropdownItem[]>(
    () => [
      { to: ROUTES.USER.PROFILE, label: t("navigation.myProfile"), icon: "bi-person-badge-fill" },
      { to: ROUTES.USER.SETTINGS, label: t("navigation.settings"), icon: "bi-sliders2-vertical" }, 
      { to: "", label: "", icon: "", divider: true },
      { to: ROUTES.PUBLIC.HOME, label: t("navigation.logout"), icon: "bi-box-arrow-right" }
    ],
    [t]
  );

  const brandLink = useMemo(() => {
    if (!user) return ROUTES.PUBLIC.HOME;
    return user.role === UserRole.ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.USER.DASHBOARD;
  }, [user]);

  const homeLink = useMemo(() => {
    if (!user) return ROUTES.PUBLIC.HOME;
    return user.role === UserRole.ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.USER.DASHBOARD;
  }, [user]);

  // Active when location startsWith path (handles nested routes)
  const isActiveLink = useCallback((path: string) => {
    if (!path) return false;
    // exact match for root paths
    if (path === ROUTES.PUBLIC.HOME || path === "") return location.pathname === ROUTES.PUBLIC.HOME;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }, [location.pathname]);

  const isUserToolsActive = useCallback(() => {
    const userToolsPaths = [
      ROUTES.USER.USER_TASKS, ROUTES.USER.DAILY_TASK_UPDATES, ROUTES.USER.USER_NOTES, ROUTES.USER.OFFICE_VISIT, 
      ROUTES.USER.OFFICE_VISIT_ANALYTICS, ROUTES.USER.LEAVE_MANAGEMENT, 
      ROUTES.USER.LEAVE_POLICY, ROUTES.USER.HOLIDAY_TRACKER
    ];
    return userToolsPaths.some(p => isActiveLink(p));
  }, [isActiveLink]);

  const handleLogout = useCallback(() => {
    setActiveDropdown(null);
    logout();
  }, [logout]);

  const handleDropdownToggle = useCallback((dropdownId: string) => {
    setActiveDropdown(current => current === dropdownId ? null : dropdownId);
  }, []);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (!navRef.current) return;
      if (!navRef.current.contains(target)) {
        setActiveDropdown(null);
        setMobileOpen(false);
        setNotificationsOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMobileOpen(false);
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Collapse toggler (mobile)
  const toggleMobile = useCallback(() => {
    setMobileOpen(v => !v);
    // close dropdowns when toggling mobile menu
    setActiveDropdown(null);
  }, []);

  // Render helpers
  const renderNavLink = useCallback((to: string, children: React.ReactNode, className = "nav-link text-white nav-hover") => {
    const active = isActiveLink(to);
    const linkClasses = `${className} ${active ? "active" : ""}`;
    return (
      <Link className={linkClasses} to={to} aria-current={active ? "page" : undefined}>
        {children}
      </Link>
    );
  }, [isActiveLink]);

  const renderDropdownItem = useCallback((item: DropdownItem, onClick?: () => void) => {
    if (item.divider) {
      return <li key={`divider-${Math.random()}`}><hr className="dropdown-divider" /></li>;
    }

    const active = isActiveLink(item.to);

    if (item.label === t("navigation.logout")) {
      return (
        <li key={item.to}>
          <button
            className="dropdown-item text-danger"
            onClick={() => { onClick?.(); handleLogout(); }}
            type="button"
            role="menuitem"
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
          className={`dropdown-item ${active ? "active" : ""}`}
          to={item.to}
          onClick={() => { onClick?.(); setActiveDropdown(null); setMobileOpen(false); }}
          role="menuitem"
          aria-current={active ? "page" : undefined}
        >
          <i className={`${item.icon} me-2`} aria-hidden="true"></i>
          {item.label}
        </Link>
      </li>
    );
  }, [handleLogout, isActiveLink, t]);

  const renderDropdownMenu = useCallback((items: DropdownItem[], menuId: string, labelledBy: string, isOpen: boolean) => {
    return (
      <ul
        className={`dropdown-menu dropdown-menu-dark shadow-lg animate-fade ${isOpen ? 'show' : ''}`}
        aria-labelledby={labelledBy}
        id={menuId}
        role="menu"
        style={{ display: isOpen ? "block" : "none" }}
      >
        {items.map(item => renderDropdownItem(item, () => setActiveDropdown(null)))}
      </ul>
    );
  }, [renderDropdownItem]);

  const userDisplayName = useMemo(() => user?.name || t("navigation.profile"), [user?.name, t]);

  const hasRole = useCallback((role: UserRole) => user?.role === role, [user?.role]);

  // keyboard: when dropdown button receives ArrowDown, open & focus first item
  const handleDropdownKeyDown = useCallback((e: React.KeyboardEvent, menuId: string) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveDropdown(menuId);
      // focus first menu item after tiny delay
      window.setTimeout(() => {
        const menu = document.getElementById(menuId);
        const first = menu?.querySelector<HTMLElement>('.dropdown-item');
        first?.focus();
      }, 50);
    }
  }, []);

  // ensure dropdown buttons refs
  const setDropdownButtonRef = (id: string, el: HTMLButtonElement | null) => {
    dropdownRefs.current[id] = el;
  };

  return (
    <nav
      className="navbar navbar-expand-lg custom-navbar fixed-top shadow-sm"
      role="navigation"
      aria-label={t("navigation.mainNavigation")}
      ref={el => { navRef.current = el; }}
    >
      <div className="container-fluid">
        {/* Brand */}
        <Link
          className="navbar-brand fw-bold text-white d-flex align-items-center"
          to={brandLink}
          aria-label={t("navigation.workplaceTracker")}
        >
          <i className="bi bi-briefcase-fill me-2" aria-hidden="true" />
          <span>{t("navigation.workplaceTracker")}</span>
        </Link>

        {/* Mobile toggler */}
        <button
          className={`navbar-toggler border-0 shadow-none ${mobileOpen ? '' : ''}`}
          type="button"
          aria-controls="navbarNav"
          aria-expanded={mobileOpen}
          aria-label={t("navigation.toggleMenu")}
          onClick={toggleMobile}
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Links */}
        <div className={`collapse navbar-collapse ${mobileOpen ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav me-auto align-items-lg-center">
            <li className="nav-item">
              {renderNavLink(homeLink, t("navigation.home"))}
            </li>

            {hasRole(UserRole.ADMIN) && (
              <li className="nav-item dropdown">
                <button
                  ref={(el) => setDropdownButtonRef('admin', el)}
                  className={`nav-link dropdown-toggle text-white btn btn-link nav-hover ${activeDropdown === 'admin' ? 'active' : ''}`}
                  id="adminMenu"
                  type="button"
                  onClick={() => handleDropdownToggle('admin')}
                  onKeyDown={(e) => handleDropdownKeyDown(e, 'adminDropdown')}
                  onBlur={() => setTimeout(() => setActiveDropdown(null), 150)}
                  aria-expanded={activeDropdown === 'admin'}
                  aria-haspopup="true"
                >
                  <i className="bi bi-gear-fill me-1" aria-hidden="true"></i>
                  {t("navigation.adminTools")}
                </button>
                {renderDropdownMenu(adminNavItems, 'adminDropdown', 'adminMenu', activeDropdown === 'admin')}
              </li>
            )}

            {hasRole(UserRole.USER) && (
              <li className="nav-item dropdown">
                <button
                  ref={(el) => setDropdownButtonRef('user', el)}
                  className={`nav-link dropdown-toggle text-white btn btn-link nav-hover ${isUserToolsActive() ? 'active' : ''}`}
                  id="userTools"
                  type="button"
                  onClick={() => handleDropdownToggle('user')}
                  onKeyDown={(e) => handleDropdownKeyDown(e, 'userDropdown')}
                  onBlur={() => setTimeout(() => setActiveDropdown(null), 150)}
                  aria-expanded={activeDropdown === 'user'}
                  aria-haspopup="true"
                >
                  <i className="bi bi-tools me-1" aria-hidden="true"></i>
                  {t("navigation.userTools")}
                  {isUserToolsActive() && (
                    <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.6rem' }}>
                      {isActiveLink('/user-tasks') ? 'Tasks' : (isActiveLink('/user-notes') ? 'Notes' : '')}
                    </span>
                  )}
                </button>
                {renderDropdownMenu(userNavItems, 'userDropdown', 'userTools', activeDropdown === 'user')}
              </li>
            )}

            <li className="nav-item">
              {renderNavLink(ROUTES.PUBLIC.ABOUT, t("navigation.about"))}
            </li>
            <li className="nav-item">
              {renderNavLink(ROUTES.PUBLIC.CONTACT, t("navigation.contact"))}
            </li>
          </ul>

          {/* Right side */}
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item d-flex align-items-center me-2">
              <LanguageSelector />
            </li>

            <li className="nav-item d-flex align-items-center me-2">
              <ThemeToggle />
            </li>
            
            {/* Notifications dropdown - only show for users */}
            {user && user.role === UserRole.USER && (
              <li className="nav-item d-flex align-items-center me-2 position-relative">
                <NotificationBadge onClick={() => setNotificationsOpen(!notificationsOpen)} />
                {notificationsOpen && (
                  <UserNotifications 
                    isOpen={notificationsOpen} 
                    onClose={() => setNotificationsOpen(false)} 
                  />
                )}
              </li>
            )}

            {/* Session Timer - show for logged in users */}
            {user && (
              <li className="nav-item d-flex align-items-center me-3">
                <SessionTimer />
              </li>
            )}

            {user ? (
              <li className="nav-item dropdown">
                <button
                  ref={(el) => setDropdownButtonRef('profile', el)}
                  className={`nav-link dropdown-toggle text-white btn btn-link nav-hover ${activeDropdown === 'profile' ? 'active' : ''}`}
                  id="userMenu"
                  type="button"
                  onClick={() => handleDropdownToggle('profile')}
                  onKeyDown={(e) => handleDropdownKeyDown(e, 'profileDropdown')}
                  onBlur={() => setTimeout(() => setActiveDropdown(null), 150)}
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
                {renderNavLink(ROUTES.PUBLIC.LOGIN,
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

Navbar.displayName = "Navbar";

export default Navbar;
