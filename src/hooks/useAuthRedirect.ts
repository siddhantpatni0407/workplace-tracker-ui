// src/hooks/useAuthRedirect.ts
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants';

interface UseAuthRedirectReturn {
  isRedirecting: boolean;
  redirectRole: string;
  redirectToDashboard: (role?: string, delay?: number) => void;
  redirectToLogin: (delay?: number) => void;
}

export const useAuthRedirect = (): UseAuthRedirectReturn => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectRole, setRedirectRole] = useState('');

  const redirectToDashboard = useCallback((role?: string, delay: number = 3000) => {
    const targetRole = role || user?.role || 'USER';
    setRedirectRole(targetRole);
    setIsRedirecting(true);

    setTimeout(() => {
      const dashboardRoute = String(targetRole).toUpperCase() === 'ADMIN' 
        ? ROUTES.ADMIN.DASHBOARD 
        : ROUTES.USER.DASHBOARD;
      navigate(dashboardRoute);
    }, delay);
  }, [navigate, user?.role]);

  const redirectToLogin = useCallback((delay: number = 2000) => {
    setRedirectRole('');
    setIsRedirecting(true);

    setTimeout(() => {
      navigate(ROUTES.PUBLIC.LOGIN);
    }, delay);
  }, [navigate]);

  return {
    isRedirecting,
    redirectRole,
    redirectToDashboard,
    redirectToLogin
  };
};

export default useAuthRedirect;