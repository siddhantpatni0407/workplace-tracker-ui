# Super Admin Management API

This document describes the Super Admin Management API endpoints for managing Admin users within the same tenant. These endpoints are restricted to users with the `SUPER_ADMIN` role and provide tenant-isolated access to Admin management.

## Table of Contents
- [Authentication](#authentication)
- [Tenant Isolation](#tenant-isolation)
- [Endpoints](#endpoints)
  - [Get All Admins in Tenant](#get-all-admins-in-tenant)
  - [Get Admins by Tenant](#get-admins-by-tenant)
  - [Search Admins](#search-admins)
  - [Get Admin Details](#get-admin-details)
  - [Update Admin Status](#update-admin-status)
- [Response Format](#response-format)
- [Error Handling](#error-handling)

## Authentication

All endpoints require:
- **Authorization Header**: `Bearer <JWT_TOKEN>`
- **Required Role**: `SUPER_ADMIN`

## Tenant Isolation

**Important**: Super Admin users can only manage Admin users within their own tenant. All endpoints automatically enforce tenant isolation based on the authenticated Super Admin's tenant ID.

## Endpoints

### Get All Admins in Tenant

Retrieves all Admin users in the Super Admin's tenant.

- **URL**: `/api/v1/workplace-tracker-service/super-admin/admins`
- **Method**: `GET`
- **Auth Required**: Yes (`SUPER_ADMIN`)

#### Request Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Success Response
```json
{
  "status": "SUCCESS",
  "message": "Admins retrieved successfully.",
  "data": [
    {
      "tenantUserId": 5,
      "tenantId": 101,
      "tenantName": "Acme Corporation",
      "tenantCode": "ACME001",
      "platformUserId": 205,
      "platformUserName": "Jane Platform",
      "platformUserCode": "PU20251017WXYZ",
      "roleId": 2,
      "role": "ADMIN",
      "tenantUserCode": "TU20251017IJKL",
      "managerTenantUserId": 1,
      "managerName": "John Super Admin",
      "name": "Jane Admin",
      "email": "jane.admin@acme.com",
      "mobileNumber": "9876543210",
      "isActive": true,
      "loginAttempts": 0,
      "accountLocked": false,
      "lastLoginTime": "2025-10-17T09:15:00",
      "createdAt": "2025-10-02T14:30:00",
      "updatedAt": "2025-10-17T09:15:00"
    }
  ]
}
```

#### Empty Response
```json
{
  "status": "SUCCESS",
  "message": "No Admins found in your tenant.",
  "data": []
}
```

### Get Admins by Tenant

Alternative endpoint to retrieve all Admin users in the Super Admin's tenant (same functionality as above).

- **URL**: `/api/v1/workplace-tracker-service/super-admin/admins/by-tenant`
- **Method**: `GET`
- **Auth Required**: Yes (`SUPER_ADMIN`)

#### Request Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Success Response
```json
{
  "status": "SUCCESS",
  "message": "Admins retrieved successfully for tenant.",
  "data": [
    {
      "tenantUserId": 5,
      "tenantId": 101,
      "tenantName": "Acme Corporation",
      "name": "Jane Admin",
      "email": "jane.admin@acme.com",
      "role": "ADMIN",
      "isActive": true,
      "managerName": "John Super Admin"
    }
  ]
}
```

### Search Admins

Search Admin users by name or email within the Super Admin's tenant.

- **URL**: `/api/v1/workplace-tracker-service/super-admin/admins/search`
- **Method**: `GET`
- **Auth Required**: Yes (`SUPER_ADMIN`)

#### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| searchTerm | String | Yes | Search term for name or email |

#### Request Example
```
GET /api/v1/workplace-tracker-service/super-admin/admins/search?searchTerm=jane
```

#### Success Response
```json
{
  "status": "SUCCESS",
  "message": "Search completed successfully.",
  "data": [
    {
      "tenantUserId": 5,
      "tenantId": 101,
      "tenantName": "Acme Corporation",
      "name": "Jane Admin",
      "email": "jane.admin@acme.com",
      "role": "ADMIN",
      "isActive": true,
      "managerName": "John Super Admin"
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

### Get Admin Details

Retrieve detailed information about a specific Admin in the Super Admin's tenant.

- **URL**: `/api/v1/workplace-tracker-service/super-admin/admins/details`
- **Method**: `GET`
- **Auth Required**: Yes (`SUPER_ADMIN`)

#### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| adminId | Long | Yes | The ID of the Admin user |

#### Request Example
```
GET /api/v1/workplace-tracker-service/super-admin/admins/details?adminId=5
```

#### Success Response
```json
{
  "status": "SUCCESS",
  "message": "Admin retrieved successfully.",
  "data": {
    "tenantUserId": 5,
    "tenantId": 101,
    "tenantName": "Acme Corporation",
    "tenantCode": "ACME001",
    "platformUserId": 205,
    "platformUserName": "Jane Platform",
    "platformUserCode": "PU20251017WXYZ",
    "roleId": 2,
    "role": "ADMIN",
    "tenantUserCode": "TU20251017IJKL",
    "managerTenantUserId": 1,
    "managerName": "John Super Admin",
    "name": "Jane Admin",
    "email": "jane.admin@acme.com",
    "mobileNumber": "9876543210",
    "isActive": true,
    "loginAttempts": 0,
    "accountLocked": false,
    "lastLoginTime": "2025-10-17T09:15:00",
    "createdAt": "2025-10-02T14:30:00",
    "updatedAt": "2025-10-17T09:15:00"
  }
}
```

#### Error Response (Admin not in same tenant)
```json
{
  "status": "FAILED",
  "message": "Admin not found in your tenant",
  "data": null
}
```

#### Error Response (User is not an Admin)
```json
{
  "status": "FAILED",
  "message": "User is not an Admin",
  "data": null
}
```

### Update Admin Status

Activate or deactivate an Admin user within the Super Admin's tenant.

- **URL**: `/api/v1/workplace-tracker-service/super-admin/admins/status`
- **Method**: `PUT`
- **Auth Required**: Yes (`SUPER_ADMIN`)

#### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| adminId | Long | Yes | The ID of the Admin user |

#### Request Body
```json
{
  "isActive": false
}
```

#### Request Example
```
PUT /api/v1/workplace-tracker-service/super-admin/admins/status?adminId=5
Content-Type: application/json

{
  "isActive": false
}
```

#### Success Response
```json
{
  "status": "SUCCESS",
  "message": "Admin status updated successfully.",
  "data": {
    "tenantUserId": 5,
    "tenantId": 101,
    "tenantName": "Acme Corporation",
    "name": "Jane Admin",
    "email": "jane.admin@acme.com",
    "role": "ADMIN",
    "isActive": false,
    "accountLocked": true,
    "managerName": "John Super Admin",
    "updatedAt": "2025-10-17T11:30:00"
  }
}
```

#### Error Response (Admin not in same tenant)
```json
{
  "status": "FAILED",
  "message": "Admin not found in your tenant",
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
  "message": "Access denied. SUPER_ADMIN role required.",
  "data": null
}
```

#### Invalid Parameters
```json
{
  "status": "FAILED",
  "message": "Valid Admin ID is required.",
  "data": null
}
```

#### Tenant Isolation Violation
```json
{
  "status": "FAILED",
  "message": "Admin not found in your tenant",
  "data": null
}
```

#### Super Admin Not Found
```json
{
  "status": "FAILED",
  "message": "Super Admin not found with ID: 999",
  "data": null
}
```

#### User Not An Admin
```json
{
  "status": "FAILED",
  "message": "User is not an Admin",
  "data": null
}
```

#### Internal Server Error
```json
{
  "status": "FAILED",
  "message": "An error occurred while retrieving Admins.",
  "data": null
}
```

## Security Considerations

1. **Role-Based Access**: Only users with `SUPER_ADMIN` role can access these endpoints
2. **JWT Authentication**: All requests must include a valid JWT token
3. **Tenant Isolation**: Super Admins can only manage Admins within their own tenant
4. **Automatic User Context**: The Super Admin's identity is automatically extracted from the JWT token
5. **Cross-Tenant Protection**: All operations verify tenant boundaries to prevent unauthorized access
6. **Audit Trail**: All operations are logged with timestamps and user information
7. **Status Management**: Deactivating an Admin also locks their account for security

## Tenant Isolation Details

### How Tenant Isolation Works
1. **JWT Token Extraction**: The Super Admin's user ID is extracted from the JWT token
2. **Tenant Lookup**: The system looks up the Super Admin's tenant ID from the database
3. **Filtered Queries**: All Admin queries are filtered by the Super Admin's tenant ID
4. **Cross-Tenant Validation**: When accessing specific Admins, the system verifies they belong to the same tenant

### Benefits
- **Security**: Prevents Super Admins from accessing Admins in other tenants
- **Data Isolation**: Ensures complete separation of tenant data
- **Automatic Enforcement**: No manual tenant ID specification required
- **Consistent Behavior**: All endpoints follow the same isolation rules

## Usage Examples

### cURL Examples

#### Get All Admins in Tenant
```bash
curl -X GET \
  "http://localhost:8010/api/v1/workplace-tracker-service/super-admin/admins" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Search Admins
```bash
curl -X GET \
  "http://localhost:8010/api/v1/workplace-tracker-service/super-admin/admins/search?searchTerm=jane" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Get Admin Details
```bash
curl -X GET \
  "http://localhost:8010/api/v1/workplace-tracker-service/super-admin/admins/details?adminId=5" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Update Admin Status
```bash
curl -X PUT \
  "http://localhost:8010/api/v1/workplace-tracker-service/super-admin/admins/status?adminId=5" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

### JavaScript/Fetch Examples

#### Get All Admins
```javascript
const response = await fetch('/api/v1/workplace-tracker-service/super-admin/admins', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${superAdminToken}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
console.log('Admins:', result.data);
```

#### Update Admin Status
```javascript
const response = await fetch(`/api/v1/workplace-tracker-service/super-admin/admins/status?adminId=5`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${superAdminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ isActive: false })
});

const result = await response.json();
console.log('Updated Admin:', result.data);
```

## Integration Notes

### Frontend Integration
- Store the Super Admin's JWT token securely
- Handle authentication errors by redirecting to login
- Implement proper error handling for tenant isolation violations
- Use the search functionality for large datasets

### Backend Integration
- The `JwtAuthenticationContext` automatically extracts the Super Admin's ID from the token
- No need to pass tenant ID in requests - it's automatically determined
- All database queries are automatically filtered by tenant
- Proper error handling ensures security violations are caught

## API Versioning

This API is version 1 (`/api/v1/`). Future versions will maintain backward compatibility where possible. Breaking changes will be introduced in new API versions.
