import { LEARNER_TYPES } from './string-const';

/**
 * Profile validation helper functions
 * Following Task 8.1 requirements from tasks.md
 */

export interface ProfileCompletenessResult {
  is_complete: boolean;
  missing_fields: string[];
  completion_percentage: number;
  completion_message: string;
}

export interface LearnerProfile {
  user_id: string;
  learner_type?: string;
  goals_text?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface StudentDetails {
  learner_id: string;
  college_name?: string;
  degree_course?: string;
  expected_grad_year?: number;
  current_gpa?: number;
  interest?: string;
}

export interface ProfessionalDetails {
  learner_id: string;
  company_name?: string;
  job_title?: string;
  years_of_experience?: number;
  pipeline_dev_exp?: boolean;
  portfolio_url?: string;
}

/**
 * Validate required fields for learner profile
 */
export function validateRequiredFields(
  profile: LearnerProfile,
  studentDetails?: StudentDetails,
  professionalDetails?: ProfessionalDetails,
): string[] {
  const missingFields: string[] = [];

  // Base profile required fields
  if (!profile.learner_type) {
    missingFields.push('learner_type');
  }

  if (!profile.goals_text || profile.goals_text.trim().length === 0) {
    missingFields.push('goals_text');
  }

  // Type-specific required fields
  if (profile.learner_type === LEARNER_TYPES.STUDENT && studentDetails) {
    if (
      !studentDetails.college_name ||
      studentDetails.college_name.trim().length === 0
    ) {
      missingFields.push('college_name');
    }
    if (
      !studentDetails.degree_course ||
      studentDetails.degree_course.trim().length === 0
    ) {
      missingFields.push('degree_course');
    }
    if (!studentDetails.expected_grad_year) {
      missingFields.push('expected_grad_year');
    }
    if (
      !studentDetails.interest ||
      studentDetails.interest.trim().length === 0
    ) {
      missingFields.push('interest');
    }
  }

  if (
    profile.learner_type === LEARNER_TYPES.PROFESSIONAL &&
    professionalDetails
  ) {
    if (
      !professionalDetails.company_name ||
      professionalDetails.company_name.trim().length === 0
    ) {
      missingFields.push('company_name');
    }
    if (
      !professionalDetails.job_title ||
      professionalDetails.job_title.trim().length === 0
    ) {
      missingFields.push('job_title');
    }
    if (
      professionalDetails.years_of_experience === null ||
      professionalDetails.years_of_experience === undefined
    ) {
      missingFields.push('years_of_experience');
    }
    if (
      professionalDetails.pipeline_dev_exp === null ||
      professionalDetails.pipeline_dev_exp === undefined
    ) {
      missingFields.push('pipeline_dev_exp');
    }
  }

  return missingFields;
}

/**
 * Calculate completion percentage for learner profile
 */
export function calculateCompletionPercentage(
  profile: LearnerProfile,
  studentDetails?: StudentDetails,
  professionalDetails?: ProfessionalDetails,
): number {
  const totalRequiredFields = getTotalRequiredFields(profile.learner_type);
  const missingFields = validateRequiredFields(
    profile,
    studentDetails,
    professionalDetails,
  );
  const completedFields = totalRequiredFields - missingFields.length;

  if (totalRequiredFields === 0) {
    return 0;
  }

  return Math.round((completedFields / totalRequiredFields) * 100);
}

/**
 * Get total number of required fields based on learner type
 */
function getTotalRequiredFields(learnerType?: string): number {
  // Base fields: learner_type, goals_text
  const baseFields = 2;

  if (learnerType === LEARNER_TYPES.STUDENT) {
    // Additional student fields: college_name, degree_course, expected_grad_year, interest
    return baseFields + 4;
  }

  if (learnerType === LEARNER_TYPES.PROFESSIONAL) {
    // Additional professional fields: company_name, job_title, years_of_experience, pipeline_dev_exp
    return baseFields + 4;
  }

  // If no learner type is selected, only base fields are required
  return baseFields;
}

/**
 * Generate completion message based on profile status
 */
export function generateCompletionMessage(
  isComplete: boolean,
  completionPercentage: number,
  missingFields: string[],
): string {
  if (isComplete) {
    return 'Your profile is complete! You can now access all features.';
  }

  if (completionPercentage === 0) {
    return 'Please complete your profile to get started. Begin by selecting your learner type.';
  }

  if (completionPercentage < 50) {
    return `Your profile is ${completionPercentage}% complete. Please fill in the remaining required fields to continue.`;
  }

  if (missingFields.length === 1) {
    return `Almost done! Just one more field to complete: ${missingFields[0].replace('_', ' ')}.`;
  }

  return `You're ${completionPercentage}% complete! Please fill in ${missingFields.length} more required fields.`;
}

/**
 * Check if learner profile is complete
 */
export function checkLearnerProfileCompleteness(
  profile: LearnerProfile,
  studentDetails?: StudentDetails,
  professionalDetails?: ProfessionalDetails,
): ProfileCompletenessResult {
  const missingFields = validateRequiredFields(
    profile,
    studentDetails,
    professionalDetails,
  );
  const isComplete = missingFields.length === 0;
  const completionPercentage = calculateCompletionPercentage(
    profile,
    studentDetails,
    professionalDetails,
  );
  const completionMessage = generateCompletionMessage(
    isComplete,
    completionPercentage,
    missingFields,
  );

  return {
    is_complete: isComplete,
    missing_fields: missingFields,
    completion_percentage: completionPercentage,
    completion_message: completionMessage,
  };
}

/**
 * Validate that a field value is not null, undefined, or empty string
 */
export function isFieldRequired(value: any): boolean {
  return value !== null && value !== undefined && value !== '';
}

/**
 * Format field name for user-friendly display
 */
export function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
