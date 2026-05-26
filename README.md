# CreditSea - Loan Management System (LMS)

CreditSea is an enterprise-grade, full-stack **Loan Management System (LMS)** designed to streamline the end-to-end lifecycle of consumer credit. From borrower onboarding and dynamic Business Rule Engine (BRE) checks to multi-stage operational approval workflows (Sales, Sanction, Disbursement, and Collection), CreditSea provides a highly interactive, secure, and visually polished platform.

---

## 🚀 Key Features

*   **Borrower Application Portal**: Interactive 4-step wizard:
    1.  **Personal Details Form**: Instant background validation of PAN, age, and employment via the custom backend BRE.
    2.  **Salary Slip Upload**: Secure drag-and-drop file upload with format restrictions and a 5MB size limit.
    3.  **Loan Configuration Slider**: Drag principal amount (₹50k - ₹500k) and tenure (30 - 365 days) with live Simple Interest (12% APR) and repayment schedule calculations.
    4.  **Active Credit Line Timeline**: Live application status tracker (Sales, Sanction, Disbursed, Settled), audit histories, payment receipt tables, and a profile reapply button.
*   **Operational Control Centers**: Role-restricted dashboard portals with custom columns, filters, and forms:
    *   **Sales Executive Portal**: Leads ingestion pipeline with quick-action status updates.
    *   **Sanction Executive Portal**: Risk evaluation, credit assessment, and loan approvals. Prompts for rejection reasons on denials.
    *   **Disbursement Executive Portal**: Secure disbursement confirmation requiring UTR (Unique Transaction Reference) validation and double-check warnings.
    *   **Collection Executive Portal**: Log repayment payments with UTR, view historical receipts, and update live outstanding balances.
*   **Unified Route Guards**: Complete client-side security filtering out unauthorized views based on JWT claims and real-time backend verification.
*   **Evaluator Quick-Login Shortcuts**: One-click quick login credentials on the sign-in screen for easy testing.

---

## 🛠 Tech Stack

### Frontend (Client)
*   **Framework**: Next.js 16.2.6 (App Router)
*   **Library**: React 19, TypeScript
*   **Styling**: Tailwind CSS v4 (Sleek modern variables, premium glassmorphism, smooth animations)
*   **Icons**: Lucide React
*   **State & Auth**: Native React Context API with JWT local storage synchronization

### Backend (Server)
*   **Runtime**: Node.js, TypeScript
*   **Framework**: Express.js
*   **Database**: MongoDB with Mongoose ODM
*   **Authentication**: JWT (JSON Web Tokens) & Bcrypt hashing
*   **File Storage**: Multer (Local storage config for salary slips)
*   **Engines**: Custom Business Rules Engine (BRE) & Financial Math Engine

---

## 📁 Repository Structure

```text
CreditSea/
├── client/                     # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                # Next.js App Router (auth, borrower, dashboard)
│   │   ├── components/         # Shared and modular UI components
│   │   │   └── borrower/       # Dedicated components for Borrower Stepper
│   │   ├── context/            # AuthContext (state management, API handshake)
│   │   ├── services/           # api.ts (Central fetch wrapper)
│   │   └── utils/              # format.ts (Currency & Date formatting helper)
│   ├── package.json
│   └── tsconfig.json
│
├── server/                     # Express.js TypeScript Backend
│   ├── src/
│   │   ├── config/             # DB & Port configuration variables
│   │   ├── controllers/        # Route controllers (Auth, Borrower, Loan, Ops)
│   │   ├── middleware/         # JWT Validation, Role Guards, Upload configs
│   │   ├── models/             # Mongoose Schemas (User, Loan, Borrower, etc.)
│   │   ├── routes/             # API Router definitions
│   │   ├── services/           # BRE Validator & Financial Math formulas
│   │   └── scripts/            # Database seeding and testing scripts
│   ├── uploads/                # Directory for uploaded salary slips (Gitignored)
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                   # Project Root Documentation
```

---

## ⚙️ Setup and Installation

### 1. Prerequisites
Ensure you have the following installed on your local machine:
*   [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
*   [MongoDB](https://www.mongodb.com/) (Local Community Server or Atlas Cluster Uri)
*   [Git](https://git-scm.com/)

---

### 2. Backend Setup
1.  Navigate to the `server/` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment variables:
    Create a `.env` file in the `server/` directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_uri
    JWT_SECRET=your_jwt_signing_secret
    JWT_EXPIRE=24h
    UPLOAD_DIR=uploads/
    ```
4.  **Seed the Database**:
    Populate default users and system roles needed for evaluating the workflows:
    ```bash
    npm run seed
    ```
5.  Start the backend development server:
    ```bash
    npm run dev
    ```
    *The server will start running on **`http://localhost:5000`**.*

---

### 3. Frontend Setup
1.  Open a new terminal and navigate to the `client/` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the frontend development server:
    ```bash
    npm run dev
    ```
    *The frontend app will launch at **`http://localhost:3000`**.*

---

## 🔑 Master Evaluation Credentials

To test the system roles and review the operational loan pipeline, you can use these pre-seeded accounts:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Borrower** | `borrower@creditsea.com` | `Borrower@123` | Multi-step loan configurations, details input, uploads. |
| **Sales** | `sales@creditsea.com` | `Sales@123` | Progresses new loan applications from status `Applied` to `Under_Review`. |
| **Sanction** | `sanction@creditsea.com` | `Sanction@123` | Evaluates borrower credentials. Transition to `Sanctioned` or `Rejected`. |
| **Disbursement** | `disburse@creditsea.com` | `Disburse@123` | Processes payments to sanctioned borrowers. Prompts UTR to set state `Disbursed`. |
| **Collection** | `collect@creditsea.com` | `Collect@123` | Log loan repayments, view history, set state to `Settled`. |
| **Admin** | `admin@creditsea.com` | `Admin@123` | Full visibility over all pipeline phases, audit logs, and metrics. |

---

## 📊 Complete Workflow Guide

To experience the system's operational flow from start to finish, try this test scenario:
1.  **Sign up** as a new Borrower or log in using the `Sample Borrower` credentials.
2.  Fill in the **Personal Details Form** (Step 1). *Note: Entering a salary under ₹25k, age outside 23-50, or invalid PAN format will trigger real-time BRE error displays.*
3.  Upload a **Salary Slip** (Step 2) and configure your **Loan Amount & Tenure** (Step 3). Confirm the submission.
4.  Logout and log back in as **Sales Executive** (`sales@creditsea.com`). Locate the borrower's record and progress it to **Under Review**.
5.  Log in as **Sanction Executive** (`sanction@creditsea.com`). Approve the application to change status to **Sanctioned**.
6.  Log in as **Disbursement Executive** (`disburse@creditsea.com`). Enter a Unique Transaction Reference (UTR) code to disburse the funds (status changes to **Disbursed**).
7.  Log in as **Collection Executive** (`collect@creditsea.com`). Post repayment transactions using UTR numbers. Once the balance drops to ₹0, mark the loan as **Settled**.
8.  Log in as **Admin** (`admin@creditsea.com`) at any point to view systemic analytics, logs, and overview grids.
