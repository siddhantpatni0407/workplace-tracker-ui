// src/components/common/login/Login.tsx
import React, { useState, useRef, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ErrorBoundary, Alert, Captcha, CaptchaRef } from "../../ui";
import { useFormValidation } from "../../../hooks";
import { useTranslation } from "../../../hooks/useTranslation";
import { ROUTES, AUTH_FIELDS, AUTH_ERRORS } from "../../../constants";
import "./login.css";

interface LoginFormData {
  email: string;
  password: string;
  captcha: string;
}

const Login: React.FC = memo(() => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();
  const captchaRef = useRef<CaptchaRef>(null);
  
  // Form state
  const [form, setForm] = useState<LoginFormData>({
    email: "",
    password: "",
    captcha: ""
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaSolution, setCaptchaSolution] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Form validation schema using our new validation hook
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

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

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
      // Use AuthContext login which includes user settings loading
      const response = await login(form.email, form.password, {
        mathCaptchaAnswer: form.captcha.trim(),
      });

      if (response.status === "SUCCESS" && (response.token || response.accessToken)) {
        const role = response.role || "USER";
        navigate(role === "ADMIN" ? ROUTES.ADMIN.DASHBOARD : ROUTES.USER.DASHBOARD);
        // Note: No need for window.location.reload() as AuthContext handles state updates
      } else {
        const message = response.message?.toLowerCase().includes("locked")
          ? "Your account is locked due to failed attempts. Reset your password or contact admin."
          : response.message || "Invalid credentials. Please try again.";
        setError(message);
        captchaRef.current?.refresh();
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error?.response?.data?.message || error?.message || AUTH_ERRORS.NETWORK);
      captchaRef.current?.refresh();
    } finally {
      setLoading(false);
    }
  }, [canSubmit, validate, errors.captcha, form, navigate, login]);

  return (
    <ErrorBoundary>
      <div className="login-bg d-flex align-items-center justify-content-center">
        <div className="login-card shadow-lg">
          <div className="login-head">
            <h3 className="fw-bold text-center mb-2">{t(AUTH_FIELDS.HEADERS.WELCOME)}</h3>
            <p className="text-center mb-0 login-subtitle">{t(AUTH_FIELDS.HEADERS.LOGIN_SUBTITLE)}</p>
          </div>

          <div className="p-4 p-md-5">
            <form onSubmit={handleSubmit} noValidate>
              {/* Global Error Alert */}
              {error && (
                <Alert
                  variant="error"
                  message={error}
                  onClose={() => setError(null)}
                  className="mb-3"
                />
              )}

              {/* Email Input */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  {t(AUTH_FIELDS.LABELS.EMAIL)}
                  <span className="text-danger ms-1">*</span>
                </label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">
                    <i className="bi bi-envelope-fill" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    placeholder={t(AUTH_FIELDS.PLACEHOLDERS.EMAIL)}
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  {t(AUTH_FIELDS.LABELS.PASSWORD)}
                  <span className="text-danger ms-1">*</span>
                </label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">
                    <i className="bi bi-lock-fill" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    placeholder={t(AUTH_FIELDS.PLACEHOLDERS.PASSWORD)}
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="input-group-text btn-toggle"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`} />
                  </button>
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>
              </div>

              {/* Captcha */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  {t(AUTH_FIELDS.LABELS.CAPTCHA_LABEL)}
                  <span className="text-danger ms-1">*</span>
                </label>
                
                <Captcha
                  ref={captchaRef}
                  onSolutionChange={handleCaptchaSolutionChange}
                  className="mb-2"
                />
                
                <div className="input-group input-group-lg">
                  <span className="input-group-text">
                    <i className="bi bi-calculator" />
                  </span>
                  <input
                    type="text"
                    name="captcha"
                    className={`form-control ${errors.captcha ? "is-invalid" : ""}`}
                    placeholder={t(AUTH_FIELDS.PLACEHOLDERS.CAPTCHA)}
                    value={form.captcha}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                  {errors.captcha && <div className="invalid-feedback">{errors.captcha}</div>}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 mb-3"
                disabled={!canSubmit}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden />
                    {t(AUTH_FIELDS.BUTTONS.LOGGING_IN)}
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill me-2" />
                    {t(AUTH_FIELDS.BUTTONS.LOGIN)}
                  </>
                )}
              </button>

              {/* Sign Up Link */}
              <div className="text-center">
                <span className="text-muted">{t(AUTH_FIELDS.LINKS.NO_ACCOUNT)} </span>
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={() => navigate(ROUTES.PUBLIC.SIGNUP)}
                >
                  {t(AUTH_FIELDS.BUTTONS.SIGNUP)}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

Login.displayName = "Login";

export default Login;
