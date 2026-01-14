import { useState, useMemo } from 'react';
import type { Candidate, ClientAction, ApplicationTimeline } from '@/types/ats';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, XCircle, UserMinus, Loader2, MessageSquare } from 'lucide-react';
import { ScheduleInterviewDialog } from './dialogs/ScheduleInterviewDialog';
import { RejectDialog } from './dialogs/RejectDialog';
import { LeftCompanyDialog } from './dialogs/LeftCompanyDialog';
import { AddFeedbackDialog } from './dialogs/AddFeedbackDialog';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CandidateActionsProps {
  candidate: Candidate;
  onActionComplete: (candidate: Candidate) => void;
  timeline?: ApplicationTimeline[];
}

export function CandidateActions({ candidate, onActionComplete, timeline = [] }: CandidateActionsProps) {
  const [isLoading, setIsLoading] = useState<ClientAction | null>(null);
  const [openDialog, setOpenDialog] = useState<ClientAction | 'ADD_FEEDBACK' | null>(null);
  const [currentRoundNumber, setCurrentRoundNumber] = useState(1);
  const { toast } = useToast();

  const allowedActions = candidate.allowedActions;
  const isInterviewScheduled = candidate.currentState === 'INTERVIEW_SCHEDULED';

  // Calculate the latest round number from timeline data
  const latestRound = useMemo(() => {
    const interviewEvents = timeline.filter(e => e.eventType === 'interview_round');
    if (interviewEvents.length === 0) return 1;
    const maxRound = Math.max(...interviewEvents.map(e => e.interviewDetails?.roundNumber ?? 0));
    return maxRound || 1;
  }, [timeline]);

  const handleSelect = async () => {
    setIsLoading('SELECT');
    try {
      const updated = await apiClient.selectCandidate(candidate.id);
      toast({
        title: 'Candidate Selected',
        description: `${candidate.name} has been marked as selected.`,
      });
      onActionComplete(updated);
    } catch (error: any) {
      toast({
        title: 'Action Failed',
        description: error?.message || 'Unable to complete this action. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleOpenFeedback = () => {
    setCurrentRoundNumber(latestRound);
    setOpenDialog('ADD_FEEDBACK');
  };

  if (allowedActions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-2">
        No actions available for this candidate
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {allowedActions.includes('SCHEDULE_INTERVIEW') && !isInterviewScheduled && (
          <Button
            variant="action-schedule"
            size="sm"
            onClick={() => setOpenDialog('SCHEDULE_INTERVIEW')}
            disabled={!!isLoading}
          >
            <Calendar className="h-4 w-4" />
            Schedule Interview
          </Button>
        )}

        {/* Feedback & Next Round button for interviewed candidates */}
        {isInterviewScheduled && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenFeedback}
            disabled={!!isLoading}
            className="gap-2 border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950 dark:hover:text-amber-300"
          >
            <MessageSquare className="h-4 w-4" />
            Feedback & Next Round
          </Button>
        )}

        {allowedActions.includes('SELECT') && (
          <Button
            variant="action-select"
            size="sm"
            onClick={handleSelect}
            disabled={!!isLoading}
          >
            {isLoading === 'SELECT' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Select Candidate
          </Button>
        )}

        {allowedActions.includes('REJECT') && (
          <Button
            variant="action-reject"
            size="sm"
            onClick={() => setOpenDialog('REJECT')}
            disabled={!!isLoading}
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
        )}

        {allowedActions.includes('MARK_LEFT_COMPANY') && (
          <Button
            variant="action-left"
            size="sm"
            onClick={() => setOpenDialog('MARK_LEFT_COMPANY')}
            disabled={!!isLoading}
          >
            <UserMinus className="h-4 w-4" />
            Mark as Left
          </Button>
        )}
      </div>

      {/* Dialogs */}
      <ScheduleInterviewDialog
        candidate={candidate}
        open={openDialog === 'SCHEDULE_INTERVIEW'}
        onClose={() => setOpenDialog(null)}
        onComplete={onActionComplete}
      />

      <RejectDialog
        candidate={candidate}
        open={openDialog === 'REJECT'}
        onClose={() => setOpenDialog(null)}
        onComplete={onActionComplete}
      />

      <LeftCompanyDialog
        candidate={candidate}
        open={openDialog === 'MARK_LEFT_COMPANY'}
        onClose={() => setOpenDialog(null)}
        onComplete={onActionComplete}
      />

      <AddFeedbackDialog
        candidate={candidate}
        roundNumber={currentRoundNumber}
        open={openDialog === 'ADD_FEEDBACK'}
        onClose={() => setOpenDialog(null)}
        onComplete={onActionComplete}
      />
    </>
  );
}
