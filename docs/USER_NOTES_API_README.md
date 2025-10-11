# User Notes API Documentation

## Overview
The User Notes API provides comprehensive functionality for creating, managing, and organizing user notes within the Workplace Tracker Service. This API supports various note types, categories, priorities, and advanced features like pinning, archiving, searching, and bulk operations.

## Base URL
```
http://localhost:8010/api/v1/workplace-tracker-service/notes
```

## Authentication
All endpoints require Bearer Token authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Database Schema

The User Notes functionality is built on the following database table structure:

```sql
CREATE TABLE IF NOT EXISTS user_notes (
    user_note_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    note_title VARCHAR(500) NOT NULL,
    note_content TEXT NOT NULL,
    note_type VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    color VARCHAR(20) NOT NULL DEFAULT 'DEFAULT',
    category VARCHAR(20) NOT NULL DEFAULT 'PERSONAL',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_shared BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_date TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    access_count INT NOT NULL DEFAULT 0,
    last_accessed_date TIMESTAMP NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_notes_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

---

## API Endpoints

### 1. Create User Note

**Method:** `POST`  
**Endpoint:** `/notes`  
**Authentication:** Required

**Request Body:**
```json
{
    "noteTitle": "Project Meeting Notes",
    "noteContent": "Discussed Q4 goals, budget allocation, and team restructuring plans. Key decisions made on technology stack migration.",
    "noteType": "TEXT",
    "color": "BLUE", 
    "category": "WORK",
    "priority": "HIGH",
    "status": "ACTIVE",
    "isPinned": false,
    "isShared": false,
    "reminderDate": "2025-10-15T10:00:00"
}
```

**Response (201 Created):**
```json
{
    "status": "SUCCESS",
    "message": "Note created successfully.",
    "data": {
        "userNoteId": 1,
        "userId": 123,
        "noteTitle": "Project Meeting Notes",
        "noteContent": "Discussed Q4 goals, budget allocation...",
        "noteType": "TEXT",
        "color": "BLUE",
        "category": "WORK", 
        "priority": "HIGH",
        "status": "ACTIVE",
        "isPinned": false,
        "isShared": false,
        "reminderDate": "2025-10-15T10:00:00",
        "version": 1,
        "accessCount": 0,
        "lastAccessedDate": null,
        "createdDate": "2025-10-12T14:30:00",
        "modifiedDate": "2025-10-12T14:30:00"
    }
}
```

---

### 2. Get User Note by ID

**Method:** `GET`  
**Endpoint:** `/notes?noteId={noteId}`  
**Authentication:** Required

**Query Parameters:**
- `noteId` (required): Long - The ID of the note to retrieve

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Note retrieved successfully.",
    "data": {
        "userNoteId": 1,
        "userId": 123,
        "noteTitle": "Project Meeting Notes",
        "noteContent": "Discussed Q4 goals, budget allocation...",
        "noteType": "TEXT",
        "color": "BLUE",
        "category": "WORK",
        "priority": "HIGH",
        "status": "ACTIVE",
        "isPinned": false,
        "isShared": false,
        "reminderDate": "2025-10-15T10:00:00",
        "version": 1,
        "accessCount": 5,
        "lastAccessedDate": "2025-10-12T14:30:00",
        "createdDate": "2025-10-12T14:30:00",
        "modifiedDate": "2025-10-12T14:30:00"
    }
}
```

---

### 3. Get All User Notes (Basic)

