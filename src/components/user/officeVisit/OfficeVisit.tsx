import React, { useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import Header from "../../common/header/Header";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import { toast } from "react-toastify";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip as ReTooltip,
    Legend,
} from "recharts";
import "./OfficeVisit.css";

/* DTO shapes (local) */
type OfficeVisitDTO = {
    officeVisitId?: number;
    userId?: number;
    visitDate?: string; // yyyy-MM-dd
    dayOfWeek?: number;
    visitType?: "WFO" | "WFH" | "HYBRID" | "OTHERS";
    notes?: string | null;
};

type DailyViewDTO = {
    date: string;
    dayOfWeek: number;
    label: string; // "NONE" | "HOLIDAY" | "LEAVE" | ...
    holidayName?: string | null;
    holidayType?: string | null;
    leavePolicyCode?: string | null;
    leaveDays?: number | null;
    leaveDayPart?: string | null;
    leaveNotes?: string | null;
    visitType?: string | null;
    visitNotes?: string | null;
};

const jsonHeaders = { "Content-Type": "application/json" };

const visitTypes = [
    { value: "WFO", label: "WFO (Onsite)" },
    { value: "WFH", label: "WFH (Remote)" },
    { value: "HYBRID", label: "Hybrid" },
    { value: "OTHERS", label: "Other" },
];

// color palette
const COLORS = {
    WFO: "#4a90e2",
    WFH: "#10b981",
    HYBRID: "#7a57ff",
    OTHERS: "#f97316",
    LEAVE: "#ff6b6b",
    HOLIDAY: "#ffd166",
};

