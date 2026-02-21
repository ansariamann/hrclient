import type { Candidate } from '@/types/ats';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpRight, Clock3, Hash, MapPin } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  onClick: () => void;
}

const stateConfig = {
  TO_REVIEW: {
    label: 'Review',
    gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    accent: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
  },
  INTERVIEW_SCHEDULED: {
    label: 'Interview',
    gradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
    accent: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
  },
  SELECTED: {
    label: 'Selected',
    gradient: 'from-emerald-500/10 via-green-500/5 to-transparent',
    accent: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  JOINED: {
    label: 'Joined',
    gradient: 'from-violet-500/10 via-purple-500/5 to-transparent',
    accent: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
  },
  REJECTED: {
    label: 'Rejected',
    gradient: 'from-rose-500/10 via-red-500/5 to-transparent',
    accent: 'bg-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
  },
  LEFT_COMPANY: {
    label: 'Left',
    gradient: 'from-slate-500/10 via-gray-500/5 to-transparent',
    accent: 'bg-slate-500',
    text: 'text-slate-600 dark:text-slate-400',
  },
} as const;

export function CandidateCard({ candidate, onClick }: CandidateCardProps) {
  const config = stateConfig[candidate.currentState];

  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full text-left overflow-hidden
        rounded-xl border border-border/60 bg-card
        p-4 transition-all duration-200
        hover:border-primary/40 hover:shadow-lg hover:shadow-black/5
      `}
      aria-label={`View details for ${candidate.name}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50 transition-opacity group-hover:opacity-80`} />
      <div className={`absolute left-0 top-0 h-full w-1 ${config.accent}`} />

      <div className="relative space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold leading-tight text-foreground">
              {candidate.name}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Hash className="h-3.5 w-3.5" />
              <span className="truncate">{candidate.applicationId}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium ${config.text}`}>
              {config.label}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5 transition-all group-hover:bg-primary group-hover:text-primary-foreground">
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
          {formatDistanceToNow(new Date(candidate.updatedAt), { addSuffix: true })}
        </p>
      </div>
    </button>
  );
}
