import { useState } from 'react';
import type { Candidate, RejectPayload, RejectReason } from '@/types/ats';
import { REJECT_REASON_LABELS } from '@/types/ats';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, XCircle, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface RejectDialogProps {
  candidate: Candidate;
  open: boolean;
  onClose: () => void;
  onComplete: (candidate: Candidate) => void;
}

export function RejectDialog({
  candidate,
  open,
  onClose,
  onComplete,
}: RejectDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState<RejectReason | ''>('');
  const [feedback, setFeedback] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast({
        title: 'Reason Required',
        description: 'Please select a rejection reason.',
        variant: 'destructive',
      });
      return;
    }

    if (feedback.trim().length < 10) {
      toast({
        title: 'Feedback Required',
        description: 'Please provide detailed feedback (at least 10 characters).',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload: RejectPayload = {
        candidateId: candidate.id,
        reason,
        feedback: feedback.trim(),
      };

      const updated = await apiClient.rejectCandidate(payload);
      toast({
        title: 'Candidate Rejected',
        description: `${candidate.name} has been rejected.`,
      });
      onComplete(updated);
      handleClose();
    } catch (error: any) {
      toast({
        title: 'Action Failed',
        description: error?.message || 'Unable to reject candidate. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setFeedback('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Reject Candidate
          </DialogTitle>
          <DialogDescription>
            Provide a reason and feedback for rejecting {candidate.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">
            This action cannot be undone. The candidate will be notified of the rejection.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as RejectReason)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REJECT_REASON_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Detailed Feedback</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please provide constructive feedback about this decision..."
              rows={4}
              maxLength={1000}
              required
            />
            <p className="text-xs text-muted-foreground">
              {feedback.length}/1000 characters
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
