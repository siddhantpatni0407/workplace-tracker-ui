// src/components/user/dashboard/special-days/SpecialDaysModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { SpecialDay } from './SpecialDays';
import { useTranslation } from '../../../../hooks/useTranslation';
import SpecialDaysService from '../../../../services/specialDaysService';
import { SpecialDayRecord } from '../../../../types/api';

interface SpecialDaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  specialDays: SpecialDay[]; // Keep for backward compatibility but will use API data
}

interface ApiPaginatedData {
  items: SpecialDay[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  loading: boolean;
}

// Transform API record to SpecialDay format
const transformToSpecialDay = (record: SpecialDayRecord, type: 'birthday' | 'work-anniversary'): SpecialDay => {
  const currentYear = new Date().getFullYear();
  
  if (type === 'birthday' && record.dateOfBirth) {
    const birthDate = new Date(record.dateOfBirth);
    const thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    
    return {
      id: `${record.userId}-birthday`,
      name: record.name,
      email: record.email,
      designation: record.designation || 'Employee',
      city: record.city,
      country: record.country,
      date: thisYearBirthday.toISOString().split('T')[0],
      type: 'birthday' as const,
      originalBirthDate: record.dateOfBirth
    };
  } else if (type === 'work-anniversary' && record.dateOfJoining) {
    const joiningDate = new Date(record.dateOfJoining);
    const thisYearAnniversary = new Date(currentYear, joiningDate.getMonth(), joiningDate.getDate());
    
    // Calculate years of service
    let years = currentYear - joiningDate.getFullYear();
    const monthDiff = thisYearAnniversary.getMonth() - joiningDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && thisYearAnniversary.getDate() < joiningDate.getDate())) {
      years--;
    }
    
    return {
      id: `${record.userId}-anniversary`,
      name: record.name,
      email: record.email,
      designation: record.designation || 'Employee',
      city: record.city,
      country: record.country,
      date: thisYearAnniversary.toISOString().split('T')[0],
      type: 'work-anniversary' as const,
      yearsOfService: Math.max(0, years),
      originalJoiningDate: record.dateOfJoining
    };
  }
  
  throw new Error('Invalid record or type');
};

