import React from "react";
import { Role } from "../types/auth";

interface RoleSelectProps {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;       // ✅ optional disabled
  className?: string;       // ✅ optional className for styling
}

const RoleSelect: React.FC<RoleSelectProps> = ({
  value,
  onChange,
  disabled = false,
  className = "form-select", // default bootstrap style
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Role)}
      disabled={disabled}
      className={className}
    >
      <option value="USER">User</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
};

export default RoleSelect;
