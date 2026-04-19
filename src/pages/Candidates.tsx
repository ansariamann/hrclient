import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { KanbanBoard } from '@/components/candidates/KanbanBoard';
import { CandidateDetailModal } from '@/components/candidates/CandidateDetailModal';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import type { Candidate } from '@/types/ats';
import { Users, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

export default function Candidates() {
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
      setCandidates(data);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load candidates');
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
    setCandidates((prev) =>
      prev.map((c) => (c.id === updatedCandidate.id ? updatedCandidate : c))
    );
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">All Candidates</h1>
              <p className="text-sm text-muted-foreground">
                {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} in pipeline
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
              No candidates are currently in the pipeline
            </p>
          </div>
        ) : (
          <KanbanBoard candidates={candidates} onCandidateUpdate={handleCandidateUpdate} />
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
