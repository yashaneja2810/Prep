# Profiles Module Documentation - Trainer Profiles

## Overview
The Trainer Profile endpoints handle creation, updating, and retrieval of trainer-specific profile information. These endpoints are part of the broader Profiles module and require **administrative access**. The system now uses a **many-to-many relationship with specialities** and supports **soft delete functionality** for enhanced data management.

## Base URL
```
/api/profiles
```

## Authentication & Authorization
- **Authentication:** All endpoints require valid authentication cookies
- **Authorization:** Role-based access control applies
- **Trainer Profiles:** Require **Admin or Super Admin roles only**
- **Access Control:** Only administrators can create, update, or view trainer profiles
- **Soft Delete:** Trainer profiles are deactivated (not permanently deleted) for data integrity

---

## Trainer Profile Endpoints

> **IMPORTANT FOR FRONTEND DEVELOPERS:**
> 
> **Two Different Identifiers Explained:**
> - **`id`** = Trainer Profile ID (Primary Key) - Unique identifier for each trainer profile record
> - **`user_id`** = User ID (Foreign Key) - References the user who owns the trainer profile(s)
> 
> **Key Difference:** One user (`user_id`) can have multiple trainer profiles, each with a unique trainer profile `id`.
> 
> **When to use which:**
> - Use `id` when working with a specific trainer profile (update, delete, get single profile)
> - Use `user_id` when working with all trainer profiles belonging to a user

---

### 1. Create Trainer Profile (Admin Only)
**Method:** `POST`  
**Endpoint:** `/api/profiles/trainer`  
**Roles Required:** Admin, Super Admin  
**Description:** Creates a new trainer profile for a user by email - requires admin privileges. The user must be registered and have verified email.

#### Request Body
```typescript
{
  email: string;                   // Email of the user for whom the trainer profile is being created (required)
  specialities: number[];          // Array of speciality IDs that the trainer specializes in (required, min: 1)
  total_years_teaching?: number;   // Total years of teaching experience (decimal allowed)
  bio?: string;                    // Professional bio and background
  linkedin_url?: string;           // LinkedIn profile URL (max: 255 chars)
  expertise?: string;              // Areas of expertise and skills
  profile_image?: string;          // Profile image URL (max: 255 chars)
  website?: string;                // Personal or professional website URL (max: 255 chars)
  social_links?: object;           // Social media links and other profiles (JSON object)
}
```

#### Example Request
```json
POST /api/profiles/trainer

{
  "email": "john.doe@example.com",
  "specialities": [1, 3, 5],
  "total_years_teaching": 5.5,
  "bio": "Experienced software engineer with 10+ years in web development and training.",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "expertise": "JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker",
  "profile_image": "https://example.com/profile.jpg",
  "website": "https://johndoe.dev",
  "social_links": {
    "twitter": "https://twitter.com/johndoe",
    "github": "https://github.com/johndoe",
    "portfolio": "https://johndoe.dev"
  }
}
```

