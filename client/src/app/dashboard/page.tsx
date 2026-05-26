"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import { api } from '../../services/api';
import { 
  Users, 
  FileText, 
  Coins, 
  HandCoins, 
  DollarSign, 
  TrendingUp, 
  LineChart, 
  ShieldAlert 
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Direct redirection for executive roles to their corresponding modules
    if (user.role !== 'Admin') {
      const modulePaths: Record<string, string> = {
        Sales: '/dashboard/sales',
        Sanction: '/dashboard/sanction',
        Disbursement: '/dashboard/disbursement',
        Collection: '/dashboard/collection',
      };
      router.replace(modulePaths[user.role] || '/login');
      return;
    }

    // Admin role loads full cockpit overview metrics
    const fetchAdminOverview = async () => {
      try {
        const res = await api.get('/ops/admin/overview');
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      } catch (err: any) {
        console.error('Error fetching admin summary:', err);
        setError(err.message || 'Failed to retrieve aggregate system stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminOverview();
  }, [user, router]);

  if (user?.role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Forwarding to secure operational node...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Compiling platform-wide telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Admin header */}
      <div className="pb-6 border-b border-slate-800">
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
          <ShieldAlert className="w-6 h-6 text-rose-500" />
          <span>System Administrator Dashboard</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Review live lending pipe statistics, aggregate capital flows, and operational clearances.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Grid of stats cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Total Book Users',
                value: stats.userCounts.total,
                desc: `${stats.userCounts.borrowers} Registered Borrowers`,
                icon: Users,
                color: 'text-blue-400 bg-blue-500/5 border-blue-500/10',
              },
              {
                title: 'Pending Appraisals',
                value: stats.loanCounts.pending,
                desc: `${stats.loanCounts.sanctioned} Approved Applications`,
                icon: FileText,
                color: 'text-amber-400 bg-amber-500/5 border-amber-500/10',
              },
              {
                title: 'Capital Disbursed',
                value: formatCurrency(stats.financials.totalPrincipalDisbursed),
                desc: `${stats.loanCounts.disbursed} Active Loans`,
                icon: Coins,
                color: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10',
              },
              {
                title: 'Outstanding Dues',
                value: formatCurrency(stats.financials.outstandingBalanceRemaining),
                desc: `Recovered: ${formatCurrency(stats.financials.totalCollectedAmount)}`,
                icon: HandCoins,
                color: 'text-cyan-400 bg-cyan-500/5 border-cyan-500/10',
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border ${card.color} bg-slate-900/40 backdrop-blur-md hover:-translate-y-0.5 transition-all`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {card.title}
                    </span>
                    <Icon className="w-5 h-5 opacity-80" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-100 tracking-tight mt-4">
                    {card.value}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium tracking-wide">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Financial summary blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-850 pb-4">
                <LineChart className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-200">System Profitability Ledger</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Booking Yield (Interest)</span>
                  <p className="text-xl font-extrabold text-indigo-400 tracking-tight">
                    +{formatCurrency(stats.financials.totalInterestEarned)}
                  </p>
                  <span className="text-[9px] text-slate-600 block">Based on a fixed 12.00% p.a.</span>
                </div>
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Contractual Repayments</span>
                  <p className="text-xl font-extrabold text-slate-200 tracking-tight">
                    {formatCurrency(stats.financials.totalBookedRepayments)}
                  </p>
                  <span className="text-[9px] text-slate-600 block">Combined Principal + Interest</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
              <div className="flex items-center space-x-2 border-b border-slate-850 pb-4">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-200">Portfolio Performance</h3>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center py-4 space-y-4">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Recovery Pipeline Rate
                  </p>
                  <h4 className="text-3xl font-black text-slate-100 tracking-tight mt-1">
                    {stats.financials.totalBookedRepayments > 0 
                      ? ((stats.financials.totalCollectedAmount / stats.financials.totalBookedRepayments) * 100).toFixed(1)
                      : '0.0'
                    }%
                  </h4>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                  <div 
                    className="bg-indigo-500 h-full rounded-full" 
                    style={{ 
                      width: `${
                        stats.financials.totalBookedRepayments > 0 
                          ? (stats.financials.totalCollectedAmount / stats.financials.totalBookedRepayments) * 100
                          : 0
                      }%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
