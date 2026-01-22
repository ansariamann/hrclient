// ==================== Frontend Types ====================

// FSM States as defined by backend
export type CandidateState =
  | 'TO_REVIEW'
  | 'INTERVIEW_SCHEDULED'
  | 'SELECTED'
  | 'JOINED'
  | 'REJECTED'
  | 'LEFT_COMPANY';

// Allowed transitions for client portal
export type ClientAction =
  | 'SCHEDULE_INTERVIEW'
  | 'SELECT'
  | 'REJECT'
  | 'MARK_LEFT_COMPANY';

// Frontend Candidate type (transformed from backend)
export interface Candidate {
  id: string;
  applicationId: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  currentState: CandidateState;
  skills: string[];
  experienceSummary: string;
  resumeUrl?: string;
  allowedActions: ClientAction[];
  createdAt: string;
  updatedAt: string;
}

// Frontend Application type (transformed from backend)
export interface Application {
  id: string;
  candidateId: string;
  clientId: string;
  jobTitle?: string;
  applicationDate?: string;
  status: string;
  flaggedForReview: boolean;
  flagReason?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  candidate?: Candidate;
}

// ==================== Backend Response Types ====================

// Backend Candidate Response (matches CandidateResponse schema)
export interface BackendCandidateResponse {
  id: string;
  client_id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  skills?: Record<string, unknown> | string[];
  experience?: Record<string, unknown> | string;
  ctc_current?: number;
  ctc_expected?: number;
  status: string; // 'ACTIVE', 'INACTIVE', 'LEFT', 'HIRED', 'REJECTED'
  remark?: string;
  candidate_hash?: string;
  created_at: string;
  updated_at: string;
}

// Backend Application Response (matches ApplicationResponse schema)
export interface BackendApplicationResponse {
  id: string;
  candidate_id: string;
  client_id: string;
  job_title?: string;
  application_date?: string;
  status: string; // 'RECEIVED', 'SCREENING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFER_MADE', 'HIRED', 'REJECTED', 'WITHDRAWN'
  flagged_for_review: boolean;
  flag_reason?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  candidate?: BackendCandidateResponse;
}

// ==================== Timeline Types ====================

export type TimelineEventType =
  | 'state_change'
  | 'interview_round'
  | 'feedback';

export interface InterviewRoundDetails {
  roundNumber: number;
  mode: 'in_person' | 'video' | 'phone';
  interviewerName?: string;
  scheduledDate?: string;
}

export interface FeedbackDetails {
  roundNumber: number;
  rating: 1 | 2 | 3 | 4 | 5;
  recommendation: 'strong_yes' | 'yes' | 'neutral' | 'no' | 'strong_no';
}

export interface ApplicationTimeline {
  id: string;
  candidateId: string;
  eventType: TimelineEventType;
  state?: CandidateState;
  timestamp: string;
  actor: 'client' | 'system' | 'hr';
  note?: string;
  interviewDetails?: InterviewRoundDetails;
  feedbackDetails?: FeedbackDetails;
}

// ==================== Payload Types ====================

export interface ScheduleInterviewPayload {
  candidateId: string;
  scheduledDate: string;
  mode: 'in_person' | 'video' | 'phone';
  roundNumber: number;
  interviewerName?: string;
  notes?: string;
}

export interface InterviewFeedbackPayload {
  candidateId: string;
  roundNumber: number;
  rating: 1 | 2 | 3 | 4 | 5;
  recommendation: 'strong_yes' | 'yes' | 'neutral' | 'no' | 'strong_no';
  feedback: string;
}

export interface RejectPayload {
  candidateId: string;
  reason: RejectReason;
  feedback: string;
}

export type RejectReason =
  | 'skill_mismatch'
  | 'experience_insufficient'
  | 'culture_fit'
  | 'salary_expectation'
  | 'other';

export interface LeftCompanyPayload {
  candidateId: string;
  reason: LeftReason;
  feedback: string;
  lastWorkingDate?: string;
}

export type LeftReason =
  | 'resigned'
  | 'terminated'
  | 'contract_ended'
  | 'other';

// ==================== Auth Types ====================

export interface TokenValidationResult {
  valid: boolean;
  clientId?: string;
  clientName?: string;
  allowedApplicationIds?: string[];
  expiresAt?: string;
  error?: 'expired' | 'invalid' | 'revoked';
}

export interface LoginCredentials {
  username: string;  // OAuth2 uses 'username' for email
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  detail?: string; // FastAPI error format
}

// ==================== Constants ====================

export const RECOMMENDATION_LABELS: Record<FeedbackDetails['recommendation'], string> = {
  strong_yes: 'Strong Yes',
  yes: 'Yes',
  neutral: 'Neutral',
  no: 'No',
  strong_no: 'Strong No',
};

// FSM State to allowed actions mapping (frontend reference only - backend is source of truth)
export const STATE_ALLOWED_ACTIONS: Record<CandidateState, ClientAction[]> = {
  TO_REVIEW: ['SCHEDULE_INTERVIEW', 'SELECT', 'REJECT'],
  INTERVIEW_SCHEDULED: ['SCHEDULE_INTERVIEW', 'SELECT', 'REJECT'],
  SELECTED: ['REJECT'],
  JOINED: ['MARK_LEFT_COMPANY'],
  REJECTED: [],
  LEFT_COMPANY: [],
};

export const STATE_LABELS: Record<CandidateState, string> = {
  TO_REVIEW: 'To Review',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  SELECTED: 'Selected',
  JOINED: 'Joined',
  REJECTED: 'Rejected',
  LEFT_COMPANY: 'Left Company',
};

export const REJECT_REASON_LABELS: Record<RejectReason, string> = {
  skill_mismatch: 'Skills do not match requirements',
  experience_insufficient: 'Insufficient experience',
  culture_fit: 'Culture fit concerns',
  salary_expectation: 'Salary expectations mismatch',
  other: 'Other reason',
};

export const LEFT_REASON_LABELS: Record<LeftReason, string> = {
  resigned: 'Resigned voluntarily',
  terminated: 'Employment terminated',
  contract_ended: 'Contract period ended',
  other: 'Other reason',
};

// Backend status to frontend state mapping
export const BACKEND_STATUS_TO_STATE: Record<string, CandidateState> = {
  // Candidate statuses
  'ACTIVE': 'TO_REVIEW',
  'INACTIVE': 'REJECTED',
  'LEFT': 'LEFT_COMPANY',
  'HIRED': 'JOINED',
  'REJECTED': 'REJECTED',
  // Application statuses
  'RECEIVED': 'TO_REVIEW',
  'SCREENING': 'TO_REVIEW',
  'INTERVIEW_SCHEDULED': 'INTERVIEW_SCHEDULED',
  'INTERVIEWED': 'INTERVIEW_SCHEDULED',
  'OFFER_MADE': 'SELECTED',
  'WITHDRAWN': 'REJECTED',
};
