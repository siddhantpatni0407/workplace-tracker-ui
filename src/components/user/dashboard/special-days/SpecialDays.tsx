// src/components/user/dashboard/special-days/SpecialDays.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../../../hooks/useTranslation';
import SpecialDaysService from '../../../../services/specialDaysService';
import { SpecialDayRecord } from '../../../../types/api';
import SpecialDaysModal from './SpecialDaysModal';

export interface SpecialDay {
  id: string;
  name: string;
  email: string;
  designation: string;
  city: string;
  country: string;
  date: string; // ISO date string
  type: 'birthday' | 'work-anniversary';
  yearsOfService?: number; // Only for work anniversaries
  originalBirthDate?: string; // Only for birthdays
  originalJoiningDate?: string; // Only for work anniversaries
}

export interface SpecialDaysProps {
  className?: string;
}

// Helper function to check if a year is leap year
const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

// Helper function to calculate years between dates
const calculateYearsBetween = (startDate: string): number => {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(diffYears);
};

// Transform API data to SpecialDay format
const transformApiDataToSpecialDays = (records: SpecialDayRecord[]): SpecialDay[] => {
  const specialDays: SpecialDay[] = [];
  const currentYear = new Date().getFullYear();

  records.forEach(record => {
    // Add birthday entry
    if (record.dateOfBirth) {
      const birthDate = new Date(record.dateOfBirth);
      const thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
      
      specialDays.push({
        id: `${record.userId}-birthday`,
        name: record.name,
        email: record.email,
        designation: record.designation || 'Employee',
        city: record.city,
        country: record.country,
        date: thisYearBirthday.toISOString().split('T')[0],
        type: 'birthday' as const,
        originalBirthDate: record.dateOfBirth
      });
    }
    
    // Add work anniversary entry
    if (record.dateOfJoining) {
      const joiningDate = new Date(record.dateOfJoining);
      const joiningMonth = joiningDate.getMonth();
      const joiningDay = joiningDate.getDate();
      
      // Create this year's anniversary date (2025)
      let thisYearAnniversary = new Date(currentYear, joiningMonth, joiningDay);
      
      // Handle leap year edge case (Feb 29th)
      if (joiningMonth === 1 && joiningDay === 29 && !isLeapYear(currentYear)) {
        // If joined on Feb 29th but current year is not leap year, use Feb 28th
        thisYearAnniversary = new Date(currentYear, 1, 28);
      }
      
      const yearsOfService = calculateYearsBetween(record.dateOfJoining);
      
      // Only add if they have completed at least 1 year
      if (yearsOfService > 0) {
        specialDays.push({
          id: `${record.userId}-anniversary`,
          name: record.name,
          email: record.email,
          designation: record.designation || 'Employee',
          city: record.city,
          country: record.country,
          date: thisYearAnniversary.toISOString().split('T')[0],
          type: 'work-anniversary' as const,
          yearsOfService: yearsOfService,
          originalJoiningDate: record.dateOfJoining
        });
      }
    }
  });
  
  return specialDays;
};

