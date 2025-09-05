import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Landing: React.FC = () => {
  return (
    <div className="landing-root">
      <div className="landing-card shadow-lg rounded-4 overflow-hidden">
        {/* Left Column: Info */}
        <div className="landing-left">
          <div className="landing-left-inner">
            <h1 className="landing-title">
              Welcome to <span className="highlight">Workplace Tracker</span>
            </h1>
            <p className="landing-sub">
              Track attendance, office visits, and work-from-home days — all in one
              place. Smart reports, role-based dashboards and an intuitive UI to
              simplify daily operations.
            </p>

            <ul className="landing-features" aria-hidden="false">
              <li>
                <span className="dot" aria-hidden="true" /> Track WFO & WFH days
              </li>
              <li>
                <span className="dot" aria-hidden="true" /> Monthly & yearly
                reports
              </li>
              <li>
                <span className="dot" aria-hidden="true" /> Admin & user
                dashboards
              </li>
              <li>
                <span className="dot" aria-hidden="true" /> Attendance, tasks,
                leaves & holidays
              </li>
            </ul>

            <div className="landing-note">
              <small>
                Built for teams — start by signing up or logging in to connect
                your organization.
              </small>
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="landing-right d-flex align-items-center justify-content-center">
          <div className="cta-wrap">
            <h2 className="cta-title">Get Started</h2>
            <p className="cta-sub text-muted">
              Use your workspace account or create one to begin.
            </p>

            <div className="d-grid gap-3 w-100">
              <Link
                to="/login"
                className="btn btn-solid btn-lg"
                aria-label="Go to Login Page"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="btn btn-outline btn-lg"
                aria-label="Go to Signup Page"
              >
                Sign Up
              </Link>

              <Link
                to="/about"
                className="btn btn-link-muted btn-sm mt-2"
                aria-label="Learn more about Workplace Tracker"
              >
                Learn more
              </Link>
            </div>

            <div className="small-meta mt-4 text-muted text-center">
              <small>Secure · Lightweight · Team-focused</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
