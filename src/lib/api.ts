import type {
  Candidate,
  ClientAction,
  ApplicationTimeline,
  TokenValidationResult,
  LoginCredentials,
  LoginResponse,
  ScheduleInterviewPayload,
  RejectPayload,
  LeftCompanyPayload,
  InterviewFeedbackPayload,
  ApiError,
  User,
  CompanyEmployee,
  Job,
  JobInput,
} from '@/types/ats';

import { API_URL } from './config';
import { clearAuthToken, setAuthToken } from './authToken';

function normalizeApiDate(value?: string | null): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(trimmed)) {
    return `${trimmed.replace(' ', 'T')}Z`;
  }

  return trimmed;
}

interface BackendCandidate {
  id: string;
  name: string;
  location?: string | null;
  email?: string | null;
  remark?: string | null;
  resume_file_path?: string | null;
  resume_url?: string | null;
  ctc_current?: number | null;
  ctc_expected?: number | null;
  skills?: { skills?: string[] } | null;
  experience?: Record<string, unknown> | null;
  status?: string;
  created_at: string;
  updated_at: string;
}

interface BackendApplication {
  id: string;
  candidate_id: string;
  client_id: string;
  job_title?: string | null;
  application_date: string;
  status: string;
  flagged_for_review?: boolean;
  flag_reason?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  candidate?: BackendCandidate | null;
}

interface BackendJob {
  id: string;
  client_id: string;
  title: string;
  company_name: string;
  posting_date: string;
  requirements?: string | null;
  experience_required?: number | null;
  salary_lpa?: number | null;
  location?: string | null;
  submitted_by_client?: boolean;
  created_at: string;
  updated_at: string;
}

interface BackendCompanyEmployee {
  id: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  role: string;
  created_at: string;
}

const statusToState: Record<string, Candidate['currentState']> = {
  ACTIVE: 'TO_REVIEW',
  INACTIVE: 'REJECTED',
  HIRED: 'JOINED',
  LEFT: 'LEFT_COMPANY',
  LEFT_COMPANY: 'LEFT_COMPANY',
  REJECTED: 'REJECTED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  SELECTED: 'SELECTED',
};

function getAllowedActions(state: Candidate['currentState']): ClientAction[] {
  switch (state) {
    case 'TO_REVIEW':
      return ['SCHEDULE_INTERVIEW', 'REJECT'];
    case 'INTERVIEW_SCHEDULED':
      return ['SELECT', 'REJECT'];
    case 'SELECTED':
    case 'JOINED':
      return ['MARK_LEFT_COMPANY'];
    case 'REJECTED':
    case 'LEFT_COMPANY':
    default:
      return [];
  }
}

function buildExperienceSummary(backend: BackendCandidate): string {
  const skills = Array.isArray(backend.skills?.skills) ? backend.skills!.skills! : [];
  const years = typeof backend.experience?.years === 'number' ? backend.experience.years : undefined;
  const role = typeof backend.experience?.current_role === 'string' ? backend.experience.current_role : undefined;
  const summaryParts = [
    years !== undefined ? `${years} years of experience` : undefined,
    role,
  ].filter(Boolean);

  if (summaryParts.length > 0) {
    return summaryParts.join(' - ');
  }
  if (skills.length > 0) {
    return `Skills: ${skills.slice(0, 4).join(', ')}`;
  }
  return 'Experience details not provided';
}

const applicationStatusToState: Record<string, Candidate['currentState']> = {
  RECEIVED: 'TO_REVIEW',
  SCREENING: 'TO_REVIEW',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  INTERVIEWED: 'INTERVIEW_SCHEDULED',
  OFFER_MADE: 'SELECTED',
  HIRED: 'JOINED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'REJECTED',
};

