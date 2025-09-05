import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../services/authService";
import "./Login.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => form.email.trim() !== "" && form.password.trim() !== "" && !loading,
    [form, loading]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErr(null);
    setLoading(true);
    try {
      const resp = await authService.login(form.email, form.password);

      if (resp.status === "SUCCESS" && resp.token) {
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
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Something went wrong. Please try again.";
      setErr(msg);
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
