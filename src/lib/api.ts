import type {
  Candidate,
  ApplicationTimeline,
  TokenValidationResult,
  ScheduleInterviewPayload,
  RejectPayload,
  LeftCompanyPayload,
  ApiError,
} from '@/types/ats';
import { mockCandidates, mockTimeline, mockTokenValidation } from './mockData';

// Demo mode flag - set to true to use mock data
const DEMO_MODE = true;

// API base URL - would be configured via environment variable
const API_BASE = '/api';

// In-memory state for demo mode
let demoCandidates = [...mockCandidates];

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
    if (DEMO_MODE) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Demo token validation - accept any token starting with "demo"
      if (token.startsWith('demo') || token === 'test') {
        return mockTokenValidation;
      }
      return { valid: false, error: 'invalid' };
    }

    return this.request<TokenValidationResult>('/auth/validate', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Candidates
  async getCandidates(): Promise<Candidate[]> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return demoCandidates;
    }

    return this.request<Candidate[]>('/candidates');
  }

  async getCandidate(id: string): Promise<Candidate> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const candidate = demoCandidates.find(c => c.id === id);
      if (!candidate) {
        throw { code: 'NOT_FOUND', message: 'Candidate not found' };
      }
      return candidate;
    }

    return this.request<Candidate>(`/candidates/${id}`);
  }

  async getCandidateTimeline(id: string): Promise<ApplicationTimeline[]> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockTimeline[id] || [];
    }

    return this.request<ApplicationTimeline[]>(`/candidates/${id}/timeline`);
  }

  // Actions
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
        allowedActions: ['SELECT', 'REJECT'],
        updatedAt: new Date().toISOString(),
      };
      
      return demoCandidates[index];
    }

    return this.request<Candidate>('/actions/schedule-interview', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

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

    return this.request<Candidate>('/actions/select', {
      method: 'POST',
      body: JSON.stringify({ candidateId }),
    });
  }

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

    return this.request<Candidate>('/actions/reject', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

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

    return this.request<Candidate>('/actions/left-company', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const apiClient = new ApiClient();
export type { ApiError };
