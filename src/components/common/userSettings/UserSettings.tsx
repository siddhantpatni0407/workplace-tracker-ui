// src/components/common/userSettings/UserSettings.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "../../../services/axiosInstance";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import { useAuth } from "../../../context/AuthContext";
import "./UserSettings.css";

import {
  Option,
  TIMEZONES,
  WORK_WEEK_STARTS,
  LANGUAGES,
  DATE_FORMATS,
} from "../../../constants/userSettingsOptions";

type ApiResponse<T> = {
  status: string;
  message?: string;
  data?: T;
};

type SettingsData = {
  userSettingId?: number | null;
  userId?: number | null;
  timezone?: string | null;
  workWeekStart?: number | null;
  language?: string | null;
  dateFormat?: string | null;
};

const AUTO_DISMISS_MS = 3500;

const UserSettings: React.FC = () => {
  const { user } = useAuth();
  const authUserId = user?.userId ?? null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [settings, setSettings] = useState<SettingsData>({
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
  const [toast, setToast] = useState<{ message: string; kind?: "success" | "error" } | null>(null);

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

  const axiosErrorMessage = (err: unknown): string | null => {
    if (!err) return null;
    // @ts-ignore
    if (err?.response?.data?.message) return String(err.response.data.message);
    // @ts-ignore
    if (err?.message) return String(err.message);
    return String(err);
  };

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
        const resp = await axiosInstance.get<ApiResponse<SettingsData>>(url);

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
        const msgFromServer = axiosErrorMessage(err) ?? "Network/server error";
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
    [resetMessages, showToast, handleNotFoundResponse]
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
      const resp = await axiosInstance.put<ApiResponse<SettingsData>>(url, payload);
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
      const msg = axiosErrorMessage(err) || "Network/server error";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [authUserId, settings, resetMessages, showToast]);

  // open modal instead of window.confirm
  const requestDelete = () => setConfirmOpen(true);

  const performDelete = async () => {
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
      const msg = axiosErrorMessage(err) || "Network/server error";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setLoading(false);
    }
  };

  const canSave = useMemo(() => !!authUserId && !loading, [authUserId, loading]);

  return (
    <>
      <div className="user-settings container-fluid py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h1 className="um-title mb-0">User Settings</h1>
            <div className="text-muted small">Manage your preferences</div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => authUserId && loadSettings(authUserId)}
              disabled={loading || !authUserId}
              title="Reload settings"
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-arrow-clockwise me-1" />}
              Reload
            </button>
          </div>
        </div>

        {info && <div className="alert alert-info narrow fade-in">{info}</div>}
        {error && <div className="alert alert-danger narrow fade-in">{error}</div>}
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
                  onChange={(e) => setSettings((s) => ({ ...s, timezone: e.target.value || null }))}
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
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, workWeekStart: e.target.value ? Number(e.target.value) : null }))
                  }
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
                  onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value || null }))}
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
                  onChange={(e) => setSettings((s) => ({ ...s, dateFormat: e.target.value || null }))}
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
            <button className="btn btn-primary btn-lg" onClick={saveSettings} disabled={!canSave}>
              <i className="bi bi-save me-1"></i> {loading ? "Saving..." : "Save"}
            </button>
            <button className="btn btn-danger btn-lg" onClick={requestDelete} disabled={!canSave}>
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

      {/* Inline modal */}
      {confirmOpen && (
        <div className="us-modal-backdrop">
          <div className="us-modal">
            <div className="us-modal-header">
              <h5 className="us-modal-title">Delete settings?</h5>
            </div>
            <div className="us-modal-body">
              <p>
                Are you sure you want to delete settings for userId: {authUserId}? This action cannot
                be undone.
              </p>
            </div>
            <div className="us-modal-footer">
              <button className="btn btn-outline-secondary" onClick={() => setConfirmOpen(false)} disabled={confirmLoading}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={performDelete} disabled={confirmLoading}>
                {confirmLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserSettings;
