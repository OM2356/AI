import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  HeartHandshake,
  FileCheck,
  Eye,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const FairnessView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2 border border-emerald-300 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Fair & Ethical Recruitment Charter</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          AI Ethics, Transparency & Anti-Bias Framework
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          How our AI Resume Screening System safeguards fairness, algorithmic transparency, and institutional compliance.
        </p>
      </div>

      {/* 3 Core Tenets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            1. Strict Non-Discrimination
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            Protected characteristics such as age, gender, race, caste, religion, nationality, and disability are strictly prohibited from scoring algorithms.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            2. 100% Transparent Scoring
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            Every score between 0 and 100 is decomposed into 4 visible components with plain-English rationales for full audibility.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            3. Mandatory Human Review
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            AI scores act as candidate sorting assistants, not automated decision-makers. Shortlisting and rejection require human recruiter sign-off.
          </p>
        </div>
      </div>

      {/* 4-Pillar Scoring Breakdown Explained */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Algorithmic Scoring Formula (0 to 100 Points)
        </h3>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Pillar 1: Skills Match & Technical Alignment (Max 40 Points)
              </span>
              <span className="text-xs font-black text-emerald-600">40% Weight</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Calculates the ratio and demonstrated proficiency of mandatory and complementary skills specified in the job criteria that are explicitly verified in the resume text.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Pillar 2: Relevant Experience & Tenured Roles (Max 30 Points)
              </span>
              <span className="text-xs font-black text-blue-600">30% Weight</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Compares total years of verifiable industry, internship, or research experience against the minimum required experience threshold.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Pillar 3: Educational Qualifications & Degrees (Max 15 Points)
              </span>
              <span className="text-xs font-black text-purple-600">15% Weight</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Evaluates academic degree level (B.Tech, M.S., Ph.D., B.S.), relevant disciplines (Computer Science, Data Science, Electrical), and formal coursework.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Pillar 4: Hands-on Projects & Domain Specialization (Max 15 Points)
              </span>
              <span className="text-xs font-black text-amber-600">15% Weight</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Validates real-world application through open-source contributions, capstone engineering projects, certifications, and technical accomplishments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
