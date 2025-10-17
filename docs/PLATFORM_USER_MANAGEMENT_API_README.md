# Platform User Management API

This document describes the Platform User Management API endpoints for managing Super Admin users across all tenants. These endpoints are restricted to users with the `PLATFORM_USER` role.

## Table of Contents
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Get All Super Admins](#get-all-super-admins)
  - [Get Super Admins by Tenant](#get-super-admins-by-tenant)
  - [Search Super Admins](#search-super-admins)
  - [Get Super Admin Details](#get-super-admin-details)
  - [Update Super Admin Status](#update-super-admin-status)
- [Response Format](#response-format)
- [Error Handling](#error-handling)

## Authentication

All endpoints require:
- **Authorization Header**: `Bearer <JWT_TOKEN>`
- **Required Role**: `PLATFORM_USER`

## Endpoints

### Get All Super Admins

Retrieves all Super Admin users from the system across all tenants.

- **URL**: `/api/v1/workplace-tracker-service/platform/super-admins`
- **Method**: `GET`
- **Auth Required**: Yes (`PLATFORM_USER`)

#### Request Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Success Response
```json
{
  "status": "SUCCESS",
  "message": "Super Admins retrieved successfully.",
  "data": [
    {
      "tenantUserId": 1,
      "tenantId": 101,
      "tenantName": "Acme Corporation",
      "tenantCode": "ACME001",
      "platformUserId": 201,
      "platformUserName": "John Platform",
      "platformUserCode": "PU20251017ABCD",
      "roleId": 1,
      "role": "SUPER_ADMIN",
      "tenantUserCode": "TU20251017EFGH",
      "managerTenantUserId": null,
      "managerName": null,
      "name": "John Super Admin",
      "email": "john.superadmin@acme.com",
      "mobileNumber": "1234567890",
      "isActive": true,
      "loginAttempts": 0,
      "accountLocked": false,
      "lastLoginTime": "2025-10-17T10:30:00",
      "createdAt": "2025-10-01T09:00:00",
      "updatedAt": "2025-10-17T10:30:00"
    }
  ]
}
```

#### Empty Response
```json
{
  "status": "SUCCESS",
  "message": "No Super Admins found.",
  "data": []
}
```

### Get Super Admins by Tenant

Retrieves all Super Admin users for a specific tenant.

- **URL**: `/api/v1/workplace-tracker-service/platform/super-admins/by-tenant`
- **Method**: `GET`
- **Auth Required**: Yes (`PLATFORM_USER`)

#### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| tenantId | Long | Yes | The ID of the tenant |

#### Request Example
```
GET /api/v1/workplace-tracker-service/platform/super-admins/by-tenant?tenantId=101
```

#### Success Response
```json
{
  "status": "SUCCESS",
  "message": "Super Admins retrieved successfully for tenant.",
  "data": [
    {
      "tenantUserId": 1,
      "tenantId": 101,
      "tenantName": "Acme Corporation",
      "tenantCode": "ACME001",
      "name": "John Super Admin",
      "email": "john.superadmin@acme.com",
      "role": "SUPER_ADMIN",
      "isActive": true
    }
  ]
}
```

#### Error Response
```json
{
  "status": "FAILED",
  "message": "Valid tenant ID is required.",
  "data": []
}
```

### Search Super Admins

Search Super Admin users by name or email across all tenants.

- **URL**: `/api/v1/workplace-tracker-service/platform/super-admins/search`
- **Method**: `GET`
- **Auth Required**: Yes (`PLATFORM_USER`)

#### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| searchTerm | String | Yes | Search term for name or email |

#### Request Example
```
GET /api/v1/workplace-tracker-service/platform/super-admins/search?searchTerm=john
```

#### Success Response
```json
{
  "status": "SUCCESS",
  "message": "Search completed successfully.",
  "data": [
    {
      "tenantUserId": 1,
      "tenantId": 101,
      "tenantName": "Acme Corporation",
      "name": "John Super Admin",
      "email": "john.superadmin@acme.com",
      "role": "SUPER_ADMIN",
      "isActive": true
    }
  ]
}
```

#### Error Response
```json
{
  "status": "FAILED",
  "message": "Search term cannot be empty.",
  "data": []
}
```

### Get Super Admin Details

Retrieve detailed information about a specific Super Admin.

- **URL**: `/api/v1/workplace-tracker-service/platform/super-admins/details`
- **Method**: `GET`
- **Auth Required**: Yes (`PLATFORM_USER`)

#### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| tenantUserId | Long | Yes | The ID of the Super Admin |

#### Request Example
```
GET /api/v1/workplace-tracker-service/platform/super-admins/details?tenantUserId=1
```

#### Success Response
```json
{
  "status": "SUCCESS",
  "message": "Super Admin retrieved successfully.",
  "data": {
    "tenantUserId": 1,
    "tenantId": 101,
    "tenantName": "Acme Corporation",
    "tenantCode": "ACME001",
    "platformUserId": 201,
    "platformUserName": "John Platform",
    "platformUserCode": "PU20251017ABCD",
    "roleId": 1,
    "role": "SUPER_ADMIN",
    "tenantUserCode": "TU20251017EFGH",
    "managerTenantUserId": null,
    "managerName": null,
    "name": "John Super Admin",
    "email": "john.superadmin@acme.com",
    "mobileNumber": "1234567890",
    "isActive": true,
    "loginAttempts": 0,
    "accountLocked": false,
    "lastLoginTime": "2025-10-17T10:30:00",
    "createdAt": "2025-10-01T09:00:00",
    "updatedAt": "2025-10-17T10:30:00"
  }
}
```

#### Error Response
```json
{
  "status": "FAILED",
  "message": "Super Admin not found with ID: 999",
  "data": null
}
```

### Update Super Admin Status

Activate or deactivate a Super Admin user.

- **URL**: `/api/v1/workplace-tracker-service/platform/super-admins/status`
- **Method**: `PUT`
- **Auth Required**: Yes (`PLATFORM_USER`)

#### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| tenantUserId | Long | Yes | The ID of the Super Admin |

#### Request Body
```json
{
  "isActive": false
}
```

#### Request Example
```
PUT /api/v1/workplace-tracker-service/platform/super-admins/status?tenantUserId=1
Content-Type: application/json

{
  "isActive": false
}
```

#### Success Response
```json
{
  "status": "SUCCESS",
  "message": "Super Admin status updated successfully.",
  "data": {
    "tenantUserId": 1,
    "tenantId": 101,
    "tenantName": "Acme Corporation",
    "name": "John Super Admin",
    "email": "john.superadmin@acme.com",
    "role": "SUPER_ADMIN",
    "isActive": false,
    "accountLocked": true,
    "updatedAt": "2025-10-17T11:00:00"
  }
}
```

#### Error Response
```json
{
  "status": "FAILED",
  "message": "User is not a Super Admin",
  "data": null
}
```

## Response Format

All API responses follow a consistent format:

```json
{
  "status": "SUCCESS|FAILED",
  "message": "Description of the result",
  "data": "Response data (array, object, or null)"
}
```

### Status Codes
- **200 OK**: Request successful
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication failed or insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Error Handling

### Common Error Responses

#### Authentication Error
```json
{
  "status": "FAILED",
  "message": "Authentication failed",
  "data": null
}
```

#### Insufficient Permissions
```json
{
  "status": "FAILED",
  "message": "Access denied. PLATFORM_USER role required.",
  "data": null
}
```

#### Invalid Parameters
```json
{
  "status": "FAILED",
  "message": "Valid Super Admin ID is required.",
  "data": null
}
```

#### Resource Not Found
```json
{
  "status": "FAILED",
  "message": "Super Admin not found with ID: 999",
  "data": null
}
```

#### Internal Server Error
```json
{
  "status": "FAILED",
  "message": "An error occurred while retrieving Super Admins.",
  "data": null
}
```

## Security Considerations

1. **Role-Based Access**: Only users with `PLATFORM_USER` role can access these endpoints
2. **JWT Authentication**: All requests must include a valid JWT token
3. **Tenant Isolation**: Platform users can manage Super Admins across all tenants
4. **Audit Trail**: All operations are logged with timestamps and user information
5. **Status Management**: Deactivating a Super Admin also locks their account for security

## Usage Examples

### cURL Examples

#### Get All Super Admins
```bash
curl -X GET \
  "http://localhost:8010/api/v1/workplace-tracker-service/platform/super-admins" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Search Super Admins
```bash
curl -X GET \
  "http://localhost:8010/api/v1/workplace-tracker-service/platform/super-admins/search?searchTerm=john" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Update Super Admin Status
```bash
curl -X PUT \
  "http://localhost:8010/api/v1/workplace-tracker-service/platform/super-admins/status?tenantUserId=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```
