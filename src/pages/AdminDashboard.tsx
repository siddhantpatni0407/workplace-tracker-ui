import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";

/**
 * Dashboard shows feature cards only (no stats / user table).
 * Cards use Bootstrap icons (make sure bootstrap & bootstrap-icons are included in your app).
 */
const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      id: "user-management",
      title: "User Management",
      subtitle: "Manage users, lock/unlock or change status",
      icon: "bi-people-fill",
      colorClass: "card-blue",
      action: () => navigate("/user-management"),
    },
    {
      id: "reports",
      title: "Reports",
      subtitle: "Attendance & usage reports",
      icon: "bi-bar-chart-line-fill",
      colorClass: "card-purple",
      action: () => navigate("/reports"),
    },
    {
      id: "backup",
      title: "DB Backup",
      subtitle: "Create or download backups",
      icon: "bi-hdd-fill",
      colorClass: "card-teal",
      action: () => navigate("/admin/backup"),
    },
    {
      id: "attendance",
      title: "Attendance",
      subtitle: "Daily / Monthly summaries",
      icon: "bi-calendar-check-fill",
      colorClass: "card-orange",
      action: () => navigate("/attendance"),
    },
  ];

  return (
    <div className="admin-page container-fluid py-4">
      <Header title="Admin Dashboard" subtitle="Manage users and reports" />
      <p className="lead mb-4">Welcome, {user?.name} (Admin)</p>

      <div className="cards-grid">
        {cards.map((c) => (
          <button
            key={c.id}
            className={`feature-card ${c.colorClass}`}
            onClick={c.action}
            aria-label={c.title}
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
    </div>
  );
};

export default AdminDashboard;
