import React, { useEffect, useMemo, useState } from "react";
import Header from "../../common/header/Header";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip as ReTooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
} from "recharts";
import "./OfficeVisitAnalytics.css";

type AggRow = {
    period: string;
    wfo?: number;
    wfh?: number;
    hybrid?: number;
    others?: number;
    leave?: number;
    holiday?: number;
};

const jsonHeaders = { "Content-Type": "application/json" };

const COLORS = ["#4a00e0", "#10b981", "#7a57ff", "#f97316", "#dc3545", "#16a34a"];

const OfficeVisitAnalytics: React.FC = () => {
    const { user } = useAuth();
    const userId = ((user as any)?.userId ?? (user as any)?.id) as number | undefined;

    const today = new Date();
    const defaultFromDate = startOfMonth(today);
    const defaultToDate = endOfMonth(today);

    const [from, setFrom] = useState<string>(format(defaultFromDate, "yyyy-MM-dd"));
    const [to, setTo] = useState<string>(format(defaultToDate, "yyyy-MM-dd"));
    const [groupBy, setGroupBy] = useState<"month" | "week" | "year">("month");

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<AggRow[]>([]);
    const [error, setError] = useState<string | null>(null);

    // load aggregated analytics
    const load = async () => {
        if (!userId) {
            setError("User not identified");
            setRows([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const url = API_ENDPOINTS.ANALYTICS.VISITS_LEAVES_AGGREGATE({
                userId,
                from,
                to,
                groupBy,
            });
            const res = await fetch(url, { headers: jsonHeaders });
            if (!res.ok) {
                const b = await res.json().catch(() => ({}));
                throw new Error(b?.message || res.statusText || "Request failed");
            }
            const body = await res.json();
            setRows((body?.data ?? []) as AggRow[]);
        } catch (err: any) {
            console.error("load analytics", err);
            setError(err?.message ?? "Failed to load analytics");
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    // initial load
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // reload when filters change (debounced-ish)
    useEffect(() => {
        const t = setTimeout(() => load(), 220);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [from, to, groupBy]);

    // totals for summary & pie
    const totals = useMemo(() => {
        return rows.reduce(
            (acc, r) => {
                acc.wfo += Number(r.wfo ?? 0);
                acc.wfh += Number(r.wfh ?? 0);
                acc.hybrid += Number(r.hybrid ?? 0);
                acc.others += Number(r.others ?? 0);
                acc.leave += Number(r.leave ?? 0);
                acc.holiday += Number(r.holiday ?? 0);
                return acc;
            },
            { wfo: 0, wfh: 0, hybrid: 0, others: 0, leave: 0, holiday: 0 }
        );
    }, [rows]);

    // pie data (visits only)
    const pieData = useMemo(() => {
        const items = [
            { name: "WFO", value: totals.wfo },
            { name: "WFH", value: totals.wfh },
            { name: "Hybrid", value: totals.hybrid },
            { name: "Other", value: totals.others },
            { name: "Leave", value: totals.leave },
            { name: "Holiday", value: totals.holiday },
        ];
        // filter out zeros to keep chart clean
        return items.filter((i) => i.value > 0);
    }, [totals]);

    // bar chart data (per period)
    const barData = useMemo(() => {
        return rows.map((r) => ({
            period: r.period,
            WFO: Number(r.wfo ?? 0),
            WFH: Number(r.wfh ?? 0),
            Hybrid: Number(r.hybrid ?? 0),
        }));
    }, [rows]);

    // line chart for leaves vs holidays trend
    const lineData = useMemo(() => {
        return rows.map((r) => ({
            period: r.period,
            Leaves: Number(r.leave ?? 0),
            Holidays: Number(r.holiday ?? 0),
        }));
    }, [rows]);

    // CSV export quick helper
    const exportCSV = () => {
        if (!rows || rows.length === 0) {
            alert("No data to export");
            return;
        }
        const header = ["Period", "WFO", "WFH", "Hybrid", "Others", "Leave", "Holiday"];
        const csv =
            [header.join(",")]
                .concat(
                    rows.map((r) =>
                        [
                            r.period,
                            r.wfo ?? 0,
                            r.wfh ?? 0,
                            r.hybrid ?? 0,
                            r.others ?? 0,
                            r.leave ?? 0,
                            r.holiday ?? 0,
                        ].join(",")
                    )
                )
                .join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `office_visit_analytics_${from}_to_${to}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container py-4">
            <Header
                title="Office Visit Analytics"
                subtitle="Summary of WFO / WFH / Hybrid and leaves & holidays"
            />

            <div className="card analytics-card shadow-sm mb-3">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label small">From</label>
                            <input type="date" className="form-control" value={from} onChange={(e) => setFrom(e.target.value)} />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label small">To</label>
                            <input type="date" className="form-control" value={to} onChange={(e) => setTo(e.target.value)} />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label small">Group By</label>
                            <select className="form-select" value={groupBy} onChange={(e) => setGroupBy(e.target.value as any)}>
                                <option value="month">Month</option>
                                <option value="week">Week</option>
                                <option value="year">Year</option>
                            </select>
                        </div>

                        <div className="col-md-4 text-end">
                            <div className="d-flex justify-content-end gap-2">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                        setFrom(format(defaultFromDate, "yyyy-MM-dd"));
                                        setTo(format(defaultToDate, "yyyy-MM-dd"));
                                    }}
                                >
                                    Reset
                                </button>

                                <button className="btn btn-outline-info" onClick={exportCSV} title="Export CSV">
                                    Export CSV
                                </button>

                                <button
                                    className="btn btn-primary"
                                    onClick={load}
                                    disabled={loading}
                                    title="Refresh analytics"
                                >
                                    {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row gx-4">
                <div className="col-xl-7 col-lg-8">
                    <div className="card shadow-sm mb-3 chart-card">
                        <div className="card-body">
                            <h6 className="mb-3">Visits composition</h6>
                            <div style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={4}
                                            isAnimationActive
                                        >
                                            {pieData.map((entry, idx) => (
                                                <Cell key={`c-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <ReTooltip formatter={(value: any, name: any) => [value, name]} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm mb-3 chart-card">
                        <div className="card-body">
                            <h6 className="mb-3">Visits per period</h6>
                            <div style={{ height: 320 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData} margin={{ top: 10, right: 8, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <ReTooltip />
                                        <Legend />
                                        <Bar dataKey="WFO" stackId="a" fill={COLORS[0]} />
                                        <Bar dataKey="WFH" stackId="a" fill={COLORS[1]} />
                                        <Bar dataKey="Hybrid" stackId="a" fill={COLORS[2]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm mb-3 chart-card">
                        <div className="card-body">
                            <h6 className="mb-3">Leaves & Holidays trend</h6>
                            <div style={{ height: 240 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={lineData} margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <ReTooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="Leaves" stroke="#dc3545" strokeWidth={2} dot />
                                        <Line type="monotone" dataKey="Holidays" stroke="#16a34a" strokeWidth={2} dot />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-5 col-lg-4">
                    <div className="card summary-card shadow-sm mb-3">
                        <div className="card-body">
                            <h6 className="mb-3">Summary</h6>

                            <div className="summary-row"><span>WFO</span><strong>{totals.wfo}</strong></div>
                            <div className="summary-bar"><div style={{ width: `${Math.min(100, totals.wfo)}%` }} /></div>

                            <div className="summary-row"><span>WFH</span><strong>{totals.wfh}</strong></div>
                            <div className="summary-bar"><div style={{ width: `${Math.min(100, totals.wfh)}%`, background: "#10b981" }} /></div>

                            <div className="summary-row"><span>Hybrid</span><strong>{totals.hybrid}</strong></div>
                            <div className="summary-bar"><div style={{ width: `${Math.min(100, totals.hybrid)}%`, background: "#7a57ff" }} /></div>

                            <div className="summary-row"><span>Other</span><strong>{totals.others}</strong></div>
                            <div className="summary-bar"><div style={{ width: `${Math.min(100, totals.others)}%`, background: "#f97316" }} /></div>

                            <div className="summary-row mt-3"><span>Leaves</span><strong className="text-danger">{totals.leave}</strong></div>
                            <div className="summary-row"><span>Holidays</span><strong className="text-success">{totals.holiday}</strong></div>

                            <div className="small text-muted mt-3">Tip: change the date range and grouping to compare periods. Use Export to download CSV.</div>
                        </div>
                    </div>

                    <div className="card shadow-sm actions-card mb-3">
                        <div className="card-body">
                            <h6 className="mb-2">Quick actions</h6>
                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => {
                                        setFrom(format(defaultFromDate, "yyyy-MM-dd"));
                                        setTo(format(defaultToDate, "yyyy-MM-dd"));
                                    }}
                                >
                                    Jump to current month
                                </button>

                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                        setFrom(format(new Date(today.getFullYear(), 0, 1), "yyyy-MM-dd"));
                                        setTo(format(new Date(today.getFullYear(), 11, 31), "yyyy-MM-dd"));
                                    }}
                                >
                                    Year-to-date
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm info-card">
                        <div className="card-body">
                            <h6 className="mb-2">Notes</h6>
                            <div className="small text-muted">
                                This view aggregates visits and leaves for easier comparison. Charts are interactive — hover to see detailed numbers.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="mt-3 text-danger small">{error}</div>}
        </div>
    );
};

export default OfficeVisitAnalytics;
