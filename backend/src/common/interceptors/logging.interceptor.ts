import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Logging Interceptor
 * Logs all incoming requests and outgoing responses
 * Task 5.2 requirement from tasks.md
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const { method, url, body, query, params, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const contentType = headers['content-type'] || 'Unknown';
    
    // Record start time for duration calculation
    const startTime = Date.now();
    
    // Log incoming request
    this.logger.log(
      `📥 INCOMING REQUEST: ${method} ${url} | ` +
      `Query: ${JSON.stringify(query)} | ` +
      `Params: ${JSON.stringify(params)} | ` +
      `Content-Type: ${contentType} | ` +
      `User-Agent: ${userAgent}`
    );

    // Log request body if it exists (avoid logging sensitive data)
    if (body && Object.keys(body).length > 0) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`📄 REQUEST BODY: ${JSON.stringify(sanitizedBody, null, 2)}`);
    }

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          
          // Log successful response
          this.logger.log(
            `📤 RESPONSE: ${method} ${url} | ` +
            `Status: ${statusCode} | ` +
            `Duration: ${duration}ms`
          );

          // Log response data for debug (limit size)
          if (responseData) {
            const responseSize = JSON.stringify(responseData).length;
            if (responseSize < 1000) {
              this.logger.debug(`📋 RESPONSE DATA: ${JSON.stringify(responseData, null, 2)}`);
            } else {
              this.logger.debug(`📋 RESPONSE DATA: [Large response - ${responseSize} characters]`);
            }
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;
          
          // Log error response
          this.logger.error(
            `❌ ERROR RESPONSE: ${method} ${url} | ` +
            `Status: ${statusCode} | ` +
            `Duration: ${duration}ms | ` +
            `Error: ${error.message}`
          );

          // Log error details for debugging
          this.logger.debug(`🐛 ERROR DETAILS: ${JSON.stringify({
            name: error.name,
            message: error.message,
            stack: error.stack?.split('\n').slice(0, 3).join('\n'), // Limit stack trace
          }, null, 2)}`);
        },
      }),
    );
  }

  /**
   * Sanitize request body to avoid logging sensitive information
   * @param body - Request body to sanitize
   * @returns Sanitized body object
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'auth',
      'credential',
      'pin',
      'ssn',
      'social',
    ];

    const sanitized = { ...body };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
      
      // Check nested fields (case-insensitive)
      Object.keys(sanitized).forEach(key => {
        if (key.toLowerCase().includes(field.toLowerCase())) {
          sanitized[key] = '[REDACTED]';
        }
      });
    }

    return sanitized;
  }
} 