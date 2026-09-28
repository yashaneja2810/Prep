import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class RoleDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  role_name: string;

  @ApiProperty()
  description: string;
}

class UserRoleDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  role_id: number;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  assigned_at: string;

  @ApiProperty({ type: RoleDto })
  roles: RoleDto;
}

class OrganizationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  org_name: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty({ required: false })
  website?: string;

  @ApiProperty({ required: false })
  description?: string;
}

class LearnerStudentDetailsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  learner_id: string;

  @ApiProperty({ required: false })
  college_name?: string;

  @ApiProperty({ required: false })
  degree_course?: string;

  @ApiProperty({ required: false })
  expected_grad_year?: number;

  @ApiProperty({ required: false })
  current_gpa?: number;

  @ApiProperty({ required: false })
  interest?: string;
}

class LearnerProfessionalDetailsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  learner_id: string;

  @ApiProperty({ required: false })
  company_name?: string;

  @ApiProperty({ required: false })
  job_title?: string;

  @ApiProperty({ required: false })
  years_experience?: number;

  @ApiProperty({ required: false })
  pipeline_dev_exp?: number;

  @ApiProperty({ required: false })
  portfolio_url?: string;
}

class LearnerProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty({ enum: ['student', 'professional'] })
  learner_type: 'student' | 'professional';

  @ApiProperty({ required: false })
  goals_text?: string;

  @ApiProperty()
  enrollment_date: string;

  @ApiProperty({ required: false })
  rank?: number;

  @ApiProperty()
  tasks_completed: number;

  @ApiProperty()
  streak_days: number;

  @ApiProperty({ required: false })
  last_activity_date?: string;

  @ApiProperty({ required: false })
  profile_image?: string;

  @ApiProperty({ type: LearnerStudentDetailsDto, required: false })
  learner_student_details?: LearnerStudentDetailsDto;

  @ApiProperty({ type: LearnerProfessionalDetailsDto, required: false })
  learner_professional_details?: LearnerProfessionalDetailsDto;

  @ApiProperty({ type: [Object], required: false })
  cohorts?: any[];

  @ApiProperty({ type: [Object], required: false })
  programs?: any[];
}

class TrainerProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty({ required: false })
  total_years_teaching?: number;

  @ApiProperty({ required: false })
  bio?: string;

  @ApiProperty({ required: false })
  linkedin_url?: string;

  @ApiProperty({ required: false })
  expertise?: string;

  @ApiProperty({ required: false })
  profile_image?: string;

  @ApiProperty({ required: false })
  website?: string;

  @ApiProperty({ required: false })
  social_links?: any;

  @ApiProperty({ type: [Object], required: false })
  trainer_specialities?: any[];

  @ApiProperty({ type: [Object], required: false })
  cohorts?: any[];

  @ApiProperty({ type: [Object], required: false })
  recentSessions?: any[];
}

class AdminProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty({ enum: ['global', 'organization', 'program'] })
  admin_level: 'global' | 'organization' | 'program';

  @ApiProperty({ required: false })
  phone_ext?: string;

  @ApiProperty({ required: false })
  notes?: string;
}

class RoleProfilesDto {
  @ApiProperty({ type: LearnerProfileDto, required: false })
  learner?: LearnerProfileDto;

  @ApiProperty({ type: TrainerProfileDto, required: false })
  trainer?: TrainerProfileDto;

  @ApiProperty({ type: AdminProfileDto, required: false })
  admin?: AdminProfileDto;
}

class UserStatsDto {
  @ApiProperty()
  totalPoints: number;
}

export class CurrentUserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  first_name?: string;

  @ApiProperty({ required: false })
  last_name?: string;

  @ApiProperty({ required: false })
  preferred_name?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  date_of_birth?: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  email_verified: boolean;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty({ type: [String], description: 'Array of active role names' })
  activeRoles: string[];

  @ApiProperty({ type: OrganizationDto, required: false })
  activeOrganization?: OrganizationDto;

  @ApiProperty({ type: RoleProfilesDto })
  roleProfiles: RoleProfilesDto;

  @ApiProperty({ type: UserStatsDto })
  stats: UserStatsDto;
}
