import React, { useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import Header from "../../common/header/Header";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import axiosInstance from "../../../services/axiosInstance";
import { toast } from "react-toastify";
import { useTranslation } from "../../../hooks/useTranslation";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip as ReTooltip,
    Legend,
} from "recharts";
import "./office-visit.css";

import { OfficeVisitDTO, DailyViewDTO } from "../../../models/OfficeVisit";
import { HTTP } from "../../../constants/app";

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
    const { t } = useTranslation();
    const userId = ((user as any)?.userId ?? (user as any)?.id) as number | undefined;

    // Dynamic visit types based on translations
    const visitTypes = [
        { value: "WFO", label: t("officeVisit.types.wfo") },
        { value: "WFH", label: t("officeVisit.types.wfh") },
        { value: "HYBRID", label: t("officeVisit.types.hybrid") },
        { value: "OTHERS", label: t("officeVisit.types.others") },
    ];

    // selected month/year (defaults to current)
    const today = new Date();
    const [year, setYear] = useState<number>(today.getFullYear());
    const [month, setMonth] = useState<number>(today.getMonth() + 1); // 1..12

    // filter & search for Daily View table
    const [filterLabel, setFilterLabel] = useState<string>("ALL"); // NONE, HOLIDAY, LEAVE, ALL
    const [filterVisitType, setFilterVisitType] = useState<string>("ALL"); // WFO, WFH, HYBRID, OTHERS, ALL
    const [searchQ, setSearchQ] = useState<string>("");

    const [visits, setVisits] = useState<OfficeVisitDTO[]>([]);
    const [dailyView, setDailyView] = useState<DailyViewDTO[]>([]);
    const [showAllDaily, setShowAllDaily] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

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

    // load monthly visits
    async function loadVisits(y = year, m = month) {
        if (!userId) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                year: y.toString(),
                month: m.toString()
            });
            const res = await axiosInstance.get(`${API_ENDPOINTS.VISITS.LIST}?${params}`);
            setVisits(res.data?.data ?? []);
        } catch (err: any) {
            console.error("loadVisits", err);
            toast.error(err?.message ?? "Failed to load visits");
            setVisits([]);
        } finally {
            setIsLoading(false);
        }
    }

    async function loadDailyView(y = year, m = month, showAll = showAllDaily) {
        if (!userId) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ year: String(y), month: String(m) });
            if (showAll) params.set("showAll", "true");
            const url = `${API_ENDPOINTS.DAILY_VIEW.FETCH}?${params.toString()}`;
            const res = await axiosInstance.get(url);
            setDailyView(res.data?.data ?? []);
        } catch (err: any) {
            console.error("loadDailyView", err);
            toast.error(err?.message ?? "Failed to load daily view");
            setDailyView([]);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        // initial load
        loadVisits();
        loadDailyView();
            }, []);

    // reload whenever month/year or showAllDaily changes
    useEffect(() => {
        loadVisits(year, month);
        loadDailyView(year, month, showAllDaily);
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

    // Quick action to directly save today's visit
    const quickSaveToday = async (visitType: "WFO" | "WFH") => {
        if (!userId) {
            toast.error(t("officeVisit.messages.userNotIdentified"));
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        
        // Check if there's already a visit for today
        const existingVisit = visits.find(v => v.visitDate === today);
        
        try {
            const day = new Date(today).getDay(); // 0 (Sun) - 6 (Sat)
            const dayOfWeek = day === 0 ? 7 : day;

            const payload = {
                userId,
                visitDate: today,
                dayOfWeek,
                visitType,
                notes: "",
                ...(existingVisit?.officeVisitId ? { officeVisitId: existingVisit.officeVisitId } : {}),
            };

            const method = existingVisit?.officeVisitId ? "PUT" : "POST";
            const url = API_ENDPOINTS.VISITS.UPSERT;
            const res = await axiosInstance({
                method,
                url,
                data: payload,
            });
            
            const responseBody = res.data;
            toast.success(responseBody?.message ?? t("officeVisit.messages.savedForToday", { type: visitType }));
            // reload lists
            await loadVisits(year, month);
            await loadDailyView(year, month, showAllDaily);
        } catch (err: any) {
            console.error("quickSaveToday", err);
            toast.error(err?.message ?? "Failed to save visit");
        }
    };

    // open edit
    const openEdit = (v: OfficeVisitDTO | null) => {
        setEditing(v);
        if (v) {
            setFormDate(v.visitDate ?? "");
            setFormType((v.visitType as any) ?? "WFO");
            setFormNotes(v.notes ?? "");
        } else {
            // New visit - set defaults
            setFormDate(new Date().toISOString().split('T')[0]);
            setFormType("WFO");
            setFormNotes("");
        }
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
            const res = await axiosInstance({
                method,
                url,
                data: payload,
            });
            
            const body = res.data;
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
            const res = await axiosInstance.delete(url);
            const body = res.data;
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

    // determine a class for daily row (colors) - Enhanced
    const getDailyRowClass = (d: DailyViewDTO) => {
        if (d.label === "HOLIDAY" || d.holidayName) return "enhanced-row-holiday table-warning";
        if (d.label === "LEAVE" || d.leavePolicyCode) return "enhanced-row-leave table-danger";
        const vt = (d.visitType || "").toUpperCase();
        if (vt === "WFO") return "enhanced-row-wfo table-primary";
        if (vt === "WFH") return "enhanced-row-wfh table-success";
        if (vt === "HYBRID") return "enhanced-row-hybrid table-info";
        return "enhanced-row-default";
    };

    // Get status badge for daily record
    const getStatusBadge = (d: DailyViewDTO) => {
        if (d.label === "HOLIDAY" || d.holidayName) {
            return <span className="badge bg-warning text-dark fw-semibold">
                <i className="bi bi-star-fill me-1"></i>Holiday
            </span>;
        }
        if (d.label === "LEAVE" || d.leavePolicyCode) {
            return <span className="badge bg-danger fw-semibold">
                <i className="bi bi-calendar-x me-1"></i>Leave
            </span>;
        }
        const vt = (d.visitType || "").toUpperCase();
        if (vt === "WFO") {
            return <span className="badge bg-primary fw-semibold">
                <i className="bi bi-building me-1"></i>WFO
            </span>;
        }
        if (vt === "WFH") {
            return <span className="badge bg-success fw-semibold">
                <i className="bi bi-house me-1"></i>WFH
            </span>;
        }
        if (vt === "HYBRID") {
            return <span className="badge bg-info fw-semibold">
                <i className="bi bi-laptop me-1"></i>Hybrid
            </span>;
        }
        return <span className="badge bg-secondary">
            <i className="bi bi-question-circle me-1"></i>Unset
        </span>;
    };

    // Get visit badge class
    const getVisitBadgeClass = (visitType: string | null) => {
        const vt = (visitType || "").toUpperCase();
        switch (vt) {
            case "WFO": return "bg-primary";
            case "WFH": return "bg-success";
            case "HYBRID": return "bg-info";
            default: return "bg-secondary";
        }
    };

    // Get visit icon
    const getVisitIcon = (visitType: string | null) => {
        const vt = (visitType || "").toUpperCase();
        switch (vt) {
            case "WFO": return <i className="bi bi-building me-1"></i>;
            case "WFH": return <i className="bi bi-house me-1"></i>;
            case "HYBRID": return <i className="bi bi-laptop me-1"></i>;
            default: return <i className="bi bi-question-circle me-1"></i>;
        }
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
            <Header title={t("officeVisit.title")} subtitle={t("officeVisit.subtitle")} />

            {/* Top filters */}
            <div className="card mb-3 control-card shadow-sm">
                <div className="card-body">
                    <div className="row g-2 align-items-center">
                        <div className="col-auto d-flex gap-2">
                            <div className="btn-group" role="group" aria-label="Month navigation">
                                <button className="btn btn-outline-secondary btn-sm" onClick={prevMonth} aria-label="Previous month">
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                                <button className="btn btn-outline-primary btn-sm px-3" onClick={jumpToCurrent}>
                                    <i className="bi bi-calendar-day me-1"></i>Today
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={nextMonth} aria-label="Next month">
                                    <i className="bi bi-chevron-right"></i>
                                </button>
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

                        {/* showAllDaily toggle (uses setShowAllDaily) */}
                        <div className="col-auto d-flex align-items-center">
                            <div className="form-check form-switch">
                                <input
                                    id="showAllTop"
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={showAllDaily}
                                    onChange={(e) => setShowAllDaily(e.target.checked)}
                                />
                                <label className="form-check-label ms-2" htmlFor="showAllTop">Show all details</label>
                            </div>
                        </div>

                        <div className="col text-end d-flex gap-2 justify-content-end">
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => { setFilterLabel("ALL"); setFilterVisitType("ALL"); setSearchQ(""); }}>
                                <i className="bi bi-funnel me-1" />
                                Reset filters
                            </button>
                            <button 
                                className="btn btn-outline-primary btn-sm position-relative" 
                                onClick={async () => { 
                                    toast.info("Refreshing data...");
                                    await Promise.all([
                                        loadVisits(year, month), 
                                        loadDailyView(year, month, showAllDaily)
                                    ]);
                                    toast.success("Data refreshed!");
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                        Refreshing...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-arrow-clockwise me-1" /> Refresh
                                    </>
                                )}
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={() => openEdit(null)}>
                                <i className="bi bi-plus-lg me-1" /> {t("officeVisit.addVisit")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI + main layout (full usage) */}
            <div className="row gx-4">
                {/* Enhanced Daily View - Main Section */}
                <div className="col-xl-8">
                    <div className="card shadow-lg border-0">
                        <div className="card-header bg-gradient-primary text-white d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <i className="bi bi-calendar3 me-2"></i>
                                <div>
                                    <span className="fw-bold">Daily View</span>
                                    <div className="small opacity-75">
                                        {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                            <div className="daily-view-legend d-flex align-items-center gap-3">
                                <div className="legend-item d-flex align-items-center">
                                    <div className="legend-dot bg-primary"></div>
                                    <small className="text-white-50">WFO</small>
                                </div>
                                <div className="legend-item d-flex align-items-center">
                                    <div className="legend-dot bg-success"></div>
                                    <small className="text-white-50">WFH</small>
                                </div>
                                <div className="legend-item d-flex align-items-center">
                                    <div className="legend-dot bg-warning"></div>
                                    <small className="text-white-50">Holiday</small>
                                </div>
                                <div className="legend-item d-flex align-items-center">
                                    <div className="legend-dot bg-danger"></div>
                                    <small className="text-white-50">Leave</small>
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive enhanced-daily-table">
                                <table className="table table-hover mb-0 daily-enhanced-table">
                                    <thead className="table-dark">
                                        <tr>
                                            <th style={{ width: 110 }} className="text-center fw-bold">
                                                <i className="bi bi-calendar-date me-1"></i>Date
                                            </th>
                                            <th style={{ width: 110 }} className="text-center fw-bold">
                                                <i className="bi bi-tag me-1"></i>Label
                                            </th>
                                            <th className="fw-bold">
                                                <i className="bi bi-info-circle me-1"></i>Details
                                            </th>
                                            <th style={{ width: 160 }} className="text-center fw-bold">
                                                <i className="bi bi-geo-alt me-1"></i>Visit
                                            </th>
                                            <th style={{ width: 80 }} className="text-center fw-bold">
                                                <i className="bi bi-three-dots"></i>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={5} className="py-5 text-center">
                                                    <div className="loading-state">
                                                        <div className="spinner-border text-primary mb-3" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                        <p className="text-muted mb-0">Loading your data...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : dailyFiltered.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-5 text-center">
                                                    <div className="empty-state">
                                                        <i className="bi bi-calendar-x text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                                                        <h5 className="text-muted mb-2">No records found</h5>
                                                        <p className="text-muted mb-3">No daily records match your current filters.</p>
                                                        <button 
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => { setFilterLabel("ALL"); setFilterVisitType("ALL"); setSearchQ(""); }}
                                                        >
                                                            <i className="bi bi-funnel me-1"></i>
                                                            Clear Filters
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : dailyFiltered.map((d, index) => {
                                            const cls = getDailyRowClass(d);
                                            const statusBadge = getStatusBadge(d);
                                            const rowAnimation = { animationDelay: `${index * 50}ms` };
                                            
                                            return (
                                                <tr key={d.date} className={`${cls} enhanced-row`} style={rowAnimation}>
                                                    <td className="text-center fw-semibold">
                                                        <div className="date-badge">
                                                            {formatDisplay(d.date)}
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        {statusBadge}
                                                    </td>
                                                    <td>
                                                        {d.holidayName ? (
                                                            <div className="detail-content">
                                                                <strong className="text-warning">
                                                                    <i className="bi bi-star-fill me-1"></i>
                                                                    {d.holidayName}
                                                                </strong>
                                                                <small className="text-muted d-block">({d.holidayType})</small>
                                                            </div>
                                                        ) : null}
                                                        {d.leavePolicyCode ? (
                                                            <div className="detail-content">
                                                                <strong className="text-danger">
                                                                    <i className="bi bi-calendar-x me-1"></i>
                                                                    Leave: {d.leavePolicyCode}
                                                                </strong>
                                                                <small className="text-muted d-block">
                                                                    {d.leaveDays} day{d.leaveDays !== 1 ? 's' : ''}
                                                                    {d.leaveDayPart ? ` (${d.leaveDayPart})` : ""}
                                                                </small>
                                                                {d.leaveNotes && (
                                                                    <small className="text-muted d-block">
                                                                        <i className="bi bi-chat-left-text me-1"></i>
                                                                        {d.leaveNotes}
                                                                    </small>
                                                                )}
                                                            </div>
                                                        ) : null}
                                                        {!d.holidayName && !d.leavePolicyCode && (
                                                            <span className="text-muted">
                                                                <i className="bi bi-dash-circle me-1"></i>
                                                                Regular working day
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        {d.visitType ? (
                                                            <div className="visit-info">
                                                                <span className={`visit-badge badge ${getVisitBadgeClass(d.visitType)}`}>
                                                                    {getVisitIcon(d.visitType)}
                                                                    {d.visitType}
                                                                </span>
                                                                {d.visitNotes && (
                                                                    <div className="small text-muted mt-1">
                                                                        <i className="bi bi-chat-dots me-1"></i>
                                                                        {d.visitNotes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="badge bg-secondary">
                                                                <i className="bi bi-question-circle me-1"></i>
                                                                Not Set
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="dropdown position-relative">
                                                            <button 
                                                                className="btn btn-sm btn-outline-secondary rounded-pill action-btn" 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setMenuOpenFor(menuOpenFor === d.date ? null : d.date);
                                                                }}
                                                                title="Actions"
                                                                type="button"
                                                                ref={(el) => {
                                                                    if (el && menuOpenFor === d.date && el.parentElement) {
                                                                        // Small delay to ensure dropdown is rendered
                                                                        setTimeout(() => {
                                                                            if (!el.parentElement) return; // Additional null check for TypeScript
                                                                            
                                                                            // Check if button is in bottom half of viewport
                                                                            const rect = el.getBoundingClientRect();
                                                                            const viewportHeight = window.innerHeight;
                                                                            const isInBottomHalf = rect.top > viewportHeight / 2;
                                                                            
                                                                            // Add class to dropdown based on position
                                                                            const dropdown = el.parentElement.querySelector('.modern-dropdown');
                                                                            if (dropdown) {
                                                                                if (isInBottomHalf) {
                                                                                    dropdown.classList.remove('show-below');
                                                                                } else {
                                                                                    dropdown.classList.add('show-below');
                                                                                }
                                                                            }
                                                                        }, 10);
                                                                    }
                                                                }}
                                                            >
                                                                <i className="bi bi-three-dots-vertical"></i>
                                                            </button>

                                                            {menuOpenFor === d.date && (
                                                                <>
                                                                    <div 
                                                                        className="dropdown-backdrop" 
                                                                        onClick={() => setMenuOpenFor(null)}
                                                                    ></div>
                                                                    <div className="dropdown-menu dropdown-menu-end show modern-dropdown">
                                                                        <button 
                                                                            className="dropdown-item" 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                openViewDetails(d);
                                                                                setMenuOpenFor(null);
                                                                            }}
                                                                        >
                                                                            <i className="bi bi-eye me-2 text-primary"></i>
                                                                            View Details
                                                                        </button>
                                                                        <button 
                                                                            className="dropdown-item" 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                editFromDaily(d);
                                                                                setMenuOpenFor(null);
                                                                            }}
                                                                        >
                                                                            <i className="bi bi-pencil me-2 text-info"></i>
                                                                            Edit / Create Visit
                                                                        </button>
                                                                        <hr className="dropdown-divider" />
                                                                        <button 
                                                                            className="dropdown-item text-danger" 
                                                                            onClick={async (e) => {
                                                                                e.stopPropagation();
                                                                                const v = visits.find((x) => x.visitDate === d.date);
                                                                                if (v) requestDelete(v);
                                                                                else toast.info("No visit recorded on this date to delete.");
                                                                                setMenuOpenFor(null);
                                                                            }}
                                                                        >
                                                                            <i className="bi bi-trash me-2"></i>
                                                                            Delete Visit
                                                                        </button>
                                                                    </div>
                                                                </>
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

                {/* Right side: Quick Actions & Enhanced Stats */}
                <div className="col-xl-4">
                    {/* Quick Actions Card */}
                    <div className="card shadow-lg border-0 mb-4">
                        <div className="card-header bg-gradient-primary text-white">
                            <div className="d-flex align-items-center">
                                <i className="bi bi-lightning-charge me-2"></i>
                                <span className="fw-bold">Quick Actions</span>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="d-grid gap-3">
                                <button 
                                    className="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2"
                                    onClick={() => openEdit(null)}
                                >
                                    <i className="bi bi-plus-circle-fill"></i>
                                    Add New Visit
                                </button>
                                
                                <div className="row g-2">
                                    <div className="col-6">
                                        <button 
                                            className="btn btn-outline-success w-100 d-flex flex-column align-items-center py-3"
                                            onClick={() => {
                                                const today = new Date().toISOString().split('T')[0];
                                                const todayRecord = dailyView.find(d => d.date === today);
                                                if (todayRecord && todayRecord.visitType) {
                                                    // Edit existing visit via modal
                                                    toast.info("Editing existing visit for today");
                                                    editFromDaily(todayRecord);
                                                } else {
                                                    // Direct save WFH for today
                                                    quickSaveToday("WFH");
                                                }
                                            }}
                                            title="Quick WFH for today"
                                        >
                                            <i className="bi bi-house-fill mb-1" style={{ fontSize: '1.2rem' }}></i>
                                            <small className="fw-semibold">WFH Today</small>
                                        </button>
                                    </div>
                                    <div className="col-6">
                                        <button 
                                            className="btn btn-outline-primary w-100 d-flex flex-column align-items-center py-3"
                                            onClick={() => {
                                                const today = new Date().toISOString().split('T')[0];
                                                const todayRecord = dailyView.find(d => d.date === today);
                                                if (todayRecord && todayRecord.visitType) {
                                                    // Edit existing visit via modal
                                                    toast.info("Editing existing visit for today");
                                                    editFromDaily(todayRecord);
                                                } else {
                                                    // Direct save WFO for today
                                                    quickSaveToday("WFO");
                                                }
                                            }}
                                            title="Quick WFO for today"
                                        >
                                            <i className="bi bi-building-fill mb-1" style={{ fontSize: '1.2rem' }}></i>
                                            <small className="fw-semibold">WFO Today</small>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Month Stats Card */}
                    <div className="card shadow-lg border-0 mb-4">
                        <div className="card-header bg-gradient-primary text-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-graph-up me-2"></i>
                                    <div>
                                        <span className="fw-bold">Statistics</span>
                                        <div className="small opacity-75">
                                            {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                                <span className="badge bg-white text-primary fw-bold">{dailyView.length} days</span>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-3 mb-4">
                                <div className="col-6">
                                    <div className="stat-card bg-primary bg-opacity-10 p-3 rounded-3 text-center">
                                        <div className="text-primary fw-bold fs-4">
                                            {summary.wfo}
                                        </div>
                                        <div className="small text-muted">WFO Days</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="stat-card bg-success bg-opacity-10 p-3 rounded-3 text-center">
                                        <div className="text-success fw-bold fs-4">
                                            {summary.wfh}
                                        </div>
                                        <div className="small text-muted">WFH Days</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="stat-card bg-warning bg-opacity-10 p-3 rounded-3 text-center">
                                        <div className="text-warning fw-bold fs-4">
                                            {summary.holiday}
                                        </div>
                                        <div className="small text-muted">Holidays</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="stat-card bg-danger bg-opacity-10 p-3 rounded-3 text-center">
                                        <div className="text-danger fw-bold fs-4">
                                            {summary.leave}
                                        </div>
                                        <div className="small text-muted">Leave Days</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ height: 200 }}>
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

                    {/* Quick Tips Card */}
                    <div className="card shadow-lg border-0">
                        <div className="card-header bg-gradient-primary text-white">
                            <div className="d-flex align-items-center">
                                <i className="bi bi-lightbulb me-2"></i>
                                <span className="fw-bold">Quick Tips</span>
                            </div>
                        </div>
                        <div className="card-body">
                            <ul className="list-unstyled mb-0">
                                <li className="mb-2 d-flex align-items-start">
                                    <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                                    <span className="small">Use quick action buttons for today's visit</span>
                                </li>
                                <li className="mb-2 d-flex align-items-start">
                                    <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                                    <span className="small">Click any date row to edit or create visits</span>
                                </li>
                                <li className="mb-2 d-flex align-items-start">
                                    <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                                    <span className="small">Use filters to view specific types only</span>
                                </li>
                                <li className="d-flex align-items-start">
                                    <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                                    <span className="small">Color coding: Blue=WFO, Green=WFH, Yellow=Holiday, Red=Leave</span>
                                </li>
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
                            <h6 className="mb-0">{editing ? t("officeVisit.editVisit") : t("officeVisit.addVisit")}</h6>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowModal(false)}>{t("common.close")}</button>
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
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>{t("common.cancel")}</button>
                                <button type="submit" className="btn btn-primary">{editing ? t("officeVisit.saveChanges") : t("officeVisit.addVisit")}</button>
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
