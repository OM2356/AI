import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Send,
  Trash2,
  GitCompare,
  Clock,
  User,
  Phone,
  Mail,
  HelpCircle,
} from 'lucide-react';
import { Candidate } from '../firebase.ts';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  onClose: () => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
}) => {
  const {
    jobs,
    updateCandidateStatus,
    deleteCandidate,
    selectedForComparison,
    toggleComparisonCandidate,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'analysis' | 'rawText'>('analysis');
  const [recruiterNotes, setRecruiterNotes] = useState(candidate?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  if (!candidate) return null;

  const job = jobs.find((j) => j.id === candidate.jobId);
  const bd = candidate.scoreBreakdown;
  const isCompared = selectedForComparison.includes(candidate.id);

  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const handleStatusChange = async (
    newStatus: 'pending' | 'shortlisted' | 'under_review' | 'rejected'
  ) => {
    if (newStatus === 'rejected') {
      setShowRejectConfirm(true);
      return;
    }
    await updateCandidateStatus(candidate.id, newStatus, recruiterNotes);
  };

  const handleConfirmReject = async () => {
    setShowRejectConfirm(false);
    await updateCandidateStatus(candidate.id, 'rejected', recruiterNotes);
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await updateCandidateStatus(candidate.id, candidate.status, recruiterNotes);
    setIsSavingNotes(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-600 dark:text-emerald-400 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
    if (score >= 55) return 'text-amber-600 dark:text-amber-400 border-amber-500 bg-amber-50 dark:bg-amber-950/40';
    return 'text-slate-600 dark:text-slate-400 border-slate-400 bg-slate-50 dark:bg-slate-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden transition-all">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {candidate.name}
                </h2>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    candidate.status === 'shortlisted'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                      : candidate.status === 'under_review'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                      : candidate.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {candidate.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Role: <strong className="text-slate-700 dark:text-slate-300">{job?.title || 'Unknown Position'}</strong> • {job?.company}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleComparisonCandidate(candidate.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                isCompared
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{isCompared ? 'In Compare List' : 'Add to Compare'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-slate-900">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'analysis'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              AI Assessment & Matching Score
            </button>
            <button
              onClick={() => setActiveTab('rawText')}
              className={`py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'rawText'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Extracted Resume Text ({candidate.fileName || 'Document'})
            </button>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            Screened on {new Date(candidate.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'analysis' ? (
            <>
              {/* Contact and Overview bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                {candidate.email && (
                  <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="truncate">{candidate.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span>{candidate.experienceYears || 0} Years Relevant Exp</span>
                </div>
              </div>

              {/* 4-Part Transparent Score Breakdown */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-blue-300 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Algorithmic Match Relevance Score
                    </span>
                    <h3 className="text-xl font-extrabold mt-0.5">
                      Transparent 4-Component Assessment
                    </h3>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-3xl font-black text-white">
                        {candidate.score}
                        <span className="text-lg text-blue-300">/100</span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-300 uppercase">
                        Technical Alignment
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Pillars Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  {/* Pillar 1: Skills Match (40 pts) */}
                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200">
                        1. Skills Match
                      </span>
                      <span className="text-xs font-black text-emerald-400">
                        {bd?.skillsMatchScore ?? 'N/A'} / 40 pts
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mb-2">
                      <div
                        className="bg-emerald-400 h-1.5 rounded-full"
                        style={{ width: `${((bd?.skillsMatchScore || 0) / 40) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {bd?.skillsMatchExplanation || 'Evaluated coverage of required job skills.'}
                    </p>
                  </div>

                  {/* Pillar 2: Experience (30 pts) */}
                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200">
                        2. Experience Alignment
                      </span>
                      <span className="text-xs font-black text-blue-300">
                        {bd?.experienceScore ?? 'N/A'} / 30 pts
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mb-2">
                      <div
                        className="bg-blue-400 h-1.5 rounded-full"
                        style={{ width: `${((bd?.experienceScore || 0) / 30) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {bd?.experienceExplanation || 'Checked against minimum years of experience.'}
                    </p>
                  </div>

                  {/* Pillar 3: Education (15 pts) */}
                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200">
                        3. Education & Credentials
                      </span>
                      <span className="text-xs font-black text-purple-300">
                        {bd?.educationScore ?? 'N/A'} / 15 pts
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mb-2">
                      <div
                        className="bg-purple-400 h-1.5 rounded-full"
                        style={{ width: `${((bd?.educationScore || 0) / 15) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {bd?.educationExplanation || candidate.education || 'Relevant degree credentials.'}
                    </p>
                  </div>

                  {/* Pillar 4: Domain & Projects (15 pts) */}
                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200">
                        4. Projects & Domain Fit
                      </span>
                      <span className="text-xs font-black text-amber-300">
                        {bd?.domainAndProjectScore ?? 'N/A'} / 15 pts
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mb-2">
                      <div
                        className="bg-amber-400 h-1.5 rounded-full"
                        style={{ width: `${((bd?.domainAndProjectScore || 0) / 15) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {bd?.domainExplanation || 'Demonstrated practical project accomplishments.'}
                    </p>
                  </div>
                </div>

                {/* Anti-Bias Assurance Banner */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center space-x-2 text-[10px] text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    Zero-Bias Screening Directive: Age, gender, caste, religion, nationality, and disability were strictly excluded from scoring.
                  </span>
                </div>
              </div>

              {/* Skills Analysis: Matched vs Missing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Matching Skills */}
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                      Matching Job Skills ({candidate.matchingSkills?.length || 0})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.matchingSkills && candidate.matchingSkills.length > 0 ? (
                      candidate.matchingSkills.map((sk) => (
                        <span
                          key={sk}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        >
                          ✓ {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No direct keyword matches</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-600 dark:text-rose-400" />
                      Missing Required Skills ({candidate.missingSkills?.length || 0})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.missingSkills && candidate.missingSkills.length > 0 ? (
                      candidate.missingSkills.map((sk) => (
                        <span
                          key={sk}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                        >
                          ✗ {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                        All mandatory job skills satisfied!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths & Areas for Review */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mr-1.5" />
                    Key Candidate Strengths
                  </h4>
                  <ul className="space-y-1.5">
                    {candidate.strengths && candidate.strengths.length > 0 ? (
                      candidate.strengths.map((str, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2"
                        >
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-400">None identified</li>
                    )}
                  </ul>
                </div>

                {/* Areas for Review / Interview Probes */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
                    Areas Requiring Recruiter Review
                  </h4>
                  <ul className="space-y-1.5">
                    {candidate.areasForReview && candidate.areasForReview.length > 0 ? (
                      candidate.areasForReview.map((rev, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2"
                        >
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{rev}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-400">No flags noted</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* AI Executive Summary */}
              {candidate.summary && (
                <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20">
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider mb-1.5 flex items-center">
                    <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mr-1.5" />
                    AI Executive Summary for Recruiter
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {candidate.summary}
                  </p>
                </div>
              )}

              {/* Recruiter Notes & Actions */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Recruiter Manual Evaluation Notes
                  </label>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {isSavingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={recruiterNotes}
                  onChange={(e) => setRecruiterNotes(e.target.value)}
                  placeholder="Add interview feedback, qualification verification remarks, or special placement recommendations..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>

                {/* Status Decision Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Human Review Action:
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange('shortlisted')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Shortlist for Interview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange('under_review')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Mark Under Review</span>
                    </button>

                    {showRejectConfirm ? (
                      <div className="flex items-center space-x-1.5 p-1 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900">
                        <span className="text-[11px] text-rose-700 dark:text-rose-300 px-1 font-medium">Confirm?</span>
                        <button
                          type="button"
                          onClick={handleConfirmReject}
                          className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer"
                        >
                          Yes, Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRejectConfirm(false)}
                          className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStatusChange('rejected')}
                        className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Tab 2: Raw Extracted Resume Text */
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>
                  Source: <strong>{candidate.fileName || 'Uploaded File'}</strong> • Format: {candidate.fileType?.toUpperCase()}
                </span>
                <span className="text-[11px] text-slate-400">
                  {candidate.rawResumeText?.length || 0} characters
                </span>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed border border-slate-800">
                {candidate.rawResumeText || 'Raw text preview not available.'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
