"use client";

import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { 
  HandCoins, 
  User, 
  Wallet, 
  Calendar, 
  AlertCircle,
  Plus,
  History,
  TrendingDown,
  FileText,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../../utils/format';

export default function CollectionPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection & Form states
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  
  // Form input states
  const [utr, setUtr] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  const [submittingPayment, setSubmittingPayment] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchActiveLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/ops/collection');
      if (res.success && res.data) {
        setLoans(res.data);
      }
    } catch (err: any) {
      console.error('Error fetching collection list:', err);
      setError(err.message || 'Failed to retrieve active disbursed collections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  // Fetch detailed history and payment trail for the selected loan
  const loadLoanDetails = async (loanId: string) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.get(`/loans/${loanId}/history`);
      if (res.success) {
        setSelectedLoan(res.loan);
        setPayments(res.payments || []);
        setHistory(res.history || []);
      }
    } catch (err: any) {
      console.error('Error fetching loan details:', err);
      setError(err.message || 'Failed to load details for the selected loan.');
    }
  };

  useEffect(() => {
    if (selectedLoanId) {
      loadLoanDetails(selectedLoanId);
    } else {
      setSelectedLoan(null);
      setPayments([]);
      setHistory([]);
    }
  }, [selectedLoanId]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    setError(null);
    setSuccessMsg(null);
    
    const payAmt = parseFloat(amount);
    if (isNaN(payAmt) || payAmt <= 0) {
      setError('Payment amount must be a positive number greater than 0.');
      return;
    }

    if (payAmt > selectedLoan.outstandingBalance) {
      setError(`Payment amount cannot exceed the outstanding balance of ${formatCurrency(selectedLoan.outstandingBalance)}.`);
      return;
    }

    if (!utr || utr.trim() === '') {
      setError('A valid globally unique UTR reference number is required.');
      return;
    }

    setSubmittingPayment(true);
    try {
      const res = await api.post(`/ops/collection/${selectedLoan._id}/payment`, {
        utr: utr.trim(),
        amount: payAmt,
        date: paymentDate,
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Repayment recorded successfully.');
        setUtr('');
        setAmount('');
        
        // Refresh leads listing in left panel
        await fetchActiveLoans();
        
        // Reload details for this selected loan to update outstanding balances & timelines
        // If loan was auto-closed, it will disappear from active collection, but our selection will render its Closed details!
        await loadLoanDetails(selectedLoan._id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment record.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading && loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Compiling Active Collections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2.5">
            <HandCoins className="w-6 h-6 text-cyan-400" />
            <span>Collection Module: Repayments Desk</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Log borrower bank repayments, audit outstanding balances, and auto-close completed credit lines.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Active Collections: {loans.length}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-xl text-xs max-w-7xl mx-auto flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 rounded-xl text-xs max-w-7xl mx-auto flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {loans.length === 0 && !selectedLoanId ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-3 bg-slate-900/10 border border-slate-900 rounded-2xl max-w-2xl mx-auto">
          <HandCoins className="w-10 h-10 text-slate-700" />
          <h4 className="text-sm font-bold text-slate-300">Clean Ledger Book</h4>
          <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
            There are no disbursed active loans currently in collection status. All active credits have been cleared.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left panel: Disbursed Active loans list */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Active Dues Accounts</h3>
            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
              {loans.map((item) => {
                const loan = item.loan;
                const profile = item.profile;
                const isSelected = selectedLoanId === loan._id;

                return (
                  <button
                    key={loan._id}
                    onClick={() => {
                      setSelectedLoanId(isSelected ? null : loan._id);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/5'
                        : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/60'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-200 text-xs truncate">
                          {profile ? profile.fullName : 'Borrower User'}
                        </h4>
                        <span className="text-[9px] text-slate-500 block truncate">ID: {loan._id}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[8px] font-bold uppercase">
                        Disbursed
                      </span>
                    </div>

                    <div className="flex justify-between items-center w-full text-[10px] font-semibold">
                      <div>
                        <span className="text-slate-500 block uppercase text-[8px]">Outstanding</span>
                        <span className="text-slate-100 font-extrabold">{formatCurrency(loan.outstandingBalance)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block uppercase text-[8px]">Repayment due</span>
                        <span className="text-slate-300">{formatCurrency(loan.totalRepayment)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right/Mid panel: selected loan workbench */}
          <div className="lg:col-span-2">
            {selectedLoan ? (
              <div className="space-y-8">
                {/* 1. Workbench Overview Banner */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <User className="w-4 h-4 text-indigo-400" />
                      <span>Collection Account: {selectedLoan.borrowerId?.name || 'Borrower'}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-400 space-y-1">
                      <p>Email: <span className="text-slate-200 font-bold">{selectedLoan.borrowerId?.email || 'N/A'}</span></p>
                      <p>Clearance Principal: <span className="text-slate-200">{formatCurrency(selectedLoan.principal)}</span></p>
                      <p>Tenure Period: <span className="text-slate-200">{selectedLoan.tenure} Days</span></p>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl text-center flex flex-col justify-center min-w-56">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      Remaining Dues Balance
                    </p>
                    <p className={`text-xl font-extrabold tracking-tight mt-1 ${
                      selectedLoan.outstandingBalance > 0 ? 'text-indigo-400 animate-pulse' : 'text-slate-400'
                    }`}>
                      {formatCurrency(selectedLoan.outstandingBalance)}
                    </p>
                    <span className="text-[9px] text-slate-500 block mt-1 uppercase font-bold tracking-wider">
                      Status: {selectedLoan.status === 'Closed' ? 'Closed (Repaid)' : selectedLoan.status}
                    </span>
                  </div>
                </div>

                {/* 2. Repayment Form (Hidden if already fully paid) */}
                {selectedLoan.status !== 'Closed' ? (
                  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                    <div className="flex items-center space-x-2 border-b border-slate-850 pb-4">
                      <Plus className="w-5 h-5 text-indigo-400" />
                      <h3 className="text-sm font-bold text-slate-200">Log Repayment Payment</h3>
                    </div>

                    <form onSubmit={handleRecordPayment} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Unique UTR Reference
                        </label>
                        <input
                          type="text"
                          required
                          value={utr}
                          onChange={(e) => setUtr(e.target.value)}
                          placeholder="UTR987654321"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all uppercase font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Amount (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Amount in Rupees"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingPayment}
                        className="py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/10 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {submittingPayment ? (
                          <>
                            <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Recording...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4.5 h-4.5" />
                            <span>Log Payment Receipt</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-4 shadow-xl">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-200">Repayment Complete</h4>
                      <p className="text-emerald-300 text-xs mt-1 leading-relaxed">
                        This credit line has been fully repaid, outstanding balance is zero, and the loan account has been auto-closed.
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Dynamic Audit and Payments ledgers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Payments Ledger */}
                  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center space-x-2 border-b border-slate-850 pb-3">
                      <History className="w-4.5 h-4.5 text-indigo-400" />
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Payments History</h4>
                    </div>

                    {payments.length === 0 ? (
                      <p className="text-slate-500 text-xs italic text-center py-6">No payment logs recorded.</p>
                    ) : (
                      <div className="space-y-3">
                        {payments.map((p) => (
                          <div key={p._id} className="text-xs bg-slate-950/40 border border-slate-900 p-3 rounded-lg flex justify-between items-center font-semibold">
                            <div>
                              <span className="font-mono text-indigo-400 block text-[10px]">{p.utr}</span>
                              <span className="text-[9px] text-slate-550 block pt-0.5">Recorded: {formatDate(p.createdAt)}</span>
                            </div>
                            <span className="text-slate-100 font-bold">{formatCurrency(p.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Audit logs timeline */}
                  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center space-x-2 border-b border-slate-850 pb-3">
                      <FileText className="w-4.5 h-4.5 text-indigo-400" />
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Audit Trails</h4>
                    </div>

                    {history.length === 0 ? (
                      <p className="text-slate-500 text-xs italic text-center py-6">No timeline events logged.</p>
                    ) : (
                      <div className="space-y-3 overflow-y-auto max-h-[300px]">
                        {history.map((h, idx) => (
                          <div key={idx} className="text-xs bg-slate-950/40 border border-slate-900 p-3 rounded-lg space-y-1">
                            <div className="flex justify-between text-[9px] font-bold uppercase">
                              <span className="text-indigo-400">{h.fromStatus} &rarr; {h.toStatus}</span>
                              <span className="text-slate-655">{formatDate(h.createdAt)}</span>
                            </div>
                            <p className="text-slate-400 leading-normal text-[11px]">{h.comments || 'Status update.'}</p>
                            <span className="text-[9px] text-slate-600 block pt-0.5">Recorded by: {h.updatedBy?.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-36 text-center space-y-3 bg-slate-900/10 border border-slate-900 rounded-2xl max-w-2xl mx-auto">
                <HandCoins className="w-10 h-10 text-slate-700" />
                <h4 className="text-sm font-bold text-slate-400">Repayments Workbench</h4>
                <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                  Select an active credit line account from the left panel to record payments, audit logs, and payments tracking ledger.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
