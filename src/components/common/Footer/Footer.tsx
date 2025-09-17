import React, { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { DateUtils } from "../../../utils";
import { useTranslation } from "../../../hooks/useTranslation";
import "./footer.css";

export interface FooterProps {
  /** Custom CSS class names */
  className?: string;
  /** Company name override */
  companyName?: string;
  /** Developer name override */
  developerName?: string;
  /** Developer URL for link */
  developerUrl?: string;
  /** Show social links */
  showSocialLinks?: boolean;
  /** Show additional footer links */
  showFooterLinks?: boolean;
  /** Custom copyright year */
  copyrightYear?: number;
  /** Additional footer content */
  children?: React.ReactNode;
}

interface FooterLink {
  to: string;
  label: string;
  external?: boolean;
}

interface SocialLink {
  url: string;
  icon: string;
  label: string;
}

const Footer: React.FC<FooterProps> = memo(({
  className = "",
  companyName = "Workplace Tracker",
  developerName = "Siddhant Patni",
  developerUrl,
  showSocialLinks = false,
  showFooterLinks = true,
  copyrightYear,
  children
}) => {
  const { t } = useTranslation();
  
  // Memoize current year
  const currentYear = useMemo(() => {
    return copyrightYear || DateUtils.getCurrentYear();
  }, [copyrightYear]);

  // Memoize footer navigation links
  const footerLinks = useMemo<FooterLink[]>(() => [
    { to: "/about", label: t("navigation.about") },
    { to: "/contact", label: t("navigation.contact") },
    { to: "/privacy", label: t("footer.privacyPolicy") },
    { to: "/terms", label: t("footer.termsOfService") }
  ], [t]);

  // Memoize social links
  const socialLinks = useMemo<SocialLink[]>(() => [
    { url: "https://github.com", icon: "bi-github", label: "GitHub" },
    { url: "https://linkedin.com", icon: "bi-linkedin", label: "LinkedIn" },
    { url: "https://twitter.com", icon: "bi-twitter", label: "Twitter" }
  ], []);

  // Memoize CSS classes
  const footerClasses = useMemo(() => {
    const baseClasses = "footer text-light text-center py-3 mt-auto";
    const customClasses = className.trim();
    
    return [baseClasses, customClasses].filter(Boolean).join(" ");
  }, [className]);

  // Render footer link
  const renderFooterLink = useMemo(() => (link: FooterLink) => {
    if (link.external) {
      return (
        <a
          key={link.to}
          href={link.to}
          className="footer-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${link.label} (opens in new tab)`}
        >
          {link.label}
        </a>
      );
    }

    return (
      <Link
        key={link.to}
        to={link.to}
        className="footer-link"
        aria-label={link.label}
      >
        {link.label}
      </Link>
    );
  }, []);

  // Render social link
  const renderSocialLink = useMemo(() => (social: SocialLink) => (
    <a
      key={social.url}
      href={social.url}
      className="social-link"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Follow us on ${social.label} (opens in new tab)`}
    >
      <i className={social.icon} aria-hidden="true"></i>
    </a>
  ), []);

  // Memoize developer section
  const developerSection = useMemo(() => {
    if (developerUrl) {
      return (
        <small className="footer-dev">
          {t("footer.developedBy")}{" "}
          <a
            href={developerUrl}
            className="dev-name"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("footer.visitDeveloperWebsite", { name: developerName })}
          >
            {developerName}
          </a>
        </small>
      );
    }

    return (
      <small className="footer-dev">
        Developed by <span className="dev-name">{developerName}</span>
      </small>
    );
  }, [developerName, developerUrl, t]);

  return (
    <footer className={footerClasses} role="contentinfo">
      <div className="container">
        {/* Main Footer Content */}
        <div className="row align-items-center gy-3">
          {/* Copyright Section */}
          <div className="col-lg-4 col-md-6">
            <small className="footer-copy">
              © {currentYear} {companyName}. All rights reserved.
            </small>
          </div>

          {/* Footer Links */}
          {showFooterLinks && (
            <div className="col-lg-4 col-md-6">
              <nav 
                className="footer-nav"
                aria-label="Footer navigation"
              >
                <ul className="footer-links list-unstyled d-flex justify-content-center gap-3 mb-0">
                  {footerLinks.map(renderFooterLink)}
                </ul>
              </nav>
            </div>
          )}

          {/* Developer & Social Section */}
          <div className="col-lg-4 col-12">
            <div className="d-flex flex-column align-items-center gap-2">
              {developerSection}
              
              {/* Social Links */}
              {showSocialLinks && (
                <div className="social-links d-flex gap-2" role="group" aria-label="Social media links">
                  {socialLinks.map(renderSocialLink)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Content */}
        {children && (
          <div className="footer-additional mt-3 pt-3 border-top border-secondary">
            {children}
          </div>
        )}
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
