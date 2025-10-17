// src/components/platform/tenant-users/TenantUserDetailModal.tsx
import React, { memo, useCallback } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { SuperAdmin } from '../../../services/tenantUserService';

interface TenantUserDetailModalProps {
  user: SuperAdmin;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (tenantUserId: number, isActive: boolean) => void;
}

const TenantUserDetailModal: React.FC<TenantUserDetailModalProps> = memo(({
  user,
  isOpen,
  onClose,
  onStatusUpdate
}) => {
  const { t } = useTranslation();

  const handleStatusToggle = useCallback(() => {
    const confirmMessage = user.isActive 
      ? `Are you sure you want to deactivate ${user.name}? This will lock their account.`
      : `Are you sure you want to activate ${user.name}?`;
    
    if (window.confirm(confirmMessage)) {
      onStatusUpdate(user.tenantUserId, !user.isActive);
      onClose();
    }
  }, [user, onStatusUpdate, onClose]);

  const formatDateTime = useCallback((dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-person-circle me-2"></i>
              {t('platform.tenantUsers.userDetails') || 'Tenant User Details'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body">
            <div className="row">
              {/* Personal Information */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-person-fill me-2"></i>
                      Personal Information
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label text-muted">Name</label>
                      <div className="fw-bold">{user.name}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Email</label>
                      <div className="fw-bold">{user.email}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Mobile Number</label>
                      <div className="fw-bold">{user.mobileNumber || 'N/A'}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Role</label>
                      <div>
                        <span className="badge bg-info">{user.role}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tenant & Platform Information */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-building me-2"></i>
                      Tenant & Platform Information
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label text-muted">Tenant</label>
                      <div className="fw-bold">{user.tenantName}</div>
                      <small className="text-muted">Code: {user.tenantCode}</small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Platform User</label>
                      <div className="fw-bold">{user.platformUserName || 'N/A'}</div>
                      <small className="text-muted">Code: {user.platformUserCode || 'N/A'}</small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Tenant User Code</label>
                      <div className="fw-bold">{user.tenantUserCode}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Manager</label>
                      <div className="fw-bold">{user.managerName || 'No Manager'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="col-md-6 mt-3">
                <div className="card h-100">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-shield-check me-2"></i>
                      Account Status
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label text-muted">Status</label>
                      <div>
                        <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Account Locked</label>
                      <div>
                        <span className={`badge ${user.accountLocked ? 'bg-warning' : 'bg-success'}`}>
                          {user.accountLocked ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Login Attempts</label>
                      <div className="fw-bold">{user.loginAttempts}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Last Login</label>
                      <div className="fw-bold">{formatDateTime(user.lastLoginTime)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="col-md-6 mt-3">
                <div className="card h-100">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-clock me-2"></i>
                      Timestamps
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label text-muted">Created At</label>
                      <div className="fw-bold">{formatDateTime(user.createdAt)}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Last Updated</label>
                      <div className="fw-bold">{formatDateTime(user.updatedAt)}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Tenant ID</label>
                      <div className="fw-bold">{user.tenantId}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Tenant User ID</label>
                      <div className="fw-bold">{user.tenantUserId}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              <i className="bi bi-x-circle me-1"></i>
              Close
            </button>
            <button
              type="button"
              className={`btn ${user.isActive ? 'btn-warning' : 'btn-success'}`}
              onClick={handleStatusToggle}
            >
              <i className={`bi ${user.isActive ? 'bi-pause-circle' : 'bi-play-circle'} me-1`}></i>
              {user.isActive ? 'Deactivate' : 'Activate'} User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

TenantUserDetailModal.displayName = 'TenantUserDetailModal';

export default TenantUserDetailModal;