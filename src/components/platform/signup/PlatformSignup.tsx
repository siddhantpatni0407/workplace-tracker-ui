// src/components/platform/signup/PlatformSignup.tsx
import React, { useState, useRef, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { usePlatformAuth } from "../../../context/PlatformAuthContext";
import { ErrorBoundary, Alert, Captcha, CaptchaRef, Button, FormProgress } from "../../ui";
import { useFormValidation } from "../../../hooks";
import { useTranslation } from "../../../hooks/useTranslation";
import { ROUTES, AUTH_FIELDS, AUTH_VALIDATION, AUTH_ERRORS, SIGNUP_STEPS, API_ENDPOINTS } from "../../../constants";
import { Role } from "../../../types/auth";
import { toast } from "react-toastify";
import "./PlatformSignup.css";

interface PlatformSignupFormData {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  captcha: string;
}

const PlatformSignup: React.FC = memo(() => {
  const navigate = useNavigate();
  const { platformSignup } = usePlatformAuth();
  const { t } = useTranslation();
  const captchaRef = useRef<CaptchaRef>(null);
  
  // Form state
  const [form, setForm] = useState<PlatformSignupFormData>({
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    captcha: ""
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [captchaSolution, setCaptchaSolution] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form validation schema
  const validationSchema = {
    name: { 
      required: true, 
      minLength: AUTH_VALIDATION.NAME.MIN_LENGTH 
    },
    email: { 
      required: true, 
      email: true 
    },
    mobileNumber: {
      required: false, // Optional field
      custom: (value: string) => {
        if (value.trim() && !/^[\+]?[1-9][\d]{0,15}$/.test(value.trim())) {
          return "Please enter a valid mobile number";
        }
        return null;
      }
    },
    password: { 
      required: true, 
      minLength: AUTH_VALIDATION.PASSWORD.MIN_LENGTH 
    },
    confirmPassword: {
      required: true,
      custom: (value: string) => {
        if (value !== form.password) {
          return AUTH_ERRORS.PASSWORD_MISMATCH;
        }
        return null;
      }
    },
    acceptTerms: {
      custom: (value: boolean) => {
        if (!value) {
          return AUTH_ERRORS.TERMS_REQUIRED;
        }
        return null;
      }
    },
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
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (error) setError(null);
    if (errors[name]) clearError(name);
  }, [error, errors, clearError]);

  const handleCaptchaSolutionChange = useCallback((solution: string) => {
    setCaptchaSolution(solution);
    setForm(prev => ({ ...prev, captcha: "" }));
  }, []);

  const canSubmit = form.name.trim() && 
                   form.email.trim() && 
                   form.password.trim() && 
                   form.confirmPassword.trim() && 
                   form.acceptTerms && 
                   form.captcha.trim() && 
                   !loading;

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
      const requestData: any = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword
      };

      // Add mobile number only if provided (it's optional)
      if (form.mobileNumber.trim()) {
        requestData.mobileNumber = form.mobileNumber.trim();
      }

      const response = await platformSignup(requestData);

      if (response && response.status === "SUCCESS") {
        setSuccess(true);
        toast.success(response.message || "Platform account created successfully!");
        
        // Navigate to platform login after a delay (signup auto-handles token storage)
        setTimeout(() => {
          navigate(ROUTES.PLATFORM.LOGIN);
        }, 2000);
      } else {
        throw new Error(response?.message || "Invalid response from server");
      }
    } catch (error: any) {
      console.error("Platform signup error:", error);
      
      let errorMessage = t("platform.signup.failed") || "Platform signup failed";
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

  if (success) {
    return (
      <div className="platform-signup-container">
        <div className="platform-signup-success">
          <div className="success-icon">✅</div>
          <h2>{t("platform.signup.successTitle") || "Platform Account Created!"}</h2>
          <p>{t("platform.signup.successMessage") || "Your platform account has been created successfully. Redirecting to login..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="platform-signup-container">
      <ErrorBoundary>
        <div className="platform-signup-card">
          <div className="platform-signup-header">
            <h1 className="platform-signup-title">
              {t("platform.signup.title") || "Create Platform Account"}
            </h1>
            <p className="platform-signup-subtitle">
              {t("platform.signup.subtitle") || "Join the platform management team"}
            </p>
          </div>

          {error && <Alert message={error} />}

          <form onSubmit={handleSubmit} className="platform-signup-form">
            <div className="platform-form-group">
              <label htmlFor="name" className="platform-form-label">
                {t(AUTH_FIELDS.LABELS.FULL_NAME) || "Full Name"}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`platform-form-input ${errors.name ? 'platform-form-input-error' : ''}`}
                value={form.name}
                onChange={handleChange}
                placeholder={t(AUTH_FIELDS.PLACEHOLDERS.FULL_NAME) || "Enter your full name"}
                required
              />
              {errors.name && <span className="platform-form-error">{errors.name}</span>}
            </div>

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
              <label htmlFor="mobileNumber" className="platform-form-label">
                {t(AUTH_FIELDS.LABELS.MOBILE_NUMBER) || "Mobile Number"} <span className="text-muted">(optional)</span>
              </label>
              <input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                className={`platform-form-input ${errors.mobileNumber ? 'platform-form-input-error' : ''}`}
                value={form.mobileNumber}
                onChange={handleChange}
                placeholder={t(AUTH_FIELDS.PLACEHOLDERS.MOBILE_NUMBER) || "Enter your mobile number"}
              />
              {errors.mobileNumber && <span className="platform-form-error">{errors.mobileNumber}</span>}
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
                placeholder={t(AUTH_FIELDS.PLACEHOLDERS.CREATE_PASSWORD) || "Create a strong password"}
                required
              />
              {errors.password && <span className="platform-form-error">{errors.password}</span>}
            </div>

            <div className="platform-form-group">
              <label htmlFor="confirmPassword" className="platform-form-label">
                {t(AUTH_FIELDS.LABELS.CONFIRM_PASSWORD) || "Confirm Password"}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={`platform-form-input ${errors.confirmPassword ? 'platform-form-input-error' : ''}`}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder={t(AUTH_FIELDS.PLACEHOLDERS.CONFIRM_PASSWORD) || "Confirm your password"}
                required
              />
              {errors.confirmPassword && <span className="platform-form-error">{errors.confirmPassword}</span>}
            </div>

            <div className="platform-form-group">
              <label className="platform-checkbox-group">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={form.acceptTerms}
                  onChange={handleChange}
                  required
                />
                <span className="platform-checkbox-text">
                  I agree to the platform {" "}
                  <button
                    type="button"
                    onClick={() => window.open('/platform-terms', '_blank')}
                    className="platform-link-button"
                  >
                    Terms & Conditions
                  </button>
                </span>
              </label>
              {errors.acceptTerms && <span className="platform-form-error">{errors.acceptTerms}</span>}
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
              disabled={loading || !canSubmit}
            >
              {loading 
                ? (t("platform.signup.creating") || "Creating Account...") 
                : (t("platform.signup.createAccount") || "Create Platform Account")
              }
            </button>
          </form>

          <div className="platform-signup-footer">
            <p>
              {t("platform.signup.haveAccount") || "Already have a platform account?"} {" "}
              <button
                type="button"
                onClick={() => navigate(ROUTES.PLATFORM.LOGIN)}
                className="platform-link-button"
              >
                {t("platform.signup.signIn") || "Sign In"}
              </button>
            </p>
            <p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.PLATFORM.HOME)}
                className="platform-link-button"
              >
                {t("platform.signup.backToHome") || "← Back to Platform Home"}
              </button>
            </p>
            <p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.PUBLIC.HOME)}
                className="platform-link-button"
              >
                {t("platform.signup.backToMainApp") || "← Back to Main Application"}
              </button>
            </p>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
});

PlatformSignup.displayName = "PlatformSignup";

export default PlatformSignup;