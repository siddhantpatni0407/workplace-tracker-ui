import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header/Header";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../services/axiosInstance"; // optional for real API
import "./AdminDashboard.css";

type Role = "ADMIN" | "USER";

interface UserRow {
  userId: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  accountLocked: boolean;
  lastLoginTime?: string | null;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | Role>("ALL");
  const [error, setError] = useState<string | null>(null);

  // ===== Fetch Users (mock for now) =====
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace mock with API call when backend ready
      // const resp = await axiosInstance.get<UserRow[]>("/api/v1/workplace-tracker-service/user/fetch");
      // setUsers(resp.data);

      const mock: UserRow[] = [
        { userId: 1, name: "Siddhant Patni", email: "siddhant@example.com", role: "ADMIN", isActive: true, accountLocked: false },
        { userId: 2, name: "Priyanka Patni", email: "priyanka@example.com", role: "USER", isActive: true, accountLocked: false },
        { userId: 3, name: "John Doe", email: "john@example.com", role: "USER", isActive: false, accountLocked: true },
      ];
      await new Promise((r) => setTimeout(r, 400));
      setUsers(mock);
    } catch (e) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ===== Stats =====
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const locked = users.filter((u) => u.accountLocked).length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    return { total, active, locked, admins };
  }, [users]);

  // ===== Filtered list =====
  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      const q = query.trim().toLowerCase();
      return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [users, query, roleFilter]);

  // ===== Actions =====
  const toggleActive = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.userId === id ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const toggleLock = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.userId === id ? { ...u, accountLocked: !u.accountLocked } : u))
    );
  };

  return (
    <div className="admin-page container-fluid py-3">
      <Header title="Admin Dashboard" subtitle="Manage users and reports" />

      <p className="lead">Welcome, {user?.name} (Admin)</p>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-md-3">
          <div className="stat-card shadow-sm p-3 rounded">
            <div className="stat-title">Total Users</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="stat-card shadow-sm p-3 rounded">
            <div className="stat-title">Active</div>
            <div className="stat-value text-success">{stats.active}</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="stat-card shadow-sm p-3 rounded">
            <div className="stat-title">Locked</div>
            <div className="stat-value text-danger">{stats.locked}</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="stat-card shadow-sm p-3 rounded">
            <div className="stat-title">Admins</div>
            <div className="stat-value">{stats.admins}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4 p-3 shadow-sm">
        <div className="d-flex flex-column flex-md-row gap-2 align-items-center justify-content-between">
          <div className="d-flex gap-2 w-100">
            <input
              className="form-control"
              placeholder="Search users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
            >
              <option value="ALL">All</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button
            className="btn btn-outline-secondary mt-2 mt-md-0"
            onClick={fetchUsers}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Users table */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          {loading ? (
            <div className="p-4 text-center">Loading users…</div>
          ) : error ? (
            <div className="p-4 text-danger text-center">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-muted text-center">No users found.</div>
          ) : (
            <table className="table table-hover m-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Active</th>
                  <th>Locked</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.userId}>
                    <td>{u.userId}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <span className={`badge ${u.isActive ? "bg-success" : "bg-secondary"}`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{u.accountLocked ? "Locked" : "—"}</td>
                    <td className="text-end">
                      <button
                        className={`btn btn-sm ${u.isActive ? "btn-outline-danger" : "btn-outline-success"} me-2`}
                        onClick={() => toggleActive(u.userId)}
                      >
                        {u.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        className={`btn btn-sm ${u.accountLocked ? "btn-outline-success" : "btn-outline-warning"}`}
                        onClick={() => toggleLock(u.userId)}
                      >
                        {u.accountLocked ? "Unlock" : "Lock"}
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

export default AdminDashboard;
