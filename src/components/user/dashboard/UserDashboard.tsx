import React, { memo, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../common/header/Header";
import { useAuth } from "../../../context/AuthContext";
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
    const navigate = useNavigate();

    // Memoize dashboard cards configuration
    const cards = useMemo<DashboardCard[]>(() => [
        {
            id: "tasks",
            title: "My Tasks",
            subtitle: "Create and manage your tasks",
            icon: "bi-list-task",
            colorClass: "card-blue",
            route: "/task-tracker",
        },
        {
            id: "office-visit",
            title: "Office Visit",
            subtitle: "Log office visits & check-ins",
            icon: "bi-building",
            colorClass: "card-purple",
            route: "/office-visit",
        },
        {
            id: "office-visit-analytics",
            title: "Office Visit Analytics",
            subtitle: "Monthly/weekly visit summaries",
            icon: "bi-graph-up",
            colorClass: "card-teal",
            route: "/office-visit-analytics",
        },
        {
            id: "holidays",
            title: "Holidays",
            subtitle: "View company holidays",
            icon: "bi-sun-fill",
            colorClass: "card-orange",
            route: "/holiday-tracker",
        },
        {
            id: "apply-leave",
            title: "Apply Leave",
            subtitle: "Submit a new leave request",
            icon: "bi-plus-square-dotted",
            colorClass: "card-indigo",
            route: "/apply-leave",
        },
        {
            id: "leave-policy",
            title: "Leave Policy",
            subtitle: "Check leave policy rules",
            icon: "bi-file-earmark-text-fill",
            colorClass: "card-green",
            route: "/leave-policy",
        },
        {
            id: "my-notes",
            title: "My Notes",
            subtitle: "Personal notes & reminders",
            icon: "bi-journal-text",
            colorClass: "card-indigo",
            route: "/notes",
        },
    ], []);

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
                    title="User Dashboard"
                    subtitle="Loading..."
                    isLoading={true}
                />
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="user-dashboard container-fluid py-4">
                <Header
                    title="User Dashboard"
                    subtitle={`Welcome${userDisplayName}`}
                    eyebrow="Dashboard"
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
