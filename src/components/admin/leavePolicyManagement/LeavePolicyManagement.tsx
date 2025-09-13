import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import Header from "../../common/header/Header";
import { LeavePolicyDTO } from "../../../types/leavePolicy";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showForm) setTimeout(() => formFirstRef.current?.focus(), 30);
  }, [showForm]);

  const openCreate = () => {
    setEditing(null);
    setPolicyCode("");
    setPolicyName("");
    setDefaultAnnualDays("");
    setDescription("");
    setShowForm(true);
  };

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

  const filtered = useMemo(() => {
    return policies
      .filter((p) => {
        if (!debouncedQ) return true;
        const hay = `${p.policyCode} ${p.policyName} ${p.description ?? ""}`.toLowerCase();
        return hay.includes(debouncedQ.toLowerCase());
      })
      .sort((a, b) => (a.policyCode < b.policyCode ? -1 : a.policyCode > b.policyCode ? 1 : 0));
  }, [policies, debouncedQ]);

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

  const printView = () => {
    const rows = (filtered || [])
      .map((p) => `<tr><td>${escapeHtml(p.policyCode)}</td><td>${escapeHtml(p.policyName)}</td><td>${p.defaultAnnualDays}</td><td>${escapeHtml(p.description ?? "")}</td></tr>`)
      .join("");
    const html = `<html><head><title>Leave Policies</title><style>table{width:100%;border-collapse:collapse}td,th{padding:8px;border:1px solid #ddd}</style></head><body><h3>Leave Policies</h3><table><thead><tr><th>Code</th><th>Name</th><th>Default Days</th><th>Description</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
  };

  function escapeHtml(s: string) {
    return (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
  }

  const clearSearch = () => setQ("");

  return (
    <div className="container py-4">
      {/* header — only title/subtitle/eyebrow; actions moved to toolbar below */}
      <Header title="Leave Policy Management" subtitle="Create and manage leave policies" />

      {/* toolbar directly under header (matches Holiday layout) */}
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center leave-policy-toolbar">
        <div className="input-group input-group-sm" style={{ minWidth: 240 }}>
          <span className="input-group-text">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="form-control"
            placeholder="Search code or name"
            aria-label="Search leave policies"
          />
        </div>

        <div className="ms-auto d-flex gap-2 align-items-center">
          <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={clearSearch} title="Clear search">Clear</button>

          <div className="btn-group">
            <button className="btn btn-outline-success btn-sm" onClick={exportCSV} title="Export CSV" aria-label="Export CSV">
              <i className="bi bi-file-earmark-spreadsheet me-1" /> Export
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={printView} title="Print" aria-label="Print">
              <i className="bi bi-printer me-1" /> Print
            </button>
          </div>

          <button className="btn btn-primary btn-sm" onClick={openCreate} disabled={saving} title="Create new policy">
            <i className="bi bi-plus-lg me-1" /> New Policy
          </button>

          <button className="btn btn-outline-secondary btn-sm" onClick={load} title="Refresh policies" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" /> Refreshing
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
                    <th style={{ width: 160 }} className="text-center">CODE</th>
                    <th className="text-center">NAME</th>
                    <th style={{ width: 140 }} className="text-center">DEFAULT DAYS</th>
                    <th className="text-center">DESCRIPTION</th>
                    <th className="text-end">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="py-5 text-center"><div className="spinner-border text-primary me-2" role="status" />Loading policies...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="py-5 text-center text-muted">No leave policies found.</td></tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p.policyId}>
                        <td className="fw-semibold text-center">{p.policyCode}</td>
                        <td>{p.policyName}</td>
                        <td className="text-center">{p.defaultAnnualDays}</td>
                        <td className="text-truncate" style={{ maxWidth: 500 }}>{p.description}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-light me-2" onClick={() => openEdit(p)} title="Edit" aria-label={`Edit ${p.policyName}`}><i className="bi bi-pencil-fill" /> Edit</button>
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
  );
};

export default LeavePolicyManagement;