function toFrontendCandidate(
  backend: BackendCandidate,
  application?: BackendApplication | null
): Candidate {
  const skills = Array.isArray(backend.skills?.skills) ? backend.skills!.skills! : [];

  const resumeUrl = backend.resume_file_path
    ? (backend.resume_file_path.startsWith('http') ? backend.resume_file_path : `${API_URL}${backend.resume_file_path}`)
    : backend.resume_url
      ? (backend.resume_url.startsWith('http') ? backend.resume_url : `${API_URL}${backend.resume_url}`)
    : undefined;
  const ctcCurrent = backend.ctc_current == null ? undefined : Number(backend.ctc_current);
  const ctcExpected = backend.ctc_expected == null ? undefined : Number(backend.ctc_expected);
  const candidateState = application?.status
    ? (applicationStatusToState[application.status] || statusToState[backend.status || 'ACTIVE'] || 'TO_REVIEW')
    : (statusToState[backend.status || 'ACTIVE'] || 'TO_REVIEW');

  return {
    id: backend.id,
    applicationId: application?.id || `APP-${backend.id.slice(0, 8).toUpperCase()}`,
    jobTitle: application?.job_title || undefined,
    applicationStatus: application?.status || undefined,
    remark: backend.remark || undefined,
    submittedAt:
      normalizeApiDate(application?.application_date) ||
      normalizeApiDate(application?.created_at) ||
      normalizeApiDate(backend.created_at) ||
      backend.created_at,
    name: backend.name,
    location: backend.location || undefined,
    ctcCurrent,
    ctcExpected,
    currentState: candidateState,
    skills,
    experienceSummary: buildExperienceSummary(backend),
    resumeUrl,
    allowedActions: getAllowedActions(candidateState),
    createdAt: normalizeApiDate(backend.created_at) || backend.created_at,
    updatedAt: normalizeApiDate(backend.updated_at) || backend.updated_at,
  };
}

function toFrontendCandidateFromApplication(application: BackendApplication): Candidate | null {
  const candidate = application.candidate;
  if (!candidate) {
    console.warn('Application is missing candidate details, skipping:', application);
    return null;
  }
  return toFrontendCandidate(candidate, application);
}

function transformJob(backend: BackendJob): Job {
  return {
    id: backend.id,
    clientId: backend.client_id,
    title: backend.title,
    companyName: backend.company_name,
    postingDate: backend.posting_date,
    requirements: backend.requirements || undefined,
    experienceRequired: backend.experience_required ?? undefined,
    salaryLpa: backend.salary_lpa == null ? undefined : Number(backend.salary_lpa),
    location: backend.location || undefined,
    submittedByClient: backend.submitted_by_client ?? false,
    createdAt: normalizeApiDate(backend.created_at) || backend.created_at,
    updatedAt: normalizeApiDate(backend.updated_at) || backend.updated_at,
  };
}

