// src/components/common/notifications/UserNotifications.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import notificationService, { UpcomingEvent } from '../../../services/notificationService';
import { DateUtils } from '../../../utils/date';
import { HolidayType, HolidayTypeColors } from '../../../enums/HolidayEnums';
import { LeaveType, LeaveTypeColors } from '../../../enums/LeaveEnums';
import { ROUTES } from '../../../constants';
import './userNotifications.css';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserNotifications: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose
}) => {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Days to look ahead for events
  const days = 30;
  // Maximum number of events to show in each section
  const maxItems = 5;
  
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.userId) return;
      
      try {
        setLoading(true);
        const upcomingEvents = await notificationService.getUpcomingEvents(user.userId, days);
        console.log('Notification events received:', upcomingEvents);
        console.log('Holiday events:', upcomingEvents.filter((e: UpcomingEvent) => e.type === 'HOLIDAY'));
        console.log('Leave events:', upcomingEvents.filter((e: UpcomingEvent) => e.type === 'LEAVE'));
        setEvents(upcomingEvents);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch upcoming events', err);
        setError('Failed to load upcoming events');
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen) {
      fetchEvents();
    }
  }, [user?.userId, isOpen]);
  
  // Get color based on event type and category
  const getEventColor = (event: UpcomingEvent): string => {
    if (event.type === 'HOLIDAY') {
      return HolidayTypeColors[event.category as HolidayType] || '#6b7280';
    } else {
      // For leaves, use a fixed color since we're not using leave types anymore
      return '#4299e1'; // Using a blue color for leaves
    }
  };
  
  // Format days until text
  const getDaysText = (daysUntil: number): string => {
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    return `In ${daysUntil} days`;
  };

  // Count unread notifications - for badge
  const unreadCount = useMemo(() => {
    // Consider all events in the next 3 days as "unread" and worth highlighting
    const upcomingEvents = events.filter(event => event.daysUntil <= 3);
    return upcomingEvents.length;
  }, [events]);
  
  if (!isOpen) return null;
  
  return (
    <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
      <div className="notification-header">
        <h6 className="notification-title">
          <i className="bi bi-bell-fill me-2"></i>
          Upcoming Events
        </h6>
        <button 
          className="btn-close btn-close-white" 
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>
      
      <div className="notification-body">
        {loading && (
          <div className="notification-loading">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span>Loading events...</span>
          </div>
        )}
        
        {!loading && error && (
          <div className="notification-error">
            <i className="bi bi-exclamation-triangle-fill text-warning"></i>
            <span>{error}</span>
          </div>
        )}
        
        {!loading && !error && events.length === 0 && (
          <div className="notification-empty">
            <i className="bi bi-calendar-check"></i>
            <span>No upcoming events in the next {days} days</span>
          </div>
        )}
        
        {!loading && !error && events.length > 0 && (
          <>
            {/* Debug information */}
            <div className="p-2 mb-2" style={{display: 'none'}}>
              <small className="text-muted">
                Total events: {events.length}<br/>
                Holiday events: {events.filter(event => event.type === "HOLIDAY").length}<br/>
                Leave events: {events.filter(event => event.type === "LEAVE").length}
              </small>
            </div>

            {/* Holiday section */}
            {events.some(event => event.type === "HOLIDAY") && (
              <div className="notification-section">
                <div className="notification-section-header">
                  <span className="notification-section-title">
                    <i className="bi bi-calendar-event me-2"></i>
                    Holidays
                  </span>
                </div>
                <ul className="notification-list">
                  {events
                    .filter(event => event.type === "HOLIDAY")
                    .slice(0, maxItems)
                    .map((event) => (
                      <li key={`${event.type}-${event.id}`} className="notification-item">
                        <div 
                          className="notification-indicator" 
                          style={{ backgroundColor: getEventColor(event) }}
                        ></div>
                        <div className="notification-details">
                          <div className="notification-header-row">
                            <span className="notification-name">{event.name}</span>
                          </div>
                          <div className="notification-meta">
                            <span className="notification-date">
                              {DateUtils.formatDate(event.date, 'dd MMM yyyy')}
                            </span>
                            <span 
                              className={`notification-badge ${event.daysUntil === 0 ? 'today' : ''}`}
                            >
                              {getDaysText(event.daysUntil)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            )}
            
            {/* Leaves section */}
            <div className="notification-section">
              <div className="notification-section-header">
                <span className="notification-section-title">
                  <i className="bi bi-calendar-check me-2"></i>
                  Leaves
                </span>
              </div>
                <ul className="notification-list">
                  {events.filter(event => event.type === "LEAVE").length > 0 ? (
                    events
                      .filter(event => event.type === "LEAVE")
                      .slice(0, maxItems)
                      .map((event) => (
                        <li key={`${event.type}-${event.id}`} className="notification-item">
                          <div 
                            className="notification-indicator" 
                            style={{ backgroundColor: getEventColor(event) }}
                          ></div>
                          <div className="notification-details">
                            <div className="notification-header-row">
                              <span className="notification-name">{event.name || "Personal Leave"}</span>
                            </div>
                            <div className="notification-meta">
                              <span className="notification-date">
                                {DateUtils.formatDate(event.date, 'dd MMM yyyy')}
                              </span>
                              <span 
                                className={`notification-badge ${event.daysUntil === 0 ? 'today' : ''}`}
                              >
                                {getDaysText(event.daysUntil)}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))
                  ) : (
                    <li className="notification-item text-center">
                      <div className="notification-details">
                        <div className="notification-header-row justify-content-center">
                          <span className="notification-name text-muted">No upcoming leaves</span>
                        </div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
          </>
        )}
      </div>
      
      {/* Quick Links section removed as per requirement */}
    </div>
  );
};

// Standalone component to use for badge display in navbar
export const NotificationBadge: React.FC<{onClick?: () => void}> = ({ onClick }) => {
  const [count, setCount] = useState<number>(0);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchEventCount = async () => {
      if (!user?.userId) return;
      
      try {
        // Get events for next 14 days for the badge count
        const upcomingEvents = await notificationService.getUpcomingEvents(user.userId, 14); 
        
        // Focus on the events in the next 3 days for urgency
        const immediateEvents = upcomingEvents.filter((event: UpcomingEvent) => event.daysUntil <= 3);
        setCount(immediateEvents.length);
      } catch (err) {
        console.error('Failed to fetch notification count', err);
      }
    };
    
    fetchEventCount();
    
    // Refresh every 15 minutes
    const interval = setInterval(fetchEventCount, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.userId]);
  
  if (count === 0) {
    return (
      <button
        className="btn btn-link nav-link text-white p-0 position-relative"
        onClick={onClick}
        aria-label="Notifications"
      >
        <i className="bi bi-bell" style={{ fontSize: '1.2rem' }}></i>
      </button>
    );
  }
  
  return (
    <button
      className="btn btn-link nav-link text-white p-0 position-relative"
      onClick={onClick}
      aria-label={`${count} notifications`}
    >
      <i className="bi bi-bell-fill" style={{ fontSize: '1.2rem' }}></i>
      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        {count > 99 ? '99+' : count}
        <span className="visually-hidden">unread notifications</span>
      </span>
    </button>
  );
};

export default UserNotifications;