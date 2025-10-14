# Platform User Authentication API Documentation

## Overview
The Platform User Authentication API provides endpoints for platform-level user management including signup, login, and token refresh functionality. Platform users are root-level users who can manage tenants and their users.

## Base URL
```
http://localhost:8010/api/v1/workplace-tracker-service
```

## Authentication
The platform authentication endpoints (signup, login, refresh-token, profile) are **public endpoints** and do not require authentication. However, once authenticated, platform users receive JWT tokens that are required for accessing tenant user management APIs and other protected resources.

For protected endpoints, include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Platform User Signup
Register a new platform user account.

**Endpoint:** `POST /api/v1/workplace-tracker-service/platform-auth/signup`

**Authentication:** None required (Public endpoint)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "mobileNumber": "+1234567890",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

**Request Validation:**
- `name`: Required, 2-100 characters
- `email`: Required, valid email format, max 150 characters
- `mobileNumber`: Optional, valid phone number format, max 20 characters
- `password`: Required, 8-255 characters
- `confirmPassword`: Required, must match password

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "PLATFORM_USER",
  "platformUserId": 1,
  "name": "John Doe",
  "status": "SUCCESS",
  "message": "Platform user registered successfully",
  "lastLoginTime": null,
  "isActive": true,
  "loginAttempts": 0,
  "accountLocked": false
}
```

**Status Codes:**
- `201 Created`: User registered successfully
- `400 Bad Request`: Validation errors or user already exists
- `500 Internal Server Error`: Server error

**Error Response:**
```json
{
  "token": null,
  "refreshToken": null,
  "role": null,
  "platformUserId": null,
  "name": null,
  "status": "FAILED",
  "message": "Email already registered",
  "lastLoginTime": null,
  "isActive": null,
  "loginAttempts": null,
  "accountLocked": null
}
```

### 2. Platform User Login
Authenticate a platform user and receive access tokens.

**Endpoint:** `POST /api/v1/workplace-tracker-service/platform-auth/login`

**Authentication:** None required (Public endpoint)

**Request Body:**
```json
{
  "emailOrMobile": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Request Validation:**
- `emailOrMobile`: Required, can be email or mobile number
- `password`: Required

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "PLATFORM_USER",
  "platformUserId": 1,
  "name": "John Doe",
  "status": "SUCCESS",
  "message": "Login successful",
  "lastLoginTime": "2025-10-14T10:30:00",
  "isActive": true,
  "loginAttempts": 0,
  "accountLocked": false
}
```

**Status Codes:**
- `200 OK`: Login successful
- `401 Unauthorized`: Invalid credentials or account locked
- `500 Internal Server Error`: Server error

**Error Responses:**
```json
{
  "status": "FAILED",
  "message": "Invalid credentials"
}
```

```json
{
  "status": "FAILED",
  "message": "Account is locked due to multiple failed login attempts"
}
```

### 3. Refresh Token
Generate new access and refresh tokens using a valid refresh token.

**Endpoint:** `POST /api/v1/workplace-tracker-service/platform-auth/refresh-token`

**Authentication:** None required (Public endpoint)

**Request Body:**
```json
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "PLATFORM_USER",
  "platformUserId": 1,
  "name": "John Doe",
  "status": "SUCCESS",
  "message": "Token refreshed successfully",
  "lastLoginTime": null,
  "isActive": true,
  "loginAttempts": 0,
  "accountLocked": false
}
```

**Status Codes:**
- `200 OK`: Token refreshed successfully
- `401 Unauthorized`: Invalid refresh token
- `500 Internal Server Error`: Server error

## Security Features

### Account Lockout
- Accounts are locked after 5 failed login attempts
- Locked accounts cannot login until manually unlocked
- Login attempts are reset to 0 on successful login

### Password Requirements
- Minimum 8 characters
- Maximum 255 characters
- Should include combination of uppercase, lowercase, numbers, and special characters (recommended)

### Token Management
- JWT tokens have configurable expiration time
- Refresh tokens allow generating new access tokens
- Tokens include role-based permissions

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "status": "FAILED",
  "message": "Descriptive error message"
}
```

Common error scenarios:
- Invalid input validation
- Duplicate email/mobile registration
- Invalid credentials
- Account locked
- Invalid or expired tokens
- Server errors

## Rate Limiting
Consider implementing rate limiting for:
- Login attempts (prevent brute force attacks)
- Registration attempts
- Token refresh requests

## Usage Examples

### cURL Examples

**Signup:**
```bash
curl -X POST http://localhost:8010/api/v1/workplace-tracker-service/platform-auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "mobileNumber": "+1234567890",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8010/api/v1/workplace-tracker-service/platform-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrMobile": "john.doe@example.com",
    "password": "SecurePassword123!"
  }'
```

**Refresh Token:**
```bash
curl -X POST http://localhost:8010/api/v1/workplace-tracker-service/platform-auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."'
```

**Get Profile:**
```bash
curl -X GET "http://localhost:8010/api/v1/workplace-tracker-service/platform-auth/profile?platformUserId=1"
```

## Integration Notes

1. **Frontend Integration:** Use the returned JWT token for subsequent API calls
2. **Token Storage:** Store tokens securely (HttpOnly cookies recommended for web apps)
3. **Token Refresh:** Implement automatic token refresh logic before expiration
4. **Error Handling:** Handle authentication errors gracefully in your application
curl -X GET "http://localhost:8010/api/v1/workplace-tracker-service/platform-auth/profile?platformUserId=1"