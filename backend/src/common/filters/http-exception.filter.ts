import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MESSAGES, RESPONSE_KEYS } from '../helpers/string-const';

/**
 * Global HTTP Exception Filter
 * Catches all HTTP exceptions and formats them consistently
 * Following Task 1.2 requirements from tasks.md
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    
    // Extract message from exception response
    let message: string;
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse['message']) {
      // Handle validation errors and other structured responses
      const responseMessage = exceptionResponse['message'];
      if (Array.isArray(responseMessage)) {
        // Join validation error messages
        message = responseMessage.join(', ');
      } else {
        message = responseMessage;
      }
    } else {
      message = MESSAGES.SERVER_ERROR;
    }

    // Format the error response according to Task 1.2 requirements
    const errorResponse = {
      [RESPONSE_KEYS.STATUS_CODE]: status,
      [RESPONSE_KEYS.MESSAGE]: message,
      [RESPONSE_KEYS.TIMESTAMP]: new Date().toISOString(),
      [RESPONSE_KEYS.PATH]: request.url,
    };

    // Log the error for debugging
    this.logger.error(
      `HTTP Exception: ${status} ${message} - ${request.method} ${request.url}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }
}

/**
 * Generic Exception Filter for non-HTTP exceptions
 * Handles unexpected errors that don't extend HttpException
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Default to internal server error for unknown exceptions
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof Error ? exception.message : MESSAGES.SERVER_ERROR;

    const errorResponse = {
      [RESPONSE_KEYS.STATUS_CODE]: status,
      [RESPONSE_KEYS.MESSAGE]: message,
      [RESPONSE_KEYS.TIMESTAMP]: new Date().toISOString(),
      [RESPONSE_KEYS.PATH]: request.url,
    };

    // Log the unexpected error
    this.logger.error(
      `Unhandled Exception: ${status} ${message} - ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(status).json(errorResponse);
  }
} 