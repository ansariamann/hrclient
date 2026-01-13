import { useState } from 'react';
import type { Candidate, FeedbackDetails } from '@/types/ats';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Star, MessageSquare } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AddFeedbackDialogProps {
  candidate: Candidate;
  roundNumber: number;
  open: boolean;
  onClose: () => void;
  onComplete: (candidate: Candidate) => void;
}

export function AddFeedbackDialog({
  candidate,
  roundNumber,
  open,
  onClose,
  onComplete,
}: AddFeedbackDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<FeedbackDetails['recommendation']>('neutral');
  const [feedback, setFeedback] = useState('');

  const handleClose = () => {
    setRating(3);
    setHoverRating(null);
    setRecommendation('neutral');
    setFeedback('');
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

    setIsLoading(true);
    try {
      const updated = await apiClient.submitFeedback({
        candidateId: candidate.id,
        roundNumber,
        rating,
        recommendation,
        feedback: feedback.trim(),
      });
      toast({
        title: 'Feedback Submitted',
        description: `Feedback for Round ${roundNumber} has been saved.`,
      });
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Add Interview Feedback
          </DialogTitle>
          <DialogDescription>
            Submit your feedback for {candidate.name}'s Round {roundNumber} interview.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
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
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
