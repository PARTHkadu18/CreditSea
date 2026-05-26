"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/auth-context';
import { 
  Users, 
  FileCheck, 
  Coins, 
  HandCoins, 
  LayoutDashboard, 
  LogOut, 
  ShieldAlert, 
  User as UserIcon 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  // Sidebar link details
  const links = [
    {
      name: 'Sales Leads',
      path: '/dashboard/sales',
      role: 'Sales',
      icon: Users,
      color: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    },
    {
      name: 'Sanction Appraisals',
      path: '/dashboard/sanction',
      role: 'Sanction',
      icon: FileCheck,
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    },
    {
      name: 'Disbursements',
      path: '/dashboard/disbursement',
      role: 'Disbursement',
      icon: Coins,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    },
    {
      name: 'Collections Tracking',
      path: '/dashboard/collection',
      role: 'Collection',
      icon: HandCoins,
      color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
    },
  ];

  // Filter links based on role: Admin sees all, Executives see only their assigned modules
  const filteredLinks = user.role === 'Admin' 
    ? links 
    : links.filter(link => link.role === user.role);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <span className="text-white font-bold text-lg">CS</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-md tracking-wide leading-tight">CreditSea</h1>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">LMS Platform</span>
          </div>
        </Link>
      </div>

      {/* Navigation Modules list */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {user.role === 'Admin' && (
          <Link
            href="/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              pathname === '/dashboard'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Admin Overview</span>
          </Link>
        )}

        <div className="pt-2">
          <p className="px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Dashboard Modules
          </p>
          <div className="space-y-1">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:bg-slate-850 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Details & Logout footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-900/60 border border-slate-800 mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            {user.role === 'Admin' ? (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            ) : (
              <UserIcon className="w-4 h-4 text-indigo-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-slate-200 truncate">{user.name}</h4>
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 inline-block uppercase tracking-wider mt-0.5">
              {user.role}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out Account</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
