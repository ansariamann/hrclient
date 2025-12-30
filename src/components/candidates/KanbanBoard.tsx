import { useState } from 'react';
import type { Candidate, CandidateState } from '@/types/ats';
import { KanbanColumn } from './KanbanColumn';
import { CandidateDetailModal } from './CandidateDetailModal';

interface KanbanBoardProps {
  candidates: Candidate[];
  onCandidateUpdate: (updatedCandidate: Candidate) => void;
}

// Only show states relevant to client portal
const VISIBLE_STATES: CandidateState[] = [
  'TO_REVIEW',
  'INTERVIEW_SCHEDULED',
  'SELECTED',
  'JOINED',
];

export function KanbanBoard({ candidates, onCandidateUpdate }: KanbanBoardProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const candidatesByState = VISIBLE_STATES.reduce((acc, state) => {
    acc[state] = candidates.filter((c) => c.currentState === state);
    return acc;
  }, {} as Record<CandidateState, Candidate[]>);

  const handleCandidateUpdate = (updatedCandidate: Candidate) => {
    onCandidateUpdate(updatedCandidate);
    setSelectedCandidate(null);
  };

  return (
    <>
      <div className="grid min-h-[600px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {VISIBLE_STATES.map((state) => (
          <KanbanColumn
            key={state}
            state={state}
            candidates={candidatesByState[state]}
            onCandidateClick={setSelectedCandidate}
          />
        ))}
      </div>

      <CandidateDetailModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onUpdate={handleCandidateUpdate}
      />
    </>
  );
}