**Method:** `GET`  
**Endpoint:** `/notes/user`  
**Authentication:** Required

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Notes retrieved successfully.",
    "data": {
        "notes": [
            {
                "userNoteId": 1,
                "noteTitle": "Project Meeting Notes",
                "noteContent": "Discussed Q4 goals...",
                "noteType": "TEXT",
                "color": "BLUE",
                "category": "WORK",
                "priority": "HIGH",
                "status": "ACTIVE",
                "isPinned": false,
                "isShared": false,
                "createdDate": "2025-10-12T14:30:00",
                "modifiedDate": "2025-10-12T14:30:00"
            }
        ],
        "totalCount": 15,
        "page": 0,
        "limit": 10,
        "totalPages": 2
    }
}
```

---

### 4. Get User Notes with Pagination & Sorting

**Method:** `GET`  
**Endpoint:** `/notes/user?page={page}&limit={limit}&sortBy={sortBy}&sortOrder={sortOrder}`  
**Authentication:** Required

**Query Parameters:**
- `page` (optional): Integer - Page number (default: 0)
- `limit` (optional): Integer - Items per page (default: 10)
- `sortBy` (optional): String - Sort field (createdDate, modifiedDate, noteTitle, priority)
- `sortOrder` (optional): String - Sort direction (asc, desc)

**Example URL:**
```
/notes/user?page=0&limit=10&sortBy=modifiedDate&sortOrder=desc
```

---

### 5. Get User Notes with All Filters

**Method:** `GET`  
**Endpoint:** `/notes/user`  
**Authentication:** Required

**Query Parameters:**
- `page`: Integer (default: 0)
- `limit`: Integer (default: 20)
- `noteType`: String - TEXT, CHECKLIST, DRAWING, VOICE, IMAGE, LINK
- `color`: String - DEFAULT, YELLOW, ORANGE, RED, PINK, PURPLE, BLUE, TEAL, GREEN, BROWN, GREY
- `category`: String - PERSONAL, WORK, IDEAS, REMINDERS, PROJECTS, MEETING_NOTES, SHOPPING, TRAVEL, HEALTH, FINANCE, LEARNING, INSPIRATION
- `priority`: String - LOW, MEDIUM, HIGH, URGENT
- `status`: String - ACTIVE, ARCHIVED, DELETED, PINNED
- `isPinned`: Boolean
- `isShared`: Boolean
- `searchTerm`: String - Search in title and content
- `sortBy`: String
- `sortOrder`: String
- `startDate`: String (ISO format)
- `endDate`: String (ISO format)

**Example URL:**
```
/notes/user?page=0&limit=20&noteType=TEXT&color=BLUE&category=WORK&priority=HIGH&status=ACTIVE&isPinned=true&isShared=false&searchTerm=meeting&sortBy=modifiedDate&sortOrder=desc&startDate=2025-10-01T00:00:00&endDate=2025-10-31T23:59:59
```

---

### 6. Update User Note

**Method:** `PUT`  
**Endpoint:** `/notes?noteId={noteId}`  
**Authentication:** Required

**Request Body:**
```json
{
    "noteTitle": "Updated Project Meeting Notes",
    "noteContent": "Updated: Discussed Q4 goals, budget allocation, team restructuring plans, and new client acquisition strategy.",
    "noteType": "TEXT",
    "color": "GREEN",
    "category": "WORK",
    "priority": "URGENT",
    "status": "ACTIVE",
    "isPinned": true,
    "isShared": true,
    "reminderDate": "2025-10-16T14:00:00"
}
```

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Note updated successfully.",
    "data": {
        "userNoteId": 1,
        "userId": 123,
        "noteTitle": "Updated Project Meeting Notes",
        "noteContent": "Updated: Discussed Q4 goals...",
        "noteType": "TEXT",
        "color": "GREEN",
        "category": "WORK",
        "priority": "URGENT",
        "status": "ACTIVE",
        "isPinned": true,
        "isShared": true,
        "reminderDate": "2025-10-16T14:00:00",
        "version": 2,
        "accessCount": 5,
        "lastAccessedDate": "2025-10-12T14:30:00",
        "createdDate": "2025-10-12T14:30:00",
        "modifiedDate": "2025-10-12T15:45:00"
    }
}
```

---

### 7. Delete User Note (Soft Delete)

**Method:** `DELETE`  
**Endpoint:** `/notes?noteId={noteId}`  
**Authentication:** Required

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Note deleted successfully.",
    "data": null
}
```

---

### 8. Delete User Note (Permanent)

**Method:** `DELETE`  
**Endpoint:** `/notes?noteId={noteId}&permanent=true`  
**Authentication:** Required

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Note permanently deleted successfully.",
    "data": null
}
```

