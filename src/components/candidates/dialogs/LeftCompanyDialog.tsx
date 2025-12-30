import { useState } from 'react';
import type { Candidate, LeftCompanyPayload, LeftReason } from '@/types/ats';
import { LEFT_REASON_LABELS } from '@/types/ats';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, UserMinus } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface LeftCompanyDialogProps {
  candidate: Candidate;
  open: boolean;
  onClose: () => void;
  onComplete: (candidate: Candidate) => void;
}

export function LeftCompanyDialog({
  candidate,
  open,
  onClose,
  onComplete,
}: LeftCompanyDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState<LeftReason | ''>('');
  const [feedback, setFeedback] = useState('');
  const [lastWorkingDate, setLastWorkingDate] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast({
        title: 'Reason Required',
        description: 'Please select a reason for leaving.',
        variant: 'destructive',
      });
      return;
    }

    if (feedback.trim().length < 10) {
      toast({
        title: 'Feedback Required',
        description: 'Please provide details about the departure (at least 10 characters).',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload: LeftCompanyPayload = {
        candidateId: candidate.id,
        reason,
        feedback: feedback.trim(),
        lastWorkingDate: lastWorkingDate || undefined,
      };

      const updated = await apiClient.markLeftCompany(payload);
      toast({
        title: 'Status Updated',
        description: `${candidate.name} has been marked as left company.`,
      });
      onComplete(updated);
      handleClose();
    } catch (error: any) {
      toast({
        title: 'Action Failed',
        description: error?.message || 'Unable to update status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setFeedback('');
    setLastWorkingDate('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-muted-foreground" />
            Mark as Left Company
          </DialogTitle>
          <DialogDescription>
            Record that {candidate.name} has left the company
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leaving</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as LeftReason)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LEFT_REASON_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastWorkingDate">Last Working Date (Optional)</Label>
            <Input
              id="lastWorkingDate"
              type="date"
              value={lastWorkingDate}
              onChange={(e) => setLastWorkingDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Details</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide details about the departure..."
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
