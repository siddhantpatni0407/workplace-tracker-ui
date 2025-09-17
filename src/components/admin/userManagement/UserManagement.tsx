import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import axiosInstance from "../../../services/axiosInstance";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import { ErrorBoundary } from "../../ui";
import Header from "../../common/header/Header";
import { UserRole, SortDirection } from "../../../enums";
import { useDebounce } from "../../../hooks";
import { DEBOUNCE, PAGINATION } from "../../../constants/ui";
import "./user-management.css";

interface UserRow {
  userId: number;
  name: string;
  email: string;
  mobileNumber?: string | null;
  role: UserRole;
  isActive: boolean;
  isAccountLocked: boolean;
  lastLoginTime?: string | null;
  loginAttempts?: number | null;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, DEBOUNCE.SEARCH);
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [error, setError] = useState<string | null>(null);

  // sorting
  const [sortBy, setSortBy] = useState<keyof UserRow | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection | null>(null);

  // pagination
  const [page, setPage] = useState(1);

  // selection for bulk actions
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const selectAllOnPage = (ids: number[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());

  // modal / toast
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    action: "toggleActive" | "toggleLock" | "bulk" | null;
    userId?: number;
    label?: string;
    bulkAction?: "enable" | "disable" | "lock" | "unlock" | null;
  }>({ open: false, action: null, bulkAction: null });

  const [toast, setToast] = useState<{ message: string; kind?: "success" | "error" } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // modal focus ref
  const confirmConfirmBtnRef = useRef<HTMLButtonElement | null>(null);

  // debounce search - handled by useDebounce hook
  // Effect no longer needed as useDebounce handles it

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
          role: (u.role as UserRole) || UserRole.USER,
          isActive: !!u.isActive,
          isAccountLocked: !!u.isAccountLocked,
          lastLoginTime: u.lastLoginTime || null,
          loginAttempts: typeof u.loginAttempts === "number" ? u.loginAttempts : null,
        }));
        setUsers(mapped);
        setPage(1);
        clearSelection();
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
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.mobileNumber || "").includes(q);
    });

    if (!sortBy || !sortDir) return base;

    const sorted = [...base].sort((a: any, b: any) => {
      const av = a[sortBy] ?? "";
      const bv = b[sortBy] ?? "";
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

    return sorted;
  }, [users, debouncedQuery, roleFilter, sortBy, sortDir]);

  // pagination slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGINATION.DEFAULT_LIMIT));
  const pageSafe = Math.min(page, totalPages);
  useEffect(() => setPage(pageSafe), [pageSafe]);
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * PAGINATION.DEFAULT_LIMIT;
    return filtered.slice(start, start + PAGINATION.DEFAULT_LIMIT);
  }, [filtered, pageSafe]);

  // util: toggle sort
  const handleSort = (col: keyof UserRow) => {
    if (sortBy !== col) {
      setSortBy(col);
      setSortDir(SortDirection.ASC);
    } else {
      if (sortDir === SortDirection.ASC) setSortDir(SortDirection.DESC);
      else if (sortDir === "desc") {
        setSortBy(null);
        setSortDir(null);
      } else setSortDir(SortDirection.ASC);
    }
  };

  // show toast
  const showToast = (message: string, kind: "success" | "error" = "success") => {
    setToast({ message, kind });
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    // @ts-ignore
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4200);
  };

  useEffect(() => () => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
  }, []);

  // optimistic update helper (single user)
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

  // perform single / bulk confirmed action
  const performConfirmedAction = async () => {
    if (!confirmState.action) return;

    if (confirmState.action === "toggleActive" && confirmState.userId) {
      const id = confirmState.userId;
      const target = users.find((u) => u.userId === id);
      if (!target) return;
      await optimisticUpdate(
        id,
        { isActive: !target.isActive },
        { userId: id, isActive: !target.isActive, isAccountLocked: target.isAccountLocked },
        `User ${!target.isActive ? "enabled" : "disabled"}`
      );
    } else if (confirmState.action === "toggleLock" && confirmState.userId) {
      const id = confirmState.userId;
      const target = users.find((u) => u.userId === id);
      if (!target) return;
      await optimisticUpdate(
        id,
        { isAccountLocked: !target.isAccountLocked },
        { userId: id, isActive: target.isActive, isAccountLocked: !target.isAccountLocked },
        `User ${!target.isAccountLocked ? "locked" : "unlocked"}`
      );
    } else if (confirmState.action === "bulk" && confirmState.bulkAction) {
      const ids = Array.from(selected);
      if (ids.length === 0) {
        showToast("No users selected", "error");
        setConfirmState({ open: false, action: null, bulkAction: null });
        return;
      }

      // sequential processing
      for (const id of ids) {
        const target = users.find((u) => u.userId === id);
        if (!target) continue;
        if (confirmState.bulkAction === "enable" || confirmState.bulkAction === "disable") {
          const newActive = confirmState.bulkAction === "enable";
          await optimisticUpdate(
            id,
            { isActive: newActive },
            { userId: id, isActive: newActive, isAccountLocked: target.isAccountLocked },
            `User ${newActive ? "enabled" : "disabled"}`
          );
        } else if (confirmState.bulkAction === "lock" || confirmState.bulkAction === "unlock") {
          const newLocked = confirmState.bulkAction === "lock";
          await optimisticUpdate(
            id,
            { isAccountLocked: newLocked },
            { userId: id, isActive: target.isActive, isAccountLocked: newLocked },
            `User ${newLocked ? "locked" : "unlocked"}`
          );
        }
      }
      clearSelection();
    }

    setConfirmState({ open: false, action: null, bulkAction: null });
  };

  // confirm single / bulk
  const confirmAction = (action: "toggleActive" | "toggleLock", u: UserRow) => {
    const label = action === "toggleActive" ? (u.isActive ? "Disable user" : "Enable user") : (u.isAccountLocked ? "Unlock user" : "Lock user");
    setConfirmState({ open: true, action, userId: u.userId, label });
  };
  const confirmBulk = (bulkAction: "enable" | "disable" | "lock" | "unlock") => {
    const label =
      bulkAction === "enable" ? "Enable selected users"
      : bulkAction === "disable" ? "Disable selected users"
      : bulkAction === "lock" ? "Lock selected users" : "Unlock selected users";
    setConfirmState({ open: true, action: "bulk", label, bulkAction });
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

  // keyboard accessible row: Enter toggles checkbox
  const rowKeyDown = (e: React.KeyboardEvent, u: UserRow) => {
    if (e.key === "Enter") {
      if (e.shiftKey) confirmAction("toggleActive", u);
      else toggleSelect(u.userId);
    }
  };

  // helper: highlight match
  const highlight = (txt: string, q: string) => {
    if (!q) return txt;
    const idx = txt.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return txt;
    return (
      <>
        {txt.slice(0, idx)}
        <mark className="um-highlight">{txt.slice(idx, idx + q.length)}</mark>
        {txt.slice(idx + q.length)}
      </>
    );
  };

  // page-level ids for select-all
  const pageIds = paged.map((u) => u.userId);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  // Side-effect: lock body scroll when confirm modal open and focus management
  useEffect(() => {
    if (confirmState.open) {
      document.body.style.overflow = "hidden";
      // focus the confirm button when open (give it a tick)
      setTimeout(() => confirmConfirmBtnRef.current?.focus(), 40);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [confirmState.open]);

  // Close modal on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && confirmState.open) {
        setConfirmState({ open: false, action: null, bulkAction: null });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [confirmState.open]);

  return (
    <ErrorBoundary>
      <Header 
        title="User Management"
        subtitle="Manage user accounts and permissions"
      />
      
      <div className="user-management container-fluid py-4" data-animate="fade">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="um-title mb-0 d-none">User Management</h1>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <div className="d-none d-md-flex gap-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={exportCSV} disabled={loading || users.length === 0} title="Export visible users to CSV">
              <i className="bi bi-file-earmark-arrow-down me-1" /> Export CSV
            </button>

            <button className="btn btn-sm btn-outline-primary" onClick={fetchUsers} disabled={loading} title="Refresh">
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-arrow-clockwise me-1" />} Refresh
            </button>
          </div>

          {/* bulk actions */}
          <div className="btn-group">
            <button className="btn btn-sm btn-outline-dark dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" disabled={selected.size === 0}>
              Bulk actions ({selected.size})
            </button>
            <ul className="dropdown-menu dropdown-menu-end p-2">
              <button className="dropdown-item" onClick={() => confirmBulk("enable")} disabled={selected.size === 0}>Enable selected</button>
              <button className="dropdown-item" onClick={() => confirmBulk("disable")} disabled={selected.size === 0}>Disable selected</button>
              <li><hr className="dropdown-divider" /></li>
              <button className="dropdown-item" onClick={() => confirmBulk("lock")} disabled={selected.size === 0}>Lock selected</button>
              <button className="dropdown-item" onClick={() => confirmBulk("unlock")} disabled={selected.size === 0}>Unlock selected</button>
            </ul>
          </div>
        </div>
      </div>

      {/* ---------- Stats Row ---------- */}
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
              <div className="stat-value h4 mb-0" aria-live="polite">{stats.total}</div>
              <div className="progress mt-2 thin-progress">
                <div className="progress-bar" role="progressbar" style={{ width: `${Math.min(100, Math.round((stats.total || 1) / 1))}%` }} />
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
              <div className="progress mt-2 thin-progress">
                <div className="progress-bar bg-success" role="progressbar" style={{ width: `${Math.round((stats.active / Math.max(1, stats.total)) * 100)}%` }} />
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
              <div className="progress mt-2 thin-progress">
                <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${Math.round((stats.locked / Math.max(1, stats.total)) * 100)}%` }} />
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
              <div className="progress mt-2 thin-progress">
                <div className="progress-bar bg-info" role="progressbar" style={{ width: `${Math.round((stats.admins / Math.max(1, stats.total)) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* filter */}
      <div className="card mb-3 p-3 shadow-sm um-filter-card">
        <div className="d-flex gap-2 align-items-center flex-column flex-md-row">
          <input className="form-control flex-grow-1" placeholder="Search users by name, email, or mobile..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search users" />
          <select className="form-select w-auto" value={roleFilter} onChange={(e) => {
            const val = e.target.value;
            if (val === "ALL" || val === UserRole.USER || val === UserRole.ADMIN) setRoleFilter(val);
          }} aria-label="Filter by role">
            <option value="ALL">All</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className="card shadow-sm user-table um-table-glow">
        <div className="table-responsive">
          {loading ? (
            <div className="p-4 text-center"><div className="spinner-border" role="status" /></div>
          ) : error ? (
            <div className="p-4 text-danger text-center">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-muted text-center">No users found.</div>
          ) : (
            <>
              <table className="table table-hover table-striped table-sm m-0 align-middle" style={{ minWidth: 1100 }}>
                <thead className="table-light">
                  <tr>
                    <th className="sno-col">
                      <input type="checkbox" aria-label="Select all on page" checked={allOnPageSelected} onChange={() => selectAllOnPage(pageIds)} />
                    </th>
                    <th className="sno-col">S.No</th>
                    <th className="userid-col">User ID</th>

                    <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                      Name {sortBy === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>

                    <th onClick={() => handleSort("email")} style={{ cursor: "pointer", minWidth: 260 }}>
                      Email {sortBy === "email" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>

                    <th>Mobile</th>

                    <th onClick={() => handleSort("role")} style={{ cursor: "pointer", width: 90 }}>
                      Role {sortBy === "role" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>

                    <th onClick={() => handleSort("lastLoginTime")} style={{ cursor: "pointer", width: 160 }}>
                      Last Login {sortBy === "lastLoginTime" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>

                    <th onClick={() => handleSort("loginAttempts")} style={{ cursor: "pointer", width: 110 }}>
                      Attempts {sortBy === "loginAttempts" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>

                    <th style={{ width: 100 }}>Active</th>
                    <th style={{ width: 100 }}>Locked</th>
                    <th style={{ width: 170 }} className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paged.map((u, idx) => (
                    <tr key={u.userId} className={`um-row ${selected.has(u.userId) ? "selected-row" : ""}`} style={{ animationDelay: `${idx * 35}ms` }} tabIndex={0} onKeyDown={(e) => rowKeyDown(e, u)}>
                      <td>
                        <input type="checkbox" aria-label={`Select user ${u.name}`} checked={selected.has(u.userId)} onChange={() => toggleSelect(u.userId)} />
                      </td>
                      <td className="sno-col">{(pageSafe - 1) * PAGINATION.DEFAULT_LIMIT + idx + 1}</td>
                      <td className="userid-col">{u.userId}</td>
                      <td>{highlight(u.name, debouncedQuery)}</td>
                      <td className="text-truncate" style={{ maxWidth: 320 }}>{highlight(u.email, debouncedQuery)}</td>
                      <td>{highlight(u.mobileNumber || "—", debouncedQuery)}</td>
                      <td>{u.role}</td>
                      <td>{formatDate(u.lastLoginTime)}</td>
                      <td>{typeof u.loginAttempts === "number" ? <span className={`attempts-badge ${u.loginAttempts === 0 ? "zero" : u.loginAttempts < 3 ? "warn" : "danger"}`}>{u.loginAttempts}</span> : "—"}</td>
                      <td><span className={`badge ${u.isActive ? "bg-success" : "bg-secondary"}`}>{u.isActive ? "Active" : "Inactive"}</span></td>
                      <td><span className={`badge ${u.isAccountLocked ? "bg-danger locked-badge" : "bg-success"}`}>{u.isAccountLocked ? "Locked" : "Unlocked"}</span></td>
                      <td className="text-end">
                        <div className="d-inline-flex">
                          <button className={`btn btn-sm ${u.isActive ? "btn-outline-danger" : "btn-outline-success"} me-2`} onClick={() => confirmAction("toggleActive", u)} aria-label={u.isActive ? "Disable user" : "Enable user"}>{u.isActive ? "Disable" : "Enable"}</button>
                          <button className={`btn btn-sm ${u.isAccountLocked ? "btn-outline-success" : "btn-outline-warning"}`} onClick={() => confirmAction("toggleLock", u)} aria-label={u.isAccountLocked ? "Unlock user" : "Lock user"}>{u.isAccountLocked ? "Unlock" : "Lock"}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="d-flex align-items-center justify-content-between p-3 border-top">
                <div className="small text-muted">Showing {(pageSafe - 1) * PAGINATION.DEFAULT_LIMIT + 1} - {Math.min(pageSafe * PAGINATION.DEFAULT_LIMIT, filtered.length)} of {filtered.length}</div>
                <div className="btn-group" role="group" aria-label="Pagination">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage(1)} disabled={pageSafe === 1}>« First</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe === 1}>‹ Prev</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageSafe === totalPages}>Next ›</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage(totalPages)} disabled={pageSafe === totalPages}>Last »</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal (centered overlay) */}
      {confirmState.open && (
        <div className="um-modal-backdrop" role="presentation" onMouseDown={() => setConfirmState({ open: false, action: null })}>
          <div
            className="um-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="um-modal-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="um-modal-header d-flex align-items-start justify-content-between">
              <h5 id="um-modal-title" className="mb-0">{confirmState.label || (confirmState.bulkAction ? confirmState.bulkAction : "Confirm action")}</h5>
              <button className="btn-close" aria-label="Close dialog" onClick={() => setConfirmState({ open: false, action: null, bulkAction: null })} />
            </div>

            <div className="um-modal-body p-3">
              <p className="mb-0">
                {confirmState.action === "bulk"
                  ? `You are about to ${confirmState.bulkAction} ${selected.size} selected user(s). Proceed?`
                  : "Are you sure you want to proceed? This action will update the user's status."}
              </p>
            </div>

            <div className="um-modal-footer">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setConfirmState({ open: false, action: null, bulkAction: null })}>
                Cancel
              </button>
              <button
                ref={confirmConfirmBtnRef}
                className="btn btn-primary btn-sm ms-2"
                onClick={performConfirmedAction}
              >
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
    </ErrorBoundary>
  );
};

export default UserManagement;
