"use client";

import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { 
  Coins, 
  User, 
  Wallet, 
  Calendar, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../../utils/format';

export default function DisbursementPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Confirmation state
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/ops/disbursement');
      if (res.success && res.data) {
        setLoans(res.data);
        console.log(res.data)
      }
    } catch (err: any) {
      console.error('Error fetching disbursement list:', err);
      setError(err.message || 'Failed to retrieve sanctioned loans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleDisburse = async (loanId: string) => {
    setError(null);
    setSubmittingAction(true);
    try {
      const res = await api.post(`/ops/disbursement/${loanId}/disburse`);
      if (res.success) {
        setConfirmingId(null);
        await fetchLoans();
      }
    } catch (err: any) {
      setError(err.message || 'Disbursement payout execution failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Synchronizing Sanctioned Payouts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2.5">
            <Coins className="w-6 h-6 text-emerald-500" />
            <span>Disbursement Module: Payouts Desk</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Track sanctioned loans that are approved and ready to release funds. Confirm payment releases.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sanctioned Queue: {loans.length}</span>
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
          <Coins className="w-10 h-10 text-slate-700" />
          <h4 className="text-sm font-bold text-slate-300">Queue is Clear</h4>
          <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
            All sanctioned applications have been funded. There are no pending payouts awaiting release execution.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loans.map((item) => {
            const loan = item.loan;
            const profile = item.profile;
            const isConfirming = confirmingId === loan._id;

            return (
              <div 
                key={loan._id}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-750/80 transition-all space-y-6"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm tracking-wide">
                        {profile ? profile.fullName : 'Borrower User'}
                      </h4>
                      <span className="text-[10px] text-slate-500 block">ID: {loan.borrowerId._id}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider">
                      Approved
                    </span>
                  </div>

                  {/* Account detail grid */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-850 pt-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <span className="text-slate-500 block text-[10px] uppercase">clearance Principal</span>
                      <span className="text-sm font-black text-emerald-400">{formatCurrency(loan.principal)}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 block text-[10px] uppercase">repay tenure</span>
                      <span className="text-sm text-slate-200">{loan.tenure} Days</span>
                    </div>
                    <div className="space-y-1 col-span-2 bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl text-[11px] font-semibold text-slate-400">
                      Total repayments to collect: <span className="text-slate-200 font-bold">{formatCurrency(loan.totalRepayment)}</span> (inc. 12% SI yield)
                    </div>
                  </div>

                  {/* Date details */}
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider pt-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span>Sanction Approved Date: {formatDate(loan.updatedAt)}</span>
                  </div>
                </div>

                {/* Disbursement Confirmation Area */}
                <div className="pt-4 border-t border-slate-850">
                  {!isConfirming ? (
                    <button
                      onClick={() => setConfirmingId(loan._id)}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/10 active:scale-98 transition-all cursor-pointer"
                    >
                      <Coins className="w-4 h-4" />
                      <span>Execute Disbursement payout</span>
                    </button>
                  ) : (
                    // Warn Executive Confirm modal inside block
                    <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-3">
                      <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                        <HelpCircle className="w-4 h-4 animate-bounce" />
                        <span>Confirm Funds Release</span>
                      </div>
                      <p className="text-slate-400 text-[10px] leading-relaxed">
                        Are you sure you want to release <span className="font-bold text-slate-200">{formatCurrency(loan.principal)}</span> to the borrower bank account? This cannot be undone.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          onClick={() => setConfirmingId(null)}
                          className="py-2 px-3 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDisburse(loan._id)}
                          disabled={submittingAction}
                          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg transition-all active:scale-98 cursor-pointer disabled:opacity-40"
                        >
                          {submittingAction ? 'Processing...' : 'Yes, Confirm'}
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
