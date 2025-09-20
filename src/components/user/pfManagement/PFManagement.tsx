import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { PF_LINKS } from '../../../constants/app';
import Header from '../../common/header/Header';
import './pf-management.css';

const PFManagement: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleExternalLinkClick = (url: string, title: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const pfServices = [
    {
      id: 'member-login',
      title: PF_LINKS.MEMBER_LOGIN.TITLE,
      description: PF_LINKS.MEMBER_LOGIN.DESCRIPTION,
      url: PF_LINKS.MEMBER_LOGIN.URL,
      icon: 'bi-person-circle',
      color: '#007bff',
      features: ['Login to EPF Account', 'View Account Details', 'Update KYC', 'Claim Status']
    },
    {
      id: 'member-passbook',
      title: PF_LINKS.MEMBER_PASSBOOK.TITLE,
      description: PF_LINKS.MEMBER_PASSBOOK.DESCRIPTION,
      url: PF_LINKS.MEMBER_PASSBOOK.URL,
      icon: 'bi-journal-text',
      color: '#28a745',
      features: ['Transaction History', 'Download Passbook', 'Balance Summary', 'Contribution Details']
    },
    {
      id: 'uan-portal',
      title: PF_LINKS.UAN_PORTAL.TITLE,
      description: PF_LINKS.UAN_PORTAL.DESCRIPTION,
      url: PF_LINKS.UAN_PORTAL.URL,
      icon: 'bi-building',
      color: '#6f42c1',
      features: ['UAN Services', 'Profile Management', 'Nomination Details', 'Transfer Claims']
    },
    {
      id: 'grievance-portal',
      title: PF_LINKS.GRIEVANCE_PORTAL.TITLE,
      description: PF_LINKS.GRIEVANCE_PORTAL.DESCRIPTION,
      url: PF_LINKS.GRIEVANCE_PORTAL.URL,
      icon: 'bi-chat-dots',
      color: '#fd7e14',
      features: ['Register Grievance', 'Track Status', 'Upload Documents', 'Get Resolution']
    }
  ];

  const quickActions = [
    { title: 'Check PF Balance', icon: 'bi-wallet2', action: () => handleExternalLinkClick(PF_LINKS.MEMBER_PASSBOOK.URL, 'PF Balance') },
    { title: 'Download Passbook', icon: 'bi-download', action: () => handleExternalLinkClick(PF_LINKS.MEMBER_PASSBOOK.URL, 'Download Passbook') },
    { title: 'Update KYC', icon: 'bi-person-check', action: () => handleExternalLinkClick(PF_LINKS.MEMBER_LOGIN.URL, 'Update KYC') },
    { title: 'Track Claim Status', icon: 'bi-search', action: () => handleExternalLinkClick(PF_LINKS.MEMBER_LOGIN.URL, 'Track Claim') }
  ];

  return (
    <div className="container-fluid py-4">
      <Header 
        title="Provident Fund Management" 
        subtitle="Access your EPF services, check balance, and manage your provident fund account"
        actions={
          <div className="d-flex gap-2">
            <button
              className="btn btn-light"
              onClick={() => handleExternalLinkClick(PF_LINKS.MEMBER_LOGIN.URL, 'EPF Login')}
            >
              <i className="bi bi-box-arrow-up-right me-2"></i>
              EPF Portal
            </button>
            <button
              className="btn btn-outline-light"
              onClick={() => handleExternalLinkClick(PF_LINKS.MEMBER_PASSBOOK.URL, 'Member Passbook')}
            >
              <i className="bi bi-journal-text me-2"></i>
              Passbook
            </button>
          </div>
        }
      />

      <div className="pf-content">
        {/* Quick Actions Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <i className="bi bi-lightning-charge-fill me-2 text-primary"></i>
                  Quick Actions
                </h5>
                <div className="row g-3">
                  {quickActions.map((action, index) => (
                    <div key={index} className="col-lg-3 col-md-6">
                      <div className="quick-action-card h-100" onClick={action.action}>
                        <div className="action-icon">
                          <i className={action.icon}></i>
                        </div>
                        <h6 className="action-title">{action.title}</h6>
                        <div className="action-arrow">
                          <i className="bi bi-arrow-right"></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PF Services Section */}
        <div className="row mb-4">
          <div className="col-12">
            <h5 className="section-title mb-3">
              <i className="bi bi-grid-3x3-gap-fill me-2"></i>
              EPF Services
            </h5>
          </div>
          {pfServices.map((service) => (
            <div key={service.id} className="col-lg-3 col-md-6 mb-4">
              <div className="pf-service-card h-100">
                <div className="service-header">
                  <div className="service-icon" style={{background: `linear-gradient(135deg, ${service.color}, ${service.color}88)`}}>
                    <i className={service.icon}></i>
                  </div>
                  <div className="service-info">
                    <h6 className="service-title">{service.title}</h6>
                    <p className="service-description">{service.description}</p>
                  </div>
                </div>
                <div className="service-features">
                  <h6 className="features-title">Features:</h6>
                  <ul className="features-list">
                    {service.features.map((feature, index) => (
                      <li key={index} className="feature-item">
                        <i className="bi bi-check-circle-fill"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="service-actions">
                  <button 
                    className="btn btn-primary service-btn"
                    onClick={() => handleExternalLinkClick(service.url, service.title)}
                  >
                    Access Service
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Information Section */}
        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h6 className="card-title">
                  <i className="bi bi-info-circle-fill me-2 text-info"></i>
                  Important Information
                </h6>
                <div className="info-content">
                  <p>Your Provident Fund is managed by the Employees' Provident Fund Organisation (EPFO). Here are some key points to remember:</p>
                  <ul className="info-list">
                    <li>Keep your UAN (Universal Account Number) safe and updated</li>
                    <li>Link your bank account and Aadhaar for faster processing</li>
                    <li>Regularly check your account for accurate contributions</li>
                    <li>Inform EPFO about job changes to ensure seamless transfers</li>
                    <li>Download and save your passbook regularly for records</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h6 className="card-title">
                  <i className="bi bi-headset me-2 text-success"></i>
                  Help & Support
                </h6>
                <div className="info-content">
                  <p>Need assistance with your PF account? Contact EPFO support:</p>
                  <div className="contact-info">
                    <div className="contact-item">
                      <strong>Helpline:</strong>
                      <span>1800-118-005</span>
                    </div>
                    <div className="contact-item">
                      <strong>Email:</strong>
                      <span>grievance@epfindia.gov.in</span>
                    </div>
                    <div className="contact-item">
                      <strong>Working Hours:</strong>
                      <span>9:30 AM - 6:00 PM (Mon-Fri)</span>
                    </div>
                    <div className="contact-item">
                      <strong>Website:</strong>
                      <span>
                        <button 
                          className="btn btn-link p-0 text-decoration-none"
                          onClick={() => handleExternalLinkClick('https://www.epfindia.gov.in', 'EPFO Website')}
                        >
                          epfindia.gov.in
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PFManagement;