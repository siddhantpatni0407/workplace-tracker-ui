/**
 * Subscription Plan Card Component
 * Displays subscription plan information with enhanced features
 */

import React from 'react';
import { Subscription } from '../../../models/Tenant';
import { SubscriptionFeature } from '../../../enums';
import { getFeaturesForSubscriptionCode, hasFeatureAccess } from '../../../constants';

interface SubscriptionPlanCardProps {
  subscription: Subscription;
  isSelected?: boolean;
  onSelect?: (subscription: Subscription) => void;
  showFeatures?: boolean;
  showSelectButton?: boolean;
  className?: string;
}

const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  subscription,
  isSelected = false,
  onSelect,
  showFeatures = true,
  showSelectButton = false,
  className = ''
}) => {
  const getTierColor = (code: string): string => {
    switch (code.toUpperCase()) {
      case 'FREE':
        return 'text-secondary';
      case 'BASIC':
        return 'text-primary';
      case 'PRO':
        return 'text-success';
      case 'PREMIUM':
        return 'text-warning';
      case 'ENTERPRISE':
        return 'text-danger';
      default:
        return 'text-info';
    }
  };

  const getTierIcon = (code: string): string => {
    switch (code.toUpperCase()) {
      case 'FREE':
        return 'fas fa-gift';
      case 'BASIC':
        return 'fas fa-user';
      case 'PRO':
        return 'fas fa-star';
      case 'PREMIUM':
        return 'fas fa-crown';
      case 'ENTERPRISE':
        return 'fas fa-building';
      default:
        return 'fas fa-certificate';
    }
  };

  const getAvailableFeatures = (): SubscriptionFeature[] => {
    try {
      return getFeaturesForSubscriptionCode(subscription.subscriptionCode);
    } catch (error) {
      console.warn('Error getting features for subscription:', subscription.subscriptionCode);
      return [];
    }
  };

  const formatFeatureName = (feature: SubscriptionFeature): string => {
    return feature.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const features = showFeatures ? getAvailableFeatures() : [];

  return (
    <div 
      className={`card subscription-plan-card ${isSelected ? 'selected' : ''} ${className}`}
      onClick={() => onSelect && onSelect(subscription)}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
    >
      <div className="card-header text-center">
        <div className={`plan-icon ${getTierColor(subscription.subscriptionCode)} mb-2`}>
          <i className={`${getTierIcon(subscription.subscriptionCode)} fa-2x`}></i>
        </div>
        <h5 className={`plan-name ${getTierColor(subscription.subscriptionCode)} mb-1`}>
          {subscription.subscriptionName}
        </h5>
        <small className="text-muted">
          Code: {subscription.subscriptionCode}
        </small>
        {isSelected && (
          <div className="mt-2">
            <span className="badge bg-primary">
              <i className="fas fa-check me-1"></i>
              Selected
            </span>
          </div>
        )}
      </div>

      <div className="card-body">
        {subscription.description && (
          <p className="card-text text-muted small mb-3">
            {subscription.description}
          </p>
        )}

        {showFeatures && features.length > 0 && (
          <div className="features-section">
            <h6 className="features-title text-muted mb-2">
              <i className="fas fa-list-check me-1"></i>
              Features ({features.length})
            </h6>
            <div className="features-list">
              {features.slice(0, 5).map((feature) => (
                <div key={feature} className="feature-item">
                  <i className="fas fa-check text-success me-2"></i>
                  <span className="feature-name">{formatFeatureName(feature)}</span>
                </div>
              ))}
              {features.length > 5 && (
                <div className="feature-item text-muted">
                  <i className="fas fa-plus me-2"></i>
                  <span>+{features.length - 5} more features</span>
                </div>
              )}
            </div>
          </div>
        )}

        {showSelectButton && onSelect && (
          <div className="mt-3">
            <button
              type="button"
              className={`btn ${isSelected ? 'btn-success' : 'btn-outline-primary'} btn-sm w-100`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(subscription);
              }}
            >
              {isSelected ? (
                <>
                  <i className="fas fa-check me-2"></i>
                  Selected
                </>
              ) : (
                <>
                  <i className="fas fa-mouse-pointer me-2"></i>
                  Select Plan
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="card-footer text-center bg-transparent">
        <small className="text-muted">
          <i className={`fas ${subscription.isActive ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'} me-1`}></i>
          {subscription.isActive ? 'Active' : 'Inactive'}
        </small>
      </div>
    </div>
  );
};

export default SubscriptionPlanCard;