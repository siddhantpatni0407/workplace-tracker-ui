// src/components/user/holiday/UserHolidayTracker.tsx
import React, { useEffect, useMemo, useState } from "react";
import { parseISO, format } from "date-fns";
import { toast } from "react-toastify";
import Header from "../../common/header/Header";
import { HolidayDTO } from "../../../types/holiday";
import holidayService from "../../../services/holidayService";
import "./user-holiday-tracker.css";

/**
 * UserHolidayTracker - read-only user view of holidays configured by admin
 * Route: /holiday-tracker
 *
 * Enhancements:
 * - Filters: Year, Month, Type (Mandatory/Optional), plus Quick filters (All/Upcoming/Today)
 * - Clear filters button
 * - Last refreshed timestamp
 * - Dates displayed as DD/MM/YYYY
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

const UserHolidayTracker: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [holidays, setHolidays] = useState<HolidayDTO[]>([]);
    const [q, setQ] = useState("");
    const [quickFilter, setQuickFilter] = useState<"ALL" | "UPCOMING" | "TODAY">("ALL");

    // new filters
    const [filterYear, setFilterYear] = useState<"ALL" | string>("ALL");
    const [filterMonth, setFilterMonth] = useState<string>("ALL");
    const [filterType, setFilterType] = useState<"ALL" | "MANDATORY" | "OPTIONAL">("ALL");

    const [lastRefreshed, setLastRefreshed] = useState<string>("");

    const load = async () => {
        setLoading(true);
        try {
            const payload = await holidayService.getHolidays();
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
            }, []);

    const todayIso = new Date().toISOString().slice(0, 10);

    // derive years available from data
    const years = useMemo(() => {
        const set = new Set<string>();
        holidays.forEach((h) => {
            if (h.holidayDate) set.add(h.holidayDate.slice(0, 4)); // YYYY
        });
        const arr = Array.from(set).sort((a, b) => Number(b) - Number(a)); // newest first
        return ["ALL", ...arr];
    }, [holidays]);

    // filtered list respects multiple filters
    const filtered = useMemo(() => {
        return holidays
            .filter((h) => {
                const hay = `${h.name} ${h.description ?? ""}`.toLowerCase();
                if (q && !hay.includes(q.toLowerCase())) return false;

                if (quickFilter === "TODAY" && h.holidayDate !== todayIso) return false;
                if (quickFilter === "UPCOMING" && h.holidayDate < todayIso) return false;

                if (filterYear !== "ALL" && h.holidayDate.slice(0, 4) !== filterYear) return false;

                if (filterMonth !== "ALL" && h.holidayDate.slice(5, 7) !== filterMonth) return false;

                if (filterType !== "ALL" && h.holidayType !== filterType) return false;

                return true;
            })
            .sort((a, b) => (a.holidayDate < b.holidayDate ? -1 : a.holidayDate > b.holidayDate ? 1 : 0));
    }, [holidays, q, quickFilter, filterYear, filterMonth, filterType, todayIso]);

    const displayDate = (iso?: string) => {
        if (!iso) return "";
        try {
            const d = parseISO(iso);
            return format(d, "dd/MM/yyyy");
        } catch {
            return iso;
        }
    };

    const exportCSV = () => {
        if (!filtered || filtered.length === 0) {
            toast.info("No holiday data to export");
            return;
        }
        const rows = filtered.map((h) => ({
            Date: displayDate(h.holidayDate),
            Name: h.name,
            Type: h.holidayType,
            Description: h.description ?? "",
        }));
        const header = Object.keys(rows[0]).join(",");
        const csv =
            [header, ...rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `holidays_user_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Exported CSV");
    };

    const printView = () => {
        const rows = filtered
            .map(
                (h) =>
                    `<tr><td>${displayDate(h.holidayDate)}</td><td>${escapeHtml(h.name)}</td><td>${h.holidayType}</td><td>${escapeHtml(
                        h.description ?? ""
                    )}</td></tr>`
            )
            .join("");
        const html = `
      <html><head><title>My Holidays</title>
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

    const clearFilters = () => {
        setQ("");
        setQuickFilter("ALL");
        setFilterYear("ALL");
        setFilterMonth("ALL");
        setFilterType("ALL");
    };

    return (
        <div className="container-fluid py-4">
            <Header title="Holiday Tracker" subtitle="Holidays published by your admin" />

            <div className="d-flex flex-wrap gap-2 mb-3 align-items-center toolbar">
                {/* Search */}
                <div className="input-group input-group-sm" style={{ minWidth: 240 }}>
                    <span className="input-group-text">Search</span>
                    <input
                        className="form-control"
                        placeholder="name or description"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        aria-label="Search holidays"
                    />
                </div>

                {/* Quick filters */}
                <div className="btn-group btn-group-sm ms-2" role="group" aria-label="Quick filters">
                    <button
                        className={`btn btn-outline-secondary btn-sm ${quickFilter === "ALL" ? "active" : ""}`}
                        onClick={() => setQuickFilter("ALL")}
                        aria-pressed={quickFilter === "ALL"}
                    >
                        All
                    </button>
                    <button
                        className={`btn btn-outline-secondary btn-sm ${quickFilter === "UPCOMING" ? "active" : ""}`}
                        onClick={() => setQuickFilter("UPCOMING")}
                        aria-pressed={quickFilter === "UPCOMING"}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`btn btn-outline-secondary btn-sm ${quickFilter === "TODAY" ? "active" : ""}`}
                        onClick={() => setQuickFilter("TODAY")}
                        aria-pressed={quickFilter === "TODAY"}
                    >
                        Today
                    </button>
                </div>

                {/* Year / Month / Type filters */}
                <div className="d-flex gap-2 align-items-center ms-auto filters-group">
                    <select
                        className="form-select form-select-sm"
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value as any)}
                        aria-label="Filter by year"
                        title="Year"
                    >
                        {years.map((y) => (
                            <option key={y} value={y}>
                                {y === "ALL" ? "All years" : y}
                            </option>
                        ))}
                    </select>

                    <select
                        className="form-select form-select-sm"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                        aria-label="Filter by month"
                        title="Month"
                    >
                        {MONTHS.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>

                    <select
                        className="form-select form-select-sm"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        aria-label="Filter by type"
                        title="Type"
                    >
                        <option value="ALL">All types</option>
                        <option value="MANDATORY">Mandatory</option>
                        <option value="OPTIONAL">Optional</option>
                    </select>

                    <button className="btn btn-link btn-sm text-decoration-none p-0 ms-2" onClick={clearFilters} title="Clear filters">
                        Clear
                    </button>
                </div>

                {/* Refresh */}
                <div className="d-flex align-items-center ms-2">
                    <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={load}
                        disabled={loading}
                        title="Refresh holidays"
                        aria-label="Refresh holidays"
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                                Refreshing
                            </>
                        ) : (
                            <>
                                <i className="bi bi-arrow-repeat me-1" />
                                Refresh
                            </>
                        )}
                    </button>
                    <div className="small text-muted ms-2">{lastRefreshed ? `Last refreshed: ${format(parseISO(lastRefreshed), "dd/MM/yyyy HH:mm")}` : ""}</div>
                </div>

                {/* Export / Print */}
                <div className="ms-3 btn-group">
                    <button className="btn btn-outline-success btn-sm" onClick={exportCSV} title="Export CSV" aria-label="Export CSV">
                        <i className="bi bi-file-earmark-spreadsheet me-1" />
                        Export
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={printView} title="Print" aria-label="Print">
                        <i className="bi bi-printer me-1" />
                        Print
                    </button>
                </div>
            </div>

            {/* Card wrapper for nicer look */}
            <div className="card holiday-card shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 user-holiday-table">
                            <thead className="table-light">
                                <tr>
                                    <th className="text-center" style={{ width: 140 }}>Date</th>
                                    <th className="text-center">Name</th>
                                    <th className="text-center" style={{ width: 140 }}>Type</th>
                                    <th className="text-center">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="py-5 text-center">
                                            <div className="spinner-border text-primary me-2" role="status" />
                                            Loading holidays...
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-5 text-center text-muted">
                                            No holidays found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((h) => (
                                        <tr key={h.holidayId ?? `${h.holidayDate}-${h.name}`} className="align-middle">
                                            <td className="fw-semibold text-center">{displayDate(h.holidayDate)}</td>
                                            <td>
                                                <div className="holiday-name">{h.name}</div>
                                                {/* removed secondary date line here as requested */}
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge badge-type ${h.holidayType === "MANDATORY" ? "mandatory" : "optional"}`}>
                                                    {h.holidayType === "MANDATORY" ? "Mandatory" : "Optional"}
                                                </span>
                                            </td>
                                            <td className="text-truncate" style={{ maxWidth: 500 }}>
                                                {h.description}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserHolidayTracker;
