import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { CandidateCard } from '@/components/candidates/CandidateCard';
import { CandidateDetailModal } from '@/components/candidates/CandidateDetailModal';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import type { Candidate } from '@/types/ats';
import { UserCheck, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

export default function Selected() {
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
      // Filter candidates who are SELECTED or JOINED
      const selectedCandidates = data.filter(
        c => c.currentState === 'SELECTED' || c.currentState === 'JOINED'
      );
      setCandidates(selectedCandidates);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load selected candidates');
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
      // If the candidate is no longer SELECTED or JOINED, remove from list
      if (updatedCandidate.currentState !== 'SELECTED' && updatedCandidate.currentState !== 'JOINED') {
        return prev.filter(c => c.id !== updatedCandidate.id);
      }
      return prev.map((c) => (c.id === updatedCandidate.id ? updatedCandidate : c));
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  const selectedCount = candidates.filter(c => c.currentState === 'SELECTED').length;
  const joinedCount = candidates.filter(c => c.currentState === 'JOINED').length;

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Selected Candidates</h1>
              <div className="flex items-center gap-2 mt-1">
                {selectedCount > 0 && (
                  <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-0.5 text-[11px] font-semibold">
                    {selectedCount} selected
                  </span>
                )}
                {joinedCount > 0 && (
                  <span className="rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400 px-2.5 py-0.5 text-[11px] font-semibold">
                    {joinedCount} joined
                  </span>
                )}
                {selectedCount === 0 && joinedCount === 0 && (
                  <span className="text-sm text-muted-foreground">No candidates yet</span>
                )}
              </div>
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
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <Loader2 className="h-10 w-10 animate-spin text-emerald-500 relative z-10" />
            </div>
            <p className="mt-6 text-sm text-muted-foreground">Loading selected candidates...</p>
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
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <UserCheck className="h-8 w-8 text-emerald-500/50" />
            </div>
            <p className="mt-4 text-lg font-semibold text-foreground">No Selected Candidates</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No candidates have been selected yet
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Joined Section */}
            {joinedCount > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  <h2 className="text-sm font-semibold text-foreground">Joined</h2>
                  <span className="rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400 px-2 py-0.5 text-[10px] font-semibold">
                    {joinedCount}
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {candidates
                    .filter(c => c.currentState === 'JOINED')
                    .map((candidate) => (
                      <CandidateCard
                        key={candidate.applicationId}
                        candidate={candidate}
                        onClick={() => setSelectedCandidate(candidate)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Selected Section */}
            {selectedCount > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h2 className="text-sm font-semibold text-foreground">Selected</h2>
                  <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-semibold">
                    {selectedCount}
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {candidates
                    .filter(c => c.currentState === 'SELECTED')
                    .map((candidate) => (
                      <CandidateCard
                        key={candidate.applicationId}
                        candidate={candidate}
                        onClick={() => setSelectedCandidate(candidate)}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onUpdate={(updated) => {
            handleCandidateUpdate(updated);
            if (updated.currentState !== 'SELECTED' && updated.currentState !== 'JOINED') {
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
