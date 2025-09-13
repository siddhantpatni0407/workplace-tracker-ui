// src/components/user/leavePolicy/LeavePolicy.tsx

import React, { useEffect, useMemo, useState } from "react";
import Header from "../../common/header/Header";
import { LeavePolicyDTO } from "../../../types/leavePolicy";
import leavePolicyService from "../../../services/leavePolicyService";
import { toast } from "react-toastify";
import "./LeavePolicy.css";

const LeavePolicy: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [policies, setPolicies] = useState<LeavePolicyDTO[]>([]);
    const [q, setQ] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const data = await leavePolicyService.getAll();
            setPolicies(data ?? []);
        } catch (err: any) {
            console.error("load leave policies", err);
            toast.error(err?.message ?? "Failed to load leave policies");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        return policies.filter((p) => {
            if (!q) return true;
            const hay = `${p.policyCode} ${p.policyName} ${p.description ?? ""}`.toLowerCase();
            return hay.includes(q.toLowerCase());
        });
    }, [policies, q]);

    return (
        <div className="container py-4">
            <Header title="Leave Policy" subtitle="View company leave policies" />

            {/* Search + Refresh toolbar */}
            <div className="d-flex flex-wrap gap-2 mb-3 align-items-center leave-policy-toolbar">
                <div className="input-group input-group-sm" style={{ minWidth: 240 }}>
                    <span className="input-group-text">Search</span>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="form-control"
                        placeholder="Search policy code or name"
                        aria-label="Search leave policies"
                    />
                </div>

                {q && (
                    <button
                        className="btn btn-link btn-sm text-decoration-none"
                        onClick={() => setQ("")}
                    >
                        Clear
                    </button>
                )}

                <div className="ms-auto">
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={load}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-1"
                                    role="status"
                                />
                                Refreshing
                            </>
                        ) : (
                            <>
                                <i className="bi bi-arrow-repeat me-1" /> Refresh
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="leave-policy-stage">
                <div className="card leave-policy-card shadow-sm">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 admin-leave-table">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: 160 }} className="text-center">
                                            CODE
                                        </th>
                                        <th className="text-center">NAME</th>
                                        <th style={{ width: 140 }} className="text-center">
                                            DEFAULT DAYS
                                        </th>
                                        <th className="text-center">DESCRIPTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="py-5 text-center">
                                                <div
                                                    className="spinner-border text-primary me-2"
                                                    role="status"
                                                />
                                                Loading policies...
                                            </td>
                                        </tr>
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-5 text-center text-muted">
                                                No leave policies found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((p) => (
                                            <tr key={p.policyId}>
                                                <td className="fw-semibold text-center">
                                                    {p.policyCode}
                                                </td>
                                                <td>{p.policyName}</td>
                                                <td className="text-center">{p.defaultAnnualDays}</td>
                                                <td
                                                    className="text-truncate"
                                                    style={{ maxWidth: 500 }}
                                                >
                                                    {p.description}
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
        </div>
    );
};

export default LeavePolicy;
