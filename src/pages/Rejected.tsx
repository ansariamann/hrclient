import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { CandidateCard } from '@/components/candidates/CandidateCard';
import { CandidateDetailModal } from '@/components/candidates/CandidateDetailModal';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import type { Candidate } from '@/types/ats';
import { XCircle, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

export default function Rejected() {
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
      // Filter candidates who are REJECTED
      const rejectedCandidates = data.filter(c => c.currentState === 'REJECTED');
      setCandidates(rejectedCandidates);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load rejected candidates');
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
      // If the candidate is no longer REJECTED, remove from list
      if (updatedCandidate.currentState !== 'REJECTED') {
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
      <div className="container py-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Rejected Candidates</h1>
              <p className="text-sm text-muted-foreground">
                {candidates.length} rejected candidate{candidates.length !== 1 ? 's' : ''}
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
            <p className="mt-4 text-sm text-muted-foreground">Loading rejected candidates...</p>
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
              <XCircle className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-lg font-medium text-foreground">No Rejected Candidates</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No candidates have been rejected yet
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
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
            if (updated.currentState !== 'REJECTED') {
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
