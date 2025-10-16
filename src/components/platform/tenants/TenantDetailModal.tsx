/**
 * Tenant Detail Modal Component
 * Displays detailed information about a tenant including statistics
 */

import React, { useState, useEffect } from 'react';
import { TenantDTO, TenantStats } from '../../../models/Tenant';
import { getTenantStats } from '../../../services/tenantService';
import { LoadingSpinner, Alert } from '../../ui';
import { useTranslation } from '../../../hooks/useTranslation';

interface TenantDetailModalProps {
  show: boolean;
  onHide: () => void;
  tenant: TenantDTO | null;
}

const TenantDetailModal: React.FC<TenantDetailModalProps> = ({
  show,
  onHide,
  tenant
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenantStats, setTenantStats] = useState<TenantStats | null>(null);

  // Load tenant statistics when modal opens
  useEffect(() => {
    if (show && tenant) {
      loadTenantStats();
    }
  }, [show, tenant]);

  const loadTenantStats = async () => {
    if (!tenant) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await getTenantStats(tenant.tenantId);
      
      if (response.status === 'SUCCESS' && response.data) {
        setTenantStats(response.data);
      } else {
        setError('Failed to load tenant statistics');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tenant statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!show || !tenant) {
    return null;
  }

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-building me-2"></i>
                Tenant Details - {tenant.tenantName}
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onHide}
              ></button>
            </div>

            <div className="modal-body">
              {error && (
                <Alert 
                  variant="error" 
                  message={error} 
                  onClose={() => setError(null)}
                />
              )}

              {loading ? (
                <div className="text-center py-5">
                  <LoadingSpinner />
                  <p className="mt-3 text-muted">Loading tenant details...</p>
                </div>
              ) : (
                <div className="row g-4">
                  {/* Basic Information */}
                  <div className="col-lg-6">
                    <div className="card h-100">
                      <div className="card-header">
                        <h6 className="card-title mb-0">
                          <i className="bi bi-info-circle me-2"></i>
                          Basic Information
                        </h6>
                      </div>
                      <div className="card-body">
                        <dl className="row">
                          <dt className="col-sm-4">Tenant Name:</dt>
                          <dd className="col-sm-8">{tenant.tenantName}</dd>

                          <dt className="col-sm-4">Tenant Code:</dt>
                          <dd className="col-sm-8">
                            <code className="text-primary">{tenant.tenantCode}</code>
                          </dd>

                          <dt className="col-sm-4">Status:</dt>
                          <dd className="col-sm-8">
                            <span className={`badge ${tenant.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {tenant.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </dd>

                          <dt className="col-sm-4">Created Date:</dt>
                          <dd className="col-sm-8">{formatDateTime(tenant.createdDate)}</dd>

                          <dt className="col-sm-4">Modified Date:</dt>
                          <dd className="col-sm-8">{formatDateTime(tenant.modifiedDate)}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Information */}
                  <div className="col-lg-6">
                    <div className="card h-100">
                      <div className="card-header">
                        <h6 className="card-title mb-0">
                          <i className="bi bi-credit-card me-2"></i>
                          Subscription Information
                        </h6>
                      </div>
                      <div className="card-body">
                        <dl className="row">
                          <dt className="col-sm-4">Plan Name:</dt>
                          <dd className="col-sm-8">
                            <span className="badge bg-info-subtle text-info">
                              {tenant.subscriptionName}
                            </span>
                          </dd>

                          <dt className="col-sm-4">Plan Code:</dt>
                          <dd className="col-sm-8">
                            <code>{tenant.subscriptionCode}</code>
                          </dd>

                          <dt className="col-sm-4">Subscription ID:</dt>
                          <dd className="col-sm-8">{tenant.appSubscriptionId}</dd>

                          <dt className="col-sm-4">Start Date:</dt>
                          <dd className="col-sm-8">{formatDate(tenant.subscriptionStartDate)}</dd>

                          <dt className="col-sm-4">End Date:</dt>
                          <dd className="col-sm-8">{formatDate(tenant.subscriptionEndDate)}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="col-lg-6">
                    <div className="card h-100">
                      <div className="card-header">
                        <h6 className="card-title mb-0">
                          <i className="bi bi-person-lines-fill me-2"></i>
                          Contact Information
                        </h6>
                      </div>
                      <div className="card-body">
                        <dl className="row">
                          <dt className="col-sm-4">Email:</dt>
                          <dd className="col-sm-8">
                            {tenant.contactEmail ? (
                              <a href={`mailto:${tenant.contactEmail}`} className="text-decoration-none">
                                {tenant.contactEmail}
                              </a>
                            ) : (
                              <span className="text-muted">Not provided</span>
                            )}
                          </dd>

                          <dt className="col-sm-4">Phone:</dt>
                          <dd className="col-sm-8">
                            {tenant.contactPhone ? (
                              <a href={`tel:${tenant.contactPhone}`} className="text-decoration-none">
                                {tenant.contactPhone}
                              </a>
                            ) : (
                              <span className="text-muted">Not provided</span>
                            )}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>

                  {/* User Statistics */}
                  <div className="col-lg-6">
                    <div className="card h-100">
                      <div className="card-header">
                        <h6 className="card-title mb-0">
                          <i className="bi bi-people me-2"></i>
                          User Statistics
                        </h6>
                      </div>
                      <div className="card-body">
                        {tenantStats ? (
                          <dl className="row">
                            <dt className="col-sm-6">Total Users:</dt>
                            <dd className="col-sm-6">
                              <span className="badge bg-primary-subtle text-primary fs-6">
                                {tenantStats.totalUsers || 0}
                              </span>
                            </dd>

                            <dt className="col-sm-6">Active Users:</dt>
                            <dd className="col-sm-6">
                              <span className="badge bg-success-subtle text-success fs-6">
                                {tenantStats.activeUsers || 0}
                              </span>
                            </dd>

                            <dt className="col-sm-6">Inactive Users:</dt>
                            <dd className="col-sm-6">
                              <span className="badge bg-secondary-subtle text-secondary fs-6">
                                {(tenantStats.totalUsers || 0) - (tenantStats.activeUsers || 0)}
                              </span>
                            </dd>
                          </dl>
                        ) : error ? (
                          <div className="text-center text-muted">
                            <i className="bi bi-exclamation-triangle display-6"></i>
                            <p className="mt-2">Failed to load statistics</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <LoadingSpinner size="sm" />
                            <p className="mt-2 text-muted">Loading statistics...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="card-title mb-0">
                          <i className="bi bi-lightning me-2"></i>
                          Quick Actions
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="d-flex flex-wrap gap-2">
                          <button className="btn btn-outline-primary btn-sm">
                            <i className="bi bi-pencil me-1"></i>
                            Edit Tenant
                          </button>
                          <button className="btn btn-outline-info btn-sm">
                            <i className="bi bi-people me-1"></i>
                            Manage Users
                          </button>
                          <button className={`btn btn-outline-${tenant.isActive ? 'warning' : 'success'} btn-sm`}>
                            <i className={`bi bi-toggle-${tenant.isActive ? 'off' : 'on'} me-1`}></i>
                            {tenant.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="btn btn-outline-secondary btn-sm">
                            <i className="bi bi-graph-up me-1"></i>
                            View Reports
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onHide}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default TenantDetailModal;