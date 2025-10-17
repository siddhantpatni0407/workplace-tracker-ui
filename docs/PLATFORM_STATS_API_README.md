# Platform Statistics API

## Overview
The Platform Statistics API provides comprehensive platform-wide statistics for PLATFORM_USER role. This API returns aggregated data about tenants, super admins, admins, and users across the entire platform with detailed tenant-wise breakdowns.

## Base URL
```
http://localhost:8010/api/v1/workplace-tracker-service
```

## Authentication
All endpoints require JWT token authentication with specific role permissions.

### Required Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## Endpoints

### 1. Get Platform Statistics

Retrieves comprehensive platform statistics including tenant counts, user role distributions, and tenant-wise breakdowns.

**Endpoint:** `GET /platform/stats`

**Required Role:** `PLATFORM_USER`

**Request:**
```http
GET /api/v1/workplace-tracker-service/platform/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Platform statistics retrieved successfully.",
  "data": {
    "totalTenants": 2,
    "totalSuperAdmins": 2,
    "totalAdmins": 2,
    "totalUsers": 0,
    "totalTenantUsers": 4,
    "tenantStats": [
      {
        "tenantId": 1,
        "tenantName": "Xoriant",
        "superAdminCount": 1,
        "adminCount": 1,
        "userCount": 0,
        "totalTenantUsers": 2
      },
      {
        "tenantId": 2,
        "tenantName": "Persistent",
        "superAdminCount": 1,
        "adminCount": 1,
        "userCount": 0,
        "totalTenantUsers": 2
      }
    ]
  }
}
```

## Response Schema

### PlatformStatsDTO
| Field | Type | Description |
|-------|------|-------------|
| `totalTenants` | `Long` | Total number of distinct tenants in the platform |
| `totalSuperAdmins` | `Long` | Total number of users with SUPER_ADMIN role |
| `totalAdmins` | `Long` | Total number of users with ADMIN role |
| `totalUsers` | `Long` | Total number of users with USER and MANAGER roles |
| `totalTenantUsers` | `Long` | Total number of all tenant users in the platform |
| `tenantStats` | `List<TenantStatsDTO>` | Detailed statistics for each tenant |

### TenantStatsDTO
| Field | Type | Description |
|-------|------|-------------|
| `tenantId` | `Long` | Unique identifier of the tenant |
| `tenantName` | `String` | Name of the tenant organization |
| `superAdminCount` | `Long` | Number of super admins in this tenant |
| `adminCount` | `Long` | Number of admins in this tenant |
| `userCount` | `Long` | Number of users (USER + MANAGER roles) in this tenant |
| `totalTenantUsers` | `Long` | Total number of all users in this tenant |

## Role Codes Used

The API uses the following role codes for statistics calculation:

| Role Code | Description |
|-----------|-------------|
| `SUPER_ADMIN` | Super Administrator role |
| `ADMIN` | Administrator role |
| `USER` | Regular user role |
| `MANAGER` | Manager role |

## HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Statistics retrieved successfully |
| `403 Forbidden` | Access denied - invalid role permissions |
| `401 Unauthorized` | Invalid or missing JWT token |
| `500 Internal Server Error` | Server error during statistics calculation |

## Error Responses

### 403 Forbidden
```json
{
  "status": "FAILED",
  "message": "Access denied. PLATFORM_USER role required.",
  "data": null
}
```

### 401 Unauthorized
```json
{
  "status": "FAILED",
  "message": "Invalid or missing JWT token.",
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "status": "FAILED",
  "message": "Failed to retrieve platform statistics: Database connection error",
  "data": null
}
```

## Usage Examples

### cURL Example
```bash
curl -X GET \
  'http://localhost:8010/api/v1/workplace-tracker-service/platform/stats' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json'
```

### JavaScript/Fetch Example
```javascript
const response = await fetch('http://localhost:8010/api/v1/workplace-tracker-service/platform/stats', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log('Platform Statistics:', data);
```

### Java Example (Spring RestTemplate)
```java
HttpHeaders headers = new HttpHeaders();
headers.setBearerAuth(jwtToken);
headers.setContentType(MediaType.APPLICATION_JSON);

HttpEntity<String> entity = new HttpEntity<>(headers);

ResponseEntity<ResponseDTO<PlatformStatsDTO>> response = restTemplate.exchange(
    "http://localhost:8010/api/v1/workplace-tracker-service/platform/stats",
    HttpMethod.GET,
    entity,
    new ParameterizedTypeReference<ResponseDTO<PlatformStatsDTO>>() {}
);

PlatformStatsDTO stats = response.getBody().getData();
```

## Business Logic

### Statistics Calculation
1. **Total Tenants**: Count of distinct tenant IDs from tenant_user table
2. **Role-based Counts**: Uses JOIN with user_role table to count by role codes
3. **Tenant-wise Breakdown**: Groups statistics by tenant_id for detailed analysis
4. **User Classification**: 
   - Super Admins: Users with `SUPER_ADMIN` role
   - Admins: Users with `ADMIN` role  
   - Users: Users with `USER` or `MANAGER` roles

### Database Queries
The API uses optimized queries with JOINs between:
- `tenant_user` table (main data source)
- `user_role` table (for role code lookups)
- `tenant` table (for tenant names)

## Security Considerations

1. **Role-based Access**: Only PLATFORM_USER role can access this endpoint
2. **JWT Validation**: All requests must include valid JWT token
3. **Data Isolation**: Returns aggregated data only, no sensitive user details
4. **Read-only Operations**: This endpoint only retrieves data, no modifications

## Performance Notes

- **Caching**: Consider implementing caching for statistics as they don't change frequently
- **Indexing**: Ensure proper database indexes on tenant_id and role_id columns
- **Aggregation**: Uses efficient GROUP BY queries for tenant-wise statistics
- **Memory Usage**: Returns summarized data to minimize memory footprint

## Monitoring and Logging

The API logs the following information:
- Request received with user role
- Statistics calculation steps
- Overall counts retrieved
- Tenant-wise statistics processing
- Error details for troubleshooting

## Related APIs

- **Tenant Management API**: For managing individual tenants
- **User Management API**: For managing tenant users
- **Platform User Management API**: For managing platform-level users

## Notes

- Statistics are calculated in real-time from the database
- Tenant names are fetched dynamically from the tenant table
- Role codes provide flexibility and maintainability over hardcoded role IDs
- The API supports multiple user roles (USER + MANAGER) in the "Users" category
- Empty tenant stats (0 counts) are included in the response for completeness

---

**Last Updated:** October 17, 2025  
**API Version:** 1.0  
**Author:** Siddhant Patni
