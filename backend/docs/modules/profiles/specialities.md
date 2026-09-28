# Specialities API Documentation

This document describes the API endpoints for managing specialities in the GamutX LMS backend. All endpoints require authentication and are under the `/api/trainers/specialities` route. Some endpoints require admin or super admin privileges.

---

## 1. Get All Specialities

**Endpoint:** `GET /api/trainers/specialities`

**Description:**
Retrieves all available specialities for trainer profile creation and management.

**Authentication:** Required (any authenticated user)

**Request:**
- No request body or parameters.

**Response:**
- **Status 200 OK**
- Returns an array of speciality objects.

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Specialities retrieved successfully",
  "data": [
    { "id": 1, "name": "Full Stack Web Development", "created_at": "2024-01-01T00:00:00Z", "updated_at": "2024-01-01T00:00:00Z" },
    { "id": 2, "name": "Frontend Development", "created_at": "2024-01-01T00:00:00Z", "updated_at": "2024-01-01T00:00:00Z" }
    // ...
  ]
}
```

**Error Responses:**
- 401 Unauthorized: User is not authenticated.

---

## 2. Create New Speciality

**Endpoint:** `POST /api/trainers/specialities`

**Description:**
Creates a new speciality option for trainer profiles. **Admin or Super Admin privileges required.**

**Authentication:** Required (admin or super admin)

**Request Body:**
- Content-Type: `application/json`
- Body fields:

```json
{
  "name": "Blockchain Development"
}
```
- `name` (string, required): Name of the speciality (2-100 characters).

**Response:**
- **Status 201 Created**
- Returns the created speciality object.

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Speciality created successfully",
  "data": {
    "id": 8,
    "name": "Blockchain Development",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Error Responses:**
- 400 Bad Request: Invalid input data or speciality already exists.
- 401 Unauthorized: User is not authenticated.
- 403 Forbidden: Admin access required.

---

## 3. Update Speciality

**Endpoint:** `PUT /api/trainers/specialities/{id}`

**Description:**
Updates an existing speciality. **Admin or Super Admin privileges required.**

**Authentication:** Required (admin or super admin)

**Path Parameter:**
- `id` (number, required): The ID of the speciality to update.

**Request Body:**
- Content-Type: `application/json`
- Body fields (all optional):

```json
{
  "name": "Advanced Full Stack Web Development"
}
```
- `name` (string, optional): New name for the speciality (2-100 characters).

**Response:**
- **Status 200 OK**
- Returns the updated speciality object.

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Speciality updated successfully",
  "data": {
    "id": 1,
    "name": "Advanced Full Stack Web Development",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z"
  }
}
```

**Error Responses:**
- 400 Bad Request: Invalid input data or speciality already exists.
- 401 Unauthorized: User is not authenticated.
- 403 Forbidden: Admin access required.
- 404 Not Found: Speciality not found.

---

## 4. Delete Speciality

**Endpoint:** `DELETE /api/trainers/specialities/{id}`

**Description:**
Deletes a speciality. **Admin or Super Admin privileges required.**

> **Note:** Deleting a speciality will affect existing trainer profiles that use this speciality.

**Authentication:** Required (admin or super admin)

**Path Parameter:**
- `id` (number, required): The ID of the speciality to delete.

**Response:**
- **Status 200 OK**
- Returns the deleted speciality object.

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Speciality deleted successfully",
  "data": {
    "id": 8,
    "name": "Blockchain Development",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Error Responses:**
- 401 Unauthorized: User is not authenticated.
- 403 Forbidden: Admin access required.
- 404 Not Found: Speciality not found.

---

## Speciality Object Structure

A `Speciality` object returned by these endpoints has the following structure:

| Field       | Type    | Description                       |
|-------------|---------|-----------------------------------|
| id          | number  | Unique ID of the speciality       |
| name        | string  | Name of the speciality            |
| created_at  | string  | ISO timestamp of creation         |
| updated_at  | string  | ISO timestamp of last update      |

---

## Example Usage

- To get all specialities, make a GET request to `/api/trainers/specialities`.
- To create a new speciality, make a POST request with `{ "name": "..." }` as an admin.
- To update a speciality, make a PUT request to `/api/trainers/specialities/{id}` with the new name.
- To delete a speciality, make a DELETE request to `/api/trainers/specialities/{id}` as an admin.

---

## Error Codes

| Status | Meaning                                 |
|--------|-----------------------------------------|
| 400    | Invalid input data or already exists    |
| 401    | Unauthorized (not logged in)            |
| 403    | Forbidden (admin access required)       |
| 404    | Speciality not found                    |

---

For further details, see the backend Swagger docs or contact the backend team.
