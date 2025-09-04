// src/pages/Landing.tsx
import React from "react";
import { Link } from "react-router-dom";

const Landing: React.FC = () => {
  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div
        className="row w-100 shadow-lg rounded-4 overflow-hidden"
        style={{ maxWidth: "1000px" }}
      >
        {/* Left Column: Info */}
        <div className="col-md-6 bg-primary text-white d-flex flex-column justify-content-center p-5">
          <h1 className="fw-bold mb-4">
            Welcome to <span className="text-warning">Workplace Tracker</span>
          </h1>
          <p className="lead mb-4">
            Track attendance, office visits, and work-from-home days—all in one place.
          </p>
          <ul className="list-unstyled fs-6">
            <li className="mb-2">
              <i className="bi bi-check-circle-fill me-2 text-warning"></i>
              Track Work From Office & Home
            </li>
            <li className="mb-2">
              <i className="bi bi-check-circle-fill me-2 text-warning"></i>
              Monthly & Yearly Reports
            </li>
            <li className="mb-2">
              <i className="bi bi-check-circle-fill me-2 text-warning"></i>
              Role-Based Dashboards
            </li>
          </ul>
        </div>

        {/* Right Column: Actions */}
        <div className="col-md-6 bg-white d-flex flex-column align-items-center justify-content-center p-5">
          <h2 className="text-center mb-4 fw-bold text-primary">Get Started</h2>
          <div className="d-grid gap-3 w-100" style={{ maxWidth: "300px" }}>
            <Link to="/login" className="btn btn-primary btn-lg shadow-sm">
              Login
            </Link>
            <Link
              to="/signup"
              className="btn btn-outline-primary btn-lg shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
