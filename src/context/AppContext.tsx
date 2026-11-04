import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  auth,
  db,
  googleProvider,
  testConnection,
  handleFirestoreError,
  OperationType,
  Job,
  Candidate,
  Activity,
  AdminProfile,
  DEFAULT_JOBS,
  DEFAULT_CANDIDATES,
} from '../firebase.ts';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';

interface AppContextType {
  user: User | null;
  adminProfile: AdminProfile | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedJobId: string;
  setSelectedJobId: (id: string) => void;
  
  // Data
  jobs: Job[];
  candidates: Candidate[];
  activities: Activity[];
  
  // Job actions
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'createdBy'>) => Promise<Job>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  
  // Candidate actions
  addCandidate: (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'createdBy'>) => Promise<Candidate>;
  updateCandidateStatus: (
    candidateId: string,
    status: 'pending' | 'shortlisted' | 'under_review' | 'rejected',
    notes?: string
  ) => Promise<void>;
  deleteCandidate: (candidateId: string) => Promise<void>;
  
  // Analysis Modal & Comparison
  activeCandidate: Candidate | null;
  setActiveCandidate: (candidate: Candidate | null) => void;
  selectedForComparison: string[];
  toggleComparisonCandidate: (candidateId: string) => void;
  clearComparison: () => void;
  
  // Auth methods
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role: AdminProfile['role'], org: string) => Promise<void>;
  loginAsDemo: (role?: 'recruiter' | 'placement_officer' | 'admin') => void;
  logout: () => Promise<void>;
  
  // Audit log
  logActivity: (action: string, candidateName?: string, jobTitle?: string) => Promise<void>;
  
  // Notification toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_JOBS_KEY = 'ai_resume_screening_jobs_v1';
