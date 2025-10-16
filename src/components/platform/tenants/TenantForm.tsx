/**
 * Tenant Form Component
 * Handles creating and editing tenants with subscription selection
 */

import React, { useState, useEffect } from 'react';
import { TenantDTO, TenantCreateRequest, TenantUpdateRequest, Subscription } from '../../../models/Tenant';
import { createTenant, updateTenant, getActiveSubscriptions } from '../../../services/tenantService';
import { Button, LoadingSpinner, Alert } from '../../ui';
import { useTranslation } from '../../../hooks/useTranslation';

interface TenantFormProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (message: string) => void;
  tenant: TenantDTO | null;
  isEdit: boolean;
}

interface TenantFormData {
  tenantName: string;
  subscriptionId: number | '';
  contactEmail: string;
  contactPhone: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
}

const TenantForm: React.FC<TenantFormProps> = ({
  show,
  onHide,
  onSuccess,
  tenant,
  isEdit
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);

  const [formData, setFormData] = useState<TenantFormData>({
    tenantName: '',
    subscriptionId: '',
    contactEmail: '',
    contactPhone: '',
    subscriptionStartDate: '',
    subscriptionEndDate: ''
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Initialize form data when tenant changes
  useEffect(() => {
    if (tenant && isEdit) {
      setFormData({
        tenantName: tenant.tenantName || '',
        subscriptionId: tenant.appSubscriptionId || '',
        contactEmail: tenant.contactEmail || '',
        contactPhone: tenant.contactPhone || '',
        subscriptionStartDate: tenant.subscriptionStartDate 
          ? new Date(tenant.subscriptionStartDate).toISOString().split('T')[0] 
          : '',
        subscriptionEndDate: tenant.subscriptionEndDate 
          ? new Date(tenant.subscriptionEndDate).toISOString().split('T')[0] 
          : ''
      });
    } else {
      setFormData({
        tenantName: '',
        subscriptionId: '',
        contactEmail: '',
        contactPhone: '',
        subscriptionStartDate: '',
        subscriptionEndDate: ''
      });
    }
    setFormErrors({});
    setError(null);
  }, [tenant, isEdit, show]);

  // Load subscriptions when modal opens
  useEffect(() => {
    if (show) {
      loadSubscriptions();
    }
  }, [show]);

  const loadSubscriptions = async () => {
    try {
      setSubscriptionsLoading(true);
      const response = await getActiveSubscriptions();
      
      if (response.status === 'SUCCESS' && response.data) {
        setSubscriptions(response.data);
      } else {
        setError('Failed to load subscription plans');
        setSubscriptions([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load subscription plans');
      setSubscriptions([]);
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Tenant name validation
    if (!formData.tenantName.trim()) {
      errors.tenantName = 'Tenant name is required';
    } else if (formData.tenantName.length > 150) {
      errors.tenantName = 'Tenant name must be 150 characters or less';
    }

    // Subscription validation
    if (!formData.subscriptionId) {
      errors.subscriptionId = 'Subscription plan is required';
    }

    // Contact email validation (optional but must be valid if provided)
    if (formData.contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        errors.contactEmail = 'Please enter a valid email address';
      } else if (formData.contactEmail.length > 150) {
        errors.contactEmail = 'Email must be 150 characters or less';
      }
    }

    // Contact phone validation (optional but must be valid if provided)
    if (formData.contactPhone.trim()) {
      if (formData.contactPhone.length > 20) {
        errors.contactPhone = 'Phone number must be 20 characters or less';
      }
    }

    // Date validation
    if (formData.subscriptionStartDate && formData.subscriptionEndDate) {
      const startDate = new Date(formData.subscriptionStartDate);
      const endDate = new Date(formData.subscriptionEndDate);
      
      if (endDate <= startDate) {
        errors.subscriptionEndDate = 'End date must be after start date';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEdit && tenant) {
        // Update existing tenant
        const updateData: TenantUpdateRequest = {
          tenantName: formData.tenantName.trim(),
          subscriptionId: Number(formData.subscriptionId),
          contactEmail: formData.contactEmail.trim() || undefined,
          contactPhone: formData.contactPhone.trim() || undefined,
          subscriptionStartDate: formData.subscriptionStartDate 
            ? new Date(formData.subscriptionStartDate).toISOString()
            : undefined,
          subscriptionEndDate: formData.subscriptionEndDate 
            ? new Date(formData.subscriptionEndDate).toISOString()
            : undefined
        };

        const response = await updateTenant(tenant.tenantId, updateData);
        
        if (response.status === 'SUCCESS') {
          onSuccess('Tenant updated successfully');
        } else {
          setError(response.message || 'Failed to update tenant');
        }
      } else {
        // Create new tenant
        const createData: TenantCreateRequest = {
          tenantName: formData.tenantName.trim(),
          subscriptionId: Number(formData.subscriptionId),
          contactEmail: formData.contactEmail.trim() || undefined,
          contactPhone: formData.contactPhone.trim() || undefined,
          subscriptionStartDate: formData.subscriptionStartDate 
            ? new Date(formData.subscriptionStartDate).toISOString()
            : undefined,
          subscriptionEndDate: formData.subscriptionEndDate 
            ? new Date(formData.subscriptionEndDate).toISOString()
            : undefined
        };

        const response = await createTenant(createData);
        
        if (response.status === 'SUCCESS') {
          onSuccess('Tenant created successfully');
        } else {
          setError(response.message || 'Failed to create tenant');
        }
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} tenant`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onHide();
    }
  };

  if (!show) {
    return null;
  }

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isEdit ? 'Edit Tenant' : 'Create New Tenant'}
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={handleClose}
                disabled={loading}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <Alert 
                    variant="error" 
                    message={error} 
                    onClose={() => setError(null)}
                  />
                )}

                <div className="row g-3">
                  {/* Tenant Name */}
                  <div className="col-12">
                    <label htmlFor="tenantName" className="form-label">
                      Tenant Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.tenantName ? 'is-invalid' : ''}`}
                      id="tenantName"
                      name="tenantName"
                      value={formData.tenantName}
                      onChange={handleInputChange}
                      placeholder="Enter tenant name"
                      maxLength={150}
                      disabled={loading}
                      required
                    />
                    {formErrors.tenantName && (
                      <div className="invalid-feedback">
                        {formErrors.tenantName}
                      </div>
                    )}
                  </div>

                  {/* Subscription Plan */}
                  <div className="col-12">
                    <label htmlFor="subscriptionId" className="form-label">
                      Subscription Plan <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${formErrors.subscriptionId ? 'is-invalid' : ''}`}
                      id="subscriptionId"
                      name="subscriptionId"
                      value={formData.subscriptionId}
                      onChange={handleInputChange}
                      disabled={loading || subscriptionsLoading}
                      required
                    >
                      <option value="">Select a subscription plan</option>
                      {subscriptions.map(subscription => (
                        <option key={subscription.appSubscriptionId} value={subscription.appSubscriptionId}>
                          {subscription.subscriptionName} - {subscription.subscriptionCode}
                        </option>
                      ))}
                    </select>
                    {formErrors.subscriptionId && (
                      <div className="invalid-feedback">
                        {formErrors.subscriptionId}
                      </div>
                    )}
                    {subscriptionsLoading && (
                      <div className="form-text">
                        <LoadingSpinner size="sm" className="me-2" />
                        Loading subscription plans...
                      </div>
                    )}
                  </div>

                  {/* Contact Email */}
                  <div className="col-md-6">
                    <label htmlFor="contactEmail" className="form-label">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      className={`form-control ${formErrors.contactEmail ? 'is-invalid' : ''}`}
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      placeholder="Enter contact email"
                      maxLength={150}
                      disabled={loading}
                    />
                    {formErrors.contactEmail && (
                      <div className="invalid-feedback">
                        {formErrors.contactEmail}
                      </div>
                    )}
                  </div>

                  {/* Contact Phone */}
                  <div className="col-md-6">
                    <label htmlFor="contactPhone" className="form-label">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${formErrors.contactPhone ? 'is-invalid' : ''}`}
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      placeholder="Enter contact phone"
                      maxLength={20}
                      disabled={loading}
                    />
                    {formErrors.contactPhone && (
                      <div className="invalid-feedback">
                        {formErrors.contactPhone}
                      </div>
                    )}
                  </div>

                  {/* Subscription Start Date */}
                  <div className="col-md-6">
                    <label htmlFor="subscriptionStartDate" className="form-label">
                      Subscription Start Date
                    </label>
                    <input
                      type="date"
                      className={`form-control ${formErrors.subscriptionStartDate ? 'is-invalid' : ''}`}
                      id="subscriptionStartDate"
                      name="subscriptionStartDate"
                      value={formData.subscriptionStartDate}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    {formErrors.subscriptionStartDate && (
                      <div className="invalid-feedback">
                        {formErrors.subscriptionStartDate}
                      </div>
                    )}
                  </div>

                  {/* Subscription End Date */}
                  <div className="col-md-6">
                    <label htmlFor="subscriptionEndDate" className="form-label">
                      Subscription End Date
                    </label>
                    <input
                      type="date"
                      className={`form-control ${formErrors.subscriptionEndDate ? 'is-invalid' : ''}`}
                      id="subscriptionEndDate"
                      name="subscriptionEndDate"
                      value={formData.subscriptionEndDate}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    {formErrors.subscriptionEndDate && (
                      <div className="invalid-feedback">
                        {formErrors.subscriptionEndDate}
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Help Text */}
                <div className="mt-3">
                  <small className="text-muted">
                    <span className="text-danger">*</span> Required fields
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <Button 
                  type="button"
                  variant="secondary" 
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  variant="primary"
                  disabled={loading || subscriptionsLoading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="me-2" />
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <i className={`bi bi-${isEdit ? 'pencil' : 'plus'} me-2`}></i>
                      {isEdit ? 'Update Tenant' : 'Create Tenant'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default TenantForm;