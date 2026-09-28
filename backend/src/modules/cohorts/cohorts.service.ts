
import { Injectable, Logger, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';
import {
  CreateCohortDto,
  UpdateCohortDto,
  CohortStatus,
  AddTrainersToCohortDto,
  UpdateTrainerRoleDto,
  AddLearnersToCohortDto,
} from './dto';
import { UserWithProfile } from '../../common/types/auth.types';
import { USER_ROLES, TABLES, COLUMNS, ROLE_IDS } from '../../common/helpers/string-const';
import { successResponse, createdResponse, updatedResponse, deletedResponse } from '../../common/helpers/api-response.helper';

/**
 * Cohorts Service
 * Handles business logic for cohort management including trainers and learners
 */
@Injectable()
export class CohortsService {
  private readonly logger = new Logger(CohortsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new cohort
   * @param createCohortDto - Cohort data
   * @param currentUser - Current authenticated user
   * @returns The created cohort
   */
  async createCohort(createCohortDto: CreateCohortDto, currentUser: UserWithProfile) {
    try {
      this.logger.log(`Creating cohort with code: ${createCohortDto.cohort_code}`);
      
      // Check if cohort code already exists
      const { data: existingCohort, error: checkError } = await this.supabaseService.getClient()
        .from(TABLES.COHORTS)
        .select('*')
        .eq('cohort_code', createCohortDto.cohort_code)
        .maybeSingle();

      if (existingCohort) {
        throw new ConflictException(`Cohort with code ${createCohortDto.cohort_code} already exists`);
      }

      // Verify program exists
      const { data: program, error: programError } = await this.supabaseService.getClient()
        .from(TABLES.PROGRAMS)
        .select('*')
        .eq('id', createCohortDto.program_id)
        .single();

      if (programError || !program) {
        throw new NotFoundException(`Program with ID ${createCohortDto.program_id} not found`);
      }

      // If org_id is provided and not empty, verify it exists
      if (createCohortDto.org_id && createCohortDto.org_id.trim() !== '') {
        const { data: org, error: orgError } = await this.supabaseService.getClient()
          .from(TABLES.ORGANIZATIONS)
          .select('*')
          .eq('id', createCohortDto.org_id)
          .single();

        if (orgError || !org) {
          throw new NotFoundException(`Organization with ID ${createCohortDto.org_id} not found`);
        }
      } else if (createCohortDto.scope === 'organization') {
        // If scope is organization but org_id is missing or empty, throw an error
        throw new BadRequestException('Organization ID is required when scope is "organization"');
      }

      // Create cohort - set org_id to null if it's empty and scope is direct
      const now = new Date().toISOString();
      const orgId = createCohortDto.scope === 'direct' && (!createCohortDto.org_id || createCohortDto.org_id.trim() === '') 
        ? null 
        : createCohortDto.org_id;

      const cohortData = {
        cohort_code: createCohortDto.cohort_code,
        title: createCohortDto.title,
        description: createCohortDto.description,
        program_id: createCohortDto.program_id,
        org_id: orgId,
        scope: createCohortDto.scope,
        start_date: new Date(createCohortDto.start_date).toISOString(),
        end_date: new Date(createCohortDto.end_date).toISOString(),
        github_repo_link: createCohortDto.github_repo_link,
        status: createCohortDto.status || 'upcoming',
        created_at: now,
        updated_at: now
      };

      // Create the cohort
      const { data: cohort, error } = await this.supabaseService.getClient()
        .from(TABLES.COHORTS)
        .insert(cohortData)
        .select()
        .single();

      if (error) {
        this.logger.error(`Failed to create cohort: ${error.message}`);
        throw new BadRequestException(`Failed to create cohort: ${error.message}`);
      }

      // Add creator as trainer if they are a trainer
      if (currentUser.roles?.some(role => role.role_name === USER_ROLES.TRAINER)) {
        await this.supabaseService.getClient()
          .from(TABLES.COHORT_TRAINERS)
          .insert({
            cohort_id: cohort.id,
            user_id: currentUser.id,
            is_primary: true,
            assigned_at: now
          });
      }

      // Add trainers if provided
      if (createCohortDto.trainer_ids?.length) {
        const trainerData = createCohortDto.trainer_ids.map(trainerId => ({
          cohort_id: cohort.id,
          user_id: trainerId,
          is_primary: false,
          assigned_at: now
        }));

        await this.supabaseService.getClient()
          .from(TABLES.COHORT_TRAINERS)
          .insert(trainerData);
      }
      
      // Add learners if provided
      if (createCohortDto.learner_ids?.length) {
        const learnerData = createCohortDto.learner_ids.map(learnerId => ({
          cohort_id: cohort.id,
          user_id: learnerId,
          joined_at: now
        }));

        await this.supabaseService.getClient()
          .from(TABLES.COHORT_LEARNERS)
          .insert(learnerData);
      }

      return createdResponse(cohort, 'Cohort created successfully');
    } catch (error) {
      this.logger.error(`Error in createCohort: ${error.message}`);
      if (error instanceof ConflictException || error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create cohort: ${error.message}`);
    }
  }

  /**
   * Find all cohorts with optional filters
   * @param currentUser - Current authenticated user
   * @param filters - Optional filters for scope, status, programId
   * @returns List of cohorts
   */
  async findAllCohorts(currentUser: UserWithProfile, filters?: { scope?: string; status?: string; programId?: string }) {
    try {
      this.logger.log('Finding all cohorts');
      
      let query = this.supabaseService.getClient()
        .from(TABLES.COHORTS)
        .select(`
          *,
          program:program_id (title),
          organization:org_id (org_name),
          cohort_trainers (
            id,
            user_id,
            is_primary,
            user:user_id (
              id,
              first_name,
              last_name,
              email
            )
          ),
          cohort_learners (
            id
          )
        `);
      
      // Apply filters
      if (filters?.scope) {
        query = query.eq('scope', filters.scope);
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.programId) {
        query = query.eq('program_id', filters.programId);
      }

      // For trainers, only show cohorts they are assigned to
      if (currentUser.roles?.some(role => role.role_name === USER_ROLES.TRAINER) && 
          !currentUser.roles?.some(role => role.role_name === USER_ROLES.ADMIN)) {
        // First get trainer cohorts
        const { data: trainerCohorts } = await this.supabaseService.getClient()
          .from(TABLES.COHORT_TRAINERS)
          .select('cohort_id')
          .eq('user_id', currentUser.id);
        
        if (trainerCohorts?.length) {
          query = query.in('id', trainerCohorts.map(tc => tc.cohort_id));
        } else {
          // If no cohorts found for trainer, return empty array
          return successResponse([], 'No cohorts found for trainer');
        }
      }

      // Execute the query and return the results
      const { data: cohorts, error } = await query;

      if (error) {
        throw new Error(`Error fetching cohorts: ${error.message}`);
      }

      return successResponse(cohorts, 'Cohorts retrieved successfully');
    } catch (error) {
      this.logger.error(`Error in findAllCohorts: ${error.message}`);
      throw new BadRequestException(`Failed to fetch cohorts: ${error.message}`);
    }
  }

  /**
   * Find a cohort by ID
   * @param id - Cohort ID
   * @returns Cohort details
   */
  async findCohortById(id: string) {
    try {
      this.logger.log(`Finding cohort with ID: ${id}`);
      
      const { data: cohort, error } = await this.supabaseService.getClient()
        .from(TABLES.COHORTS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !cohort) {
        throw new NotFoundException(`Cohort with ID ${id} not found`);
      }
      
      return successResponse(cohort, 'Cohort retrieved successfully');
    } catch (error) {
      this.logger.error(`Error in findCohortById: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch cohort: ${error.message}`);
    }
  }

  async updateCohort(id: string, updateCohortDto: UpdateCohortDto, currentUser: UserWithProfile) {
    this.logger.log(`Updating cohort with ID: ${id}`);
    
    // Check if cohort exists
    let currentCohort;
    try {
      const response = await this.findCohortById(id);
      currentCohort = response.data;
    } catch (error) {
      throw new NotFoundException(`Cohort with ID ${id} not found`);
    }
    
    // Check for valid organization and scope combinations
    const updatedScope = updateCohortDto.scope || currentCohort.scope;
    if (updatedScope === 'organization') {
      const orgId = updateCohortDto.org_id !== undefined ? updateCohortDto.org_id : currentCohort.org_id;
      if (!orgId || orgId.trim() === '') {
        throw new BadRequestException('Organization ID is required when scope is "organization"');
      }

      // Verify the organization exists
      if (updateCohortDto.org_id && updateCohortDto.org_id.trim() !== '') {
        const { data: org, error: orgError } = await this.supabaseService.getClient()
          .from(TABLES.ORGANIZATIONS)
          .select('*')
          .eq('id', updateCohortDto.org_id)
          .single();

        if (orgError || !org) {
          throw new NotFoundException(`Organization with ID ${updateCohortDto.org_id} not found`);
        }
      }
    }
    
    // Prepare update data
    const updateData: any = {};
    
    // Only include fields that are provided
    if (updateCohortDto.title !== undefined) updateData.title = updateCohortDto.title;
    if (updateCohortDto.description !== undefined) updateData.description = updateCohortDto.description;
    if (updateCohortDto.github_repo_link !== undefined) updateData.github_repo_link = updateCohortDto.github_repo_link;
    if (updateCohortDto.scope !== undefined) updateData.scope = updateCohortDto.scope;
    if (updateCohortDto.status !== undefined) updateData.status = updateCohortDto.status;
    if (updateCohortDto.start_date !== undefined) updateData.start_date = new Date(updateCohortDto.start_date).toISOString();
    if (updateCohortDto.end_date !== undefined) updateData.end_date = new Date(updateCohortDto.end_date).toISOString();
    
    // Handle org_id based on scope
    if (updateCohortDto.org_id !== undefined) {
      // If scope is direct and org_id is empty, set to null
      if (updatedScope === 'direct' && updateCohortDto.org_id.trim() === '') {
        updateData.org_id = null;
      } else {
        updateData.org_id = updateCohortDto.org_id;
      }
    } else if (updateCohortDto.scope === 'direct' && currentCohort.scope === 'organization') {
      // If changing from organization scope to direct without providing org_id, set to null
      updateData.org_id = null;
    }
    
    // Always add updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    try {
      // Update the cohort
      const { data: updatedCohort, error } = await this.supabaseService.getClient()
        .from(TABLES.COHORTS)
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) {
        throw new Error(`Error updating cohort: ${error.message}`);
      }
      
      return {
        success: true,
        message: 'Cohort updated successfully',
        data: updatedCohort[0],
      };
    } catch (error) {
      throw new Error(`Error updating cohort: ${error.message}`);
    }
  }
  
  async deleteCohort(id: string) {
    this.logger.log(`Deleting cohort with ID: ${id}`);
    
    // Check if cohort exists
    try {
      await this.findCohortById(id);
    } catch (error) {
      throw new NotFoundException(`Cohort with ID ${id} not found`);
    }
    
    try {
      // Delete the cohort and related data
      await this.supabaseService.getClient()
        .from(TABLES.COHORTS)
        .delete()
        .eq('id', id);
      
      return {
        success: true,
        message: 'Cohort deleted successfully',
      };
    } catch (error) {
      throw new Error(`Error deleting cohort: ${error.message}`);
    }
  }

  // Trainer management methods
  async getCohortTrainers(cohortId: string) {
    this.logger.log(`Getting trainers for cohort with ID: ${cohortId}`);
    
    // Check if cohort exists
    try {
      await this.findCohortById(cohortId);
    } catch (error) {
      throw new NotFoundException(`Cohort with ID ${cohortId} not found`);
    }
    
    try {
      // Get trainers for this cohort
      const { data: trainers, error } = await this.supabaseService.getClient()
        .from(TABLES.COHORT_TRAINERS)
        .select(`
          *,
          user:user_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('cohort_id', cohortId);
        
      if (error) {
        throw new Error(`Error retrieving cohort trainers: ${error.message}`);
      }
      
      return {
        success: true,
        message: 'Cohort trainers retrieved successfully',
        data: trainers,
      };
    } catch (error) {
      throw new Error(`Error retrieving cohort trainers: ${error.message}`);
    }
  }
  
  async addTrainersToCohort(cohortId: string, addTrainersDto: AddTrainersToCohortDto, currentUser: UserWithProfile) {
    this.logger.log(`Adding trainers to cohort with ID: ${cohortId}`);
    
    // Check if cohort exists
    try {
      await this.findCohortById(cohortId);
    } catch (error) {
      throw new NotFoundException(`Cohort with ID ${cohortId} not found`);
    }
    
    if (!addTrainersDto.trainer_ids?.length) {
      throw new BadRequestException('No trainer IDs provided');
    }
    
    // Verify all trainer IDs exist
    for (const trainerId of addTrainersDto.trainer_ids) {
      const { data } = await this.supabaseService.getClient()
        .from(TABLES.USERS)
        .select('id')
        .eq('id', trainerId)
        .single();
        
      if (!data) {
        throw new NotFoundException(`User with ID ${trainerId} not found`);
      }
      
      // Check if user has trainer role
      const { data: userRoles } = await this.supabaseService.getClient()
        .from('user_roles')
        .select('*')
        .eq('user_id', trainerId)
        .eq('role_id', ROLE_IDS.TRAINER);
        
      if (!userRoles?.length) {
        throw new BadRequestException(`User with ID ${trainerId} is not a trainer`);
      }
    }
    
    // Prepare data for insertion
    const trainerData = addTrainersDto.trainer_ids.map(trainerId => ({
      cohort_id: cohortId,
      user_id: trainerId,
      is_primary: false,
      assigned_at: new Date().toISOString()
    }));
    
    try {
      // Add trainers to cohort
      const { error } = await this.supabaseService.getClient()
        .from(TABLES.COHORT_TRAINERS)
        .upsert(trainerData, { onConflict: 'cohort_id,user_id' });
        
      if (error) {
        throw new Error(`Error adding trainers to cohort: ${error.message}`);
      }
      
      return {
        success: true,
        message: 'Trainers added to cohort successfully',
        data: { count: trainerData.length },
      };
    } catch (error) {
      throw new Error(`Error adding trainers to cohort: ${error.message}`);
    }
  }
  
  async removeTrainerFromCohort(cohortId: string, trainerId: string, currentUser: UserWithProfile) {
    this.logger.log(`Removing trainer ${trainerId} from cohort ${cohortId}`);
    
    // Check if cohort exists
    try {
      await this.findCohortById(cohortId);
    } catch (error) {
      throw new NotFoundException(`Cohort with ID ${cohortId} not found`);
    }
    
    // Check if trainer is assigned to the cohort
    const { data: trainer } = await this.supabaseService.getClient()
      .from(TABLES.COHORT_TRAINERS)
      .select('*')
      .eq('cohort_id', cohortId)
      .eq('user_id', trainerId)
      .single();
      
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found in cohort ${cohortId}`);
    }
    
    // Count trainers in cohort
    const { count } = await this.supabaseService.getClient()
      .from(TABLES.COHORT_TRAINERS)
      .select('*', { count: 'exact', head: true })
      .eq('cohort_id', cohortId);
      
    // Prevent removing the last trainer
    if (count === null || count <= 1) {
      throw new BadRequestException('Cannot remove the last trainer from a cohort');
    }
    
    try {
      // Remove trainer from cohort
      await this.supabaseService.getClient()
        .from(TABLES.COHORT_TRAINERS)
        .delete()
        .eq('cohort_id', cohortId)
        .eq('user_id', trainerId);
        
      return {
        success: true,
        message: 'Trainer removed from cohort successfully',
      };
    } catch (error) {
      throw new Error(`Error removing trainer from cohort: ${error.message}`);
    }
  }
  
  async updateTrainerRole(cohortId: string, trainerId: string, updateRoleDto: UpdateTrainerRoleDto, currentUser: UserWithProfile) {
    this.logger.log(`Updating trainer ${trainerId} role in cohort ${cohortId}`);
    
    // Check if cohort exists
    try {
      await this.findCohortById(cohortId);
    } catch (error) {
      throw new NotFoundException(`Cohort with ID ${cohortId} not found`);
    }
    
    // Check if trainer is assigned to the cohort
    const { data: trainer } = await this.supabaseService.getClient()
      .from(TABLES.COHORT_TRAINERS)
      .select('*')
      .eq('cohort_id', cohortId)
      .eq('user_id', trainerId)
      .single();
      
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found in cohort ${cohortId}`);
    }
    
    try {
      // If setting as primary, unset any existing primary trainers
      if (updateRoleDto.is_primary) {
        await this.supabaseService.getClient()
          .from(TABLES.COHORT_TRAINERS)
          .update({ is_primary: false })
          .eq('cohort_id', cohortId)
          .eq('is_primary', true);
      }
      
      // Update trainer role
      await this.supabaseService.getClient()
        .from(TABLES.COHORT_TRAINERS)
        .update({ is_primary: updateRoleDto.is_primary })
        .eq('cohort_id', cohortId)
        .eq('user_id', trainerId);
        
      return {
        success: true,
        message: 'Trainer role updated successfully',
      };
    } catch (error) {
      throw new Error(`Error updating trainer role: ${error.message}`);
    }
  }

  // Learner management methods
  async getCohortLearners(cohortId: string) {
    this.logger.log(`Getting learners for cohort with ID: ${cohortId}`);
    
    // Check if cohort exists
    try {
      await this.findCohortById(cohortId);
    } catch (error) {
      throw new NotFoundException(`Cohort with ID ${cohortId} not found`);
    }
    
    try {
      // Get learners for this cohort
      const { data: learners, error } = await this.supabaseService.getClient()
        .from(TABLES.COHORT_LEARNERS)
        .select(`
          *,
          user:user_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('cohort_id', cohortId);
        
      if (error) {
        throw new Error(`Error retrieving cohort learners: ${error.message}`);
      }
      
      return {
        success: true,
        message: 'Cohort learners retrieved successfully',
        data: learners,
      };
    } catch (error) {
      throw new Error(`Error retrieving cohort learners: ${error.message}`);
    }
  }
  
  async addLearnersToCohort(cohortId: string, addLearnersDto: AddLearnersToCohortDto, currentUser: UserWithProfile) {
    this.logger.log(`Adding learners to cohort with ID: ${cohortId}`);
    
    // Check if cohort exists
    try {
      const cohort: { program_id: string } = await this.findCohortById(cohortId) as any;
      
      if (!addLearnersDto.learner_ids?.length) {
        throw new BadRequestException('No learner IDs provided');
      }
      
      // Verify all learner IDs exist and are enrolled in the program
      for (const learnerId of addLearnersDto.learner_ids) {
        const { data } = await this.supabaseService.getClient()
          .from(TABLES.USERS)
          .select('id')
          .eq('id', learnerId)
          .single();
          
        if (!data) {
          throw new NotFoundException(`User with ID ${learnerId} not found`);
        }
        
        // Check if user has learner role
        const { data: userRoles } = await this.supabaseService.getClient()
          .from('user_roles')
          .select('*')
          .eq('user_id', learnerId)
          .eq('role_id', ROLE_IDS.LEARNER);
          
        if (!userRoles?.length) {
          throw new BadRequestException(`User with ID ${learnerId} is not a learner`);
        }
        
        // Check if learner is enrolled in the program
        const { data: programEnrollment } = await this.supabaseService.getClient()
          .from(TABLES.LEARNER_PROGRAMS)
          .select('*')
          .eq('user_id', learnerId)
          .eq('program_id', cohort.program_id);
          
        if (!programEnrollment?.length) {
          throw new BadRequestException(`Learner with ID ${learnerId} is not enrolled in the program`);
        }
      }
      
      // Prepare data for insertion
      const learnerData = addLearnersDto.learner_ids.map(learnerId => ({
        cohort_id: cohortId,
        user_id: learnerId,
        joined_at: new Date().toISOString()
      }));
      
      // Add learners to cohort
      const { error } = await this.supabaseService.getClient()
        .from(TABLES.COHORT_LEARNERS)
        .upsert(learnerData, { onConflict: 'cohort_id,user_id' });
        
      if (error) {
        throw new Error(`Error adding learners to cohort: ${error.message}`);
      }
      
      return {
        success: true,
        message: 'Learners added to cohort successfully',
        data: { count: learnerData.length },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Cohort with ID ${cohortId} not found`);
      }
      throw error;
    }
  }
  
  async removeLearnerFromCohort(cohortId: string, learnerId: string, currentUser: UserWithProfile) {
    this.logger.log(`Removing learner ${learnerId} from cohort ${cohortId}`);
    
    // Check if cohort exists
    try {
      await this.findCohortById(cohortId);
    } catch (error) {
      throw new NotFoundException(`Cohort with ID ${cohortId} not found`);
    }
    
    // Check if learner is assigned to the cohort
    const { data: learner } = await this.supabaseService.getClient()
      .from(TABLES.COHORT_LEARNERS)
      .select('*')
      .eq('cohort_id', cohortId)
      .eq('user_id', learnerId)
      .single();
      
    if (!learner) {
      throw new NotFoundException(`Learner with ID ${learnerId} not found in cohort ${cohortId}`);
    }
    
    try {
      // Remove learner from cohort
      await this.supabaseService.getClient()
        .from(TABLES.COHORT_LEARNERS)
        .delete()
        .eq('cohort_id', cohortId)
        .eq('user_id', learnerId);
        
      return {
        success: true,
        message: 'Learner removed from cohort successfully',
      };
    } catch (error) {
      throw new Error(`Error removing learner from cohort: ${error.message}`);
    }
  }

  // Stats method
  async getCohortStats(cohortId: string) {
    this.logger.log(`Getting stats for cohort with ID: ${cohortId}`);
    
    // Check if cohort exists
    try {
      const cohort: any = await this.findCohortById(cohortId);
      
      // Get learner count
      const { count: learnerCount } = await this.supabaseService.getClient()
        .from(TABLES.COHORT_LEARNERS)
        .select('*', { count: 'exact', head: true })
        .eq('cohort_id', cohortId);
        
      // Get trainer count
      const { count: trainerCount } = await this.supabaseService.getClient()
        .from(TABLES.COHORT_TRAINERS)
        .select('*', { count: 'exact', head: true })
        .eq('cohort_id', cohortId);
      
      // Calculate days remaining
      const endDate = new Date(cohort.end_date);
      const today = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      // Calculate completion percentage
      const startDate = new Date(cohort.start_date);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      const daysPassed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      const completionPercentage = Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));
      
      return {
        success: true,
        message: 'Cohort stats retrieved successfully',
        data: {
          learner_count: learnerCount || 0,
          trainer_count: trainerCount || 0,
          days_remaining: daysRemaining >= 0 ? daysRemaining : 0,
          days_passed: daysPassed >= 0 ? daysPassed : 0,
          total_days: totalDays,
          completion_percentage: completionPercentage,
          start_date: cohort.start_date,
          end_date: cohort.end_date,
          status: cohort.status
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Cohort with ID ${cohortId} not found`);
      }
      throw error;
    }
  }
} 