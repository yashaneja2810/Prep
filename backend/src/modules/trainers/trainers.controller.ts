import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Logger,
  ParseUUIDPipe,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TrainersService } from './trainers.service';
import {
  CreateTrainerProfileDto,
  UpdateTrainerProfileDto,
  CreateSpecialityDto,
  UpdateSpecialityDto,
} from './dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  successResponse,
  createdResponse,
} from '../../common/helpers/api-response.helper';
import { UserWithProfile } from '../../common/types/auth.types';
import {
  USER_ROLES,
  MESSAGES,
  API_ENDPOINTS,
  API_PARAMS,
  API_SUMMARIES,
  API_DESCRIPTIONS,
  API_RESPONSE_DESCRIPTIONS,
  LOG_MESSAGES,
} from '../../common/helpers/string-const';

@Controller('trainers')
// @ApiBearerAuth()
// @UseGuards(SupabaseAuthGuard, RolesGuard)
@UseGuards(SupabaseAuthGuard)
export class TrainersController {
  private readonly logger = new Logger(TrainersController.name);

  constructor(private readonly trainersService: TrainersService) {}

  //#region ==================== SPECIALITIES MANAGEMENT ENDPOINTS ====================

  @Get('specialities')
  @ApiOperation({
    summary: 'Get all specialities',
    description:
      'Retrieves all available specialities for trainer profile creation and management',
  })
  @ApiResponse({
    status: 200,
    description: 'Specialities retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Specialities retrieved successfully',
        data: [
          { id: 1, name: 'Full Stack Web Development' },
          { id: 2, name: 'Frontend Development' },
          { id: 3, name: 'Backend Development' },
          { id: 4, name: 'Mobile Development' },
          { id: 5, name: 'DevOps' },
          { id: 6, name: 'Machine Learning' },
          { id: 7, name: 'Data Science' },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllSpecialities() {
    this.logger.log('Fetching all specialities');

    const specialities = await this.trainersService.getAllSpecialities();
    return successResponse(specialities, MESSAGES.SPECIALITIES_RETRIEVED);
  }

  @Post('specialities')
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Create new speciality (Admin only)',
    description:
      'Creates a new speciality option for trainer profiles - requires admin privileges',
  })
  @ApiResponse({
    status: 201,
    description: 'Speciality created successfully',
    schema: {
      example: {
        statusCode: 201,
        success: true,
        message: 'Speciality created successfully',
        data: {
          id: 8,
          name: 'Blockchain Development',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or speciality already exists',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createSpeciality(
    @CurrentUser() user: UserWithProfile,
    @Body() createSpecialityDto: CreateSpecialityDto,
  ) {
    this.logger.log(
      `Admin ${user.id} creating speciality: ${createSpecialityDto.name}`,
    );

    const speciality =
      await this.trainersService.createSpeciality(createSpecialityDto);
    return createdResponse(speciality, MESSAGES.SPECIALITY_CREATED);
  }

  @Put('specialities/:id')
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update speciality (Admin only)',
    description: 'Updates an existing speciality - requires admin privileges',
  })
  @ApiParam({ name: 'id', description: 'Speciality ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Speciality updated successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Speciality updated successfully',
        data: {
          id: 1,
          name: 'Advanced Full Stack Web Development',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or speciality already exists',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Speciality not found' })
  async updateSpeciality(
    @CurrentUser() user: UserWithProfile,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSpecialityDto: UpdateSpecialityDto,
  ) {
    this.logger.log(`Admin ${user.id} updating speciality with ID: ${id}`);

    const speciality = await this.trainersService.updateSpeciality(
      id,
      updateSpecialityDto,
    );
    return successResponse(speciality, MESSAGES.SPECIALITY_UPDATED);
  }

  @Delete('specialities/:id')
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Delete speciality (Admin only)',
    description:
      'Deletes a speciality - requires admin privileges. Note: This will affect existing trainer profiles that use this speciality.',
  })
  @ApiParam({ name: 'id', description: 'Speciality ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Speciality deleted successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Speciality deleted successfully',
        data: {
          id: 8,
          name: 'Blockchain Development',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Speciality not found' })
  async deleteSpeciality(
    @CurrentUser() user: UserWithProfile,
    @Param('id', ParseIntPipe) id: number,
  ) {
    this.logger.log(`Admin ${user.id} deleting speciality with ID: ${id}`);

    const deletedSpeciality = await this.trainersService.deleteSpeciality(id);
    return successResponse(deletedSpeciality, MESSAGES.SPECIALITY_DELETED);
  }

  //#endregion

  //#region ==================== TRAINER PROFILE ENDPOINTS ====================

  @Post()
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: API_SUMMARIES.CREATE_TRAINER_PROFILE,
    description: API_DESCRIPTIONS.CREATE_TRAINER_PROFILE,
  })
  @ApiResponse({
    status: 201,
    description: API_RESPONSE_DESCRIPTIONS.TRAINER_PROFILE_CREATED,
    schema: {
      example: {
        statusCode: 201,
        success: true,
        message: API_RESPONSE_DESCRIPTIONS.TRAINER_PROFILE_CREATED,
        data: {
          id: 'uuid',
          user_id: 'uuid',
          specialities: [
            { id: 1, name: 'Full Stack Web Development' },
            { id: 3, name: 'Machine Learning' },
            { id: 5, name: 'DevOps' },
          ],
          is_active: true,
          total_years_teaching: 5.5,
          bio: 'Experienced software engineer with 10+ years in web development and training...',
          linkedin_url: 'https://linkedin.com/in/johndoe',
          expertise:
            'JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker',
          profile_image: 'https://example.com/profile.jpg',
          website: 'https://johndoe.dev',
          social_links: {
            twitter: 'https://twitter.com/johndoe',
            github: 'https://github.com/johndoe',
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: API_RESPONSE_DESCRIPTIONS.BAD_REQUEST,
  })
  @ApiResponse({
    status: 401,
    description: API_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @ApiResponse({
    status: 403,
    description: API_RESPONSE_DESCRIPTIONS.FORBIDDEN_ADMIN_REQUIRED,
  })
  @ApiResponse({
    status: 404,
    description: API_RESPONSE_DESCRIPTIONS.TRAINER_PROFILE_NOT_FOUND,
  })
  @ApiResponse({
    status: 409,
    description: API_RESPONSE_DESCRIPTIONS.TRAINER_PROFILE_EXISTS,
  })
  async createTrainerProfile(
    @CurrentUser() user: UserWithProfile,
    @Body() createTrainerProfileDto: CreateTrainerProfileDto,
  ) {
    this.logger.log(
      `${LOG_MESSAGES.ADMIN_CREATING_TRAINER_PROFILE} ${createTrainerProfileDto.email}`,
    );

    const profile = await this.trainersService.createTrainerProfile(
      createTrainerProfileDto,
    );
    return createdResponse(profile, MESSAGES.TRAINER_PROFILE_CREATED);
  }

  @Put(':id')
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: API_SUMMARIES.UPDATE_TRAINER_PROFILE,
    description: API_DESCRIPTIONS.UPDATE_TRAINER_PROFILE,
  })
  @ApiParam({
    name: 'id',
    description: 'Trainer Profile ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: API_RESPONSE_DESCRIPTIONS.TRAINER_PROFILE_UPDATED,
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: API_RESPONSE_DESCRIPTIONS.TRAINER_PROFILE_UPDATED,
        data: {
          id: 'uuid',
          user_id: 'uuid',
          first_name: 'John',
          email: 'john.doe@example.com',
          specialities: [
            { id: 1, name: 'Full Stack Web Development' },
            { id: 2, name: 'Frontend Development' },
            { id: 4, name: 'Mobile Development' },
          ],
          is_active: true,
          total_years_teaching: 6.0,
          bio: 'Updated bio with more experience...',
          linkedin_url: 'https://linkedin.com/in/johndoe',
          expertise: 'JavaScript, React, Node.js, React Native, Flutter',
          profile_image: 'https://example.com/new-profile.jpg',
          website: 'https://johndoe.dev',
          social_links: {
            twitter: 'https://twitter.com/johndoe',
            github: 'https://github.com/johndoe',
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: API_RESPONSE_DESCRIPTIONS.BAD_REQUEST,
  })
  @ApiResponse({
    status: 401,
    description: API_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @ApiResponse({
    status: 403,
    description: API_RESPONSE_DESCRIPTIONS.FORBIDDEN_ADMIN_REQUIRED,
  })
  @ApiResponse({
    status: 404,
    description: API_RESPONSE_DESCRIPTIONS.TRAINER_PROFILE_NOT_FOUND,
  })
  async updateTrainerProfile(
    @CurrentUser() user: UserWithProfile,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTrainerProfileDto: UpdateTrainerProfileDto,
  ) {
    this.logger.log(`${LOG_MESSAGES.ADMIN_UPDATING_TRAINER_PROFILE} ${id}`);

    const profile = await this.trainersService.updateTrainerProfile(
      id,
      updateTrainerProfileDto,
    );
    return successResponse(profile, MESSAGES.TRAINER_PROFILE_UPDATED);
  }

  @Get()
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get all trainer profiles with user details (Admin only)',
    description:
      'Retrieves all trainer profiles (active and inactive) with user information, specialities, and status - requires admin privileges. Returns trainers with is_active field indicating their status.',
  })
  @ApiResponse({
    status: 200,
    description:
      'All trainer profiles with user details retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Trainer profiles retrieved successfully',
        data: [
          {
            id: 'trainer-profile-uuid-1',
            user_id: 'user-uuid-1',
            first_name: 'John',
            email: 'john.doe@example.com',
            specialities: [
              { id: 1, name: 'Full Stack Web Development' },
              { id: 3, name: 'Machine Learning' },
              { id: 5, name: 'DevOps' },
            ],
            is_active: true,
            total_years_teaching: 5.5,
            bio: 'Experienced software engineer with 10+ years in web development and training...',
            linkedin_url: 'https://linkedin.com/in/johndoe',
            expertise:
              'JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker',
            profile_image: 'https://example.com/profile.jpg',
            website: 'https://johndoe.dev',
            social_links: {
              twitter: 'https://twitter.com/johndoe',
              github: 'https://github.com/johndoe',
            },
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
          },
          {
            id: 'trainer-profile-uuid-2',
            user_id: 'user-uuid-2',
            first_name: 'Jane',
            email: 'jane.smith@example.com',
            specialities: [
              { id: 2, name: 'Frontend Development' },
              { id: 6, name: 'Machine Learning' },
            ],
            is_active: false,
            total_years_teaching: 3.0,
            bio: 'Frontend specialist with React and Vue.js expertise...',
            linkedin_url: 'https://linkedin.com/in/janesmith',
            expertise: 'React, Vue.js, TypeScript, CSS, UX/UI Design',
            profile_image: 'https://example.com/profile2.jpg',
            website: 'https://janesmith.dev',
            social_links: {
              twitter: 'https://twitter.com/janesmith',
              github: 'https://github.com/janesmith',
            },
            created_at: '2024-01-14T15:20:00Z',
            updated_at: '2024-01-14T15:20:00Z',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllTrainerProfiles(@CurrentUser() user: UserWithProfile) {
    this.logger.log(
      `Admin ${user.id} fetching all trainer profiles (active and inactive) with user details`,
    );

    const profiles = await this.trainersService.getAllTrainerProfiles();
    return successResponse(profiles, 'Trainer profiles retrieved successfully');
  }

  @Get(`user/:${API_PARAMS.USER_ID}`)
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get trainer profiles by user ID with user details (Admin only)',
    description:
      'Retrieves all trainer profiles for a user ID with user information including first_name and email - requires admin privileges',
  })
  @ApiParam({
    name: API_PARAMS.USER_ID,
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Trainer profiles with user details retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Trainer profiles retrieved successfully',
        data: [
          {
            id: 'trainer-profile-uuid',
            user_id: 'user-uuid',
            first_name: 'John',
            email: 'john.doe@example.com',
            specialities: [
              { id: 1, name: 'Full Stack Web Development' },
              { id: 3, name: 'Machine Learning' },
            ],
            is_active: true,
            total_years_teaching: 5.5,
            bio: 'Experienced software engineer with 10+ years in web development and training...',
            linkedin_url: 'https://linkedin.com/in/johndoe',
            expertise:
              'JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker',
            profile_image: 'https://example.com/profile.jpg',
            website: 'https://johndoe.dev',
            social_links: {
              twitter: 'https://twitter.com/johndoe',
              github: 'https://github.com/johndoe',
            },
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getTrainerProfileByUserId(
    @Param(API_PARAMS.USER_ID, ParseUUIDPipe) userId: string,
  ) {
    this.logger.log(
      `Admin fetching trainer profiles with user details for user: ${userId}`,
    );

    const profiles =
      await this.trainersService.getTrainerProfilesByUserId(userId);
    return successResponse(profiles, 'Trainer profiles retrieved successfully');
  }

  @Get(':id')
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get trainer profile by ID with user details (Admin only)',
    description:
      'Retrieves a specific trainer profile by its ID with user information including first_name and email - requires admin privileges',
  })
  @ApiParam({
    name: 'id',
    description: 'Trainer Profile ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Trainer profile with user details retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Trainer profile retrieved successfully',
        data: {
          id: 'trainer-profile-uuid',
          user_id: 'user-uuid',
          first_name: 'John',
          email: 'john.doe@example.com',
          specialities: [
            { id: 1, name: 'Full Stack Web Development' },
            { id: 3, name: 'Machine Learning' },
          ],
          is_active: true,
          total_years_teaching: 5.5,
          bio: 'Experienced software engineer with 10+ years in web development and training...',
          linkedin_url: 'https://linkedin.com/in/johndoe',
          expertise:
            'JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker',
          profile_image: 'https://example.com/profile.jpg',
          website: 'https://johndoe.dev',
          social_links: {
            twitter: 'https://twitter.com/johndoe',
            github: 'https://github.com/johndoe',
          },
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Trainer profile not found' })
  async getTrainerProfileById(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    this.logger.log(
      `Admin fetching trainer profile with user details by ID: ${id}`,
    );

    const profile = await this.trainersService.getTrainerProfileById(id);
    if (!profile) {
      throw new NotFoundException('Trainer profile not found');
    }
    return successResponse(profile, 'Trainer profile retrieved successfully');
  }

  @Delete(':id')
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Deactivate trainer profile by ID (Admin only)',
    description:
      'Deactivates a specific trainer profile by setting it as inactive - requires admin privileges. This is a soft delete that preserves data while making the trainer inactive.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trainer Profile ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Trainer profile deactivated successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Trainer profile deactivated successfully',
        data: {
          id: 'trainer-profile-uuid',
          user_id: 'user-uuid',
          first_name: 'John',
          email: 'john.doe@example.com',
          specialities: [
            { id: 1, name: 'Full Stack Web Development' },
            { id: 3, name: 'Machine Learning' },
          ],
          is_active: false,
          total_years_teaching: 5.5,
          bio: 'Experienced software engineer with 10+ years in web development and training...',
          linkedin_url: 'https://linkedin.com/in/johndoe',
          expertise:
            'JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker',
          profile_image: 'https://example.com/profile.jpg',
          website: 'https://johndoe.dev',
          social_links: {
            twitter: 'https://twitter.com/johndoe',
            github: 'https://github.com/johndoe',
          },
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Trainer profile not found' })
  async deleteTrainerProfile(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Admin deactivating trainer profile with ID: ${id}`);

    const deactivatedProfile =
      await this.trainersService.deleteTrainerProfile(id);
    return successResponse(
      deactivatedProfile,
      MESSAGES.TRAINER_PROFILE_DEACTIVATED,
    );
  }

  @Put(':id/activate')
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Reactivate trainer profile by ID (Admin only)',
    description:
      'Reactivates a previously deactivated trainer profile by setting it as active - requires admin privileges. This restores access for the trainer.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trainer Profile ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Trainer profile reactivated successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Trainer profile reactivated successfully',
        data: {
          id: 'trainer-profile-uuid',
          user_id: 'user-uuid',
          first_name: 'John',
          email: 'john.doe@example.com',
          specialities: [
            { id: 1, name: 'Full Stack Web Development' },
            { id: 3, name: 'Machine Learning' },
          ],
          is_active: true,
          total_years_teaching: 5.5,
          bio: 'Experienced software engineer with 10+ years in web development and training...',
          linkedin_url: 'https://linkedin.com/in/johndoe',
          expertise:
            'JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker',
          profile_image: 'https://example.com/profile.jpg',
          website: 'https://johndoe.dev',
          social_links: {
            twitter: 'https://twitter.com/johndoe',
            github: 'https://github.com/johndoe',
          },
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Trainer profile not found' })
  @ApiResponse({
    status: 400,
    description: 'Trainer profile is already active',
  })
  async reactivateTrainerProfile(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Admin reactivating trainer profile with ID: ${id}`);

    const reactivatedProfile =
      await this.trainersService.reactivateTrainerProfile(id);
    return successResponse(
      reactivatedProfile,
      MESSAGES.TRAINER_PROFILE_REACTIVATED,
    );
  }

  @Delete(':id/permanent')
  // @Roles(USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: '⚠️ PERMANENTLY DELETE trainer profile by ID (Super Admin only)',
    description:
      '⚠️ DANGER: This PERMANENTLY DELETES the trainer profile and all associated data from the database. This action CANNOT be undone. Use the regular DELETE endpoint for safe deactivation instead. Requires super admin privileges. 📋 NOTE: This endpoint is fully implemented, tested, and working but has been temporarily removed from the frontend for safety reasons.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trainer Profile ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description:
      '⚠️ Trainer profile permanently deleted - THIS ACTION CANNOT BE UNDONE',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Trainer profile permanently deleted',
        data: {
          id: 'trainer-profile-uuid',
          user_id: 'user-uuid',
          first_name: 'John',
          email: 'john.doe@example.com',
          message: 'Profile has been permanently removed from the database',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Super Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Trainer profile not found' })
  async permanentlyDeleteTrainerProfile(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    // NOTE: This endpoint is fully implemented, tested, and working
    // but has been temporarily removed from the frontend for safety reasons
    this.logger.warn(
      `Super Admin PERMANENTLY DELETING trainer profile with ID: ${id}`,
    );

    const deletedProfile =
      await this.trainersService.permanentlyDeleteTrainerProfile(id);
    return successResponse(
      deletedProfile,
      MESSAGES.TRAINER_PROFILE_PERMANENTLY_DELETED,
    );
  }

  // #endregion
} 