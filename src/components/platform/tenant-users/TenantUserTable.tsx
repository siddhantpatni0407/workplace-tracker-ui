// src/components/platform/tenant-users/TenantUserTable.tsx
import React, { memo, useCallback } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { SuperAdmin } from '../../../services/tenantUserService';

interface TenantUserTableProps {
  users: SuperAdmin[];
  loading: boolean;
  onStatusUpdate: (tenantUserId: number, isActive: boolean) => void;
  onViewDetails: (tenantUserId: number) => void;
}

const TenantUserTable: React.FC<TenantUserTableProps> = memo(({
  users,
  loading,
  onStatusUpdate,
  onViewDetails
}) => {
  const { t } = useTranslation();

  const handleStatusToggle = useCallback((user: SuperAdmin) => {
    const confirmMessage = user.isActive 
      ? `Are you sure you want to deactivate ${user.name}? This will lock their account.`
      : `Are you sure you want to activate ${user.name}?`;
    
    if (window.confirm(confirmMessage)) {
      onStatusUpdate(user.tenantUserId, !user.isActive);
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

  if (loading && users.length === 0) {
    return (
      <div className="table-loading">
        <div className="d-flex justify-content-center align-items-center p-5">
          <div className="spinner-border text-primary me-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span>Loading tenant users...</span>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="table-empty">
        <div className="text-center p-5">
          <i className="bi bi-people display-1 text-muted"></i>
          <h3 className="mt-3 text-muted">No Tenant Users Found</h3>
          <p className="text-muted">
            {t('platform.tenantUsers.noUsers') || 'No Super Admin users match the current filters.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-user-table">
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>{t('common.name') || 'Name'}</th>
              <th>{t('common.email') || 'Email'}</th>
              <th>{t('platform.tenantUsers.tenant') || 'Tenant'}</th>
              <th>{t('common.role') || 'Role'}</th>
              <th>{t('common.status') || 'Status'}</th>
              <th>{t('platform.tenantUsers.lastLogin') || 'Last Login'}</th>
              <th>{t('common.actions') || 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.tenantUserId}>
                <td>
                  <div className="user-info">
                    <div className="user-name font-weight-bold">{user.name}</div>
                    {user.mobileNumber && (
                      <small className="text-muted">{user.mobileNumber}</small>
                    )}
                  </div>
                </td>
                <td>
                  <span className="user-email">{user.email}</span>
                </td>
                <td>
                  <div className="tenant-info">
                    <div className="tenant-name">{user.tenantName}</div>
                    <small className="text-muted">{user.tenantCode}</small>
                  </div>
                </td>
                <td>
                  <span className="badge bg-info">{user.role}</span>
                </td>
                <td>
                  <div className="status-info">
                    <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                      {user.isActive ? (t('common.active') || 'Active') : (t('common.inactive') || 'Inactive')}
                    </span>
                    {user.accountLocked && (
                      <div>
                        <small className="text-warning">
                          <i className="bi bi-lock-fill"></i> Locked
                        </small>
                      </div>
                    )}
                    {user.loginAttempts > 0 && (
                      <div>
                        <small className="text-muted">
                          Attempts: {user.loginAttempts}
                        </small>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className="last-login">
                    {formatDateTime(user.lastLoginTime)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => onViewDetails(user.tenantUserId)}
                      title="View Details"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button
                      className={`btn btn-sm ${user.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                      onClick={() => handleStatusToggle(user)}
                      title={user.isActive ? 'Deactivate User' : 'Activate User'}
                      disabled={loading}
                    >
                      <i className={`bi ${user.isActive ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && users.length > 0 && (
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

TenantUserTable.displayName = 'TenantUserTable';

export default TenantUserTable;