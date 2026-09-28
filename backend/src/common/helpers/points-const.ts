/**
 * Point constants for LMS
 * Contains point values and action types for various user activities
 */

// Point values for different activities
export enum POINT_VALUES {
  TOPIC_COMPLETION = 15,
  CP_COMPLETION = 5,
  AP_SUBMISSION = 10,
  NOTES_SUBMISSION = 5, // Session notes submission
  OBJECTIVE_COMPLETION = 1, // Points for completing a learning objective
  OUTCOME_COMPLETION = 1 // Points for completing a learning outcome
}

// Action types for point records
export enum POINT_ACTIONS {
  TOPIC_COMPLETION = 'topic_completion',
  CP_COMPLETION = 'cp_completion',
  AP_SUBMISSION = 'ap_submission',
  NOTES_SUBMISSION = 'notes_submission', // Session notes submission
  OBJECTIVE_COMPLETION = 'objective_completion', // Action for completing a learning objective
  OUTCOME_COMPLETION = 'outcome_completion' // Action for completing a learning outcome
}

// Point rules description (for reference)
export const POINT_RULES_DESCRIPTION = {
  [POINT_ACTIONS.TOPIC_COMPLETION]: 'Topic completion',
  [POINT_ACTIONS.CP_COMPLETION]: 'Concept practice completion',
  [POINT_ACTIONS.AP_SUBMISSION]: 'Application problem submission',
  [POINT_ACTIONS.NOTES_SUBMISSION]: 'Session notes submission',
  [POINT_ACTIONS.OBJECTIVE_COMPLETION]: 'Learning objective completion',
  [POINT_ACTIONS.OUTCOME_COMPLETION]: 'Learning outcome completion'
}; 