import React from 'react';
import './VersionNotification.css';

interface VersionNotificationProps {
  /** New version number */
  newVersion: string;
  
  /** Current version number */
  currentVersion: string;
  
  /** Whether to auto-hide the notification after a delay */
  autoHide?: boolean;
  
  /** Delay in milliseconds before auto-hiding (default: 10000) */
  autoHideDelay?: number;
  
  /** Callback when user clicks to reload */
  onReload?: () => void;
  
  /** Callback when user dismisses the notification */
  onDismiss?: () => void;
}

/**
 * Component that displays a notification when a new app version is available
 */
const VersionNotification: React.FC<VersionNotificationProps> = ({
  newVersion,
  currentVersion,
  autoHide = true,
  autoHideDelay = 10000,
  onReload = () => window.location.reload(),
  onDismiss
}) => {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (autoHide) {
      timeoutId = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, autoHideDelay);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [autoHide, autoHideDelay, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!visible) return null;

  return (
    <div className="version-notification">
      <div className="version-notification-content">
        <div className="version-notification-icon">
          <i className="bi bi-arrow-repeat" aria-hidden="true"></i>
        </div>
        <div className="version-notification-text">
          <div className="version-notification-title">New Version Available</div>
          <div className="version-notification-message">
            Version {newVersion} is now available. You&apos;re currently using {currentVersion}.
          </div>
        </div>
        <div className="version-notification-actions">
          <button 
            className="version-notification-reload"
            onClick={onReload}
            aria-label="Reload to update"
          >
            Refresh
          </button>
          <button 
            className="version-notification-dismiss"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
          >
            <i className="bi bi-x" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionNotification;