// src/components/common/theme/ThemeToggle.tsx
import React from "react";
import { useTheme } from "../../../theme/ThemeContext";
import "./themetoggle.css";

const ThemeToggle: React.FC = () => {
  const { effectiveTheme, setTheme, theme } = useTheme();

  const handleToggle = () => {
    // switch between light and dark explicitly (preserve 'system' only if user set it)
    const next = effectiveTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <button
      className="theme-toggle-btn"
      title={effectiveTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      aria-label={effectiveTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      onClick={handleToggle}
      type="button"
    >
      <i className={`bi ${effectiveTheme === "dark" ? "bi-moon-fill" : "bi-sun-fill"}`} aria-hidden="true" />
      {theme === "system" && <span className="theme-badge" aria-hidden="true">●</span>}
    </button>
  );
};

export default ThemeToggle;
