// Location utility functions that work with the enhanced models
import { 
  CountryOption, 
  StateOption, 
  CityOption, 
  PostalCodeOption,
  LocationHierarchy,
  LocationSearchRequest,
  LocationValidationRequest
} from '../models';
import { locationService } from '../services/locationService';
import { LocationConstants } from '../constants';
import { ValidationResult } from '../enums';

/**
 * Location utility class with helper methods
 */
export class LocationUtils {
  
  /**
   * Format a complete address from location components
   */
  static formatAddress(components: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  }): string {
    const parts = [
      components.street,
      components.city,
      components.state,
      components.country,
      components.postalCode
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  /**
   * Extract location components from a formatted address
   */
  static parseAddress(address: string): {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  } {
    // Simple implementation - in real app, you'd use a proper address parser
    const parts = address.split(',').map(p => p.trim());
    const result: any = {};
    
    if (parts.length >= 1) result.street = parts[0];
    if (parts.length >= 2) result.city = parts[1];
    if (parts.length >= 3) result.state = parts[2];
    if (parts.length >= 4) result.country = parts[3];
    if (parts.length >= 5) result.postalCode = parts[4];
    
    return result;
  }

  /**
   * Find the closest city based on coordinates
   */
  static findClosestCity(
    targetLat: number, 
    targetLng: number, 
    cities: CityOption[]
  ): CityOption | null {
    if (!cities.length) return null;

    let closest = cities[0];
    let minDistance = this.calculateDistance(
      targetLat, 
      targetLng, 
      closest.latitude || 0, 
      closest.longitude || 0
    );

    for (const city of cities.slice(1)) {
      const distance = this.calculateDistance(
        targetLat, 
        targetLng, 
        city.latitude || 0, 
        city.longitude || 0
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closest = city;
      }
    }

    return closest;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Generate search suggestions based on partial input
   */
  static generateSuggestions(
    input: string, 
    options: (CountryOption | StateOption | CityOption)[]
  ): string[] {
    if (!input || input.length < 2) return [];

    const suggestions = new Set<string>();
    const lowerInput = input.toLowerCase();

    for (const option of options) {
      // Match by label
      if (option.label.toLowerCase().includes(lowerInput)) {
        suggestions.add(option.label);
      }
      
      // Match by value
      if (option.value.toLowerCase().includes(lowerInput)) {
        suggestions.add(option.value);
      }
      
      // Match by alternative names for cities
      if ('alternativeNames' in option && option.alternativeNames) {
        for (const altName of option.alternativeNames) {
          if (altName.toLowerCase().includes(lowerInput)) {
            suggestions.add(altName);
          }
        }
      }
    }

    return Array.from(suggestions).slice(0, 10); // Limit to 10 suggestions
  }

  /**
   * Validate location hierarchy (country -> state -> city)
   */
  static async validateLocationHierarchy(
    country?: string,
    state?: string, 
    city?: string
  ): Promise<{
    isValid: boolean;
    errors: string[];
    suggestions: {
      countries?: CountryOption[];
      states?: StateOption[];
      cities?: CityOption[];
    };
  }> {
    const errors: string[] = [];
    const suggestions: any = {};

    // Validate country
    if (country) {
      const countries = locationService.getCountries(country);
      if (countries.length === 0) {
        errors.push(`Country "${country}" not found`);
        suggestions.countries = locationService.getCountries().slice(0, 5);
      } else {
        const selectedCountry = countries[0];
        
        // Validate state
        if (state) {
          const states = locationService.getStates(selectedCountry.isoCode, state);
          if (states.length === 0) {
            errors.push(`State "${state}" not found in ${country}`);
            suggestions.states = locationService.getStates(selectedCountry.isoCode).slice(0, 5);
          } else {
            const selectedState = states[0];
            
            // Validate city
            if (city && city !== LocationConstants.OTHER_CITY_VALUE) {
              const cities = locationService.getCities(selectedCountry.isoCode, selectedState.isoCode, city);
              if (cities.length === 0) {
                errors.push(`City "${city}" not found in ${state}, ${country}`);
                suggestions.cities = locationService.getCities(selectedCountry.isoCode, selectedState.isoCode).slice(0, 5);
              }
            }
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    };
  }

  /**
   * Create a location search request with sensible defaults
   */
  static createSearchRequest(partial: Partial<LocationSearchRequest>): LocationSearchRequest {
    return {
      searchTerm: partial.searchTerm || '',
      limit: partial.limit || LocationConstants.MAX_RESULTS_DEFAULT,
      includeAlternatives: partial.includeAlternatives ?? true,
      sortBy: partial.sortBy || 'name',
      sortOrder: partial.sortOrder || 'asc',
      ...partial
    };
  }

  /**
   * Convert location option to display text
   */
  static getDisplayText(option: CountryOption | StateOption | CityOption): string {
    if ('isoCode' in option && option.isoCode) {
      // Country or State with ISO code
      return `${option.label} (${option.isoCode})`;
    }
    
    if ('population' in option && option.population) {
      // City with population
      return `${option.label} (Pop: ${option.population.toLocaleString()})`;
    }
    
    return option.label;
  }

  /**
   * Check if a postal code looks valid for its country
   */
  static isPostalCodeLikelyValid(countryCode: string, postalCode: string): boolean {
    if (!postalCode || !countryCode) return false;
    
    const result = locationService.validatePostalCode(countryCode, postalCode);
    return result === ValidationResult.VALID || result === ValidationResult.UNKNOWN_FORMAT;
  }

  /**
   * Get user-friendly validation message
   */
  static getValidationMessage(result: ValidationResult, field: string): string {
    switch (result) {
      case ValidationResult.VALID:
        return `${field} is valid`;
      case ValidationResult.INVALID:
        return `${field} format is invalid`;
      case ValidationResult.UNKNOWN_FORMAT:
        return `${field} format could not be verified`;
      default:
        return `${field} validation failed`;
    }
  }
}

export default LocationUtils;