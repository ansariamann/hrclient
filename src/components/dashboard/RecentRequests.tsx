import type { Candidate } from "@/types/ats";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentRequestsProps {
  candidates: Candidate[];
  onViewCandidate: (candidate: Candidate) => void;
}

const stateStyles: Record<string, string> = {
  TO_REVIEW: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  INTERVIEW_SCHEDULED: "bg-primary/10 text-primary border-primary/20",
  SELECTED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  JOINED: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
};

export function RecentRequests({ candidates, onViewCandidate }: RecentRequestsProps) {
  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  if (recentCandidates.length === 0) return null;

  return (
    <div className="mb-8 rounded-2xl border border-border/30 bg-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-base font-bold text-foreground tracking-tight">Recent Activity</h2>
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
            className="flex w-full items-center justify-between rounded-xl p-3.5 text-left transition-all duration-200 hover:bg-muted/50 group"
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
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold border rounded-lg px-2 py-0.5 ${
                  stateStyles[candidate.currentState] || ""
                }`}
              >
                {candidate.currentState.replace(/_/g, " ")}
              </Badge>
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
