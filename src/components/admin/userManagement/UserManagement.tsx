// src/pages/UserManagement/UserManagement.tsx
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import axiosInstance from "../../../services/axiosInstance";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import "./UserManagement.css";

type Role = "ADMIN" | "USER";

interface UserRow {
  userId: number;
  name: string;
  email: string;
  mobileNumber?: string | null;
  role: Role;
  isActive: boolean;
  isAccountLocked: boolean;
  lastLoginTime?: string | null;
  loginAttempts?: number | null;
}

type SortDirection = "asc" | "desc" | null;

const DEBOUNCE_MS = 280;
const PAGE_SIZE = 12;

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | Role>("ALL");
  const [error, setError] = useState<string | null>(null);

  // sorting
  const [sortBy, setSortBy] = useState<keyof UserRow | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  // pagination
  const [page, setPage] = useState(1);

  // modal / toast
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    action: "toggleActive" | "toggleLock" | null;
    userId?: number;
    label?: string;
  }>({ open: false, action: null });

  const [toast, setToast] = useState<{ message: string; kind?: "success" | "error" } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // debounce search
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axiosInstance.get(API_ENDPOINTS.USERS.GET_ALL);
      if (resp?.data?.status === "SUCCESS" && Array.isArray(resp.data.data)) {
        const mapped: UserRow[] = resp.data.data.map((u: any) => ({
          userId: u.userId,
          name: u.username || u.name || "",
          email: u.email || "",
          mobileNumber: u.mobileNumber || null,
          role: (u.role as Role) || "USER",
          isActive: !!u.isActive,
          isAccountLocked: !!u.isAccountLocked,
          lastLoginTime: u.lastLoginTime || null,
          loginAttempts:
            typeof u.loginAttempts === "number" ? u.loginAttempts : null,
        }));
        setUsers(mapped);
        // reset pagination when data refreshes
        setPage(1);
      } else {
        setError(resp?.data?.message || "Failed to load users.");
      }
    } catch (err: any) {
      console.error("fetchUsers error:", err);
      setError(err?.response?.data?.message || "Network/server error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      locked: users.filter((u) => u.isAccountLocked).length,
      admins: users.filter((u) => u.role === "ADMIN").length,
    }),
    [users]
  );

  // filtered + sorted
  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    const base = users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.mobileNumber || "").includes(q)
      );
    });

    if (!sortBy || !sortDir) return base;

    const sorted = [...base].sort((a: any, b: any) => {
      const av = a[sortBy] ?? "";
      const bv = b[sortBy] ?? "";
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      }
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      // fallback to string compare
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return sorted;
  }, [users, debouncedQuery, roleFilter, sortBy, sortDir]);

  // pagination slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  useEffect(() => setPage(pageSafe), [pageSafe]); // keep page in range if filtered size change
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageSafe]);

  // util: toggle sort
  const handleSort = (col: keyof UserRow) => {
    if (sortBy !== col) {
      setSortBy(col);
      setSortDir("asc");
    } else {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortBy(null);
        setSortDir(null);
      } else setSortDir("asc");
    }
  };

  // show toast
  const showToast = (message: string, kind: "success" | "error" = "success") => {
    setToast({ message, kind });
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4200);
  };

  useEffect(() => () => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
  }, []);

  // optimistic update helper
  const optimisticUpdate = async (id: number, patch: Partial<UserRow>, apiPayload: any, successMsg: string) => {
    const prev = users;
    setUsers((p) => p.map((u) => (u.userId === id ? { ...u, ...patch } : u)));

    try {
      const resp = await axiosInstance.patch(API_ENDPOINTS.USERS.UPDATE_STATUS, apiPayload);
      if (resp?.data?.status === "SUCCESS" && resp.data.data) {
        const updated = resp.data.data as Partial<UserRow>;
        setUsers((p) => p.map((u) => (u.userId === id ? { ...u, ...updated } : u)));
        showToast(successMsg, "success");
      } else {
        throw new Error(resp?.data?.message || "Failed to update");
      }
    } catch (err: any) {
      console.error("optimisticUpdate error:", err);
      setUsers(prev); // rollback
      showToast(err?.response?.data?.message || "Action failed", "error");
      setError(err?.response?.data?.message || "Network/server error.");
    }
  };

  // only open confirm modal now - action will be performed from modal confirm
  const confirmAction = (action: "toggleActive" | "toggleLock", u: UserRow) => {
    const label = action === "toggleActive" ? (u.isActive ? "Disable user" : "Enable user") : (u.isAccountLocked ? "Unlock user" : "Lock user");
    setConfirmState({ open: true, action, userId: u.userId, label });
  };

  const performConfirmedAction = async () => {
    if (!confirmState.action || !confirmState.userId) return;
    const id = confirmState.userId;
    const target = users.find((u) => u.userId === id);
    if (!target) {
      setConfirmState({ open: false, action: null });
      return;
    }

    if (confirmState.action === "toggleActive") {
      await optimisticUpdate(
        id,
        { isActive: !target.isActive },
        { userId: id, isActive: !target.isActive, isAccountLocked: target.isAccountLocked },
        `User ${!target.isActive ? "enabled" : "disabled"}`
      );
    } else {
      await optimisticUpdate(
        id,
        { isAccountLocked: !target.isAccountLocked },
        { userId: id, isActive: target.isActive, isAccountLocked: !target.isAccountLocked },
        `User ${!target.isAccountLocked ? "locked" : "unlocked"}`
      );
    }

    setConfirmState({ open: false, action: null });
  };

  // CSV export
  const exportCSV = () => {
    const header = ["User ID", "Name", "Email", "Mobile", "Role", "Active", "Locked", "Last Login", "Attempts"];
    const rows = filtered.map((u) => [
      u.userId,
      u.name,
      u.email,
      u.mobileNumber ?? "",
      u.role,
      u.isActive ? "Active" : "Inactive",
      u.isAccountLocked ? "Locked" : "Unlocked",
      u.lastLoginTime ?? "",
      typeof u.loginAttempts === "number" ? String(u.loginAttempts) : "",
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("CSV exported", "success");
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  // keyboard accessible row focus
  const rowKeyDown = (e: React.KeyboardEvent, u: UserRow) => {
    if (e.key === "Enter") {
      // toggle active on Enter for focused row
      confirmAction("toggleActive", u);
    }
  };

  return (
    <div className="user-management container-fluid py-4" data-animate="fade">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="um-title mb-0">User Management</h1>
          <div className="text-muted small">Welcome, {user?.name}</div>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={exportCSV}
            disabled={loading || users.length === 0}
            title="Export visible users to CSV"
          >
            <i className="bi bi-file-earmark-arrow-down me-1" /> Export CSV
          </button>

          <button
            className="btn btn-sm btn-outline-primary"
            onClick={fetchUsers}
            disabled={loading}
            title="Refresh"
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" />
            ) : (
              <i className="bi bi-arrow-clockwise me-1" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {/* ---------- Stats Row (enhanced with Bootstrap effects) ---------- */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card shadow-sm p-3 rounded text-center um-card-acc d-flex flex-column justify-content-between border">
            <div className="d-flex w-100 justify-content-between align-items-start">
              <div className="text-start">
                <div className="stat-icon"><i className="bi bi-people-fill" /></div>
                <div className="stat-title">TOTAL</div>
              </div>
              <span className="badge bg-primary align-self-start">Users</span>
            </div>

            <div className="mt-2">
              <div className="d-flex align-items-center justify-content-between">
                <div className="stat-value h4 mb-0" aria-live="polite">{stats.total}</div>
              </div>

              {/* thin progress hint */}
              <div className="progress mt-2" style={{ height: 6 }}>
                <div className="progress-bar" role="progressbar" style={{ width: `${Math.min(100, Math.round((stats.total || 1) / 1))}%` }} aria-valuenow={stats.total} aria-valuemin={0} aria-valuemax={100}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card shadow-sm p-3 rounded text-center um-card-acc d-flex flex-column justify-content-between border">
            <div className="d-flex w-100 justify-content-between align-items-start">
              <div className="text-start">
                <div className="stat-icon"><i className="bi bi-check-circle-fill" /></div>
                <div className="stat-title">ACTIVE</div>
              </div>
              <span className="badge bg-success align-self-start">Live</span>
            </div>

            <div className="mt-2">
              <div className="stat-value h4 mb-0" aria-live="polite">{stats.active}</div>
              <div className="progress mt-2" style={{ height: 6 }}>
                <div className="progress-bar bg-success" role="progressbar" style={{ width: `${Math.round((stats.active / Math.max(1, stats.total)) * 100)}%` }} aria-valuenow={stats.active} aria-valuemin={0} aria-valuemax={stats.total}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card shadow-sm p-3 rounded text-center um-card-acc d-flex flex-column justify-content-between border">
            <div className="d-flex w-100 justify-content-between align-items-start">
              <div className="text-start">
                <div className="stat-icon"><i className="bi bi-lock-fill" /></div>
                <div className="stat-title">LOCKED</div>
              </div>
              <span className="badge bg-danger align-self-start">Attention</span>
            </div>

            <div className="mt-2">
              <div className="stat-value h4 mb-0 text-danger" aria-live="polite">{stats.locked}</div>
              <div className="progress mt-2" style={{ height: 6 }}>
                <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${Math.round((stats.locked / Math.max(1, stats.total)) * 100)}%` }} aria-valuenow={stats.locked} aria-valuemin={0} aria-valuemax={stats.total}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card shadow-sm p-3 rounded text-center um-card-acc d-flex flex-column justify-content-between border">
            <div className="d-flex w-100 justify-content-between align-items-start">
              <div className="text-start">
                <div className="stat-icon"><i className="bi bi-shield-lock-fill" /></div>
                <div className="stat-title">ADMINS</div>
              </div>
              <span className="badge bg-info text-dark align-self-start">Role</span>
            </div>

            <div className="mt-2">
              <div className="stat-value h4 mb-0" aria-live="polite">{stats.admins}</div>
              <div className="progress mt-2" style={{ height: 6 }}>
                <div className="progress-bar bg-info" role="progressbar" style={{ width: `${Math.round((stats.admins / Math.max(1, stats.total)) * 100)}%` }} aria-valuenow={stats.admins} aria-valuemin={0} aria-valuemax={stats.total}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-3 p-3 shadow-sm um-filter-card">
        <div className="d-flex gap-2 align-items-center flex-column flex-md-row">
          <input
            className="form-control flex-grow-1"
            placeholder="Search users by name, email, or mobile..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search users"
          />
          <select
            className="form-select w-auto"
            value={roleFilter}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "ALL" || val === "USER" || val === "ADMIN") setRoleFilter(val);
            }}
            aria-label="Filter by role"
          >
            <option value="ALL">All</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className="card shadow-sm user-table um-table-glow">
        <div className="table-responsive">
          {loading ? (
            <div className="p-4 text-center">
              <div className="spinner-border" role="status" />
            </div>
          ) : error ? (
            <div className="p-4 text-danger text-center">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-muted text-center">No users found.</div>
          ) : (
            <>
              <table className="table table-hover table-striped table-sm m-0 align-middle" style={{ minWidth: 1100 }}>
                <thead className="table-light">
                  <tr>
                    <th className="sno-col">S.No</th>
                    <th className="userid-col">User ID</th>

                    <th
                      onClick={() => handleSort("name")}
                      style={{ cursor: "pointer" }}
                    >
                      Name {sortBy === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>

                    <th
                      onClick={() => handleSort("email")}
                      style={{ cursor: "pointer", minWidth: 260 }}
                    >
                      Email {sortBy === "email" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>

                    <th>Mobile</th>

                    <th
                      onClick={() => handleSort("role")}
                      style={{ cursor: "pointer", width: 90 }}
                    >
                      Role {sortBy === "role" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>

                    <th
                      onClick={() => handleSort("lastLoginTime")}
                      style={{ cursor: "pointer", width: 160 }}
                    >
                      Last Login {sortBy === "lastLoginTime" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>

                    <th
                      onClick={() => handleSort("loginAttempts")}
                      style={{ cursor: "pointer", width: 110 }}
                    >
                      Attempts {sortBy === "loginAttempts" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>

                    <th style={{ width: 100 }}>Active</th>
                    <th style={{ width: 100 }}>Locked</th>
                    <th style={{ width: 170 }} className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paged.map((u, idx) => (
                    <tr
                      key={u.userId}
                      className="um-row"
                      style={{ animationDelay: `${idx * 35}ms` }}
                      tabIndex={0}
                      onKeyDown={(e) => rowKeyDown(e, u)}
                    >
                      <td className="sno-col">{(pageSafe - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="userid-col">{u.userId}</td>
                      <td>{u.name}</td>
                      <td className="text-truncate" style={{ maxWidth: 320 }}>
                        {u.email}
                      </td>
                      <td>{u.mobileNumber || "—"}</td>
                      <td>{u.role}</td>
                      <td>{formatDate(u.lastLoginTime)}</td>
                      <td>
                        {typeof u.loginAttempts === "number" ? (
                          <span
                            className={`attempts-badge ${u.loginAttempts === 0 ? "zero" : u.loginAttempts < 3 ? "warn" : "danger"
                              }`}
                          >
                            {u.loginAttempts}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? "bg-success" : "bg-secondary"}`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.isAccountLocked ? "bg-danger locked-badge" : "bg-success"}`}>
                          {u.isAccountLocked ? "Locked" : "Unlocked"}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className={`btn btn-sm ${u.isActive ? "btn-outline-danger" : "btn-outline-success"} me-2`}
                          onClick={() => confirmAction("toggleActive", u)}
                          aria-label={u.isActive ? "Disable user" : "Enable user"}
                        >
                          {u.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          className={`btn btn-sm ${u.isAccountLocked ? "btn-outline-success" : "btn-outline-warning"}`}
                          onClick={() => confirmAction("toggleLock", u)}
                          aria-label={u.isAccountLocked ? "Unlock user" : "Lock user"}
                        >
                          {u.isAccountLocked ? "Unlock" : "Lock"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="d-flex align-items-center justify-content-between p-3 border-top">
                <div className="small text-muted">
                  Showing {(pageSafe - 1) * PAGE_SIZE + 1} -{" "}
                  {Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length}
                </div>
                <div className="btn-group" role="group" aria-label="Pagination">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage(1)} disabled={pageSafe === 1}>
                    « First
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe === 1}>
                    ‹ Prev
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageSafe === totalPages}>
                    Next ›
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage(totalPages)} disabled={pageSafe === totalPages}>
                    Last »
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal (simple) */}
      {confirmState.open && (
        <div className="um-modal-backdrop">
          <div className="um-modal" role="dialog" aria-modal="true" aria-label="Confirm action">
            <div className="um-modal-header">
              <h5 className="mb-0">{confirmState.label}</h5>
            </div>
            <div className="um-modal-body p-3">
              <p className="mb-0">Are you sure you want to proceed? This action will update the user's status.</p>
            </div>
            <div className="um-modal-footer">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setConfirmState({ open: false, action: null })}>
                Cancel
              </button>
              <button className="btn btn-sm btn-primary" onClick={performConfirmedAction}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`um-toast ${toast.kind === "error" ? "um-toast-error" : "um-toast-success"}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
