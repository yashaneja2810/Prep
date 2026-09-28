/**
 * Centralized string constants for GamutX LMS Backend
 * Following Task 1.1 requirements from tasks.md
 */

// Database table names
export enum TABLES {
  TOPICS = 'topics',
  DOCS = 'docs',
  NOTES = 'notes',
  CPS = 'cps',
  APS = 'aps',
  USERS = 'users',
  PROGRAMS = 'programs',
  PROGRAM_INSTRUCTORS = 'program_instructors',
  PROGRAM_MODULES = 'program_modules',
  MODULES = 'modules',
  MODULE_TOPICS = 'module_topics',
  DOCUMENTS = 'documents',
  VIDEOS = 'videos',
  ASSESSMENTS = 'assessments',
  PPT = 'ppt',
  OUTCOMES = 'outcomes',
  OBJECTIVE = 'objectives',
  OBJECTIVE_HEADINGS = 'objective_headings',
  OBJECTIVE_ITEMS = 'objective_items',
  OUTCOME_HEADINGS = 'outcome_headings',
  OUTCOME_ITEMS = 'outcome_items',
  ORGANIZATION_USERS = 'organization_users',
  // Cohort-related tables
  COHORTS = 'cohorts',
  COHORT_TRAINERS = 'cohort_trainers',
  COHORT_LEARNERS = 'cohort_learners',
  LEARNER_PROGRAMS = 'learner_programs',
  ORGANIZATIONS = 'organizations',
}

// Authentication-specific table names
export enum AUTH_TABLES {
  USERS = 'users',
  ROLES = 'roles',
  USER_ROLES = 'user_roles',
  ORGANIZATIONS = 'organizations',
  ORGANIZATION_USERS = 'organization_users',
  LEARNER_PROFILES = 'learner_profiles',
  TRAINER_PROFILES = 'trainer_profiles',
  ADMIN_PROFILES = 'admin_profiles',
  LEARNER_STUDENT_DETAILS = 'learner_student_details',
  LEARNER_PROFESSIONAL_DETAILS = 'learner_professional_details',
  SPECIALITIES = 'specialities',
  TRAINER_SPECIALITIES = 'trainer_specialities',
}

// Database column names
export enum COLUMNS {
  // Common columns
  ID = 'id',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',

  // Topic-specific columns
  TOPIC_CODE = 'topic_code',
  TOPIC_ID = 'topic_id',
  NAME = 'name',
  TITLE = 'title',
  DESCRIPTION = 'description',
  STATUS = 'status',

  // Program-specific columns
  PROGRAM_CODE = 'program_code',
  PROGRAM_ID = 'program_id',

  // Module-specific columns
  MODULE_CODE = 'module_code',
  MODULE_TITLE = 'module_title',
  MODULE_NAME = 'module_name',
  MODULE_ID = 'module_id',

  // Instructor columns
  INSTRUCTOR_ID = 'instructor_id',

  // Objective/Outcome columns
  HEADING_ID = 'heading_id',
  OBJECTIVE_ID = 'objective_id',
  OUTCOME_ID = 'outcome_id',

  // Program details
  PREREQUISITES = 'prerequisites',
  THUMBNAIL = 'thumbnail',
  DURATION = 'duration',
  LEVEL = 'level',

  // Video columns
  URL = 'url',
  TRANSCRIPT = 'transcript',
  SUMMARY = 'summary',
  TIMESTAMPS = 'timestamps',

  // Content columns
  HEADING = 'heading',
  TEXT = 'text',

  // User columns
  EMAIL = 'email',
  USERNAME = 'username',
  FIRST_NAME = 'first_name',
  LAST_NAME = 'last_name',
  PREFERRED_NAME = 'preferred_name',
  PHONE = 'phone',
  DATE_OF_BIRTH = 'date_of_birth',
  TIMEZONE = 'timezone',
  EMAIL_VERIFIED = 'email_verified',
  IS_ACTIVE = 'is_active',
  DELETED_AT = 'deleted_at',
  LAST_SIGN_IN_AT = 'last_sign_in_at',

