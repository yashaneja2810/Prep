import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Basic Service Status', 
    description: 'Returns basic service status and information' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Service status information',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Service is running',
        data: {
          service: 'GamutX LMS Backend',
          status: 'operational',
          timestamp: '2023-01-01T00:00:00.000Z'
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      }
    }
  })
  getHello() {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ 
    summary: 'Supabase Connection Health Check', 
    description: 'Returns detailed health status including Supabase connection status' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Detailed health check with database connection status',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'All systems operational',
        data: {
          service: 'GamutX LMS Backend',
          database: {
            type: 'Supabase',
            connected: true,
            message: 'Supabase connection successful'
          },
          supabaseAvailable: true,
          timestamp: '2023-01-01T00:00:00.000Z'
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      }
    }
  })
  async getHealthCheck() {
    return this.appService.getHealthCheck();
  }
}
