# Authentication Controller API Documentation

## Overview
The Authentication Controller provides comprehensive authentication and authorization endpoints for the Workplace Tracker Service. It supports role-based registration with hierarchical validation, secure login/logout, password management, and JWT token refresh functionality.

**Base URL:** `/api/v1/workplace-tracker-service`

**Author:** Siddhant Patni

---

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Request/Response Models](#requestresponse-models)
3. [Role-Based Access Control](#role-based-access-control)
4. [Hierarchical User Management](#hierarchical-user-management)
5. [Error Handling](#error-handling)
6. [Security Features](#security-features)
7. [Example Usage](#example-usage)

---

## Authentication Endpoints

### 1. User Registration
**Endpoint:** `POST /register`

**Description:** Register a new user with role-based validation, code requirements, and hierarchical authorization.

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, valid email format)",
  "password": "string (required, min 8 characters)",
  "mobileNumber": "string (optional)",
  "role": "string (required: SUPER_ADMIN, ADMIN, USER, MANAGER)",
  "platformUserCode": "string (required for SUPER_ADMIN)",
  "tenantCode": "string (required for SUPER_ADMIN only)",
  "tenantUserCode": "string (required for ADMIN, USER and MANAGER)"
}
```

**Role-Specific Requirements:**
- **SUPER_ADMIN**: Requires both `platformUserCode` and `tenantCode`
- **ADMIN**: Requires only `tenantUserCode` (SUPER_ADMIN's code for authorization - tenant derived automatically)
- **USER/MANAGER**: Requires `tenantUserCode` (ADMIN's code for authorization)

**Enhanced ADMIN Registration Validation:**
- The `tenantUserCode` must belong to an active SUPER_ADMIN user
- Tenant information is automatically derived from the SUPER_ADMIN's tenant
- Creates hierarchical relationship: ADMIN → SUPER_ADMIN
- Sets `manager_tenant_user_id` field to link ADMIN with authorizing SUPER_ADMIN

**Response:**
```json
{
  "token": "string (JWT access token)",
  "role": "string",
  "userId": "long",
  "name": "string",
  "status": "SUCCESS|FAILED",
  "message": "string",
  "lastLoginTime": "datetime",
  "isActive": "boolean",
  "loginAttempts": "integer",
  "accountLocked": "boolean"
}
```

**Status Codes:**
- `200 OK` - Registration successful
- `400 Bad Request` - Validation failed or invalid input

---

### 2. User Login
**Endpoint:** `POST /login`

**Description:** Authenticate user and return JWT access token with refresh cookie.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:**
```json
{
  "token": "string (JWT access token)",
  "role": "string",
  "userId": "long",
  "name": "string",
  "status": "SUCCESS|FAILED",
  "message": "string",
  "lastLoginTime": "datetime",
  "isActive": "boolean",
  "loginAttempts": "integer",
  "accountLocked": "boolean"
}
```

**Headers Set:**
- `Set-Cookie: refreshToken=<refresh_token>; HttpOnly; Secure; Path=/`

**Status Codes:**
- `200 OK` - Login successful
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - Account locked

---

### 3. Token Refresh
**Endpoint:** `POST /auth/refresh`

**Description:** Refresh JWT access token using refresh token from cookie or header.

**Headers (Optional):**
- `Authorization: Bearer <refresh_token>`

**Cookies (Optional):**
- `refreshToken=<refresh_token>`

**Note:** Token is read from cookie first, then from Authorization header if cookie is not present.

**Response:**
```json
{
  "token": "string (new JWT access token)",
  "role": "string",
  "userId": "long",
  "name": "string",
  "status": "SUCCESS|FAILED",
  "message": "string",
  "lastLoginTime": "datetime",
  "isActive": "boolean",
  "loginAttempts": "integer",
  "accountLocked": "boolean"
}
```

**Status Codes:**
- `200 OK` - Token refreshed successfully
- `401 Unauthorized` - Invalid or expired refresh token

---

### 4. Forgot Password Reset
**Endpoint:** `POST /forgot/reset`

**Description:** Reset user password using email, OTP, and new password.

**Request Body:**
```json
{
  "email": "string (required)",
  "otp": "string (required)",
  "newPassword": "string (required)"
}
```

**Response:**
```json
{
  "status": "SUCCESS|FAILED",
  "message": "string",
  "data": null
}
```

**Status Codes:**
- `200 OK` - Password reset successful
- `400 Bad Request` - Invalid OTP or validation failed

---

### 5. Change Password
**Endpoint:** `PATCH /user/change-password`

**Description:** Change password for authenticated user.

**Authentication Required:** Yes (JWT token)

**Authorized Roles:** `USER`, `ADMIN`, `SUPER_ADMIN`

**Headers:**
- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "currentPassword": "string (required, min 6 characters)",
  "newPassword": "string (required, min 8 characters)"
}
```

**Response:**
```json
{
  "status": "SUCCESS|FAILED",
  "message": "string",
  "data": null
}
```

**Status Codes:**
- `200 OK` - Password changed successfully
- `400 Bad Request` - Validation failed or incorrect current password
- `401 Unauthorized` - Invalid or missing JWT token
- `404 Not Found` - User not found

---

## Request/Response Models

### RegisterRequest
```java
{
  "name": "string",
  "mobileNumber": "string",
  "email": "string",
  "password": "string",
  "role": "string",
  "platformUserCode": "string",
  "tenantCode": "string",
  "tenantUserCode": "string"
}
```

### LoginRequest
```java
{
  "email": "string",
  "password": "string"
}
```

### AuthResponse
```java
{
  "token": "string",
  "role": "string",
  "userId": "long",
  "name": "string",
  "status": "string",
  "message": "string",
  "lastLoginTime": "LocalDateTime",
  "isActive": "boolean",
  "loginAttempts": "integer",
  "accountLocked": "boolean"
}
```

### ForgotPasswordResetRequest
```java
{
  "email": "string",
  "otp": "string",
  "newPassword": "string"
}
```

### PasswordChangeRequest
```java
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

---

## Role-Based Access Control

### Supported Roles
1. **SUPER_ADMIN** - Platform-level administrator
2. **ADMIN** - Tenant-level administrator (authorized by SUPER_ADMIN)
3. **MANAGER** - Department/team manager (authorized by ADMIN)
4. **USER** - Regular user (authorized by ADMIN)

### Registration Code Requirements
- **SUPER_ADMIN**: Must provide both `platformUserCode` and `tenantCode`
- **ADMIN**: Must provide only `tenantUserCode` (SUPER_ADMIN's code)
- **USER/MANAGER**: Must provide `tenantUserCode` (ADMIN's code)

### Endpoint Authorization
- **Public Endpoints**: `/register`, `/login`, `/forgot/reset`, `/auth/refresh`
- **Protected Endpoints**: `/user/change-password` (requires authentication)

---

## Hierarchical User Management

### User Hierarchy Structure
```
Platform User
    └── SUPER_ADMIN (tenant_user table)
            └── ADMIN (tenant_user table, manager_tenant_user_id → SUPER_ADMIN)
                    ├── USER (users table, tenant_user_id → ADMIN)
                    └── MANAGER (users table, tenant_user_id → ADMIN)
```

### Database Relationships

#### SUPER_ADMIN Registration
- Stored in `tenant_user` table
- `platform_user_id` links to platform user
- `manager_tenant_user_id` is NULL (top level)

#### ADMIN Registration  
- Stored in `tenant_user` table
- `platform_user_id` inherits from authorizing SUPER_ADMIN
- `manager_tenant_user_id` set to SUPER_ADMIN's `tenant_user_id`
- Creates clear audit trail and hierarchy

#### USER/MANAGER Registration
- Stored in `users` table
- `tenant_user_id` links to authorizing ADMIN
- Inherits tenant permissions through ADMIN

### Validation Flow for ADMIN Registration

1. **Tenant Code Validation**
   - Validates `tenantCode` exists and is active
   
2. **SUPER_ADMIN Authorization**
   - Validates `tenantUserCode` exists and is active
   - Ensures code belongs to a SUPER_ADMIN role
   - Verifies SUPER_ADMIN belongs to the same tenant
   
3. **Hierarchy Establishment**
   - Sets `manager_tenant_user_id` to SUPER_ADMIN's ID
   - Inherits `platform_user_id` from SUPER_ADMIN
   - Creates audit log of authorization

---

## Error Handling

### Enhanced Validation Errors

#### ADMIN Registration Specific Errors
- `"Tenant user code must belong to a SUPER_ADMIN user"`
- `"SUPER_ADMIN tenant user code must belong to the same tenant"`
- `"Invalid or inactive tenant user code: {code}"`

#### Common Error Responses
```json
{
  "status": "FAILED",
  "message": "Error description",
  "data": null
}
```

### Validation Errors
- Missing required fields
- Invalid email format
- Password length requirements
- Role-specific code validation
- Hierarchical authorization failures

### Authentication Errors
- Invalid credentials
- Expired tokens
- Account locked
- Missing authorization header

---

## Security Features

### Enhanced Authorization
- **Multi-level Validation**: ADMIN requires SUPER_ADMIN authorization
- **Tenant Isolation**: Cross-tenant authorization prevented
- **Audit Trail**: Complete logging of authorization chain
- **Hierarchy Enforcement**: Proper manager-subordinate relationships

### JWT Token Management
- **Access Token**: Short-lived JWT for API authentication
- **Refresh Token**: Long-lived token stored in HttpOnly cookie
- **Token Rotation**: New refresh token issued on each refresh

### Password Security
- Minimum 8 characters for new passwords
- Current password verification for changes
- Secure password reset with OTP

### Account Security
- Login attempt tracking
- Account locking mechanism
- Role-based access control

### Cookie Security
- HttpOnly cookies for refresh tokens
- Secure flag for HTTPS
- Path-specific cookie scope

---

## Example Usage

### 1. SUPER_ADMIN Registration
```bash
curl -X POST http://localhost:8080/api/v1/workplace-tracker-service/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "superadmin@example.com",
    "password": "securePassword123",
    "role": "SUPER_ADMIN",
    "platformUserCode": "PU001",
    "tenantCode": "TENANT001"
  }'
```

### 2. ADMIN Registration (Enhanced with SUPER_ADMIN Authorization)
```bash
curl -X POST http://localhost:8080/api/v1/workplace-tracker-service/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Admin",
    "email": "john.admin@example.com",
    "password": "securePassword123",
    "role": "ADMIN",
    "tenantUserCode": "TU20251017YFSXUC"
  }'
```

**Note:** `tenantUserCode` must be the SUPER_ADMIN's code who is authorizing this ADMIN creation.

### 3. USER Registration
```bash
curl -X POST http://localhost:8080/api/v1/workplace-tracker-service/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane User",
    "email": "jane.user@example.com",
    "password": "securePassword123",
    "role": "USER",
    "tenantUserCode": "TU20251017ABCDEF"
  }'
```

**Note:** `tenantUserCode` must be the ADMIN's code who is authorizing this USER creation.

### 4. User Login
```bash
curl -X POST http://localhost:8080/api/v1/workplace-tracker-service/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.admin@example.com",
    "password": "securePassword123"
  }'
