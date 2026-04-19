import type { Candidate } from "@/types/ats";
import { Clock, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentRequestsProps {
  candidates: Candidate[];
  onViewCandidate: (candidate: Candidate) => void;
}

const stateBadge: Record<string, string> = {
  TO_REVIEW:           'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  INTERVIEW_SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
  SELECTED:            'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
  JOINED:              'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400',
  REJECTED:            'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
  LEFT_COMPANY:        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const stateLabel: Record<string, string> = {
  TO_REVIEW:           'To Review',
  INTERVIEW_SCHEDULED: 'Interview',
  SELECTED:            'Selected',
  JOINED:              'Joined',
  REJECTED:            'Rejected',
  LEFT_COMPANY:        'Left',
};

export function RecentRequests({ candidates, onViewCandidate }: RecentRequestsProps) {
  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  if (recentCandidates.length === 0) return null;

  return (
    <div className="mb-8 rounded-2xl border border-border bg-card shadow-sm p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Application Status</h2>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          Last {recentCandidates.length} updates
        </span>
      </div>

      <div className="space-y-1">
        {recentCandidates.map((candidate) => (
          <button
            key={candidate.applicationId}
            onClick={() => onViewCandidate(candidate)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/40 group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground shrink-0">
                {candidate.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm text-foreground truncate">
                  {candidate.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {candidate.jobTitle || candidate.experienceSummary}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                stateBadge[candidate.currentState] ?? 'bg-muted text-muted-foreground'
              }`}>
                {stateLabel[candidate.currentState] ?? candidate.currentState.replace(/_/g, ' ')}
              </span>
              <span className="text-[11px] text-muted-foreground hidden sm:block">
                {formatDistanceToNow(new Date(candidate.submittedAt || candidate.updatedAt), { addSuffix: true })}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
