// src/components/platform/settings/PlatformSettings.tsx
import React, { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlatformAuth } from "../../../context/PlatformAuthContext";
import { useTranslation } from "../../../hooks/useTranslation";
import { ErrorBoundary } from "../../ui";
import { ROUTES } from "../../../constants";
import "./PlatformSettings.css";

const PlatformSettings: React.FC = memo(() => {
  const navigate = useNavigate();
  const { isPlatformAuthenticated } = usePlatformAuth();
  const { t } = useTranslation();

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      systemAlerts: true,
      maintenanceAlerts: false,
      securityAlerts: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90
    },
    platform: {
      theme: "default",
      language: "en",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY"
    }
  });

  // Check authentication
  useEffect(() => {
    if (!isPlatformAuthenticated) {
      navigate(ROUTES.PLATFORM.LOGIN);
    }
  }, [isPlatformAuthenticated, navigate]);

  const handleNotificationChange = (key: string) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key as keyof typeof prev.notifications]
      }
    }));
  };

  const handleSecurityChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }));
  };

  const handlePlatformChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      platform: {
        ...prev.platform,
        [key]: value
      }
    }));
  };

  /**
   * Handles saving platform settings
   * TODO: Implement API integration with platformSettingsService
   * - Create PUT /api/platform/settings endpoint
   * - Add error handling and success notifications
   * - Implement validation for settings values
   */
  const handleSaveSettings = () => {
    // Placeholder for platform settings save functionality
    // Implementation pending API endpoint creation
    
    // Show success message placeholder
    // TODO: Replace with actual toast notification service
  };

  return (
    <ErrorBoundary>
      <div className="platform-settings">
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h1 className="h3 mb-1">{t("platform.settings.title") || "Platform Settings"}</h1>
                  <p className="text-muted mb-0">
                    {t("platform.settings.subtitle") || "Configure your platform preferences and security"}
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

              <div className="row">
                <div className="col-lg-8">
                  {/* Notification Settings */}
                  <div className="card shadow-sm mb-4">
                    <div className="card-header">
                      <h5 className="card-title mb-0">
                        <i className="bi bi-bell me-2"></i>
                        {t("platform.settings.notifications.title") || "Notification Preferences"}
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-check form-switch mb-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="emailAlerts"
                              checked={settings.notifications.emailAlerts}
                              onChange={() => handleNotificationChange('emailAlerts')}
                            />
                            <label className="form-check-label" htmlFor="emailAlerts">
                              {t("platform.settings.notifications.emailAlerts") || "Email Alerts"}
                            </label>
                          </div>
                          <div className="form-check form-switch mb-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="systemAlerts"
                              checked={settings.notifications.systemAlerts}
                              onChange={() => handleNotificationChange('systemAlerts')}
                            />
                            <label className="form-check-label" htmlFor="systemAlerts">
                              {t("platform.settings.notifications.systemAlerts") || "System Alerts"}
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-check form-switch mb-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="maintenanceAlerts"
                              checked={settings.notifications.maintenanceAlerts}
                              onChange={() => handleNotificationChange('maintenanceAlerts')}
                            />
                            <label className="form-check-label" htmlFor="maintenanceAlerts">
                              {t("platform.settings.notifications.maintenanceAlerts") || "Maintenance Alerts"}
                            </label>
                          </div>
                          <div className="form-check form-switch mb-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="securityAlerts"
                              checked={settings.notifications.securityAlerts}
                              onChange={() => handleNotificationChange('securityAlerts')}
                            />
                            <label className="form-check-label" htmlFor="securityAlerts">
                              {t("platform.settings.notifications.securityAlerts") || "Security Alerts"}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className="card shadow-sm mb-4">
                    <div className="card-header">
                      <h5 className="card-title mb-0">
                        <i className="bi bi-shield-lock me-2"></i>
                        {t("platform.settings.security.title") || "Security Settings"}
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-check form-switch mb-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="twoFactorAuth"
                              checked={settings.security.twoFactorAuth}
                              onChange={() => handleSecurityChange('twoFactorAuth', !settings.security.twoFactorAuth)}
                            />
                            <label className="form-check-label" htmlFor="twoFactorAuth">
                              {t("platform.settings.security.twoFactorAuth") || "Two-Factor Authentication"}
                            </label>
                          </div>
                          <div className="mb-3">
                            <label htmlFor="sessionTimeout" className="form-label">
                              {t("platform.settings.security.sessionTimeout") || "Session Timeout (minutes)"}
                            </label>
                            <select
                              className="form-select"
                              id="sessionTimeout"
                              value={settings.security.sessionTimeout}
                              onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                            >
                              <option value={15}>15 minutes</option>
                              <option value={30}>30 minutes</option>
                              <option value={60}>1 hour</option>
                              <option value={120}>2 hours</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="passwordExpiry" className="form-label">
                              {t("platform.settings.security.passwordExpiry") || "Password Expiry (days)"}
                            </label>
                            <select
                              className="form-select"
                              id="passwordExpiry"
                              value={settings.security.passwordExpiry}
                              onChange={(e) => handleSecurityChange('passwordExpiry', parseInt(e.target.value))}
                            >
                              <option value={30}>30 days</option>
                              <option value={60}>60 days</option>
                              <option value={90}>90 days</option>
                              <option value={180}>180 days</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Platform Preferences */}
                  <div className="card shadow-sm mb-4">
                    <div className="card-header">
                      <h5 className="card-title mb-0">
                        <i className="bi bi-gear me-2"></i>
                        {t("platform.settings.preferences.title") || "Platform Preferences"}
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="theme" className="form-label">
                              {t("platform.settings.preferences.theme") || "Theme"}
                            </label>
                            <select
                              className="form-select"
                              id="theme"
                              value={settings.platform.theme}
                              onChange={(e) => handlePlatformChange('theme', e.target.value)}
                            >
                              <option value="default">Default</option>
                              <option value="dark">Dark</option>
                              <option value="light">Light</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label htmlFor="language" className="form-label">
                              {t("platform.settings.preferences.language") || "Language"}
                            </label>
                            <select
                              className="form-select"
                              id="language"
                              value={settings.platform.language}
                              onChange={(e) => handlePlatformChange('language', e.target.value)}
                            >
                              <option value="en">English</option>
                              <option value="es">Spanish</option>
                              <option value="fr">French</option>
                              <option value="hi">Hindi</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="timezone" className="form-label">
                              {t("platform.settings.preferences.timezone") || "Timezone"}
                            </label>
                            <select
                              className="form-select"
                              id="timezone"
                              value={settings.platform.timezone}
                              onChange={(e) => handlePlatformChange('timezone', e.target.value)}
                            >
                              <option value="UTC">UTC</option>
                              <option value="America/New_York">Eastern Time</option>
                              <option value="America/Chicago">Central Time</option>
                              <option value="America/Denver">Mountain Time</option>
                              <option value="America/Los_Angeles">Pacific Time</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label htmlFor="dateFormat" className="form-label">
                              {t("platform.settings.preferences.dateFormat") || "Date Format"}
                            </label>
                            <select
                              className="form-select"
                              id="dateFormat"
                              value={settings.platform.dateFormat}
                              onChange={(e) => handlePlatformChange('dateFormat', e.target.value)}
                            >
                              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="d-flex justify-content-end">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleSaveSettings}
                    >
                      <i className="bi bi-check-lg me-2"></i>
                      {t("platform.settings.saveSettings") || "Save Settings"}
                    </button>
                  </div>
                </div>

                <div className="col-lg-4">
                  {/* Quick Actions */}
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <h6 className="card-title mb-0">
                        <i className="bi bi-lightning me-2"></i>
                        {t("platform.settings.quickActions") || "Quick Actions"}
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="d-grid gap-2">
                        <button className="btn btn-outline-primary btn-sm">
                          <i className="bi bi-key me-2"></i>
                          {t("platform.settings.changePassword") || "Change Password"}
                        </button>
                        <button className="btn btn-outline-success btn-sm">
                          <i className="bi bi-download me-2"></i>
                          {t("platform.settings.exportSettings") || "Export Settings"}
                        </button>
                        <button className="btn btn-outline-warning btn-sm">
                          <i className="bi bi-arrow-clockwise me-2"></i>
                          {t("platform.settings.resetDefaults") || "Reset to Defaults"}
                        </button>
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

PlatformSettings.displayName = "PlatformSettings";

export default PlatformSettings;