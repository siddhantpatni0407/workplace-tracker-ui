// src/components/common/login/Login.tsx
import React, { useEffect, useRef, useState, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../services/authService";
import { ErrorBoundary, ErrorMessage } from "../../ui";
import { ValidationUtils } from "../../../utils";
import { useTranslation } from "../../../hooks/useTranslation";
import "./login.css";

interface LoginFormData {
  email: string;
  password: string;
  captcha: string;
}

const Login: React.FC = memo(() => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  }, [error]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Generate random character for captcha
  const randomChar = useCallback(() => {
    const pool = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    return pool.charAt(Math.floor(Math.random() * pool.length));
  }, []);

  // Generate new captcha
  const generateCaptcha = useCallback((length = 5) => {
    const text = Array.from({ length }, randomChar).join("");
    setCaptchaSolution(text);
    drawCaptcha(text);
  }, [randomChar]);

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 200;
    const h = 50;
    canvas.width = w;
    canvas.height = h;

    // background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#f3f4f6");
    grad.addColorStop(1, "#ffffff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // add noise rectangles
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 120)}, ${Math.floor(
        Math.random() * 120
      )}, ${Math.floor(Math.random() * 120)}, ${Math.random() * 0.12 + 0.02})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 30, Math.random() * 10);
    }

    // draw text with varying rotation and position
    const charSpacing = w / (text.length + 1);
    for (let i = 0; i < text.length; i++) {
      const fontSize = 24 + Math.floor(Math.random() * 10);
      ctx.font = `${fontSize}px "Arial", sans-serif`;
      ctx.textBaseline = "middle";
      const x = charSpacing * (i + 1) + (Math.random() * 6 - 3);
      const y = h / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() * 30 - 15) * (Math.PI / 180);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = `rgba(${50 + Math.floor(Math.random() * 120)}, ${50 +
        Math.floor(Math.random() * 120)}, ${50 + Math.floor(Math.random() * 120)}, 0.9)`;
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    // draw interfering lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${40 + Math.floor(Math.random() * 160)}, ${40 +
        Math.floor(Math.random() * 160)}, ${40 + Math.floor(Math.random() * 160)}, ${0.25 +
        Math.random() * 0.35})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.quadraticCurveTo(Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h);
      ctx.stroke();
    }

    // dots noise
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(
        Math.random() * 200
      )}, ${Math.random() * 0.6})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Generate captcha on mount
  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleRefreshCaptcha = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    generateCaptcha();
    setForm(prev => ({ ...prev, captcha: "" }));
  }, [generateCaptcha]);

  // Validate form
  const validateForm = useCallback((): string | null => {
    if (!form.email.trim()) {
      return t("validation.emailRequired");
    }
    if (!ValidationUtils.isValidEmail(form.email)) {
      return t("validation.emailInvalid");
    }
    if (!form.password.trim()) {
      return t("validation.passwordRequired");
    }
    if (form.password.length < 6) {
      return t("validation.passwordMinLength");
    }
    if (!form.captcha.trim()) {
      return t("validation.captchaRequired");
    }
    if (form.captcha.trim().toLowerCase() !== captchaSolution.trim().toLowerCase()) {
      return t("validation.captchaInvalid");
    }
    return null;
  }, [form, captchaSolution, t]);

  // Check if form can be submitted
  const canSubmit = form.email.trim() !== "" &&
                   form.password.trim() !== "" &&
                   form.captcha.trim() !== "" &&
                   !loading;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      if (validationError.includes("captcha")) {
        handleRefreshCaptcha();
      }
      return;
    }

    setError(null);
    setLoading(true);
    
    try {
      const response = await authService.login(form.email, form.password, {
        mathCaptchaAnswer: form.captcha.trim(),
      });

      if (response.status === "SUCCESS" && (response.token || response.accessToken)) {
        authService.saveSession(response);
        const role = response.role || "USER";
        navigate(role === "ADMIN" ? "/admin-dashboard" : "/user-dashboard");
        window.location.reload(); // let AuthProvider rehydrate from storage
      } else {
        const message = response.message?.toLowerCase().includes("locked")
          ? "Your account is locked due to failed attempts. Reset your password or contact admin."
          : response.message || "Invalid credentials. Please try again.";
        setError(message);
        handleRefreshCaptcha();
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ||
                     error?.message ||
                     "Something went wrong. Please try again.";
      setError(message);
      handleRefreshCaptcha();
    } finally {
      setLoading(false);
    }
  }, [canSubmit, validateForm, form, handleRefreshCaptcha, navigate]);

  return (
    <ErrorBoundary>
      <div className="login-bg d-flex align-items-center justify-content-center">
        <div className="login-card shadow-lg">
          <div className="login-head">
            <i className="bi bi-shield-lock-fill me-2" aria-hidden />
            Sign in
          </div>

          <div className="p-4 p-md-5">
            {error && <ErrorMessage error={error} />}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label fw-semibold">{t("auth.email")}</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">
                    <i className="bi bi-envelope-fill" />
                  </span>
                  <input
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder={t("auth.emailPlaceholder")}
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label fw-semibold">{t("auth.password")}</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">
                    <i className="bi bi-key-fill" />
                  </span>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder={t("auth.passwordPlaceholder")}
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="input-group-text btn-toggle"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`} />
                  </button>
                </div>
              </div>

              {/* CAPTCHA */}
              <div className="mb-3 captcha-block">
                <label className="form-label fw-semibold small mb-2">
                  {t("auth.captchaLabel")}
                </label>

                <div className="d-flex align-items-center gap-2 mb-2">
                  <canvas ref={canvasRef} className="captcha-canvas" aria-hidden />
                  <button
                    type="button"
                    className="btn btn-light captcha-refresh"
                    onClick={handleRefreshCaptcha}
                    title="Refresh captcha"
                  >
                    <i className="bi bi-arrow-clockwise" />
                  </button>
                </div>

                <input
                  type="text"
                  name="captcha"
                  className="form-control"
                  placeholder={t("auth.captchaPlaceholder")}
                  value={form.captcha}
                  onChange={handleChange}
                  disabled={loading}
                  aria-label={t("auth.captchaAriaLabel")}
                  required
                />
              </div>

              {/* Remember / Forgot */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="rememberMe" />
                  <label className="form-check-label" htmlFor="rememberMe">
                    {t("auth.rememberMe")}
                  </label>
                </div>
                <button
                  type="button"
                  className="btn btn-link p-0 small"
                  onClick={() => navigate("/forgot-password")}
                >
                  {t("auth.forgotPassword")}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 login-submit"
                disabled={!canSubmit}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden />
                    {t("auth.signingIn")}
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2" />
                    {t("auth.login")}
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="text-center text-muted my-3">or</div>

              {/* Sign up */}
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => navigate("/signup")}
                disabled={loading}
              >
                <i className="bi bi-person-plus-fill me-2" />
                Create an account
              </button>
            </form>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

Login.displayName = "Login";

export default Login;
