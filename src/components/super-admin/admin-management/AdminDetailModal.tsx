// src/components/super-admin/admin-management/AdminDetailModal.tsx
import React, { memo, useCallback } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { Admin } from '../../../services/adminManagementService';

interface AdminDetailModalProps {
  admin: Admin;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (adminId: number, isActive: boolean) => void;
}

const AdminDetailModal: React.FC<AdminDetailModalProps> = memo(({
  admin,
  isOpen,
  onClose,
  onStatusUpdate
}) => {
  const { t } = useTranslation();

  const handleStatusToggle = useCallback(() => {
    const confirmMessage = admin.isActive 
      ? `Are you sure you want to deactivate ${admin.name}? This will lock their account.`
      : `Are you sure you want to activate ${admin.name}?`;
    
    if (window.confirm(confirmMessage)) {
      onStatusUpdate(admin.tenantUserId, !admin.isActive);
      onClose();
    }
  }, [admin, onStatusUpdate, onClose]);

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
              <i className="bi bi-shield-check me-2"></i>
              {t('superAdmin.adminManagement.adminDetails') || 'Admin Details'}
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
                      <div className="fw-bold">{admin.name}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Email</label>
                      <div className="fw-bold">{admin.email}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Mobile Number</label>
                      <div className="fw-bold">{admin.mobileNumber || 'N/A'}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Role</label>
                      <div>
                        <span className="badge bg-primary">{admin.role}</span>
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
                      <div className="fw-bold">{admin.tenantName}</div>
                      <small className="text-muted">Code: {admin.tenantCode}</small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Platform User</label>
                      <div className="fw-bold">{admin.platformUserName || 'N/A'}</div>
                      <small className="text-muted">Code: {admin.platformUserCode || 'N/A'}</small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Tenant User Code</label>
                      <div className="fw-bold">{admin.tenantUserCode}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Manager</label>
                      <div className="fw-bold">{admin.managerName || 'No Manager'}</div>
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
                        <span className={`badge ${admin.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Account Locked</label>
                      <div>
                        <span className={`badge ${admin.accountLocked ? 'bg-warning' : 'bg-success'}`}>
                          {admin.accountLocked ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Login Attempts</label>
                      <div className="fw-bold">{admin.loginAttempts}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Last Login</label>
                      <div className="fw-bold">{formatDateTime(admin.lastLoginTime)}</div>
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
                      <div className="fw-bold">{formatDateTime(admin.createdAt)}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Last Updated</label>
                      <div className="fw-bold">{formatDateTime(admin.updatedAt)}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Tenant ID</label>
                      <div className="fw-bold">{admin.tenantId}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Admin ID</label>
                      <div className="fw-bold">{admin.tenantUserId}</div>
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
              className={`btn ${admin.isActive ? 'btn-warning' : 'btn-success'}`}
              onClick={handleStatusToggle}
            >
              <i className={`bi ${admin.isActive ? 'bi-pause-circle' : 'bi-play-circle'} me-1`}></i>
              {admin.isActive ? 'Deactivate' : 'Activate'} Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

AdminDetailModal.displayName = 'AdminDetailModal';

export default AdminDetailModal;