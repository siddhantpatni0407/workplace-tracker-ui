# User Tasks API Documentation

## Overview
The User Tasks API provides comprehensive functionality for creating, managing, and organizing user tasks within the Workplace Tracker Service. This API supports various task types, categories, priorities, status tracking, and advanced features like bulk operations, subtasks, comments, and comprehensive filtering.

## Base URL
```
http://localhost:8010/api/v1/workplace-tracker-service/tasks
```

## Authentication
All endpoints require Bearer Token authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Database Schema

The User Tasks functionality is built on the following database table structure:

```sql
CREATE TABLE IF NOT EXISTS user_tasks (
    user_task_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    task_title VARCHAR(500) NOT NULL,
    task_description TEXT,
    task_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    category VARCHAR(20) DEFAULT 'WORK',
    task_type VARCHAR(20) DEFAULT 'TASK',
    due_date DATE,
    reminder_date TIMESTAMP,
    tags TEXT[], -- PostgreSQL array of strings
    parent_task_id BIGINT,
    created_by BIGINT,
    remarks TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_tasks_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_tasks_parent FOREIGN KEY (parent_task_id) REFERENCES user_tasks(user_task_id) ON DELETE CASCADE
);

```

---

## Enums and Constants

### TaskStatus
```typescript
enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED'
}
```

### TaskPriority
```typescript
enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}
```

### TaskCategory
```typescript
enum TaskCategory {
  WORK = 'WORK',
  PERSONAL = 'PERSONAL',
  PROJECT = 'PROJECT',
  MEETING = 'MEETING',
  LEARNING = 'LEARNING',
  ADMIN = 'ADMIN',
  OTHER = 'OTHER'
}
```

### TaskType
```typescript
enum TaskType {
  TASK = 'TASK',
  SUBTASK = 'SUBTASK',
  MILESTONE = 'MILESTONE',
  BUG = 'BUG',
  FEATURE = 'FEATURE'
}
```

---

## API Endpoints

### 1. Create User Task

**Method:** `POST`  
**Endpoint:** `/tasks`  
**Authentication:** Required

**Request Body:**
```json
{
    "taskTitle": "Implement User Authentication Module",
    "taskDescription": "Design and develop JWT-based authentication system with role-based access control. Include password reset functionality and session management.",
    "taskDate": "2025-10-12",
    "status": "NOT_STARTED",
    "priority": "HIGH",
    "category": "PROJECT",
    "taskType": "FEATURE",
    "dueDate": "2025-10-20",
    "reminderDate": "2025-10-19T09:00:00",
    "tags": ["authentication", "security", "backend"],
    "parentTaskId": null,
    "remarks": "Coordinate with security team for compliance review",
    "isRecurring": false,
    "recurringPattern": null
}
```

**Response (201 Created):**
```json
{
    "status": "SUCCESS",
    "message": "Task created successfully.",
    "data": {
        "userTaskId": 1,
        "userId": 123,
        "taskTitle": "Implement User Authentication Module",
        "taskDescription": "Design and develop JWT-based authentication system...",
        "taskDate": "2025-10-12",
        "status": "NOT_STARTED",
        "priority": "HIGH",
        "category": "PROJECT",
        "taskType": "FEATURE",
        "dueDate": "2025-10-20",
        "reminderDate": "2025-10-19T09:00:00",
        "tags": ["authentication", "security", "backend"],
        "parentTaskId": null,
        "createdBy": 123,
        "remarks": "Coordinate with security team for compliance review",
        "isRecurring": false,
        "recurringPattern": null,
        "createdAt": "2025-10-12T14:30:00",
        "updatedAt": "2025-10-12T14:30:00"
    }
}
```

---

### 2. Get Tasks by User

**Method:** `GET`  
**Endpoint:** `/tasks/user`  
**Authentication:** Required

**Query Parameters (Optional):**
```
status - Filter by task status (NOT_STARTED, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED)
priority - Filter by priority (LOW, MEDIUM, HIGH, URGENT)  
category - Filter by category (WORK, PERSONAL, PROJECT, etc.)
taskType - Filter by task type (TASK, SUBTASK, MILESTONE, BUG, FEATURE)
startDate - Filter tasks created after this date (YYYY-MM-DD)
endDate - Filter tasks created before this date (YYYY-MM-DD)
dueDateStart - Filter tasks with due date after this date (YYYY-MM-DD)
dueDateEnd - Filter tasks with due date before this date (YYYY-MM-DD)
isOverdue - Filter overdue tasks (true/false)
searchTerm - Search in title, description, and tags
tags - Filter by tags (comma-separated)
page - Page number for pagination (default: 0)
limit - Number of results per page (default: 50)
sortBy - Sort field (dueDate, priority, status, createdAt, taskTitle)
sortOrder - Sort direction (ASC, DESC, default: ASC)
```

