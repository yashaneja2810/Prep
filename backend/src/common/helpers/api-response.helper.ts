import { MESSAGES, RESPONSE_KEYS, HTTP_STATUS } from './string-const';

/**
 * API Response Helper Functions
 * Standardizes API response format across the application
 * Following Task 1.3 requirements from tasks.md
 */

/**
 * Interface for standardized API response structure
 */
export interface ApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

/**
 * Creates a successful response (200 OK)
 * @param data - The response data
 * @param message - Custom success message (optional)
 * @returns Formatted success response
 */
export const successResponse = <T>(
  data: T,
  message: string = MESSAGES.SUCCESS,
): ApiResponse<T> => {
  return {
    [RESPONSE_KEYS.STATUS_CODE]: HTTP_STATUS.OK,
    [RESPONSE_KEYS.SUCCESS]: true,
    [RESPONSE_KEYS.MESSAGE]: message,
    [RESPONSE_KEYS.DATA]: data,
    [RESPONSE_KEYS.TIMESTAMP]: new Date().toISOString(),
  };
};

/**
 * Creates a created response (201 Created)
 * @param data - The created resource data
 * @param message - Custom creation message (optional)
 * @returns Formatted created response
 */
export const createdResponse = <T>(
  data: T,
  message: string = MESSAGES.CREATED,
): ApiResponse<T> => {
  return {
    [RESPONSE_KEYS.STATUS_CODE]: HTTP_STATUS.CREATED,
    [RESPONSE_KEYS.SUCCESS]: true,
    [RESPONSE_KEYS.MESSAGE]: message,
    [RESPONSE_KEYS.DATA]: data,
    [RESPONSE_KEYS.TIMESTAMP]: new Date().toISOString(),
  };
};

/**
 * Creates an error response
 * @param statusCode - HTTP status code
 * @param message - Error message
 * @param data - Optional error data
 * @returns Formatted error response
 */
export const errorResponse = <T = any>(
  statusCode: number,
  message: string,
  data?: T,
): ApiResponse<T> => {
  return {
    [RESPONSE_KEYS.STATUS_CODE]: statusCode,
    [RESPONSE_KEYS.SUCCESS]: false,
    [RESPONSE_KEYS.MESSAGE]: message,
    ...(data && { [RESPONSE_KEYS.DATA]: data }),
    [RESPONSE_KEYS.TIMESTAMP]: new Date().toISOString(),
  };
};

/**
 * Creates an updated response (200 OK)
 * @param data - The updated resource data
 * @param message - Custom update message (optional)
 * @returns Formatted updated response
 */
export const updatedResponse = <T>(
  data: T,
  message: string = MESSAGES.UPDATED,
): ApiResponse<T> => {
  return {
    [RESPONSE_KEYS.STATUS_CODE]: HTTP_STATUS.OK,
    [RESPONSE_KEYS.SUCCESS]: true,
    [RESPONSE_KEYS.MESSAGE]: message,
    [RESPONSE_KEYS.DATA]: data,
    [RESPONSE_KEYS.TIMESTAMP]: new Date().toISOString(),
  };
};

/**
 * Creates a deleted response (200 OK)
 * @param message - Custom deletion message (optional)
 * @returns Formatted deleted response
 */
export const deletedResponse = (
  message: string = MESSAGES.DELETED,
): ApiResponse<null> => {
  return {
    [RESPONSE_KEYS.STATUS_CODE]: HTTP_STATUS.OK,
    [RESPONSE_KEYS.SUCCESS]: true,
    [RESPONSE_KEYS.MESSAGE]: message,
    [RESPONSE_KEYS.DATA]: null,
    [RESPONSE_KEYS.TIMESTAMP]: new Date().toISOString(),
  };
};

/**
 * Creates a no content response (204 No Content)
 * Used when an operation succeeds but returns no data
 * @returns Formatted no content response
 */
export const noContentResponse = (): Pick<ApiResponse, 'statusCode'> => {
  return {
    [RESPONSE_KEYS.STATUS_CODE]: HTTP_STATUS.NO_CONTENT,
  };
}; 