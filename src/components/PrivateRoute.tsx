import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
  children: ReactNode; // same as your current typing
  /**
   * Optional role restriction.
   * - If omitted => any authenticated user allowed.
   * - Can be a single role string like "USER" or "ADMIN", or an array of roles.
   */
  role?: "ADMIN" | "USER" | Array<"ADMIN" | "USER">;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const { user } = useAuth();

  // not authenticated -> redirect (keeps your existing behavior)
  if (!user) return <Navigate to="/" replace />;

  // no role restriction -> allow any authenticated user
  if (!role) return <>{children}</>;

  // Normalize allowed roles to array for simple check
  const allowed: string[] = Array.isArray(role) ? role.map((r) => r.toUpperCase()) : [String(role).toUpperCase()];

  const userRole = user?.role ? String(user.role).toUpperCase() : undefined;

  // if user's role is in allowed list -> allow, otherwise redirect
  if (userRole && allowed.includes(userRole)) {
    return <>{children}</>;
  }

  // authenticated but not authorized -> redirect (same as before)
  return <Navigate to="/" replace />;
};

export default PrivateRoute;
