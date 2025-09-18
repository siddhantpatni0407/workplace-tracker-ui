// src/components/admin/holiday/HolidayManagement.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { parseISO, format } from "date-fns";
import { toast } from "react-toastify";
import { ErrorBoundary } from "../../ui";
import Header from "../../common/header/Header";
import { HolidayDTO } from "../../../types/holiday";
import { ResponseDTO } from "../../../types/api";
import { MonthOption } from "../../../models";
import { useDebounce } from "../../../hooks";
import { DEBOUNCE } from "../../../constants/ui";
import holidayService from "../../../services/holidayService";
import "./holiday-management.css";

/**
 * Holiday Management - enhanced (Admin)
 * - DD/MM/YYYY display
 * - Filters: Year, Month, Type + from/to date and search (debounced)
 * - Refresh + lastRefreshed
 * - Improved table styling & centered headers
 * - Accessible create/edit modal + delete confirmation with optimistic delete & Undo
 */

const MONTHS: MonthOption[] = [
    { value: "ALL", label: "All months" },
    { value: "01", label: "Jan" },
    { value: "02", label: "Feb" },
    { value: "03", label: "Mar" },
    { value: "04", label: "Apr" },
    { value: "05", label: "May" },
    { value: "06", label: "Jun" },
    { value: "07", label: "Jul" },
    { value: "08", label: "Aug" },
    { value: "09", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dec" },
];

// Remove local useDebounced as we're using the hook from infrastructure

type DeleteIntent = {
    show: boolean;
    target?: HolidayDTO;
};

const HolidayManagement: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [holidays, setHolidays] = useState<HolidayDTO[]>([]);
    const [editing, setEditing] = useState<HolidayDTO | null>(null);
    const [showForm, setShowForm] = useState(false);

    // form state
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [holidayType, setHolidayType] = useState<"MANDATORY" | "OPTIONAL">("MANDATORY");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);

    // filters
    const [q, setQ] = useState("");
    const debouncedQ = useDebounce(q, DEBOUNCE.SEARCH);
    const [filterType, setFilterType] = useState<"ALL" | "MANDATORY" | "OPTIONAL">("ALL");

    // new admin filter controls
    const [filterYear, setFilterYear] = useState<"ALL" | string>("ALL");
    const [filterMonth, setFilterMonth] = useState<string>("ALL");
    const [from, setFrom] = useState<string>("");
    const [to, setTo] = useState<string>("");

    // delete confirmation modal state
    const [deleteIntent, setDeleteIntent] = useState<DeleteIntent>({ show: false });
    const [processingDelete, setProcessingDelete] = useState(false);

    // optimistic deletion backup for undo
    const backupRef = useRef<Map<string | number, HolidayDTO>>(new Map());

    const formFirstRef = useRef<HTMLInputElement | null>(null);

    // Statistics
    const stats = useMemo(() => {
        const total = holidays.length;
        const mandatory = holidays.filter(h => h.holidayType === "MANDATORY").length;
        const optional = holidays.filter(h => h.holidayType === "OPTIONAL").length;
        const upcoming = holidays.filter(h => {
            const holidayDate = new Date(h.holidayDate);
            const today = new Date();
            return holidayDate > today;
        }).length;
        
        return { total, mandatory, optional, upcoming };
    }, [holidays]);

    const load = async () => {
        setLoading(true);
        try {
            // currently load everything; client-side filters apply afterwards
            const payload = await holidayService.getHolidays(from || undefined, to || undefined);
            setHolidays(payload ?? []);
        } catch (err) {
            console.error("load holidays", err);
            toast.error("Failed to load holidays");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
            }, []);

    useEffect(() => {
        if (showForm) {
            setTimeout(() => formFirstRef.current?.focus(), 30);
        }
    }, [showForm]);

    // derive years available from data
    const years = useMemo(() => {
        const set = new Set<string>();
        holidays.forEach((h) => {
            if (h.holidayDate) set.add(h.holidayDate.slice(0, 4)); // YYYY
        });
        const arr = Array.from(set).sort((a, b) => Number(b) - Number(a)); // newest first
        return ["ALL", ...arr];
    }, [holidays]);

    const filtered = useMemo(() => {
        return holidays.filter((h) => {
            if (filterType !== "ALL" && h.holidayType !== filterType) return false;
            if (debouncedQ && !(`${h.name} ${h.description ?? ""}`.toLowerCase().includes(debouncedQ.toLowerCase()))) return false;
            if (filterYear !== "ALL" && h.holidayDate.slice(0, 4) !== filterYear) return false;
            if (filterMonth !== "ALL" && h.holidayDate.slice(5, 7) !== filterMonth) return false;
            if (from && h.holidayDate < from) return false;
            if (to && h.holidayDate > to) return false;
            return true;
        }).sort((a, b) => (a.holidayDate < b.holidayDate ? -1 : a.holidayDate > b.holidayDate ? 1 : 0));
    }, [holidays, debouncedQ, filterType, from, to, filterYear, filterMonth]);

    const openCreate = () => {
        setEditing(null);
        setName("");
        setDate("");
        setHolidayType("MANDATORY");
        setDescription("");
        setShowForm(true);
    };

    const openEdit = (h: HolidayDTO) => {
        setEditing(h);
        setName(h.name);
        setDate(h.holidayDate);
        setHolidayType(h.holidayType === "OPTIONAL" ? "OPTIONAL" : "MANDATORY");
        setDescription(h.description ?? "");
        setShowForm(true);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !date) {
            toast.warn("Name and date are required");
            return;
        }
        try {
            setSaving(true);
            const payload: Partial<HolidayDTO> = {
                name,
                holidayDate: date,
                holidayType,
                description,
            };

            if (editing) {
                const updated = await holidayService.updateHoliday(editing.holidayId!, payload);
                toast.success(`Holiday updated: ${updated?.name ?? ""}`);
            } else {
                const created = await holidayService.createHoliday(payload);
                toast.success(`Holiday created: ${created?.name ?? ""}`);
            }

            await load();
            setShowForm(false);
        } catch (err: any) {
            console.error("submit holiday", err);
            const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save holiday";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (h: HolidayDTO) => setDeleteIntent({ show: true, target: h });

    const performDelete = async (h: HolidayDTO | undefined) => {
        if (!h || !h.holidayId) return;
        setProcessingDelete(true);

        // optimistic UI: remove locally while we call server
        const key = h.holidayId;
        backupRef.current.set(key, h);
        setHolidays((prev) => prev.filter((x) => x.holidayId !== key));

        // show undo toast
        toast.info(
            <div>
                Deleted "{h.name}" —{" "}
                <button
                    className="btn btn-link btn-sm p-0"
                    onClick={() => {
                        const original = backupRef.current.get(key);
                        if (original) {
                            setHolidays((prev) => [original!, ...prev]);
                            backupRef.current.delete(key);
                            toast.dismiss();
                            toast.success("Undo successful");
                            load();
                        }
                    }}
                >
                    Undo
                </button>
            </div>,
            { autoClose: 6000 }
        );

        try {
            const resp: ResponseDTO<void> = await holidayService.deleteHoliday(h.holidayId!);
            if (resp?.message) toast.success(resp.message);
            else toast.success("Holiday deleted");
            backupRef.current.delete(key);
        } catch (err: any) {
            console.error("delete holiday", err);
            const original = backupRef.current.get(key);
            if (original) {
                setHolidays((prev) => [original!, ...prev]);
                backupRef.current.delete(key);
            }
            const msg = err?.response?.data?.message ?? err?.message ?? "Failed to delete holiday";
            toast.error(msg);
        } finally {
            setProcessingDelete(false);
            setDeleteIntent({ show: false });
        }
    };

    const displayDate = (isoDate?: string) => {
        if (!isoDate) return "";
        try {
            const d = parseISO(isoDate);
            return format(d, "dd/MM/yyyy");
        } catch {
            return isoDate;
        }
    };

    const exportCSV = () => {
        const source = filtered.length ? filtered : holidays;
        if (!source || source.length === 0) {
            toast.info("No holiday data to export");
            return;
        }
        const rows = source.map((h) => ({
            Date: displayDate(h.holidayDate),
            Name: h.name,
            Type: h.holidayType,
            Description: h.description ?? "",
        }));
        const header = Object.keys(rows[0]).join(",");
        const csv = [header, ...rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `holidays_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Exported CSV");
    };

    // keyboard: esc closes form or delete modal
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (deleteIntent.show) setDeleteIntent({ show: false });
                else if (showForm && !saving) setShowForm(false);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [deleteIntent.show, showForm, saving]);

    const clearFilters = () => {
        setQ("");
        setFilterType("ALL");
        setFrom("");
        setTo("");
        setFilterYear("ALL");
        setFilterMonth("ALL");
    };

    // Helper function to highlight search matches
    const highlight = (txt: string | null | undefined, q: string) => {
        if (!txt || !q) return txt || "";
        const idx = txt.toLowerCase().indexOf(q.toLowerCase());
        if (idx === -1) return txt;
        return (
            <>
                {txt.slice(0, idx)}
                <mark className="hm-highlight">{txt.slice(idx, idx + q.length)}</mark>
                {txt.slice(idx + q.length)}
            </>
        );
    };

    return (
        <ErrorBoundary>
            <Header 
                title="Holiday Management"
                subtitle="Manage company holidays and leave schedules"
            />
            
            <div className="holiday-management container-fluid py-4" data-animate="fade">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                        <h1 className="hm-title mb-0 d-none">Holiday Management</h1>
                    </div>

                    <div className="d-flex gap-2 align-items-center">
                        <div className="d-none d-md-flex gap-2">
                            <button className="btn btn-sm btn-outline-secondary" onClick={exportCSV} disabled={loading || holidays.length === 0} title="Export to CSV">
                                <i className="bi bi-file-earmark-arrow-down me-1" /> Export CSV
                            </button>

                            <button className="btn btn-sm btn-outline-primary" onClick={() => load()} disabled={loading} title="Refresh">
                                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-arrow-clockwise me-1" />} Refresh
                            </button>
                        </div>

                        <button className="btn btn-sm btn-primary" onClick={openCreate} disabled={loading} aria-label="Add holiday">
                            <i className="bi bi-plus-lg me-1" /> Add Holiday
                        </button>
                    </div>
                </div>
                {/* Stats Row */}
                <div className="row g-3 mb-4">
                    <div className="col-6 col-md-3">
                        <div className="stat-card shadow-sm p-3 rounded text-center hm-card-acc d-flex flex-column justify-content-between border">
                            <div className="d-flex w-100 justify-content-between align-items-start">
                                <div className="text-start">
                                    <div className="stat-icon"><i className="bi bi-calendar-event-fill" /></div>
                                    <div className="stat-title">TOTAL</div>
                                </div>
                                <span className="badge bg-primary align-self-start">Holidays</span>
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
                        <div className="stat-card shadow-sm p-3 rounded text-center hm-card-acc d-flex flex-column justify-content-between border">
                            <div className="d-flex w-100 justify-content-between align-items-start">
                                <div className="text-start">
                                    <div className="stat-icon"><i className="bi bi-exclamation-circle-fill" /></div>
                                    <div className="stat-title">MANDATORY</div>
                                </div>
                                <span className="badge bg-danger align-self-start">Required</span>
                            </div>
                            <div className="mt-2">
                                <div className="stat-value h4 mb-0" aria-live="polite">{stats.mandatory}</div>
                                <div className="progress mt-2 thin-progress">
                                    <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${Math.round((stats.mandatory / Math.max(1, stats.total)) * 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className="stat-card shadow-sm p-3 rounded text-center hm-card-acc d-flex flex-column justify-content-between border">
                            <div className="d-flex w-100 justify-content-between align-items-start">
                                <div className="text-start">
                                    <div className="stat-icon"><i className="bi bi-hand-thumbs-up-fill" /></div>
                                    <div className="stat-title">OPTIONAL</div>
                                </div>
                                <span className="badge bg-info text-dark align-self-start">Choice</span>
                            </div>
                            <div className="mt-2">
                                <div className="stat-value h4 mb-0" aria-live="polite">{stats.optional}</div>
                                <div className="progress mt-2 thin-progress">
                                    <div className="progress-bar bg-info" role="progressbar" style={{ width: `${Math.round((stats.optional / Math.max(1, stats.total)) * 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className="stat-card shadow-sm p-3 rounded text-center hm-card-acc d-flex flex-column justify-content-between border">
                            <div className="d-flex w-100 justify-content-between align-items-start">
                                <div className="text-start">
                                    <div className="stat-icon"><i className="bi bi-calendar-plus-fill" /></div>
                                    <div className="stat-title">UPCOMING</div>
                                </div>
                                <span className="badge bg-success align-self-start">Future</span>
                            </div>
                            <div className="mt-2">
                                <div className="stat-value h4 mb-0" aria-live="polite">{stats.upcoming}</div>
                                <div className="progress mt-2 thin-progress">
                                    <div className="progress-bar bg-success" role="progressbar" style={{ width: `${Math.round((stats.upcoming / Math.max(1, stats.total)) * 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="card mb-3 p-3 shadow-sm hm-filter-card">
                    <div className="d-flex gap-2 align-items-center flex-wrap">
                        <input 
                            className="form-control flex-grow-1" 
                            placeholder="Search holidays by name or description..." 
                            value={q} 
                            onChange={(e) => setQ(e.target.value)} 
                            aria-label="Search holidays" 
                        />
                        
                        <select className="form-select" style={{width: 'auto'}} value={filterYear} onChange={(e) => setFilterYear(e.target.value as any)} aria-label="Filter year">
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y === "ALL" ? "All years" : y}
                                </option>
                            ))}
                        </select>

                        <select className="form-select" style={{width: 'auto'}} value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} aria-label="Filter month">
                            {MONTHS.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>

                        <select className="form-select" style={{width: 'auto'}} value={filterType} onChange={(e) => setFilterType(e.target.value as any)} aria-label="Filter by type">
                            <option value="ALL">All types</option>
                            <option value="MANDATORY">Mandatory</option>
                            <option value="OPTIONAL">Optional</option>
                        </select>

                        <div className="d-flex gap-1">
                            <input type="date" className="form-control" style={{width: 'auto'}} value={from} onChange={(e) => setFrom(e.target.value)} title="From" aria-label="From date" />
                            <input type="date" className="form-control" style={{width: 'auto'}} value={to} onChange={(e) => setTo(e.target.value)} title="To" aria-label="To date" />
                        </div>

                        <button className="btn btn-outline-secondary btn-sm" onClick={clearFilters} title="Clear all filters">
                            <i className="bi bi-x-lg me-1" /> Clear
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="card shadow-sm holiday-table hm-table-glow">
                    <div className="table-responsive">
                        {loading ? (
                            <div className="p-4 text-center"><div className="spinner-border" role="status" /></div>
                        ) : filtered.length === 0 ? (
                            <div className="p-4 text-muted text-center">No holidays found.</div>
                        ) : (
                            <table className="table table-hover table-striped table-sm m-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: 120 }} className="text-center">Date</th>
                                        <th>Holiday Name</th>
                                        <th style={{ width: 120 }} className="text-center">Type</th>
                                        <th>Description</th>
                                        <th style={{ width: 160 }} className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((h, idx) => (
                                        <tr key={h.holidayId ?? `${h.holidayDate}-${h.name}`} className="hm-row" style={{ animationDelay: `${idx * 35}ms` }}>
                                            <td className="fw-semibold text-center text-primary">{displayDate(h.holidayDate)}</td>
                                            <td className="fw-medium">{highlight(h.name, debouncedQ)}</td>
                                            <td className="text-center">
                                                <span className={`badge ${h.holidayType === "MANDATORY" ? 'bg-danger' : 'bg-info'}`}>
                                                    {h.holidayType === "MANDATORY" ? "Mandatory" : "Optional"}
                                                </span>
                                            </td>
                                            <td className="text-truncate" style={{ maxWidth: 400 }}>
                                                {highlight(h.description || "", debouncedQ)}
                                            </td>
                                            <td className="text-end">
                                                <div className="d-inline-flex gap-1">
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary" 
                                                        onClick={() => openEdit(h)} 
                                                        title="Edit holiday"
                                                        aria-label={`Edit ${h.name}`}
                                                    >
                                                        <i className="bi bi-pencil-fill me-1" /> Edit
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger" 
                                                        onClick={() => confirmDelete(h)} 
                                                        title="Delete holiday"
                                                        aria-label={`Delete ${h.name}`}
                                                    >
                                                        <i className="bi bi-trash-fill me-1" /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            {/* create / edit modal */}
            {showForm && (
                <div className="modal-backdrop-custom" role="dialog" aria-modal="true" aria-label={editing ? "Edit holiday dialog" : "Create holiday dialog"}>
                    <div className="holiday-modal card p-3 shadow-lg">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">{editing ? "Edit Holiday" : "Create Holiday"}</h6>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowForm(false)} disabled={saving} aria-label="Close form">
                                Close
                            </button>
                        </div>

                        <form onSubmit={submit} className="needs-validation" noValidate>
                            <div className="row g-2">
                                <div className="col-md-6">
                                    <label className="form-label">Name</label>
                                    <input ref={formFirstRef} className="form-control" value={name} onChange={(e) => setName(e.target.value)} required disabled={saving} aria-required />
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Date</label>
                                    <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} required disabled={saving} />
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Type</label>
                                    <select className="form-select" value={holidayType} onChange={(e) => setHolidayType(e.target.value as any)} disabled={saving}>
                                        <option value="MANDATORY">MANDATORY</option>
                                        <option value="OPTIONAL">OPTIONAL</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-3 mt-3">
                                <label className="form-label">Description</label>
                                <textarea className="form-control" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} disabled={saving} />
                            </div>

                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)} disabled={saving}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" /> Saving...
                                        </>
                                    ) : editing ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* delete confirmation modal */}
            {deleteIntent.show && deleteIntent.target && (
                <div className="modal-backdrop-custom" role="dialog" aria-modal="true" aria-label="Delete confirmation dialog">
                    <div className="holiday-modal card p-3 shadow-lg">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0">Confirm delete</h6>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setDeleteIntent({ show: false })} disabled={processingDelete} aria-label="Close">
                                ✕
                            </button>
                        </div>

                        <div className="mb-3">
                            <p className="mb-1">Are you sure you want to delete the following holiday?</p>
                            <div className="p-2 border rounded bg-light">
                                <strong>{deleteIntent.target?.name}</strong>
                                <div className="text-muted small">Date: {deleteIntent.target?.holidayDate ? displayDate(deleteIntent.target.holidayDate) : 'N/A'}</div>
                                <div className="mt-1">
                                    Type:{" "}
                                    <span className={`badge badge-type ${deleteIntent.target?.holidayType === "MANDATORY" ? "mandatory" : "optional"}`}>
                                        {deleteIntent.target?.holidayType === "MANDATORY" ? "Mandatory" : "Optional"}
                                    </span>
                                </div>
                                {deleteIntent.target?.description && <div className="mt-2 small">{deleteIntent.target.description}</div>}
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                            <div className="small text-muted">This action can be undone within a few seconds via Undo.</div>

                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-secondary" onClick={() => setDeleteIntent({ show: false })} disabled={processingDelete}>
                                    Cancel
                                </button>
                                <button className="btn btn-danger" onClick={() => performDelete(deleteIntent.target)} disabled={processingDelete}>
                                    {processingDelete ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" /> Deleting...
                                        </>
                                    ) : (
                                        "Delete"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </ErrorBoundary>
    );
};

export default HolidayManagement;
