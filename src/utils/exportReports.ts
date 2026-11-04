import jsPDF from 'jspdf';
import { Candidate, Job } from '../firebase.ts';

export function exportCandidatesToCSV(
  candidates: Candidate[],
  jobs: Job[],
  filename = 'candidate_screening_report.csv',
  onError?: (msg: string) => void
) {
  if (candidates.length === 0) {
    if (onError) onError('No candidates available to export.');
    return false;
  }

  const jobMap = new Map(jobs.map((j) => [j.id, j]));

  const headers = [
    'Rank',
    'Candidate Name',
    'Email',
    'Phone',
    'Job Title',
    'Company',
    'Score (%)',
    'Skills Match (40)',
    'Experience Match (30)',
    'Education Match (15)',
    'Domain Match (15)',
    'Experience (Years)',
    'Education',
    'Matching Skills',
    'Missing Skills',
    'Review Status',
    'Recruiter Notes',
    'Analyzed Date',
  ];

  const sorted = [...candidates].sort((a, b) => b.score - a.score);

  const rows = sorted.map((c, index) => {
    const job = jobMap.get(c.jobId);
    const bd = c.scoreBreakdown;

    const escape = (val: any) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    return [
      index + 1,
      escape(c.name),
      escape(c.email || 'N/A'),
      escape(c.phone || 'N/A'),
      escape(job?.title || 'Unknown Job'),
      escape(job?.company || 'N/A'),
      c.score,
      bd?.skillsMatchScore ?? 'N/A',
      bd?.experienceScore ?? 'N/A',
      bd?.educationScore ?? 'N/A',
      bd?.domainAndProjectScore ?? 'N/A',
      c.experienceYears ?? 'N/A',
      escape(c.education || 'N/A'),
      escape((c.matchingSkills || []).join('; ')),
      escape((c.missingSkills || []).join('; ')),
      escape(c.status.toUpperCase()),
      escape(c.notes || ''),
      escape(new Date(c.createdAt).toLocaleDateString()),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportCandidatesToPDF(
  candidates: Candidate[],
  jobs: Job[],
  currentJobTitle = 'All Positions',
  organization = 'Placement Office & Talent Acquisition',
  onError?: (msg: string) => void
) {
  if (candidates.length === 0) {
    if (onError) onError('No candidates available to generate PDF report.');
    return false;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const jobMap = new Map(jobs.map((j) => [j.id, j]));
  const sorted = [...candidates].sort((a, b) => b.score - a.score);

  // Brand Header
  doc.setFillColor(15, 23, 42); // Navy 900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('AI RESUME SCREENING & TALENT REPORT', 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(`${organization} • Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 22);
  doc.text(`Target Opening: ${currentJobTitle}`, 14, 27);

  // Overview Metrics Cards
  const avgScore = Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length);
  const shortlistedCount = candidates.filter((c) => c.status === 'shortlisted').length;
  const underReviewCount = candidates.filter((c) => c.status === 'under_review').length;

  doc.setFillColor(248, 250, 252);
  doc.rect(14, 38, 182, 22, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 38, 182, 22, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Screened: ${candidates.length}`, 20, 48);
  doc.text(`Average Match: ${avgScore}%`, 70, 48);
  doc.text(`Shortlisted: ${shortlistedCount}`, 120, 48);
  doc.text(`Under Review: ${underReviewCount}`, 160, 48);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('Scoring Criteria: 40% Skills Alignment, 30% Experience, 15% Education, 15% Projects & Domain Fit.', 20, 55);

  // Table Header
  let y = 68;
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('RANK', 16, y + 5.5);
  doc.text('CANDIDATE NAME', 30, y + 5.5);
  doc.text('JOB ROLE', 75, y + 5.5);
  doc.text('EXP (YRS)', 118, y + 5.5);
  doc.text('MATCH SCORE', 140, y + 5.5);
  doc.text('STATUS', 172, y + 5.5);

  y += 8;

  // Candidates List
  sorted.forEach((c, idx) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const job = jobMap.get(c.jobId);
    const isEven = idx % 2 === 0;

    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(14, y, 182, 10, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 10, 196, y + 10);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`#${idx + 1}`, 16, y + 6.5);

    doc.text(c.name.slice(0, 22), 30, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text((job?.title || 'Unknown').slice(0, 22), 75, y + 6.5);
    doc.text(c.experienceYears !== undefined ? `${c.experienceYears}y` : 'N/A', 122, y + 6.5);

    // Score badge
    if (c.score >= 75) {
      doc.setTextColor(16, 185, 129); // Emerald
    } else if (c.score >= 55) {
      doc.setTextColor(217, 119, 6); // Amber
    } else {
      doc.setTextColor(100, 116, 139); // Slate
    }
    doc.setFont('helvetica', 'bold');
    doc.text(`${c.score}%`, 146, y + 6.5);

    // Status text
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(c.status.replace('_', ' ').toUpperCase(), 172, y + 6.5);

    y += 10;
  });

  // Footer & Disclaimer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Notice: AI matching scores are algorithmic relevance indicators for screening assistance. Official hiring and placement decisions require human recruiter evaluation.',
      14,
      288
    );
    doc.text(`Page ${i} of ${pageCount}`, 185, 288);
  }

  doc.save(`Screening_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