  // Other common columns
  CODE = 'code',
  OUTPUT = 'output',
  EXPLANATION = 'explanation',
  DIFFICULTY = 'difficulty',
  CONTENT = 'content',
  FILE_URL = 'file_url',

  // Organization-specific columns
  ORG_NAME = 'org_name',
  ORG_ID = 'org_id',
  TYPE = 'type',
  COUNTRY = 'country',
  IS_CURRENTLY_HIRING = 'is_currently_hiring',

  // Profile-specific columns
  USER_ID = 'user_id',
  LEARNER_TYPE = 'learner_type',
  GOALS_TEXT = 'goals_text',
  COLLEGE_NAME = 'college_name',
  DEGREE_COURSE = 'degree_course',
  EXPECTED_GRAD_YEAR = 'expected_grad_year',
  CURRENT_GPA = 'current_gpa',
  COMPANY_NAME = 'company_name',
  JOB_TITLE = 'job_title',
  YEARS_OF_EXPERIENCE = 'years_of_experience',
  INDUSTRY = 'industry',
  SKILLS = 'skills',
  TOTAL_YEARS_TEACHING = 'total_years_teaching',
  BIO = 'bio',
  LINKEDIN_URL = 'linkedin_url',
  EXPERTISE = 'expertise',
  PROFILE_IMAGE = 'profile_image',
  WEBSITE = 'website',
  SOCIAL_LINKS = 'social_links',
  ADMIN_LEVEL = 'admin_level',
  PERMISSIONS = 'permissions',
  DEPARTMENT = 'department',
  LEARNER_ID = 'learner_id',
  TRAINER_PROFILE_ID = 'trainer_profile_id',
  SPECIALITY_ID = 'speciality_id',
  ROLE_ID = 'role_id',
}

// Database query constants
export enum QUERY {
  // Select options
  SELECT_ALL = '*',

  // Order directions
  ASC = 'asc',
  DESC = 'desc',

  // Limit values
  SINGLE_RECORD = 1,
}

// Join table select patterns
export enum SELECT_PATTERNS {
  // Trainer profile with user data
  TRAINER_WITH_USER = `
    *,
    users!trainer_profiles_user_id_fkey (
      first_name,
      email
    )
  `,

  // Trainer specialities with speciality data
  TRAINER_SPECIALITIES = `
    specialities:speciality_id (
      id,
      name
    )
  `,
}

// Query options for Supabase ordering
export const ORDER_OPTIONS = {
  ASCENDING: { ascending: true },
  DESCENDING: { ascending: false },
} as const;

// Common error and success messages
export enum MESSAGES {
  // General messages
  SUCCESS = 'Success',
  CREATED = 'Resource created successfully',
  UPDATED = 'Resource updated successfully',
  DELETED = 'Resource deleted successfully',

  // Error messages
  NOT_FOUND = 'Resource not found',
  BAD_REQUEST = 'Bad request',
  SERVER_ERROR = 'Internal server error',
  VALIDATION_FAILED = 'Validation failed',

  // User-specific messages
  USER_ALREADY_EXISTS = 'User already exists',

  // Topic-specific messages
  TOPIC_NOT_FOUND = 'Topic not found',
  TOPIC_CREATE_ERROR = 'Failed to create topic',
  TOPIC_UPDATE_ERROR = 'Failed to update topic',
  TOPIC_DELETE_ERROR = 'Failed to delete topic',

  // Document-specific messages
  DOCUMENT_NOT_FOUND = 'Document not found',
  DOCUMENT_CREATE_ERROR = 'Failed to create document',
  DOCUMENT_UPDATE_ERROR = 'Failed to update document',
  DOCUMENT_DELETE_ERROR = 'Failed to delete document',

  // Note-specific messages
  NOTE_NOT_FOUND = 'Note not found',
  NOTE_CREATE_ERROR = 'Failed to create note',
  NOTE_UPDATE_ERROR = 'Failed to update note',
  NOTE_DELETE_ERROR = 'Failed to delete note',

