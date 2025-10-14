import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../../hooks/useTranslation";
import { ROUTES } from "../../../constants";
import "./PlatformHome.css";
import bgImage from "../../../assets/workplace-tracker-background.jpg"; 

const PlatformHome: React.FC = () => {
  const { t } = useTranslation();
  
  useEffect(() => {
    // Set background image as CSS custom property for reliable loading
    document.documentElement.style.setProperty('--platform-home-bg-image', `url("${bgImage}")`);
    
    // Disable body scrolling and remove any default spacing
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.removeProperty('--platform-home-bg-image');
    };
  }, []);

  return (
    <div className="platform-home-container">
      <div className="platform-home-overlay">
        <div className="platform-home-content">
          <div className="platform-home-header">
            <h1 className="platform-home-title">
              {t('platform.home.title') || 'Platform Administration'}
            </h1>
            <p className="platform-home-subtitle">
              {t('platform.home.description') || 'Access administrative tools and manage your workplace tracking system with comprehensive control over users, settings, and analytics.'}
            </p>
          </div>
          
          <div className="platform-home-features">
            <div className="platform-feature-card">
              <div className="platform-feature-icon">🏢</div>
              <h3>{t('platform.home.features.multiTenant.title') || 'Multi-Tenant Management'}</h3>
              <p>{t('platform.home.features.multiTenant.description') || 'Manage multiple organizations and workspaces from a single platform interface.'}</p>
            </div>
            
            <div className="platform-feature-card">
              <div className="platform-feature-icon">📊</div>
              <h3>{t('platform.home.features.analytics.title') || 'Advanced Analytics'}</h3>
              <p>{t('platform.home.features.analytics.description') || 'Get insights into platform usage, performance metrics, and user engagement across all tenants.'}</p>
            </div>
            
            <div className="platform-feature-card">
              <div className="platform-feature-icon">⚙️</div>
              <h3>{t('platform.home.features.configuration.title') || 'System Configuration'}</h3>
              <p>{t('platform.home.features.configuration.description') || 'Configure global settings, manage integrations, and customize platform behavior.'}</p>
            </div>
          </div>

          <div className="platform-home-actions">
            <Link 
              to={ROUTES.PLATFORM.LOGIN} 
              className="platform-btn platform-btn-primary"
            >
              {t('platform.actions.login') || 'Platform Login'}
            </Link>
            <Link 
              to={ROUTES.PLATFORM.SIGNUP} 
              className="platform-btn platform-btn-secondary"
            >
              {t('platform.actions.signup') || 'Platform Signup'}
            </Link>
          </div>

          <div className="platform-home-footer">
            <p>
              {t('platform.footer.backToMain') || 'Back to'} {' '}
              <Link to={ROUTES.PUBLIC.HOME} className="platform-link">
                {t('platform.footer.mainApp') || 'Main Application'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformHome;