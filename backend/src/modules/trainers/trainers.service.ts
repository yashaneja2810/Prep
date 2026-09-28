import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { UsersService } from '../users/users.service';
import {
  CreateTrainerProfileDto,
  UpdateTrainerProfileDto,
  CreateSpecialityDto,
  UpdateSpecialityDto,
} from './dto';
import {
  TrainerProfile,
  TrainerProfileWithUser,
  Speciality,
} from '../../common/types/user.types';
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
} from '../../common/helpers/string-const';

@Injectable()
export class TrainersService {
  private readonly logger = new Logger(TrainersService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
  ) {}

  // ==================== TRAINER PROFILE METHODS ====================

  /**
   * Creates a new trainer profile using email to find the user
   * @param createTrainerProfileDto - The profile data including email and specialities
   * @returns Created trainer profile with specialities
   */
  async createTrainerProfile(
    createTrainerProfileDto: CreateTrainerProfileDto,
  ): Promise<TrainerProfileWithUser> {
    const supabase = this.supabaseService.createServiceClient();

    try {
      this.logger.log(
        `Creating trainer profile for email: ${createTrainerProfileDto.email}`,
      );

      // First, find the user by email
      const user = await this.usersService.findUserByEmail(
        createTrainerProfileDto.email,
      );

      if (!user) {
        this.logger.error(
          `User not found with email: ${createTrainerProfileDto.email}`,
        );
        throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
      }

      // Check if email is verified
      if (!user[COLUMNS.EMAIL_VERIFIED]) {
        this.logger.error(
          `Email not verified for user: ${createTrainerProfileDto.email}`,
        );
        throw new BadRequestException(MESSAGES.TRAINER_EMAIL_NOT_VERIFIED);
      }

      // Check if user is active
      if (!user[COLUMNS.IS_ACTIVE]) {
        this.logger.error(
          `Inactive user attempted trainer profile creation: ${createTrainerProfileDto.email}`,
        );
        throw new BadRequestException(MESSAGES.TRAINER_USER_INACTIVE);
      }

      this.logger.log(
        `User found and verified: ${user[COLUMNS.ID]} for email: ${createTrainerProfileDto.email}`,
      );

      // Validate specialities exist
      await this.validateSpecialities(createTrainerProfileDto.specialities);

      // Create the trainer profile
      const { data: profileData, error: profileError } = await supabase
        .from(AUTH_TABLES.TRAINER_PROFILES)
        .insert({
          [COLUMNS.USER_ID]: user[COLUMNS.ID],
          [COLUMNS.TOTAL_YEARS_TEACHING]:
            createTrainerProfileDto.total_years_teaching,
          [COLUMNS.BIO]: createTrainerProfileDto.bio,
          [COLUMNS.LINKEDIN_URL]: createTrainerProfileDto.linkedin_url,
          [COLUMNS.EXPERTISE]: createTrainerProfileDto.expertise,
          [COLUMNS.PROFILE_IMAGE]: createTrainerProfileDto.profile_image,
          [COLUMNS.WEBSITE]: createTrainerProfileDto.website,
          [COLUMNS.SOCIAL_LINKS]: createTrainerProfileDto.social_links,
        })
        .select(QUERY.SELECT_ALL)
        .single();

      if (profileError) {
        this.logger.error(
          `Failed to create trainer profile: ${profileError.message}`,
          profileError,
        );

        // Handle specific duplicate errors
        if (profileError.code === DB_ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION) {
          throw new BadRequestException(MESSAGES.TRAINER_PROFILE_EXISTS);
        }

        throw new InternalServerErrorException(
          'Failed to create trainer profile',
        );
      }

      // Insert trainer specialities
      await this.insertTrainerSpecialities(
        profileData[COLUMNS.ID],
        createTrainerProfileDto.specialities,
      );

      // Get complete profile with specialities
      const completeProfile = await this.getTrainerProfileById(
        profileData[COLUMNS.ID],
      );

      if (!completeProfile) {
        throw new InternalServerErrorException(
          'Failed to retrieve created trainer profile',
        );
      }

      this.logger.log(
        `Successfully created trainer profile for user: ${user[COLUMNS.ID]} (${createTrainerProfileDto.email})`,
      );
      return completeProfile;
    } catch (error) {
      this.logger.error(
        `Error creating trainer profile for email ${createTrainerProfileDto.email}:`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create trainer profile',
      );
    }
  }

  /**
   * Updates an existing trainer profile
   * @param profileId - The trainer profile ID
   * @param updateTrainerProfileDto - The update data including optional specialities
   * @returns Updated trainer profile with specialities
   */
  async updateTrainerProfile(
    profileId: string,
    updateTrainerProfileDto: UpdateTrainerProfileDto,
  ): Promise<TrainerProfileWithUser> {
    const supabase = this.supabaseService.createServiceClient();

    try {
      this.logger.log(`Updating trainer profile with ID: ${profileId}`);

      // Check if profile exists
      const existingProfile = await this.getTrainerProfileById(profileId);
      if (!existingProfile) {
        throw new NotFoundException(MESSAGES.TRAINER_PROFILE_NOT_FOUND);
      }

      // Validate specialities if provided
      if (updateTrainerProfileDto.specialities) {
        await this.validateSpecialities(updateTrainerProfileDto.specialities);
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from(AUTH_TABLES.TRAINER_PROFILES)
        .update({
          [COLUMNS.TOTAL_YEARS_TEACHING]:
            updateTrainerProfileDto.total_years_teaching ??
            existingProfile.total_years_teaching,
          [COLUMNS.BIO]: updateTrainerProfileDto.bio ?? existingProfile.bio,
          [COLUMNS.LINKEDIN_URL]:
            updateTrainerProfileDto.linkedin_url ??
            existingProfile.linkedin_url,
          [COLUMNS.EXPERTISE]:
            updateTrainerProfileDto.expertise ?? existingProfile.expertise,
          [COLUMNS.PROFILE_IMAGE]:
            updateTrainerProfileDto.profile_image ??
            existingProfile.profile_image,
          [COLUMNS.WEBSITE]:
            updateTrainerProfileDto.website ?? existingProfile.website,
          [COLUMNS.SOCIAL_LINKS]:
            updateTrainerProfileDto.social_links ??
            existingProfile.social_links,
          [COLUMNS.UPDATED_AT]: new Date().toISOString(),
        })
        .eq(COLUMNS.ID, profileId)
        .select(QUERY.SELECT_ALL)
        .single();

      if (updateError) {
        this.logger.error(
          `Failed to update trainer profile: ${updateError.message}`,
          updateError,
        );
        throw new InternalServerErrorException(
          'Failed to update trainer profile',
        );
      }

      // Update specialities if provided
      if (updateTrainerProfileDto.specialities) {
        await this.updateTrainerSpecialities(
          profileId,
          updateTrainerProfileDto.specialities,
        );
      }

      // Get complete updated profile with specialities
      const completeProfile = await this.getTrainerProfileById(profileId);

      if (!completeProfile) {
        throw new InternalServerErrorException(
          'Failed to retrieve updated trainer profile',
        );
      }

      this.logger.log(
        `Successfully updated trainer profile with ID: ${profileId}`,
      );
      return completeProfile;
    } catch (error) {
      this.logger.error(
        `Error updating trainer profile with ID ${profileId}:`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update trainer profile',
      );
    }
  }

  /**
   * Retrieves trainer profiles for a user with user details, specialities, and active status (can be multiple)
   * @param userId - The user ID
   * @returns Array of trainer profiles with user details, specialities, and active status for the user
   */
  async getTrainerProfilesByUserId(
    userId: string,
  ): Promise<TrainerProfileWithUser[]> {
    const supabase = this.supabaseService.createServiceClient();

    try {
      this.logger.log(
        `Fetching trainer profiles with user details for user: ${userId}`,
      );

      const { data: profiles, error: profileError } = await supabase
        .from(AUTH_TABLES.TRAINER_PROFILES)
        .select(SELECT_PATTERNS.TRAINER_WITH_USER)
        .eq(COLUMNS.USER_ID, userId)
        .order(COLUMNS.CREATED_AT, ORDER_OPTIONS.DESCENDING);

      if (profileError) {
        this.logger.error(
          `Failed to fetch trainer profiles: ${profileError.message}`,
          profileError,
        );
        throw new InternalServerErrorException(
          'Failed to fetch trainer profiles',
        );
      }

      // Get is_active status from user_roles
      const { data: userRole } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .select(COLUMNS.IS_ACTIVE)
        .eq(COLUMNS.USER_ID, userId)
        .eq(COLUMNS.ROLE_ID, ROLE_IDS.TRAINER)
        .single();

      // Transform the data and get specialities for each profile
      const transformedProfiles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const specialities = await this.getTrainerSpecialities(
            profile[COLUMNS.ID],
          );

          return {
            [COLUMNS.ID]: profile[COLUMNS.ID],
            [COLUMNS.USER_ID]: profile[COLUMNS.USER_ID],
            [COLUMNS.FIRST_NAME]: profile.users?.[COLUMNS.FIRST_NAME] || null,
            [COLUMNS.EMAIL]: profile.users?.[COLUMNS.EMAIL] || '',
            specialities: specialities,
            [COLUMNS.IS_ACTIVE]: userRole?.[COLUMNS.IS_ACTIVE] ?? true,
            [COLUMNS.TOTAL_YEARS_TEACHING]:
              profile[COLUMNS.TOTAL_YEARS_TEACHING],
            [COLUMNS.BIO]: profile[COLUMNS.BIO],
            [COLUMNS.LINKEDIN_URL]: profile[COLUMNS.LINKEDIN_URL],
            [COLUMNS.EXPERTISE]: profile[COLUMNS.EXPERTISE],
            [COLUMNS.PROFILE_IMAGE]: profile[COLUMNS.PROFILE_IMAGE],
            [COLUMNS.WEBSITE]: profile[COLUMNS.WEBSITE],
            [COLUMNS.SOCIAL_LINKS]: profile[COLUMNS.SOCIAL_LINKS],
            [COLUMNS.CREATED_AT]: profile[COLUMNS.CREATED_AT],
            [COLUMNS.UPDATED_AT]: profile[COLUMNS.UPDATED_AT],
          };
        }),
      );

