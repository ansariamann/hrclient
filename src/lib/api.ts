import type {
  Candidate,
  Application,
  BackendCandidateResponse,
  BackendApplicationResponse,
  ApplicationTimeline,
  TokenValidationResult,
  ScheduleInterviewPayload,
  RejectPayload,
  LeftCompanyPayload,
  InterviewFeedbackPayload,
  ApiError,
  LoginCredentials,
  LoginResponse,
} from '@/types/ats';

// Demo mode flag - set to false to use real backend
const DEMO_MODE = false;

// API base URL - configured via environment variable
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Storage keys
const TOKEN_STORAGE_KEY = 'ats_client_token';

// Mock data imports for demo mode fallback
import { mockCandidates, mockTimeline, mockTokenValidation } from './mockData';
let demoCandidates = [...mockCandidates];

/**
 * Transform backend candidate response to frontend Candidate type
 */
function transformCandidate(backend: BackendCandidateResponse, application?: BackendApplicationResponse): Candidate {
  // Extract skills array from JSONB format
  let skills: string[] = [];
  if (backend.skills) {
    if (Array.isArray(backend.skills)) {
      skills = backend.skills;
    } else if (backend.skills.skills && Array.isArray(backend.skills.skills)) {
      skills = backend.skills.skills;
    } else if (typeof backend.skills === 'object') {
      skills = Object.keys(backend.skills);
    }
  }

  // Build experience summary from experience JSONB
  let experienceSummary = '';
  if (backend.experience) {
    if (typeof backend.experience === 'string') {
      experienceSummary = backend.experience;
    } else if (backend.experience.summary) {
      experienceSummary = backend.experience.summary;
    } else if (backend.experience.years) {
      experienceSummary = `${backend.experience.years} years of experience`;
    }
  }

  // Map backend status to frontend state
  const stateMap: Record<string, Candidate['currentState']> = {
    'ACTIVE': 'TO_REVIEW',
    'INACTIVE': 'REJECTED',
    'LEFT': 'LEFT_COMPANY',
    'HIRED': 'JOINED',
    'REJECTED': 'REJECTED',
  };

  // If we have application data, use that for state
  let currentState: Candidate['currentState'] = stateMap[backend.status] || 'TO_REVIEW';
  let applicationId = '';

  if (application) {
    const appStateMap: Record<string, Candidate['currentState']> = {
      'RECEIVED': 'TO_REVIEW',
      'SCREENING': 'TO_REVIEW',
      'INTERVIEW_SCHEDULED': 'INTERVIEW_SCHEDULED',
      'INTERVIEWED': 'INTERVIEW_SCHEDULED',
      'OFFER_MADE': 'SELECTED',
      'HIRED': 'JOINED',
      'REJECTED': 'REJECTED',
      'WITHDRAWN': 'REJECTED',
    };
    currentState = appStateMap[application.status] || 'TO_REVIEW';
    applicationId = application.id;
  }

  // Determine allowed actions based on state
  const allowedActionsMap: Record<Candidate['currentState'], Candidate['allowedActions']> = {
    'TO_REVIEW': ['SCHEDULE_INTERVIEW', 'SELECT', 'REJECT'],
    'INTERVIEW_SCHEDULED': ['SCHEDULE_INTERVIEW', 'SELECT', 'REJECT'],
    'SELECTED': ['REJECT'],
    'JOINED': ['MARK_LEFT_COMPANY'],
    'REJECTED': [],
    'LEFT_COMPANY': [],
  };

  return {
    id: backend.id,
    applicationId: applicationId,
    name: backend.name,
    email: backend.email,
    phone: backend.phone,
    location: backend.location,
    currentState,
    skills,
    experienceSummary,
    resumeUrl: undefined, // Backend doesn't have direct resume URL on candidate
    allowedActions: allowedActionsMap[currentState],
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  };
}

/**
 * Transform backend application response to frontend Application type
 */
