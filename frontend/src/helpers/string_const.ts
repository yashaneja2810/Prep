// API Endpoints
export enum API_ENDPOINTS {
  // Auth endpoints
  AUTH_REGISTER = '/api/auth/register',
  AUTH_LOGIN = '/api/auth/login',
  AUTH_LOGOUT = '/api/auth/logout',
  AUTH_COMPLETE_PROFILE = '/api/auth/complete-profile',
  AUTH_ME = '/api/auth/me',
  AUTH_REFRESH = '/api/auth/refresh',
  AUTH_ROLE = '/api/auth/role',
  
  // User endpoints
  USERS_ME = '/api/users/me',
  
  // Trainer Profile endpoints
  TRAINER_PROFILES = '/api/trainers',
  TRAINER_PROFILE_BY_ID = '/api/trainers', // {id} will be appended
  GET_TRAINER_PROFILE_BY_USER_ID = '/api/trainers/user', // {userId} will be appended
  UPDATE_TRAINER_PROFILE = '/api/trainers', // {id} will be appended - PUT /api/trainers/:id
  DELETE_TRAINER_PROFILE = '/api/trainers', // {id} will be appended
  REACTIVATE_TRAINER_PROFILE = '/api/trainers', // {id}/activate will be appended
  PERMANENT_DELETE_TRAINER_PROFILE = '/api/trainers', // {id}/permanent will be appended
  
  // Specialities Management Endpoints
  SPECIALITIES = '/api/trainers/specialities',
  SPECIALITY_BY_ID = '/api/trainers/specialities', // {id} will be appended
  
  // Learner endpoints
  LEARNERS = '/api/learners',
  LEARNERS_BATCH = '/api/learners/batch',
  LEARNER_PROFILE = '/api/learners/learner',
  LEARNER_COMPLETENESS = '/api/learners/completeness',
  LEARNER_DEACTIVATE = '/api/learners', // /:userId/deactivate
  LEARNER_ACTIVATE = '/api/learners', // /:userId/activate
  
  // Organizations endpoints
  ORGANIZATIONS = '/api/organizations',
  ORGANIZATIONS_PAGINATION = '/api/organizations/pagination',
  ORGANIZATION_BY_ID = '/api/organizations', // {id} will be appended
  UPDATE_ORGANIZATION = '/api/organizations', // {id} will be appended
  DEACTIVATE_ORGANIZATION = '/api/organizations', // {id}/deactivate will be appended
  ACTIVATE_ORGANIZATION = '/api/organizations', // {id}/activate will be appended
  DELETE_ORGANIZATION = '/api/organizations', // {id} will be appended
  ORGANIZATION_USERS = '/api/organizations', // {id}/users will be appended
  ORGANIZATION_USERS_PAGINATION = '/api/organizations', // {id}/users/pagination will be appended
  ADD_USER_TO_ORGANIZATION = '/api/organizations', // {id}/users will be appended
  BULK_ADD_USERS_TO_ORGANIZATION = '/api/organizations', // {id}/users/bulk-add will be appended

  // Application Problems (APs) endpoints
  APS = '/api/aps',
  APS_BY_TOPIC = '/api/aps/topics', // /:topicId will be appended
  APS_BATCH = '/api/aps/batch',
  AP_BY_ID = '/api/aps', // /:id will be appended

  // Cohort Sessions endpoints
  COHORT_SESSIONS = '/api/cohort-sessions',
  COHORT_SESSION_BY_ID = '/api/cohort-sessions', // /:id will be appended
  SESSION_ATTENDANCE = '/api/cohort-sessions', // /:id/attendance will be appended
  SESSION_SUMMARY = '/api/cohort-sessions', // /:id/summary will be appended
  SESSION_LEARNER_NOTES = '/api/cohort-sessions', // /:id/learner-notes will be appended
  SESSION_RESOURCES = '/api/cohort-sessions', // /:id/resources will be appended

  // Modules endpoints
  MODULES = '/api/modules',
  MODULE_BY_ID = '/api/modules', // /:id will be appended
  MODULE_TOPICS = '/api/modules', // /:id/topics will be appended
  MODULE_TOPIC_REMOVE = '/api/modules', // /:moduleId/topics/:topicId will be appended
  MODULE_TOPICS_REORDER = '/api/modules', // /:id/topics/reorder will be appended

  // Notes endpoints
  NOTES = '/api/notes',
  NOTES_BY_TOPIC = '/api/topics', // /:topicId/notes will be appended
  NOTE_BY_ID = '/api/notes', // /:id will be appended
  NOTE_IMAGE_UPLOAD = '/api/notes/upload-image',
  TOPIC_NOTE_IMAGE_UPLOAD = '/api/topics', // /:topicId/notes/upload-image will be appended
  NOTE_IMAGE_DELETE = '/api/notes/images', // /:fileName will be appended

  // Cohorts endpoints
  COHORTS = '/api/cohorts',
  COHORT_BY_ID = '/api/cohorts', // /:id will be appended
  COHORT_TRAINERS = '/api/cohorts', // /:id/trainers will be appended
  COHORT_LEARNERS = '/api/cohorts', // /:id/learners will be appended

  // Completions endpoints
  COMPLETIONS = '/api/completions',
  TOPIC_COMPLETIONS = '/api/completions/topic',
  CP_COMPLETIONS = '/api/completions/cp',
  OBJECTIVE_COMPLETIONS = '/api/completions/objective',
  OUTCOME_COMPLETIONS = '/api/completions/outcomes',