      this.logger.log(
        `Successfully fetched ${transformedProfiles.length} trainer profiles with user details for user: ${userId}`,
      );
      return transformedProfiles;
    } catch (error) {
      this.logger.error(
        `Error fetching trainer profiles for user ${userId}:`,
        error.stack,
      );
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch trainer profiles',
      );
    }
  }

  /**
   * Retrieves a single trainer profile by its ID with user details, specialities, and active status
   * @param profileId - The trainer profile ID
   * @returns Trainer profile with user details, specialities, and active status or null if not found
   */
  async getTrainerProfileById(
    profileId: string,
  ): Promise<TrainerProfileWithUser | null> {
    const supabase = this.supabaseService.createServiceClient();

    try {
      this.logger.log(
        `Fetching trainer profile with user details by ID: ${profileId}`,
      );

      const { data: profile, error: profileError } = await supabase
        .from(AUTH_TABLES.TRAINER_PROFILES)
        .select(SELECT_PATTERNS.TRAINER_WITH_USER)
        .eq(COLUMNS.ID, profileId)
        .single();

      if (profileError) {
        if (profileError.code === DB_ERROR_CODES.NO_ROWS_RETURNED) {
          return null;
        }
        this.logger.error(
          `Failed to fetch trainer profile: ${profileError.message}`,
          profileError,
        );
        throw new InternalServerErrorException(
          'Failed to fetch trainer profile',
        );
      }

      // Get specialities for this trainer
      const specialities = await this.getTrainerSpecialities(profileId);

      // Get is_active status from user_roles
      const { data: userRole } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .select(COLUMNS.IS_ACTIVE)
        .eq(COLUMNS.USER_ID, profile[COLUMNS.USER_ID])
        .eq(COLUMNS.ROLE_ID, ROLE_IDS.TRAINER)
        .single();

      // Transform the data to flatten the users object and add specialities/is_active
      const transformedProfile: TrainerProfileWithUser = {
        [COLUMNS.ID]: profile[COLUMNS.ID],
        [COLUMNS.USER_ID]: profile[COLUMNS.USER_ID],
        [COLUMNS.FIRST_NAME]: profile.users?.[COLUMNS.FIRST_NAME] || null,
        [COLUMNS.EMAIL]: profile.users?.[COLUMNS.EMAIL] || '',
        specialities: specialities,
        [COLUMNS.IS_ACTIVE]: userRole?.[COLUMNS.IS_ACTIVE] ?? true,
        [COLUMNS.TOTAL_YEARS_TEACHING]: profile[COLUMNS.TOTAL_YEARS_TEACHING],
        [COLUMNS.BIO]: profile[COLUMNS.BIO],
        [COLUMNS.LINKEDIN_URL]: profile[COLUMNS.LINKEDIN_URL],
        [COLUMNS.EXPERTISE]: profile[COLUMNS.EXPERTISE],
        [COLUMNS.PROFILE_IMAGE]: profile[COLUMNS.PROFILE_IMAGE],
        [COLUMNS.WEBSITE]: profile[COLUMNS.WEBSITE],
        [COLUMNS.SOCIAL_LINKS]: profile[COLUMNS.SOCIAL_LINKS],
        [COLUMNS.CREATED_AT]: profile[COLUMNS.CREATED_AT],
        [COLUMNS.UPDATED_AT]: profile[COLUMNS.UPDATED_AT],
      };

      this.logger.log(
        `Successfully fetched trainer profile with user details by ID: ${profileId}`,
      );
      return transformedProfile;
    } catch (error) {
      this.logger.error(
        `Error fetching trainer profile by ID ${profileId}:`,
        error.stack,
      );
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch trainer profile');
    }
  }

  /**
   * Retrieves all trainer profiles (active and inactive) with user details, specialities, and active status
   * @returns Array of all trainer profiles with user details, specialities, and active status
   */
  async getAllTrainerProfiles(): Promise<TrainerProfileWithUser[]> {
    const supabase = this.supabaseService.createServiceClient();

    try {
      this.logger.log('Fetching all trainer profiles with user details');

      const { data: profiles, error: profileError } = await supabase
        .from(AUTH_TABLES.TRAINER_PROFILES)
        .select(SELECT_PATTERNS.TRAINER_WITH_USER)
        .order(COLUMNS.CREATED_AT, ORDER_OPTIONS.DESCENDING);

      if (profileError) {
        this.logger.error(
          `Failed to fetch trainer profiles: ${profileError.message}`,
          profileError,
        );
        throw new InternalServerErrorException(
          'Failed to fetch trainer profiles',
        );
      }

      // Transform the data and get specialities for each profile
      const transformedProfiles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const specialities = await this.getTrainerSpecialities(
            profile[COLUMNS.ID],
          );

          // Get is_active status from user_roles for each trainer
          const { data: userRole } = await supabase
            .from(AUTH_TABLES.USER_ROLES)
            .select(COLUMNS.IS_ACTIVE)
            .eq(COLUMNS.USER_ID, profile[COLUMNS.USER_ID])
            .eq(COLUMNS.ROLE_ID, ROLE_IDS.TRAINER)
            .single();

          return {
            [COLUMNS.ID]: profile[COLUMNS.ID],
            [COLUMNS.USER_ID]: profile[COLUMNS.USER_ID],
            [COLUMNS.FIRST_NAME]: profile.users?.[COLUMNS.FIRST_NAME] || null,
            [COLUMNS.EMAIL]: profile.users?.[COLUMNS.EMAIL] || '',
            specialities: specialities,
            [COLUMNS.IS_ACTIVE]: userRole?.[COLUMNS.IS_ACTIVE] ?? true,
            [COLUMNS.TOTAL_YEARS_TEACHING]:
              profile[COLUMNS.TOTAL_YEARS_TEACHING],
            [COLUMNS.BIO]: profile[COLUMNS.BIO],
            [COLUMNS.LINKEDIN_URL]: profile[COLUMNS.LINKEDIN_URL],
            [COLUMNS.EXPERTISE]: profile[COLUMNS.EXPERTISE],
            [COLUMNS.PROFILE_IMAGE]: profile[COLUMNS.PROFILE_IMAGE],
            [COLUMNS.WEBSITE]: profile[COLUMNS.WEBSITE],
            [COLUMNS.SOCIAL_LINKS]: profile[COLUMNS.SOCIAL_LINKS],
            [COLUMNS.CREATED_AT]: profile[COLUMNS.CREATED_AT],
            [COLUMNS.UPDATED_AT]: profile[COLUMNS.UPDATED_AT],
          };
        }),
      );

      this.logger.log(
        `Successfully fetched ${transformedProfiles.length} trainer profiles with user details`,
      );
      return transformedProfiles;
    } catch (error) {
      this.logger.error(
        'Error fetching all trainer profiles:',
        error.stack,
      );
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch trainer profiles',
      );
    }
  }

  /**
   * Deactivates a trainer profile by setting user role as inactive
   * @param profileId - The trainer profile ID to deactivate
   * @returns Deactivated trainer profile with user details
   */
  async deleteTrainerProfile(
    profileId: string,
  ): Promise<TrainerProfileWithUser> {
    const supabase = this.supabaseService.createServiceClient();

    try {
      this.logger.log(`Deactivating trainer profile with ID: ${profileId}`);

      // First, check if the profile exists and get its details
      const existingProfile = await this.getTrainerProfileById(profileId);
      if (!existingProfile) {
        throw new NotFoundException(MESSAGES.TRAINER_PROFILE_NOT_FOUND);
      }

      // Soft delete by setting is_active = false in user_roles table
      const { error: roleUpdateError } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .update({
          [COLUMNS.IS_ACTIVE]: false,
          [COLUMNS.UPDATED_AT]: new Date().toISOString(),
        })
        .eq(COLUMNS.USER_ID, existingProfile[COLUMNS.USER_ID])
        .eq(COLUMNS.ROLE_ID, ROLE_IDS.TRAINER);

      if (roleUpdateError) {
        this.logger.error(
          `Failed to deactivate trainer role: ${roleUpdateError.message}`,
          roleUpdateError,
        );
        throw new InternalServerErrorException(
          'Failed to deactivate trainer profile',
        );
      }

      // Get updated profile with is_active status
      const deactivatedProfile = await this.getTrainerProfileById(profileId);
      if (!deactivatedProfile) {
        throw new InternalServerErrorException(
          'Failed to retrieve deactivated profile',
        );
      }

      this.logger.log(
        `Successfully deactivated trainer profile with ID: ${profileId}`,
      );
      return deactivatedProfile;
    } catch (error) {
      this.logger.error(
        `Error deactivating trainer profile with ID ${profileId}:`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to deactivate trainer profile',
      );
    }
  }

  /**
   * Reactivates a trainer profile by setting user role as active
   * @param profileId - The trainer profile ID to reactivate
   * @returns Reactivated trainer profile with user details
   */
  async reactivateTrainerProfile(
    profileId: string,
  ): Promise<TrainerProfileWithUser> {
    const supabase = this.supabaseService.createServiceClient();

    try {
      this.logger.log(`Reactivating trainer profile with ID: ${profileId}`);

      // First, check if the profile exists and get its details
      const existingProfile = await this.getTrainerProfileById(profileId);
      if (!existingProfile) {
        throw new NotFoundException(MESSAGES.TRAINER_PROFILE_NOT_FOUND);
      }

      // Check if already active
      if (existingProfile[COLUMNS.IS_ACTIVE] === true) {
        throw new BadRequestException(MESSAGES.TRAINER_PROFILE_ALREADY_ACTIVE);
      }

      // Reactivate by setting is_active = true in user_roles table
      const { error: roleUpdateError } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .update({
          [COLUMNS.IS_ACTIVE]: true,
          [COLUMNS.UPDATED_AT]: new Date().toISOString(),
        })
        .eq(COLUMNS.USER_ID, existingProfile[COLUMNS.USER_ID])
        .eq(COLUMNS.ROLE_ID, ROLE_IDS.TRAINER);

      if (roleUpdateError) {
        this.logger.error(
          `Failed to reactivate trainer role: ${roleUpdateError.message}`,
          roleUpdateError,
        );
        throw new InternalServerErrorException(
          'Failed to reactivate trainer profile',
        );
      }

      // Get updated profile with is_active status
      const reactivatedProfile = await this.getTrainerProfileById(profileId);
      if (!reactivatedProfile) {
        throw new InternalServerErrorException(
          'Failed to retrieve reactivated profile',
        );
      }

      this.logger.log(
        `Successfully reactivated trainer profile with ID: ${profileId}`,
      );
      return reactivatedProfile;
    } catch (error) {
      this.logger.error(
        `Error reactivating trainer profile with ID ${profileId}:`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to reactivate trainer profile',
      );
    }
  }

  /**
   * Permanently deletes a trainer profile and all associated data
   * @param profileId - The trainer profile ID to permanently delete
   * @returns Deleted trainer profile information
   */
  async permanentlyDeleteTrainerProfile(profileId: string): Promise<any> {
    const supabase = this.supabaseService.createServiceClient();

    try {
      this.logger.warn(
        `PERMANENTLY DELETING trainer profile with ID: ${profileId}`,
      );

      // First, get the profile to return after deletion
      const profileToDelete = await this.getTrainerProfileById(profileId);
      if (!profileToDelete) {
        throw new NotFoundException(MESSAGES.TRAINER_PROFILE_NOT_FOUND);
      }

      // Delete trainer specialities first (foreign key constraint)
      const { error: specialitiesError } = await supabase
        .from(AUTH_TABLES.TRAINER_SPECIALITIES)
        .delete()
        .eq(COLUMNS.TRAINER_PROFILE_ID, profileId);

      if (specialitiesError) {
        this.logger.error(
          `Failed to delete trainer specialities: ${specialitiesError.message}`,
          specialitiesError,
        );
        throw new InternalServerErrorException(
          'Failed to delete trainer specialities',
        );
      }

      // Delete the trainer profile
      const { error: profileError } = await supabase
        .from(AUTH_TABLES.TRAINER_PROFILES)
        .delete()
        .eq(COLUMNS.ID, profileId);

      if (profileError) {
        this.logger.error(
          `Failed to delete trainer profile: ${profileError.message}`,
          profileError,
        );
        throw new InternalServerErrorException(
          'Failed to delete trainer profile',
        );
      }

      this.logger.warn(
        `Successfully PERMANENTLY DELETED trainer profile with ID: ${profileId}`,
      );

      return {
        id: profileToDelete.id,
        user_id: profileToDelete.user_id,
        first_name: profileToDelete.first_name,
        email: profileToDelete.email,
        message: 'Profile has been permanently removed from the database',
      };
    } catch (error) {
      this.logger.error(
        `Error permanently deleting trainer profile with ID ${profileId}:`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to permanently delete trainer profile',
      );
    }
  }

  // ==================== SPECIALITY METHODS ====================

  /**
   * Creates a new speciality
   * @param createSpecialityDto - The speciality data
   * @returns Created speciality
   */
  async createSpeciality(
    createSpecialityDto: CreateSpecialityDto,
  ): Promise<Speciality> {
    const supabase = this.supabaseService.createServiceClient();

    try {
      this.logger.log(
        `Creating speciality: ${createSpecialityDto.name}`,
      );

      const { data: speciality, error: specialityError } = await supabase
        .from(AUTH_TABLES.SPECIALITIES)
        .insert({
          [COLUMNS.NAME]: createSpecialityDto.name,
        })
        .select(QUERY.SELECT_ALL)
        .single();

      if (specialityError) {
        this.logger.error(
          `Failed to create speciality: ${specialityError.message}`,
          specialityError,
        );

        if (specialityError.code === DB_ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION) {
          throw new BadRequestException('Speciality name already exists');
        }

        throw new InternalServerErrorException('Failed to create speciality');
      }

      this.logger.log(
        `Successfully created speciality: ${speciality[COLUMNS.NAME]} with ID: ${speciality[COLUMNS.ID]}`,
      );
      return speciality;
    } catch (error) {
      this.logger.error(
        `Error creating speciality ${createSpecialityDto.name}:`,
        error.stack,
      );
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create speciality');
    }
  }

  /**
   * Updates an existing speciality
   * @param id - The speciality ID
   * @param updateSpecialityDto - The update data
   * @returns Updated speciality
   */
  async updateSpeciality(
    id: number,
    updateSpecialityDto: UpdateSpecialityDto,
  ): Promise<Speciality> {
    const supabase = this.supabaseService.createServiceClient();

    try {
      this.logger.log(`Updating speciality with ID: ${id}`);

      // Check if speciality exists
      const { data: existingSpeciality, error: fetchError } = await supabase
        .from(AUTH_TABLES.SPECIALITIES)
        .select(QUERY.SELECT_ALL)
        .eq(COLUMNS.ID, id)
        .single();

      if (fetchError || !existingSpeciality) {
        this.logger.error(`Speciality not found with ID: ${id}`);
        throw new NotFoundException('Speciality not found');
      }

      const { data: updatedSpeciality, error: updateError } = await supabase
        .from(AUTH_TABLES.SPECIALITIES)
        .update({
          [COLUMNS.NAME]: updateSpecialityDto.name ?? existingSpeciality[COLUMNS.NAME],
          [COLUMNS.UPDATED_AT]: new Date().toISOString(),
        })
        .eq(COLUMNS.ID, id)
        .select(QUERY.SELECT_ALL)
        .single();

      if (updateError) {
        this.logger.error(
          `Failed to update speciality: ${updateError.message}`,
          updateError,
        );

        if (updateError.code === DB_ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION) {
          throw new BadRequestException('Speciality name already exists');
        }

        throw new InternalServerErrorException('Failed to update speciality');
      }

      this.logger.log(
        `Successfully updated speciality with ID: ${id}`,
      );
      return updatedSpeciality;
    } catch (error) {
      this.logger.error(
        `Error updating speciality with ID ${id}:`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update speciality');
    }
  }

  /**
   * Retrieves all specialities
   * @returns Array of all specialities
   */
  async getAllSpecialities(): Promise<Speciality[]> {
    const supabase = this.supabaseService.createServiceClient();

    try {
      this.logger.log('Fetching all specialities');

      const { data: specialities, error: specialitiesError } = await supabase
        .from(AUTH_TABLES.SPECIALITIES)
        .select(QUERY.SELECT_ALL)
        .order(COLUMNS.NAME, ORDER_OPTIONS.ASCENDING);

      if (specialitiesError) {
        this.logger.error(
          `Failed to fetch specialities: ${specialitiesError.message}`,
          specialitiesError,
        );
        throw new InternalServerErrorException('Failed to fetch specialities');
      }

      this.logger.log(
        `Successfully fetched ${specialities?.length || 0} specialities`,
      );
      return specialities || [];
    } catch (error) {
      this.logger.error('Error fetching specialities:', error.stack);
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch specialities');
    }
  }

  /**
   * Deletes a speciality
   * @param id - The speciality ID
   * @returns Deleted speciality
   */
  async deleteSpeciality(id: number): Promise<Speciality> {
    const supabase = this.supabaseService.createServiceClient();

    try {
      this.logger.log(`Deleting speciality with ID: ${id}`);

      // First, get the speciality to return after deletion
      const { data: specialityToDelete, error: fetchError } = await supabase
        .from(AUTH_TABLES.SPECIALITIES)
        .select(QUERY.SELECT_ALL)
        .eq(COLUMNS.ID, id)
        .single();

      if (fetchError || !specialityToDelete) {
        this.logger.error(`Speciality not found with ID: ${id}`);
        throw new NotFoundException('Speciality not found');
      }

      // Delete the speciality
      const { error: deleteError } = await supabase
        .from(AUTH_TABLES.SPECIALITIES)
        .delete()
        .eq(COLUMNS.ID, id);

      if (deleteError) {
        this.logger.error(
          `Failed to delete speciality: ${deleteError.message}`,
          deleteError,
        );
        throw new InternalServerErrorException('Failed to delete speciality');
      }

      this.logger.log(
        `Successfully deleted speciality: ${specialityToDelete[COLUMNS.NAME]} with ID: ${id}`,
      );
      return specialityToDelete;
    } catch (error) {
      this.logger.error(
        `Error deleting speciality with ID ${id}:`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete speciality');
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Validates that all speciality IDs exist in the database
   * @param specialityIds - Array of speciality IDs to validate
   * @throws BadRequestException if any speciality ID doesn't exist
   */
  private async validateSpecialities(specialityIds: number[]): Promise<void> {
    const supabase = this.supabaseService.createServiceClient();

    const { data: specialities, error } = await supabase
      .from(AUTH_TABLES.SPECIALITIES)
      .select(COLUMNS.ID)
      .in(COLUMNS.ID, specialityIds);

    if (error) {
      this.logger.error(
        `Failed to validate specialities: ${error.message}`,
        error,
      );
      throw new InternalServerErrorException('Failed to validate specialities');
    }

    const existingIds = specialities?.map((s) => s[COLUMNS.ID]) || [];
    const missingIds = specialityIds.filter((id) => !existingIds.includes(id));

    if (missingIds.length > 0) {
      throw new BadRequestException(
        `Invalid speciality IDs: ${missingIds.join(', ')}`,
      );
    }
  }

  /**
   * Inserts trainer specialities for a new trainer profile
   * @param trainerProfileId - The trainer profile ID
   * @param specialityIds - Array of speciality IDs to insert
   */
  private async insertTrainerSpecialities(
    trainerProfileId: string,
    specialityIds: number[],
  ): Promise<void> {
    const supabase = this.supabaseService.createServiceClient();

    const specialityInserts = specialityIds.map((specialityId) => ({
      [COLUMNS.TRAINER_PROFILE_ID]: trainerProfileId,
      [COLUMNS.SPECIALITY_ID]: specialityId,
    }));

    const { error } = await supabase
      .from(AUTH_TABLES.TRAINER_SPECIALITIES)
      .insert(specialityInserts);

    if (error) {
      this.logger.error(
        `Failed to insert trainer specialities: ${error.message}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to insert trainer specialities',
      );
    }
  }

  /**
   * Updates trainer specialities by replacing existing ones
   * @param trainerProfileId - The trainer profile ID
   * @param specialityIds - Array of new speciality IDs
   */
  private async updateTrainerSpecialities(
    trainerProfileId: string,
    specialityIds: number[],
  ): Promise<void> {
    const supabase = this.supabaseService.createServiceClient();

    // First, delete existing specialities
    const { error: deleteError } = await supabase
      .from(AUTH_TABLES.TRAINER_SPECIALITIES)
      .delete()
      .eq(COLUMNS.TRAINER_PROFILE_ID, trainerProfileId);

    if (deleteError) {
      this.logger.error(
        `Failed to delete existing trainer specialities: ${deleteError.message}`,
        deleteError,
      );
      throw new InternalServerErrorException(
        'Failed to update trainer specialities',
      );
    }

    // Then, insert new ones
    await this.insertTrainerSpecialities(trainerProfileId, specialityIds);
  }

  /**
   * Retrieves specialities for a trainer profile
   * @param trainerProfileId - The trainer profile ID
   * @returns Array of specialities
   */
  private async getTrainerSpecialities(
    trainerProfileId: string,
  ): Promise<Speciality[]> {
    const supabase = this.supabaseService.createServiceClient();

    const { data: trainerSpecialities, error } = await supabase
      .from(AUTH_TABLES.TRAINER_SPECIALITIES)
      .select(`
        specialities:${COLUMNS.SPECIALITY_ID} (
          ${COLUMNS.ID},
          ${COLUMNS.NAME}
        )
      `)
      .eq(COLUMNS.TRAINER_PROFILE_ID, trainerProfileId);

    if (error) {
      this.logger.error(
        `Failed to fetch trainer specialities: ${error.message}`,
        error,
      );
      return [];
    }

    // Type the response structure and flatten the nested specialities arrays
    const specialities: Speciality[] = (trainerSpecialities || [])
      .map((ts: { specialities: Speciality[] }) => ts.specialities)
      .flat()
      .filter((speciality): speciality is Speciality => speciality !== null && speciality !== undefined);

    return specialities;
  }
} 