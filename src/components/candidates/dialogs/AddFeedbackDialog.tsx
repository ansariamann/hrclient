import { useState } from 'react';
import type { Candidate, FeedbackDetails, ApplicationTimeline } from '@/types/ats';
import { RECOMMENDATION_LABELS } from '@/types/ats';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Star, MessageSquare, CalendarPlus, Video, Phone, Users, ChevronDown, History } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AddFeedbackDialogProps {
  candidate: Candidate;
  roundNumber: number;
  open: boolean;
  onClose: () => void;
  onComplete: (candidate: Candidate) => void;
  timeline?: ApplicationTimeline[];
}

export function AddFeedbackDialog({
  candidate,
  roundNumber,
  open,
  onClose,
  onComplete,
  timeline = [],
}: AddFeedbackDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<FeedbackDetails['recommendation']>('neutral');
  const [feedback, setFeedback] = useState('');
  
  // Next round scheduling
  const [scheduleNextRound, setScheduleNextRound] = useState(false);
  const [nextRoundDate, setNextRoundDate] = useState('');
  const [nextRoundTime, setNextRoundTime] = useState('');
  const [nextRoundMode, setNextRoundMode] = useState<'video' | 'phone' | 'in_person'>('video');
  const [nextRoundInterviewer, setNextRoundInterviewer] = useState('');
  const [showPreviousFeedback, setShowPreviousFeedback] = useState(false);

  // Get previous feedback from timeline
  const previousFeedback = timeline
    .filter(e => e.eventType === 'feedback' && e.feedbackDetails)
    .sort((a, b) => (b.feedbackDetails?.roundNumber ?? 0) - (a.feedbackDetails?.roundNumber ?? 0));

  const handleClose = () => {
    setRating(3);
    setHoverRating(null);
    setRecommendation('neutral');
    setFeedback('');
    setScheduleNextRound(false);
    setNextRoundDate('');
    setNextRoundTime('');
    setNextRoundMode('video');
    setNextRoundInterviewer('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast({
        title: 'Feedback Required',
        description: 'Please provide written feedback for this interview round.',
        variant: 'destructive',
      });
      return;
    }

    if (scheduleNextRound) {
      if (!nextRoundDate || !nextRoundTime) {
        toast({
          title: 'Schedule Required',
          description: 'Please provide date and time for the next round.',
          variant: 'destructive',
        });
        return;
      }
      if (!nextRoundInterviewer.trim()) {
        toast({
          title: 'Interviewer Required',
          description: 'Please specify the interviewer for the next round.',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      // Submit feedback first
      let updated = await apiClient.submitFeedback({
        candidateId: candidate.id,
        roundNumber,
        rating,
        recommendation,
        feedback: feedback.trim(),
      });

      // If scheduling next round, do that too
      if (scheduleNextRound) {
        const scheduledDate = new Date(`${nextRoundDate}T${nextRoundTime}`);
        updated = await apiClient.scheduleInterview({
          candidateId: candidate.id,
          scheduledDate: scheduledDate.toISOString(),
          mode: nextRoundMode,
          roundNumber: roundNumber + 1,
          interviewerName: nextRoundInterviewer.trim(),
        });
        
        toast({
          title: 'Feedback & Next Round Scheduled',
          description: `Feedback saved and Round ${roundNumber + 1} scheduled for ${format(scheduledDate, 'PPP')}.`,
        });
      } else {
        toast({
          title: 'Feedback Submitted',
          description: `Feedback for Round ${roundNumber} has been saved.`,
        });
      }

      onComplete(updated);
      handleClose();
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error?.message || 'Unable to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Interview Feedback & Next Steps
          </DialogTitle>
          <DialogDescription>
            Submit feedback for {candidate.name}'s Round {roundNumber} and optionally schedule the next round.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Previous Feedback Section */}
          {previousFeedback.length > 0 && (
            <Collapsible open={showPreviousFeedback} onOpenChange={setShowPreviousFeedback}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-3 py-2 h-auto border border-muted">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Previous Feedback ({previousFeedback.length} round{previousFeedback.length > 1 ? 's' : ''})</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showPreviousFeedback ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-3">
                {previousFeedback.map((event) => (
                  <div key={event.id} className="rounded-lg border bg-muted/30 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Round {event.feedbackDetails?.roundNumber}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(event.timestamp), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= (event.feedbackDetails?.rating ?? 0)
                                ? 'text-amber-500 fill-amber-500' 
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {event.feedbackDetails?.recommendation && RECOMMENDATION_LABELS[event.feedbackDetails.recommendation]}
                      </span>
                    </div>
                    {event.note && (
                      <p className="text-sm text-muted-foreground">{event.note}</p>
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(star as 1 | 2 | 3 | 4 | 5)}
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= (hoverRating ?? rating)
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
            </div>
          </div>

          {/* Recommendation */}
          <div className="space-y-2">
            <Label htmlFor="recommendation">Recommendation</Label>
            <Select value={recommendation} onValueChange={(v) => setRecommendation(v as FeedbackDetails['recommendation'])}>
              <SelectTrigger>
                <SelectValue placeholder="Select recommendation" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RECOMMENDATION_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Written Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback Notes</Label>
            <Textarea
              id="feedback"
              placeholder="Provide detailed feedback about the candidate's performance..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>

          {/* Schedule Next Round Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <CalendarPlus className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium text-sm">Schedule Next Round</p>
                <p className="text-xs text-muted-foreground">Schedule Round {roundNumber + 1} interview</p>
              </div>
            </div>
            <Switch
              checked={scheduleNextRound}
              onCheckedChange={setScheduleNextRound}
            />
          </div>

          {/* Next Round Details */}
          {scheduleNextRound && (
            <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Round {roundNumber + 1} Details
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="next-date">Date</Label>
                  <Input
                    id="next-date"
                    type="date"
                    value={nextRoundDate}
                    onChange={(e) => setNextRoundDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next-time">Time</Label>
                  <Input
                    id="next-time"
                    type="time"
                    value={nextRoundTime}
                    onChange={(e) => setNextRoundTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Interview Mode</Label>
                <div className="flex gap-2">
                  {[
                    { value: 'video', icon: Video, label: 'Video' },
                    { value: 'phone', icon: Phone, label: 'Phone' },
                    { value: 'in_person', icon: Users, label: 'In Person' },
                  ].map(({ value, icon: Icon, label }) => (
                    <Button
                      key={value}
                      type="button"
                      variant={nextRoundMode === value ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => setNextRoundMode(value as typeof nextRoundMode)}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="next-interviewer">Interviewer Name</Label>
                <Input
                  id="next-interviewer"
                  placeholder="Enter interviewer name"
                  value={nextRoundInterviewer}
                  onChange={(e) => setNextRoundInterviewer(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : scheduleNextRound ? (
              'Submit & Schedule'
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
