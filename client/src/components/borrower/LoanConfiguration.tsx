"use client";

import React from 'react';
import { Wallet, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface LoanConfigurationProps {
  principal: number;
  tenure: number;
  onPrincipalChange: (val: number) => void;
  onTenureChange: (val: number) => void;
  calcData: {
    interest: number;
    totalRepayment: number;
  };
  onApply: () => void;
  onBack: () => void;
  submitting?: boolean;
}

export const LoanConfiguration: React.FC<LoanConfigurationProps> = ({
  principal,
  tenure,
  onPrincipalChange,
  onTenureChange,
  calcData,
  onApply,
  onBack,
  submitting = false,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 max-w-5xl mx-auto gap-8">
      {/* Slider Inputs Column */}
      <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8">
        <div className="flex items-center space-x-3 border-b border-slate-800/60 pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Configure Loan Parameters</h3>
            <p className="text-slate-400 text-xs mt-0.5">Toggle sliders live to adjust your credit line repayments.</p>
          </div>
        </div>

        {/* Principal Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Loan Principal (₹)</span>
            <span className="text-xl font-extrabold text-indigo-400 tracking-tight">{formatCurrency(principal)}</span>
          </div>
          <input
            type="range"
            min={50000}
            max={500000}
            step={5000}
            value={principal}
            onChange={(e) => onPrincipalChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase tracking-wider">
            <span>Min: ₹50,000</span>
            <span>Max: ₹5,00,000</span>
          </div>
        </div>

        {/* Tenure Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tenure Duration (Days)</span>
            <span className="text-xl font-extrabold text-indigo-400 tracking-tight">{tenure} Days</span>
          </div>
          <input
            type="range"
            min={30}
            max={365}
            step={5}
            value={tenure}
            onChange={(e) => onTenureChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase tracking-wider">
            <span>Min: 30 days</span>
            <span>Max: 365 days</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-4 border-t border-slate-850">
          <button
            onClick={onBack}
            disabled={submitting}
            className="flex-1 py-3.5 px-4 border border-slate-800 hover:bg-slate-900 text-slate-400 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            Upload Slip Again
          </button>
          <button
            onClick={onApply}
            disabled={submitting}
            className="flex-[2] py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/15 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Submit Final Application</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Repay Preview Column */}
      <div className="bg-gradient-to-b from-indigo-950/20 to-slate-950/40 border border-slate-800/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl space-y-6">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Live Repayment Preview</h4>
          
          <div className="space-y-4">
            <div className="flex justify-between text-xs py-2 border-b border-slate-900">
              <span className="text-slate-400 font-semibold">Principal (P)</span>
              <span className="text-slate-200 font-bold">{formatCurrency(principal)}</span>
            </div>
            <div className="flex justify-between text-xs py-2 border-b border-slate-900">
              <span className="text-slate-400 font-semibold">Annual Interest Rate (R)</span>
              <span className="text-emerald-400 font-bold">12.00% fixed</span>
            </div>
            <div className="flex justify-between text-xs py-2 border-b border-slate-900">
              <span className="text-slate-400 font-semibold">Tenure Period (T)</span>
              <span className="text-slate-200 font-bold">{tenure} Days</span>
            </div>
            <div className="flex justify-between text-xs py-2 border-b border-slate-900">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                Interest Charged (SI)
              </span>
              <span className="text-indigo-400 font-bold">+{formatCurrency(calcData.interest)}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/60 p-4 rounded-xl text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            Total Repayable Sum
          </p>
          <p className="text-2xl font-extrabold text-slate-100 tracking-tight">
            {formatCurrency(calcData.totalRepayment)}
          </p>
          <span className="text-[9px] text-slate-600 block mt-1">
            SI = (P × R × T) / 36,500
          </span>
        </div>
      </div>
    </div>
  );
};
export default LoanConfiguration;
