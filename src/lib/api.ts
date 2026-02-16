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

import { API_URL, DEMO_MODE } from './config';

// Storage keys
const TOKEN_STORAGE_KEY = 'ats_client_token';

// Mock data imports for demo mode fallback
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

    const response = await fetch(`${API_URL}${endpoint}`, {
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

    const response = await fetch(`${API_URL}/auth/login`, {
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Demo token validation - accept any token starting with "demo"
      if (token.startsWith('demo') || token === 'test') {
        return mockTokenValidation;
      }
      return { valid: false, error: 'invalid' };
    }

    try {
      // Set the token and try to make a request
      this.setToken(token);

      // Try to get current user info to validate token
      const response = await fetch(`${API_URL}/auth/me`, {
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
        allowedActions: ['SCHEDULE_INTERVIEW', 'SELECT', 'REJECT'],
        updatedAt: new Date().toISOString(),
      };

      return demoCandidates[index];
    }

    return this.request<Candidate>('/actions/schedule-interview', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

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

    return this.request<Candidate>('/actions/submit-feedback', {
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
