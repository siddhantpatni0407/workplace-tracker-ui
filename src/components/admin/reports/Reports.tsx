// src/components/admin/reports/Reports.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import axiosInstance from "../../../services/axiosInstance";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import { useAuth } from "../../../context/AuthContext";
import UserAnalyticsCharts, { UserRow } from "./UserAnalyticsCharts";
import "./Reports.css";

type ChartKey = "activePie" | "roleLocked" | "attemptsBar" | "overview" | "newUsers" | "domains";
type Ref = React.RefObject<HTMLDivElement | null>;

const Reports: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // enlarged modal
    const [enlarged, setEnlarged] = useState<{
        open: boolean;
        chart: ChartKey;
        title: string;
        wrapperRef?: Ref;
    }>({ open: false, chart: "overview", title: "" });

    // refs for chart wrappers (we will look for `svg` inside these wrappers)
    const refs: Record<ChartKey, Ref> = {
        overview: useRef<HTMLDivElement | null>(null),
        activePie: useRef<HTMLDivElement | null>(null),
        roleLocked: useRef<HTMLDivElement | null>(null),
        attemptsBar: useRef<HTMLDivElement | null>(null),
        newUsers: useRef<HTMLDivElement | null>(null),
        domains: useRef<HTMLDivElement | null>(null),
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

    // ---------------------------
    // chart export helper (SVG -> canvas -> PNG). Will fall back to SVG download.
    // ---------------------------
    const downloadChart = async (ref: Ref | undefined, name = "chart") => {
        try {
            if (!ref || !ref.current) throw new Error("Chart element not available");
            const svg = ref.current.querySelector("svg") as SVGSVGElement | null;
            if (!svg) throw new Error("SVG not found for this chart");

            // Serialize
            const serializer = new XMLSerializer();
            let source = serializer.serializeToString(svg);

            // ensure namespaces
            if (!source.includes('xmlns="http://www.w3.org/2000/svg"')) {
                source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            if (!source.includes('xmlns:xlink="http://www.w3.org/1999/xlink"')) {
                source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
            }

            // embed computed font styles for better fidelity (simple approach)
            const styleSheets = Array.from(document.styleSheets)
                .map((s) => {
                    try {
                        return Array.from((s as CSSStyleSheet).cssRules || []).map((r) => r.cssText).join("\n");
                    } catch {
                        return "";
                    }
                })
                .filter(Boolean)
                .join("\n");

            if (styleSheets) {
                // anchor at beginning to avoid accidental later replacements
                source = source.replace(/^<svg/, `<svg><style>${styleSheets}</style>`);
            }

            const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
            const svgUrl = URL.createObjectURL(svgBlob);

            // get svg dimensions: prefer viewBox, otherwise bounding box
            let svgW = svg.getAttribute("width");
            let svgH = svg.getAttribute("height");
            let viewBox = svg.getAttribute("viewBox");
            let w = 800, h = 600;
            if (viewBox) {
                const parts = viewBox.split(/\s+|,/).map(Number).filter((n) => !Number.isNaN(n));
                if (parts.length === 4) {
                    w = parts[2];
                    h = parts[3];
                }
            } else if (svgW && svgH) {
                w = parseFloat(svgW) || w;
                h = parseFloat(svgH) || h;
            } else {
                const bbox = svg.getBoundingClientRect();
                w = Math.max(200, Math.round(bbox.width || w));
                h = Math.max(200, Math.round(bbox.height || h));
            }

            // High dpi for crisp images
            const ratio = Math.max(1, window.devicePixelRatio || 1);
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                try {
                    const canvas = document.createElement("canvas");
                    canvas.width = Math.round(w * ratio);
                    canvas.height = Math.round(h * ratio);
                    const ctx = canvas.getContext("2d");
                    if (!ctx) throw new Error("Cannot get canvas context");
                    ctx.scale(ratio, ratio);
                    // white background
                    ctx.fillStyle = "#fff";
                    ctx.fillRect(0, 0, w, h);
                    ctx.drawImage(img, 0, 0, w, h);
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
                            // fallback to SVG
                            const a = document.createElement("a");
                            a.href = svgUrl;
                            a.download = `${name}.svg`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            URL.revokeObjectURL(svgUrl);
                        }
                    }, "image/png");
                } catch (_) {
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
            // eslint-disable-next-line no-alert
            alert("Unable to export chart image. Try opening the chart first and then download.");
        }
    };

    const openEnlarge = (chart: ChartKey, title: string) => {
        setEnlarged({ open: true, chart, title, wrapperRef: refs[chart] });
        document.body.style.overflow = "hidden";
    };
    const closeEnlarge = () => {
        setEnlarged({ open: false, chart: "overview", title: "" });
        document.body.style.overflow = "";
    };

    return (
        <div className="reports-page container-fluid py-3 px-3">
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
                    {/* top row: overview + compact activity */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-5 col-lg-4">
                            <div className="analytics-card h-100 d-flex flex-column justify-content-center position-relative">
                                <div className="d-flex align-items-start justify-content-between">
                                    <div>
                                        <h6 className="mb-1">User overview</h6>
                                        <div className="small text-muted">Quick snapshot & key KPIs</div>
                                    </div>

                                    <div className="dropdown">
                                        <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i className="bi bi-three-dots-vertical"></i>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><button className="dropdown-item" onClick={() => openEnlarge("overview", "User overview")}>Open large</button></li>
                                            <li><button className="dropdown-item" onClick={() => downloadChart(refs.overview, "users-overview")}>Download</button></li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-3 d-flex align-items-center gap-4">
                                    <div className="total-badge">
                                        <div className="total-number" aria-live="polite">{users.length}</div>
                                        <div>
                                            <div className="total-label">Total users</div>
                                            <div className="small text-muted mt-1">
                                                Active: <strong>{users.filter(u => u.isActive).length}</strong> · Locked: <strong>{users.filter(u => u.isAccountLocked).length}</strong> · Admins: <strong>{users.filter(u => u.role === "ADMIN").length}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* hidden preview container for download (full version) */}
                                <div ref={refs.overview} style={{ position: "absolute", left: -99999, width: 1200, height: 700, overflow: "hidden" }}>
                                    <UserAnalyticsCharts users={users} chart="all" compact />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-7 col-lg-8">
                            <div className="analytics-card h-100">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 className="mb-1">Activity summary</h6>
                                        <div className="small text-muted">Active / Locked overview — quick glance</div>
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
                                    <div style={{ width: "100%", height: 140 }}>
                                        <UserAnalyticsCharts users={users} compact />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* the main charts */}
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

                        {/* New charts row: small domain and new-users timeline */}
                        <div className="col-lg-6">
                            <div className="analytics-card position-relative">
                                <div className="card-topbar">
                                    <h6 className="mb-0">New users (by last login / signup time)</h6>
                                    <div className="dropdown">
                                        <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown"><i className="bi bi-three-dots-vertical"></i></button>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><button className="dropdown-item" onClick={() => openEnlarge("newUsers", "New users over time")}>Open large</button></li>
                                            <li><button className="dropdown-item" onClick={() => downloadChart(refs.newUsers, "new-users-over-time")}>Download</button></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="chart-big chart-fullwidth" ref={refs.newUsers}>
                                    <UserAnalyticsCharts users={users} chart="newUsers" />
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="analytics-card position-relative">
                                <div className="card-topbar">
                                    <h6 className="mb-0">Top email domains</h6>
                                    <div className="dropdown">
                                        <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown"><i className="bi bi-three-dots-vertical"></i></button>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><button className="dropdown-item" onClick={() => openEnlarge("domains", "Top email domains")}>Open large</button></li>
                                            <li><button className="dropdown-item" onClick={() => downloadChart(refs.domains, "top-email-domains")}>Download</button></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="chart-big chart-fullwidth" ref={refs.domains}>
                                    <UserAnalyticsCharts users={users} chart="domains" />
                                </div>
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="analytics-card chart-tall position-relative">
                                <div className="card-topbar">
                                    <h6 className="mb-0">Login Attempts Distribution</h6>
                                    <div className="dropdown">
                                        <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown"><i className="bi bi-three-dots-vertical"></i></button>
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
                            <div style={{ width: "100%", height: "63vh", maxHeight: "84vh" }}>
                                {/* map overview -> all */}
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
