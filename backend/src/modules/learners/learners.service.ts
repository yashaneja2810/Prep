import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { UsersService } from '../users/users.service';
import { ProfileCompletenessDto } from './dto/learner-completeness.dto';
import {
  UpdateLearnerProfileDto,
  StudentDetailsDto,
  ProfessionalDetailsDto,
} from './dto/update-learner-profile.dto';
import {
  AUTH_TABLES,
  MESSAGES,
  COLUMNS,
  DB_ERROR_CODES,
  ROLE_IDS,
  ORDER_OPTIONS,
  LOG_MESSAGES,
  QUERY,
  SELECT_PATTERNS,
  LEARNER_TYPES,
} from '../../common/helpers/string-const';
import {
  checkLearnerProfileCompleteness as validateLearnerProfile,
  ProfileCompletenessResult,
  LearnerProfile,
  StudentDetails,
  ProfessionalDetails,
} from '../../common/helpers/profile-validation.helper';

@Injectable()
export class LearnersService {
  private readonly logger = new Logger(LearnersService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
  ) {}

  // ==================== LEARNER PROFILE MANAGEMENT ====================

  /**
   * Check learner profile completeness status
   * @param userId - The user ID to check profile completeness for
   * @returns ProfileCompletenessDto with completeness status and missing fields
   */
  async checkLearnerProfileCompleteness(
    userId: string,
  ): Promise<ProfileCompletenessDto> {
    try {
      this.logger.log(
        `Checking learner profile completeness for user: ${userId}`,
      );

      const supabase = this.supabaseService.createServiceClient();

      // Get learner profile data
      const { data: learnerProfile, error: profileError } = await supabase
        .from(AUTH_TABLES.LEARNER_PROFILES)
        .select(
          `
          *,
          learner_student_details (*),
          learner_professional_details (*)
        `,
        )
        .eq(COLUMNS.USER_ID, userId)
        .single();

      if (profileError || !learnerProfile) {
        this.logger.error(`Learner profile not found for user: ${userId}`);
        throw new NotFoundException('Learner profile not found');
      }

      // Prepare data for validation helper
      const profileData: LearnerProfile = {
        user_id: learnerProfile[COLUMNS.USER_ID],
        learner_type: learnerProfile[COLUMNS.LEARNER_TYPE],
        goals_text: learnerProfile[COLUMNS.GOALS_TEXT],
        is_active: learnerProfile[COLUMNS.IS_ACTIVE],
        created_at: learnerProfile[COLUMNS.CREATED_AT],
        updated_at: learnerProfile[COLUMNS.UPDATED_AT],
      };

      const studentDetails: StudentDetails | undefined = learnerProfile
        .learner_student_details?.[0]
        ? {
            learner_id: learnerProfile.learner_student_details[0].learner_id,
            college_name:
              learnerProfile.learner_student_details[0].college_name,
            degree_course:
              learnerProfile.learner_student_details[0].degree_course,
            expected_grad_year:
              learnerProfile.learner_student_details[0].expected_grad_year,
            current_gpa: learnerProfile.learner_student_details[0].current_gpa,
            interest: learnerProfile.learner_student_details[0].interest,
          }
        : undefined;

      const professionalDetails: ProfessionalDetails | undefined =
        learnerProfile.learner_professional_details?.[0]
          ? {
              learner_id:
                learnerProfile.learner_professional_details[0].learner_id,
              company_name:
                learnerProfile.learner_professional_details[0].company_name,
              job_title:
                learnerProfile.learner_professional_details[0].job_title,
              years_of_experience:
                learnerProfile.learner_professional_details[0]
                  .years_of_experience,
              pipeline_dev_exp:
                learnerProfile.learner_professional_details[0].pipeline_dev_exp,
              portfolio_url:
                learnerProfile.learner_professional_details[0].portfolio_url,
            }
          : undefined;

      // Use validation helper
      const validationResult: ProfileCompletenessResult =
        validateLearnerProfile(
          profileData,
          studentDetails,
          professionalDetails,
        );

      const result: ProfileCompletenessDto = {
        is_complete: validationResult.is_complete,
        missing_fields: validationResult.missing_fields,
        completion_percentage: validationResult.completion_percentage,
        completion_message: validationResult.completion_message,
      };

      this.logger.log(
        `Profile completeness check completed for user ${userId}: ${validationResult.completion_percentage}% complete`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to check learner profile completeness for user ${userId}: ${error.message}`,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to check profile completeness');
    }
  }

  /**
   * Gets complete learner profile by user ID including user basic info and conditional detail data
   * @param userId - The user ID
   * @returns Complete learner profile with user info and details
   */
  async getLearnerProfile(userId: string): Promise<any> {
    try {
      this.logger.log(`Fetching learner profile for user: ${userId}`);

      const supabase = this.supabaseService.createServiceClient();

      // Get learner profile with user basic info and conditional details
      const { data: learnerProfile, error: profileError } = await supabase
        .from(AUTH_TABLES.LEARNER_PROFILES)
        .select(
          `
          *,
          users!learner_profiles_user_id_fkey (
            first_name,
            last_name,
            email,
            phone,
            timezone
          ),
          learner_student_details (*),
          learner_professional_details (*)
        `,
        )
        .eq(COLUMNS.USER_ID, userId)
        .single();

      if (profileError || !learnerProfile) {
        this.logger.error(`Learner profile not found for user: ${userId}`);
        throw new NotFoundException('Learner profile not found');
      }

      // Fetch learner role active status
      const { data: learnerRole } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .select(COLUMNS.IS_ACTIVE)
        .eq(COLUMNS.USER_ID, userId)
        .eq(COLUMNS.ROLE_ID, ROLE_IDS.LEARNER)
        .single();

      const isActive = learnerRole ? learnerRole[COLUMNS.IS_ACTIVE] : false;

      // Format the response with conditional details
      const formattedProfile = {
        id: learnerProfile[COLUMNS.ID],
        user_id: learnerProfile[COLUMNS.USER_ID],
        learner_type: learnerProfile[COLUMNS.LEARNER_TYPE],
        status: learnerProfile.status,
        is_active: isActive,
        goals_text: learnerProfile[COLUMNS.GOALS_TEXT],
        created_at: learnerProfile[COLUMNS.CREATED_AT],
        updated_at: learnerProfile[COLUMNS.UPDATED_AT],
        user: learnerProfile.users,
        student_details: learnerProfile.learner_student_details || null,
        professional_details:
          learnerProfile.learner_professional_details || null,
      };

      this.logger.log(
        `Successfully retrieved learner profile for user: ${userId}`,
      );
      return formattedProfile;
    } catch (error) {
      this.logger.error(
        `Failed to get learner profile for user ${userId}: ${error.message}`,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve learner profile');
    }
  }

  /**
   * Updates learner profile and conditionally updates detail tables
   * @param userId - The user ID
   * @param updateData - The update data including optional nested details
   * @returns Updated complete learner profile
   */
  async updateLearnerProfile(
    userId: string,
    updateData: UpdateLearnerProfileDto,
  ): Promise<any> {
    try {
      this.logger.log(`Updating learner profile for user: ${userId}`);

      const supabase = this.supabaseService.createServiceClient();

      // First check if profile exists
      const existingProfile = await this.getLearnerProfile(userId);
      if (!existingProfile) {
        throw new NotFoundException('Learner profile not found');
      }

      // Update main learner profile
      const updateProfileData: any = {};
      if (updateData.learner_type !== undefined) {
        updateProfileData[COLUMNS.LEARNER_TYPE] = updateData.learner_type;
      }
      if (updateData.goals_text !== undefined) {
        updateProfileData[COLUMNS.GOALS_TEXT] = updateData.goals_text;
      }
      updateProfileData[COLUMNS.UPDATED_AT] = new Date().toISOString();

      if (Object.keys(updateProfileData).length > 1) {
        // More than just updated_at
        const { error: profileError } = await supabase
          .from(AUTH_TABLES.LEARNER_PROFILES)
          .update(updateProfileData)
          .eq(COLUMNS.USER_ID, userId);

        if (profileError) {
          this.logger.error(
            `Failed to update learner profile: ${profileError.message}`,
            profileError,
          );
          throw new BadRequestException('Failed to update learner profile');
        }
      }

      // Update student details if provided and learner_type is student
      if (
        updateData.student_details &&
        (updateData.learner_type === LEARNER_TYPES.STUDENT ||
          existingProfile.learner_type === LEARNER_TYPES.STUDENT)
      ) {
        await this.updateStudentDetails(
          existingProfile.id,
          updateData.student_details,
        );
      }

      // Update professional details if provided and learner_type is professional
      if (
        updateData.professional_details &&
        (updateData.learner_type === LEARNER_TYPES.PROFESSIONAL ||
          existingProfile.learner_type === LEARNER_TYPES.PROFESSIONAL)
      ) {
        await this.updateProfessionalDetails(
          existingProfile.id,
          updateData.professional_details,
        );
      }

      // Return updated complete profile
      const updatedProfile = await this.getLearnerProfile(userId);
      this.logger.log(
        `Successfully updated learner profile for user: ${userId}`,
      );
      return updatedProfile;
    } catch (error) {
      this.logger.error(
        `Failed to update learner profile for user ${userId}: ${error.message}`,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update learner profile');
    }
  }

  /**
   * Updates student details for a learner profile
   * @param learnerProfileId - The learner profile ID
   * @param details - Student details to update
   * @returns Updated student details
   */
  async updateStudentDetails(
    learnerProfileId: string,
    details: StudentDetailsDto,
  ): Promise<any> {
    try {
      this.logger.log(
        `Updating student details for learner profile: ${learnerProfileId}`,
      );

      const supabase = this.supabaseService.createServiceClient();

      // Validate required fields are not being set to null
      if (
        details.college_name === null ||
        details.degree_course === null ||
        details.current_gpa === null ||
        details.expected_grad_year === null
      ) {
        throw new BadRequestException(
          'Required student detail fields cannot be null',
        );
      }

      const updateData = {
        ...details,
        [COLUMNS.UPDATED_AT]: new Date().toISOString(),
      };

      // Check if student details record exists
      const { data: existingDetails } = await supabase
        .from(AUTH_TABLES.LEARNER_STUDENT_DETAILS)
        .select(COLUMNS.ID)
        .eq(COLUMNS.LEARNER_ID, learnerProfileId)
        .single();

      if (existingDetails) {
        // Update existing record
        const { data, error } = await supabase
          .from(AUTH_TABLES.LEARNER_STUDENT_DETAILS)
          .update(updateData)
          .eq(COLUMNS.LEARNER_ID, learnerProfileId)
          .select(QUERY.SELECT_ALL)
          .single();

        if (error) {
          this.logger.error(
            `Failed to update student details: ${error.message}`,
            error,
          );
          throw new BadRequestException('Failed to update student details');
        }
        return data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from(AUTH_TABLES.LEARNER_STUDENT_DETAILS)
          .insert({
            [COLUMNS.LEARNER_ID]: learnerProfileId,
            ...updateData,
          })
          .select(QUERY.SELECT_ALL)
          .single();

        if (error) {
          this.logger.error(
            `Failed to create student details: ${error.message}`,
            error,
          );
          throw new BadRequestException('Failed to create student details');
        }
        return data;
      }
    } catch (error) {
      this.logger.error(`Failed to update student details: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update student details');
    }
  }

  /**
   * Updates professional details for a learner profile
   * @param learnerProfileId - The learner profile ID
   * @param details - Professional details to update
   * @returns Updated professional details
   */
  async updateProfessionalDetails(
    learnerProfileId: string,
    details: ProfessionalDetailsDto,
  ): Promise<any> {
    try {
      this.logger.log(
        `Updating professional details for learner profile: ${learnerProfileId}`,
      );

      const supabase = this.supabaseService.createServiceClient();

      // Validate required fields are not being set to null
      if (
        details.company_name === null ||
        details.job_title === null ||
        details.years_experience === null ||
        details.pipeline_dev_exp === null
      ) {
        throw new BadRequestException(
          'Required professional detail fields cannot be null',
        );
      }

      const updateData = {
        ...details,
        [COLUMNS.UPDATED_AT]: new Date().toISOString(),
      };

      // Check if professional details record exists
      const { data: existingDetails } = await supabase
        .from(AUTH_TABLES.LEARNER_PROFESSIONAL_DETAILS)
        .select(COLUMNS.ID)
        .eq(COLUMNS.LEARNER_ID, learnerProfileId)
        .single();

      if (existingDetails) {
        // Update existing record
        const { data, error } = await supabase
          .from(AUTH_TABLES.LEARNER_PROFESSIONAL_DETAILS)
          .update(updateData)
          .eq(COLUMNS.LEARNER_ID, learnerProfileId)
          .select(QUERY.SELECT_ALL)
          .single();

        if (error) {
          this.logger.error(
            `Failed to update professional details: ${error.message}`,
            error,
          );
          throw new BadRequestException(
            'Failed to update professional details',
          );
        }
        return data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from(AUTH_TABLES.LEARNER_PROFESSIONAL_DETAILS)
          .insert({
            [COLUMNS.LEARNER_ID]: learnerProfileId,
            ...updateData,
          })
          .select(QUERY.SELECT_ALL)
          .single();

        if (error) {
          this.logger.error(
            `Failed to create professional details: ${error.message}`,
            error,
          );
          throw new BadRequestException(
            'Failed to create professional details',
          );
        }
        return data;
      }
    } catch (error) {
      this.logger.error(
        `Failed to update professional details: ${error.message}`,
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update professional details');
    }
  }

  /**
   * Get all learner profiles for admin
   * @returns All learner profiles with completion status
   */
  async getAllLearnerProfiles(): Promise<any[]> {
    try {
      this.logger.log(`Admin getting all learner profiles`);

      const supabase = this.supabaseService.createServiceClient();

      // Build query to get all learner profiles
      const { data: profiles, error: profilesError } = await supabase
        .from(AUTH_TABLES.LEARNER_PROFILES)
        .select(
          `
          *,
          users!learner_profiles_user_id_fkey (
            id,
            email,
            first_name,
            last_name,
            phone,
            timezone,
            is_active,
            created_at
          ),
          learner_student_details (
            id,
            college_name,
            degree_course,
            current_gpa,
            expected_grad_year,
            interest
          ),
          learner_professional_details (
            id,
            company_name,
            job_title,
            years_experience,
            pipeline_dev_exp,
            portfolio_url
          )
        `,
        )
        .order(COLUMNS.CREATED_AT, { ascending: false });

      if (profilesError) {
        this.logger.error(
          `Error fetching learner profiles: ${profilesError.message}`,
        );
        throw new BadRequestException('Failed to fetch learner profiles');
      }

      // Bulk fetch learner role active status for all profiles
      const userIds = (profiles || []).map((p) => p[COLUMNS.USER_ID]);
      const { data: userRoles } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .select(`${COLUMNS.USER_ID}, ${COLUMNS.IS_ACTIVE}`)
        .in(COLUMNS.USER_ID, userIds)
        .eq(COLUMNS.ROLE_ID, ROLE_IDS.LEARNER);

      const userRoleMap = new Map(
        (userRoles || []).map((ur) => [ur[COLUMNS.USER_ID], ur[COLUMNS.IS_ACTIVE]]),
      );

      // Add completion status to each profile
      const profilesWithCompleteness = await Promise.all(
        (profiles || []).map(async (profile) => {
          try {
            const completeness = await this.checkLearnerProfileCompleteness(
              profile.user_id,
            );
            return {
              ...profile,
              is_active: userRoleMap.get(profile.user_id) ?? false,
              completeness_status: completeness,
            };
          } catch (error) {
            this.logger.warn(
              `Failed to check completeness for profile ${profile.id}: ${error.message}`,
            );
            return {
              ...profile,
              is_active: userRoleMap.get(profile.user_id) ?? false,
              completeness_status: {
                is_complete: false,
                missing_fields: ['unknown'],
                completion_percentage: 0,
                completion_message: 'Unable to determine completion status',
              },
            };
          }
        }),
      );

      this.logger.log(
        `Successfully retrieved ${profilesWithCompleteness.length} learner profiles`,
      );

      return profilesWithCompleteness;
    } catch (error) {
      this.logger.error(`Failed to get all learner profiles: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch learner profiles');
    }
  }

  /**
   * Get specific learner profile by user ID for admin
   * @param userId - The user ID
   * @returns Complete learner profile with completion status
   */
  async getLearnerProfileByAdmin(userId: string): Promise<any> {
    try {
      this.logger.log(`Admin retrieving learner profile for user: ${userId}`);

      // Get the learner profile using existing method
      const profile = await this.getLearnerProfile(userId);

      // Add completion status for admin view
      const completeness = await this.checkLearnerProfileCompleteness(userId);

      const profileWithCompleteness = {
        ...profile,
        completeness_status: completeness,
      };

      this.logger.log(
        `Admin successfully retrieved learner profile for user: ${userId}`,
      );
      return profileWithCompleteness;
    } catch (error) {
      this.logger.error(
        `Failed to get learner profile for admin (user: ${userId}): ${error.message}`,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch learner profile');
    }
  }

  // ==================== LEARNER ROLE ASSIGNMENT ====================

  /**
   * Assign learner role to user by email (Admin only)
   * This triggers automatic creation of learner_profiles record via database trigger
   */
  async assignLearnerRole(
    email: string,
    assignedBy: string,
    accessToken?: string,
  ): Promise<any> {
    try {
      this.logger.log(`Admin assigning learner role to email: ${email}`);

      // Use authenticated client if access token is provided, otherwise use service client
      const supabase = accessToken
        ? this.supabaseService.createAuthenticatedClient(accessToken)
        : this.supabaseService.createServiceClient();

      // Find user by email using UsersService
      const user = await this.usersService.findUserByEmail(email);

      // Check if user already has learner role
      const { data: existingRole } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .select('id, is_active')
        .eq(COLUMNS.USER_ID, user.id)
        .eq(COLUMNS.ROLE_ID, ROLE_IDS.LEARNER)
        .single();

      if (existingRole) {
        throw new BadRequestException(MESSAGES.ALREADY_HAS_ROLE);
      }

      // Create learner role assignment
      const roleAssignment = {
        user_id: user.id,
        role_id: ROLE_IDS.LEARNER,
        is_active: true,
        assigned_by: assignedBy,
        assigned_at: new Date().toISOString(),
      };

      const { data: newRole, error: createError } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .insert(roleAssignment)
        .select(
          `
          *,
          roles!fk_user_roles_role_id (
            id,
            role_name,
            description
          )
        `,
        )
        .single();

      if (createError) {
        this.logger.error(
          `Error creating learner role assignment: ${createError.message}`,
        );
        throw new BadRequestException('Failed to assign learner role');
      }

      this.logger.log(`Successfully assigned learner role to user: ${email}`);
      return newRole;
    } catch (error) {
      this.logger.error(`Failed to assign learner role: ${error.message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to assign learner role');
    }
  }

  /**
   * Assign learner roles to multiple users by email (Admin only - Batch Operation)
   * Processes each email individually and returns results for each, allowing partial failures
   */
  async assignLearnerRolesBatch(
    emails: string[],
    assignedBy: string,
    accessToken?: string,
  ): Promise<any> {
    try {
      this.logger.log(
        `Admin ${assignedBy} assigning learner roles to ${emails.length} emails in batch`,
      );

      const results: any[] = [];
      let successful = 0;
      let failed = 0;

      // Process each email individually
      for (const email of emails) {
        try {
          const roleAssignment = await this.assignLearnerRole(
            email,
            assignedBy,
            accessToken,
          );

          results.push({
            email,
            success: true,
            message: MESSAGES.LEARNER_ADDED,
            data: roleAssignment,
            error: null,
          });
          successful++;
        } catch (error) {
          this.logger.warn(
            `Failed to assign learner role to ${email}: ${error.message}`,
          );

          results.push({
            email,
            success: false,
            message: 'Failed to assign learner role',
            data: null,
            error: error.message || 'Unknown error occurred',
          });
          failed++;
        }
      }

      const batchResult = {
        totalRequested: emails.length,
        successful,
        failed,
        results,
      };

      this.logger.log(
        `Batch learner role assignment completed: ${successful} successful, ${failed} failed out of ${emails.length} total`,
      );

      return batchResult;
    } catch (error) {
      this.logger.error(
        `Critical error in batch learner role assignment: ${error.message}`,
      );
      throw new BadRequestException('Failed to process batch learner assignment');
    }
  }
} 