  // Image-specific messages
  IMAGE_UPLOAD_ERROR = 'Failed to upload image',
  IMAGE_DELETE_ERROR = 'Failed to delete image',
  IMAGE_INVALID_FILE_TYPE = 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed',
  IMAGE_SIZE_EXCEEDED = 'Image size exceeds the maximum allowed limit of 5MB',

  // PPT-specific messages
  PPT_NOT_FOUND = 'Presentation not found',
  PPT_CREATE_ERROR = 'Failed to create presentation',
  PPT_UPDATE_ERROR = 'Failed to update presentation',
  PPT_DELETE_ERROR = 'Failed to delete presentation',
  PPT_DELETED = 'Presentation deleted successfully',
  PPT_UPLOAD_ERROR = 'Failed to upload presentation file',
  PPT_INVALID_FILE_TYPE = 'Invalid file type. Only PDF and PowerPoint files are allowed',

  // Video-specific messages
  VIDEO_NOT_FOUND = 'Video not found',
  VIDEO_CREATE_ERROR = 'Failed to create video',
  VIDEO_UPDATE_ERROR = 'Failed to update video',
  VIDEO_DELETE_ERROR = 'Failed to delete video',
  VIDEO_DELETED = 'Video deleted successfully',
  VIDEO_UPLOAD_ERROR = 'Failed to upload video file',
  VIDEO_INVALID_FILE_TYPE = 'Invalid file type. Only MP4, WebM, OGG, and QuickTime video formats are allowed',

  // CP-specific messages
  CP_NOT_FOUND = 'Concept Practice not found',
  CP_CREATE_ERROR = 'Failed to create concept practice',
  CP_UPDATE_ERROR = 'Failed to update concept practice',
  CP_DELETE_ERROR = 'Failed to delete concept practice',
  CP_BATCH_CREATE_SUCCESS = 'Batch concept practices created successfully',
  CP_INVALID_DIFFICULTY = 'Invalid difficulty level for CP. Must be easy, medium, or hard',
  CP_INVALID_TOPIC = 'Invalid topic ID provided for CP',

  // AP-specific messages
  AP_NOT_FOUND = 'Application Problem not found',
  AP_CREATE_ERROR = 'Failed to create application problem',
  AP_UPDATE_ERROR = 'Failed to update application problem',
  AP_DELETE_ERROR = 'Failed to delete application problem',
  AP_INVALID_DIFFICULTY = 'Invalid difficulty level for AP. Must be easy, medium, or hard',
  AP_INVALID_TOPIC = 'Invalid topic ID provided for AP',

  // Objective-specific messages
  OBJECTIVE_NOT_FOUND = 'Objective not found',
  OBJECTIVE_CREATE_ERROR = 'Failed to create objective',
  OBJECTIVE_UPDATE_ERROR = 'Failed to update objective',
  OBJECTIVE_DELETE_ERROR = 'Failed to delete objective',

  // Outcome-specific messages
  OUTCOME_NOT_FOUND = 'Outcome not found',
  OUTCOME_CREATE_ERROR = 'Failed to create outcome',
  OUTCOME_UPDATE_ERROR = 'Failed to update outcome',
  OUTCOME_DELETE_ERROR = 'Failed to delete outcome',

  // Auth-specific messages
  LOGIN_SUCCESS = 'Login successful',
  LOGOUT_SUCCESS = 'Logout successful',
  REGISTER_SUCCESS = 'Registration successful',
  PROFILE_UPDATED = 'Profile updated successfully',
  ROLE_ASSIGNED = 'Role assigned successfully',
  INVALID_CREDENTIALS = 'Invalid credentials',
  USER_NOT_FOUND = 'User not found',
  EMAIL_ALREADY_EXISTS = 'Email already exists',
  UNAUTHORIZED = 'Unauthorized access',
  FORBIDDEN = 'Access forbidden',
  SESSION_EXPIRED = 'Session expired',
  PROFILE_INCOMPLETE = 'Please complete your profile',
  ORGANIZATION_ADDED = 'User added to organization successfully',
  SIGNUP_SUCCESS = 'User registered successfully',
  TOKEN_INVALID = 'Invalid token',
  TOKEN_EXPIRED = 'Token expired',

