import React, { useState } from "react";
import { Role } from "../../types/auth";
import { useTranslation } from "../../hooks/useTranslation";

interface RoleSelectProps {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  showIcon?: boolean;
}

const RoleSelect: React.FC<RoleSelectProps> = ({
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  showIcon = true,
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const { t } = useTranslation();
  
  const getRoleIcon = (role: Role) => {
    return role === "ADMIN" ? "bi-shield-fill-check" : "bi-person-fill";
  };

  const getRoleDescription = (role: Role) => {
    return role === "ADMIN" 
      ? t("auth.roleAdminDescription")
      : t("auth.roleUserDescription");
  };

  const getRoleName = (role: Role) => {
    return role === "ADMIN" 
      ? t("auth.roleAdmin")
      : t("auth.roleUser");
  };

  const getRoleBadgeColor = (role: Role) => {
    return role === "ADMIN" ? "badge-admin" : "badge-user";
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsChanging(true);
    onChange(e.target.value as Role);
    
    // Reset animation state after animation completes
    setTimeout(() => setIsChanging(false), 600);
  };

  return (
    <div className={`role-select-wrapper ${isChanging ? 'role-changing' : ''}`}>
      {showIcon && (
        <div className="input-group input-group-lg">
          <span className={`input-group-text role-icon ${getRoleBadgeColor(value)}`}>
            <i className={`bi ${getRoleIcon(value)}`} />
          </span>
          <select
            value={value}
            onChange={handleRoleChange}
            disabled={disabled}
            className={`form-select form-select-lg role-dropdown ${error ? "is-invalid" : ""} ${className}`}
            aria-label={t("auth.selectRole")}
          >
            <option value="USER">👤 {t("auth.roleUser")}</option>
            <option value="ADMIN">🛡️ {t("auth.roleAdmin")}</option>
          </select>
          <span className="input-group-text role-indicator">
            <i className="bi bi-chevron-down" />
          </span>
          {error && <div className="invalid-feedback">{error}</div>}
        </div>
      )}
      
      {!showIcon && (
        <select
          value={value}
          onChange={handleRoleChange}
          disabled={disabled}
          className={`form-select ${error ? "is-invalid" : ""} ${className}`}
          aria-label={t("auth.selectRole")}
        >
          <option value="USER">{t("auth.roleUser")}</option>
          <option value="ADMIN">{t("auth.roleAdmin")}</option>
        </select>
      )}
      
      {/* Role Description with Badge */}
      <div className="role-description mt-2">
        <div className="d-flex align-items-center justify-content-between">
          <small className="text-muted d-flex align-items-center">
            <i className={`bi ${getRoleIcon(value)} me-2`} />
            {getRoleDescription(value)}
          </small>
          <span className={`badge role-badge ${getRoleBadgeColor(value)}`}>
            {getRoleName(value)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
