// src/constants/subscriptionConfig.ts
import { SubscriptionFeature, SubscriptionTier } from '../enums/SubscriptionEnums';

export const SUBSCRIPTION_PLANS = {
  BASIC: {
    code: 'BASIC',
    name: 'Basic Plan',
    tier: SubscriptionTier.BASIC,
    description: 'Essential features for small teams',
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    maxUsers: 10,
    maxStorage: '5GB',
    features: [
      SubscriptionFeature.USER_MANAGEMENT,
      SubscriptionFeature.TASK_TRACKING,
      SubscriptionFeature.TIME_TRACKING,
      SubscriptionFeature.REPORTS_BASIC
    ]
  },
  STANDARD: {
    code: 'STANDARD',
    name: 'Standard Plan',
    tier: SubscriptionTier.STANDARD,
    description: 'Advanced features for growing teams',
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    maxUsers: 50,
    maxStorage: '50GB',
    features: [
      SubscriptionFeature.USER_MANAGEMENT,
      SubscriptionFeature.TASK_TRACKING,
      SubscriptionFeature.TIME_TRACKING,
      SubscriptionFeature.LEAVE_MANAGEMENT,
      SubscriptionFeature.HOLIDAY_MANAGEMENT,
      SubscriptionFeature.LOCATION_TRACKING,
      SubscriptionFeature.NOTES_MANAGEMENT,
      SubscriptionFeature.DAILY_TASKS,
      SubscriptionFeature.REPORTS_BASIC,
      SubscriptionFeature.REPORTS_ADVANCED
    ]
  },
  PREMIUM: {
    code: 'PREMIUM',
    name: 'Premium Plan',
    tier: SubscriptionTier.PREMIUM,
    description: 'Complete solution for large teams',
    monthlyPrice: 39.99,
    yearlyPrice: 399.99,
    maxUsers: 200,
    maxStorage: '200GB',
    features: [
      SubscriptionFeature.USER_MANAGEMENT,
      SubscriptionFeature.TASK_TRACKING,
      SubscriptionFeature.TIME_TRACKING,
      SubscriptionFeature.LEAVE_MANAGEMENT,
      SubscriptionFeature.HOLIDAY_MANAGEMENT,
      SubscriptionFeature.LOCATION_TRACKING,
      SubscriptionFeature.OFFICE_VISIT_TRACKING,
      SubscriptionFeature.NOTES_MANAGEMENT,
      SubscriptionFeature.DAILY_TASKS,
      SubscriptionFeature.REPORTS_BASIC,
      SubscriptionFeature.REPORTS_ADVANCED,
      SubscriptionFeature.API_ACCESS,
      SubscriptionFeature.SINGLE_SIGN_ON,
      SubscriptionFeature.BACKUP_RESTORE
    ]
  },
  ENTERPRISE: {
    code: 'ENTERPRISE',
    name: 'Enterprise Plan',
    tier: SubscriptionTier.ENTERPRISE,
    description: 'Unlimited features for enterprises',
    monthlyPrice: 79.99,
    yearlyPrice: 799.99,
    maxUsers: -1, // Unlimited
    maxStorage: 'Unlimited',
    features: [
      SubscriptionFeature.USER_MANAGEMENT,
      SubscriptionFeature.TASK_TRACKING,
      SubscriptionFeature.TIME_TRACKING,
      SubscriptionFeature.LEAVE_MANAGEMENT,
      SubscriptionFeature.HOLIDAY_MANAGEMENT,
      SubscriptionFeature.LOCATION_TRACKING,
      SubscriptionFeature.OFFICE_VISIT_TRACKING,
      SubscriptionFeature.NOTES_MANAGEMENT,
      SubscriptionFeature.DAILY_TASKS,
      SubscriptionFeature.REPORTS_BASIC,
      SubscriptionFeature.REPORTS_ADVANCED,
      SubscriptionFeature.API_ACCESS,
      SubscriptionFeature.CUSTOM_INTEGRATIONS,
      SubscriptionFeature.PRIORITY_SUPPORT,
      SubscriptionFeature.SINGLE_SIGN_ON,
      SubscriptionFeature.ADVANCED_SECURITY,
      SubscriptionFeature.BACKUP_RESTORE,
      SubscriptionFeature.AUDIT_LOGS,
      SubscriptionFeature.CUSTOM_BRANDING,
      SubscriptionFeature.UNLIMITED_STORAGE
    ]
  }
};

export const getFeaturesForSubscriptionCode = (subscriptionCode: string): SubscriptionFeature[] => {
  const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.code === subscriptionCode);
  return plan ? plan.features : [];
};

export const hasFeatureAccess = (subscriptionCode: string, feature: SubscriptionFeature): boolean => {
  const features = getFeaturesForSubscriptionCode(subscriptionCode);
  return features.includes(feature);
};

export const getSubscriptionPlan = (subscriptionCode: string) => {
  return Object.values(SUBSCRIPTION_PLANS).find(p => p.code === subscriptionCode);
};

export const getAllSubscriptionPlans = () => {
  return Object.values(SUBSCRIPTION_PLANS);
};

export const getSubscriptionTierOrder = () => {
  return [
    SubscriptionTier.BASIC,
    SubscriptionTier.STANDARD,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE
  ];
};