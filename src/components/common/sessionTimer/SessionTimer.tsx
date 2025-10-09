// src/components/common/sessionTimer/SessionTimer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { TokenService } from '../../../services/tokenService';
import { authService } from '../../../services/authService';

export const SessionTimer: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState<string>('--:--');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [sessionInfo, setSessionInfo] = useState<{ loginTime: Date | null; expiryTime: Date | null } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const refreshTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    const updateTimer = async () => {
      const remainingSeconds = TokenService.getTokenExpiryTime();
      const info = TokenService.getSessionInfo();
      
      setSessionInfo(info);
      
      if (!remainingSeconds || remainingSeconds <= 0) {
        setTimeRemaining('00:00');
        setIsExpired(true);
        refreshTriggeredRef.current = false; // Reset for next session
        return;
      }

      setIsExpired(false);
      
      // Proactive refresh when 2-3 minutes remaining (120-180 seconds)
      if (remainingSeconds <= 180 && remainingSeconds > 120 && !refreshTriggeredRef.current && !isRefreshing) {
        refreshTriggeredRef.current = true;
        setIsRefreshing(true);
        
        try {
          console.log(`🔄 Proactive token refresh triggered - ${Math.floor(remainingSeconds/60)}:${(remainingSeconds%60).toString().padStart(2, '0')} remaining`);
          const result = await authService.refresh();
          
          if (result.status === 'SUCCESS') {
            console.log('✅ Proactive token refresh successful');
            
            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
              detail: { timestamp: Date.now(), type: 'proactive', source: 'sessionTimer' }
            }));
            
            // The timer will automatically show the new time on next update
          }
        } catch (error) {
          console.error('❌ Proactive token refresh failed:', error);
          // Don't reset refreshTriggeredRef on error to prevent retry loops
        } finally {
          setIsRefreshing(false);
        }
      }
      
      // Convert seconds to MM:SS format
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      setTimeRemaining(formattedTime);
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isRefreshing]);

  // Reset refresh trigger when token is refreshed externally
  useEffect(() => {
    const handleTokenRefreshed = () => {
      console.log('🔄 Token refreshed externally, resetting refresh trigger');
      refreshTriggeredRef.current = false;
      setIsRefreshing(false);
    };

    window.addEventListener('auth:token-refreshed', handleTokenRefreshed);
    return () => window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
  }, []);

  if (!TokenService.hasAccessToken()) {
    return null;
  }

  // Create tooltip with session details
  const tooltipText = sessionInfo 
    ? `Login: ${sessionInfo.loginTime?.toLocaleTimeString() || 'Unknown'}\nExpires: ${sessionInfo.expiryTime?.toLocaleTimeString() || 'Unknown'}\nRemaining: ${timeRemaining}`
    : 'Session Time Remaining';

  return (
    <div 
      className={`text-white fw-bold px-3 py-2 rounded ${isExpired ? 'bg-danger' : ''} me-2 ${isRefreshing ? 'animate-pulse' : ''}`}
      title={isRefreshing ? 'Refreshing session...' : tooltipText}
      style={{ 
        cursor: 'help',
        fontSize: '14px',
        fontFamily: 'monospace',
        letterSpacing: '1px',
        minWidth: '120px',
        textAlign: 'center',
        backgroundColor: isExpired ? undefined : isRefreshing ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}
    >
      {isRefreshing && <i className="bi bi-arrow-clockwise me-1" />}
      Session Time:{timeRemaining}
    </div>
  );
};