// src/components/platform/tenant-users/TenantUserFilters.tsx
import React, { useState, useCallback, memo } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDebounce } from '../../../hooks/useDebounce';

interface FilterState {
  searchTerm: string;
  tenantId: number | null;
  isActive: boolean | null;
}

interface TenantUserFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onSearch: (searchTerm: string) => void;
  loading: boolean;
}

const TenantUserFilters: React.FC<TenantUserFiltersProps> = memo(({
  filters,
  onFilterChange,
  onSearch,
  loading
}) => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState(filters.searchTerm);

  // Debounce search input
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  // Handle search when debounced value changes
  React.useEffect(() => {
    if (debouncedSearchTerm !== filters.searchTerm) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, filters.searchTerm, onSearch]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({
      isActive: value === '' ? null : value === 'active'
    });
  }, [onFilterChange]);

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    onFilterChange({
      searchTerm: '',
      tenantId: null,
      isActive: null
    });
    onSearch('');
  }, [onFilterChange, onSearch]);

  return (
    <div className="tenant-user-filters">
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Search Input */}
            <div className="col-md-6 col-lg-4">
              <label htmlFor="search" className="form-label">
                <i className="bi bi-search"></i>
                {t('common.search') || 'Search'}
              </label>
              <div className="input-group">
                <input
                  type="text"
                  id="search"
                  className="form-control"
                  placeholder={t('platform.tenantUsers.searchPlaceholder') || 'Search by name, email, or tenant...'}
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  disabled={loading}
                />
                {searchInput && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      onSearch('');
                    }}
                    disabled={loading}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="col-md-3 col-lg-2">
              <label htmlFor="statusFilter" className="form-label">
                <i className="bi bi-funnel"></i>
                {t('common.status') || 'Status'}
              </label>
              <select
                id="statusFilter"
                className="form-select"
                value={filters.isActive === null ? '' : filters.isActive ? 'active' : 'inactive'}
                onChange={handleStatusFilterChange}
                disabled={loading}
              >
                <option value="">{t('common.all') || 'All'}</option>
                <option value="active">{t('common.active') || 'Active'}</option>
                <option value="inactive">{t('common.inactive') || 'Inactive'}</option>
              </select>
            </div>

            {/* Filter Actions */}
            <div className="col-md-3 col-lg-2 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={handleClearFilters}
                disabled={loading || (!searchInput && filters.isActive === null)}
              >
                <i className="bi bi-x-circle"></i>
                {t('common.clearFilters') || 'Clear Filters'}
              </button>
            </div>

            {/* Results Count */}
            <div className="col-md-12 col-lg-4 d-flex align-items-end">
              <div className="filter-info">
                <small className="text-muted">
                  {loading && (
                    <>
                      <i className="bi bi-hourglass-split me-1"></i>
                      {t('common.loading') || 'Loading...'}
                    </>
                  )}
                  {!loading && searchInput && (
                    <>
                      <i className="bi bi-info-circle me-1"></i>
                      {t('platform.tenantUsers.searchResults') || 'Search results for:'} "{searchInput}"
                    </>
                  )}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

TenantUserFilters.displayName = 'TenantUserFilters';

export default TenantUserFilters;