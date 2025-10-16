# Tenant Management API Documentation

## Overview
The Tenant Management API provides comprehensive functionality for managing tenants in the workplace tracker service. All endpoints are restricted to **PLATFORM_USER** role only and support full CRUD operations for tenant management.

Since we now have a separate Subscription Management API, tenant creation and updates use **subscription IDs** directly instead of subscription codes, providing better integration and validation.

**Base URL**: `http://localhost:8010/api/v1/workplace-tracker-service`

**Author**: Siddhant Patni

---

## Authentication & Authorization
- **Required Role**: `PLATFORM_USER`
- **Authentication**: JWT Token (Bearer Token)
- All endpoints require valid JWT token with PLATFORM_USER role

---

## API Endpoints

### 1. Create Tenant
Creates a new tenant in the system.

**Endpoint**: `POST /tenant`

**Request Body**:
```json
{
  "tenantName": "string (required, max 150 chars, unique)",
  "subscriptionId": "number (required, must exist in app_subscription table)",
  "contactEmail": "string (optional, max 150 chars)",
  "contactPhone": "string (optional, max 20 chars)",
  "subscriptionStartDate": "datetime (optional, ISO format)",
  "subscriptionEndDate": "datetime (optional, ISO format)"
}
```

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Tenant created successfully",
  "data": {
    "tenantId": 1,
    "tenantName": "Example Corp",
    "tenantCode": "EXM001",
    "appSubscriptionId": 1,
    "subscriptionCode": "PRO",
    "subscriptionName": "Pro Plan",
    "contactEmail": "contact@example.com",
    "contactPhone": "+1234567890",
    "isActive": true,
    "subscriptionStartDate": "2023-01-01T00:00:00",
    "subscriptionEndDate": "2024-01-01T00:00:00",
    "createdDate": "2023-10-16T10:30:00",
    "modifiedDate": "2023-10-16T10:30:00"
  }
}
```

**Status Codes**:
- `201 Created`: Tenant created successfully
- `400 Bad Request`: Validation failed (duplicate name, invalid subscription ID)
- `500 Internal Server Error`: Server error

---

### 2. Get All Tenants (Paginated)
Retrieves all tenants with pagination support.

**Endpoint**: `GET /tenants`

**Query Parameters**:
- `page` (optional, default: 0): Page number (0-based)
- `size` (optional, default: 10): Page size
- `sortBy` (optional, default: "tenantId"): Field to sort by
- `sortDir` (optional, default: "desc"): Sort direction (asc/desc)

**Example**: `GET /tenants?page=0&size=10&sortBy=tenantName&sortDir=asc`

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Tenants retrieved successfully",
  "data": {
    "content": [
      {
        "tenantId": 1,
        "tenantName": "Example Corp",
        "tenantCode": "EXM001",
        "appSubscriptionId": 1,
        "subscriptionCode": "PRO",
        "subscriptionName": "Pro Plan",
        "contactEmail": "contact@example.com",
        "contactPhone": "+1234567890",
        "isActive": true,
        "subscriptionStartDate": "2023-01-01T00:00:00",
        "subscriptionEndDate": "2024-01-01T00:00:00",
        "createdDate": "2023-10-16T10:30:00",
        "modifiedDate": "2023-10-16T10:30:00"
      }
    ],
    "pageable": {
      "sort": {
        "sorted": true,
        "unsorted": false
      },
      "pageNumber": 0,
      "pageSize": 10
    },
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true,
    "numberOfElements": 1
  }
}
```

---

### 3. Get Active Tenants
Retrieves all active tenants (non-paginated).

