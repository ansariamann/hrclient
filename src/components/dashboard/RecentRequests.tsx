import type { Candidate } from "@/types/ats";
import { Clock, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentRequestsProps {
  candidates: Candidate[];
  onViewCandidate: (candidate: Candidate) => void;
}

export function RecentRequests({ candidates, onViewCandidate }: RecentRequestsProps) {
  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  if (recentCandidates.length === 0) return null;

  return (
    <div className="mb-8 rounded-2xl border border-border bg-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          Last {recentCandidates.length} updates
        </span>
      </div>

      <div className="space-y-2">
        {recentCandidates.map((candidate) => (
          <button
            key={candidate.applicationId}
            onClick={() => onViewCandidate(candidate)}
            className="flex w-full items-center justify-between rounded-xl p-3.5 text-left transition-colors hover:bg-muted/30 group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground text-sm font-bold shrink-0">
                {candidate.name.charAt(0)}
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
              <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground">
                {candidate.currentState.replace(/_/g, " ")}
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
