import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Briefcase,
  Users,
  Award,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
  Sparkles,
  Printer,
} from 'lucide-react';
import { exportCandidatesToCSV, exportCandidatesToPDF } from '../utils/exportReports.ts';

export const ReportsView: React.FC = () => {
  const { candidates, jobs, selectedJobId, adminProfile, showToast } = useApp();

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const handleExportAllCSV = () => {
    exportCandidatesToCSV(candidates, jobs, 'all_candidates_screening_report.csv', (msg) =>
      showToast(msg, 'error')
    );
  };

  const handleExportSelectedJobCSV = () => {
    const jobCandidates = candidates.filter((c) => c.jobId === selectedJob?.id);
    exportCandidatesToCSV(
      jobCandidates,
      jobs,
      `${(selectedJob?.title || 'Job').replace(/\s+/g, '_')}_screening_report.csv`,
      (msg) => showToast(msg, 'error')
    );
  };

  const handleExportPDF = () => {
    const jobCandidates = selectedJobId
      ? candidates.filter((c) => c.jobId === selectedJobId)
      : candidates;

    exportCandidatesToPDF(
      jobCandidates.length > 0 ? jobCandidates : candidates,
      jobs,
      selectedJob?.title || 'Institutional Recruitment',
      adminProfile?.organization || 'Campus Placement Cell & Talent Acquisition',
      (msg) => showToast(msg, 'error')
    );
  };

  const totalScreened = candidates.length;
  const shortlisted = candidates.filter((c) => c.status === 'shortlisted').length;
  const underReview = candidates.filter((c) => c.status === 'under_review').length;
  const rejected = candidates.filter((c) => c.status === 'rejected').length;
  const avgScore =
    totalScreened > 0
      ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / totalScreened)
      : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
          <FileSpreadsheet className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
          Recruitment & Placement Screening Reports
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Export candidate evaluation data, job-wise ranking summaries, and institutional reports in CSV and formatted PDF.
        </p>
      </div>

      {/* Export Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* PDF Export Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 border border-blue-400/30">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              Institutional Placement PDF Report
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Generate a formal executive screening report complete with institutional branding, summary statistics, ranked candidate score breakdown, and recruiter verification signatures.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Target: <strong className="text-white">{selectedJob?.title || 'All Jobs'}</strong>
            </span>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Download PDF Report</span>
            </button>
          </div>
        </div>

        {/* CSV Export Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 border border-emerald-200 dark:border-emerald-800">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Complete CSV Candidate Dataset
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Export all evaluated candidates, extracted contact information, 4-pillar scores, matched and missing skills, and recruiter remarks for Excel or ATS imports.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={handleExportSelectedJobCSV}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Job CSV</span>
            </button>

            <button
              onClick={handleExportAllCSV}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All Candidates ({candidates.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recruitment Funnel & Screening Summary */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Screening Conversion Funnel
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              1. Resumes Ingested
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalScreened}
            </div>
            <span className="text-[11px] text-slate-500">100% Ingestion</span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-center">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              2. Under Evaluation
            </span>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
              {underReview}
            </div>
            <span className="text-[11px] text-blue-600/80">
              {totalScreened > 0 ? Math.round((underReview / totalScreened) * 100) : 0}% of pool
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              3. Shortlisted
            </span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {shortlisted}
            </div>
            <span className="text-[11px] text-emerald-600/80">
              {totalScreened > 0 ? Math.round((shortlisted / totalScreened) * 100) : 0}% pass rate
            </span>
          </div>

          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-center">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              4. Rejected
            </span>
            <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
              {rejected}
            </div>
            <span className="text-[11px] text-rose-600/80">
              {totalScreened > 0 ? Math.round((rejected / totalScreened) * 100) : 0}% of pool
            </span>
          </div>
        </div>
      </div>

      {/* Job-wise Breakdown Report Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Job-Wise Placement Metrics Breakdown
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Job Designation</th>
                <th className="py-3 px-3">Company</th>
                <th className="py-3 px-3">Screened</th>
                <th className="py-3 px-3">Shortlisted</th>
                <th className="py-3 px-3">Average Match</th>
                <th className="py-3 px-3">Min Experience</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {jobs.map((job) => {
                const jobCandidates = candidates.filter((c) => c.jobId === job.id);
                const jobShortlisted = jobCandidates.filter((c) => c.status === 'shortlisted').length;
                const jobAvg =
                  jobCandidates.length > 0
                    ? Math.round(jobCandidates.reduce((s, c) => s + c.score, 0) / jobCandidates.length)
                    : 0;

                return (
                  <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {job.title}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{job.company}</td>
                    <td className="py-3 px-3 font-semibold">{jobCandidates.length}</td>
                    <td className="py-3 px-3 text-emerald-600 font-bold">{jobShortlisted}</td>
                    <td className="py-3 px-3">
                      <span className="font-extrabold text-blue-600">{jobAvg}%</span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{job.minExperience} yrs</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          const jCands = candidates.filter((c) => c.jobId === job.id);
                          exportCandidatesToCSV(
                            jCands,
                            jobs,
                            `${job.title.replace(/\s+/g, '_')}_report.csv`
                          );
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        Export CSV
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