  // Trainer profile specific messages
  TRAINER_PROFILE_CREATED = 'Trainer profile created successfully',
  TRAINER_PROFILE_UPDATED = 'Trainer profile updated successfully',
  TRAINER_PROFILE_DEACTIVATED = 'Trainer profile deactivated successfully',
  TRAINER_PROFILE_REACTIVATED = 'Trainer profile reactivated successfully',
  TRAINER_PROFILE_PERMANENTLY_DELETED = 'Trainer profile permanently deleted',
  TRAINER_PROFILE_NOT_FOUND = 'Trainer profile not found',
  TRAINER_PROFILE_EXISTS = 'Trainer profile already exists for this user',
  TRAINER_PROFILE_ALREADY_ACTIVE = 'Trainer profile is already active',
  TRAINER_EMAIL_NOT_VERIFIED = 'User email is not verified. Please verify email before creating trainer profile',
  TRAINER_USER_INACTIVE = 'User account is not active',
  INVALID_SPECIALITY_ID = 'Invalid speciality ID provided',
  SPECIALITIES_REQUIRED = 'At least one speciality must be selected',

  // Specialities specific messages
  SPECIALITIES_RETRIEVED = 'Specialities retrieved successfully',
  SPECIALITY_CREATED = 'Speciality created successfully',
  SPECIALITY_UPDATED = 'Speciality updated successfully',
  SPECIALITY_DELETED = 'Speciality deleted successfully',
  SPECIALITY_NOT_FOUND = 'Speciality not found',
  SPECIALITY_EXISTS = 'Speciality already exists',

  // Database errors
  DB_CONNECTION_ERROR = 'Database connection error',
  DB_QUERY_ERROR = 'Database query error',

  // Learner management messages
  LEARNER_ADDED = 'Learner added successfully',
  LEARNER_REMOVED = 'Learner removed successfully',
  LEARNER_DEACTIVATED = 'Learner deactivated successfully',
  LEARNER_REACTIVATED = 'Learner reactivated successfully',
  LEARNER_PERMANENTLY_DELETED = 'Learner permanently removed - THIS ACTION CANNOT BE UNDONE',
  PROFILE_COMPLETE = 'Profile is complete',
  ALREADY_HAS_ROLE = 'User already has this role',
  LEARNER_ROLE_NOT_FOUND = 'Learner role not found or already inactive',
  LEARNER_USERS_RETRIEVED = 'Learner users retrieved successfully',

  // Organization management messages
  ORGANIZATION_CREATED = 'Organization created successfully',
  ORGANIZATION_UPDATED = 'Organization updated successfully',
  ORGANIZATION_DELETED = 'Organization deleted successfully',
  ORGANIZATION_ACTIVATED = 'Organization activated successfully',
  ORGANIZATION_DEACTIVATED = 'Organization deactivated successfully',
  ORGANIZATION_NOT_FOUND = 'Organization not found',
  ORGANIZATION_CODE_EXISTS = 'Organization code already exists',
  ORGANIZATION_NAME_EXISTS = 'Organization name already exists',
  ORGANIZATIONS_RETRIEVED = 'Organizations retrieved successfully',
  
  // Organization-user relationship messages
  USER_ADDED_TO_ORGANIZATION = 'User added to organization successfully',
  USER_REMOVED_FROM_ORGANIZATION = 'User removed from organization successfully',
  USER_DEACTIVATED_IN_ORGANIZATION = 'User deactivated in organization successfully',
  USER_ACTIVATED_IN_ORGANIZATION = 'User reactivated in organization successfully',
  USER_ALREADY_IN_ORGANIZATION = 'User is already in an organization',
  USER_NOT_IN_ORGANIZATION = 'User is not in this organization',
  USER_NOT_IN_SPECIFIED_ORGANIZATION = 'User is not in the specified organization',
  ORGANIZATION_USERS_RETRIEVED = 'Organization users retrieved successfully',
  