**Endpoint**: `GET /tenants/active`

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Active tenants retrieved successfully",
  "data": [
    {
      "tenantId": 1,
      "tenantName": "Example Corp",
      "tenantCode": "EXM001",
      "appSubscriptionId": 1,
      "subscriptionCode": "PRO",
      "subscriptionName": "Pro Plan",
      "contactEmail": "contact@example.com",
      "contactPhone": "+1234567890",
      "isActive": true,
      "subscriptionStartDate": "2023-01-01T00:00:00",
      "subscriptionEndDate": "2024-01-01T00:00:00",
      "createdDate": "2023-10-16T10:30:00",
      "modifiedDate": "2023-10-16T10:30:00"
    }
  ]
}
```

---

### 4. Get Tenant by ID
Retrieves a specific tenant by its ID.

**Endpoint**: `GET /tenant/by-id`

**Query Parameters**:
- `tenantId` (required): Tenant ID

**Example**: `GET /tenant/by-id?tenantId=1`

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Tenant retrieved successfully",
  "data": {
    "tenantId": 1,
    "tenantName": "Example Corp",
    "tenantCode": "EXM001",
    "appSubscriptionId": 1,
    "subscriptionCode": "PRO",
    "subscriptionName": "Pro Plan",
    "contactEmail": "contact@example.com",
    "contactPhone": "+1234567890",
    "isActive": true,
    "subscriptionStartDate": "2023-01-01T00:00:00",
    "subscriptionEndDate": "2024-01-01T00:00:00",
    "createdDate": "2023-10-16T10:30:00",
    "modifiedDate": "2023-10-16T10:30:00"
  }
}
```

**Status Codes**:
- `200 OK`: Tenant found
- `404 Not Found`: Tenant not found

---

### 5. Get Tenant by Code
Retrieves a specific tenant by its code.

**Endpoint**: `GET /tenant/by-code`

**Query Parameters**:
- `tenantCode` (required): Tenant code

**Example**: `GET /tenant/by-code?tenantCode=EXM001`

**Response**: Same as Get Tenant by ID

---

### 6. Update Tenant
Updates an existing tenant.

**Endpoint**: `PUT /tenant/update`

**Query Parameters**:
- `tenantId` (required): Tenant ID to update

**Request Body** (all fields optional for partial updates):
```json
{
  "tenantName": "string (optional, max 150 chars, unique)",
  "subscriptionId": "number (optional, must exist in app_subscription table)",
  "contactEmail": "string (optional, max 150 chars)",
  "contactPhone": "string (optional, max 20 chars)",
  "subscriptionStartDate": "datetime (optional, ISO format)",
  "subscriptionEndDate": "datetime (optional, ISO format)"
}
```

**Example**: `PUT /tenant/update?tenantId=1`

**Response**: Same as Create Tenant response with updated data

**Status Codes**:
- `200 OK`: Tenant updated successfully
- `400 Bad Request`: Validation failed (invalid subscription ID)
- `404 Not Found`: Tenant not found

---

### 7. Update Tenant Status
Activates or deactivates a tenant.

**Endpoint**: `PATCH /tenant/status`

**Request Body**:
```json
{
  "tenantId": 1,
  "isActive": true
}
```

**Response**: Same as Create Tenant response with updated status

---

### 8. Delete Tenant
Soft deletes a tenant (deactivates it).

**Endpoint**: `DELETE /tenant/delete`

**Query Parameters**:
- `tenantId` (required): Tenant ID to delete

**Example**: `DELETE /tenant/delete?tenantId=1`

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Tenant deleted successfully",
  "data": null
}
```

---

### 9. Search Tenants
Searches tenants by name (case-insensitive partial match).

**Endpoint**: `GET /tenant/search`

**Query Parameters**:
- `searchTerm` (required): Search term for tenant name

**Example**: `GET /tenant/search?searchTerm=Example`

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Tenants found successfully",
  "data": [
    {
      "tenantId": 1,
      "tenantName": "Example Corp",
      "tenantCode": "EXM001",
      // ... other tenant fields
    }
  ]
}
```

---

### 10. Get Tenant Statistics
Retrieves statistics for a specific tenant including user counts.

**Endpoint**: `GET /tenant/stats`

**Query Parameters**:
- `tenantId` (required): Tenant ID

**Example**: `GET /tenant/stats?tenantId=1`

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Tenant statistics retrieved successfully",
  "data": {
    "tenantId": 1,
    "tenantName": "Example Corp",
    "tenantCode": "EXM001",
    // ... other tenant fields
    "totalUsers": 25,
    "activeUsers": 20
  }
}
```

---

### 11. Get Tenant Users
Retrieves all users (both tenant users and regular users) for a specific tenant.

**Endpoint**: `GET /tenant/users`

**Query Parameters**:
- `tenantId` (required): Tenant ID

**Example**: `GET /tenant/users?tenantId=1`

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Tenant users retrieved successfully",
  "data": [
    {
      // User objects from both tenant_user and users tables
      // Format depends on user type (ADMIN, SUPER_ADMIN from tenant_user table)
      // (USER, MANAGER from users table)
    }
  ]
}
```

