import React from "react";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer text-light text-center py-3 mt-auto">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
        <small className="footer-copy">
          © {new Date().getFullYear()} Workplace Tracker. All rights reserved.
        </small>
        <small className="footer-dev">
          Developed by <span className="dev-name">Siddhant Patni</span>
        </small>
      </div>
    </footer>
  );
};

export default Footer;