  // Bulk operation messages
  BULK_OPERATION_COMPLETED = 'Bulk operation completed successfully',
  BULK_ADD_USERS_COMPLETED = 'Bulk add users operation completed',
  BULK_REMOVE_USERS_COMPLETED = 'Bulk remove users operation completed',
  
  // Organization validation messages
  ORGANIZATION_TYPE_INVALID = 'Invalid organization type. Must be hiring or training',
  HIRING_ORG_REQUIRES_HIRING_FLAG = 'Hiring organizations must specify is_currently_hiring field',
  TRAINING_ORG_CANNOT_HAVE_HIRING_FLAG = 'Training organizations cannot have is_currently_hiring field',
  ORGANIZATION_HAS_USERS = 'Cannot delete organization with existing users',
  ORGANIZATION_CODE_REQUIRED = 'Organization code is required',
  ORGANIZATION_NAME_REQUIRED = 'Organization name is required',
}

// Environment variable names
export enum ENV {
  // Server configuration
  NODE_ENV = 'NODE_ENV',
  PORT = 'PORT',
  API_PREFIX = 'API_PREFIX',

  // Supabase configuration
  SUPABASE_URL = 'SUPABASE_URL',
  SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY',
  SUPABASE_SERVICE_ROLE_KEY = 'SUPABASE_SERVICE_ROLE_KEY',

  // JWT configuration
  JWT_SECRET = 'JWT_SECRET',
  JWT_EXPIRATION = 'JWT_EXPIRATION',

  // Frontend configuration
  FRONTEND_URL = 'FRONTEND_URL',

  // Cookie configuration
  COOKIE_LIFETIME = 'COOKIE_LIFETIME',
  COOKIE_SECRET = 'COOKIE_SECRET',
}

// Status values for entities
export enum STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// Difficulty levels for CPs
export enum DIFFICULTY {
  EASY = 'easy',
  INTERMEDIATE = 'intermediate',
  HARD = 'hard',
}

// User roles
export enum USER_ROLES {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  TRAINER = 'trainer',
  LEARNER = 'learner',
  VISITOR = 'visitor',
}

// Role IDs (matching roles_rows.csv)
export enum ROLE_IDS {
  ADMIN = 1,
  SUPER_ADMIN = 2,
  TRAINER = 3,
  LEARNER = 4,
  VISITOR = 5,
}

// Learner types
export enum LEARNER_TYPES {
  STUDENT = 'student',
  PROFESSIONAL = 'professional',
}

// Learner status
export enum LEARNER_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// Admin levels
export enum ADMIN_LEVELS {
  GLOBAL = 'global',
  ORGANIZATION = 'organization',
  PROGRAM = 'program',
}

// Organization type enum - must match database enum
export enum ORGANIZATION_TYPES {
  HIRING = 'hiring',
  TRAINING = 'training',
}

// Organization-specific table names
export enum ORGANIZATION_TABLES {
  ORGANIZATIONS = 'organizations',
  ORGANIZATION_USERS = 'organization_users',
}

// Cookie configuration
export enum COOKIES {
  ACCESS_TOKEN = 'sb-access-token',
  REFRESH_TOKEN = 'sb-refresh-token',
  MAX_AGE = 604800000, // 7 days in milliseconds
}

