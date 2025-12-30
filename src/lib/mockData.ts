import type { Candidate, ApplicationTimeline, TokenValidationResult } from '@/types/ats';

// Mock candidates for demo purposes
export const mockCandidates: Candidate[] = [
  {
    id: '1',
    applicationId: 'APP-2024-001',
    name: 'Sarah Chen',
    currentState: 'TO_REVIEW',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
    experienceSummary: 'Senior Full-Stack Engineer with 7 years of experience building scalable web applications. Previously at Stripe and Airbnb.',
    resumeUrl: undefined,
    allowedActions: ['SCHEDULE_INTERVIEW', 'SELECT', 'REJECT'],
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-28T14:30:00Z',
  },
  {
    id: '2',
    applicationId: 'APP-2024-002',
    name: 'Marcus Johnson',
    currentState: 'TO_REVIEW',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
    experienceSummary: 'Data Scientist with expertise in ML pipelines and predictive modeling. PhD in Computer Science from MIT.',
    resumeUrl: undefined,
    allowedActions: ['SCHEDULE_INTERVIEW', 'SELECT', 'REJECT'],
    createdAt: '2024-12-21T09:00:00Z',
    updatedAt: '2024-12-27T11:00:00Z',
  },
  {
    id: '3',
    applicationId: 'APP-2024-003',
    name: 'Elena Rodriguez',
    currentState: 'INTERVIEW_SCHEDULED',
    skills: ['Product Management', 'Agile', 'User Research', 'SQL'],
    experienceSummary: 'Product Manager with 5 years experience in B2B SaaS. Led teams at Salesforce and HubSpot.',
    resumeUrl: undefined,
    allowedActions: ['SELECT', 'REJECT'],
    createdAt: '2024-12-15T08:00:00Z',
    updatedAt: '2024-12-26T16:00:00Z',
  },
  {
    id: '4',
    applicationId: 'APP-2024-004',
    name: 'James Kim',
    currentState: 'INTERVIEW_SCHEDULED',
    skills: ['DevOps', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
    experienceSummary: 'Platform Engineer specializing in cloud infrastructure and automation. AWS Certified Solutions Architect.',
    resumeUrl: undefined,
    allowedActions: ['SELECT', 'REJECT'],
    createdAt: '2024-12-18T12:00:00Z',
    updatedAt: '2024-12-25T10:00:00Z',
  },
  {
    id: '5',
    applicationId: 'APP-2024-005',
    name: 'Priya Patel',
    currentState: 'SELECTED',
    skills: ['UX Design', 'Figma', 'User Research', 'Prototyping', 'Design Systems'],
    experienceSummary: 'Senior UX Designer with a passion for creating intuitive user experiences. Former design lead at Notion.',
    resumeUrl: undefined,
    allowedActions: ['REJECT'],
    createdAt: '2024-12-10T14:00:00Z',
    updatedAt: '2024-12-24T09:00:00Z',
  },
  {
    id: '6',
    applicationId: 'APP-2024-006',
    name: 'David Liu',
    currentState: 'JOINED',
    skills: ['Java', 'Spring Boot', 'Microservices', 'MongoDB'],
    experienceSummary: 'Backend Engineer with 8 years of experience. Expert in distributed systems and high-performance applications.',
    resumeUrl: undefined,
    allowedActions: ['MARK_LEFT_COMPANY'],
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-12-01T08:00:00Z',
  },
  {
    id: '7',
    applicationId: 'APP-2024-007',
    name: 'Anna Thompson',
    currentState: 'TO_REVIEW',
    skills: ['Marketing', 'SEO', 'Content Strategy', 'Analytics'],
    experienceSummary: 'Growth Marketing Manager with proven track record of scaling startups from seed to Series B.',
    resumeUrl: undefined,
    allowedActions: ['SCHEDULE_INTERVIEW', 'SELECT', 'REJECT'],
    createdAt: '2024-12-22T11:00:00Z',
    updatedAt: '2024-12-29T15:00:00Z',
  },
];

export const mockTimeline: Record<string, ApplicationTimeline[]> = {
  '1': [
    { id: 't1', candidateId: '1', state: 'TO_REVIEW', timestamp: '2024-12-20T10:00:00Z', actor: 'system' },
  ],
  '3': [
    { id: 't3-1', candidateId: '3', state: 'TO_REVIEW', timestamp: '2024-12-15T08:00:00Z', actor: 'system' },
    { id: 't3-2', candidateId: '3', state: 'INTERVIEW_SCHEDULED', timestamp: '2024-12-20T14:00:00Z', actor: 'client', note: 'Video interview scheduled for Dec 30' },
  ],
  '5': [
    { id: 't5-1', candidateId: '5', state: 'TO_REVIEW', timestamp: '2024-12-10T14:00:00Z', actor: 'system' },
    { id: 't5-2', candidateId: '5', state: 'INTERVIEW_SCHEDULED', timestamp: '2024-12-15T10:00:00Z', actor: 'client' },
    { id: 't5-3', candidateId: '5', state: 'SELECTED', timestamp: '2024-12-24T09:00:00Z', actor: 'client', note: 'Excellent interview performance' },
  ],
  '6': [
    { id: 't6-1', candidateId: '6', state: 'TO_REVIEW', timestamp: '2024-11-01T10:00:00Z', actor: 'system' },
    { id: 't6-2', candidateId: '6', state: 'INTERVIEW_SCHEDULED', timestamp: '2024-11-10T09:00:00Z', actor: 'client' },
    { id: 't6-3', candidateId: '6', state: 'SELECTED', timestamp: '2024-11-20T14:00:00Z', actor: 'client' },
    { id: 't6-4', candidateId: '6', state: 'JOINED', timestamp: '2024-12-01T08:00:00Z', actor: 'hr', note: 'Onboarding completed' },
  ],
};

export const mockTokenValidation: TokenValidationResult = {
  valid: true,
  clientId: 'client-123',
  clientName: 'Acme Corporation',
  allowedApplicationIds: ['APP-2024-001', 'APP-2024-002', 'APP-2024-003', 'APP-2024-004', 'APP-2024-005', 'APP-2024-006', 'APP-2024-007'],
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
};
