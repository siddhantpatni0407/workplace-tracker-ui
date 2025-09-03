import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg custom-navbar fixed-top shadow-sm">
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand fw-bold text-white" to="/">
          Workplace Tracker
        </Link>

        {/* Toggle button (mobile) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {/* Common Links */}
            <li className="nav-item">
              <Link className="nav-link text-white" to="/about">
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/contact">
                Contact
              </Link>
            </li>

            {/* Role-based Links */}
            {user?.role === "ADMIN" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/admin">
                    Admin Dashboard
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle text-white btn btn-link"
                    id="adminMenu"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Admin Tools
                  </button>
                  <ul className="dropdown-menu dropdown-menu-dark">
                    <li>
                      <Link className="dropdown-item" to="/reports">
                        Reports
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/user-management">
                        User Management
                      </Link>
                    </li>
                  </ul>
                </li>
              </>
            )}

            {user?.role === "USER" && (
              <li className="nav-item">
                <Link className="nav-link text-white" to="/user">
                  User Dashboard
                </Link>
              </li>
            )}
          </ul>

          {/* Right Side (Auth/User Profile) */}
          <ul className="navbar-nav ms-auto">
            {user ? (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle text-white btn btn-link"
                  id="userMenu"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {user.name || "Profile"}
                </button>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/settings">
                      Settings
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={logout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="btn btn-outline-light btn-sm" to="/">
                  Login
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
