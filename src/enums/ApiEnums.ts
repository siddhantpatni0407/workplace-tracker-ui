// src/enums/ApiEnums.ts

export enum ApiStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  ERROR = 'ERROR'
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum RequestTimeout {
  SHORT = 5000,     // 5 seconds
  MEDIUM = 15000,   // 15 seconds
  LONG = 30000,     // 30 seconds
  VERY_LONG = 60000 // 1 minute
}

// Display labels
export const ApiStatusLabels: Record<ApiStatus, string> = {
  [ApiStatus.SUCCESS]: 'Success',
  [ApiStatus.FAILED]: 'Failed',
  [ApiStatus.ERROR]: 'Error'
};

export const HttpMethodLabels: Record<HttpMethod, string> = {
  [HttpMethod.GET]: 'GET',
  [HttpMethod.POST]: 'POST',
  [HttpMethod.PUT]: 'PUT',
  [HttpMethod.PATCH]: 'PATCH',
  [HttpMethod.DELETE]: 'DELETE'
};

export const ErrorCodeLabels: Record<ErrorCode, string> = {
  [ErrorCode.VALIDATION_ERROR]: 'Validation Error',
  [ErrorCode.AUTHENTICATION_ERROR]: 'Authentication Error',
  [ErrorCode.AUTHORIZATION_ERROR]: 'Authorization Error',
  [ErrorCode.NOT_FOUND_ERROR]: 'Not Found',
  [ErrorCode.CONFLICT_ERROR]: 'Conflict Error',
  [ErrorCode.NETWORK_ERROR]: 'Network Error',
  [ErrorCode.TIMEOUT_ERROR]: 'Timeout Error',
  [ErrorCode.UNKNOWN_ERROR]: 'Unknown Error'
};