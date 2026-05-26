import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { User } from '../models/user.model';
import { BorrowerProfile } from '../models/borrower.model';
import { Loan } from '../models/loan.model';
import { Payment } from '../models/payment.model';
import { LoanStatusHistory } from '../models/history.model';
import { DocumentModel } from '../models/document.model';
import { config } from '../config/config';
import apiRouter from '../routes';

// We will construct the Express application exactly like index.ts
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(err.status || 500).json({ success: false, message: err.message });
});

let server: any;
const PORT = 5002;
const BASE_URL = `http://localhost:${PORT}/api`;

const apiCall = async (
  method: 'GET' | 'POST',
  path: string,
  token: string | null = null,
  body: any = null
): Promise<{ status: number; data: any }> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && method === 'POST') {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, options);
    const data = await res.json();
    return {
      status: res.status,
      data,
    };
  } catch (error) {
    console.error(`Fetch failed for ${path}:`, error);
    throw error;
  }
};

const runVerificationTests = async () => {
  try {
    // 1. Establish database connection
    console.log('\n--- 1. Connecting to DB & Wiping Data for Clean Verification Run ---');
    await mongoose.connect(config.mongoUri);
    await User.deleteMany({});
    await BorrowerProfile.deleteMany({});
    await Loan.deleteMany({});
    await Payment.deleteMany({});
    await LoanStatusHistory.deleteMany({});
    await DocumentModel.deleteMany({});
    console.log('Database pristine.');

    // 2. Start HTTP Server
    console.log('\n--- 2. Starting Ephemeral Verification Server ---');
    server = app.listen(PORT, () => {
      console.log(`Verification server listening on http://localhost:${PORT}`);
    });

    // 3. Register seed users
    console.log('\n--- 3. Seeding Test Users & Executives ---');
    const users = [
      { name: 'Admin User', email: 'admin@test.com', password: 'Admin@123', role: 'Admin' },
      { name: 'Sales User', email: 'sales@test.com', password: 'Sales@123', role: 'Sales' },
      { name: 'Sanction User', email: 'sanction@test.com', password: 'Sanction@123', role: 'Sanction' },
      { name: 'Disbursement User', email: 'disburse@test.com', password: 'Disburse@123', role: 'Disbursement' },
      { name: 'Collection User', email: 'collect@test.com', password: 'Collect@123', role: 'Collection' },
      { name: 'Borrower User', email: 'borrower@test.com', password: 'Borrower@123', role: 'Borrower' },
    ];
    for (const u of users) {
      await User.create(u);
    }
    console.log('Test users registered.');

    // 4. Log in all roles to obtain JWT tokens
    console.log('\n--- 4. Logging in Seed Accounts and Retreiving JWTs ---');
    const tokens: Record<string, string> = {};
    for (const u of users) {
      const res = await apiCall('POST', '/auth/login', null, { email: u.email, password: u.password });
      if (res.status === 200) {
        tokens[u.role] = res.data.token;
        console.log(`✓ Logged in as ${u.role}. Token generated.`);
      } else {
        throw new Error(`Failed login for ${u.role}`);
      }
    }

    // 5. Test BRE validations (Failure Mode)
    console.log('\n--- 5. Testing Business Rule Engine (BRE) - Invalid Submissions ---');
    
    // Test Case A: Monthly Salary < 25,000
    const profileFailedSalary = {
      fullName: 'Borrower User',
      pan: 'ABCDE1234F',
      dob: '1995-05-15',
      monthlySalary: 24900,
      employmentMode: 'Salaried'
    };
    let res = await apiCall('POST', '/borrower/profile', tokens['Borrower'], profileFailedSalary);
    console.log(`Test A (Salary = 24,900) -> Status: ${res.status} | Errors: ${JSON.stringify(res.data.errors)}`);
    if (res.status !== 400 || !res.data.errors.some((e: string) => e.includes('salary'))) {
      throw new Error('Salary eligibility check failed to catch low salary!');
    }

    // Test Case B: Age not between 23 and 50 (Underage 20 years old)
    const profileFailedAge = {
      fullName: 'Borrower User',
      pan: 'ABCDE1234F',
      dob: new Date(new Date().getFullYear() - 20, 5, 15).toISOString().split('T')[0], // 20 years old
      monthlySalary: 30000,
      employmentMode: 'Salaried'
    };
    res = await apiCall('POST', '/borrower/profile', tokens['Borrower'], profileFailedAge);
    console.log(`Test B (Age = 20) -> Status: ${res.status} | Errors: ${JSON.stringify(res.data.errors)}`);
    if (res.status !== 400 || !res.data.errors.some((e: string) => e.includes('Age'))) {
      throw new Error('Age check failed to catch underage applicant!');
    }

    // Test Case C: Employment Mode Unemployed
    const profileFailedEmployment = {
      fullName: 'Borrower User',
      pan: 'ABCDE1234F',
      dob: '1995-05-15',
      monthlySalary: 35000,
      employmentMode: 'Unemployed'
    };
    res = await apiCall('POST', '/borrower/profile', tokens['Borrower'], profileFailedEmployment);
    console.log(`Test C (Employment = Unemployed) -> Status: ${res.status} | Errors: ${JSON.stringify(res.data.errors)}`);
    if (res.status !== 400 || !res.data.errors.some((e: string) => e.includes('Employment'))) {
      throw new Error('Employment validation failed to catch Unemployed status!');
    }

    // Test Case D: PAN Format Incorrect
    const profileFailedPAN = {
      fullName: 'Borrower User',
      pan: 'ABC1234F', // short
      dob: '1995-05-15',
      monthlySalary: 35000,
      employmentMode: 'Salaried'
    };
    res = await apiCall('POST', '/borrower/profile', tokens['Borrower'], profileFailedPAN);
    console.log(`Test D (PAN = ABC1234F) -> Status: ${res.status} | Errors: ${JSON.stringify(res.data.errors)}`);
    if (res.status !== 400 || !res.data.errors.some((e: string) => e.includes('PAN'))) {
      throw new Error('PAN check failed to block incorrect PAN format!');
    }

    // 6. Test BRE validations (Success Mode)
    console.log('\n--- 6. Testing BRE - Valid Profile Submission ---');
    const validProfile = {
      fullName: 'Valid Borrower',
      pan: 'ABCDE1234F',
      dob: '1995-05-15', // ~31 years old
      monthlySalary: 45000,
      employmentMode: 'Salaried'
    };
    res = await apiCall('POST', '/borrower/profile', tokens['Borrower'], validProfile);
    console.log(`Test Success (Valid Profile) -> Status: ${res.status} | Message: ${res.data.message}`);
    if (res.status !== 200 || !res.data.profile.brePassed) {
      throw new Error('Valid profile failed to pass BRE checks!');
    }

    // 7. Test Sales dashboard showing leads (registered borrower who has NOT applied for a loan yet)
    console.log('\n--- 7. Testing Sales Module Lead Tracking ---');
    res = await apiCall('GET', '/ops/sales', tokens['Sales']);
    console.log(`Sales dashboard response -> Leads Count: ${res.data.count}`);
    if (res.status !== 200 || res.data.count !== 1) {
      throw new Error('Sales dashboard did not list our borrower lead!');
    }
    const lead = res.data.data[0];
    console.log(`Lead details -> Email: ${lead.user.email} | Status: ${lead.status}`);

    // 8. Test Loan Math Repayment Calculation
    console.log('\n--- 8. Testing Live Repayment Math API (SI formula: P * R * T / 36500) ---');
    // For Principal = 1,00,000, Tenure = 180 days, Rate = 12%
    // SI = (100000 * 12 * 180) / 36500 = 21600000 / 36500 = 5917.8082... (Rounded: 5917.81)
    // Total repayment = 105917.81
    res = await apiCall('GET', '/loans/calculate?principal=100000&tenure=180');
    console.log(`Math endpoint -> principal: ${res.data.data.principal} | tenure: ${res.data.data.tenure} | rate: ${res.data.data.rate}`);
    console.log(`Calculated Interest: ${res.data.data.interest} | Expected: 5917.81`);
    console.log(`Calculated Total Repayment: ${res.data.data.totalRepayment} | Expected: 105917.81`);
    if (res.status !== 200 || res.data.data.interest !== 5917.81 || res.data.data.totalRepayment !== 105917.81) {
      throw new Error('Simple interest calculations are incorrect!');
    }

    // 9. Apply for a Loan
    console.log('\n--- 9. Submitting Loan Application ---');
    const loanPayload = {
      principal: 100000,
      tenure: 180,
      salarySlipPath: 'uploads/salary-slip-mock-987.png'
    };
    res = await apiCall('POST', '/borrower/apply-loan', tokens['Borrower'], loanPayload);
    console.log(`Apply loan response -> Status: ${res.status} | Status: ${res.data.loan?.status} | Balance: ${res.data.loan?.outstandingBalance}`);
    if (res.status !== 201 || res.data.loan.status !== 'Pending') {
      throw new Error('Failed to submit loan application!');
    }
    const loanId = res.data.loan._id;

    // 10. Check that lead has been removed from Sales module now that they applied
    console.log('\n--- 10. Verifying Sales Lead Removal post-Application ---');
    res = await apiCall('GET', '/ops/sales', tokens['Sales']);
    console.log(`Sales dashboard lead count: ${res.data.count} (Expected: 0)`);
    if (res.data.count !== 0) {
      throw new Error('Borrower is still listed in Sales lead list even after applying for a loan!');
    }

    // 11. Sanction Module decision (Approval)
    console.log('\n--- 11. Sanction Review & Approval Decision ---');
    // First verify Sanction dashboard sees the pending loan
    res = await apiCall('GET', '/ops/sanction', tokens['Sanction']);
    console.log(`Sanction dashboard list size: ${res.data.count} | Loan ID: ${res.data.data[0]?.loan._id}`);
    if (res.status !== 200 || res.data.count !== 1) {
      throw new Error('Sanction dashboard does not see the applied pending loan!');
    }

    // Approve the loan
    res = await apiCall('POST', `/ops/sanction/${loanId}`, tokens['Sanction'], { action: 'approve' });
    console.log(`Sanction decision -> status: ${res.status} | Loan Status: ${res.data.loan?.status}`);
    if (res.status !== 200 || res.data.loan.status !== 'Sanctioned') {
      throw new Error('Sanction approval failed!');
    }

    // 12. Disbursement Module Action
    console.log('\n--- 12. Disbursement Processing ---');
    // Verify Disbursement dashboard sees sanctioned loan
    res = await apiCall('GET', '/ops/disbursement', tokens['Disbursement']);
    console.log(`Disbursement dashboard count: ${res.data.count} | Loan ID: ${res.data.data[0]?.loan._id}`);
    if (res.status !== 200 || res.data.count !== 1) {
      throw new Error('Disbursement dashboard did not pick up the approved loan!');
    }

    // Disburse the loan
    res = await apiCall('POST', `/ops/disbursement/${loanId}/disburse`, tokens['Disbursement']);
    console.log(`Disbursement action -> status: ${res.status} | Loan Status: ${res.data.loan?.status}`);
    if (res.status !== 200 || res.data.loan.status !== 'Disbursed') {
      throw new Error('Disbursement execution failed!');
    }

    // 13. Collection Module payments tracking
    console.log('\n--- 13. Collection Repayment & Strict Payment Validations ---');
    // Verify Collection dashboard lists active disbursed loan
    res = await apiCall('GET', '/ops/collection', tokens['Collection']);
    console.log(`Collection dashboard count: ${res.data.count} | Outstanding Balance: ${res.data.data[0]?.loan.outstandingBalance}`);
    if (res.status !== 200 || res.data.count !== 1) {
      throw new Error('Collection dashboard did not register the active disbursed loan!');
    }

    // Validation Check A: Amount cannot exceed outstanding balance
    // Outstanding balance is 105917.81
    res = await apiCall('POST', `/ops/collection/${loanId}/payment`, tokens['Collection'], {
      utr: 'UTR000000001',
      amount: 110000, // exceeds balance
      date: '2026-05-25'
    });
    console.log(`Validation A (Exceeding payment: 110k) -> status: ${res.status} | msg: ${res.data.message}`);
    if (res.status !== 400) {
      throw new Error('Payment logged succeeded despite exceeding outstanding balance!');
    }

    // Log partial payment (5917.81) to reduce outstanding balance to exactly 1,00,000
    res = await apiCall('POST', `/ops/collection/${loanId}/payment`, tokens['Collection'], {
      utr: 'UTR000000001',
      amount: 5917.81,
      date: '2026-05-25'
    });
    console.log(`Partial Payment -> status: ${res.status} | New Outstanding: ${res.data.loan?.outstandingBalance} | Status: ${res.data.loan?.status}`);
    if (res.status !== 200 || res.data.loan.outstandingBalance !== 100000) {
      throw new Error('Outstanding balance calculation mismatch after partial payment!');
    }

    // Validation Check B: Globally unique UTR enforcement
    // Try to record another payment with duplicate UTR 'UTR000000001'
    res = await apiCall('POST', `/ops/collection/${loanId}/payment`, tokens['Collection'], {
      utr: 'UTR000000001',
      amount: 10000,
      date: '2026-05-25'
    });
    console.log(`Validation B (Duplicate UTR check) -> status: ${res.status} | msg: ${res.data.message}`);
    if (res.status !== 400) {
      throw new Error('Duplicate UTR validation failed to block payment!');
    }

    // Log remaining balance payment (1,00,000) to trigger auto-closure
    res = await apiCall('POST', `/ops/collection/${loanId}/payment`, tokens['Collection'], {
      utr: 'UTR000000002',
      amount: 100000,
      date: '2026-05-25'
    });
    console.log(`Final Repayment -> status: ${res.status} | New Outstanding: ${res.data.loan?.outstandingBalance} | Status: ${res.data.loan?.status}`);
    if (res.status !== 200 || res.data.loan.outstandingBalance !== 0 || res.data.loan.status !== 'Closed') {
      throw new Error('Loan failed to auto-close and drop balance to 0 on full repayment!');
    }

    // 14. Verify Role-Based Access Control (RBAC) security
    console.log('\n--- 14. Verifying RBAC Middleware Restricting Executive Portals ---');
    // Try to view Sanction Module using Borrower's JWT token
    res = await apiCall('GET', '/ops/sanction', tokens['Borrower']);
    console.log(`RBAC Test (Borrower hitting Sanction) -> status: ${res.status} | msg: ${res.data.message}`);
    if (res.status !== 403) {
      throw new Error('RBAC check failed! Borrower was not blocked from hitting Sanction module!');
    }

    // Try to approve a loan using Collection Executive's token
    res = await apiCall('POST', `/ops/sanction/${loanId}`, tokens['Collection'], { action: 'approve' });
    console.log(`RBAC Test (Collection hitting Sanction) -> status: ${res.status} | msg: ${res.data.message}`);
    if (res.status !== 403) {
      throw new Error('RBAC check failed! Collection Executive was not blocked from deciding Sanctions!');
    }

    // 15. Check Loan Audit History logs
    console.log('\n--- 15. Verifying Audit Logs & Payment History Reports ---');
    res = await apiCall('GET', `/loans/${loanId}/history`, tokens['Admin']);
    console.log(`Loan Audit Trail status: ${res.status}`);
    console.log(`Recorded Payments Logged: ${res.data.payments?.length} items`);
    console.log(`Recorded State Transitions Logged: ${res.data.history?.length} items`);
    for (const h of res.data.history) {
      console.log(`  State change: ${h.fromStatus} -> ${h.toStatus} | Updated by: ${h.updatedBy?.name} (${h.updatedBy?.role})`);
    }

    if (res.data.payments.length !== 2 || res.data.history.length !== 5) {
      // 5 transitions: None->Pending, Pending->Sanctioned, Sanctioned->Disbursed, Disbursed->Disbursed (for 1st payment), Disbursed->Closed (for 2nd payment)
      throw new Error('Audit trail log counts mismatch!');
    }

    console.log('\n======================================================');
    console.log('✓ ALL INTEGRATION AND LIFE-CYCLE VERIFICATIONS PASSED!');
    console.log('======================================================\n');

  } catch (error) {
    console.error('\n❌ VERIFICATION TEST FAILED:', (error as Error).message);
    process.exit(1);
  } finally {
    // 16. Shut down ephemeral server
    if (server) {
      console.log('Closing Ephemeral Server...');
      server.close();
    }
    // Disconnect Mongoose
    await mongoose.disconnect();
    console.log('Database disconnected.');
    process.exit(0);
  }
};

// Run verification suite
runVerificationTests();
