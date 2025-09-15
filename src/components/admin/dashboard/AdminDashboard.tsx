// src/components/admin/dashboard/AdminDashboard.tsx
import React, { memo, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../common/Header/Header";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "../../../hooks/useTranslation";
import { UserRole } from "../../../enums";
import { ErrorBoundary, LoadingSpinner } from "../../ui";
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
}

/**
 * Dashboard shows feature cards only (no stats / user table).
 * Cards use Bootstrap icons (make sure bootstrap & bootstrap-icons are included in your app).
 */
const AdminDashboard: React.FC = memo(() => {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Memoize admin cards configuration
  const cards = useMemo<AdminCard[]>(() => [
    {
      id: "user-management",
      title: t('dashboard.adminDashboard.cards.userManagement.title'),
      subtitle: t('dashboard.adminDashboard.cards.userManagement.subtitle'),
      icon: "bi-people-fill",
      colorClass: "card-blue",
      route: "/user-management",
      requiresRole: UserRole.ADMIN,
    },
    {
      id: "reports",
      title: t('dashboard.adminDashboard.cards.reports.title'),
      subtitle: t('dashboard.adminDashboard.cards.reports.subtitle'),
      icon: "bi-bar-chart-line-fill",
      colorClass: "card-purple",
      route: "/user-analytics",
      requiresRole: UserRole.ADMIN,
    },
    {
      id: "holidays",
      title: t('dashboard.adminDashboard.cards.holidayManagement.title'),
      subtitle: t('dashboard.adminDashboard.cards.holidayManagement.subtitle'),
      icon: "bi-calendar-event-fill",
      colorClass: "card-teal",
      route: "/holiday-management",
      requiresRole: UserRole.ADMIN,
    },
    {
      id: "leave-policies",
      title: t('dashboard.adminDashboard.cards.leavePolicyManagement.title'),
      subtitle: t('dashboard.adminDashboard.cards.leavePolicyManagement.subtitle'),
      icon: "bi-file-earmark-medical-fill",
      colorClass: "card-green",
      route: "/leave-policies",
      requiresRole: UserRole.ADMIN,
    },
    {
      id: "backup",
      title: t('dashboard.adminDashboard.cards.dbBackup.title'),
      subtitle: t('dashboard.adminDashboard.cards.dbBackup.subtitle'),
      icon: "bi-hdd-fill",
      colorClass: "card-teal",
      route: "/admin/backup",
      requiresRole: UserRole.ADMIN,
    },
    {
      id: "attendance",
      title: t('dashboard.adminDashboard.cards.attendance.title'),
      subtitle: t('dashboard.adminDashboard.cards.attendance.subtitle'),
      icon: "bi-calendar-check-fill",
      colorClass: "card-orange",
      route: "/attendance",
      requiresRole: UserRole.ADMIN,
    },
  ], [t]);

  // Handle navigation with useCallback
  const handleCardClick = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  // Check if user has admin role
  const isAdmin = useMemo(() => {
    return user?.role === UserRole.ADMIN;
  }, [user?.role]);

  // Filter cards based on user permissions
  const visibleCards = useMemo(() => {
    return cards.filter(card => 
      !card.requiresRole || user?.role === card.requiresRole
    );
  }, [cards, user?.role]);

  // Memoize user display name
  const userDisplayName = useMemo(() => {
    return user?.name || "Admin";
  }, [user?.name]);

  if (isLoading) {
    return (
      <div className="admin-page container-fluid py-4">
        <Header 
          title={t('dashboard.adminDashboard.title')} 
          subtitle={t('dashboard.adminDashboard.subtitle')} 
          isLoading={true}
        />
        <div className="d-flex justify-content-center mt-4">
          <LoadingSpinner size="xl" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <ErrorBoundary>
        <div className="admin-page container-fluid py-4">
          <Header 
            title="Access Denied" 
            subtitle="You don't have permission to access this page"
            eyebrow="Error"
          />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="admin-page container-fluid py-4">
        <Header 
          title={t('dashboard.adminDashboard.title')} 
          subtitle={t('dashboard.adminDashboard.subtitle')}
          showWave={true}
        />
        <p className="lead mb-4">Welcome, {userDisplayName} (Admin)</p>

        <div className="cards-grid">
          {visibleCards.map((c) => (
            <button
              key={c.id}
              className={`feature-card ${c.colorClass}`}
              onClick={() => handleCardClick(c.route)}
              aria-label={`Navigate to ${c.title}`}
              type="button"
            >
              <div className="card-logo">
                <i className={`bi ${c.icon}`} aria-hidden="true" />
              </div>

              <div className="card-content">
                <h5 className="card-title">{c.title}</h5>
                <p className="card-sub">{c.subtitle}</p>
              </div>

              <div className="card-cta">
                <span className="btn btn-sm btn-light">Open</span>
              </div>
            </button>
          ))}
        </div>

        <LastLoginPopup lastLoginTime={user?.lastLoginTime ?? null} />
      </div>
    </ErrorBoundary>
  );
});

AdminDashboard.displayName = 'AdminDashboard';

export default AdminDashboard;