---

### 9. Get Notes by Type

**Method:** `GET`  
**Endpoint:** `/notes/by-type?noteType={noteType}&page={page}&limit={limit}&sortBy={sortBy}&sortOrder={sortOrder}`  
**Authentication:** Required

**Query Parameters:**
- `noteType` (required): String - TEXT, CHECKLIST, DRAWING, VOICE, IMAGE, LINK
- `page`, `limit`, `sortBy`, `sortOrder`: Same as pagination parameters

---

### 10. Get Notes by Category

**Method:** `GET`  
**Endpoint:** `/notes/by-category?category={category}&page={page}&limit={limit}&sortBy={sortBy}&sortOrder={sortOrder}`  
**Authentication:** Required

**Query Parameters:**
- `category` (required): String - PERSONAL, WORK, IDEAS, REMINDERS, etc.

---

### 11. Get Pinned Notes

**Method:** `GET`  
**Endpoint:** `/notes/pinned?page={page}&limit={limit}&sortBy={sortBy}&sortOrder={sortOrder}`  
**Authentication:** Required

---

### 12. Get Archived Notes

**Method:** `GET`  
**Endpoint:** `/notes/archived?page={page}&limit={limit}&sortBy={sortBy}&sortOrder={sortOrder}`  
**Authentication:** Required

---

### 13. Search Notes

**Method:** `GET`  
**Endpoint:** `/notes/search?query={searchTerm}&page={page}&limit={limit}&sortBy={sortBy}&sortOrder={sortOrder}`  
**Authentication:** Required

**Query Parameters:**
- `query` (required): String - Search term for title and content

---

### 14. Update Note Status

**Method:** `PATCH`  
**Endpoint:** `/notes/status?noteId={noteId}&status={status}`  
**Authentication:** Required

**Query Parameters:**
- `noteId` (required): Long
- `status` (required): String - ACTIVE, ARCHIVED, DELETED, PINNED

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Note status updated successfully.",
    "data": null
}
```

---

### 15. Toggle Pin Status

**Method:** `PATCH`  
**Endpoint:** `/notes/pin?noteId={noteId}`  
**Authentication:** Required

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Note pin status toggled successfully.",
    "data": {
        "isPinned": true
    }
}
```

---

### 16. Update Note Color

**Method:** `PATCH`  
**Endpoint:** `/notes/color?noteId={noteId}&color={color}`  
**Authentication:** Required

**Query Parameters:**
- `noteId` (required): Long
- `color` (required): String - DEFAULT, YELLOW, ORANGE, RED, PINK, PURPLE, BLUE, TEAL, GREEN, BROWN, GREY

---

### 17. Get Note Statistics

**Method:** `GET`  
**Endpoint:** `/notes/stats`  
**Authentication:** Required

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Note statistics retrieved successfully.",
    "data": {
        "totalNotes": 45,
        "activeNotes": 32,
        "archivedNotes": 8,
        "pinnedNotes": 5,
        "notesByCategory": {
            "WORK": 20,
            "PERSONAL": 15,
            "IDEAS": 5,
            "REMINDERS": 3,
            "PROJECTS": 2
        },
        "notesByPriority": {
            "HIGH": 10,
            "MEDIUM": 25,
            "LOW": 8,
            "URGENT": 2
        },
        "notesByType": {
            "TEXT": 40,
            "CHECKLIST": 3,
            "VOICE": 1,
            "IMAGE": 1
        }
    }
}
```

---

### 18. Bulk Update Notes

**Method:** `PUT`  
**Endpoint:** `/notes/bulk-update`  
**Authentication:** Required

**Request Body:**
```json
{
    "noteIds": [1, 2, 3],
    "status": "ARCHIVED",
    "color": "GREY",
    "category": "WORK",
    "priority": "LOW",
    "isPinned": false,
    "isShared": false
}
```

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "3 notes updated successfully.",
    "data": {
        "updatedCount": 3,
        "failedCount": 0
    }
}
```

---

### 19. Bulk Delete Notes