function transformCompanyEmployee(backend: BackendCompanyEmployee): CompanyEmployee {
  return {
    id: backend.id,
    email: backend.email,
    fullName: backend.full_name || undefined,
    role: backend.role,
    isActive: backend.is_active,
    createdAt: normalizeApiDate(backend.created_at) || backend.created_at,
  };
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    setAuthToken(token);
  }

  clearToken() {
    this.token = null;
    clearAuthToken();
  }

  private async parseError(response: Response): Promise<ApiError> {
    const fallbackMessage = `Request failed with status ${response.status}`;

    try {
      const text = await response.text();
      if (!text) {
        return {
          code: `HTTP_${response.status}`,
          message: fallbackMessage,
        };
      }

      try {
        const parsed = JSON.parse(text) as {
          code?: string;
          message?: string;
          detail?: string;
          error?: { message?: string; category?: string };
        };

        return {
          code: parsed.code || parsed.error?.category || `HTTP_${response.status}`,
          message: parsed.error?.message || parsed.detail || parsed.message || fallbackMessage,
        };
      } catch {
        return {
          code: `HTTP_${response.status}`,
          message: text,
        };
      }
    } catch {
      return {
        code: `HTTP_${response.status}`,
        message: fallbackMessage,
      };
    }
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

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
      }
      throw error;
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  }

  // ==================== Authentication ====================

  /**
   * Login with email and password (OAuth2 compatible)
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // OAuth2 form data format
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_URL}/auth/client/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await this.parseError(response);
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
    try {
      // Set the token and try to make a request
      this.setToken(token);

      // Try to get current user info to validate token
      const response = await fetch(`${API_URL}/auth/client/me`, {
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

  // Candidates
  private async getCandidateApplications(candidateId: string): Promise<BackendApplication[]> {
    return this.request<BackendApplication[]>(`/candidates/${candidateId}/applications`);
  }

  private async enrichCandidateFromBackend(backend: BackendCandidate): Promise<Candidate> {
    try {
      const applications = await this.getCandidateApplications(backend.id);
      const application = applications[0];
      return toFrontendCandidate(backend, application);
    } catch {
      return toFrontendCandidate(backend);
    }
  }

  async getCandidates(): Promise<Candidate[]> {
    const backend = await this.request<BackendApplication[]>('/applications');
    return backend.map(toFrontendCandidateFromApplication).filter((c): c is Candidate => c !== null);
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/client/me');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ status: string }> {
    return this.request<{ status: string }>('/auth/password/change', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }

  async getCandidate(id: string): Promise<Candidate> {
    const backend = await this.request<BackendCandidate>(`/candidates/${id}`);
    return this.enrichCandidateFromBackend(backend);
  }

  async getCandidateTimeline(id: string): Promise<ApplicationTimeline[]> {
    return this.request<ApplicationTimeline[]>(`/candidates/${id}/timeline`);
  }

  // Actions
  async scheduleInterview(payload: ScheduleInterviewPayload): Promise<Candidate> {
    const { candidateId, ...bodyPayload } = payload;
    const backend = await this.request<BackendCandidate>(`/candidates/${candidateId}/schedule-interview`, {
      method: 'POST',
      body: JSON.stringify(bodyPayload),
    });
    return this.enrichCandidateFromBackend(backend);
  }

  async submitFeedback(payload: InterviewFeedbackPayload): Promise<Candidate> {
    const { candidateId, ...bodyPayload } = payload;
    const backend = await this.request<BackendCandidate>(`/candidates/${candidateId}/submit-feedback`, {
      method: 'POST',
      body: JSON.stringify(bodyPayload),
    });
    return this.enrichCandidateFromBackend(backend);
  }

  async selectCandidate(candidateId: string): Promise<Candidate> {
    const backend = await this.request<BackendCandidate>(`/candidates/${candidateId}/select`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return this.enrichCandidateFromBackend(backend);
  }

  async rejectCandidate(payload: RejectPayload): Promise<Candidate> {
    const backend = await this.request<BackendCandidate>(`/candidates/${payload.candidateId}/reject`, {
      method: 'POST',
      body: JSON.stringify({
        reason: payload.reason,
        feedback: payload.feedback,
      }),
    });
    return this.enrichCandidateFromBackend(backend);
  }

  async markLeftCompany(payload: LeftCompanyPayload): Promise<Candidate> {
    const { candidateId, ...bodyPayload } = payload;
    const backend = await this.request<BackendCandidate>(`/candidates/${candidateId}/left-company`, {
      method: 'POST',
      body: JSON.stringify(bodyPayload),
    });
    return this.enrichCandidateFromBackend(backend);
  }

  async createJob(payload: JobInput): Promise<Job> {
    const backendPayload: Record<string, unknown> = {
      title: payload.title,
      company_name: payload.companyName,
      requirements: payload.requirements,
      experience_required: payload.experienceRequired,
      salary_lpa: payload.salaryLpa,
      location: payload.location,
    };

    if (payload.clientId) {
      backendPayload.client_id = payload.clientId;
    }

    const backend = await this.request<BackendJob>('/jobs/', {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    });
    return transformJob(backend);
  }

  async getCompanyEmployees(): Promise<CompanyEmployee[]> {
    const backend = await this.request<BackendCompanyEmployee[]>('/clients/me/users');
    return backend.map(transformCompanyEmployee);
  }
}

export const apiClient = new ApiClient();
export type { ApiError };
