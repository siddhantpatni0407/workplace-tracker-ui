/**
 * Tenant Subscription Management Component
 * Manages subscription updates for tenants in the platform
 */

import React, { useState, useEffect, useCallback } from 'react';
import { usePlatformAuth } from '../../../context/PlatformAuthContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { LoadingSpinner, Alert, Button } from '../../ui';
import Header from '../../common/Header/Header';
import { TenantDTO, Subscription } from '../../../models/Tenant';
import { SubscriptionStatus, SubscriptionTier, SUBSCRIPTION_TIER_CONFIG } from '../../../enums';
import { getSubscriptionPlan } from '../../../constants';
import {
  getTenants,
  getAllSubscriptions,
  updateTenantSubscription,
  searchTenants
} from '../../../services/tenantService';
import SubscriptionComparisonModal from './SubscriptionComparisonModal';
import './TenantSubscriptionManagement.css';

interface TenantSubscriptionProps {
  tenant: TenantDTO;
  subscriptions: Subscription[];
  onUpdate: (updatedTenant: TenantDTO) => void;
}

interface SubscriptionUpdateRequest {
  tenantCode: string;
  currentSubscriptionCode: string;
  newSubscriptionCode: string;
}

const TenantSubscriptionRow: React.FC<TenantSubscriptionProps> = ({
  tenant,
  subscriptions,
  onUpdate
}) => {
  const [selectedSubscription, setSelectedSubscription] = useState(tenant.subscriptionCode);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubscriptionUpdate = async () => {
    if (selectedSubscription === tenant.subscriptionCode) {
      setError('Please select a different subscription plan');
      return;
    }

    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await updateTenantSubscription(tenant.tenantCode, selectedSubscription);
      
      if (response.status === 'SUCCESS' && response.data) {
        setSuccess(`Subscription updated successfully to ${response.data.subscriptionName}`);
        onUpdate(response.data);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to update subscription');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update subscription');
      // Reset selection on error
      setSelectedSubscription(tenant.subscriptionCode);
    } finally {
      setUpdating(false);
    }
  };

  const getCurrentSubscription = () => {
    return subscriptions.find(sub => sub.subscriptionCode === tenant.subscriptionCode);
  };

  const getSelectedSubscription = () => {
    return subscriptions.find(sub => sub.subscriptionCode === selectedSubscription);
  };

  const isUpgrade = () => {
    const current = getCurrentSubscription();
    const selected = getSelectedSubscription();
    if (!current || !selected) return false;
    
    const tierOrder = ['FREE', 'BASIC', 'PRO', 'PREMIUM', 'ENTERPRISE'];
    const currentIndex = tierOrder.indexOf(current.subscriptionCode);
    const selectedIndex = tierOrder.indexOf(selected.subscriptionCode);
    
    return selectedIndex > currentIndex;
  };

  const isDowngrade = () => {
    const current = getCurrentSubscription();
    const selected = getSelectedSubscription();
    if (!current || !selected) return false;
    
    const tierOrder = ['FREE', 'BASIC', 'PRO', 'PREMIUM', 'ENTERPRISE'];
    const currentIndex = tierOrder.indexOf(current.subscriptionCode);
    const selectedIndex = tierOrder.indexOf(selected.subscriptionCode);
    
    return selectedIndex < currentIndex;
  };

  return (
    <>
      <tr className={updating ? 'table-warning' : ''}>
        {/* Tenant Details */}
        <td>
          <div className="d-flex flex-column">
            <strong className="text-primary">{tenant.tenantName}</strong>
            <small className="text-muted">Code: {tenant.tenantCode}</small>
            <div className="mt-1">
              <span className={`badge ${tenant.isActive ? 'bg-success' : 'bg-secondary'} me-2`}>
                {tenant.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {tenant.contactEmail && (
              <small className="text-muted mt-1">
                <i className="fas fa-envelope me-1"></i>
                {tenant.contactEmail}
              </small>
            )}
            {tenant.contactPhone && (
              <small className="text-muted">
                <i className="fas fa-phone me-1"></i>
                {tenant.contactPhone}
              </small>
            )}
          </div>
        </td>

        {/* Current Subscription */}
        <td>
          <div className="d-flex flex-column">
            <strong className="text-success">{tenant.subscriptionName}</strong>
            <small className="text-muted">Code: {tenant.subscriptionCode}</small>
          </div>
        </td>

        {/* Validity */}
        <td>
          <span className="fw-semibold">
            {tenant.subscriptionEndDate 
              ? new Date(tenant.subscriptionEndDate).toLocaleDateString()
              : 'N/A'
            }
          </span>
        </td>

        {/* New Subscription Selection */}
        <td>
          <select
            className="form-select form-select-sm"
            value={selectedSubscription}
            onChange={(e) => setSelectedSubscription(e.target.value)}
            disabled={updating || !tenant.isActive}
          >
            {subscriptions.map((subscription) => (
              <option key={subscription.appSubscriptionId} value={subscription.subscriptionCode}>
                {subscription.subscriptionName} ({subscription.subscriptionCode})
              </option>
            ))}
          </select>
          
          {/* Change Type Indicator */}
          {selectedSubscription !== tenant.subscriptionCode && (
            <div className="mt-1">
              {isUpgrade() && (
                <small className="text-success">
                  <i className="fas fa-arrow-up me-1"></i>
                  Upgrade
                </small>
              )}
              {isDowngrade() && (
                <small className="text-warning">
                  <i className="fas fa-arrow-down me-1"></i>
                  Downgrade
                </small>
              )}
            </div>
          )}
        </td>

        {/* Actions */}
        <td>
          <div className="d-flex gap-1 flex-wrap">
            <Button
              variant={isUpgrade() ? 'success' : isDowngrade() ? 'warning' : 'primary'}
              size="sm"
              onClick={handleSubscriptionUpdate}
              disabled={
                updating || 
                !tenant.isActive || 
                selectedSubscription === tenant.subscriptionCode
              }
              isLoading={updating}
            >
              {updating ? (
                <>
                  <i className="fas fa-spinner fa-spin me-1"></i>
                  Updating
                </>
              ) : (
                <>
                  <i className="fas fa-sync me-1"></i>
                  Update
                </>
              )}
            </Button>
            
            {selectedSubscription !== tenant.subscriptionCode && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setSelectedSubscription(tenant.subscriptionCode)}
                disabled={updating}
              >
                <i className="fas fa-undo me-1"></i>
                Reset
              </Button>
            )}
          </div>
        </td>
      </tr>

      {/* Error/Success Messages Row */}
      {(error || success) && (
        <tr>
          <td colSpan={5} className="p-0">
            {error && (
              <Alert variant="error" message={error} className="mb-0 rounded-0" />
            )}
            {success && (
              <Alert variant="success" message={success} className="mb-0 rounded-0" />
            )}
          </td>
        </tr>
      )}
    </>
  );
};

