import { Country, State, City } from 'country-state-city';
import axios from 'axios';
import { LocationConstants, PostalCodePatterns, CountryCode } from '../constants';
import { 
  LocationApiStatus, 
  LocationSearchType, 
  PostalCodeProvider, 
  CacheStatus, 
  ValidationResult 
} from '../enums';
import {
  CountryOption,
  StateOption,
  CityOption,
  PostalCodeOption,
  LocationSearchRequest,
  LocationSearchResponse,
  PostalCodeApiResponse,
  PostalCodeCacheEntry,
  LocationValidationRequest,
  LocationValidationResponse,
  LocationServiceConfig,
  LocationServiceStats,
  LocationApiError,
  LocationHierarchy,
  LocationPreferences
} from '../models';

export class LocationService {
  private static instance: LocationService;
  private postalCodeCache = new Map<string, PostalCodeCacheEntry>();
  private config: LocationServiceConfig;
  private stats: LocationServiceStats;

  constructor(config?: Partial<LocationServiceConfig>) {
    this.config = {
      enableCaching: true,
      cacheExpiryMs: LocationConstants.CACHE_EXPIRY_MS,
      apiTimeout: LocationConstants.API_TIMEOUT,
      maxRetries: 3,
      retryDelayMs: 1000,
      enableGeocoding: false,
      enablePostalCodeValidation: true,
      ...config
    };

    this.stats = {
      cache: { size: 0, hitRate: 0, entries: [] },
      api: { totalRequests: 0, successfulRequests: 0, failedRequests: 0, averageResponseTime: 0 },
      usage: { countriesAccessed: [], mostSearchedCities: [], topPostalCodeProviders: [] }
    };
  }

