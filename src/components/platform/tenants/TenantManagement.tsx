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
        <div className="container-fluid">
          
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

          {/* Quick Actions Bar */}
          <div className="tenant-quick-actions-bar">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="tenant-search-controls">
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
              <div className="col-lg-6">
                <div className="tenant-action-buttons d-flex gap-2 justify-content-end">
                  <button 
                    className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                    onClick={() => setStatusFilter('all')}
                  >
                    <i className="bi bi-grid-3x3-gap me-1"></i>
                    All ({tenants.length})
                  </button>
                  <button 
                    className={`btn ${statusFilter === 'active' ? 'btn-success' : 'btn-outline-success'} btn-sm`}
                    onClick={() => setStatusFilter('active')}
                  >
                    <i className="bi bi-check-circle me-1"></i>
                    Active ({tenants.filter(t => t.isActive).length})
                  </button>
                  <button 
                    className={`btn ${statusFilter === 'inactive' ? 'btn-warning' : 'btn-outline-warning'} btn-sm`}
                    onClick={() => setStatusFilter('inactive')}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Inactive ({tenants.filter(t => !t.isActive).length})
                  </button>
                  <button 
                    className="btn btn-outline-info btn-sm"
                    onClick={loadTenants}
                    disabled={loading}
                  >
                    <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''} me-1`}></i>
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Statistics Cards */}
          <div className="tenant-stats-cards">
            <div className="tenant-stat-card">
              <div className="tenant-stat-header">
                <span className="tenant-stat-title">Total Tenants</span>
                <div className="tenant-stat-icon primary">
                  <i className="bi bi-building"></i>
                </div>
              </div>
              <div className="tenant-stat-value">{tenants.length}</div>
              <div className="tenant-stat-subtitle">
                <i className="bi bi-arrow-up"></i>
                Growing steadily
                <span className="tenant-stat-trend positive">+12%</span>
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
              <div className="tenant-stat-subtitle">
                <i className="bi bi-check"></i>
                Healthy rate
                <span className="tenant-stat-trend positive">+5%</span>
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
              <div className="tenant-stat-subtitle">
                <i className="bi bi-dash"></i>
                Monitoring
                <span className="tenant-stat-trend neutral">--</span>
              </div>
            </div>

            <div className="tenant-stat-card">
              <div className="tenant-stat-header">
                <span className="tenant-stat-title">This Month</span>
                <div className="tenant-stat-icon info">
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
              <div className="tenant-stat-subtitle">
                <i className="bi bi-plus"></i>
                New signups
                <span className="tenant-stat-trend positive">+8%</span>
              </div>
            </div>
          </div>

          {/* Enhanced Tenant Table Section */}
          <div className="tenant-table-section">
            <div className="tenant-table-header">
              <h3 className="tenant-table-title">
                <i className="bi bi-table me-2"></i>
                Tenant Overview
              </h3>
              <div className="tenant-table-controls">
                <div className="tenant-filters">
                  <div className="tenant-filter-group">
                    <label className="tenant-filter-label">Sort By</label>
                    <select
                      className="tenant-filter-select"
                      value={`${sortBy}-${sortDir}`}
                      onChange={handleSortSelectChange}
                    >
                      <option value="tenantName-asc">Name A-Z</option>
                      <option value="tenantName-desc">Name Z-A</option>
                      <option value="tenantCode-asc">Code A-Z</option>
                      <option value="tenantCode-desc">Code Z-A</option>
                      <option value="createdDate-desc">Newest First</option>
                      <option value="createdDate-asc">Oldest First</option>
                    </select>
                  </div>
                  <div className="tenant-filter-group">
                    <label className="tenant-filter-label">Items Per Page</label>
                    <select
                      className="tenant-filter-select"
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
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
              <div className="tenant-table-wrapper">
                <div className="table-responsive">
                  <table className="table tenant-table">
                    <thead>
                      <tr>
                        <th>
                          <button 
                            className="btn btn-link p-0 text-decoration-none d-flex align-items-center"
                            onClick={() => {
                              setSortBy('tenantCode');
                              setSortDir(sortBy === 'tenantCode' && sortDir === 'asc' ? 'desc' : 'asc');
                            }}
                          >
                            Tenant Code
                            <i className={`bi bi-arrow-${sortBy === 'tenantCode' && sortDir === 'desc' ? 'down' : 'up'} ms-1`}></i>
                          </button>
                        </th>
                        <th>
                          <button 
                            className="btn btn-link p-0 text-decoration-none d-flex align-items-center"
                            onClick={() => {
                              setSortBy('tenantName');
                              setSortDir(sortBy === 'tenantName' && sortDir === 'asc' ? 'desc' : 'asc');
                            }}
                          >
                            Tenant Name
                            <i className={`bi bi-arrow-${sortBy === 'tenantName' && sortDir === 'desc' ? 'down' : 'up'} ms-1`}></i>
                          </button>
                        </th>
                        <th>Subscription</th>
                        <th>Contact Email</th>
                        <th>Status</th>
                        <th>
                          <button 
                            className="btn btn-link p-0 text-decoration-none d-flex align-items-center"
                            onClick={() => {
                              setSortBy('createdDate');
                              setSortDir(sortBy === 'createdDate' && sortDir === 'asc' ? 'desc' : 'asc');
                            }}
                          >
                            Created Date
                            <i className={`bi bi-arrow-${sortBy === 'createdDate' && sortDir === 'desc' ? 'down' : 'up'} ms-1`}></i>
                          </button>
                        </th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((tenant, index) => (
                        <tr key={tenant.tenantCode || index} className="tenant-table-row">
                          <td>
                            <span className="tenant-code-badge">{tenant.tenantCode}</span>
                          </td>
                          <td>
                            <div className="tenant-name-cell">
                              <strong>{tenant.tenantName}</strong>
                            </div>
                          </td>
                          <td>
                            <span className="tenant-subscription">
                              {tenant.subscriptionCode || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span className="tenant-email">
                              {tenant.contactEmail || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge tenant-status-badge ${tenant.isActive ? 'bg-success' : 'bg-warning'}`}>
                              <i className={`bi bi-${tenant.isActive ? 'check-circle' : 'pause-circle'} me-1`}></i>
                              {tenant.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <span className="tenant-date">
                              {formatDate(tenant.createdDate || '')}
                            </span>
                          </td>
                          <td>
                            <div className="tenant-actions-dropdown">
                              <div className="dropdown">
                                <button
                                  className="btn btn-outline-secondary btn-sm dropdown-toggle"
                                  type="button"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  <i className="bi bi-three-dots"></i>
                                </button>
                                <ul className="dropdown-menu">
                                  <li>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleViewTenant(tenant)}
                                    >
                                      <i className="bi bi-eye me-2"></i>
                                      View Details
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleEditTenant(tenant)}
                                    >
                                      <i className="bi bi-pencil me-2"></i>
                                      Edit Tenant
                                    </button>
                                  </li>
                                  <li><hr className="dropdown-divider" /></li>
                                  <li>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleToggleStatus(tenant)}
                                    >
                                      <i className={`bi bi-${tenant.isActive ? 'pause' : 'play'}-circle me-2`}></i>
                                      {tenant.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      className="dropdown-item text-danger"
                                      onClick={() => handleDeleteTenant(tenant)}
                                    >
                                      <i className="bi bi-trash me-2"></i>
                                      Delete
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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