"use client";

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/auth-context';
import { CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

import { PersonalDetailsForm, ProfileData } from '../../components/borrower/PersonalDetailsForm';
import { SalarySlipUpload } from '../../components/borrower/SalarySlipUpload';
import { LoanConfiguration } from '../../components/borrower/LoanConfiguration';
import { ActiveCreditLine } from '../../components/borrower/ActiveCreditLine';

// ─── Step indicator ─────────────────────────────────────────────────────────
const STEPS = [
  { step: 1, label: 'Personal Details' },
  { step: 2, label: 'Salary Slip' },
  { step: 3, label: 'Configuration' },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="grid grid-cols-3 max-w-3xl mx-auto gap-4">
      {STEPS.map((item) => {
        const isCompleted = currentStep > item.step;
        const isActive = currentStep === item.step;
        return (
          <div
            key={item.step}
            className={`flex flex-col items-center p-4 rounded-xl border text-center transition-all ${
              isActive
                ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/5'
                : isCompleted
                ? 'bg-slate-900/40 border-slate-800 text-indigo-400'
                : 'bg-slate-950/20 border-slate-900 text-slate-500'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 font-bold text-xs ${
              isActive
                ? 'bg-indigo-600 text-white'
                : isCompleted
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {isCompleted ? <CheckCircle className="w-4 h-4" /> : item.step}
            </div>
            <span className="text-[11px] font-bold tracking-wide uppercase">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function BorrowerPage() {
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading]         = useState<boolean>(true);

  // Domain state
  const [profile, setProfile]         = useState<any>(null);
  const [loan, setLoan]               = useState<any>(null);
  const [payments, setPayments]       = useState<any[]>([]);
  const [loanHistory, setLoanHistory] = useState<any[]>([]);

  // Step 1 – form state
  const [profileForm, setProfileForm] = useState<ProfileData>({
    fullName: '',
    pan: '',
    dob: '',
    monthlySalary: '',
    employmentMode: 'Salaried',
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Step 2 – upload state
  const [file, setFile]                   = useState<File | null>(null);
  const [uploading, setUploading]         = useState<boolean>(false);
  const [salarySlipPath, setSalarySlipPath] = useState<string>('');

  // Step 3 – sliders state
  const [principal, setPrincipal] = useState<number>(100000);
  const [tenure, setTenure]       = useState<number>(180);
  const [calcData, setCalcData]   = useState({ interest: 0, totalRepayment: 0 });
  const [loanSubmitting, setLoanSubmitting] = useState(false);

  // Global UI messages
  const [error, setError]         = useState<string | null>(null);
  const [breErrors, setBreErrors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Data fetch ──────────────────────────────────────────────────────────
  const fetchState = async () => {
    setLoading(true);
    setError(null);
    try {
      // Profile
      try {
        const profileRes = await api.get('/borrower/profile');
        if (profileRes.success && profileRes.profile) {
          setProfile(profileRes.profile);
          setProfileForm({
            fullName: profileRes.profile.fullName,
            pan: profileRes.profile.pan,
            dob: new Date(profileRes.profile.dob).toISOString().split('T')[0],
            monthlySalary: profileRes.profile.monthlySalary.toString(),
            employmentMode: profileRes.profile.employmentMode,
          });
        }
      } catch (err: any) {
        if (err.status !== 404) throw err;
      }

      // Loans
      const loansRes = await api.get('/borrower/loans');
      if (loansRes.success && loansRes.loans?.length > 0) {
        const activeLoan = loansRes.loans[0];
        setLoan(activeLoan);
        if (activeLoan) {
          try {
            const historyRes = await api.get(`/loans/${activeLoan._id}/history`);
            if (historyRes.success) {
              setPayments(historyRes.payments || []);
              setLoanHistory(historyRes.history || []);
            }
          } catch (_) {}
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sync borrower portal data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchState(); }, []);

  // Advance to correct step after load
  useEffect(() => {
    if (loading) return;
    if (loan) {
      setCurrentStep(4);
    } else if (profile?.brePassed) {
      setCurrentStep(salarySlipPath ? 3 : 2);
    } else {
      setCurrentStep(1);
    }
  }, [profile, loan, loading, salarySlipPath]);

  // Live calculation debounce (Step 3)
  useEffect(() => {
    if (currentStep !== 3) return;
    const id = setTimeout(async () => {
      try {
        const res = await api.get(`/loans/calculate?principal=${principal}&tenure=${tenure}`);
        if (res.success && res.data) {
          setCalcData({ interest: res.data.interest, totalRepayment: res.data.totalRepayment });
        }
      } catch {
        const si = Math.round((principal * 12 * tenure) / 36500 * 100) / 100;
        setCalcData({ interest: si, totalRepayment: Math.round((principal + si) * 100) / 100 });
      }
    }, 150);
    return () => clearTimeout(id);
  }, [principal, tenure, currentStep]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submitProfileForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBreErrors([]);
    setSuccessMsg(null);
    setProfileSubmitting(true);
    try {
      const res = await api.post('/borrower/profile', {
        fullName: profileForm.fullName,
        pan: profileForm.pan.trim().toUpperCase(),
        dob: profileForm.dob,
        monthlySalary: parseFloat(profileForm.monthlySalary),
        employmentMode: profileForm.employmentMode,
      });
      if (res.success) {
        setProfile(res.profile);
        setSuccessMsg('Personal details and BRE eligibility criteria checked successfully!');
        setTimeout(() => { setSuccessMsg(null); setCurrentStep(2); }, 1500);
      }
    } catch (err: any) {
      if (err.errors) setBreErrors(err.errors);
      else setError(err.message || 'Profile registration failed.');
      if (err.profile) setProfile(err.profile);
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        setError('Maximum file size allowed is 5 MB. Selected file is too large.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const uploadSalarySlip = async () => {
    if (!file) { setError('Please select a file to upload first.'); return; }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.upload('/borrower/upload-salary-slip', formData);
      if (res.success && res.document) {
        setSalarySlipPath(res.document.path);
        setSuccessMsg('Salary slip uploaded successfully!');
        setTimeout(() => { setSuccessMsg(null); setCurrentStep(3); }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleApplyLoan = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoanSubmitting(true);
    try {
      const res = await api.post('/borrower/apply-loan', { principal, tenure, salarySlipPath });
      if (res.success && res.loan) {
        setLoan(res.loan);
        setSuccessMsg('Congratulations! Your loan application has been successfully submitted.');
        await fetchState();
        setTimeout(() => { setSuccessMsg(null); setCurrentStep(4); }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Loan submission failed.');
    } finally {
      setLoanSubmitting(false);
    }
  };

  const handleReapply = () => {
    setLoan(null);
    setSalarySlipPath('');
    setFile(null);
    setCurrentStep(3);
  };

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (loading && currentStep === 1) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Synchronizing Portal Session...</p>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">
            {loan ? 'Your Active Credit Line' : 'Loan Application Process'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {loan
              ? 'Monitor your application review progression, payment schedule, and outstanding dues.'
              : 'Complete the steps below to secure your instant pre-approved loan approval.'}
          </p>
        </div>
        {!loan && (
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping inline-block" />
            <span>BRE Live Verification</span>
          </div>
        )}
      </div>

      {/* Step indicator (hidden once loan exists) */}
      {!loan && <StepIndicator currentStep={currentStep} />}

      {/* Global banners */}
      {error && (
        <div className="flex items-start space-x-3 p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl max-w-3xl mx-auto">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-rose-200">Action Required</h4>
            <p className="text-rose-300 text-xs mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start space-x-3 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl max-w-3xl mx-auto">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-emerald-200">Success</h4>
            <p className="text-emerald-300 text-xs mt-1 leading-relaxed">{successMsg}</p>
          </div>
        </div>
      )}

      {/* ── Step 1: Personal Details ── */}
      {currentStep === 1 && (
        <PersonalDetailsForm
          profileForm={profileForm}
          onChange={handleProfileChange}
          onSubmit={submitProfileForm}
          breErrors={breErrors}
          submitting={profileSubmitting}
        />
      )}

      {/* ── Step 2: Salary Slip Upload ── */}
      {currentStep === 2 && (
        <SalarySlipUpload
          file={file}
          uploading={uploading}
          onFileChange={handleFileChange}
          onUpload={uploadSalarySlip}
          onBack={() => setCurrentStep(1)}
          showBackButton={!!profile}
        />
      )}

      {/* ── Step 3: Loan Configuration ── */}
      {currentStep === 3 && (
        <LoanConfiguration
          principal={principal}
          tenure={tenure}
          onPrincipalChange={setPrincipal}
          onTenureChange={setTenure}
          calcData={calcData}
          onApply={handleApplyLoan}
          onBack={() => setCurrentStep(2)}
          submitting={loanSubmitting}
        />
      )}

      {/* ── Step 4: Active Credit Line ── */}
      {currentStep === 4 && loan && (
        <ActiveCreditLine
          loan={loan}
          payments={payments}
          loanHistory={loanHistory}
          onReapply={handleReapply}
        />
      )}
    </div>
  );
}
