import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  LayoutDashboard,
  Briefcase,
  UploadCloud,
  Award,
  GitCompare,
  FileSpreadsheet,
  ShieldCheck,
  Users,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, candidates, selectedForComparison, jobs } = useApp();

  const shortlistedCount = candidates.filter((c) => c.status === 'shortlisted').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'jobs',
      label: 'Job Openings',
      icon: Briefcase,
      badge: jobs.length > 0 ? jobs.length : null,
    },
    {
      id: 'upload',
      label: 'Upload & Screen',
      icon: UploadCloud,
      badge: 'AI',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
    },
    {
      id: 'candidates',
      label: 'Candidate Ranking',
      icon: Award,
      badge: candidates.length > 0 ? candidates.length : null,
    },
    {
      id: 'comparison',
      label: 'Candidate Compare',
      icon: GitCompare,
      badge: selectedForComparison.length > 0 ? selectedForComparison.length : null,
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    },
    {
      id: 'reports',
      label: 'Reports & Export',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: 'fairness',
      label: 'Fair-AI & Ethics',
      icon: ShieldCheck,
      badge: 'Zero Bias',
      badgeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-4 flex flex-col justify-between hidden md:flex transition-colors">
      <div>
        <div className="mb-4 px-3 py-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-900 dark:text-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Gemini Screening Engine</span>
          </div>
          <p className="text-[11px] text-blue-700/80 dark:text-blue-300/70 mt-0.5">
            Objective skill & experience scoring (0–100)
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Summary Card */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Shortlisted Candidates
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {shortlistedCount} of {candidates.length}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${candidates.length > 0 ? Math.round((shortlistedCount / candidates.length) * 100) : 0}%`,
              }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500 flex-shrink-0" />
            Human approval required
          </p>
        </div>
      </div>
    </aside>
  );
};
