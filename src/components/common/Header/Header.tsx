import React from "react";
import "./Header.css";

interface HeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string; // small text above title, e.g. "Dashboard"
  bgImage?: string; // optional URL for a background image
  actions?: React.ReactNode; // optional slot for buttons or small controls
  id?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, eyebrow, bgImage, actions, id }) => {
  return (
    <header
      id={id || "page-header"}
      className="header-section text-white"
      role="banner"
      aria-label={title}
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      <div className="header-overlay" aria-hidden />
      <div className="header-inner container">
        {eyebrow && <div className="header-eyebrow">{eyebrow}</div>}
        <h1 className="fw-bold header-title">{title}</h1>
        {subtitle && <p className="lead header-subtitle">{subtitle}</p>}

        {actions && <div className="header-actions mt-3">{actions}</div>}
      </div>

      {/* decorative SVG wave at bottom */}
      <div className="header-wave" aria-hidden>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" focusable="false">
          <path d="M0,40 C360,100 1080,-20 1440,40 L1440,80 L0,80 Z" fill="rgba(255,255,255,0.07)"></path>
        </svg>
      </div>
    </header>
  );
};

export default Header;