  // Documents endpoints
  DOCUMENTS = '/api/docs',
  DOCUMENT_BY_ID = '/api/docs', // /:id will be appended
  DOCUMENTS_BY_TOPIC = '/api/topics', // /:topicId/documents will be appended

  // Objectives endpoints
  OBJECTIVES = '/api/objectives',
  OBJECTIVE_BY_ID = '/api/objectives', // /:id will be appended
  OBJECTIVES_BY_TOPIC = '/api/objectives/topic', // /:topicId will be appended
  OBJECTIVE_HEADINGS = '/api/objectives/headings', // /:headingId will be appended
  OBJECTIVE_ITEMS = '/api/objectives/items', // /:itemId will be appended

  // Outcomes endpoints
  OUTCOMES = '/api/outcomes',
  OUTCOME_BY_ID = '/api/outcomes', // /:id will be appended
  OUTCOMES_BY_TOPIC = '/api/outcomes/topic', // /:topicId will be appended
  OUTCOME_HEADINGS = '/api/outcomes/headings', // /:headingId will be appended
  OUTCOME_ITEMS = '/api/outcomes/items', // /:itemId will be appended

  // Points endpoints
  USER_POINTS = '/api/points/me',
  USER_POINTS_BY_ID = '/api/points/user', // /:id will be appended

  // Videos endpoints
  VIDEOS = '/api/videos',
  VIDEO_BY_ID = '/api/videos', // /:id will be appended
  VIDEO_UPLOAD = '/api/videos/upload',
  VIDEOS_BY_TOPIC = '/api/topics', // /:topicId/videos will be appended

  // PPT endpoints
  PPT_UPLOAD = '/api/ppt/upload',
  PPT_BY_ID = '/api/ppt', // /:id will be appended
  PPT_BY_TOPIC = '/api/topics', // /:topicId/ppt will be appended

  // Programs endpoints
  PROGRAMS = '/api/programs',
  PROGRAM_BY_ID = '/api/programs', // /:id will be appended
  PROGRAM_MODULES = '/api/programs', // /:id/modules will be appended
  PROGRAM_MODULE_REMOVE = '/api/programs', // /:programId/modules/:moduleId will be appended
  PROGRAM_MODULES_REORDER = '/api/programs', // /:id/modules/reorder will be appended
  PUBLISHED_PROGRAMS = '/api/programs/published',
  PUBLISHED_PROGRAMS_COUNTS = '/api/programs/published/counts',

  // Topics endpoints
  TOPICS = '/api/topics',
  TOPIC_BY_ID = '/api/topics', // /:id will be appended

  // Points endpoints
  POINTS = '/api/points',
  POINT_BY_ID = '/api/points', // /:id will be appended

  // Submissions endpoints
  SUBMISSIONS = '/api/submissions',
  SUBMISSION_BY_ID = '/api/submissions', // /:id will be appended

  // Users endpoints
  USERS = '/api/users',
  USER_BY_ID = '/api/users', // /:id will be appended

  // Concept Practices (CPs) endpoints
  CPS = '/api/cps',
  CPS_BY_TOPIC = '/api/cps/topics', // /:topicId will be appended
  CP_BY_ID = '/api/cps', // /:id will be appended
  CP_SINGLE = '/api/cps/single',
}

// API Messages
export enum API_MESSAGES {
  REGISTRATION_SUCCESS = 'Registration successful! Please login to continue.',
  LOGIN_SUCCESS = 'Login successful! Welcome back.',
  LOGOUT_SUCCESS = 'Logged out successfully.',
  PROFILE_COMPLETE_SUCCESS = 'Profile completed successfully!',
  INVALID_CREDENTIALS = 'Invalid email or password.',
  EMAIL_ALREADY_EXISTS = 'Email already exists.',
  NETWORK_ERROR = 'Network error. Please check your connection.',
  SERVER_ERROR = 'Server error. Please try again later.',
  VALIDATION_ERROR = 'Please check your input and try again.',
  
  // Trainer Profile messages
  TRAINER_CREATED_SUCCESS = 'Trainer profile created successfully!',
  TRAINER_UPDATED_SUCCESS = 'Trainer profile updated successfully!',
  TRAINER_DEACTIVATED_SUCCESS = 'Trainer profile deactivated successfully!',
  TRAINER_REACTIVATED_SUCCESS = 'Trainer profile reactivated successfully!',
  TRAINER_DELETED_SUCCESS = 'Trainer profile permanently deleted!',
  TRAINER_NOT_FOUND = 'Trainer profile not found.',
  TRAINER_DEACTIVATE_CONFIRM = 'Are you sure you want to deactivate this trainer profile? They will lose access but data will be preserved.',
  TRAINER_REACTIVATE_CONFIRM = 'Are you sure you want to reactivate this trainer profile? They will regain access.',
  TRAINER_DELETE_CONFIRM = 'Are you sure you want to permanently delete this trainer profile? This action cannot be undone and all data will be lost.',
  
  // Learner Profile messages
  LEARNER_ADDED_SUCCESS = 'Learner added successfully!',
  LEARNER_BATCH_SUCCESS = 'Learners added successfully!',
  LEARNER_UPDATED_SUCCESS = 'Learner profile updated successfully!',
  LEARNER_DEACTIVATED_SUCCESS = 'Learner deactivated successfully!',
  LEARNER_REACTIVATED_SUCCESS = 'Learner reactivated successfully!',
  LEARNER_NOT_FOUND = 'Learner profile not found.',
  LEARNER_DEACTIVATE_CONFIRM = 'Are you sure you want to deactivate this learner? They will lose access but data will be preserved.',
  LEARNER_REACTIVATE_CONFIRM = 'Are you sure you want to reactivate this learner? They will regain access.',
  
