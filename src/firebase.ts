import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

// Critical validation check on boot as per Firestore skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or starting up.');
      return false;
    }
    // Expected for unauthenticated test doc
    return true;
  }
}

// Types
export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  minExperience: number;
  location?: string;
  department?: string;
  status: 'active' | 'closed' | 'draft';
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ScoreBreakdown {
  skillsMatchScore: number;
  skillsMatchExplanation: string;
  experienceScore: number;
  experienceExplanation: string;
  educationScore: number;
  educationExplanation: string;
  domainAndProjectScore: number;
  domainExplanation: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email?: string;
  phone?: string;
  fileName?: string;
  fileType?: 'pdf' | 'docx' | 'other';
  education?: string;
  extractedSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  experienceYears?: number;
  score: number;
  scoreBreakdown?: ScoreBreakdown;
  strengths: string[];
  areasForReview: string[];
  summary?: string;
  status: 'pending' | 'shortlisted' | 'under_review' | 'rejected';
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  rawResumeText?: string;
}

export interface Activity {
  id: string;
  action: string;
  candidateName?: string;
  jobTitle?: string;
  userId: string;
  userName?: string;
  timestamp: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: 'recruiter' | 'placement_officer' | 'admin';
  organization?: string;
  createdAt: string;
}

// Initial default seed jobs for instant readiness
export const DEFAULT_JOBS: Job[] = [
  {
    id: 'job-swe-01',
    title: 'Senior Full-Stack Engineer',
    company: 'CloudScale Technologies',
    department: 'Engineering',
    location: 'San Francisco, CA (Hybrid)',
    minExperience: 4,
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'REST APIs'],
    description:
      'We are looking for a Senior Full-Stack Engineer to architect, build, and maintain high-throughput web applications. The candidate will design scalable microservices in Node.js, create intuitive React/TypeScript frontend interfaces, and collaborate closely with product management and DevOps teams.',
    status: 'active',
    createdBy: 'system',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'job-ds-02',
    title: 'AI / Machine Learning Engineer',
    company: 'DeepVision AI Labs',
    department: 'Data Science',
    location: 'Remote',
    minExperience: 3,
    requiredSkills: ['Python', 'PyTorch', 'Machine Learning', 'NLP', 'TensorFlow', 'Docker', 'FastAPI'],
    description:
      'Join our core AI research and development team. You will train, fine-tune, and deploy transformer-based LLMs and computer vision models. Experience with Python, PyTorch, model optimization, vector databases, and containerization is required.',
    status: 'active',
    createdBy: 'system',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'job-frontend-03',
    title: 'Campus Graduate Software Engineer',
    company: 'NextGen Financial Systems',
    department: 'Software Engineering',
    location: 'New York, NY',
    minExperience: 0,
    requiredSkills: ['JavaScript', 'Python', 'React', 'Data Structures', 'SQL', 'Git'],
    description:
      'University placement opportunity for upcoming and recent computer science graduates. The role offers structured mentorship, rotational engineering projects across frontend, backend, and cloud platforms.',
    status: 'active',
    createdBy: 'system',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const DEFAULT_CANDIDATES: Candidate[] = [
  {
    id: 'cand-seed-01',
    jobId: 'job-ds-02',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@example.edu',
    phone: '+1 (415) 555-0192',
    fileName: 'Ananya_Sharma_ML_Engineer_Resume.pdf',
    fileType: 'pdf',
    education: 'M.S. in Computer Science (Artificial Intelligence), Stanford University',
    extractedSkills: ['Python', 'PyTorch', 'Machine Learning', 'NLP', 'TensorFlow', 'Docker', 'FastAPI', 'C++', 'SQL', 'Hugging Face', 'AWS', 'Kubernetes', 'MLflow'],
    matchingSkills: ['Python', 'PyTorch', 'Machine Learning', 'NLP', 'TensorFlow', 'Docker', 'FastAPI'],
    missingSkills: [],
    experienceYears: 3.5,
    score: 94,
    scoreBreakdown: {
      skillsMatchScore: 40,
      skillsMatchExplanation: 'Satisfied 100% of required AI & ML core skills including PyTorch, NLP, and containerization.',
      experienceScore: 29,
      experienceExplanation: '3.5 years of industry experience meets and exceeds the 3 years minimum specification.',
      educationScore: 15,
      educationExplanation: 'Stanford Master of Science in CS with AI specialization strongly aligns with role.',
      domainAndProjectScore: 15,
      domainExplanation: 'Published production RAG microservices and fine-tuned 7B open-source LLMs.',
    },
    strengths: [
      'Extensive production transformer fine-tuning (LoRA/QLoRA) and low-latency API deployment',
      'Advanced Stanford Master degree with deep learning specialization',
      'Hands-on Kubernetes and AWS GPU orchestration experience',
    ],
    areasForReview: [
      'Probe experience with distributed multi-node model parallel training architectures',
    ],
    summary: 'Outstanding candidate with exceptional technical mastery across PyTorch, NLP, and modern LLM retrieval pipelines. Strong recommendation for immediate technical interview.',
    status: 'shortlisted',
    notes: 'Exceptional background in NLP and low-latency inference. Approved for round 1 tech interview.',
    createdBy: 'system',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'cand-seed-02',
    jobId: 'job-swe-01',
    name: 'David Miller',
    email: 'david.miller@devmail.io',
    phone: '+1 (212) 555-0144',
    fileName: 'David_Miller_FullStack_Resume.docx',
    fileType: 'docx',
    education: 'B.S. in Computer Science, Columbia University',
    extractedSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'REST APIs', 'Next.js', 'GraphQL', 'Redis', 'Jest', 'Cypress', 'CI/CD'],
    matchingSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'REST APIs'],
    missingSkills: [],
    experienceYears: 5,
    score: 88,
    scoreBreakdown: {
      skillsMatchScore: 38,
      skillsMatchExplanation: 'Matches all 7 required core stack technologies with strong TypeScript and React mastery.',
      experienceScore: 30,
      experienceExplanation: '5 years of professional engineering tenure comfortably surpasses 4 years minimum.',
      educationScore: 13,
      educationExplanation: 'Accredited Computer Science degree from Columbia University.',
      domainAndProjectScore: 14,
      domainExplanation: 'Built $40M daily volume trading portal and led architectural code reviews.',
    },
    strengths: [
      '5+ years full-stack architecture tenure spanning frontend, backend microservices, and databases',
      'Proven leadership mentoring junior and mid-level engineering peers',
      'Strong automated test coverage culture (Jest and Cypress)',
    ],
    areasForReview: [
      'Evaluate familiarity with event-driven message brokers (Kafka/RabbitMQ) for real-time scale',
    ],
    summary: 'Senior full-stack developer with well-balanced frontend and backend capabilities. Highly recommended for team lead or senior contributor position.',
    status: 'shortlisted',
    notes: 'Superb architecture experience and leadership track record. Shortlisted for technical round.',
    createdBy: 'system',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'cand-seed-03',
    jobId: 'job-frontend-03',
    name: 'Priya Patel',
    email: 'priya.patel@alumni.edu',
    phone: '+1 (312) 555-0188',
    fileName: 'Priya_Patel_Campus_Graduate_Resume.pdf',
    fileType: 'pdf',
    education: 'B.S. in Computer Science, University of Illinois Urbana-Champaign (UIUC)',
    extractedSkills: ['JavaScript', 'Python', 'React', 'Data Structures', 'SQL', 'Git', 'Node.js', 'Tailwind CSS', 'Java', 'HTML5', 'CSS3'],
    matchingSkills: ['JavaScript', 'Python', 'React', 'Data Structures', 'SQL', 'Git'],
    missingSkills: [],
    experienceYears: 0.5,
    score: 78,
    scoreBreakdown: {
      skillsMatchScore: 34,
      skillsMatchExplanation: 'Solid theoretical and practical grasp of all entry-level required competencies.',
      experienceScore: 24,
      experienceExplanation: 'Summer internship experience matches campus graduate requirements (0 years min).',
      educationScore: 14,
      educationExplanation: 'UIUC B.S. in CS with high GPA (3.84/4.0) and ACM student chapter leadership.',
      domainAndProjectScore: 12,
      domainExplanation: 'Built CampusPlacementHub and interactive algorithm visualizer.',
    },
    strengths: [
      'High GPA (3.84) and Dean\'s Honor List student from top CS program',
      'Completed practical frontend engineering internship with React and Tailwind CSS',
      'Active student chapter leadership and open-source hobby projects',
    ],
    areasForReview: [
      'Probe hands-on experience debugging asynchronous state in high-complexity single-page apps',
    ],
    summary: 'High-potential campus graduate with excellent academic foundations, leadership, and clean frontend project execution. Ideal candidate for the campus graduate cohort.',
    status: 'under_review',
    notes: 'Very strong university record. Reviewing project portfolio before scheduling interview.',
    createdBy: 'system',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];
