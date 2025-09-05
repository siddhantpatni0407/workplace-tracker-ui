// src/components/LastLoginPopup.tsx
import React, { useEffect, useState } from "react";
import "./LastLoginPopup.css";

interface Props {
  lastLoginTime?: string | null;
}

const LastLoginPopup: React.FC<Props> = ({ lastLoginTime }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible || !lastLoginTime) return null;

  const formatted = new Date(lastLoginTime).toLocaleString();

  return (
    <div className="last-login-popup shadow-lg animate-popup">
      <i className="bi bi-clock-history me-2 fs-5" aria-hidden="true"></i>
      <div className="popup-text">
        <span className="fw-bold">Last login</span>
        <small className="d-block">{formatted}</small>
      </div>
    </div>
  );
};

export default LastLoginPopup;
