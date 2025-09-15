// src/components/LastLoginPopup/LastLoginPopup.tsx
import React, { useEffect, useState } from "react";
import "./last-login-popup.css";

export interface LastLoginPopupProps {
  lastLoginTime?: string | null;
}

const LastLoginPopup: React.FC<LastLoginPopupProps> = ({ lastLoginTime }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastLoginTime) return;

    // Use lastLoginTime as unique key
    const key = `lastLoginShown_${lastLoginTime}`;
    const alreadyShown = sessionStorage.getItem(key);

    if (!alreadyShown) {
      setVisible(true);
      sessionStorage.setItem(key, "true");

      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastLoginTime]);

  if (!visible || !lastLoginTime) return null;

  let formatted = "";
  try {
    formatted = new Date(lastLoginTime).toLocaleString();
  } catch {
    formatted = lastLoginTime;
  }

  return (
    <div className="last-login-popup shadow-lg">
      <i className="bi bi-clock-history me-2"></i>
      <span>Last login: {formatted}</span>
    </div>
  );
};

export default LastLoginPopup;