```

### 5. Token Refresh
```bash
curl -X POST http://localhost:8080/api/v1/workplace-tracker-service/auth/refresh \
  -H "Authorization: Bearer <refresh_token>"
```

### 6. Change Password
```bash
curl -X PATCH http://localhost:8080/api/v1/workplace-tracker-service/user/change-password \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldPassword123",
    "newPassword": "newSecurePassword456"
  }'
```

### 7. Password Reset
```bash
curl -X POST http://localhost:8080/api/v1/workplace-tracker-service/forgot/reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.admin@example.com",
    "otp": "123456",
    "newPassword": "resetPassword789"
  }'
```

---

## Database Schema Impact

### tenant_user Table Structure
```sql
CREATE TABLE tenant_user (
    tenant_user_id BIGINT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    platform_user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    tenant_user_code VARCHAR(255) UNIQUE NOT NULL,
    manager_tenant_user_id BIGINT, -- Links to authorizing SUPER_ADMIN for ADMINs
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    -- ... other fields
    FOREIGN KEY (manager_tenant_user_id) REFERENCES tenant_user(tenant_user_id)
);
```

### Example Data After ADMIN Registration
| tenant_user_id | tenant_id | platform_user_id | role_id | tenant_user_code | manager_tenant_user_id | name | email |
|----------------|-----------|-------------------|---------|------------------|----------------------|------|-------|
| 1 | 1 | 1 | 2 | TU20251017YFSXUC | NULL | Super Admin | superadmin@example.com |
| 2 | 1 | 1 | 3 | TU20251017ABCDEF | 1 | John Admin | john.admin@example.com |

---

## Notes

1. **Enhanced Hierarchy**: ADMIN registration now creates a proper hierarchy with SUPER_ADMIN through the `manager_tenant_user_id` field.

2. **Authorization Chain**: Each user level requires authorization from the level above:
   - ADMIN requires SUPER_ADMIN's `tenantUserCode`
   - USER/MANAGER requires ADMIN's `tenantUserCode`

3. **Audit Trail**: Complete logging shows which SUPER_ADMIN authorized each ADMIN creation.

4. **Security**: Cross-tenant authorization is prevented - SUPER_ADMIN must belong to the same tenant.

5. **Data Integrity**: Proper foreign key relationships maintain referential integrity.

6. **Token Management**: The refresh token is automatically set as an HttpOnly cookie during login and refresh operations.

7. **Role Validation**: Registration requires specific codes and validation based on the user role to ensure proper authorization hierarchy.

8. **Password Policy**: Passwords must be at least 8 characters long for registration and password changes.

9. **Cross-Origin Support**: The controller supports CORS for web applications.

10. **User Context**: The change password endpoint automatically extracts the user ID from the JWT token for security.

---

## Support

For technical support or questions regarding the Authentication API, please contact the development team or refer to the project documentation.

**Last Updated:** October 17, 2025
**Version:** 2.0 (Enhanced with hierarchical user management)
