# Organizations API Documentation

## Table of Contents

### 📋 [Quick Reference](#quick-reference)
- [Complete Endpoint Summary](#complete-endpoint-summary)
- [Implementation Status](#current-implementation-status)

### 🏢 [Organization Management](#organization-management)
- [Create Organization](#create-organization) - `POST /organizations`
- [Get All Organizations (Paginated)](#get-all-organizations-paginated----advanced-filtering-pending) - `GET /organizations`
- [Get All Organizations (Simple)](#get-all-organizations-simple) - `GET /organizations/simple`
- [Get Single Organization](#get-single-organization) - `GET /organizations/{id}`
- [Update Organization](#update-organization) - `PUT /organizations/{id}`
- [Deactivate Organization](#deactivate-organization) - `PATCH /organizations/{id}/deactivate`
- [Reactivate Organization](#reactivate-organization) - `PATCH /organizations/{id}/activate`
- [Delete Organization (PERMANENT)](#️-delete-organization-permanent) - `DELETE /organizations/{id}`

### 👥 [User-Organization Management](#user-organization-management)
- [Add User to Organization](#add-user-to-organization) - `POST /organizations/{id}/users`
- [Get Organization Users (Simple)](#get-organization-users-simple--active) - `GET /organizations/{id}/users/simple`
- [Get Organization Users (Deprecated)](#️-get-organization-users-paginated---deprecated) - `GET /organizations/{id}/users`
- [Remove User from Organization](#️-remove-user-from-organization-permanent) - `DELETE /organizations/{id}/users/{userId}`
- [Deactivate User in Organization](#deactivate-user-in-organization) - `PATCH /organizations/{id}/users/{userId}/deactivate`
- [Reactivate User in Organization](#reactivate-user-in-organization) - `PATCH /organizations/{id}/users/{userId}/activate`

### 🔄 [Bulk User Operations](#bulk-user-operations)
- [Bulk Add Users](#bulk-add-users) - `POST /organizations/{id}/users/bulk-add`
- [Bulk Remove Users (PERMANENT)](#️-bulk-remove-users-permanent) - `DELETE /organizations/{id}/users/bulk-remove`
- [Bulk Deactivate Users](#bulk-deactivate-users) - `PATCH /organizations/{id}/users/bulk-deactivate`
- [Bulk Reactivate Users](#bulk-reactivate-users) - `PATCH /organizations/{id}/users/bulk-activate`

### 📚 [Reference Documentation](#reference-documentation)
- [Error Handling](#error-handling)
- [Status Management Strategy](#status-management-strategy)
- [Data Types Reference](#data-types-reference)
- [Security Notes](#security-notes)
- [Notes for Frontend Developers](#notes-for-frontend-developers)

---

## Overview
The Organizations API provides comprehensive management of organizations, including CRUD operations, user assignment management, and status management (activation/deactivation). This API supports both individual and bulk operations with proper authorization and audit capabilities.

## Base URL
All endpoints are prefixed with `/api/organizations`

## Authentication
All endpoints require authentication using Bearer tokens and appropriate role-based authorization.

## Authorization Roles
- **SUPER_ADMIN**: Full access to all operations including permanent deletions
- **ADMIN**: Access to most operations excluding permanent deletions

---

## Quick Reference

For quick navigation, use the [Complete Endpoint Summary](#complete-endpoint-summary) at the bottom of this document.

[🔝 Back to Top](#organizations-api-documentation)

---

## Organization Management

### Create Organization
**POST** `/api/organizations`

Creates a new organization with validation for organization type and required fields.

**Authorization:** SUPER_ADMIN, ADMIN

**Request Body:**
```json
{
  "org_name": "TechCorp Solutions",
  "code": "TECH001",
  "type": "hiring",
  "website": "https://techcorp.com",
  "industry": "Technology",
  "address_line1": "123 Main Street",
  "address_line2": "Suite 200",
  "city": "New York",
  "state_province": "NY",
  "postal_code": "10001",
  "country": "US",
  "logo_url": "https://techcorp.com/logo.png",
  "description": "Leading technology solutions provider",
  "is_currently_hiring": true
}
```

**Important Validation Rules:**
- **Organization Code**: Must be 1-10 characters, uppercase letters and numbers only (A-Z, 0-9)
- **Organization Name**: 1-120 characters
- **Country Code**: Must be exactly 2 uppercase letters (ISO 3166-1 alpha-2 format, e.g., US, CA)
- **Hiring Organizations**: Must include `is_currently_hiring` field
- **Training Organizations**: Cannot include `is_currently_hiring` field
- **URLs**: Website and logo URLs must be valid URLs (max 255 characters)

**Success Response (201):**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Organization created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "org_name": "TechCorp Solutions",
    "code": "TECH001",
    "type": "hiring",
    "website": "https://techcorp.com",
    "industry": "Technology",
    "address_line1": "123 Main Street",
    "address_line2": "Suite 200",
    "city": "New York",
    "state_province": "NY",
    "postal_code": "10001",
    "country": "US",
    "logo_url": "https://techcorp.com/logo.png",
    "description": "Leading technology solutions provider",
    "is_currently_hiring": true,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Validation failed or invalid organization type configuration
- **409 Conflict:** Organization code or name already exists
- **401 Unauthorized:** Authentication required
- **403 Forbidden:** Admin access required

---

### Get All Organizations (Paginated) - ⚠️ ADVANCED FILTERING PENDING
**GET** `/api/organizations`

Retrieves a paginated list of organizations with basic filtering and search capabilities. **NOTE: Advanced filtering implementation is still pending.**

**Authorization:** SUPER_ADMIN, ADMIN

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by organization name or code
- `type` (optional): Filter by organization type (`hiring`, `training`)
- `industry` (optional): Filter by industry sector *(basic implementation)*
- `country` (optional): Filter by country code *(basic implementation)*
- `is_currently_hiring` (optional): Filter by hiring status *(basic implementation)*
- `status` (optional): Filter by organization status (`active`, `inactive`, `all`, default: `active`)
- `sort_by` (optional): Sort field (`org_name`, `code`, `type`, `created_at`, `updated_at`, default: `created_at`)
- `sort_order` (optional): Sort order (`asc`, `desc`, default: `desc`)

**Example Request:**
```
GET /api/organizations?page=1&limit=10&status=active&type=hiring&search=tech
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Organizations retrieved successfully",
  "data": {
    "organizations": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "org_name": "TechCorp Solutions",
        "code": "TECH001",
        "type": "hiring",
        "website": "https://techcorp.com",
        "industry": "Technology",
        "is_active": true,
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

### Get All Organizations (Simple)
**GET** `/api/organizations/simple`

Retrieves a simple list of all active organizations without pagination or filtering.

**Authorization:** SUPER_ADMIN, ADMIN

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Organizations retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "org_name": "TechCorp Solutions",
      "code": "TECH001",
      "type": "hiring",
      "website": "https://techcorp.com",
      "industry": "Technology",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### Get Single Organization
**GET** `/api/organizations/{id}`

Retrieves a single organization by ID.

**Authorization:** SUPER_ADMIN, ADMIN

**Path Parameters:**
- `id` (required): Organization UUID

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Organization retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "org_name": "TechCorp Solutions",
    "code": "TECH001",
    "type": "hiring",
    "website": "https://techcorp.com",
    "industry": "Technology",
    "address_line1": "123 Main Street",
    "address_line2": "Suite 200",
    "city": "New York",
    "state_province": "NY",
    "postal_code": "10001",
    "country": "US",
    "logo_url": "https://techcorp.com/logo.png",
    "description": "Leading technology solutions provider",
    "is_currently_hiring": true,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- **404 Not Found:** Organization not found
- **401 Unauthorized:** Authentication required
- **403 Forbidden:** Admin access required

---

### Update Organization
**PUT** `/api/organizations/{id}`

Updates an existing organization. Cannot update `code`, `type`, or `is_active` fields.

**Authorization:** SUPER_ADMIN, ADMIN

**Path Parameters:**
- `id` (required): Organization UUID

**Request Body:** (All fields optional)
```json
{
  "org_name": "Updated TechCorp Solutions",
  "website": "https://updated-techcorp.com",
  "description": "Updated description",
  "is_currently_hiring": false
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Organization updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "org_name": "Updated TechCorp Solutions",
    "code": "TECH001",
    "type": "hiring",
    "website": "https://updated-techcorp.com",
    "description": "Updated description",
    "is_currently_hiring": false,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:45:00.000Z"
  }
}
```

---

### Deactivate Organization
**PATCH** `/api/organizations/{id}/deactivate`

Deactivates an organization (sets is_active to false).

**Authorization:** SUPER_ADMIN, ADMIN

**Path Parameters:**
- `id` (required): Organization UUID

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Organization deactivated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "org_name": "TechCorp Solutions",
    "is_active": false,
    "updated_at": "2024-01-15T12:00:00.000Z"
  }
}
```

---

### Reactivate Organization
**PATCH** `/api/organizations/{id}/activate`

Reactivates an organization (sets is_active to true).

**Authorization:** SUPER_ADMIN, ADMIN

**Path Parameters:**
- `id` (required): Organization UUID

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Organization activated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "org_name": "TechCorp Solutions",
    "is_active": true,
    "updated_at": "2024-01-15T12:15:00.000Z"
  }
}
```

---

### ⚠️ Delete Organization (PERMANENT)
**DELETE** `/api/organizations/{id}`

**WARNING:** Permanently deletes an organization. This action cannot be undone.

**Authorization:** SUPER_ADMIN only

**Path Parameters:**
- `id` (required): Organization UUID

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "⚠️ Organization permanently deleted - THIS ACTION CANNOT BE UNDONE"
}
```

**Error Responses:**
- **400 Bad Request:** Organization has active users or associated data
- **404 Not Found:** Organization not found
- **403 Forbidden:** Super admin access required

[🔝 Back to Top](#organizations-api-documentation) | [🏢 Organization Management](#organization-management) | [👥 User Management](#user-organization-management) | [🔄 Bulk Operations](#bulk-user-operations)

---

## User-Organization Management

### Add User to Organization
**POST** `/api/organizations/{id}/users`

Adds a user to an organization using their email address.

**Authorization:** SUPER_ADMIN, ADMIN

**Path Parameters:**
- `id` (required): Organization UUID

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Success Response (201):**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "User added to organization successfully",
  "data": {
    "user_id": "456e7890-e12f-34g5-b678-901234567890",
    "organization_id": "123e4567-e89b-12d3-a456-426614174000",
    "is_active": true,
    "created_at": "2024-01-15T14:30:00.000Z"
  }
}
```

**Error Responses:**
- **400 Bad Request:** User not found or already in an organization
- **404 Not Found:** Organization not found
- **409 Conflict:** User already assigned to this organization

---

### Get Organization Users (Simple) ✅ ACTIVE
**GET** `/api/organizations/{id}/users/simple`

Retrieves a simple list of all users in an organization without pagination or filtering. Returns all users with their organization membership status in the is_active field.

**Authorization:** SUPER_ADMIN, ADMIN

**Path Parameters:**
- `id` (required): Organization UUID

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Organization users retrieved successfully",
  "data": [
    {
      "id": "456e7890-e12f-34g5-b678-901234567890",
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "preferred_name": null,
      "phone": "+1234567890",
      "is_active": true,
      "created_at": "2024-01-10T09:15:00.000Z"
    },
    {
      "id": "789f0123-e45a-67b8-c901-234567890def",
      "email": "jane.smith@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "preferred_name": "Janie",
      "phone": null,
      "is_active": false,
      "created_at": "2024-01-12T14:20:00.000Z"
    }
  ]
}
```

---

### ⚠️ Get Organization Users (Paginated) - DEPRECATED
**GET** `/api/organizations/{id}/users`

**⚠️ DEPRECATED ENDPOINT** - This endpoint is currently deprecated and not for use. Please use the simple endpoint `/api/organizations/{id}/users/simple` instead. This pagination-based endpoint will be enabled in a future release.

**Current Response:**
```json
{
  "statusCode": 501,
  "success": false,
  "message": "This endpoint is deprecated and not for use. Please use /organizations/:id/users/simple instead.",
  "error": "Not Implemented"
}
```

---

### ⚠️ Remove User from Organization (PERMANENT)
**DELETE** `/api/organizations/{id}/users/{userId}`

**WARNING:** Permanently removes a user from an organization. This action cannot be undone.

**Authorization:** SUPER_ADMIN, ADMIN

**Path Parameters:**
- `id` (required): Organization UUID
- `userId` (required): User UUID

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "⚠️ User permanently removed from organization. This action cannot be undone."
}
```

**Error Responses:**
- **404 Not Found:** Organization or user not found, or user not in organization
- **403 Forbidden:** Admin access required

---

### Deactivate User in Organization
**PATCH** `/api/organizations/{id}/users/{userId}/deactivate`

Deactivates a user's membership in an organization.

**Authorization:** SUPER_ADMIN, ADMIN

**Path Parameters:**
- `id` (required): Organization UUID
- `userId` (required): User UUID

**Request Body:**
```json
{
  "reason": "Performance issues"
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User deactivated in organization successfully"
}
```

**Error Responses:**
- **400 Bad Request:** User is already inactive in this organization
- **404 Not Found:** Organization or user not found, or user not in organization

---

### Reactivate User in Organization
**PATCH** `/api/organizations/{id}/users/{userId}/activate`

Reactivates a user's membership in an organization.

**Authorization:** SUPER_ADMIN, ADMIN

**Path Parameters:**
- `id` (required): Organization UUID
- `userId` (required): User UUID

**Request Body:**
```json
{
  "reason": "Issue resolved"
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User activated in organization successfully"
}
```

**Error Responses:**
- **400 Bad Request:** User is already active in this organization
- **404 Not Found:** Organization or user not found, or user not in organization

[🔝 Back to Top](#organizations-api-documentation) | [🏢 Organization Management](#organization-management) | [👥 User Management](#user-organization-management) | [🔄 Bulk Operations](#bulk-user-operations)

---

## Bulk User Operations

### Bulk Add Users
**POST** `/api/organizations/{id}/users/bulk-add`

Adds multiple users to an organization using their email addresses.

**Authorization:** SUPER_ADMIN, ADMIN

**Path Parameters:**
- `id` (required): Organization UUID

**Request Body:**
```json
{
  "emails": [
    "john.doe@example.com",
    "jane.smith@example.com",
    "bob.wilson@example.com"
  ]
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Bulk add users operation completed",
  "data": {
    "total_attempted": 3,
    "successful": 2,
    "failed": 1,
    "failed_users": [
      {
        "email": "bob.wilson@example.com",
        "reason": "User is already in an organization"
      }
    ]
  }
}
```

**Error Responses:**
- **400 Bad Request:** Invalid email format or empty email list
- **404 Not Found:** Organization not found

---

### ⚠️ Bulk Remove Users (PERMANENT)
**DELETE** `/api/organizations/{id}/users/bulk-remove`

**WARNING:** Permanently removes multiple users from an organization. This action cannot be undone.

**Authorization:** SUPER_ADMIN, ADMIN

**Path Parameters:**
- `id` (required): Organization UUID

**Request Body:**
```json
{
  "emails": [
    "john.doe@example.com",
    "jane.smith@example.com"
  ]
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "⚠️ Bulk remove users operation completed - PERMANENT ACTION",
  "data": {
    "total_attempted": 2,
    "successful": 2,
    "failed": 0,
    "failed_users": []
  }
}
```

**Error Responses:**
- **400 Bad Request:** Invalid email format or empty email list
- **404 Not Found:** Organization not found

---

### Bulk Deactivate Users
**PATCH** `/api/organizations/{id}/users/bulk-deactivate`

Deactivates multiple users in an organization.

**Authorization:** SUPER_ADMIN, ADMIN

**Path Parameters:**
- `id` (required): Organization UUID

**Request Body:**
```json
{
  "emails": [
    "john.doe@example.com",
    "jane.smith@example.com"
  ]
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Bulk operation completed successfully",
  "data": {
    "total_attempted": 2,
    "successful": 2,
    "failed": 0,
    "failed_users": []
  }
}
```

**Error Responses:**
- **400 Bad Request:** Invalid email format or empty email list
- **404 Not Found:** Organization not found

---

### Bulk Reactivate Users
**PATCH** `/api/organizations/{id}/users/bulk-activate`

Reactivates multiple inactive users in an organization.

**Authorization:** SUPER_ADMIN, ADMIN

**Path Parameters:**
- `id` (required): Organization UUID

**Request Body:**
```json
{
  "emails": [
    "john.doe@example.com",
    "jane.smith@example.com"
  ]
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Bulk operation completed successfully",
  "data": {
    "total_attempted": 2,
    "successful": 1,
    "failed": 1,
    "failed_users": [
      {
        "email": "jane.smith@example.com",
        "reason": "User is already active in this organization"
      }
    ]
  }
}
```

**Error Responses:**
- **400 Bad Request:** Invalid email format or empty email list
- **404 Not Found:** Organization not found

[🔝 Back to Top](#organizations-api-documentation) | [🏢 Organization Management](#organization-management) | [👥 User Management](#user-organization-management) | [🔄 Bulk Operations](#bulk-user-operations)

---

## Reference Documentation

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "success": false,
  "message": "Unauthorized access",
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "success": false,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Organization not found",
  "error": "Not Found"
}
```

**409 Conflict:**
```json
{
  "statusCode": 409,
  "success": false,
  "message": "Organization code already exists",
  "error": "Conflict"
}
```

**501 Not Implemented:**
```json
{
  "statusCode": 501,
  "success": false,
  "message": "This endpoint is deprecated and not for use. Please use /organizations/:id/users/simple instead.",
  "error": "Not Implemented"
}
```

---

## Status Management Strategy

### Organization Status
- **Active (is_active: true)**: Organization is operational and visible in listings
- **Inactive (is_active: false)**: Organization is deactivated but data is preserved
- **Deleted**: Organization is permanently removed from the database (SUPER_ADMIN only)

### User Organization Membership Status
- **Active**: User is active in the organization
- **Inactive**: User membership is deactivated but preserved
- **Removed**: User is permanently removed from the organization

### Default Behavior
- List endpoints show only active records unless specified otherwise
- Use `status=all` parameter to see both active and inactive records
- Use `status=inactive` parameter to see only inactive records

---

## Data Types Reference

### Organization Entity
```typescript
interface OrganizationEntity {
  id: string;                    // UUID
  org_name: string;              // 1-120 characters
  code: string;                  // 1-10 characters, uppercase
  type: "hiring" | "training";   // Organization type
  website?: string;              // URL, max 255 chars
  industry?: string;             // Max 100 chars
  address_line1?: string;        // Max 100 chars
  address_line2?: string;        // Max 100 chars
  city?: string;                 // Max 80 chars
  state_province?: string;       // Max 80 chars
  postal_code?: string;          // Max 20 chars
  country?: string;              // ISO 3166-1 alpha-2
  logo_url?: string;             // URL, max 255 chars
  description?: string;          // Text
  is_currently_hiring?: boolean; // Only for hiring orgs
  is_active: boolean;            // Default: true
  created_at: string;            // ISO 8601 datetime
  updated_at: string;            // ISO 8601 datetime
}
```

### Organization User (Simple Response)
```typescript
interface OrganizationUser {
  id: string;                    // User UUID
  email: string;                 // User email
  first_name: string;            // User first name
  last_name: string;             // User last name
  preferred_name?: string;       // User preferred name
  phone?: string;                // User phone number
  is_active: boolean;            // User account status
  created_at: string;            // User account creation date
}
```

### Bulk Operation Response
```typescript
interface BulkOperationResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    total_attempted: number;
    successful: number;
    failed: number;
    failed_users: Array<{
      email: string;
      reason: string;
    }>;
  };
}
```

### Organization Types
- `"hiring"`: Organizations that hire talent (requires `is_currently_hiring` field)
- `"training"`: Organizations that provide training (cannot have `is_currently_hiring` field)

### Status Values
- `"active"`: Organization/User is active (default filter)
- `"inactive"`: Organization/User is deactivated
- `"all"`: Show both active and inactive

---

## Security Notes

1. **Authentication**: All endpoints require valid Bearer token
2. **Authorization**: Role-based access control enforced on all endpoints
3. **Input Validation**: All inputs are validated and sanitized
4. **Audit Trail**: All operations are logged for audit purposes
5. **Rate Limiting**: Standard rate limiting applies to all endpoints
6. **HTTPS Only**: All API calls must use HTTPS in production

---

## Permanent Operations Warning

**⚠️ CRITICAL WARNING ⚠️**

The following operations permanently delete data and **CANNOT BE UNDONE**:
- DELETE `/api/organizations/{id}` - Permanent organization deletion
- DELETE `/api/organizations/{id}/users/{userId}` - Permanent user removal
- PATCH `/api/organizations/{id}/users/bulk-remove` - Permanent bulk user removal

These operations require SUPER_ADMIN privileges and should be used with extreme caution. Consider using deactivation instead of deletion for most use cases.

[🔝 Back to Top](#organizations-api-documentation) | [📚 Reference Documentation](#reference-documentation)

---

## Current Implementation Status

### ✅ Fully Implemented
- Organization CRUD operations
- User-organization basic management
- Bulk user operations
- Simple endpoints (non-paginated)
- Status management (activation/deactivation)
- Proper validation and error handling

### ⚠️ Partially Implemented / Pending
- **Advanced filtering** for organizations list endpoint (basic filtering available)
- **Paginated user listing** - currently deprecated, use simple endpoint instead

### 📋 Endpoint Implementation Status
| Endpoint | Status | Notes |
|----------|--------|-------|
| POST `/organizations` | ✅ Implemented | Full validation |
| GET `/organizations` | ⚠️ Basic filtering | Advanced filtering pending |
| GET `/organizations/simple` | ✅ Implemented | |
| GET `/organizations/{id}` | ✅ Implemented | |
| PUT `/organizations/{id}` | ✅ Implemented | |
| PATCH `/organizations/{id}/activate` | ✅ Implemented | |
| PATCH `/organizations/{id}/deactivate` | ✅ Implemented | |
| DELETE `/organizations/{id}` | ✅ Implemented | SUPER_ADMIN only |
| POST `/organizations/{id}/users` | ✅ Implemented | |
| GET `/organizations/{id}/users/simple` | ✅ Implemented | **Use this** |
| GET `/organizations/{id}/users` | ❌ Deprecated | Use simple endpoint |
| DELETE `/organizations/{id}/users/{userId}` | ✅ Implemented | Permanent |
| PATCH `/organizations/{id}/users/{userId}/activate` | ✅ Implemented | |
| PATCH `/organizations/{id}/users/{userId}/deactivate` | ✅ Implemented | |
| POST `/organizations/{id}/users/bulk-add` | ✅ Implemented | |
| DELETE `/organizations/{id}/users/bulk-remove` | ✅ Implemented | Permanent |
| PATCH `/organizations/{id}/users/bulk-activate` | ✅ Implemented | |
| PATCH `/organizations/{id}/users/bulk-deactivate` | ✅ Implemented | |

[🔝 Back to Top](#organizations-api-documentation) | [📚 Reference Documentation](#reference-documentation)

---

## Notes for Frontend Developers

1. **Default Behavior**: All GET endpoints show only active records by default
2. **Email-Based Operations**: All user operations use email addresses for identification
3. **Bulk Operations**: Include comprehensive error reporting for failed operations
4. **Conditional Validation**: Pay attention to the `is_currently_hiring` field requirements based on organization type
5. **Pagination**: Maximum limit of 100 items per page for paginated endpoints
6. **Search**: Search functionality works on organization names and codes
7. **Sorting**: Default sorting varies by endpoint - check individual endpoint documentation
8. **Role Requirements**: Most endpoints require Admin or Super Admin, permanent deletions require Super Admin only
9. **UUID Validation**: All ID parameters must be valid UUIDs
10. **Status Management**: Use activate/deactivate for safe status changes, avoid permanent deletion unless absolutely necessary
11. **Bulk Results**: Always check the `failed_users` array in bulk operation responses to handle partial failures
12. **Organization Code**: Must be uppercase letters and numbers only (A-Z, 0-9)
13. **Country Codes**: Must be exactly 2 uppercase letters (ISO 3166-1 alpha-2 format)
14. **Deprecated Endpoints**: Use `/organizations/{id}/users/simple` instead of the paginated version
15. **Advanced Filtering**: Basic filtering is available, advanced filtering implementation is pending

[🔝 Back to Top](#organizations-api-documentation) | [📚 Reference Documentation](#reference-documentation)

---

## Complete Endpoint Summary

### Organization CRUD
- `POST /api/organizations` - Create organization ✅
- `GET /api/organizations` - Get organizations (paginated, basic filtering) ⚠️
- `GET /api/organizations/simple` - Get organizations (simple list) ✅
- `GET /api/organizations/{id}` - Get single organization ✅
- `PUT /api/organizations/{id}` - Update organization ✅
- `PATCH /api/organizations/{id}/deactivate` - Deactivate organization ✅
- `PATCH /api/organizations/{id}/activate` - Reactivate organization ✅
- `DELETE /api/organizations/{id}` - ⚠️ Delete organization (PERMANENT) ✅

### Individual User Management
- `POST /api/organizations/{id}/users` - Add user to organization ✅
- `GET /api/organizations/{id}/users/simple` - Get organization users (simple) ✅
- `GET /api/organizations/{id}/users` - ❌ Get organization users (paginated, DEPRECATED)
- `DELETE /api/organizations/{id}/users/{userId}` - ⚠️ Remove user (PERMANENT) ✅
- `PATCH /api/organizations/{id}/users/{userId}/deactivate` - Deactivate user ✅
- `PATCH /api/organizations/{id}/users/{userId}/activate` - Reactivate user ✅

### Bulk User Management
- `POST /api/organizations/{id}/users/bulk-add` - Bulk add users ✅
- `DELETE /api/organizations/{id}/users/bulk-remove` - ⚠️ Bulk remove users (PERMANENT) ✅
- `PATCH /api/organizations/{id}/users/bulk-deactivate` - Bulk deactivate users ✅
- `PATCH /api/organizations/{id}/users/bulk-activate` - Bulk reactivate users ✅

**Legend:**
- ✅ Fully implemented and working
- ⚠️ Partially implemented or has limitations
- ❌ Deprecated or not recommended for use

---

## Quick Navigation

### 🚀 **Most Used Endpoints**
- [Create Organization](#create-organization) - `POST /organizations`
- [Get Organizations (Simple)](#get-all-organizations-simple) - `GET /organizations/simple`
- [Add User to Organization](#add-user-to-organization) - `POST /organizations/{id}/users`
- [Get Organization Users](#get-organization-users-simple--active) - `GET /organizations/{id}/users/simple`
- [Bulk Add Users](#bulk-add-users) - `POST /organizations/{id}/users/bulk-add`

### 📋 **Documentation Sections**
- [🔝 Back to Top](#organizations-api-documentation)
- [📋 Table of Contents](#table-of-contents)
- [🏢 Organization Management](#organization-management)
- [👥 User-Organization Management](#user-organization-management)
- [🔄 Bulk User Operations](#bulk-user-operations)
- [📚 Reference Documentation](#reference-documentation)
- [✅ Implementation Status](#current-implementation-status)
- [📖 Complete Endpoint Summary](#complete-endpoint-summary)
