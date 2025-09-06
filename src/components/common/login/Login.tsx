// src/components/common/login/Login.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../services/authService";
import "./Login.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // captcha states
  const [captchaValue, setCaptchaValue] = useState(""); // text user types
  const [captchaSolution, setCaptchaSolution] = useState(""); // expected
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // generate captcha on mount
  useEffect(() => {
    generateCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = useMemo(
    () =>
      form.email.trim() !== "" &&
      form.password.trim() !== "" &&
      captchaValue.trim() !== "" &&
      !loading,
    [form, loading, captchaValue]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // Captcha generator (draws to canvas and sets solution)
  const randomChar = () => {
    const pool = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"; // avoid ambiguous chars
    return pool.charAt(Math.floor(Math.random() * pool.length));
  };

  const generateCaptcha = (length = 5) => {
    const text = Array.from({ length }, randomChar).join("");
    setCaptchaSolution(text);
    drawCaptcha(text);
  };

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

  const handleRefreshCaptcha = (e?: React.MouseEvent) => {
    e?.preventDefault();
    generateCaptcha();
    setCaptchaValue("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // client-side captcha validation (case-insensitive)
    if (captchaValue.trim().toLowerCase() !== captchaSolution.trim().toLowerCase()) {
      setErr("Invalid captcha. Please try again.");
      // regenerate to avoid brute force
      generateCaptcha();
      setCaptchaValue("");
      return;
    }

    setErr(null);
    setLoading(true);
    try {
      // send captcha answer as mathCaptchaAnswer (authService supports it)
      const resp = await authService.login(form.email, form.password, {
        mathCaptchaAnswer: captchaValue.trim(),
      });

      // authService.normalizeAuthResponse maps token/accessToken into resp
      if (resp.status === "SUCCESS" && (resp.token || resp.accessToken)) {
        authService.saveSession(resp);
        const role = resp.role || "USER";
        navigate(role === "ADMIN" ? "/admin" : "/user");
        window.location.reload(); // let AuthProvider rehydrate from storage
      } else {
        const msg =
          resp.message?.toLowerCase().includes("locked")
            ? "Your account is locked due to failed attempts. Reset your password or contact admin."
            : resp.message || "Invalid credentials. Please try again.";
        setErr(msg);
        // regenerate captcha for next attempt
        generateCaptcha();
        setCaptchaValue("");
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Something went wrong. Please try again.";
      setErr(msg);
      generateCaptcha();
      setCaptchaValue("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg d-flex align-items-center justify-content-center">
      <div className="login-card shadow-lg">
        <div className="login-head">
          <i className="bi bi-shield-lock-fill me-2" aria-hidden />
          Sign in
        </div>

        <div className="p-4 p-md-5">
          {err && (
            <div className="alert alert-danger d-flex align-items-start gap-2 mb-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill mt-1" />
              <div>{err}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text"><i className="bi bi-envelope-fill" /></span>
                <input
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text"><i className="bi bi-key-fill" /></span>
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="input-group-text btn-toggle"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  <i className={`bi ${showPw ? "bi-eye-slash-fill" : "bi-eye-fill"}`} />
                </button>
              </div>
            </div>

            {/* CAPTCHA (image + refresh + input) */}
            <div className="mb-3 captcha-block">
              <label className="form-label fw-semibold small mb-2">Prove you're not a robot</label>

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
                className="form-control"
                placeholder="Enter Captcha"
                value={captchaValue}
                onChange={(e) => setCaptchaValue(e.target.value)}
                disabled={loading}
                aria-label="Enter captcha"
                required
              />
            </div>

            {/* Remember / Forgot */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="rememberMe" />
                <label className="form-check-label" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="btn btn-link p-0 small"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
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
                  Signing in…
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2" />
                  Login
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
  );
};

export default Login;
