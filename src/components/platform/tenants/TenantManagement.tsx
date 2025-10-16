/**
 * Tenant Management Component for Platform Users
 * Provides complete CRUD interface for tenant management with Bootstrap styling
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatformAuth } from '../../../context/PlatformAuthContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { LoadingSpinner, Alert, Button, ErrorBoundary } from '../../ui';
import Header from '../../common/Header/Header';
import { TenantDTO, TenantSearchParams } from '../../../models/Tenant';
import {
  getTenants,
  searchTenants,
  deleteTenant,
  updateTenantStatus
} from '../../../services/tenantService';
import TenantForm from './TenantForm';
import TenantDetailModal from './TenantDetailModal';
import { ROUTES } from '../../../constants/routes';
import './TenantManagement.css';

const TenantManagement: React.FC = () => {
  const navigate = useNavigate();
  const { platformUser, isPlatformAuthenticated, isLoading: authLoading } = usePlatformAuth();
  const { t } = useTranslation();

  // State management
  const [tenants, setTenants] = useState<TenantDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('tenantName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantDTO | null>(null);

  // Dropdown state
  const [showDropdowns, setShowDropdowns] = useState<Record<string, boolean>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Load tenants with enhanced error handling
  const loadTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams: TenantSearchParams = {
        page: currentPage - 1, // API expects 0-based page
        size: itemsPerPage,
        sortBy,
        sortDir,
        searchTerm: searchTerm || undefined
      };

      // Use searchTenants if we have a search term, otherwise use getTenants
      let response;
      if (searchTerm) {
        response = await searchTenants(searchTerm);
        if (response?.data) {
          // Filter by status if needed
          let filteredTenants = response.data;
          if (statusFilter !== 'all') {
            filteredTenants = filteredTenants.filter(t => 
              statusFilter === 'active' ? t.isActive : !t.isActive
            );
          }
          setTenants(filteredTenants);
          setTotalItems(filteredTenants.length);
          setTotalPages(Math.ceil(filteredTenants.length / itemsPerPage));
        } else {
          setTenants([]);
          setTotalItems(0);
          setTotalPages(0);
        }
      } else {
        response = await getTenants(searchParams);
        if (response?.data) {
          // Filter by status if needed
          let filteredTenants = response.data.content || [];
          if (statusFilter !== 'all') {
            filteredTenants = filteredTenants.filter(t => 
              statusFilter === 'active' ? t.isActive : !t.isActive
            );
          }
          setTenants(filteredTenants);
          setTotalItems(response.data.totalElements || 0);
          setTotalPages(response.data.totalPages || 0);
        } else {
          setTenants([]);
          setTotalItems(0);
          setTotalPages(0);
        }
      }
    } catch (err: any) {
      console.error('Error loading tenants:', err);
      setError(err.message || 'Failed to load tenants');
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, sortBy, sortDir, searchTerm, statusFilter]);

  // Load tenants on component mount and dependency changes
  useEffect(() => {
    if (isPlatformAuthenticated) {
      loadTenants();
    }
  }, [isPlatformAuthenticated, loadTenants]);

  // Event handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
    setCurrentPage(1);
  };

  const handleSortSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortDir] = e.target.value.split('-');
    setSortBy(newSortBy);
    setSortDir(newSortDir as 'asc' | 'desc');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleCreateTenant = () => {
    setShowCreateModal(true);
  };

  const handleEditTenant = (tenant: TenantDTO) => {
    setSelectedTenant(tenant);
    setShowEditModal(true);
  };

  const handleViewTenant = (tenant: TenantDTO) => {
    setSelectedTenant(tenant);
    setShowDetailModal(true);
  };

  const handleDeleteTenant = (tenant: TenantDTO) => {
    setSelectedTenant(tenant);
    setShowDeleteModal(true);
  };

  const handleToggleStatus = async (tenant: TenantDTO) => {
    try {
      setLoading(true);
      setError(null);

      const statusUpdateRequest = {
        tenantId: tenant.tenantId,
        isActive: !tenant.isActive
      };

      await updateTenantStatus(statusUpdateRequest);
      setSuccess(`Tenant ${tenant.isActive ? 'deactivated' : 'activated'} successfully`);
      loadTenants();
    } catch (err: any) {
      setError(err.message || 'Failed to update tenant status');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteTenant = async () => {
    if (!selectedTenant) return;

    try {
      setLoading(true);
      setError(null);

      await deleteTenant(selectedTenant.tenantId);
      setSuccess('Tenant deleted successfully');
      setShowDeleteModal(false);
      setSelectedTenant(null);
      loadTenants();
    } catch (err: any) {
      setError(err.message || 'Failed to delete tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = (message: string) => {
    setSuccess(message);
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedTenant(null);
    loadTenants();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPaginationPages = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (authLoading || (!isPlatformAuthenticated && !localStorage.getItem('platformAuthToken'))) {
    return (
      <div className="text-center py-5">
        <LoadingSpinner />
        <p className="mt-3 text-muted">
          {authLoading ? 'Checking authentication...' : 'Authenticating...'}
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {/* Header Component */}
      <Header
        title="Tenant Management"
        subtitle="Manage organizations and workspaces for your platform"
        eyebrow="Platform Administration"
        actions={
          <Button
            variant="primary"
            onClick={handleCreateTenant}
            disabled={loading}
            className="btn-primary-gradient d-flex align-items-center"
          >
            <i className="bi bi-plus me-2"></i>
            Add Tenant
          </Button>
        }
        showWave={true}
      />

      <div className="tenant-management">
        <div className="tenant-dashboard-layout">
          {/* Left Sidebar */}
          <div className="tenant-left-sidebar">
            <div className="tenant-sidebar-header">
              <h6 className="tenant-sidebar-title">
                <i className="bi bi-building"></i>
                Tenant Center
              </h6>
            </div>

            {/* Search Controls */}
            <div className="tenant-sidebar-controls">
              <div className="tenant-search-box">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSearchTerm('')}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Menu */}
            <div className="tenant-sidebar-menu">
              <div className="tenant-menu-section">
                <div className="tenant-menu-section-title">Quick Actions</div>
                <div 
                  className="tenant-menu-item active"
                  onClick={() => setStatusFilter('all')}
                >
                  <i className="bi bi-grid-3x3-gap"></i>
                  All Tenants
                </div>
                <div 
                  className="tenant-menu-item"
                  onClick={() => setStatusFilter('active')}
                >
                  <i className="bi bi-check-circle"></i>
                  Active Tenants
                </div>
                <div 
                  className="tenant-menu-item"
                  onClick={() => setStatusFilter('inactive')}
                >
                  <i className="bi bi-x-circle"></i>
                  Inactive Tenants
                </div>
                <div 
                  className="tenant-menu-item"
                  onClick={handleCreateTenant}
                >
                  <i className="bi bi-plus-circle"></i>
                  Create New Tenant
                </div>
              </div>

              <div className="tenant-menu-section">
                <div className="tenant-menu-section-title">Reports</div>
                <div className="tenant-menu-item">
                  <i className="bi bi-graph-up"></i>
                  Usage Analytics
                </div>
                <div className="tenant-menu-item">
                  <i className="bi bi-file-text"></i>
                  Activity Logs
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="tenant-main-content">
            <div className="tenant-content-wrapper">
              
              {/* Alerts */}
              {error && (
                <Alert 
                  variant="error" 
                  message={error || ''} 
                  onClose={() => setError(null)}
                />
              )}
              {success && (
                <Alert 
                  variant="success" 
                  message={success || ''} 
                  onClose={() => setSuccess(null)}
                />
              )}

              {/* Welcome Section */}
              <div className="tenant-welcome-section">
                <div className="tenant-welcome-card">
                  <div className="tenant-welcome-content">
                    <h4>Welcome to Tenant Management</h4>
                    <p>
                      Manage your platform tenants, monitor their activity, and oversee organizational settings.
                      Create new tenant workspaces or modify existing ones with comprehensive administrative controls.
                    </p>
                  </div>
                  <div className="tenant-welcome-icon">
                    <i className="bi bi-buildings"></i>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="tenant-stats-cards">
                <div className="tenant-stat-card">
                  <div className="tenant-stat-header">
                    <span className="tenant-stat-title">Total Tenants</span>
                    <div className="tenant-stat-icon primary">
                      <i className="bi bi-building"></i>
                    </div>
                  </div>
                  <div className="tenant-stat-value">{tenants.length}</div>
                  <div className="tenant-stat-change positive">
                    <i className="bi bi-arrow-up"></i>
                    Growing steadily
                  </div>
                </div>

                <div className="tenant-stat-card">
                  <div className="tenant-stat-header">
                    <span className="tenant-stat-title">Active Tenants</span>
                    <div className="tenant-stat-icon success">
                      <i className="bi bi-check-circle"></i>
                    </div>
                  </div>
                  <div className="tenant-stat-value">{tenants.filter(t => t.isActive).length}</div>
                  <div className="tenant-stat-change positive">
                    <i className="bi bi-arrow-up"></i>
                    Healthy rate
                  </div>
                </div>

                <div className="tenant-stat-card">
                  <div className="tenant-stat-header">
                    <span className="tenant-stat-title">Inactive Tenants</span>
                    <div className="tenant-stat-icon warning">
                      <i className="bi bi-pause-circle"></i>
                    </div>
                  </div>
                  <div className="tenant-stat-value">{tenants.filter(t => !t.isActive).length}</div>
                  <div className="tenant-stat-change">
                    <i className="bi bi-dash"></i>
                    Monitoring
                  </div>
                </div>

                <div className="tenant-stat-card">
                  <div className="tenant-stat-header">
                    <span className="tenant-stat-title">This Month</span>
                    <div className="tenant-stat-icon primary">
                      <i className="bi bi-calendar-plus"></i>
                    </div>
                  </div>
                  <div className="tenant-stat-value">
                    {tenants.filter(t => {
                      const createdDate = new Date(t.createdDate || '');
                      const currentMonth = new Date().getMonth();
                      return createdDate.getMonth() === currentMonth;
                    }).length}
                  </div>
                  <div className="tenant-stat-change positive">
                    <i className="bi bi-arrow-up"></i>
                    New signups
                  </div>
                </div>
              </div>

              {/* Tenant Cards Section */}
              <div className="tenant-cards-section">
                <div className="tenant-cards-header">
                  <h3 className="tenant-cards-title">
                    <i className="bi bi-grid-3x3-gap"></i>
                    Tenant Overview
                  </h3>
                  <div className="tenant-actions">
                    <select
                      className="form-select form-select-sm"
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      style={{ width: 'auto' }}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <select
                      className="form-select form-select-sm"
                      value={`${sortBy}-${sortDir}`}
                      onChange={handleSortSelectChange}
                      style={{ width: 'auto' }}
                    >
                      <option value="tenantName-asc">Name A-Z</option>
                      <option value="tenantName-desc">Name Z-A</option>
                      <option value="tenantCode-asc">Code A-Z</option>
                      <option value="tenantCode-desc">Code Z-A</option>
                      <option value="createdDate-desc">Newest First</option>
                      <option value="createdDate-asc">Oldest First</option>
                    </select>
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={loadTenants}
                      disabled={loading}
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="tenant-loading">
                    <div className="tenant-loading-spinner">
                      <LoadingSpinner />
                    </div>
                    <p className="tenant-loading-text">Loading tenants...</p>
                  </div>
                ) : tenants.length === 0 ? (
                  <div className="tenant-empty-state">
                    <div className="tenant-empty-icon">
                      <i className="bi bi-building"></i>
                    </div>
                    <h5 className="tenant-empty-title">
                      {searchTerm ? 'No tenants found' : 'No tenants available'}
                    </h5>
                    <p className="tenant-empty-subtitle">
                      {searchTerm 
                        ? 'Try adjusting your search criteria or filters'
                        : 'Start by creating your first tenant workspace'
                      }
                    </p>
                    {!searchTerm && (
                      <button 
                        className="btn btn-primary-gradient"
                        onClick={handleCreateTenant}
                      >
                        <i className="bi bi-plus me-2"></i>
                        Create First Tenant
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="tenant-grid">
                    {tenants.map((tenant, index) => (
                      <div key={tenant.tenantCode || index} className="tenant-card">
                        <div className="tenant-card-header">
                          <span className="tenant-code">{tenant.tenantCode}</span>
                          <span className={`tenant-status ${tenant.isActive ? 'active' : 'inactive'}`}>
                            {tenant.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <h5 className="tenant-name">{tenant.tenantName}</h5>
                        
                        <div className="tenant-metadata">
                          <div className="tenant-meta-item">
                            <div className="tenant-meta-label">Subscription</div>
                            <div className="tenant-meta-value">
                              {tenant.subscriptionCode || 'N/A'}
                            </div>
                          </div>
                          <div className="tenant-meta-item">
                            <div className="tenant-meta-label">Contact</div>
                            <div className="tenant-meta-value">
                              {tenant.contactEmail || 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="tenant-card-actions">
                          <button
                            className="tenant-action-btn view"
                            onClick={() => handleViewTenant(tenant)}
                            title="View Details"
                          >
                            <i className="bi bi-eye"></i>
                            View
                          </button>
                          <button
                            className="tenant-action-btn edit"
                            onClick={() => handleEditTenant(tenant)}
                            title="Edit Tenant"
                          >
                            <i className="bi bi-pencil"></i>
                            Edit
                          </button>
                          <button
                            className="tenant-action-btn status"
                            onClick={() => handleToggleStatus(tenant)}
                            title={tenant.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`bi bi-${tenant.isActive ? 'pause' : 'play'}-circle`}></i>
                            {tenant.isActive ? 'Pause' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {tenants.length > 0 && totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div className="text-muted">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} tenants
                    </div>
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                        </li>
                        {getPaginationPages().map((page: number) => (
                          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <TenantForm
          show={showCreateModal}
          onHide={() => setShowCreateModal(false)}
          onSuccess={handleFormSuccess}
          tenant={null}
          isEdit={false}
        />
      )}

      {showEditModal && (
        <TenantForm
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          onSuccess={handleFormSuccess}
          tenant={selectedTenant}
          isEdit={true}
        />
      )}

      {showDetailModal && (
        <TenantDetailModal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          tenant={selectedTenant}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this tenant? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDeleteTenant}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && <div className="modal-backdrop fade show"></div>}
    </ErrorBoundary>
  );
};

export default TenantManagement;