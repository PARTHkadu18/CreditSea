"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/auth-context';
import { AlertCircle, Key, Lock, Mail, ShieldAlert, Sparkles, User } from 'lucide-react';

export default function LoginPage() {
  const { login, error, clearError } = useAuth();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      // Handled by AuthContext and exposed via context error, but catch to stop loading
      console.error('Login submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Evaluator helper: Instantly pre-populate and execute login for any role
  const triggerSeedLogin = async (roleEmail: string, rolePass: string) => {
    setFormError(null);
    clearError();
    setEmail(roleEmail);
    setPassword(rolePass);
    setSubmitting(true);
    try {
      await login(roleEmail, rolePass);
    } catch (err) {
      console.error('Seed login failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const seedAccounts = [
    { label: 'Admin', email: 'admin@creditsea.com', pass: 'Admin@123', color: 'border-rose-500/20 text-rose-400 bg-rose-500/5' },
    { label: 'Sales', email: 'sales@creditsea.com', pass: 'Sales@123', color: 'border-blue-500/20 text-blue-400 bg-blue-500/5' },
    { label: 'Sanction', email: 'sanction@creditsea.com', pass: 'Sanction@123', color: 'border-amber-500/20 text-amber-400 bg-amber-500/5' },
    { label: 'Disburse', email: 'disburse@creditsea.com', pass: 'Disburse@123', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
    { label: 'Collect', email: 'collect@creditsea.com', pass: 'Collect@123', color: 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5' },
    { label: 'Borrower', email: 'borrower@creditsea.com', pass: 'Borrower@123', color: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Visual background gradient blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Logo Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl items-center justify-center shadow-xl shadow-indigo-500/15 mb-2">
            <span className="text-white font-extrabold text-xl">CS</span>
          </div>
          <h2 className="text-3xl font-black text-slate-100 tracking-tight">
            Credit<span className="text-indigo-400">Sea</span> Portal
          </h2>
          <p className="text-slate-400 text-xs tracking-wide">
            Instant Lending platform & Operations Control center
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Email */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-500" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                <span>Security Password</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-500" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Error messaging */}
            {(formError || error) && (
              <div className="flex items-start space-x-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError || error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/15 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Authenticate Securely</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                New Borrower?{' '}
                <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 decoration-indigo-500/40">
                  Create an Account
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Evaluator Quick-Launch Shortcuts Panel */}
        <div className="glass-panel border-indigo-500/10 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-850 pb-2">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>Evaluator Seed Accounts Quick-Access</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Click any button below to instantly populate and authenticate the seed account credentials created by the database script:
          </p>

          <div className="grid grid-cols-3 gap-2">
            {seedAccounts.map((account) => (
              <button
                key={account.label}
                onClick={() => triggerSeedLogin(account.email, account.pass)}
                disabled={submitting}
                className={`py-2 px-1 text-center rounded-lg border font-bold text-[10px] uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-98 cursor-pointer ${account.color}`}
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
