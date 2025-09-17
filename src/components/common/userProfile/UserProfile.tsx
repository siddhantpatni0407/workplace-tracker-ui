// src/components/common/userProfile/UserProfile.tsx
import React, { useCallback, useEffect, useState, memo } from "react";
import axiosInstance from "../../../services/axiosInstance";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import { useAuth } from "../../../context/AuthContext";
import { ApiResponse } from "../../../models/Api";
import { UserProfileData } from "../../../models/User";
import { ErrorBoundary, ErrorMessage, LoadingSpinner } from "../../ui";
import Header from "../header/Header";
import { useTranslation } from "../../../hooks/useTranslation";
import "./user-profile.css";

const AUTO_DISMISS_MS = 3500;

const UserProfile: React.FC = memo(() => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const authUserId = user?.userId ?? null;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // field-level validation errors returned by server: { fieldName: message }
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [profile, setProfile] = useState<UserProfileData>({
    userId: authUserId ?? null,
    username: user?.name || null,
    email: user?.email || null,
    firstName: null,
    lastName: null,
    phoneNumber: user?.mobileNumber || null,
    address: null,
    city: null,
    state: null,
    country: null,
    postalCode: null,
    dateOfBirth: null,
    gender: null,
    department: null,
    position: null,
    employeeId: null,
    dateOfJoining: null,
    profilePicture: null,
    bio: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    emergencyContactRelation: null,
    primaryAddress: null,
  });

  const [isEditing, setIsEditing] = useState(false);

  // Auto-dismiss messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, AUTO_DISMISS_MS);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // If auth user changes (unlikely), keep profile.userId / username in sync initially
  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      userId: authUserId ?? prev.userId,
      username: user?.name ?? prev.username,
      email: user?.email ?? prev.email,
      phoneNumber: user?.mobileNumber ?? prev.phoneNumber,
    }));
  }, [authUserId, user?.name, user?.email, user?.mobileNumber]);

  // helper to read possible nested field errors (supports "primaryAddress.field")
  const getFieldError = useCallback(
    (field: string) => {
      return fieldErrors[field] || fieldErrors[`primaryAddress.${field}`] || "";
    },
    [fieldErrors]
  );

  // helper to split a full name into first + last
  const splitFullName = (fullName?: string | null) => {
    if (!fullName || !fullName.trim()) return { firstName: null, lastName: null };
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] ?? null;
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;
    return { firstName, lastName };
  };

  // helper to build username from first + last
  const buildFullName = (first?: string | null, last?: string | null) => {
    const f = first?.trim() ?? "";
    const l = last?.trim() ?? "";
    if (!f && !l) return null;
    return (f + (f && l ? " " : "") + l).trim();
  };

  // Load user profile data
  const loadProfile = useCallback(async () => {
    if (!authUserId) return;

    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      // backend expects request param: ?userId=...
      const response = await axiosInstance.get<ApiResponse<UserProfileData>>(
        `${API_ENDPOINTS.USER.PROFILE}`,
        { params: { userId: authUserId } }
      );

      console.info("UserProfile.loadProfile response:", response?.status, response?.data);

      if (response.data?.status === "SUCCESS" && response.data.data) {
        const apiData = response.data.data as any;

        // Map nested primaryAddress into flat fields for UI binding (flat fields have priority if present)
        const primary = apiData.primaryAddress;
        const mapped: UserProfileData = {
          ...apiData,
          // If user_profile contains direct address fields they take priority,
          // otherwise fall back to primaryAddress returned by API.
          address: apiData.address ?? primary?.address ?? null,
          city: apiData.city ?? primary?.city ?? null,
          state: apiData.state ?? primary?.state ?? null,
          country: apiData.country ?? primary?.country ?? null,
          postalCode: apiData.postalCode ?? primary?.postalCode ?? null,
        };

        // Handle firstName/lastName: prefer explicit fields from API; else split username/name
        const explicitFirst = apiData.firstName ?? null;
        const explicitLast = apiData.lastName ?? null;
        if (explicitFirst || explicitLast) {
          mapped.firstName = explicitFirst;
          mapped.lastName = explicitLast;
        } else {
          const { firstName, lastName } = splitFullName(apiData.username ?? apiData.name ?? null);
          mapped.firstName = mapped.firstName ?? firstName;
          mapped.lastName = mapped.lastName ?? lastName;
        }

        // Ensure username/email/phone are taken from API response (users table merged server-side)
        mapped.username = apiData.username ?? apiData.name ?? mapped.username;
        mapped.email = apiData.email ?? mapped.email;
        mapped.phoneNumber = apiData.phoneNumber ?? mapped.phoneNumber;

        setProfile(prevProfile => ({
          ...prevProfile,
          ...mapped,
        }));
      } else if (response.data?.status === "FAILED") {
        // failed but well-formed response
        setError(response.data.message || t("userProfile.errors.loadFailed"));
      }
    } catch (err: any) {
      console.error("Failed to load user profile:", err);
      if (err.response?.status === 404) {
        setError(err.response?.data?.message || t("userProfile.errors.notFound"));
      } else if (!err.response) {
        setError("Network error or CORS blocked the request. Check browser console / server CORS settings.");
      } else {
        setError(t("userProfile.errors.loadFailed"));
      }
    } finally {
      setLoading(false);
    }
  }, [authUserId, t]);

  // Save user profile data
  const saveProfile = useCallback(async () => {
    if (!authUserId) {
      console.warn("saveProfile: no authUserId, aborting");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      // Build payload: include username composed from firstName+lastName so backend can update users.name
      const usernameToSend = buildFullName(profile.firstName, profile.lastName) ?? profile.username ?? undefined;

      // Build payload: include identity fields (username/email/phoneNumber) - backend must decide to accept them
      const payload: any = {
        userId: authUserId,
        username: usernameToSend,
        email: profile.email || undefined,
        phoneNumber: profile.phoneNumber || undefined,
        dateOfBirth: profile.dateOfBirth || undefined,
        gender: profile.gender || undefined,
        department: profile.department || undefined,
        position: profile.position || undefined,
        employeeId: profile.employeeId || undefined,
        dateOfJoining: profile.dateOfJoining || undefined,
        profilePicture: profile.profilePicture || undefined,
        bio: profile.bio || undefined,
        emergencyContactName: profile.emergencyContactName || undefined,
        emergencyContactPhone: profile.emergencyContactPhone || undefined,
        emergencyContactRelation: profile.emergencyContactRelation || undefined,
      };

      // Build nested primaryAddress only if any address fields present
      const hasAddress =
        (profile.address && profile.address.trim() !== "") ||
        (profile.city && profile.city.trim() !== "") ||
        (profile.state && profile.state.trim() !== "") ||
        (profile.country && profile.country.trim() !== "") ||
        (profile.postalCode && profile.postalCode.trim() !== "");

      if (hasAddress) {
        payload.primaryAddress = {
          userAddressId: (profile.primaryAddress as any)?.userAddressId ?? undefined,
          userId: authUserId,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          country: profile.country,
          postalCode: profile.postalCode,
          isPrimary: true,
        };
      }

      // DEBUG - show payload in console so we know what's being sent
      console.info("UserProfile.saveProfile sending payload:", payload);

      // Use params option rather than manually building URL query string
      const url = API_ENDPOINTS.USER.PROFILE; // e.g. "/api/user-profile"
      const response = await axiosInstance.put<ApiResponse<UserProfileData>>(
        url,
        payload,
        {
          params: { userId: authUserId },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.info("UserProfile.saveProfile response:", response?.status, response?.data);

      if (response.data?.status === "SUCCESS") {
        setSuccess(t("userProfile.messages.saveSuccess"));
        setIsEditing(false);
        await loadProfile();
      } else if (response.data?.status === "FAILED") {
        const respData = response.data.data;
        if (respData && typeof respData === "object") {
          setFieldErrors(respData as Record<string, string>);
          setError(response.data.message || t("userProfile.errors.validationFailed"));
        } else {
          setError(response.data.message || t("userProfile.errors.saveFailed"));
        }
      } else {
        setError(t("userProfile.errors.saveFailed"));
      }
    } catch (err: any) {
      console.error("Failed to save user profile:", err);

      if (!err.response) {
        setError("Network error or CORS blocked the request. Check browser console / server CORS settings.");
      } else if (err.response?.status === 400 && err.response?.data?.data) {
        setFieldErrors(err.response.data.data as Record<string, string>);
        setError(err.response?.data?.message || t("userProfile.errors.validationFailed"));
      } else {
        setError(err.response?.data?.message || t("userProfile.errors.saveFailed"));
      }
    } finally {
      setSaving(false);
    }
  }, [authUserId, profile, t, loadProfile]);

  // Handle input changes (clears field-level error for that field and nested primaryAddress)
  const handleInputChange = useCallback((field: keyof UserProfileData, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value || null,
    }));

    setFieldErrors(prev => {
      const copy = { ...prev };
      delete copy[field as string];
      delete copy[`primaryAddress.${field}`];
      return copy;
    });
  }, []);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // small helpers for hint text fallbacks
  const emailHint = t("userProfile.hints.changeEmailInAccount") || "Change email in Account";
  const phoneHint = t("userProfile.hints.changePhoneInAccount") || "Change phone in Account";

  // Render loading state
  if (loading) {
    return (
      <ErrorBoundary>
        <div className="user-profile-container">
          <Header
            title={t("userProfile.title")}
            subtitle={t("userProfile.subtitle")}
          />
          <div className="d-flex justify-content-center py-5">
            <LoadingSpinner />
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="user-profile-container">
        <Header
          title={t("userProfile.title")}
          subtitle={t("userProfile.subtitle")}
        />

        <div className="container-fluid px-4 py-4">
          {/* Messages */}
          {error && (
            <div className="row mb-4">
              <div className="col-12">
                <ErrorMessage error={error} />
              </div>
            </div>
          )}

          {success && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {success}
                </div>
              </div>
            </div>
          )}

          {/* Profile Card */}
          <div className="row">
            <div className="col-lg-4 mb-4">
              {/* Profile Picture Card */}
              <div className="card profile-picture-card">
                <div className="card-body text-center">
                  <div className="profile-picture-container mb-3">
                    {profile.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt={t("userProfile.profilePicture")}
                        className="profile-picture img-fluid rounded-circle"
                      />
                    ) : (
                      <div className="profile-picture-placeholder rounded-circle">
                        <i className="bi bi-person-fill"></i>
                      </div>
                    )}
                  </div>
                  <h5 className="card-title mb-1">
                    {profile.firstName && profile.lastName
                      ? `${profile.firstName} ${profile.lastName}`
                      : profile.username || t("userProfile.noName")}
                  </h5>
                  <p className="text-muted mb-2">{profile.position || t("userProfile.noPosition")}</p>
                  <p className="text-muted small">{profile.department || t("userProfile.noDepartment")}</p>

                  {isEditing && (
                    <div className="mt-3">
                      <label htmlFor="profilePicture" className="form-label small">
                        {t("userProfile.fields.profilePicture")}
                      </label>
                      <input
                        type="url"
                        id="profilePicture"
                        className="form-control form-control-sm"
                        value={profile.profilePicture || ""}
                        onChange={(e) => handleInputChange("profilePicture", e.target.value)}
                        placeholder={t("userProfile.placeholders.profilePicture")}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Info Card */}
              <div className="card mt-3">
                <div className="card-body">
                  <h6 className="card-title">
                    <i className="bi bi-info-circle me-2"></i>
                    {t("userProfile.quickInfo")}
                  </h6>
                  <div className="quick-info">
                    <div className="info-item">
                      <i className="bi bi-envelope"></i>
                      <span>{profile.email || t("userProfile.noEmail")}</span>
                    </div>
                    <div className="info-item">
                      <i className="bi bi-telephone"></i>
                      <span>{profile.phoneNumber || t("userProfile.noPhone")}</span>
                    </div>
                    <div className="info-item">
                      <i className="bi bi-geo-alt"></i>
                      <span>
                        {profile.city && profile.country
                          ? `${profile.city}, ${profile.country}`
                          : t("userProfile.noLocation")}
                      </span>
                    </div>
                    <div className="info-item">
                      <i className="bi bi-calendar-date"></i>
                      <span>
                        {profile.dateOfJoining
                          ? new Date(profile.dateOfJoining).toLocaleDateString()
                          : t("userProfile.noJoinDate")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              {/* Main Profile Form */}
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-person-lines-fill me-2"></i>
                    {t("userProfile.personalInfo")}
                  </h5>
                  <div>
                    {!isEditing ? (
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        {t("userProfile.buttons.edit")}
                      </button>
                    ) : (
                      <div className="btn-group">
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={saveProfile}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" />
                              {t("userProfile.buttons.saving")}
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check me-1"></i>
                              {t("userProfile.buttons.save")}
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => {
                            setIsEditing(false);
                            loadProfile(); // Reset changes
                          }}
                          disabled={saving}
                        >
                          <i className="bi bi-x me-1"></i>
                          {t("userProfile.buttons.cancel")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-body">
                  <form onSubmit={(e) => { e.preventDefault(); saveProfile(); }}>
                    {/* Basic Information */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <h6 className="text-muted mb-3">
                          <i className="bi bi-person me-1"></i>
                          {t("userProfile.sections.basicInfo")}
                        </h6>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="firstName" className="form-label">
                          {t("userProfile.fields.firstName")}
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          className={`form-control ${getFieldError("firstName") ? "is-invalid" : ""}`}
                          value={profile.firstName || ""}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.firstName")}
                        />
                        {getFieldError("firstName") && <div className="invalid-feedback">{getFieldError("firstName")}</div>}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="lastName" className="form-label">
                          {t("userProfile.fields.lastName")}
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          className={`form-control ${getFieldError("lastName") ? "is-invalid" : ""}`}
                          value={profile.lastName || ""}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.lastName")}
                        />
                        {getFieldError("lastName") && <div className="invalid-feedback">{getFieldError("lastName")}</div>}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">
                          {t("userProfile.fields.email")}
                        </label>
                        <input
                          type="email"
                          id="email"
                          className={`form-control ${getFieldError("email") ? "is-invalid" : ""}`}
                          value={profile.email || ""}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          disabled={!isEditing} // editable only when editing
                          placeholder={t("userProfile.placeholders.email")}
                        />
                        {/* show hint only when NOT editing */}
                        {!isEditing && (
                          <div className="form-text">{emailHint}</div>
                        )}
                        {getFieldError("email") && <div className="invalid-feedback">{getFieldError("email")}</div>}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="phoneNumber" className="form-label">
                          {t("userProfile.fields.phoneNumber")}
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          className={`form-control ${getFieldError("phoneNumber") ? "is-invalid" : ""}`}
                          value={profile.phoneNumber || ""}
                          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                          disabled={!isEditing} // editable only when editing
                          placeholder={t("userProfile.placeholders.phoneNumber")}
                        />
                        {!isEditing && (
                          <div className="form-text">{phoneHint}</div>
                        )}
                        {getFieldError("phoneNumber") && <div className="invalid-feedback">{getFieldError("phoneNumber")}</div>}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="dateOfBirth" className="form-label">
                          {t("userProfile.fields.dateOfBirth")}
                        </label>
                        <input
                          type="date"
                          id="dateOfBirth"
                          className={`form-control ${getFieldError("dateOfBirth") ? "is-invalid" : ""}`}
                          value={profile.dateOfBirth || ""}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                          disabled={!isEditing}
                        />
                        {getFieldError("dateOfBirth") && <div className="invalid-feedback">{getFieldError("dateOfBirth")}</div>}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="gender" className="form-label">
                          {t("userProfile.fields.gender")}
                        </label>
                        <select
                          id="gender"
                          className={`form-select ${getFieldError("gender") ? "is-invalid" : ""}`}
                          value={profile.gender || ""}
                          onChange={(e) => handleInputChange("gender", e.target.value)}
                          disabled={!isEditing}
                        >
                          <option value="">{t("userProfile.placeholders.gender")}</option>
                          <option value="male">{t("userProfile.genders.male")}</option>
                          <option value="female">{t("userProfile.genders.female")}</option>
                          <option value="other">{t("userProfile.genders.other")}</option>
                          <option value="prefer_not_to_say">{t("userProfile.genders.preferNotToSay")}</option>
                        </select>
                        {getFieldError("gender") && <div className="invalid-feedback">{getFieldError("gender")}</div>}
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <h6 className="text-muted mb-3">
                          <i className="bi bi-geo-alt me-1"></i>
                          {t("userProfile.sections.addressInfo")}
                        </h6>
                      </div>

                      <div className="col-12 mb-3">
                        <label htmlFor="address" className="form-label">
                          {t("userProfile.fields.address")}
                        </label>
                        <textarea
                          id="address"
                          className={`form-control ${getFieldError("address") ? "is-invalid" : ""}`}
                          rows={2}
                          value={profile.address || ""}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.address")}
                        />
                        {getFieldError("address") && <div className="invalid-feedback">{getFieldError("address")}</div>}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="city" className="form-label">
                          {t("userProfile.fields.city")}
                        </label>
                        <input
                          type="text"
                          id="city"
                          className={`form-control ${getFieldError("city") ? "is-invalid" : ""}`}
                          value={profile.city || ""}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.city")}
                        />
                        {getFieldError("city") && <div className="invalid-feedback">{getFieldError("city")}</div>}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="state" className="form-label">
                          {t("userProfile.fields.state")}
                        </label>
                        <input
                          type="text"
                          id="state"
                          className={`form-control ${getFieldError("state") ? "is-invalid" : ""}`}
                          value={profile.state || ""}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.state")}
                        />
                        {getFieldError("state") && <div className="invalid-feedback">{getFieldError("state")}</div>}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="country" className="form-label">
                          {t("userProfile.fields.country")}
                        </label>
                        <input
                          type="text"
                          id="country"
                          className={`form-control ${getFieldError("country") ? "is-invalid" : ""}`}
                          value={profile.country || ""}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.country")}
                        />
                        {getFieldError("country") && <div className="invalid-feedback">{getFieldError("country")}</div>}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="postalCode" className="form-label">
                          {t("userProfile.fields.postalCode")}
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          className={`form-control ${getFieldError("postalCode") ? "is-invalid" : ""}`}
                          value={profile.postalCode || ""}
                          onChange={(e) => handleInputChange("postalCode", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.postalCode")}
                        />
                        {getFieldError("postalCode") && <div className="invalid-feedback">{getFieldError("postalCode")}</div>}
                      </div>
                    </div>

                    {/* Work Information */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <h6 className="text-muted mb-3">
                          <i className="bi bi-briefcase me-1"></i>
                          {t("userProfile.sections.workInfo")}
                        </h6>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="employeeId" className="form-label">
                          {t("userProfile.fields.employeeId")}
                        </label>
                        <input
                          type="text"
                          id="employeeId"
                          className={`form-control ${getFieldError("employeeId") ? "is-invalid" : ""}`}
                          value={profile.employeeId || ""}
                          onChange={(e) => handleInputChange("employeeId", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.employeeId")}
                        />
                        {getFieldError("employeeId") && <div className="invalid-feedback">{getFieldError("employeeId")}</div>}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="department" className="form-label">
                          {t("userProfile.fields.department")}
                        </label>
                        <input
                          type="text"
                          id="department"
                          className={`form-control ${getFieldError("department") ? "is-invalid" : ""}`}
                          value={profile.department || ""}
                          onChange={(e) => handleInputChange("department", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.department")}
                        />
                        {getFieldError("department") && <div className="invalid-feedback">{getFieldError("department")}</div>}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="position" className="form-label">
                          {t("userProfile.fields.position")}
                        </label>
                        <input
                          type="text"
                          id="position"
                          className={`form-control ${getFieldError("position") ? "is-invalid" : ""}`}
                          value={profile.position || ""}
                          onChange={(e) => handleInputChange("position", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.position")}
                        />
                        {getFieldError("position") && <div className="invalid-feedback">{getFieldError("position")}</div>}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="dateOfJoining" className="form-label">
                          {t("userProfile.fields.dateOfJoining")}
                        </label>
                        <input
                          type="date"
                          id="dateOfJoining"
                          className={`form-control ${getFieldError("dateOfJoining") ? "is-invalid" : ""}`}
                          value={profile.dateOfJoining || ""}
                          onChange={(e) => handleInputChange("dateOfJoining", e.target.value)}
                          disabled={!isEditing}
                        />
                        {getFieldError("dateOfJoining") && <div className="invalid-feedback">{getFieldError("dateOfJoining")}</div>}
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <h6 className="text-muted mb-3">
                          <i className="bi bi-card-text me-1"></i>
                          {t("userProfile.sections.bio")}
                        </h6>
                        <label htmlFor="bio" className="form-label">
                          {t("userProfile.fields.bio")}
                        </label>
                        <textarea
                          id="bio"
                          className={`form-control ${getFieldError("bio") ? "is-invalid" : ""}`}
                          rows={4}
                          value={profile.bio || ""}
                          onChange={(e) => handleInputChange("bio", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.bio")}
                          maxLength={500}
                        />
                        <div className="form-text">
                          {profile.bio?.length || 0}/500 {t("userProfile.characters")}
                        </div>
                        {getFieldError("bio") && <div className="invalid-feedback d-block">{getFieldError("bio")}</div>}
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="row">
                      <div className="col-12">
                        <h6 className="text-muted mb-3">
                          <i className="bi bi-shield-exclamation me-1"></i>
                          {t("userProfile.sections.emergencyContact")}
                        </h6>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="emergencyContactName" className="form-label">
                          {t("userProfile.fields.emergencyContactName")}
                        </label>
                        <input
                          type="text"
                          id="emergencyContactName"
                          className={`form-control ${getFieldError("emergencyContactName") ? "is-invalid" : ""}`}
                          value={profile.emergencyContactName || ""}
                          onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.emergencyContactName")}
                        />
                        {getFieldError("emergencyContactName") && <div className="invalid-feedback">{getFieldError("emergencyContactName")}</div>}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="emergencyContactPhone" className="form-label">
                          {t("userProfile.fields.emergencyContactPhone")}
                        </label>
                        <input
                          type="tel"
                          id="emergencyContactPhone"
                          className={`form-control ${getFieldError("emergencyContactPhone") ? "is-invalid" : ""}`}
                          value={profile.emergencyContactPhone || ""}
                          onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.emergencyContactPhone")}
                        />
                        {getFieldError("emergencyContactPhone") && <div className="invalid-feedback">{getFieldError("emergencyContactPhone")}</div>}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="emergencyContactRelation" className="form-label">
                          {t("userProfile.fields.emergencyContactRelation")}
                        </label>
                        <select
                          id="emergencyContactRelation"
                          className={`form-select ${getFieldError("emergencyContactRelation") ? "is-invalid" : ""}`}
                          value={profile.emergencyContactRelation || ""}
                          onChange={(e) => handleInputChange("emergencyContactRelation", e.target.value)}
                          disabled={!isEditing}
                        >
                          <option value="">{t("userProfile.placeholders.emergencyContactRelation")}</option>
                          <option value="spouse">{t("userProfile.relations.spouse")}</option>
                          <option value="parent">{t("userProfile.relations.parent")}</option>
                          <option value="sibling">{t("userProfile.relations.sibling")}</option>
                          <option value="child">{t("userProfile.relations.child")}</option>
                          <option value="friend">{t("userProfile.relations.friend")}</option>
                          <option value="other">{t("userProfile.relations.other")}</option>
                        </select>
                        {getFieldError("emergencyContactRelation") && <div className="invalid-feedback">{getFieldError("emergencyContactRelation")}</div>}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

UserProfile.displayName = "UserProfile";

export default UserProfile;
