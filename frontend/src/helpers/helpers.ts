import { toast } from 'sonner';
import { API_MESSAGES, HTTP_STATUS } from './string_const';

// Common error handler that can handle various types of errors
export const handleError = (error: any, customMessage?: string): string => {
  let errorMessage: string = customMessage || API_MESSAGES.SERVER_ERROR;

  try {
    // Handle axios errors
    if (error?.response) {
      const status = error.response.status;
      const responseData = error.response.data;

      // Handle specific status codes
      switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
          errorMessage = responseData?.message || customMessage || API_MESSAGES.VALIDATION_ERROR;
          break;
        case HTTP_STATUS.UNAUTHORIZED:
          errorMessage = responseData?.message || customMessage || API_MESSAGES.INVALID_CREDENTIALS;
          break;
        case HTTP_STATUS.FORBIDDEN:
          errorMessage = responseData?.message || customMessage || 'Access forbidden';
          break;
        case HTTP_STATUS.NOT_FOUND:
          errorMessage = responseData?.message || customMessage || 'Resource not found';
          break;
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        default:
          errorMessage = responseData?.message || customMessage || API_MESSAGES.SERVER_ERROR;
          break;
      }

      // Handle validation errors
      if (responseData?.errors && typeof responseData.errors === 'object') {
        const firstError = Object.values(responseData.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0] as string;
        }
      }
    }
    // Handle network errors
    else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
      errorMessage = customMessage || API_MESSAGES.NETWORK_ERROR;
    }
    // Handle timeout errors
    else if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      errorMessage = customMessage || 'Request timeout. Please try again.';
    }
    // Handle string errors
    else if (typeof error === 'string') {
      errorMessage = customMessage || error;
    }
    // Handle Error objects
    else if (error instanceof Error) {
      errorMessage = customMessage || error.message || API_MESSAGES.SERVER_ERROR;
    }
    // Handle other error formats
    else if (error?.message) {
      errorMessage = customMessage || error.message;
    }
  } catch (parseError) {
    console.error('Error parsing error:', parseError);
    errorMessage = customMessage || API_MESSAGES.SERVER_ERROR;
  }

  // Show error toast
  toast.error(errorMessage);
  
  return errorMessage;
};

// Utility function to format validation errors
export const formatValidationErrors = (errors: Record<string, string[]>): string => {
  const errorMessages = Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('; ');
  
  return errorMessages || API_MESSAGES.VALIDATION_ERROR;
};

// Utility function to check if an error is a network error
export const isNetworkError = (error: any): boolean => {
  return !error?.response && (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error'));
};

// Utility function to check if an error is a timeout error
export const isTimeoutError = (error: any): boolean => {
  return error?.code === 'ECONNABORTED' || error?.message?.includes('timeout');
};

// Utility function to get error status code
export const getErrorStatus = (error: any): number | null => {
  return error?.response?.status || null;
};
