import type { Candidate, CandidateState } from '@/types/ats';
import { STATE_LABELS } from '@/types/ats';
import { CandidateCard } from './CandidateCard';

interface KanbanColumnProps {
  state: CandidateState;
  candidates: Candidate[];
  onCandidateClick: (candidate: Candidate) => void;
}

export function KanbanColumn({ state, candidates, onCandidateClick }: KanbanColumnProps) {
  return (
    <div className="kanban-column flex h-full flex-col rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">
          {STATE_LABELS[state]}
        </h2>
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1.5 text-xs font-medium text-muted-foreground">
          {candidates.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {candidates.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-border/40 p-6">
            <p className="text-sm text-muted-foreground">No candidates</p>
          </div>
        ) : (
          candidates.map((candidate) => (
            <CandidateCard
              key={candidate.applicationId}
              candidate={candidate}
              onClick={() => onCandidateClick(candidate)}
            />
          ))
        )}
      </div>
    </div>
  );
}