const TenantSubscriptionManagement: React.FC = () => {
  const { platformUser, isPlatformAuthenticated } = usePlatformAuth();
  const { t } = useTranslation();

  // State management
  const [tenants, setTenants] = useState<TenantDTO[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTenants, setFilteredTenants] = useState<TenantDTO[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load both tenants and subscriptions
      const [tenantsResponse, subscriptionsResponse] = await Promise.all([
        getTenants({ page: 0, size: 100 }), // Get all tenants for management
        getAllSubscriptions()
      ]);

      if (tenantsResponse.status === 'SUCCESS' && tenantsResponse.data) {
        setTenants(tenantsResponse.data.content || []);
        setFilteredTenants(tenantsResponse.data.content || []);
      }

      if (subscriptionsResponse.status === 'SUCCESS' && subscriptionsResponse.data) {
        // Filter only active subscriptions
        const activeSubscriptions = subscriptionsResponse.data.filter(sub => sub.isActive);
        setSubscriptions(activeSubscriptions);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Search functionality
  const handleSearch = useCallback(async (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredTenants(tenants);
      return;
    }

    try {
      const response = await searchTenants(term);
      if (response.status === 'SUCCESS' && response.data) {
        setFilteredTenants(response.data);
      }
    } catch (err) {
      // Fallback to client-side filtering
      const filtered = tenants.filter(tenant =>
        tenant.tenantName.toLowerCase().includes(term.toLowerCase()) ||
        tenant.tenantCode.toLowerCase().includes(term.toLowerCase()) ||
        tenant.subscriptionName.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredTenants(filtered);
    }
  }, [tenants]);

  // Handle tenant update
  const handleTenantUpdate = useCallback((updatedTenant: TenantDTO) => {
    setTenants(prev => prev.map(tenant =>
      tenant.tenantId === updatedTenant.tenantId ? updatedTenant : tenant
    ));
    setFilteredTenants(prev => prev.map(tenant =>
      tenant.tenantId === updatedTenant.tenantId ? updatedTenant : tenant
    ));
  }, []);

  // Initialize data
  useEffect(() => {
    if (isPlatformAuthenticated && platformUser) {
      loadData();
    }
  }, [isPlatformAuthenticated, platformUser, loadData]);

  // Filter tenants based on search
  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm, tenants, handleSearch]);

  if (!isPlatformAuthenticated) {
    return (
      <div className="container-fluid">
        <Alert variant="warning" message="Please log in to access tenant subscription management." />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <Header
        title="Tenant Subscription Management"
        subtitle="Manage subscription plans for all tenants"
      />

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h5 className="card-title mb-0">
                    <i className="fas fa-credit-card me-2"></i>
                    Subscription Management
                  </h5>
                </div>
                <div className="col-md-6">
                  <div className="d-flex gap-2">
                    <div className="flex-grow-1">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search tenants by name, code, or subscription..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="info"
                      onClick={() => setShowComparisonModal(true)}
                      disabled={loading || subscriptions.length === 0}
                    >
                      <i className="fas fa-chart-bar me-2"></i>
                      Compare Plans
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={loadData}
                      disabled={loading}
                      isLoading={loading}
                    >
                      <i className="fas fa-sync-alt me-2"></i>
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* Statistics */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="stat-card bg-primary text-white">
                    <div className="stat-icon">
                      <i className="fas fa-building"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{tenants.length}</div>
                      <div className="stat-label">Total Tenants</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-card bg-success text-white">
                    <div className="stat-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">
                        {tenants.filter(t => t.isActive).length}
                      </div>
                      <div className="stat-label">Active Tenants</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-card bg-info text-white">
                    <div className="stat-icon">
                      <i className="fas fa-star"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{subscriptions.length}</div>
                      <div className="stat-label">Available Plans</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-card bg-warning text-white">
                    <div className="stat-icon">
                      <i className="fas fa-search"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{filteredTenants.length}</div>
                      <div className="stat-label">Filtered Results</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="error" message={error} />
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-5">
                  <LoadingSpinner size="lg" />
                  <p className="mt-3 text-muted">Loading tenant data...</p>
                </div>
              )}

              {/* Subscription Plans Overview */}
              {!loading && subscriptions.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-muted mb-3">Available Subscription Plans</h6>
                  <div className="row">
                    {subscriptions.map((subscription) => (
                      <div key={subscription.appSubscriptionId} className="col-md-3 mb-2">
                        <div className="border rounded p-2 bg-light">
                          <div className="fw-semibold text-primary">
                            {subscription.subscriptionName}
                          </div>
                          <small className="text-muted">
                            Code: {subscription.subscriptionCode}
                          </small>
                          {subscription.description && (
                            <div className="mt-1">
                              <small>{subscription.description}</small>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tenant Subscription Table */}
              {!loading && (
                <div>
                  {filteredTenants.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-search fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">No tenants found</h5>
                      <p className="text-muted">
                        {searchTerm 
                          ? 'Try adjusting your search criteria'
                          : 'No tenants are available for subscription management'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover table-bordered">
                        <thead className="table-dark">
                          <tr>
                            <th scope="col">
                              <i className="fas fa-building me-2"></i>
                              Tenant Details
                            </th>
                            <th scope="col">
                              <i className="fas fa-star me-2"></i>
                              Current Subscription
                            </th>
                            <th scope="col">
                              <i className="fas fa-calendar me-2"></i>
                              Validity
                            </th>
                            <th scope="col">
                              <i className="fas fa-sync me-2"></i>
                              New Subscription
                            </th>
                            <th scope="col">
                              <i className="fas fa-cogs me-2"></i>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTenants.map((tenant) => (
                            <TenantSubscriptionRow
                              key={tenant.tenantId}
                              tenant={tenant}
                              subscriptions={subscriptions}
                              onUpdate={handleTenantUpdate}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Comparison Modal */}
      <SubscriptionComparisonModal
        show={showComparisonModal}
        onHide={() => setShowComparisonModal(false)}
        subscriptions={subscriptions}
      />
    </div>
  );
};

export default TenantSubscriptionManagement;