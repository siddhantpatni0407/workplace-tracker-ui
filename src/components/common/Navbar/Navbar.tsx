// src/components/Navbar/Navbar.tsx
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
          to={user ? (user.role === "ADMIN" ? "/admin" : "/user") : "/"}
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
                to={user ? (user.role === "ADMIN" ? "/admin" : "/user") : "/"}
              >
                Home
              </Link>
            </li>

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
                    <Link className="dropdown-item" to="/reports">
                      <i className="bi bi-bar-chart-fill me-2"></i> Reports
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/db-backup">
                      <i className="bi bi-database-fill-lock me-2"></i> DB Backup
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

          {/* Right side */}
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
                    <Link className="dropdown-item" to="/settings">
                      <i className="bi bi-sliders2-vertical me-2"></i> Settings
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={logout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <Link
                  className="btn btn-light btn-sm px-3 fw-semibold nav-auth-btn"
                  to="/login"
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i> Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
