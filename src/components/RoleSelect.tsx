import React from "react";
import { Role } from "../types/auth";

interface RoleSelectProps {
  value: Role;
  onChange: (role: Role) => void;
}

const RoleSelect: React.FC<RoleSelectProps> = ({ value, onChange }) => {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as Role)}>
      <option value="USER">User</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
};

export default RoleSelect;
