# AI Resume Screening System

An institutional, enterprise-grade AI-powered recruitment and candidate screening platform built with **React**, **Node.js/Express**, **Google Gemini AI**, and **Firebase Firestore & Authentication**.

Designed specifically for **Corporate HR Recruiters**, **Talent Acquisition Teams**, and **University Campus Placement Cells** to parse multi-format candidate resumes (PDF, DOCX, TXT), objectively match candidates against specific job opening requirements, calculate transparent multi-pillar relevance scores (0–100%), and maintain human-in-the-loop hiring decisions.

---

## 🚀 Key Features by Module

### Module 1: Admin Authentication & RBAC
- **Multi-Role Support**: Corporate HR Recruiter, University Placement Officer, and System Administrator.
- **Firebase Authentication**: Integrated Google Sign-In, Email/Password authentication, and session persistence.
- **1-Click Quick Demo Switching**: Instant test evaluation without manual account creation.
- **Strict Role-Based Access Control**: ABAC-enforced Firestore security rules with default-deny policies.

### Module 2: Recruitment Analytics Dashboard
- **Executive Metrics**: Total screened resumes, shortlisted candidates, conversion rate %, and pool average score.
- **Score Distribution Analytics**: Tiered breakdown (High Match $\ge$80%, Medium Match 60–79%, Review Needed <60%).
- **Opening Pipelines**: Candidate volume, average match scores, and interview shortlist rates across all jobs.
- **Recent Activity Audit Trail**: Append-only log recording every upload, status change, and job creation event.

### Module 3: Job Openings & Screening Criteria
- Manage job openings with titles, hiring companies, departments, locations, and descriptions.
- Dynamic required skill tag inputs with interactive suggestions.
- Configurable minimum professional experience thresholds.
- Active screening target selector with 1-click candidate filtering.

### Module 4: Multi-Format Resume Upload & Extraction
- Drag-and-drop batch upload supporting **PDF**, **DOCX**, and **TXT** files.
- Server-side multi-part streaming buffer parsing with `pdf-parse` and `mammoth`.
- Pre-loaded sample candidate resumes (ML Engineer, Senior Full-Stack, Campus Graduate) for immediate zero-friction evaluation.
- Live progress indicator tracking parsing, AI scoring, and database persistence.

### Module 5: Gemini AI Resume Assessment & Transparent Scoring
- **100% Server-Side API Security**: Gemini API keys are never exposed to client browsers.
- **4-Pillar Algorithmic Scoring**:
  1. **Skills Match (0–40 pts)**: Coverage and proficiency of required job competencies.
  2. **Experience Alignment (0–30 pts)**: Verified career tenure compared to minimum requirements.
  3. **Education & Qualifications (0–15 pts)**: Relevant degree fields, universities, and certifications.
  4. **Domain & Projects (0–15 pts)**: Practical project work, open-source impact, and tech stack alignment.
- **Resilient AI Pipeline**: Multi-model fallback (`gemini-3.8-flash` $\to$ `gemini-3.1-flash-lite` $\to$ institutional heuristic parser) to guarantee 100% uptime during upstream demand spikes.

### Module 6: Candidate Ranking & Side-by-Side Comparison
- Descending score leaderboard (#1, #2, #3, ...) highlighting top talent first.
- Real-time search by candidate name, email, or skill keywords.
- Multi-tier filtering by job opening, review status, and score ranges.
- **Celebratory Shortlisting**: Immediate visual feedback with confetti animations.
- **Side-by-Side Comparison Matrix**: Compare up to 3 candidates concurrently with a cross-functional skill matrix, experience alignment, strengths, and interview probes.

### Module 7: Reports & Data Export
- **One-Click CSV Export**: Download structured candidate datasets for spreadsheet analysis or ATS integration.
- **Institutional PDF Placement Reports**: Branded, publication-ready PDF documents generated with `jsPDF` including summary statistics, candidate ranking tables, and recruiter sign-off areas.
- **Recruitment Conversion Funnel**: Track candidate progression from ingestion to interview shortlisting.

### Module 8: Zero-Bias & Ethical AI Charter
- Strict non-discrimination policy: Protected attributes (age, gender, race, caste, religion, nationality, disability) are completely excluded from evaluation.
- All AI scores are classified as assistive relevance indicators, never automatic rejection or hiring determinations.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Node.js, Express, tsx.
- **AI Engine**: Google GenAI SDK (`@google/genai`), Gemini 3.8 Flash.
- **Database & Auth**: Firebase Firestore (Enterprise rules) & Firebase Authentication.
- **Document Processing**: `pdf-parse` (PDF) and `mammoth` (DOCX).
- **Reporting**: `jsPDF` for PDF generation, native CSV serialization.

---

## 📦 Getting Started & Local Setup

### 1. Prerequisites
- Node.js (v18.0.0 or higher)
- npm or bun
- A Google AI Studio Gemini API Key

### 2. Environment Configuration
Clone the repository and create your local environment file:

```bash
cp .env.example .env
```

Ensure `.env` contains:
```env
# Gemini API Key (Server-side only)
GEMINI_API_KEY="your-gemini-api-key-here"

# Application Port
PORT=3000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000` with the Express backend proxying Vite middleware.

---

## 🔒 Firebase Security Rules & Production Hardening

The application includes production-ready ABAC security rules in `firestore.rules` adhering to the Eight Pillars of Zero-Trust Security:

1. **Default Deny**: All unspecified paths are closed by default.
2. **Schema & String Length Limits**: Prevents Denial of Wallet injection attacks.
3. **Immutability of Audit Fields**: `createdAt`, `createdBy`, and `jobId` cannot be tampered with.
4. **Append-Only Activities**: The `/activities` collection functions as an immutable audit trail.

To deploy security rules in production via the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 🚢 Production Build & Deployment

### Production Build
```bash
npm run build
```
This builds the optimized frontend bundle into the `dist/` directory.

### Running in Production
```bash
npm start
```
The Node.js server automatically detects `NODE_ENV=production` and serves the static production assets from `dist/` while exposing the REST endpoints.

### Docker / Cloud Run Deployment
You can package the application using the following multi-stage Dockerfile:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/firebase-applet-config.json ./

EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
```