**Example Request:**
```
GET /tasks/user?status=IN_PROGRESS&priority=HIGH&page=0&limit=10&sortBy=dueDate&sortOrder=ASC
```

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Tasks retrieved successfully.",
    "data": [
        {
            "userTaskId": 1,
            "userId": 123,
            "taskTitle": "Implement User Authentication Module",
            "taskDescription": "Design and develop JWT-based authentication system...",
            "taskDate": "2025-10-12",
            "status": "IN_PROGRESS",
            "priority": "HIGH",
            "category": "PROJECT",
            "taskType": "FEATURE",
            "dueDate": "2025-10-20",
            "reminderDate": "2025-10-19T09:00:00",
            "tags": ["authentication", "security", "backend"],
            "parentTaskId": null,
            "createdBy": 123,
            "remarks": "Coordinate with security team for compliance review",
            "isRecurring": false,
            "recurringPattern": null,
            "createdAt": "2025-10-12T14:30:00",
            "updatedAt": "2025-10-15T10:15:00"
        }
    ],
    "pagination": {
        "page": 0,
        "limit": 10,
        "totalElements": 25,
        "totalPages": 3,
        "hasNext": true,
        "hasPrevious": false
    }
}
```

---

### 3. Get Task by ID

**Method:** `GET`  
**Endpoint:** `/tasks/{userTaskId}`  
**Authentication:** Required

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Task retrieved successfully.",
    "data": {
        "userTaskId": 1,
        "userId": 123,
        "taskTitle": "Implement User Authentication Module",
        "taskDescription": "Design and develop JWT-based authentication system with role-based access control...",
        "taskDate": "2025-10-12",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "category": "PROJECT",
        "taskType": "FEATURE",
        "dueDate": "2025-10-20",
        "reminderDate": "2025-10-19T09:00:00",
        "tags": ["authentication", "security", "backend"],
        "parentTaskId": null,
        "createdBy": 123,
        "remarks": "Coordinate with security team for compliance review",
        "isRecurring": false,
        "recurringPattern": null,
        "createdAt": "2025-10-12T14:30:00",
        "updatedAt": "2025-10-15T10:15:00"
    }
}
```

---

### 4. Update Task

**Method:** `PUT`  
**Endpoint:** `/tasks/{userTaskId}`  
**Authentication:** Required

**Request Body:**
```json
{
    "userTaskId": 1,
    "taskTitle": "Implement User Authentication Module - Updated",
    "taskDescription": "Updated description with new requirements...",
    "taskDate": "2025-10-12",
    "status": "IN_PROGRESS", 
    "priority": "URGENT",
    "category": "PROJECT",
    "taskType": "FEATURE",
    "dueDate": "2025-10-18",
    "reminderDate": "2025-10-17T09:00:00",
    "tags": ["authentication", "security", "backend", "urgent"],
    "remarks": "Updated timeline due to security requirements"
}
```

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Task updated successfully.",
    "data": {
        "userTaskId": 1,
        "userId": 123,
        "taskTitle": "Implement User Authentication Module - Updated",
        "taskDescription": "Updated description with new requirements...",
        "status": "IN_PROGRESS",
        "priority": "URGENT",
        "dueDate": "2025-10-18",
        "updatedAt": "2025-10-15T16:45:00"
    }
}
```

---

### 5. Delete Task

**Method:** `DELETE`  
**Endpoint:** `/tasks/{userTaskId}`  
**Authentication:** Required

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Task deleted successfully.",
    "data": null
}
```

---

### 6. Update Task Status

**Method:** `PATCH`  
**Endpoint:** `/tasks/status/{userTaskId}`  
**Authentication:** Required

**Request Body:**
```json
{
    "status": "COMPLETED"
}
```

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Task status updated successfully.",
    "data": {
        "userTaskId": 1,
        "status": "COMPLETED",
        "updatedAt": "2025-10-15T17:30:00"
    }
}
```

---

### 7. Update Task Priority

**Method:** `PATCH`  
**Endpoint:** `/tasks/priority/{userTaskId}`  
**Authentication:** Required

**Request Body:**
```json
{
    "priority": "URGENT"
}
```

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Task priority updated successfully.",
    "data": {
        "userTaskId": 1,
        "priority": "URGENT",
        "updatedAt": "2025-10-15T17:35:00"
    }
}
```

