import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { KanbanBoard } from '@/components/candidates/KanbanBoard';
import { RecentRequests } from '@/components/dashboard/RecentRequests';
import { CandidateDetailModal } from '@/components/candidates/CandidateDetailModal';
import { apiClient } from '@/lib/api';
import type { Candidate } from '@/types/ats';
import { Loader2, RefreshCw, Users, AlertCircle, CalendarCheck, Eye, TrendingUp } from 'lucide-react';
import { isToday } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { isAuthenticated, error } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) navigate('/', { replace: true });
  }, [error, navigate]);

  const loadCandidates = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await apiClient.getCandidates();
      setCandidates(data);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadCandidates();
  }, [isAuthenticated]);

  const handleCandidateUpdate = (updatedCandidate: Candidate) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === updatedCandidate.id ? updatedCandidate : c))
    );
  };

  if (!isAuthenticated) return null;

  const interviewsToday = candidates.filter(
    c => c.currentState === 'INTERVIEW_SCHEDULED' && isToday(new Date(c.updatedAt))
  ).length;
  const totalInterviews = candidates.filter(c => c.currentState === 'INTERVIEW_SCHEDULED').length;
  const toReview = candidates.filter(c => c.currentState === 'TO_REVIEW').length;

  const stats = [
    {
      label: 'Interviews Today',
      value: interviewsToday,
      icon: CalendarCheck,
      bg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/5',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200/60 dark:border-blue-900/40',
    },
    {
      label: 'Total Scheduled',
      value: totalInterviews,
      icon: TrendingUp,
      bg: 'bg-gradient-to-br from-violet-500/20 to-violet-600/5',
      iconBg: 'bg-violet-500/15',
      iconColor: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-200/60 dark:border-violet-900/40',
    },
    {
      label: 'To Review',
      value: toReview,
      icon: Eye,
      bg: 'bg-gradient-to-br from-amber-500/20 to-amber-600/5',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200/60 dark:border-amber-900/40',
    },
    {
      label: 'Total Candidates',
      value: candidates.length,
      icon: Users,
      bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/5',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200/60 dark:border-emerald-900/40',
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Candidate Pipeline</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} across your hiring pipeline
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadCandidates}
            disabled={isLoading}
            className="gap-2 rounded-xl h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Content */}
        {isLoading && candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
            </div>
            <p className="mt-6 text-sm text-muted-foreground">Loading candidates...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <p className="mt-4 text-lg font-semibold text-foreground">Failed to Load</p>
            <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
            <Button variant="outline" className="mt-4 rounded-xl" onClick={loadCandidates}>
              Try Again
            </Button>
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-lg font-semibold text-foreground">No Candidates</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No candidates are currently assigned to you
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-2xl border p-5 transition-shadow hover:shadow-md ${stat.border} ${stat.bg}`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.iconBg}`}>
                      <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
                  <p className={`mt-1 text-xs font-medium ${stat.iconColor}`}>{stat.label}</p>
                </div>
              ))}
            </div>

            <RecentRequests
              candidates={candidates}
              onViewCandidate={setSelectedCandidate}
            />
            <KanbanBoard candidates={candidates} onCandidateUpdate={handleCandidateUpdate} />
          </>
        )}
      </div>

      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onUpdate={(updated) => {
            handleCandidateUpdate(updated);
            setSelectedCandidate(updated);
          }}
        />
      )}
    </AppLayout>
  );
}
