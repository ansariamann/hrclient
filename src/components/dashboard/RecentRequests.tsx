import type { Candidate } from "@/types/ats";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

interface RecentRequestsProps {
  candidates: Candidate[];
  onViewCandidate: (candidate: Candidate) => void;
}

export function RecentRequests({ candidates, onViewCandidate }: RecentRequestsProps) {
  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  if (recentCandidates.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 rounded-xl border border-border/50 bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Recent Requests</h2>
        </div>
        <Badge variant="secondary">{recentCandidates.length} new</Badge>
      </div>

      <div className="space-y-3">
        {recentCandidates.map((candidate) => (
          <button
            key={candidate.id}
            onClick={() => onViewCandidate(candidate)}
            className="group flex w-full items-center justify-between rounded-lg bg-muted/30 p-4 text-left transition-all duration-200 hover:bg-muted/60 hover:shadow-sm"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-foreground transition-colors group-hover:text-primary">
                  {candidate.name}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {candidate.currentState.replace(/_/g, " ")}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                {candidate.experienceSummary}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(candidate.updatedAt), { addSuffix: true })}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
