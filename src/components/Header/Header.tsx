import React from "react";
import "./Header.css";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="header-section text-center text-white">
      <div className="overlay">
        <h1 className="fw-bold header-title">{title}</h1>
        {subtitle && <p className="lead header-subtitle">{subtitle}</p>}
      </div>
    </header>
  );
};

export default Header;
