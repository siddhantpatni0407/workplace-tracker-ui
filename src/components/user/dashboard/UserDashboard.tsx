import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../common/header/Header";
import { useAuth } from "../../../context/AuthContext";
import "./UserDashboard.css";

const UserDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const cards = [
        {
            id: "tasks",
            title: "Tasks",
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
    ];

    return (
        <div className="user-dashboard container-fluid py-4">
            <Header
                title="User Dashboard"
                subtitle={`Welcome${user?.name ? ", " + user.name : ""}`}
            />

            <div className="cards-grid mt-4">
                {cards.map((c) => (
                    <button
                        key={c.id}
                        type="button"
                        className={`feature-card ${c.colorClass}`}
                        onClick={() => navigate(c.route)}
                        aria-label={c.title}
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
    );
};

export default UserDashboard;
