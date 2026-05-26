"use client";

import React from 'react';
import {
  Activity,
  History,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';

interface Payment {
  _id: string;
  utr: string;
  amount: number;
  date: string;
}

interface HistoryEntry {
  fromStatus: string;
  toStatus: string;
  createdAt: string;
  comments?: string;
  updatedBy?: { name: string; role: string };
}

interface Loan {
  _id: string;
  status: string;
  principal: number;
  tenure: number;
  interest: number;
  totalRepayment: number;
  outstandingBalance: number;
  rejectionReason?: string;
}

interface ActiveCreditLineProps {
  loan: Loan;
  payments: Payment[];
  loanHistory: HistoryEntry[];
  onReapply: () => void;
}

const STATUS_TIMELINE = [
  { state: 'Pending',    label: 'Loan Applied',      desc: 'Your application has been received and is under executive BRE audit.' },
  { state: 'Sanctioned', label: 'Sanction Approved', desc: 'Credit assessment completed. Loan terms finalized.' },
  { state: 'Disbursed',  label: 'Funds Disbursed',   desc: 'Capital released to registered bank. Payments period active.' },
  { state: 'Closed',     label: 'Line Closed',       desc: 'All outstanding payments cleared. Loan auto-closed.' },
];

const STATUS_ORDER = ['Pending', 'Sanctioned', 'Disbursed', 'Closed'];

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'Pending':    return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
    case 'Sanctioned': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'Disbursed':  return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse';
    case 'Closed':     return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    default:           return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  }
};

export const ActiveCreditLine: React.FC<ActiveCreditLineProps> = ({
  loan,
  payments,
  loanHistory,
  onReapply,
}) => {
  const currentIdx = STATUS_ORDER.indexOf(
    loan.status === 'Rejected' ? 'Pending' : loan.status
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 max-w-5xl mx-auto gap-8">
      {/* ── Left column ─────────────────────────────── */}
      <div className="lg:col-span-2 space-y-8">

        {/* Status timeline card */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-850 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
                <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Application Progression</h3>
                <p className="text-slate-400 text-xs mt-0.5">Real-time status history of your loan profile.</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider inline-block ${statusBadgeClass(loan.status)}`}>
              {loan.status === 'Sanctioned' ? 'Approved' : loan.status}
            </span>
          </div>

          {/* Graphical timeline */}
          <div className="relative pl-6 space-y-6 border-l border-slate-800">
            {STATUS_TIMELINE.map((item) => {
              const itemIdx = STATUS_ORDER.indexOf(item.state);
              const isPassed = currentIdx >= itemIdx;
              return (
                <div key={item.state} className="relative group">
                  <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                    isPassed
                      ? 'bg-indigo-500 ring-4 ring-indigo-500/15'
                      : 'bg-slate-900 border-2 border-slate-800'
                  }`}>
                    {isPassed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div className="pl-4">
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${isPassed ? 'text-slate-100' : 'text-slate-500'}`}>
                      {item.label}
                    </h4>
                    <p className={`text-[11px] mt-1 leading-normal ${isPassed ? 'text-slate-400' : 'text-slate-600'}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rejection alert */}
          {loan.status === 'Rejected' && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Application Denied</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Reason: <span className="font-semibold text-rose-200">{loan.rejectionReason || 'Underwriting terms not satisfied.'}</span>
              </p>
              <button
                onClick={onReapply}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Resubmit Application
              </button>
            </div>
          )}
        </div>

        {/* Payment ledger */}
        {loan.status !== 'Rejected' && (
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-850 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
                <History className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Payment Ledger</h3>
                <p className="text-slate-400 text-xs mt-0.5">Historical records of clear payments received.</p>
              </div>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No payment receipts logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-2">UTR Reference</th>
                      <th className="py-3 px-2">Amount Paid</th>
                      <th className="py-3 px-2">Date Received</th>
                      <th className="py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {payments.map((p) => (
                      <tr key={p._id} className="text-slate-300 font-medium">
                        <td className="py-3 px-2 font-mono text-[11px] text-indigo-400">{p.utr}</td>
                        <td className="py-3 px-2 font-semibold text-slate-100">{formatCurrency(p.amount)}</td>
                        <td className="py-3 px-2">{formatDate(p.date)}</td>
                        <td className="py-3 px-2">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase">
                            Success
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right column ─────────────────────────────── */}
      <div className="space-y-6">

        {/* Loan parameters card */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Loan Parameters</h4>

          <div className="space-y-4">
            {[
              { label: 'Principal (P)',       value: formatCurrency(loan.principal),      cls: 'text-slate-200' },
              { label: 'Tenure Period (T)',   value: `${loan.tenure} Days`,              cls: 'text-slate-200' },
              { label: 'Annual Rate',         value: '12.00% fixed',                    cls: 'text-emerald-400' },
              { label: 'Interest Charged',    value: formatCurrency(loan.interest),       cls: 'text-slate-200' },
              { label: 'Total Repayment Sum', value: formatCurrency(loan.totalRepayment), cls: 'text-slate-200' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="flex justify-between text-xs py-2 border-b border-slate-850">
                <span className="text-slate-400 font-semibold">{label}</span>
                <span className={`font-bold ${cls}`}>{value}</span>
              </div>
            ))}
          </div>

          {loan.status !== 'Rejected' && (
            <div className="bg-slate-950/60 border border-slate-850/80 p-4 rounded-xl text-center space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Remaining Balance Due
              </p>
              <p className={`text-2xl font-extrabold tracking-tight ${loan.outstandingBalance > 0 ? 'text-indigo-400' : 'text-slate-400'}`}>
                {formatCurrency(loan.outstandingBalance)}
              </p>
              {loan.outstandingBalance > 0 && (
                <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-500 pt-1 font-semibold uppercase">
                  <TrendingDown className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    Paid: {((1 - loan.outstandingBalance / loan.totalRepayment) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audit transition log */}
        {loanHistory.length > 0 && (
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Audit Transition Logs</h4>
            <div className="space-y-4">
              {loanHistory.map((h, idx) => (
                <div key={idx} className="text-xs bg-slate-950/40 border border-slate-900 p-3 rounded-lg space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-indigo-400">{h.fromStatus} &rarr; {h.toStatus}</span>
                    <span className="text-slate-500">{formatDate(h.createdAt)}</span>
                  </div>
                  <p className="text-slate-400 leading-normal">{h.comments || 'Transition complete.'}</p>
                  <span className="text-[9px] text-slate-600 block pt-0.5">
                    Updated by: {h.updatedBy?.name} ({h.updatedBy?.role})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ActiveCreditLine;
