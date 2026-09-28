/**
 * Learner student details interface
 */
export interface LearnerStudentDetails {
  id: string;
  learner_id: string;
  college_name?: string;
  degree_course?: string;
  expected_grad_year?: number;
  current_gpa?: number;
  interest?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Learner professional details interface
 */
export interface LearnerProfessionalDetails {
  id: string;
  learner_id: string;
  company_name?: string;
  job_title?: string;
  years_experience?: number;
  pipeline_dev_exp?: number;
  portfolio_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Learner profile interface
 */
export interface LearnerProfile {
  id: string;
  user_id: string;
  learner_type: 'student' | 'professional';
  status: 'active' | 'inactive' | 'suspended';
  goals_text?: string;
  created_at: string;
  updated_at: string;
  student_details?: LearnerStudentDetails;
  professional_details?: LearnerProfessionalDetails;
}

/**
 * Speciality interface
 */
export interface Speciality {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Trainer profile interface
 */
export interface TrainerProfile {
  id: string;
  user_id: string;
  total_years_teaching?: number;
  bio?: string;
  linkedin_url?: string;
  expertise?: string;
  profile_image?: string;
  website?: string;
  social_links?: any; // JSON field for social media links
  specialities?: Speciality[]; // Array of speciality objects
  is_active?: boolean; // Status from user_roles table
  created_at: string;
  updated_at: string;
}

/**
 * Trainer profile with user details interface - used for joined queries
 */
export interface TrainerProfileWithUser {
  id: string;
  user_id: string;
  first_name?: string;
  email: string;
  total_years_teaching?: number;
  bio?: string;
  linkedin_url?: string;
  expertise?: string;
  profile_image?: string;
  website?: string;
  social_links?: any; // JSON field for social media links
  specialities?: Speciality[]; // Array of speciality objects
  is_active?: boolean; // Status from user_roles table
  created_at: string;
  updated_at: string;
}

/**
 * Admin profile interface
 */
export interface AdminProfile {
  id: string;
  user_id: string;
  admin_level: 'global' | 'organization' | 'program';
  permissions?: string[];
  department?: string;
  created_at: string;
  updated_at: string;
}
