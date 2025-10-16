/**
 * Tenant Management Component for Platform Users
 * Provides complete CRUD interface for tenant management with Bootstrap styling
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatformAuth } from '../../../context/PlatformAuthContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { LoadingSpinner, Alert, Button } from '../../ui';
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
  const [showDropdowns, setShowDropdowns] = useState<{[key: number]: boolean}>({});
  const dropdownRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

  // Check authentication when component mounts and dependencies change
  useEffect(() => {
    if (authLoading) return;
    
    if (!isPlatformAuthenticated) {
      navigate(ROUTES.PLATFORM.LOGIN);
    }
  }, [isPlatformAuthenticated, platformUser, navigate, authLoading]);

  // Load tenants function
  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (searchTerm.trim()) {
        // Use search endpoint
        const searchResponse = await searchTenants(searchTerm.trim());
        if (searchResponse.status === 'SUCCESS' && searchResponse.data) {
          // Apply status filter to search results
          const filteredData = statusFilter === 'all' 
            ? searchResponse.data
            : searchResponse.data.filter(tenant => 
                statusFilter === 'active' ? tenant.isActive : !tenant.isActive
              );
          
          setTenants(filteredData);
          setTotalItems(filteredData.length);
          setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
        } else {
          setTenants([]);
          setTotalItems(0);
          setTotalPages(0);
        }
      } else {
        // Use paginated endpoint
        const params: TenantSearchParams = {
          page: currentPage - 1, // API uses 0-based indexing
          size: itemsPerPage,
          sortBy,
          sortDir
        };

        response = await getTenants(params);
        
        if (response.status === 'SUCCESS' && response.data) {
          let filteredTenants = response.data.content;
          
          // Apply status filter if not 'all'
          if (statusFilter !== 'all') {
            filteredTenants = filteredTenants.filter(tenant => 
              statusFilter === 'active' ? tenant.isActive : !tenant.isActive
            );
          }
          
          setTenants(filteredTenants);
          setTotalItems(response.data.totalElements);
          setTotalPages(response.data.totalPages);
        } else {
          setTenants([]);
          setTotalItems(0);
          setTotalPages(0);
        }
      }
    } catch (err: any) {
      console.error('❌ Error loading tenants:', err);
      setError(err.message || 'Failed to load tenants');
      setTenants([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, sortBy, sortDir, searchTerm, statusFilter]);

  // Load tenants on component mount and when dependencies change
  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      loadTenants();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(dropdownRefs.current).forEach(([tenantId, ref]) => {
        if (ref && !ref.contains(event.target as Node)) {
          setShowDropdowns(prev => ({
            ...prev,
            [tenantId]: false
          }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Event handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateTenant = () => {
    setSelectedTenant(null);
    setShowCreateModal(true);
  };

  const handleEditTenant = (tenant: TenantDTO) => {
    setSelectedTenant(tenant);
    setShowEditModal(true);
    setShowDropdowns({});
  };

  const handleViewTenant = (tenant: TenantDTO) => {
    setSelectedTenant(tenant);
    setShowDetailModal(true);
    setShowDropdowns({});
  };

  const handleDeleteTenant = (tenant: TenantDTO) => {
    setSelectedTenant(tenant);
    setShowDeleteModal(true);
    setShowDropdowns({});
  };

  const handleToggleStatus = async (tenant: TenantDTO) => {
    try {
      setLoading(true);
      const response = await updateTenantStatus({
        tenantId: tenant.tenantId,
        isActive: !tenant.isActive
      });

      if (response.status === 'SUCCESS') {
        setSuccess(`Tenant ${!tenant.isActive ? 'activated' : 'deactivated'} successfully`);
        loadTenants();
      } else {
        setError(response.message || 'Failed to update tenant status');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update tenant status');
    } finally {
      setLoading(false);
    }
    setShowDropdowns({});
  };

  const confirmDeleteTenant = async () => {
    if (!selectedTenant) return;

    try {
      setLoading(true);
      const response = await deleteTenant(selectedTenant.tenantId);

      if (response.status === 'SUCCESS') {
        setSuccess('Tenant deleted successfully');
        loadTenants();
      } else {
        setError(response.message || 'Failed to delete tenant');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete tenant');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSelectedTenant(null);
    }
  };

  const handleDropdownToggle = (tenantId: number) => {
    setShowDropdowns(prev => ({
      ...prev,
      [tenantId]: !prev[tenantId]
    }));
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
    <div className="tenant-management">
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-0">Tenant Management</h2>
                <p className="text-muted mb-0">Manage organizations and workspaces</p>
              </div>
              <Button
                variant="primary"
                onClick={handleCreateTenant}
                disabled={loading}
                className="d-flex align-items-center"
              >
                <i className="bi bi-plus me-2"></i>
                Add Tenant
              </Button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert 
            variant="error" 
            message={error} 
            onClose={() => setError(null)}
          />
        )}
        {success && (
          <Alert 
            variant="success" 
            message={success} 
            onClose={() => setSuccess(null)}
          />
        )}

        {/* Search and Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
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
                </div>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="tenantName">Sort by Name</option>
                  <option value="tenantCode">Sort by Code</option>
                  <option value="createdDate">Sort by Created Date</option>
                  <option value="subscriptionName">Sort by Subscription</option>
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              <div className="col-md-2">
                <Button
                  variant="outline-secondary"
                  onClick={loadTenants}
                  disabled={loading}
                  className="w-100"
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  {loading ? 'Loading...' : 'Load Tenants (Debug)'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="card">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <LoadingSpinner />
                <p className="mt-3 text-muted">Loading tenants...</p>
              </div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-building display-1 text-muted mb-3"></i>
                <h5 className="text-muted">
                  {searchTerm ? 'No tenants found for your search' : 'No tenants available'}
                </h5>
                <p className="text-muted">
                  {!searchTerm && 'Start by creating your first tenant'}
                </p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th 
                          scope="col" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSortChange('tenantName')}
                        >
                          Name {sortBy === 'tenantName' && (
                            <i className={`bi bi-sort-${sortDir === 'asc' ? 'up' : 'down'}`}></i>
                          )}
                        </th>
                        <th 
                          scope="col"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSortChange('tenantCode')}
                        >
                          Code {sortBy === 'tenantCode' && (
                            <i className={`bi bi-sort-${sortDir === 'asc' ? 'up' : 'down'}`}></i>
                          )}
                        </th>
                        <th scope="col">Subscription</th>
                        <th scope="col">Contact Email</th>
                        <th scope="col">Status</th>
                        <th 
                          scope="col"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSortChange('createdDate')}
                        >
                          Created Date {sortBy === 'createdDate' && (
                            <i className={`bi bi-sort-${sortDir === 'asc' ? 'up' : 'down'}`}></i>
                          )}
                        </th>
                        <th scope="col" className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((tenant) => (
                        <tr key={tenant.tenantId}>
                          <td>
                            <div className="fw-semibold">{tenant.tenantName}</div>
                          </td>
                          <td>
                            <code className="small">{tenant.tenantCode}</code>
                          </td>
                          <td>
                            <span className="badge bg-info-subtle text-info">
                              {tenant.subscriptionName}
                            </span>
                          </td>
                          <td>
                            {tenant.contactEmail || (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${tenant.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {tenant.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{formatDate(tenant.createdDate)}</td>
                          <td className="text-center">
                            <div className="dropdown" ref={el => { dropdownRefs.current[tenant.tenantId] = el; }}>
                              <button
                                className="btn btn-outline-secondary btn-sm dropdown-toggle"
                                type="button"
                                onClick={() => handleDropdownToggle(tenant.tenantId)}
                              >
                                Actions
                              </button>
                              <ul className={`dropdown-menu ${showDropdowns[tenant.tenantId] ? 'show' : ''}`}>
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleViewTenant(tenant)}
                                  >
                                    <i className="bi bi-eye me-2"></i>View Details
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleEditTenant(tenant)}
                                  >
                                    <i className="bi bi-pencil me-2"></i>Edit
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleToggleStatus(tenant)}
                                  >
                                    <i className={`bi bi-toggle-${tenant.isActive ? 'off' : 'on'} me-2`}></i>
                                    {tenant.isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                  <button 
                                    className="dropdown-item text-danger"
                                    onClick={() => handleDeleteTenant(tenant)}
                                  >
                                    <i className="bi bi-trash me-2"></i>Delete
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div className="text-muted">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                    </div>
                    <nav>
                      <ul className="pagination mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                        </li>
                        {getPaginationPages().map(page => (
                          <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Tenant Modal */}
      <TenantForm
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={handleFormSuccess}
        tenant={null}
        isEdit={false}
      />

      {/* Edit Tenant Modal */}
      <TenantForm
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onSuccess={handleFormSuccess}
        tenant={selectedTenant}
        isEdit={true}
      />

      {/* Tenant Detail Modal */}
      <TenantDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        tenant={selectedTenant}
      />

      {/* Delete Confirmation Modal */}
      <div className={`modal fade ${showDeleteModal ? 'show' : ''}`} style={{ display: showDeleteModal ? 'block' : 'none' }}>
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
              <p>
                Are you sure you want to delete tenant <strong>"{selectedTenant?.tenantName}"</strong>? 
                This action will deactivate the tenant and cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <Button 
                variant="secondary" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={confirmDeleteTenant}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {showDeleteModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default TenantManagement;