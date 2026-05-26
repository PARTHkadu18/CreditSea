"use client";

import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Users, Mail, Calendar, AlertCircle, Sparkles, Phone, Briefcase } from 'lucide-react';
import { formatDate, formatCurrency } from '../../../utils/format';

export default function SalesPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/ops/sales');
      if (res.success && res.data) {
        setLeads(res.data);
      }
    } catch (err: any) {
      console.error('Error fetching leads:', err);
      setError(err.message || 'Failed to retrieve sales module data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Loading Sales Leads Pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2.5">
            <Users className="w-6 h-6 text-blue-500" />
            <span>Sales Module: Leads pipeline</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Track and outreach registered platform users who have not yet submitted a loan application.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Active Leads: {leads.length}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs max-w-3xl mx-auto">
          {error}
        </div>
      )}

      {/* Grid of leads */}
      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-3 bg-slate-900/10 border border-slate-900 rounded-2xl max-w-2xl mx-auto">
          <AlertCircle className="w-10 h-10 text-slate-700" />
          <h4 className="text-sm font-bold text-slate-300">Clean Leads Board</h4>
          <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
            All registered borrowers have active or completed loan applications. No sales outreach is currently pending.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map((lead, idx) => {
            const u = lead.user;
            const p = lead.profile;
            return (
              <div 
                key={idx}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all space-y-6"
              >
                <div className="space-y-4">
                  {/* Lead Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm tracking-wide">{u.name}</h4>
                      <span className="text-[10px] text-slate-500 block">ID: {u._id}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      lead.status === 'ProfileSubmitted'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}>
                      {lead.status === 'ProfileSubmitted' ? 'Details Filled' : 'Draft Sign-up'}
                    </span>
                  </div>

                  {/* Core parameters list */}
                  <div className="space-y-2 border-t border-slate-850 pt-4 text-xs font-semibold">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="truncate">{u.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Joined {formatDate(u.createdAt)}</span>
                    </div>
                  </div>

                  {/* Profile data snippet if they filled profile details */}
                  {p && (
                    <div className="mt-4 p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1">
                        BRE Profile Attributes
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-slate-500 block">Salary:</span>
                          <span className="font-bold text-slate-300">{formatCurrency(p.monthlySalary)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">PAN Card:</span>
                          <span className="font-bold text-slate-300 font-mono">{p.pan}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">DOB:</span>
                          <span className="font-bold text-slate-300">{formatDate(p.dob)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Employment:</span>
                          <span className="font-bold text-slate-300">{p.employmentMode}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-850">
                  <a
                    href={`mailto:${u.email}`}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-slate-800 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 rounded-xl text-xs font-bold transition-all"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Initiate Mail Outreach</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
