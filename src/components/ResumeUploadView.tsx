import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  UploadCloud,
  FileText,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Eye,
  Trash2,
  Layers,
  HelpCircle,
  Briefcase,
  Play,
  RotateCcw,
} from 'lucide-react';
import { SAMPLE_RESUMES } from '../data/sampleResumes.ts';
import { Candidate } from '../firebase.ts';

interface UploadQueueItem {
  id: string;
  file?: File;
  sampleResumeId?: string;
  name: string;
  size: number;
  type: string;
  rawText?: string;
  status: 'pending' | 'extracting' | 'analyzing' | 'completed' | 'error';
  progressMsg: string;
  score?: number;
  candidateId?: string;
  error?: string;
}

export const ResumeUploadView: React.FC = () => {
  const {
    jobs,
    selectedJobId,
    setSelectedJobId,
    addCandidate,
    setCurrentView,
    setActiveCandidate,
    showToast,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(Array.from(e.target.files));
    }
  };

  const handleFilesSelected = (files: File[]) => {
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const newItems: UploadQueueItem[] = [];

    files.forEach((file) => {
      const lower = file.name.toLowerCase();
      const isValid = validExtensions.some((ext) => lower.endsWith(ext));

      if (isValid) {
        newItems.push({
          id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          name: file.name,
          size: file.size,
          type: lower.endsWith('.pdf') ? 'pdf' : lower.endsWith('.docx') ? 'docx' : 'other',
          status: 'pending',
          progressMsg: 'Queued for screening',
        });
      } else {
        showToast(`Skipped ${file.name}: Only PDF, DOCX, and TXT files supported.`, 'info');
      }
    });

    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems]);
      showToast(`Added ${newItems.length} resume(s) to screening queue`, 'info');
    }
  };

  // Pre-load sample resumes
  const handleLoadSampleResumes = () => {
    const sampleItems: UploadQueueItem[] = SAMPLE_RESUMES.map((sample) => ({
      id: `sample-q-${sample.id}-${Date.now()}`,
      sampleResumeId: sample.id,
      name: sample.fileName,
      size: sample.text.length,
      type: sample.fileName.endsWith('.pdf') ? 'pdf' : 'docx',
      rawText: sample.text,
      status: 'pending',
      progressMsg: 'Sample candidate loaded',
    }));

    setQueue((prev) => [...prev, ...sampleItems]);
    showToast(`Loaded ${sampleItems.length} candidate resumes for test screening!`, 'success');
  };

  // Helper to extract text from a File object
  const extractTextFromFile = async (file: File): Promise<string> => {
    const lower = file.name.toLowerCase();

    // 1. If text/plain
    if (file.type === 'text/plain' || lower.endsWith('.txt')) {
      return await file.text();
    }

    // 2. Extract binary docs (PDF, DOCX, DOC) via backend extraction endpoint

    // 3. Fallback to server endpoint /api/extract-text
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text && data.text.length > 0) {
          return data.text;
        }
      }
    } catch (err) {
      console.warn('Server extract-text fallback note:', err);
    }

    // 4. Last fallback text attempt
    const fallbackText = await file.text();
    const cleaned = fallbackText.replace(/[^\x20-\x7E\t\r\n]/g, ' ');
    if (cleaned.length > 50) {
      return cleaned;
    }

    throw new Error('Unable to extract readable text. Please ensure file contains valid resume text.');
  };

  // Process single queue item
  const processQueueItem = async (item: UploadQueueItem) => {
    if (!selectedJob) {
      throw new Error('Please select a job opening first.');
    }

    // 1. Text extraction step
    setQueue((prev) =>
      prev.map((q) =>
        q.id === item.id
          ? { ...q, status: 'extracting', progressMsg: 'Extracting resume text...' }
          : q
      )
    );

    let text = item.rawText;
    if (!text && item.file) {
      text = await extractTextFromFile(item.file);
    }

    if (!text || text.trim().length < 40) {
      throw new Error('Extracted text is too brief or unreadable. Check document content.');
    }

    // 2. Call Gemini Analysis endpoint
    setQueue((prev) =>
      prev.map((q) =>
        q.id === item.id
          ? { ...q, status: 'analyzing', progressMsg: 'Gemini AI evaluating match...' }
          : q
      )
    );

    const response = await fetch('/api/analyze-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeText: text,
        fileName: item.name,
        job: {
          title: selectedJob.title,
          company: selectedJob.company,
          description: selectedJob.description,
          requiredSkills: selectedJob.requiredSkills,
          minExperience: selectedJob.minExperience,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server analysis error (${response.status})`);
    }

    const result = await response.json();
    const analysis = result.analysis;

    // 3. Save Candidate record to Firestore & Local state
    const candidateData: Omit<Candidate, 'id' | 'createdAt' | 'createdBy'> = {
      jobId: selectedJob.id,
      name: analysis.candidateName || item.name.replace(/\.[^/.]+$/, ''),
      email: analysis.email,
      phone: analysis.phone,
      fileName: item.name,
      fileType: (item.type as any) || 'pdf',
      education: analysis.education,
      extractedSkills: analysis.extractedSkills || [],
      matchingSkills: analysis.matchingSkills || [],
      missingSkills: analysis.missingSkills || [],
      experienceYears: analysis.experienceYears || 0,
      score: analysis.score,
      scoreBreakdown: analysis.scoreBreakdown,
      strengths: analysis.strengths || [],
      areasForReview: analysis.areasForReview || [],
      summary: analysis.summary || '',
      status: 'pending',
      rawResumeText: text,
    };

    const savedCandidate = await addCandidate(candidateData);

    // 4. Update queue item to completed
    setQueue((prev) =>
      prev.map((q) =>
        q.id === item.id
          ? {
              ...q,
              status: 'completed',
              progressMsg: `Scored: ${analysis.score}%`,
              score: analysis.score,
              candidateId: savedCandidate.id,
            }
          : q
      )
    );

    return savedCandidate;
  };

  // Start Screening Queue
  const handleStartScreening = async () => {
    if (!selectedJob) {
      showToast('Please select a target job opening first', 'error');
      return;
    }

    const pendingItems = queue.filter((item) => item.status === 'pending' || item.status === 'error');
    if (pendingItems.length === 0) {
      showToast('No pending resumes to screen', 'info');
      return;
    }

    setIsProcessing(true);

    for (const item of pendingItems) {
      try {
        await processQueueItem(item);
      } catch (err: any) {
        console.error('Screening error for', item.name, err);
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: 'error',
                  progressMsg: 'Failed to process',
                  error: err.message || 'Unknown processing error',
                }
              : q
          )
        );
      }
    }

    setIsProcessing(false);
    showToast('Screening batch processing complete!', 'success');
  };

  const handleRemoveQueueItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearQueue = () => {
    setQueue([]);
  };

  const completedCount = queue.filter((q) => q.status === 'completed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Multi-Resume Upload & AI Screening
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload candidate resumes in PDF, DOCX, or TXT formats. Gemini AI parses text and scores alignment against the selected job.
        </p>
      </div>

      {/* Target Job Selector Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                Target Job Opening For Screening
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedJob?.title || 'Select a Job'} ({selectedJob?.company})
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} — {job.company}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedJob && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Job Required Skills:
            </span>
            {selectedJob.requiredSkills.map((sk) => (
              <span
                key={sk}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40"
              >
                {sk}
              </span>
            ))}
            <span className="text-xs text-slate-400 pl-2">
              (Min Exp: {selectedJob.minExperience} yrs)
            </span>
          </div>
        )}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer bg-white dark:bg-slate-900 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.005]'
            : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Drop Candidate Resumes Here or Click to Browse
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
          Supports multiple <strong className="text-slate-700 dark:text-slate-300">PDF, DOCX, and TXT</strong> files simultaneously. Fast server-side text parsing with Gemini AI evaluation.
        </p>

        {/* 1-Click Sample Resumes Button */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleLoadSampleResumes();
            }}
            className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-semibold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Load 3 Sample Resumes (ML, Full-Stack, Campus Grad)</span>
          </button>
        </div>
      </div>

      {/* Screening Queue Table */}
      {queue.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Screening Batch Queue ({queue.length} Resumes)
              </h3>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleClearQueue}
                disabled={isProcessing}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Clear Queue
              </button>

              <button
                type="button"
                onClick={handleStartScreening}
                disabled={isProcessing || queue.every((q) => q.status === 'completed')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-2 shadow-sm transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Resumes...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Run AI Screening ({queue.filter((q) => q.status !== 'completed').length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                    {item.type === 'pdf' ? (
                      <FileText className="w-4 h-4 text-rose-500" />
                    ) : item.type === 'docx' ? (
                      <FileCode className="w-4 h-4 text-blue-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {(item.size / 1024).toFixed(1)} KB • Format: {item.type.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Status Indicator */}
                  <div className="text-right">
                    {item.status === 'pending' && (
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Ready
                      </span>
                    )}
                    {item.status === 'extracting' && (
                      <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Extracting Text...
                      </span>
                    )}
                    {item.status === 'analyzing' && (
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        AI Evaluating...
                      </span>
                    )}
                    {item.status === 'completed' && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                          {item.score}% Match
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                    )}
                    {item.status === 'error' && (
                      <span
                        className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center"
                        title={item.error}
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Error
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    {item.candidateId && (
                      <button
                        onClick={() => {
                          setCurrentView('candidates');
                        }}
                        title="View In Ranking"
                        className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    {!isProcessing && (
                      <button
                        onClick={() => handleRemoveQueueItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {completedCount > 0 && (
            <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border-t border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                {completedCount} resume{completedCount !== 1 ? 's' : ''} successfully screened & added to rankings!
              </span>
              <button
                onClick={() => setCurrentView('candidates')}
                className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1 cursor-pointer"
              >
                <span>View Candidate Rankings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