---

### 8. Get Task Statistics

**Method:** `GET`  
**Endpoint:** `/tasks/stats`  
**Authentication:** Required

**Query Parameters (Optional):**
```
Same filtering parameters as "Get Tasks by User" endpoint
```

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Task statistics retrieved successfully.",
    "data": {
        "totalTasks": 45,
        "completedTasks": 18,
        "inProgressTasks": 12,
        "notStartedTasks": 10,
        "onHoldTasks": 3,
        "cancelledTasks": 2,
        "overdueTasks": 5,
        "completionRate": 40.0,
        "averageCompletionTime": 5.2,
        "tasksByPriority": {
            "LOW": 8,
            "MEDIUM": 22,
            "HIGH": 12,
            "URGENT": 3
        },
        "tasksByCategory": {
            "WORK": 25,
            "PERSONAL": 8,
            "PROJECT": 10,
            "MEETING": 2
        },
        "tasksByStatus": {
            "NOT_STARTED": 10,
            "IN_PROGRESS": 12,
            "COMPLETED": 18,
            "ON_HOLD": 3,
            "CANCELLED": 2
        }
    }
}
```

---

### 9. Search Tasks

**Method:** `GET`  
**Endpoint:** `/tasks/search`  
**Authentication:** Required

**Query Parameters:**
```
searchTerm (required) - Search term to look for in title, description, and tags
All other filtering parameters from "Get Tasks by User" endpoint
```

**Example Request:**
```
GET /tasks/search?searchTerm=authentication&status=IN_PROGRESS&priority=HIGH
```

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Search completed successfully.",
    "data": [
        {
            "userTaskId": 1,
            "taskTitle": "Implement User Authentication Module",
            "taskDescription": "Design and develop JWT-based authentication system...",
            "status": "IN_PROGRESS",
            "priority": "HIGH",
            "matchedFields": ["title", "description", "tags"],
            "relevanceScore": 95.5,
            "highlightedText": "Implement User <mark>Authentication</mark> Module"
        }
    ],
    "searchMetadata": {
        "totalResults": 3,
        "searchTime": "45ms",
        "searchTerm": "authentication"
    }
}
```

---

### 10. Get Overdue Tasks

**Method:** `GET`  
**Endpoint:** `/tasks/overdue`  
**Authentication:** Required

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Overdue tasks retrieved successfully.", 
    "data": [
        {
            "userTaskId": 5,
            "taskTitle": "Update Documentation",
            "dueDate": "2025-10-10",
            "status": "IN_PROGRESS",
            "priority": "MEDIUM",
            "daysPastDue": 2
        }
    ]
}
```

---

### 11. Get Tasks by Status

**Method:** `GET`  
**Endpoint:** `/tasks/by-status/{status}`  
**Authentication:** Required

**Path Parameters:**
- `status` - TaskStatus enum value (NOT_STARTED, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED)

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Tasks retrieved by status successfully.",
    "data": [
        {
            "userTaskId": 1,
            "taskTitle": "Implement User Authentication Module",
            "status": "IN_PROGRESS",
            "priority": "HIGH",
            "dueDate": "2025-10-20"
        }
    ]
}
```

---

### 12. Get Tasks by Priority

**Method:** `GET`  
**Endpoint:** `/tasks/by-priority/{priority}`  
**Authentication:** Required

**Path Parameters:**
- `priority` - TaskPriority enum value (LOW, MEDIUM, HIGH, URGENT)

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Tasks retrieved by priority successfully.",
    "data": [
        {
            "userTaskId": 1,
            "taskTitle": "Implement User Authentication Module",
            "status": "IN_PROGRESS",
            "priority": "HIGH",
            "dueDate": "2025-10-20"
        }
    ]
}
```

---

### 13. Bulk Update Tasks

**Method:** `PUT`  
**Endpoint:** `/tasks/bulk-update`  
**Authentication:** Required

**Request Body:**
```json
{
    "userTaskIds": [1, 2, 3, 4],
    "updates": {
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "category": "PROJECT"
    }
}
```

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Bulk update completed.",
    "data": {
        "updated": 3,
        "failed": 1,
        "errors": [
            {
                "userTaskId": 4,
                "error": "Task not found or access denied"
            }
        ]
    }
}
```

---

### 14. Bulk Delete Tasks

