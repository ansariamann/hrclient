import { useState } from 'react';
import type { Candidate, ScheduleInterviewPayload } from '@/types/ats';
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
import { Loader2, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ScheduleInterviewDialogProps {
  candidate: Candidate;
  open: boolean;
  onClose: () => void;
  onComplete: (candidate: Candidate) => void;
  isNextRound?: boolean;
}

export function ScheduleInterviewDialog({
  candidate,
  open,
  onClose,
  onComplete,
  isNextRound = false,
}: ScheduleInterviewDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [mode, setMode] = useState<ScheduleInterviewPayload['mode']>('video');
  const [roundNumber, setRoundNumber] = useState(isNextRound ? 2 : 1);
  const [interviewerName, setInterviewerName] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!scheduledDate || !scheduledTime) {
      toast({
        title: 'Missing Information',
        description: 'Please select a date and time for the interview.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const payload: ScheduleInterviewPayload = {
        candidateId: candidate.id,
        scheduledDate: dateTime.toISOString(),
        mode,
        roundNumber,
        interviewerName: interviewerName.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const updated = await apiClient.scheduleInterview(payload);
      toast({
        title: 'Interview Scheduled',
        description: `Interview with ${candidate.name} has been scheduled.`,
      });
      onComplete(updated);
      handleClose();
    } catch (error: any) {
      toast({
        title: 'Failed to Schedule',
        description: error?.message || 'Unable to schedule the interview. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setScheduledDate('');
    setScheduledTime('');
    setMode('video');
    setRoundNumber(isNextRound ? 2 : 1);
    setInterviewerName('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-state-interview" />
            {isNextRound ? 'Schedule Next Interview Round' : 'Schedule Interview'}
          </DialogTitle>
          <DialogDescription>
            {isNextRound 
              ? `Schedule the next interview round with ${candidate.name}`
              : `Schedule an interview with ${candidate.name}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="round">Round Number</Label>
              <Select value={String(roundNumber)} onValueChange={(v) => setRoundNumber(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Round 1</SelectItem>
                  <SelectItem value="2">Round 2</SelectItem>
                  <SelectItem value="3">Round 3</SelectItem>
                  <SelectItem value="4">Round 4</SelectItem>
                  <SelectItem value="5">Round 5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Interview Mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as ScheduleInterviewPayload['mode'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interviewer">Interviewer Name (Optional)</Label>
            <Input
              id="interviewer"
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              placeholder="e.g., John Smith"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for the interview..."
              rows={3}
              maxLength={500}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="action-schedule" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Schedule Interview
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
