import React, { memo, useMemo } from "react";
import "./header.css";

export interface HeaderProps {
  /** Main title text - required */
  title: string;
  /** Optional subtitle/description text */
  subtitle?: string;
  /** Small text above title (e.g., "Dashboard") */
  eyebrow?: string;
  /** Optional background image URL */
  bgImage?: string;
  /** Optional slot for buttons or small controls */
  actions?: React.ReactNode;
  /** Custom ID for the header element */
  id?: string;
  /** Custom CSS class names */
  className?: string;
  /** Whether to show the decorative wave at bottom */
  showWave?: boolean;
  /** Accessibility level for the title (default: 1) */
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Custom ARIA label */
  ariaLabel?: string;
  /** Callback fired when header is clicked */
  onClick?: () => void;
  /** Loading state */
  isLoading?: boolean;
}

const Header: React.FC<HeaderProps> = memo(({
  title,
  subtitle,
  eyebrow,
  bgImage,
  actions,
  id = "page-header",
  className = "",
  showWave = true,
  titleLevel = 1,
  ariaLabel,
  onClick,
  isLoading = false
}) => {
  // Memoize style object to prevent unnecessary re-renders
  const headerStyle = useMemo(() => {
    if (!bgImage) return undefined;
    
    // Basic URL validation
    try {
      new URL(bgImage);
      return { backgroundImage: `url(${bgImage})` };
    } catch {
      console.warn('Header: Invalid bgImage URL provided');
      return undefined;
    }
  }, [bgImage]);

  // Memoize CSS classes
  const headerClasses = useMemo(() => {
    const baseClasses = "header-section text-white";
    const customClasses = className.trim();
    const clickableClass = onClick ? "header-clickable" : "";
    const loadingClass = isLoading ? "header-loading" : "";
    
    return [baseClasses, customClasses, clickableClass, loadingClass]
      .filter(Boolean)
      .join(" ");
  }, [className, onClick, isLoading]);

  // Memoize title element
  const titleElement = useMemo(() => {
    const titleClasses = titleLevel === 1 ? "fw-bold header-title" : `fw-bold header-title h${titleLevel}`;
    
    const content = isLoading ? (
      <span className="placeholder-glow">
        <span className="placeholder col-6"></span>
      </span>
    ) : (
      title
    );

    // Use React.createElement to create dynamic heading elements
    switch (titleLevel) {
      case 1:
        return <h1 className={titleClasses}>{content}</h1>;
      case 2:
        return <h2 className={titleClasses}>{content}</h2>;
      case 3:
        return <h3 className={titleClasses}>{content}</h3>;
      case 4:
        return <h4 className={titleClasses}>{content}</h4>;
      case 5:
        return <h5 className={titleClasses}>{content}</h5>;
      case 6:
        return <h6 className={titleClasses}>{content}</h6>;
      default:
        return <h1 className={titleClasses}>{content}</h1>;
    }
  }, [title, titleLevel, isLoading]);

  // Memoize wave SVG
  const waveElement = useMemo(() => {
    if (!showWave) return null;
    
    return (
      <div className="header-wave" aria-hidden="true">
        <svg 
          viewBox="0 0 1440 80" 
          preserveAspectRatio="none" 
          focusable="false"
          role="presentation"
        >
          <path 
            d="M0,40 C360,100 1080,-20 1440,40 L1440,80 L0,80 Z" 
            fill="rgba(255,255,255,0.07)"
          />
        </svg>
      </div>
    );
  }, [showWave]);

  // Handle click events
  const handleClick = useMemo(() => {
    if (!onClick) return undefined;
    
    return () => {
      if (!isLoading) {
        onClick();
      }
    };
  }, [onClick, isLoading]);

  // Generate ARIA label
  const effectiveAriaLabel = useMemo(() => {
    if (ariaLabel) return ariaLabel;
    
    const parts = [eyebrow, title, subtitle].filter(Boolean);
    return parts.join(' - ');
  }, [ariaLabel, eyebrow, title, subtitle]);

  return (
    <header
      id={id}
      className={headerClasses}
      style={headerStyle}
      role="banner"
      aria-label={effectiveAriaLabel}
      onClick={handleClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="header-overlay" aria-hidden="true" />
      
      <div className="header-inner container">
        {eyebrow && (
          <div className="header-eyebrow">
            {isLoading ? (
              <span className="placeholder-glow">
                <span className="placeholder col-4"></span>
              </span>
            ) : (
              eyebrow
            )}
          </div>
        )}
        
        {titleElement}
        
        {subtitle && (
          <p className="lead header-subtitle">
            {isLoading ? (
              <span className="placeholder-glow">
                <span className="placeholder col-8"></span>
              </span>
            ) : (
              subtitle
            )}
          </p>
        )}

        {actions && !isLoading && (
          <div className="header-actions mt-3" role="group">
            {actions}
          </div>
        )}
        
        {isLoading && (
          <div className="header-actions mt-3" role="status" aria-label="Loading actions">
            <div className="placeholder-glow d-flex gap-2 justify-content-center">
              <span className="placeholder col-2"></span>
              <span className="placeholder col-2"></span>
            </div>
          </div>
        )}
      </div>

      {waveElement}
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
