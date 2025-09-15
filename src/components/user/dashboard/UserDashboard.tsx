import React, { memo, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../common/Header/Header";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "../../../hooks/useTranslation";
import { UserRole } from "../../../enums";
import { ErrorBoundary } from "../../ui";
import "./user-dashboard.css";

interface DashboardCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  colorClass: string;
  route: string;
  roles?: UserRole[];
}

const UserDashboard: React.FC = memo(() => {
    const { user, isLoading } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Memoize dashboard cards configuration
    const cards = useMemo<DashboardCard[]>(() => [
        {
            id: "tasks",
            title: t('dashboard.userDashboard.cards.tasks.title'),
            subtitle: t('dashboard.userDashboard.cards.tasks.subtitle'),
            icon: "bi-list-task",
            colorClass: "card-blue",
            route: "/user-tasks",
        },
        {
            id: "office-visit",
            title: t('dashboard.userDashboard.cards.officeVisit.title'),
            subtitle: t('dashboard.userDashboard.cards.officeVisit.subtitle'),
            icon: "bi-building",
            colorClass: "card-purple",
            route: "/office-visit",
        },
        {
            id: "office-visit-analytics",
            title: t('dashboard.userDashboard.cards.officeVisitAnalytics.title'),
            subtitle: t('dashboard.userDashboard.cards.officeVisitAnalytics.subtitle'),
            icon: "bi-graph-up",
            colorClass: "card-teal",
            route: "/office-visit-analytics",
        },
        {
            id: "holidays",
            title: t('dashboard.userDashboard.cards.holidays.title'),
            subtitle: t('dashboard.userDashboard.cards.holidays.subtitle'),
            icon: "bi-sun-fill",
            colorClass: "card-orange",
            route: "/holiday-tracker",
        },
        {
            id: "apply-leave",
            title: t('dashboard.userDashboard.cards.leaveManagement.title'),
            subtitle: t('dashboard.userDashboard.cards.leaveManagement.subtitle'),
            icon: "bi-plus-square-dotted",
            colorClass: "card-indigo",
            route: "/apply-leave",
        },
        {
            id: "leave-policy",
            title: t('dashboard.userDashboard.cards.leavePolicy.title'),
            subtitle: t('dashboard.userDashboard.cards.leavePolicy.subtitle'),
            icon: "bi-file-earmark-text-fill",
            colorClass: "card-green",
            route: "/leave-policy",
        },
        {
            id: "my-notes",
            title: t('dashboard.userDashboard.cards.notes.title'),
            subtitle: t('dashboard.userDashboard.cards.notes.subtitle'),
            icon: "bi-journal-text",
            colorClass: "card-indigo",
            route: "/user-notes",
        },
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

    // Filter cards based on user permissions
    const visibleCards = useMemo(() => {
        return cards.filter(hasAccess);
    }, [cards, hasAccess]);

    if (isLoading) {
        return (
            <div className="user-dashboard container-fluid py-4">
                <Header
                    title={t('dashboard.userDashboard.title')}
                    subtitle={t('dashboard.userDashboard.subtitle')}
                    isLoading={true}
                />
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="user-dashboard container-fluid py-4">
                <Header
                    title={t('dashboard.userDashboard.title')}
                    subtitle={`${t('dashboard.userDashboard.subtitle')}${userDisplayName}`}
                    showWave={true}
                />

                <div className="cards-grid mt-4">
                    {visibleCards.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            className={`feature-card ${c.colorClass}`}
                            onClick={() => handleCardClick(c.route)}
                            aria-label={`Navigate to ${c.title}`}
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
            </div>
        </ErrorBoundary>
    );
});

UserDashboard.displayName = 'UserDashboard';

export default UserDashboard;
