/**
 * Tenant management models based on API documentation
 */

/**
 * Complete tenant data model from API response
 */
export interface TenantDTO {
  tenantId: number;
  tenantName: string;
  tenantCode: string;
  appSubscriptionId: number;
  subscriptionCode: string;
  subscriptionName: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  createdDate: string;
  modifiedDate: string;
  // Statistics fields (only in stats endpoint)
  totalUsers?: number;
  activeUsers?: number;
}

/**
 * Request model for creating new tenant
 */
export interface TenantCreateRequest {
  tenantName: string;
  subscriptionId: number; // Use ID, not code
  contactEmail?: string;
  contactPhone?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

/**
 * Request model for updating existing tenant
 */
export interface TenantUpdateRequest {
  tenantName?: string;
  subscriptionId?: number; // Use ID, not code
  contactEmail?: string;
  contactPhone?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

/**
 * Request model for updating tenant status
 */
export interface TenantStatusUpdateRequest {
  tenantId: number;
  isActive: boolean;
}

/**
 * Subscription plan model
 */
export interface Subscription {
  appSubscriptionId: number;
  subscriptionCode: string;
  subscriptionName: string;
  description: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string;
}

/**
 * Paginated response for tenant list
 */
export interface TenantPaginatedResponse {
  content: TenantDTO[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

/**
 * Tenant statistics model
 */
export interface TenantStats extends TenantDTO {
  totalUsers: number;
  activeUsers: number;
}

/**
 * Search and filter parameters for tenant list
 */
export interface TenantSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  searchTerm?: string;
}

/**
 * Tenant form data for UI components
 */
export interface TenantFormData {
  tenantName: string;
  subscriptionId: number | '';
  contactEmail: string;
  contactPhone: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
}

/**
 * Tenant list filter options
 */
export interface TenantFilters {
  isActive?: boolean;
  subscriptionCode?: string;
  searchTerm?: string;
}