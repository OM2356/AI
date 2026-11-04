import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  GitCompare,
  Trash2,
  Briefcase,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Candidate, Job } from '../firebase.ts';

export const CandidateRankingView: React.FC = () => {
  const {
    candidates,
    jobs,
    selectedJobId,
    setSelectedJobId,
    setActiveCandidate,
    updateCandidateStatus,
    deleteCandidate,
    selectedForComparison,
    toggleComparisonCandidate,
    setCurrentView,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'shortlisted' | 'under_review' | 'pending' | 'rejected'>('all');
  const [scoreTierFilter, setScoreTierFilter] = useState<'all' | 'high' | 'med' | 'low'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const jobMap = new Map<string, Job>(jobs.map((j) => [j.id, j]));

  // Filter candidates
  const filteredCandidates = candidates
    .filter((c) => {
      // Job filter
      if (selectedJobId && selectedJobId !== 'all' && c.jobId !== selectedJobId) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && c.status !== statusFilter) {
        return false;
      }
      // Score tier filter
      if (scoreTierFilter === 'high' && c.score < 80) return false;
      if (scoreTierFilter === 'med' && (c.score < 60 || c.score >= 80)) return false;
      if (scoreTierFilter === 'low' && c.score >= 60) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = c.name.toLowerCase().includes(query);
        const emailMatch = c.email?.toLowerCase().includes(query);
        const skillMatch = c.extractedSkills?.some((s) => s.toLowerCase().includes(query));
        const matchedSkillMatch = c.matchingSkills?.some((s) => s.toLowerCase().includes(query));
        return nameMatch || emailMatch || skillMatch || matchedSkillMatch;
      }
      return true;
    })
    .sort((a, b) => b.score - a.score); // Highest score first

  const handleQuickShortlist = async (candidate: Candidate) => {
    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10B981', '#3B82F6', '#6366F1', '#F59E0B'],
    });

    await updateCandidateStatus(candidate.id, 'shortlisted');
  };

  const getStatusBadge = (status: Candidate['status']) => {
    switch (status) {
      case 'shortlisted':
        return (
          <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Shortlisted
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
            <Clock className="w-3 h-3 mr-1" />
            Under Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Pending Review
          </span>
        );
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return (
        <span className="inline-flex items-center text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
          {score}% High
        </span>
      );
    }
    if (score >= 60) {
      return (
        <span className="inline-flex items-center text-xs font-black px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
          {score}% Med
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs font-black px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
        {score}% Review
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
            <Award className="w-6 h-6 mr-2 text-amber-500" />
            Candidate Ranking & Shortlisting
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Candidates ordered strictly by AI job-relevance matching score (0–100%). Human review required for hiring actions.
          </p>
        </div>

        {/* Comparison floating button if candidates selected */}
        {selectedForComparison.length > 0 && (
          <button
            onClick={() => setCurrentView('comparison')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md animate-pulse cursor-pointer self-start sm:self-auto"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare {selectedForComparison.length} Candidates Side-by-Side</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by candidate name, email, or skill keywords..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Job Filter dropdown */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Job:</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">All Jobs ({jobs.length})</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.company})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="under_review">Under Review</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Score Tier Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Score:</span>
            <select
              value={scoreTierFilter}
              onChange={(e) => setScoreTierFilter(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Scores</option>
              <option value="high">High Match (≥80%)</option>
              <option value="med">Medium Match (60–79%)</option>
              <option value="low">Review Needed (&lt;60%)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-400'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-400'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>
            Ranked {filteredCandidates.length} of {candidates.length} candidate resumes
          </span>
          <span className="text-[11px] text-slate-400 italic">
            Select checkboxes to compare candidates side-by-side
          </span>
        </div>
      </div>

      {/* Candidates List / Table */}
      {filteredCandidates.length > 0 ? (
        viewMode === 'table' ? (
          /* TABLE VIEW */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 pl-4 pr-2 w-12 text-center">Rank</th>
                    <th className="py-3.5 px-3">Candidate</th>
                    <th className="py-3.5 px-3">Target Opening</th>
                    <th className="py-3.5 px-3">Match Score</th>
                    <th className="py-3.5 px-3">Key Matching Skills</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCandidates.map((c, idx) => {
                    const job = jobMap.get(c.jobId);
                    const isCompared = selectedForComparison.includes(c.id);

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Rank */}
                        <td className="py-3 pl-4 pr-2 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs ${
                              idx === 0
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                                : idx === 2
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            #{idx + 1}
                          </span>
                        </td>

                        {/* Candidate */}
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2.5">
                            <input
                              type="checkbox"
                              checked={isCompared}
                              onChange={() => toggleComparisonCandidate(c.id)}
                              title="Select for comparison"
                              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 border-slate-300 dark:border-slate-700 cursor-pointer"
                            />
                            <div>
                              <div
                                onClick={() => setActiveCandidate(c)}
                                className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center space-x-1"
                              >
                                <span>{c.name}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {c.email || c.fileName || 'Resume parsed'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Target Job */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                            {job?.title || 'Unknown Opening'}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                            {job?.company}
                          </div>
                        </td>

                        {/* Match Score */}
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2">
                            {getScoreBadge(c.score)}
                            <div className="text-[10px] text-slate-400 hidden sm:block">
                              Exp: {c.experienceYears || 0}y
                            </div>
                          </div>
                        </td>

                        {/* Matching Skills */}
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {c.matchingSkills && c.matchingSkills.length > 0 ? (
                              c.matchingSkills.slice(0, 3).map((sk) => (
                                <span
                                  key={sk}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                >
                                  {sk}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">None matched</span>
                            )}
                            {c.matchingSkills && c.matchingSkills.length > 3 && (
                              <span className="text-[10px] font-semibold text-slate-400">
                                +{c.matchingSkills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">{getStatusBadge(c.status)}</td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right pr-4">
                          <div className="flex items-center justify-end space-x-1.5">
                            {c.status !== 'shortlisted' && (
                              <button
                                onClick={() => handleQuickShortlist(c)}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer flex items-center space-x-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Shortlist</span>
                              </button>
                            )}

                            <button
                              onClick={() => setActiveCandidate(c)}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors cursor-pointer flex items-center space-x-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Review</span>
                            </button>

                            <button
                              onClick={() => deleteCandidate(c.id)}
                              title="Delete candidate"
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* CARDS VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((c, idx) => {
              const job = jobMap.get(c.jobId);
              const isCompared = selectedForComparison.includes(c.id);

              return (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-xs text-slate-500">#{idx + 1} Rank</span>
                      {getScoreBadge(c.score)}
                    </div>

                    <h3
                      onClick={() => setActiveCandidate(c)}
                      className="text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer"
                    >
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {job?.title} ({job?.company})
                    </p>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 py-1.5 border-y border-slate-100 dark:border-slate-800">
                      <span>Exp: {c.experienceYears || 0} years</span>
                      <span>{getStatusBadge(c.status)}</span>
                    </div>

                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Matched Skills:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {c.matchingSkills && c.matchingSkills.length > 0 ? (
                          c.matchingSkills.slice(0, 4).map((sk) => (
                            <span
                              key={sk}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            >
                              {sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">None</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => toggleComparisonCandidate(c.id)}
                      className={`text-xs font-semibold flex items-center space-x-1 cursor-pointer ${
                        isCompared ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>{isCompared ? 'Compared' : 'Compare'}</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      {c.status !== 'shortlisted' && (
                        <button
                          onClick={() => handleQuickShortlist(c)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        >
                          Shortlist
                        </button>
                      )}
                      <button
                        onClick={() => setActiveCandidate(c)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                      >
                        Profile
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Award className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No candidates matched the current filter
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Adjust search keywords or score filters, or screen new candidate resumes.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setScoreTierFilter('all');
            }}
            className="mt-3 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
