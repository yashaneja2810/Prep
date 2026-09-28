# Learner API Endpoints

This document describes all endpoints available in the `/api/learners` module, including their HTTP method, full path, and a description of their functionality. Endpoints are grouped by access level (Learner or Admin) and include notes on required roles or privileges.

---

## Learner Endpoints (Require Learner Role)

### 1. Check Profile Completeness
- **Method:** GET
- **Endpoint:** `/api/learners/completeness`
- **Description:**
  Checks the completeness status of the authenticated learner's profile. Returns missing fields, completion percentage, and a message indicating what is incomplete.

---

### 2. Get Current Learner Profile
- **Method:** GET
- **Endpoint:** `/api/learners/learner/me`
- **Description:**
  Retrieves the complete profile of the currently authenticated learner, including user info and either student or professional details based on learner type.

---

### 3. Update Current Learner Profile
- **Method:** PUT
- **Endpoint:** `/api/learners/learner/me`
- **Description:**
  Updates the profile of the authenticated learner. The request body must include the correct details based on `learner_type` (student or professional). Validates required fields and updates the profile accordingly.

---

## Admin Endpoints (Require Admin or Super Admin Role)

### 4. Add Learner
- **Method:** POST
- **Endpoint:** `/api/learners`
- **Description:**
  Admin adds a learner by email. Assigns the learner role to the user and creates a learner profile. Fails if the user does not exist or already has the learner role.

---

### 5. Add Multiple Learners (Batch)
- **Method:** POST
- **Endpoint:** `/api/learners/batch`
- **Description:**
  Admin adds multiple learners by providing an array of emails. Each email is processed individually, and the response includes the status for each addition (success or failure).

---

### 6. Get All Learner Profiles
- **Method:** GET
- **Endpoint:** `/api/learners`
- **Description:**
  Retrieves all learner profiles, including user information and profile completeness status. For admin viewing only.

---

### 7. Get Specific Learner Profile by User ID
- **Method:** GET
- **Endpoint:** `/api/learners/learner/:userId`
- **Description:**
  Retrieves the complete profile of a specific learner by their user ID. Includes detailed profile information and completeness status. For admin viewing only.

---

### 8. Get All Learner Users (with Filtering & Pagination)
- **Method:** GET
- **Endpoint:** `/api/learners/users`
- **Description:**
  Retrieves all users with the learner role. Supports pagination and filtering via query parameters. Requires admin privileges.

---

### 9. Deactivate Learner (Soft Delete)
- **Method:** PUT
- **Endpoint:** `/api/learners/:userId/deactivate`
- **Description:**
  Deactivates (soft deletes) the learner role for the specified user. The user remains in the system but is no longer an active learner. Requires admin privileges.

---

### 10. Reactivate Learner
- **Method:** PUT
- **Endpoint:** `/api/learners/:userId/activate`
- **Description:**
  Reactivates a previously deactivated learner role for the specified user. Requires admin privileges.

---

### 11. Permanently Delete Learner (Dangerous)
- **Method:** DELETE
- **Endpoint:** `/api/learners/:userId`
- **Description:**
  **Danger:** Permanently deletes the learner role and all associated data for the specified user. This action cannot be undone. Only accessible by super admins. Super admins cannot delete their own learner role.

---

## Notes
- All endpoints require authentication (Bearer token).
- Role-based access is enforced: endpoints are restricted to learners, admins, or super admins as described above.
- For detailed request/response schemas, refer to the Swagger documentation or DTO definitions in the codebase.
