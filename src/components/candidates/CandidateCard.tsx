import type { Candidate } from '@/types/ats';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpRight, Briefcase, Clock3, Hash, MapPin } from 'lucide-react';

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
      className="w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/30"
      aria-label={`View details for ${candidate.name}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold leading-tight text-foreground">
              {candidate.name}
            </h3>
            {candidate.jobTitle && (
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                <span className="truncate">{candidate.jobTitle}</span>
              </div>
            )}
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Hash className="h-3.5 w-3.5" />
              <span className="truncate">{candidate.applicationId}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium ${config.text}`}>
              {config.label}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {candidate.location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{candidate.location}</span>
          </div>
        )}

        {(candidate.ctcCurrent || candidate.ctcExpected) && (
          <p className="text-xs text-muted-foreground">
            {candidate.ctcCurrent ? `Cur: ₹${candidate.ctcCurrent.toLocaleString()}` : 'Cur: -'}
            {' | '}
            {candidate.ctcExpected ? `Exp: ₹${candidate.ctcExpected.toLocaleString()}` : 'Exp: -'}
          </p>
        )}

        <p className="max-h-10 overflow-hidden text-xs leading-5 text-muted-foreground">
          {candidate.experienceSummary}
        </p>

        {candidate.applicationNote && (
          <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-2.5 py-2">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
              Submission Note
            </p>
            <p className="text-xs leading-5 text-sky-700 dark:text-sky-300">
              {candidate.applicationNote}
            </p>
          </div>
        )}

        {candidate.remark && (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-2 text-xs leading-5 text-amber-700 dark:text-amber-300">
            {candidate.remark}
          </p>
        )}

        {candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.slice(0, 2).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-md border border-border/60 bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 2 && (
              <span className="inline-flex items-center rounded-md border border-border/60 bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                +{candidate.skills.length - 2}
              </span>
            )}
          </div>
        )}

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" />
          {formatDistanceToNow(new Date(candidate.submittedAt || candidate.updatedAt), { addSuffix: true })}
        </p>
      </div>
    </button>
  );
}
