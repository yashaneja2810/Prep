import { Injectable } from '@nestjs/common';
import { SupabaseService } from './core/database/supabase.service';
import { successResponse } from './common/helpers/api-response.helper';

@Injectable()
export class AppService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Basic health check
   * @returns API response with service status
   */
  getHello() {
    return successResponse(
      {
        service: 'GamutX LMS Backend',
        status: 'operational',
        timestamp: new Date().toISOString(),
      },
      'Service is running',
    );
  }

  /**
   * Supabase connection health check
   * Required by Task 2.4
   * @returns API response with Supabase connection status
   */
  async getHealthCheck() {
    const connectionStatus = await this.supabaseService.testConnection();
    
    return successResponse(
      {
        service: 'GamutX LMS Backend',
        database: {
          type: 'Supabase',
          connected: connectionStatus.connected,
          message: connectionStatus.message,
        },
        supabaseAvailable: this.supabaseService.isAvailable(),
        timestamp: new Date().toISOString(),
      },
      connectionStatus.connected 
        ? 'All systems operational' 
        : 'Service running with limited functionality',
    );
  }
}
