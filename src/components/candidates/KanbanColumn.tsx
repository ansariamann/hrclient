import type { Candidate, CandidateState } from '@/types/ats';
import { STATE_LABELS } from '@/types/ats';
import { CandidateCard } from './CandidateCard';

interface KanbanColumnProps {
  state: CandidateState;
  candidates: Candidate[];
  onCandidateClick: (candidate: Candidate) => void;
}

const stateColumnConfig: Partial<Record<CandidateState, { header: string; dot: string; count: string }>> = {
  TO_REVIEW:           { header: 'from-amber-50 dark:from-amber-950/20',     dot: 'bg-amber-400',   count: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' },
  INTERVIEW_SCHEDULED: { header: 'from-blue-50 dark:from-blue-950/20',       dot: 'bg-blue-400',    count: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400' },
  SELECTED:            { header: 'from-emerald-50 dark:from-emerald-950/20', dot: 'bg-emerald-400', count: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' },
  JOINED:              { header: 'from-violet-50 dark:from-violet-950/20',   dot: 'bg-violet-400',  count: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400' },
  REJECTED:            { header: 'from-red-50 dark:from-red-950/20',         dot: 'bg-red-400',     count: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' },
  LEFT_COMPANY:        { header: 'from-slate-50 dark:from-slate-950/20',     dot: 'bg-slate-400',   count: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
};

const defaultCfg = { header: 'from-muted/30', dot: 'bg-muted-foreground', count: 'bg-muted text-muted-foreground' };

export function KanbanColumn({ state, candidates, onCandidateClick }: KanbanColumnProps) {
  const sortedCandidates = [...candidates].sort((a, b) => {
    const aDate = new Date(a.submittedAt || a.updatedAt).getTime();
    const bDate = new Date(b.submittedAt || b.updatedAt).getTime();
    return bDate - aDate;
  });

  const cfg = stateColumnConfig[state] ?? defaultCfg;

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Color-coded column header */}
      <div className={`bg-gradient-to-b ${cfg.header} to-transparent px-4 py-3 border-b border-border/60`}>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full shrink-0 ${cfg.dot}`} />
          <h2 className="text-sm font-semibold text-foreground flex-1">
            {STATE_LABELS[state]}
          </h2>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.count}`}>
            {candidates.length}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
        {sortedCandidates.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-border/40 p-6">
            <p className="text-xs text-muted-foreground">No candidates</p>
          </div>
        ) : (
          sortedCandidates.map((candidate) => (
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
