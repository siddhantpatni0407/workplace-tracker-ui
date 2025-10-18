/**
 * Subscription Plans Comparison Modal
 * Shows detailed comparison of all available subscription plans
 */

import React, { useState } from 'react';
import { Subscription } from '../../../models/Tenant';
import { SubscriptionFeature } from '../../../enums';
import { getFeaturesForSubscriptionCode, getAllSubscriptionPlans } from '../../../constants';

interface SubscriptionComparisonModalProps {
  show: boolean;
  onHide: () => void;
  subscriptions: Subscription[];
  currentSubscription?: string;
  onSelectPlan?: (subscriptionCode: string) => void;
}

const SubscriptionComparisonModal: React.FC<SubscriptionComparisonModalProps> = ({
  show,
  onHide,
  subscriptions,
  currentSubscription,
  onSelectPlan
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const allPlans = getAllSubscriptionPlans();
  const allFeatures = Object.values(SubscriptionFeature);

  const formatFeatureName = (feature: SubscriptionFeature): string => {
    return feature.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  const hasFeature = (subscriptionCode: string, feature: SubscriptionFeature): boolean => {
    const features = getFeaturesForSubscriptionCode(subscriptionCode);
    return features.includes(feature);
  };

  const handleSelectPlan = () => {
    if (selectedPlan && onSelectPlan) {
      onSelectPlan(selectedPlan);
      onHide();
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-chart-bar me-2"></i>
              Subscription Plans Comparison
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>

          <div className="modal-body">
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th scope="col" className="text-start">Features</th>
                    {allPlans.map((plan) => (
                      <th key={plan.code} scope="col" className="text-center">
                        <div className="card h-100">
                          <div className="card-header bg-primary text-white">
                            <h6 className="mb-0">{plan.name}</h6>
                            <small>{plan.description}</small>
                            {plan.code === currentSubscription && (
                              <div className="mt-1">
                                <span className="badge bg-light text-success">
                                  <i className="fas fa-check me-1"></i>
                                  Current Plan
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="card-body">
                            <div className="price-display mb-2">
                              <h5 className="text-primary mb-0">
                                ${plan.monthlyPrice}/month
                              </h5>
                              <small className="text-muted">
                                ${plan.yearlyPrice}/year
                              </small>
                            </div>
                            <div className="plan-details">
                              <small>
                                <strong>Users:</strong> {plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers}<br/>
                                <strong>Storage:</strong> {plan.maxStorage}
                              </small>
                            </div>
                            <div className="mt-2">
                              <input
                                type="radio"
                                name="selectedPlan"
                                value={plan.code}
                                checked={selectedPlan === plan.code}
                                onChange={(e) => setSelectedPlan(e.target.value)}
                                className="form-check-input me-2"
                              />
                              <label className="form-check-label small">
                                Select Plan
                              </label>
                            </div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {allFeatures.map((feature) => (
                    <tr key={feature}>
                      <td className="text-start">
                        <strong>{formatFeatureName(feature)}</strong>
                      </td>
                      {allPlans.map((plan) => (
                        <td key={`${plan.code}-${feature}`} className="text-center">
                          {hasFeature(plan.code, feature) ? (
                            <i className="fas fa-check text-success"></i>
                          ) : (
                            <i className="fas fa-times text-muted"></i>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="row mt-4">
              {allPlans.map((plan) => (
                <div key={plan.code} className="col-md-3 mb-3">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0">{plan.name}</h6>
                    </div>
                    <div className="card-body">
                      <p className="card-text small">{plan.description}</p>
                      <ul className="list-unstyled small">
                        <li><strong>Monthly:</strong> ${plan.monthlyPrice}</li>
                        <li><strong>Yearly:</strong> ${plan.yearlyPrice}</li>
                        <li><strong>Users:</strong> {plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers}</li>
                        <li><strong>Storage:</strong> {plan.maxStorage}</li>
                        <li><strong>Features:</strong> {plan.features.length}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onHide}
            >
              <i className="fas fa-times me-2"></i>
              Cancel
            </button>
            {selectedPlan && selectedPlan !== currentSubscription && onSelectPlan && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSelectPlan}
              >
                <i className="fas fa-check me-2"></i>
                Select {allPlans.find(p => p.code === selectedPlan)?.name}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionComparisonModal;