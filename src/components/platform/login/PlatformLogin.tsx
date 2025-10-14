// src/components/platform/login/PlatformLogin.tsx
import React, { useState, useRef, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { usePlatformAuth } from "../../../context/PlatformAuthContext";
import { ErrorBoundary, Alert, Captcha, CaptchaRef } from "../../ui";
import { useFormValidation } from "../../../hooks";
import { useTranslation } from "../../../hooks/useTranslation";
import { ROUTES, AUTH_FIELDS, AUTH_ERRORS, API_ENDPOINTS } from "../../../constants";
import RedirectingLoader from "../../common/redirectingLoader/RedirectingLoader";
import { toast } from "react-toastify";
import "./PlatformLogin.css";

interface PlatformLoginFormData {
  email: string;
  password: string;
  captcha: string;
}

const PlatformLogin: React.FC = memo(() => {
  const navigate = useNavigate();
  const { platformLogin } = usePlatformAuth();
  const { t } = useTranslation();
  const captchaRef = useRef<CaptchaRef>(null);
  
  // Form state
  const [form, setForm] = useState<PlatformLoginFormData>({
    email: "",
    password: "",
    captcha: ""
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [captchaSolution, setCaptchaSolution] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Form validation schema
  const validationSchema = {
    email: { required: true, email: true },
    password: { required: true, minLength: 6 },
    captcha: {
      required: true,
      custom: (value: string) => {
        if (value.trim().toLowerCase() !== captchaSolution.trim().toLowerCase()) {
          return t("validation.captchaInvalid");
        }
        return null;
      }
    }
  };

  const { errors, validate, clearError } = useFormValidation(form, validationSchema);

  // Handle input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (errors[name]) clearError(name);
  }, [error, errors, clearError]);

  const handleCaptchaSolutionChange = useCallback((solution: string) => {
    setCaptchaSolution(solution);
    setForm(prev => ({ ...prev, captcha: "" }));
  }, []);

  const canSubmit = form.email.trim() && form.password.trim() && form.captcha.trim() && !loading;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const isValid = validate();
    if (!isValid) {
      if (errors.captcha) captchaRef.current?.refresh();
      return;
    }

    setError(null);
    setLoading(true);
    
    try {
      const response = await platformLogin({
        emailOrMobile: form.email,
        password: form.password
      });

      if (response && response.status === "SUCCESS" && response.token) {
        toast.success(response.message || "Platform login successful!");
        
        // Navigate to platform dashboard
        navigate(ROUTES.PLATFORM.DASHBOARD);
      } else {
        throw new Error(response?.message || "Invalid response from server");
      }
    } catch (error: any) {
      console.error("Platform login error:", error);
      
      let errorMessage = t("platform.login.failed") || "Platform login failed";
      if (error.response?.data?.status === "FAILED" && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Reset captcha on error
      captchaRef.current?.refresh();
      setForm(prev => ({ ...prev, captcha: "" }));
    } finally {
      setLoading(false);
    }
  }, [form, canSubmit, validate, errors, t, navigate]);

  if (loading) {
    return <RedirectingLoader 
      message={t("platform.login.signingIn") || "Signing in to platform..."} 
      role="PLATFORM_ADMIN"
    />;
  }

  return (
    <div className="platform-login-container">
      <ErrorBoundary>
        <div className="platform-login-card">
          <div className="platform-login-header">
            <h1 className="platform-login-title">
              {t("platform.login.title") || "Platform Login"}
            </h1>
            <p className="platform-login-subtitle">
              {t("platform.login.subtitle") || "Access your platform management dashboard"}
            </p>
          </div>

          {error && <Alert message={error} />}

          <form onSubmit={handleSubmit} className="platform-login-form">
            <div className="platform-form-group">
              <label htmlFor="email" className="platform-form-label">
                {t(AUTH_FIELDS.LABELS.EMAIL) || "Email Address"}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`platform-form-input ${errors.email ? 'platform-form-input-error' : ''}`}
                value={form.email}
                onChange={handleChange}
                placeholder={t(AUTH_FIELDS.PLACEHOLDERS.EMAIL) || "Enter your email"}
                required
              />
              {errors.email && <span className="platform-form-error">{errors.email}</span>}
            </div>

            <div className="platform-form-group">
              <label htmlFor="password" className="platform-form-label">
                {t(AUTH_FIELDS.LABELS.PASSWORD) || "Password"}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={`platform-form-input ${errors.password ? 'platform-form-input-error' : ''}`}
                value={form.password}
                onChange={handleChange}
                placeholder={t(AUTH_FIELDS.PLACEHOLDERS.PASSWORD) || "Enter your password"}
                required
              />
              {errors.password && <span className="platform-form-error">{errors.password}</span>}
            </div>

            <div className="platform-form-group">
              <Captcha
                ref={captchaRef}
                onSolutionChange={handleCaptchaSolutionChange}
              />
              <input
                name="captcha"
                type="text"
                className={`platform-form-input ${errors.captcha ? 'platform-form-input-error' : ''}`}
                value={form.captcha}
                onChange={handleChange}
                placeholder={t(AUTH_FIELDS.PLACEHOLDERS.CAPTCHA) || "Enter captcha"}
                required
              />
              {errors.captcha && <span className="platform-form-error">{errors.captcha}</span>}
            </div>

            <button
              type="submit"
              className="platform-btn platform-btn-primary platform-btn-full"
              disabled={loading}
            >
              {loading 
                ? (t("common.loading") || "Loading...") 
                : (t("auth.login") || "Sign In")
              }
            </button>
          </form>

          <div className="platform-login-footer">
            <p>
              {t("platform.login.noAccount") || "Don't have a platform account?"} {" "}
              <button
                type="button"
                onClick={() => navigate(ROUTES.PLATFORM.SIGNUP)}
                className="platform-link-button"
              >
                {t("platform.login.signUp") || "Sign Up"}
              </button>
            </p>
            <p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.PLATFORM.HOME)}
                className="platform-link-button"
              >
                {t("platform.login.backToHome") || "← Back to Platform Home"}
              </button>
            </p>
            <p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.PUBLIC.HOME)}
                className="platform-link-button"
              >
                {t("platform.login.backToMainApp") || "← Back to Main Application"}
              </button>
            </p>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
});

PlatformLogin.displayName = "PlatformLogin";

export default PlatformLogin;