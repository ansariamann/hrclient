import type { Candidate } from '@/types/ats';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CandidateCardProps {
  candidate: Candidate;
  onClick: () => void;
}

export function CandidateCard({ candidate, onClick }: CandidateCardProps) {
  const stateVariant = {
    TO_REVIEW: 'to-review',
    INTERVIEW_SCHEDULED: 'interview',
    SELECTED: 'selected',
    JOINED: 'joined',
    REJECTED: 'rejected',
    LEFT_COMPANY: 'rejected',
  } as const;

  return (
    <button
      onClick={onClick}
      className="candidate-card w-full text-left animate-slide-up"
      aria-label={`View details for ${candidate.name}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{candidate.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {candidate.experienceSummary}
          </p>
        </div>
        <Badge variant={stateVariant[candidate.currentState]} className="shrink-0">
          {candidate.currentState.replace(/_/g, ' ')}
        </Badge>
      </div>

      {candidate.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {candidate.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
            >
              {skill}
            </span>
          ))}
          {candidate.skills.length > 3 && (
            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
              +{candidate.skills.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5" />
          <span>{candidate.skills.length} skills</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDistanceToNow(new Date(candidate.updatedAt), { addSuffix: true })}</span>
        </div>
      </div>
    </button>
  );
}