const LOCAL_STORAGE_CANDIDATES_KEY = 'ai_resume_screening_candidates_v1';
const LOCAL_STORAGE_ACTIVITIES_KEY = 'ai_resume_screening_activities_v1';
const LOCAL_STORAGE_ADMIN_KEY = 'ai_resume_screening_admin_profile_v1';
const LOCAL_STORAGE_THEME_KEY = 'ai_resume_screening_darkmode_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ADMIN_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Navigation
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string>('job-swe-01');

  // Comparison & Modal
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_JOBS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading jobs from localStorage:', e);
    }
    return DEFAULT_JOBS;
  });

  // Candidates state
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CANDIDATES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading candidates from localStorage:', e);
    }
    return DEFAULT_CANDIDATES;
  });

  // Activities state
  const [activities, setActivities] = useState<Activity[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ACTIVITIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading activities from localStorage:', e);
    }
    return [
      {
        id: 'act-init-1',
        action: 'System initialized with standard institutional placement criteria',
        jobTitle: 'Senior Full-Stack Engineer',
        userId: 'system',
        userName: 'Recruitment System',
        timestamp: new Date().toISOString(),
      },
    ];
  });

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_JOBS_KEY, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CANDIDATES_KEY, JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ACTIVITIES_KEY, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    if (adminProfile) {
      localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(adminProfile));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_ADMIN_KEY);
    }
  }, [adminProfile]);

  // Boot connection check & Auth listener
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
          if (adminDoc.exists()) {
            setAdminProfile(adminDoc.data() as AdminProfile);
          } else {
            // Create default profile for authenticated user
            const newProfile: AdminProfile = {
              id: currentUser.uid,
              email: currentUser.email || 'recruiter@institution.edu',
              name: currentUser.displayName || 'Authorized Recruiter',
              role: 'recruiter',
              organization: 'Campus Placement Office & Talent Acquisition',
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'admins', currentUser.uid), newProfile);
            setAdminProfile(newProfile);
          }
          // Fetch remote jobs & candidates if possible
          fetchRemoteData(currentUser.uid);
        } catch (err) {
          console.warn('Firebase admin profile check note:', err);
          if (!adminProfile) {
            setAdminProfile({
              id: currentUser.uid,
              email: currentUser.email || 'recruiter@institution.edu',
              name: currentUser.displayName || 'Authorized Recruiter',
              role: 'recruiter',
              organization: 'Talent Acquisition',
              createdAt: new Date().toISOString(),
            });
          }
        }
      } else {
        // If no firebase user and no demo admin profile, stay null
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchRemoteData = async (userId: string) => {
    try {
      const jobsSnap = await getDocs(collection(db, 'jobs'));
      if (!jobsSnap.empty) {
        const loadedJobs: Job[] = [];
        jobsSnap.forEach((d) => loadedJobs.push(d.data() as Job));
        setJobs(loadedJobs);
      }

      const candSnap = await getDocs(collection(db, 'candidates'));
      if (!candSnap.empty) {
        const loadedCands: Candidate[] = [];
        candSnap.forEach((d) => loadedCands.push(d.data() as Candidate));
        setCandidates(loadedCands);
      }
    } catch (err) {
      console.warn('Remote sync falling back to local database store:', err);
    }
  };

  // Auth Methods
  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      showToast(`Welcome back, ${res.user.displayName || 'Recruiter'}!`, 'success');
    } catch (err: any) {
      console.error('Google sign in error:', err);
      showToast(err.message || 'Failed to sign in with Google', 'error');
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      showToast('Successfully logged in!', 'success');
    } catch (err: any) {
      console.error('Email sign in error:', err);
      showToast(err.message || 'Invalid email or password', 'error');
      throw err;
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    name: string,
    role: AdminProfile['role'],
    org: string
  ) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: AdminProfile = {
        id: res.user.uid,
        email,
        name,
        role,
        organization: org,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'admins', res.user.uid), newProfile);
      setAdminProfile(newProfile);
      showToast('Account registered successfully!', 'success');
    } catch (err: any) {
      console.error('Registration error:', err);
      showToast(err.message || 'Failed to register account', 'error');
      throw err;
    }
  };

  const loginAsDemo = (role: 'recruiter' | 'placement_officer' | 'admin' = 'recruiter') => {
    const demoProfiles: Record<string, AdminProfile> = {
      recruiter: {
        id: 'demo-recruiter-01',
        email: 'sarah.jenkins@techrecruiting.com',
        name: 'Sarah Jenkins',
        role: 'recruiter',
        organization: 'Apex Talent Acquisition',
        createdAt: new Date().toISOString(),
      },
      placement_officer: {
        id: 'demo-placement-02',
        email: 'placement.head@university.edu',
        name: 'Prof. Rajesh Sharma',
        role: 'placement_officer',
        organization: 'University Career & Placement Cell',
        createdAt: new Date().toISOString(),
      },
      admin: {
        id: 'demo-admin-03',
        email: 'omkarsathe3103@gmail.com',
        name: 'Omkar Sathe (Admin)',
        role: 'admin',
        organization: 'AI Screening System HQ',
        createdAt: new Date().toISOString(),
      },
    };

    const selected = demoProfiles[role] || demoProfiles.recruiter;
    setAdminProfile(selected);
    showToast(`Logged in as Demo ${selected.name} (${selected.organization})`, 'success');
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setAdminProfile(null);
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  // Activity audit logger
  const logActivity = async (action: string, candidateName?: string, jobTitle?: string) => {
    const activityId = `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const currentUid = user?.uid || adminProfile?.id || 'demo-recruiter-01';
    const currentName = user?.displayName || adminProfile?.name || 'Recruitment Officer';

    const newAct: Activity = {
      id: activityId,
      action,
      candidateName,
      jobTitle,
      userId: currentUid,
      userName: currentName,
      timestamp: new Date().toISOString(),
    };

    setActivities((prev) => [newAct, ...prev.slice(0, 49)]);

    try {
      await setDoc(doc(db, 'activities', activityId), newAct);
    } catch (err) {
      // Local fallback already saved
    }
  };

  // Job Operations
  const addJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'createdBy'>): Promise<Job> => {
    const currentUid = user?.uid || adminProfile?.id || 'demo-recruiter-01';
    const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newJob: Job = {
      ...jobData,
      id: jobId,
      createdBy: currentUid,
      createdAt: new Date().toISOString(),
    };

    setJobs((prev) => [newJob, ...prev]);
    setSelectedJobId(newJob.id);

    try {
      await setDoc(doc(db, 'jobs', jobId), newJob);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `jobs/${jobId}`);
    }

    await logActivity(`Created new job opening: "${newJob.title}" at ${newJob.company}`, undefined, newJob.title);
    showToast(`Job opening "${newJob.title}" created!`, 'success');
    return newJob;
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...updates, updatedAt: new Date().toISOString() } : j))
    );

    try {
      await updateDoc(doc(db, 'jobs', id), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `jobs/${id}`);
    }

    await logActivity(`Updated job opening details`, undefined, updates.title);
    showToast('Job details updated successfully', 'success');
  };

  const deleteJob = async (id: string) => {
    const jobToDelete = jobs.find((j) => j.id === id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
    // Also remove associated candidates
    setCandidates((prev) => prev.filter((c) => c.jobId !== id));

    try {
      await deleteDoc(doc(db, 'jobs', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `jobs/${id}`);
    }

    await logActivity(`Deleted job opening: "${jobToDelete?.title || id}"`);
    showToast('Job opening removed', 'info');
  };

  // Candidate Operations
  const addCandidate = async (
    candidateData: Omit<Candidate, 'id' | 'createdAt' | 'createdBy'>
  ): Promise<Candidate> => {
    const currentUid = user?.uid || adminProfile?.id || 'demo-recruiter-01';
    const candidateId = `cand-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newCandidate: Candidate = {
      ...candidateData,
      id: candidateId,
      createdBy: currentUid,
      createdAt: new Date().toISOString(),
    };

    setCandidates((prev) => [newCandidate, ...prev]);

    try {
      await setDoc(doc(db, 'candidates', candidateId), newCandidate);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `candidates/${candidateId}`);
    }

    const matchedJob = jobs.find((j) => j.id === newCandidate.jobId);
    await logActivity(
      `Analyzed resume of ${newCandidate.name} (Match Score: ${newCandidate.score}%)`,
      newCandidate.name,
      matchedJob?.title
    );

    return newCandidate;
  };

  const updateCandidateStatus = async (
    candidateId: string,
    status: 'pending' | 'shortlisted' | 'under_review' | 'rejected',
    notes?: string
  ) => {
    const target = candidates.find((c) => c.id === candidateId);
    if (!target) return;

    const updates: Partial<Candidate> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (notes !== undefined) {
      updates.notes = notes;
    }

    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, ...updates } : c))
    );

    if (activeCandidate?.id === candidateId) {
      setActiveCandidate((prev) => (prev ? { ...prev, ...updates } : null));
    }

    try {
      await updateDoc(doc(db, 'candidates', candidateId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `candidates/${candidateId}`);
    }

    const statusLabels: Record<string, string> = {
      shortlisted: 'Shortlisted candidate',
      under_review: 'Marked under review',
      rejected: 'Marked as rejected',
      pending: 'Reset status to pending review',
    };

    await logActivity(
      `${statusLabels[status] || 'Updated status'}: ${target.name}`,
      target.name
    );

    showToast(`${target.name} status updated to ${status.replace('_', ' ').toUpperCase()}`, 'success');
  };

  const deleteCandidate = async (candidateId: string) => {
    const target = candidates.find((c) => c.id === candidateId);
    setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
    setSelectedForComparison((prev) => prev.filter((id) => id !== candidateId));
    if (activeCandidate?.id === candidateId) setActiveCandidate(null);

    try {
      await deleteDoc(doc(db, 'candidates', candidateId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `candidates/${candidateId}`);
    }

    await logActivity(`Deleted candidate record: ${target?.name || candidateId}`, target?.name);
    showToast('Candidate record removed', 'info');
  };

  // Comparison management
  const toggleComparisonCandidate = (candidateId: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter((id) => id !== candidateId);
      }
      if (prev.length >= 3) {
        showToast('Maximum 3 candidates can be compared side-by-side', 'info');
        return prev;
      }
      return [...prev, candidateId];
    });
  };

  const clearComparison = () => setSelectedForComparison([]);

  const isAuthenticated = !!user || !!adminProfile;

  return (
    <AppContext.Provider
      value={{
        user,
        adminProfile,
        isAuthenticated,
        isLoadingAuth,
        isDarkMode,
        toggleDarkMode,
        currentView,
        setCurrentView,
        selectedJobId,
        setSelectedJobId,
        jobs,
        candidates,
        activities,
        addJob,
        updateJob,
        deleteJob,
        addCandidate,
        updateCandidateStatus,
        deleteCandidate,
        activeCandidate,
        setActiveCandidate,
        selectedForComparison,
        toggleComparisonCandidate,
        clearComparison,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsDemo,
        logout,
        logActivity,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
