// src/components/admin/holiday/HolidayManagement.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { parseISO, format } from "date-fns";
import { toast } from "react-toastify";
import Header from "../../common/header/Header";
import { HolidayDTO } from "../../../types/holiday";
import { ResponseDTO } from "../../../types/api";
import holidayService from "../../../services/holidayService";
import "./HolidayManagement.css";

/**
 * Holiday Management - enhanced (Admin)
 * - DD/MM/YYYY display
 * - Filters: Year, Month, Type + from/to date and search (debounced)
 * - Refresh + lastRefreshed
 * - Improved table styling & centered headers
 * - Accessible create/edit modal + delete confirmation with optimistic delete & Undo
 */

const MONTHS = [
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

const useDebounced = <T,>(value: T, ms = 300) => {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), ms);
        return () => clearTimeout(t);
    }, [value, ms]);
    return v;
};

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
    const debouncedQ = useDebounced(q, 220);
    const [filterType, setFilterType] = useState<"ALL" | "MANDATORY" | "OPTIONAL">("ALL");

    // new admin filter controls
    const [filterYear, setFilterYear] = useState<"ALL" | string>("ALL");
    const [filterMonth, setFilterMonth] = useState<string>("ALL");
    const [from, setFrom] = useState<string>("");
    const [to, setTo] = useState<string>("");

    const [lastRefreshed, setLastRefreshed] = useState<string>("");

    // delete confirmation modal state
    const [deleteIntent, setDeleteIntent] = useState<DeleteIntent>({ show: false });
    const [processingDelete, setProcessingDelete] = useState(false);

    // optimistic deletion backup for undo
    const backupRef = useRef<Map<string | number, HolidayDTO>>(new Map());

    const formFirstRef = useRef<HTMLInputElement | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            // currently load everything; client-side filters apply afterwards
            const payload = await holidayService.getHolidays(from || undefined, to || undefined);
            setHolidays(payload ?? []);
            setLastRefreshed(new Date().toISOString());
        } catch (err) {
            console.error("load holidays", err);
            toast.error("Failed to load holidays");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const printView = () => {
        const source = filtered.length ? filtered : holidays;
        const rows = source
            .map((h) => `<tr><td>${displayDate(h.holidayDate)}</td><td>${escapeHtml(h.name)}</td><td>${h.holidayType}</td><td>${escapeHtml(h.description ?? "")}</td></tr>`)
            .join("");
        const html = `
      <html><head><title>Holidays</title>
      <style>table{width:100%;border-collapse:collapse}td,th{padding:8px;border:1px solid #ddd}</style>
      </head><body>
      <h3>Holidays</h3>
      <table><thead><tr><th>Date</th><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>${rows}</tbody></table>
      </body></html>`;
        const w = window.open("", "_blank", "noopener,noreferrer");
        if (!w) return;
        w.document.write(html);
        w.document.close();
        w.print();
    };

    function escapeHtml(s: string) {
        return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
    }

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

    return (
        <div className="container py-4">
            <Header title="Holiday Management" subtitle="Add or update company holidays" />

            {/* toolbar */}
            <div className="d-flex flex-wrap gap-2 mb-3 align-items-center toolbar">
                <div className="d-flex gap-2 align-items-center">
                    <button className="btn btn-primary btn-sm" onClick={openCreate} disabled={saving || loading} aria-label="Add holiday">
                        <i className="bi bi-plus-lg me-1" /> Add Holiday
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => load()} disabled={loading} aria-label="Refresh list">
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-1" role="status" />
                                Refreshing
                            </>
                        ) : (
                            <>
                                <i className="bi bi-arrow-repeat me-1" /> Refresh
                            </>
                        )}
                    </button>
                </div>

                <div className="ms-auto d-flex gap-2 align-items-center">
                    <div className="input-group input-group-sm">
                        <span className="input-group-text">Search</span>
                        <input aria-label="Search holidays" className="form-control" placeholder="name or description" value={q} onChange={(e) => setQ(e.target.value)} />
                    </div>

                    {/* Year / Month / Type filters */}
                    <select className="form-select form-select-sm" value={filterYear} onChange={(e) => setFilterYear(e.target.value as any)} aria-label="Filter year" title="Year">
                        {years.map((y) => (
                            <option key={y} value={y}>
                                {y === "ALL" ? "All years" : y}
                            </option>
                        ))}
                    </select>

                    <select className="form-select form-select-sm" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} aria-label="Filter month" title="Month">
                        {MONTHS.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>

                    <select className="form-select form-select-sm" value={filterType} onChange={(e) => setFilterType(e.target.value as any)} aria-label="Filter by type">
                        <option value="ALL">All types</option>
                        <option value="MANDATORY">Mandatory</option>
                        <option value="OPTIONAL">Optional</option>
                    </select>

                    <input type="date" className="form-control form-control-sm" value={from} onChange={(e) => setFrom(e.target.value)} title="From" aria-label="From date" />
                    <input type="date" className="form-control form-control-sm" value={to} onChange={(e) => setTo(e.target.value)} title="To" aria-label="To date" />

                    <button className="btn btn-link btn-sm text-decoration-none p-0 ms-2" onClick={clearFilters} title="Clear filters" aria-label="Clear filters">
                        Clear
                    </button>

                    <div className="btn-group">
                        <button className="btn btn-outline-success btn-sm" onClick={exportCSV} title="Export CSV" aria-label="Export CSV">
                            <i className="bi bi-file-earmark-spreadsheet me-1" /> Export
                        </button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={printView} title="Print" aria-label="Print">
                            <i className="bi bi-printer me-1" /> Print
                        </button>
                    </div>
                </div>
            </div>

            {/* Card + table */}
            <div className="card holiday-card shadow-sm">
                <div className="card-body p-0">
                    <div className="table-toolbar d-flex justify-content-between align-items-center px-3 py-2">
                        <div />
                        <div className="small text-muted">Last refreshed: {lastRefreshed ? format(parseISO(lastRefreshed), "dd/MM/yyyy HH:mm") : "-"}</div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover mb-0 admin-holiday-table">
                            <thead className="table-light">
                                <tr>
                                    <th className="text-center" style={{ width: 140 }}>Date</th>
                                    <th className="text-center">Name</th>
                                    <th className="text-center" style={{ width: 140 }}>Type</th>
                                    <th className="text-center">Description</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-5 text-center">
                                            <div className="spinner-border text-primary me-2" role="status" />
                                            Loading holidays...
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-5 text-center text-muted">
                                            No holidays match the filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((h) => (
                                        <tr key={h.holidayId ?? `${h.holidayDate}-${h.name}`} className="align-middle">
                                            <td className="fw-semibold text-center">{displayDate(h.holidayDate)}</td>
                                            <td>{h.name}</td>
                                            <td className="text-center">
                                                <span className={`badge badge-type ${h.holidayType === "MANDATORY" ? "mandatory" : "optional"}`}>
                                                    {h.holidayType === "MANDATORY" ? "Mandatory" : "Optional"}
                                                </span>
                                            </td>
                                            <td className="text-truncate" style={{ maxWidth: 500 }}>{h.description}</td>
                                            <td className="text-end">
                                                <button className="btn btn-sm btn-light me-2" onClick={() => openEdit(h)} title="Edit" aria-label={`Edit ${h.name}`}>
                                                    <i className="bi bi-pencil-fill" /> Edit
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => confirmDelete(h)} title="Delete" aria-label={`Delete ${h.name}`}>
                                                    <i className="bi bi-trash-fill" /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
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
                                <strong>{deleteIntent.target.name}</strong>
                                <div className="text-muted small">Date: {displayDate(deleteIntent.target.holidayDate)}</div>
                                <div className="mt-1">
                                    Type:{" "}
                                    <span className={`badge badge-type ${deleteIntent.target.holidayType === "MANDATORY" ? "mandatory" : "optional"}`}>
                                        {deleteIntent.target.holidayType === "MANDATORY" ? "Mandatory" : "Optional"}
                                    </span>
                                </div>
                                {deleteIntent.target.description && <div className="mt-2 small">{deleteIntent.target.description}</div>}
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
    );
};

export default HolidayManagement;
