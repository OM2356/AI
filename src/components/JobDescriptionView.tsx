import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Briefcase,
  Plus,
  Building,
  MapPin,
  Clock,
  Trash2,
  Edit2,
  Users,
  Search,
  Check,
  X,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Job } from '../firebase.ts';

export const JobDescriptionView: React.FC = () => {
  const {
    jobs,
    addJob,
    updateJob,
    deleteJob,
    selectedJobId,
    setSelectedJobId,
    setCurrentView,
    candidates,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [minExperience, setMinExperience] = useState<number>(2);
  const [description, setDescription] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [status, setStatus] = useState<'active' | 'closed' | 'draft'>('active');

  const popularSkillSuggestions = [
    'React',
    'TypeScript',
    'Python',
    'Node.js',
    'PyTorch',
    'Machine Learning',
    'SQL',
    'Docker',
    'AWS',
    'FastAPI',
    'Git',
    'REST APIs',
    'MongoDB',
    'Kubernetes',
    'Java',
  ];

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setTitle('');
    setCompany('Acme Corporation');
    setDepartment('Engineering');
    setLocation('San Francisco, CA (Hybrid)');
    setMinExperience(2);
    setDescription('');
    setSkillsList(['React', 'TypeScript', 'Node.js']);
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setCompany(job.company);
    setDepartment(job.department || '');
    setLocation(job.location || '');
    setMinExperience(job.minExperience || 0);
    setDescription(job.description);
    setSkillsList(job.requiredSkills || []);
    setStatus(job.status || 'active');
    setIsModalOpen(true);
  };

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList((prev) => [...prev, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleKeyDownSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !description.trim()) {
      showToast('Please fill in title, company, and description', 'error');
      return;
    }

    if (skillsList.length === 0) {
      showToast('Please add at least 1 required skill', 'error');
      return;
    }

    try {
      if (editingJob) {
        await updateJob(editingJob.id, {
          title,
          company,
          department,
          location,
          minExperience,
          description,
          requiredSkills: skillsList,
          status,
        });
      } else {
        await addJob({
          title,
          company,
          department,
          location,
          minExperience,
          description,
          requiredSkills: skillsList,
          status,
        });
      }
      setIsModalOpen(false);
    } catch {
      // Error handled in AppContext
    }
  };

  const [jobToDelete, setJobToDelete] = useState<{ id: string; title: string } | null>(null);

  const handleConfirmDelete = async () => {
    if (jobToDelete) {
      await deleteJob(jobToDelete.id);
      setJobToDelete(null);
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.requiredSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Job Openings & Screening Criteria
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure target designations, required skills, and experience criteria used by Gemini AI to score resumes.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center space-x-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Job Opening</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search jobs by title, company, or required skill..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing {filteredJobs.length} of {jobs.length} Job{jobs.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredJobs.map((job) => {
          const jobCandidates = candidates.filter((c) => c.jobId === job.id);
          const isSelected = selectedJobId === job.id;
          const shortlistedCount = jobCandidates.filter((c) => c.status === 'shortlisted').length;
          const avgScore =
            jobCandidates.length > 0
              ? Math.round(jobCandidates.reduce((s, c) => s + c.score, 0) / jobCandidates.length)
              : 0;

          return (
            <div
              key={job.id}
              className={`p-6 rounded-2xl border transition-all bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Status & Company */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center">
                      <Building className="w-3.5 h-3.5 mr-1" />
                      {job.company}
                    </span>
                    {job.department && (
                      <span className="text-[10px] text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-2">
                        {job.department}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        job.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {job.status}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                        Active Screening Target
                      </span>
                    )}
                  </div>
                </div>

                {/* Job Title */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{job.title}</h3>

                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {job.location && (
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {job.location}
                    </span>
                  )}
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Min {job.minExperience} Year{job.minExperience !== 1 ? 's' : ''} Experience
                  </span>
                </div>

                {/* Description snippet */}
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Required Skills tags */}
                <div className="mt-4">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                    Required Screening Skills ({job.requiredSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer with metrics & actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center space-x-1 font-semibold text-slate-700 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>{jobCandidates.length} Screened</span>
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {shortlistedCount} Shortlisted
                  </div>
                  {jobCandidates.length > 0 && (
                    <div className="text-slate-400 text-[11px]">
                      Avg: {avgScore}%
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(job)}
                    title="Edit Opening"
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setJobToDelete({ id: job.id, title: job.title })}
                    title="Delete Opening"
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setCurrentView('upload');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <span>Screen Resumes</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-all">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingJob ? 'Edit Job Opening' : 'Create New Job Opening'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Define criteria and skills for automated AI resume evaluation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Title / Designation *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lead Machine Learning Engineer"
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hiring Company / Department *
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme AI Innovations"
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. R&D / Engineering"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location / Mode
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote / Hybrid"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Min Experience (Years)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={25}
                    value={minExperience}
                    onChange={(e) => setMinExperience(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Skills Tag Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Required Screening Skills * (Type & press Enter or click suggestions)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleKeyDownSkill}
                    placeholder="e.g. React, Python, PostgreSQL..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(skillInput)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Selected skills chips */}
                <div className="flex flex-wrap gap-1.5 mt-2.5 min-h-[30px] p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  {skillsList.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1.5 text-blue-500 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {skillsList.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No skills added yet</span>
                  )}
                </div>

                {/* Suggestions */}
                <div className="mt-2 flex flex-wrap gap-1 items-center">
                  <span className="text-[10px] text-slate-400 font-medium mr-1">Suggestions:</span>
                  {popularSkillSuggestions.slice(0, 8).map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleAddSkill(sug)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 hover:text-blue-700 cursor-pointer transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Job Description & Role Responsibilities *
                </label>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail key responsibilities, qualification standards, technical expectations, and domain requirements..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                ></textarea>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Opening Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active (Accepting & Screening Resumes)</option>
                  <option value="closed">Closed (Screening Complete)</option>
                  <option value="draft">Draft Opening</option>
                </select>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors cursor-pointer"
                >
                  {editingJob ? 'Save Job Updates' : 'Publish Job Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Job Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Delete Job Opening?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">"{jobToDelete.title}"</strong>? Any candidates screened exclusively under this position will also be removed.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setJobToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm cursor-pointer"
              >
                Yes, Delete Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
