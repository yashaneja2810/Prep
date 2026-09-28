import { Controller, Post, Get, Body, Res, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, CompleteProfileDto } from './dto';
import { Public, CurrentUser } from '../../common/decorators';
import { SupabaseAuthGuard } from '../../common/guards';
import { RESPONSE_KEYS, MESSAGES, COOKIES } from '../../common/helpers/string-const';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Create a new user account with email and password'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    schema: {
      example: {
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: 'uuid',
            email: 'user@example.com',
            emailConfirmed: false
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed or email already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Public()
  @ApiOperation({ 
    summary: 'Login user',
    description: 'Authenticate user with email and password, sets HTTP-only cookies'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 'uuid',
            email: 'user@example.com',
            emailConfirmed: true,
            lastSignIn: '2023-01-01T00:00:00Z'
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials or email not confirmed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(loginDto);
    
    // Set authentication cookies
    this.authService.setAuthCookies(response, result.data.session);
    
    // Log cookie setting for debugging
    console.log('🍪 Setting cookies for user:', result.data.user.email);
    console.log('🔑 Access token length:', result.data.session.access_token.length);
    console.log('🔄 Refresh token length:', result.data.session.refresh_token.length);
    
    // Return user data without session details
    return {
      [RESPONSE_KEYS.SUCCESS]: result[RESPONSE_KEYS.SUCCESS],
      [RESPONSE_KEYS.MESSAGE]: result[RESPONSE_KEYS.MESSAGE],
      [RESPONSE_KEYS.DATA]: {
        [RESPONSE_KEYS.USER]: result[RESPONSE_KEYS.DATA][RESPONSE_KEYS.USER]
      }
    };
  }

  @Post('logout')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ 
    summary: 'Logout user',
    description: 'Logout user and clear authentication cookies'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful',
    schema: {
      example: {
        success: true,
        message: 'Logout successful'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Res({ passthrough: true }) response: Response) {
    // Clear authentication cookies
    this.authService.clearAuthCookies(response);
    
    return {
      [RESPONSE_KEYS.SUCCESS]: true,
      [RESPONSE_KEYS.MESSAGE]: MESSAGES.LOGOUT_SUCCESS
    };
  }

  @Post('complete-profile')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ 
    summary: 'Complete user profile after registration',
    description: 'Complete user profile with personal information after initial registration'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile completed successfully',
    schema: {
      example: {
        success: true,
        message: 'Profile completed successfully',
        data: {
          user: {
            id: 'uuid',
            email: 'user@example.com',
            first_name: 'John',
            last_name: 'Doe',
            profileCompleted: true
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async completeProfile(@Body() completeProfileDto: CompleteProfileDto, @CurrentUser() user: any) {
    return this.authService.completeProfile(user.id, completeProfileDto, user.email);
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ 
    summary: 'Get current user information',
    description: 'Retrieve the current authenticated user profile and roles'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Current user data retrieved',
    schema: {
      example: {
        success: true,
        message: 'User data retrieved successfully',
        data: {
          user: {
            id: 'uuid',
            email: 'user@example.com',
            emailConfirmed: true,
            createdAt: '2023-01-01T00:00:00Z',
            lastSignIn: '2023-01-01T00:00:00Z'
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@CurrentUser() user: any) {
    return {
      [RESPONSE_KEYS.SUCCESS]: true,
      [RESPONSE_KEYS.MESSAGE]: 'User data retrieved successfully',
      [RESPONSE_KEYS.DATA]: {
        [RESPONSE_KEYS.USER]: {
          id: user.id,
          email: user.email,
          emailConfirmed: user.email_verified,
          createdAt: user.created_at,
          lastSignIn: user.last_sign_in_at,
          // Additional user properties can be added here
        }
      }
    };
  }

  @Get('role')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ 
    summary: 'Get current user role',
    description: 'Retrieve the current authenticated user role information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User role retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'User role retrieved successfully',
        data: {
          roles: [
            {
              id: 'uuid',
              role_id: 4,
              role_name: 'learner',
              description: 'Regular learner role',
              is_active: true,
              assigned_at: '2023-01-01T00:00:00Z'
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUserRole(@CurrentUser() user: any) {
    const roles = await this.authService.getUserRoles(user.id);
    return {
      [RESPONSE_KEYS.SUCCESS]: true,
      [RESPONSE_KEYS.MESSAGE]: 'User role retrieved successfully',
      [RESPONSE_KEYS.DATA]: {
        roles
      }
    };
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ 
    summary: 'Refresh authentication session',
    description: 'Refresh access token using refresh token from cookies'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Session refreshed successfully',
    schema: {
      example: {
        success: true,
        message: 'Session refreshed successfully'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshSession(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    // Placeholder implementation - will be completed when refresh logic is added to service
          return {
        [RESPONSE_KEYS.SUCCESS]: true,
        [RESPONSE_KEYS.MESSAGE]: 'Session refresh not yet implemented'
      };
  }

  @Get('test-cookies')
  @Public()
  @ApiOperation({ 
    summary: 'Test cookie reception',
    description: 'Test endpoint to verify that cookies are being sent from frontend'
  })
  async testCookies(@Req() request: Request) {
    const cookies = request.cookies;
    const accessToken = cookies?.[COOKIES.ACCESS_TOKEN];
    const refreshToken = cookies?.[COOKIES.REFRESH_TOKEN];
    
    console.log('🍪 All cookies received:', Object.keys(cookies || {}));
    console.log('🔑 Access token present:', !!accessToken);
    console.log('🔄 Refresh token present:', !!refreshToken);
    
    return {
      [RESPONSE_KEYS.SUCCESS]: true,
      [RESPONSE_KEYS.MESSAGE]: 'Cookie test completed',
      [RESPONSE_KEYS.DATA]: {
        cookiesReceived: Object.keys(cookies || {}),
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken ? accessToken.length : 0,
        refreshTokenLength: refreshToken ? refreshToken.length : 0,
      }
    };
  }
} 