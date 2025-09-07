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
  confirmPassword: string;
  role: Role;
  acceptTerms: boolean;
}

const initialForm: FormData = {
  name: "",
  mobileNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "USER",
  acceptTerms: false,
};

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(initialForm);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const sanitizeMobile = (value: string) => value.replace(/\D/g, "").slice(0, 10);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (name === "mobileNumber") {
      setForm((p) => ({ ...p, mobileNumber: sanitizeMobile(value) }));
    } else if (type === "checkbox") {
      setForm((p) => ({ ...p, [name]: checked } as unknown as FormData));
    } else {
      setForm((p) => ({ ...p, [name]: value } as unknown as FormData));
    }
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setErr(null);
  };

  const handleRoleChange = (role: Role) => setForm((p) => ({ ...p, role }));

  // Basic validators
  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const passwordScore = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0..4
  };

  const passwordStrengthLabel = (score: number) =>
    score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong";

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.mobileNumber || form.mobileNumber.length !== 10) errs.mobileNumber = "Enter a 10-digit mobile number";
    if (!form.email.trim() || !isEmail(form.email)) errs.email = "Enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match";
    if (!form.acceptTerms) errs.acceptTerms = "You must accept the terms and conditions";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const canSubmit = useMemo(() => {
    return (
      !loading &&
      form.name.trim() !== "" &&
      form.email.trim() !== "" &&
      form.password !== "" &&
      form.confirmPassword !== ""
    );
  }, [form, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSuccess(null);

    if (!validate()) return;

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
        // auto-login if token returned
        if (resp.token || resp.accessToken) {
          authService.saveSession(resp);
          const role = resp.role || "USER";
          navigate(role === "ADMIN" ? "/admin-dashboard" : "/user-dashboard");
          window.location.reload();
          return;
        }
        setTimeout(() => navigate("/login"), 1200);
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

  const strength = passwordScore(form.password);

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
                  className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`}
                  placeholder="Enter your full name"
                  disabled={loading}
                  required
                />
                {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
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
                  className={`form-control ${fieldErrors.mobileNumber ? "is-invalid" : ""}`}
                  placeholder="10-digit number"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  disabled={loading}
                  required
                />
                {fieldErrors.mobileNumber && <div className="invalid-feedback">{fieldErrors.mobileNumber}</div>}
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
                  className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
                  placeholder="you@example.com"
                  disabled={loading}
                  required
                />
                {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
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
                  className={`form-control ${fieldErrors.password ? "is-invalid" : ""}`}
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
                {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
              </div>

              <div className="password-hint mt-2 d-flex align-items-center justify-content-between">
                <div className="strength">
                  <div className={`strength-bar strength-${strength}`} aria-hidden />
                  <small className="ms-2 text-muted">{passwordStrengthLabel(strength)}</small>
                </div>
                <div className="small text-muted">Use 8+ chars, mix letters, numbers & symbols.</div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Confirm password</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text"><i className="bi bi-lock-fill" /></span>
                <input
                  name="confirmPassword"
                  type={showPw ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`form-control ${fieldErrors.confirmPassword ? "is-invalid" : ""}`}
                  placeholder="Re-enter password"
                  disabled={loading}
                  required
                />
                {fieldErrors.confirmPassword && <div className="invalid-feedback">{fieldErrors.confirmPassword}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Role</label>
              <RoleSelect value={form.role} onChange={handleRoleChange} disabled={loading} />
            </div>

            <div className="mb-3 form-check">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                className={`form-check-input ${fieldErrors.acceptTerms ? "is-invalid" : ""}`}
                checked={form.acceptTerms}
                onChange={handleChange}
                disabled={loading}
              />
              <label className="form-check-label" htmlFor="acceptTerms">
                I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">terms & conditions</a>
              </label>
              {fieldErrors.acceptTerms && <div className="invalid-feedback">{fieldErrors.acceptTerms}</div>}
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
