import React from "react";
import Header from "../components/Header/Header";
import { useAuth } from "../context/AuthContext";
import LastLoginPopup from "../components/LastLoginPopup/LastLoginPopup";
import "./UserDashboard.css";

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  // Example placeholders — replace with real data / API calls later
  const stats = {
    daysThisMonth: 15,
    wfoDays: 8,
    wfhDays: 7,
    pendingLeaves: 1,
  };

  const recentActivities = [
    { id: 1, text: "Checked in (Office)", time: "Today • 09:02 AM" },
    { id: 2, text: "Applied for leave (2 days)", time: "3 days ago" },
    { id: 3, text: "Marked work from home", time: "Last week" },
  ];

  return (
    <div className="user-dashboard">
      <Header title="User Dashboard" subtitle="Track your work and attendance" />

      <div className="dashboard-grid">
        {/* Welcome Card */}
        <section className="card welcome-card">
          <div className="welcome-left">
            <h3 className="mb-1">Welcome back, {user?.name || "User"} 👋</h3>
            <p className="text-muted mb-3">
              Role: <strong>{user?.role}</strong>
            </p>
            <div className="d-flex gap-2">
              <button className="btn btn-primary btn-sm">Log Attendance</button>
              <button className="btn btn-outline-primary btn-sm">Request Leave</button>
            </div>
          </div>

          <div className="welcome-right text-end">
            <div className="small-muted">Last login</div>
            <div className="last-login">—</div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="stats-row">
          <div className="card stat-card">
            <div className="stat-value">{stats.daysThisMonth}</div>
            <div className="stat-label">Days this month</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{stats.wfoDays}</div>
            <div className="stat-label">WFO</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{stats.wfhDays}</div>
            <div className="stat-label">WFH</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{stats.pendingLeaves}</div>
            <div className="stat-label">Pending leaves</div>
          </div>
        </section>

        {/* Main content area */}
        <section className="main-row">
          <div className="card activities-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Activity</h5>
              <small className="text-muted">Auto-updates</small>
            </div>

            <div className="card-body">
              <ul className="list-unstyled mb-0">
                {recentActivities.map((act) => (
                  <li key={act.id} className="activity-item d-flex justify-content-between align-items-center">
                    <div>
                      <div className="activity-text">{act.text}</div>
                      <div className="text-muted small">{act.time}</div>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary">Details</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card shifts-card">
            <div className="card-header">
              <h5 className="mb-0">Upcoming Shift</h5>
            </div>
            <div className="card-body">
              <p className="mb-2"><strong>Today • Work from Office</strong></p>
              <p className="text-muted mb-3">Shift: 09:00 AM - 06:00 PM</p>
              <div className="d-grid gap-2">
                <button className="btn btn-success btn-sm">Check-in</button>
                <button className="btn btn-outline-secondary btn-sm">Mark WFH</button>
              </div>
            </div>
          </div>
        </section>
      </div>
      <LastLoginPopup lastLoginTime={user?.lastLoginTime} />
    </div>
  );
};

export default UserDashboard;