const SpecialDaysModal: React.FC<SpecialDaysModalProps> = ({
  isOpen,
  onClose,
  year,
  specialDays // Fallback data
}) => {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'birthday' | 'work-anniversary'>('all');
  
  // API-based pagination state
  const [birthdaysApiData, setBirthdaysApiData] = useState<ApiPaginatedData>({
    items: [],
    totalPages: 0,
    currentPage: 1,
    totalItems: 0,
    loading: false
  });
  
  const [anniversariesApiData, setAnniversariesApiData] = useState<ApiPaginatedData>({
    items: [],
    totalPages: 0,
    currentPage: 1,
    totalItems: 0,
    loading: false
  });

  // Fetch birthdays from API with pagination
  const fetchBirthdays = async (page: number = 1) => {
    setBirthdaysApiData(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await SpecialDaysService.getBirthdays({
        year: year
      });
      
      if (response.status === 'SUCCESS' && response.data && response.data.records) {
        const transformedBirthdays = response.data.records.map(record => 
          transformToSpecialDay(record, 'birthday')
        );
        
        // Client-side pagination since API doesn't support pagination parameters
        const itemsPerPage = 8;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = transformedBirthdays.slice(startIndex, endIndex);
        
        setBirthdaysApiData({
          items: paginatedItems,
          totalPages: Math.ceil(transformedBirthdays.length / itemsPerPage),
          currentPage: page,
          totalItems: transformedBirthdays.length,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching birthdays:', error);
      setBirthdaysApiData(prev => ({ ...prev, loading: false }));
    }
  };

  // Fetch anniversaries from API with pagination
  const fetchAnniversaries = async (page: number = 1) => {
    setAnniversariesApiData(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await SpecialDaysService.getAnniversaries({
        year: year
      });
      
      if (response.status === 'SUCCESS' && response.data && response.data.records) {
        const transformedAnniversaries = response.data.records
          .filter(record => record.dateOfJoining) // Only records with joining date
          .map(record => transformToSpecialDay(record, 'work-anniversary'))
          .filter(anniversary => anniversary.yearsOfService && anniversary.yearsOfService > 0); // Only if > 1 year
        
        // Client-side pagination since API doesn't support pagination parameters
        const itemsPerPage = 8;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = transformedAnniversaries.slice(startIndex, endIndex);
        
        setAnniversariesApiData({
          items: paginatedItems,
          totalPages: Math.ceil(transformedAnniversaries.length / itemsPerPage),
          currentPage: page,
          totalItems: transformedAnniversaries.length,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching anniversaries:', error);
      setAnniversariesApiData(prev => ({ ...prev, loading: false }));
    }
  };

  // Load data when modal opens or filter changes
  useEffect(() => {
    if (isOpen) {
      if (selectedFilter === 'all' || selectedFilter === 'birthday') {
        fetchBirthdays(1);
      }
      if (selectedFilter === 'all' || selectedFilter === 'work-anniversary') {
        fetchAnniversaries(1);
      }
    }
  }, [isOpen, selectedFilter, year]);

  // Handle pagination changes
  const handleBirthdayPageChange = (page: number) => {
    fetchBirthdays(page);
  };

  const handleAnniversaryPageChange = (page: number) => {
    fetchAnniversaries(page);
  };

  // Handle filter change and reset pagination
  const handleFilterChange = (filter: 'all' | 'birthday' | 'work-anniversary') => {
    setSelectedFilter(filter);
    // Reset to page 1 when filter changes
    if (filter === 'all' || filter === 'birthday') {
      fetchBirthdays(1);
    }
    if (filter === 'all' || filter === 'work-anniversary') {
      fetchAnniversaries(1);
    }
  };

  // Calculate total counts
  const totalCountsData = useMemo(() => {
    return {
      birthdays: birthdaysApiData.totalItems,
      anniversaries: anniversariesApiData.totalItems,
      total: birthdaysApiData.totalItems + anniversariesApiData.totalItems
    };
  }, [birthdaysApiData.totalItems, anniversariesApiData.totalItems]);

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short'
    });
  };

  // Pagination component
  const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
  }> = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="pagination-container">
        <div className="pagination-info">
          <small className="text-muted">
            Showing {startItem}-{endItem} of {totalItems} items
          </small>
        </div>
        <nav className="pagination-nav">
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
            </li>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              </li>
            ))}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content special-days-modal">
          <div className="modal-header enhanced-header">
            <div className="header-content">
              <div className="title-section">
                <div className="title-icon">
                  <i className="fas fa-calendar-star"></i>
                </div>
                <div className="title-text">
                  <h4 className="modal-title">
                    Special Days for {year}
                  </h4>
                  <p className="modal-subtitle">
                    Complete overview of birthdays and work anniversaries
                  </p>
                </div>
              </div>
              <div className="header-actions">
                <div className="quick-stats">
                  <span className="stat-item">
                    <i className="fas fa-birthday-cake"></i>
                    {totalCountsData.birthdays} Birthdays
                  </span>
                  <span className="stat-item">
                    <i className="fas fa-award"></i>
                    {totalCountsData.anniversaries} Anniversaries
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-close enhanced-close"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="modal-body">
            {/* Enhanced Summary Cards */}
            <div className="summary-section mb-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="enhanced-summary-card birthdays-card">
                    <div className="card-gradient-bg"></div>
                    <div className="card-content">
                      <div className="card-icon-wrapper">
                        <div className="card-icon birthdays">
                          <i className="fas fa-birthday-cake"></i>
                        </div>
                      </div>
                      <div className="card-info">
                        <div className="card-number">{totalCountsData.birthdays}</div>
                        <div className="card-label">{t('birthdays') || 'Birthdays'}</div>
                        <div className="card-description">
                          Employee birth celebrations
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="enhanced-summary-card anniversaries-card">
                    <div className="card-gradient-bg"></div>
                    <div className="card-content">
                      <div className="card-icon-wrapper">
                        <div className="card-icon anniversaries">
                          <i className="fas fa-award"></i>
                        </div>
                      </div>
                      <div className="card-info">
                        <div className="card-number">{totalCountsData.anniversaries}</div>
                        <div className="card-label">{t('workAnniversaries') || 'Work Anniversaries'}</div>
                        <div className="card-description">
                          Years of service milestones
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="enhanced-summary-card total-card">
                    <div className="card-gradient-bg"></div>
                    <div className="card-content">
                      <div className="card-icon-wrapper">
                        <div className="card-icon total">
                          <i className="fas fa-calendar-check"></i>
                        </div>
                      </div>
                      <div className="card-info">
                        <div className="card-number">{totalCountsData.total}</div>
                        <div className="card-label">{t('totalEvents') || 'Total Events'}</div>
                        <div className="card-description">
                          Combined celebrations
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Filter Tabs */}
            <div className="enhanced-filter-section mb-4">
              <div className="filter-header">
                <h5 className="filter-title">
                  <i className="fas fa-filter me-2"></i>
                  Filter Events
                </h5>
                <div className="filter-tabs">
                  <button
                    className={`filter-tab ${selectedFilter === 'all' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('all')}
                  >
                    <i className="fas fa-list"></i>
                    <span>All Events</span>
                    <div className="tab-badge">{totalCountsData.total}</div>
                  </button>
                  <button
                    className={`filter-tab ${selectedFilter === 'birthday' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('birthday')}
                  >
                    <i className="fas fa-birthday-cake"></i>
                    <span>Birthdays</span>
                    <div className="tab-badge">{totalCountsData.birthdays}</div>
                  </button>
                  <button
                    className={`filter-tab ${selectedFilter === 'work-anniversary' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('work-anniversary')}
                  >
                    <i className="fas fa-award"></i>
                    <span>Anniversaries</span>
                    <div className="tab-badge">{totalCountsData.anniversaries}</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="content-sections">
              {/* Birthdays Section */}
              {(selectedFilter === 'all' || selectedFilter === 'birthday') && (
                <div className="content-section mb-5">
                  <div className="section-header d-flex justify-content-between align-items-center mb-3">
                    <h5 className="section-title">
                      <i className="fas fa-birthday-cake me-2"></i>
                      Birthdays ({totalCountsData.birthdays})
                    </h5>
                  </div>

                  {birthdaysApiData.loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : birthdaysApiData.items.length > 0 ? (
                    <>
                      <div className="row">
                        {birthdaysApiData.items.map((day: SpecialDay) => (
                          <div key={day.id} className="col-lg-6 col-xl-4 mb-3">
                            <div className="enhanced-person-card birthday-card">
                              <div className="card-header-section">
                                <div className="person-avatar-enhanced">
                                  <div className="avatar-wrapper birthday">
                                    <div className="avatar-circle">
                                      <span className="avatar-initials">
                                        {day.name.split(' ').map((n: string) => n[0]).join('')}
                                      </span>
                                    </div>
                                    <div className="avatar-icon">
                                      <i className="fas fa-birthday-cake"></i>
                                    </div>
                                  </div>
                                </div>
                                <div className="card-date-badge">
                                  <i className="fas fa-calendar-day"></i>
                                  {formatDate(day.date)}
                                </div>
                              </div>
                              <div className="card-body-section">
                                <h6 className="person-name-enhanced">{day.name}</h6>
                                <div className="person-designation">{day.designation}</div>
                                <div className="person-details-enhanced">
                                  <div className="detail-row">
                                    <i className="fas fa-envelope"></i>
                                    <span>{day.email}</span>
                                  </div>
                                  <div className="detail-row">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>{day.city}, {day.country}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="card-footer-section">
                                <div className="celebration-badge birthday">
                                  <i className="fas fa-birthday-cake"></i>
                                  <span>Birthday Celebration</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Pagination
                        currentPage={birthdaysApiData.currentPage}
                        totalPages={birthdaysApiData.totalPages}
                        onPageChange={handleBirthdayPageChange}
                        totalItems={birthdaysApiData.totalItems}
                        itemsPerPage={8}
                      />
                    </>
                  ) : (
                    <div className="no-data-message">
                      <i className="fas fa-calendar-times me-2"></i>
                      No birthdays found for this year
                    </div>
                  )}
                </div>
              )}

              {/* Work Anniversaries Section */}
              {(selectedFilter === 'all' || selectedFilter === 'work-anniversary') && (
                <div className="content-section">
                  <div className="section-header d-flex justify-content-between align-items-center mb-3">
                    <h5 className="section-title">
                      <i className="fas fa-award me-2"></i>
                      Work Anniversaries ({totalCountsData.anniversaries})
                    </h5>
                  </div>

                  {anniversariesApiData.loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : anniversariesApiData.items.length > 0 ? (
                    <>
                      <div className="row">
                        {anniversariesApiData.items.map((day: SpecialDay) => (
                          <div key={day.id} className="col-lg-6 col-xl-4 mb-3">
                            <div className="enhanced-person-card anniversary-card">
                              <div className="card-header-section">
                                <div className="person-avatar-enhanced">
                                  <div className="avatar-wrapper anniversary">
                                    <div className="avatar-circle">
                                      <span className="avatar-initials">
                                        {day.name.split(' ').map((n: string) => n[0]).join('')}
                                      </span>
                                    </div>
                                    <div className="avatar-icon">
                                      <i className="fas fa-award"></i>
                                    </div>
                                  </div>
                                </div>
                                <div className="card-date-badge">
                                  <i className="fas fa-calendar-day"></i>
                                  {formatDate(day.date)}
                                </div>
                              </div>
                              <div className="card-body-section">
                                <h6 className="person-name-enhanced">{day.name}</h6>
                                <div className="person-designation">{day.designation}</div>
                                <div className="person-details-enhanced">
                                  <div className="detail-row">
                                    <i className="fas fa-envelope"></i>
                                    <span>{day.email}</span>
                                  </div>
                                  <div className="detail-row">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>{day.city}, {day.country}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="card-footer-section">
                                <div className="celebration-badge anniversary">
                                  <i className="fas fa-award"></i>
                                  <span>{day.yearsOfService || 0} Years of Service</span>
                                </div>
                                {day.yearsOfService && (
                                  <div className="years-milestone">
                                    <div className="milestone-number">{day.yearsOfService}</div>
                                    <div className="milestone-text">Years</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Pagination
                        currentPage={anniversariesApiData.currentPage}
                        totalPages={anniversariesApiData.totalPages}
                        onPageChange={handleAnniversaryPageChange}
                        totalItems={anniversariesApiData.totalItems}
                        itemsPerPage={8}
                      />
                    </>
                  ) : (
                    <div className="no-data-message">
                      <i className="fas fa-calendar-times me-2"></i>
                      No work anniversaries found for this year
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <div className="d-flex justify-content-between align-items-center w-100">
              <small className="text-muted">
                {t('yearOverview') || 'Year overview'}: {totalCountsData.total} {t('specialDays') || 'special days'}
              </small>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                <i className="fas fa-times me-1"></i>
                {t('close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialDaysModal;