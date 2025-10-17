// src/models/Platform.ts
export interface TenantStatsDTO {
  tenantId: number;
  tenantName: string;
  superAdminCount: number;
  adminCount: number;
  userCount: number;
  totalTenantUsers: number;
}

export interface PlatformStatsDTO {
  totalTenants: number;
  totalSuperAdmins: number;
  totalAdmins: number;
  totalUsers: number;
  totalTenantUsers: number;
  tenantStats: TenantStatsDTO[];
}

export interface PlatformDashboardData {
  platformStats: PlatformStatsDTO | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}