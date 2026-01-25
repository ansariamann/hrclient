import type { Candidate } from '@/types/ats';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpRight } from 'lucide-react';

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
        rounded-2xl border border-border/40 bg-card
        p-5 transition-all duration-300
        hover:border-border hover:shadow-xl hover:shadow-black/5
        hover:-translate-y-1
      `}
      aria-label={`View details for ${candidate.name}`}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-60 transition-opacity group-hover:opacity-100`} />
      
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 w-1 h-full ${config.accent} rounded-l-2xl`} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate text-base leading-tight">
              {candidate.name}
            </h3>
            <span className={`text-xs font-medium ${config.text} mt-0.5 inline-block`}>
              {config.label}
            </span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5 transition-all group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        {/* Skills */}
        {candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {candidate.skills.slice(0, 2).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 2 && (
              <span className="inline-flex items-center rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                +{candidate.skills.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(candidate.updatedAt), { addSuffix: true })}
        </p>
      </div>
    </button>
  );
}