  // Organization messages
  ORGANIZATION_CREATED_SUCCESS = 'Organization created successfully!',
  ORGANIZATION_UPDATED_SUCCESS = 'Organization updated successfully!',
  ORGANIZATION_DEACTIVATED_SUCCESS = 'Organization deactivated successfully!',
  ORGANIZATION_ACTIVATED_SUCCESS = 'Organization activated successfully!',
  ORGANIZATION_DELETED_SUCCESS = 'Organization permanently deleted!',
  ORGANIZATION_NOT_FOUND = 'Organization not found.',
  ORGANIZATION_DEACTIVATE_CONFIRM = 'Are you sure you want to deactivate this organization? It will lose access but data will be preserved.',
  ORGANIZATION_ACTIVATE_CONFIRM = 'Are you sure you want to activate this organization? It will regain access.',
  ORGANIZATION_DELETE_CONFIRM = 'Are you sure you want to permanently delete this organization? This action cannot be undone and all data will be lost.',
}

// Form Labels
export enum FORM_LABELS {
  EMAIL = 'Email',
  PASSWORD = 'Password',
  CONFIRM_PASSWORD = 'Confirm Password',
  FIRST_NAME = 'First Name',
  LAST_NAME = 'Last Name',
  PREFERRED_NAME = 'Preferred Name',
  PHONE = 'Phone Number',
  DATE_OF_BIRTH = 'Date of Birth',
  TIMEZONE = 'Timezone',
  
  // Trainer Profile form labels
  TRAINER_EMAIL = 'Trainer Email',
  SPECIALITIES = 'Specialities',
  YEARS_TEACHING = 'Years of Teaching Experience',
  BIO = 'Bio',
  EXPERTISE = 'Expertise',
  LINKEDIN_URL = 'LinkedIn URL',
  WEBSITE_URL = 'Website URL',
  PROFILE_IMAGE = 'Profile Image URL',
  SOCIAL_LINKS = 'Social Links',
}

// Form Placeholders
export enum FORM_PLACEHOLDERS {
  EMAIL = 'your@email.com',
  PASSWORD = '••••••••',
  FIRST_NAME = 'Your first name',
  LAST_NAME = 'Your last name',
  PREFERRED_NAME = 'What would you like to be called?',
  PHONE = '+1234567890',
  
  // Trainer Profile form placeholders
  TRAINER_EMAIL = 'trainer@example.com',
  SPECIALITIES = 'Select specialities...',
  YEARS_TEACHING = '0',
  BIO = 'Tell us about yourself...',
  EXPERTISE = 'List your areas of expertise...',
  LINKEDIN_URL = 'https://linkedin.com/in/yourname',
  WEBSITE_URL = 'https://yourwebsite.com',
  PROFILE_IMAGE = 'https://example.com/your-photo.jpg',
}

// Button Labels
export enum BUTTON_LABELS {
  CREATE_ACCOUNT = 'Create Account',
  CREATING_ACCOUNT = 'Creating account...',
  LOGIN = 'Login',
  LOGGING_IN = 'Logging in...',
  COMPLETE_REGISTRATION = 'Complete Registration',
  SAVING_PROFILE = 'Saving Profile...',
  GOOGLE = 'Google',
  FORGOT_PASSWORD = 'Forgot password?',
  REMEMBER_ME = 'Remember me',
  
  // Trainer Profile button labels
  CREATE_TRAINER = 'Create Trainer Profile',
  CREATING_TRAINER = 'Creating...',
  UPDATE_TRAINER = 'Update Trainer Profile',
  UPDATING_TRAINER = 'Updating...',
  DEACTIVATE_TRAINER = 'Deactivate Trainer',
  DEACTIVATING_TRAINER = 'Deactivating...',
  REACTIVATE_TRAINER = 'Reactivate Trainer',
  REACTIVATING_TRAINER = 'Reactivating...',
  DELETE_TRAINER = 'Permanently Delete',
  DELETING_TRAINER = 'Deleting...',
  ADD_NEW_TRAINER = 'Add New Trainer',
  EDIT_TRAINER = 'Edit Trainer',
  VIEW_TRAINER = 'View Details',
  CANCEL = 'Cancel',
  SAVE = 'Save',
  CONFIRM_DELETE = 'Yes, Delete',
  ADD_SOCIAL_LINK = 'Add Social Link',
  REMOVE_SOCIAL_LINK = 'Remove',
}

// Page Titles
export enum PAGE_TITLES {
  CREATE_ACCOUNT = 'Create Account',
  LOGIN = 'Login',
  COMPLETE_PROFILE = 'Complete Your Profile',
  
  // Trainer Profile page titles
  TRAINERS_LIST = 'Instructor Management',
  CREATE_TRAINER = 'Create Trainer Profile',
  EDIT_TRAINER = 'Edit Trainer Profile',
  TRAINER_DETAILS = 'Trainer Profile Details',
  CREATE_NEW_TRAINER_PROFILE = 'Create New Trainer Profile',
  EDIT_TRAINER_PROFILE = 'Edit Trainer Profile',
  TRAINER_PROFILE_DETAILS = 'Trainer Profile Details',
  TRAINER_PROFILE = 'Trainer Profile',
}

// Page Descriptions
export enum PAGE_DESCRIPTIONS {
  CREATE_ACCOUNT = 'Join our community to start learning',
  LOGIN = 'Access your account to continue learning',
  COMPLETE_PROFILE = 'Tell us more about yourself to personalize your experience.',
  
