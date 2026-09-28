# Trainer API Endpoints

This document outlines all endpoints for the `/api/trainers` module. These endpoints are used for managing trainer profiles and their specialities. Access to most endpoints is restricted to admin and super admin roles.

---

## Trainer Profile Endpoints (Admin/Super Admin Only)

### 1. Create Trainer Profile
- **Method:** POST
- **Endpoint:** `/api/trainers`
- **Description:**
  Creates a new trainer profile. An admin provides the user's email, and the system assigns the trainer role and creates the associated profile with the provided details.

---

### 2. Update Trainer Profile
- **Method:** PUT
- **Endpoint:** `/api/trainers/:profileId`
- **Description:**
  Updates an existing trainer profile identified by its unique `profileId`. Admins can modify details such as bio, expertise, and specialities.

---

### 3. Get All Trainer Profiles
- **Method:** GET
- **Endpoint:** `/api/trainers`
- **Description:**
  Retrieves a list of all trainer profiles (both active and inactive), including their user details and assigned specialities.

---

### 4. Get Trainer Profile by User ID
- **Method:** GET
- **Endpoint:** `/api/trainers/user/:userId`
- **Description:**
  Retrieves the trainer profile associated with a specific `userId`. This is useful for finding a trainer's profile when you have their user account ID.

---

### 5. Get Trainer Profile by Profile ID
- **Method:** GET
- **Endpoint:** `/api/trainers/:profileId`
- **Description:**
  Retrieves a single, detailed trainer profile using its unique `profileId`.

---

### 6. Deactivate Trainer Profile (Soft Delete)
- **Method:** DELETE
- **Endpoint:** `/api/trainers/:profileId`
- **Description:**
  Deactivates a trainer profile, marking it as inactive. This is a soft delete, so the data is preserved and can be reactivated later.

---

### 7. Reactivate Trainer Profile
- **Method:** PUT
- **Endpoint:** `/api/trainers/:profileId/activate`
- **Description:**
  Reactivates a previously deactivated trainer profile, making it active again.

---

### 8. Permanently Delete Trainer Profile (Super Admin Only)
- **Method:** DELETE
- **Endpoint:** `/api/trainers/:profileId/permanent`
- **Description:**
  **Danger:** Permanently deletes a trainer profile and all associated data. This action is irreversible and requires super admin privileges.

---

## Specialities Management Endpoints

### 9. Get All Specialities
- **Method:** GET
- **Endpoint:** `/api/trainers/specialities`
- **Description:**
  Retrieves a list of all available specialities. This is accessible to any authenticated user and is used to populate options for assigning specialities to trainers.

---

### 10. Create Speciality (Admin/Super Admin Only)
- **Method:** POST
- **Endpoint:** `/api/trainers/specialities`
- **Description:**
  Creates a new speciality that can be assigned to trainer profiles.

---

### 11. Update Speciality (Admin/Super Admin Only)
- **Method:** PUT
- **Endpoint:** `/api/trainers/specialities/:id`
- **Description:**
  Updates the name of an existing speciality identified by its `id`.

---

### 12. Delete Speciality (Admin/Super Admin Only)
- **Method:** DELETE
- **Endpoint:** `/api/trainers/specialities/:id`
- **Description:**
  Deletes an existing speciality. Note that this may affect trainer profiles that are currently assigned this speciality.

---

## Notes
- All endpoints require authentication (Bearer token).
- Role-based access is enforced as described for each endpoint.
- For detailed request/response schemas, refer to the Swagger documentation or DTO definitions in the codebase.
