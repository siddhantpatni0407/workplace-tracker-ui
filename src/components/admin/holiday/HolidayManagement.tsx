// src/components/admin/holiday/HolidayManagement.tsx
import React, { useEffect, useMemo, useState } from "react";
import { parseISO } from "date-fns";
import { toast } from "react-toastify";
import Header from "../../common/header/Header";
import { HolidayDTO } from "../../../types/holiday";
import { ResponseDTO } from "../../../types/api"; // add import at top next to HolidayDTO
import holidayService from "../../../services/holidayService";
import "./HolidayManagement.css";

/**
 * Holiday Management - enhanced
 * - Toolbar: search by name, filter by type, date range
 * - Export: CSV & Print
 * - Table: badges for type, hover, responsive
 * - Modal: create/edit with saving state
 *
 * Notes:
 * - Server expects dates as yyyy-MM-dd (ISO date)
 * - Authentication: Authorization header handled via axios interceptor
 */

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
    const [filterType, setFilterType] = useState<"ALL" | "MANDATORY" | "OPTIONAL">("ALL");
    const [from, setFrom] = useState<string>("");
    const [to, setTo] = useState<string>("");

    // load holidays from server (optionally you can pass from/to; service supports it)
    const load = async () => {
        setLoading(true);
        try {
            // If date filters provided use them, else load all
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // client-side filtered list for fast UI response (still call load when changing date range)
    const filtered = useMemo(() => {
        return holidays.filter((h) => {
            if (filterType !== "ALL" && h.holidayType !== filterType) return false;
            if (q && !(`${h.name} ${h.description ?? ""}`.toLowerCase().includes(q.toLowerCase()))) return false;
            if (from && h.holidayDate < from) return false;
            if (to && h.holidayDate > to) return false;
            return true;
        });
    }, [holidays, q, filterType, from, to]);

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

    const remove = async (h: HolidayDTO) => {
        if (!h.holidayId) return;
        if (!window.confirm(`Delete holiday "${h.name}" on ${h.holidayDate}?`)) return;

        try {
            setLoading(true);
            // now returns typed ResponseDTO<void>
            const resp: ResponseDTO<void> = await holidayService.deleteHoliday(h.holidayId);

            // Show server-provided message if present, else fallback
            if (resp?.message) {
                toast.success(resp.message);
            } else {
                toast.success("Holiday deleted");
            }

            // Refresh list
            await load();
        } catch (err: any) {
            console.error("delete holiday", err);
            const msg = err?.response?.data?.message ?? err?.message ?? "Failed to delete holiday";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const displayDate = (isoDate?: string) => {
        if (!isoDate) return "";
        try {
            return parseISO(isoDate).toLocaleDateString();
        } catch {
            return isoDate;
        }
    };

    // CSV export
    const exportCSV = () => {
        if (!holidays || holidays.length === 0) {
            toast.info("No holiday data to export");
            return;
        }
        const rows = (filtered.length ? filtered : holidays).map((h) => ({
            Date: h.holidayDate,
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
        // open new window and print simple table
        const rows = (filtered.length ? filtered : holidays)
            .map((h) => `<tr><td>${h.holidayDate}</td><td>${escapeHtml(h.name)}</td><td>${h.holidayType}</td><td>${escapeHtml(h.description ?? "")}</td></tr>`)
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

    return (
        <div className="container py-4">
            <Header title="Holiday Management" subtitle="Add or update company holidays" />

            {/* toolbar */}
            <div className="d-flex flex-wrap gap-2 mb-3 align-items-center toolbar">
                <div className="d-flex gap-2 align-items-center">
                    <button className="btn btn-primary btn-sm" onClick={openCreate} disabled={saving || loading}>
                        <i className="bi bi-plus-lg me-1" /> Add Holiday
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={load} disabled={loading}>
                        <i className="bi bi-arrow-repeat me-1" /> Refresh
                    </button>
                </div>

                <div className="ms-auto d-flex gap-2 align-items-center">
                    <div className="input-group input-group-sm">
                        <span className="input-group-text">Search</span>
                        <input className="form-control" placeholder="name or description" value={q} onChange={(e) => setQ(e.target.value)} />
                    </div>

                    <select className="form-select form-select-sm" value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
                        <option value="ALL">All types</option>
                        <option value="MANDATORY">Mandatory</option>
                        <option value="OPTIONAL">Optional</option>
                    </select>

                    <input type="date" className="form-control form-control-sm" value={from} onChange={(e) => setFrom(e.target.value)} title="From" />
                    <input type="date" className="form-control form-control-sm" value={to} onChange={(e) => setTo(e.target.value)} title="To" />
                    <button className="btn btn-outline-info btn-sm" onClick={load} title="Load with date filters" disabled={loading}>
                        <i className="bi bi-funnel-fill" />
                    </button>

                    <div className="btn-group">
                        <button className="btn btn-outline-success btn-sm" onClick={exportCSV} title="Export CSV">
                            <i className="bi bi-file-earmark-spreadsheet me-1" /> Export
                        </button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={printView} title="Print">
                            <i className="bi bi-printer me-1" /> Print
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-responsive shadow-sm rounded bg-white">
                <table className="table table-hover table-striped mb-0">
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: 140 }}>Date</th>
                            <th>Name</th>
                            <th style={{ width: 140 }}>Type</th>
                            <th>Description</th>
                            <th style={{ width: 160 }} className="text-end">Actions</th>
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
                                    <td className="fw-semibold">{displayDate(h.holidayDate)}</td>
                                    <td>{h.name}</td>
                                    <td>
                                        <span className={`badge ${h.holidayType === "MANDATORY" ? "bg-primary" : "bg-secondary"}`}>
                                            {h.holidayType}
                                        </span>
                                    </td>
                                    <td className="text-truncate" style={{ maxWidth: 500 }}>{h.description}</td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-light me-2" onClick={() => openEdit(h)} title="Edit">
                                            <i className="bi bi-pencil-fill" /> Edit
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => remove(h)} title="Delete">
                                            <i className="bi bi-trash-fill" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* modal */}
            {showForm && (
                <div className="modal-backdrop-custom">
                    <div className="holiday-modal card p-3 shadow-lg">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">{editing ? "Edit Holiday" : "Create Holiday"}</h6>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowForm(false)} disabled={saving}>
                                Close
                            </button>
                        </div>

                        <form onSubmit={submit} className="needs-validation" noValidate>
                            <div className="row g-2">
                                <div className="col-md-6">
                                    <label className="form-label">Name</label>
                                    <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required disabled={saving} />
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
        </div>
    );
};

export default HolidayManagement;