  // Trainer Profile page descriptions
  TRAINERS_LIST = 'Manage instructor profiles and their information',
  CREATE_TRAINER = 'Create a new trainer profile',
  EDIT_TRAINER = 'Update trainer profile information',
  TRAINER_DETAILS = 'View detailed trainer profile information',
  ADD_NEW_TRAINER = 'Add a new trainer to the platform with their professional information.',
  UPDATE_TRAINER_INFO = 'Update trainer information and professional details.',
  VIEW_TRAINER_INFO = 'View trainer information and professional details.',
  MANAGE_TRAINER_INFO = 'Manage trainer information',
  UPDATE_PROFILE_CHANGES = 'Update the trainer profile information and save your changes.',
  FILL_DETAILS_CREATE = 'Fill in the details to create a comprehensive trainer profile.',
  MODIFY_PROFILE_DETAILS = 'Modify the trainer profile details below.',
  COMPLETE_REQUIRED_FIELDS = 'Complete all required fields to create the trainer profile.',
}

// Navigation Routes
export enum ROUTES {
  LOGIN = '/login',
  REGISTER = '/register',
  USER_INFO = '/user-info',
  DASHBOARD = '/dashboard',
  TERMS = '/terms',
  PRIVACY = '/privacy',
  
  // Trainer Profile routes
  TRAINERS = '/internal/trainers',
  CREATE_TRAINER = '/internal/trainers/form',
  EDIT_TRAINER = '/internal/trainers/form',
  TRAINER_DETAILS = '/internal/trainers',
  
  // Learner routes
  LEARNERS = '/internal/learners',
  ADD_LEARNERS = '/internal/learners/add',
  
  // Organization routes
  ORGANIZATIONS = '/internal/organizations',
  CREATE_ORGANIZATION = '/internal/organizations/form/add',
  EDIT_ORGANIZATION = '/internal/organizations/form',
  ORGANIZATION_DETAILS = '/internal/organizations',
  ORGANIZATION_USERS = '/internal/organizations', // {id}/users will be appended

  // Program routes
  PROGRAM_RESOURCES = '/programs/:id/resources',
  PROGRAM_CHECKLIST = '/programs/:id/checklist',

  // Profile routes
  PROFILE_PROGRESS = '/profile/progress',

  // Content Management routes
  CONTENT_MANAGEMENT = '/content-management',

  // Cohort routes
  COHORT_DETAILS = '/:id', // Dynamic cohort route
  COHORTS = '/cohorts',
  INTERNAL_COHORTS = '/internal/cohorts',
}

// Form Field Names
export enum TRAINER_FORM_FIELDS {
  EMAIL = 'email',
  USER_ID = 'user_id',
  SPECIALITIES = 'specialities',
  YEARS_TEACHING = 'total_years_teaching',
  BIO = 'bio',
  EXPERTISE = 'expertise',
  LINKEDIN_URL = 'linkedin_url',
  WEBSITE_URL = 'website',
  PROFILE_IMAGE = 'profile_image',
  SOCIAL_LINKS = 'social_links',
}

// Validation Messages
export enum VALIDATION_MESSAGES {
  REQUIRED = 'This field is required',
  INVALID_EMAIL = 'Please enter a valid email address',
  INVALID_URL = 'Please enter a valid URL',
  MAX_LENGTH = 'Maximum length exceeded',
  MIN_VALUE = 'Value must be greater than or equal to 0',
  MAX_VALUE = 'Value exceeds maximum allowed',
  
  // Trainer Profile specific validation
  EMAIL_REQUIRED = 'Email is required',
  SPECIALITIES_REQUIRED = 'At least one speciality must be selected',
  SPECIALITIES_MIN_LENGTH = 'At least one speciality is required',
  YEARS_TEACHING_RANGE = 'Years of teaching must be between 0 and 999.9',
  LINKEDIN_INVALID = 'LinkedIn URL must be a valid URL',
  WEBSITE_INVALID = 'Website URL must be a valid URL',
  PROFILE_IMAGE_INVALID = 'Profile image must be a valid URL',
  SOCIAL_LINKS_INVALID = 'Social links must be valid URLs',
  URL_MAX_LENGTH = 'URL cannot exceed 255 characters',
}

// Local Storage Keys
export enum STORAGE_KEYS {
  USER_DATA = 'user_data',
  AUTH_TOKEN = 'auth_token',
  
  // Trainer Profile storage keys
  TRAINER_FORM_DATA = 'trainer_form_data',
  TRAINER_FILTERS = 'trainer_filters',
}

// Form Fields (alias for consistency)
export const FORM_FIELDS = TRAINER_FORM_FIELDS

// UI Text constants
export enum UI_TEXT {
  LOADING = 'Loading...',
  ERROR_OCCURRED = 'An error occurred',
  NO_DATA = 'No data available',
  SAVE_CHANGES = 'Save Changes',
  DISCARD_CHANGES = 'Discard Changes',
  CONFIRM_ACTION = 'Confirm Action',
  
  // Trainer specific
  TRAINER_CREATED = 'Trainer profile created successfully',
  TRAINER_UPDATED = 'Trainer profile updated successfully',
  TRAINER_DEACTIVATED = 'Trainer profile deactivated successfully',
  TRAINER_REACTIVATED = 'Trainer profile reactivated successfully',
  TRAINER_DELETED = 'Trainer profile permanently deleted',
  CREATING_TRAINER = 'Creating trainer profile...',
  UPDATING_TRAINER = 'Updating trainer profile...',
  DEACTIVATING_TRAINER = 'Deactivating trainer profile...',
  REACTIVATING_TRAINER = 'Reactivating trainer profile...',
  DELETING_TRAINER = 'Permanently deleting trainer profile...',
  
