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
    switch (role) {
      case "SUPER_ADMIN":
        return "bi-star-fill";
      case "ADMIN":
        return "bi-shield-fill-check";
      case "MANAGER":
        return "bi-people-fill";
      case "USER":
      default:
        return "bi-person-fill";
    }
  };

  const getRoleDescription = (role: Role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return t("auth.roleSuperAdminDescription");
      case "ADMIN":
        return t("auth.roleAdminDescription");
      case "MANAGER":
        return t("auth.roleManagerDescription");
      case "USER":
      default:
        return t("auth.roleUserDescription");
    }
  };

  const getRoleName = (role: Role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return t("auth.roleSuperAdmin");
      case "ADMIN":
        return t("auth.roleAdmin");
      case "MANAGER":
        return t("auth.roleManager");
      case "USER":
      default:
        return t("auth.roleUser");
    }
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "badge-super-admin";
      case "ADMIN":
        return "badge-admin";
      case "MANAGER":
        return "badge-manager";
      case "USER":
      default:
        return "badge-user";
    }
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
            <option value="MANAGER">👥 {t("auth.roleManager")}</option>
            <option value="ADMIN">🛡️ {t("auth.roleAdmin")}</option>
            <option value="SUPER_ADMIN">⭐ {t("auth.roleSuperAdmin")}</option>
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
          <option value="MANAGER">{t("auth.roleManager")}</option>
          <option value="ADMIN">{t("auth.roleAdmin")}</option>
          <option value="SUPER_ADMIN">{t("auth.roleSuperAdmin")}</option>
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