// Node environment values
export enum NODE_ENV {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

// HTTP status codes for consistency
export enum HTTP_STATUS {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
}

// Cookie configuration
export const COOKIE_CONFIG = {
  JWT_COOKIE_NAME: 'jwt_token',
  HTTP_ONLY: true,
  SECURE: true, // Set to true in production
  SAME_SITE: 'strict' as const,
  DEFAULT_MAX_AGE: 604800, // 7 days in seconds
} as const;

// CORS configuration
export const CORS_CONFIG = {
  DEFAULT_METHODS: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  CREDENTIALS: true,
} as const;

// API response structure constants
export enum RESPONSE_KEYS {
  STATUS_CODE = 'statusCode',
  SUCCESS = 'success',
  MESSAGE = 'message',
  DATA = 'data',
  TIMESTAMP = 'timestamp',
  PATH = 'path',
  USER = 'user',
  SESSION = 'session',
  PROFILE_COMPLETED = 'profileCompleted',
}

// Module status enum
export enum MODULE_STATUS {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

// Program status enum
export enum PROGRAM_STATUS {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

// Program level enum
export enum PROGRAM_LEVEL {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

// Topic status enum
export enum TOPIC_STATUS {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export enum SWAGGER_CONFIG {
  API_ROUTES = 'api/docs',
  API_PREFIX = 'api',
  DOCS_PREFIX = 'docs',
}

// Authentication metadata keys
export enum AUTH_METADATA {
  IS_PUBLIC = 'isPublic',
  ROLES = 'roles',
  ORGANIZATION = 'organization',
}

// Database error codes
export enum DB_ERROR_CODES {
  NO_ROWS_RETURNED = 'PGRST116',
  UNIQUE_CONSTRAINT_VIOLATION = '23505',
  FOREIGN_KEY_VIOLATION = '23503',
  NOT_NULL_VIOLATION = '23502',
}

// API endpoints
export enum API_ENDPOINTS {
  PROFILES = 'profiles',
  LEARNER = 'learner',
  LEARNERS = 'learners',
  TRAINER = 'trainer',
  ADMIN = 'admin',
  SPECIALITIES = 'specialities',
  ACTIVATE = 'activate',
  PERMANENT = 'permanent',
  PROFILE = 'profile',
  USER = 'user',
  COMPLETENESS = 'completeness',
}

// API endpoint parameters
export enum API_PARAMS {
  USER_ID = 'userId',
  PROFILE_ID = 'profileId',
  SPECIALITY_ID = 'specialityId',
  PROFILE_TYPE = 'profileType',
}

// Profile type literals
export enum PROFILE_TYPES {
  LEARNER = 'learner',
  TRAINER = 'trainer',
  ADMIN = 'admin',
}

// API operation summaries
export enum API_SUMMARIES {
  CREATE_LEARNER_PROFILE = 'Create learner profile',
  UPDATE_LEARNER_PROFILE = 'Update learner profile',
  GET_LEARNER_PROFILE = 'Get learner profile',
  GET_LEARNER_PROFILE_BY_USER_ID = 'Get learner profile by user ID (Admin only)',

  CREATE_TRAINER_PROFILE = 'Create trainer profile (Admin only)',
  UPDATE_TRAINER_PROFILE = 'Update trainer profile (Admin only)',
  GET_ALL_TRAINER_PROFILES = 'Get all trainer profiles with user details (Admin only)',
  GET_TRAINER_PROFILES_BY_USER_ID = 'Get trainer profiles by user ID with user details (Admin only)',
  GET_TRAINER_PROFILE_BY_ID = 'Get trainer profile by ID with user details (Admin only)',
  DELETE_TRAINER_PROFILE = 'Deactivate trainer profile by ID (Admin only)',
  REACTIVATE_TRAINER_PROFILE = 'Reactivate trainer profile by ID (Admin only)',
  PERMANENTLY_DELETE_TRAINER_PROFILE = '⚠️ PERMANENTLY DELETE trainer profile by ID (Super Admin only)',

  CREATE_ADMIN_PROFILE = 'Create admin profile (Super Admin only)',
  UPDATE_ADMIN_PROFILE = 'Update admin profile',
  GET_ADMIN_PROFILE = 'Get admin profile',
  GET_ADMIN_PROFILE_BY_USER_ID = 'Get admin profile by user ID (Super Admin only)',

  GET_PROFILE_BY_USER_ID_AND_TYPE = 'Get profile by user ID and type (Admin only)',

