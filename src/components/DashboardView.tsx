import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Users,
  Award,
  CheckCircle2,
  TrendingUp,
  UploadCloud,
  Briefcase,
  FileSpreadsheet,
  Clock,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Candidate, Job } from '../firebase.ts';

interface DashboardViewProps {
  onOpenNewJob: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenNewJob }) => {
  const {
    candidates,
    jobs,
    activities,
    setCurrentView,
    setSelectedJobId,
    setActiveCandidate,
    selectedJobId,
  } = useApp();

  const totalResumes = candidates.length;
  const shortlistedCandidates = candidates.filter((c) => c.status === 'shortlisted');
  const underReviewCandidates = candidates.filter((c) => c.status === 'under_review');
  const averageScore =
    candidates.length > 0
      ? Math.round(candidates.reduce((acc, c) => acc + c.score, 0) / candidates.length)
      : 0;

  const shortlistedRate =
    candidates.length > 0
      ? Math.round((shortlistedCandidates.length / candidates.length) * 100)
      : 0;

  // Score distribution tiers
  const tierHigh = candidates.filter((c) => c.score >= 80).length;
  const tierMed = candidates.filter((c) => c.score >= 60 && c.score < 80).length;
  const tierLow = candidates.filter((c) => c.score < 60).length;

  // Top Ranked Candidates
  const topCandidates = [...candidates].sort((a, b) => b.score - a.score).slice(0, 5);

  // Job map
  const jobMap = new Map<string, Job>(jobs.map((j) => [j.id, j]));

  // Selected job info
  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Quick Actions Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>AI-Assisted Human Recruitment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Recruitment & Placement Screening Hub
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
              Screen, rank, and evaluate multi-format candidate resumes against role criteria with transparent Gemini AI matching scores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentView('upload')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:scale-102"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload & Screen Resumes</span>
            </button>
            <button
              onClick={onOpenNewJob}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center space-x-2 backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-blue-300" />
              <span>New Job Opening</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Uploaded */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Screened
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalResumes}
            </span>
            <span className="text-xs text-slate-400">candidates</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center">
            Across {jobs.length} open position{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Shortlisted */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Shortlisted
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {shortlistedCandidates.length}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              {shortlistedRate}% pass rate
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Approved for interview stage
          </p>
        </div>

        {/* Average Match Score */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg Match Score
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {averageScore}%
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              Relevance index
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Calculated across skills, exp & edu
          </p>
        </div>

        {/* Under Review */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Under Review
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {underReviewCandidates.length}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              awaiting feedback
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Pending recruiter deep review
          </p>
        </div>
      </div>

      {/* Main Grid: Charts & Ranked Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Candidate Score Distribution & Job Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Score Distribution */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Candidate Match Score Distribution
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tier breakdown based on objective job criteria alignment
                </p>
              </div>
              <button
                onClick={() => setCurrentView('candidates')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>View Full Ranking</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {candidates.length > 0 ? (
              <div className="space-y-4">
                {/* Visual Stacked Progress Bar */}
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${totalResumes > 0 ? (tierHigh / totalResumes) * 100 : 0}%` }}
                    className="bg-emerald-500 transition-all duration-500"
                    title={`High Match (>=80%): ${tierHigh}`}
                  ></div>
                  <div
                    style={{ width: `${totalResumes > 0 ? (tierMed / totalResumes) * 100 : 0}%` }}
                    className="bg-amber-500 transition-all duration-500"
                    title={`Medium Match (60-79%): ${tierMed}`}
                  ></div>
                  <div
                    style={{ width: `${totalResumes > 0 ? (tierLow / totalResumes) * 100 : 0}%` }}
                    className="bg-slate-400 dark:bg-slate-600 transition-all duration-500"
                    title={`Review Needed (<60%): ${tierLow}`}
                  ></div>
                </div>

                {/* 3 Tier Cards */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                        High Match (80-100%)
                      </span>
                    </div>
                    <div className="mt-2 text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                      {tierHigh}
                    </div>
                    <p className="text-[10px] text-emerald-800/80 dark:text-emerald-400">
                      Strong skill & experience fit
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                        Medium Match (60-79%)
                      </span>
                    </div>
                    <div className="mt-2 text-xl font-extrabold text-amber-700 dark:text-amber-300">
                      {tierMed}
                    </div>
                    <p className="text-[10px] text-amber-800/80 dark:text-amber-400">
                      Partial skills or experience
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Gaps Identified (&lt;60%)
                      </span>
                    </div>
                    <div className="mt-2 text-xl font-extrabold text-slate-700 dark:text-slate-300">
                      {tierLow}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Missing core requirements
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No candidate resumes screened yet
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Upload PDF or DOCX resumes or load the sample candidate set.
                </p>
                <button
                  onClick={() => setCurrentView('upload')}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                >
                  Upload & Screen Now
                </button>
              </div>
            )}
          </div>

          {/* Job-wise Screening Breakdown */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Job Opening Pipelines
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Candidate volume, average score, and shortlisting conversion per opening
                </p>
              </div>
              <button
                onClick={() => setCurrentView('jobs')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Manage Jobs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {jobs.map((job) => {
                const jobCandidates = candidates.filter((c) => c.jobId === job.id);
                const jobShortlisted = jobCandidates.filter((c) => c.status === 'shortlisted').length;
                const jobAvg =
                  jobCandidates.length > 0
                    ? Math.round(jobCandidates.reduce((s, c) => s + c.score, 0) / jobCandidates.length)
                    : 0;

                return (
                  <div
                    key={job.id}
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setCurrentView('candidates');
                    }}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {job.title}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {job.company}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Req. Skills: {job.requiredSkills.slice(0, 4).join(', ')}
                          {job.requiredSkills.length > 4 ? ` +${job.requiredSkills.length - 4}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {jobCandidates.length} Screened
                          </div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            {jobShortlisted} Shortlisted
                          </div>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center">
                          <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300">
                            {jobAvg}%
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Avg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Top Ranked Candidates & Recent Activity Feed */}
        <div className="space-y-6">
          {/* Top Ranked Candidates Leaderboard */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Top Ranked Candidates
                </h3>
              </div>
              <button
                onClick={() => setCurrentView('candidates')}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                All Rankings
              </button>
            </div>

            {topCandidates.length > 0 ? (
              <div className="space-y-2.5">
                {topCandidates.map((cand, idx) => {
                  const job = jobMap.get(cand.jobId);
                  return (
                    <div
                      key={cand.id}
                      onClick={() => setActiveCandidate(cand)}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                              : idx === 1
                              ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {cand.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {job?.title || 'Applied Candidate'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span
                          className={`text-xs font-extrabold px-2 py-0.5 rounded-lg ${
                            cand.score >= 80
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                          }`}
                        >
                          {cand.score}%
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                No candidate resumes screened yet.
              </p>
            )}
          </div>

          {/* Recent Candidate Activity Audit Trail */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recent Screening Activity
                </h3>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {activities.slice(0, 6).map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-xs"
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {act.action}
                  </div>
                  {act.jobTitle && (
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5 font-medium">
                      Role: {act.jobTitle}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{act.userName || 'Recruiter'}</span>
                    <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transparent AI Assurance Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-xs">
            <div className="flex items-center space-x-2 text-blue-900 dark:text-blue-200 mb-1.5 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Ethical AI Compliance Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Protected characteristics (age, gender, ethnicity, disability) are strictly masked. All AI scores are relevance assessments and require final human recruiter sign-off.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
