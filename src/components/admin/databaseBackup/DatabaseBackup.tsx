// src/components/admin/databaseBackup/DatabaseBackup.tsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ErrorBoundary } from "../../ui";
import Header from "../../common/header/Header";
import backupService, { BackupRecord, BackupOptions } from "../../../services/backupService";
import "./DatabaseBackup.css";

const DatabaseBackup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [creating, setCreating] = useState(false);
  const [backupOptions, setBackupOptions] = useState<BackupOptions>({
    type: "sql",
    databaseName: "",
    schemaName: ""
  });

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const response = await backupService.getBackups();
      setBackups(response || []);
    } catch (error) {
      console.error("Failed to load backups:", error);
      toast.error("Failed to load backup history");
      // Fallback to empty array if API fails
      setBackups([]);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    try {
      const options: BackupOptions = {
        type: backupOptions.type,
        ...(backupOptions.databaseName && { databaseName: backupOptions.databaseName }),
        ...(backupOptions.schemaName && { schemaName: backupOptions.schemaName })
      };

      await backupService.createBackup(options);
      toast.success("Database backup created successfully!");
      
      // Reload backups to show the new one
      await loadBackups();
    } catch (error) {
      console.error("Failed to create backup:", error);
      toast.error("Failed to create database backup");
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: BackupRecord['status']) => {
    switch (status) {
      case "completed":
        return <span className="badge bg-success">Completed</span>;
      case "in-progress":
        return <span className="badge bg-warning">In Progress</span>;
      case "failed":
        return <span className="badge bg-danger">Failed</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const getTypeBadge = (type: BackupRecord['type']) => {
    return type === "manual" 
      ? <span className="badge bg-primary">Manual</span>
      : <span className="badge bg-info">Automatic</span>;
  };

  const totalBackups = backups.length;
  const completedBackups = backups.filter(b => b.status === "completed").length;
  const totalSize = backups.reduce((sum, backup) => {
    const sizeInMB = parseFloat(backup.size.replace(/[^\d.]/g, ''));
    return sum + (isNaN(sizeInMB) ? 0 : sizeInMB);
  }, 0);

  return (
    <ErrorBoundary>
      <div className="db-container-fluid">
        <Header
          title="Database Backup"
          subtitle="View database backup history and status"
        />

        <div className="row db-actions-row">
          <div className="col-12 text-end">
            <button
              className="btn btn-primary me-2"
              onClick={createBackup}
              disabled={creating || loading}
            >
              {creating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creating Backup...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle me-2"></i>
                  Create Backup
                </>
              )}
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={loadBackups}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Refreshing...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        {/* Backup Configuration */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="card-title mb-0">Backup Configuration</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="backupType" className="form-label">Backup Type</label>
                <select
                  id="backupType"
                  className="form-select"
                  value={backupOptions.type}
                  onChange={(e) => setBackupOptions(prev => ({ ...prev, type: e.target.value as "sql" | "json" | "csv" }))}
                >
                  <option value="sql">SQL Dump</option>
                  <option value="json">JSON Export</option>
                  <option value="csv">CSV Export</option>
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="databaseName" className="form-label">Database Name (Optional)</label>
                <input
                  type="text"
                  id="databaseName"
                  className="form-control"
                  placeholder="Enter database name"
                  value={backupOptions.databaseName}
                  onChange={(e) => setBackupOptions(prev => ({ ...prev, databaseName: e.target.value }))}
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="schemaName" className="form-label">Schema Name (Optional)</label>
                <input
                  type="text"
                  id="schemaName"
                  className="form-control"
                  placeholder="Enter schema name"
                  value={backupOptions.schemaName}
                  onChange={(e) => setBackupOptions(prev => ({ ...prev, schemaName: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card db-stats-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="db-stats-number">{totalBackups}</h3>
                    <p className="db-stats-label">Total Backups</p>
                  </div>
                  <div className="db-stats-icon bg-primary">
                    <i className="bi bi-database"></i>
                  </div>
                </div>
                <div className="db-stats-progress">
                  <div className="progress-bar bg-primary" style={{ width: "100%" }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card db-stats-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="db-stats-number">{completedBackups}</h3>
                    <p className="db-stats-label">Completed</p>
                  </div>
                  <div className="db-stats-icon bg-success">
                    <i className="bi bi-check-circle"></i>
                  </div>
                </div>
                <div className="db-stats-progress">
                  <div 
                    className="progress-bar bg-success" 
                    style={{ width: totalBackups > 0 ? `${(completedBackups / totalBackups) * 100}%` : "0%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card db-stats-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="db-stats-number">{totalSize.toFixed(1)} MB</h3>
                    <p className="db-stats-label">Total Size</p>
                  </div>
                  <div className="db-stats-icon bg-info">
                    <i className="bi bi-hdd"></i>
                  </div>
                </div>
                <div className="db-stats-progress">
                  <div className="progress-bar bg-info" style={{ width: "100%" }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card db-stats-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="db-stats-number">
                      {backups.filter(b => new Date(b.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                    </h3>
                    <p className="db-stats-label">Recent (24h)</p>
                  </div>
                  <div className="db-stats-icon bg-warning">
                    <i className="bi bi-clock"></i>
                  </div>
                </div>
                <div className="db-stats-progress">
                  <div className="progress-bar bg-warning" style={{ width: "100%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Backup List */}
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Backup History</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading backup history...</p>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-database-exclamation fs-1 text-muted"></i>
                <h5 className="mt-3 text-muted">No Backups Found</h5>
                <p className="text-muted">No database backups are available at this time.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th>Size</th>
                      <th>Created</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((backup) => (
                      <tr key={backup.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-file-earmark-zip me-2 text-primary"></i>
                            <span className="fw-medium">{backup.fileName}</span>
                          </div>
                        </td>
                        <td className="text-muted">{backup.size}</td>
                        <td className="text-muted">{formatDate(backup.createdAt)}</td>
                        <td>{getTypeBadge(backup.type)}</td>
                        <td>{getStatusBadge(backup.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DatabaseBackup;