  GET_ALL_SPECIALITIES = 'Get all specialities',
  CREATE_SPECIALITY = 'Create new speciality (Admin only)',
  UPDATE_SPECIALITY = 'Update speciality (Admin only)',
  DELETE_SPECIALITY = 'Delete speciality (Admin only)',
}

// API descriptions
export enum API_DESCRIPTIONS {
  CREATE_LEARNER_PROFILE = 'Creates a new learner profile for the authenticated user with conditional validation based on learner type (student/professional)',
  UPDATE_LEARNER_PROFILE = 'Updates the learner profile for the authenticated user',
  GET_LEARNER_PROFILE = 'Retrieves the learner profile for the authenticated user',
  GET_LEARNER_PROFILE_BY_USER_ID = 'Retrieves a learner profile by user ID - requires admin privileges',

  CREATE_TRAINER_PROFILE = 'Creates a new trainer profile for a user by email with selected specialities - requires admin privileges. The user must be registered and have verified email.',
  UPDATE_TRAINER_PROFILE = 'Updates a trainer profile by ID including specialities - requires admin privileges',
  GET_ALL_TRAINER_PROFILES = 'Retrieves all trainer profiles (active and inactive) with user information, specialities, and status - requires admin privileges. Returns trainers with is_active field indicating their status.',
  GET_TRAINER_PROFILES_BY_USER_ID = 'Retrieves all trainer profiles for a user ID with user information including first_name and email - requires admin privileges',
  GET_TRAINER_PROFILE_BY_ID = 'Retrieves a specific trainer profile by its ID with user information including first_name and email - requires admin privileges',
  DELETE_TRAINER_PROFILE = 'Deactivates a specific trainer profile by setting it as inactive - requires admin privileges. This is a soft delete that preserves data while making the trainer inactive.',
  REACTIVATE_TRAINER_PROFILE = 'Reactivates a previously deactivated trainer profile by setting it as active - requires admin privileges. This restores access for the trainer.',
  PERMANENTLY_DELETE_TRAINER_PROFILE = '⚠️ DANGER: This PERMANENTLY DELETES the trainer profile and all associated data from the database. This action CANNOT be undone. Use the regular DELETE endpoint for safe deactivation instead. Requires super admin privileges.',

  CREATE_ADMIN_PROFILE = 'Creates a new admin profile for the authenticated user - requires super admin privileges',
  UPDATE_ADMIN_PROFILE = 'Updates the admin profile for the authenticated user - requires admin privileges',
  GET_ADMIN_PROFILE = 'Retrieves the admin profile for the authenticated user - requires admin privileges',
  GET_ADMIN_PROFILE_BY_USER_ID = 'Retrieves an admin profile by user ID - requires super admin privileges',

  GET_PROFILE_BY_USER_ID_AND_TYPE = 'Universal endpoint to retrieve any profile type by user ID - requires admin privileges',

  GET_ALL_SPECIALITIES = 'Retrieves all available specialities for trainer profile creation and management',
  CREATE_SPECIALITY = 'Creates a new speciality option for trainer profiles - requires admin privileges',
  UPDATE_SPECIALITY = 'Updates an existing speciality - requires admin privileges',
  DELETE_SPECIALITY = 'Deletes a speciality - requires admin privileges. Note: This will affect existing trainer profiles that use this speciality.',
}

// API response descriptions
export enum API_RESPONSE_DESCRIPTIONS {
  LEARNER_PROFILE_CREATED = 'Learner profile created successfully',
  LEARNER_PROFILE_UPDATED = 'Learner profile updated successfully',
  LEARNER_PROFILE_RETRIEVED = 'Learner profile retrieved successfully',
  LEARNER_PROFILE_NOT_FOUND = 'Learner profile not found',
  LEARNER_PROFILE_EXISTS = 'Learner profile already exists',

