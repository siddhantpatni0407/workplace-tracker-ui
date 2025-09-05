// src/pages/UserManagement/UserManagement.tsx
import React, { useEffect, useMemo, useState } from "react";
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

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | Role>("ALL");
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
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
      } else {
        setError(resp?.data?.message || "Failed to load users.");
      }
    } catch (err: any) {
      console.error("fetchUsers error:", err);
      setError(err?.response?.data?.message || "Network/server error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      locked: users.filter((u) => u.isAccountLocked).length,
      admins: users.filter((u) => u.role === "ADMIN").length,
    }),
    [users]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.mobileNumber || "").includes(q)
      );
    });
  }, [users, query, roleFilter]);

  // ✅ API call to toggle Active
  const toggleActive = async (id: number) => {
    const target = users.find((u) => u.userId === id);
    if (!target) return;

    try {
      const resp = await axiosInstance.patch(
        API_ENDPOINTS.USERS.UPDATE_STATUS,
        {
          userId: id,
          isActive: !target.isActive,
          isAccountLocked: target.isAccountLocked,
        }
      );

      if (resp.data?.status === "SUCCESS" && resp.data.data) {
        const updated = resp.data.data;
        setUsers((prev) =>
          prev.map((u) => (u.userId === id ? { ...u, ...updated } : u))
        );
      } else {
        console.error("toggleActive failed:", resp.data);
        setError(resp.data?.message || "Failed to update status.");
      }
    } catch (err: any) {
      console.error("toggleActive error:", err);
      setError(err?.response?.data?.message || "Network/server error.");
    }
  };

  // ✅ API call to toggle Lock
  const toggleLock = async (id: number) => {
    const target = users.find((u) => u.userId === id);
    if (!target) return;

    try {
      const resp = await axiosInstance.patch(
        API_ENDPOINTS.USERS.UPDATE_STATUS,
        {
          userId: id,
          isActive: target.isActive,
          isAccountLocked: !target.isAccountLocked,
        }
      );

      if (resp.data?.status === "SUCCESS" && resp.data.data) {
        const updated = resp.data.data;
        setUsers((prev) =>
          prev.map((u) => (u.userId === id ? { ...u, ...updated } : u))
        );
      } else {
        console.error("toggleLock failed:", resp.data);
        setError(resp.data?.message || "Failed to update status.");
      }
    } catch (err: any) {
      console.error("toggleLock error:", err);
      setError(err?.response?.data?.message || "Network/server error.");
    }
  };

  const handleRoleSelect = (val: string) => {
    if (val === "ALL" || val === "USER" || val === "ADMIN") setRoleFilter(val);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="user-management container-fluid py-4" data-animate="fade">
      {/* Use full width — no narrow centered wrapper */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="um-title mb-0">User Management</h1>
          <div className="text-muted small">Welcome, {user?.name}</div>
        </div>
        <div>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={fetchUsers}
            disabled={loading}
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

      {/* Stats Row (keeps existing) */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card shadow-sm p-3 rounded text-center um-card-acc">
            <div className="stat-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="stat-title">TOTAL</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card shadow-sm p-3 rounded text-center um-card-acc">
            <div className="stat-icon">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div className="stat-title">ACTIVE</div>
            <div className="stat-value text-success">{stats.active}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card shadow-sm p-3 rounded text-center um-card-acc">
            <div className="stat-icon">
              <i className="bi bi-lock-fill"></i>
            </div>
            <div className="stat-title">LOCKED</div>
            <div className="stat-value text-danger">{stats.locked}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card shadow-sm p-3 rounded text-center um-card-acc">
            <div className="stat-icon">
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <div className="stat-title">ADMINS</div>
            <div className="stat-value">{stats.admins}</div>
          </div>
        </div>
      </div>

      {/* Filters (keeps existing) */}
      <div className="card mb-3 p-3 shadow-sm um-filter-card">
        <div className="d-flex gap-2 align-items-center flex-column flex-md-row">
          <input
            className="form-control flex-grow-1"
            placeholder="Search users by name, email, or mobile..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="form-select w-auto"
            value={roleFilter}
            onChange={(e) => handleRoleSelect(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {/* Full-width Users table (no narrow wrapper) */}
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
            <table className="table table-hover table-striped table-sm m-0 align-middle" style={{ minWidth: 1100 }}>
              <thead className="table-light">
                <tr>
                  <th className="sno-col">S.No</th>
                  <th className="userid-col">User ID</th>
                  <th>Name</th>
                  <th style={{ minWidth: 260 }}>Email</th>
                  <th>Mobile</th>
                  <th style={{ width: 90 }}>Role</th>
                  <th style={{ width: 160 }}>Last Login</th>
                  <th style={{ width: 110 }}>Attempts</th>
                  <th style={{ width: 100 }}>Active</th>
                  <th style={{ width: 100 }}>Locked</th>
                  <th style={{ width: 170 }} className="text-end">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => (
                  <tr key={u.userId} className="um-row" style={{ animationDelay: `${idx * 35}ms` }}>
                    <td className="sno-col">{idx + 1}</td>
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
                          className={`attempts-badge ${
                            u.loginAttempts === 0 ? "zero" : u.loginAttempts < 3 ? "warn" : "danger"
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
                        onClick={() => toggleActive(u.userId)}
                      >
                        {u.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        className={`btn btn-sm ${u.isAccountLocked ? "btn-outline-success" : "btn-outline-warning"}`}
                        onClick={() => toggleLock(u.userId)}
                      >
                        {u.isAccountLocked ? "Unlock" : "Lock"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
