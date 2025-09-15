import React from "react";
import { Link } from "react-router-dom";
import "./not-found.css";

const NotFound: React.FC = () => {
  return (
    <div className="notfound-container d-flex align-items-center justify-content-center min-vh-100 text-center">
      <div className="card shadow-lg p-5 notfound-card">
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <h2 className="fw-semibold mb-3">Oops! Page Not Found</h2>
        <p className="text-muted mb-4">
          The page you’re looking for doesn’t exist, was removed, or is
          temporarily unavailable.
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <Link to="/" className="btn btn-primary btn-lg shadow-sm">
            Go Home
          </Link>
          <Link to="/contact" className="btn btn-outline-secondary btn-lg shadow-sm">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
