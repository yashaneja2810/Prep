import { toast } from 'sonner';
import { HTTP_STATUS, API_MESSAGES } from './string_const';
import { apiClient } from '@/lib/api/apiClient';


// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: any) => {
    // Allow callers to suppress global toast notifications (e.g., silent health checks)
    if (error.config?.suppressToast) {
      return Promise.reject(error)
    }

    // Handle network errors
    if (!error.response) {
      toast.error(API_MESSAGES.NETWORK_ERROR)
      return Promise.reject(error)
    }

    // Handle specific status codes
    const status = error.response.status
    if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
      toast.error(API_MESSAGES.SERVER_ERROR)
    }

    return Promise.reject(error)
  }
);

// Generic response handler
const handleResponse = <T>(response: any, showSuccessToast = true): T => {
  const { status, data, config } = response;
  
  console.log('🟢 [API Response]', {
    url: config.url,
    method: config.method,
    status,
    data
  });
  
  // Check if response status is successful
  if (status < HTTP_STATUS.OK || status >= 300) {
    console.error('🔴 [API Error] Request failed', {
      status,
      data
    });
    throw new Error(`Request failed with status ${status}`);
  }

  // Show success message if it's not a GET request and has a message
  if (showSuccessToast && response.config.method !== 'get') {
    const responseData = data as any;
    if (responseData?.message) {
      toast.success(responseData.message);
    }
  }

  // Extract the nested data property from the backend response structure
  // Backend returns: {statusCode, success, message, data: actualData}
  // We need to return just the actualData
  if (data && typeof data === 'object') {
    console.log('🟢 [API Data Structure]', {
      hasDataProp: 'data' in data,
      dataType: typeof data.data,
      data
    });
    
    if ('data' in data) {
      return data.data;
    }
  }
  
  // Fallback: return the data as-is if it doesn't have the expected structure
  return data;
};

// Generic request methods
export const apiRequest = {
  // GET request
  get: async <T>(url: string): Promise<T> => {
    const response = await apiClient.get<T>(url);
    return handleResponse(response, false); // Don't show toast for GET requests
  },

  // POST request
  post: async <T, D = any>(url: string, data?: D, showSuccessToast = true): Promise<T> => {
    const response = await apiClient.post<T>(url, data);
    return handleResponse(response, showSuccessToast);
  },

  // PUT request
  put: async <T, D = any>(url: string, data?: D, showSuccessToast = true): Promise<T> => {
    const response = await apiClient.put<T>(url, data);
    return handleResponse(response, showSuccessToast);
  },

  // PATCH request
  patch: async <T, D = any>(url: string, data?: D, showSuccessToast = true): Promise<T> => {
    const response = await apiClient.patch<T>(url, data);
    return handleResponse(response, showSuccessToast);
  },

  // DELETE request
  delete: async <T>(url: string, showSuccessToast = true): Promise<T> => {
    const response = await apiClient.delete<T>(url);
    return handleResponse(response, showSuccessToast);
  },
};

// Export axios instance for custom usage if needed
export { apiClient };

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}