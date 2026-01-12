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
      <div className="container py-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Selected Candidates</h1>
              <p className="text-sm text-muted-foreground">
                {selectedCount} selected, {joinedCount} joined
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadCandidates}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Content */}
        {isLoading && candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Loading selected candidates...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <p className="mt-4 text-lg font-medium text-foreground">Failed to Load</p>
            <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
            <Button variant="outline" className="mt-4" onClick={loadCandidates}>
              Try Again
            </Button>
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <UserCheck className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-lg font-medium text-foreground">No Selected Candidates</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No candidates have been selected yet
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Joined Section */}
            {joinedCount > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Joined ({joinedCount})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {candidates
                    .filter(c => c.currentState === 'JOINED')
                    .map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
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
                <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Selected ({selectedCount})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {candidates
                    .filter(c => c.currentState === 'SELECTED')
                    .map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
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
