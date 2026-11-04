# AI Resume Screening System - Security Specification

## 1. Data Invariants

1. **Identity & Ownership Integrity**: A user can only create and manage jobs and candidate evaluations where `createdBy` matches their authenticated UID (`request.auth.uid`).
2. **Immutability of Audit & Ownership**: Crucial identifying fields (`createdBy`, `id`, `jobId`, `createdAt`) cannot be altered during updates.
3. **Admin Verification & Separation**: Admin records in `/admins/{adminId}` are keyed by UID. Non-admins cannot elevate their roles or fabricate admin credentials.
4. **Valid Schema & Boundaries**: All strings, arrays, and IDs are bounded (e.g. IDs match `^[a-zA-Z0-9_\-]+$`, strings obey length constraints) to prevent Denial of Wallet and payload injection attacks.
5. **Human In The Loop Enforcement**: Candidate status transitions must only be modified by the authorized recruiter or admin. Rejection or shortlisting cannot be spoofed by unauthorized actors.
6. **Query Containment**: List queries are strictly scoped to authenticated recruiters and their authored records or authorized admin viewers.

---

## 2. The Dirty Dozen Payloads (Designed to Break Identity, Integrity, and State)

1. **Unauthenticated Job Creation**: Attempting to create a job opening without authentication.
2. **Identity Spoofing on Job Creation**: Setting `createdBy` to another user's UID.
3. **Admin Role Escalation**: A regular user writing to `/admins/{their_uid}` with `role: "admin"` without authorization.
4. **Candidate Ownership Hijack**: Modifying `createdBy` of an existing candidate record during an update.
5. **ID Poisoning Attack**: Submitting a document ID of 50,000 characters or special injection characters (`../../passwords`).
6. **Denial of Wallet Payload**: Submitting a 5MB payload in `candidate.summary` or 10,000 items in `extractedSkills`.
7. **Ghost Field Injection**: Adding an unpermitted field `isApprovedBySystem: true` to bypass human recruiter review.
8. **Tampering with Job Association**: Updating a candidate record to point to a completely different `jobId` owned by someone else.
9. **Score Fabrication Attack**: Overwriting a candidate's score with a non-numeric string or negative number like `-999`.
10. **Activity Log Forgery**: Injecting fake activity entries with another user's `userId`.
11. **Blanket Query Scraping**: Attempting an unrestricted collection query across all candidates from all companies without authentication.
12. **Immutable Field Tampering**: Attempting to change `createdAt` on an existing candidate or job document.

---

## 3. Test Runner Specification (`firestore.rules.test.ts`)

Each test in the security suite validates that the corresponding "Dirty Dozen" payload produces a `PERMISSION_DENIED` status.
