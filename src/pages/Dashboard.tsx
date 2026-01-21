import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { KanbanBoard } from '@/components/candidates/KanbanBoard';
import { RecentRequests } from '@/components/dashboard/RecentRequests';
import { CandidateDetailModal } from '@/components/candidates/CandidateDetailModal';
import { apiClient } from '@/lib/api';
import { useSSE, SSEEvent } from '@/hooks/useSSE';
import type { Candidate } from '@/types/ats';
import { Loader2, RefreshCw, Users, AlertCircle, CalendarCheck, Wifi, WifiOff } from 'lucide-react';
import { isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { isAuthenticated, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Handle SSE events for real-time updates
  const handleSSEEvent = useCallback((event: SSEEvent) => {
    if (event.type === 'candidate_status_change' && event.candidateId) {
      // Refresh the specific candidate or reload all
      apiClient.getCandidate(event.candidateId).then((updated) => {
        setCandidates((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        toast({
          title: 'Candidate Updated',
          description: `${updated.name} status changed to ${event.newStatus}`,
        });
      }).catch(console.error);
    } else if (event.type === 'candidate_created') {
      // Reload all candidates for new additions
      loadCandidates();
      toast({
        title: 'New Candidate',
        description: 'A new candidate has been assigned to you',
      });
    } else if (event.type === 'interview_scheduled' || event.type === 'feedback_submitted') {
      // Refresh the specific candidate
      if (event.candidateId) {
        apiClient.getCandidate(event.candidateId).then((updated) => {
          setCandidates((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          );
        }).catch(console.error);
      }
    }
  }, [toast]);

  const { isConnected, reconnect } = useSSE({
    enabled: isAuthenticated,
    onEvent: handleSSEEvent,
    onConnect: () => {
      toast({
        title: 'Connected',
        description: 'Real-time updates enabled',
      });
    },
    onDisconnect: () => {
      toast({
        title: 'Disconnected',
        description: 'Real-time updates paused',
        variant: 'destructive',
      });
    },
  });

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

  // Count interviews scheduled for today
  const interviewsToday = candidates.filter(
    c => c.currentState === 'INTERVIEW_SCHEDULED' && isToday(new Date(c.updatedAt))
  ).length;
  
  const totalInterviews = candidates.filter(c => c.currentState === 'INTERVIEW_SCHEDULED').length;

  return (
    <AppLayout>
      <div className="container py-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Candidate Review</h1>
              <p className="text-sm text-muted-foreground">
                {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} assigned to you
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* SSE Connection Status */}
            <Button
              variant="ghost"
              size="sm"
              onClick={reconnect}
              className={`gap-2 ${isConnected ? 'text-green-600' : 'text-muted-foreground'}`}
              title={isConnected ? 'Real-time updates active' : 'Click to reconnect'}
            >
              {isConnected ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              <span className="hidden sm:inline text-xs">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </Button>

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
        </div>

        {/* Content */}
        {isLoading && candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Loading candidates...</p>
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
              <Users className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-lg font-medium text-foreground">No Candidates</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No candidates are currently assigned to you
            </p>
          </div>
        ) : (
          <>
            {/* Today's Stats */}
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-4 transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <CalendarCheck className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{interviewsToday}</p>
                    <p className="text-sm text-muted-foreground">Interviews Today</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4 transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <CalendarCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalInterviews}</p>
                    <p className="text-sm text-muted-foreground">Total Scheduled</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4 transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <Users className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {candidates.filter(c => c.currentState === 'TO_REVIEW').length}
                    </p>
                    <p className="text-sm text-muted-foreground">To Review</p>
                  </div>
                </div>
              </div>
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
