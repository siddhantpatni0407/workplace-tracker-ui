import React, { useState, memo, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "../../../types/auth";
import { RoleSelect } from "../../forms";
import { authService } from "../../../services/authService";
import { ErrorBoundary, Alert } from "../../ui"; // Modal removed
import { useFormValidation } from "../../../hooks";
import { useTranslation } from "../../../hooks/useTranslation";
import { ROUTES } from "../../../constants";
import "./signup.css";

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

const Signup: React.FC = memo(() => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Form state
  const [form, setForm] = useState<FormData>(initialForm);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Validation schema using our new validation hook
  const validationSchema = {
    name: { required: true, minLength: 2 },
    mobileNumber: {
      required: true,
      custom: (value: string) => {
        const sanitized = value.replace(/\D/g, "");
        if (sanitized.length !== 10) return "Mobile number must be 10 digits";
        return null;
      }
    },
    email: { required: true, email: true },
    password: {
      required: true,
      minLength: 8,
      custom: (value: string) => {
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
          return "Password must contain uppercase, lowercase, number and special character";
        }
        return null;
      }
    },
    confirmPassword: {
      required: true,
      custom: (value: string) => {
        if (value !== form.password) return "Passwords do not match";
        return null;
      }
    },
    role: {
      required: true,
      custom: (value: Role) => {
        if (!["USER", "ADMIN"].includes(value)) return "Please select a valid role";
        return null;
      }
    },
    acceptTerms: {
      required: true,
      custom: (value: boolean) => {
        if (!value) return "You must accept the terms and conditions";
        return null;
      }
    }
  };

  const { errors, validate, clearError } = useFormValidation(form, validationSchema);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const password = form.password;
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    return Math.min(strength, 4);
  }, [form.password]);

  const passwordStrengthLabel = (strength: number) => {
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    return labels[strength] || "Very Weak";
  };

  // Handle input changes
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;

      let newValue: any = value;
      if (name === "mobileNumber") {
        newValue = value.replace(/\D/g, "").slice(0, 10);
      } else if (type === "checkbox") {
        newValue = checked;
      }

      setForm(prev => ({ ...prev, [name]: newValue }));

      if (error) setError(null);
      if (success) setSuccess(null);
      if (errors[name as keyof FormData]) clearError(name);
    },
    [error, success, errors, clearError]
  );

  const handleRoleChange = useCallback((role: Role) => {
    setForm(prev => ({ ...prev, role }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const canSubmit = useMemo(() => {
    return form.name.trim() &&
      form.mobileNumber.trim() &&
      form.email.trim() &&
      form.password &&
      form.confirmPassword &&
      form.acceptTerms &&
      !loading;
  }, [form, loading]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const isValid = validate();
    if (!isValid) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await authService.signup({
        name: form.name.trim(),
        mobileNumber: form.mobileNumber,
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      if (response.status === "SUCCESS") {
        // show modal on same page
        const message =
          "Account created successfully. Your account is currently InActive — an administrator needs to activate it before you can sign in.";
        setSuccess(message);
        setForm(initialForm);
        setShowModal(true);

        // redirect to Home after short delay
        const homeRoute = (ROUTES as any).HOME || (ROUTES as any).PUBLIC?.HOME || "/";
        setTimeout(() => {
          setShowModal(false);
          navigate(homeRoute);
        }, 2500);
      } else {
        setError(response.message || "Signup failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err?.response?.data?.message || err?.message || "Network/server error");
    } finally {
      setLoading(false);
    }
  }, [canSubmit, validate, form, navigate]);

  return (
    <ErrorBoundary>
      <div className="signup-bg d-flex align-items-center justify-content-center">
        <div className="signup-card shadow-lg">
          <div className="signup-head">
            <h3 className="fw-bold text-center mb-2">
              <i className="bi bi-person-plus-fill me-2" />
              {t("auth.createAccount")}
            </h3>
            <p className="text-center mb-0 signup-subtitle">{t("auth.signupSubtitle")}</p>
          </div>

          <div className="p-4 p-md-5">
            {/* Global Alerts */}
            {error && (
              <Alert
                variant="error"
                message={error}
                onClose={() => setError(null)}
                className="mb-3"
              />
            )}

            {/* Note: success is shown in modal; keeping this here in case you want inline success too */}
            {success && !showModal && (
              <Alert
                variant="success"
                message={success}
                onClose={() => setSuccess(null)}
                className="mb-3"
              />
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name Input */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  {t("auth.fullName")}
                  <span className="text-danger ms-1">*</span>
                </label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">
                    <i className="bi bi-person-fill" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    placeholder={t("auth.fullNamePlaceholder")}
                    value={form.name}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
              </div>

              {/* Mobile Number Input */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  {t("auth.mobileNumber")}
                  <span className="text-danger ms-1">*</span>
                </label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">+91</span>
                  <input
                    type="tel"
                    name="mobileNumber"
                    className={`form-control ${errors.mobileNumber ? "is-invalid" : ""}`}
                    placeholder={t("auth.mobileNumberPlaceholder")}
                    value={form.mobileNumber}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                  {errors.mobileNumber && <div className="invalid-feedback">{errors.mobileNumber}</div>}
                </div>
              </div>

              {/* Email Input */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  {t("auth.emailAddress")}
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
                    placeholder={t("auth.emailAddressPlaceholder")}
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
                  {t("auth.password")}
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
                    placeholder={t("auth.createPasswordPlaceholder")}
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
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                {/* Password Strength Indicator */}
                {form.password && (
                  <div className="password-hint mt-2 d-flex align-items-center justify-content-between">
                    <div className="strength">
                      <div className={`strength-bar strength-${passwordStrength}`} aria-hidden />
                      <small className="ms-2 text-muted">{passwordStrengthLabel(passwordStrength)}</small>
                    </div>
                    <div className="small text-muted">{t("auth.passwordStrengthHint")}</div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  {t("auth.confirmPassword")}
                  <span className="text-danger ms-1">*</span>
                </label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">
                    <i className="bi bi-lock-fill" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                    placeholder={t("auth.confirmPasswordPlaceholder")}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </div>
              </div>

              {/* Role Selection */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  {t("auth.role")}
                  <span className="text-danger ms-1">*</span>
                </label>
                <RoleSelect
                  value={form.role}
                  onChange={handleRoleChange}
                  disabled={loading}
                  showIcon={true}
                  error={errors.role}
                />
              </div>

              {/* Terms Checkbox */}
              <div className="mb-3 form-check">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  className={`form-check-input ${errors.acceptTerms ? "is-invalid" : ""}`}
                  checked={form.acceptTerms}
                  onChange={handleChange}
                  disabled={loading}
                />
                <label className="form-check-label" htmlFor="acceptTerms">
                  {t("auth.acceptTerms")} <a href="/terms" target="_blank" rel="noopener noreferrer">{t("auth.termsAndConditions")}</a>
                </label>
                {errors.acceptTerms && <div className="invalid-feedback">{errors.acceptTerms}</div>}
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
                    {t("auth.creating")}
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill me-2" />
                    {t("auth.signup")}
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="text-center text-muted small">
                {t("auth.haveAccount")}{" "}
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={() => navigate(ROUTES.PUBLIC.LOGIN)}
                >
                  {t("auth.signin")}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* INLINE CUSTOM MODAL (no dependency on ../../ui Modal) */}
        {showModal && (
          <div className="custom-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="signup-success-title">
            <div className="custom-modal">
              <button className="custom-modal-close" aria-label="Close" onClick={() => setShowModal(false)}>×</button>
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3rem" }} />
              <h4 id="signup-success-title" className="mt-3">Signup Successful</h4>
              <p className="mb-0">{success}</p>
              <div className="mt-3">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowModal(false);
                    const homeRoute = (ROUTES as any).HOME || (ROUTES as any).PUBLIC?.HOME || "/";
                    navigate(homeRoute);
                  }}
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
});

Signup.displayName = "Signup";

export default Signup;
