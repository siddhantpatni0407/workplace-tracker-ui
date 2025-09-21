// Location-related enums
export enum LocationApiStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  LOADING = 'LOADING',
  NOT_FOUND = 'NOT_FOUND'
}

export enum LocationSearchType {
  COUNTRY = 'COUNTRY',
  STATE = 'STATE',
  CITY = 'CITY',
  POSTAL_CODE = 'POSTAL_CODE'
}

export enum LocationLevel {
  COUNTRY = 1,
  STATE = 2,
  CITY = 3,
  POSTAL_CODE = 4
}

export enum PostalCodeProvider {
  ZIPPOPOTAM = 'ZIPPOPOTAM',
  MANUAL = 'MANUAL',
  CACHED = 'CACHED'
}

export enum CacheStatus {
  HIT = 'HIT',
  MISS = 'MISS',
  EXPIRED = 'EXPIRED'
}

export enum ValidationResult {
  VALID = 'VALID',
  INVALID = 'INVALID',
  UNKNOWN_FORMAT = 'UNKNOWN_FORMAT'
}