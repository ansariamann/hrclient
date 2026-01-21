import type {
  Candidate,
  ApplicationTimeline,
  TokenValidationResult,
  ScheduleInterviewPayload,
  RejectPayload,
  LeftCompanyPayload,
  InterviewFeedbackPayload,
  ApiError,
} from '@/types/ats';

// Demo mode flag - set to false to use real backend
const DEMO_MODE = false;

// API base URL - configured via environment variable
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
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

    return response.json();
  }

  // Token validation
  async validateToken(token: string): Promise<TokenValidationResult> {
    return this.request<TokenValidationResult>('/auth/validate', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Candidates
  async getCandidates(): Promise<Candidate[]> {
    return this.request<Candidate[]>('/candidates/');
  }

  async getCandidate(id: string): Promise<Candidate> {
    return this.request<Candidate>(`/candidates/${id}`);
  }

  async getCandidateTimeline(id: string): Promise<ApplicationTimeline[]> {
    // Note: Backend may need to implement this endpoint
    return this.request<ApplicationTimeline[]>(`/candidates/${id}/timeline`);
  }

  // Actions - Using application status update endpoints
  async scheduleInterview(payload: ScheduleInterviewPayload): Promise<Candidate> {
    // First update application status
    await this.request<void>(
      `/applications/${payload.candidateId}/status?new_status=INTERVIEW_SCHEDULED`,
      { method: 'PUT' }
    );
    
    // Then submit interview details if endpoint exists
    try {
      return await this.request<Candidate>('/interviews/schedule', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      // Fallback: return updated candidate
      return this.getCandidate(payload.candidateId);
    }
  }

  async submitFeedback(payload: InterviewFeedbackPayload): Promise<Candidate> {
    return this.request<Candidate>('/interviews/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async selectCandidate(candidateId: string): Promise<Candidate> {
    await this.request<void>(
      `/applications/${candidateId}/status?new_status=SELECTED`,
      { method: 'PUT' }
    );
    return this.getCandidate(candidateId);
  }

  async rejectCandidate(payload: RejectPayload): Promise<Candidate> {
    await this.request<void>(
      `/applications/${payload.candidateId}/status?new_status=REJECTED`,
      { method: 'PUT' }
    );
    return this.getCandidate(payload.candidateId);
  }

  async markLeftCompany(payload: LeftCompanyPayload): Promise<Candidate> {
    await this.request<void>(
      `/applications/${payload.candidateId}/status?new_status=LEFT_COMPANY`,
      { method: 'PUT' }
    );
    return this.getCandidate(payload.candidateId);
  }
}

export const apiClient = new ApiClient();
export type { ApiError };
