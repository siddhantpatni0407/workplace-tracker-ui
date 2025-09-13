// src/components/user/officeVisitAnalytics/OfficeVisitAnalytics.tsx
import React, { useEffect, useMemo, useState } from "react";
import Header from "../../common/header/Header";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import { format, startOfMonth, endOfMonth } from "date-fns";
import "./OfficeVisitAnalytics.css";

type AggRow = {
  period: string;
  wfo?: number;
  wfh?: number;
  hybrid?: number;
  others?: number;
  leave?: number;
  holiday?: number;
};

const jsonHeaders = { "Content-Type": "application/json" };

const OfficeVisitAnalytics: React.FC = () => {
  const { user } = useAuth();
  const userId = ((user as any)?.userId ?? (user as any)?.id) as number | undefined;

  const today = new Date();
  const defaultFrom = startOfMonth(today);
  const defaultTo = endOfMonth(today);

  const [from, setFrom] = useState<string>(format(defaultFrom, "yyyy-MM-dd"));
  const [to, setTo] = useState<string>(format(defaultTo, "yyyy-MM-dd"));
  const [groupBy, setGroupBy] = useState<"month" | "week" | "year">("month");

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AggRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!userId) {
      setError("User not identified");
      setRows([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = API_ENDPOINTS.ANALYTICS.VISITS_LEAVES_AGGREGATE({
        userId,
        from,
        to,
        groupBy,
      });
      const res = await fetch(url, { headers: jsonHeaders });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.message || res.statusText || "Request failed");
      }
      const body = await res.json();
      setRows((body?.data ?? []) as AggRow[]);
    } catch (err: any) {
      console.error("load analytics", err);
      setError(err?.message ?? "Failed to load analytics");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // initial load

  useEffect(() => {
    const t = setTimeout(() => load(), 220);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, groupBy]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.wfo += Number(r.wfo ?? 0);
        acc.wfh += Number(r.wfh ?? 0);
        acc.hybrid += Number(r.hybrid ?? 0);
        acc.others += Number(r.others ?? 0);
        acc.leave += Number(r.leave ?? 0);
        acc.holiday += Number(r.holiday ?? 0);
        return acc;
      },
      { wfo: 0, wfh: 0, hybrid: 0, others: 0, leave: 0, holiday: 0 }
    );
  }, [rows]);

  return (
    <div className="container py-4">
      <Header title="Office Visit Analytics" subtitle="Summary of WFO/ WFH / Hybrid and leave & holiday counts" />

      <div className="card analytics-card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small">From</label>
              <input type="date" className="form-control" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>

            <div className="col-md-3">
              <label className="form-label small">To</label>
              <input type="date" className="form-control" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>

            <div className="col-md-3">
              <label className="form-label small">Group By</label>
              <select className="form-select" value={groupBy} onChange={(e) => setGroupBy(e.target.value as any)}>
                <option value="month">Month</option>
                <option value="week">Week</option>
                <option value="year">Year</option>
              </select>
            </div>

            <div className="col-md-3 text-end">
              <button
                className="btn btn-outline-secondary me-2"
                onClick={() => {
                  setFrom(format(defaultFrom, "yyyy-MM-dd"));
                  setTo(format(defaultTo, "yyyy-MM-dd"));
                }}
              >
                Reset
              </button>

              <button className="btn btn-primary" onClick={load} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null} Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row gx-4">
        <div className="col-lg-8">
          <div className="card shadow-sm mb-3">
            <div className="card-body p-0">
              <div className="table-toolbar px-3 py-2 d-flex justify-content-between align-items-center">
                <div className="fw-semibold">Aggregated visits & leaves</div>
                <div className="small text-muted">{rows.length} periods</div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover mb-0 analytics-table">
                  <thead className="table-light">
                    <tr>
                      <th>Period</th>
                      <th className="text-center">WFO</th>
                      <th className="text-center">WFH</th>
                      <th className="text-center">Hybrid</th>
                      <th className="text-center">Others</th>
                      <th className="text-center">Leave</th>
                      <th className="text-center">Holiday</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-4 text-center">
                          <div className="spinner-border text-primary me-2" role="status" /> Loading...
                        </td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-muted">No data</td>
                      </tr>
                    ) : (
                      rows.map((r) => (
                        <tr key={r.period}>
                          <td className="fw-semibold">{r.period}</td>
                          <td className="text-center">{r.wfo ?? 0}</td>
                          <td className="text-center">{r.wfh ?? 0}</td>
                          <td className="text-center">{r.hybrid ?? 0}</td>
                          <td className="text-center">{r.others ?? 0}</td>
                          <td className="text-center">{r.leave ?? 0}</td>
                          <td className="text-center">{r.holiday ?? 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card summary-card shadow-sm mb-3">
            <div className="card-body">
              <h6 className="mb-3">Summary</h6>

              <div className="summary-row"><span>WFO</span><strong>{totals.wfo}</strong></div>
              <div className="summary-bar"><div style={{ width: `${Math.min(100, totals.wfo)}%` }} /></div>

              <div className="summary-row"><span>WFH</span><strong>{totals.wfh}</strong></div>
              <div className="summary-bar"><div style={{ width: `${Math.min(100, totals.wfh)}%` }} /></div>

              <div className="summary-row"><span>Hybrid</span><strong>{totals.hybrid}</strong></div>
              <div className="summary-bar"><div style={{ width: `${Math.min(100, totals.hybrid)}%` }} /></div>

              <div className="summary-row"><span>Others</span><strong>{totals.others}</strong></div>
              <div className="summary-bar"><div style={{ width: `${Math.min(100, totals.others)}%` }} /></div>

              <div className="summary-row mt-3"><span>Leaves</span><strong className="text-danger">{totals.leave}</strong></div>
              <div className="summary-row"><span>Holidays</span><strong className="text-success">{totals.holiday}</strong></div>

              <div className="small text-muted mt-3">Tip: change the date range and group by to compare months/weeks/years.</div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="mb-2">Quick actions</h6>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => {
                    // jump to current month
                    setFrom(format(defaultFrom, "yyyy-MM-dd"));
                    setTo(format(defaultTo, "yyyy-MM-dd"));
                  }}
                >
                  Jump to current month
                </button>

                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    // year-to-date
                    setFrom(format(new Date(today.getFullYear(), 0, 1), "yyyy-MM-dd"));
                    setTo(format(new Date(today.getFullYear(), 11, 31), "yyyy-MM-dd"));
                  }}
                >
                  Year-to-date
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="mt-3 text-danger small">{error}</div>}
    </div>
  );
};

export default OfficeVisitAnalytics;
