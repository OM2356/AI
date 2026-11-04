import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Toast } from './components/Toast.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { CandidateDetailModal } from './components/CandidateDetailModal.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { JobDescriptionView } from './components/JobDescriptionView.tsx';
import { ResumeUploadView } from './components/ResumeUploadView.tsx';
import { CandidateRankingView } from './components/CandidateRankingView.tsx';
import { CandidateComparisonView } from './components/CandidateComparisonView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { FairnessView } from './components/FairnessView.tsx';
import {
  LayoutDashboard,
  Briefcase,
  UploadCloud,
  Award,
  GitCompare,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView, activeCandidate, setActiveCandidate, candidates } = useApp();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenNewJob = () => {
    setCurrentView('jobs');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onOpenNewJob={handleOpenNewJob} />;
      case 'jobs':
        return <JobDescriptionView />;
      case 'upload':
        return <ResumeUploadView />;
      case 'candidates':
        return <CandidateRankingView />;
      case 'comparison':
        return <CandidateComparisonView />;
      case 'reports':
        return <ReportsView />;
      case 'fairness':
        return <FairnessView />;
      default:
        return <DashboardView onOpenNewJob={handleOpenNewJob} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenNewJob={handleOpenNewJob}
      />

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden sticky bottom-0 z-30 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2 py-2 flex items-center justify-around">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold cursor-pointer ${
            currentView === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentView('jobs')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold cursor-pointer ${
            currentView === 'jobs' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
          }`}
        >
          <Briefcase className="w-4 h-4 mb-0.5" />
          <span>Jobs</span>
        </button>

        <button
          onClick={() => setCurrentView('upload')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold cursor-pointer ${
            currentView === 'upload' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
          }`}
        >
          <UploadCloud className="w-4 h-4 mb-0.5" />
          <span>Upload</span>
        </button>

        <button
          onClick={() => setCurrentView('candidates')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold cursor-pointer ${
            currentView === 'candidates' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
          }`}
        >
          <Award className="w-4 h-4 mb-0.5" />
          <span>Rankings</span>
        </button>

        <button
          onClick={() => setCurrentView('reports')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold cursor-pointer ${
            currentView === 'reports' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 mb-0.5" />
          <span>Reports</span>
        </button>
      </nav>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Candidate Profile Detail Drawer/Modal */}
      <CandidateDetailModal
        candidate={activeCandidate}
        onClose={() => setActiveCandidate(null)}
      />

      {/* Floating Toast */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
