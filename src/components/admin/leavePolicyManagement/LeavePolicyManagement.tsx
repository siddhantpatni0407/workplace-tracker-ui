import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { LeavePolicyDTO } from "../../../types/leavePolicy";
import { ErrorBoundary } from "../../ui";
import Header from "../../common/Header/Header";
import leavePolicyService from "../../../services/leavePolicyService";
import "./LeavePolicyManagement.css";

const useDebounced = <T,>(value: T, ms = 220) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

const LeavePolicyManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState<LeavePolicyDTO[]>([]);
  const [editing, setEditing] = useState<LeavePolicyDTO | null>(null);
  const [showForm, setShowForm] = useState(false);

  // form state
  const [policyCode, setPolicyCode] = useState("");
  const [policyName, setPolicyName] = useState("");
  const [defaultAnnualDays, setDefaultAnnualDays] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // filters / search
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q);

  const formFirstRef = useRef<HTMLInputElement | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = policies.length;
    const active = policies.filter(p => p.defaultAnnualDays > 0).length;
    const highAllowance = policies.filter(p => p.defaultAnnualDays >= 20).length;
    const lowAllowance = policies.filter(p => p.defaultAnnualDays < 10).length;
    
    return { total, active, highAllowance, lowAllowance };
  }, [policies]);

  // Filtered policies
  const filtered = useMemo(() => {
    if (!debouncedQ) return policies;
    const lowerQ = debouncedQ.toLowerCase();
    return policies.filter(p => 
      p.policyCode?.toLowerCase().includes(lowerQ) ||
      p.policyName?.toLowerCase().includes(lowerQ) ||
      p.description?.toLowerCase().includes(lowerQ)
    );
  }, [policies, debouncedQ]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await leavePolicyService.getAll();
      setPolicies(data ?? []);
    } catch (err: any) {
      console.error("load policies", err);
      toast.error(err?.message ?? "Failed to load leave policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
      }, []);

  useEffect(() => {
    if (showForm) setTimeout(() => formFirstRef.current?.focus(), 30);
  }, [showForm]);

  const openEdit = async (p: LeavePolicyDTO) => {
    try {
      setLoading(true);
      const fresh = await leavePolicyService.getById(p.policyId!);
      setEditing(fresh);
      setShowForm(true);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load policy");
    } finally {
      setLoading(false);
    }
  };

  // reflect editing into inputs
  useEffect(() => {
    if (editing) {
      setPolicyCode(editing.policyCode || "");
      setPolicyName(editing.policyName || "");
      setDefaultAnnualDays(editing.defaultAnnualDays ?? "");
      setDescription(editing.description ?? "");
    } else {
      // clear when no editing
      setPolicyCode("");
      setPolicyName("");
      setDefaultAnnualDays("");
      setDescription("");
    }
  }, [editing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyCode || !policyName || defaultAnnualDays === "" || isNaN(Number(defaultAnnualDays))) {
      toast.warn("Please provide policy code, name and valid default days");
      return;
    }
    try {
      setSaving(true);
      const payload: Partial<LeavePolicyDTO> = {
        policyCode: policyCode.trim().toUpperCase(),
        policyName: policyName.trim(),
        defaultAnnualDays: Number(defaultAnnualDays),
        description: description?.trim() || undefined,
      };

      if (editing && editing.policyId) {
        const updated = await leavePolicyService.updatePolicy(editing.policyId, payload);
        toast.success(`Policy updated: ${updated.policyName}`);
      } else {
        const created = await leavePolicyService.createPolicy(payload);
        toast.success(`Policy created: ${created.policyName}`);
      }

      await load();
      setShowForm(false);
    } catch (err: any) {
      console.error("save policy", err);
      toast.error(err?.message ?? "Failed to save policy");
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    const rows = (filtered || []).map((p) => ({
      Code: p.policyCode,
      Name: p.policyName,
      DefaultDays: p.defaultAnnualDays,
      Description: p.description ?? "",
    }));
    if (!rows.length) {
      toast.info("No policies to export");
      return;
    }
    const header = Object.keys(rows[0]).join(",");
    const csv = [header, ...rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leave_policies_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };

  const clearSearch = () => setQ("");

  // Helper function to highlight search matches
  const highlight = (txt: string | null | undefined, q: string) => {
    if (!txt || !q) return txt || "";
    const idx = txt.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return txt;
    return (
      <>
        {txt.slice(0, idx)}
        <mark className="lpm-highlight">{txt.slice(idx, idx + q.length)}</mark>
        {txt.slice(idx + q.length)}
      </>
    );
  };

  return (
    <ErrorBoundary>
      <Header 
        title="Leave Policy Management"
        subtitle="Configure and manage company leave policies"
      />
      
      <div className="leave-policy-management container-fluid py-4" data-animate="fade">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h1 className="lpm-title mb-0 d-none">Leave Policy Management</h1>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <div className="d-none d-md-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={exportCSV} disabled={loading || policies.length === 0} title="Export to CSV">
                <i className="bi bi-file-earmark-arrow-down me-1" /> Export CSV
              </button>

              <button className="btn btn-sm btn-outline-primary" onClick={load} disabled={loading} title="Refresh">
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-arrow-clockwise me-1" />} Refresh
              </button>
            </div>

            <button className="btn btn-sm btn-primary" onClick={() => setShowForm(true)} disabled={loading}>
              <i className="bi bi-plus-lg me-1" /> New Policy
            </button>
          </div>
        </div>
        {/* Stats Row */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="stat-card shadow-sm p-3 rounded text-center lpm-card-acc d-flex flex-column justify-content-between border">
              <div className="d-flex w-100 justify-content-between align-items-start">
                <div className="text-start">
                  <div className="stat-icon"><i className="bi bi-file-text-fill" /></div>
                  <div className="stat-title">TOTAL</div>
                </div>
                <span className="badge bg-primary align-self-start">Policies</span>
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
            <div className="stat-card shadow-sm p-3 rounded text-center lpm-card-acc d-flex flex-column justify-content-between border">
              <div className="d-flex w-100 justify-content-between align-items-start">
                <div className="text-start">
                  <div className="stat-icon"><i className="bi bi-check-circle-fill" /></div>
                  <div className="stat-title">ACTIVE</div>
                </div>
                <span className="badge bg-success align-self-start">Live</span>
              </div>
              <div className="mt-2">
                <div className="stat-value h4 mb-0" aria-live="polite">{stats.active}</div>
                <div className="progress mt-2 thin-progress">
                  <div className="progress-bar bg-success" role="progressbar" style={{ width: `${Math.round((stats.active / Math.max(1, stats.total)) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="stat-card shadow-sm p-3 rounded text-center lpm-card-acc d-flex flex-column justify-content-between border">
              <div className="d-flex w-100 justify-content-between align-items-start">
                <div className="text-start">
                  <div className="stat-icon"><i className="bi bi-calendar-plus-fill" /></div>
                  <div className="stat-title">HIGH DAYS</div>
                </div>
                <span className="badge bg-info text-dark align-self-start">20+ Days</span>
              </div>
              <div className="mt-2">
                <div className="stat-value h4 mb-0" aria-live="polite">{stats.highAllowance}</div>
                <div className="progress mt-2 thin-progress">
                  <div className="progress-bar bg-info" role="progressbar" style={{ width: `${Math.round((stats.highAllowance / Math.max(1, stats.total)) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="stat-card shadow-sm p-3 rounded text-center lpm-card-acc d-flex flex-column justify-content-between border">
              <div className="d-flex w-100 justify-content-between align-items-start">
                <div className="text-start">
                  <div className="stat-icon"><i className="bi bi-calendar-x-fill" /></div>
                  <div className="stat-title">LOW DAYS</div>
                </div>
                <span className="badge bg-warning text-dark align-self-start">&lt;10 Days</span>
              </div>
              <div className="mt-2">
                <div className="stat-value h4 mb-0 text-warning" aria-live="polite">{stats.lowAllowance}</div>
                <div className="progress mt-2 thin-progress">
                  <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${Math.round((stats.lowAllowance / Math.max(1, stats.total)) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Filter */}
        <div className="card mb-3 p-3 shadow-sm lpm-filter-card">
          <div className="d-flex gap-2 align-items-center flex-column flex-md-row">
            <input 
              className="form-control flex-grow-1" 
              placeholder="Search policies by code, name, or description..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              aria-label="Search policies" 
            />
            <button className="btn btn-outline-secondary btn-sm" onClick={clearSearch} disabled={!q}>
              <i className="bi bi-x-lg me-1" /> Clear
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="card shadow-sm leave-policy-table lpm-table-glow">
          <div className="table-responsive">
            {loading ? (
              <div className="p-4 text-center"><div className="spinner-border" role="status" /></div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-muted text-center">No leave policies found.</div>
            ) : (
              <table className="table table-hover table-striped table-sm m-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 120 }} className="text-center">Code</th>
                    <th>Policy Name</th>
                    <th style={{ width: 140 }} className="text-center">Annual Days</th>
                    <th>Description</th>
                    <th style={{ width: 120 }} className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, idx) => (
                    <tr key={p.policyId} className="lpm-row" style={{ animationDelay: `${idx * 35}ms` }}>
                      <td className="fw-semibold text-center text-primary">{p.policyCode}</td>
                      <td className="fw-medium">{highlight(p.policyName, debouncedQ)}</td>
                      <td className="text-center">
                        <span className={`badge ${p.defaultAnnualDays >= 20 ? 'bg-success' : p.defaultAnnualDays >= 10 ? 'bg-warning' : 'bg-danger'}`}>
                          {p.defaultAnnualDays} days
                        </span>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: 400 }}>
                        {highlight(p.description, debouncedQ)}
                      </td>
                      <td className="text-end">
                        <button 
                          className="btn btn-sm btn-outline-primary" 
                          onClick={() => openEdit(p)} 
                          title="Edit policy"
                          aria-label={`Edit ${p.policyName}`}
                        >
                          <i className="bi bi-pencil-fill me-1" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      {/* Create/Edit modal */}
      {showForm && (
        <div className="modal-backdrop-custom" role="dialog" aria-modal="true" aria-label={editing ? "Edit leave policy" : "Create leave policy"}>
          <div className="holiday-modal card p-3 shadow-lg" style={{ maxWidth: 720 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">{editing ? "Edit Leave Policy" : "Create Leave Policy"}</h6>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowForm(false)} disabled={saving}>Close</button>
            </div>

            <form onSubmit={submit} className="needs-validation" noValidate>
              <div className="row g-2">
                <div className="col-md-4">
                  <label className="form-label">Policy Code</label>
                  <input ref={formFirstRef} className="form-control" value={policyCode} onChange={(e) => setPolicyCode(e.target.value.toUpperCase())} required disabled={saving} />
                </div>

                <div className="col-md-8">
                  <label className="form-label">Policy Name</label>
                  <input className="form-control" value={policyName} onChange={(e) => setPolicyName(e.target.value)} required disabled={saving} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Default Annual Days</label>
                  <input type="number" min={0} className="form-control" value={defaultAnnualDays as any} onChange={(e) => setDefaultAnnualDays(Number(e.target.value))} required disabled={saving} />
                </div>

                <div className="col-md-8">
                  <label className="form-label">Description</label>
                  <input className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} disabled={saving} />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" /> Saving...</> : (editing ? "Update" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
};

export default LeavePolicyManagement;
