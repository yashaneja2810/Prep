import { Request } from 'express';
import { COOKIES } from './string-const';

/**
 * Authentication Helper Functions
 * Utility functions for handling authentication tokens and sessions
 */

/**
 * Extract access token from request cookies or Authorization header
 *
 * This method checks multiple sources for the access token:
 * 1. Authorization header (Bearer token)
 * 2. Cookies using standardized cookie name from COOKIES constant
 *
 * @param req - Express request object
 * @returns Access token string or undefined if not found
 */
export function getAccessTokenFromRequest(req: Request): string | undefined {
  // Try to get from Authorization header first (most common for API calls)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get from cookies (common for web app sessions)
  const cookies = req.cookies;
  if (cookies) {
    // Use the standardized cookie name from constants
    return cookies[COOKIES.ACCESS_TOKEN];
  }

  return undefined;
}

/**
 * Extract refresh token from request cookies
 *
 * @param req - Express request object
 * @returns Refresh token string or undefined if not found
 */
export function getRefreshTokenFromRequest(req: Request): string | undefined {
  const cookies = req.cookies;
  if (cookies) {
    return cookies[COOKIES.REFRESH_TOKEN];
  }

  return undefined;
}

/**
 * Check if request has valid authentication token
 *
 * @param req - Express request object
 * @returns True if access token is present, false otherwise
 */
export function hasAuthToken(req: Request): boolean {
  return getAccessTokenFromRequest(req) !== undefined;
}