  TRAINER_PROFILE_CREATED = 'Trainer profile created successfully',
  TRAINER_PROFILE_UPDATED = 'Trainer profile updated successfully',
  TRAINER_PROFILES_RETRIEVED = 'All trainer profiles with user details retrieved successfully',
  TRAINER_PROFILE_RETRIEVED = 'Trainer profile with user details retrieved successfully',
  TRAINER_PROFILE_DEACTIVATED = 'Trainer profile deactivated successfully',
  TRAINER_PROFILE_REACTIVATED = 'Trainer profile reactivated successfully',
  TRAINER_PROFILE_PERMANENTLY_DELETED = '⚠️ Trainer profile permanently deleted - THIS ACTION CANNOT BE UNDONE',
  TRAINER_PROFILE_NOT_FOUND = 'Trainer profile not found',
  TRAINER_PROFILE_EXISTS = 'Trainer profile already exists for this user',
  TRAINER_PROFILE_ALREADY_ACTIVE = 'Trainer profile is already active',

  ADMIN_PROFILE_CREATED = 'Admin profile created successfully',
  ADMIN_PROFILE_UPDATED = 'Admin profile updated successfully',
  ADMIN_PROFILE_RETRIEVED = 'Admin profile retrieved successfully',
  ADMIN_PROFILE_NOT_FOUND = 'Admin profile not found',
  ADMIN_PROFILE_EXISTS = 'Admin profile already exists',

  PROFILE_RETRIEVED = 'Profile retrieved successfully',

  SPECIALITIES_RETRIEVED = 'Specialities retrieved successfully',
  SPECIALITY_CREATED = 'Speciality created successfully',
  SPECIALITY_UPDATED = 'Speciality updated successfully',
  SPECIALITY_DELETED = 'Speciality deleted successfully',

  UNAUTHORIZED = 'Unauthorized',
  FORBIDDEN_ADMIN_REQUIRED = 'Forbidden - Admin access required',
  FORBIDDEN_SUPER_ADMIN_REQUIRED = 'Forbidden - Super Admin access required',
  BAD_REQUEST = 'Invalid input data',
  INVALID_PROFILE_TYPE = 'Invalid profile type',
}

// Log messages
export enum LOG_MESSAGES {
  CREATING_LEARNER_PROFILE = 'Creating learner profile for user:',
  UPDATING_LEARNER_PROFILE = 'Updating learner profile for user:',
  FETCHING_LEARNER_PROFILE = 'Fetching learner profile for user:',
  ADMIN_FETCHING_LEARNER_PROFILE = 'Admin fetching learner profile for user:',

  ADMIN_CREATING_TRAINER_PROFILE = 'Admin creating trainer profile for email:',
  ADMIN_UPDATING_TRAINER_PROFILE = 'Admin updating trainer profile with ID:',
  ADMIN_FETCHING_ALL_TRAINER_PROFILES = 'Admin fetching all trainer profiles (active and inactive) with user details',
  ADMIN_FETCHING_TRAINER_PROFILES_BY_USER = 'Admin fetching trainer profiles with user details for user:',
  ADMIN_FETCHING_TRAINER_PROFILE_BY_ID = 'Admin fetching trainer profile with user details by ID:',
  ADMIN_DEACTIVATING_TRAINER_PROFILE = 'Admin deactivating trainer profile with ID:',
  ADMIN_REACTIVATING_TRAINER_PROFILE = 'Admin reactivating trainer profile with ID:',
  ADMIN_PERMANENTLY_DELETING_TRAINER_PROFILE = 'Super Admin PERMANENTLY DELETING trainer profile with ID:',

  CREATING_ADMIN_PROFILE = 'Creating admin profile for user:',
  UPDATING_ADMIN_PROFILE = 'Updating admin profile for user:',
  FETCHING_ADMIN_PROFILE = 'Fetching admin profile for user:',
  SUPER_ADMIN_FETCHING_ADMIN_PROFILE = 'Super Admin fetching admin profile for user:',

  ADMIN_FETCHING_PROFILE_BY_TYPE = 'Admin fetching profile for user:',

  FETCHING_ALL_SPECIALITIES = 'Fetching all specialities',
  ADMIN_CREATING_SPECIALITY = 'Admin creating speciality:',
  ADMIN_UPDATING_SPECIALITY = 'Admin updating speciality with ID:',
  ADMIN_DELETING_SPECIALITY = 'Admin deleting speciality with ID:',
}
