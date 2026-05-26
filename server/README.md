# CreditSea LMS - Backend Server

This is the backend server for the **CreditSea Loan Management System (LMS)**. Built using **Node.js**, **Express.js**, **TypeScript**, and **MongoDB/Mongoose**, it implements a role-based State Machine for loans, an automatic Business Rules Engine (BRE), salary slip document storage, and analytical dashboards.

---

## 📁 Source Tree Structure

```text
server/
├── src/
│   ├── config/                 # DB, Secret Keys, and Port config files
│   │   └── config.ts
│   │
│   ├── controllers/            # Request handlers / Controller layer
│   │   ├── auth.controller.ts  # Session signup, logins, token validation
│   │   ├── borrower.controller.ts # Personal profile and document uploads
│   │   ├── loan.controller.ts  # Application configuration & calculations
│   │   └── ops.controller.ts   # Backoffice executive transitions & UTR logging
│   │
│   ├── middleware/             # Express middlewares
│   │   ├── auth.middleware.ts  # JWT checks and Role-based Route validation
│   │   └── upload.middleware.ts# Multer storage configuration for salary slips
│   │
│   ├── models/                 # Mongoose Database Models
│   │   ├── user.model.ts       # Authentication credentials and role schemas
│   │   ├── borrower.model.ts   # Demographics, income, and BRE status
│   │   ├── loan.model.ts       # Loan amounts, tenure, balances, and states
│   │   ├── payment.model.ts    # Ledger tracking repayment receipts (UTR, dates)
│   │   ├── history.model.ts    # Audit logs for loan state modifications
│   │   └── document.model.ts   # Uploaded salary slip file metadata
│   │
│   ├── routes/                 # API Route mapping
│   │   ├── auth.routes.ts
│   │   ├── borrower.routes.ts
│   │   ├── loan.routes.ts
│   │   ├── ops.routes.ts
│   │   └── index.ts            # Combines router groups to /api prefix
│   │
│   ├── services/               # System Services
│   │   ├── bre.service.ts      # Business Rules Engine eligibility verification
│   │   └── math.service.ts     # Simple Interest (12% APR) and repayment values
│   │
│   ├── scripts/                # Database tasks
│   │   ├── seed.ts             # Deletes collections and seeds default credentials
│   │   └── test-flow.ts        # Optional terminal pipeline simulation script
│   │
│   └── index.ts                # Application Entry Point & Express initialisation
│
├── dist/                       # Compiled production Javascript files
├── uploads/                    # Local storage folder for files
└── tsconfig.json
```

---

## 🔒 Engines & Verification Rules

### 1. Business Rules Engine (BRE) eligibility checks
When a borrower saves their personal details, the `bre.service.ts` processes values. The user is rejected on the frontend and backend if any check fails:
*   **Age Verification**: Calculated from date of birth. Must be between **23 and 50 years** (inclusive).
*   **Income Standard**: Minimum monthly salary must be **₹25,000** or above.
*   **PAN Verification**: RegEx match verifying PAN matches standard Indian tax code formats: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`.
*   **Employment Filter**: Must be either **Salaried** or **Self-Employed**. Applications marked `Unemployed` are denied.

### 2. Financial Math Service (`math.service.ts`)
*   **APR**: Simple interest rate set to **12%**.
*   **Formula**:
    $$\text{Interest} = \frac{\text{Principal} \times 12 \times \text{Tenure in Days}}{365 \times 100}$$
    $$\text{Total Repayment} = \text{Principal} + \text{Interest}$$

---

## 🔌 API Reference Endpoints

All endpoints are prefixed with `/api`. Authenticated endpoints require a bearer token header (`Authorization: Bearer <JWT>`).

### 🔑 Authentication (`/auth`)
*   **`POST /auth/register`**: Creates a new user credential with the role `Borrower`.
*   **`POST /auth/login`**: Authenticates credentials and returns a signed JWT.
*   **`GET /auth/me`**: Decodes JWT from authorization headers and returns the active user session info.

### 👤 Borrower (`/borrowers`)
*   **`GET /borrowers/profile`**: Returns the active borrower's configuration, step status, and demographic info.
*   **`POST /borrowers/personal-details`**: Submits step-1 data. Executes BRE rules.
*   **`POST /borrowers/upload-salary-slip`**: Handles file uploads via Multer. Enforces standard image and PDF formats (5MB limit) and stores them in the `uploads/` folder.

### 💵 Loans Lifecycle (`/loans`)
*   **`POST /loans/apply`**: Creates a new loan record using specified principal and tenure. Automatically calculates interest and schedules, transitioning loan status to `Applied`.
*   **`GET /loans/history`**: Returns the list of state updates and audit logs for the borrower's active application.

### 📊 Backoffice Dashboard Operations (`/ops`)
*   **`GET /ops/leads`**: (Ops-only) Returns a comprehensive list of all loans in the pipeline.
*   **`POST /ops/update-status`**: Updates loan states based on step approvals:
    *   *Sales Executive* transitions from `Applied` to `Under_Review`.
    *   *Sanction Executive* transitions from `Under_Review` to `Sanctioned` or `Rejected` (denials require a justification string).
*   **`POST /ops/disburse`**: (Disbursement-only) Transitions status to `Disbursed`. Validates and attaches a UTR transaction number.
*   **`POST /ops/log-payment`**: (Collection-only) Posts payment amounts against outstanding principal + interest. If total balance reaches ₹0, transitions status to `Settled`.

---

## 🛠 Setup & Run Instructions

Run the following commands inside the `server/` folder:

1.  **Configure environment**:
    Create your local configuration in `.env`:
    ```env
    PORT=5000
    MONGO_URI=mongodb+srv://...
    JWT_SECRET=creditsea_jwt_secret
    JWT_EXPIRE=24h
    UPLOAD_DIR=uploads/
    ```
2.  **Seed default users**:
    ```bash
    npm run seed
    ```
3.  **Start development server**:
    ```bash
    npm run dev
    ```
4.  **Build production version**:
    ```bash
    npm run build
    npm start
    ```
