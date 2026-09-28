export interface LearnerProfile {
  id: string
  user_id: string
  learner_type: 'student' | 'professional' | null
  goals_text: string | null
  enrollment_date: string
  rank: number | null
  tasks_completed: number
  streak_days: number
  last_activity_date: string | null
  profile_image: string | null
  created_at: string
  updated_at: string
  users: {
    id: string
    email: string
    phone: string
    timezone: string
    is_active: boolean
    last_name: string
    created_at: string
    first_name: string
  }
  learner_student_details: StudentDetails | null
  learner_professional_details: ProfessionalDetails | null
  completeness_status: CompletenessStatus
  // Legacy compatibility - will be removed
  status?: 'active' | 'dropout' | 'graduate'
  user?: {
    first_name: string
    last_name: string
    email: string
    phone: string
    timezone: string
  }
  student_details?: StudentDetails | null
  professional_details?: ProfessionalDetails | null
}

export interface StudentDetails {
  id: string
  interest: string
  current_gpa: number
  college_name: string
  degree_course: string
  expected_grad_year: number
}

export interface ProfessionalDetails {
  id: string
  job_title: string
  company_name: string
  portfolio_url: string
  pipeline_dev_exp: number
  years_experience: number
}

export interface CompletenessStatus {
  is_complete: boolean
  missing_fields: string[]
  completion_percentage: number
  completion_message: string
}

export interface AddLearnerResponse {
  success: boolean
  message: string
  data: {
    id: string
    user_id: string
    role_id: number
    is_active: boolean
    assigned_at: string
    roles: {
      id: number
      role_name: string
      description: string
    }
  }
}

export interface BatchAddResponse {
  success: boolean
  message: string
  data: {
    totalRequested: number
    successful: number
    failed: number
    results: BatchAddResult[]
  }
}

export interface BatchAddResult {
  email: string
  success: boolean
  message: string
  data: AddLearnerResponse['data'] | null
  error: string | null
}

export interface UpdateLearnerProfileData {
  learner_type?: 'student' | 'professional'
  goals_text?: string
  student_details?: Partial<Omit<StudentDetails, 'id' | 'learner_id'>>
  professional_details?: Partial<Omit<ProfessionalDetails, 'id' | 'learner_id'>>
} 