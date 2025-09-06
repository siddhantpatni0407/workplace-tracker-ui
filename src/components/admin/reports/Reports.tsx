// src/components/admin/reports/Reports.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import axiosInstance from "../../../services/axiosInstance";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import { useAuth } from "../../../context/AuthContext";
import UserAnalyticsCharts, { UserRow } from "./UserAnalyticsCharts";
import "./Reports.css";

type ChartKey = "activePie" | "roleLocked" | "attemptsBar" | "overview";

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // modal for enlarged chart
  const [enlarged, setEnlarged] = useState<{
    open: boolean;
    chart: ChartKey;
    title: string;
    wrapperRef?: React.RefObject<HTMLDivElement | null>;
  }>({ open: false, chart: "overview", title: "" });

  // store refs for each chart so we can serialize/download
  const refs: Record<Exclude<ChartKey, "overview"> | "overview", React.RefObject<HTMLDivElement | null>> = {
    activePie: useRef<HTMLDivElement | null>(null),
    roleLocked: useRef<HTMLDivElement | null>(null),
    attemptsBar: useRef<HTMLDivElement | null>(null),
    overview: useRef<HTMLDivElement | null>(null),
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axiosInstance.get(API_ENDPOINTS.USERS.GET_ALL);
      if (resp?.data?.status === "SUCCESS" && Array.isArray(resp.data.data)) {
        const mapped: UserRow[] = resp.data.data.map((u: any) => ({
          userId: u.userId,
          name: u.username || u.name || "",
          email: u.email || "",
          mobileNumber: u.mobileNumber || null,
          role: (u.role as UserRow["role"]) || "USER",
          isActive: !!u.isActive,
          isAccountLocked: !!u.isAccountLocked,
          lastLoginTime: u.lastLoginTime || null,
          loginAttempts: typeof u.loginAttempts === "number" ? u.loginAttempts : null,
        }));
        setUsers(mapped);
      } else {
        setError(resp?.data?.message || "Failed to load users.");
      }
    } catch (err: any) {
      console.error("Reports.fetchUsers error:", err);
      setError(err?.response?.data?.message || "Network/server error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // helper: download SVG (and attempt PNG conversion)
  const downloadChart = async (ref: React.RefObject<HTMLDivElement | null> | undefined, name = "chart") => {
    try {
      if (!ref || !ref.current) throw new Error("Chart element not available");
      // find first svg inside wrapper
      const svg = ref.current.querySelector("svg") as SVGSVGElement | null;
      if (!svg) throw new Error("SVG not found for this chart");

      // serialize SVG
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svg);

      // Add namespaces if missing (helps some browsers)
      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }

      const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Attempt PNG conversion: draw serialized SVG to canvas then download PNG
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          // set canvas size to svg size (if available) else use bounding box
          const bbox = svg.getBoundingClientRect();
          canvas.width = Math.max(200, Math.round(bbox.width || svg.clientWidth || 800));
          canvas.height = Math.max(200, Math.round(bbox.height || svg.clientHeight || 600));
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Cannot get canvas context");
          // fill white background for better contrast
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${name}.png`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            } else {
              throw new Error("PNG conversion failed");
            }
          }, "image/png");
        } catch (pngErr) {
          // fallback to SVG
          const a = document.createElement("a");
          a.href = svgUrl;
          a.download = `${name}.svg`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(svgUrl);
        }
      };
      img.onerror = () => {
        // fallback to SVG
        const a = document.createElement("a");
        a.href = svgUrl;
        a.download = `${name}.svg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(svgUrl);
      };
      img.src = svgUrl;
    } catch (e) {
      console.warn("downloadChart error:", e);
      // Friendly alert instead of throwing
      // eslint-disable-next-line no-alert
      alert("Unable to export chart image. Try opening the chart first and then download.");
    }
  };

  // open enlarged modal
  const openEnlarge = (chart: ChartKey, title: string) => {
    setEnlarged({ open: true, chart, title, wrapperRef: refs[chart] });
    document.body.style.overflow = "hidden";
  };

  const closeEnlarge = () => {
    setEnlarged({ open: false, chart: "overview", title: "" });
    document.body.style.overflow = "";
  };

  return (
    <div className="reports-page container-fluid py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="reports-title mb-0">Reports</h1>
          <div className="text-muted small">Analytics & visualizations</div>
        </div>
        <div className="text-end small text-muted">
          <div>Signed in as: <strong>{user?.name}</strong></div>
        </div>
      </div>

      {loading ? (
        <div className="p-4 text-center"><div className="spinner-border" role="status" /></div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-5 col-lg-4">
              <div className="analytics-card h-100 d-flex flex-column justify-content-center">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="mb-1">User overview</h6>
                    <div className="small text-muted">Quick snapshot of user counts</div>
                  </div>

                  <div className="dropdown">
                    <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <button className="dropdown-item" onClick={() => openEnlarge("overview", "User overview")}>Open large</button>
                      </li>
                      <li>
                        <button className="dropdown-item" onClick={() => downloadChart(refs.overview, "users-overview")}>Download</button>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-3 d-flex align-items-center gap-3">
                  <div className="total-badge">
                    <div className="total-number">{users.length}</div>
                    <div className="total-label">Total users</div>
                  </div>
                  <div className="text-muted">Active, locked and other metrics are shown in charts to the right.</div>
                </div>

                {/* invisible small chart for download preview */}
                <div ref={refs.overview} style={{ position: "absolute", left: -9999, width: 1000, height: 600, overflow: "hidden" }}>
                  <UserAnalyticsCharts users={users} compact chart="all" />
                </div>
              </div>
            </div>

            <div className="col-md-7 col-lg-8">
              <div className="analytics-card h-100">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">Activity summary</h6>
                    <div className="small text-muted">Active / Locked overview</div>
                  </div>

                  <div className="text-end">
                    <div className="btn-group">
                      <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li><button className="dropdown-item" onClick={() => openEnlarge("overview", "Activity summary")}>Open full</button></li>
                        <li><button className="dropdown-item" onClick={() => downloadChart(refs.overview, "activity-summary")}>Download PNG/SVG</button></li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="chart-holder mt-3">
                  <div style={{ width: "100%", height: 120 }}>
                    <UserAnalyticsCharts users={users} compact />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* full charts area */}
          <div className="row g-3">
            <div className="col-lg-6">
              <div className="analytics-card card-stretch position-relative">
                <div className="card-topbar">
                  <h6 className="mb-0">Active vs Inactive</h6>
                  <div className="dropdown">
                    <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown" aria-expanded="false"><i className="bi bi-three-dots-vertical"></i></button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><button className="dropdown-item" onClick={() => openEnlarge("activePie", "Active vs Inactive")}>Open large</button></li>
                      <li><button className="dropdown-item" onClick={() => downloadChart(refs.activePie, "active-vs-inactive")}>Download PNG/SVG</button></li>
                    </ul>
                  </div>
                </div>
                <div className="chart-big chart-fullwidth" ref={refs.activePie}>
                  <UserAnalyticsCharts users={users} chart="activePie" />
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="analytics-card card-stretch position-relative">
                <div className="card-topbar">
                  <h6 className="mb-0">Active vs Locked by Role</h6>
                  <div className="dropdown">
                    <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown" aria-expanded="false"><i className="bi bi-three-dots-vertical"></i></button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><button className="dropdown-item" onClick={() => openEnlarge("roleLocked", "Active vs Locked by Role")}>Open large</button></li>
                      <li><button className="dropdown-item" onClick={() => downloadChart(refs.roleLocked, "role-locked")}>Download PNG/SVG</button></li>
                    </ul>
                  </div>
                </div>

                <div className="chart-big chart-fullwidth" ref={refs.roleLocked}>
                  <UserAnalyticsCharts users={users} chart="roleLocked" />
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="analytics-card chart-tall position-relative">
                <div className="card-topbar">
                  <h6 className="mb-0">Login Attempts Distribution</h6>
                  <div className="dropdown">
                    <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown" aria-expanded="false"><i className="bi bi-three-dots-vertical"></i></button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><button className="dropdown-item" onClick={() => openEnlarge("attemptsBar", "Login Attempts Distribution")}>Open large</button></li>
                      <li><button className="dropdown-item" onClick={() => downloadChart(refs.attemptsBar, "login-attempts")}>Download PNG/SVG</button></li>
                    </ul>
                  </div>
                </div>

                <div className="chart-big chart-fullwidth" ref={refs.attemptsBar}>
                  <UserAnalyticsCharts users={users} chart="attemptsBar" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* enlarged modal */}
      {enlarged.open && (
        <div className="reports-modal-backdrop" role="dialog" aria-modal="true" onClick={closeEnlarge}>
          <div className="reports-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reports-modal-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">{enlarged.title}</h5>
              <div>
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => downloadChart(enlarged.wrapperRef, enlarged.title.replace(/\s+/g, "-").toLowerCase())}
                >
                  Download
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={closeEnlarge}><i className="bi bi-x" /></button>
              </div>
            </div>
            <div className="reports-modal-body">
              <div style={{ width: "100%", height: "60vh", maxHeight: "80vh" }}>
                {/* map 'overview' to chart='all' which UserAnalyticsCharts expects */}
                <UserAnalyticsCharts users={users} chart={enlarged.chart === "overview" ? "all" : (enlarged.chart as any)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
