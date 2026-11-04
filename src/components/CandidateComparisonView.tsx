import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  GitCompare,
  CheckCircle2,
  XCircle,
  Award,
  Briefcase,
  GraduationCap,
  Sparkles,
  HelpCircle,
  ArrowLeft,
  X,
  Plus,
} from 'lucide-react';
import { Candidate, Job } from '../firebase.ts';

export const CandidateComparisonView: React.FC = () => {
  const {
    candidates,
    jobs,
    selectedForComparison,
    toggleComparisonCandidate,
    clearComparison,
    updateCandidateStatus,
    setCurrentView,
    setActiveCandidate,
  } = useApp();

  const comparedCandidates = candidates.filter((c) =>
    selectedForComparison.includes(c.id)
  );

  const jobMap = new Map<string, Job>(jobs.map((j) => [j.id, j]));

  // Get common target job if any, or aggregate required skills
  const primaryJobId = comparedCandidates[0]?.jobId;
  const primaryJob = jobMap.get(primaryJobId) || jobs[0];
  const requiredSkills = primaryJob?.requiredSkills || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => setCurrentView('candidates')}
            className="inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Candidate Ranking
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
            <GitCompare className="w-6 h-6 mr-2 text-indigo-500" />
            Side-by-Side Candidate Comparison Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare skills, experience, and transparent AI matching breakdowns side-by-side against job criteria.
          </p>
        </div>

        {comparedCandidates.length > 0 && (
          <button
            onClick={clearComparison}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
          >
            Clear Selection ({comparedCandidates.length})
          </button>
        )}
      </div>

      {comparedCandidates.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <GitCompare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No candidates selected for comparison
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            Go to the Candidate Ranking view and check the comparison box next to 2 or 3 candidates to evaluate them side-by-side.
          </p>
          <button
            onClick={() => setCurrentView('candidates')}
            className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Go to Candidate Rankings
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              {/* Table Header: Candidate Summary Cards */}
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 w-48 text-slate-400 font-bold uppercase tracking-wider text-[11px] align-top">
                    Evaluation Metric
                  </th>
                  {comparedCandidates.map((c) => {
                    const job = jobMap.get(c.jobId);
                    return (
                      <th
                        key={c.id}
                        className="p-4 min-w-[260px] align-top border-l border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3
                              onClick={() => setActiveCandidate(c)}
                              className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer"
                            >
                              {c.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {job?.title} ({job?.company})
                            </p>
                          </div>
                          <button
                            onClick={() => toggleComparisonCandidate(c.id)}
                            title="Remove from comparison"
                            className="text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Overall Score Banner */}
                        <div className="mt-3 p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-300">
                            Overall Match
                          </span>
                          <span
                            className={`text-base font-black ${
                              c.score >= 80 ? 'text-emerald-400' : c.score >= 60 ? 'text-amber-400' : 'text-slate-300'
                            }`}
                          >
                            {c.score}%
                          </span>
                        </div>

                        {/* Status & Shortlist Button */}
                        <div className="mt-2.5 flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              c.status === 'shortlisted'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {c.status.toUpperCase()}
                          </span>

                          {c.status !== 'shortlisted' ? (
                            <button
                              onClick={() => updateCandidateStatus(c.id, 'shortlisted')}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            >
                              Shortlist
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-bold flex items-center">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Shortlisted
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                  {comparedCandidates.length < 3 && (
                    <th className="p-4 min-w-[200px] border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center align-middle">
                      <button
                        onClick={() => setCurrentView('candidates')}
                        className="inline-flex flex-col items-center text-xs font-semibold text-slate-500 hover:text-blue-600 cursor-pointer p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400"
                      >
                        <Plus className="w-5 h-5 mb-1" />
                        <span>Add Another Candidate</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">(Up to 3)</span>
                      </button>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* 1. Transparent 4-Pillar Score Breakdown */}
                <tr className="bg-slate-50/30 dark:bg-slate-800/20">
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                    Score Breakdown (100)
                  </td>
                  {comparedCandidates.map((c) => {
                    const bd = c.scoreBreakdown;
                    return (
                      <td
                        key={c.id}
                        className="p-4 border-l border-slate-200 dark:border-slate-800 space-y-1.5"
                      >
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Skills (40):</span>
                          <strong className="text-emerald-600">{bd?.skillsMatchScore ?? 'N/A'}</strong>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Experience (30):</span>
                          <strong className="text-blue-600">{bd?.experienceScore ?? 'N/A'}</strong>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Education (15):</span>
                          <strong className="text-purple-600">{bd?.educationScore ?? 'N/A'}</strong>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Domain & Proj (15):</span>
                          <strong className="text-amber-600">{bd?.domainAndProjectScore ?? 'N/A'}</strong>
                        </div>
                      </td>
                    );
                  })}
                  {comparedCandidates.length < 3 && (
                    <td className="border-l border-slate-200 dark:border-slate-800"></td>
                  )}
                </tr>

                {/* 2. Required Skills Coverage Matrix */}
                <tr>
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300 align-top">
                    <div>Required Skills Match Matrix</div>
                    <span className="text-[10px] font-normal text-slate-400">
                      Based on target job specifications
                    </span>
                  </td>
                  {comparedCandidates.map((c) => {
                    const matched = new Set((c.matchingSkills || []).map((s) => s.toLowerCase()));
                    return (
                      <td
                        key={c.id}
                        className="p-4 border-l border-slate-200 dark:border-slate-800 space-y-1.5 align-top"
                      >
                        {requiredSkills.map((reqSkill) => {
                          const hasSkill = matched.has(reqSkill.toLowerCase());
                          return (
                            <div
                              key={reqSkill}
                              className="flex items-center justify-between text-xs py-0.5"
                            >
                              <span className="text-slate-700 dark:text-slate-300 font-medium">
                                {reqSkill}
                              </span>
                              {hasSkill ? (
                                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" />
                                  Match
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[10px] font-bold text-rose-500">
                                  <XCircle className="w-3.5 h-3.5 mr-0.5" />
                                  Missing
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                  {comparedCandidates.length < 3 && (
                    <td className="border-l border-slate-200 dark:border-slate-800"></td>
                  )}
                </tr>

                {/* 3. Work Experience */}
                <tr className="bg-slate-50/30 dark:bg-slate-800/20">
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300 align-top">
                    Experience & Background
                  </td>
                  {comparedCandidates.map((c) => (
                    <td
                      key={c.id}
                      className="p-4 border-l border-slate-200 dark:border-slate-800 align-top"
                    >
                      <div className="font-bold text-slate-900 dark:text-white">
                        {c.experienceYears || 0} Years Relevant Experience
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {c.scoreBreakdown?.experienceExplanation || 'Professional experience aligned with requirements.'}
                      </p>
                    </td>
                  ))}
                  {comparedCandidates.length < 3 && (
                    <td className="border-l border-slate-200 dark:border-slate-800"></td>
                  )}
                </tr>

                {/* 4. Education & Qualifications */}
                <tr>
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300 align-top">
                    Education
                  </td>
                  {comparedCandidates.map((c) => (
                    <td
                      key={c.id}
                      className="p-4 border-l border-slate-200 dark:border-slate-800 align-top"
                    >
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {c.education || 'Degree qualification on file'}
                      </div>
                    </td>
                  ))}
                  {comparedCandidates.length < 3 && (
                    <td className="border-l border-slate-200 dark:border-slate-800"></td>
                  )}
                </tr>

                {/* 5. Key Strengths */}
                <tr className="bg-slate-50/30 dark:bg-slate-800/20">
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300 align-top">
                    Candidate Strengths
                  </td>
                  {comparedCandidates.map((c) => (
                    <td
                      key={c.id}
                      className="p-4 border-l border-slate-200 dark:border-slate-800 align-top"
                    >
                      <ul className="space-y-1">
                        {(c.strengths || []).map((str, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start space-x-1"
                          >
                            <span className="text-blue-500 font-bold">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                  {comparedCandidates.length < 3 && (
                    <td className="border-l border-slate-200 dark:border-slate-800"></td>
                  )}
                </tr>

                {/* 6. Areas For Review */}
                <tr>
                  <td className="p-4 font-bold text-amber-700 dark:text-amber-400 align-top">
                    Areas for Recruiter Review
                  </td>
                  {comparedCandidates.map((c) => (
                    <td
                      key={c.id}
                      className="p-4 border-l border-slate-200 dark:border-slate-800 align-top"
                    >
                      <ul className="space-y-1">
                        {(c.areasForReview || []).map((rev, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start space-x-1"
                          >
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{rev}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                  {comparedCandidates.length < 3 && (
                    <td className="border-l border-slate-200 dark:border-slate-800"></td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
