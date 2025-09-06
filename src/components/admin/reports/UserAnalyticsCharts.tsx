// src/components/reports/UserAnalyticsCharts.tsx
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";

type Role = "ADMIN" | "USER";

export interface UserRow {
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

const COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#ef4444", "#10b981"];
const PIE_COLORS = ["#6366f1", "#a78bfa", "#60a5fa", "#f97316"];

function SimpleTooltip(props: { active?: boolean; payload?: any[]; label?: string | number }) {
  const { active, payload, label } = props;
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "#fff", padding: 10, borderRadius: 8, boxShadow: "0 8px 30px rgba(2,6,23,0.08)", minWidth: 120 }}>
      {label !== undefined && <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color, fontWeight: 600, marginTop: 4 }}>
          {p.name}: <span style={{ fontWeight: 800 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

const UserAnalyticsCharts: React.FC<{
  users: UserRow[];
  chart?: "activePie" | "roleLocked" | "attemptsBar" | "all" | "newUsers" | "domains";
  compact?: boolean;
}> = ({ users, chart = "all", compact = false }) => {
  // aggregates
  const totals = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.isActive).length;
    const inactive = total - active;
    const locked = users.filter(u => u.isAccountLocked).length;
    const unlocked = total - locked;
    const roleMap: Record<string, number> = {};
    const roleActive: Record<string, number> = {};
    const roleLocked: Record<string, number> = {};
    users.forEach(u => {
      roleMap[u.role] = (roleMap[u.role] || 0) + 1;
      roleActive[u.role] = (roleActive[u.role] || 0) + (u.isActive ? 1 : 0);
      roleLocked[u.role] = (roleLocked[u.role] || 0) + (u.isAccountLocked ? 1 : 0);
    });
    const attemptsBuckets: Record<string, number> = {};
    users.forEach(u => {
      const a = typeof u.loginAttempts === "number" ? u.loginAttempts : 0;
      let bucket = "0";
      if (a === 0) bucket = "0";
      else if (a <= 2) bucket = "1-2";
      else if (a <= 5) bucket = "3-5";
      else bucket = "6+";
      attemptsBuckets[bucket] = (attemptsBuckets[bucket] || 0) + 1;
    });

    // newUsers by month (based on lastLoginTime as proxy)
    const newUsersByMonth: Record<string, number> = {};
    users.forEach(u => {
      if (!u.lastLoginTime) return;
      const d = new Date(u.lastLoginTime);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      newUsersByMonth[key] = (newUsersByMonth[key] || 0) + 1;
    });

    // domains
    const domains: Record<string, number> = {};
    users.forEach(u => {
      const ep = (u.email || "").split("@")[1] || "unknown";
      domains[ep] = (domains[ep] || 0) + 1;
    });

    return { total, active, inactive, locked, unlocked, roleMap, roleActive, roleLocked, attemptsBuckets, newUsersByMonth, domains };
  }, [users]);

  const activeData = [
    { name: "Active", value: totals.active },
    { name: "Inactive", value: totals.inactive },
  ];
  const roleData = Object.entries(totals.roleMap).map(([k, v]) => ({ name: k, value: v }));
  const orderBuckets = ["0", "1-2", "3-5", "6+"];
  const attemptsData = orderBuckets.map(k => ({ bucket: k, count: totals.attemptsBuckets[k] || 0 }));

  // prepare extra datasets
  const newUsersSeries = useMemo(() => {
    const entries = Object.entries(totals.newUsersByMonth)
      .map(([k, v]) => ({ month: k, count: v }))
      .sort((a, b) => a.month.localeCompare(b.month));
    // ensure at least something for line chart
    if (entries.length === 0) return [{ month: "n/a", count: 0 }];
    return entries;
  }, [totals.newUsersByMonth]);

  const domainSeries = useMemo(() => {
    const items = Object.entries(totals.domains).map(([d, v]) => ({ domain: d, count: v }));
    items.sort((a, b) => b.count - a.count);
    // top 8
    return items.slice(0, 8);
  }, [totals.domains]);

  // Compact multi view for card
  if (compact || chart === "all") {
    return (
      <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 120, height: 110 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={activeData} dataKey="value" innerRadius={18} outerRadius={36} paddingAngle={3} labelLine={false}>
                {activeData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<SimpleTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 13, marginTop: 8 }}>Active / Inactive</div>
        </div>

        <div style={{ width: 120, height: 110 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={roleData} dataKey="value" innerRadius={14} outerRadius={36} paddingAngle={4} labelLine={false} label={({ name, percent }: any) => `${name} (${Math.round(percent * 100)}%)`}>
                {roleData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<SimpleTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 13, marginTop: 8 }}>Roles</div>
        </div>

        <div style={{ flex: 1, height: 110 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attemptsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis hide />
              <Bar dataKey="count" fill={COLORS[2]}>
                {attemptsData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
              <Tooltip content={<SimpleTooltip />} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 13, marginTop: 8 }}>Attempts</div>
        </div>
      </div>
    );
  }

  // activePie
  if (chart === "activePie") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={activeData} dataKey="value" nameKey="name" cx="50%" cy="48%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`} >
            {activeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip content={<SimpleTooltip />} />
          <Legend verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // roleLocked (pie + stacked bar)
  if (chart === "roleLocked") {
    const roleOrder = Object.keys(totals.roleMap);
    const stackedData = roleOrder.map(r => ({ role: r, active: totals.roleActive[r] || 0, locked: totals.roleLocked[r] || 0 }));

    return (
      <div style={{ display: "flex", gap: 18, alignItems: "stretch", width: "100%", height: "100%" }}>
        <div style={{ flex: "0 0 44%", minWidth: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={roleData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={86} paddingAngle={3} labelLine={false} label={(entry: any) => `${entry.name} (${entry.value})`}>
                {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<SimpleTooltip />} />
              <Legend layout="horizontal" verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: "1 1 56%", minWidth: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackedData} margin={{ top: 8, right: 12, left: 6, bottom: 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<SimpleTooltip />} />
              <Legend verticalAlign="top" />
              <Bar dataKey="active" stackId="a" fill="#16a34a" />
              <Bar dataKey="locked" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // attemptsBar (full)
  if (chart === "attemptsBar") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={attemptsData} margin={{ top: 12, right: 24, left: 8, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bucket" />
          <YAxis allowDecimals={false} />
          <Tooltip content={<SimpleTooltip />} />
          <Bar dataKey="count">
            {attemptsData.map((entry, idx) => <Cell key={entry.bucket} fill={COLORS[idx % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // New users over time (line)
  if (chart === "newUsers") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={newUsersSeries} margin={{ top: 8, right: 18, left: 8, bottom: 18 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip content={<SimpleTooltip />} />
          <Line type="monotone" dataKey="count" stroke={COLORS[0]} strokeWidth={3} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // domains bar
  if (chart === "domains") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={domainSeries} margin={{ top: 8, right: 18, left: 8, bottom: 18 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="domain" interval={0} angle={-25} textAnchor="end" height={60} />
          <YAxis allowDecimals={false} />
          <Tooltip content={<SimpleTooltip />} />
          <Bar dataKey="count">
            {domainSeries.map((entry, idx) => <Cell key={entry.domain} fill={COLORS[idx % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // fallback: small multi-charts
  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={activeData} dataKey="value" nameKey="name" cx="28%" cy="50%" outerRadius={60} label />
          <Pie data={roleData} dataKey="value" nameKey="name" cx="72%" cy="50%" outerRadius={48} label />
          <Tooltip content={<SimpleTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserAnalyticsCharts;
