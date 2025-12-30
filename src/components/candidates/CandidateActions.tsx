import { useState } from 'react';
import type { Candidate, ClientAction } from '@/types/ats';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, XCircle, UserMinus, Loader2 } from 'lucide-react';
import { ScheduleInterviewDialog } from './dialogs/ScheduleInterviewDialog';
import { RejectDialog } from './dialogs/RejectDialog';
import { LeftCompanyDialog } from './dialogs/LeftCompanyDialog';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CandidateActionsProps {
  candidate: Candidate;
  onActionComplete: (candidate: Candidate) => void;
}

export function CandidateActions({ candidate, onActionComplete }: CandidateActionsProps) {
  const [isLoading, setIsLoading] = useState<ClientAction | null>(null);
  const [openDialog, setOpenDialog] = useState<ClientAction | null>(null);
  const { toast } = useToast();

  const allowedActions = candidate.allowedActions;

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
        {allowedActions.includes('SCHEDULE_INTERVIEW') && (
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
    </>
  );
}
