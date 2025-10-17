// src/components/super-admin/admin-management/AdminTable.tsx
import React, { memo, useCallback } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { Admin } from '../../../services/adminManagementService';

interface AdminTableProps {
  admins: Admin[];
  loading: boolean;
  onStatusUpdate: (adminId: number, isActive: boolean) => void;
  onViewDetails: (adminId: number) => void;
}

const AdminTable: React.FC<AdminTableProps> = memo(({
  admins,
  loading,
  onStatusUpdate,
  onViewDetails
}) => {
  const { t } = useTranslation();

  const handleStatusToggle = useCallback((admin: Admin) => {
    const confirmMessage = admin.isActive 
      ? `Are you sure you want to deactivate ${admin.name}? This will lock their account.`
      : `Are you sure you want to activate ${admin.name}?`;
    
    if (window.confirm(confirmMessage)) {
      onStatusUpdate(admin.tenantUserId, !admin.isActive);
    }
  }, [onStatusUpdate]);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  }, []);

  const formatDateTime = useCallback((dateString: string) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  }, []);

  if (loading && admins.length === 0) {
    return (
      <div className="table-loading">
        <div className="d-flex justify-content-center align-items-center p-5">
          <div className="spinner-border text-primary me-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span>Loading admins...</span>
        </div>
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <div className="table-empty">
        <div className="text-center p-5">
          <i className="bi bi-shield-check display-1 text-muted"></i>
          <h3 className="mt-3 text-muted">No Admins Found</h3>
          <p className="text-muted">
            {t('superAdmin.adminManagement.noAdmins') || 'No Admin users match the current filters.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-table">
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>{t('common.name') || 'Name'}</th>
              <th>{t('common.email') || 'Email'}</th>
              <th>{t('superAdmin.adminManagement.manager') || 'Manager'}</th>
              <th>{t('common.role') || 'Role'}</th>
              <th>{t('common.status') || 'Status'}</th>
              <th>{t('superAdmin.adminManagement.lastLogin') || 'Last Login'}</th>
              <th>{t('common.actions') || 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.tenantUserId}>
                <td>
                  <div className="admin-info">
                    <div className="admin-name font-weight-bold">{admin.name}</div>
                    {admin.mobileNumber && (
                      <small className="text-muted">{admin.mobileNumber}</small>
                    )}
                  </div>
                </td>
                <td>
                  <span className="admin-email">{admin.email}</span>
                </td>
                <td>
                  <div className="manager-info">
                    <span className="manager-name">{admin.managerName || 'No Manager'}</span>
                  </div>
                </td>
                <td>
                  <span className="badge bg-primary">{admin.role}</span>
                </td>
                <td>
                  <div className="status-info">
                    <span className={`badge ${admin.isActive ? 'bg-success' : 'bg-danger'}`}>
                      {admin.isActive ? (t('common.active') || 'Active') : (t('common.inactive') || 'Inactive')}
                    </span>
                    {admin.accountLocked && (
                      <div>
                        <small className="text-warning">
                          <i className="bi bi-lock-fill"></i> Locked
                        </small>
                      </div>
                    )}
                    {admin.loginAttempts > 0 && (
                      <div>
                        <small className="text-muted">
                          Attempts: {admin.loginAttempts}
                        </small>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className="last-login">
                    {formatDateTime(admin.lastLoginTime)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => onViewDetails(admin.tenantUserId)}
                      title="View Details"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button
                      className={`btn btn-sm ${admin.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                      onClick={() => handleStatusToggle(admin)}
                      title={admin.isActive ? 'Deactivate Admin' : 'Activate Admin'}
                      disabled={loading}
                    >
                      <i className={`bi ${admin.isActive ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && admins.length > 0 && (
        <div className="table-overlay">
          <div className="loading-indicator">
            <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Updating...
          </div>
        </div>
      )}
    </div>
  );
});

AdminTable.displayName = 'AdminTable';

export default AdminTable;