**Method:** `DELETE`  
**Endpoint:** `/tasks/bulk-delete`  
**Authentication:** Required

**Request Body:**
```json
{
    "userTaskIds": [1, 2, 3]
}
```

**Response (200 OK):**
```json
{
    "status": "SUCCESS",
    "message": "Bulk deletion completed.",
    "data": {
        "deleted": 2,
        "failed": 1,
        "errors": [
            {
                "userTaskId": 3,
                "error": "Cannot delete task with subtasks"
            }
        ]
    }
}
```

---

### 15. Duplicate Task

**Method:** `POST`  
**Endpoint:** `/tasks/duplicate/{userTaskId}`  
**Authentication:** Required

**Response (201 Created):**
```json
{
    "status": "SUCCESS",
    "message": "Task duplicated successfully.",
    "data": {
        "userTaskId": 10,
        "originalUserTaskId": 1,
        "taskTitle": "[Copy] Implement User Authentication Module",
        "status": "NOT_STARTED",
        "createdAt": "2025-10-15T18:00:00"
    }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
    "status": "ERROR",
    "message": "Invalid request data",
    "errors": [
        {
            "field": "taskTitle",
            "message": "Task title is required and cannot be empty"
        },
        {
            "field": "dueDate",
            "message": "Due date must be in YYYY-MM-DD format"
        }
    ]
}
```

### 401 Unauthorized
```json
{
    "status": "ERROR", 
    "message": "Authentication required",
    "data": null
}
```

### 403 Forbidden
```json
{
    "status": "ERROR",
    "message": "Access denied. You don't have permission to access this task",
    "data": null
}
```

### 404 Not Found
```json
{
    "status": "ERROR",
    "message": "Task not found",
    "data": null
}
```

### 500 Internal Server Error
```json
{
    "status": "ERROR",
    "message": "Internal server error occurred",
    "data": null
}
```

---

## Implementation Notes

### Date Formats
- **taskDate, dueDate**: Use `YYYY-MM-DD` format (e.g., "2025-10-15")
- **reminderDate, createdAt, updatedAt**: Use ISO 8601 format with timezone (e.g., "2025-10-15T14:30:00")

### Validation Rules
- **taskTitle**: Required, 1-500 characters
- **taskDescription**: Optional, max 2000 characters  
- **tags**: Array of strings, max 10 tags, each tag max 50 characters
- **priority**: Must be valid TaskPriority enum value
- **status**: Must be valid TaskStatus enum value

### Business Logic
- Tasks cannot be deleted if they have active subtasks
- Only task owners or admins can view/edit tasks
- Overdue tasks are calculated based on due date and current date
- Completion rate is calculated as (completedTasks / totalTasks) * 100
- Average completion time is calculated in days from creation to completion

### Pagination
- Default page size: 50 items
- Maximum page size: 100 items
- Page numbers start from 0

### Security Considerations
- All endpoints require valid JWT authentication
- Users can only access their own tasks
- Sensitive data should be sanitized in logs

---

## Frontend Integration Examples

### TypeScript Interfaces
```typescript
interface Task {
  userTaskId: number;
  userId: number;
  taskTitle: string;
  taskDescription?: string;
  taskDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  taskType?: TaskType;
  dueDate?: string;
  reminderDate?: string;
  tags?: string[];
  parentTaskId?: number;
  createdBy?: number;
  remarks?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  createdAt: string;
  updatedAt?: string;
}
```

### Sample API Calls
```typescript
// Create new task
const newTask = await taskService.createTask(userId, {
  taskTitle: "Review Code Changes",
  taskDescription: "Review pull request #123 for security vulnerabilities",
  taskDate: "2025-10-15",
  status: TaskStatus.NOT_STARTED,
  priority: TaskPriority.HIGH,
  category: TaskCategory.WORK,
  dueDate: "2025-10-17"
});

// Get user tasks with filters
const tasks = await taskService.getTasksByUser(userId, {
  status: TaskStatus.IN_PROGRESS,
  priority: TaskPriority.HIGH,
  page: 0,
  limit: 20,
  sortBy: "dueDate",
  sortOrder: "ASC"
});

// Update task status
const updatedTask = await taskService.updateTaskStatus(userTaskId, TaskStatus.COMPLETED);

// Search tasks
const searchResults = await taskService.searchTasks(userId, "authentication", {
  category: TaskCategory.PROJECT
});
```

This comprehensive API documentation provides all the necessary information for backend developers to implement the User Tasks API functionality with proper validation, error handling, and security measures.