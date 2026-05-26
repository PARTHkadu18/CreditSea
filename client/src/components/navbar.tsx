"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/auth-context';
import { LogOut, User as UserIcon, Calendar, Activity } from 'lucide-react';

interface NavbarProps {
  isBorrower?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isBorrower = false }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between shrink-0">
      {isBorrower ? (
        // Borrower Portal Mode Layout
        <div className="w-full flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/borrower" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CS</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-sm tracking-wide leading-tight">CreditSea</h1>
              <span className="text-[9px] text-indigo-400 font-semibold uppercase tracking-widest block -mt-0.5">
                Borrower Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{todayStr}</span>
            </div>

            <div className="flex items-center space-x-3 pl-6 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <UserIcon className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="hidden sm:block text-left">
                <h4 className="text-xs font-bold text-slate-200">{user.name}</h4>
                <p className="text-[9px] text-slate-500 -mt-0.5">Borrower Session</p>
              </div>
              
              <button
                onClick={logout}
                className="ml-2 p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                title="Log out Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Operations Dashboard Mode Layout
        <>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
            <h2 className="text-sm font-semibold text-slate-300">
              Operations Control Centre
            </h2>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 block ml-2"></span>
            <span className="text-[10px] text-emerald-400 font-medium tracking-wide">Live</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/30 px-3 py-1.5 rounded-lg border border-slate-800/80">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium">{todayStr}</span>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400">Security Clearance:</span>{' '}
              <span className="font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {user.role}
              </span>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
export default Navbar;