  // Instructors page specific
  LOADING_TRAINER_PROFILES = 'Loading trainer profiles...',
  ERROR_LOADING_TRAINERS = 'Error Loading Trainers',
  SEARCH_PLACEHOLDER = 'Search by bio, expertise, or specialities...',
  ALL_SPECIALITIES = 'All Specialities',
  NO_SPECIALITIES_LISTED = 'No specialities listed',
  NO_EXPERTISE_LISTED = 'No expertise listed',
  NO_TRAINERS_FOUND = 'No trainer profiles found matching the selected filters.',
  TOTAL_TRAINERS = 'Total Trainers',
  WITH_EXPERTISE = 'With Expertise',
  WITH_EXPERIENCE = 'With Experience',
  WITH_SOCIAL_LINKS = 'With Social Links',
  TRAINER_PROFILES_TITLE = 'Trainer Profiles',
  TRAINER_PROFILES_SUBTITLE = 'View and manage all trainer profiles and information',
  TRAINER_PROFILES_DESCRIPTION = 'View, filter, and manage trainer profile information',
  TRAINER_COUNT_SUFFIX = 'registered trainers',
  DELETE_CONFIRMATION_TEXT = 'DELETE',
  DELETE_CONFIRMATION_ERROR = 'Please type DELETE to confirm permanent deletion',
  
  // Table content messages
  NO_BIO_PROVIDED = 'No bio provided',
  EXPERIENCE_NOT_SPECIFIED = 'Experience not specified',
  SOCIAL_LINKS_COUNT = 'social link(s)',
  
  // Table column headers and labels
  BIO = 'Bio',
  LINKS = 'Links',
  TEACHING = 'Teaching',
  OPEN_MENU = 'Open menu',
  
  // Social platform names
  LINKEDIN = 'LinkedIn',
  WEBSITE = 'Website',
  
  // Misc UI text
  SPECIALITY_PLACEHOLDER = 'Speciality',
  
  // Form mode text
  EDIT_MODE = 'Edit Mode',
  CREATE_MODE = 'Create Mode',
  BACK_TO_TRAINERS = 'Back to Trainers',
  UPDATE_TRAINER_INFORMATION = 'Update Trainer Information',
  NEW_TRAINER_INFORMATION = 'New Trainer Information',
  
  // Form section labels
  PERSONAL_INFORMATION = 'Personal Information',
  PROFESSIONAL_DETAILS = 'Professional Details',
  SOCIAL_LINKS = 'Social Links',
  BASIC_CONTACT_INFO = 'Basic contact information and profile details',
  DETAILED_SKILLS_INFO = 'Detailed information about skills and expertise',
  SOCIAL_MEDIA_PROFILES = 'Professional social media profiles and links',
  
  // Form field labels and descriptions
  EMAIL_ADDRESS = 'Email Address',
  ENTER_TRAINER_EMAIL = "Enter the trainer's email address",
  TRAINER_EMAIL_ADDRESS = "Trainer's email address",
  AREAS_OF_EXPERTISE = 'Areas of expertise (select multiple)',
  TEACHING_EXPERIENCE = 'Total years of teaching experience',
  BIO_DESCRIPTION = "Brief description of the trainer's background and experience",
  EXPERTISE_DESCRIPTION = 'Specific skills, technologies, or subjects you can teach (comma-separated)',
  PERSONAL_WEBSITE = 'Personal Website',
  WEBSITE_DESCRIPTION = 'Your professional website or portfolio',
  
  // Placeholders
  TRAINER_EMAIL_PLACEHOLDER = 'trainer@example.com',
  ADD_SPECIALITY_PLACEHOLDER = 'Add speciality...',
  EXPERIENCE_LEVEL_PLACEHOLDER = 'Select experience level...',
  BIO_PLACEHOLDER = 'Tell us about your background, experience, and what you\'re passionate about teaching...',
  EXPERTISE_PLACEHOLDER = 'React, Node.js, Python, Machine Learning, Data Science...',
  WEBSITE_PLACEHOLDER = 'https://yourwebsite.com',
}

// Status and Badge Text
export enum STATUS_TEXT {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PROCESSING = 'Processing...',
}

// Tab Labels
export enum TAB_LABELS {
  ACTIVE_TRAINERS = 'Active Trainers',
  INACTIVE_TRAINERS = 'Inactive Trainers',  
  ALL_TRAINERS = 'All Trainers',
}

// Table Headers
export enum TABLE_HEADERS {
  TRAINER = 'Trainer',
  EMAIL = 'Email',
  SPECIALITIES = 'Specialities',
  EXPERTISE = 'Expertise',
  EXPERIENCE = 'Experience',
  STATUS = 'Status',
  ACTIONS = 'Actions',
}

// Action Labels  
export enum ACTION_LABELS {
  VIEW_PROFILE = 'View Profile',
  EDIT_DETAILS = 'Edit Details',
  DEACTIVATE_TRAINER = 'Deactivate Trainer',
  REACTIVATE_TRAINER = 'Reactivate Trainer',
  PERMANENT_DELETE = 'Permanent Delete',
  REFRESH = 'Refresh',
  EXPORT_DATA = 'Export Data',
  ADD = 'Add',
  EXPORT = 'Export',
  ACTIONS = 'Actions',
  YES_DELETE = 'Yes, Delete',
}

