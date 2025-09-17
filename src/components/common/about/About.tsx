import React from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { ROUTES } from "../../../constants";
import "./about.css";

const About: React.FC = () => {
  const { t } = useTranslation();

  // Company Statistics
  const companyStats = [
    {
      number: "10,000+",
      label: "Active Users",
      icon: "bi-people-fill",
      color: "blue"
    },
    {
      number: "500+",
      label: "Companies",
      icon: "bi-building",
      color: "green"
    },
    {
      number: "99.9%",
      label: "Uptime",
      icon: "bi-shield-check",
      color: "purple"
    },
    {
      number: "24/7",
      label: "Support",
      icon: "bi-headset",
      color: "orange"
    }
  ];

  // Technology Stack
  const techStack = [
    {
      name: "React 19",
      category: "Frontend",
      icon: "bi-react",
      description: "Modern React with hooks and concurrent features"
    },
    {
      name: "TypeScript",
      category: "Language",
      icon: "bi-code-slash",
      description: "Type-safe development for better reliability"
    },
    {
      name: "Node.js",
      category: "Backend",
      icon: "bi-server",
      description: "Scalable server-side JavaScript runtime"
    },
    {
      name: "PostgreSQL",
      category: "Database",
      icon: "bi-database",
      description: "Robust relational database for data integrity"
    },
    {
      name: "AWS",
      category: "Cloud",
      icon: "bi-cloud",
      description: "Enterprise-grade cloud infrastructure"
    },
    {
      name: "Docker",
      category: "DevOps",
      icon: "bi-box",
      description: "Containerized deployment for consistency"
    }
  ];

  // Security Features
  const securityFeatures = [
    {
      title: "End-to-End Encryption",
      desc: "All data is encrypted in transit and at rest using AES-256",
      icon: "bi-lock-fill",
      level: "Enterprise"
    },
    {
      title: "Multi-Factor Authentication",
      desc: "Optional 2FA/MFA support for enhanced account security",
      icon: "bi-shield-lock-fill",
      level: "Standard"
    },
    {
      title: "GDPR Compliance",
      desc: "Full compliance with data protection regulations",
      icon: "bi-file-earmark-check",
      level: "Certified"
    },
    {
      title: "SOC 2 Type II",
      desc: "Audited security controls and compliance certification",
      icon: "bi-award-fill",
      level: "Audited"
    },
    {
      title: "Role-Based Access",
      desc: "Granular permissions and access control management",
      icon: "bi-person-gear",
      level: "Advanced"
    },
    {
      title: "Audit Logs",
      desc: "Comprehensive activity tracking and audit trails",
      icon: "bi-journal-text",
      level: "Complete"
    }
  ];

  // Integration Partners
  const integrations = [
    {
      name: "Slack",
      category: "Communication",
      icon: "bi-slack",
      description: "Real-time notifications and updates"
    },
    {
      name: "Microsoft Teams",
      category: "Communication",
      icon: "bi-microsoft-teams",
      description: "Seamless team collaboration integration"
    },
    {
      name: "Google Workspace",
      category: "Productivity",
      icon: "bi-google",
      description: "Calendar and email synchronization"
    },
    {
      name: "Outlook",
      category: "Email",
      icon: "bi-envelope-at",
      description: "Email notifications and calendar sync"
    },
    {
      name: "Zapier",
      category: "Automation",
      icon: "bi-lightning-charge",
      description: "Connect with 5000+ apps and workflows"
    },
    {
      name: "REST API",
      category: "Development",
      icon: "bi-code-square",
      description: "Full API access for custom integrations"
    }
  ];

  const userFeatures = [
    {
      title: t("dashboard.userDashboard.cards.tasks.title"),
      desc: t("dashboard.userDashboard.cards.tasks.subtitle"),
      icon: "bi-check2-square",
      category: "productivity"
    },
    {
      title: t("dashboard.userDashboard.cards.officeVisit.title"),
      desc: t("dashboard.userDashboard.cards.officeVisit.subtitle"),
      icon: "bi-building",
      category: "attendance"
    },
    {
      title: t("dashboard.userDashboard.cards.officeVisitAnalytics.title"),
      desc: t("dashboard.userDashboard.cards.officeVisitAnalytics.subtitle"),
      icon: "bi-graph-up",
      category: "analytics"
    },
    {
      title: t("dashboard.userDashboard.cards.leaveManagement.title"),
      desc: t("dashboard.userDashboard.cards.leaveManagement.subtitle"),
      icon: "bi-calendar-x",
      category: "leave"
    },
    {
      title: t("dashboard.userDashboard.cards.holidays.title"),
      desc: t("dashboard.userDashboard.cards.holidays.subtitle"),
      icon: "bi-sun-fill",
      category: "calendar"
    },
    {
      title: t("dashboard.userDashboard.cards.leavePolicy.title"),
      desc: t("dashboard.userDashboard.cards.leavePolicy.subtitle"),
      icon: "bi-file-earmark-text",
      category: "policy"
    },
    {
      title: t("dashboard.userDashboard.cards.notes.title"),
      desc: t("dashboard.userDashboard.cards.notes.subtitle"),
      icon: "bi-journal-text",
      category: "productivity"
    },
    {
      title: "Profile Management",
      desc: "Update personal information and account settings",
      icon: "bi-person-circle",
      category: "account"
    }
  ];

  const adminFeatures = [
    {
      title: t("dashboard.adminDashboard.cards.userManagement.title"),
      desc: t("dashboard.adminDashboard.cards.userManagement.subtitle"),
      icon: "bi-people-fill",
      category: "management"
    },
    {
      title: t("dashboard.adminDashboard.cards.holidayManagement.title"),
      desc: t("dashboard.adminDashboard.cards.holidayManagement.subtitle"),
      icon: "bi-calendar-event",
      category: "calendar"
    },
    {
      title: t("dashboard.adminDashboard.cards.leavePolicyManagement.title"),
      desc: t("dashboard.adminDashboard.cards.leavePolicyManagement.subtitle"),
      icon: "bi-gear-fill",
      category: "policy"
    },
    {
      title: t("dashboard.adminDashboard.cards.reports.title"),
      desc: t("dashboard.adminDashboard.cards.reports.subtitle"),
      icon: "bi-bar-chart-line-fill",
      category: "analytics"
    },
    {
      title: "User Analytics",
      desc: "Detailed user statistics and performance insights",
      icon: "bi-graph-up-arrow",
      category: "analytics"
    },
    {
      title: "Database Management",
      desc: "System administration and database backup tools",
      icon: "bi-server",
      category: "system"
    }
  ];

  const keyHighlights = [
    {
      title: "Role-Based Access",
      desc: "Secure, role-specific dashboards and features",
      icon: "bi-shield-check",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: "Real-Time Analytics",
      desc: "Live insights and comprehensive reporting",
      icon: "bi-speedometer2",
      gradient: "from-green-500 to-teal-600"
    },
    {
      title: "Multi-Language Support",
      desc: "Available in English, Spanish, French, and Hindi",
      icon: "bi-globe",
      gradient: "from-orange-500 to-red-600"
    },
    {
      title: "Modern UI/UX",
      desc: "Responsive design with accessibility features",
      icon: "bi-palette",
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <div className="about-page container-fluid py-5">
      <div className="about-wrapper">
        {/* Hero Section */}
        <div className="about-hero-section">
          <div className="about-hero-card">
            <div className="hero-content">
              <div className="hero-badge">
                <i className="bi bi-rocket-takeoff me-2"></i>
                {t("home.workplaceTracker")}
              </div>
              <h1 className="hero-title">
                Smart Workplace Management
                <span className="hero-highlight"> for Modern Teams</span>
              </h1>
              <p className="hero-subtitle">
                Comprehensive attendance tracking, leave management, and team analytics 
                in a beautiful, user-friendly interface.
              </p>
              <div className="hero-actions">
                <a href={ROUTES.PUBLIC.LOGIN} className="btn btn-hero-primary">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Get Started
                </a>
                <a href={ROUTES.PUBLIC.CONTACT} className="btn btn-hero-secondary">
                  <i className="bi bi-chat-dots me-2"></i>
                  Learn More
                </a>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-chart">
                <div className="chart-bar" style={{height: '60%'}}></div>
                <div className="chart-bar" style={{height: '80%'}}></div>
                <div className="chart-bar" style={{height: '45%'}}></div>
                <div className="chart-bar" style={{height: '90%'}}></div>
                <div className="chart-bar" style={{height: '70%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Highlights */}
        <div className="highlights-section">
          <div className="section-header">
            <h2 className="section-title">Why Choose Workplace Tracker?</h2>
            <p className="section-subtitle">Powerful features designed for efficiency and growth</p>
          </div>
          <div className="highlights-grid">
            {keyHighlights.map((highlight, index) => (
              <div key={index} className="highlight-card">
                <div className="highlight-icon">
                  <i className={`bi ${highlight.icon}`}></i>
                </div>
                <h3 className="highlight-title">{highlight.title}</h3>
                <p className="highlight-desc">{highlight.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* User Features */}
        <div className="features-section">
          <div className="section-header">
            <h2 className="section-title">User Features</h2>
            <p className="section-subtitle">Everything employees need for daily productivity</p>
          </div>
          <div className="features-grid">
            {userFeatures.map((feature, index) => (
              <div key={index} className={`feature-card feature-${feature.category}`}>
                <div className="feature-header">
                  <div className="feature-icon">
                    <i className={`bi ${feature.icon}`}></i>
                  </div>
                  <div className="feature-category">{feature.category}</div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Features */}
        <div className="features-section">
          <div className="section-header">
            <h2 className="section-title">Admin Features</h2>
            <p className="section-subtitle">Comprehensive tools for workplace management</p>
          </div>
          <div className="features-grid admin-grid">
            {adminFeatures.map((feature, index) => (
              <div key={index} className={`feature-card admin-feature feature-${feature.category}`}>
                <div className="feature-header">
                  <div className="feature-icon admin-icon">
                    <i className={`bi ${feature.icon}`}></i>
                  </div>
                  <div className="feature-category admin-category">{feature.category}</div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Info */}
        <div className="tech-section">
          <div className="tech-card">
            <div className="row g-0">
              <div className="col-md-8">
                <div className="tech-content">
                  <h2 className="tech-title">Built with Modern Technology</h2>
                  <p className="tech-desc">
                    Workplace Tracker is built using cutting-edge web technologies to ensure 
                    performance, security, and scalability. The application features a responsive 
                    design that works seamlessly across all devices.
                  </p>
                  <div className="tech-stats">
                    <div className="stat-item">
                      <div className="stat-number">React 19</div>
                      <div className="stat-label">Latest Framework</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">TypeScript</div>
                      <div className="stat-label">Type Safety</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">4 Languages</div>
                      <div className="stat-label">i18n Support</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="tech-visual">
                  <div className="tech-icons">
                    <div className="tech-icon react-icon">
                      <i className="bi bi-code-slash"></i>
                    </div>
                    <div className="tech-icon ts-icon">
                      <i className="bi bi-braces"></i>
                    </div>
                    <div className="tech-icon globe-icon">
                      <i className="bi bi-globe"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="about-footer">
          <div className="footer-content">
            <div className="footer-item">
              <div className="footer-label">Version</div>
              <div className="footer-value">v1.0.0</div>
            </div>
            <div className="footer-item">
              <div className="footer-label">Developer</div>
              <div className="footer-value">Siddhant Patni</div>
            </div>
            <div className="footer-item">
              <div className="footer-label">Contact</div>
              <a href="mailto:siddhant4patni@gmail.com" className="footer-link">
                siddhant4patni@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Company Statistics */}
        <div className="stats-section">
          <div className="section-header">
            <h2 className="section-title">Trusted by Teams Worldwide</h2>
            <p className="section-subtitle">Join thousands of organizations using Workplace Tracker</p>
          </div>
          <div className="stats-grid">
            {companyStats.map((stat, index) => (
              <div key={index} className={`stat-card stat-${stat.color}`}>
                <div className="stat-icon">
                  <i className={`bi ${stat.icon}`}></i>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="tech-stack-section">
          <div className="section-header">
            <h2 className="section-title">Built with Modern Technology</h2>
            <p className="section-subtitle">Powered by industry-leading tools and frameworks</p>
          </div>
          <div className="tech-grid">
            {techStack.map((tech, index) => (
              <div key={index} className="tech-card">
                <div className="tech-icon">
                  <i className={`bi ${tech.icon}`}></i>
                </div>
                <div className="tech-content">
                  <h3 className="tech-name">{tech.name}</h3>
                  <div className="tech-category">{tech.category}</div>
                  <p className="tech-desc">{tech.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Features */}
        <div className="security-section">
          <div className="section-header">
            <h2 className="section-title">Enterprise-Grade Security</h2>
            <p className="section-subtitle">Your data is protected with industry-leading security measures</p>
          </div>
          <div className="security-grid">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="security-card">
                <div className="security-header">
                  <div className="security-icon">
                    <i className={`bi ${feature.icon}`}></i>
                  </div>
                  <div className="security-level">{feature.level}</div>
                </div>
                <div className="security-content">
                  <h3 className="security-title">{feature.title}</h3>
                  <p className="security-desc">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integrations */}
        <div className="integrations-section">
          <div className="section-header">
            <h2 className="section-title">Seamless Integrations</h2>
            <p className="section-subtitle">Connect with your favorite tools and workflows</p>
          </div>
          <div className="integrations-grid">
            {integrations.map((integration, index) => (
              <div key={index} className="integration-card">
                <div className="integration-icon">
                  <i className={`bi ${integration.icon}`}></i>
                </div>
                <div className="integration-content">
                  <h3 className="integration-name">{integration.name}</h3>
                  <div className="integration-category">{integration.category}</div>
                  <p className="integration-desc">{integration.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & Plans */}
        <div className="pricing-section">
          <div className="section-header">
            <h2 className="section-title">Simple, Transparent Pricing</h2>
            <p className="section-subtitle">Choose the plan that fits your team size and needs</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card pricing-starter">
              <div className="pricing-header">
                <h3 className="pricing-title">Starter</h3>
                <div className="pricing-price">
                  <span className="price-currency">$</span>
                  <span className="price-amount">9</span>
                  <span className="price-period">/user/month</span>
                </div>
                <p className="pricing-desc">Perfect for small teams getting started</p>
              </div>
              <div className="pricing-features">
                <div className="feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Up to 10 users</span>
                </div>
                <div className="feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Basic attendance tracking</span>
                </div>
                <div className="feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Leave management</span>
                </div>
                <div className="feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Email support</span>
                </div>
              </div>
              <button className="pricing-btn">Get Started</button>
            </div>

            <div className="pricing-card pricing-professional">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-header">
                <h3 className="pricing-title">Professional</h3>
                <div className="pricing-price">
                  <span className="price-currency">$</span>
                  <span className="price-amount">19</span>
                  <span className="price-period">/user/month</span>
                </div>
                <p className="pricing-desc">Advanced features for growing teams</p>
              </div>
              <div className="pricing-features">
                <div className="feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Up to 100 users</span>
                </div>
                <div className="feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Advanced analytics</span>
                </div>
                <div className="feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Custom policies</span>
                </div>
                <div className="feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Priority support</span>
                </div>
                <div className="feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>API access</span>
                </div>
              </div>
              <button className="pricing-btn">Start Free Trial</button>
            </div>

            <div className="pricing-card pricing-enterprise">
              <div className="pricing-header">
                <h3 className="pricing-title">Enterprise</h3>
                <div className="pricing-price">
                  <span className="price-text">Custom</span>
                </div>
                <p className="pricing-desc">Tailored solutions for large organizations</p>
              </div>
              <div className="pricing-features">
                <div className="feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Unlimited users</span>
                </div>
                <div className="feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Custom integrations</span>
                </div>
                <div className="feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Dedicated support</span>
                </div>
                <div className="feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>SLA guarantee</span>
                </div>
                <div className="feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>On-premise deployment</span>
                </div>
              </div>
              <button className="pricing-btn">Contact Sales</button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">Common questions about Workplace Tracker</p>
          </div>
          <div className="faq-grid">
            <div className="faq-item">
              <h3 className="faq-question">How secure is my data?</h3>
              <p className="faq-answer">
                We use enterprise-grade security including AES-256 encryption, SOC 2 compliance, 
                and regular security audits to protect your data.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Can I integrate with existing tools?</h3>
              <p className="faq-answer">
                Yes! We support integrations with Slack, Microsoft Teams, Google Workspace, 
                and many more through our REST API.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Is there a mobile app?</h3>
              <p className="faq-answer">
                Our web application is fully responsive and works great on mobile devices. 
                Native mobile apps are coming soon!
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What support options are available?</h3>
              <p className="faq-answer">
                We offer email support for all plans, priority support for Professional users, 
                and dedicated support for Enterprise customers.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Can I customize leave policies?</h3>
              <p className="faq-answer">
                Absolutely! Admin users can create custom leave policies, set approval workflows, 
                and configure holiday calendars for their organization.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Is there a free trial?</h3>
              <p className="faq-answer">
                Yes! We offer a 14-day free trial for the Professional plan with no credit card required. 
                Experience all features before committing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
