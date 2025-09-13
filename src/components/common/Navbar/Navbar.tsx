// src/components/common/navbar/Navbar.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg custom-navbar fixed-top shadow-sm">
      <div className="container-fluid">
        {/* Brand */}
        <Link
          className="navbar-brand fw-bold text-white"
          to={user ? (user.role === "ADMIN" ? "/admin-dashboard" : "/user-dashboard") : "/"}
        >
          <i className="bi bi-briefcase-fill me-2"></i>
          Workplace Tracker
        </Link>

        {/* Toggler (mobile) */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto align-items-lg-center">
            <li className="nav-item">
              <Link
                className="nav-link text-white nav-hover"
                to={user ? (user.role === "ADMIN" ? "/admin-dashboard" : "/user-dashboard") : "/"}
              >
                Home
              </Link>
            </li>

            {/* Admin Tools Dropdown */}
            {user?.role === "ADMIN" && (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle text-white btn btn-link nav-hover"
                  id="adminMenu"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-gear-fill me-1"></i> Admin Tools
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-dark shadow-lg animate-fade"
                  aria-labelledby="adminMenu"
                >
                  <li>
                    <Link className="dropdown-item" to="/user-management">
                      <i className="bi bi-people-fill me-2"></i> User Management
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/user-analytics">
                      <i className="bi bi-bar-chart-line-fill me-2"></i> User Analytics
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/holiday-management">
                      <i className="bi bi-calendar-event-fill me-2"></i> Holiday Management
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/leave-policies">
                      <i className="bi bi-file-earmark-medical-fill me-2"></i> Leave Policy Management
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/backup">
                      <i className="bi bi-hdd-fill me-2"></i> DB Backup
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/attendance">
                      <i className="bi bi-calendar-check-fill me-2"></i> Attendance
                    </Link>
                  </li>
                </ul>
              </li>
            )}

            {/* User Tools Dropdown (visible to USER and ADMIN too) */}
            {(user?.role === "USER") && (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle text-white btn btn-link nav-hover"
                  id="userTools"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-tools me-1"></i> Tools
                </button>

                <ul
                  className="dropdown-menu dropdown-menu-dark shadow-lg animate-fade"
                  aria-labelledby="userTools"
                >
                  {/* My Tasks (first) */}
                  <li>
                    <Link className="dropdown-item" to="/my-tasks">
                      <i className="bi bi-list-check me-2"></i> My Tasks
                    </Link>
                  </li>

                  {/* Office Visit */}
                  <li>
                    <Link className="dropdown-item" to="/office-visit">
                      <i className="bi bi-building me-2"></i> Office Visit
                    </Link>
                  </li>
                  
                  {/* Office Visit Analytics */}
                  <li>
                    <Link className="dropdown-item" to="/office-visit-analytics">
                      <i className="bi bi-bar-chart-line-fill me-2"></i> Office Visit Analytics
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="/apply-leave">
                      <i className="bi bi-plus-square-dotted me-2"></i> Apply Leave
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="/leave-policy">
                      <i className="bi bi-file-earmark-text-fill me-2"></i> Leave Policy
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="/holiday-tracker">
                      <i className="bi bi-calendar-event me-2"></i> Holidays
                    </Link>
                  </li>

                </ul>
              </li>
            )}

            <li className="nav-item">
              <Link className="nav-link text-white nav-hover" to="/about">
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white nav-hover" to="/contact">
                Contact
              </Link>
            </li>
          </ul>

          {/* Right side (Profile / Settings / Logout) */}
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {user ? (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle text-white btn btn-link nav-hover"
                  id="userMenu"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {user.name || "Profile"}
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow-lg animate-fade"
                  aria-labelledby="userMenu"
                >
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person-badge-fill me-2"></i> My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/user-settings">
                      <i className="bi bi-sliders2-vertical me-2"></i> Settings
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={logout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
