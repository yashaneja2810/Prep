# GamutX LMS API Documentation

This document outlines the available API endpoints for the GamutX Learning Management System backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Authentication is implemented using JWT tokens with both Bearer token and cookie-based authentication support.
Include the token in the Authorization header as:

```
Authorization: Bearer <your_jwt_token>
```

Or use cookie-based authentication with `jwt_token` cookie.

## Endpoints

### Health Check

#### Basic Service Status

```
GET /
```

Returns basic service status and information.

**Response (200 OK)**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Service is running",
  "data": {
    "service": "GamutX LMS Backend",
    "status": "operational",
    "timestamp": "2023-01-01T00:00:00.000Z"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Supabase Connection Health Check

```
GET /health
```

Returns detailed health status including Supabase connection status.

**Response (200 OK)**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "All systems operational",
  "data": {
    "service": "GamutX LMS Backend",
    "database": {
      "type": "Supabase",
      "connected": true,
      "message": "Supabase connection successful"
    },
    "supabaseAvailable": true,
    "timestamp": "2023-01-01T00:00:00.000Z"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Topics

#### Create a new topic

```
POST /topics
```

Creates a new topic with the provided information.

**Request Body**

```json
{
  "topic_code": "INTRO_JS_001",
  "title": "Introduction to JavaScript Variables",
  "description": "Learn about JavaScript variables, data types, and declaration methods",
  "status": "active"
}
```

**Request Body Parameters**

| Parameter    | Type   | Description                           | Required | Constraints                    |
|--------------|--------|---------------------------------------|----------|--------------------------------|
| topic_code   | string | Unique topic code identifier          | Yes      | Max length 50, non-empty       |
| title        | string | Topic title                           | Yes      | Max length 255, non-empty      |
| description  | string | Detailed description of the topic     | Yes      | Non-empty string               |
| status       | string | Current status of the topic           | Yes      | One of: draft, active, inactive|

**Response (201 Created)**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Topic created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "topic_code": "INTRO_JS_001",
    "title": "Introduction to JavaScript Variables",
    "description": "Learn about JavaScript variables, data types, and declaration methods",
    "status": "active",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses**

- **400 Bad Request**: Validation error in the request body
  ```json
  {
    "statusCode": 400,
    "message": ["topic_code should not be empty"],
    "error": "Bad Request"
  }
  ```

- **409 Conflict**: Topic with the same topic_code already exists
  ```json
  {
    "statusCode": 409,
    "message": "Topic with this topic_code already exists",
    "error": "Conflict"
  }
  ```

#### Get all topics

```
GET /topics
```

Retrieves a list of all topics, ordered by creation date (newest first).

**Query Parameters**

| Parameter | Type   | Description           | Required | Options                    |
|-----------|--------|-----------------------|----------|----------------------------|
| status    | string | Filter topics by status| No       | draft, active, inactive    |

**Response (200 OK)**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Topics retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "topic_code": "INTRO_JS_001",
      "title": "Introduction to JavaScript Variables",
      "description": "Learn about JavaScript variables, data types, and declaration methods",
      "status": "active",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Get topic by ID

```
GET /topics/:id
```

Retrieves a specific topic by its ID.

**Parameters**

| Parameter | Type   | Description                 | Required |
|-----------|--------|-----------------------------|----------|
| id        | string | Topic ID (UUID)             | Yes      |

**Response (200 OK)**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Topic retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "topic_code": "INTRO_JS_001",
    "title": "Introduction to JavaScript Variables",
    "description": "Learn about JavaScript variables, data types, and declaration methods",
    "status": "active",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses**

- **404 Not Found**: Topic with the specified ID was not found
  ```json
  {
    "statusCode": 404,
    "message": "Topic not found",
    "error": "Not Found"
  }
  ```

#### Update topic by ID

```
PUT /topics/:id
```

Updates a specific topic with the provided information.

**Parameters**

| Parameter | Type   | Description                 | Required |
|-----------|--------|-----------------------------|----------|
| id        | string | Topic ID (UUID)             | Yes      |

**Request Body**

All fields are optional for updates:

```json
{
  "topic_code": "INTRO_JS_002",
  "title": "Advanced JavaScript Variables",
  "description": "Deep dive into JavaScript variables, scoping, and advanced concepts",
  "status": "inactive"
}
```

**Response (200 OK)**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Topic updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "topic_code": "INTRO_JS_002",
    "title": "Advanced JavaScript Variables",
    "description": "Deep dive into JavaScript variables, scoping, and advanced concepts",
    "status": "inactive",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T12:00:00.000Z"
  },
  "timestamp": "2023-01-01T12:00:00.000Z"
}
```

**Error Responses**

- **404 Not Found**: Topic with the specified ID was not found
- **409 Conflict**: Topic with the same topic_code already exists

#### Delete topic by ID

```
DELETE /topics/:id
```

Deletes a specific topic by its ID.

**Parameters**

| Parameter | Type   | Description                 | Required |
|-----------|--------|-----------------------------|----------|
| id        | string | Topic ID (UUID)             | Yes      |

**Response (200 OK)**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Topic deleted successfully",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses**

- **404 Not Found**: Topic with the specified ID was not found
  ```json
  {
    "statusCode": 404,
    "message": "Topic not found",
    "error": "Not Found"
  }
  ```

### API Documentation

#### Verify Documentation

```
POST /api-docs-test/verify-documentation
```

Verifies the completeness and accuracy of API documentation.

**Response (200 OK)**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "API documentation verification completed",
  "data": {
    "totalEndpoints": 8,
    "documentedEndpoints": 8,
    "undocumentedEndpoints": 0,
    "verification": {
      "swaggerAvailable": true,
      "allEndpointsDocumented": true,
      "schemasPresent": true,
      "examplesProvided": true,
      "errorResponsesDocumented": true
    },
    "swaggerUrl": "/api/docs",
    "documentationFeatures": {
      "bearerAuth": true,
      "cookieAuth": true,
      "requestSchemas": true,
      "responseSchemas": true,
      "errorHandling": true,
      "examples": true,
      "tags": true,
      "descriptions": true
    }
  }
}
```

#### Get Swagger Status

```
GET /api-docs-test/swagger-status
```

Returns the current status of Swagger documentation.

**Response (200 OK)**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Swagger documentation is available and operational",
  "data": {
    "swaggerAvailable": true,
    "swaggerUrl": "/api/docs",
    "totalEndpoints": 8,
    "documentedEndpoints": 8,
    "features": {
      "bearerAuth": true,
      "cookieAuth": true,
      "requestValidation": true,
      "responseSchemas": true,
      "errorHandling": true
    }
  }
}
```

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "statusCode": 400,
  "message": "Error description or array of validation errors",
  "error": "Error Type",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

Common HTTP status codes used:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **500**: Internal Server Error

## Response Format

All successful responses follow this format:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success message",
  "data": {}, // Response data
  "timestamp": "2023-01-01T00:00:00.000Z"
}
``` 