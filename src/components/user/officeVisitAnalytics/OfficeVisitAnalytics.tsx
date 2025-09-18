import React, { useEffect, useMemo, useState } from "react";
import Header from "../../common/header/Header";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
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
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts";
import "./office-visit-analytics.css";

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

const VISIT_TYPES = ["ALL", "WFO", "WFH", "HYBRID", "OTHER"] as const;

const OfficeVisitAnalytics: React.FC = () => {
    const { user } = useAuth();
    const userId = ((user as any)?.userId ?? (user as any)?.id) as number | undefined;

    const today = new Date();
    const defaultFromDate = startOfMonth(today);
    const defaultToDate = endOfMonth(today);

    // filters
    const [from, setFrom] = useState<string>(format(defaultFromDate, "yyyy-MM-dd"));
    const [to, setTo] = useState<string>(format(defaultToDate, "yyyy-MM-dd"));
    const [groupBy, setGroupBy] = useState<"month" | "week" | "year">("month");
    const [visitType, setVisitType] = useState<typeof VISIT_TYPES[number]>("ALL");
    const [showAll, setShowAll] = useState<boolean>(false); // includes holidays/leaves in daily view
    const [quickRange, setQuickRange] = useState<string>("currentMonth");

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<AggRow[]>([]);
    const [error, setError] = useState<string | null>(null);

    // fetch aggregated endpoint
    const load = async () => {
        if (!userId) {
            setError("User not identified");
            setRows([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // build params with optional visitType & showAll
            const url = API_ENDPOINTS.ANALYTICS.VISITS_LEAVES_AGGREGATE({
                userId,
                from,
                to,
                groupBy,
            });

            // server side grouping - we just call the same endpoint; client-side visitType filtering performed below
            const res = await fetch(url, { headers: jsonHeaders });
            if (!res.ok) {
                const b = await res.json().catch(() => ({}));
                throw new Error(b?.message || res.statusText || "Request failed");
            }
            const body = await res.json();
            const raw = (body?.data ?? []) as AggRow[];
            setRows(raw);
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
            }, []);

    // reload when filters change (debounced-ish)
    useEffect(() => {
        const t = setTimeout(() => load(), 220);
        return () => clearTimeout(t);
            }, [from, to, groupBy, visitType, showAll]);

    // derived totals (optionally filter by visitType)
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

    // pie data (overall composition)
    const pieData = useMemo(() => {
        const items = [
            { name: "WFO", value: totals.wfo },
            { name: "WFH", value: totals.wfh },
            { name: "Hybrid", value: totals.hybrid },
            { name: "Other", value: totals.others },
            { name: "Leave", value: totals.leave },
            { name: "Holiday", value: totals.holiday },
        ];
        return items.filter((i) => i.value > 0);
    }, [totals]);

    // stacked bar data (period by period)
    const barData = useMemo(() => {
        return rows.map((r) => ({
            period: r.period,
            WFO: Number(r.wfo ?? 0),
            WFH: Number(r.wfh ?? 0),
            Hybrid: Number(r.hybrid ?? 0),
            Others: Number(r.others ?? 0),
            Leave: Number(r.leave ?? 0),
            Holiday: Number(r.holiday ?? 0),
        }));
    }, [rows]);

    // area stacked trend
    const areaData = useMemo(() => {
        return rows.map((r) => ({
            period: r.period,
            Visits: (Number(r.wfo ?? 0) + Number(r.wfh ?? 0) + Number(r.hybrid ?? 0) + Number(r.others ?? 0)),
            Leave: Number(r.leave ?? 0),
            Holiday: Number(r.holiday ?? 0),
        }));
    }, [rows]);

    // radar distribution for quick snapshot (normalize to max)
    const radarData = useMemo(() => {
        const maxVal = Math.max(totals.wfo, totals.wfh, totals.hybrid, totals.others, 1);
        return [
            { subject: "WFO", A: totals.wfo, fullMark: maxVal },
            { subject: "WFH", A: totals.wfh, fullMark: maxVal },
            { subject: "Hybrid", A: totals.hybrid, fullMark: maxVal },
            { subject: "Other", A: totals.others, fullMark: maxVal },
        ];
    }, [totals]);

    // Quick presets
    const applyQuickRange = (key: string) => {
        setQuickRange(key);
        if (key === "currentMonth") {
            const f = startOfMonth(new Date());
            const t = endOfMonth(new Date());
            setFrom(format(f, "yyyy-MM-dd"));
            setTo(format(t, "yyyy-MM-dd"));
        } else if (key === "last3Months") {
            const f = startOfMonth(subMonths(new Date(), 2)); // start of month 2 months ago (3 months total)
            const t = endOfMonth(new Date());
            setFrom(format(f, "yyyy-MM-dd"));
            setTo(format(t, "yyyy-MM-dd"));
        } else if (key === "ytd") {
            const f = new Date(todayYear(), 0, 1);
            const t = new Date(todayYear(), 11, 31);
            setFrom(format(f, "yyyy-MM-dd"));
            setTo(format(t, "yyyy-MM-dd"));
        }
    };

    // helpers
    function todayYear() {
        return new Date().getFullYear();
    }

    // CSV export
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
        <div className="container-fluid py-4">
            <Header
                title="Office Visit Analytics"
                subtitle="Full-page analytics & charts for visits, leaves and holidays"
            />

            {/* FILTER / KPI ROW */}
            <div className="card analytics-card shadow-sm mb-3">
                <div className="card-body">
                    <div className="row gx-3 gy-2 align-items-end">
                        <div className="col-xl-2 col-md-3">
                            <label className="form-label small">From</label>
                            <input type="date" className="form-control" value={from} onChange={(e) => setFrom(e.target.value)} />
                        </div>

                        <div className="col-xl-2 col-md-3">
                            <label className="form-label small">To</label>
                            <input type="date" className="form-control" value={to} onChange={(e) => setTo(e.target.value)} />
                        </div>

                        <div className="col-xl-2 col-md-3">
                            <label className="form-label small">Group By</label>
                            <select className="form-select" value={groupBy} onChange={(e) => setGroupBy(e.target.value as any)}>
                                <option value="month">Month</option>
                                <option value="week">Week</option>
                                <option value="year">Year</option>
                            </select>
                        </div>

                        <div className="col-xl-2 col-md-3">
                            <label className="form-label small">Visit Type</label>
                            <select className="form-select" value={visitType} onChange={(e) => setVisitType(e.target.value as any)}>
                                {Array.from(VISIT_TYPES).map((vt) => <option key={vt} value={vt}>{vt}</option>)}
                            </select>
                        </div>

                        <div className="col-xl-2 col-md-4">
                            <label className="form-label small">Show All</label>
                            <div className="form-check form-switch">
                                <input id="showAllToggle" className="form-check-input" type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
                                <label className="form-check-label small ms-2" htmlFor="showAllToggle">Include leaves & holidays</label>
                            </div>
                        </div>

                        <div className="col-xl-2 col-md-12 text-end">
                            <div className="d-flex justify-content-end gap-2">
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => { setFrom(format(defaultFromDate, "yyyy-MM-dd")); setTo(format(defaultToDate, "yyyy-MM-dd")); }}>Reset</button>
                                <button className="btn btn-outline-info btn-sm" onClick={exportCSV} title="Export CSV">Export</button>
                                <button className="btn btn-primary btn-sm" onClick={load} disabled={loading}>{loading ? <span className="spinner-border spinner-border-sm me-1" /> : null} Refresh</button>
                            </div>
                        </div>

                        {/* quick presets */}
                        <div className="col-12 mt-2">
                            <div className="d-flex gap-2 flex-wrap align-items-center">
                                <small className="text-muted me-2">Quick ranges:</small>
                                <button className={`btn btn-sm ${quickRange === "currentMonth" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => applyQuickRange("currentMonth")}>Current month</button>
                                <button className={`btn btn-sm ${quickRange === "last3Months" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => applyQuickRange("last3Months")}>Last 3 months</button>
                                <button className={`btn btn-sm ${quickRange === "ytd" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => applyQuickRange("ytd")}>Year to date</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI strip */}
            <div className="row gx-3 mb-3">
                <div className="col-md-3">
                    <div className="card kpi-card shadow-sm">
                        <div className="card-body">
                            <div className="kpi-label">Total Visits</div>
                            <div className="kpi-value">{totals.wfo + totals.wfh + totals.hybrid + totals.others}</div>
                            <div className="kpi-sub">in selected range</div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card kpi-card shadow-sm">
                        <div className="card-body">
                            <div className="kpi-label">Total Leaves</div>
                            <div className="kpi-value text-danger">{totals.leave}</div>
                            <div className="kpi-sub">in selected range</div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card kpi-card shadow-sm">
                        <div className="card-body">
                            <div className="kpi-label">Holidays</div>
                            <div className="kpi-value text-success">{totals.holiday}</div>
                            <div className="kpi-sub">in selected range</div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card kpi-card shadow-sm">
                        <div className="card-body">
                            <div className="kpi-label">Most common</div>
                            <div className="kpi-value">{(totals.wfo >= totals.wfh && totals.wfo >= totals.hybrid) ? "WFO" : (totals.wfh >= totals.hybrid ? "WFH" : "Hybrid")}</div>
                            <div className="kpi-sub">dominant type</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT (full width charts + large table) */}
            <div className="row gx-4">
                <div className="col-xl-8">
                    <div className="card chart-panel shadow-sm mb-3">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <h6 className="mb-0">Visits composition</h6>
                                <small className="text-muted">Distribution across types</small>
                            </div>

                            <div className="row">
                                <div className="col-md-6" style={{ minHeight: 280 }}>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4} isAnimationActive>
                                                {pieData.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                            </Pie>
                                            <ReTooltip formatter={(value: any, name: any) => [value, name]} />
                                            <Legend verticalAlign="bottom" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="col-md-6" style={{ minHeight: 280 }}>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subject" />
                                            <PolarRadiusAxis />
                                            <Radar name="Distribution" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                            <Legend />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card chart-panel shadow-sm mb-3">
                        <div className="card-body">
                            <h6 className="mb-0">Period breakdown (stacked)</h6>
                            <div style={{ height: 360 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData} margin={{ top: 16, right: 12, left: 0, bottom: 6 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <ReTooltip />
                                        <Legend />
                                        <Bar dataKey="WFO" stackId="a" fill={COLORS[0]} />
                                        <Bar dataKey="WFH" stackId="a" fill={COLORS[1]} />
                                        <Bar dataKey="Hybrid" stackId="a" fill={COLORS[2]} />
                                        <Bar dataKey="Others" stackId="a" fill={COLORS[3]} />
                                        <Bar dataKey="Leave" stackId="b" fill={COLORS[4]} />
                                        <Bar dataKey="Holiday" stackId="b" fill={COLORS[5]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="card chart-panel shadow-sm mb-3">
                        <div className="card-body">
                            <h6 className="mb-0">Visits / Leaves trend</h6>
                            <div style={{ height: 240 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={areaData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                                        <defs>
                                            <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4a00e0" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#4a00e0" stopOpacity={0.05} />
                                            </linearGradient>
                                            <linearGradient id="leaveGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#dc3545" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#dc3545" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <ReTooltip />
                                        <Legend />
                                        <Area type="monotone" dataKey="Visits" stackId="1" stroke="#4a00e0" fill="url(#visitsGrad)" />
                                        <Area type="monotone" dataKey="Leave" stackId="1" stroke="#dc3545" fill="url(#leaveGrad)" />
                                        <Area type="monotone" dataKey="Holiday" stackId="1" stroke="#16a34a" fill="#16a34a" fillOpacity={0.12} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: large table (full-space) */}
                <div className="col-xl-4">
                    <div className="card table-card shadow-sm mb-3" style={{ height: "100%" }}>
                        <div className="card-body p-0 d-flex flex-column" style={{ minHeight: 640 }}>
                            <div className="table-toolbar px-3 py-2 d-flex justify-content-between align-items-center">
                                <div className="fw-semibold">Aggregated visits & leaves</div>
                                <div className="small text-muted">{rows.length} periods</div>
                            </div>

                            <div className="table-scroll">
                                <table className="table table-hover mb-0 analytics-table small">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Period</th>
                                            <th className="text-center">WFO</th>
                                            <th className="text-center">WFH</th>
                                            <th className="text-center">Hybrid</th>
                                            <th className="text-center">Others</th>
                                            <th className="text-center">Leave</th>
                                            <th className="text-center">Holiday</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={7} className="py-4 text-center"><div className="spinner-border text-primary me-2" role="status" />Loading...</td></tr>
                                        ) : rows.length === 0 ? (
                                            <tr><td colSpan={7} className="py-4 text-center text-muted">No data</td></tr>
                                        ) : (
                                            rows.map((r) => (
                                                <tr key={r.period}>
                                                    <td className="fw-semibold">{r.period}</td>
                                                    <td className="text-center">{r.wfo ?? 0}</td>
                                                    <td className="text-center">{r.wfh ?? 0}</td>
                                                    <td className="text-center">{r.hybrid ?? 0}</td>
                                                    <td className="text-center">{r.others ?? 0}</td>
                                                    <td className="text-center">{r.leave ?? 0}</td>
                                                    <td className="text-center">{r.holiday ?? 0}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-3 py-2 border-top small text-muted">
                                Tip: expand the range or change grouping to view trends. Use Export to download CSV.
                            </div>
                        </div>
                    </div>

                    <div className="card info-card shadow-sm">
                        <div className="card-body">
                            <h6 className="mb-2">Insights</h6>
                            <ul className="small mb-0">
                                <li>Stacked charts show how visits mix evolves across periods.</li>
                                <li>Use Visit Type filter to focus on WFO/WFH/Hybrid only.</li>
                                <li>Toggle "Show All" to include leaves & holidays in the charts.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="mt-3 text-danger small">{error}</div>}
        </div>
    );
};

export default OfficeVisitAnalytics;
