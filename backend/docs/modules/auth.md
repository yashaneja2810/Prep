# Authentication Module Documentation

## Overview
The Authentication module handles user registration, login, logout, profile completion, and session management. All endpoints use HTTP-only cookies for session management.

## Base URL
```
/api/auth
```

## Authentication
- Most endpoints are public (`@Public()` decorator)
- Protected endpoints require valid authentication cookies
- Cookies are automatically set/cleared by the server

---

## Endpoints

### 1. Register User
**Endpoint:** `POST /api/auth/register`  
**Access:** Public  
**Description:** Create a new user account with email and password

#### Request Body
```typescript
{
  email: string;        // Valid email address
  password: string;     // Minimum 8 characters
}
```

#### Example Request
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "emailConfirmed": false
    }
  }
}
```

#### Error Responses
- **400 Bad Request:** Validation failed or email already exists
- **500 Internal Server Error:** Server error

---

### 2. Login User
**Endpoint:** `POST /api/auth/login`  
**Access:** Public  
**Description:** Authenticate user and set HTTP-only cookies

#### Request Body
```typescript
{
  email: string;        // Valid email address
  password: string;     // Minimum 8 characters
}
```

#### Example Request
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "emailConfirmed": true,
      "lastSignIn": "2023-01-01T00:00:00Z"
    }
  }
}
```

#### Side Effects
- Sets `accessToken` and `refreshToken` HTTP-only cookies
- Updates `email_verified` to true in database

#### Error Responses
- **401 Unauthorized:** Invalid credentials or email not confirmed
- **500 Internal Server Error:** Server error

---

### 3. Logout User
**Endpoint:** `POST /api/auth/logout`  
**Access:** Authenticated users only  
**Description:** Logout user and clear authentication cookies

#### Request Body
None required

#### Success Response (200)
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### Side Effects
- Clears `accessToken` and `refreshToken` cookies

#### Error Responses
- **401 Unauthorized:** Not authenticated

---

### 4. Complete Profile
**Endpoint:** `POST /api/auth/complete-profile`  
**Access:** Authenticated users only  
**Description:** Complete user profile with personal information after registration

#### Request Body
```typescript
{
  first_name: string;           // Required, min 1 character
  last_name: string;            // Required, min 1 character
  preferred_name?: string;      // Optional nickname
  phone?: string;               // Optional, format: +1234567890
  date_of_birth?: string;       // Optional, format: YYYY-MM-DD
  timezone: string;             // Default: "UTC"
}
```

#### Example Request
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "preferred_name": "Johnny",
  "phone": "+1234567890",
  "date_of_birth": "1990-01-15",
  "timezone": "America/New_York"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Profile completed successfully",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "preferred_name": "Johnny",
      "phone": "+1234567890",
      "date_of_birth": "1990-01-15",
      "timezone": "America/New_York",
      "profileCompleted": true
    }
  }
}
```

#### Error Responses
- **401 Unauthorized:** Not authenticated
- **400 Bad Request:** Validation failed

---

### 5. Get Current User
**Endpoint:** `GET /api/auth/me`  
**Access:** Authenticated users only  
**Description:** Retrieve current authenticated user information

#### Request Body
None required

#### Success Response (200)
```json
{
  "success": true,
  "message": "User data retrieved successfully",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "emailConfirmed": true,
      "createdAt": "2023-01-01T00:00:00Z",
      "lastSignIn": "2023-01-01T00:00:00Z"
    }
  }
}
```

#### Error Responses
- **401 Unauthorized:** Not authenticated

---

### 6. Refresh Session
**Endpoint:** `POST /api/auth/refresh`  
**Access:** Public  
**Description:** Refresh access token using refresh token from cookies

#### Request Body
None required

#### Success Response (200)
```json
{
  "success": true,
  "message": "Session refresh not yet implemented"
}
```

#### Error Responses
- **401 Unauthorized:** Invalid refresh token

---

## Frontend Integration Notes

### Cookie Management
- Cookies are automatically managed by the browser
- No manual token handling required
- Include credentials in requests: `credentials: 'include'`

### Example Frontend Usage
```javascript
// Register
const register = async (email, password) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Login
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Get current user
const getCurrentUser = async () => {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
};
```

### Error Handling
Always check the `success` field in responses:
```javascript
const handleAuthRequest = async (requestFn) => {
  try {
    const result = await requestFn();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Authentication failed');
    }
  } catch (error) {
    console.error('Auth error:', error);
    throw error;
  }
};
```
