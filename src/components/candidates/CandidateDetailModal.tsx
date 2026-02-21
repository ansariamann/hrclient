import { useState, useEffect } from 'react';
import type { Candidate, ApplicationTimeline } from '@/types/ats';
import { STATE_LABELS, RECOMMENDATION_LABELS } from '@/types/ats';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CandidateActions } from './CandidateActions';
import { FileText, Briefcase, Clock, User, Video, Phone, MapPin, Star, MessageSquare, Download } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { apiClient } from '@/lib/api';
import { generateCandidateReport } from '@/lib/generateCandidateReport';
import { useToast } from '@/hooks/use-toast';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  onUpdate: (candidate: Candidate) => void;
}

const stateVariant = {
  TO_REVIEW: 'to-review',
  INTERVIEW_SCHEDULED: 'interview',
  SELECTED: 'selected',
  JOINED: 'joined',
  REJECTED: 'rejected',
  LEFT_COMPANY: 'rejected',
} as const;

export function CandidateDetailModal({ candidate, onClose, onUpdate }: CandidateDetailModalProps) {
  const [timeline, setTimeline] = useState<ApplicationTimeline[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = () => {
    if (!candidate) return;
    try {
      generateCandidateReport(candidate, timeline);
      toast({
        title: 'Report Downloaded',
        description: `PDF report for ${candidate.name} has been generated.`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Unable to generate the PDF report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (candidate) {
      setIsLoadingTimeline(true);
      apiClient
        .getCandidateTimeline(candidate.id)
        .then(setTimeline)
        .catch(() => setTimeline([]))
        .finally(() => setIsLoadingTimeline(false));
    } else {
      setTimeline([]);
    }
  }, [candidate?.id]);

  if (!candidate) return null;

  return (
    <Dialog open={!!candidate} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">{candidate.name}</DialogTitle>
              <DialogDescription className="mt-1">
                Application ID: {candidate.applicationId}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={isLoadingTimeline}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              <Badge variant={stateVariant[candidate.currentState]} className="shrink-0">
                {STATE_LABELS[candidate.currentState]}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="shrink-0 grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="resume" className="gap-2">
              <FileText className="h-4 w-4" />
              Resume
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="profile" className="m-0 space-y-6">
              {/* Experience Summary */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Briefcase className="h-4 w-4" />
                  Experience Summary
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {candidate.experienceSummary}
                </p>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-sm font-medium text-secondary-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground border-t pt-4">
                {(candidate.ctcCurrent || candidate.ctcExpected) && (
                  <div>
                    {candidate.ctcCurrent ? `Current CTC: ₹${candidate.ctcCurrent.toLocaleString()}` : 'Current CTC: -'}
                    {' | '}
                    {candidate.ctcExpected ? `Expected CTC: ₹${candidate.ctcExpected.toLocaleString()}` : 'Expected CTC: -'}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Updated {formatDistanceToNow(new Date(candidate.updatedAt), { addSuffix: true })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resume" className="m-0">
              {candidate.resumeUrl ? (
                <div className="rounded-lg border border-border bg-muted/30 h-[400px] flex items-center justify-center">
                  <iframe
                    src={candidate.resumeUrl}
                    className="w-full h-full rounded-lg"
                    title="Resume Preview"
                  />
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No resume available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="m-0">
              {isLoadingTimeline ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Loading timeline...</p>
                </div>
              ) : timeline.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                  <Clock className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No timeline events</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeline.map((event) => {
                    const isInterview = event.eventType === 'interview_round';
                    const isFeedback = event.eventType === 'feedback';
                    
                    const getModeIcon = (mode?: string) => {
                      switch (mode) {
                        case 'video': return <Video className="h-3.5 w-3.5" />;
                        case 'phone': return <Phone className="h-3.5 w-3.5" />;
                        case 'in_person': return <MapPin className="h-3.5 w-3.5" />;
                        default: return null;
                      }
                    };

                    const getEventColor = () => {
                      if (isInterview) return 'bg-blue-500';
                      if (isFeedback) return 'bg-amber-500';
                      return 'bg-primary';
                    };

                    const getEventTitle = () => {
                      if (isInterview && event.interviewDetails) {
                        return `Interview Round ${event.interviewDetails.roundNumber}`;
                      }
                      if (isFeedback && event.feedbackDetails) {
                        return `Feedback - Round ${event.feedbackDetails.roundNumber}`;
                      }
                      if (event.state) {
                        return STATE_LABELS[event.state];
                      }
                      return 'Event';
                    };

                    return (
                      <div key={event.id} className="flex gap-4">
                        <div className="relative flex flex-col items-center">
                          <div className={`h-2.5 w-2.5 rounded-full ${getEventColor()}`} />
                          <div className="flex-1 w-px bg-border" />
                        </div>
                        <div className="pb-4 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">
                              {getEventTitle()}
                            </p>
                            {isInterview && event.interviewDetails && (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                {getModeIcon(event.interviewDetails.mode)}
                                {event.interviewDetails.mode === 'in_person' ? 'In Person' : 
                                  event.interviewDetails.mode === 'video' ? 'Video' : 'Phone'}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(event.timestamp), 'MMM d, yyyy · h:mm a')}
                            {event.actor !== 'system' && ` · by ${event.actor}`}
                          </p>
                          
                          {isInterview && event.interviewDetails?.interviewerName && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Interviewer: {event.interviewDetails.interviewerName}
                            </p>
                          )}
                          
                          {isFeedback && event.feedbackDetails && (
                            <div className="mt-2 flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star}
                                    className={`h-3.5 w-3.5 ${
                                      star <= event.feedbackDetails!.rating 
                                        ? 'text-amber-500 fill-amber-500' 
                                        : 'text-muted-foreground/30'
                                    }`}
                                  />
                                ))}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {RECOMMENDATION_LABELS[event.feedbackDetails.recommendation]}
                              </Badge>
                            </div>
                          )}
                          
                          {event.note && (
                            <div className="mt-2 flex gap-2 items-start bg-muted rounded-md p-2">
                              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                              <p className="text-sm text-muted-foreground">
                                {event.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Actions */}
        <div className="shrink-0 border-t pt-4 mt-4">
          <CandidateActions candidate={candidate} onActionComplete={onUpdate} timeline={timeline} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
