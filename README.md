# Client Portal ATS

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)

An intuitive, modern Applicant Tracking System (ATS) client portal designed for hiring teams and client organizations to seamlessly manage candidates, interviews, job requisitions, and company personnel.

---

## Table of Contents

- [What the Project Does](#what-the-project-does)
- [Why the Project is Useful](#why-the-project-is-useful)
- [How Users Can Get Started](#how-users-can-get-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Development Server](#development-server)
  - [Building for Production](#building-for-production)
  - [Running Tests](#running-tests)
- [Usage Examples](#usage-examples)
- [Where Users Can Get Help](#where-users-can-get-help)
- [Who Maintains and Contributes](#who-maintains-and-contributes)

---

## What the Project Does

**Client Portal ATS** provides a streamlined web application for organizations to review job candidates, transition candidates through hiring stages via an interactive Kanban pipeline, schedule interview rounds, collect structured feedback, request new job openings, and track active company team members.

### Core Architecture
- **Frontend Framework**: React 18, TypeScript, and Vite.
- **UI & Styling**: Tailwind CSS, shadcn/ui primitives, Lucide icons, and `next-themes` for dark/light mode.
- **State & Data Management**: TanStack Query (`@tanstack/react-query`) and custom React contexts.
- **API Integration**: RESTful API client with OAuth2 token authentication, automated status-to-state mapping, and offline fallback capability.

---

## Why the Project is Useful

- **Visual Pipeline Management**: Interactive Kanban board supporting stage transitions (`To Review`, `Interview Scheduled`, `Selected`, `Joined`, `Rejected`, `Left Company`).
- **Interview Workflow**: Schedule rounds (in-person, video, phone), assign interviewers, and collect structured candidate ratings and feedback.
- **Job Requisitions**: Create and view company job requisitions with detailed requirements, location, and salary guidelines.
- **Company Roster Tracking**: Track active company personnel, track employee onboarding, and record status changes.
- **User Interface**: Accessible components, responsive layout, and seamless theme switching.

---

## How Users Can Get Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` (v9+) or `bun` (v1.0+)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/client-portal-ats.git
   cd client-portal-ats
   ```

2. **Install dependencies**:
   ```bash
   # Using npm
   npm install

   # Or using bun
   bun install
   ```

### Environment Configuration

Copy the `.env.example` template to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables in `.env`:

```env
# Backend API base URL
VITE_API_URL=http://localhost:8000

# Set to "true" to enable mock data mode
VITE_DEMO_MODE=false
```

### Development Server

Start the local Vite development server with hot module replacement (HMR):

```bash
# Using npm
npm run dev

# Or using bun
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### Building for Production

To create an optimized production build in the `dist/` directory:

```bash
# Build for production
npm run build

# Preview the build locally
npm run preview
```

### Running Tests

Execute the test suite using Vitest or Bun:

```bash
# Using npm
npm test

# Or using bun
bun test
```

---

## Usage Examples

### Fetching Candidates via API Client

```typescript
import { apiClient } from '@/lib/api';

// Retrieve candidate list for the current client
const candidates = await apiClient.getCandidates();
console.log('Candidates in pipeline:', candidates);
```

### Scheduling an Interview

```typescript
import { apiClient } from '@/lib/api';

await apiClient.scheduleInterview({
  candidateId: 'cand-123',
  scheduledDate: '2025-06-15T10:00:00Z',
  mode: 'video',
  roundNumber: 1,
  interviewerName: 'Jane Doe',
});
```

### Submitting Interview Feedback

```typescript
import { apiClient } from '@/lib/api';

await apiClient.submitFeedback({
  candidateId: 'cand-123',
  roundNumber: 1,
  rating: 5,
  recommendation: 'strong_yes',
  feedback: 'Candidate showed strong problem-solving skills and domain knowledge.',
});
```

---

## Where Users Can Get Help

- **Documentation**: For supplementary documentation, check the repository [docs](docs/).
- **Issue Tracker**: Report bugs or suggest improvements on [GitHub Issues](https://github.com/your-org/client-portal-ats/issues).
- **Discussions**: Reach out to the team via repository discussion channels.

---

## Who Maintains and Contributes

### Maintainers

This project is maintained by the core engineering team. For questions or maintenance inquiries, contact the core repository team.

### Contributing

Contributions are welcome! Please review [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on branch naming, coding standards, and submitting pull requests.

### License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
