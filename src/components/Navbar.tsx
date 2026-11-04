import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Sparkles,
  Sun,
  Moon,
  LogOut,
  UserCheck,
  Briefcase,
  Layers,
  ChevronDown,
  ShieldCheck,
  Building2,
  GraduationCap,
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenNewJob: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenNewJob }) => {
  const {
    adminProfile,
    user,
    isAuthenticated,
    isDarkMode,
    toggleDarkMode,
    logout,
    jobs,
    selectedJobId,
    setSelectedJobId,
    setCurrentView,
  } = useApp();

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'placement_officer':
        return {
          label: 'Placement Officer',
          icon: <GraduationCap className="w-3.5 h-3.5 mr-1" />,
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
        };
      case 'admin':
        return {
          label: 'System Admin',
          icon: <ShieldCheck className="w-3.5 h-3.5 mr-1" />,
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300 dark:border-purple-700',
        };
      default:
        return {
          label: 'HR Recruiter',
          icon: <Building2 className="w-3.5 h-3.5 mr-1" />,
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-700',
        };
    }
  };

  const badge = getRoleBadge(adminProfile?.role);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Brand & Active Job switcher */}
      <div className="flex items-center space-x-3 sm:space-x-6">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center space-x-2.5 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                AI Resume Screener
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-none">
              Fair & Transparent Talent Match
            </p>
          </div>
        </button>

        {/* Target Job Selector Pill */}
        {jobs.length > 0 && (
          <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center">
              <Briefcase className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-blue-400" />
              Screening For:
            </span>
            <div className="relative">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg border border-slate-300/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[240px] truncate"
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.company})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Post Job Quick Button */}
        <button
          onClick={onOpenNewJob}
          className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>New Job Opening</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Account / Profile */}
        {isAuthenticated ? (
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[150px] truncate">
                {adminProfile?.name || user?.displayName || 'Recruiter'}
              </span>
              <div
                className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.2 rounded border ${badge.color}`}
              >
                {badge.icon}
                {badge.label}
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow">
              {(adminProfile?.name || 'R').charAt(0).toUpperCase()}
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Admin Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
