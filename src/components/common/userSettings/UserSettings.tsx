// src/components/common/userSettings/UserSettings.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import axiosInstance from "../../../services/axiosInstance";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import { useAuth } from "../../../context/AuthContext";
import { ApiResponse } from "../../../models";
import { ErrorBoundary, ErrorMessage, LoadingSpinner } from "../../ui";
import Header from "../header/Header";
import "./user-settings.css";

import {
  Option,
  TIMEZONES,
  WORK_WEEK_STARTS,
  LANGUAGES,
  DATE_FORMATS,
} from "../../../constants/userSettingsOptions";

interface UserSettingsData {
  userSettingId?: number | null;
  userId?: number | null;
  timezone?: string | null;
  workWeekStart?: number | null;
  language?: string | null;
  dateFormat?: string | null;
}

interface ToastMessage {
  message: string;
  kind?: "success" | "error";
}

const AUTO_DISMISS_MS = 3500;

const UserSettings: React.FC = memo(() => {
  const { user } = useAuth();
  const authUserId = user?.userId ?? null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [settings, setSettings] = useState<UserSettingsData>({
    userSettingId: null,
    userId: authUserId ?? null,
    timezone: null,
    workWeekStart: null,
    language: null,
    dateFormat: null,
  });

  // modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const clearMessageTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    return () => {
      if (clearMessageTimerRef.current) window.clearTimeout(clearMessageTimerRef.current);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!info && !success) return;
    if (clearMessageTimerRef.current) window.clearTimeout(clearMessageTimerRef.current);
    clearMessageTimerRef.current = window.setTimeout(() => {
      setInfo(null);
      setSuccess(null);
      clearMessageTimerRef.current = null;
    }, AUTO_DISMISS_MS);
  }, [info, success]);

  const showToast = useCallback((message: string, kind: "success" | "error" = "success") => {
    setToast({ message, kind });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    // @ts-ignore
    toastTimerRef.current = window.setTimeout(() => setToast(null), AUTO_DISMISS_MS);
  }, []);

  const resetMessages = useCallback(() => {
    setError(null);
    setInfo(null);
    setSuccess(null);
  }, []);

  // Enhanced error message handling
  const getErrorMessage = useCallback((err: unknown): string => {
    if (!err) return "An unknown error occurred";
    
    // Check for axios error response
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const axiosError = err as any;
      if (axiosError.response?.data?.message) {
        return String(axiosError.response.data.message);
      }
    }
    
    // Check for general error message
    if (typeof err === 'object' && err !== null && 'message' in err) {
      return String((err as any).message);
    }
    
    return String(err);
  }, []);

  const validateSettings = useCallback((settingsData: UserSettingsData): string | null => {
    // Basic validation for settings
    if (settingsData.workWeekStart !== null && settingsData.workWeekStart !== undefined && 
        (settingsData.workWeekStart < 0 || settingsData.workWeekStart > 6)) {
      return "Work week start must be between 0 (Sunday) and 6 (Saturday)";
    }
    
    if (settingsData.timezone && typeof settingsData.timezone !== 'string') {
      return "Invalid timezone format";
    }
    
    if (settingsData.language && typeof settingsData.language !== 'string') {
      return "Invalid language format";
    }
    
    if (settingsData.dateFormat && typeof settingsData.dateFormat !== 'string') {
      return "Invalid date format";
    }
    
    return null;
  }, []);

  const handleNotFoundResponse = useCallback(
    (id: string | number, message: string) => {
      setInfo(String(message));
      setSettings({
        userSettingId: null,
        userId: Number(id),
        timezone: null,
        workWeekStart: null,
        language: null,
        dateFormat: null,
      });
    },
    []
  );

  const loadSettings = useCallback(
    async (id: string | number) => {
      resetMessages();
      setLoading(true);
      try {
        const url = API_ENDPOINTS.USER_SETTINGS.GET(id);
        const resp = await axiosInstance.get<ApiResponse<UserSettingsData>>(url);

        if (resp?.data?.status === "SUCCESS" && resp.data.data) {
          const d = resp.data.data;
          setSettings({
            userSettingId: d.userSettingId ?? null,
            userId: d.userId ?? Number(id),
            timezone: d.timezone ?? null,
            workWeekStart: d.workWeekStart ?? null,
            language: d.language ?? null,
            dateFormat: d.dateFormat ?? null,
          });
          setSuccess(resp.data.message ?? "User settings retrieved.");
          showToast(resp.data.message ?? "User settings retrieved.", "success");
        } else {
          handleNotFoundResponse(id, resp?.data?.message ?? "Failed to load settings");
        }
      } catch (err: unknown) {
        // @ts-ignore
        const status = err?.response?.status;
        const msgFromServer = getErrorMessage(err);
        if (status === 404 || /not found/i.test(String(msgFromServer))) {
          handleNotFoundResponse(id, msgFromServer);
        } else {
          console.error("loadSettings error:", err);
          setError(msgFromServer);
          showToast(msgFromServer, "error");
        }
      } finally {
        setLoading(false);
      }
    },
    [resetMessages, showToast, handleNotFoundResponse, getErrorMessage]
  );

  useEffect(() => {
    if (authUserId) loadSettings(String(authUserId));
  }, [authUserId, loadSettings]);

  const saveSettings = useCallback(async () => {
    resetMessages();
    if (!authUserId) {
      setError("No authenticated user.");
      return;
    }

    // Validate settings before saving
    const validationError = validateSettings(settings);
    if (validationError) {
      setError(validationError);
      showToast(validationError, "error");
      return;
    }

    const payload = {
      userId: Number(authUserId),
      timezone: settings.timezone ?? null,
      workWeekStart: settings.workWeekStart ?? null,
      language: settings.language ?? null,
      dateFormat: settings.dateFormat ?? null,
    };

    setLoading(true);
    try {
      const url = API_ENDPOINTS.USER_SETTINGS.UPSERT(authUserId);
      const resp = await axiosInstance.put<ApiResponse<UserSettingsData>>(url, payload);
      if (resp?.data?.status === "SUCCESS" && resp.data.data) {
        setSettings({ ...resp.data.data });
        setSuccess(resp.data.message ?? "Settings saved.");
        showToast(resp.data.message ?? "Settings saved.", "success");
      } else {
        const msg = resp?.data?.message ?? "Unable to save settings";
        setError(msg);
        showToast(msg, "error");
      }
    } catch (err: unknown) {
      console.error("saveSettings error:", err);
      const msg = getErrorMessage(err);
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [authUserId, settings, resetMessages, showToast, getErrorMessage, validateSettings]);

  // open modal instead of window.confirm
  const requestDelete = () => setConfirmOpen(true);

  const performDelete = useCallback(async () => {
    if (!authUserId) return;
    setConfirmLoading(true);
    setLoading(true);
    try {
      const url = API_ENDPOINTS.USER_SETTINGS.DELETE(authUserId);
      const resp = await axiosInstance.delete<ApiResponse<null>>(url);
      if (resp?.data?.status === "SUCCESS") {
        setSettings({
          userSettingId: null,
          userId: null,
          timezone: null,
          workWeekStart: null,
          language: null,
          dateFormat: null,
        });
        setSuccess(resp.data.message ?? "Settings deleted.");
        showToast(resp.data.message ?? "Settings deleted.", "success");
      } else {
        const msg = resp?.data?.message ?? "Unable to delete settings";
        setError(msg);
        showToast(msg, "error");
      }
    } catch (err: unknown) {
      console.error("deleteSettings error:", err);
      const msg = getErrorMessage(err);
      setError(msg);
      showToast(msg, "error");
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setLoading(false);
    }
  }, [authUserId, getErrorMessage, showToast]);

  // Form handlers with proper TypeScript
  const handleTimezoneChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev: UserSettingsData) => ({ ...prev, timezone: e.target.value || null }));
  }, []);

  const handleWorkWeekChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev: UserSettingsData) => ({ 
      ...prev, 
      workWeekStart: e.target.value ? Number(e.target.value) : null 
    }));
  }, []);

  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev: UserSettingsData) => ({ ...prev, language: e.target.value || null }));
  }, []);

  const handleDateFormatChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev: UserSettingsData) => ({ ...prev, dateFormat: e.target.value || null }));
  }, []);

  const canSave = useMemo(() => !!authUserId && !loading, [authUserId, loading]);

  return (
    <ErrorBoundary>
      <div className="user-settings">
        <Header 
          title="User Settings" 
          subtitle="Manage your preferences and account settings"
          actions={
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => authUserId && loadSettings(authUserId)}
              disabled={loading || !authUserId}
              title="Reload settings"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="me-2" />
              ) : (
                <i className="bi bi-arrow-clockwise me-1" />
              )}
              Reload
            </button>
          }
        />

        <div className="container py-4">
          {/* Enhanced error/success message display */}
          {info && <div className="alert alert-info narrow fade-in">{info}</div>}
          {error && <ErrorMessage error={error} variant="danger" className="narrow fade-in" />}
          {success && <div className="alert alert-success narrow fade-in">{success}</div>}

        <div className="card shadow-sm p-3 user-settings-card">
          <div className="row g-3 align-items-center">
            {/* Timezone */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Timezone</label>
              <div className="input-group icon-input">
                <span className="input-group-text"><i className="bi bi-globe2"></i></span>
                <select
                  className="form-select"
                  value={settings.timezone ?? ""}
                  onChange={handleTimezoneChange}
                  disabled={loading}
                >
                  {TIMEZONES.map((tz: Option<string>) => (
                    <option key={String(tz.value ?? "empty")} value={tz.value ?? ""}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Work Week */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Work Week Start</label>
              <div className="input-group icon-input">
                <span className="input-group-text"><i className="bi bi-calendar-week"></i></span>
                <select
                  className="form-select"
                  value={settings.workWeekStart ?? ""}
                  onChange={handleWorkWeekChange}
                  disabled={loading}
                >
                  {WORK_WEEK_STARTS.map((o: Option<number>) => (
                    <option key={String(o.value ?? "empty")} value={o.value ?? ""}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Language */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Language</label>
              <div className="input-group icon-input">
                <span className="input-group-text"><i className="bi bi-translate"></i></span>
                <select
                  className="form-select"
                  value={settings.language ?? ""}
                  onChange={handleLanguageChange}
                  disabled={loading}
                >
                  {LANGUAGES.map((o: Option<string>) => (
                    <option key={String(o.value ?? "empty")} value={o.value ?? ""}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Format */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Date Format</label>
              <div className="input-group icon-input">
                <span className="input-group-text"><i className="bi bi-calendar-event"></i></span>
                <select
                  className="form-select"
                  value={settings.dateFormat ?? ""}
                  onChange={handleDateFormatChange}
                  disabled={loading}
                >
                  {DATE_FORMATS.map((o: Option<string>) => (
                    <option key={String(o.value ?? "empty")} value={o.value ?? ""}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <button 
              className="btn btn-primary btn-lg" 
              onClick={saveSettings} 
              disabled={!canSave}
              aria-label="Save user settings"
            >
              <i className="bi bi-save me-1"></i> 
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
            <button 
              className="btn btn-danger btn-lg" 
              onClick={requestDelete} 
              disabled={!canSave}
              aria-label="Delete user settings"
            >
              <i className="bi bi-trash me-1"></i> Delete
            </button>
          </div>
        </div>

        {toast && (
          <div className={`um-toast ${toast.kind === "error" ? "um-toast-error" : "um-toast-success"}`}>
            {toast.message}
          </div>
        )}
        </div>
      </div>

      {/* Enhanced confirmation modal */}
      {confirmOpen && (
        <div className="us-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="us-modal">
            <div className="us-modal-header">
              <h5 id="delete-modal-title" className="us-modal-title">Delete settings?</h5>
            </div>
            <div className="us-modal-body">
              <p>
                Are you sure you want to delete settings for userId: {authUserId}? This action cannot
                be undone.
              </p>
            </div>
            <div className="us-modal-footer">
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => setConfirmOpen(false)} 
                disabled={confirmLoading}
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={performDelete} 
                disabled={confirmLoading}
                aria-label="Confirm deletion"
              >
                {confirmLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
});

UserSettings.displayName = "UserSettings";

export default UserSettings;