**Method:** `DELETE`  
**Endpoint:** `/notes/bulk-delete`  
**Authentication:** Required

**Request Body:**
```json
{
    "noteIds": [1, 2, 3],
    "permanentDelete": false
}
```

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "3 notes deleted successfully.",
    "data": {
        "deletedCount": 3,
        "failedCount": 0
    }
}
```

---

### 20. Duplicate Note

**Method:** `POST`  
**Endpoint:** `/notes/duplicate?noteId={noteId}`  
**Authentication:** Required

**Response (201 Created):**
```json
{
    "status": "SUCCESS",
    "message": "Note duplicated successfully.",
    "data": {
        "userNoteId": 46,
        "userId": 123,
        "noteTitle": "Copy of Project Meeting Notes",
        "noteContent": "Discussed Q4 goals...",
        "noteType": "TEXT",
        "color": "BLUE",
        "category": "WORK",
        "priority": "HIGH",
        "status": "ACTIVE",
        "isPinned": false,
        "isShared": false,
        "reminderDate": null,
        "version": 1,
        "accessCount": 0,
        "lastAccessedDate": null,
        "createdDate": "2025-10-12T15:30:00",
        "modifiedDate": "2025-10-12T15:30:00"
    }
}
```

---

## Data Models

### UserNotesDTO (Complete)
```json
{
    "userNoteId": "Long",
    "userId": "Long", 
    "noteTitle": "String (max 500 chars)",
    "noteContent": "String (text)",
    "noteType": "String (enum)",
    "color": "String (enum)",
    "category": "String (enum)",
    "priority": "String (enum)", 
    "status": "String (enum)",
    "isPinned": "Boolean",
    "isShared": "Boolean",
    "reminderDate": "String (ISO datetime)",
    "version": "Integer",
    "accessCount": "Integer",
    "lastAccessedDate": "String (ISO datetime)",
    "createdDate": "String (ISO datetime)",
    "modifiedDate": "String (ISO datetime)"
}
```

### UserNotesListResponseDTO
```json
{
    "notes": "Array of UserNotesDTO",
    "totalCount": "Integer",
    "page": "Integer",
    "limit": "Integer",
    "totalPages": "Integer"
}
```

### UserNotesStatsDTO
```json
{
    "totalNotes": "Integer",
    "activeNotes": "Integer",
    "archivedNotes": "Integer",
    "pinnedNotes": "Integer",
    "notesByCategory": "Map<String, Integer>",
    "notesByPriority": "Map<String, Integer>",
    "notesByType": "Map<String, Integer>"
}
```

### UserNotesBulkUpdateRequest
```json
{
    "noteIds": "Array of Long",
    "status": "String (optional)",
    "color": "String (optional)",
    "category": "String (optional)",
    "priority": "String (optional)",
    "isPinned": "Boolean (optional)",
    "isShared": "Boolean (optional)"
}
```

### UserNotesBulkDeleteRequest
```json
{
    "noteIds": "Array of Long",
    "permanentDelete": "Boolean (default: false)"
}
```

---

## Enum Values

### Note Type
- `TEXT` - Plain text note
- `CHECKLIST` - Checklist/todo note
- `DRAWING` - Drawing/sketch note
- `VOICE` - Voice memo note
- `IMAGE` - Image note
- `LINK` - Link/bookmark note

### Color
- `DEFAULT` - Default color
- `YELLOW` - Yellow background
- `ORANGE` - Orange background
- `RED` - Red background
- `PINK` - Pink background
- `PURPLE` - Purple background
- `BLUE` - Blue background
- `TEAL` - Teal background
- `GREEN` - Green background
- `BROWN` - Brown background
- `GREY` - Grey background

### Category
- `PERSONAL` - Personal notes
- `WORK` - Work-related notes
- `IDEAS` - Ideas and brainstorming
- `REMINDERS` - Reminder notes
- `PROJECTS` - Project-related notes
- `MEETING_NOTES` - Meeting notes
- `SHOPPING` - Shopping lists
- `TRAVEL` - Travel notes
- `HEALTH` - Health-related notes
- `FINANCE` - Finance-related notes
- `LEARNING` - Learning and education
- `INSPIRATION` - Inspirational content

### Priority
- `LOW` - Low priority
- `MEDIUM` - Medium priority (default)
- `HIGH` - High priority
- `URGENT` - Urgent priority

### Status
- `ACTIVE` - Active note (default)
- `ARCHIVED` - Archived note
- `DELETED` - Soft deleted note
- `PINNED` - Pinned note

---

## Common Error Responses

### 404 Not Found
```json
{
    "status": "FAILURE",
    "message": "Note not found with ID: 123",
    "data": null
}
```

### 400 Bad Request
```json
{
    "status": "FAILURE", 
    "message": "Invalid note type. Allowed values: TEXT, CHECKLIST, DRAWING, VOICE, IMAGE, LINK",
    "data": null
}
```

### 401 Unauthorized
```json
{
    "status": "FAILURE",
    "message": "Authentication required. Please provide a valid Bearer token.",
    "data": null
}
```

### 403 Forbidden
```json
{
    "status": "FAILURE",
    "message": "Access denied. You can only access your own notes.",
    "data": null
}
```

### 500 Internal Server Error
```json
{
    "status": "FAILURE",
    "message": "An internal server error occurred. Please try again later.",
    "data": null
}
```

---

## Usage Examples

### Creating a Simple Text Note
```bash
curl -X POST "http://localhost:8010/api/v1/workplace-tracker-service/notes" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "noteTitle": "Meeting Notes",
    "noteContent": "Discussed project timeline and deliverables",
    "noteType": "TEXT",
    "category": "WORK",
    "priority": "HIGH"
  }'
