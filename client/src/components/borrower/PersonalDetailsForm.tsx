"use client";

import React from 'react';
import { UserCheck, ChevronRight, AlertTriangle } from 'lucide-react';

export interface ProfileData {
  fullName: string;
  pan: string;
  dob: string;
  monthlySalary: string;
  employmentMode: 'Salaried' | 'Self-Employed' | 'Unemployed';
}

interface PersonalDetailsFormProps {
  profileForm: ProfileData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  breErrors: string[];
  submitting?: boolean;
}

export const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  profileForm,
  onChange,
  onSubmit,
  breErrors,
  submitting = false,
}) => {
  return (
    <div className="max-w-xl mx-auto bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
          <UserCheck className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">Personal Details</h3>
          <p className="text-slate-400 text-xs mt-0.5">Please provide your details to check BRE eligibility.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Full Name (As printed on PAN)
          </label>
          <input
            type="text"
            name="fullName"
            required
            value={profileForm.fullName}
            onChange={onChange}
            placeholder="John Doe"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              PAN Card Number
            </label>
            <input
              type="text"
              name="pan"
              required
              maxLength={10}
              value={profileForm.pan}
              onChange={onChange}
              placeholder="ABCDE1234F"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              required
              value={profileForm.dob}
              onChange={onChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Monthly Net Salary (₹)
            </label>
            <input
              type="number"
              name="monthlySalary"
              required
              min={0}
              value={profileForm.monthlySalary}
              onChange={onChange}
              placeholder="30000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Employment Mode
            </label>
            <select
              name="employmentMode"
              value={profileForm.employmentMode}
              onChange={onChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="Salaried">Salaried Employee</option>
              <option value="Self-Employed">Self-Employed Professional</option>
              <option value="Unemployed">Unemployed / Free Agent</option>
            </select>
          </div>
        </div>

        {breErrors.length > 0 && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>BRE Validation Failures</span>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              {breErrors.map((err, idx) => (
                <li key={idx} className="text-slate-300 text-xs leading-normal">
                  {err}
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-slate-500 pt-1 leading-normal">
              Our credit criteria require age 23-50, Net Income &ge; 25,000, valid PAN format, and Salaried/Self-Employed statuses. Adjust input or call our Sales Leads center.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/15 transition-all cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Validate & Check Eligibility</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
export default PersonalDetailsForm;
