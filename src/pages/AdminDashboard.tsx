import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header/Header";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../services/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

type Role = "ADMIN" | "USER";

interface UserRow {
  userId: number;
  name: string;
  email: string;
  mobileNumber?: string | null;
  role: Role;
  isActive: boolean;
  isAccountLocked: boolean;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const resp = await axiosInstance.get(API_ENDPOINTS.USERS.GET_ALL);
      if (resp?.data?.status === "SUCCESS" && Array.isArray(resp.data.data)) {
        setUsers(
          resp.data.data.map((u: any) => ({
            userId: u.userId,
            name: u.username || u.name || "",
            email: u.email || "",
            mobileNumber: u.mobileNumber || null,
            role: (u.role as Role) || "USER",
            isActive: !!u.isActive,
            isAccountLocked: !!u.isAccountLocked,
          }))
        );
      }
    } catch (err) {
      console.error("fetchUsers error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const locked = users.filter((u) => u.isAccountLocked).length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    return { total, active, locked, admins };
  }, [users]);

  return (
    <div className="admin-page container-fluid py-3">
      <Header title="Admin Dashboard" subtitle="Manage users and reports" />
      <p className="lead">Welcome, {user?.name} (Admin)</p>
    </div>
  );
};

export default AdminDashboard;