function transformApplication(backend: BackendApplicationResponse): Application {
  return {
    id: backend.id,
    candidateId: backend.candidate_id,
    clientId: backend.client_id,
    jobTitle: backend.job_title,
    applicationDate: backend.application_date,
    status: backend.status,
    flaggedForReview: backend.flagged_for_review,
    flagReason: backend.flag_reason,
    isDeleted: backend.is_deleted,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
    candidate: backend.candidate ? transformCandidate(backend.candidate) : undefined,
  };
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Try to restore token from storage
    this.token = localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      }));
      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ==================== Authentication ====================

  /**
   * Login with email and password (OAuth2 compatible)
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (credentials.username === 'demo@example.com' && credentials.password === 'demo123') {
        const response: LoginResponse = {
          access_token: 'demo-token-12345',
          token_type: 'bearer',
        };
        this.setToken(response.access_token);
        return response;
      }
      throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
    }

    // OAuth2 form data format
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      }));
      throw error;
    }

    const data: LoginResponse = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  /**
   * Token validation (for backwards compatibility with token-based auth)
   */
  async validateToken(token: string): Promise<TokenValidationResult> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (token.startsWith('demo') || token === 'test') {
        return mockTokenValidation;
      }
      return { valid: false, error: 'invalid' };
    }

    try {
      // Set the token and try to make a request
      this.setToken(token);

      // Try to get current user info to validate token
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        return {
          valid: true,
          clientId: user.client_id,
          clientName: user.client_name || 'Client',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Assume 24h
        };
      }

      this.clearToken();
      return { valid: false, error: 'invalid' };
    } catch {
      this.clearToken();
      return { valid: false, error: 'invalid' };
    }
  }

  // ==================== Candidates ====================

  /**
   * Get all candidates with their applications
   */
  async getCandidates(): Promise<Candidate[]> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return demoCandidates;
    }

    // Get applications which include candidate data
    const applications = await this.request<BackendApplicationResponse[]>('/applications/');

    // Transform to frontend Candidate type
    const candidates: Candidate[] = [];
    const seenCandidates = new Set<string>();

    for (const app of applications) {
      if (app.candidate && !seenCandidates.has(app.candidate.id)) {
        seenCandidates.add(app.candidate.id);
        candidates.push(transformCandidate(app.candidate, app));
      }
    }

    return candidates;
  }

  /**
   * Get a single candidate by ID
   */
  async getCandidate(id: string): Promise<Candidate> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const candidate = demoCandidates.find(c => c.id === id);
      if (!candidate) {
        throw { code: 'NOT_FOUND', message: 'Candidate not found' };
      }
      return candidate;
    }

    const backend = await this.request<BackendCandidateResponse>(`/candidates/${id}`);

    // Get applications for this candidate to determine state
    const applications = await this.request<BackendApplicationResponse[]>(`/applications/candidate/${id}`);
    const latestApp = applications.length > 0 ? applications[0] : undefined;

    return transformCandidate(backend, latestApp);
  }

  /**
   * Get candidate timeline (application history)
   */
  async getCandidateTimeline(id: string): Promise<ApplicationTimeline[]> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockTimeline[id] || [];
    }

    // For now, construct timeline from applications
    // This would be better served by a dedicated backend endpoint
    const applications = await this.request<BackendApplicationResponse[]>(`/applications/candidate/${id}`);

    const timeline: ApplicationTimeline[] = [];

    for (const app of applications) {
      // Add application creation as timeline event
      timeline.push({
        id: `timeline-${app.id}-created`,
        candidateId: id,
        eventType: 'state_change',
        state: 'TO_REVIEW',
        timestamp: app.created_at,
        actor: 'system',
        note: `Application received for ${app.job_title || 'position'}`,
      });

      // Add status as current state
      if (app.status !== 'RECEIVED') {
        const stateMap: Record<string, ApplicationTimeline['state']> = {
          'SCREENING': 'TO_REVIEW',
          'INTERVIEW_SCHEDULED': 'INTERVIEW_SCHEDULED',
          'INTERVIEWED': 'INTERVIEW_SCHEDULED',
          'OFFER_MADE': 'SELECTED',
          'HIRED': 'JOINED',
          'REJECTED': 'REJECTED',
          'WITHDRAWN': 'REJECTED',
        };

        timeline.push({
          id: `timeline-${app.id}-status`,
          candidateId: id,
          eventType: 'state_change',
          state: stateMap[app.status],
          timestamp: app.updated_at,
          actor: 'client',
        });
      }
    }

    return timeline.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  // ==================== Applications ====================

  /**
   * Get all applications
   */
  async getApplications(filters?: {
    status?: string;
    flaggedOnly?: boolean;
    includeDeleted?: boolean;
  }): Promise<Application[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('application_status', filters.status);
    if (filters?.flaggedOnly) params.append('flagged_only', 'true');
    if (filters?.includeDeleted) params.append('include_deleted', 'true');

    const queryString = params.toString();
    const endpoint = `/applications/${queryString ? `?${queryString}` : ''}`;

    const applications = await this.request<BackendApplicationResponse[]>(endpoint);
    return applications.map(transformApplication);
  }

  /**
   * Get application by ID
   */
  async getApplication(id: string): Promise<Application> {
    const backend = await this.request<BackendApplicationResponse>(`/applications/${id}`);
    return transformApplication(backend);
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(
    applicationId: string,
    newStatus: string,
    forceUpdate: boolean = false
  ): Promise<Application> {
    const params = new URLSearchParams();
    params.append('new_status', newStatus);
    if (forceUpdate) params.append('force_update', 'true');

    const backend = await this.request<BackendApplicationResponse>(
      `/applications/${applicationId}/status?${params.toString()}`,
      { method: 'PUT' }
    );
    return transformApplication(backend);
  }

  // ==================== Actions ====================

  /**
   * Schedule an interview for a candidate
   */
  async scheduleInterview(payload: ScheduleInterviewPayload): Promise<Candidate> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const index = demoCandidates.findIndex(c => c.id === payload.candidateId);
      if (index === -1) {
        throw { code: 'NOT_FOUND', message: 'Candidate not found' };
      }

      demoCandidates[index] = {
        ...demoCandidates[index],
        currentState: 'INTERVIEW_SCHEDULED',
        allowedActions: ['SCHEDULE_INTERVIEW', 'SELECT', 'REJECT'],
        updatedAt: new Date().toISOString(),
      };

      return demoCandidates[index];
    }

    // Get the application ID from the candidate
    const candidate = await this.getCandidate(payload.candidateId);
    if (!candidate.applicationId) {
      throw { code: 'NO_APPLICATION', message: 'Candidate has no active application' };
    }

    // Update application status
    await this.updateApplicationStatus(candidate.applicationId, 'INTERVIEW_SCHEDULED');

    // Return updated candidate
    return this.getCandidate(payload.candidateId);
  }

  /**
   * Submit interview feedback
   */
  async submitFeedback(payload: InterviewFeedbackPayload): Promise<Candidate> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const index = demoCandidates.findIndex(c => c.id === payload.candidateId);
      if (index === -1) {
        throw { code: 'NOT_FOUND', message: 'Candidate not found' };
      }

      // Add feedback to timeline
      const feedbackEvent = {
        id: `timeline-feedback-${Date.now()}`,
        candidateId: payload.candidateId,
        eventType: 'feedback' as const,
        timestamp: new Date().toISOString(),
        actor: 'client' as const,
        note: payload.feedback,
        feedbackDetails: {
          roundNumber: payload.roundNumber,
          rating: payload.rating,
          recommendation: payload.recommendation,
        },
      };

      if (!mockTimeline[payload.candidateId]) {
        mockTimeline[payload.candidateId] = [];
      }
      mockTimeline[payload.candidateId].push(feedbackEvent);

      return demoCandidates[index];
    }

    // For now, we'll update the candidate's remark field with feedback
    // A proper implementation would need a dedicated feedback endpoint
    const candidate = await this.getCandidate(payload.candidateId);

    // Update candidate with feedback as remark
    await this.request(`/candidates/${payload.candidateId}`, {
      method: 'PUT',
      body: JSON.stringify({
        remark: `Round ${payload.roundNumber} Feedback (${payload.recommendation}, ${payload.rating}/5): ${payload.feedback}`,
      }),
    });

    return this.getCandidate(payload.candidateId);
  }

  /**
   * Select a candidate
   */
  async selectCandidate(candidateId: string): Promise<Candidate> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const index = demoCandidates.findIndex(c => c.id === candidateId);
      if (index === -1) {
        throw { code: 'NOT_FOUND', message: 'Candidate not found' };
      }

      demoCandidates[index] = {
        ...demoCandidates[index],
        currentState: 'SELECTED',
        allowedActions: ['REJECT'],
        updatedAt: new Date().toISOString(),
      };

      return demoCandidates[index];
    }

    const candidate = await this.getCandidate(candidateId);
    if (!candidate.applicationId) {
      throw { code: 'NO_APPLICATION', message: 'Candidate has no active application' };
    }

    await this.updateApplicationStatus(candidate.applicationId, 'OFFER_MADE');
    return this.getCandidate(candidateId);
  }

  /**
   * Reject a candidate
   */
  async rejectCandidate(payload: RejectPayload): Promise<Candidate> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const index = demoCandidates.findIndex(c => c.id === payload.candidateId);
      if (index === -1) {
        throw { code: 'NOT_FOUND', message: 'Candidate not found' };
      }

      demoCandidates[index] = {
        ...demoCandidates[index],
        currentState: 'REJECTED',
        allowedActions: [],
        updatedAt: new Date().toISOString(),
      };

      return demoCandidates[index];
    }

    const candidate = await this.getCandidate(payload.candidateId);
    if (!candidate.applicationId) {
      throw { code: 'NO_APPLICATION', message: 'Candidate has no active application' };
    }

    await this.updateApplicationStatus(candidate.applicationId, 'REJECTED');

    // Update candidate with rejection reason
    await this.request(`/candidates/${payload.candidateId}`, {
      method: 'PUT',
      body: JSON.stringify({
        remark: `Rejected: ${payload.reason} - ${payload.feedback}`,
        status: 'REJECTED',
      }),
    });

    return this.getCandidate(payload.candidateId);
  }

  /**
   * Mark candidate as left company
   */
  async markLeftCompany(payload: LeftCompanyPayload): Promise<Candidate> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const index = demoCandidates.findIndex(c => c.id === payload.candidateId);
      if (index === -1) {
        throw { code: 'NOT_FOUND', message: 'Candidate not found' };
      }

      demoCandidates[index] = {
        ...demoCandidates[index],
        currentState: 'LEFT_COMPANY',
        allowedActions: [],
        updatedAt: new Date().toISOString(),
      };

      return demoCandidates[index];
    }

    // Update candidate status to LEFT
    await this.request(`/candidates/${payload.candidateId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'LEFT',
        remark: `Left company: ${payload.reason} - ${payload.feedback}${payload.lastWorkingDate ? ` (Last day: ${payload.lastWorkingDate})` : ''}`,
      }),
    });

    return this.getCandidate(payload.candidateId);
  }

  // ==================== Statistics ====================

  /**
   * Get candidate statistics
   */
  async getCandidateStats(): Promise<Record<string, unknown>> {
    return this.request('/candidates/stats/summary');
  }

  /**
   * Get application statistics
   */
  async getApplicationStats(): Promise<Record<string, unknown>> {
    return this.request('/applications/stats/summary');
  }
}

export const apiClient = new ApiClient();
export type { ApiError };
