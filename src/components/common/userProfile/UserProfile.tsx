// src/components/common/userProfile/UserProfile.tsx
import React, { useCallback, useEffect, useState, memo } from "react";
import axiosInstance from "../../../services/axiosInstance";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import { useAuth } from "../../../context/AuthContext";
import { ApiResponse } from "../../../models";
import { ErrorBoundary, ErrorMessage, LoadingSpinner } from "../../ui";
import Header from "../Header/Header";
import { useTranslation } from "../../../hooks/useTranslation";
import "./user-profile.css";

interface UserProfileData {
  userId?: number | null;
  username?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  department?: string | null;
  position?: string | null;
  employeeId?: string | null;
  dateOfJoining?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
}

const AUTO_DISMISS_MS = 3500;

const UserProfile: React.FC = memo(() => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const authUserId = user?.userId ?? null;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfileData>({
    userId: authUserId ?? null,
    username: user?.name || null,
    email: user?.email || null,
    firstName: null,
    lastName: null,
    phoneNumber: null,
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

  // Load user profile data
  const loadProfile = useCallback(async () => {
    if (!authUserId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get<ApiResponse<UserProfileData>>(
        `${API_ENDPOINTS.USER.PROFILE}/${authUserId}`
      );

      if (response.data?.status === 'SUCCESS' && response.data.data) {
        setProfile(prevProfile => ({
          ...prevProfile,
          ...response.data.data,
        }));
      }
    } catch (err: any) {
      console.error("Failed to load user profile:", err);
      if (err.response?.status !== 404) {
        setError(t("userProfile.errors.loadFailed"));
      }
    } finally {
      setLoading(false);
    }
  }, [authUserId, t]);

  // Save user profile data
  const saveProfile = useCallback(async () => {
    if (!authUserId) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const profileData = { ...profile, userId: authUserId };
      
      const response = await axiosInstance.put<ApiResponse<UserProfileData>>(
        `${API_ENDPOINTS.USER.PROFILE}/${authUserId}`,
        profileData
      );

      if (response.data?.status === 'SUCCESS') {
        setSuccess(t("userProfile.messages.saveSuccess"));
        setIsEditing(false);
        // Refresh profile data
        await loadProfile();
      } else {
        setError(response.data?.message || t("userProfile.errors.saveFailed"));
      }
    } catch (err: any) {
      console.error("Failed to save user profile:", err);
      setError(err.response?.data?.message || t("userProfile.errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  }, [authUserId, profile, t, loadProfile]);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof UserProfileData, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value || null,
    }));
  }, []);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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
                          className="form-control"
                          value={profile.firstName || ""}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.firstName")}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="lastName" className="form-label">
                          {t("userProfile.fields.lastName")}
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          className="form-control"
                          value={profile.lastName || ""}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.lastName")}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">
                          {t("userProfile.fields.email")}
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="form-control"
                          value={profile.email || ""}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.email")}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="phoneNumber" className="form-label">
                          {t("userProfile.fields.phoneNumber")}
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          className="form-control"
                          value={profile.phoneNumber || ""}
                          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.phoneNumber")}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="dateOfBirth" className="form-label">
                          {t("userProfile.fields.dateOfBirth")}
                        </label>
                        <input
                          type="date"
                          id="dateOfBirth"
                          className="form-control"
                          value={profile.dateOfBirth || ""}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="gender" className="form-label">
                          {t("userProfile.fields.gender")}
                        </label>
                        <select
                          id="gender"
                          className="form-select"
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
                          className="form-control"
                          rows={2}
                          value={profile.address || ""}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.address")}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="city" className="form-label">
                          {t("userProfile.fields.city")}
                        </label>
                        <input
                          type="text"
                          id="city"
                          className="form-control"
                          value={profile.city || ""}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.city")}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="state" className="form-label">
                          {t("userProfile.fields.state")}
                        </label>
                        <input
                          type="text"
                          id="state"
                          className="form-control"
                          value={profile.state || ""}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.state")}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="country" className="form-label">
                          {t("userProfile.fields.country")}
                        </label>
                        <input
                          type="text"
                          id="country"
                          className="form-control"
                          value={profile.country || ""}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.country")}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="postalCode" className="form-label">
                          {t("userProfile.fields.postalCode")}
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          className="form-control"
                          value={profile.postalCode || ""}
                          onChange={(e) => handleInputChange("postalCode", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.postalCode")}
                        />
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
                          className="form-control"
                          value={profile.employeeId || ""}
                          onChange={(e) => handleInputChange("employeeId", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.employeeId")}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="department" className="form-label">
                          {t("userProfile.fields.department")}
                        </label>
                        <input
                          type="text"
                          id="department"
                          className="form-control"
                          value={profile.department || ""}
                          onChange={(e) => handleInputChange("department", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.department")}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="position" className="form-label">
                          {t("userProfile.fields.position")}
                        </label>
                        <input
                          type="text"
                          id="position"
                          className="form-control"
                          value={profile.position || ""}
                          onChange={(e) => handleInputChange("position", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.position")}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="dateOfJoining" className="form-label">
                          {t("userProfile.fields.dateOfJoining")}
                        </label>
                        <input
                          type="date"
                          id="dateOfJoining"
                          className="form-control"
                          value={profile.dateOfJoining || ""}
                          onChange={(e) => handleInputChange("dateOfJoining", e.target.value)}
                          disabled={!isEditing}
                        />
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
                          className="form-control"
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
                          className="form-control"
                          value={profile.emergencyContactName || ""}
                          onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.emergencyContactName")}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="emergencyContactPhone" className="form-label">
                          {t("userProfile.fields.emergencyContactPhone")}
                        </label>
                        <input
                          type="tel"
                          id="emergencyContactPhone"
                          className="form-control"
                          value={profile.emergencyContactPhone || ""}
                          onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                          disabled={!isEditing}
                          placeholder={t("userProfile.placeholders.emergencyContactPhone")}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="emergencyContactRelation" className="form-label">
                          {t("userProfile.fields.emergencyContactRelation")}
                        </label>
                        <select
                          id="emergencyContactRelation"
                          className="form-select"
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