```

### Searching Notes
```bash
curl -X GET "http://localhost:8010/api/v1/workplace-tracker-service/notes/search?query=project&page=0&limit=10" \
  -H "Authorization: Bearer <your-token>"
```

### Getting Pinned Notes
```bash
curl -X GET "http://localhost:8010/api/v1/workplace-tracker-service/notes/pinned?page=0&limit=10" \
  -H "Authorization: Bearer <your-token>"
```

### Bulk Update Notes
```bash
curl -X PUT "http://localhost:8010/api/v1/workplace-tracker-service/notes/bulk-update" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "noteIds": [1, 2, 3],
    "status": "ARCHIVED",
    "color": "GREY"
  }'
```

---

## Performance Considerations

1. **Pagination**: Always use pagination for large datasets to improve performance
2. **Indexing**: The database includes indexes on frequently queried fields (user_id, note_type, category, status, is_pinned, created_date, modified_date)
3. **Search**: Full-text search is performed on note_title and note_content fields
4. **Caching**: Consider implementing caching for frequently accessed notes
5. **Bulk Operations**: Use bulk endpoints when performing operations on multiple notes

---

## Security Notes

1. **Authentication**: All endpoints require valid JWT authentication
2. **Authorization**: Users can only access their own notes
3. **Data Validation**: All input data is validated according to the defined constraints
4. **SQL Injection Prevention**: All database queries use parameterized statements
5. **XSS Prevention**: All user input is properly sanitized

---

## Rate Limiting

Consider implementing rate limiting for the following endpoints:
- Create Note: 100 requests per minute per user
- Search Notes: 50 requests per minute per user
- Bulk Operations: 10 requests per minute per user

---

## Future Enhancements

1. **File Attachments**: Support for attaching files to notes
2. **Collaboration**: Real-time collaborative editing
3. **Note Templates**: Pre-defined note templates
4. **Export Features**: Export notes to PDF, Word, etc.
5. **Advanced Search**: Full-text search with filters and sorting
6. **Note Sharing**: Share notes with other users or make them public
7. **Mobile Sync**: Offline support and synchronization
8. **Rich Text Editor**: Support for formatted text, images, and links

---

## Support

For any questions or issues regarding the User Notes API, please contact the development team or refer to the main project documentation.

**Author:** Siddhant Patni  
**Last Updated:** October 12, 2025  
**Version:** 1.0.0
