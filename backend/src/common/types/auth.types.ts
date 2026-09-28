import { User, Session } from '@supabase/supabase-js';
import { Request } from 'express';

/**
 * User role interface with complete role information
 */
export interface UserRole {
  id: string;
  role_id: number;
  role_name: string;
  description: string;
  is_active: boolean;
  assigned_at: string;
  assigned_by: string;
}

/**
 * Organization interface
 */
export interface Organization {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Extended user interface with profile and organizational data
 */
export interface UserWithProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  preferred_name?: string;
  phone?: string;
  date_of_birth?: string;
  timezone?: string;
  email_verified?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  roles: UserRole[];
  organizations: Organization[];
  profile?: any; // Will be typed specifically as LearnerProfile | TrainerProfile | AdminProfile later
}

/**
 * Authenticated request interface extending Express Request
 */
export interface AuthenticatedRequest extends Request {
  user: UserWithProfile;
} 