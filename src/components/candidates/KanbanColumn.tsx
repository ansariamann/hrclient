import type { Candidate, CandidateState } from '@/types/ats';
import { STATE_LABELS } from '@/types/ats';
import { CandidateCard } from './CandidateCard';

interface KanbanColumnProps {
  state: CandidateState;
  candidates: Candidate[];
  onCandidateClick: (candidate: Candidate) => void;
}

const stateColors: Record<CandidateState, string> = {
  TO_REVIEW: 'bg-state-to-review',
  INTERVIEW_SCHEDULED: 'bg-state-interview',
  SELECTED: 'bg-state-selected',
  JOINED: 'bg-state-joined',
  REJECTED: 'bg-state-rejected',
  LEFT_COMPANY: 'bg-state-rejected',
};

export function KanbanColumn({ state, candidates, onCandidateClick }: KanbanColumnProps) {
  return (
    <div className="kanban-column min-w-[280px] max-w-[320px] flex-1">
      <div className="mb-3 flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${stateColors[state]}`} />
        <h2 className="text-sm font-semibold text-foreground">
          {STATE_LABELS[state]}
        </h2>
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
          {candidates.length}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {candidates.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">No candidates</p>
          </div>
        ) : (
          candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onClick={() => onCandidateClick(candidate)}
            />
          ))
        )}
      </div>
    </div>
  );
}
