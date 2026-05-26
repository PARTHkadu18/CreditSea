# CreditSea LMS - Frontend Client

This is the frontend client for the **CreditSea Loan Management System (LMS)**. Built using **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**, the application is highly responsive, responsive, and visually modern (utilizing glassmorphic designs, state-of-the-art interactive sliders, and custom dashboards).

---

## 📁 Directory Structure

```text
client/
├── src/
│   ├── app/                    # Next.js Pages Router
│   │   ├── (auth)/             # Login and Signup views
│   │   │   ├── login/          # Login page with quick-login account presets
│   │   │   └── signup/         # Borrower registration page
│   │   ├── borrower/           # Borrower dashboard subpages
│   │   │   ├── layout.tsx      # Restricts access to Borrower role
│   │   │   ├── page.tsx        # Dynamic Stepper container (orchestrator)
│   │   │   ├── loan-apply/     # Redirects user back to page.tsx
│   │   │   ├── personal-details/# Redirects user back to page.tsx
│   │   │   └── upload-salary-slip/# Redirects user back to page.tsx
│   │   ├── dashboard/          # Operations dashboard subpages
│   │   │   ├── layout.tsx      # Sidebar, Navbar layout + RouteGuard for Ops roles
│   │   │   ├── page.tsx        # Admin overview analytics & general user list
│   │   │   ├── sales/          # Sales executive application management pipeline
│   │   │   ├── sanction/       # Sanction executive loan evaluation screen
│   │   │   ├── disbursement/   # Disbursement executive UTR logger
│   │   │   └── collection/     # Collection executive repayment ledger logs
│   │   ├── layout.tsx          # Root Layout (wraps AuthProvider & global styles)
│   │   ├── globals.css         # Tailwind v4 directives, animations, variables
│   │   └── page.tsx            # Root Index: Smart router based on Auth State
│   │
│   ├── components/             # Reusable UI Components
│   │   ├── borrower/           # Borrower 4-step wizard modular subcomponents
│   │   │   ├── PersonalDetailsForm.tsx  # Step 1: Input details & show BRE errors
│   │   │   ├── SalarySlipUpload.tsx     # Step 2: Drag-and-drop file validations
│   │   │   ├── LoanConfiguration.tsx    # Step 3: SI math sliders (₹50k - ₹500k)
│   │   │   └── ActiveCreditLine.tsx     # Step 4: Ledger tables & timeline tracker
│   │   ├── navbar.tsx          # Dual mode header (Borrower/Dashboard layout)
│   │   ├── sidebar.tsx         # Sidebar navigation links filtered by user roles
│   │   └── route-guard.tsx     # Router-blocking shell handling auth verification
│   │
│   ├── context/
│   │   └── auth-context.tsx    # Session sync, JWT tracking, login & signup actions
│   │
│   ├── services/
│   │   └── api.ts              # Fetch wrapper with headers inject & error parsers
│   │
│   └── utils/
│       └── format.ts           # Financial currency & date helpers
│
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔒 Key Design Systems & Architectures

### 1. Unified Route Guards (`route-guard.tsx`)
Rather than relying on ad-hoc page protection, all security is governed by the `RouteGuard` component.
*   **Role Restricting**: Filters allowed path groups against claims inside the active user JWT (e.g., matching paths starting with `/dashboard` against `Admin`/`Sales`/`Sanction`/`Disbursement`/`Collection`, and `/borrower` against `Borrower` only).
*   **Flicker-Free Experience**: Shows a clean glassmorphic loading spinner while verifying token credentials against the backend API endpoint (`/auth/me`).

### 2. Borrower Stepper Orchestration (`app/borrower/page.tsx`)
To ensure smooth state transitions and reliable submission checkpoints:
*   `page.tsx` acts as the orchestrator. It fetches the latest application status from `/borrowers/profile` on mount.
*   Depending on the backend state (`Applied`, `Under_Review`, `Sanctioned`, `Disbursed`, `Rejected`, `Settled`), it mounts the correct subcomponent:
    *   **Step 1**: `PersonalDetailsForm.tsx` (Pre-assessment BRE checking).
    *   **Step 2**: `SalarySlipUpload.tsx` (Uploading document).
    *   **Step 3**: `LoanConfiguration.tsx` (Configuring parameters and calling the apply API).
    *   **Step 4**: `ActiveCreditLine.tsx` (Active repayment operations tracker).
*   Subpage paths like `/borrower/personal-details` automatically redirect borrowers to `/borrower` to guarantee they stay aligned with their current database-assigned stage.

### 3. API Error Extraction
The fetch helper in `services/api.ts` parses response details. If the backend fails with schema or validation errors, the fetch client prioritizes returning the Mongoose BRE message array (`data.error` or `data.errors`) over default raw HTTP status strings, rendering detailed checklists on the forms.

---

## 🚀 Available CLI Scripts

Run the following commands inside the `client/` folder:

*   **`npm run dev`**: Starts the Next.js development server on `http://localhost:3000`.
*   **`npm run build`**: Compiles the TypeScript code and generates the optimized production bundle with Turbopack.
*   **`npm start`**: Launches the built Next.js server in production.
*   **`npm run lint`**: Inspects code quality with ESLint rules.
