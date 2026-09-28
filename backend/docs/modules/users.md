# Users Module Documentation

## Overview
The Users module handles user management and role assignment operations. All endpoints require admin or super admin privileges and use role-based access control.

## Base URL
```
/api/users
```

## Authentication & Authorization
- **Authentication:** All endpoints require valid authentication cookies
- **Authorization:** Requires Admin or Super Admin roles
- **Special Requirements:** 
  - User deletion requires Super Admin role
  - Super Admins cannot delete themselves

---

## Endpoints

### 1. Get All Users
**Endpoint:** `GET /api/users`  
**Roles Required:** Admin, Super Admin  
**Description:** Retrieve all users with pagination and filtering

#### Query Parameters
```typescript
{
  page?: number;              // Page number (default: 1, min: 1)
  limit?: number;             // Items per page (default: 10, min: 1, max: 100)
  search?: string;            // Search in name or email
  email_verified?: boolean;   // Filter by email verification status
  is_active?: boolean;        // Filter by account active status
  role?: string;              // Filter by role name
  organization_id?: string;   // Filter by organization ID
  sort_by?: string;           // Sort field (default: 'created_at')
  sort_order?: 'asc' | 'desc'; // Sort order (default: 'desc')
}
```

#### Example Request
```
GET /api/users?page=1&limit=10&search=john&email_verified=true&sort_by=created_at&sort_order=desc
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "uuid-string",
        "email": "john.doe@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "preferred_name": "Johnny",
        "phone": "+1234567890",
        "date_of_birth": "1990-05-15",
        "timezone": "America/New_York",
        "email_verified": true,
        "is_active": true,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
        "last_sign_in_at": "2024-01-15T10:30:00Z",
        "roles": [
          {
            "id": 2,
            "role_name": "learner",
            "description": "Regular learner"
          }
        ]
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

#### Error Responses
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges

---

### 2. Get User by ID
**Endpoint:** `GET /api/users/:id`  
**Roles Required:** Admin, Super Admin  
**Description:** Retrieve a specific user by ID

#### Path Parameters
- `id` (string, UUID): User ID

#### Example Request
```
GET /api/users/uuid-string-here
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid-string",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "preferred_name": "Johnny",
    "phone": "+1234567890",
    "date_of_birth": "1990-05-15",
    "timezone": "America/New_York",
    "email_verified": true,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "last_sign_in_at": "2024-01-15T10:30:00Z",
    "roles": []
  }
}
```

#### Error Responses
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges
- **404 Not Found:** User not found

---

### 3. Update User
**Endpoint:** `PUT /api/users/:id`  
**Roles Required:** Admin, Super Admin  
**Description:** Update user information

#### Path Parameters
- `id` (string, UUID): User ID

#### Request Body
```typescript
{
  first_name?: string;        // User first name
  last_name?: string;         // User last name
  preferred_name?: string;    // User preferred name or nickname
  phone?: string;             // Phone number (format: +1234567890)
  date_of_birth?: string;     // Date of birth (format: YYYY-MM-DD)
  timezone?: string;          // User timezone
}
```

#### Example Request
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "preferred_name": "Johnny",
  "phone": "+1234567890",
  "date_of_birth": "1990-05-15",
  "timezone": "America/New_York"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Updated",
  "data": {
    "id": "uuid-string",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Smith",
    "preferred_name": "Johnny",
    "phone": "+1234567890",
    "date_of_birth": "1990-05-15",
    "timezone": "America/New_York",
    "email_verified": true,
    "is_active": true,
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Error Responses
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges
- **404 Not Found:** User not found

---

### 4. Delete User
**Endpoint:** `DELETE /api/users/:id`  
**Roles Required:** Super Admin only  
**Description:** Soft delete a user account

#### Path Parameters
- `id` (string, UUID): User ID

#### Example Request
```
DELETE /api/users/uuid-string-here
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Deleted"
}
```

#### Error Responses
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges or trying to delete own account
- **404 Not Found:** User not found

---

## Role Management Endpoints

### 5. Assign Role to User
**Endpoint:** `POST /api/users/roles`  
**Roles Required:** Admin, Super Admin  
**Description:** Assign a new role to a user by email

#### Request Body
```typescript
{
  email: string;              // Email of the user to assign role to
  role_id: number;            // Role ID to assign (1=super_admin, 2=admin, 3=trainer, 4=learner)
  is_active?: boolean;        // Whether the role should be active (default: true)
  assigned_by?: string;       // ID of user assigning this role (optional)
}
```

#### Example Request
```json
{
  "email": "john.doe@example.com",
  "role_id": 3,
  "is_active": true
}
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Role assigned successfully",
  "data": {
    "id": "role-assignment-uuid",
    "user_id": "user-uuid",
    "role_id": 3,
    "is_active": true,
    "assigned_by": "admin-uuid",
    "assigned_at": "2024-01-15T10:30:00Z",
    "roles": {
      "id": 3,
      "role_name": "trainer",
      "description": "Course trainer"
    }
  }
}
```

#### Error Responses
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges
- **404 Not Found:** User not found
- **409 Conflict:** User already has this active role

---

### 6. Update Role Assignment
**Endpoint:** `PUT /api/users/roles/:roleAssignmentId`  
**Roles Required:** Admin, Super Admin  
**Description:** Update an existing role assignment

#### Path Parameters
- `roleAssignmentId` (string, UUID): Role assignment ID

#### Request Body
```typescript
{
  role_id?: number;           // New role ID to assign
  is_active?: boolean;        // Whether the role should be active
}
```

#### Example Request
```json
{
  "role_id": 3,
  "is_active": true
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Role assignment updated successfully",
  "data": {
    "id": "role-assignment-uuid",
    "user_id": "user-uuid",
    "role_id": 3,
    "is_active": true,
    "updated_at": "2024-01-15T10:30:00Z",
    "roles": {
      "id": 3,
      "role_name": "trainer",
      "description": "Course trainer"
    }
  }
}
```

#### Error Responses
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges
- **404 Not Found:** Role assignment not found

---

### 7. Get User Role Assignments
**Endpoint:** `GET /api/users/:userId/roles`  
**Roles Required:** Admin, Super Admin  
**Description:** Get all role assignments for a specific user

#### Path Parameters
- `userId` (string, UUID): User ID

#### Example Request
```
GET /api/users/uuid-string-here/roles
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "User role assignments retrieved successfully",
  "data": [
    {
      "id": "role-assignment-uuid",
      "user_id": "user-uuid",
      "role_id": 3,
      "is_active": true,
      "assigned_at": "2024-01-15T10:30:00Z",
      "roles": {
        "id": 3,
        "role_name": "trainer",
        "description": "Course trainer"
      },
      "assigned_by_user": {
        "id": "admin-uuid",
        "email": "admin@example.com",
        "first_name": "Admin",
        "last_name": "User"
      }
    }
  ]
}
```

#### Error Responses
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges

---

### 8. Get All Role Assignments
**Endpoint:** `GET /api/users/roles/all`  
**Roles Required:** Admin, Super Admin  
**Description:** Get all role assignments in the system

#### Example Request
```
GET /api/users/roles/all
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "All role assignments retrieved successfully",
  "data": [
    {
      "id": "role-assignment-uuid",
      "user_id": "user-uuid",
      "role_id": 3,
      "is_active": true,
      "assigned_at": "2024-01-15T10:30:00Z",
      "user": {
        "id": "user-uuid",
        "email": "john.doe@example.com",
        "first_name": "John",
        "last_name": "Doe"
      },
      "roles": {
        "id": 3,
        "role_name": "trainer",
        "description": "Course trainer"
      },
      "assigned_by_user": {
        "id": "admin-uuid",
        "email": "admin@example.com",
        "first_name": "Admin",
        "last_name": "User"
      }
    }
  ]
}
```

#### Error Responses
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges

---

## Frontend Integration Notes

### Role IDs Reference
```typescript
const ROLE_IDS = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  TRAINER: 3,
  LEARNER: 4
};
```

### Example Frontend Usage
```javascript
// Get all users with pagination
const getUsers = async (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters
  });
  
  const response = await fetch(`/api/users?${params}`, {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
};

// Update user
const updateUser = async (userId, userData) => {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Assign role
const assignRole = async (email, roleId) => {
  const response = await fetch('/api/users/roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, role_id: roleId })
  });
  return response.json();
};
```

### Error Handling
```javascript
const handleUserRequest = async (requestFn) => {
  try {
    const result = await requestFn();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'User operation failed');
    }
  } catch (error) {
    console.error('User management error:', error);
    throw error;
  }
};
```

### Pagination Helper
```javascript
const calculatePagination = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    totalPages,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null
  };
};
```

---

## 🎓 Learner Management Service Methods

*Note: These service methods are used by the Profiles module endpoints. See [Learner Management API Documentation](./profiles/learners.md) for the complete API reference.*

### Assign Learner Role
**Service Method:** `assignLearnerRole(email: string, assignedBy: string): Promise<UserRole>`  
**Description:** Assigns learner role (role_id: 4) to a user by email. Used by `POST /api/profiles/learners` endpoint.

#### Parameters
- `email` (string): Email of the user to assign learner role
- `assignedBy` (string): UUID of the admin assigning the role

#### Returns
- User role assignment object with role details

#### Error Conditions
- User not found with provided email
- User already has active learner role
- Database transaction failures

#### Implementation Notes
- Automatically creates learner_profiles record via database trigger
- Includes audit logging for compliance
- Validates user account status before assignment

---

### Deactivate Learner Role
**Service Method:** `deactivateLearnerRole(userId: string): Promise<void>`  
**Description:** Soft-deletes learner role by setting is_active=false. Used by `PUT /api/profiles/learners/:userId/deactivate` endpoint.

#### Parameters
- `userId` (string): UUID of the user to deactivate

#### Returns
- Void (operation success indicated by no exception)

#### Error Conditions
- User not found
- User does not have active learner role
- Database update failures

#### Implementation Notes
- Preserves data for potential reactivation
- Updates both user_roles and learner_profiles tables
- Maintains referential integrity

---

### Reactivate Learner Role
**Service Method:** `reactivateLearnerRole(userId: string): Promise<void>`  
**Description:** Reactivates previously deactivated learner role. Used by `PUT /api/profiles/learners/:userId/activate` endpoint.

#### Parameters
- `userId` (string): UUID of the user to reactivate

#### Returns
- Void (operation success indicated by no exception)

#### Error Conditions
- User not found
- No deactivated learner role found
- Database update failures

#### Implementation Notes
- Restores full learner access and profile visibility
- Updates timestamps for tracking
- Validates profile data integrity on reactivation

---

### Permanently Remove Learner Role
**Service Method:** `permanentlyRemoveLearnerRole(userId: string): Promise<void>`  
**Description:** Permanently deletes learner role from database. **Super Admin only operation.** Used by `DELETE /api/profiles/learners/:userId` endpoint.

#### Parameters
- `userId` (string): UUID of the user to permanently remove

#### Returns
- Void (operation success indicated by no exception)

#### Security Features
- Extensive audit logging for compliance
- Irreversible operation with multiple confirmations
- Super Admin authorization required
- CASCADE delete for related profile data

#### Error Conditions
- User not found
- No learner role found to delete
- Database deletion failures
- Audit logging failures

#### Implementation Notes
- Permanently removes all learner-related data
- Cannot be undone - use with extreme caution
- Maintains audit trail for compliance requirements

---

### Get Learner Users
**Service Method:** `getLearnerUsers(queryDto: GetUsersQueryDto): Promise<PaginatedUsers>`  
**Description:** Retrieves paginated list of users with learner roles. Used by `GET /api/profiles/learners/users` endpoint.

#### Parameters
- `queryDto` (GetUsersQueryDto): Query parameters for pagination and filtering

#### Returns
- Paginated response with user data and role information

#### Features
- Full pagination support
- Search by name or email
- Active status filtering
- Role-based filtering (learner role_id: 4)
- Sorting capabilities (name, email, created_at)

#### Implementation Notes
- Optimized queries with proper indexing
- Includes role assignment metadata
- Supports complex filtering combinations
- Returns user count for pagination

---

## 🔄 Service Integration

### Profiles Module Integration
The Users service is injected into the Profiles controller to provide learner management functionality:

```typescript
// In ProfilesController
constructor(
  private readonly profilesService: ProfilesService,
  private readonly usersService: UsersService, // Injected for learner role management
) {}
```

### Cross-Module Dependencies
- **Profiles Service**: Handles learner profile data and validation
- **Users Service**: Manages learner role assignments and user data
- **Auth Service**: Provides authentication and authorization context
- **Database Service**: Ensures transactional integrity across operations

### Audit Trail Integration
All learner management operations include comprehensive audit logging:
- Operation timestamp and user context
- Before/after state for data changes
- IP address and session information
- Compliance-ready audit format

---

*For complete API endpoint documentation and usage examples, see [Learner Management API Documentation](./profiles/learners.md).*
