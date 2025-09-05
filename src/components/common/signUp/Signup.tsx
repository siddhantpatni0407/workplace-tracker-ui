import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "../../../types/auth";
import RoleSelect from "../../RoleSelect";
import { authService } from "../../../services/authService";
import "./Signup.css";

interface FormData {
  name: string;
  mobileNumber: string;
  email: string;
  password: string;
  role: Role;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    name: "",
    mobileNumber: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sanitizeMobile = (value: string) => value.replace(/\D/g, "").slice(0, 10);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "mobileNumber") {
      setForm((p) => ({ ...p, mobileNumber: sanitizeMobile(value) }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleRoleChange = (role: Role) => setForm((p) => ({ ...p, role }));

  const validate = (): string | null => {
    if (!form.name.trim()) return "Name is required.";
    if (form.mobileNumber.length !== 10) return "Mobile number must be 10 digits.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.password) return "Password is required.";
    if (form.password.length < 6) return "Password should be at least 6 characters.";
    return null;
  };

  const canSubmit = useMemo(() => !loading && !!form.email && !!form.password && !!form.name, [form, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSuccess(null);

    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setLoading(true);
    try {
      const resp = await authService.signup({
        name: form.name,
        mobileNumber: form.mobileNumber,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      if (resp.status === "SUCCESS") {
        setSuccess(resp.message || "Signup successful. Redirecting to login...");
        // optionally auto-login: save session & navigate
        if (resp.token) {
          authService.saveSession(resp);
          // go to role-based route or landing
          const role = resp.role || "USER";
          navigate(role === "ADMIN" ? "/admin" : "/user");
          window.location.reload();
        } else {
          // show confirmation then send user to login
          setTimeout(() => navigate("/login"), 1400);
        }
      } else {
        setErr(resp.message || "Signup failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setErr(error?.response?.data?.message || error?.message || "Network/server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-bg d-flex align-items-center justify-content-center">
      <div className="signup-card shadow-lg">
        <div className="signup-head">
          <i className="bi bi-person-plus-fill me-2" />
          Create account
        </div>

        <div className="p-4 p-md-5">
          {err && (
            <div className="alert alert-danger d-flex gap-2 align-items-start mb-3" role="alert">
              <i className="bi bi-x-circle-fill mt-1" />
              <div>{err}</div>
            </div>
          )}
          {success && <div className="alert alert-success mb-3">{success}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label fw-semibold">Full name</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text"><i className="bi bi-person-fill" /></span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your full name"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Mobile number</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text">+91</span>
                <input
                  name="mobileNumber"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="10-digit number"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-text">Numbers only — 10 digits</div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text"><i className="bi bi-envelope-fill" /></span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="you@example.com"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text"><i className="bi bi-key-fill" /></span>
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Choose a strong password"
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

            <div className="mb-3">
              <label className="form-label fw-semibold">Role</label>
              <RoleSelect value={form.role} onChange={handleRoleChange} disabled={loading} />
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={!canSubmit}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden />
                  Creating...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill me-2" />
                  Sign up
                </>
              )}
            </button>

            <div className="text-center text-muted small mt-3">
              Already have an account?{" "}
              <button type="button" className="btn btn-link p-0" onClick={() => navigate("/login")}>
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
