// src/components/common/signUp/SignUp.tsx
import React, { useState, memo, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "../../../types/auth";
import { RoleSelect } from "../../forms";
import { authService } from "../../../services/authService";
import { ErrorBoundary, Alert, Captcha, FormInput, Button, FormProgress, PasswordRequirements } from "../../ui";
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
  captcha: string;
}

const initialForm: FormData = {
  name: "",
  mobileNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "USER",
  acceptTerms: false,
  captcha: "",
};

const Signup: React.FC = memo(() => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const captchaRef = useRef<any>(null);

  const [form, setForm] = useState<FormData>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

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
    },
    captcha: {
      required: true,
      custom: (value: string) => {
        if (!value) return "Please complete the CAPTCHA verification";
        const solution = captchaRef.current?.getSolution();
        if (value !== solution) return "Incorrect CAPTCHA, please try again";
        return null;
      }
    }
  };

  const { errors, validate, clearError } = useFormValidation(form, validationSchema);
  
  // Track form field completion status
  const formSteps = useMemo(() => [
    { id: 'name', label: 'Name', completed: !!form.name.trim() && !errors.name },
    { id: 'mobileNumber', label: 'Mobile', completed: !!form.mobileNumber.trim() && form.mobileNumber.length === 10 && !errors.mobileNumber },
    { id: 'email', label: 'Email', completed: !!form.email.trim() && !errors.email },
    { id: 'password', label: 'Password', completed: !!form.password && !errors.password },
    { id: 'confirmPassword', label: 'Confirm', completed: !!form.confirmPassword && form.password === form.confirmPassword },
    { id: 'acceptTerms', label: 'Terms', completed: !!form.acceptTerms },
    { id: 'captcha', label: 'CAPTCHA', completed: !!form.captcha && !errors.captcha }
  ], [form, errors]);

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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    // Live validation for specific fields
    if (name === 'password' || name === 'confirmPassword') {
      // Validate immediately for password fields to give quick feedback
      setTimeout(() => {
        validate(name);
      }, 500);
    } else if (name === 'email' && value.includes('@')) {
      // Validate email when user types @ character
      setTimeout(() => {
        validate(name);
      }, 800);
    } else if (name === 'mobileNumber' && newValue.length === 10) {
      // Validate mobile number when it reaches 10 digits
      validate(name);
    } else if (errors[name as keyof FormData]) {
      // Clear errors for other fields
      clearError(name);
    }
  }, [error, success, errors, clearError, validate]);

  const handleRoleChange = useCallback((role: Role) => {
    setForm(prev => ({ ...prev, role }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);
  
  const handleCaptchaSolutionChange = useCallback((solution: string) => {
    // We don't set the form captcha value here because the user needs to type it
    // The solution is stored in the captchaRef for validation
    if (errors.captcha) clearError('captcha');
  }, [errors.captcha, clearError]);

  const canSubmit = useMemo(() => {
    return form.name.trim() &&
      form.mobileNumber.trim() &&
      form.email.trim() &&
      form.password &&
      form.confirmPassword &&
      form.acceptTerms &&
      form.captcha &&
      !loading;
  }, [form, loading]);

  // Prevent background scroll while modal is open
  useEffect(() => {
    if (showModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
    return; // no-op when not modal
  }, [showModal]);

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
        setSuccess("Account created successfully. Your account is currently InActive — an administrator needs to activate it before you can sign in.");
        setForm(initialForm);
        // show modal and DO NOT auto-close
        setShowModal(true);
      } else {
        setError(response.message || "Signup failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error?.response?.data?.message || error?.message || "Network/server error");
    } finally {
      setLoading(false);
    }
  }, [canSubmit, validate, form]);

  // Navigate only when user explicitly clicks Go to Home
  const handleGoHome = useCallback(() => {
    const homeRoute = (ROUTES as any).HOME || (ROUTES as any).PUBLIC?.HOME || "/";
    navigate(homeRoute);
  }, [navigate]);

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
            {/* Form Progress Indicator */}
            <FormProgress steps={formSteps} showLabels={false} />
            
            {error && (
              <Alert
                variant="error"
                message={error}
                onClose={() => setError(null)}
                className="mb-3"
              />
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name Input */}
              <FormInput
                name="name"
                type="text"
                label={t("auth.fullName")}
                placeholder={t("auth.fullNamePlaceholder")}
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                error={errors.name}
                isRequired={true}
                leftIcon="bi-person-fill"
                className="form-control-lg"
                required
              />

              {/* Mobile Number Input */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  {t("auth.mobileNumber")}
                  <span className="text-danger ms-1">*</span>
                </label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">+91</span>
                  <FormInput
                    type="tel"
                    name="mobileNumber"
                    placeholder={t("auth.mobileNumberPlaceholder")}
                    value={form.mobileNumber}
                    onChange={handleChange}
                    disabled={loading}
                    error={errors.mobileNumber}
                    containerClassName="mb-0 flex-grow-1"
                    hideLabel={true}
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <FormInput
                type="email"
                name="email"
                label={t("auth.emailAddress")}
                placeholder={t("auth.emailAddressPlaceholder")}
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                error={errors.email}
                isRequired={true}
                leftIcon="bi-envelope-fill"
                className="form-control-lg"
                required
              />

              {/* Password Input */}
              <FormInput
                type={showPassword ? "text" : "password"}
                name="password"
                label={t("auth.password")}
                placeholder={t("auth.createPasswordPlaceholder")}
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                error={errors.password}
                isRequired={true}
                leftIcon="bi-lock-fill"
                showPasswordToggle={true}
                onTogglePassword={togglePasswordVisibility}
                className="form-control-lg"
                helperText={t("auth.passwordStrengthHint")}
                required
              />

              {/* Password Requirements and Strength Indicator */}
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="strength">
                    {form.password && (
                      <>
                        <div className={`strength-bar strength-${passwordStrength}`} aria-hidden />
                        <small className="ms-2 text-muted">{passwordStrengthLabel(passwordStrength)}</small>
                      </>
                    )}
                  </div>
                </div>
                <PasswordRequirements password={form.password} className="mt-2" />
              </div>

              {/* Confirm Password Input */}
              <FormInput
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                label={t("auth.confirmPassword")}
                placeholder={t("auth.confirmPasswordPlaceholder")}
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                error={errors.confirmPassword}
                isRequired={true}
                leftIcon="bi-lock-fill"
                className="form-control-lg"
                required
              />

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
              
              {/* CAPTCHA Verification */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  {t("auth.captchaVerification") || "CAPTCHA Verification"}
                  <span className="text-danger ms-1">*</span>
                </label>
                <div className="mb-2">
                  <Captcha 
                    ref={captchaRef}
                    onSolutionChange={handleCaptchaSolutionChange}
                    width={240}
                    height={60}
                  />
                </div>
                <FormInput
                  type="text"
                  name="captcha"
                  placeholder={t("auth.enterCaptcha") || "Enter the code shown above"}
                  value={form.captcha}
                  onChange={handleChange}
                  disabled={loading}
                  error={errors.captcha}
                  leftIcon="bi-shield-lock-fill"
                  className="form-control-lg"
                  helperText={t("auth.captchaHelp") || "Enter the characters exactly as shown in the image above"}
                  hideLabel={true}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth={true}
                className="mb-3"
                disabled={!canSubmit}
                isLoading={loading}
                loadingText={t("auth.creating")}
                leftIcon="bi-check-circle-fill"
              >
                {t("auth.signup")}
              </Button>

              {/* Social Signup Options */}
              <div className="social-signup my-4">
                <div className="text-center mb-3 position-relative">
                  <hr className="position-absolute w-100 top-50" />
                  <span className="bg-white px-3 position-relative">{t("auth.socialSignupOr")}</span>
                </div>
                
                <div className="d-flex gap-2 mb-3">
                  <Button 
                    variant="outline-secondary"
                    leftIcon="bi-google"
                    fullWidth={true}
                    onClick={() => alert("Google signup would be integrated here")}
                  >
                    {t("auth.signupWithGoogle")}
                  </Button>
                </div>
                
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-secondary"
                    leftIcon="bi-microsoft"
                    className="flex-1"
                    fullWidth={true}
                    onClick={() => alert("Microsoft signup would be integrated here")}
                  >
                    {t("auth.signupWithMicrosoft")}
                  </Button>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center text-muted small">
                {t("auth.haveAccount")} {" "}
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

        {showModal && (
          <div className="custom-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="signup-success-title">
            <div className="custom-modal" role="document">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3rem" }}></i>
              <h4 id="signup-success-title" className="mt-3">{t("auth.signupSuccessTitle")}</h4>
              <p>{success}</p>

              <div className="mt-3 d-flex gap-2 justify-content-center">
                <Button
                  variant="primary"
                  onClick={handleGoHome}
                  rightIcon="bi-house-fill"
                >
                  {t("auth.goToHome")}
                </Button>
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