const SpecialDays: React.FC<SpecialDaysProps> = ({ className }) => {
  const { t } = useTranslation();
  
  // Enhanced state for API integration and filtering
  const [specialDaysData, setSpecialDaysData] = useState<SpecialDay[]>([]);
  const [fullYearData, setFullYearData] = useState<SpecialDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'birthday' | 'work-anniversary'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYear] = useState<number>(new Date().getFullYear());

  // Fetch special days data from API
  useEffect(() => {
    const fetchSpecialDays = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the current month endpoint which returns separate arrays
        const monthResponse = await SpecialDaysService.getCurrentMonthSpecialDays({
          month: selectedMonth,
          year: selectedYear,
          limit: 50
        });
        
        // Use the main endpoint for full year data 
        const yearResponse = await SpecialDaysService.getSpecialDays({
          year: selectedYear,
          limit: 1000
        });
        
        if (monthResponse.status === 'SUCCESS' && monthResponse.data) {
          const allRecords: SpecialDayRecord[] = [];
          
          if (monthResponse.data.birthdays) {
            allRecords.push(...monthResponse.data.birthdays);
          }
          if (monthResponse.data.anniversaries) {
            allRecords.push(...monthResponse.data.anniversaries);
          }
          
          const transformedMonthData = transformApiDataToSpecialDays(allRecords);
          setSpecialDaysData(transformedMonthData);
        }
        
        if (yearResponse.status === 'SUCCESS' && yearResponse.data && yearResponse.data.records) {
          const transformedYearData = transformApiDataToSpecialDays(yearResponse.data.records);
          setFullYearData(transformedYearData);
        }
        
        if (monthResponse.status !== 'SUCCESS') {
          setError(monthResponse.message || 'Failed to fetch special days data');
        }
      } catch (err) {
        console.error('Error fetching special days:', err);
        setError('Failed to load special days. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialDays();
  }, [selectedMonth, selectedYear]);

  // Filter functions for department and location
  const departments = useMemo(() => {
    const depts = new Set<string>();
    specialDaysData.forEach(day => {
      const dept = (day.designation || 'Employee').split(' ')[0];
      depts.add(dept);
    });
    return ['all', ...Array.from(depts)];
  }, [specialDaysData]);

  const locations = useMemo(() => {
    const locs = new Set<string>();
    specialDaysData.forEach(day => {
      locs.add(day.city);
    });
    return ['all', ...Array.from(locs)];
  }, [specialDaysData]);

  // Current month and year
  const currentMonth = selectedMonth;
  const currentYear = selectedYear;

  // Filter data for selected month with enhanced filtering
  const currentMonthDays = useMemo(() => {
    return specialDaysData.filter(day => {
      const dayDate = new Date(day.date + 'T00:00:00');
      const dayMonth = dayDate.getMonth() + 1;
      const dayYear = dayDate.getFullYear();
      
      let monthMatch = false;
      if (day.type === 'birthday') {
        monthMatch = dayMonth === currentMonth && dayYear === currentYear;
      } else if (day.type === 'work-anniversary') {
        monthMatch = dayMonth === currentMonth;
      }
      
      if (!monthMatch) return false;
      
      if (selectedDepartment !== 'all') {
        const dayDept = (day.designation || 'Employee').split(' ')[0];
        if (dayDept !== selectedDepartment) return false;
      }
      
      if (selectedLocation !== 'all') {
        if (day.city !== selectedLocation) return false;
      }
      
      return true;
    });
  }, [specialDaysData, currentMonth, currentYear, selectedDepartment, selectedLocation]);

  // Get all year data for modal
  const yearSpecialDays = useMemo(() => {
    return fullYearData.filter(day => {
      const dayDate = new Date(day.date + 'T00:00:00');
      return dayDate.getFullYear() === selectedYear;
    });
  }, [fullYearData, selectedYear]);

  // Filter by type
  const filteredDays = useMemo(() => {
    if (selectedType === 'all') return currentMonthDays;
    return currentMonthDays.filter(day => day.type === selectedType);
  }, [currentMonthDays, selectedType]);

  // Group by type
  const groupedDays = useMemo(() => {
    const birthdays = filteredDays.filter(day => day.type === 'birthday');
    const anniversaries = filteredDays.filter(day => day.type === 'work-anniversary');
    return { birthdays, anniversaries };
  }, [filteredDays]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSeeAllClick = () => {
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className={`special-days-component loading ${className || ''}`}>
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Loading special days...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`special-days-component error ${className || ''}`}>
        <div className="error-content">
          <i className="fas fa-exclamation-triangle"></i>
          <h4>Error Loading Special Days</h4>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-redo"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`special-days-component ${className || ''}`}>
        {/* Enhanced Header */}
        <div className="special-days-header">
          <div className="header-left">
            <h4 className="special-days-title">
              <i className="fas fa-gift"></i>
              Special Days
            </h4>
            <span className="month-indicator">
              {new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="header-actions">
            <button 
              className="see-all-btn"
              onClick={handleSeeAllClick}
            >
              <i className="fas fa-external-link-alt"></i>
              See All
            </button>
          </div>
        </div>

        {/* Enhanced Filters - Always Visible */}
        <div className="special-days-filters permanent-filters">
          <div className="filter-row compact">
            <div className="filter-group compact">
              <label>Type:</label>
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="filter-select compact"
              >
                <option value="all">All Types</option>
                <option value="birthday">Birthdays</option>
                <option value="work-anniversary">Anniversaries</option>
              </select>
            </div>
            
            <div className="filter-group compact">
              <label>Month:</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="filter-select compact"
              >
                {Array.from({length: 12}, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2025, i).toLocaleDateString('en-US', { month: 'short' })}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group compact">
              <label>Department:</label>
              <select 
                value={selectedDepartment} 
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="filter-select compact"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Depts' : dept}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group compact">
              <label>Location:</label>
              <select 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="filter-select compact"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>
                    {loc === 'all' ? 'All Locations' : loc.length > 10 ? loc.substring(0, 10) + '...' : loc}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-actions compact">
              <button 
                className="reset-filters-btn compact"
                onClick={() => {
                  setSelectedType('all');
                  setSelectedDepartment('all');
                  setSelectedLocation('all');
                  setSelectedMonth(new Date().getMonth() + 1);
                }}
                title="Reset all filters"
              >
                <i className="fas fa-undo"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="special-days-content">
          {/* Birthday Section */}
          <div className="special-days-section">
            <div className="section-header birthday-section">
              <h5 className="section-subtitle">Birthday</h5>
            </div>
            <div className="special-days-list">
              {groupedDays.birthdays.length > 0 ? (
                groupedDays.birthdays.slice(0, 1).map((day: SpecialDay) => (
                  <div key={day.id} className="special-day-item">
                    <div className="person-avatar">
                      <span className="initials">
                        {day.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div className="person-info">
                      <div className="person-name">{day.name}</div>
                      <div className="person-date">
                        {formatDate(day.date)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-events">No birthdays this month</div>
              )}
            </div>
          </div>

          {/* Work Anniversary Section */}
          <div className="special-days-section">
            <div className="section-header anniversary-section">
              <h5 className="section-subtitle">Work Anniversary</h5>
            </div>
            <div className="special-days-list">
              {groupedDays.anniversaries.length > 0 ? (
                groupedDays.anniversaries.slice(0, 2).map((day: SpecialDay) => (
                  <div key={day.id} className="special-day-item">
                    <div className="person-avatar">
                      <span className="initials">
                        {day.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div className="person-info">
                      <div className="person-name">{day.name}</div>
                      <div className="person-date">
                        {formatDate(day.date)}
                      </div>
                    </div>
                    <div className="years-badge">
                      <span className="years-number">{day.yearsOfService}</span>
                      <span className="years-text">YEARS</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-events">No anniversaries this month</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for See All */}
      <SpecialDaysModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        year={selectedYear}
        specialDays={yearSpecialDays}
      />
    </>
  );
};

export default SpecialDays;