# Password Reset API Documentation

This document covers the password-related APIs in the Workplace Tracker Service.

---

## Change Password API (Authenticated Users)

This API allows authenticated users to change their current password. **The user ID is automatically extracted from the JWT token - no need to send it in the request.**

### **Endpoint:**
```
PATCH /api/v1/workplace-tracker-service/user/change-password
```

### **Headers:**
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

### **Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword123"
}
```

### **Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentPassword` | String | Yes | Current password (minimum 6 characters) |
| `newPassword` | String | Yes | New password (minimum 8 characters) |

**Note:** `userId` is **NOT** required in the request body as it is automatically extracted from the JWT token.

### **Authentication & Authorization:**
- **Required Role:** USER
- **JWT Token:** Must be provided in Authorization header
- **User ID:** Automatically extracted from the token - ensures users can only change their own password

### **Validation Rules:**
- Current password must be at least 6 characters
- New password must be at least 8 characters
- New password must be different from current password
- Current password must match the stored password
- JWT token must be valid and contain user information

### **Response Examples:**

**Success (HTTP 200):**
```json
{
  "status": "SUCCESS",
  "message": "Password changed successfully.",
  "data": null
}
```

**Failure - User Not Found (HTTP 404):**
```json
{
  "status": "FAILED",
  "message": "User not found with ID: 12345",
  "data": null
}
```

**Failure - Invalid Current Password (HTTP 400):**
```json
{
  "status": "FAILED",
  "message": "Current password is incorrect.",
  "data": null
}
```

**Failure - Validation Error (HTTP 400):**
```json
{
  "status": "FAILED",
  "message": "New password must be at least 8 characters long.",
  "data": null
}
```

**Failure - Same Password (HTTP 400):**
```json
{
  "status": "FAILED",
  "message": "New password must be different from current password.",
  "data": null
}
```

**Failure - Authentication Error (HTTP 401/403):**
```json
{
  "status": "FAILED",
  "message": "Access denied or invalid token.",
  "data": null
}
```

**Failure - Server Error (HTTP 500):**
```json
{
  "status": "FAILED",
  "message": "Failed to change password.",
  "data": null
}
```

---

## Security Enhancements

### **JWT Token-Based Security:**
- **User ID Extraction**: User ID is automatically extracted from the JWT token, preventing unauthorized access
- **Role-Based Access**: Only users with "USER" role can change passwords
- **Self-Service Only**: Users can only change their own password (no userId manipulation possible)

### **Password Storage:**
- Passwords are encrypted using AES encryption before storing in the database
- The system uses versioned encryption keys for enhanced security

### **Authentication:**
- Change Password API requires valid JWT token in Authorization header with @RequiredRole({"USER"})
- Forgot Password Reset API is public but requires OTP verification

### **Password Requirements:**
- Minimum 8 characters for new passwords
- Passwords are case-sensitive
- No maximum length restriction mentioned in current implementation

### **OTP Management:**
- OTPs are stored in-memory (ConcurrentHashMap)
- OTPs are automatically removed after successful password reset
- Invalid OTP attempts are rejected

---

### **Change Password (Updated - No userId needed):**
```
PATCH /api/v1/workplace-tracker-service/user/change-password
Content-Type: application/json
Authorization: Bearer your_jwt_token_here

{
  "currentPassword": "currentPass123",
  "newPassword": "newSecurePass123"
}
```

**Important Notes for Testing:**
- Ensure you have a valid JWT token from login
- The userId will be automatically extracted from the token
- Do NOT include userId in the request body (it will be ignored)

---

## Error Handling

Both APIs implement comprehensive error handling:

1. **Validation Errors**: Invalid input parameters return 400 Bad Request
2. **Authentication Errors**: Missing/invalid JWT returns 401 Unauthorized
3. **Authorization Errors**: Insufficient role permissions return 403 Forbidden
4. **Not Found Errors**: Non-existent users return 404 Not Found  
5. **Server Errors**: Unexpected exceptions return 500 Internal Server Error

All errors follow the consistent response format with `status`, `message`, and `data` fields.

---

## Implementation Notes

- **JWT Integration**: User ID is extracted from JWT token using `jwtAuthenticationContext.getCurrentUserId()`
- **Enhanced Security**: No user ID manipulation possible - users can only change their own password
- **AES Encryption**: Password storage uses AES encryption instead of bcrypt
- **OTP Validation**: Currently implemented with in-memory storage
- **Role-Based Access**: Uses `@RequiredRole({"USER"})` annotation for authorization
- **Password Encryption Key Versioning**: Supported for key rotation scenarios
