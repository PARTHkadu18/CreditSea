"use client";

import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { 
  FileCheck, 
  User, 
  Wallet, 
  Download, 
  Check, 
  X, 
  AlertCircle,
  FileText,
  MessageSquare
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../../utils/format';

export default function SanctionPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection/action states
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/ops/sanction');
      if (res.success && res.data) {
        setLoans(res.data);
      }
    } catch (err: any) {
      console.error('Error fetching sanction list:', err);
      setError(err.message || 'Failed to retrieve pending loan appraisals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleDecision = async (loanId: string, action: 'approve' | 'reject') => {
    setError(null);
    
    // If rejecting, force input validation
    if (action === 'reject') {
      if (!rejectionReason || rejectionReason.trim() === '') {
        setError('A valid rejection reason must be supplied to reject an application.');
        return;
      }
    }

    setSubmittingAction(true);
    try {
      const payload: Record<string, any> = { action };
      if (action === 'reject') {
        payload.rejectionReason = rejectionReason.trim();
      }

      const res = await api.post(`/ops/sanction/${loanId}`, payload);
      if (res.success) {
        // Clear inputs & toggle states
        setDecidingId(null);
        setRejectionReason('');
        
        // Refresh leads list
        await fetchLoans();
      }
    } catch (err: any) {
      setError(err.message || 'Decision submission failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Compiling Pending Appraisals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2.5">
            <FileCheck className="w-6 h-6 text-amber-500" />
            <span>Sanction Module: Appraisals Desk</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Perform underwriting assessments on applied loans, inspect salary proofs, and sanction/reject profiles.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>Pending Appraisals: {loans.length}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-xl text-xs max-w-4xl mx-auto flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {loans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-3 bg-slate-900/10 border border-slate-900 rounded-2xl max-w-2xl mx-auto">
          <FileCheck className="w-10 h-10 text-slate-700" />
          <h4 className="text-sm font-bold text-slate-300">Queue is Clear</h4>
          <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
            All submitted applications have been reviewed. There are no pending loans awaiting credit decisions.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {loans.map((item) => {
            const loan = item.loan;
            const profile = item.profile;
            const isActingOnThis = decidingId === loan._id;
            
            // Construct full download path using the deployed backend base URL if relative path
            const backendBase = process.env.NEXT_PUBLIC_API_URL
              ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
              : 'https://credit-sea-backend-pi.vercel.app';
            const salarySlipUrl = loan.salarySlipPath?.startsWith('http')
              ? loan.salarySlipPath
              : `${backendBase}/${loan.salarySlipPath}`;

            return (
              <div 
                key={loan._id}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row justify-between gap-8 hover:border-slate-700/60 transition-all"
              >
                {/* Details Section */}
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Borrower Profile Details */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Borrower Personal Profile</span>
                      </div>
                      {profile ? (
                        <div className="space-y-1.5 text-xs font-semibold">
                          <p className="text-slate-200">Name: <span className="font-bold text-slate-100">{profile.fullName}</span></p>
                          <p className="text-slate-400">PAN Card: <span className="font-mono text-slate-200">{profile.pan}</span></p>
                          <p className="text-slate-400">DOB: <span className="text-slate-200">{formatDate(profile.dob)}</span></p>
                          <p className="text-slate-400">Net Salary: <span className="text-slate-100">{formatCurrency(profile.monthlySalary)}</span></p>
                          <p className="text-slate-400">Employment: <span className="text-slate-200">{profile.employmentMode}</span></p>
                        </div>
                      ) : (
                        <p className="text-slate-500 text-xs italic">Missing detailed profile logs.</p>
                      )}
                    </div>

                    {/* Applied Loan Config & Calculations */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-1.5">
                        <Wallet className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Applied Financial Parameters</span>
                      </div>
                      <div className="space-y-1.5 text-xs font-semibold">
                        <p className="text-slate-400">Principal Amount: <span className="font-bold text-indigo-400">{formatCurrency(loan.principal)}</span></p>
                        <p className="text-slate-400">Tenure Duration: <span className="text-slate-200">{loan.tenure} Days</span></p>
                        <p className="text-slate-400">Interest Charged: <span className="text-slate-200">+{formatCurrency(loan.interest)}</span></p>
                        <p className="text-slate-400">Total Due Sum: <span className="font-bold text-slate-100">{formatCurrency(loan.totalRepayment)}</span></p>
                        <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-950/60 rounded border border-slate-850 inline-block uppercase mt-1">
                          Fixed 12% Per Annum SI
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Document and dates footers */}
                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-850 text-xs">
                    <a
                      href={salarySlipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-3.5 py-2 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/15 hover:border-indigo-500/30 text-indigo-400 rounded-xl transition-all font-bold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Inspect Salary Slip proof</span>
                    </a>
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      Applied: {formatDate(loan.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="w-full lg:w-72 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-800 pt-6 lg:pt-0 lg:pl-8 space-y-4">
                  {!isActingOnThis ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => handleDecision(loan._id, 'approve')}
                        disabled={submittingAction}
                        className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/10 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>Sanction / Approve Loan</span>
                      </button>

                      <button
                        onClick={() => setDecidingId(loan._id)}
                        disabled={submittingAction}
                        className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-rose-500/25 hover:bg-rose-500/10 text-rose-400 rounded-xl text-xs font-bold transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        <span>Deny / Reject Loan</span>
                      </button>
                    </div>
                  ) : (
                    // Rejection input panel
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                          <span>Rejection Comments (Required)</span>
                        </label>
                        <textarea
                          rows={3}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Provide the exact underwriting rejection comment..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-rose-500 transition-all resize-none"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setDecidingId(null);
                            setRejectionReason('');
                          }}
                          className="py-2.5 px-3 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDecision(loan._id, 'reject')}
                          disabled={submittingAction || !rejectionReason.trim()}
                          className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all active:scale-98 cursor-pointer disabled:opacity-40"
                        >
                          Confirm Deny
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
