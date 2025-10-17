// src/components/platform/tenant-users/TenantUserManagement.tsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../context/AuthContext';
import { tenantUserService, SuperAdmin, SuperAdminListItem } from '../../../services/tenantUserService';
import { ErrorBoundary } from '../../ui';
import TenantUserTable from './TenantUserTable';
import TenantUserFilters from './TenantUserFilters';
import TenantUserDetailModal from './TenantUserDetailModal';
import { toast } from 'react-toastify';
import './TenantUserManagement.css';

interface FilterState {
  searchTerm: string;
  tenantId: number | null;
  isActive: boolean | null;
}

const TenantUserManagement: React.FC = memo(() => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // State
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [filteredSuperAdmins, setFilteredSuperAdmins] = useState<SuperAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<SuperAdmin | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    tenantId: null,
    isActive: null
  });

  // Load all super admins
  const loadSuperAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tenantUserService.getAllSuperAdmins();
      
      if (response.status === 'SUCCESS') {
        setSuperAdmins(response.data);
        setFilteredSuperAdmins(response.data);
      } else {
        setError(response.message);
        toast.error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tenant users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...superAdmins];

    // Search term filter
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.tenantName.toLowerCase().includes(searchLower)
      );
    }

    // Tenant filter
    if (filters.tenantId !== null) {
      filtered = filtered.filter(user => user.tenantId === filters.tenantId);
    }

    // Active status filter
    if (filters.isActive !== null) {
      filtered = filtered.filter(user => user.isActive === filters.isActive);
    }

    setFilteredSuperAdmins(filtered);
  }, [superAdmins, filters]);

  // Handle search
  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilters(prev => ({ ...prev, searchTerm: '' }));
      return;
    }

    try {
      setLoading(true);
      
      const response = await tenantUserService.searchSuperAdmins(searchTerm);
      
      if (response.status === 'SUCCESS') {
        // Convert list items to full admin objects for consistency
        const searchResults = response.data.map(item => ({
          ...item,
          platformUserId: 0,
          platformUserName: '',
          platformUserCode: '',
          roleId: 1,
          tenantUserCode: '',
          managerTenantUserId: null,
          managerName: null,
          mobileNumber: '',
          loginAttempts: 0,
          accountLocked: false,
          lastLoginTime: '',
          createdAt: '',
          updatedAt: ''
        }));
        
        setFilteredSuperAdmins(searchResults);
        setFilters(prev => ({ ...prev, searchTerm }));
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle user status update
  const handleStatusUpdate = useCallback(async (tenantUserId: number, isActive: boolean) => {
    try {
      const response = await tenantUserService.updateSuperAdminStatus(tenantUserId, { isActive });
      
      if (response.status === 'SUCCESS') {
        // Update local state
        setSuperAdmins(prev => 
          prev.map(user => 
            user.tenantUserId === tenantUserId 
              ? { ...user, isActive, accountLocked: !isActive }
              : user
          )
        );
        
        toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
        
        // Reload data to get fresh state
        loadSuperAdmins();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user status';
      toast.error(errorMessage);
    }
  }, [loadSuperAdmins]);

  // Handle view user details
  const handleViewDetails = useCallback(async (tenantUserId: number) => {
    try {
      const response = await tenantUserService.getSuperAdminDetails(tenantUserId);
      
      if (response.status === 'SUCCESS') {
        setSelectedUser(response.data);
        setShowDetailModal(true);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user details';
      toast.error(errorMessage);
    }
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Load data on mount
  useEffect(() => {
    loadSuperAdmins();
  }, [loadSuperAdmins]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  if (loading && superAdmins.length === 0) {
    return (
      <div className="tenant-user-management">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading tenant users...</p>
        </div>
      </div>
    );
  }

  if (error && superAdmins.length === 0) {
    return (
      <div className="tenant-user-management">
        <div className="error-container">
          <div className="alert alert-danger">
            <h5>Error Loading Tenant Users</h5>
            <p>{error}</p>
            <button className="btn btn-outline-danger" onClick={loadSuperAdmins}>
              <i className="bi bi-arrow-clockwise"></i> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="tenant-user-management">
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">
              <i className="bi bi-people-fill"></i>
              {t('platform.tenantUsers.title') || 'Tenant User Management'}
            </h1>
            <p className="page-subtitle">
              {t('platform.tenantUsers.subtitle') || 'Manage Super Admin users across all tenants'}
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-outline-primary"
              onClick={loadSuperAdmins}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise"></i>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <TenantUserFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          loading={loading}
        />

        <div className="table-container">
          <TenantUserTable
            users={filteredSuperAdmins}
            loading={loading}
            onStatusUpdate={handleStatusUpdate}
            onViewDetails={handleViewDetails}
          />
        </div>

        {showDetailModal && selectedUser && (
          <TenantUserDetailModal
            user={selectedUser}
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedUser(null);
            }}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </ErrorBoundary>
  );
});

TenantUserManagement.displayName = 'TenantUserManagement';

export default TenantUserManagement;