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
    const updateTimer = () => {
      const remainingSeconds = TokenService.getTokenExpiryTime();
      const info = TokenService.getSessionInfo();
      
      setSessionInfo(info);
      
      if (!remainingSeconds || remainingSeconds <= 0) {
        setTimeRemaining('00:00');
        setIsExpired(true);
        return;
      }

      setIsExpired(false);
      
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
      className={`text-white fw-bold px-3 py-2 rounded ${isExpired ? 'bg-danger' : ''} me-2`}
      title={tooltipText}
      style={{ 
        cursor: 'help',
        fontSize: '14px',
        fontFamily: 'monospace',
        letterSpacing: '1px',
        minWidth: '120px',
        textAlign: 'center',
        backgroundColor: isExpired ? undefined : 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}
    >
      Session Time:{timeRemaining}
    </div>
  );
};