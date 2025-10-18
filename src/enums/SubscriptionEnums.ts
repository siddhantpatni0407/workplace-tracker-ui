// src/enums/SubscriptionEnums.ts
export enum SubscriptionTier {
  BASIC = 'Basic',
  STANDARD = 'Standard',
  PREMIUM = 'Premium',
  ENTERPRISE = 'Enterprise'
}

export enum SubscriptionFeature {
  USER_MANAGEMENT = 'User Management',
  TASK_TRACKING = 'Task Tracking',
  TIME_TRACKING = 'Time Tracking',
  LEAVE_MANAGEMENT = 'Leave Management',
  HOLIDAY_MANAGEMENT = 'Holiday Management',
  LOCATION_TRACKING = 'Location Tracking',
  OFFICE_VISIT_TRACKING = 'Office Visit Tracking',
  NOTES_MANAGEMENT = 'Notes Management',
  DAILY_TASKS = 'Daily Tasks',
  REPORTS_BASIC = 'Basic Reports',
  REPORTS_ADVANCED = 'Advanced Reports',
  API_ACCESS = 'API Access',
  CUSTOM_INTEGRATIONS = 'Custom Integrations',
  PRIORITY_SUPPORT = 'Priority Support',
  SINGLE_SIGN_ON = 'Single Sign-On',
  ADVANCED_SECURITY = 'Advanced Security',
  BACKUP_RESTORE = 'Backup & Restore',
  AUDIT_LOGS = 'Audit Logs',
  CUSTOM_BRANDING = 'Custom Branding',
  UNLIMITED_STORAGE = 'Unlimited Storage'
}

export enum SubscriptionStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
  EXPIRED = 'Expired',
  TRIAL = 'Trial'
}

export enum SubscriptionPeriod {
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  YEARLY = 'Yearly'
}

export const SUBSCRIPTION_TIER_CONFIG = {
  [SubscriptionTier.BASIC]: {
    displayName: 'Basic Plan',
    description: 'Essential features for small teams',
    color: '#6c757d',
    maxUsers: 10,
    priority: 1
  },
  [SubscriptionTier.STANDARD]: {
    displayName: 'Standard Plan',
    description: 'Advanced features for growing teams',
    color: '#0d6efd',
    maxUsers: 50,
    priority: 2
  },
  [SubscriptionTier.PREMIUM]: {
    displayName: 'Premium Plan',
    description: 'Complete solution for large teams',
    color: '#198754',
    maxUsers: 200,
    priority: 3
  },
  [SubscriptionTier.ENTERPRISE]: {
    displayName: 'Enterprise Plan',
    description: 'Unlimited features for enterprises',
    color: '#dc3545',
    maxUsers: -1, // Unlimited
    priority: 4
  }
};