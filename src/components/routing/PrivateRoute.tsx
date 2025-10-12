import React, { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../constants";
import RedirectingLoader from "../common/redirectingLoader/RedirectingLoader";
import { useTranslation } from "../../hooks";

interface PrivateRouteProps {
  children: ReactNode; // same as your current typing
  /**
   * Optional role restriction.
   * - If omitted => any authenticated user allowed.
   * - Can be a single role string like "USER" or "ADMIN", or an array of roles.
   */
  userRole?: "ADMIN" | "USER" | Array<"ADMIN" | "USER">;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, userRole }) => {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

  // Show loading while authentication is being checked
  if (isLoading) {
    return <RedirectingLoader message={t("loading.verifying.authentication")} showProgress={false} />;
  }

  // not authenticated -> redirect (keeps your existing behavior)
  if (!user) return <Navigate to={ROUTES.PUBLIC.HOME} replace />;

  // no role restriction -> allow any authenticated user
  if (!userRole) return <>{children}</>;

  // Normalize allowed roles to array for simple check
  const allowed: string[] = Array.isArray(userRole) ? userRole.map((r) => r.toUpperCase()) : [String(userRole).toUpperCase()];

  const currentUserRole = user?.role ? String(user.role).toUpperCase() : undefined;

  // if user's role is in allowed list -> allow, otherwise redirect
  if (currentUserRole && allowed.includes(currentUserRole)) {
    return <>{children}</>;
  }

  // authenticated but not authorized -> redirect (same as before)
  return <Navigate to={ROUTES.PUBLIC.HOME} replace />;
};

export default PrivateRoute;