// Dialog Titles and Messages
export enum DIALOG_TEXT {
  DEACTIVATE_TITLE = 'Deactivate Trainer Profile',
  DEACTIVATE_MESSAGE = 'Are you sure you want to deactivate this trainer profile? They will lose access but their data will be preserved and they can be reactivated later.',
  REACTIVATE_TITLE = 'Reactivate Trainer Profile', 
  REACTIVATE_MESSAGE = 'Are you sure you want to reactivate this trainer profile? They will regain access to the system.',
  PERMANENT_DELETE_TITLE = '⚠️ DANGER: Permanent Deletion',
  PERMANENT_DELETE_MESSAGE = 'This will permanently delete the trainer profile and ALL associated data. This action CANNOT be undone.',
  PERMANENT_DELETE_SUBTITLE = 'Type DELETE to confirm:',
  PLACEHOLDER_DELETE_CONFIRM = 'Type DELETE to confirm',
}

// HTTP Status Codes
export enum HTTP_STATUS {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

// SWR Keys
export const SWR_KEYS = {
  CURRENT_USER: '/api/auth/me',
  USER_ROLE: '/api/auth/role',
  
  // Trainer Profile SWR keys
  TRAINER_PROFILES: '/api/trainers',
  TRAINER_PROFILE_BY_ID: (id: string) => `/api/trainers/${id}`,
  
  // Learner Profile SWR keys
  LEARNERS: '/api/learners',
  LEARNER_PROFILE_BY_ID: (id: string) => `/api/learner/${id}`,
  
  // Specialities SWR keys
  SPECIALITIES: '/api/trainers/specialities',
  
  // Organizations SWR keys
  ORGANIZATIONS: '/api/organizations',
  ORGANIZATION_BY_ID: (id: string) => `/api/organizations/${id}`,
  ORGANIZATION_USERS: (id: string) => `/api/organizations/${id}/users`,
  
  // Completions SWR keys
  TOPIC_COMPLETIONS: '/api/completions/topic',
  CP_COMPLETIONS: '/api/completions/cp',
  OBJECTIVE_COMPLETIONS: '/api/completions/objective',
  OUTCOME_COMPLETIONS: '/api/completions/outcomes',
  
  // Objectives SWR keys
  OBJECTIVES: '/api/objectives',
  OBJECTIVE_BY_ID: (id: string) => `/api/objectives/${id}`,
  OBJECTIVES_BY_TOPIC: (topicId: string) => `/api/objectives/topic/${topicId}`,
  
  // Outcomes SWR keys
  OUTCOMES: '/api/outcomes',
  OUTCOME_BY_ID: (id: string) => `/api/outcomes/${id}`,
  OUTCOMES_BY_TOPIC: (topicId: string) => `/api/outcomes/topic/${topicId}`,
  
  // Modules SWR keys
  MODULES: '/api/modules',
  MODULE_BY_ID: (id: string) => `/api/modules/${id}`,
  MODULE_TOPICS: (id: string) => `/api/modules/${id}/topics`,
  
  // Programs SWR keys
  PROGRAMS: '/api/programs',
  PROGRAM_BY_ID: (id: string) => `/api/programs/${id}`,
  PROGRAM_MODULES: (id: string) => `/api/programs/${id}/modules`,
  PUBLISHED_PROGRAMS: '/api/programs/published',
  PUBLISHED_PROGRAMS_COUNTS: '/api/programs/published/counts',
  
  // Cohorts SWR keys
  COHORTS: '/api/cohorts',
  COHORT_BY_ID: (id: string) => `/api/cohorts/${id}`,
  COHORT_TRAINERS: (id: string) => `/api/cohorts/${id}/trainers`,
  COHORT_LEARNERS: (id: string) => `/api/cohorts/${id}/learners`,
  
  // Documents SWR keys
  DOCUMENTS: '/api/docs',
  DOCUMENT_BY_ID: (id: string) => `/api/docs/${id}`,
  DOCUMENTS_BY_TOPIC: (topicId: string) => `/api/topics/${topicId}/documents`,
  
  // Cohort Sessions SWR keys
  COHORT_SESSIONS: '/api/cohort-sessions',
  COHORT_SESSION_BY_ID: '/api/cohort-session-by-id',
  COHORT_SESSIONS_BY_COHORT: '/api/cohort-sessions-by-cohort',
  SESSIONS_BY_TRAINER: '/api/sessions-by-trainer',
  SESSION_ATTENDANCE: '/api/session-attendance',
  SESSION_SUMMARY: '/api/session-summary',
  SESSION_LEARNER_NOTES: '/api/session-learner-notes',
  USER_SESSION_NOTES: '/api/user-session-notes',
  SESSION_RESOURCES: '/api/session-resources'
} as const;

// Route Helper Functions for Dynamic Routes
export const ROUTE_HELPERS = {
  // Trainer Profile route helpers
  TRAINER_DETAILS: (id: string) => `${ROUTES.TRAINER_DETAILS}/${id}`,
  EDIT_TRAINER: (id: string) => `${ROUTES.EDIT_TRAINER}/${id}`,
  
  // Helper functions for dynamic routes
  getTrainerDetailsRoute: (id: string) => `${ROUTES.TRAINER_DETAILS}/${id}`,
  getEditTrainerRoute: (id: string) => `${ROUTES.EDIT_TRAINER}/${id}`,
  
  // Learner route helpers
  getLearnerAddRoute: () => ROUTES.ADD_LEARNERS,
  getLearnersRoute: () => ROUTES.LEARNERS,
  
  // Organization route helpers
  ORGANIZATION_DETAILS: (id: string) => `${ROUTES.ORGANIZATION_DETAILS}/${id}`,
  EDIT_ORGANIZATION: (id: string) => `${ROUTES.EDIT_ORGANIZATION}/${id}`,
  
  // Organization template string helpers
  getOrganizationDetailsRoute: (id: string) => `${ROUTES.ORGANIZATION_DETAILS}/${id}`,
  getEditOrganizationRoute: (id: string) => `${ROUTES.EDIT_ORGANIZATION}/${id}`,
  getOrganizationUsersRoute: (id: string) => `${ROUTES.ORGANIZATION_USERS}/${id}/users`,
  getAddUserToOrganizationRoute: (id: string) => `${ROUTES.ORGANIZATION_USERS}/${id}/users/add`,
} as const;

// Social Media Platforms
export enum SOCIAL_PLATFORMS {
  TWITTER = 'twitter',
  GITHUB = 'github',
  LINKEDIN = 'linkedin',
  PORTFOLIO = 'portfolio',
  YOUTUBE = 'youtube',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
}

// Learner Types
export enum LEARNER_TYPE {
  STUDENT = 'student',
  PROFESSIONAL = 'professional'
}

// Learner Form Labels
export enum LEARNER_FORM_LABELS {
  LEARNER_TYPE = 'I am a',
  GOALS_TEXT = 'Career Goals',
  COLLEGE_NAME = 'College/University Name',
  DEGREE_COURSE = 'Degree/Course',
  CURRENT_GPA = 'Current GPA',
  EXPECTED_GRAD_YEAR = 'Expected Graduation Year',
  INTEREST = 'Areas of Interest',
  COMPANY_NAME = 'Company Name',
  JOB_TITLE = 'Current Job Title',
  YEARS_EXPERIENCE = 'Years of Experience',
  PIPELINE_DEV_EXP = 'Pipeline Development Experience (Years)',
  PORTFOLIO_URL = 'Portfolio URL'
}

// Organization Form Labels
export enum ORGANIZATION_FORM_LABELS {
  ORGANIZATION_NAME = 'Organization Name',
  ORGANIZATION_CODE = 'Organization Code',
  ORGANIZATION_TYPE = 'Organization Type',
  INDUSTRY = 'Industry',
  WEBSITE = 'Website',
  COUNTRY = 'Country',
  PROVINCE_STATE = 'Province/State',
  CITY = 'City',
  POSTAL_CODE = 'Postal Code',
  ADDRESS_LINE_1 = 'Address Line 1',
  ADDRESS_LINE_2 = 'Address Line 2',
  LOGO_URL = 'Logo URL',
  DESCRIPTION = 'Description',
  IS_CURRENTLY_HIRING = 'Currently Hiring',
  STATUS = 'Status',
}

// Organization Form Placeholders
export enum ORGANIZATION_FORM_PLACEHOLDERS {
  ORGANIZATION_NAME = 'Enter organization name',
  ORGANIZATION_CODE = 'Enter unique code',
  INDUSTRY = 'Select industry',
  WEBSITE = 'https://example.com',
  COUNTRY = 'Select country',
  PROVINCE_STATE = 'Province or State',
  CITY = 'City name',
  POSTAL_CODE = 'Postal/ZIP code',
  ADDRESS_LINE_1 = 'Street address',
  ADDRESS_LINE_2 = 'Apartment, suite, etc.',
  LOGO_URL = 'https://example.com/logo.png',
  DESCRIPTION = 'Brief description of the organization...',
}

// Organization Types
export enum ORGANIZATION_TYPES {
  HIRING = 'hiring',
  TRAINING = 'training',
}

// Organization Status
export enum ORGANIZATION_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ALL = 'all',
}

