// src/components/platform/profile/PlatformProfile.tsx
import React, { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlatformAuth } from "../../../context/PlatformAuthContext";
import { useTranslation } from "../../../hooks/useTranslation";
import { ErrorBoundary } from "../../ui";
import { ROUTES } from "../../../constants";
import "./PlatformProfile.css";

const PlatformProfile: React.FC = memo(() => {
  const navigate = useNavigate();
  const { platformUser, isPlatformAuthenticated } = usePlatformAuth();
  const { t } = useTranslation();

  // Form state for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: platformUser?.name || "",
    email: platformUser?.email || "",
    role: platformUser?.role || "admin"
  });

  // Check authentication
  useEffect(() => {
    if (!isPlatformAuthenticated) {
      navigate(ROUTES.PLATFORM.LOGIN);
    }
  }, [isPlatformAuthenticated, navigate]);

  // Update form data when platform user changes
  useEffect(() => {
    if (platformUser) {
      setFormData({
        name: platformUser.name || "",
        email: platformUser.email || "",
        role: platformUser.role || "admin"
      });
    }
  }, [platformUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handles saving platform user profile changes
   * TODO: Implement API integration with platform auth service
   * - Create PUT /api/platform/profile endpoint  
   * - Add form validation before save
   * - Implement error handling and success feedback
   * - Update local state after successful save
   */
  const handleSave = () => {
    // Placeholder for profile update functionality
    // Implementation pending API endpoint creation
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (platformUser) {
      setFormData({
        name: platformUser.name || "",
        email: platformUser.email || "",
        role: platformUser.role || "admin"
      });
    }
    setIsEditing(false);
  };

  return (
    <ErrorBoundary>
      <div className="platform-profile">
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h1 className="h3 mb-1">{t("platform.profile.title") || "Platform Profile"}</h1>
                  <p className="text-muted mb-0">
                    {t("platform.profile.subtitle") || "Manage your platform administrator profile"}
                  </p>
                </div>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate(ROUTES.PLATFORM.DASHBOARD)}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  {t("common.back") || "Back to Dashboard"}
                </button>
              </div>

              {/* Profile Card */}
              <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-person-badge me-2"></i>
                    {t("platform.profile.personalInfo") || "Personal Information"}
                  </h5>
                  {!isEditing && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      {t("common.edit") || "Edit"}
                    </button>
                  )}
                </div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                          {t("auth.fullName") || "Full Name"}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          {t("auth.email") || "Email Address"}
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="role" className="form-label">
                          {t("auth.role") || "Role"}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="role"
                          name="role"
                          value={formData.role}
                          disabled={true}
                          readOnly
                        />
                      </div>

                      {isEditing && (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success"
                            onClick={handleSave}
                          >
                            <i className="bi bi-check-lg me-1"></i>
                            {t("common.save") || "Save"}
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={handleCancel}
                          >
                            <i className="bi bi-x-lg me-1"></i>
                            {t("common.cancel") || "Cancel"}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <div className="text-center">
                        <div className="profile-avatar mb-3">
                          <i className="bi bi-person-circle" style={{ fontSize: "4rem" }}></i>
                        </div>
                        <h6 className="mb-1">{platformUser?.name || "Platform Admin"}</h6>
                        <p className="text-muted small mb-0">
                          {t("platform.profile.administratorRole") || "Platform Administrator"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information Card */}
              <div className="card shadow-sm mt-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-shield-check me-2"></i>
                    {t("platform.profile.accountInfo") || "Account Information"}
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">{t("platform.profile.platformId") || "Platform ID"}</label>
                        <input
                          type="text"
                          className="form-control"
                          value={platformUser?.platformUserId || "N/A"}
                          disabled
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">{t("platform.profile.lastLogin") || "Last Login"}</label>
                        <input
                          type="text"
                          className="form-control"
                          value={platformUser?.lastLoginTime ? new Date(platformUser.lastLoginTime).toLocaleString() : "N/A"}
                          disabled
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

PlatformProfile.displayName = "PlatformProfile";

export default PlatformProfile;