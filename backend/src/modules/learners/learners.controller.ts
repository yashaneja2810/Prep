import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  ParseUUIDPipe,
  NotFoundException,
  ParseIntPipe,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { LearnersService } from './learners.service';
import { UsersService } from '../users/users.service';
import {
  CreateLearnerDto,
  CreateBatchLearnersDto,
  ProfileCompletenessDto,
  UpdateLearnerProfileDto,
} from './dto';
import { GetUsersQueryDto } from '../users/dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  successResponse,
  createdResponse,
} from '../../common/helpers/api-response.helper';
import { getAccessTokenFromRequest } from '../../common/helpers/auth.helper';
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

@Controller('learners')
@ApiTags('Learners')
// @ApiBearerAuth()
// @UseGuards(SupabaseAuthGuard, RolesGuard)
@UseGuards(SupabaseAuthGuard)
export class LearnersController {
  private readonly logger = new Logger(LearnersController.name);

  constructor(
    private readonly learnersService: LearnersService,
    private readonly usersService: UsersService,
  ) {}

  //#region ==================== LEARNER PROFILE ENDPOINTS ====================

  @Post()
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Add learner to system (Admin only)',
    description:
      'Admin adds a learner by email. Finds user_id from users table and assigns learner role (role_id=4). Database trigger automatically creates learner_profiles record.',
  })
  @ApiResponse({
    status: 201,
    description: 'Learner added successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Learner added successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-v4-string' },
            user_id: { type: 'string', example: 'uuid-v4-string' },
            role_id: { type: 'number', example: 4 },
            is_active: { type: 'boolean', example: true },
            assigned_at: { type: 'string', example: '2024-01-15T10:30:00Z' },
            roles: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 4 },
                role_name: { type: 'string', example: 'learner' },
                description: { type: 'string', example: 'Learner role' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found with provided email',
  })
  @ApiResponse({
    status: 409,
    description: 'User already has learner role',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin privileges required',
  })
  async addLearner(
    @Body() createLearnerDto: CreateLearnerDto,
    @CurrentUser() currentUser: UserWithProfile,
    @Req() req: Request,
  ) {
    this.logger.log(
      `Admin ${currentUser.id} adding learner: ${createLearnerDto.email}`,
    );

    // Extract access token from request
    const accessToken = getAccessTokenFromRequest(req);

    const roleAssignment = await this.learnersService.assignLearnerRole(
      createLearnerDto.email,
      currentUser.id,
      accessToken,
    );

    return {
      success: true,
      message: MESSAGES.LEARNER_ADDED,
      data: roleAssignment,
    };
  }

  @Post('batch')
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Add multiple learners to system (Admin only)',
    description:
      'Admin adds multiple learners by email array. Processes each email individually and returns success/failure status for each. Partial failures are allowed - successful additions will be processed even if some emails fail.',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch learner addition completed (may include partial failures)',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Batch learner addition completed' },
        data: {
          type: 'object',
          properties: {
            totalRequested: { type: 'number', example: 3 },
            successful: { type: 'number', example: 2 },
            failed: { type: 'number', example: 1 },
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'learner1@example.com' },
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Learner added successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'uuid-v4-string' },
                      user_id: { type: 'string', example: 'uuid-v4-string' },
                      role_id: { type: 'number', example: 4 },
                      is_active: { type: 'boolean', example: true },
                      assigned_at: { type: 'string', example: '2024-01-15T10:30:00Z' },
                    },
                  },
                  error: { type: 'string', example: null },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input data or empty array',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin privileges required',
  })
  async addLearnersBatch(
    @Body() createBatchLearnersDto: CreateBatchLearnersDto,
    @CurrentUser() currentUser: UserWithProfile,
    @Req() req: Request,
  ) {
    this.logger.log(
      `Admin ${currentUser.id} adding ${createBatchLearnersDto.emails.length} learners in batch`,
    );

    // Extract access token from request
    const accessToken = getAccessTokenFromRequest(req);

    const batchResult = await this.learnersService.assignLearnerRolesBatch(
      createBatchLearnersDto.emails,
      currentUser.id,
      accessToken,
    );

    return {
      success: true,
      message: 'Batch learner addition completed',
      data: batchResult,
    };
  }

  
  @Get('completeness')
  // @Roles(USER_ROLES.LEARNER)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Check learner profile completeness',
    description:
      "Check the completeness status of the authenticated learner's profile. Returns missing fields and completion percentage.",
  })
  @ApiResponse({
    status: 200,
    description: 'Profile completeness status retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Profile completeness checked successfully',
        data: {
          is_complete: false,
          missing_fields: ['learner_type', 'goals_text'],
          completion_percentage: 40,
          completion_message:
            'Profile incomplete - please complete all required fields. Missing: learner_type, goals_text',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - learner role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Learner profile not found',
  })
  async checkProfileCompleteness(@CurrentUser() user: UserWithProfile) {
    this.logger.log(`Learner ${user.id} checking profile completeness`);

    const completeness =
      await this.learnersService.checkLearnerProfileCompleteness(user.id);
    return successResponse(
      completeness,
      'Profile completeness checked successfully',
    );
  }

  @Get('learner/me')
  // @Roles(USER_ROLES.LEARNER)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get current learner profile',
    description:
      'Retrieve the complete learner profile for the authenticated learner ("me"). Returns profile data with user information and conditional detail data based on learner type.',
  })
  @ApiResponse({
    status: 200,
    description: 'Learner profile retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Learner profile retrieved successfully',
        data: {
          id: 'uuid',
          user_id: 'uuid',
          learner_type: 'student',
          status: 'active',
          goals_text:
            'I want to become a full-stack developer and build web applications.',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            timezone: 'UTC',
          },
          student_details: {
            id: 'uuid',
            learner_id: 'uuid',
            college_name: 'MIT',
            degree_course: 'Computer Science',
            current_gpa: 3.8,
            expected_grad_year: 2025,
            interest: 'Machine Learning',
          },
          professional_details: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - learner role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Learner profile not found',
  })
  async getLearnerProfile(@CurrentUser() user: UserWithProfile) {
    this.logger.log(`Learner ${user.id} retrieving profile`);

    const profile = await this.learnersService.getLearnerProfile(user.id);
    return successResponse(profile, 'Learner profile retrieved successfully');
  }

  @Put('learner/me')
  // @Roles(USER_ROLES.LEARNER)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update current learner profile',
    description:
      'Update the learner profile for the authenticated learner ("me"). Validates required fields and updates profile and conditional detail data based on learner type. Include student_details ONLY if learner_type is "student", and professional_details ONLY if learner_type is "professional".',
  })
  @ApiBody({
    type: UpdateLearnerProfileDto,
    description: 'Learner profile update data with conditional details based on learner type',
    examples: {
      'Student Update': {
        summary: 'Update student profile',
        description: 'Request body for updating a student learner profile - includes student_details only',
        value: {
          learner_type: 'student',
          goals_text: 'I want to become a full-stack developer and build innovative web applications that solve real-world problems.',
          student_details: {
            college_name: 'Massachusetts Institute of Technology',
            degree_course: 'Computer Science and Engineering',
            current_gpa: 3.8,
            expected_grad_year: 2025,
            interest: 'Machine Learning, Web Development'
          }
        }
      },
      'Professional Update': {
        summary: 'Update professional profile',
        description: 'Request body for updating a professional learner profile - includes professional_details only',
        value: {
          learner_type: 'professional',
          goals_text: 'I want to become a senior full-stack developer and lead development teams in cutting-edge technology projects.',
          professional_details: {
            company_name: 'Google Inc.',
            job_title: 'Senior Software Engineer',
            years_experience: 5.0,
            pipeline_dev_exp: 2.0,
            portfolio_url: 'https://johndoe.dev'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Learner profile updated successfully',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 200 },
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Learner profile updated successfully' },
            data: {
              type: 'object',
              description: 'Updated learner profile with conditional details'
            }
          }
        },
        examples: {
          'Student Profile Update': {
            summary: 'Update student learner profile',
            description: 'Example for updating a student learner profile - includes student_details only',
            value: {
              statusCode: 200,
              success: true,
              message: 'Learner profile updated successfully',
              data: {
                id: 'uuid',
                user_id: 'uuid',
                learner_type: 'student',
                status: 'active',
                goals_text:
                  'I want to become a full-stack developer and build innovative web applications.',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-02T00:00:00Z',
                user: {
                  first_name: 'John',
                  last_name: 'Doe',
                  email: 'john.doe@example.com',
                  phone: '+1234567890',
                  timezone: 'UTC',
                },
                student_details: {
                  id: 'uuid',
                  learner_id: 'uuid',
                  college_name: 'Massachusetts Institute of Technology',
                  degree_course: 'Computer Science and Engineering',
                  current_gpa: 3.8,
                  expected_grad_year: 2025,
                  interest: 'Machine Learning, Web Development',
                },
                professional_details: null,
              },
            }
          },
          'Professional Profile Update': {
            summary: 'Update professional learner profile',
            description: 'Example for updating a professional learner profile - includes professional_details only',
            value: {
              statusCode: 200,
              success: true,
              message: 'Learner profile updated successfully',
              data: {
                id: 'uuid',
                user_id: 'uuid',
                learner_type: 'professional',
                status: 'active',
                goals_text:
                  'I want to become a senior full-stack developer and lead development teams.',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-02T00:00:00Z',
                user: {
                  first_name: 'Jane',
                  last_name: 'Smith',
                  email: 'jane.smith@example.com',
                  phone: '+1987654321',
                  timezone: 'America/New_York',
                },
                student_details: null,
                professional_details: {
                  id: 'uuid',
                  learner_id: 'uuid',
                  company_name: 'Google Inc.',
                  job_title: 'Senior Software Engineer',
                  years_experience: 5.0,
                  pipeline_dev_exp: 2.0,
                  portfolio_url: 'https://johndoe.dev',
                },
              },
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or required fields missing',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - learner role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Learner profile not found',
  })
  async updateLearnerProfile(
    @CurrentUser() user: UserWithProfile,
    @Body() updateLearnerProfileDto: UpdateLearnerProfileDto,
  ) {
    this.logger.log(`Learner ${user.id} updating profile`);

    const profile = await this.learnersService.updateLearnerProfile(
      user.id,
      updateLearnerProfileDto,
    );
    return successResponse(profile, 'Learner profile updated successfully');
  }

  //#endregion

  //#region ==================== ADMIN LEARNER PROFILE ENDPOINTS ====================

  @Get()
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get all learner profiles (Admin only)',
    description:
      'Retrieve all learner profiles with user information and completion status for admin viewing.',
  })
  @ApiResponse({
    status: 200,
    description: 'Learner profiles retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Learner profiles retrieved successfully',
        data: [
          {
            id: 'uuid',
            user_id: 'uuid',
            learner_type: 'student',
            status: 'active',
            goals_text: 'I want to become a full-stack developer',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            users: {
              id: 'uuid',
              email: 'john.doe@example.com',
              first_name: 'John',
              last_name: 'Doe',
              phone: '+1234567890',
              timezone: 'UTC',
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
            },
            learner_student_details: [
              {
                id: 'uuid',
                college_name: 'MIT',
                degree_course: 'Computer Science',
                current_gpa: 3.8,
                expected_grad_year: 2025,
                interest: 'Machine Learning',
              },
            ],
            learner_professional_details: null,
            completeness_status: {
              is_complete: true,
              missing_fields: [],
              completion_percentage: 100,
              completion_message: 'Profile is complete',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required',
  })
  async getAllLearnerProfiles() {
    this.logger.log(`Admin getting all learner profiles`);

    const result = await this.learnersService.getAllLearnerProfiles();
    return successResponse(result, 'Learner profiles retrieved successfully');
  }

  @Get('learner/:userId')
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get specific learner profile (Admin only)',
    description:
      "Retrieve a specific learner's complete profile by user ID. Returns detailed profile information with completion status for admin viewing.",
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID of the learner',
    type: 'string',
    format: 'uuid',
    example: 'uuid-v4-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Learner profile retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Learner profile retrieved successfully',
        data: {
          id: 'uuid',
          user_id: 'uuid',
          learner_type: 'professional',
          status: 'active',
          goals_text:
            'I want to become a senior full-stack developer and transition to tech leadership roles.',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
          user: {
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+1987654321',
            timezone: 'America/New_York',
          },
          student_details: null,
          professional_details: {
            id: 'uuid',
            learner_id: 'uuid',
            company_name: 'Google Inc.',
            job_title: 'Senior Software Engineer',
            years_experience: 5.0,
            pipeline_dev_exp: 2.0,
            portfolio_url: 'https://janesmith.dev',
          },
          completeness_status: {
            is_complete: true,
            missing_fields: [],
            completion_percentage: 100,
            completion_message: 'Profile is complete',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Learner profile not found',
  })
  async getLearnerProfileByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    this.logger.log(`Admin retrieving learner profile for user: ${userId}`);

    const profile = await this.learnersService.getLearnerProfileByAdmin(userId);
    return successResponse(profile, 'Learner profile retrieved successfully');
  }

  @Get('users')
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get all learner users',
    description:
      'Retrieve all users with learner roles with pagination and filtering. Requires admin privileges.',
  })
  @ApiQuery({ type: GetUsersQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Learner users retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - admin privileges required',
  })
  async getLearnerUsers(@Query() queryDto: GetUsersQueryDto) {
    this.logger.log('Admin fetching all learner users');

    const result = await this.usersService.getLearnerUsers(queryDto);

    return successResponse(result, MESSAGES.LEARNER_USERS_RETRIEVED);
  }

  @Put(':userId/deactivate')
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Deactivate learner',
    description:
      'Deactivate a learner role (soft delete). Requires admin privileges.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'uuid-v4-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Learner deactivated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Learner role not found or already inactive',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - admin privileges required',
  })
  async deactivateLearner(@Param('userId') userId: string) {
    this.logger.log(`Admin deactivating learner: ${userId}`);

    await this.usersService.deactivateLearnerRole(userId);

    return successResponse(null, MESSAGES.LEARNER_DEACTIVATED);
  }

  @Put(':userId/activate')
  // @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Reactivate learner',
    description:
      'Reactivate a previously deactivated learner role. Requires admin privileges.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'uuid-v4-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Learner reactivated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Inactive learner role not found for this user',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - admin privileges required',
  })
  async reactivateLearner(@Param('userId') userId: string) {
    this.logger.log(`Admin reactivating learner: ${userId}`);

    await this.usersService.reactivateLearnerRole(userId);

    return successResponse(null, MESSAGES.LEARNER_REACTIVATED);
  }

  @Delete(':userId')
  // @Roles(USER_ROLES.SUPER_ADMIN)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: '⚠️ PERMANENTLY DELETE learner',
    description:
      '⚠️ DANGER: This PERMANENTLY DELETES the learner role and all associated data from the database. This action CANNOT be undone. Use the deactivate endpoint for safe removal instead. Requires super admin privileges.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'uuid-v4-string',
  })
  @ApiResponse({
    status: 200,
    description:
      '⚠️ Learner permanently deleted - THIS ACTION CANNOT BE UNDONE',
  })
  @ApiResponse({
    status: 404,
    description: 'Learner role not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - super admin privileges required',
  })
  async permanentlyDeleteLearner(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: UserWithProfile,
  ) {
    // Prevent super admin from deleting their own learner role if they have one
    if (currentUser.id === userId) {
      throw new ForbiddenException('You cannot delete your own learner role');
    }

    this.logger.log(
      `Super Admin ${currentUser.id} permanently deleting learner: ${userId}`,
    );

    await this.usersService.permanentlyRemoveLearnerRole(userId);

    return successResponse(null, MESSAGES.LEARNER_PERMANENTLY_DELETED);
  }

  //#endregion
} 