---

## Subscription API Endpoints

The following endpoints are available to fetch subscription plans that can be used when creating or updating tenants. **Use these endpoints to get subscription IDs for tenant operations.**

### 12. Get All Subscriptions
Retrieves all subscription plans available in the system.

**Endpoint**: `GET /subscriptions`

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Subscriptions retrieved successfully",
  "data": [
    {
      "appSubscriptionId": 1,
      "subscriptionCode": "BASIC",
      "subscriptionName": "Basic Plan",
      "description": "Basic subscription plan with limited features",
      "isActive": true,
      "createdDate": "2023-01-01T00:00:00",
      "modifiedDate": "2023-01-01T00:00:00"
    },
    {
      "appSubscriptionId": 2,
      "subscriptionCode": "PRO",
      "subscriptionName": "Pro Plan",
      "description": "Professional subscription plan with advanced features",
      "isActive": true,
      "createdDate": "2023-01-01T00:00:00",
      "modifiedDate": "2023-01-01T00:00:00"
    },
    {
      "appSubscriptionId": 3,
      "subscriptionCode": "ENTERPRISE",
      "subscriptionName": "Enterprise Plan",
      "description": "Enterprise subscription plan with full features",
      "isActive": true,
      "createdDate": "2023-01-01T00:00:00",
      "modifiedDate": "2023-01-01T00:00:00"
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Subscriptions retrieved successfully
- `500 Internal Server Error`: Server error

---

### 13. Get Active Subscriptions
Retrieves only active subscription plans (recommended for UI dropdowns).

**Endpoint**: `GET /subscriptions/active`

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Active subscriptions retrieved successfully",
  "data": [
    {
      "appSubscriptionId": 1,
      "subscriptionCode": "BASIC",
      "subscriptionName": "Basic Plan",
      "description": "Basic subscription plan with limited features",
      "isActive": true,
      "createdDate": "2023-01-01T00:00:00",
      "modifiedDate": "2023-01-01T00:00:00"
    },
    {
      "appSubscriptionId": 2,
      "subscriptionCode": "PRO",
      "subscriptionName": "Pro Plan",
      "description": "Professional subscription plan with advanced features",
      "isActive": true,
      "createdDate": "2023-01-01T00:00:00",
      "modifiedDate": "2023-01-01T00:00:00"
    }
  ]
}
```

**Use Case**: Perfect for populating dropdown lists in UI for tenant creation/update forms. Use the `appSubscriptionId` field for tenant operations.

---

### 14. Get Subscription by Code
Retrieves a specific subscription plan by its code.

**Endpoint**: `GET /subscription/by-code`

**Query Parameters**:
- `subscriptionCode` (required): Subscription code (e.g., "BASIC", "PRO", "ENTERPRISE")

**Example**: `GET /subscription/by-code?subscriptionCode=PRO`

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Subscription retrieved successfully",
  "data": {
    "appSubscriptionId": 2,
    "subscriptionCode": "PRO",
    "subscriptionName": "Pro Plan",
    "description": "Professional subscription plan with advanced features",
    "isActive": true,
    "createdDate": "2023-01-01T00:00:00",
    "modifiedDate": "2023-01-01T00:00:00"
  }
}
```

**Status Codes**:
- `200 OK`: Subscription found
- `400 Bad Request`: Empty subscription code
- `404 Not Found`: Subscription not found
- `500 Internal Server Error`: Server error

---

## Data Models

### TenantDTO
```json
{
  "tenantId": "number (Long)",
  "tenantName": "string (max 150, unique)",
  "tenantCode": "string (max 20, unique, auto-generated)",
  "appSubscriptionId": "number (Long)",
  "subscriptionCode": "string (from app_subscription)",
  "subscriptionName": "string (from app_subscription)",
  "contactEmail": "string (max 150)",
  "contactPhone": "string (max 20)",
  "isActive": "boolean",
  "subscriptionStartDate": "datetime (ISO format)",
  "subscriptionEndDate": "datetime (ISO format)",
  "createdDate": "datetime (ISO format)",
  "modifiedDate": "datetime (ISO format)",
  "totalUsers": "number (Long, only in stats)",
  "activeUsers": "number (Long, only in stats)"
}
```

### TenantCreateRequest
```json
{
  "tenantName": "string (required, max 150, unique)",
  "subscriptionId": "number (required, must exist in app_subscription table)",
  "contactEmail": "string (optional, max 150)",
  "contactPhone": "string (optional, max 20)",
  "subscriptionStartDate": "datetime (optional, ISO format)",
  "subscriptionEndDate": "datetime (optional, ISO format)"
}
```

### TenantUpdateRequest
```json
{
  "tenantName": "string (optional, max 150, unique)",
  "subscriptionId": "number (optional, must exist in app_subscription table)",
  "contactEmail": "string (optional, max 150)",
  "contactPhone": "string (optional, max 20)",
  "subscriptionStartDate": "datetime (optional, ISO format)",
  "subscriptionEndDate": "datetime (optional, ISO format)"
}
```

### TenantStatusUpdateRequest
```json
{
  "tenantId": "number (Long, required)",
  "isActive": "boolean (required)"
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "status": "FAILED",
  "message": "Error description",
  "data": null
}
```

### Common Error Messages
- **400 Bad Request**: 
  - "Tenant name already exists: {name}"
  - "Invalid subscription ID: {id}"
  - "Subscription not found with ID: {id}"
  - "Search term cannot be empty"
  - Validation errors

- **404 Not Found**: 
  - "Tenant not found with ID: {id}"
  - "Tenant not found with code: {code}"

- **500 Internal Server Error**: 
  - "Failed to create tenant"
  - "Failed to update tenant"
  - "Failed to fetch tenants"

---

## Business Rules

1. **Tenant Code Generation**: 
   - Auto-generated based on tenant name
   - Format: First 3 letters + 3-digit number (e.g., "EXM001")
   - Must be unique

2. **Subscription Validation**: 
   - Subscription ID must exist in `app_subscription` table
   - Must reference an active subscription
   - Use the separate Subscription API to get valid subscription IDs

3. **Tenant Name Uniqueness**: 
   - Tenant names must be unique across the system
   - Case-sensitive validation

4. **Soft Delete**: 
   - Delete operation sets `isActive = false`
   - No physical deletion from database

5. **User Relationships**: 
   - SUPER_ADMIN and ADMIN users stored in `tenant_user` table
   - USER and MANAGER users stored in `users` table with reference to `tenant_user`

---

## Usage Examples

### Create a new tenant
```bash
curl -X POST "http://localhost:8010/api/v1/workplace-tracker-service/tenant" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {jwt_token}" \
  -d '{
    "tenantName": "Tech Solutions Inc",
    "subscriptionId": 2,
    "contactEmail": "admin@techsolutions.com",
    "contactPhone": "+1-555-0123",
    "subscriptionStartDate": "2023-01-01T00:00:00",
    "subscriptionEndDate": "2024-01-01T00:00:00"
  }'
```

### Get all tenants with pagination
```bash
curl -X GET "http://localhost:8010/api/v1/workplace-tracker-service/tenants?page=0&size=10&sortBy=tenantName&sortDir=asc" \
  -H "Authorization: Bearer {jwt_token}"
```

### Update tenant
```bash
curl -X PUT "http://localhost:8010/api/v1/workplace-tracker-service/tenant/update?tenantId=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {jwt_token}" \
  -d '{
    "subscriptionId": 3,
    "contactEmail": "newemail@techsolutions.com",
    "contactPhone": "+1-555-9999"
  }'
```

### Search tenants
```bash
curl -X GET "http://localhost:8010/api/v1/workplace-tracker-service/tenant/search?searchTerm=Tech" \
  -H "Authorization: Bearer {jwt_token}"
```

### Get all active subscriptions (recommended for UI)
```bash
curl -X GET "http://localhost:8010/api/v1/workplace-tracker-service/subscriptions/active" \
  -H "Authorization: Bearer {jwt_token}"
```

### Get subscription by code
```bash
curl -X GET "http://localhost:8010/api/v1/workplace-tracker-service/subscription/by-code?subscriptionCode=PRO" \
  -H "Authorization: Bearer {jwt_token}"
```

### Complete UI Integration Workflow
```bash
# Step 1: Get available subscriptions for dropdown
curl -X GET "http://localhost:8010/api/v1/workplace-tracker-service/subscriptions/active" \
  -H "Authorization: Bearer {jwt_token}"

# Step 2: Create tenant with selected subscription ID (not code)
curl -X POST "http://localhost:8010/api/v1/workplace-tracker-service/tenant" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {jwt_token}" \
  -d '{
    "tenantName": "Tech Solutions Inc",
    "subscriptionId": 2,
    "contactEmail": "admin@techsolutions.com",
    "contactPhone": "+1-555-0123"
  }'
```

---

## UI Integration Guide

### For Frontend Developers

#### 1. Subscription Dropdown Population
```javascript
// Fetch active subscriptions for dropdown
fetch('/api/v1/workplace-tracker-service/subscriptions/active', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
})
.then(response => response.json())
.then(data => {
  // data.data contains array of subscriptions
  // Use appSubscriptionId for tenant operations
  // Display subscriptionName to users
});
```

#### 2. Tenant Creation
```javascript
// Create tenant with subscription ID
const tenantData = {
  tenantName: "Example Corp",
  subscriptionId: selectedSubscriptionId, // Use ID from dropdown
  contactEmail: "contact@example.com",
  contactPhone: "+1-555-0123",
  subscriptionStartDate: "2023-01-01T00:00:00",
  subscriptionEndDate: "2024-01-01T00:00:00"
};

fetch('/api/v1/workplace-tracker-service/tenant', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  },
  body: JSON.stringify(tenantData)
});
```

#### 3. Tenant Update
```javascript
// Update tenant subscription
const updateData = {
  subscriptionId: newSubscriptionId, // Use ID, not code
  contactEmail: "newemail@example.com"
};

fetch(`/api/v1/workplace-tracker-service/tenant/update?tenantId=${tenantId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  },
  body: JSON.stringify(updateData)
});
```

#### Key Points for UI:
- **Always use `appSubscriptionId` for tenant operations, not `subscriptionCode`**
- **Display `subscriptionName` to users in dropdowns**
- **Fetch active subscriptions using `/subscriptions/active` endpoint**
- **Handle validation errors for invalid subscription IDs**
- **The response will include both subscription ID and name for display**

---

## Related Documentation
- [Platform User Auth API](./PLATFORM_USER_AUTH_API_README.md)
- [User Notes API](./USER_NOTES_API_README.md)
- [User Tasks API](./USER_TASKS_API_README.md)
- [Password Reset API](./PASSWORD_RESET_API_README.md)

---

## Database Schema Reference

### Tables Involved
- `tenant` - Main tenant information
- `app_subscription` - Subscription plans
- `tenant_user` - Admin/Super Admin users
- `users` - Regular users linked to tenants

### Key Relationships
- `tenant.app_subscription_id` → `app_subscription.app_subscription_id`
- `tenant_user.tenant_id` → `tenant.tenant_id`
- `users.tenant_user_id` → `tenant_user.tenant_user_id`

---

## Migration Notes

### Changes from Previous Version
- **Breaking Change**: Tenant creation and update now require `subscriptionId` instead of `subscriptionCode`
- **Benefit**: Better validation and direct relationship with subscription data
- **Migration**: Update UI forms to use subscription IDs from the subscription API endpoints

### Backward Compatibility
- Tenant responses still include both `appSubscriptionId` and `subscriptionCode` for display purposes
- Existing tenant data remains unchanged
- Only request payloads for create/update operations have changed

---

**Note**: All endpoints require proper JWT authentication with PLATFORM_USER role. Ensure you have the necessary permissions before accessing these APIs. Always use subscription IDs (not codes) when creating or updating tenants.
