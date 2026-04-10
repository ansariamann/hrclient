import type { Candidate } from '@/types/ats';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpRight, Briefcase, Clock3, Hash, MapPin, MessageSquare } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  onClick: () => void;
}

const stateConfig = {
  TO_REVIEW: {
    label: 'Review',
    text: 'text-foreground',
  },
  INTERVIEW_SCHEDULED: {
    label: 'Interview',
    text: 'text-foreground',
  },
  SELECTED: {
    label: 'Selected',
    text: 'text-foreground',
  },
  JOINED: {
    label: 'Joined',
    text: 'text-foreground',
  },
  REJECTED: {
    label: 'Rejected',
    text: 'text-foreground',
  },
  LEFT_COMPANY: {
    label: 'Left',
    text: 'text-foreground',
  },
} as const;

export function CandidateCard({ candidate, onClick }: CandidateCardProps) {
  const config = stateConfig[candidate.currentState];

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted/30"
      aria-label={`View details for ${candidate.name}`}
    >
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold leading-tight text-foreground">
              {candidate.name}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Hash className="h-3.5 w-3.5" />
              <span className="truncate">{candidate.applicationId}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium ${config.text}`}>
              {config.label}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {candidate.jobTitle && (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="max-w-[160px] truncate">{candidate.jobTitle}</span>
            </span>
          )}
          {candidate.location && (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="max-w-[120px] truncate">{candidate.location}</span>
            </span>
          )}
          {(candidate.applicationNote || candidate.remark) && (
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Has note</span>
            </span>
          )}
        </div>

        {(candidate.ctcCurrent || candidate.ctcExpected) && (
          <p className="text-[11px] text-muted-foreground">
            {candidate.ctcCurrent ? `Cur: Rs ${candidate.ctcCurrent.toLocaleString()}` : 'Cur: -'}
            {' | '}
            {candidate.ctcExpected ? `Exp: Rs ${candidate.ctcExpected.toLocaleString()}` : 'Exp: -'}
          </p>
        )}

        {candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-md border border-border/60 bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 3 && (
              <span className="inline-flex items-center rounded-md border border-border/60 bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                +{candidate.skills.length - 3}
              </span>
            )}
          </div>
        )}

        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" />
          {formatDistanceToNow(new Date(candidate.submittedAt || candidate.updatedAt), { addSuffix: true })}
        </p>
      </div>
    </button>
  );
}
