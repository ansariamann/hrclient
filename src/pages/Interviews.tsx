import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { CandidateCard } from '@/components/candidates/CandidateCard';
import { CandidateDetailModal } from '@/components/candidates/CandidateDetailModal';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import type { Candidate } from '@/types/ats';
import { CalendarCheck, RefreshCw, Loader2, AlertCircle, Clock } from 'lucide-react';

export default function Interviews() {
  const { isAuthenticated, error } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      navigate('/', { replace: true });
    }
  }, [error, navigate]);

  const loadCandidates = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await apiClient.getCandidates();
      // Filter only candidates with scheduled interviews
      const interviewCandidates = data.filter(c => c.currentState === 'INTERVIEW_SCHEDULED');
      setCandidates(interviewCandidates);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load interviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCandidates();
    }
  }, [isAuthenticated]);

  const handleCandidateUpdate = (updatedCandidate: Candidate) => {
    setCandidates((prev) => {
      // If the candidate is no longer in INTERVIEW_SCHEDULED state, remove from list
      if (updatedCandidate.currentState !== 'INTERVIEW_SCHEDULED') {
        return prev.filter(c => c.id !== updatedCandidate.id);
      }
      return prev.map((c) => (c.id === updatedCandidate.id ? updatedCandidate : c));
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <CalendarCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Scheduled Interviews</h1>
              <p className="text-sm text-muted-foreground">
                {candidates.length} interview{candidates.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
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
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
              <Loader2 className="h-10 w-10 animate-spin text-blue-500 relative z-10" />
            </div>
            <p className="mt-6 text-sm text-muted-foreground">Loading interviews...</p>
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
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
              <Clock className="h-8 w-8 text-blue-500/50" />
            </div>
            <p className="mt-4 text-lg font-semibold text-foreground">No Scheduled Interviews</p>
            <p className="mt-1 text-sm text-muted-foreground">
              There are no interviews currently scheduled
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.applicationId}
                candidate={candidate}
                onClick={() => setSelectedCandidate(candidate)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onUpdate={(updated) => {
            handleCandidateUpdate(updated);
            if (updated.currentState !== 'INTERVIEW_SCHEDULED') {
              setSelectedCandidate(null);
            } else {
              setSelectedCandidate(updated);
            }
          }}
        />
      )}
    </AppLayout>
  );
}