// Organization UI Text
export enum ORGANIZATION_UI_TEXT {
  // Page titles and descriptions
  ORGANIZATIONS_DATABASE = 'Organizations Database',
  ORGANIZATIONS_SUBTITLE = 'Manage industry partners and hiring organizations',
  ORGANIZATION_RECORDS = 'Organization Records',
  ORGANIZATION_RECORDS_DESCRIPTION = 'View, filter, and manage partner companies',
  ORGANIZATION_DETAILS = 'Organization Details',
  ORGANIZATION_ACTIONS_DESCRIPTION = 'Manage this organization',
  
  // Loading and error states
  LOADING_ORGANIZATIONS = 'Loading organizations...',
  ERROR_LOADING_ORGANIZATIONS = 'Error loading organizations',
  NO_ORGANIZATIONS_FOUND = 'No organizations found matching the selected filters.',
  
  // KPI card titles
  TOTAL_ORGANIZATIONS = 'Total Organizations',
  ACTIVE_ORGANIZATIONS = 'Active Organizations',
  HIRING_ORGANIZATIONS = 'Hiring Organizations',
  TRAINING_ORGANIZATIONS = 'Training Organizations',
  CURRENTLY_HIRING = 'Currently Hiring',
  
  // Search and filter placeholders
  SEARCH_PLACEHOLDER = 'Search by name, code, or industry...',
  ALL_INDUSTRIES = 'All Industries',
  ALL_STATUS = 'All Status',
  
  // Tab labels
  ALL_ORGANIZATIONS = 'All Organizations',
  TRAINING = 'Training',
  RECRUITING = 'Currently Hiring',
  NOT_RECRUITING = 'Not Hiring',
  
  // Table headers
  ORGANIZATION = 'Organization',
  TYPE_INDUSTRY = 'Type & Industry',
  CONTACT = 'Contact',
  LOCATION = 'Location',
  CREATED = 'Created',
  
  // Status badges
  HIRING_BADGE = 'Hiring',
  TRAINING_BADGE = 'Training',
  CURRENTLY_HIRING_BADGE = 'Currently Hiring',
  HIRING_PARTNER_BADGE = 'Hiring Partner',
  NOT_HIRING_BADGE = 'Not Hiring',
  ACTIVE_BADGE = 'Active',
  INACTIVE_BADGE = 'Inactive',
  