const OfficeVisit: React.FC = () => {
    const { user } = useAuth();
    const userId = ((user as any)?.userId ?? (user as any)?.id) as number | undefined;

    // selected month/year (defaults to current)
    const today = new Date();
    const [year, setYear] = useState<number>(today.getFullYear());
    const [month, setMonth] = useState<number>(today.getMonth() + 1); // 1..12

    // filter & search for Daily View table
    const [filterLabel, setFilterLabel] = useState<string>("ALL"); // NONE, HOLIDAY, LEAVE, ALL
    const [filterVisitType, setFilterVisitType] = useState<string>("ALL"); // WFO, WFH, HYBRID, OTHERS, ALL
    const [searchQ, setSearchQ] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [visits, setVisits] = useState<OfficeVisitDTO[]>([]);
    const [dailyView, setDailyView] = useState<DailyViewDTO[]>([]);
    const [showAllDaily, setShowAllDaily] = useState<boolean>(false);

    // modal states
    const [showModal, setShowModal] = useState(false); // add/edit visit
    const [editing, setEditing] = useState<OfficeVisitDTO | null>(null);
    const [formDate, setFormDate] = useState<string>("");
    const [formType, setFormType] = useState<OfficeVisitDTO["visitType"]>("WFO");
    const [formNotes, setFormNotes] = useState<string>("");

    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<OfficeVisitDTO | null>(null);

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewTarget, setViewTarget] = useState<DailyViewDTO | null>(null);

    // tiny menu state for 3-dots per daily row (store date key)
    const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

    const formFirstRef = useRef<HTMLInputElement | null>(null);

    // derived defaults for quick jump
    const defaultFrom = startOfMonth(today);
    const defaultTo = endOfMonth(today);

    // load monthly visits
    async function loadVisits(y = year, m = month) {
        if (!userId) return;
        setLoading(true);
        try {
            const url = `${API_ENDPOINTS.VISITS.LIST}?userId=${userId}&year=${y}&month=${m}`;
            const res = await fetch(url);
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.message || res.statusText || "Failed to fetch visits");
            }
            const body = await res.json();
            setVisits(body?.data ?? []);
        } catch (err: any) {
            console.error("loadVisits", err);
            toast.error(err?.message ?? "Failed to load visits");
            setVisits([]);
        } finally {
            setLoading(false);
        }
    }

    async function loadDailyView(y = year, m = month, showAll = showAllDaily) {
        if (!userId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ userId: String(userId), year: String(y), month: String(m) });
            if (showAll) params.set("showAll", "true");
            const url = `${API_ENDPOINTS.DAILY_VIEW.FETCH}?${params.toString()}`;
            const res = await fetch(url);
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.message || res.statusText || "Failed to fetch daily view");
            }
            const body = await res.json();
            setDailyView(body?.data ?? []);
        } catch (err: any) {
            console.error("loadDailyView", err);
            toast.error(err?.message ?? "Failed to load daily view");
            setDailyView([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // initial load
        loadVisits();
        loadDailyView();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // reload whenever month/year or showAllDaily changes
    useEffect(() => {
        loadVisits(year, month);
        loadDailyView(year, month, showAllDaily);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year, month, showAllDaily]);

    // helpers for month navigation
    const prevMonth = () => {
        if (month === 1) {
            setYear((y) => y - 1);
            setMonth(12);
        } else {
            setMonth((m) => m - 1);
        }
    };
    const nextMonth = () => {
        if (month === 12) {
            setYear((y) => y + 1);
            setMonth(1);
        } else {
            setMonth((m) => m + 1);
        }
    };
    const jumpToCurrent = () => {
        setYear(today.getFullYear());
        setMonth(today.getMonth() + 1);
    };

    // open create modal
    const openCreate = () => {
        setEditing(null);
        setFormDate("");
        setFormType("WFO");
        setFormNotes("");
        setShowModal(true);
        setTimeout(() => formFirstRef.current?.focus(), 40);
    };

    // open edit
    const openEdit = (v: OfficeVisitDTO) => {
        setEditing(v);
        setFormDate(v.visitDate ?? "");
        setFormType((v.visitType as any) ?? "WFO");
        setFormNotes(v.notes ?? "");
        setShowModal(true);
        setTimeout(() => formFirstRef.current?.focus(), 40);
    };

    // upsert (create/update)
    const submit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!userId) {
            toast.error("User not identified");
            return;
        }
        if (!formDate) {
            toast.warn("Select a date");
            return;
        }
        if (!formType) {
            toast.warn("Select visit type");
            return;
        }

        try {
            const day = new Date(formDate).getDay(); // 0 (Sun) - 6 (Sat)
            // mapping: 1..7 where 7 = Sunday (if backend expects that)
            const dayOfWeek = day === 0 ? 7 : day;

            const payload = {
                userId,
                visitDate: formDate,
                dayOfWeek,
                visitType: formType,
                notes: formNotes || undefined,
                ...(editing?.officeVisitId ? { officeVisitId: editing.officeVisitId } : {}),
            };

            const method = editing?.officeVisitId ? "PUT" : "POST";
            const url = API_ENDPOINTS.VISITS.UPSERT;
            const res = await fetch(url, {
                method,
                headers: jsonHeaders,
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.message || res.statusText || "Failed to save visit");
            }
            const body = await res.json();
            toast.success(body?.message ?? "Visit saved");
            setShowModal(false);
            // reload lists
            await loadVisits(year, month);
            await loadDailyView(year, month, showAllDaily);
        } catch (err: any) {
            console.error("save visit", err);
            toast.error(err?.message ?? "Failed to save visit");
        }
    };

    // delete with confirmation
    const requestDelete = (v: OfficeVisitDTO) => {
        setDeleteTarget(v);
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget?.officeVisitId) {
            setConfirmDeleteOpen(false);
            setDeleteTarget(null);
            return;
        }
        try {
            const url = API_ENDPOINTS.VISITS.DELETE(deleteTarget.officeVisitId);
            const res = await fetch(url, { method: "DELETE" });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.message || res.statusText || "Failed to delete visit");
            }
            const body = await res.json();
            toast.success(body?.message ?? "Visit deleted");
            await loadVisits(year, month);
            await loadDailyView(year, month, showAllDaily);
        } catch (err: any) {
            console.error("delete visit", err);
            toast.error(err?.message ?? "Failed to delete visit");
        } finally {
            setConfirmDeleteOpen(false);
            setDeleteTarget(null);
        }
    };

    const cancelDelete = () => {
        setConfirmDeleteOpen(false);
        setDeleteTarget(null);
    };

    const formatDisplay = (iso?: string) => {
        if (!iso) return "";
        try {
            return format(parseISO(iso), "dd/MM/yyyy");
        } catch {
            return iso;
        }
    };

    // small derived counters from dailyView for summary (WFO/WFH/Hybrid/Others/Leave/Holiday)
    const summary = useMemo(() => {
        const s = { wfo: 0, wfh: 0, hybrid: 0, others: 0, leave: 0, holiday: 0 };
        for (const d of dailyView) {
            const vt = (d.visitType || "").toLowerCase();
            if (vt === "wfo") s.wfo++;
            else if (vt === "wfh") s.wfh++;
            else if (vt === "hybrid") s.hybrid++;
            else if (vt) s.others++;

            if (d.label === "LEAVE" || d.leavePolicyCode) s.leave++;
            if (d.label === "HOLIDAY" || d.holidayName) s.holiday++;
        }
        return s;
    }, [dailyView]);

    // pie data for visit mix
    const pieData = useMemo(() => {
        return [
            { name: "WFO", value: summary.wfo },
            { name: "WFH", value: summary.wfh },
            { name: "Hybrid", value: summary.hybrid },
            { name: "Other", value: summary.others },
        ].filter((d) => d.value > 0);
    }, [summary]);

    // map by date for quick lookup
    const dailyMap = useMemo(() => {
        const m = new Map<string, DailyViewDTO>();
        for (const d of dailyView) m.set(d.date, d);
        return m;
    }, [dailyView]);

    // Daily View filtering
    const dailyFiltered = useMemo(() => {
        return dailyView.filter((d) => {
            // filter by label
            if (filterLabel !== "ALL") {
                if (filterLabel === "NONE" && d.label !== "NONE") return false;
                if (filterLabel !== "NONE" && d.label !== filterLabel) return false;
            }
            // filter by visit type
            if (filterVisitType !== "ALL") {
                const vt = (d.visitType ?? "").toUpperCase();
                if (vt !== filterVisitType) return false;
            }
            // search by notes / holiday name / visit notes
            if (searchQ && searchQ.trim()) {
                const q = searchQ.trim().toLowerCase();
                const hay = [
                    d.holidayName ?? "",
                    d.holidayType ?? "",
                    d.leavePolicyCode ?? "",
                    String(d.leaveDays ?? ""),
                    d.leaveDayPart ?? "",
                    d.leaveNotes ?? "",
                    d.visitType ?? "",
                    d.visitNotes ?? "",
                    d.date ?? "",
                ].join(" ").toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [dailyView, filterLabel, filterVisitType, searchQ]);

    // determine a class for daily row (colors)
    const getDailyRowClass = (d: DailyViewDTO) => {
        if (d.label === "HOLIDAY" || d.holidayName) return "dv-row-holiday";
        if (d.label === "LEAVE" || d.leavePolicyCode) return "dv-row-leave";
        const vt = (d.visitType || "").toUpperCase();
        if (vt === "WFO") return "dv-row-wfo";
        if (vt === "WFH") return "dv-row-wfh";
        if (vt === "HYBRID") return "dv-row-hybrid";
        return "dv-row-others";
    };

    // open view details popup for a daily record
    const openViewDetails = (d: DailyViewDTO) => {
        setViewTarget(d);
        setViewModalOpen(true);
        setMenuOpenFor(null);
    };

    // improved edit via daily -> opens visit edit if visit exists
    const editFromDaily = (d: DailyViewDTO) => {
        // try to find visit for this date
        const v = visits.find((x) => x.visitDate === d.date);
        if (v) {
            openEdit(v);
        } else {
            // open new visit modal prefilled with date and default type
            setEditing(null);
            setFormDate(d.date);
            setFormType((d.visitType as any) ?? "WFO");
            setFormNotes(d.visitNotes ?? "");
            setShowModal(true);
        }
        setMenuOpenFor(null);
    };

    return (
        <div className="container-fluid py-3">
            <Header title="Office Visits" subtitle="Log, view and analyze your office visits" />

            {/* Top filters */}
            <div className="card mb-3 control-card shadow-sm">
                <div className="card-body">
                    <div className="row g-2 align-items-center">
                        <div className="col-auto d-flex gap-2">
                            <div className="btn-group">
                                <button className="btn btn-outline-secondary" onClick={prevMonth} aria-label="Previous month">◀</button>
                                <button className="btn btn-outline-secondary" onClick={jumpToCurrent}>Today</button>
                                <button className="btn btn-outline-secondary" onClick={nextMonth} aria-label="Next month">▶</button>
                            </div>
                        </div>

                        <div className="col-auto">
                            <select className="form-select form-select-sm" style={{ width: 220 }} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const m = i + 1;
                                    const label = new Date(2000, i, 1).toLocaleString(undefined, { month: "long" });
                                    return <option key={m} value={m}>{label} {year}</option>;
                                })}
                            </select>
                        </div>

                        <div className="col-auto">
                            <select className="form-select form-select-sm" style={{ width: 120 }} value={year} onChange={(e) => setYear(Number(e.target.value))}>
                                {Array.from({ length: 6 }).map((_, i) => {
                                    const y = today.getFullYear() - 2 + i;
                                    return <option key={y} value={y}>{y}</option>;
                                })}
                            </select>
                        </div>

                        {/* new filters */}
                        <div className="col-auto">
                            <select className="form-select form-select-sm" value={filterLabel} onChange={(e) => setFilterLabel(e.target.value)} >
                                <option value="ALL">All labels</option>
                                <option value="NONE">None</option>
                                <option value="HOLIDAY">Holiday</option>
                                <option value="LEAVE">Leave</option>
                            </select>
                        </div>

                        <div className="col-auto">
                            <select className="form-select form-select-sm" value={filterVisitType} onChange={(e) => setFilterVisitType(e.target.value)}>
                                <option value="ALL">All visit types</option>
                                <option value="WFO">WFO</option>
                                <option value="WFH">WFH</option>
                                <option value="HYBRID">Hybrid</option>
                                <option value="OTHERS">Other</option>
                            </select>
                        </div>

                        <div className="col-md-3">
                            <input className="form-control form-control-sm" placeholder="Search date/notes/holiday/leave..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
                        </div>

                        <div className="col text-end d-flex gap-2 justify-content-end">
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => { setFilterLabel("ALL"); setFilterVisitType("ALL"); setSearchQ(""); }}>
                                Reset filters
                            </button>
                            <button className="btn btn-outline-primary btn-sm" onClick={() => { loadVisits(year, month); loadDailyView(year, month, showAllDaily); toast.info("Refreshing..."); }}>
                                <i className="bi bi-arrow-repeat me-1" /> Refresh
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={openCreate}><i className="bi bi-plus-lg me-1" /> Add Visit</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI + main layout (full usage) */}
            <div className="row gx-4">
                {/* Left side: visits & daily view */}
                <div className="col-xl-8">
                    <div className="card shadow-sm mb-3">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <div>
                                <div className="fw-semibold">Visits ({month}/{year})</div>
                                <div className="small text-muted">Recorded visits for this month</div>
                            </div>

                            <div className="d-flex align-items-center gap-3">
                                <div className="vis-legend d-flex gap-2 align-items-center">
                                    <span className="legend-pill" style={{ background: COLORS.HOLIDAY }} /> Holiday
                                    <span className="legend-pill" style={{ background: COLORS.LEAVE, marginLeft: 10 }} /> Leave
                                    <span className="legend-pill" style={{ background: COLORS.WFO, marginLeft: 10 }} /> WFO
                                    <span className="legend-pill" style={{ background: COLORS.WFH, marginLeft: 10 }} /> WFH
                                </div>
                                <div className="small text-muted">{visits.length} recorded</div>
                            </div>
                        </div>

                        <div className="card-body p-0">
                            <div className="visits-table-wrapper">
                                <table className="table mb-0 visits-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: 130 }} className="text-center">Date</th>
                                            <th style={{ width: 110 }} className="text-center">Type</th>
                                            <th className="text-center">Notes</th>
                                            <th className="text-end" style={{ width: 160 }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={4} className="py-4 text-center"><div className="spinner-border text-primary me-2" role="status" />Loading...</td></tr>
                                        ) : visits.length === 0 ? (
                                            <tr><td colSpan={4} className="py-4 text-center text-muted">No visits recorded for this month.</td></tr>
                                        ) : visits.map((v) => {
                                            const dv = dailyMap.get(v.visitDate ?? "");
                                            // reuse earlier row-class logic
                                            const primaryClass = dv ? (dv.label === "HOLIDAY" || dv.holidayName ? "row-holiday" : dv.label === "LEAVE" || dv.leavePolicyCode ? "row-leave" : "") : "";
                                            const rowClass = primaryClass || (v.visitType ? `row-${(v.visitType || "").toLowerCase()}` : "row-others");
                                            return (
                                                <tr key={v.officeVisitId ?? `${v.visitDate}-${v.visitType}`} className={rowClass}>
                                                    <td className="text-center fw-semibold">{formatDisplay(v.visitDate)}</td>
                                                    <td className="text-center">{v.visitType}</td>
                                                    <td className="text-center text-truncate" style={{ maxWidth: 420 }}>{v.notes ?? (dv?.visitNotes ?? "-")}</td>
                                                    <td className="text-end">
                                                        <button className="btn btn-sm btn-light me-2" onClick={() => openEdit(v)}><i className="bi bi-pencil-fill me-1" /> Edit</button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => requestDelete(v)}><i className="bi bi-trash-fill me-1" /> Delete</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-header fw-semibold">Daily view ({month}/{year})</div>
                        <div className="card-body p-0">
                            <div className="table-responsive small dv-table-wrapper">
                                <table className="table mb-0 dv-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: 110 }} className="text-center">Date</th>
                                            <th style={{ width: 110 }} className="text-center">Label</th>
                                            <th>Details</th>
                                            <th style={{ width: 160 }} className="text-center">Visit</th>
                                            <th style={{ width: 60 }} className="text-end">•••</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dailyFiltered.length === 0 ? (
                                            <tr><td colSpan={5} className="py-4 text-center text-muted">No daily records for selected filters.</td></tr>
                                        ) : dailyFiltered.map((d) => {
                                            const cls = getDailyRowClass(d);
                                            return (
                                                <tr key={d.date} className={cls}>
                                                    <td className="text-center fw-semibold">{formatDisplay(d.date)}</td>
                                                    <td className="text-center">{d.label}</td>
                                                    <td>
                                                        {d.holidayName ? <div><strong>{d.holidayName}</strong> <small className="text-muted">({d.holidayType})</small></div> : null}
                                                        {d.leavePolicyCode ? <div>Leave: {d.leavePolicyCode} — {d.leaveDays}{d.leaveDayPart ? ` (${d.leaveDayPart})` : ""} {d.leaveNotes ? <small className="text-muted"> - {d.leaveNotes}</small> : null}</div> : null}
                                                    </td>
                                                    <td className="text-center">
                                                        {d.visitType ? <div><strong>{d.visitType}</strong><div className="small text-muted">{d.visitNotes}</div></div> : <span className="text-muted">-</span>}
                                                    </td>
                                                    <td className="text-end">
                                                        <div className="dropdown">
                                                            <button className="btn btn-sm btn-light" onClick={() => setMenuOpenFor(menuOpenFor === d.date ? null : d.date)}>
                                                                <i className="bi bi-three-dots-vertical"></i>
                                                            </button>

                                                            {menuOpenFor === d.date && (
                                                                <div className="dv-menu">
                                                                    <button className="dv-menu-item" onClick={() => openViewDetails(d)}>View details</button>
                                                                    <button className="dv-menu-item" onClick={() => editFromDaily(d)}>Edit / Create Visit</button>
                                                                    <button className="dv-menu-item text-danger" onClick={async () => {
                                                                        // try find visit and request delete
                                                                        const v = visits.find((x) => x.visitDate === d.date);
                                                                        if (v) requestDelete(v);
                                                                        else toast.info("No visit recorded on this date to delete.");
                                                                        setMenuOpenFor(null);
                                                                    }}>Delete visit</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side */}
                <div className="col-xl-4">
                    <div className="card summary-card shadow-sm mb-3">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <div className="fw-semibold">Month summary</div>
                                    <div className="small text-muted">{format(defaultFrom, "MMM yyyy")} — {format(defaultTo, "MMM yyyy")}</div>
                                </div>
                                <div className="small text-muted">{dailyView.length} days</div>
                            </div>

                            <div className="summary-grid mb-3">
                                <div className="summary-item">
                                    <div className="summary-label">WFO</div>
                                    <div className="summary-value">{summary.wfo}</div>
                                </div>
                                <div className="summary-item">
                                    <div className="summary-label">WFH</div>
                                    <div className="summary-value">{summary.wfh}</div>
                                </div>
                                <div className="summary-item">
                                    <div className="summary-label">Hybrid</div>
                                    <div className="summary-value">{summary.hybrid}</div>
                                </div>
                                <div className="summary-item">
                                    <div className="summary-label">Other</div>
                                    <div className="summary-value">{summary.others}</div>
                                </div>
                                <div className="summary-item">
                                    <div className="summary-label">Leaves</div>
                                    <div className="summary-value text-danger">{summary.leave}</div>
                                </div>
                                <div className="summary-item">
                                    <div className="summary-label">Holidays</div>
                                    <div className="summary-value text-success">{summary.holiday}</div>
                                </div>
                            </div>

                            <div style={{ height: 220 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={46} outerRadius={80} paddingAngle={3}>
                                            {pieData.map((entry, idx) => {
                                                const key = entry.name.toUpperCase();
                                                const color = (COLORS as any)[key] ?? "#999";
                                                return <Cell key={idx} fill={color} />;
                                            })}
                                        </Pie>
                                        <ReTooltip formatter={(val) => [val, "count"]} />
                                        <Legend verticalAlign="bottom" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="card quick-tips shadow-sm">
                        <div className="card-body">
                            <h6 className="mb-2">Quick Tips</h6>
                            <ul className="small mb-0">
                                <li>Use "Add Visit" to record WFO / WFH / Hybrid entries.</li>
                                <li>Use filters to narrow Daily View to holidays or leaves.</li>
                                <li>Click the three dots on any daily row to view details or edit.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit modal */}
            {showModal && (
                <div className="modal-backdrop-custom" role="dialog" aria-modal="true">
                    <div className="modal-card shadow-lg">
                        <div className="modal-header d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">{editing ? "Edit Visit" : "Add Visit"}</h6>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowModal(false)}>Close</button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="modal-body p-3">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Visit date</label>
                                    <input ref={formFirstRef} className="form-control" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} required />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Visit type</label>
                                    <select className="form-select" value={formType} onChange={(e) => setFormType(e.target.value as any)} required>
                                        {visitTypes.map((vt) => <option key={vt.value} value={vt.value}>{vt.label}</option>)}
                                    </select>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Notes (optional)</label>
                                    <input className="form-control" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
                                </div>
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-3">
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editing ? "Save changes" : "Add visit"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm delete modal */}
            {confirmDeleteOpen && deleteTarget && (
                <div className="modal-backdrop-custom" role="dialog" aria-modal="true">
                    <div className="modal-card shadow-lg">
                        <div className="modal-header d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 text-danger">Confirm delete</h6>
                            <button className="btn btn-sm btn-outline-secondary" onClick={cancelDelete}>Close</button>
                        </div>

                        <div className="modal-body p-3">
                            <p>Are you sure you want to delete the visit on <strong>{formatDisplay(deleteTarget.visitDate)}</strong>?</p>
                            <div className="small text-muted">This action cannot be undone.</div>

                            <div className="d-flex justify-content-end gap-2 mt-3">
                                <button className="btn btn-outline-secondary" onClick={cancelDelete}>Cancel</button>
                                <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View details modal for Daily View row */}
            {viewModalOpen && viewTarget && (
                <div className="modal-backdrop-custom" role="dialog" aria-modal="true">
                    <div className="modal-card shadow-lg">
                        <div className="modal-header d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">Details — {formatDisplay(viewTarget.date)}</h6>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setViewModalOpen(false)}>Close</button>
                        </div>

                        <div className="modal-body p-3">
                            <div className="mb-2"><strong>Label:</strong> <span className="ms-2">{viewTarget.label}</span></div>
                            {viewTarget.holidayName && <div className="mb-2"><strong>Holiday:</strong> <span className="ms-2">{viewTarget.holidayName} ({viewTarget.holidayType})</span></div>}
                            {viewTarget.leavePolicyCode && <div className="mb-2"><strong>Leave:</strong> <span className="ms-2">{viewTarget.leavePolicyCode} — {viewTarget.leaveDays}{viewTarget.leaveDayPart ? ` (${viewTarget.leaveDayPart})` : ""}</span></div>}
                            {viewTarget.leaveNotes && <div className="mb-2"><strong>Leave notes:</strong> <div className="small text-muted ms-2">{viewTarget.leaveNotes}</div></div>}
                            {viewTarget.visitType && <div className="mb-2"><strong>Visit:</strong> <span className="ms-2">{viewTarget.visitType}</span></div>}
                            {viewTarget.visitNotes && <div className="mb-2"><strong>Visit notes:</strong> <div className="small text-muted ms-2">{viewTarget.visitNotes}</div></div>}
                            <div className="d-flex justify-content-end mt-3">
                                <button className="btn btn-outline-secondary" onClick={() => setViewModalOpen(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OfficeVisit;
