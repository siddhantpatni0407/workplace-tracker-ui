// src/components/user/leave/ApplyLeave.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { format, differenceInCalendarDays, parseISO } from "date-fns";
import { toast } from "react-toastify";
import Header from "../../common/header/Header";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import "./ApplyLeave.css";

/* DTO shapes (local) */
type LeavePolicyDTO = {
    policyId?: number;
    policyCode?: string;
    policyName?: string;
    defaultAnnualDays?: number;
    description?: string;
};

type UserLeaveDTO = {
    userLeaveId?: number;
    userId?: number;
    policyId?: number;
    startDate?: string;
    endDate?: string;
    days?: number;
    dayPart?: "FULL" | "AM" | "PM";
    notes?: string;
};

type UserLeaveBalanceDTO = {
    userLeaveBalanceId?: number;
    userId?: number;
    policyId?: number;
    year?: number;
    allocatedDays?: number;
    usedDays?: number;
    remainingDays?: number;
};

const jsonHeaders = { "Content-Type": "application/json" };

const ApplyLeave: React.FC = () => {
    const { user } = useAuth();
    const userId = ((user as any)?.userId ?? (user as any)?.id) as number | undefined;

    const [policies, setPolicies] = useState<LeavePolicyDTO[]>([]);
    const [leaves, setLeaves] = useState<UserLeaveDTO[]>([]);
    const [balances, setBalances] = useState<UserLeaveBalanceDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // form (modal)
    const [showFormModal, setShowFormModal] = useState(false);
    const [editing, setEditing] = useState<UserLeaveDTO | null>(null);
    const [policyId, setPolicyId] = useState<number | "">("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [dayPart, setDayPart] = useState<"FULL" | "AM" | "PM">("FULL");
    const [notes, setNotes] = useState<string>("");

    // delete confirm
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<UserLeaveDTO | null>(null);

    const selectRef = useRef<HTMLSelectElement | null>(null);
    const currentYear = new Date().getFullYear();
    const [balanceYear, setBalanceYear] = useState<number>(currentYear);

    // compute inclusive days, half-day single-day -> 0.5
    const computeDays = (s?: string, e?: string, part?: "FULL" | "AM" | "PM") => {
        if (!s || !e) return 0;
        try {
            const a = parseISO(s);
            const b = parseISO(e);
            const diff = differenceInCalendarDays(b, a) + 1;
            if (isNaN(diff) || diff < 0) return 0;
            if (diff === 1 && part && part !== "FULL") return 0.5;
            return diff;
        } catch {
            return 0;
        }
    };

    const days = useMemo(() => computeDays(startDate, endDate, dayPart), [startDate, endDate, dayPart]);

    // -- data loads --
    async function loadPolicies() {
        try {
            const res = await fetch(API_ENDPOINTS.LEAVE_POLICIES.GET_ALL);
            if (!res.ok) {
                const b = await res.json().catch(() => ({}));
                throw new Error(b?.message || res.statusText);
            }
            const body = await res.json();
            setPolicies(body?.data ?? []);
        } catch (err: any) {
            console.error("loadPolicies", err);
            toast.error(err?.message ?? "Failed to load leave policies");
        }
    }

    async function loadUserLeaves() {
        if (!userId) return;
        setLoading(true);
        try {
            const url = API_ENDPOINTS.USER_LEAVES.GET_BY_USER(userId);
            const res = await fetch(url);
            if (!res.ok) {
                const b = await res.json().catch(() => ({}));
                throw new Error(b?.message || res.statusText);
            }
            const body = await res.json();
            setLeaves(body?.data ?? []);
        } catch (err: any) {
            console.error("loadUserLeaves", err);
            toast.error(err?.message ?? "Failed to load your leaves");
        } finally {
            setLoading(false);
        }
    }

    async function loadBalance(policyIdArg: number) {
        if (!userId) return null;
        try {
            const url = API_ENDPOINTS.USER_LEAVE_BALANCE.GET(userId, policyIdArg, balanceYear);
            const res = await fetch(url);
            if (!res.ok) return null;
            const body = await res.json();
            return (body?.data ?? null) as UserLeaveBalanceDTO | null;
        } catch (err) {
            return null;
        }
    }

    // load balances for all policies (keeps right panel always populated)
    async function loadAllBalances(year = balanceYear) {
        if (!userId) return;
        setLoading(true);
        try {
            const results: UserLeaveBalanceDTO[] = [];
            for (const p of policies) {
                if (!p.policyId) continue;
                try {
                    const bal = await loadBalance(p.policyId);
                    if (bal) results.push(bal);
                } catch {
                    // ignore per-policy errors
                }
            }
            const merged = policies.map((p) => {
                const found = results.find((r) => r.policyId === p.policyId);
                return (
                    found ?? {
                        userLeaveBalanceId: undefined,
                        userId,
                        policyId: p.policyId,
                        year,
                        allocatedDays: p.defaultAnnualDays ?? 0,
                        usedDays: 0,
                        remainingDays: p.defaultAnnualDays ?? 0,
                    }
                );
            });
            setBalances(merged);
        } catch (err) {
            console.error("loadAllBalances", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        (async () => {
            await loadPolicies();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadUserLeaves();
        loadAllBalances(balanceYear);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [policies]);

    useEffect(() => {
        loadAllBalances(balanceYear);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [balanceYear]);

    // helpers
    const resetForm = () => {
        setEditing(null);
        setPolicyId("");
        setStartDate("");
        setEndDate("");
        setDayPart("FULL");
        setNotes("");
        setTimeout(() => selectRef.current?.focus(), 60);
    };

    const openEdit = (l: UserLeaveDTO) => {
        setEditing(l);
        setPolicyId(l.policyId ?? "");
        setStartDate(l.startDate ?? "");
        setEndDate(l.endDate ?? "");
        setDayPart((l.dayPart as any) ?? "FULL");
        setNotes(l.notes ?? "");
        setShowFormModal(true);
        setTimeout(() => selectRef.current?.focus(), 60);
    };

    const openDeleteConfirm = (l: UserLeaveDTO) => {
        setDeleteTarget(l);
        setShowDeleteConfirm(true);
    };

    const formatDisplay = (iso?: string) => {
        if (!iso) return "";
        try {
            return format(parseISO(iso), "dd/MM/yyyy");
        } catch {
            return iso;
        }
    };

    const isValidRange = () => {
        if (!startDate || !endDate) return false;
        try {
            return parseISO(endDate) >= parseISO(startDate);
        } catch {
            return false;
        }
    };

    const getBalanceForPolicy = (pId?: number) => {
        if (!pId) return null;
        return balances.find((b) => b.policyId === pId) ?? null;
    };

    // ---- FIX: hasEnoughBalance
    // Don't show insufficient when days === 0 (user hasn't chosen dates yet).
    // Calculate remaining from remainingDays if provided, otherwise fallback to allocated - used.
    const hasEnoughBalance = (pId?: number) => {
        const b = getBalanceForPolicy(pId);
        if (!b) return true; // allow apply if we don't have specific balance info
        if (days === 0) return true; // don't mark insufficient until days selected
        const allocatedVal = Number(b.allocatedDays ?? 0);
        const usedVal = Number(b.usedDays ?? 0);
        const remainingVal = Number(b.remainingDays ?? (allocatedVal - usedVal));
        return remainingVal >= Number(days);
    };

    // submit (create / update)
    const submit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!userId) {
            toast.error("User not identified");
            return;
        }
        if (!policyId) {
            toast.warn("Please select a leave policy");
            return;
        }
        if (!startDate || !endDate) {
            toast.warn("Please provide start and end dates");
            return;
        }
        if (!isValidRange()) {
            toast.warn("End date cannot be before start date");
            return;
        }
        if (days <= 0) {
            toast.warn("Invalid number of days");
            return;
        }
        if (!hasEnoughBalance(policyId as number)) {
            toast.warn("Insufficient leave balance for selected policy");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                userId,
                policyId,
                startDate,
                endDate,
                days,
                dayPart,
                notes,
            };

            // === NOTE THE FIX HERE ===
            // API_ENDPOINTS.USER_LEAVES.CREATE is a function that returns a URL
            // so call it with userId instead of appending ?userId=...
            if (editing?.userLeaveId) {
                const url = API_ENDPOINTS.USER_LEAVES.UPDATE(editing.userLeaveId);
                console.log("PUT", url, payload);
                const res = await fetch(url, {
                    method: "PUT",
                    headers: jsonHeaders,
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    const b = await res.json().catch(() => ({}));
                    throw new Error(b?.message || res.statusText);
                }
                const body = await res.json();
                toast.success(body?.message ?? "Leave updated");
            } else {
                // create — use CREATE(userId) since API_ENDPOINTS now defines CREATE as a function
                const url = API_ENDPOINTS.USER_LEAVES.CREATE(userId!);
                console.log("POST", url, payload);
                const res = await fetch(url, {
                    method: "POST",
                    headers: jsonHeaders,
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    const b = await res.json().catch(() => ({}));
                    throw new Error(b?.message || res.statusText);
                }
                const body = await res.json();
                toast.success(body?.message ?? "Leave created");
            }

            // refresh
            await loadUserLeaves();
            await loadAllBalances(balanceYear);
            resetForm();
            setShowFormModal(false);
        } catch (err: any) {
            console.error("submit leave", err);
            toast.error(err?.message ?? "Failed to save leave");
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        if (!deleteTarget?.userLeaveId) return;
        try {
            const url = API_ENDPOINTS.USER_LEAVES.DELETE(deleteTarget.userLeaveId);
            const res = await fetch(url, { method: "DELETE" });
            if (!res.ok) {
                const b = await res.json().catch(() => ({}));
                throw new Error(b?.message || res.statusText);
            }
            const body = await res.json();
            toast.success(body?.message ?? "Leave deleted");
            await loadUserLeaves();
            await loadAllBalances(balanceYear);
        } catch (err: any) {
            console.error("delete leave", err);
            toast.error(err?.message ?? "Failed to delete leave");
        } finally {
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
        }
    };

    // small numbers for display for currently selected policy
    const selectedBal = getBalanceForPolicy(policyId as number | undefined);
    const allocated = Number(selectedBal?.allocatedDays ?? 0);
    const used = Number(selectedBal?.usedDays ?? 0);
    const remaining = Number(selectedBal?.remainingDays ?? (allocated - used));
    //const usedPct = allocated > 0 ? Math.min(100, Math.round((used / allocated) * 100)) : 0;

    return (
        <div className="container-fluid py-4">
            <Header title="Apply Leave" subtitle="Apply for leaves & view your balances" />

            <div className="row gx-4">
                <div className="col-lg-8">
                    <div className="d-flex mb-3 gap-2 align-items-center">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                resetForm();
                                setShowFormModal(true);
                            }}
                        >
                            <i className="bi bi-plus-lg me-1" /> Apply Leave
                        </button>
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                loadUserLeaves();
                                loadAllBalances(balanceYear);
                                toast.info("Refreshed leaves & balances");
                            }}
                        >
                            <i className="bi bi-arrow-repeat me-1" /> Refresh
                        </button>
                    </div>

                    <div className="card leave-list-card shadow-sm">
                        <div className="card-body p-0">
                            <div className="table-toolbar px-3 py-2 d-flex justify-content-between align-items-center">
                                <div className="fw-semibold">My Leaves</div>
                                <div className="small text-muted">Total: {leaves.length}</div>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover mb-0 admin-leave-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="text-center" style={{ width: 110 }}>
                                                From
                                            </th>
                                            <th className="text-center" style={{ width: 110 }}>
                                                To
                                            </th>
                                            <th>Policy</th>
                                            <th className="text-center" style={{ width: 80 }}>
                                                Days
                                            </th>
                                            <th className="text-center" style={{ width: 90 }}>
                                                Part
                                            </th>
                                            <th className="text-truncate">Notes</th>
                                            <th className="text-end" style={{ width: 160 }}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan={7} className="py-4 text-center">
                                                    <div className="spinner-border text-primary me-2" role="status" />
                                                    Loading...
                                                </td>
                                            </tr>
                                        ) : leaves.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-4 text-center text-muted">
                                                    You have no leaves.
                                                </td>
                                            </tr>
                                        ) : (
                                            leaves.map((l) => {
                                                const policy = policies.find((p) => p.policyId === l.policyId);
                                                return (
                                                    <tr key={l.userLeaveId ?? `${l.startDate}-${l.endDate}`}>
                                                        <td className="text-center fw-semibold">{format(parseISO(l.startDate ?? ""), "dd/MM/yyyy")}</td>
                                                        <td className="text-center fw-semibold">{format(parseISO(l.endDate ?? ""), "dd/MM/yyyy")}</td>
                                                        <td>{policy ? `${policy.policyCode} — ${policy.policyName}` : `Policy ${l.policyId}`}</td>
                                                        <td className="text-center">{l.days}</td>
                                                        <td className="text-center">{l.dayPart}</td>
                                                        <td className="text-truncate" style={{ maxWidth: 360 }}>
                                                            {l.notes}
                                                        </td>
                                                        <td className="text-end">
                                                            <button className="btn btn-sm btn-light me-2" onClick={() => openEdit(l)}>
                                                                <i className="bi bi-pencil-fill me-1" /> Edit
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-danger" onClick={() => openDeleteConfirm(l)}>
                                                                <i className="bi bi-trash-fill me-1" /> Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow-sm mb-4 leave-balance-card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <div className="fw-semibold">Leave Balance</div>
                            <div>
                                <select className="form-select form-select-sm" value={balanceYear} onChange={(e) => setBalanceYear(Number(e.target.value))}>
                                    {Array.from({ length: 5 }).map((_, idx) => {
                                        const year = currentYear - 2 + idx;
                                        return (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="small text-muted mb-2">Balances by policy — Year {balanceYear}</div>

                            <div className="balance-list" style={{ maxHeight: 260, overflow: "auto" }}>
                                {policies.length === 0 ? (
                                    <div className="text-muted">No policies configured</div>
                                ) : (
                                    policies.map((p) => {
                                        const b = getBalanceForPolicy(p.policyId);
                                        const allocatedVal = Number(b?.allocatedDays ?? p.defaultAnnualDays ?? 0);
                                        const usedVal = Number(b?.usedDays ?? 0);
                                        const remainingVal = Number(b?.remainingDays ?? (allocatedVal - usedVal));
                                        const pct = allocatedVal > 0 ? Math.round((usedVal / allocatedVal) * 100) : 0;
                                        return (
                                            <div key={p.policyId} className="mb-3 policy-balance-row p-2 rounded" style={{ border: "1px solid rgba(0,0,0,0.04)" }}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="fw-semibold">
                                                            {p.policyCode} — {p.policyName}
                                                        </div>
                                                        <div className="small text-muted">{p.description}</div>
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="small text-muted">Rem</div>
                                                        <div className="fw-bold">{remainingVal}</div>
                                                    </div>
                                                </div>
                                                <div className="progress mt-2" style={{ height: 8 }}>
                                                    <div className="progress-bar" role="progressbar" style={{ width: `${pct}%` }} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="small text-muted mt-2">Tip: select a policy when applying to highlight specific balance above.</div>
                        </div>
                    </div>

                    <div className="card shadow-sm quick-help-card">
                        <div className="card-body">
                            <h6 className="mb-2">Quick Help</h6>
                            <ul className="small mb-0">
                                <li>Half-day selection is only allowed for single-day leaves.</li>
                                <li>Use the Refresh button to fetch latest leaves and balances.</li>
                                <li>Admins set policies — contact HR to change allocations.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Apply / Edit Modal */}
            {showFormModal && (
                <div className="modal-backdrop react-modal">
                    <div className="modal-container">
                        <div className="modal-card">
                            <div className="modal-header">
                                <h5 className="modal-title">{editing ? "Edit Leave" : "Apply Leave"}</h5>
                                <button className="btn-close" onClick={() => setShowFormModal(false)} />
                            </div>

                            <form onSubmit={submit}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <label className="form-label">Leave Policy</label>
                                            <select
                                                ref={selectRef}
                                                className="form-select"
                                                value={policyId}
                                                onChange={(e) => setPolicyId(e.target.value ? Number(e.target.value) : "")}
                                                disabled={saving}
                                                required
                                            >
                                                <option value="">-- Select policy --</option>
                                                {policies.map((p) => (
                                                    <option key={p.policyId} value={p.policyId}>
                                                        {p.policyCode} — {p.policyName}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="form-text small text-muted">{policies.find((x) => x.policyId === policyId)?.description}</div>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Start</label>
                                            <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">End</label>
                                            <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Day Part</label>
                                            <select className="form-select" value={dayPart} onChange={(e) => setDayPart(e.target.value as any)}>
                                                <option value="FULL">Full Day</option>
                                                <option value="AM">Half Day - AM</option>
                                                <option value="PM">Half Day - PM</option>
                                            </select>
                                        </div>

                                        <div className="col-md-12">
                                            <label className="form-label">Notes (optional)</label>
                                            <input className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason / comment" />
                                        </div>

                                        <div className="col-12 d-flex justify-content-between align-items-center">
                                            <div className="small text-muted">
                                                Calculated days: <strong className="ms-1">{days}</strong>
                                                {selectedBal && <span className="ms-3">Remaining: <strong>{remaining}</strong></span>}
                                            </div>

                                            {/* only show badge when days chosen and insufficent */}
                                            {days > 0 && selectedBal && !hasEnoughBalance(policyId as number | undefined) && (
                                                <div className="badge badge-insufficient">Insufficient balance</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowFormModal(false)}>
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            saving ||
                                            !isValidRange() ||
                                            !Boolean(policyId) ||
                                            days <= 0 ||
                                            (policyId ? !hasEnoughBalance(policyId as number) : false)
                                        }
                                    >
                                        {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                                        {editing ? "Save changes" : "Apply Leave"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm modal */}
            {showDeleteConfirm && deleteTarget && (
                <div className="modal-backdrop react-modal">
                    <div className="modal-container">
                        <div className="modal-card">
                            <div className="modal-header">
                                <h5 className="modal-title text-danger">Confirm delete</h5>
                                <button className="btn-close" onClick={() => setShowDeleteConfirm(false)} />
                            </div>
                            <div className="modal-body">
                                <p>
                                    Are you sure you want to delete the leave from <strong>{formatDisplay(deleteTarget.startDate)}</strong> to{" "}
                                    <strong>{formatDisplay(deleteTarget.endDate)}</strong>?
                                </p>
                                <div className="small text-muted">This action cannot be undone.</div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-outline-secondary" onClick={() => setShowDeleteConfirm(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-danger" onClick={() => remove()}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplyLeave;
