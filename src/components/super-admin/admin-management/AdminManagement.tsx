// src/components/super-admin/admin-management/AdminManagement.tsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../context/AuthContext';
import { adminManagementService, Admin, AdminListItem } from '../../../services/adminManagementService';
import { ErrorBoundary } from '../../ui';
import AdminTable from './AdminTable';
import AdminFilters from './AdminFilters';
import AdminDetailModal from './AdminDetailModal';
import { toast } from 'react-toastify';
import './AdminManagement.css';

interface FilterState {
  searchTerm: string;
  isActive: boolean | null;
}

const AdminManagement: React.FC = memo(() => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // State
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    isActive: null
  });

  // Load all admins
  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminManagementService.getAllAdmins();
      
      if (response.status === 'SUCCESS') {
        setAdmins(response.data);
        setFilteredAdmins(response.data);
      } else {
        setError(response.message);
        toast.error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load admins';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...admins];

    // Search term filter
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(admin => 
        admin.name.toLowerCase().includes(searchLower) ||
        admin.email.toLowerCase().includes(searchLower) ||
        (admin.managerName && admin.managerName.toLowerCase().includes(searchLower))
      );
    }

    // Active status filter
    if (filters.isActive !== null) {
      filtered = filtered.filter(admin => admin.isActive === filters.isActive);
    }

    setFilteredAdmins(filtered);
  }, [admins, filters]);

  // Handle search
  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilters(prev => ({ ...prev, searchTerm: '' }));
      return;
    }

    try {
      setLoading(true);
      
      const response = await adminManagementService.searchAdmins(searchTerm);
      
      if (response.status === 'SUCCESS') {
        // Convert list items to full admin objects for consistency
        const searchResults = response.data.map(item => ({
          ...item,
          tenantCode: '',
          platformUserId: 0,
          platformUserName: '',
          platformUserCode: '',
          roleId: 2,
          tenantUserCode: '',
          managerTenantUserId: null,
          mobileNumber: '',
          loginAttempts: 0,
          accountLocked: false,
          lastLoginTime: '',
          createdAt: '',
          updatedAt: ''
        }));
        
        setFilteredAdmins(searchResults);
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

  // Handle admin status update
  const handleStatusUpdate = useCallback(async (adminId: number, isActive: boolean) => {
    try {
      const response = await adminManagementService.updateAdminStatus(adminId, { isActive });
      
      if (response.status === 'SUCCESS') {
        // Update local state
        setAdmins(prev => 
          prev.map(admin => 
            admin.tenantUserId === adminId 
              ? { ...admin, isActive, accountLocked: !isActive }
              : admin
          )
        );
        
        toast.success(`Admin ${isActive ? 'activated' : 'deactivated'} successfully`);
        
        // Reload data to get fresh state
        loadAdmins();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update admin status';
      toast.error(errorMessage);
    }
  }, [loadAdmins]);

  // Handle view admin details
  const handleViewDetails = useCallback(async (adminId: number) => {
    try {
      const response = await adminManagementService.getAdminDetails(adminId);
      
      if (response.status === 'SUCCESS') {
        setSelectedAdmin(response.data);
        setShowDetailModal(true);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load admin details';
      toast.error(errorMessage);
    }
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Load data on mount
  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  if (loading && admins.length === 0) {
    return (
      <div className="admin-management">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading admins...</p>
        </div>
      </div>
    );
  }

  if (error && admins.length === 0) {
    return (
      <div className="admin-management">
        <div className="error-container">
          <div className="alert alert-danger">
            <h5>Error Loading Admins</h5>
            <p>{error}</p>
            <button className="btn btn-outline-danger" onClick={loadAdmins}>
              <i className="bi bi-arrow-clockwise"></i> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="admin-management">
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">
              <i className="bi bi-shield-check"></i>
              {t('superAdmin.adminManagement.title') || 'Admin Management'}
            </h1>
            <p className="page-subtitle">
              {t('superAdmin.adminManagement.subtitle') || 'Manage Admin users in your tenant'}
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-outline-primary"
              onClick={loadAdmins}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise"></i>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <AdminFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          loading={loading}
        />

        <div className="table-container">
          <AdminTable
            admins={filteredAdmins}
            loading={loading}
            onStatusUpdate={handleStatusUpdate}
            onViewDetails={handleViewDetails}
          />
        </div>

        {showDetailModal && selectedAdmin && (
          <AdminDetailModal
            admin={selectedAdmin}
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedAdmin(null);
            }}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </ErrorBoundary>
  );
});

AdminManagement.displayName = 'AdminManagement';

export default AdminManagement;