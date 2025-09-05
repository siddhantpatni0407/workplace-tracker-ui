import React from "react";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer text-light text-center py-3 mt-auto">
      <div className="container">
        <small>
          © {new Date().getFullYear()} Workplace Tracker. All rights reserved.
        </small>
      </div>
    </footer>
  );
};

export default Footer;
