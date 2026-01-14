import jsPDF from 'jspdf';
import { format } from 'date-fns';
import type { Candidate, ApplicationTimeline } from '@/types/ats';
import { STATE_LABELS, RECOMMENDATION_LABELS } from '@/types/ats';

export function generateCandidateReport(candidate: Candidate, timeline: ApplicationTimeline[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    
    // Check if we need a new page
    if (y + lines.length * (fontSize * 0.5) > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = 20;
    }
    
    doc.text(lines, margin, y);
    y += lines.length * (fontSize * 0.5) + 4;
  };

  const addSection = (title: string) => {
    y += 6;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    addText(title, 14, true);
    y += 2;
  };

  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Candidate Report', margin, 25);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${format(new Date(), 'PPP')}`, margin, 34);
  
  doc.setTextColor(0, 0, 0);
  y = 55;

  // Candidate Info
  addText(candidate.name, 18, true);
  addText(`Application ID: ${candidate.applicationId}`, 10);
  addText(`Current Status: ${STATE_LABELS[candidate.currentState]}`, 10);
  
  // Skills
  addSection('Skills');
  addText(candidate.skills.join('  •  '), 10);

  // Experience Summary
  addSection('Experience Summary');
  addText(candidate.experienceSummary, 10);

  // Interview History
  const interviews = timeline.filter(e => e.eventType === 'interview_round');
  if (interviews.length > 0) {
    addSection('Interview History');
    
    interviews.forEach((event) => {
      const details = event.interviewDetails;
      if (details) {
        const modeLabel = details.mode === 'in_person' ? 'In Person' : 
                          details.mode === 'video' ? 'Video Call' : 'Phone';
        
        addText(`Round ${details.roundNumber} - ${modeLabel}`, 11, true);
        addText(`Date: ${format(new Date(event.timestamp), 'PPP')}`, 10);
        if (details.interviewerName) {
          addText(`Interviewer: ${details.interviewerName}`, 10);
        }
        if (event.note) {
          addText(`Notes: ${event.note}`, 10);
        }
        y += 4;
      }
    });
  }

  // Feedback Summary
  const feedbacks = timeline.filter(e => e.eventType === 'feedback');
  if (feedbacks.length > 0) {
    addSection('Feedback Summary');
    
    feedbacks.forEach((event) => {
      const details = event.feedbackDetails;
      if (details) {
        addText(`Round ${details.roundNumber} Feedback`, 11, true);
        addText(`Rating: ${'★'.repeat(details.rating)}${'☆'.repeat(5 - details.rating)} (${details.rating}/5)`, 10);
        addText(`Recommendation: ${RECOMMENDATION_LABELS[details.recommendation]}`, 10);
        if (event.note) {
          addText(`Comments: ${event.note}`, 10);
        }
        y += 4;
      }
    });
  }

  // Timeline
  addSection('Complete Timeline');
  
  timeline
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .forEach((event) => {
      const dateStr = format(new Date(event.timestamp), 'MMM d, yyyy h:mm a');
      let eventTitle = 'Event';
      
      if (event.eventType === 'interview_round' && event.interviewDetails) {
        eventTitle = `Interview Round ${event.interviewDetails.roundNumber}`;
      } else if (event.eventType === 'feedback' && event.feedbackDetails) {
        eventTitle = `Feedback - Round ${event.feedbackDetails.roundNumber}`;
      } else if (event.state) {
        eventTitle = STATE_LABELS[event.state];
      }
      
      addText(`• ${dateStr} - ${eventTitle}`, 9);
      if (event.note) {
        doc.setTextColor(100, 100, 100);
        addText(`  ${event.note}`, 9);
        doc.setTextColor(0, 0, 0);
      }
    });

  // Footer on last page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  const fileName = `${candidate.name.replace(/\s+/g, '_')}_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