#### Success Response (201)
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Trainer profile created successfully",
  "data": {
    "id": "trainer-profile-uuid",              // <- TRAINER PROFILE ID (Primary Key)
    "user_id": "user-uuid",                    // <- USER ID (Foreign Key)
    "specialities": [                          // <- ARRAY OF SPECIALITY OBJECTS
      { "id": 1, "name": "Full Stack Web Development" },
      { "id": 3, "name": "Machine Learning" },
      { "id": 5, "name": "DevOps" }
    ],
    "is_active": true,                         // <- SOFT DELETE STATUS (true = active, false = deactivated)
    "total_years_teaching": 5.5,
    "bio": "Experienced software engineer with 10+ years in web development and training...",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "expertise": "JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker",
    "profile_image": "https://example.com/profile.jpg",
    "website": "https://johndoe.dev",
    "social_links": {
      "twitter": "https://twitter.com/johndoe",
      "github": "https://github.com/johndoe",
      "portfolio": "https://johndoe.dev"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Error Responses
- **400 Bad Request:** Invalid input data, validation failed, invalid speciality IDs, user email not verified, or user account inactive
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges (admin role required)
- **404 Not Found:** User not found with the provided email address
- **409 Conflict:** Trainer profile already exists for this user

---

### 2. Get All Trainer Profiles with User Details (Admin Only)
**Method:** `GET`  
**Endpoint:** `/api/profiles/trainer`  
**Roles Required:** Admin, Super Admin  
**Description:** Retrieves all trainer profiles (both active and inactive) with user information including first_name and email - requires admin privileges. Returns all profiles with is_active field indicating their status.

#### Request Body
None required

#### Example Request
```
PUT /api/profiles/trainer/a589bdf8-89e0-48c9-b709-02cdbd50ff38
```

```json
{
  "specialities": [1, 2, 4, 6],
  "total_years_teaching": 6.0,
  "bio": "Updated bio with more recent experience in cloud technologies and DevOps practices. Expert in modern web development frameworks and cloud infrastructure.",
  "expertise": "JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker, Kubernetes, Terraform",
  "website": "https://johndoe-updated.dev",
  "social_links": {
    "twitter": "https://twitter.com/johndoe",
    "github": "https://github.com/johndoe",
    "portfolio": "https://johndoe-updated.dev",
    "youtube": "https://youtube.com/johndoe"
  }
}
```

#### Success Response (200)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Trainer profile updated successfully",
  "data": {
    "id": "trainer-profile-uuid",
    "user_id": "user-uuid",
    "specialities": [
      { "id": 1, "name": "Full Stack Web Development" },
      { "id": 2, "name": "Frontend Development" },
      { "id": 4, "name": "Mobile Development" },
      { "id": 6, "name": "Machine Learning" }
    ],
    "is_active": true,
    "total_years_teaching": 6.0,
    "bio": "Updated bio with more recent experience in cloud technologies and DevOps practices...",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "expertise": "JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker, Kubernetes, Terraform",
    "profile_image": "https://example.com/profile.jpg",
    "website": "https://johndoe-updated.dev",
    "social_links": {
      "twitter": "https://twitter.com/johndoe",
      "github": "https://github.com/johndoe",
      "portfolio": "https://johndoe-updated.dev",
      "youtube": "https://youtube.com/johndoe"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T12:45:00Z"
  }
}
```

#### Error Responses
- **400 Bad Request:** Invalid input data or validation failed
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges (admin role required)
- **404 Not Found:** Trainer profile not found

---

#### Example Request
```
GET /api/profiles/trainer
```

#### Success Response (200)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Trainer profiles retrieved successfully",
  "data": [
    {
      "id": "trainer-profile-uuid-1",
      "user_id": "user-uuid-1",
      "first_name": "John",
      "email": "john.doe@example.com",
      "specialities": [
        { "id": 1, "name": "Full Stack Web Development" },
        { "id": 3, "name": "Machine Learning" },
        { "id": 5, "name": "DevOps" }
      ],
      "is_active": true,
      "total_years_teaching": 5.5,
      "bio": "Experienced software engineer with 10+ years in web development and training...",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "expertise": "JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker",
      "profile_image": "https://example.com/profile.jpg",
      "website": "https://johndoe.dev",
      "social_links": {
        "twitter": "https://twitter.com/johndoe",
        "github": "https://github.com/johndoe",
        "portfolio": "https://johndoe.dev"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "trainer-profile-uuid-2",
      "user_id": "user-uuid-2",
      "first_name": "Jane",
      "email": "jane.smith@example.com",
      "specialities": [
        { "id": 2, "name": "Frontend Development" },
        { "id": 6, "name": "Machine Learning" }
      ],
      "is_active": false,
      "total_years_teaching": 3.0,
      "bio": "Frontend specialist with React and Vue.js expertise...",
      "linkedin_url": "https://linkedin.com/in/janesmith",
      "expertise": "React, Vue.js, TypeScript, CSS, UX/UI Design",
      "profile_image": "https://example.com/profile2.jpg",
      "website": "https://janesmith.dev",
      "social_links": {
        "twitter": "https://twitter.com/janesmith",
        "github": "https://github.com/janesmith"
      },
      "created_at": "2024-01-14T15:20:00Z",
      "updated_at": "2024-01-14T15:20:00Z"
    }
  ]
}
```

#### Error Responses
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges (admin role required)

---

### 3. Update Trainer Profile (Admin Only)
**Method:** `PUT`  
**Endpoint:** `/api/profiles/trainer/{id}`  
**Roles Required:** Admin, Super Admin  
**Description:** Updates a trainer profile using the trainer profile ID (Primary Key) - requires admin privileges

> **FRONTEND NOTE:** Use the trainer profile `id` (Primary Key) in the URL, NOT the `user_id`

#### Path Parameters
- `id` (string, UUID): **Trainer Profile ID (Primary Key)** - the unique identifier of the trainer profile to update

#### Request Body
```typescript
{
  specialities?: number[];         // Array of speciality IDs that the trainer specializes in (optional, min: 1 if provided)
  total_years_teaching?: number;   // Total years of teaching experience (decimal allowed)
  bio?: string;                    // Professional bio and background
  linkedin_url?: string;           // LinkedIn profile URL (max: 255 chars)
  expertise?: string;              // Areas of expertise and skills
  profile_image?: string;          // Profile image URL (max: 255 chars)
  website?: string;                // Personal or professional website URL (max: 255 chars)
  social_links?: object;           // Social media links and other profiles (JSON object)
}
```

#### Example Request
```json
PUT /api/profiles/trainer/a589bdf8-89e0-48c9-b709-02cdbd50ff38

{
  "speciality_area": "Advanced Full Stack Development & Cloud Architecture",
  "total_years_teaching": 6.0,
  "bio": "Updated bio with more recent experience in cloud technologies and DevOps practices.",
  "expertise": "JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker, Kubernetes, Terraform",
  "website": "https://johndoe-updated.dev",
  "social_links": {
    "twitter": "https://twitter.com/johndoe",
    "github": "https://github.com/johndoe",
    "portfolio": "https://johndoe-updated.dev",
    "youtube": "https://youtube.com/johndoe"
  }
}
```

#### Success Response (200)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Trainer profile updated successfully",
  "data": {
    "id": "a589bdf8-89e0-48c9-b709-02cdbd50ff38",  // <- TRAINER PROFILE ID (Primary Key)
    "user_id": "user-uuid",                         // <- USER ID (Foreign Key) - unchanged
    "speciality_area": "Advanced Full Stack Development & Cloud Architecture",
    "total_years_teaching": 6.0,
    "bio": "Updated bio with more recent experience in cloud technologies and DevOps practices...",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "expertise": "JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker, Kubernetes, Terraform",
    "profile_image": "https://example.com/profile.jpg",
    "website": "https://johndoe-updated.dev",
    "social_links": {
      "twitter": "https://twitter.com/johndoe",
      "github": "https://github.com/johndoe",
      "portfolio": "https://johndoe-updated.dev",
      "youtube": "https://youtube.com/johndoe"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T12:45:00Z"
  }
}
```

#### Error Responses
- **400 Bad Request:** Invalid input data or validation failed
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges (admin role required)
- **404 Not Found:** Trainer profile not found

---

### 4. Get Trainer Profiles by User ID with User Details (Admin Only)
**Method:** `GET`  
**Endpoint:** `/api/profiles/trainer/{userId}`  
**Roles Required:** Admin, Super Admin  
**Description:** Retrieves all trainer profiles for a specific user using User ID (Foreign Key) - requires admin privileges. Returns array as one user can have multiple trainer profiles.

> **FRONTEND NOTE:** Use the `user_id` (Foreign Key) in the URL to get ALL trainer profiles for a specific user

#### Path Parameters
- `userId` (string, UUID): **User ID (Foreign Key)** - the ID of the user whose trainer profiles you want to retrieve

#### Example Request
```
GET /api/profiles/trainer/6eb733aa-9bf0-4f4b-aaa5-4c65da8685f4
```

#### Success Response (200)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Trainer profiles retrieved successfully",
  "data": [
    {
      "id": "a589bdf8-89e0-48c9-b709-02cdbd50ff38",  // <- TRAINER PROFILE ID #1 (Primary Key)
      "user_id": "6eb733aa-9bf0-4f4b-aaa5-4c65da8685f4", // <- SAME USER ID (Foreign Key)
      "first_name": "John",                             // <- FROM USERS TABLE
      "email": "john.doe@example.com",                  // <- FROM USERS TABLE
      "speciality_area": "Full Stack Web Development",
      "total_years_teaching": 5.5,
      "bio": "Experienced software engineer with 10+ years in web development and training...",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "expertise": "JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker",
      "profile_image": "https://example.com/profile.jpg",
      "website": "https://johndoe.dev",
      "social_links": {
        "twitter": "https://twitter.com/johndoe",
        "github": "https://github.com/johndoe",
        "portfolio": "https://johndoe.dev"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "b589bdf8-89e0-48c9-b709-02cdbd50ff39",  // <- TRAINER PROFILE ID #2 (Primary Key)
      "user_id": "6eb733aa-9bf0-4f4b-aaa5-4c65da8685f4", // <- SAME USER ID (Foreign Key)
      "first_name": "John",                             // <- SAME USER DATA
      "email": "john.doe@example.com",                  // <- SAME USER DATA
      "speciality_area": "Mobile App Development",
      "total_years_teaching": 3.0,
      "bio": "Specialized in iOS and Android development with React Native expertise...",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "expertise": "React Native, Swift, Kotlin, Flutter, Mobile UI/UX",
      "profile_image": "https://example.com/profile.jpg",
      "website": "https://johndoe.dev",
      "social_links": {
        "twitter": "https://twitter.com/johndoe",
        "github": "https://github.com/johndoe"
      },
      "created_at": "2024-01-16T14:20:00Z",
      "updated_at": "2024-01-16T14:20:00Z"
    }
  ]
}
```

#### Error Responses
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges (admin access required)

---

### 5. Get Trainer Profile by ID with User Details (Admin Only)
**Method:** `GET`  
**Endpoint:** `/api/profiles/trainer/profile/{id}`  
**Roles Required:** Admin, Super Admin  
**Description:** Retrieves a specific trainer profile using the trainer profile ID (Primary Key) - requires admin privileges

> **FRONTEND NOTE:** Use the trainer profile `id` (Primary Key) to get ONE specific trainer profile

#### Path Parameters
- `id` (string, UUID): **Trainer Profile ID (Primary Key)** - the unique identifier of the trainer profile

#### Example Request
```
GET /api/profiles/trainer/profile/a589bdf8-89e0-48c9-b709-02cdbd50ff38
```

#### Success Response (200)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Trainer profile retrieved successfully",
  "data": {
    "id": "a589bdf8-89e0-48c9-b709-02cdbd50ff38",    // <- TRAINER PROFILE ID (Primary Key)
    "user_id": "6eb733aa-9bf0-4f4b-aaa5-4c65da8685f4", // <- USER ID (Foreign Key)
    "first_name": "John",                             // <- FROM USERS TABLE
    "email": "john.doe@example.com",                  // <- FROM USERS TABLE
    "speciality_area": "Full Stack Web Development",
    "total_years_teaching": 5.5,
    "bio": "Experienced software engineer with 10+ years in web development and training...",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "expertise": "JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker",
    "profile_image": "https://example.com/profile.jpg",
    "website": "https://johndoe.dev",
    "social_links": {
      "twitter": "https://twitter.com/johndoe",
      "github": "https://github.com/johndoe",
      "portfolio": "https://johndoe.dev"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Error Responses
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges (admin access required)
- **404 Not Found:** Trainer profile not found

---

### 6. Deactivate Trainer Profile by ID (Admin Only) [SOFT DELETE]
**Method:** `DELETE`  
**Endpoint:** `/api/profiles/trainer/profile/{id}`  
**Roles Required:** Admin, Super Admin  
**Description:** Deactivates a specific trainer profile using the trainer profile ID (Primary Key) - requires admin privileges. This is a soft delete operation that sets is_active = false, preserving data while preventing access. Returns the deactivated profile information.

> **FRONTEND NOTE:** Use the trainer profile `id` (Primary Key) to delete a specific trainer profile

#### Path Parameters
- `id` (string, UUID): **Trainer Profile ID (Primary Key)** - the unique identifier of the trainer profile to delete

#### Example Request
```
DELETE /api/profiles/trainer/profile/a589bdf8-89e0-48c9-b709-02cdbd50ff38
```

#### Success Response (200)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Trainer profile deactivated successfully",
  "data": {
    "id": "a589bdf8-89e0-48c9-b709-02cdbd50ff38",    // <- DEACTIVATED TRAINER PROFILE ID (Primary Key)
    "user_id": "6eb733aa-9bf0-4f4b-aaa5-4c65da8685f4", // <- USER ID (Foreign Key)
    "first_name": "John",                             // <- FROM USERS TABLE
    "email": "john.doe@example.com",                  // <- FROM USERS TABLE
    "specialities": [
      { "id": 1, "name": "Full Stack Web Development" },
      { "id": 3, "name": "Machine Learning" }
    ],
    "is_active": false,                               // <- NOW DEACTIVATED (was true)
    "total_years_teaching": 5.5,
    "bio": "Experienced software engineer with 10+ years in web development and training...",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "expertise": "JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker",
    "profile_image": "https://example.com/profile.jpg",
    "website": "https://johndoe.dev",
    "social_links": {
      "twitter": "https://twitter.com/johndoe",
      "github": "https://github.com/johndoe",
      "portfolio": "https://johndoe.dev"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Error Responses
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges (admin access required)
- **404 Not Found:** Trainer profile not found

---

### 7. Reactivate Trainer Profile by ID (Admin Only)
**Method:** `PUT`  
**Endpoint:** `/api/profiles/trainer/profile/{id}/activate`  
**Roles Required:** Admin, Super Admin  
**Description:** Reactivates a previously deactivated trainer profile by setting is_active = true - requires admin privileges. This restores access for the trainer.

> **FRONTEND NOTE:** Use the trainer profile `id` (Primary Key) to reactivate a specific trainer profile

#### Path Parameters
- `id` (string, UUID): **Trainer Profile ID (Primary Key)** - the unique identifier of the trainer profile to reactivate

#### Example Request
```
PUT /api/profiles/trainer/profile/a589bdf8-89e0-48c9-b709-02cdbd50ff38/activate
```

#### Success Response (200)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Trainer profile reactivated successfully",
  "data": {
    "id": "a589bdf8-89e0-48c9-b709-02cdbd50ff38",
    "user_id": "6eb733aa-9bf0-4f4b-aaa5-4c65da8685f4",
    "first_name": "John",
    "email": "john.doe@example.com",
    "specialities": [
      { "id": 1, "name": "Full Stack Web Development" },
      { "id": 3, "name": "Machine Learning" }
    ],
    "is_active": true,
    "total_years_teaching": 5.5,
    "bio": "Experienced software engineer with 10+ years in web development and training...",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "expertise": "JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker",
    "profile_image": "https://example.com/profile.jpg",
    "website": "https://johndoe.dev",
    "social_links": {
      "twitter": "https://twitter.com/johndoe",
      "github": "https://github.com/johndoe",
      "portfolio": "https://johndoe.dev"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Error Responses
- **400 Bad Request:** Trainer profile is already active
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges (admin access required)
- **404 Not Found:** Trainer profile not found

---

### 8. ⚠️ Permanently Delete Trainer Profile by ID (Super Admin Only)
**Method:** `DELETE`  
**Endpoint:** `/api/profiles/trainer/profile/{id}/permanent`  
**Roles Required:** Super Admin  
**Description:** ⚠️ **DANGER:** This PERMANENTLY DELETES the trainer profile and all associated data from the database. This action CANNOT be undone. Use the regular DELETE endpoint for safe deactivation instead. Requires super admin privileges.

> **⚠️ WARNING:** This is a destructive operation that cannot be reversed. Use with extreme caution.

> **📋 DEVELOPMENT NOTE:** This endpoint is **fully implemented, tested, and working** on the backend. However, it has been **temporarily removed from the frontend** for safety reasons. The functionality is available via direct API calls and is documented here for completeness. Frontend implementation may be restored in future versions with additional safety measures.

#### Path Parameters
- `id` (string, UUID): **Trainer Profile ID (Primary Key)** - the unique identifier of the trainer profile to permanently delete

#### Example Request
```
DELETE /api/profiles/trainer/profile/a589bdf8-89e0-48c9-b709-02cdbd50ff38/permanent
```

#### Success Response (200)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Trainer profile permanently deleted",
  "data": {
    "id": "a589bdf8-89e0-48c9-b709-02cdbd50ff38",
    "user_id": "6eb733aa-9bf0-4f4b-aaa5-4c65da8685f4",
    "first_name": "John",
    "email": "john.doe@example.com",
    "message": "Profile has been permanently removed from the database"
  }
}
```

#### Error Responses
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges (super admin access required)
- **404 Not Found:** Trainer profile not found

---

## Specialities Management Endpoints

### 9. Get All Specialities
**Method:** `GET`  
**Endpoint:** `/api/profiles/specialities`  
**Roles Required:** Any authenticated user  
**Description:** Retrieves all available specialities for trainer profile creation and management

#### Example Request
```
GET /api/profiles/specialities
```

#### Success Response (200)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Specialities retrieved successfully",
  "data": [
    { "id": 1, "name": "Full Stack Web Development" },
    { "id": 2, "name": "Frontend Development" },
    { "id": 3, "name": "Backend Development" },
    { "id": 4, "name": "Mobile Development" },
    { "id": 5, "name": "DevOps" },
    { "id": 6, "name": "Machine Learning" },
    { "id": 7, "name": "Data Science" }
  ]
}
```

#### Error Responses
- **401 Unauthorized:** Not authenticated

---

### 10. Create New Speciality (Admin Only)
**Method:** `POST`  
**Endpoint:** `/api/profiles/specialities`  
**Roles Required:** Admin, Super Admin  
**Description:** Creates a new speciality option for trainer profiles - requires admin privileges

#### Request Body
```typescript
{
  name: string;                    // Name of the speciality (required, 2-100 chars)
}
```

#### Example Request
```json
POST /api/profiles/specialities

{
  "name": "Blockchain Development"
}
```

#### Success Response (201)
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

#### Error Responses
- **400 Bad Request:** Invalid input data or speciality already exists
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges (admin access required)

---

### 11. Update Speciality (Admin Only)
**Method:** `PUT`  
**Endpoint:** `/api/profiles/specialities/{id}`  
**Roles Required:** Admin, Super Admin  
**Description:** Updates an existing speciality - requires admin privileges

#### Path Parameters
- `id` (number): **Speciality ID** - the unique identifier of the speciality to update

#### Request Body
```typescript
{
  name?: string;                   // Name of the speciality (optional, 2-100 chars)
}
```

#### Example Request
```json
PUT /api/profiles/specialities/1

{
  "name": "Advanced Full Stack Web Development"
}
```

#### Success Response (200)
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

#### Error Responses
- **400 Bad Request:** Invalid input data or speciality already exists
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges (admin access required)
- **404 Not Found:** Speciality not found

---

### 12. Delete Speciality (Admin Only)
**Method:** `DELETE`  
**Endpoint:** `/api/profiles/specialities/{id}`  
**Roles Required:** Admin, Super Admin  
**Description:** Deletes a speciality - requires admin privileges. Note: This will affect existing trainer profiles that use this speciality.

> **⚠️ WARNING:** Deleting a speciality will remove it from all trainer profiles that currently have it assigned.

#### Path Parameters
- `id` (number): **Speciality ID** - the unique identifier of the speciality to delete

#### Example Request
```
DELETE /api/profiles/specialities/8
```

#### Success Response (200)
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

#### Error Responses
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Insufficient privileges (admin access required)
- **404 Not Found:** Speciality not found

---

## Data Models

### Speciality Object
```typescript
interface Speciality {
  id: number;                      // Unique identifier of the speciality
  name: string;                    // Name of the speciality
  created_at?: string;             // Creation timestamp (ISO 8601)
  updated_at?: string;             // Last update timestamp (ISO 8601)
}
```

### Trainer Profile Object
```typescript
interface TrainerProfile {
  id: string;                      // UUID of the trainer profile
  user_id: string;                 // UUID of the associated user
  specialities?: Speciality[];     // Array of speciality objects the trainer specializes in
  is_active?: boolean;             // Active status (true = active, false = deactivated)
  total_years_teaching?: number;   // Total years of teaching experience (decimal allowed)
  bio?: string;                    // Professional bio and background
  linkedin_url?: string;           // LinkedIn profile URL (max: 255 chars)
  expertise?: string;              // Areas of expertise and skills
  profile_image?: string;          // Profile image URL (max: 255 chars)
  website?: string;                // Personal or professional website URL (max: 255 chars)
  social_links?: object;           // Social media links and other profiles (JSON object)
  created_at: string;              // Creation timestamp (ISO 8601)
  updated_at: string;              // Last update timestamp (ISO 8601)
}
```

### Trainer Profile with User Details Object (GET endpoints)
```typescript
interface TrainerProfileWithUser {
  id: string;                      // UUID of the trainer profile
  user_id: string;                 // UUID of the associated user
  first_name?: string;             // First name from users table
  email: string;                   // Email address from users table
  specialities?: Speciality[];     // Array of speciality objects the trainer specializes in
  is_active?: boolean;             // Active status (true = active, false = deactivated)
  total_years_teaching?: number;   // Total years of teaching experience (decimal allowed)
  bio?: string;                    // Professional bio and background
  linkedin_url?: string;           // LinkedIn profile URL (max: 255 chars)
  expertise?: string;              // Areas of expertise and skills
  profile_image?: string;          // Profile image URL (max: 255 chars)
  website?: string;                // Personal or professional website URL (max: 255 chars)
  social_links?: object;           // Social media links and other profiles (JSON object)
  created_at: string;              // Creation timestamp (ISO 8601)
  updated_at: string;              // Last update timestamp (ISO 8601)
}
```

### Social Links Object
```typescript
interface SocialLinks {
  [platform: string]: string;     // Platform name as key, URL as value
}

// Example
{
  "twitter": "https://twitter.com/johndoe",
  "github": "https://github.com/johndoe",
  "portfolio": "https://johndoe.dev",
  "youtube": "https://youtube.com/johndoe",
  "medium": "https://medium.com/@johndoe"
}
```

---

## Frontend Integration Notes

### Example Frontend Usage
```javascript
// Get all specialities (Any authenticated user)
const getAllSpecialities = async () => {
  const response = await fetch('/api/profiles/specialities', {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
};

// Create trainer profile (Admin only) - Now uses email and specialities array
const createTrainerProfile = async (email, specialitiesIds, profileData) => {
  const response = await fetch('/api/profiles/trainer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ 
      email: email, 
      specialities: specialitiesIds,
      ...profileData 
    })
  });
  return response.json();
};

// Update trainer profile (Admin only) - Now includes specialities and soft delete status
const updateTrainerProfile = async (profileId, updateData) => {
  const response = await fetch(`/api/profiles/trainer/${profileId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updateData)
  });
  return response.json();
};

// Get all trainer profiles (Admin only) - Returns both active and inactive profiles
const getAllTrainerProfiles = async () => {
  const response = await fetch('/api/profiles/trainer', {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
};

// Get trainer profiles by user ID (Admin only) - Includes specialities and status
const getTrainerProfilesByUserId = async (userId) => {
  const response = await fetch(`/api/profiles/trainer/${userId}`, {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
};

// Get trainer profile by profile ID (Admin only) - Includes specialities and status
const getTrainerProfileById = async (profileId) => {
  const response = await fetch(`/api/profiles/trainer/profile/${profileId}`, {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
};

// Deactivate trainer profile (Admin only) - SOFT DELETE
const deactivateTrainerProfile = async (profileId) => {
  const response = await fetch(`/api/profiles/trainer/profile/${profileId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return response.json();
};

// Reactivate trainer profile (Admin only) - NEW ENDPOINT
const reactivateTrainerProfile = async (profileId) => {
  const response = await fetch(`/api/profiles/trainer/profile/${profileId}/activate`, {
    method: 'PUT',
    credentials: 'include'
  });
  return response.json();
};

// PERMANENTLY delete trainer profile (Super Admin only) - DANGEROUS OPERATION
// NOTE: This endpoint is implemented and working but removed from frontend for safety
const permanentlyDeleteTrainerProfile = async (profileId) => {
  const response = await fetch(`/api/profiles/trainer/profile/${profileId}/permanent`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return response.json();
};

// SPECIALITIES MANAGEMENT (Admin only)

// Create new speciality (Admin only)
const createSpeciality = async (name) => {
  const response = await fetch('/api/profiles/specialities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name })
  });
  return response.json();
};

// Update speciality (Admin only)
const updateSpeciality = async (specialityId, name) => {
  const response = await fetch(`/api/profiles/specialities/${specialityId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name })
  });
  return response.json();
};

// Delete speciality (Admin only)
const deleteSpeciality = async (specialityId) => {
  const response = await fetch(`/api/profiles/specialities/${specialityId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return response.json();
};
```

### Validation Rules
```javascript
const validateTrainerProfile = (profileData, isUpdate = false) => {
  const errors = {};

  // Email validation for create (Profile ID is now passed as URL parameter for updates)
  if (!isUpdate) {
    if (!profileData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = 'Email must be a valid email address';
    }
  }

  // Specialities validation (required for create, optional for update)
  if (!isUpdate) {
    if (!profileData.specialities || !Array.isArray(profileData.specialities)) {
      errors.specialities = 'Specialities array is required';
    } else if (profileData.specialities.length === 0) {
      errors.specialities = 'At least one speciality must be selected';
    } else if (!profileData.specialities.every(id => Number.isInteger(id) && id > 0)) {
      errors.specialities = 'All speciality IDs must be positive integers';
    }
  } else if (profileData.specialities !== undefined) {
    if (!Array.isArray(profileData.specialities)) {
      errors.specialities = 'Specialities must be an array';
    } else if (profileData.specialities.length === 0) {
      errors.specialities = 'At least one speciality must be selected when updating specialities';
    } else if (!profileData.specialities.every(id => Number.isInteger(id) && id > 0)) {
      errors.specialities = 'All speciality IDs must be positive integers';
    }
  }

  // Total years teaching validation
  if (profileData.total_years_teaching !== undefined) {
    if (profileData.total_years_teaching < 0 || profileData.total_years_teaching > 999.9) {
      errors.total_years_teaching = 'Years of teaching must be between 0 and 999.9';
    }
  }

  // URL validations
  const urlFields = ['linkedin_url', 'profile_image', 'website'];
  urlFields.forEach(field => {
    if (profileData[field]) {
      try {
        new URL(profileData[field]);
        if (profileData[field].length > 255) {
          errors[field] = `${field.replace('_', ' ')} cannot exceed 255 characters`;
        }
      } catch {
        errors[field] = `${field.replace('_', ' ')} must be a valid URL`;
      }
    }
  });

  // Social links validation
  if (profileData.social_links && typeof profileData.social_links !== 'object') {
    errors.social_links = 'Social links must be a valid JSON object';
  }

  return Object.keys(errors).length === 0 ? null : errors;
};
```

### Error Handling
```javascript
const handleTrainerProfileRequest = async (requestFn) => {
  try {
    const result = await requestFn();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Trainer profile operation failed');
    }
  } catch (error) {
    console.error('Trainer profile error:', error);
    throw error;
  }
};
```

### Helper Functions
```javascript
// Format specialities for display
const formatSpecialities = (specialities) => {
  if (!specialities || specialities.length === 0) {
    return 'No specialities specified';
  }
  return specialities.map(spec => spec.name).join(', ');
};

// Get speciality names as array
const getSpecialityNames = (specialities) => {
  if (!specialities || specialities.length === 0) return [];
  return specialities.map(spec => spec.name);
};

// Get speciality IDs as array
const getSpecialityIds = (specialities) => {
  if (!specialities || specialities.length === 0) return [];
  return specialities.map(spec => spec.id);
};

// Format trainer status
const formatTrainerStatus = (isActive) => {
  return isActive ? 'Active' : 'Deactivated';
};

// Check if trainer is active
const isTrainerActive = (profile) => {
  return profile.is_active === true;
};

// Format expertise for display
const formatExpertise = (expertise) => {
  if (!expertise) return 'No expertise specified';
  return expertise;
};

// Format years of teaching
const formatTeachingExperience = (years) => {
  if (!years) return 'Experience not specified';
  return `${years} year${years === 1 ? '' : 's'} of teaching experience`;
};

// Format social links for display
const formatSocialLinks = (socialLinks) => {
  if (!socialLinks || Object.keys(socialLinks).length === 0) {
    return 'No social links provided';
  }
  return Object.entries(socialLinks).map(([platform, url]) => ({
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    url
  }));
};

// Validate URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

// Validate speciality name
const validateSpecialityName = (name) => {
  if (!name || typeof name !== 'string') return false;
  return name.trim().length >= 2 && name.trim().length <= 100;
};
```

### Form Helper Components
```javascript
// Generate speciality options for forms (requires fetching from API)
const loadSpecialityOptions = async () => {
  try {
    const response = await getAllSpecialities();
    if (response.success) {
      return response.data.map(spec => ({
        value: spec.id,
        label: spec.name
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to load specialities:', error);
    return [];
  }
};

// Validate selected specialities against available options
const validateSelectedSpecialities = (selectedIds, availableSpecialities) => {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return { valid: false, error: 'At least one speciality must be selected' };
  }
  
  const availableIds = availableSpecialities.map(spec => spec.id);
  const invalidIds = selectedIds.filter(id => !availableIds.includes(id));
  
  if (invalidIds.length > 0) {
    return { 
      valid: false, 
      error: `Invalid speciality IDs: ${invalidIds.join(', ')}` 
    };
  }
  
  return { valid: true, error: null };
};

// Convert speciality objects to form-friendly format
const specialitiesToFormData = (specialities) => {
  if (!specialities || specialities.length === 0) return [];
  return specialities.map(spec => spec.id);
};

// Convert form data back to speciality IDs
const formDataToSpecialityIds = (formData) => {
  if (!formData || !Array.isArray(formData)) return [];
  return formData.filter(id => Number.isInteger(id) && id > 0);
};

// Generate default social links structure
const generateDefaultSocialLinks = () => {
  return {
    twitter: '',
    github: '',
    linkedin: '',
    portfolio: '',
    youtube: ''
  };
};

// Clean empty social links
const cleanSocialLinks = (socialLinks) => {
  if (!socialLinks) return null;
  
  const cleaned = {};
  Object.entries(socialLinks).forEach(([platform, url]) => {
    if (url && url.trim()) {
      cleaned[platform] = url.trim();
    }
  });
  
  return Object.keys(cleaned).length > 0 ? cleaned : null;
};

// Create trainer profile form data structure
const createTrainerProfileFormData = (formData, selectedSpecialityIds) => {
  return {
    email: formData.email,
    specialities: selectedSpecialityIds,
    total_years_teaching: formData.total_years_teaching || undefined,
    bio: formData.bio || undefined,
    linkedin_url: formData.linkedin_url || undefined,
    expertise: formData.expertise || undefined,
    profile_image: formData.profile_image || undefined,
    website: formData.website || undefined,
    social_links: cleanSocialLinks(formData.social_links) || undefined
  };
};

// Update trainer profile form data structure
const updateTrainerProfileFormData = (formData, selectedSpecialityIds) => {
  const updateData = {};
  
  if (selectedSpecialityIds && selectedSpecialityIds.length > 0) {
    updateData.specialities = selectedSpecialityIds;
  }
  if (formData.total_years_teaching !== undefined) {
    updateData.total_years_teaching = formData.total_years_teaching;
  }
  if (formData.bio !== undefined) {
    updateData.bio = formData.bio;
  }
  if (formData.linkedin_url !== undefined) {
    updateData.linkedin_url = formData.linkedin_url;
  }
  if (formData.expertise !== undefined) {
    updateData.expertise = formData.expertise;
  }
  if (formData.profile_image !== undefined) {
    updateData.profile_image = formData.profile_image;
  }
  if (formData.website !== undefined) {
    updateData.website = formData.website;
  }
  if (formData.social_links !== undefined) {
    updateData.social_links = cleanSocialLinks(formData.social_links);
  }
  
  return updateData;
};
```