  public static getInstance(config?: Partial<LocationServiceConfig>): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService(config);
    }
    return LocationService.instance;
  }

  /**
   * Get all countries with search functionality
   */
  public getCountries(searchTerm: string = ''): CountryOption[] {
    const countries = Country.getAllCountries();
    
    const countryOptions: CountryOption[] = countries.map(country => ({
      value: country.name,
      label: `${country.name} (${country.isoCode})`,
      isoCode: country.isoCode
    }));

    if (!searchTerm) {
      return countryOptions;
    }

    return countryOptions.filter(country =>
      country.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.isoCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  /**
   * Get states for a specific country
   */
  public getStates(countryCode: string, searchTerm: string = ''): StateOption[] {
    if (!countryCode) return [];

    const states = State.getStatesOfCountry(countryCode);
    
    const stateOptions: StateOption[] = states.map(state => ({
      value: state.name,
      label: state.name,
      isoCode: state.isoCode,
      countryCode: state.countryCode
    }));

    if (!searchTerm) {
      return stateOptions;
    }

    return stateOptions.filter(state =>
      state.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      state.isoCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  /**
   * Get cities for a specific country and state
   */
  public getCities(countryCode: string, stateCode?: string, searchTerm: string = ''): CityOption[] {
    if (!countryCode) return [];

    let cities;
    if (stateCode) {
      cities = City.getCitiesOfState(countryCode, stateCode);
    } else {
      cities = City.getCitiesOfCountry(countryCode);
    }

    // Handle case where cities might be undefined
    if (!cities) return [];

    const cityOptions: CityOption[] = cities.map(city => ({
      value: city.name,
      label: city.name,
      stateCode: city.stateCode,
      countryCode: city.countryCode,
      latitude: city.latitude ? parseFloat(city.latitude) : undefined,
      longitude: city.longitude ? parseFloat(city.longitude) : undefined
    }));

    // Add "Other" option using constants
    const otherOption: CityOption = {
      value: LocationConstants.OTHER_CITY_VALUE,
      label: LocationConstants.OTHER_CITY_LABEL,
      countryCode: countryCode
    };

    const allOptions = [...cityOptions, otherOption];

    if (!searchTerm) {
      return allOptions;
    }

    const filteredCities = cityOptions.filter(city =>
      city.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Always include "Other" option in search results
    return [...filteredCities, otherOption];
  }

  /**
   * Get postal codes for a specific country and city using APIs
   */
  public async getPostalCodes(
    countryCode: string, 
    city: string, 
    searchTerm: string = ''
  ): Promise<PostalCodeOption[]> {
    if (!countryCode || !city || city === LocationConstants.OTHER_CITY_VALUE) return [];

    const cacheKey = `${countryCode}-${city}`;
    
    // Check cache first with expiry
    if (this.postalCodeCache.has(cacheKey)) {
      const cached = this.postalCodeCache.get(cacheKey)!;
      const isExpired = Date.now() - cached.timestamp > LocationConstants.CACHE_EXPIRY_MS;
      
      if (!isExpired) {
        if (!searchTerm) return cached.data;
        
        return cached.data.filter(postal =>
          postal.value.includes(searchTerm) ||
          postal.placeName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        // Remove expired cache entry
        this.postalCodeCache.delete(cacheKey);
      }
    }

    try {
      const response = await this.getPostalCodesFromZippopotamus(countryCode, city);
      
      if (response && response.length > 0) {
        // Store in cache with timestamp
        const cacheEntry: PostalCodeCacheEntry = {
          data: response,
          timestamp: Date.now(),
          provider: PostalCodeProvider.ZIPPOPOTAM,
          searchParams: { countryCode, city },
          expiresAt: Date.now() + this.config.cacheExpiryMs
        };
        this.postalCodeCache.set(cacheKey, cacheEntry);
        
        // Update stats
        this.stats.api.successfulRequests++;
        
        if (!searchTerm) return response;
        
        return response.filter(postal =>
          postal.value.includes(searchTerm) ||
          postal.placeName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    } catch (error) {
      console.warn('Failed to fetch postal codes:', error);
    }

    return [];
  }

  /**
   * Get postal codes using Zippopotam.us API (free, no registration required)
   */
  private async getPostalCodesFromZippopotamus(
    countryCode: string, 
    city: string
  ): Promise<PostalCodeOption[]> {
    try {
      const response = await axios.get(
        `${LocationConstants.ZIPPOPOTAM_BASE_URL}/${countryCode.toLowerCase()}/${encodeURIComponent(city)}`,
        { timeout: LocationConstants.API_TIMEOUT }
      );

      if (response.data && response.data.places) {
        return response.data.places.map((place: any) => ({
          value: place['post code'],
          label: `${place['post code']} - ${place['place name']}`,
          placeName: place['place name'],
          latitude: parseFloat(place.latitude),
          longitude: parseFloat(place.longitude),
          provider: PostalCodeProvider.ZIPPOPOTAM
        }));
      }
    } catch (error) {
      console.warn(`City-based postal code search failed for ${city}, ${countryCode}:`, error);
    }

    return [];
  }

  /**
   * Get postal code details by postal code
   */
  public async getPostalCodeDetails(
    countryCode: string, 
    postalCode: string
  ): Promise<PostalCodeOption | null> {
    try {
      const response = await axios.get(
        `${LocationConstants.ZIPPOPOTAM_BASE_URL}/${countryCode.toLowerCase()}/${postalCode}`,
        { timeout: LocationConstants.API_TIMEOUT }
      );

      if (response.data && response.data.places && response.data.places.length > 0) {
        const place = response.data.places[0];
        return {
          value: postalCode,
          label: `${postalCode} - ${place['place name']}`,
          placeName: place['place name'],
          latitude: parseFloat(place.latitude),
          longitude: parseFloat(place.longitude),
          provider: PostalCodeProvider.ZIPPOPOTAM
        };
      }
    } catch (error) {
      console.warn('Failed to fetch postal code details:', error);
    }

    return null;
  }

  /**
   * Validate postal code format for different countries
   */
  public validatePostalCode(countryCode: string, postalCode: string): ValidationResult {
    if (!postalCode) return ValidationResult.INVALID;

    const upperCountryCode = countryCode.toUpperCase() as CountryCode;
    const pattern = PostalCodePatterns[upperCountryCode];
    
    if (pattern) {
      return pattern.test(postalCode) ? ValidationResult.VALID : ValidationResult.INVALID;
    }

    // Default validation for countries not in the pattern list
    return LocationConstants.DEFAULT_POSTAL_CODE_PATTERN.test(postalCode) 
      ? ValidationResult.VALID 
      : ValidationResult.UNKNOWN_FORMAT;
  }

  /**
   * Check if postal code validation is supported for country
   */
  public isPostalCodeValidationSupported(countryCode: string): boolean {
    const upperCountryCode = countryCode.toUpperCase() as CountryCode;
    return upperCountryCode in PostalCodePatterns;
  }

  /**
   * Get detailed cache statistics
   */
  public getCacheStats(): LocationServiceStats['cache'] {
    const entries = Array.from(this.postalCodeCache.entries()).map(([key, entry]) => ({
      key,
      size: entry.data.length,
      lastAccessed: new Date(entry.timestamp),
      provider: entry.provider
    }));

    const totalRequests = this.stats.cache.entries.length;
    const cacheHits = entries.filter(e => e.lastAccessed > new Date(Date.now() - this.config.cacheExpiryMs)).length;
    
    return {
      size: this.postalCodeCache.size,
      hitRate: totalRequests > 0 ? cacheHits / totalRequests : 0,
      entries
    };
  }

  /**
   * Get service statistics
   */
  public getServiceStats(): LocationServiceStats {
    return {
      ...this.stats,
      cache: this.getCacheStats()
    };
  }

  /**
   * Validate complete location data
   */
  public async validateLocation(request: LocationValidationRequest): Promise<LocationValidationResponse> {
    const results: LocationValidationResponse = {
      isValid: true,
      validationResults: {
        country: ValidationResult.VALID,
        state: ValidationResult.VALID,
        city: ValidationResult.VALID,
        postalCode: ValidationResult.VALID
      },
      errors: []
    };

    // Validate country
    if (request.country) {
      const countries = this.getCountries(request.country);
      results.validationResults.country = countries.length > 0 ? ValidationResult.VALID : ValidationResult.INVALID;
      if (results.validationResults.country === ValidationResult.INVALID) {
        results.errors.push(`Invalid country: ${request.country}`);
        results.isValid = false;
      }
    }

    // Validate postal code
    if (request.postalCode && request.country) {
      results.validationResults.postalCode = this.validatePostalCode(request.country, request.postalCode);
      if (results.validationResults.postalCode === ValidationResult.INVALID) {
        results.errors.push(`Invalid postal code format for ${request.country}: ${request.postalCode}`);
        results.isValid = false;
      }
    }

    return results;
  }

  /**
   * Search locations with enhanced filtering
   */
  public searchLocations(request: LocationSearchRequest): LocationSearchResponse<CountryOption | StateOption | CityOption> {
    const startTime = Date.now();
    let results: (CountryOption | StateOption | CityOption)[] = [];

    // Search countries
    if (!request.countryCode) {
      const countries = this.getCountries(request.searchTerm || '');
      results.push(...countries);
    }

    // Search states if country is specified
    if (request.countryCode) {
      const states = this.getStates(request.countryCode, request.searchTerm || '');
      results.push(...states);

      // Search cities if state is specified
      if (request.stateCode) {
        const cities = this.getCities(request.countryCode, request.stateCode, request.searchTerm || '');
        results.push(...cities);
      }
    }

    // Apply sorting
    if (request.sortBy) {
      results.sort((a, b) => {
        const aValue = request.sortBy === 'name' ? a.label : a.value;
        const bValue = request.sortBy === 'name' ? b.label : b.value;
        const comparison = aValue.localeCompare(bValue);
        return request.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Apply limit
    if (request.limit && request.limit > 0) {
      results = results.slice(0, request.limit);
    }

    return {
      data: results,
      totalCount: results.length,
      searchTerm: request.searchTerm,
      status: LocationApiStatus.SUCCESS,
      processingTimeMs: Date.now() - startTime
    };
  }

  /**
   * Get location hierarchy for cascading dropdowns
   */
  public async getLocationHierarchy(countryCode?: string, stateCode?: string): Promise<LocationHierarchy> {
    const hierarchy: LocationHierarchy = {
      country: this.getCountries().find(c => c.isoCode === countryCode) || this.getCountries()[0]
    };

    if (countryCode) {
      hierarchy.states = this.getStates(countryCode);
      
      if (stateCode) {
        hierarchy.selectedState = hierarchy.states?.find(s => s.isoCode === stateCode);
        hierarchy.cities = this.getCities(countryCode, stateCode);
      }
    }

    return hierarchy;
  }

  /**
   * Update service configuration
   */
  public updateConfig(newConfig: Partial<LocationServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): LocationServiceConfig {
    return { ...this.config };
  }

  /**
   * Clear postal code cache
   */
  public clearCache(): void {
    this.postalCodeCache.clear();
    this.stats.cache = { size: 0, hitRate: 0, entries: [] };
  }
}

export const locationService = LocationService.getInstance();