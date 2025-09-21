// Location-related models and interfaces
import { LocationApiStatus, PostalCodeProvider, CacheStatus, ValidationResult } from '../enums';

/**
 * Base location option interface
 */
export interface BaseLocationOption {
  value: string;
  label: string;
  searchTerms?: string[];
  isActive?: boolean;
}

/**
 * Country option with ISO code
 */
export interface CountryOption extends BaseLocationOption {
  isoCode: string;
  flag?: string;
  continent?: string;
  currency?: string;
  phoneCode?: string;
  languages?: string[];
}

/**
 * State/Province option
 */
export interface StateOption extends BaseLocationOption {
  isoCode: string;
  countryCode: string;
  type?: 'state' | 'province' | 'region' | 'territory';
  capital?: string;
}

/**
 * City option with coordinates
 */
export interface CityOption extends BaseLocationOption {
  stateCode?: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  population?: number;
  timezone?: string;
  isCapital?: boolean;
  alternativeNames?: string[];
}

/**
 * Postal code option with location details
 */
export interface PostalCodeOption extends BaseLocationOption {
  placeName: string;
  latitude?: number;
  longitude?: number;
  provider: PostalCodeProvider;
  accuracy?: 'exact' | 'approximate' | 'city_level';
  lastUpdated?: Date;
}

/**
 * Location search request parameters
 */
export interface LocationSearchRequest {
  searchTerm?: string;
  countryCode?: string;
  stateCode?: string;
  cityName?: string;
  limit?: number;
  includeAlternatives?: boolean;
  sortBy?: 'name' | 'population' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Location search response with metadata
 */
export interface LocationSearchResponse<T> {
  data: T[];
  totalCount: number;
  searchTerm?: string;
  status: LocationApiStatus;
  cacheStatus?: CacheStatus;
  processingTimeMs?: number;
  suggestions?: string[];
}

/**
 * API response from external postal code services
 */
export interface PostalCodeApiResponse {
  country: string;
  countryAbbreviation: string;
  places: Array<{
    'place name': string;
    longitude: string;
    state: string;
    'state abbreviation': string;
    latitude: string;
    'post code': string;
  }>;
}

/**
 * Cache entry for postal codes
 */
export interface PostalCodeCacheEntry {
  data: PostalCodeOption[];
  timestamp: number;
  provider: PostalCodeProvider;
  searchParams: {
    countryCode: string;
    city: string;
  };
  expiresAt: number;
}

/**
 * Location validation request
 */
export interface LocationValidationRequest {
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  strictMode?: boolean;
}

/**
 * Location validation response
 */
export interface LocationValidationResponse {
  isValid: boolean;
  validationResults: {
    country: ValidationResult;
    state: ValidationResult;
    city: ValidationResult;
    postalCode: ValidationResult;
  };
  errors: string[];
  suggestions?: {
    country?: CountryOption[];
    state?: StateOption[];
    city?: CityOption[];
    postalCode?: PostalCodeOption[];
  };
}

/**
 * Geocoding request
 */
export interface GeocodingRequest {
  address: string;
  countryCode?: string;
  limit?: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

/**
 * Geocoding response
 */
export interface GeocodingResponse {
  results: Array<{
    formattedAddress: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
      bounds?: {
        northeast: { lat: number; lng: number };
        southwest: { lat: number; lng: number };
      };
    };
    addressComponents: Array<{
      longName: string;
      shortName: string;
      types: string[];
    }>;
    confidence: number;
  }>;
  status: LocationApiStatus;
}

/**
 * Location service configuration
 */
export interface LocationServiceConfig {
  enableCaching: boolean;
  cacheExpiryMs: number;
  apiTimeout: number;
  maxRetries: number;
  retryDelayMs: number;
  enableGeocoding: boolean;
  enablePostalCodeValidation: boolean;
  defaultCountry?: string;
  supportedCountries?: string[];
}

/**
 * Location service statistics
 */
export interface LocationServiceStats {
  cache: {
    size: number;
    hitRate: number;
    entries: Array<{
      key: string;
      size: number;
      lastAccessed: Date;
      provider: PostalCodeProvider;
    }>;
  };
  api: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };
  usage: {
    countriesAccessed: string[];
    mostSearchedCities: Array<{
      city: string;
      country: string;
      count: number;
    }>;
    topPostalCodeProviders: Array<{
      provider: PostalCodeProvider;
      count: number;
    }>;
  };
}

/**
 * Error response from location APIs
 */
export interface LocationApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  requestId?: string;
}

/**
 * Location hierarchy for cascading dropdowns
 */
export interface LocationHierarchy {
  country: CountryOption;
  states?: StateOption[];
  selectedState?: StateOption;
  cities?: CityOption[];
  selectedCity?: CityOption;
  postalCodes?: PostalCodeOption[];
  selectedPostalCode?: PostalCodeOption;
}

/**
 * User's location preferences
 */
export interface LocationPreferences {
  defaultCountry?: string;
  recentCountries?: string[];
  recentCities?: Array<{
    city: string;
    country: string;
    lastUsed: Date;
  }>;
  preferredPostalCodeProvider?: PostalCodeProvider;
  enableAutoComplete?: boolean;
  maxSuggestions?: number;
}