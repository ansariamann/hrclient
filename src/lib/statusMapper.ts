import type { CandidateState, ClientAction } from '@/types/ats';

/**
 * Backend Application Status values
 */
export type BackendApplicationStatus =
  | 'RECEIVED'
  | 'SCREENING'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEWED'
  | 'OFFER_MADE'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

/**
 * Backend Candidate Status values
 */
export type BackendCandidateStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'LEFT'
  | 'HIRED'
  | 'REJECTED';

/**
 * Maps backend application status to frontend CandidateState
 */
export function mapApplicationStatusToState(status: string): CandidateState {
  const statusMap: Record<string, CandidateState> = {
    'RECEIVED': 'TO_REVIEW',
    'SCREENING': 'TO_REVIEW',
    'INTERVIEW_SCHEDULED': 'INTERVIEW_SCHEDULED',
    'INTERVIEWED': 'INTERVIEW_SCHEDULED',
    'OFFER_MADE': 'SELECTED',
    'HIRED': 'JOINED',
    'REJECTED': 'REJECTED',
    'WITHDRAWN': 'REJECTED',
  };
  return statusMap[status] || 'TO_REVIEW';
}

/**
 * Maps backend candidate status to frontend CandidateState
 */
export function mapCandidateStatusToState(status: string): CandidateState {
  const statusMap: Record<string, CandidateState> = {
    'ACTIVE': 'TO_REVIEW',
    'INACTIVE': 'REJECTED',
    'LEFT': 'LEFT_COMPANY',
    'HIRED': 'JOINED',
    'REJECTED': 'REJECTED',
  };
  return statusMap[status] || 'TO_REVIEW';
}

/**
 * Maps frontend CandidateState to backend application status for API calls
 */
export function mapStateToApplicationStatus(state: CandidateState): BackendApplicationStatus {
  const stateMap: Record<CandidateState, BackendApplicationStatus> = {
    'TO_REVIEW': 'SCREENING',
    'INTERVIEW_SCHEDULED': 'INTERVIEW_SCHEDULED',
    'SELECTED': 'OFFER_MADE',
    'JOINED': 'HIRED',
    'REJECTED': 'REJECTED',
    'LEFT_COMPANY': 'WITHDRAWN',
  };
  return stateMap[state];
}

/**
 * Maps frontend ClientAction to the corresponding backend status
 */
export function mapActionToBackendStatus(action: ClientAction): BackendApplicationStatus {
  const actionMap: Record<ClientAction, BackendApplicationStatus> = {
    'SCHEDULE_INTERVIEW': 'INTERVIEW_SCHEDULED',
    'SELECT': 'OFFER_MADE',
    'REJECT': 'REJECTED',
    'MARK_LEFT_COMPANY': 'WITHDRAWN',
  };
  return actionMap[action];
}

/**
 * Gets allowed actions based on current state
 */
export function getAllowedActionsForState(state: CandidateState): ClientAction[] {
  const allowedActionsMap: Record<CandidateState, ClientAction[]> = {
    'TO_REVIEW': ['SCHEDULE_INTERVIEW', 'SELECT', 'REJECT'],
    'INTERVIEW_SCHEDULED': ['SCHEDULE_INTERVIEW', 'SELECT', 'REJECT'],
    'SELECTED': ['REJECT'],
    'JOINED': ['MARK_LEFT_COMPANY'],
    'REJECTED': [],
    'LEFT_COMPANY': [],
  };
  return allowedActionsMap[state];
}

/**
 * Check if a transition from one state to another is valid
 */
export function isValidTransition(fromState: CandidateState, toState: CandidateState): boolean {
  const validTransitions: Record<CandidateState, CandidateState[]> = {
    'TO_REVIEW': ['INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED'],
    'INTERVIEW_SCHEDULED': ['INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED'],
    'SELECTED': ['JOINED', 'REJECTED'],
    'JOINED': ['LEFT_COMPANY'],
    'REJECTED': [],
    'LEFT_COMPANY': [],
  };
  return validTransitions[fromState]?.includes(toState) ?? false;
}

/**
 * Get display label for backend status
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'RECEIVED': 'Application Received',
    'SCREENING': 'Under Screening',
    'INTERVIEW_SCHEDULED': 'Interview Scheduled',
    'INTERVIEWED': 'Interviewed',
    'OFFER_MADE': 'Offer Made',
    'HIRED': 'Hired',
    'REJECTED': 'Rejected',
    'WITHDRAWN': 'Withdrawn',
    'ACTIVE': 'Active',
    'INACTIVE': 'Inactive',
    'LEFT': 'Left Company',
  };
  return labels[status] || status;
}