  // Contact and location
  NO_CONTACT_INFO = 'No contact info',
  NO_ADDRESS = 'No address',
  NO_ADDRESS_PROVIDED = 'No address provided',
  WEBSITE = 'Website',
  NO_WEBSITE_PROVIDED = 'No website provided',
  
  // Information fields
  BASIC_INFORMATION = 'Basic Information',
  CONTACT_INFORMATION = 'Contact Information',
  SYSTEM_INFORMATION = 'System Information',
  DESCRIPTION = 'Description',
  INDUSTRY = 'Industry',
  TYPE = 'Organization Type',
  HIRING_STATUS = 'Hiring Status',
  ADDRESS = 'Address',
  CREATED_AT = 'Created At',
  LAST_UPDATED = 'Last Updated',
  STATUS = 'Status',
  USER_MANAGEMENT = 'User Management',
  IS_HIRING = 'Currently Hiring',
  NOT_HIRING = 'Not Hiring',
  STATUS_ACTIVE = 'Active',
  STATUS_INACTIVE = 'Inactive',
  
  // Action buttons
  ADD_NEW_ORGANIZATION = 'Add New Organization',
  EXPORT_DATA = 'Export Data',
  VIEW_DETAILS = 'View Details',
  EDIT_ORGANIZATION = 'Edit Organization',
  VIEW_USERS = 'View Users',
  ADD_USER = 'Add User',
  DEACTIVATE = 'Deactivate',
  ACTIVATE = 'Activate',
  DEACTIVATING = 'Deactivating...',
  ACTIVATING = 'Activating...',
  ACTIONS = 'Actions',
  OPEN_MENU = 'Open menu',
  
  // Organization Users Page
  ORGANIZATION_USERS_TITLE = 'Organization Users',
  ORGANIZATION_USERS_SUBTITLE = 'Manage users assigned to this organization',
  LOADING_ORGANIZATION_USERS = 'Loading organization users...',
  ERROR_LOADING_ORGANIZATION_USERS = 'Error loading organization users',
  NO_USERS_FOUND = 'No users found in this organization.',
  TOTAL_USERS = 'Total Users',
  ACTIVE_USERS = 'Active Users',
  INACTIVE_USERS = 'Inactive Users',
  USER_SEARCH_PLACEHOLDER = 'Search by name or email...',
  
  // Add Users Page
  ADD_USERS_TITLE = 'Add Users to Organization',
  ADD_USERS_SUBTITLE = 'Add single or multiple users to this organization',
  ADD_SINGLE_USER = 'Add Single User',
  ADD_BULK_USERS = 'Add Multiple Users',
  SINGLE_USER_EMAIL_PLACEHOLDER = 'user@example.com',
  BULK_USERS_EMAIL_PLACEHOLDER = 'user1@example.com, user2@example.com, user3@example.com',
  SINGLE_USER_TAB = 'Single User',
  BULK_USERS_TAB = 'Bulk Users',
  EMAIL_ADDRESS = 'Email Address',
  EMAIL_ADDRESSES = 'Email Addresses',
  EMAIL_ADDRESSES_DESCRIPTION = 'Enter email addresses separated by commas',
  ADD_USER_BUTTON = 'Add User',
  ADD_USERS_BUTTON = 'Add Users',
  ADDING_USER = 'Adding user...',
  ADDING_USERS = 'Adding users...',
  USER_ADDED_SUCCESS = 'User added successfully!',
  USERS_ADDED_SUCCESS = 'Users added successfully!',
  SOME_USERS_FAILED = 'Some users could not be added',
  BACK_TO_USERS = 'Back to Users',
}

// Organization Action Labels
export enum ORGANIZATION_ACTION_LABELS {
  VIEW_DETAILS = 'View Details',
  EDIT_ORGANIZATION = 'Edit Organization',
  VIEW_USERS = 'View Users',
  DEACTIVATE_ORGANIZATION = 'Deactivate Organization',
  ACTIVATE_ORGANIZATION = 'Activate Organization',
  DELETE_ORGANIZATION = 'Delete Organization',
  EXPORT_DATA = 'Export Data',
  ADD_NEW = 'Add New Organization',
}

// Organization Dialog Text
export enum ORGANIZATION_DIALOG_TEXT {
  DEACTIVATE_TITLE = 'Deactivate Organization',
  ACTIVATE_TITLE = 'Activate Organization',
  DELETE_TITLE = 'Delete Organization',
  DEACTIVATE_MESSAGE = 'Are you sure you want to deactivate "{name}"? This will prevent the organization from appearing in active listings but preserve all data.',
  ACTIVATE_MESSAGE = 'Are you sure you want to activate "{name}"? This will make the organization appear in active listings.',
  DELETE_MESSAGE = 'Are you sure you want to permanently delete "{name}"? This action cannot be undone and all data will be lost.',
}

// Organization Table Columns
export enum ORGANIZATION_TABLE_COLUMNS {
  ORGANIZATION = 'Organization',
  TYPE_INDUSTRY = 'Type & Industry',
  CONTACT = 'Contact',
  LOCATION = 'Location',
  STATUS = 'Status',
  CREATED = 'Created',
  ACTIONS = 'Actions',
}

// Organization Filter Types
export type OrganizationStatusFilter = 'all' | 'active' | 'inactive';
export type OrganizationTypeFilter = 'all' | 'hiring' | 'training';
export type OrganizationTabFilter = 'all' | 'training' | 'recruiting' | 'not-recruiting';
