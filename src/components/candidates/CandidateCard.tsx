import type { Candidate } from '@/types/ats';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpRight, Briefcase, Clock3, MapPin, MessageSquare } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  onClick: () => void;
}

const stateConfig = {
  TO_REVIEW: {
    label: 'To Review',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
    accent: 'border-l-amber-400',
    dot: 'bg-amber-400',
  },
  INTERVIEW_SCHEDULED: {
    label: 'Interview',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
    accent: 'border-l-blue-400',
    dot: 'bg-blue-400',
  },
  SELECTED: {
    label: 'Selected',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
    accent: 'border-l-emerald-400',
    dot: 'bg-emerald-400',
  },
  JOINED: {
    label: 'Joined',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400',
    accent: 'border-l-violet-400',
    dot: 'bg-violet-400',
  },
  REJECTED: {
    label: 'Rejected',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
    accent: 'border-l-red-400',
    dot: 'bg-red-400',
  },
  LEFT_COMPANY: {
    label: 'Left',
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    accent: 'border-l-slate-400',
    dot: 'bg-slate-400',
  },
} as const;

export function CandidateCard({ candidate, onClick }: CandidateCardProps) {
  const config = stateConfig[candidate.currentState];

  return (
    <button
      onClick={onClick}
      className={`group w-full rounded-xl border border-l-[3px] border-border bg-card p-3 text-left shadow-sm transition-all duration-200 hover:shadow-md hover:border-border/80 hover:-translate-y-0.5 ${config.accent}`}
      aria-label={`View details for ${candidate.name}`}
    >
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold leading-tight text-foreground">
                {candidate.name}
              </h3>
              {candidate.jobTitle && (
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Briefcase className="h-3 w-3 shrink-0" />
                  <span className="truncate">{candidate.jobTitle}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.badge}`}>
              {config.label}
            </span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {candidate.location && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="max-w-[120px] truncate">{candidate.location}</span>
            </span>
          )}
          {(candidate.applicationNote || candidate.remark) && (
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>Has note</span>
            </span>
          )}
        </div>

        {(candidate.ctcCurrent || candidate.ctcExpected) && (
          <p className="text-[11px] text-muted-foreground">
            {candidate.ctcCurrent ? `₹${(candidate.ctcCurrent / 100000).toFixed(1)}L` : '—'}
            {' → '}
            {candidate.ctcExpected ? `₹${(candidate.ctcExpected / 100000).toFixed(1)}L` : '—'}
          </p>
        )}

        {candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 3 && (
              <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                +{candidate.skills.length - 3}
              </span>
            )}
          </div>
        )}

        <p className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
          <Clock3 className="h-3 w-3" />
          {formatDistanceToNow(new Date(candidate.submittedAt || candidate.updatedAt), { addSuffix: true })}
        </p>
      </div>
    </button>
  );
}
